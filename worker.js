/**
 * TORN TACTICAL ADVISOR - Phase 1 Complete
 * Automatic battlefield intelligence system
 */

// TEMP API KEYS FOR TESTING (48 hour expiry)
const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const FF_SCOUTER_KEY = 'rwLgZTyqgWDxhoCx';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // SPY DATABASE
      if (url.pathname === '/spy' && request.method === 'GET') {
        return await listSpyData(env, corsHeaders);
      }
      
      if (url.pathname === '/spy' && request.method === 'POST') {
        return await saveSpyData(request, env, corsHeaders);
      }
      
      // MAIN UI
      if (url.pathname === '/' || url.pathname === '/advisor') {
        return new Response(getUI(), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8', ...corsHeaders }
        });
      }
      
      // API: Initialize full scan
      if (url.pathname === '/api/initialize' && request.method === 'POST') {
        return await initializeScan(request, env, corsHeaders);
      }
      
      // API: Fetch user stats
      if (url.pathname === '/api/fetch-user' && request.method === 'POST') {
        return await fetchUserStats(request, env, corsHeaders);
      }
      
      // API: Fetch faction roster
      if (url.pathname === '/api/fetch-faction' && request.method === 'POST') {
        return await fetchFactionRoster(request, env, corsHeaders);
      }
      
      // API: Analyze all targets
      if (url.pathname === '/api/analyze-all' && request.method === 'POST') {
        return await analyzeAllTargets(request, env, corsHeaders);
      }
      
      // HEALTH
      if (url.pathname === '/health') {
        return jsonResponse({ 
          status: 'healthy',
          version: '1.0.0',
          phase: 'Phase 1 - Tactical Dashboard'
        }, corsHeaders);
      }
      
      return jsonResponse({ error: 'Not Found' }, corsHeaders, 404);
      
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ 
        error: 'Server Error',
        message: error.message 
      }, corsHeaders, 500);
    }
  }
};

// ==========================================
// INITIALIZE SCAN
// ==========================================

async function initializeScan(request, env, corsHeaders) {
  const { userTornId, enemyFactionId, tornApiKey, ffScouterKey } = await request.json();
  
  if (!userTornId || !enemyFactionId) {
    return jsonResponse({ error: 'Missing userTornId or enemyFactionId' }, corsHeaders, 400);
  }
  
  // Store keys temporarily (in production, encrypt these)
  const sessionData = {
    userTornId,
    enemyFactionId,
    tornApiKey: tornApiKey || 'DEMO_KEY',
    ffScouterKey: ffScouterKey || 'DEMO_KEY',
    timestamp: Date.now()
  };
  
  return jsonResponse({
    success: true,
    session: sessionData,
    message: 'Session initialized. Ready to fetch data.'
  }, corsHeaders);
}

// ==========================================
// FETCH USER STATS
// ==========================================

async function fetchUserStats(request, env, corsHeaders) {
  const { userTornId } = await request.json();
  
  // Fetch from Torn API
  let tornStats = null;
  try {
    const tornUrl = `https://api.torn.com/user/${userTornId}?selections=profile,battlestats&key=${TORN_API_KEY}`;
    const tornResponse = await fetch(tornUrl);
    const tornData = await tornResponse.json();
    
    if (tornData.error) {
      console.error('Torn API error:', tornData.error);
    } else {
      tornStats = {
        name: tornData.name || 'OPERATOR',
        total: Number(tornData.total) || 0,
        strength: tornData.strength || 0,
        defense: tornData.defense || 0,
        speed: tornData.speed || 0,
        dexterity: tornData.dexterity || 0
      };
    }
  } catch (error) {
    console.error('Error fetching Torn stats:', error);
  }
  
  // Fetch from FF Scouter
  let ffStats = null;
  try {
    const ffUrl = `https://ffscouter.com/api/v1/get-stats?key=${FF_SCOUTER_KEY}&targets=${userTornId}&user_id=${userTornId}`;
    const ffResponse = await fetch(ffUrl);
    const ffData = await ffResponse.json();
    
    if (ffData && ffData.length > 0) {
      const userData = ffData[0];
      ffStats = {
        total: Number(userData.bs_estimate) || 0,
        fairFight: Number(userData.fair_fight) || 1.0
      };
    }
  } catch (error) {
    console.error('Error fetching FF Scouter stats:', error);
  }
  
  // Store user data in KV
  if (tornStats || ffStats) {
    const userData = {
      tornId: userTornId,
      tornStats: tornStats,
      ffStats: ffStats,
      lastUpdated: Date.now()
    };
    
    await env.ROTATOR.put(`user_${userTornId}`, JSON.stringify(userData));
  }
  
  return jsonResponse({
    success: true,
    tornStats,
    ffStats
  }, corsHeaders);
}

// ==========================================
// FETCH FACTION ROSTER
// ==========================================

async function fetchFactionRoster(request, env, corsHeaders) {
  const { enemyFactionId } = await request.json();
  
  try {
    const url = `https://api.torn.com/faction/${enemyFactionId}?selections=basic&key=${TORN_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      return jsonResponse({ 
        error: 'Torn API Error', 
        details: data.error 
      }, corsHeaders, 400);
    }
    
    // Extract member IDs and names
    const members = Object.keys(data.members || {}).map(id => ({
      id: id,
      name: data.members[id].name,
      level: data.members[id].level,
      status: data.members[id].status
    }));
    
    return jsonResponse({
      success: true,
      factionName: data.name,
      memberCount: members.length,
      members: members
    }, corsHeaders);
    
  } catch (error) {
    console.error('Error fetching faction:', error);
    return jsonResponse({ 
      error: 'Failed to fetch faction data',
      details: error.message
    }, corsHeaders, 500);
  }
}

// ==========================================
// ANALYZE ALL TARGETS
// ==========================================

async function analyzeAllTargets(request, env, corsHeaders) {
  const { 
    userTornId, 
    userStatSource, // 'torn' or 'ff'
    members // array of enemy member objects
  } = await request.json();
  
  // Get user data from KV
  const userDataJson = await env.ROTATOR.get(`user_${userTornId}`);
  if (!userDataJson) {
    return jsonResponse({ error: 'User data not found' }, corsHeaders, 404);
  }
  
  const userData = JSON.parse(userDataJson);
  const userTotal = userStatSource === 'torn' 
    ? userData.tornStats.total 
    : userData.ffStats.total;
  
  if (!userTotal) {
    return jsonResponse({ error: 'User stats not available for selected source' }, corsHeaders, 400);
  }
  
  const targets = [];
  const BATCH_SIZE = 100; // FF Scouter can handle up to 100
  
  // Process in batches
  for (let i = 0; i < members.length; i += BATCH_SIZE) {
    const batch = members.slice(i, i + BATCH_SIZE);
    const batchIds = batch.map(m => m.id).join(',');
    
    // Fetch FF Scouter data for batch
    let ffDataMap = {};
    try {
      const ffUrl = `https://ffscouter.com/api/v1/get-stats?key=${FF_SCOUTER_KEY}&targets=${batchIds}&user_id=${userTornId}`;
      const ffResponse = await fetch(ffUrl);
      const ffData = await ffResponse.json();
      
      // Map FF data by ID
      batch.forEach((member, idx) => {
        if (ffData && ffData[idx]) {
          ffDataMap[member.id] = ffData[idx];
        }
      });
    } catch (error) {
      console.error('Error fetching FF Scouter batch:', error);
    }
    
    // Analyze each target in batch
    for (const member of batch) {
      // 1. Check spy database
      const spyKey = `spy_${member.id}`;
      const spyData = await env.ROTATOR.get(spyKey, { type: 'json' });
      
      // 2. Get FF Scouter data
      const ffData = ffDataMap[member.id] || { fair_fight: 1.0, bs_estimate: 0 };
      
      // 3. Determine enemy stats (spy takes priority)
      let enemyTotal, dataSource;
      if (spyData && spyData.stats) {
        enemyTotal = spyData.stats.strength + spyData.stats.defense + 
                     spyData.stats.speed + spyData.stats.dexterity;
        dataSource = 'spy';
      } else {
        enemyTotal = Number(ffData.bs_estimate) || 100000000; // Default if missing
        dataSource = 'ffscouter';
      }
      
      const fairFight = Number(ffData.fair_fight) || 1.0;
      
      // 4. Calculate analysis
      const analysis = calculateCombatAnalysis(userTotal, enemyTotal, fairFight);
      
      targets.push({
        uid: member.id,
        name: member.name,
        level: member.level,
        status: member.status,
        fairFight: fairFight,
        enemyTotal: enemyTotal,
        dataSource: dataSource,
        ...analysis
      });
    }
  }
  
  // Categorize
  const categorized = {
    green: targets.filter(t => t.tier === 'green'),
    amber: targets.filter(t => t.tier === 'amber'),
    blue: targets.filter(t => t.tier === 'blue'),
    red: targets.filter(t => t.tier === 'red')
  };
  
  return jsonResponse({
    success: true,
    userTotal: userTotal,
    userStatSource: userStatSource,
    totalTargets: targets.length,
    categories: {
      green: categorized.green.length,
      amber: categorized.amber.length,
      blue: categorized.blue.length,
      red: categorized.red.length
    },
    targets: targets
  }, corsHeaders);
}

// ==========================================
// COMBAT ANALYSIS CALCULATOR
// ==========================================

function calculateCombatAnalysis(userTotal, enemyTotal, fairFight) {
  // Effective stats with FF multiplier
  const effectiveUserStats = userTotal * fairFight;
  const statRatio = effectiveUserStats / enemyTotal;
  
  // Win probability
  let winProb, confidence;
  if (statRatio >= 2.0) {
    winProb = 0.95;
    confidence = 'high';
  } else if (statRatio >= 1.5) {
    winProb = 0.85;
    confidence = 'high';
  } else if (statRatio >= 1.2) {
    winProb = 0.70;
    confidence = 'medium';
  } else if (statRatio >= 1.0) {
    winProb = 0.55;
    confidence = 'medium';
  } else if (statRatio >= 0.8) {
    winProb = 0.35;
    confidence = 'low';
  } else {
    winProb = 0.15;
    confidence = 'low';
  }
  
  // Tier based on FF and win probability
  let tier;
  if (fairFight >= 4.7 && winProb >= 0.85) {
    tier = 'green'; // Safe
  } else if (fairFight >= 3.0 && winProb >= 0.70) {
    tier = 'amber'; // Prime
  } else if (fairFight >= 2.0 && winProb >= 0.40) {
    tier = 'blue'; // Risky
  } else {
    tier = 'red'; // Avoid
  }
  
  // Verdict
  let verdict;
  if (winProb >= 0.85) verdict = 'RECOMMENDED';
  else if (winProb >= 0.60) verdict = 'ACCEPTABLE';
  else if (winProb >= 0.40) verdict = 'RISKY';
  else verdict = 'AVOID';
  
  // Reasoning
  const advantage = ((statRatio - 1) * 100).toFixed(1);
  let reasoning;
  
  if (statRatio >= 1.5) {
    reasoning = `Strong advantage: Your ${(effectiveUserStats/1e9).toFixed(2)}B effective stats (${(userTotal/1e9).toFixed(2)}B × ${fairFight.toFixed(2)}x FF) vs their ${(enemyTotal/1e9).toFixed(2)}B gives you ${advantage}% superiority. ${(winProb*100).toFixed(0)}% win chance with minimal risk.`;
  } else if (statRatio >= 1.0) {
    reasoning = `Moderate edge: ${advantage}% stat advantage with ${fairFight.toFixed(2)}x FF multiplier. ${(winProb*100).toFixed(0)}% win probability - good target but use boosters for safety.`;
  } else {
    const disadvantage = ((1 - statRatio) * 100).toFixed(1);
    reasoning = `Disadvantage: You're ${disadvantage}% weaker even with ${fairFight.toFixed(2)}x FF. Only ${(winProb*100).toFixed(0)}% win chance - high hospitalization risk. Find easier targets.`;
  }
  
  return {
    winProbability: winProb,
    confidence: confidence,
    statRatio: statRatio,
    tier: tier,
    verdict: verdict,
    reasoning: reasoning
  };
}

// ==========================================
// SPY DATABASE
// ==========================================

async function listSpyData(env, corsHeaders) {
  const list = await env.ROTATOR.list({ prefix: 'spy_' });
  const results = {};
  
  for (const key of list.keys) {
    const data = await env.ROTATOR.get(key.name, { type: 'json' });
    if (data) {
      const uid = key.name.replace('spy_', '');
      results[uid] = data;
    }
  }
  
  return jsonResponse({ 
    count: Object.keys(results).length, 
    spies: results 
  }, corsHeaders);
}

async function saveSpyData(request, env, corsHeaders) {
  const body = await request.json();
  const targets = Array.isArray(body.spies) ? body.spies : [body];

  for (const t of targets) {
    const key = `spy_${t.uid}`;
    await env.ROTATOR.put(key, JSON.stringify(t.data));
  }
  
  return jsonResponse({ ok: true, count: targets.length }, corsHeaders);
}

// ==========================================
// WEB UI
// ==========================================

function getUI() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Torn Tactical Advisor</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --green: #00ff9c;
      --amber: #f6da00;
      --blue: #009fff;
      --red: #ff3333;
      --bg: #000;
      --panel: #1c1c1c;
      --border: #333;
    }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: #eee;
      padding: 20px;
      min-height: 100vh;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 {
      font-family: 'Orbitron', sans-serif;
      font-size: 36px;
      text-align: center;
      color: var(--blue);
      letter-spacing: 4px;
      margin-bottom: 30px;
    }
    .card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 25px;
      padding: 30px;
      margin-bottom: 20px;
    }
    .card h2 {
      font-family: 'Orbitron', sans-serif;
      color: var(--amber);
      font-size: 18px;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    input, button, select {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      padding: 14px;
      border-radius: 25px;
      border: 1px solid var(--border);
      background: #000;
      color: #fff;
      width: 100%;
      margin-bottom: 12px;
    }
    button {
      background: var(--blue);
      color: #000;
      font-weight: 600;
      cursor: pointer;
      border: none;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    button:hover { opacity: 0.8; }
    .hidden { display: none !important; }
    .loading { color: var(--blue); text-align: center; padding: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
    .target-card {
      background: #111;
      padding: 20px;
      border-radius: 20px;
      border-left: 5px solid;
      cursor: pointer;
    }
    .target-card.green { border-left-color: var(--green); }
    .target-card.amber { border-left-color: var(--amber); }
    .target-card.blue { border-left-color: var(--blue); }
    .target-card.red { border-left-color: var(--red); }
    .target-card:hover { background: #1a1a1a; }
    .label { font-size: 10px; color: #888; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
    .stat-row { display: flex; justify-content: space-between; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TACTICAL ADVISOR</h1>
    
    <!-- Initialize Screen -->
    <div id="initScreen" class="card">
      <h2>🎯 INITIALIZE BATTLEFIELD SCAN</h2>
      <input type="number" id="userTornId" placeholder="Your Torn User ID (e.g., 2702970)" value="2702970">
      <input type="number" id="enemyFactionId" placeholder="Enemy Faction ID (e.g., 42505)" value="42505">
      <small style="color: #888; display: block; margin: 10px 0;">Using temp API keys (expires in 48hrs)</small>
      <button onclick="initialize()">INITIALIZE SCAN</button>
      <div id="initStatus"></div>
    </div>
    
    <!-- Dashboard -->
    <div id="dashboard" class="hidden">
      <div class="card">
        <h2>👤 OPERATOR STATUS</h2>
        <div class="stat-row">
          <div><span class="label">Name</span><div id="userName">-</div></div>
          <div><span class="label">Torn Stats</span><div id="tornTotal" style="color: var(--green);">-</div></div>
          <div><span class="label">FF Stats</span><div id="ffTotal" style="color: var(--blue);">-</div></div>
        </div>
        <div style="margin-top: 20px;">
          <span class="label">Stat Source for Analysis:</span>
          <select id="statSource" onchange="regenerateAnalysis()">
            <option value="torn">Torn Stats (includes merits/education)</option>
            <option value="ff">FF Scouter Stats</option>
          </select>
        </div>
      </div>
      
      <div class="card">
        <h2>📊 TARGET ANALYSIS</h2>
        <div id="categoryBreakdown" style="display: flex; gap: 20px; margin-bottom: 20px;"></div>
        <div id="targetGrid" class="grid"></div>
      </div>
    </div>
  </div>

  <script>
    let SESSION = {
      userTornId: null,
      enemyFactionId: null,
      tornApiKey: null,
      ffScouterKey: null,
      userData: null,
      factionData: null,
      targets: []
    };
    
    async function initialize() {
      const userTornId = document.getElementById('userTornId').value;
      const enemyFactionId = document.getElementById('enemyFactionId').value;
      
      if (!userTornId || !enemyFactionId) {
        alert('Please enter both User ID and Faction ID');
        return;
      }
      
      SESSION.userTornId = userTornId;
      SESSION.enemyFactionId = enemyFactionId;
      
      document.getElementById('initStatus').innerHTML = '<div class="loading">⏳ Initializing...</div>';
      
      // Step 1: Fetch user stats
      document.getElementById('initStatus').innerHTML = '<div class="loading">⏳ Fetching your stats...</div>';
      const userResponse = await fetch('/api/fetch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userTornId })
      });
      const userData = await userResponse.json();
      SESSION.userData = userData;
      
      if (!userData.success) {
        alert('Failed to fetch user stats: ' + (userData.error || 'Unknown error'));
        document.getElementById('initStatus').innerHTML = '';
        return;
      }
      
      // Step 2: Fetch faction roster
      document.getElementById('initStatus').innerHTML = '<div class="loading">⏳ Fetching enemy faction...</div>';
      const factionResponse = await fetch('/api/fetch-faction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enemyFactionId })
      });
      const factionData = await factionResponse.json();
      SESSION.factionData = factionData;
      
      if (!factionData.success) {
        alert('Failed to fetch faction data: ' + (factionData.error || 'Unknown error'));
        document.getElementById('initStatus').innerHTML = '';
        return;
      }
      
      // Step 3: Analyze all targets
      document.getElementById('initStatus').innerHTML = \`<div class="loading">⏳ Analyzing \${factionData.memberCount} targets...</div>\`;
      await analyzeTargets();
    }
    
    async function analyzeTargets() {
      const response = await fetch('/api/analyze-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTornId: SESSION.userTornId,
          userStatSource: document.getElementById('statSource').value,
          members: SESSION.factionData.members
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        SESSION.targets = data.targets;
        showDashboard();
      } else {
        alert('Analysis failed: ' + data.error);
      }
    }
    
    function showDashboard() {
      document.getElementById('initScreen').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      
      // Display user stats
      document.getElementById('userName').textContent = SESSION.userData.tornStats?.name || 'OPERATOR';
      document.getElementById('tornTotal').textContent = formatStats(SESSION.userData.tornStats?.total);
      document.getElementById('ffTotal').textContent = formatStats(SESSION.userData.ffStats?.total);
      
      // Display category breakdown
      const categories = { green: 0, amber: 0, blue: 0, red: 0 };
      SESSION.targets.forEach(t => categories[t.tier]++);
      
      document.getElementById('categoryBreakdown').innerHTML = \`
        <div><span class="label">🟢 Safe</span><div style="color: var(--green); font-size: 24px; font-weight: 700;">\${categories.green}</div></div>
        <div><span class="label">🟠 Prime</span><div style="color: var(--amber); font-size: 24px; font-weight: 700;">\${categories.amber}</div></div>
        <div><span class="label">🔵 Risky</span><div style="color: var(--blue); font-size: 24px; font-weight: 700;">\${categories.blue}</div></div>
        <div><span class="label">🔴 Avoid</span><div style="color: var(--red); font-size: 24px; font-weight: 700;">\${categories.red}</div></div>
      \`;
      
      // Display target cards
      displayTargets();
    }
    
    function displayTargets() {
      const grid = document.getElementById('targetGrid');
      grid.innerHTML = '';
      
      SESSION.targets.forEach(target => {
        const card = document.createElement('div');
        card.className = \`target-card \${target.tier}\`;
        card.innerHTML = \`
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-weight: 700; font-size: 16px;">\${target.name}</div>
            <div style="color: var(--\${target.tier}); font-weight: 700;">\${target.fairFight.toFixed(2)}x</div>
          </div>
          <div class="stat-row">
            <div><span class="label">Win Chance</span><div>\${(target.winProbability * 100).toFixed(0)}%</div></div>
            <div><span class="label">Verdict</span><div style="color: var(--\${target.tier});">\${target.verdict}</div></div>
          </div>
          <div><span class="label">Source</span><small>\${target.dataSource}</small></div>
        \`;
        card.onclick = () => showDetail(target);
        grid.appendChild(card);
      });
    }
    
    function showDetail(target) {
      alert(\`
\${target.name}

Win Probability: \${(target.winProbability * 100).toFixed(0)}%
Fair Fight: \${target.fairFight.toFixed(2)}x
Verdict: \${target.verdict}
Data Source: \${target.dataSource}

Analysis:
\${target.reasoning}

Attack: https://www.torn.com/loader.php?sid=attack&user2ID=\${target.uid}
      \`);
    }
    
    async function regenerateAnalysis() {
      document.getElementById('targetGrid').innerHTML = '<div class="loading">⏳ Recalculating...</div>';
      await analyzeTargets();
    }
    
    function formatStats(num) {
      if (!num) return '-';
      if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
      if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
      return num.toLocaleString();
    }
  </script>
</body>
</html>`;
}

// ==========================================
// HELPER
// ==========================================

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
