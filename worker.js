/**
 * TORN TACTICAL ADVISOR - Phase 1
 * Matching exact flow from working Google Apps Script
 */

// TEMP API KEYS FOR TESTING (48 hour expiry)
const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx'; // FF Scouter Key

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
      
      // API: Get user stats (Torn API)
      if (url.pathname === '/api/get-user' && request.method === 'POST') {
        return await getUserStats(request, env, corsHeaders);
      }
      
      // API: Get faction roster (Torn API)
      if (url.pathname === '/api/get-faction' && request.method === 'POST') {
        return await getFactionRoster(request, env, corsHeaders);
      }
      
      // API: Get FF Scouter batch data for enemies
      if (url.pathname === '/api/get-scouter-batch' && request.method === 'POST') {
        return await getScouterBatch(request, env, corsHeaders);
      }
      
      // HEALTH
      if (url.pathname === '/health') {
        return jsonResponse({ 
          status: 'healthy',
          version: '1.0.0'
        }, corsHeaders);
      }
      
      return jsonResponse({ error: 'Not Found' }, corsHeaders, 404);
      
    } catch (error) {
      console.error('Worker Error:', error);
      return jsonResponse({ 
        error: 'Server Error',
        message: error.message,
        stack: error.stack
      }, corsHeaders, 500);
    }
  }
};

// ==========================================
// GET USER STATS (uses SC_KEY for Torn API)
// ==========================================

async function getUserStats(request, env, corsHeaders) {
  const { uid } = await request.json();
  
  try {
    // Torn API with SC_KEY
    const tornUrl = `https://api.torn.com/user/${uid}?selections=profile,battlestats&key=${SC_KEY}`;
    const response = await fetch(tornUrl);
    const data = await response.json();
    
    if (data.error) {
      return jsonResponse({ 
        error: 'Torn API Error',
        name: 'API ERROR',
        total: 0,
        errCode: data.error.code
      }, corsHeaders);
    }
    
    return jsonResponse({
      success: true,
      name: (data.name || 'OPERATOR').toUpperCase(),
      total: Number(data.total) || 0
    }, corsHeaders);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return jsonResponse({
      error: 'Fetch failed',
      name: 'FETCH FAIL',
      total: 0,
      errCode: 'SYSTEM'
    }, corsHeaders, 500);
  }
}

// ==========================================
// GET FACTION ROSTER
// ==========================================

async function getFactionRoster(request, env, corsHeaders) {
  const { fid } = await request.json();
  
  try {
    const url = `https://api.torn.com/faction/${fid}?selections=basic&key=${TORN_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      return jsonResponse({ error: 'FACTION_API_FAIL' }, corsHeaders, 400);
    }
    
    // Extract members
    const members = Object.keys(data.members || {}).map(id => ({
      id: id,
      name: data.members[id].name,
      level: data.members[id].level,
      status: data.members[id].status
    }));
    
    return jsonResponse({
      success: true,
      name: data.name,
      members: members
    }, corsHeaders);
    
  } catch (error) {
    console.error('Error fetching faction:', error);
    return jsonResponse({ error: 'FACTION_API_FAIL' }, corsHeaders, 500);
  }
}

// ==========================================
// GET FF SCOUTER BATCH DATA
// ==========================================

async function getScouterBatch(request, env, corsHeaders) {
  const { targetsCsv, uid } = await request.json();
  
  try {
    const url = `https://ffscouter.com/api/v1/get-stats?key=${SC_KEY}&targets=${targetsCsv}&user_id=${uid}`;
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('FF Scouter response for batch:', data);
    
    return jsonResponse({
      success: true,
      data: Array.isArray(data) ? data : []
    }, corsHeaders);
    
  } catch (error) {
    console.error('Error fetching FF Scouter batch:', error);
    return jsonResponse({
      success: true,
      data: []
    }, corsHeaders);
  }
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
    input, button {
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
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; margin-top: 20px; }
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
    small { color: #888; font-size: 11px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TACTICAL ADVISOR</h1>
    
    <!-- Initialize Screen -->
    <div id="initScreen" class="card">
      <h2>🎯 INITIALIZE BATTLEFIELD SCAN</h2>
      <input type="number" id="userTornId" placeholder="Your Torn User ID" value="2702970">
      <input type="number" id="enemyFactionId" placeholder="Enemy Faction ID" value="42505">
      <small style="display: block; margin: 10px 0;">Using temp API keys (expires in 48hrs)</small>
      <button onclick="initialize()">INITIALIZE SCAN</button>
      <div id="initStatus"></div>
    </div>
    
    <!-- Dashboard -->
    <div id="dashboard" class="hidden">
      <div class="card">
        <h2>👤 OPERATOR STATUS</h2>
        <div class="stat-row">
          <div><span class="label">Name</span><div id="userName">-</div></div>
          <div><span class="label">Total Stats</span><div id="userTotal" style="color: var(--green); font-size: 24px; font-weight: 700;">-</div></div>
        </div>
        <div style="margin-top: 15px;">
          <span class="label">Target Faction</span>
          <div id="factionName" style="color: var(--amber); font-size: 18px; font-weight: 600;">-</div>
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
      uid: null,
      fid: null,
      myStats: 0,
      rawData: [],
      counts: { amber: 0, green: 0, blue: 0, red: 0 }
    };
    
    async function initialize() {
      const uid = document.getElementById('userTornId').value;
      const fid = document.getElementById('enemyFactionId').value;
      
      if (!uid || !fid) {
        alert('Please enter both IDs');
        return;
      }
      
      SESSION.uid = uid;
      SESSION.fid = fid;
      
      // Step 1: Get user stats
      document.getElementById('initStatus').innerHTML = '<div class="loading">⏳ Fetching operator stats...</div>';
      
      const userRes = await fetch('/api/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid })
      });
      const userData = await userRes.json();
      
      if (userData.error) {
        alert('User fetch failed: ' + userData.errCode);
        document.getElementById('initStatus').innerHTML = '';
        return;
      }
      
      SESSION.myStats = userData.total;
      document.getElementById('userName').textContent = userData.name;
      document.getElementById('userTotal').textContent = formatStats(userData.total);
      
      // Step 2: Get faction roster
      document.getElementById('initStatus').innerHTML = '<div class="loading">⏳ Scanning faction...</div>';
      
      const factionRes = await fetch('/api/get-faction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fid })
      });
      const factionData = await factionRes.json();
      
      if (factionData.error) {
        alert('Faction fetch failed');
        document.getElementById('initStatus').innerHTML = '';
        return;
      }
      
      // Display faction name
      document.getElementById('factionName').textContent = factionData.name || 'Unknown Faction';
      
      // Step 3: Analyze targets in batches
      document.getElementById('initStatus').innerHTML = \`<div class="loading">⏳ Analyzing \${factionData.members.length} targets...</div>\`;
      
      await startScan(factionData.members);
    }
    
    function calculateWinProbability(myStats, enemyStats, fairFight) {
      // Handle edge cases
      if (!myStats || !enemyStats || enemyStats === 0) {
        return {
          winChance: 0,
          verdict: 'NO DATA',
          reasoning: 'Insufficient data to calculate',
          statRatio: 0
        };
      }
      
      // FF multiplier does NOT affect combat - it only affects respect!
      // Direct stat comparison only
      const statRatio = myStats / enemyStats;
      
      // Calculate win probability based on stat ratio
      let winChance;
      if (statRatio >= 3.0) winChance = 98;
      else if (statRatio >= 2.0) winChance = 95;
      else if (statRatio >= 1.5) winChance = 85;
      else if (statRatio >= 1.2) winChance = 70;
      else if (statRatio >= 1.0) winChance = 55;
      else if (statRatio >= 0.8) winChance = 35;
      else if (statRatio >= 0.6) winChance = 20;
      else winChance = 10;
      
      // Determine verdict
      let verdict;
      if (winChance >= 85) verdict = 'DOMINANT';
      else if (winChance >= 65) verdict = 'FAVORABLE';
      else if (winChance >= 45) verdict = 'RISKY';
      else verdict = 'AVOID';
      
      // Generate reasoning
      const myStatsB = (myStats / 1e9).toFixed(2);
      const enemyStatsB = (enemyStats / 1e9).toFixed(2);
      const advantage = ((statRatio - 1) * 100).toFixed(0);
      
      let reasoning;
      if (statRatio >= 1.2) {
        reasoning = \`Strong position: Your \${myStatsB}B vs their \${enemyStatsB}B. You have \${advantage}% stat advantage for \${winChance}% win chance. FF \${fairFight.toFixed(2)}x affects respect only, not combat.\`;
      } else if (statRatio >= 0.9) {
        reasoning = \`Close fight: \${myStatsB}B vs \${enemyStatsB}B. Only \${Math.abs(advantage)}% difference. Use boosters for safety. \${winChance}% win chance.\`;
      } else {
        const disadvantage = ((1 - statRatio) * 100).toFixed(0);
        reasoning = \`Dangerous: You're \${disadvantage}% weaker (\${myStatsB}B vs \${enemyStatsB}B). Only \${winChance}% win chance. High hospitalization risk. FF \${fairFight.toFixed(2)}x means high respect if you win.\`;
      }
      
      return {
        winChance,
        verdict,
        reasoning,
        statRatio
      };
    }
    
    async function startScan(members) {
      SESSION.rawData = [];
      SESSION.counts = { amber: 0, green: 0, blue: 0, red: 0 };
      
      // Filter out the user's own ID
      const enemies = members.filter(m => m.id !== SESSION.uid);
      
      // Fetch spy database ONCE
      let spyDb = {};
      // DISABLED FOR NOW - will revisit spy DB integration later
      /*
      try {
        const spyRes = await fetch('/spy');
        const spyData = await spyRes.json();
        
        console.log('Raw spy data structure:', typeof spyData.spies);
        
        // Rebuild: use player_id as key instead of index
        if (spyData.spies && typeof spyData.spies === 'object') {
          Object.values(spyData.spies).forEach(spy => {
            if (spy && spy.player_id) {
              spyDb[spy.player_id] = {
                stats: {
                  strength: Number(spy.strength) || 0,
                  defense: Number(spy.defense) || 0,
                  speed: Number(spy.speed) || 0,
                  dexterity: Number(spy.dexterity) || 0
                }
              };
            }
          });
        }
        
        console.log('Loaded spy database:', Object.keys(spyDb).length, 'entries');
        console.log('Sample IDs:', Object.keys(spyDb).slice(0, 5));
      } catch (e) {
        console.error('Spy database error:', e);
      }
      */
      
      const CHUNK = 100;
      
      for (let i = 0; i < enemies.length; i += CHUNK) {
        const chunk = enemies.slice(i, i + CHUNK);
        const chunkCsv = chunk.map(m => m.id).join(',');
        
        // Get FF Scouter data for chunk
        const scRes = await fetch('/api/get-scouter-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetsCsv: chunkCsv, uid: SESSION.uid })
        });
        const scData = await scRes.json();
        
        // Process each member
        for (let idx = 0; idx < chunk.length; idx++) {
          const member = chunk[idx];
          const scDatum = scData.data[idx] || { fair_fight: 1.0, bs_estimate: 0 };
          
          let total = Number(scDatum.bs_estimate) || 0;
          const ff = Number(scDatum.fair_fight) || 1.0;
          let dataLabel = 'Est. Power';
          
          // Spy DB disabled for now - will revisit later
          // All targets use FF Scouter data only
          
          // Calculate win probability
          const analysis = calculateWinProbability(SESSION.myStats, total, ff);
          
          // Determine tier (custom ranges)
          let tier;
          if (ff < 1.8) tier = 'amber';      // Safe - too low FF
          else if (ff < 4.2) tier = 'green'; // Prime
          else if (ff < 5.2) tier = 'blue';  // Risky
          else tier = 'red';                 // Avoid - too high
          
          const obj = {
            m: member,
            id: member.id,
            total: total,
            ff: ff,
            tier: tier,
            dataLabel: dataLabel,
            winChance: analysis.winChance,
            verdict: analysis.verdict,
            reasoning: analysis.reasoning,
            statRatio: analysis.statRatio
          };
          
          SESSION.rawData.push(obj);
          SESSION.counts[tier]++;
        }
      }
      
      showDashboard();
    }
    
    function showDashboard() {
      document.getElementById('initScreen').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      
      // Category breakdown
      document.getElementById('categoryBreakdown').innerHTML = \`
        <div><span class="label">🟠 Safe</span><div style="color: var(--amber); font-size: 24px; font-weight: 700;">\${SESSION.counts.amber}</div></div>
        <div><span class="label">🟢 Prime</span><div style="color: var(--green); font-size: 24px; font-weight: 700;">\${SESSION.counts.green}</div></div>
        <div><span class="label">🔵 Risky</span><div style="color: var(--blue); font-size: 24px; font-weight: 700;">\${SESSION.counts.blue}</div></div>
        <div><span class="label">🔴 Avoid</span><div style="color: var(--red); font-size: 24px; font-weight: 700;">\${SESSION.counts.red}</div></div>
      \`;
      
      // Display targets
      const grid = document.getElementById('targetGrid');
      grid.innerHTML = '';
      
      SESSION.rawData.forEach(obj => {
        const card = document.createElement('div');
        card.className = \`target-card \${obj.tier}\`;
        card.innerHTML = \`
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-weight: 700; font-size: 16px;">\${obj.m.name}</div>
            <div style="color: var(--\${obj.tier}); font-weight: 700; font-size: 18px;">\${obj.ff.toFixed(2)}x</div>
          </div>
          <div class="stat-row">
            <div><span class="label">Win Chance</span><div style="color: var(--\${obj.tier}); font-size: 20px; font-weight: 700;">\${obj.winChance}%</div></div>
            <div><span class="label">Verdict</span><div style="font-size: 11px; font-weight: 600;">\${obj.verdict}</div></div>
          </div>
          <div class="stat-row" style="margin-top: 8px;">
            <div><span class="label">\${obj.dataLabel}</span><div style="font-size: 13px;">\${formatStats(obj.total)}</div></div>
            <div><span class="label">Level</span><div style="font-size: 13px;">\${obj.m.level}</div></div>
          </div>
        \`;
        card.onclick = () => showDetail(obj);
        grid.prepend(card);
      });
    }
    
    function showDetail(obj) {
      alert(\`
\${obj.m.name}

Win Chance: \${obj.winChance}%
Verdict: \${obj.verdict}
Fair Fight: \${obj.ff.toFixed(2)}x
Stat Ratio: \${obj.statRatio.toFixed(2)}x

Analysis:
\${obj.reasoning}

Attack: https://www.torn.com/loader.php?sid=attack&user2ID=\${obj.id}
      \`);
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
