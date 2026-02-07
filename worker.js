/**
 * TORN WAR BRIDGE + TACTICAL ADVISOR
 * Enhanced worker combining spy data management and combat intelligence
 */

import { combatIntelligence } from './combat-intelligence.js';

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
      // ==========================================
      // EXISTING SPY DATA ROUTES (UNCHANGED)
      // ==========================================
      
      // Route: List all spy data (your existing GET /)
      if (url.pathname === "/spy" && request.method === "GET") {
        return await handleSpyList(env, corsHeaders);
      }
      
      // Route: Save spy data (your existing POST /)
      if (url.pathname === "/spy" && request.method === "POST") {
        return await handleSpySave(request, env, corsHeaders);
      }
      
      // ==========================================
      // NEW TACTICAL ADVISOR ROUTES
      // ==========================================
      
      // Route: Tactical Advisor Web UI
      if (url.pathname === "/" || url.pathname === "/advisor") {
        return new Response(getAdvisorHTML(), {
          headers: { "Content-Type": "text/html;charset=UTF-8", ...corsHeaders }
        });
      }
      
      // Route: Analyze a specific target
      if (url.pathname === "/api/analyze" && request.method === "POST") {
        return await handleAnalyze(request, env, corsHeaders);
      }
      
      // Route: Get target data (from spy database)
      if (url.pathname === "/api/target" && request.method === "GET") {
        const targetId = url.searchParams.get('id');
        const fid = url.searchParams.get('fid') || 'global';
        return await handleGetTarget(targetId, fid, env, corsHeaders);
      }
      
      // Route: Calculate Xanax timer
      if (url.pathname === "/api/xanax-timer" && request.method === "POST") {
        return await handleXanaxTimer(request, env, corsHeaders);
      }
      
      // Route: Get weapon loadout recommendations
      if (url.pathname === "/api/loadout" && request.method === "POST") {
        return await handleLoadout(request, env, corsHeaders);
      }
      
      // Route: Health check
      if (url.pathname === "/health") {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          features: ['spy-data', 'tactical-advisor']
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
      
      // 404
      return new Response(JSON.stringify({ error: 'Not Found' }), { 
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};

// ==========================================
// EXISTING SPY DATA HANDLERS (UNCHANGED)
// ==========================================

async function handleSpyList(env, corsHeaders) {
  const list = await env.ROTATOR.list({ prefix: "spy_" });
  const results = {};
  
  for (const key of list.keys) {
    const data = await env.ROTATOR.get(key.name, { type: "json" });
    if (data) {
      const pid = key.name.split('_').pop(); 
      results[pid] = data;
    }
  }
  
  return new Response(
    JSON.stringify({ count: Object.keys(results).length, members: results }), 
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

async function handleSpySave(request, env, corsHeaders) {
  let body = await request.json();
  let targets = Array.isArray(body.spies) ? body.spies : [body];

  for (const t of targets) {
    const folder = t.fid || "global";
    const key = `spy_${folder}_${t.uid}`;
    await env.ROTATOR.put(key, JSON.stringify(t.data));
  }
  
  return new Response(
    JSON.stringify({ ok: true, count: targets.length }), 
    { headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// ==========================================
// NEW TACTICAL ADVISOR HANDLERS
// ==========================================

async function handleAnalyze(request, env, corsHeaders) {
  const body = await request.json();
  const { userStats, targetId, fid = 'global' } = body;
  
  if (!userStats || !targetId) {
    return new Response(JSON.stringify({ error: 'Missing userStats or targetId' }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  
  // Get target data from spy database
  const key = `spy_${fid}_${targetId}`;
  const targetData = await env.ROTATOR.get(key, { type: "json" });
  
  if (!targetData) {
    return new Response(JSON.stringify({ error: 'Target not found in spy database' }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  
  // Calculate combat analysis
  const analysis = combatIntelligence.generateCombatRecommendation(
    userStats,
    targetData.stats || targetData,
    {
      id: targetId,
      ffMultiplier: targetData.ff || targetData.fairfight || 1.0,
      respectValue: targetData.respect || 0,
      status: targetData.status || 'unknown'
    }
  );
  
  return new Response(JSON.stringify(analysis), {
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

async function handleGetTarget(targetId, fid, env, corsHeaders) {
  if (!targetId) {
    return new Response(JSON.stringify({ error: 'Missing target ID' }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  
  const key = `spy_${fid}_${targetId}`;
  const data = await env.ROTATOR.get(key, { type: "json" });
  
  if (!data) {
    return new Response(JSON.stringify({ error: 'Target not found' }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

async function handleXanaxTimer(request, env, corsHeaders) {
  const body = await request.json();
  const { warStartTime, currentEnergy = 150 } = body;
  
  if (!warStartTime) {
    return new Response(JSON.stringify({ error: 'Missing warStartTime' }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  
  const timerData = combatIntelligence.calculateXanaxTimer(warStartTime, currentEnergy);
  
  return new Response(JSON.stringify(timerData), {
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

async function handleLoadout(request, env, corsHeaders) {
  const body = await request.json();
  const { userStats, targetStats } = body;
  
  if (!userStats || !targetStats) {
    return new Response(JSON.stringify({ error: 'Missing userStats or targetStats' }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  
  const loadout = combatIntelligence.recommendWeaponLoadout(userStats, targetStats);
  
  return new Response(JSON.stringify(loadout), {
    headers: { "Content-Type": "application/json", ...corsHeaders }
  });
}

// ==========================================
// TACTICAL ADVISOR WEB UI (EMBEDDED HTML)
// ==========================================

function getAdvisorHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Torn Tactical Advisor</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Rajdhani:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'JetBrains Mono', monospace;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0f 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-family: 'Rajdhani', sans-serif;
      font-size: 48px;
      text-align: center;
      background: linear-gradient(135deg, #ff2b2b, #ff9d00, #00d2ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 4px;
      margin-bottom: 40px;
    }
    .card {
      background: linear-gradient(135deg, rgba(26, 26, 26, 0.8), rgba(42, 26, 42, 0.6));
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .card h2 {
      color: #ff9d00;
      font-size: 24px;
      margin-bottom: 20px;
      font-family: 'Rajdhani', sans-serif;
    }
    input, button {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      width: 100%;
      margin-bottom: 15px;
    }
    button {
      background: linear-gradient(135deg, #ff2b2b, #ff6b2b);
      border: none;
      cursor: pointer;
      font-weight: 600;
      letter-spacing: 1px;
      transition: all 0.3s ease;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 43, 43, 0.4);
    }
    .result {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin-top: 20px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
    .stat { text-align: center; }
    .stat-label { font-size: 10px; color: #888; margin-bottom: 5px; }
    .stat-value { font-size: 24px; font-weight: 700; }
    .success { color: #00ff9c; }
    .warning { color: #ff9d00; }
    .danger { color: #ff2b2b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TACTICAL ADVISOR</h1>
    
    <div class="card">
      <h2>🎯 Analyze Target</h2>
      <input type="number" id="targetId" placeholder="Target ID (e.g., 123456)">
      <input type="text" id="fid" placeholder="Faction ID (optional, default: global)" value="global">
      
      <h3 style="color: #00d2ff; font-size: 16px; margin: 20px 0 10px;">Your Stats:</h3>
      <div class="grid">
        <input type="number" id="strength" placeholder="Strength">
        <input type="number" id="defense" placeholder="Defense">
        <input type="number" id="speed" placeholder="Speed">
        <input type="number" id="dexterity" placeholder="Dexterity">
      </div>
      
      <button onclick="analyzeTarget()">ANALYZE TARGET</button>
      
      <div id="result"></div>
    </div>
    
    <div class="card">
      <h2>⏰ Xanax War Timer</h2>
      <input type="datetime-local" id="warTime" placeholder="War Start Time">
      <input type="number" id="currentEnergy" placeholder="Current Energy" value="150">
      <button onclick="calculateTimer()">CALCULATE TIMER</button>
      <div id="timerResult"></div>
    </div>
  </div>

  <script>
    async function analyzeTarget() {
      const targetId = document.getElementById('targetId').value;
      const fid = document.getElementById('fid').value || 'global';
      const userStats = {
        strength: parseInt(document.getElementById('strength').value) || 0,
        defense: parseInt(document.getElementById('defense').value) || 0,
        speed: parseInt(document.getElementById('speed').value) || 0,
        dexterity: parseInt(document.getElementById('dexterity').value) || 0
      };
      
      if (!targetId || userStats.strength === 0) {
        alert('Please enter target ID and your stats');
        return;
      }
      
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetId, fid, userStats })
        });
        
        const data = await response.json();
        
        if (data.error) {
          document.getElementById('result').innerHTML = \`<p class="danger">❌ \${data.error}</p>\`;
          return;
        }
        
        const verdictClass = data.verdict.action === 'RECOMMENDED' ? 'success' : 
                            data.verdict.action === 'ACCEPTABLE' ? 'warning' : 'danger';
        
        document.getElementById('result').innerHTML = \`
          <div class="result">
            <div class="grid">
              <div class="stat">
                <div class="stat-label">VERDICT</div>
                <div class="stat-value \${verdictClass}">\${data.verdict.action}</div>
              </div>
              <div class="stat">
                <div class="stat-label">WIN CHANCE</div>
                <div class="stat-value \${verdictClass}">\${(data.winProbability.probability * 100).toFixed(0)}%</div>
              </div>
              <div class="stat">
                <div class="stat-label">CONFIDENCE</div>
                <div class="stat-value">\${data.winProbability.confidence.toUpperCase()}</div>
              </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: rgba(0, 210, 255, 0.1); border: 1px solid #00d2ff; border-radius: 8px;">
              <strong>💡 Analysis:</strong><br>
              <pre style="white-space: pre-wrap; margin-top: 10px; font-size: 12px;">\${data.winProbability.reasoning}</pre>
            </div>
            <div style="margin-top: 15px;">
              <strong>🔫 Primary Weapon:</strong> \${data.weaponLoadouts.loadouts[0].weapon}<br>
              <small>\${data.weaponLoadouts.loadouts[0].why}</small>
            </div>
          </div>
        \`;
      } catch (error) {
        document.getElementById('result').innerHTML = \`<p class="danger">❌ Error: \${error.message}</p>\`;
      }
    }
    
    async function calculateTimer() {
      const warTime = document.getElementById('warTime').value;
      const currentEnergy = parseInt(document.getElementById('currentEnergy').value) || 150;
      
      if (!warTime) {
        alert('Please enter war start time');
        return;
      }
      
      try {
        const response = await fetch('/api/xanax-timer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            warStartTime: new Date(warTime).getTime(),
            currentEnergy 
          })
        });
        
        const data = await response.json();
        
        document.getElementById('timerResult').innerHTML = \`
          <div class="result">
            <div class="grid">
              <div class="stat">
                <div class="stat-label">TIME UNTIL WAR</div>
                <div class="stat-value warning">\${data.timeUntilWar}</div>
              </div>
              <div class="stat">
                <div class="stat-label">ENERGY NEEDED</div>
                <div class="stat-value danger">\${data.energyNeeded}</div>
              </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: rgba(255, 157, 0, 0.1); border: 1px solid #ff9d00; border-radius: 8px;">
              <strong>\${data.advice.action}</strong><br>
              <p style="margin-top: 10px; font-size: 13px;">\${data.advice.detail}</p>
            </div>
          </div>
        \`;
      } catch (error) {
        document.getElementById('timerResult').innerHTML = \`<p class="danger">❌ Error: \${error.message}</p>\`;
      }
    }
  </script>
</body>
</html>`;
}
