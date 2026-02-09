/**
 * TORN TACTICAL ADVISOR - With User Setup
 * Setup once, analyze automatically
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
      // SPY DATABASE ROUTES
      if (url.pathname === '/spy' && request.method === 'GET') {
        return await listSpyData(env, corsHeaders);
      }
      
      if (url.pathname === '/spy' && request.method === 'POST') {
        return await saveSpyData(request, env, corsHeaders);
      }
      
      // USER SETUP ROUTES
      if (url.pathname === '/api/user/save' && request.method === 'POST') {
        return await saveUserData(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/user/get' && request.method === 'GET') {
        const tornId = url.searchParams.get('id');
        return await getUserData(tornId, env, corsHeaders);
      }
      
      // MAIN UI
      if (url.pathname === '/' || url.pathname === '/advisor') {
        return new Response(getUI(), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8', ...corsHeaders }
        });
      }
      
      // API: Analyze target
      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return await analyzeTarget(request, env, corsHeaders);
      }
      
      // HEALTH CHECK
      if (url.pathname === '/health') {
        return jsonResponse({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '0.2.0',
          features: ['user-setup', 'spy-database', 'combat-intelligence']
        }, corsHeaders);
      }
      
      // 404
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
// USER DATA HANDLERS
// ==========================================

async function saveUserData(request, env, corsHeaders) {
  const { tornId, factionId, stats, apiKey } = await request.json();
  
  if (!tornId || !factionId) {
    return jsonResponse({ error: 'Missing tornId or factionId' }, corsHeaders, 400);
  }
  
  const userData = {
    tornId,
    factionId,
    stats: stats || null,
    apiKey: apiKey || null,
    lastUpdated: Date.now(),
    preferences: {
      autoAnalyze: true,
      mode: 'war'
    }
  };
  
  const key = `user_${tornId}`;
  await env.ROTATOR.put(key, JSON.stringify(userData));
  
  return jsonResponse({ 
    success: true, 
    message: 'User data saved',
    tornId 
  }, corsHeaders);
}

async function getUserData(tornId, env, corsHeaders) {
  if (!tornId) {
    return jsonResponse({ error: 'Missing tornId' }, corsHeaders, 400);
  }
  
  const key = `user_${tornId}`;
  const data = await env.ROTATOR.get(key, { type: 'json' });
  
  if (!data) {
    return jsonResponse({ error: 'User not found' }, corsHeaders, 404);
  }
  
  // Don't send API key to client
  const safeData = { ...data };
  delete safeData.apiKey;
  
  return jsonResponse(safeData, corsHeaders);
}

// ==========================================
// SPY DATABASE HANDLERS
// ==========================================

async function listSpyData(env, corsHeaders) {
  const list = await env.ROTATOR.list({ prefix: 'spy_' });
  const results = {};
  
  for (const key of list.keys) {
    const data = await env.ROTATOR.get(key.name, { type: 'json' });
    if (data) {
      const pid = key.name.split('_').pop(); 
      results[pid] = data;
    }
  }
  
  return jsonResponse({ 
    count: Object.keys(results).length, 
    members: results 
  }, corsHeaders);
}

async function saveSpyData(request, env, corsHeaders) {
  const body = await request.json();
  const targets = Array.isArray(body.spies) ? body.spies : [body];

  for (const t of targets) {
    const folder = t.fid || 'global';
    const key = `spy_${folder}_${t.uid}`;
    await env.ROTATOR.put(key, JSON.stringify(t.data));
  }
  
  return jsonResponse({ ok: true, count: targets.length }, corsHeaders);
}

// ==========================================
// COMBAT ANALYSIS (Simplified for now)
// ==========================================

async function analyzeTarget(request, env, corsHeaders) {
  const { userTornId, targetId, fid = 'global' } = await request.json();
  
  if (!userTornId || !targetId) {
    return jsonResponse({ error: 'Missing userTornId or targetId' }, corsHeaders, 400);
  }
  
  // Get user data
  const userKey = `user_${userTornId}`;
  const userData = await env.ROTATOR.get(userKey, { type: 'json' });
  
  if (!userData || !userData.stats) {
    return jsonResponse({ error: 'User not found or stats not set' }, corsHeaders, 404);
  }
  
  // Get target from spy database
  const targetKey = `spy_${fid}_${targetId}`;
  const targetData = await env.ROTATOR.get(targetKey, { type: 'json' });
  
  if (!targetData) {
    return jsonResponse({ error: 'Target not found in spy database' }, corsHeaders, 404);
  }
  
  // Calculate analysis
  const analysis = calculateCombatAnalysis(userData.stats, targetData);
  
  return jsonResponse(analysis, corsHeaders);
}

function calculateCombatAnalysis(userStats, targetData) {
  const targetStats = targetData.stats || targetData;
  const ffMultiplier = targetData.ff || 1.0;
  
  const userTotal = userStats.strength + userStats.defense + userStats.speed + userStats.dexterity;
  const targetTotal = targetStats.strength + targetStats.defense + targetStats.speed + targetStats.dexterity;
  
  const effectiveUserStats = userTotal * ffMultiplier;
  const statRatio = effectiveUserStats / targetTotal;
  
  let winProb;
  if (statRatio >= 2.0) winProb = 0.95;
  else if (statRatio >= 1.5) winProb = 0.85;
  else if (statRatio >= 1.2) winProb = 0.70;
  else if (statRatio >= 1.0) winProb = 0.55;
  else winProb = 0.35;
  
  let verdict = winProb >= 0.85 ? 'RECOMMENDED' : winProb >= 0.6 ? 'ACCEPTABLE' : winProb >= 0.4 ? 'RISKY' : 'AVOID';
  
  return {
    verdict,
    winProbability: winProb,
    statRatio,
    ffMultiplier
  };
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
    input, button {
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
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal.show { display: flex; }
    .modal-content {
      background: linear-gradient(135deg, #1a1a1a, #2a1a2a);
      padding: 40px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-width: 500px;
      width: 90%;
    }
    .success { color: #00ff9c; }
    .warning { color: #ff9d00; }
    .danger { color: #ff2b2b; }
    .info { color: #00d2ff; }
    .hidden { display: none; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    small { color: #888; font-size: 11px; display: block; margin-top: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Tactical Advisor</h1>
    
    <!-- Setup Card (shown if no user) -->
    <div id="setupCard" class="card">
      <h2>🎯 Initial Setup</h2>
      <p style="color: #aaa; margin-bottom: 20px;">Enter your details once. System will fetch and analyze everything automatically.</p>
      
      <input type="number" id="setupTornId" placeholder="Your Torn User ID (e.g., 2864818)">
      <small>Find this in your Torn profile URL</small>
      
      <input type="number" id="setupFactionId" placeholder="Your Faction ID">
      <small>Find this in your faction page URL</small>
      
      <h3 style="color: #00d2ff; font-size: 14px; margin: 20px 0 10px;">Your Battle Stats (Manual for now):</h3>
      <div class="grid">
        <input type="number" id="setupStrength" placeholder="Strength">
        <input type="number" id="setupDefense" placeholder="Defense">
        <input type="number" id="setupSpeed" placeholder="Speed">
        <input type="number" id="setupDexterity" placeholder="Dexterity">
      </div>
      <small>We'll auto-fetch these from Torn API in the future</small>
      
      <button onclick="saveUserSetup()" style="margin-top: 20px;">Save & Continue</button>
      <div id="setupResult"></div>
    </div>
    
    <!-- Dashboard (shown after setup) -->
    <div id="dashboard" class="hidden">
      <div class="card">
        <h2>👤 Your Profile</h2>
        <p><strong>Torn ID:</strong> <span id="userTornId" class="info">-</span></p>
        <p><strong>Faction ID:</strong> <span id="userFactionId" class="info">-</span></p>
        <p><strong>Total Stats:</strong> <span id="userTotalStats" class="success">-</span></p>
        <button onclick="showSetup()">Edit Profile</button>
      </div>
      
      <div class="card">
        <h2>🎯 Quick Analysis</h2>
        <p style="color: #aaa; margin-bottom: 15px;">Enter a target ID to analyze (uses your saved stats)</p>
        <input type="number" id="quickTargetId" placeholder="Target ID">
        <input type="text" id="quickFid" placeholder="Faction ID (default: global)" value="global">
        <button onclick="quickAnalyze()">Analyze Target</button>
        <div id="quickResult"></div>
      </div>
      
      <div class="card">
        <h2>📊 Spy Database</h2>
        <button onclick="checkSpyData()">View All Spy Data</button>
        <div id="spyResult"></div>
      </div>
    </div>
  </div>

  <script>
    let currentUser = null;
    
    // Check if user exists on load
    window.onload = function() {
      const savedTornId = localStorage.getItem('tornId');
      if (savedTornId) {
        loadUser(savedTornId);
      }
    };
    
    async function saveUserSetup() {
      const tornId = document.getElementById('setupTornId').value;
      const factionId = document.getElementById('setupFactionId').value;
      const stats = {
        strength: parseInt(document.getElementById('setupStrength').value) || 0,
        defense: parseInt(document.getElementById('setupDefense').value) || 0,
        speed: parseInt(document.getElementById('setupSpeed').value) || 0,
        dexterity: parseInt(document.getElementById('setupDexterity').value) || 0
      };
      
      if (!tornId || !factionId || stats.strength === 0) {
        alert('Please fill in all fields');
        return;
      }
      
      try {
        const response = await fetch('/api/user/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tornId, factionId, stats })
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('tornId', tornId);
          document.getElementById('setupResult').innerHTML = '<p class="success">✅ Saved! Loading dashboard...</p>';
          setTimeout(() => loadUser(tornId), 1000);
        } else {
          document.getElementById('setupResult').innerHTML = \`<p class="danger">❌ \${data.error}</p>\`;
        }
      } catch (error) {
        document.getElementById('setupResult').innerHTML = \`<p class="danger">❌ Error: \${error.message}</p>\`;
      }
    }
    
    async function loadUser(tornId) {
      try {
        const response = await fetch(\`/api/user/get?id=\${tornId}\`);
        const data = await response.json();
        
        if (data.error) {
          showSetup();
          return;
        }
        
        currentUser = data;
        
        // Update UI
        document.getElementById('userTornId').textContent = data.tornId;
        document.getElementById('userFactionId').textContent = data.factionId;
        
        const total = data.stats.strength + data.stats.defense + data.stats.speed + data.stats.dexterity;
        document.getElementById('userTotalStats').textContent = total.toLocaleString();
        
        // Show dashboard
        document.getElementById('setupCard').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        
      } catch (error) {
        console.error('Error loading user:', error);
        showSetup();
      }
    }
    
    function showSetup() {
      document.getElementById('setupCard').classList.remove('hidden');
      document.getElementById('dashboard').classList.add('hidden');
    }
    
    async function quickAnalyze() {
      if (!currentUser) {
        alert('Please set up your profile first');
        return;
      }
      
      const targetId = document.getElementById('quickTargetId').value;
      const fid = document.getElementById('quickFid').value || 'global';
      
      if (!targetId) {
        alert('Please enter a target ID');
        return;
      }
      
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userTornId: currentUser.tornId, 
            targetId, 
            fid 
          })
        });
        
        const data = await response.json();
        
        if (data.error) {
          document.getElementById('quickResult').innerHTML = \`<p class="danger">❌ \${data.error}</p>\`;
          return;
        }
        
        const verdictClass = data.verdict === 'RECOMMENDED' ? 'success' : 
                            data.verdict === 'ACCEPTABLE' ? 'warning' : 'danger';
        
        document.getElementById('quickResult').innerHTML = \`
          <div style="margin-top: 20px; padding: 20px; background: rgba(0,0,0,0.3); border-radius: 12px;">
            <h3 class="\${verdictClass}">\${data.verdict}</h3>
            <p><strong>Win Chance:</strong> <span class="\${verdictClass}">\${(data.winProbability * 100).toFixed(0)}%</span></p>
            <p><strong>Stat Ratio:</strong> \${data.statRatio.toFixed(2)}x</p>
            <p><strong>FF Multiplier:</strong> \${data.ffMultiplier}x</p>
          </div>
        \`;
      } catch (error) {
        document.getElementById('quickResult').innerHTML = \`<p class="danger">❌ Error: \${error.message}</p>\`;
      }
    }
    
    async function checkSpyData() {
      try {
        const response = await fetch('/spy');
        const data = await response.json();
        
        document.getElementById('spyResult').innerHTML = \`
          <div style="margin-top: 20px;">
            <p><strong>Total Spies:</strong> <span class="success">\${data.count}</span></p>
            \${data.count > 0 ? '<pre style="margin-top: 10px; font-size: 11px;">' + JSON.stringify(data.members, null, 2) + '</pre>' : '<p style="margin-top: 15px; color: #888;">No spy data yet.</p>'}
          </div>
        \`;
      } catch (error) {
        document.getElementById('spyResult').innerHTML = \`<p class="danger">❌ Error: \${error.message}</p>\`;
      }
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
