// TORN WAR COMMAND CENTER v2.0
// Complete rebuild with all 9 modules

const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx';

// ==========================================
// BACKEND API
// ==========================================

function jsonResponse(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...headers
    }
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    if (url.pathname === '/') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (url.pathname === '/api/get-user' && request.method === 'POST') {
      const body = await request.json();
      const uid = body.uid;
      
      const res = await fetch(`https://api.torn.com/user/${uid}?selections=profile,battlestats&key=${SC_KEY}`);
      const data = await res.json();
      
      const modifiers = {
        strength: (data.strength_modifier || 0) + (data.strength_info?.[2] || 0),
        defense: (data.defense_modifier || 0) + (data.defense_info?.[2] || 0),
        speed: (data.speed_modifier || 0) + (data.speed_info?.[2] || 0),
        dexterity: (data.dexterity_modifier || 0) + (data.dexterity_info?.[2] || 0)
      };
      
      const effectiveStats = {
        strength: data.strength * (1 + modifiers.strength / 100),
        defense: data.defense * (1 + modifiers.defense / 100),
        speed: data.speed * (1 + modifiers.speed / 100),
        dexterity: data.dexterity * (1 + modifiers.dexterity / 100)
      };
      
      const total = effectiveStats.strength + effectiveStats.defense + effectiveStats.speed + effectiveStats.dexterity;
      
      return jsonResponse({
        name: data.name,
        level: data.level,
        total,
        ...effectiveStats
      });
    }
    
    if (url.pathname === '/api/get-faction' && request.method === 'POST') {
      const body = await request.json();
      const fid = body.fid;
      
      const res = await fetch(`https://api.torn.com/faction/${fid}?selections=basic&key=${SC_KEY}`);
      const data = await res.json();
      
      return jsonResponse({
        name: data.name,
        members: Object.values(data.members).map(m => ({
          id: m.id || m.player_id,
          name: m.name,
          level: m.level,
          status: m.status?.state || 'Unknown'
        }))
      });
    }
    
    if (url.pathname === '/api/get-scouter-batch' && request.method === 'POST') {
      const body = await request.json();
      const targets = body.targets;
      const uid = body.uid;
      
      const targetsCsv = targets.join(',');
      const scUrl = `https://ffscouter.com/api/v1/get-stats?key=${SC_KEY}&targets=${targetsCsv}&user_id=${uid}`;
      
      const res = await fetch(scUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      return jsonResponse(data);
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// ==========================================
// HTML FRONTEND
// ==========================================

function getHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TORN War Command Center</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --bg: #0a0e1a;
      --panel: #12182b;
      --card: #1a2236;
      --border: #2a3550;
      --text: #e8edf4;
      --text-dim: #8b95ab;
      --green: #00ff88;
      --amber: #ffaa00;
      --blue: #00aaff;
      --red: #ff4466;
      --cyan: #00ddff;
      --purple: #aa66ff;
    }
    
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container { max-width: 1400px; margin: 0 auto; }
    
    /* HEADER */
    .header {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      font-family: 'Orbitron', monospace;
      color: var(--cyan);
    }
    
    /* INIT SCREEN */
    .init-screen {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px;
      text-align: center;
      max-width: 500px;
      margin: 100px auto;
    }
    
    .init-screen h2 {
      font-size: 20px;
      margin-bottom: 20px;
      color: var(--cyan);
    }
    
    .init-screen input {
      width: 100%;
      padding: 12px;
      margin: 10px 0;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      font-size: 14px;
    }
    
    .init-screen button {
      width: 100%;
      padding: 14px;
      margin-top: 20px;
      background: var(--cyan);
      color: var(--bg);
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .init-screen button:hover {
      background: var(--blue);
      transform: translateY(-2px);
    }
    
    /* WAR VERDICT */
    .war-verdict {
      background: var(--card);
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .war-verdict .label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: var(--text-dim);
      margin-bottom: 8px;
    }
    
    .war-verdict .verdict {
      font-size: 28px;
      font-weight: 700;
      font-family: 'Orbitron', monospace;
      margin-bottom: 8px;
    }
    
    .war-verdict .desc {
      font-size: 13px;
      color: var(--text-dim);
    }
    
    /* MAIN GRID */
    .main-grid {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    /* MEMBER LIST */
    .member-list-panel {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      height: fit-content;
      max-height: 600px;
      display: flex;
      flex-direction: column;
    }
    
    .member-list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    
    .member-list-header h3 {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .member-count {
      font-size: 12px;
      color: var(--text-dim);
    }
    
    .toggles {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    
    .toggle {
      padding: 6px 12px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .toggle.active {
      background: var(--cyan);
      color: var(--bg);
      border-color: var(--cyan);
    }
    
    .member-list {
      flex: 1;
      overflow-y: auto;
    }
    
    .member-card {
      background: var(--panel);
      border: 1px solid var(--border);
      border-left: 3px solid var(--green);
      padding: 8px 10px;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 12px;
    }
    
    .member-card .name {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 4px;
    }
    
    .member-card .stats {
      color: var(--text-dim);
      font-size: 11px;
    }
    
    /* MODULE TILES */
    .module-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    
    .module-tile {
      background: var(--card);
      border: 1px solid var(--border);
      border-left: 3px solid var(--cyan);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 140px;
      display: flex;
      flex-direction: column;
    }
    
    .module-tile:hover {
      background: var(--panel);
      transform: translateY(-4px);
      border-left-width: 4px;
    }
    
    .module-icon {
      font-size: 32px;
      margin-bottom: 12px;
    }
    
    .module-title {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .module-desc {
      font-size: 12px;
      color: var(--text-dim);
      flex: 1;
    }
    
    .module-stats {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }
    
    .module-stat {
      flex: 1;
    }
    
    .module-stat .label {
      font-size: 10px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .module-stat .value {
      font-size: 18px;
      font-weight: 700;
      margin-top: 4px;
    }
    
    /* BACK BUTTON */
    .back-btn {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 20px;
      display: inline-block;
      transition: all 0.2s;
    }
    
    .back-btn:hover {
      background: var(--panel);
      border-color: var(--cyan);
    }
    
    /* VIEW TITLE */
    .view-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 20px;
      color: var(--cyan);
      font-family: 'Orbitron', monospace;
    }
    
    /* TARGET CARDS */
    .target-grid {
      display: grid;
      gap: 12px;
    }
    
    .target-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-left: 3px solid var(--green);
      border-radius: 8px;
      padding: 16px;
    }
    
    .target-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .target-name {
      font-size: 15px;
      font-weight: 700;
    }
    
    .target-ff {
      font-size: 14px;
      font-weight: 700;
    }
    
    .target-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-dim);
    }
    
    .target-meta span strong {
      color: var(--text);
      font-weight: 600;
    }
    
    /* PLACEHOLDER */
    .placeholder {
      background: var(--card);
      border: 2px dashed var(--border);
      border-radius: 12px;
      padding: 60px 40px;
      text-align: center;
    }
    
    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .placeholder h3 {
      font-size: 18px;
      margin-bottom: 8px;
      color: var(--cyan);
    }
    
    .placeholder p {
      color: var(--text-dim);
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- HEADER -->
    <div class="header">
      <h1>🎯 TORN WAR COMMAND CENTER</h1>
      <div style="font-size: 12px; color: var(--text-dim);">v2.0</div>
    </div>
    
    <!-- INIT SCREEN -->
    <div id="initScreen" class="init-screen">
      <h2>Initialize Command Center</h2>
      <input type="text" id="uidInput" placeholder="Your User ID" />
      <input type="text" id="fidInput" placeholder="Enemy Faction ID" />
      <div id="initStatus" style="margin-top: 16px; font-size: 13px; color: var(--text-dim);"></div>
      <button onclick="initializeScan()">START TACTICAL SCAN</button>
    </div>
    
    <!-- MAIN DASHBOARD -->
    <div id="dashboardView" style="display: none;">
      
      <!-- User Info Panel -->
      <div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 12px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
        <div style="font-weight: 600;"><span id="userName">-</span></div>
        <div style="color: var(--text-dim);">FF: <span style="color: var(--cyan); font-weight: 600;" id="userFF">-</span></div>
        <div style="color: var(--text-dim);">Scouter: <span style="color: var(--amber); font-weight: 600;" id="scouterStats">-</span></div>
        <div style="color: var(--text-dim);">Torn: <span style="color: var(--green); font-weight: 600;" id="tornStats">-</span></div>
        <div style="color: var(--text-dim);">Effective: <span style="color: var(--cyan); font-weight: 600;" id="effectiveStats">-</span></div>
      </div>
      
      <!-- Main Grid -->
      <div class="main-grid">
        
        <!-- Member List -->
        <div class="member-list-panel">
          <div class="member-list-header">
            <h3 id="factionName">Faction</h3>
            <div class="member-count"><span id="memberCount">0</span> members</div>
          </div>
          
          <div class="toggles">
            <div class="toggle active" onclick="toggleFilter('all')">All</div>
            <div class="toggle" onclick="toggleFilter('hosp')">🏥 Hosp</div>
            <div class="toggle" onclick="toggleFilter('travel')">✈️ Travel</div>
            <div class="toggle" onclick="toggleFilter('offline')">🔴 Offline</div>
          </div>
          
          <div class="member-list" id="memberList"></div>
        </div>
        
        <!-- Module Tiles -->
        <div class="module-grid">
          
          <!-- 1. Target Intelligence -->
          <div class="module-tile" style="border-left-color: var(--green);" onclick="showModule('targets')">
            <div class="module-icon">🎯</div>
            <div class="module-title">Target Intelligence</div>
            <div class="module-desc">Categorized enemies by difficulty</div>
            <div class="module-stats">
              <div class="module-stat">
                <div class="label">Beatable</div>
                <div class="value" style="color: var(--green);" id="beatableCount">0</div>
              </div>
              <div class="module-stat">
                <div class="label">Respect</div>
                <div class="value" style="color: var(--cyan);" id="totalRespect">0</div>
              </div>
            </div>
          </div>
          
          <!-- 2. Chain Tracker -->
          <div class="module-tile" style="border-left-color: var(--amber);" onclick="showModule('chain')">
            <div class="module-icon">⛓️</div>
            <div class="module-title">Chain Tracker</div>
            <div class="module-desc">Monitor chain progress & timeouts</div>
          </div>
          
          <!-- 3. War Planning -->
          <div class="module-tile" style="border-left-color: var(--red);" onclick="showModule('warplan')">
            <div class="module-icon">⚔️</div>
            <div class="module-title">War Planning</div>
            <div class="module-desc">Xanax timing & energy management</div>
          </div>
          
          <!-- 4. Armory Tracking -->
          <div class="module-tile" style="border-left-color: var(--purple);" onclick="showModule('armory')">
            <div class="module-icon">📦</div>
            <div class="module-title">Armory Tracking</div>
            <div class="module-desc">Item usage & efficiency monitoring</div>
          </div>
          
          <!-- 5. Member Status -->
          <div class="module-tile" style="border-left-color: var(--blue);" onclick="showModule('status')">
            <div class="module-icon">👥</div>
            <div class="module-title">Member Status</div>
            <div class="module-desc">Hospital, travel, online tracking</div>
          </div>
          
          <!-- 6. Battle Advice -->
          <div class="module-tile" style="border-left-color: var(--cyan);" onclick="showModule('advice')">
            <div class="module-icon">🎓</div>
            <div class="module-title">Battle Advice</div>
            <div class="module-desc">Real-time tactical recommendations</div>
          </div>
          
          <!-- 7. War Analytics -->
          <div class="module-tile" style="border-left-color: var(--green);" onclick="showModule('analytics')">
            <div class="module-icon">📊</div>
            <div class="module-title">War Analytics</div>
            <div class="module-desc">Performance & contribution tracking</div>
          </div>
          
          <!-- 8. Combat Advisor -->
          <div class="module-tile" style="border-left-color: var(--amber);" onclick="showModule('combat')">
            <div class="module-icon">⚔️</div>
            <div class="module-title">Combat Advisor</div>
            <div class="module-desc">Weapon & loadout recommendations</div>
          </div>
          
          <!-- 9. Growth Advisor -->
          <div class="module-tile" style="border-left-color: var(--purple);" onclick="showModule('growth')">
            <div class="module-icon">📈</div>
            <div class="module-title">Growth Advisor</div>
            <div class="module-desc">Monthly goals & task tracking</div>
          </div>
          
        </div>
      </div>
    </div>
    
    <!-- TARGET INTELLIGENCE MODULE -->
    <div id="targetModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">Target Intelligence</h2>
      
      <!-- War Verdict Panel -->
      <div style="background: var(--card); border: 2px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
        <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Command Verdict</div>
        <div style="font-size: 32px; font-weight: 700; font-family: 'Orbitron', monospace; margin-bottom: 8px;" id="warVerdict">-</div>
        <div style="font-size: 13px; color: var(--text-dim); margin-bottom: 20px;" id="verdictAdvice">-</div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 20px; background: var(--panel); border-radius: 8px; margin-bottom: 20px;">
          <div style="text-align: center;">
            <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">20-Hit Est.</div>
            <div style="font-size: 28px; font-weight: 700; color: var(--green);" id="twentyHitEst">0</div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">RESPECT</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Gap Analysis</div>
            <div style="font-size: 28px; font-weight: 700; color: var(--red);" id="gapAnalysis">0</div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">WASTED HITS</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Efficiency</div>
            <div style="font-size: 28px; font-weight: 700; color: var(--amber);" id="efficiency">0</div>
            <div style="font-size: 11px; color: var(--text-dim); margin-top: 4px;">AVG / HIT</div>
          </div>
        </div>
      </div>
      
      <!-- Category Tiles -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
        
        <div style="background: var(--card); border: 1px solid var(--border); border-top: 3px solid var(--amber); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;" onclick="showCategory('safe')">
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">SAFE</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Targets</div>
              <div style="font-size: 24px; font-weight: 700; color: var(--amber);" id="safeTargets">0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Sim Hits</div>
              <div style="font-size: 24px; font-weight: 700;" id="safeSimHits">0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Est. Resp</div>
              <div style="font-size: 18px; font-weight: 700;" id="safeResp">0.0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Avg/Hit</div>
              <div style="font-size: 18px; font-weight: 700;" id="safeAvg">0.00</div>
            </div>
          </div>
        </div>
        
        <div style="background: var(--card); border: 1px solid var(--border); border-top: 3px solid var(--green); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;" onclick="showCategory('prime')">
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">PRIME</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Targets</div>
              <div style="font-size: 24px; font-weight: 700; color: var(--green);" id="primeTargets">0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Sim Hits</div>
              <div style="font-size: 24px; font-weight: 700;" id="primeSimHits">0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Est. Resp</div>
              <div style="font-size: 18px; font-weight: 700;" id="primeResp">0.0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Avg/Hit</div>
              <div style="font-size: 18px; font-weight: 700;" id="primeAvg">0.00</div>
            </div>
          </div>
        </div>
        
        <div style="background: var(--card); border: 1px solid var(--border); border-top: 3px solid var(--blue); border-radius: 12px; padding: 20px; cursor: pointer; transition: all 0.2s;" onclick="showCategory('risky')">
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">RISKY</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Targets</div>
              <div style="font-size: 24px; font-weight: 700; color: var(--blue);" id="riskyTargets">0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Sim Hits</div>
              <div style="font-size: 24px; font-weight: 700;" id="riskySimHits">0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Est. Resp</div>
              <div style="font-size: 18px; font-weight: 700;" id="riskyResp">0.0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Avg/Hit</div>
              <div style="font-size: 18px; font-weight: 700;" id="riskyAvg">0.00</div>
            </div>
          </div>
        </div>
        
        <div style="background: var(--card); border: 1px solid var(--border); border-top: 3px solid var(--red); border-radius: 12px; padding: 20px;">
          <div style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">SUICIDE</div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Targets</div>
              <div style="font-size: 24px; font-weight: 700; color: var(--red);" id="suicideTargets">0</div>
            </div>
            <div>
              <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase;">Status</div>
              <div style="font-size: 14px; font-weight: 700; color: var(--red); margin-top: 8px;">NOT VIABLE</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
    
    <!-- CATEGORY VIEW -->
    <div id="categoryView" style="display: none;">
      <button class="back-btn" onclick="showModule('targets')">← Back to Target Intelligence</button>
      <h2 class="view-title" id="categoryTitle">Targets</h2>
      <div class="target-grid" id="targetList"></div>
    </div>
    
    <!-- PLACEHOLDER MODULES -->
    <div id="chainModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">Chain Tracker</h2>
      <div class="placeholder">
        <div class="placeholder-icon">⛓️</div>
        <h3>Chain Tracker Coming Soon</h3>
        <p>Live chain monitoring, bonus hit predictor, timeout warnings</p>
      </div>
    </div>
    
    <div id="warplanModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">War Planning</h2>
      <div class="placeholder">
        <div class="placeholder-icon">⚔️</div>
        <h3>War Planning Coming Soon</h3>
        <p>Xanax countdown, energy tracker, war preparation checklist</p>
      </div>
    </div>
    
    <div id="armoryModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">Armory Tracking</h2>
      <div class="placeholder">
        <div class="placeholder-icon">📦</div>
        <h3>Armory Tracking Coming Soon</h3>
        <p>Xanax/attack ratios, med usage, efficiency monitoring</p>
      </div>
    </div>
    
    <div id="statusModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">Member Status</h2>
      <div class="placeholder">
        <div class="placeholder-icon">👥</div>
        <h3>Member Status Coming Soon</h3>
        <p>Hospital timers, travel tracking, online/offline status</p>
      </div>
    </div>
    
    <div id="adviceModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">Battle Advice</h2>
      <div class="placeholder">
        <div class="placeholder-icon">🎓</div>
        <h3>Battle Advice Coming Soon</h3>
        <p>Retaliation alerts, overseas targets, chain bonus notifications</p>
      </div>
    </div>
    
    <div id="analyticsModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">War Analytics</h2>
      <div class="placeholder">
        <div class="placeholder-icon">📊</div>
        <h3>War Analytics Coming Soon</h3>
        <p>Respect contributions, hit tracking, performance metrics</p>
      </div>
    </div>
    
    <div id="combatModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">Combat Advisor</h2>
      <div class="placeholder">
        <div class="placeholder-icon">⚔️</div>
        <h3>Combat Advisor Coming Soon</h3>
        <p>Weapon loadout presets, target-specific recommendations</p>
      </div>
    </div>
    
    <div id="growthModule" style="display: none;">
      <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
      <h2 class="view-title">Growth Advisor</h2>
      <div class="placeholder">
        <div class="placeholder-icon">📈</div>
        <h3>Growth Advisor Coming Soon</h3>
        <p>Monthly goals, daily tasks, progress tracking</p>
      </div>
    </div>
    
  </div>
  
  <script>
    let SESSION = {
      uid: null,
      fid: null,
      myStats: 0,
      targets: [],
      currentFilter: 'all',
      stats: {
        total: 0,
        beatable: 0,
        respect: 0
      }
    };
    
    function formatStats(num) {
      if (!num || num === null || isNaN(num)) return '0';
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toFixed(0);
    }
    
    async function initializeScan() {
      try {
        const uid = parseInt(document.getElementById('uidInput').value);
        const fid = parseInt(document.getElementById('fidInput').value);
        
        if (!uid || !fid) {
          alert('Please enter both User ID and Faction ID');
          return;
        }
        
        SESSION.uid = uid;
        SESSION.fid = fid;
        
        document.getElementById('initStatus').innerHTML = '<div style="color: var(--cyan);">Scanning faction...</div>';
        
        // Get user stats
        const userRes = await fetch('/api/get-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid })
        });
        const userData = await userRes.json();
        SESSION.myStats = userData.total;
        SESSION.myTornStats = userData.total;
        SESSION.userName = userData.name;
        SESSION.userLevel = userData.level;
        
        // Get user's FF Scouter stats
        const userScouterRes = await fetch('/api/get-scouter-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targets: [uid],
            uid: uid
          })
        });
        const userScouterData = await userScouterRes.json();
        const scouterInfo = (userScouterData.data || userScouterData || [])[0];
        SESSION.myScouterStats = scouterInfo?.bs_estimate || userData.total;
        SESSION.myFF = scouterInfo?.fair_fight || 1.0;
        
        // Get faction
        const factionRes = await fetch('/api/get-faction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fid })
        });
        const factionData = await factionRes.json();
        SESSION.factionName = factionData.name;
        
        await processTargets(factionData.members.filter(m => m.id !== uid));
        
        // Update top panel
        document.getElementById('userName').textContent = SESSION.userName;
        document.getElementById('userFF').textContent = SESSION.myFF.toFixed(2) + 'x';
        document.getElementById('scouterStats').textContent = formatStats(SESSION.myScouterStats);
        document.getElementById('tornStats').textContent = formatStats(SESSION.myTornStats);
        document.getElementById('effectiveStats').textContent = formatStats(SESSION.myStats);
        document.getElementById('factionName').textContent = SESSION.factionName;
        
        document.getElementById('initScreen').style.display = 'none';
        document.getElementById('dashboardView').style.display = 'block';
        
      } catch (error) {
        console.error('Init error:', error);
        document.getElementById('initStatus').innerHTML = '<div style="color: var(--red);">Error: ' + error.message + '</div>';
      }
    }
    
    async function processTargets(members) {
      SESSION.targets = [];
      
      const chunks = [];
      for (let i = 0; i < members.length; i += 100) {
        chunks.push(members.slice(i, i + 100));
      }
      
      for (const chunk of chunks) {
        const res = await fetch('/api/get-scouter-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targets: chunk.map(m => m.id),
            uid: SESSION.uid
          })
        });
        const data = await res.json();
        
        // Handle different response formats
        const scouterData = data.data || data || [];
        
        chunk.forEach((member, idx) => {
          const sc = scouterData[idx] || { fair_fight: 1.0, bs_estimate: 0 };
          const ff = Number(sc.fair_fight) || 1.0;
          const total = Number(sc.bs_estimate) || 0;
          
          const winChance = calculateWinChance(SESSION.myStats, total);
          const respect = calculateRespect(ff, member.level);
          
          let tier;
          if (ff < 1.8) tier = 'amber';
          else if (ff < 4.2) tier = 'green';
          else if (ff < 5.2) tier = 'blue';
          else tier = 'red';
          
          SESSION.targets.push({
            ...member,
            ff,
            total,
            tier,
            winChance,
            respect
          });
        });
      }
      
      calculateStats();
      updateDashboard();
    }
    
    function calculateWinChance(myStats, enemyStats) {
      if (enemyStats === 0) return 50;
      const ratio = myStats / enemyStats;
      if (ratio >= 3.0) return 98;
      if (ratio >= 2.0) return 95;
      if (ratio >= 1.5) return 85;
      if (ratio >= 1.2) return 70;
      if (ratio >= 1.0) return 55;
      if (ratio >= 0.8) return 35;
      if (ratio >= 0.6) return 20;
      return 10;
    }
    
    function calculateRespect(ff, level = 50) {
      const levelRespect = 1.0 + ((level - 1) / 100) * 0.5;
      const baseRespect = levelRespect * ff;
      const warRespect = baseRespect * 2;
      const finalRespect = warRespect * 1.16;
      return Math.round(finalRespect * 10) / 10;
    }
    
    function calculateStats() {
      SESSION.stats.total = SESSION.targets.length;
      SESSION.stats.beatable = SESSION.targets.filter(t => t.winChance >= 50).length;
      SESSION.stats.respect = SESSION.targets.filter(t => t.winChance >= 50).reduce((sum, t) => sum + t.respect, 0);
    }
    
    function updateDashboard() {
      document.getElementById('beatableCount').textContent = SESSION.stats.beatable;
      document.getElementById('totalRespect').textContent = formatStats(SESSION.stats.respect);
      document.getElementById('memberCount').textContent = SESSION.stats.total;
      
      renderMemberList();
      updateCategoryCounts();
    }
    
    function updateWarVerdict() {
      const beatable = SESSION.targets.filter(t => t.winChance >= 50);
      const sorted = beatable.sort((a, b) => b.respect - a.respect);
      const top20 = sorted.slice(0, 20);
      const twentyHitEst = top20.reduce((sum, t) => sum + t.respect, 0);
      const wastedHits = SESSION.targets.filter(t => t.winChance < 50).length;
      const avgPerHit = beatable.length > 0 ? twentyHitEst / Math.min(beatable.length, 20) : 0;
      
      document.getElementById('twentyHitEst').textContent = twentyHitEst.toFixed(1);
      document.getElementById('gapAnalysis').textContent = wastedHits;
      document.getElementById('efficiency').textContent = avgPerHit.toFixed(2);
      
      let verdict, color, advice;
      if (twentyHitEst >= 200) {
        verdict = 'EXCELLENT RANK WAR';
        color = 'var(--cyan)';
        advice = 'Strong target pool - focus on Prime targets for maximum efficiency';
      } else if (twentyHitEst >= 160) {
        verdict = 'MODERATE RANK WAR';
        color = 'var(--amber)';
        advice = 'Decent matchup - prioritize high FF targets and avoid wasted hits';
      } else {
        verdict = 'POOR RANK WAR';
        color = 'var(--red)';
        advice = 'Challenging war - coordinate group attacks and focus only on Safe/Prime categories';
      }
      
      document.getElementById('warVerdict').textContent = verdict;
      document.getElementById('warVerdict').style.color = color;
      document.getElementById('verdictAdvice').textContent = advice;
    }
    
    function renderMemberList() {
      const sorted = [...SESSION.targets].sort((a, b) => b.respect - a.respect);
      const tierColors = { amber: 'var(--amber)', green: 'var(--green)', blue: 'var(--blue)', red: 'var(--red)' };
      
      const html = sorted.map(t => \`
        <div class="member-card" style="border-left-color: \${tierColors[t.tier]};">
          <div class="name">\${t.name}</div>
          <div class="stats">L\${t.level} • FF \${t.ff.toFixed(2)}x • \${t.winChance}% win</div>
        </div>
      \`).join('');
      
      document.getElementById('memberList').innerHTML = html;
    }
    
    function updateCategoryCounts() {
      const safe = SESSION.targets.filter(t => t.tier === 'amber' && t.winChance >= 50);
      const prime = SESSION.targets.filter(t => t.tier === 'green' && t.winChance >= 50);
      const risky = SESSION.targets.filter(t => t.tier === 'blue' && t.winChance >= 50);
      const suicide = SESSION.targets.filter(t => t.tier === 'red');
      
      // Safe stats
      const safeResp = safe.reduce((sum, t) => sum + (t.respect || 0), 0);
      document.getElementById('safeTargets').textContent = safe.length;
      document.getElementById('safeSimHits').textContent = Math.min(safe.length, 20);
      document.getElementById('safeResp').textContent = safeResp.toFixed(1);
      document.getElementById('safeAvg').textContent = safe.length > 0 ? (safeResp / safe.length).toFixed(2) : '0.00';
      
      // Prime stats
      const primeResp = prime.reduce((sum, t) => sum + (t.respect || 0), 0);
      document.getElementById('primeTargets').textContent = prime.length;
      document.getElementById('primeSimHits').textContent = Math.min(prime.length, 20);
      document.getElementById('primeResp').textContent = primeResp.toFixed(1);
      document.getElementById('primeAvg').textContent = prime.length > 0 ? (primeResp / prime.length).toFixed(2) : '0.00';
      
      // Risky stats
      const riskyResp = risky.reduce((sum, t) => sum + (t.respect || 0), 0);
      document.getElementById('riskyTargets').textContent = risky.length;
      document.getElementById('riskySimHits').textContent = Math.min(risky.length, 20);
      document.getElementById('riskyResp').textContent = riskyResp.toFixed(1);
      document.getElementById('riskyAvg').textContent = risky.length > 0 ? (riskyResp / risky.length).toFixed(2) : '0.00';
      
      // Suicide
      document.getElementById('suicideTargets').textContent = suicide.length;
    }
    
    function toggleFilter(filter) {
      SESSION.currentFilter = filter;
      document.querySelectorAll('.toggle').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
      renderMemberList();
    }
    
    function showDashboard() {
      document.querySelectorAll('[id$="Module"], [id$="View"]').forEach(el => el.style.display = 'none');
      document.getElementById('dashboardView').style.display = 'block';
    }
    
    function showModule(module) {
      document.querySelectorAll('[id$="Module"], [id$="View"]').forEach(el => el.style.display = 'none');
      
      const moduleMap = {
        targets: 'targetModule',
        chain: 'chainModule',
        warplan: 'warplanModule',
        armory: 'armoryModule',
        status: 'statusModule',
        advice: 'adviceModule',
        analytics: 'analyticsModule',
        combat: 'combatModule',
        growth: 'growthModule'
      };
      
      document.getElementById(moduleMap[module]).style.display = 'block';
      
      // Update war verdict when showing targets module
      if (module === 'targets') {
        updateWarVerdict();
      }
    }
    
    function showCategory(category) {
      document.getElementById('targetModule').style.display = 'none';
      document.getElementById('categoryView').style.display = 'block';
      
      const tierMap = { safe: 'amber', prime: 'green', risky: 'blue' };
      const filtered = SESSION.targets.filter(t => t.tier === tierMap[category]);
      const tierColors = { amber: 'var(--amber)', green: 'var(--green)', blue: 'var(--blue)' };
      
      const titles = { safe: 'Safe Targets', prime: 'Prime Targets', risky: 'Risky Targets' };
      document.getElementById('categoryTitle').textContent = titles[category];
      
      const html = filtered.map(t => \`
        <div class="target-card" style="border-left-color: \${tierColors[t.tier]};">
          <div class="target-header">
            <div class="target-name">\${t.name}</div>
            <div class="target-ff" style="color: \${tierColors[t.tier]};">\${t.ff.toFixed(2)}x</div>
          </div>
          <div class="target-meta">
            <span>Level: <strong>\${t.level}</strong></span>
            <span>Win: <strong style="color: \${tierColors[t.tier]};">\${t.winChance}%</strong></span>
            <span>Respect: <strong>\${t.respect.toFixed(1)}</strong></span>
          </div>
        </div>
      \`).join('');
      
      document.getElementById('targetList').innerHTML = html;
    }
  </script>
</body>
</html>`;
}