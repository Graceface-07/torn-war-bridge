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
    // Use the SC_KEY (rwLgZTyqgWDxhoCx) which works
    const tornUrl = `https://api.torn.com/user/${uid}?selections=profile,battlestats&key=${SC_KEY}`;
    const response = await fetch(tornUrl);
    const data = await response.json();
    
    console.log('Torn API response keys:', Object.keys(data));
    console.log('Total:', data.total);
    
    if (data.error) {
      console.error('Torn API error:', data.error);
      return jsonResponse({ 
        error: 'Torn API Error',
        name: 'API ERROR',
        total: 0,
        totalEffective: 0,
        errCode: data.error.code
      }, corsHeaders);
    }
    
    // Calculate effective stats from individual stats with modifiers
    let totalEffective = Number(data.total) || 0;
    
    // If we have individual stats, calculate with modifiers
    if (data.strength !== undefined) {
      const strMod = (data.strength_modifier || 0) / 100;
      const defMod = (data.defense_modifier || 0) / 100;
      const spdMod = (data.speed_modifier || 0) / 100;
      const dexMod = (data.dexterity_modifier || 0) / 100;
      
      const str = (data.strength || 0) * (1 + strMod);
      const def = (data.defense || 0) * (1 + defMod);
      const spd = (data.speed || 0) * (1 + spdMod);
      const dex = (data.dexterity || 0) * (1 + dexMod);
      
      totalEffective = Math.floor(str + def + spd + dex);
      
      console.log('Calculated effective:', totalEffective);
      console.log('Base total:', data.total);
    }
    
    return jsonResponse({
      success: true,
      name: (data.name || 'OPERATOR').toUpperCase(),
      total: Number(data.total) || 0,
      totalEffective: totalEffective
    }, corsHeaders);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return jsonResponse({
      error: 'Fetch failed',
      name: 'FETCH FAIL',
      total: 0,
      totalEffective: 0,
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
    
    <!-- Modal Background -->
    <div id="modalBg" onclick="closeModal()" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000;"></div>
    
    <!-- Target Detail Modal -->
    <div id="targetModal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 600px; background: var(--panel); border: 2px solid var(--border); border-radius: 25px; padding: 30px; z-index: 1001; max-height: 80vh; overflow-y: auto;">
      <button onclick="closeModal()" style="position: absolute; top: 15px; right: 15px; background: var(--red); width: 35px; height: 35px; border-radius: 50%; border: none; color: #fff; font-weight: 700; cursor: pointer;">✕</button>
      <div id="modalContent"></div>
    </div>
    
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
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border);">
          <span class="label">Stat Source for Calculations</span>
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button id="useTornStats" onclick="switchStatSource('torn')" style="flex: 1; padding: 12px; border-radius: 20px; border: 2px solid var(--green); background: var(--green); color: #000; font-weight: 700; cursor: pointer;">
              Torn Stats (True)
            </button>
            <button id="useFFStats" onclick="switchStatSource('ff')" style="flex: 1; padding: 12px; border-radius: 20px; border: 2px solid var(--border); background: transparent; color: #888; font-weight: 700; cursor: pointer;">
              FF Scouter (Est)
            </button>
          </div>
          <div id="activeStatsDisplay" style="margin-top: 10px; padding: 10px; background: #111; border-radius: 15px; text-align: center;">
            <span class="label">Using</span>
            <div id="activeStatsValue" style="color: var(--green); font-size: 20px; font-weight: 700;">-</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2>⏱️ WAR TIMER</h2>
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <input type="datetime-local" id="warTime" style="flex: 1; margin: 0;" placeholder="War Start Time">
          <button onclick="startWarTimer()" style="width: auto; padding: 12px 20px; margin: 0;">Start Timer</button>
        </div>
        <div id="timerDisplay" style="display: none;">
          <div style="text-align: center; padding: 20px; background: #111; border-radius: 15px;">
            <div id="countdown" style="font-size: 36px; font-weight: 700; color: var(--blue); font-family: Orbitron;"></div>
            <div class="label" style="margin-top: 10px;">Until War Starts</div>
            <div id="xanaxAdvice" style="margin-top: 15px; padding: 10px; background: var(--panel); border-radius: 10px; border-left: 4px solid var(--amber);"></div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2>📊 TARGET ANALYSIS</h2>
        <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 200px;">
            <span class="label">Sort By</span>
            <select id="sortBy" onchange="displayTargets(this.value, document.getElementById('filterTier').value)" style="width: 100%; margin: 0;">
              <option value="respect">Respect (High to Low)</option>
              <option value="winChance">Win Chance (High to Low)</option>
              <option value="ff">Fair Fight (High to Low)</option>
              <option value="level">Level (High to Low)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
          <div style="flex: 1; min-width: 200px;">
            <span class="label">Filter Tier</span>
            <select id="filterTier" onchange="displayTargets(document.getElementById('sortBy').value, this.value)" style="width: 100%; margin: 0;">
              <option value="all">All Targets</option>
              <option value="amber">🟠 Safe Only</option>
              <option value="green">🟢 Prime Only</option>
              <option value="blue">🔵 Risky Only</option>
              <option value="red">🔴 Avoid Only</option>
            </select>
          </div>
        </div>
        <div id="categoryBreakdown" style="display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;"></div>
        <div id="targetGrid" class="grid"></div>
      </div>
    </div>
  </div>

  <script>
    let SESSION = {
      uid: null,
      fid: null,
      myTornStats: 0,
      myFFStats: 0,
      activeStatSource: 'torn', // 'torn' or 'ff'
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
      
      SESSION.myTornStats = userData.totalEffective || userData.total; // Use effective (with bonuses)
      SESSION.myFFStats = 70000000; // TODO: Fetch from FF Scouter API for this user
      
      document.getElementById('userName').textContent = userData.name;
      document.getElementById('userTotal').textContent = formatStats(userData.totalEffective || userData.total);
      document.getElementById('activeStatsValue').textContent = formatStats(SESSION.myTornStats) + ' (Torn)';
      
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
    
    function calculateRespect(enemyTotal, fairFight) {
      // Torn respect formula (simplified):
      // Base respect ≈ (enemy_stats / 100000) * fair_fight
      // Capped at certain values
      
      const baseRespect = (enemyTotal / 100000000) * fairFight;
      const respect = Math.min(Math.max(baseRespect, 1), 500); // Min 1, max 500
      
      return Math.round(respect);
    }
    
    function switchStatSource(source) {
      SESSION.activeStatSource = source;
      
      // Update button styles
      if (source === 'torn') {
        document.getElementById('useTornStats').style.background = 'var(--green)';
        document.getElementById('useTornStats').style.color = '#000';
        document.getElementById('useTornStats').style.borderColor = 'var(--green)';
        document.getElementById('useFFStats').style.background = 'transparent';
        document.getElementById('useFFStats').style.color = '#888';
        document.getElementById('useFFStats').style.borderColor = 'var(--border)';
        
        document.getElementById('activeStatsValue').textContent = formatStats(SESSION.myTornStats) + ' (Torn)';
      } else {
        document.getElementById('useFFStats').style.background = 'var(--blue)';
        document.getElementById('useFFStats').style.color = '#000';
        document.getElementById('useFFStats').style.borderColor = 'var(--blue)';
        document.getElementById('useTornStats').style.background = 'transparent';
        document.getElementById('useTornStats').style.color = '#888';
        document.getElementById('useTornStats').style.borderColor = 'var(--border)';
        
        document.getElementById('activeStatsValue').textContent = formatStats(SESSION.myFFStats) + ' (FF Est)';
      }
      
      // Recalculate all targets with new stat source
      recalculateAllTargets();
    }
    
    function recalculateAllTargets() {
      const myStats = SESSION.activeStatSource === 'torn' ? SESSION.myTornStats : SESSION.myFFStats;
      
      // Recalculate each target
      SESSION.rawData.forEach(obj => {
        const analysis = calculateWinProbability(myStats, obj.total, obj.ff);
        obj.winChance = analysis.winChance;
        obj.verdict = analysis.verdict;
        obj.reasoning = analysis.reasoning;
        obj.statRatio = analysis.statRatio;
        
        // Recalculate respect
        obj.respect = calculateRespect(obj.total, obj.ff);
        obj.respectPerEnergy = (obj.respect / 25).toFixed(1);
      });
      
      // Re-render
      showDashboard();
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
          
          // Calculate win probability using active stat source
          const myStats = SESSION.activeStatSource === 'torn' ? SESSION.myTornStats : SESSION.myFFStats;
          const analysis = calculateWinProbability(myStats, total, ff);
          
          // Calculate respect value
          const respectValue = calculateRespect(total, ff);
          
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
            statRatio: analysis.statRatio,
            respect: respectValue,
            respectPerEnergy: (respectValue / 25).toFixed(1) // 25 energy per attack
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
      
      // Calculate total respect potential (only beatable targets)
      const beatableTargets = SESSION.rawData.filter(t => t.winChance >= 50);
      const totalRespect = beatableTargets.reduce((sum, t) => sum + t.respect, 0);
      const totalTargets = SESSION.rawData.length;
      const beatableCount = beatableTargets.length;
      
      // Category breakdown
      document.getElementById('categoryBreakdown').innerHTML = \`
        <div><span class="label">🟠 Safe</span><div style="color: var(--amber); font-size: 24px; font-weight: 700;">\${SESSION.counts.amber}</div></div>
        <div><span class="label">🟢 Prime</span><div style="color: var(--green); font-size: 24px; font-weight: 700;">\${SESSION.counts.green}</div></div>
        <div><span class="label">🔵 Risky</span><div style="color: var(--blue); font-size: 24px; font-weight: 700;">\${SESSION.counts.blue}</div></div>
        <div><span class="label">🔴 Avoid</span><div style="color: var(--red); font-size: 24px; font-weight: 700;">\${SESSION.counts.red}</div></div>
        <div style="border-left: 2px solid var(--border); padding-left: 15px;">
          <span class="label">Potential Respect</span>
          <div style="color: var(--green); font-size: 24px; font-weight: 700;">\${totalRespect.toLocaleString()}</div>
          <span class="label" style="margin-top: 4px; display: block;">\${beatableCount}/\${totalTargets} Beatable</span>
        </div>
      \`;
      
      // Display targets
      displayTargets();
    }
    
    function displayTargets(sortBy = 'respect', filterTier = 'all') {
      let targets = [...SESSION.rawData];
      
      // Filter by tier
      if (filterTier !== 'all') {
        targets = targets.filter(t => t.tier === filterTier);
      }
      
      // Sort
      switch(sortBy) {
        case 'respect':
          targets.sort((a, b) => b.respect - a.respect);
          break;
        case 'winChance':
          targets.sort((a, b) => b.winChance - a.winChance);
          break;
        case 'ff':
          targets.sort((a, b) => b.ff - a.ff);
          break;
        case 'level':
          targets.sort((a, b) => b.m.level - a.m.level);
          break;
        case 'name':
          targets.sort((a, b) => a.m.name.localeCompare(b.m.name));
          break;
      }
      
      const grid = document.getElementById('targetGrid');
      grid.innerHTML = '';
      
      targets.forEach(obj => {
        const card = document.createElement('div');
        card.className = \`target-card \${obj.tier}\`;
        card.innerHTML = \`
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="font-weight: 700; font-size: 16px;">\${obj.m.name}</div>
            <div style="color: var(--\${obj.tier}); font-weight: 700; font-size: 18px;">\${obj.ff.toFixed(2)}x</div>
          </div>
          <div class="stat-row">
            <div><span class="label">Win Chance</span><div style="color: var(--\${obj.tier}); font-size: 20px; font-weight: 700;">\${obj.winChance}%</div></div>
            <div><span class="label">Respect</span><div style="color: var(--green); font-size: 18px; font-weight: 700;">\${obj.respect}</div></div>
          </div>
          <div class="stat-row" style="margin-top: 8px;">
            <div><span class="label">Verdict</span><div style="font-size: 11px; font-weight: 600;">\${obj.verdict}</div></div>
            <div><span class="label">Resp/E</span><div style="font-size: 11px;">\${obj.respectPerEnergy}</div></div>
          </div>
        \`;
        card.onclick = () => showDetail(obj);
        grid.appendChild(card);
      });
    }
    
    function showDetail(obj) {
      const modal = document.getElementById('targetModal');
      const modalBg = document.getElementById('modalBg');
      const content = document.getElementById('modalContent');
      
      content.innerHTML = \`
        <h2 style="font-family: Orbitron; color: var(--\${obj.tier}); margin-bottom: 20px;">\${obj.m.name}</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div style="background: #111; padding: 15px; border-radius: 15px;">
            <span class="label">Win Chance</span>
            <div style="font-size: 32px; font-weight: 700; color: var(--\${obj.tier});">\${obj.winChance}%</div>
          </div>
          <div style="background: #111; padding: 15px; border-radius: 15px;">
            <span class="label">Respect Value</span>
            <div style="font-size: 32px; font-weight: 700; color: var(--green);">\${obj.respect}</div>
          </div>
          <div style="background: #111; padding: 15px; border-radius: 15px;">
            <span class="label">Fair Fight</span>
            <div style="font-size: 24px; font-weight: 700;">\${obj.ff.toFixed(2)}x</div>
          </div>
          <div style="background: #111; padding: 15px; border-radius: 15px;">
            <span class="label">Stat Ratio</span>
            <div style="font-size: 24px; font-weight: 700;">\${obj.statRatio.toFixed(2)}x</div>
          </div>
        </div>
        
        <div style="background: #111; padding: 15px; border-radius: 15px; margin-bottom: 20px;">
          <span class="label">Verdict</span>
          <div style="font-size: 20px; font-weight: 700; color: var(--\${obj.tier}); margin-bottom: 10px;">\${obj.verdict}</div>
          <p style="line-height: 1.6; color: #ccc;">\${obj.reasoning}</p>
        </div>
        
        <div style="background: #111; padding: 15px; border-radius: 15px; margin-bottom: 20px;">
          <span class="label">Combat Stats</span>
          <div style="margin-top: 10px;">
            <div class="stat-row">
              <span>Est. Power:</span>
              <span style="font-weight: 600;">\${formatStats(obj.total)}</span>
            </div>
            <div class="stat-row">
              <span>Level:</span>
              <span style="font-weight: 600;">\${obj.m.level}</span>
            </div>
            <div class="stat-row">
              <span>Respect/Energy:</span>
              <span style="font-weight: 600;">\${obj.respectPerEnergy}</span>
            </div>
          </div>
        </div>
        
        <a href="https://www.torn.com/loader.php?sid=attack&user2ID=\${obj.id}" target="_blank" style="display: block; text-align: center; padding: 15px; background: var(--green); color: #000; font-weight: 700; border-radius: 20px; text-decoration: none; font-size: 16px;">
          ⚔️ ATTACK NOW
        </a>
      \`;
      
      modal.style.display = 'block';
      modalBg.style.display = 'block';
    }
    
    function closeModal() {
      document.getElementById('targetModal').style.display = 'none';
      document.getElementById('modalBg').style.display = 'none';
    }
    
    let warTimerInterval = null;
    
    function startWarTimer() {
      const warTimeInput = document.getElementById('warTime').value;
      if (!warTimeInput) {
        alert('Please select a war start time');
        return;
      }
      
      const warTime = new Date(warTimeInput).getTime();
      document.getElementById('timerDisplay').style.display = 'block';
      
      if (warTimerInterval) clearInterval(warTimerInterval);
      
      warTimerInterval = setInterval(() => {
        const now = Date.now();
        const diff = warTime - now;
        
        if (diff <= 0) {
          document.getElementById('countdown').textContent = 'WAR STARTED!';
          document.getElementById('xanaxAdvice').innerHTML = '<strong style="color: var(--red);">⚔️ WAR IS LIVE!</strong>';
          clearInterval(warTimerInterval);
          return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').textContent = \`\${hours}h \${minutes}m \${seconds}s\`;
        
        // Xanax advice
        const hoursUntil = diff / (1000 * 60 * 60);
        let advice = '';
        
        if (hoursUntil > 5) {
          advice = \`💊 Take Xanax in <strong>\${(hoursUntil - 5).toFixed(1)} hours</strong> (5 hours before war)\`;
        } else if (hoursUntil > 1) {
          advice = '<strong style="color: var(--amber);">💊 TAKE XANAX NOW!</strong> You have ' + hoursUntil.toFixed(1) + ' hours to reach 1000E';
        } else if (hoursUntil > 0.25) {
          advice = '<strong style="color: var(--red);">⚡ FINAL PREP!</strong> Stack energy now!';
        } else {
          advice = '<strong style="color: var(--red);">🔥 WAR STARTING SOON!</strong>';
        }
        
        document.getElementById('xanaxAdvice').innerHTML = advice;
      }, 1000);
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
