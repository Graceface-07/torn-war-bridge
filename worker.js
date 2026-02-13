// TORN TACTICAL ADVISOR - Modular Version
// Cloudflare Worker with sharp, professional UI

const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx';

// ==========================================
// UTILITIES
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

// ==========================================
// MAIN HANDLER
// ==========================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
    // Routes
    if (url.pathname === '/') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    if (url.pathname === '/api/get-user' && request.method === 'POST') {
      return getUserStats(request, env, corsHeaders);
    }
    
    if (url.pathname === '/api/get-faction' && request.method === 'POST') {
      return getFactionRoster(request, env, corsHeaders);
    }
    
    if (url.pathname === '/api/get-scouter-batch' && request.method === 'POST') {
      return getScouterBatch(request, env, corsHeaders);
    }
    
    if (url.pathname === '/spy' && request.method === 'GET') {
      return listSpyData(env, corsHeaders);
    }
    
    return jsonResponse({ error: 'Not found' }, corsHeaders, 404);
  }
};

// ==========================================
// API ENDPOINTS
// ==========================================

async function getUserStats(request, env, corsHeaders) {
  const { uid } = await request.json();
  
  try {
    const tornUrl = `https://api.torn.com/user/${uid}?selections=profile,battlestats&key=${SC_KEY}`;
    const response = await fetch(tornUrl);
    const data = await response.json();
    
    if (data.error) {
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
    
    console.log('Raw Torn API data - total:', data.total);
    console.log('Strength:', data.strength, 'Modifier:', data.strength_modifier);
    
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
      totalEffective: 0
    }, corsHeaders, 500);
  }
}

async function getFactionRoster(request, env, corsHeaders) {
  const { fid } = await request.json();
  
  try {
    const url = `https://api.torn.com/faction/${fid}?selections=basic&key=${TORN_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      return jsonResponse({ error: 'Faction not found' }, corsHeaders);
    }
    
    const members = Object.keys(data.members || {}).map(id => ({
      id: id,
      name: data.members[id].name,
      level: data.members[id].level
    }));
    
    return jsonResponse({
      success: true,
      name: (data.name || 'Unknown Faction').toUpperCase(),
      members: members
    }, corsHeaders);
    
  } catch (error) {
    return jsonResponse({ error: 'Fetch failed' }, corsHeaders, 500);
  }
}

async function getScouterBatch(request, env, corsHeaders) {
  const { targetsCsv, uid } = await request.json();
  
  try {
    const url = `https://ffscouter.com/api/v1/get-stats?key=${SC_KEY}&targets=${targetsCsv}&user_id=${uid}`;
    const response = await fetch(url);
    const data = await response.json();
    
    return jsonResponse({
      success: true,
      data: data || []
    }, corsHeaders);
    
  } catch (error) {
    console.error('Error fetching FF Scouter batch:', error);
    return jsonResponse({
      success: true,
      data: []
    }, corsHeaders);
  }
}

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

// ==========================================
// HTML INTERFACE
// ==========================================

function getHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tactical Advisor</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --green: #10b981;
      --amber: #f59e0b;
      --blue: #3b82f6;
      --red: #ef4444;
      --purple: #8b5cf6;
      --cyan: #06b6d4;
      --bg: #0a0a0a;
      --panel: #141414;
      --card: #1a1a1a;
      --border: #2a2a2a;
      --text: #f9fafb;
      --text-dim: #9ca3af;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    /* HEADER */
    header {
      background: var(--panel);
      border-bottom: 1px solid var(--border);
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .logo {
      font-family: 'Orbitron', monospace;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 2px;
      color: var(--text);
    }
    .user-stats {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .stat-pill {
      background: var(--card);
      border: 1px solid var(--border);
      padding: 6px 16px;
      border-radius: 8px;
      font-size: 13px;
    }
    .stat-pill .label {
      color: var(--text-dim);
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .stat-pill .value {
      color: var(--text);
      font-weight: 700;
      font-size: 15px;
      margin-top: 2px;
    }
    
    /* CONTAINER */
    .container {
      max-width: 1600px;
      margin: 0 auto;
      padding: 32px;
    }
    
    .view-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-dim);
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    /* MODULE GRID */
    .module-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 20px;
    }
    
    .module-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }
    
    .module-card:hover {
      border-color: var(--blue);
      transform: translateY(-2px);
      box-shadow: 0 12px 24px -10px rgba(59, 130, 246, 0.3);
    }
    
    .module-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--blue), var(--cyan));
      opacity: 0;
      transition: opacity 0.2s;
    }
    
    .module-card:hover::before { opacity: 1; }
    
    .module-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .module-icon {
      font-size: 28px;
      line-height: 1;
    }
    
    .module-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    
    .module-desc {
      color: var(--text-dim);
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .module-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
      gap: 12px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    
    .module-stat .label {
      font-size: 10px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    .module-stat .value {
      font-size: 20px;
      font-weight: 700;
      color: var(--green);
      margin-top: 4px;
    }
    
    /* DRILL-DOWN */
    .drill-down {
      display: none;
      animation: fadeIn 0.2s;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .back-btn {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 24px;
      transition: all 0.2s;
    }
    
    .back-btn:hover {
      background: var(--panel);
      border-color: var(--blue);
    }
    
    .drill-layout {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 20px;
    }
    
    .drill-main {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
    }
    
    .drill-sidebar {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      height: fit-content;
      position: sticky;
      top: 88px;
    }
    
    .section-title {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .advice-box {
      background: var(--panel);
      border: 1px solid var(--border);
      border-left: 3px solid var(--green);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
    }
    
    .advice-title {
      font-size: 11px;
      color: var(--green);
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .advice-content {
      color: var(--text-dim);
      font-size: 13px;
      line-height: 1.5;
    }
    
    .advice-content strong {
      color: var(--text);
      font-weight: 600;
    }
    
    .target-card-mini {
      background: var(--panel);
      border: 1px solid var(--border);
      padding: 14px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .target-card-mini:hover {
      background: var(--card);
      border-color: var(--blue);
      transform: translateX(4px);
    }
    
    .target-meta {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: var(--text-dim);
      margin-top: 8px;
    }
    
    .quick-stats {
      margin-top: 24px;
      padding: 16px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
    }
    
    .stat-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    
    .stat-row span:first-child {
      color: var(--text-dim);
    }
    
    .stat-row span:last-child {
      font-weight: 600;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-dim);
    }
    
    .hidden { display: none !important; }
    
    /* INIT SCREEN */
    .init-screen {
      max-width: 500px;
      margin: 100px auto;
      text-align: center;
    }
    
    .init-screen h2 {
      font-size: 24px;
      margin-bottom: 32px;
      color: var(--text);
    }
    
    .init-screen input {
      width: 100%;
      padding: 14px;
      margin-bottom: 16px;
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 8px;
      font-size: 15px;
    }
    
    .init-screen button {
      width: 100%;
      padding: 16px;
      background: var(--blue);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .init-screen button:hover {
      background: var(--cyan);
    }
  </style>
</head>
<body>

<!-- HEADER -->
<header>
  <div class="logo">TACTICAL ADVISOR</div>
  <div class="user-stats">
    <div class="stat-pill">
      <div class="label">Operator</div>
      <div class="value" id="userName">-</div>
    </div>
    <div class="stat-pill">
      <div class="label">Torn Stats</div>
      <div class="value" id="userTornStats">-</div>
    </div>
    <div class="stat-pill">
      <div class="label">FF Stats</div>
      <div class="value" id="userFFStats">-</div>
    </div>
    <div class="stat-pill">
      <div class="label">Faction</div>
      <div class="value" id="factionName">-</div>
    </div>
  </div>
</header>

<div class="container">
  
  <!-- INIT SCREEN -->
  <div id="initScreen" class="init-screen">
    <h2>Initialize Tactical Scan</h2>
    <input type="number" id="userIdInput" placeholder="Your User ID" value="2702970">
    <input type="number" id="factionIdInput" placeholder="Enemy Faction ID" value="42505">
    <button onclick="initializeScan()">START SCAN</button>
    <div id="initStatus" style="margin-top: 20px;"></div>
  </div>
  
  <!-- MAIN DASHBOARD -->
  <div id="dashboardView" style="display: none;">
    <h2 class="view-title">Command Center</h2>
    
    <!-- War Verdict Panel -->
    <div style="background: var(--card); border: 2px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">War Assessment</div>
      <div style="font-size: 28px; font-weight: 700; color: var(--green); font-family: 'Orbitron', monospace;" id="warVerdict">ANALYZING...</div>
      <div style="font-size: 13px; color: var(--text-dim); margin-top: 8px;" id="verdictDesc">Calculating...</div>
    </div>
    
    <!-- Main Grid: Members + Modules -->
    <div style="display: grid; grid-template-columns: 1fr 450px; gap: 20px;">
      
      <!-- Member List -->
      <div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase;">Faction Roster</h3>
          <div style="font-size: 12px; color: var(--text-dim);"><span id="memberCountMain">0</span> members</div>
        </div>
        <div id="memberListMain" style="max-height: 550px; overflow-y: auto;"></div>
      </div>
      
      <!-- Module Tiles -->
      <div class="module-grid" style="height: fit-content;">
        
        <div class="module-card" onclick="showTargetAnalysis()">
          <div class="module-header">
            <div class="module-icon">🎯</div>
            <div class="module-title">Target Analysis</div>
          </div>
          <div class="module-desc">
            Categorized targets by difficulty
          </div>
          <div class="module-stats">
            <div class="module-stat">
              <div class="label">Beatable</div>
              <div class="value" id="beatableCount">0</div>
            </div>
            <div class="module-stat">
              <div class="label">Respect</div>
              <div class="value" style="color: var(--cyan);" id="totalRespect">0</div>
            </div>
          </div>
        </div>
        
        <div class="module-card" onclick="alert('War Timer - Coming Soon')">
          <div class="module-header">
            <div class="module-icon">⏱️</div>
            <div class="module-title">War Timer</div>
          </div>
          <div class="module-desc">
            Xanax countdown & energy tracking
          </div>
        </div>
        
        <div class="module-card" onclick="alert('Analytics - Coming Soon')">
          <div class="module-header">
            <div class="module-icon">📊</div>
            <div class="module-title">Analytics</div>
          </div>
          <div class="module-desc">
            Respect breakdown & metrics
          </div>
        </div>
        
        <div class="module-card" onclick="alert('Battle Advice - Coming Soon')">
          <div class="module-header">
            <div class="module-icon">🎓</div>
            <div class="module-title">Battle Advice</div>
          </div>
          <div class="module-desc">
            Real-time tactical tips
          </div>
        </div>
        
      </div>
    </div>
  </div>
  
  <!-- TARGET ANALYSIS VIEW (CATEGORY SELECTION) -->
  <div id="targetAnalysisView" style="display: none;">
    <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
    <h2 class="view-title">Target Analysis</h2>
    
    <div class="module-grid">
      <div class="module-card" onclick="showTargets('safe')">
        <div class="module-header">
          <div class="module-icon">✓</div>
          <div class="module-title">Safe Targets</div>
        </div>
        <div class="module-desc">FF < 1.8 | Easy wins, low respect</div>
        <div class="module-stats">
          <div class="module-stat">
            <div class="label">Count</div>
            <div class="value" style="color: var(--amber);" id="safeCount">0</div>
          </div>
        </div>
      </div>
      
      <div class="module-card" onclick="showTargets('prime')">
        <div class="module-header">
          <div class="module-icon">🎯</div>
          <div class="module-title">Prime Targets</div>
        </div>
        <div class="module-desc">FF 1.8-4.2 | Optimal targets</div>
        <div class="module-stats">
          <div class="module-stat">
            <div class="label">Count</div>
            <div class="value" style="color: var(--green);" id="primeCount">0</div>
          </div>
        </div>
      </div>
      
      <div class="module-card" onclick="showTargets('risky')">
        <div class="module-header">
          <div class="module-icon">⚠️</div>
          <div class="module-title">Risky Targets</div>
        </div>
        <div class="module-desc">FF 4.2-5.2 | High reward</div>
        <div class="module-stats">
          <div class="module-stat">
            <div class="label">Count</div>
            <div class="value" style="color: var(--blue);" id="riskyCount">0</div>
          </div>
        </div>
      </div>
      
      <div class="module-card" onclick="showTargets('suicide')">
        <div class="module-header">
          <div class="module-icon">🚫</div>
          <div class="module-title">Suicide</div>
        </div>
        <div class="module-desc">FF > 5.2 | Too strong</div>
        <div class="module-stats">
          <div class="module-stat">
            <div class="label">Count</div>
            <div class="value" style="color: var(--red);" id="suicideCount">0</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- TARGET INTELLIGENCE VIEW -->
  <div id="targetsView" style="display: none;">
    <button class="back-btn" onclick="showTargetAnalysis()">← Back to Target Analysis</button>
    <h2 class="view-title">Target Intelligence</h2>
    
    <div style="margin-bottom: 20px; padding: 16px; background: var(--card); border: 1px solid var(--border); border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Calculation Source</div>
          <div style="display: flex; gap: 10px;">
            <button id="useTornBtn" onclick="switchStatSource('torn')" style="padding: 8px 16px; background: var(--blue); color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              Torn Stats (88.3M)
            </button>
            <button id="useFFBtn" onclick="switchStatSource('ff')" style="padding: 8px 16px; background: var(--card); color: var(--text-dim); border: 1px solid var(--border); border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 13px;">
              FF Stats (70M)
            </button>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px;">Using</div>
          <div id="activeSource" style="font-size: 18px; font-weight: 700; color: var(--blue); margin-top: 4px;">Torn Stats</div>
        </div>
      </div>
    </div>
    
    <div class="drill-layout">
      <div class="drill-main">
        <h3 class="section-title">All Targets</h3>
        <div id="targetsList"></div>
      </div>
      
      <div class="drill-sidebar">
        <h3 class="section-title">Tactical Advice</h3>
        <div id="adviceContent"></div>
        
        <div class="quick-stats">
          <h4 style="font-size: 11px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Quick Stats</h4>
          <div class="stat-row">
            <span>Total Targets:</span>
            <span id="totalTargets">0</span>
          </div>
          <div class="stat-row">
            <span>Beatable:</span>
            <span style="color: var(--green);" id="beatableTargets">0</span>
          </div>
          <div class="stat-row">
            <span>Potential Respect:</span>
            <span style="color: var(--amber);" id="potentialRespect">0</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
</div>

<script>
let SESSION = {
  uid: null,
  fid: null,
  myTornStats: 0,
  myFFStats: 0,
  activeStatSource: 'torn',
  currentFilter: null,
  targets: [],
  stats: {
    total: 0,
    beatable: 0,
    prime: 0,
    respect: 0
  }
};

function switchStatSource(source) {
  SESSION.activeStatSource = source;
  
  // Update button styles
  if (source === 'torn') {
    document.getElementById('useTornBtn').style.background = 'var(--blue)';
    document.getElementById('useTornBtn').style.color = '#fff';
    document.getElementById('useTornBtn').style.border = 'none';
    document.getElementById('useFFBtn').style.background = 'var(--card)';
    document.getElementById('useFFBtn').style.color = 'var(--text-dim)';
    document.getElementById('useFFBtn').style.border = '1px solid var(--border)';
    document.getElementById('activeSource').textContent = 'Torn Stats';
    document.getElementById('activeSource').style.color = 'var(--blue)';
  } else {
    document.getElementById('useFFBtn').style.background = 'var(--cyan)';
    document.getElementById('useFFBtn').style.color = '#fff';
    document.getElementById('useFFBtn').style.border = 'none';
    document.getElementById('useTornBtn').style.background = 'var(--card)';
    document.getElementById('useTornBtn').style.color = 'var(--text-dim)';
    document.getElementById('useTornBtn').style.border = '1px solid var(--border)';
    document.getElementById('activeSource').textContent = 'FF Stats';
    document.getElementById('activeSource').style.color = 'var(--cyan)';
  }
  
  // Recalculate all targets with new stat source
  recalculateTargets();
}

function recalculateTargets() {
  const myStats = SESSION.activeStatSource === 'torn' ? SESSION.myTornStats : SESSION.myFFStats;
  
  SESSION.targets.forEach(target => {
    const analysis = calculateWinProbability(myStats, target.total, target.ff);
    target.winChance = analysis.winChance;
    target.verdict = analysis.verdict;
    target.reasoning = analysis.reasoning;
  });
  
  calculateStats();
  renderTargets();
  renderAdvice();
}

function formatStats(n) {
  if (!n) return '-';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return Math.round(n).toLocaleString();
}

async function initializeScan() {
  const uid = document.getElementById('userIdInput').value;
  const fid = document.getElementById('factionIdInput').value;
  
  if (!uid || !fid) {
    alert('Please enter both IDs');
    return;
  }
  
  SESSION.uid = uid;
  SESSION.fid = fid;
  
  document.getElementById('initStatus').innerHTML = '<div class="loading">⏳ Loading...</div>';
  
  try {
    // Get user stats
    const userRes = await fetch('/api/get-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    const userData = await userRes.json();
    
    SESSION.myTornStats = userData.totalEffective || userData.total;
    SESSION.myFFStats = 70000000; // TODO: Fetch from FF Scouter for user
    
    console.log('User stats - Total:', userData.total, 'Effective:', userData.totalEffective);
    
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userTornStats').textContent = formatStats(SESSION.myTornStats);
    document.getElementById('userFFStats').textContent = formatStats(SESSION.myFFStats);
    
    // Get faction
    const factionRes = await fetch('/api/get-faction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fid })
    });
    const factionData = await factionRes.json();
    
    document.getElementById('factionName').textContent = factionData.name;
    
    // Process targets
    await processTargets(factionData.members.filter(m => m.id !== uid));
    
    document.getElementById('initScreen').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'block';
    
  } catch (error) {
    console.error('Init error:', error);
    document.getElementById('initStatus').innerHTML = '<div style="color: var(--red);">Error loading data</div>';
  }
}

async function processTargets(members) {
  SESSION.targets = [];
  
  const CHUNK = 100;
  for (let i = 0; i < members.length; i += CHUNK) {
    const chunk = members.slice(i, i + CHUNK);
    const csv = chunk.map(m => m.id).join(',');
    
    const res = await fetch('/api/get-scouter-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetsCsv: csv, uid: SESSION.uid })
    });
    const data = await res.json();
    
    chunk.forEach((member, idx) => {
      const sc = data.data[idx] || { fair_fight: 1.0, bs_estimate: 0 };
      const ff = Number(sc.fair_fight) || 1.0;
      const total = Number(sc.bs_estimate) || 0;
      
      const analysis = calculateWinProbability(SESSION.myTornStats, total, ff);
      const respect = calculateRespect(total, ff, member.level);
      
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
        winChance: analysis.winChance,
        verdict: analysis.verdict,
        reasoning: analysis.reasoning,
        respect
      });
    });
  }
  
  calculateStats();
  updateDashboard();
}

function calculateWinProbability(myStats, enemyStats, ff) {
  if (!enemyStats) return { winChance: 0, verdict: 'NO DATA', reasoning: 'No data' };
  
  const ratio = myStats / enemyStats;
  
  let winChance;
  if (ratio >= 3.0) winChance = 98;
  else if (ratio >= 2.0) winChance = 95;
  else if (ratio >= 1.5) winChance = 85;
  else if (ratio >= 1.2) winChance = 70;
  else if (ratio >= 1.0) winChance = 55;
  else if (ratio >= 0.8) winChance = 35;
  else if (ratio >= 0.6) winChance = 20;
  else winChance = 10;
  
  let verdict;
  if (winChance >= 85) verdict = 'DOMINANT';
  else if (winChance >= 65) verdict = 'FAVORABLE';
  else if (winChance >= 45) verdict = 'RISKY';
  else verdict = 'AVOID';
  
  const reasoning = \`Your \${formatStats(myStats)} vs their \${formatStats(enemyStats)}. You have \${ratio.toFixed(2)}x advantage for \${winChance}% win chance.\`;
  
  return { winChance, verdict, reasoning, statRatio: ratio };
}

function calculateRespect(enemyTotal, ff, enemyLevel = 50) {
  // Level-based respect (1.0 at L1, 1.5 at L100)
  const levelRespect = 1.0 + ((enemyLevel - 1) / 100) * 0.5;
  
  // Apply FF multiplier
  const baseRespect = levelRespect * ff;
  
  // War bonus (2x during ranked wars)
  const warRespect = baseRespect * 2;
  
  // Warlord weapon bonus (+16%)
  const finalRespect = warRespect * 1.16;
  
  return Math.round(finalRespect * 10) / 10; // Round to 1 decimal
}

function calculateStats() {
  SESSION.stats.total = SESSION.targets.length;
  SESSION.stats.beatable = SESSION.targets.filter(t => t.winChance >= 50).length;
  SESSION.stats.prime = SESSION.targets.filter(t => t.tier === 'green').length;
  SESSION.stats.respect = SESSION.targets.filter(t => t.winChance >= 50).reduce((sum, t) => sum + t.respect, 0);
}

function updateDashboard() {
  document.getElementById('beatableCount').textContent = SESSION.stats.beatable;
  document.getElementById('primeCount').textContent = SESSION.stats.prime;
  document.getElementById('totalRespect').textContent = formatStats(SESSION.stats.respect);
  
  // Populate member list
  renderMemberListMain();
  
  // Calculate and show war verdict
  const beatablePercent = SESSION.stats.total > 0 ? (SESSION.stats.beatable / SESSION.stats.total) * 100 : 0;
  let verdict = 'GOOD RANK WAR';
  let verdictColor = 'var(--green)';
  let verdictDesc = 'Solid target pool with good respect potential';
  
  if (beatablePercent < 30) {
    verdict = 'POOR RANK WAR';
    verdictColor = 'var(--red)';
    verdictDesc = 'Only ' + SESSION.stats.beatable + ' beatable targets - challenging matchup';
  } else if (beatablePercent > 70) {
    verdict = 'EXCELLENT RANK WAR';
    verdictColor = 'var(--cyan)';
    verdictDesc = SESSION.stats.beatable + ' beatable targets - favorable matchup';
  }
  
  document.getElementById('warVerdict').textContent = verdict;
  document.getElementById('warVerdict').style.color = verdictColor;
  document.getElementById('verdictDesc').textContent = verdictDesc;
}

function showDashboard() {
  console.log('Showing dashboard');
  document.getElementById('dashboardView').style.display = 'block';
  document.getElementById('targetAnalysisView').style.display = 'none';
  document.getElementById('targetsView').style.display = 'none';
  document.getElementById('initScreen').style.display = 'none';
  
  // Populate member list on dashboard
  renderMemberListMain();
}

function showTargetAnalysis() {
  console.log('Showing target analysis');
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('targetAnalysisView').style.display = 'block';
  document.getElementById('targetsView').style.display = 'none';
  
  // Update category counts
  updateCategoryCounts();
}

function showTargets(filter = null) {
  console.log('Showing targets view, filter:', filter);
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('targetAnalysisView').style.display = 'none';
  document.getElementById('targetsView').style.display = 'block';
  document.getElementById('initScreen').style.display = 'none';
  
  SESSION.currentFilter = filter;
  renderTargets();
  renderAdvice();
}

function renderMemberListMain() {
  const sorted = [...SESSION.targets].sort((a, b) => b.respect - a.respect);
  const tierColors = { amber: 'var(--amber)', green: 'var(--green)', blue: 'var(--blue)', red: 'var(--red)' };
  
  const html = sorted.map(t => \`
    <div style="background: var(--panel); border: 1px solid var(--border); border-left: 3px solid \${tierColors[t.tier]}; padding: 10px 12px; border-radius: 6px; margin-bottom: 6px;">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <div style="font-weight: 600; font-size: 13px;">\${t.name}</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">Level \${t.level} • FF \${t.ff.toFixed(2)}x</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 700; font-size: 14px; color: \${tierColors[t.tier]};">\${t.respect.toFixed(1)}</div>
          <div style="font-size: 10px; color: var(--text-dim);">\${t.winChance}% win</div>
        </div>
      </div>
    </div>
  \`).join('');
  
  document.getElementById('memberListMain').innerHTML = html;
  document.getElementById('memberCountMain').textContent = SESSION.targets.length;
}

function updateCategoryCounts() {
  const safe = SESSION.targets.filter(t => t.tier === 'amber').length;
  const prime = SESSION.targets.filter(t => t.tier === 'green').length;
  const risky = SESSION.targets.filter(t => t.tier === 'blue').length;
  const suicide = SESSION.targets.filter(t => t.tier === 'red').length;
  
  document.getElementById('safeCount').textContent = safe;
  document.getElementById('primeCount').textContent = prime;
  document.getElementById('riskyCount').textContent = risky;
  document.getElementById('suicideCount').textContent = suicide;
}

function renderTargets() {
  const sorted = [...SESSION.targets].sort((a, b) => b.respect - a.respect);
  
  const html = sorted.map(t => \`
    <div class="target-card-mini">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div style="font-weight: 600;">\${t.name}</div>
        <div style="font-weight: 700; color: var(--\${t.tier});">\${t.ff.toFixed(2)}x</div>
      </div>
      <div class="target-meta">
        <span>Win: <strong style="color: var(--\${t.tier});">\${t.winChance}%</strong></span>
        <span>Respect: <strong>\${t.respect}</strong></span>
        <span>Verdict: <strong>\${t.verdict}</strong></span>
      </div>
    </div>
  \`).join('');
  
  document.getElementById('targetsList').innerHTML = html;
  document.getElementById('totalTargets').textContent = SESSION.stats.total;
  document.getElementById('beatableTargets').textContent = \`\${SESSION.stats.beatable} (\${Math.round(SESSION.stats.beatable/SESSION.stats.total*100)}%)\`;
  document.getElementById('potentialRespect').textContent = formatStats(SESSION.stats.respect);
}

function renderAdvice() {
  const primeTargets = SESSION.targets.filter(t => t.tier === 'green');
  const avoidTargets = SESSION.targets.filter(t => t.tier === 'red');
  
  let html = \`
    <div class="advice-box">
      <div class="advice-title">🎯 Recommended Strategy</div>
      <div class="advice-content">
        <p><strong>Focus on \${SESSION.stats.prime} prime targets (FF 1.8-4.2)</strong></p>
        <p>You have \${formatStats(SESSION.myTornStats)} stats. These targets give optimal respect/energy ratio while maintaining 70%+ win rate.</p>
      </div>
    </div>
  \`;
  
  if (SESSION.stats.beatable > 0) {
    html += \`
      <div class="advice-box" style="border-left-color: var(--amber);">
        <div class="advice-title" style="color: var(--amber);">⚠️ Key Insight</div>
        <div class="advice-content">
          <p><strong>\${SESSION.stats.beatable} beatable targets available</strong></p>
          <p>These targets have 50%+ win probability. Prioritize high-respect targets first.</p>
        </div>
      </div>
    \`;
  }
  
  if (avoidTargets.length > 0) {
    html += \`
      <div class="advice-box" style="border-left-color: var(--red);">
        <div class="advice-title" style="color: var(--red);">💡 Pro Tip</div>
        <div class="advice-content">
          <p><strong>Avoid \${avoidTargets.length} high FF targets (>5.2x)</strong></p>
          <p>Save your energy for beatable targets with better respect potential.</p>
        </div>
      </div>
    \`;
  }
  
  document.getElementById('adviceContent').innerHTML = html;
}
</script>

</body>
</html>`;
}