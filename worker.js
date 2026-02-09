/**
 * TORN TACTICAL ADVISOR - Complete with Combat Intelligence
 * Single file - everything embedded
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
      
      // TACTICAL ADVISOR ROUTES
      if (url.pathname === '/' || url.pathname === '/advisor') {
        return new Response(getUI(), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8', ...corsHeaders }
        });
      }
      
      // API: Analyze target
      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return await analyzeTarget(request, env, corsHeaders);
      }
      
      // API: Get target from spy database
      if (url.pathname === '/api/target' && request.method === 'GET') {
        const id = url.searchParams.get('id');
        const fid = url.searchParams.get('fid') || 'global';
        return await getTarget(id, fid, env, corsHeaders);
      }
      
      // API: Xanax timer
      if (url.pathname === '/api/xanax-timer' && request.method === 'POST') {
        return await xanaxTimer(request, env, corsHeaders);
      }
      
      // HEALTH CHECK
      if (url.pathname === '/health') {
        return jsonResponse({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          features: ['spy-database', 'combat-intelligence', 'xanax-timer']
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
// COMBAT INTELLIGENCE HANDLERS
// ==========================================

async function analyzeTarget(request, env, corsHeaders) {
  const { userStats, targetId, fid = 'global' } = await request.json();
  
  if (!userStats || !targetId) {
    return jsonResponse({ error: 'Missing userStats or targetId' }, corsHeaders, 400);
  }
  
  // Get target from spy database
  const key = `spy_${fid}_${targetId}`;
  const targetData = await env.ROTATOR.get(key, { type: 'json' });
  
  if (!targetData) {
    return jsonResponse({ error: 'Target not found in spy database' }, corsHeaders, 404);
  }
  
  // Calculate analysis
  const analysis = calculateCombatAnalysis(userStats, targetData);
  
  return jsonResponse(analysis, corsHeaders);
}

async function getTarget(id, fid, env, corsHeaders) {
  if (!id) {
    return jsonResponse({ error: 'Missing target ID' }, corsHeaders, 400);
  }
  
  const key = `spy_${fid}_${id}`;
  const data = await env.ROTATOR.get(key, { type: 'json' });
  
  if (!data) {
    return jsonResponse({ error: 'Target not found' }, corsHeaders, 404);
  }
  
  return jsonResponse(data, corsHeaders);
}

async function xanaxTimer(request, env, corsHeaders) {
  const { warStartTime, currentEnergy = 150 } = await request.json();
  
  if (!warStartTime) {
    return jsonResponse({ error: 'Missing warStartTime' }, corsHeaders, 400);
  }
  
  const timer = calculateXanaxTimer(warStartTime, currentEnergy);
  return jsonResponse(timer, corsHeaders);
}

// ==========================================
// COMBAT INTELLIGENCE ENGINE
// ==========================================

function calculateCombatAnalysis(userStats, targetData) {
  const targetStats = targetData.stats || targetData;
  const ffMultiplier = targetData.ff || targetData.fairfight || 1.0;
  
  // Calculate total stats
  const userTotal = userStats.strength + userStats.defense + userStats.speed + userStats.dexterity;
  const targetTotal = targetStats.strength + targetStats.defense + targetStats.speed + targetStats.dexterity;
  
  // Adjust for FF
  const effectiveUserStats = userTotal * ffMultiplier;
  const statRatio = effectiveUserStats / targetTotal;
  
  // Win probability
  let winProb;
  if (statRatio >= 2.0) winProb = 0.95;
  else if (statRatio >= 1.5) winProb = 0.85;
  else if (statRatio >= 1.2) winProb = 0.70;
  else if (statRatio >= 1.0) winProb = 0.55;
  else if (statRatio >= 0.8) winProb = 0.35;
  else winProb = 0.15;
  
  const confidence = winProb >= 0.85 ? 'high' : winProb >= 0.60 ? 'medium' : 'low';
  
  // Verdict
  let verdict, verdictColor;
  if (winProb >= 0.85) {
    verdict = 'RECOMMENDED';
    verdictColor = '#00ff9c';
  } else if (winProb >= 0.6) {
    verdict = 'ACCEPTABLE';
    verdictColor = '#ff9d00';
  } else if (winProb >= 0.4) {
    verdict = 'RISKY';
    verdictColor = '#00d2ff';
  } else {
    verdict = 'AVOID';
    verdictColor = '#ff2b2b';
  }
  
  // Reasoning
  const advantage = ((statRatio - 1) * 100).toFixed(1);
  let reasoning;
  
  if (statRatio >= 1.5) {
    reasoning = `You have a ${advantage}% stat advantage. Combined with your FF multiplier of ${ffMultiplier}x, you have strong dominance. Your effective stats are ${statRatio.toFixed(2)}x their total.

💡 Why this works: In Torn combat, a 50%+ stat advantage typically means you'll win 3-5 rounds faster, taking minimal damage.`;
  } else if (statRatio >= 1.2) {
    reasoning = `You have a ${advantage}% stat advantage with ${ffMultiplier}x FF multiplier. This is a solid edge but not overwhelming.

💡 Strategy tip: Use temporary weapons or boosters to maximize this advantage and ensure victory.`;
  } else if (statRatio >= 1.0) {
    reasoning = `Nearly even match with slight ${advantage}% advantage. Your FF multiplier (${ffMultiplier}x) helps but this could go either way.

⚠️ Risk: With close stats, weapon choice and RNG matter more. Consider if the respect reward justifies the risk.`;
  } else {
    const disadvantage = ((1 - statRatio) * 100).toFixed(1);
    reasoning = `You're at a ${disadvantage}% stat disadvantage. Even with FF ${ffMultiplier}x, they have the edge.

❌ Not recommended: High chance of hospitalization. Save your energy for better targets.`;
  }
  
  // Weapon recommendation
  const targetStatBreakdown = {
    strength: targetStats.strength / targetTotal,
    defense: targetStats.defense / targetTotal,
    speed: targetStats.speed / targetTotal,
    dexterity: targetStats.dexterity / targetTotal
  };
  
  const weakestStat = Object.entries(targetStatBreakdown).reduce((a, b) => a[1] < b[1] ? a : b)[0];
  
  let primaryWeapon, weaponReason;
  if (weakestStat === 'defense') {
    primaryWeapon = 'Rifle';
    weaponReason = `Their defense (${(targetStatBreakdown.defense * 100).toFixed(0)}% of stats) is weakest. Rifles deal high damage that penetrates low defense.`;
  } else if (weakestStat === 'speed') {
    primaryWeapon = 'SMG';
    weaponReason = `They're slow (${(targetStatBreakdown.speed * 100).toFixed(0)}% of stats). SMGs attack faster, landing more hits before they can react.`;
  } else if (weakestStat === 'strength') {
    primaryWeapon = 'Shotgun';
    weaponReason = `Low strength (${(targetStatBreakdown.strength * 100).toFixed(0)}% of stats). Shotguns overwhelm weak opponents with massive burst damage.`;
  } else {
    primaryWeapon = 'Pistol';
    weaponReason = `Balanced stats. Pistol offers reliable all-around performance.`;
  }
  
  return {
    verdict: {
      action: verdict,
      color: verdictColor,
      confidence
    },
    winProbability: {
      probability: winProb,
      confidence,
      statRatio,
      reasoning
    },
    weapon: {
      primary: primaryWeapon,
      reason: weaponReason
    }
  };
}

function calculateXanaxTimer(warStartTime, currentEnergy) {
  const warStart = new Date(warStartTime).getTime();
  const now = Date.now();
  const timeUntilWar = warStart - now;
  
  const energyNeeded = 1000 - currentEnergy;
  const minutesNeeded = energyNeeded * 5;
  
  const formatTime = (ms) => {
    if (ms < 0) return 'War has started!';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  const hours = timeUntilWar / (1000 * 60 * 60);
  let advice;
  
  if (currentEnergy >= 1000) {
    advice = {
      action: '✅ Ready for War',
      detail: `You're at max energy! Don't attack anyone before war starts.`
    };
  } else if (hours > 5) {
    advice = {
      action: '⏳ Wait to Take Xanax',
      detail: `War is ${hours.toFixed(1)} hours away. Take Xanax about 5 hours before war.`
    };
  } else if (hours <= 5 && hours > 1) {
    advice = {
      action: '💊 Take Xanax Soon',
      detail: `You need ${energyNeeded} energy, which takes ${(energyNeeded / 12).toFixed(1)} hours. Take Xanax now!`
    };
  } else {
    advice = {
      action: '🚨 TAKE XANAX NOW',
      detail: `War starts in less than an hour! Take Xanax immediately!`
    };
  }
  
  return {
    warStartTime: new Date(warStart),
    currentEnergy,
    targetEnergy: 1000,
    energyNeeded,
    timeUntilWar: formatTime(timeUntilWar),
    advice
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
    .container { max-width: 1000px; margin: 0 auto; }
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
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .status {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 255, 156, 0.2);
      border: 1px solid #00ff9c;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 600;
    }
    .result {
      margin-top: 20px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .success { color: #00ff9c; }
    .warning { color: #ff9d00; }
    .danger { color: #ff2b2b; }
    .info { color: #00d2ff; }
    pre { white-space: pre-wrap; font-size: 12px; line-height: 1.6; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="status">🟢 ONLINE</div>
  
  <div class="container">
    <h1>Tactical Advisor</h1>
    
    <div class="card">
      <h2>🎯 Analyze Target</h2>
      <input type="number" id="targetId" placeholder="Target ID (e.g., 2864818)">
      <input type="text" id="fid" placeholder="Faction ID (default: global)" value="global">
      
      <h3 style="color: #00d2ff; font-size: 14px; margin: 15px 0 10px;">Your Stats:</h3>
      <div class="grid">
        <input type="number" id="strength" placeholder="Strength">
        <input type="number" id="defense" placeholder="Defense">
        <input type="number" id="speed" placeholder="Speed">
        <input type="number" id="dexterity" placeholder="Dexterity">
      </div>
      
      <button onclick="analyzeTarget()">Analyze Target</button>
      <div id="analyzeResult"></div>
    </div>
    
    <div class="card">
      <h2>⏰ Xanax War Timer</h2>
      <input type="datetime-local" id="warTime">
      <input type="number" id="currentEnergy" placeholder="Current Energy" value="150">
      <button onclick="calculateTimer()">Calculate Timer</button>
      <div id="timerResult"></div>
    </div>
    
    <div class="card">
      <h2>📊 Spy Database</h2>
      <button onclick="checkSpyData()">View Spy Data</button>
      <div id="spyResult"></div>
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
          document.getElementById('analyzeResult').innerHTML = \`<p class="danger">❌ \${data.error}</p>\`;
          return;
        }
        
        const verdictClass = data.verdict.action === 'RECOMMENDED' ? 'success' : 
                            data.verdict.action === 'ACCEPTABLE' ? 'warning' : 'danger';
        
        document.getElementById('analyzeResult').innerHTML = \`
          <div class="result">
            <h3 class="\${verdictClass}">\${data.verdict.action}</h3>
            <p><strong>Win Chance:</strong> <span class="\${verdictClass}">\${(data.winProbability.probability * 100).toFixed(0)}%</span></p>
            <p><strong>Confidence:</strong> \${data.winProbability.confidence}</p>
            <p><strong>Stat Ratio:</strong> \${data.winProbability.statRatio.toFixed(2)}x</p>
            
            <div style="margin-top: 15px; padding: 15px; background: rgba(0, 210, 255, 0.1); border-radius: 8px;">
              <strong>💡 Analysis:</strong>
              <pre>\${data.winProbability.reasoning}</pre>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: rgba(255, 157, 0, 0.1); border-radius: 8px;">
              <strong>🔫 Recommended Weapon:</strong> \${data.weapon.primary}<br>
              <small>\${data.weapon.reason}</small>
            </div>
          </div>
        \`;
      } catch (error) {
        document.getElementById('analyzeResult').innerHTML = \`<p class="danger">❌ Error: \${error.message}</p>\`;
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
            <p><strong>Time Until War:</strong> <span class="warning">\${data.timeUntilWar}</span></p>
            <p><strong>Current Energy:</strong> \${data.currentEnergy}/1000</p>
            <p><strong>Energy Needed:</strong> <span class="danger">\${data.energyNeeded}</span></p>
            
            <div style="margin-top: 15px; padding: 15px; background: rgba(255, 157, 0, 0.1); border-radius: 8px;">
              <strong>\${data.advice.action}</strong><br>
              <p style="margin-top: 10px;">\${data.advice.detail}</p>
            </div>
          </div>
        \`;
      } catch (error) {
        document.getElementById('timerResult').innerHTML = \`<p class="danger">❌ Error: \${error.message}</p>\`;
      }
    }
    
    async function checkSpyData() {
      try {
        const response = await fetch('/spy');
        const data = await response.json();
        
        document.getElementById('spyResult').innerHTML = \`
          <div class="result">
            <p><strong>Total Spies:</strong> <span class="success">\${data.count}</span></p>
            \${data.count > 0 ? '<pre>' + JSON.stringify(data.members, null, 2) + '</pre>' : '<p style="margin-top: 15px; color: #888;">No spy data yet.</p>'}
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
