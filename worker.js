/**
 * TORN TACTICAL ADVISOR - Correct Flow
 * User enters: Enemy Faction ID + Their User ID
 * Option to choose which stat source for analysis
 */

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
      
      // API: Initialize scan (fetch user + faction data)
      if (url.pathname === '/api/initialize' && request.method === 'POST') {
        return await initializeScan(request, env, corsHeaders);
      }
      
      // API: Generate full report with stat choice
      if (url.pathname === '/api/generate-report' && request.method === 'POST') {
        return await generateReport(request, env, corsHeaders);
      }
      
      // HEALTH
      if (url.pathname === '/health') {
        return jsonResponse({ 
          status: 'healthy',
          version: '0.3.0',
          features: ['tactical-advisor', 'spy-integration', 'ff-scouter']
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
  
  // TODO: Fetch user data from Torn API
  // For now, return mock structure
  const userData = {
    tornId: userTornId,
    name: "OPERATOR",
    tornStats: {
      total: 2000000000, // From Torn API (includes merits/education)
      strength: 500000000,
      defense: 480000000,
      speed: 520000000,
      dexterity: 500000000
    },
    ffScouterStats: {
      total: 1950000000, // From FF Scouter estimate
      strength: 490000000,
      defense: 475000000,
      speed: 510000000,
      dexterity: 475000000
    }
  };
  
  // TODO: Fetch enemy faction roster from Torn API
  const factionData = {
    factionId: enemyFactionId,
    name: "Enemy Faction",
    members: [
      { id: "123456", name: "Enemy1" },
      { id: "789012", name: "Enemy2" },
      { id: "345678", name: "Enemy3" }
    ]
  };
  
  return jsonResponse({
    success: true,
    userData,
    factionData
  }, corsHeaders);
}

// ==========================================
// GENERATE REPORT
// ==========================================

async function generateReport(request, env, corsHeaders) {
  const { 
    userTornId, 
    userStatSource, // 'torn' or 'ffscouter'
    enemyFactionId,
    enemies // array of enemy IDs
  } = await request.json();
  
  if (!userTornId || !userStatSource || !enemies) {
    return jsonResponse({ error: 'Missing required fields' }, corsHeaders, 400);
  }
  
  // Get user stats (stored from initialize)
  // For now using mock data
  const userStats = userStatSource === 'torn' 
    ? { total: 2000000000 }
    : { total: 1950000000 };
  
  const targets = [];
  
  // For each enemy
  for (const enemyId of enemies) {
    // 1. Check spy database (key: spy_{uid})
    const spyKey = `spy_${enemyId}`;
    const spyData = await env.ROTATOR.get(spyKey, { type: 'json' });
    
    // 2. Get FF Scouter data (ALWAYS - for FF multiplier)
    // TODO: Call FF Scouter API
    const ffData = {
      uid: enemyId,
      fairFight: 2.5,
      estimatedTotal: 800000000
    };
    
    // 3. Choose enemy stats (spy data if exists, else FF Scouter)
    const enemyStats = spyData 
      ? {
          total: spyData.stats.strength + spyData.stats.defense + spyData.stats.speed + spyData.stats.dexterity,
          source: 'spy'
        }
      : {
          total: ffData.estimatedTotal,
          source: 'ffscouter'
        };
    
    // 4. Calculate analysis
    const statRatio = (userStats.total * ffData.fairFight) / enemyStats.total;
    
    let winProb, tier;
    if (statRatio >= 2.0) {
      winProb = 0.95;
      tier = 'green';
    } else if (statRatio >= 1.5) {
      winProb = 0.85;
      tier = 'amber';
    } else if (statRatio >= 1.0) {
      winProb = 0.60;
      tier = 'blue';
    } else {
      winProb = 0.30;
      tier = 'red';
    }
    
    targets.push({
      uid: enemyId,
      name: `Enemy${enemyId}`,
      fairFight: ffData.fairFight,
      enemyTotal: enemyStats.total,
      enemyStatsSource: enemyStats.source,
      winProbability: winProb,
      statRatio: statRatio,
      tier: tier,
      verdict: winProb >= 0.85 ? 'RECOMMENDED' : winProb >= 0.60 ? 'ACCEPTABLE' : winProb >= 0.40 ? 'RISKY' : 'AVOID'
    });
  }
  
  // Categorize by tier
  const categorized = {
    amber: targets.filter(t => t.tier === 'amber'),
    green: targets.filter(t => t.tier === 'green'),
    blue: targets.filter(t => t.tier === 'blue'),
    red: targets.filter(t => t.tier === 'red')
  };
  
  return jsonResponse({
    success: true,
    userStatSource,
    userTotal: userStats.total,
    totalTargets: targets.length,
    categories: categorized,
    allTargets: targets
  }, corsHeaders);
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
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0f 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 {
      font-size: 42px;
      text-align: center;
      background: linear-gradient(135deg, #ff2b2b, #ff9d00, #00d2ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 4px;
      margin-bottom: 40px;
      text-transform: uppercase;
    }
    .card {
      background: rgba(26, 26, 26, 0.8);
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .card h2 { color: #ff9d00; font-size: 22px; margin-bottom: 20px; }
    input, button, select {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      width: 100%;
      margin-bottom: 12px;
    }
    button {
      background: linear-gradient(135deg, #ff2b2b, #ff6b2b);
      border: none;
      cursor: pointer;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    button:hover { transform: translateY(-2px); }
    .success { color: #00ff9c; }
    .warning { color: #ff9d00; }
    .danger { color: #ff2b2b; }
    .info { color: #00d2ff; }
    .hidden { display: none; }
    .target-card {
      background: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 12px;
      margin-bottom: 10px;
      border-left: 4px solid;
    }
    .target-card.green { border-left-color: #00ff9c; }
    .target-card.amber { border-left-color: #ff9d00; }
    .target-card.blue { border-left-color: #00d2ff; }
    .target-card.red { border-left-color: #ff2b2b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Tactical Advisor</h1>
    
    <!-- Setup Screen -->
    <div id="setupScreen" class="card">
      <h2>🎯 Initialize Scan</h2>
      
      <input type="number" id="userTornId" placeholder="Your Torn User ID (e.g., 2702970)">
      <input type="number" id="enemyFactionId" placeholder="Enemy Faction ID (e.g., 42505)">
      
      <button onclick="initialize()">INITIALIZE SCAN</button>
      <div id="initResult"></div>
    </div>
    
    <!-- Dashboard (after initialize) -->
    <div id="dashboard" class="hidden">
      <div class="card">
        <h2>👤 Your Data Loaded</h2>
        <p><strong>Torn Stats Total:</strong> <span id="tornTotal" class="success">-</span></p>
        <p><strong>FF Scouter Total:</strong> <span id="ffTotal" class="info">-</span></p>
        <p style="margin-top: 15px; color: #888; font-size: 12px;">Both stats fetched. Choose which to use for analysis.</p>
      </div>
      
      <div class="card">
        <h2>📊 Generate Report</h2>
        
        <label style="display: block; margin-bottom: 10px; color: #ff9d00;">Choose Stat Source:</label>
        <select id="statSource">
          <option value="torn">Torn Stats (includes merits/education)</option>
          <option value="ffscouter">FF Scouter Stats</option>
        </select>
        
        <button onclick="generateReport()">GENERATE FULL REPORT</button>
        <div id="reportResult"></div>
      </div>
    </div>
  </div>

  <script>
    let SESSION = {
      userTornId: null,
      enemyFactionId: null,
      userData: null,
      factionData: null
    };
    
    async function initialize() {
      const userTornId = document.getElementById('userTornId').value;
      const enemyFactionId = document.getElementById('enemyFactionId').value;
      
      if (!userTornId || !enemyFactionId) {
        alert('Please enter both IDs');
        return;
      }
      
      document.getElementById('initResult').innerHTML = '<p class="info">🔄 Fetching data...</p>';
      
      try {
        const response = await fetch('/api/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userTornId, 
            enemyFactionId,
            tornApiKey: 'mock', // TODO: User provides
            ffScouterKey: 'mock' // TODO: User provides
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          SESSION.userTornId = userTornId;
          SESSION.enemyFactionId = enemyFactionId;
          SESSION.userData = data.userData;
          SESSION.factionData = data.factionData;
          
          // Show dashboard
          document.getElementById('setupScreen').classList.add('hidden');
          document.getElementById('dashboard').classList.remove('hidden');
          
          // Display stats
          document.getElementById('tornTotal').textContent = (data.userData.tornStats.total / 1000000000).toFixed(2) + 'B';
          document.getElementById('ffTotal').textContent = (data.userData.ffScouterStats.total / 1000000000).toFixed(2) + 'B';
        } else {
          document.getElementById('initResult').innerHTML = \`<p class="danger">❌ \${data.error}</p>\`;
        }
      } catch (error) {
        document.getElementById('initResult').innerHTML = \`<p class="danger">❌ \${error.message}</p>\`;
      }
    }
    
    async function generateReport() {
      const statSource = document.getElementById('statSource').value;
      
      if (!SESSION.factionData) {
        alert('Please initialize scan first');
        return;
      }
      
      document.getElementById('reportResult').innerHTML = '<p class="info">🔄 Analyzing targets...</p>';
      
      try {
        const enemyIds = SESSION.factionData.members.map(m => m.id);
        
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userTornId: SESSION.userTornId,
            userStatSource: statSource,
            enemyFactionId: SESSION.enemyFactionId,
            enemies: enemyIds
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          displayReport(data);
        } else {
          document.getElementById('reportResult').innerHTML = \`<p class="danger">❌ \${data.error}</p>\`;
        }
      } catch (error) {
        document.getElementById('reportResult').innerHTML = \`<p class="danger">❌ \${error.message}</p>\`;
      }
    }
    
    function displayReport(data) {
      let html = \`
        <div style="margin-top: 20px; padding: 20px; background: rgba(0,210,255,0.1); border-radius: 12px;">
          <h3 style="color: #00d2ff;">Report Generated</h3>
          <p><strong>Using:</strong> \${data.userStatSource === 'torn' ? 'Torn Stats' : 'FF Scouter Stats'}</p>
          <p><strong>Your Total:</strong> \${(data.userTotal / 1000000000).toFixed(2)}B</p>
          <p><strong>Total Targets:</strong> \${data.totalTargets}</p>
        </div>
        
        <div style="margin-top: 20px;">
          <h3 style="color: #00ff9c;">Targets:</h3>
      \`;
      
      data.allTargets.forEach(target => {
        html += \`
          <div class="target-card \${target.tier}">
            <div style="display: flex; justify-content: space-between;">
              <div>
                <strong>\${target.name}</strong><br>
                <small>FF: \${target.fairFight.toFixed(2)}x | Win: \${(target.winProbability * 100).toFixed(0)}%</small>
              </div>
              <div style="text-align: right;">
                <strong class="\${target.tier}">\${target.verdict}</strong><br>
                <small>Source: \${target.enemyStatsSource}</small>
              </div>
            </div>
          </div>
        \`;
      });
      
      html += '</div>';
      
      document.getElementById('reportResult').innerHTML = html;
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
