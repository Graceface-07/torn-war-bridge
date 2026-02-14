// TORN TACTICAL ADVISOR - War Command Center
// Complete modular system with progression tracking

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
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    
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
        totalEffective: 0
      }, corsHeaders);
    }
    
    let totalEffective = Number(data.total) || 0;
    
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
    }
    
    return jsonResponse({
      success: true,
      name: (data.name || 'OPERATOR').toUpperCase(),
      total: Number(data.total) || 0,
      totalEffective: totalEffective,
      level: data.level || 1
    }, corsHeaders);
    
  } catch (error) {
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
    return jsonResponse({
      success: true,
      data: []
    }, corsHeaders);
  }
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
  <title>War Command Center</title>
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
    }
    
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
    }
    .user-stats {
      display: flex;
      gap: 16px;
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
    
    .container {
      max-width: 1800px;
      margin: 0 auto;
      padding: 32px;
    }
    
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-dim);
      margin-bottom: 16px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .module-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .module-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
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
      margin-bottom: 10px;
    }
    
    .module-icon {
      font-size: 24px;
      line-height: 1;
    }
    
    .module-title {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.3px;
    }
    
    .module-desc {
      color: var(--text-dim);
      font-size: 12px;
      line-height: 1.5;
      margin-bottom: 14px;
    }
    
    .module-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
      gap: 10px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
    }
    
    .module-stat .label {
      font-size: 9px;
      color: var(--text-dim);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    
    .module-stat .value {
      font-size: 18px;
      font-weight: 700;
      margin-top: 4px;
    }
    
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
      grid-template-columns: 1fr 380px;
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
    
    .advice-box {
      background: var(--panel);
      border: 1px solid var(--border);
      border-left: 3px solid var(--green);
      padding: 14px;
      border-radius: 8px;
      margin-bottom: 10px;
    }
    
    .advice-title {
      font-size: 10px;
      color: var(--green);
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .advice-content {
      color: var(--text-dim);
      font-size: 12px;
      line-height: 1.5;
    }
    
    .advice-content strong {
      color: var(--text);
      font-weight: 600;
    }
    
    .loading {
      text-align: center;
      padding: 40px;
      color: var(--text-dim);
    }
    
    .hidden { display: none !important; }
    
    .init-screen {
      max-width: 500px;
      margin: 100px auto;
      text-align: center;
    }
    
    .init-screen h2 {
      font-size: 24px;
      margin-bottom: 32px;
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
    
    .task-item {
      background: var(--panel);
      border: 1px solid var(--border);
      padding: 12px 14px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;
    }
    
    .task-item:hover {
      border-color: var(--blue);
    }
    
    .task-item.completed {
      opacity: 0.5;
      border-color: var(--green);
    }
    
    .task-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-radius: 4px;
      cursor: pointer;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .task-checkbox:hover {
      border-color: var(--green);
    }
    
    .task-checkbox.checked {
      background: var(--green);
      border-color: var(--green);
    }
    
    .task-checkbox.checked::after {
      content: '✓';
      color: #000;
      font-weight: 700;
      font-size: 14px;
    }
    
    .task-content {
      flex: 1;
    }
    
    .task-title {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 4px;
    }
    
    .task-desc {
      font-size: 11px;
      color: var(--text-dim);
      line-height: 1.4;
    }
    
    .task-reward {
      font-size: 11px;
      color: var(--amber);
      font-weight: 600;
    }
    
    .progress-bar {
      background: var(--panel);
      border: 1px solid var(--border);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin: 12px 0;
    }
    
    .progress-fill {
      background: linear-gradient(90deg, var(--blue), var(--cyan));
      height: 100%;
      transition: width 0.3s;
    }
  </style>
</head>
<body>

<header>
  <div class="logo">WAR COMMAND CENTER</div>
  <div class="user-stats">
    <div class="stat-pill">
      <div class="label">Operator</div>
      <div class="value" id="userName">-</div>
    </div>
    <div class="stat-pill">
      <div class="label">Level</div>
      <div class="value" id="userLevel">-</div>
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
      <div class="label">Enemy Faction</div>
      <div class="value" id="factionName">-</div>
    </div>
  </div>
</header>

<div class="container">
  
  <!-- INIT SCREEN -->
  <div id="initScreen" class="init-screen">
    <h2>Initialize War Intelligence</h2>
    <input type="number" id="userIdInput" placeholder="Your User ID" value="2702970">
    <input type="number" id="factionIdInput" placeholder="Enemy Faction ID" value="42505">
    <button onclick="initializeScan()">START SCAN</button>
    <div id="initStatus" style="margin-top: 20px;"></div>
  </div>
  
  <!-- MAIN DASHBOARD -->
  <div id="dashboardView" style="display: none;">
    
    <!-- WAR VERDICT PANEL -->
    <div style="background: var(--card); border: 2px solid var(--border); border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
      <div style="font-size: 11px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px;">Command Verdict</div>
      <div style="font-size: 32px; font-weight: 700; color: var(--green); font-family: 'Orbitron', monospace; margin-bottom: 8px;" id="verdictText">ANALYZING...</div>
      <div style="font-size: 13px; color: var(--text-dim);" id="verdictDesc">Calculating war potential...</div>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border);">
        <div>
          <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">20-Hit Est.</div>
          <div style="font-size: 28px; font-weight: 700; color: var(--green);" id="twentyHitEst">0</div>
          <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase;">Respect</div>
        </div>
        <div>
          <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Gap Analysis</div>
          <div style="font-size: 28px; font-weight: 700; color: var(--blue);" id="gapAnalysis">0</div>
          <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase;">Wasted Hits</div>
        </div>
        <div>
          <div style="font-size: 10px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">Efficiency</div>
          <div style="font-size: 28px; font-weight: 700; color: var(--amber);" id="efficiencyScore">0</div>
          <div style="font-size: 9px; color: var(--text-dim); text-transform: uppercase;">Avg / Hit</div>
        </div>
      </div>
    </div>
    
    <!-- MAIN GRID: MEMBERS LEFT, MODULES RIGHT -->
    <div style="display: grid; grid-template-columns: 1fr 500px; gap: 20px;">
      
      <!-- LEFT: MEMBER LIST -->
      <div style="background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Faction Roster</h3>
          <div style="font-size: 12px; color: var(--text-dim);"><span id="memberCount">0</span> members</div>
        </div>
        <div id="memberList" style="max-height: 600px; overflow-y: auto;"></div>
      </div>
      
      <!-- RIGHT: MODULE TILES -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; height: fit-content;">
        
        <div class="module-card" onclick="showTargetAnalysis()" style="grid-column: 1 / -1; border-left: 3px solid var(--blue);">
          <div class="module-header">
            <div class="module-icon">🎯</div>
            <div class="module-title">Target Analysis</div>
          </div>
          <div class="module-desc">
            Categorized targets by difficulty - Safe, Prime, Risky, Suicide
          </div>
          <div class="module-stats">
            <div class="module-stat">
              <div class="label">Beatable</div>
              <div class="value" style="color: var(--green);" id="beatableMain">0</div>
            </div>
            <div class="module-stat">
              <div class="label">Total Resp</div>
              <div class="value" style="color: var(--cyan);" id="totalRespMain">0</div>
            </div>
          </div>
        </div>
        
        <div class="module-card" onclick="alert('War Timer - Coming Soon')">
          <div class="module-header">
            <div class="module-icon">⏱️</div>
            <div class="module-title">War Timer</div>
          </div>
          <div class="module-desc">
            Xanax countdown and energy tracking
          </div>
        </div>
        
        <div class="module-card" onclick="alert('Analytics - Coming Soon')">
          <div class="module-header">
            <div class="module-icon">📊</div>
            <div class="module-title">Analytics</div>
          </div>
          <div class="module-desc">
            Respect breakdown and efficiency metrics
          </div>
        </div>
        
        <div class="module-card" onclick="alert('Battle Advice - Coming Soon')">
          <div class="module-header">
            <div class="module-icon">🎓</div>
            <div class="module-title">Battle Advice</div>
          </div>
          <div class="module-desc">
            Real-time tactical recommendations
          </div>
        </div>
        
        <div class="module-card" onclick="showProgress()">
          <div class="module-header">
            <div class="module-icon">📋</div>
            <div class="module-title">Monthly Progress</div>
          </div>
          <div class="module-desc">
            Track your improvement goals
          </div>
        </div>
        
      </div>
      
    </div>
    
  </div>
  
  <!-- TARGET ANALYSIS VIEW (SHOWS CATEGORY TILES) -->
  <div id="targetAnalysisView" style="display: none;">
    <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
    <h2 class="section-title">Target Analysis</h2>
    
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
      
      <div class="module-card" onclick="showCategory('safe')" style="border-left: 3px solid var(--amber);">
        <div class="module-header">
          <div class="module-icon">✓</div>
          <div class="module-title">Safe Targets</div>
        </div>
        <div class="module-desc">FF < 1.8 | Easy wins, low respect but guaranteed</div>
        <div class="module-stats">
          <div class="module-stat">
            <div class="label">Targets</div>
            <div class="value" style="color: var(--amber);" id="safeCount">0</div>
          </div>
          <div class="module-stat">
            <div class="label">Sim Hits</div>
            <div class="value" style="color: var(--amber);" id="safeSim">0</div>
          </div>
        </div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: var(--text-dim);">Est. Resp</span>
            <span style="font-weight: 700;" id="safeRespect">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
            <span style="color: var(--text-dim);">Avg/Hit</span>
            <span style="font-weight: 700;" id="safeAvg">0</span>
          </div>
        </div>
      </div>
      
      <div class="module-card" onclick="showCategory('prime')" style="border-left: 3px solid var(--green);">
        <div class="module-header">
          <div class="module-icon">🎯</div>
          <div class="module-title">Prime Targets</div>
        </div>
        <div class="module-desc">FF 1.8-4.2 | Optimal targets - beatable + good respect</div>
        <div class="module-stats">
          <div class="module-stat">
            <div class="label">Targets</div>
            <div class="value" style="color: var(--green);" id="primeCount">0</div>
          </div>
          <div class="module-stat">
            <div class="label">Sim Hits</div>
            <div class="value" style="color: var(--green);" id="primeSim">0</div>
          </div>
        </div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: var(--text-dim);">Est. Resp</span>
            <span style="font-weight: 700;" id="primeRespect">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
            <span style="color: var(--text-dim);">Avg/Hit</span>
            <span style="font-weight: 700;" id="primeAvg">0</span>
          </div>
        </div>
      </div>
      
      <div class="module-card" onclick="showCategory('risky')" style="border-left: 3px solid var(--blue);">
        <div class="module-header">
          <div class="module-icon">⚠️</div>
          <div class="module-title">Risky Targets</div>
        </div>
        <div class="module-desc">FF 4.2-5.2 | Challenging but high reward</div>
        <div class="module-stats">
          <div class="module-stat">
            <div class="label">Targets</div>
            <div class="value" style="color: var(--blue);" id="riskyCount">0</div>
          </div>
          <div class="module-stat">
            <div class="label">Sim Hits</div>
            <div class="value" style="color: var(--blue);" id="riskySim">0</div>
          </div>
        </div>
        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border);">
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: var(--text-dim);">Est. Resp</span>
            <span style="font-weight: 700;" id="riskyRespect">0</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
            <span style="color: var(--text-dim);">Avg/Hit</span>
            <span style="font-weight: 700;" id="riskyAvg">0</span>
          </div>
        </div>
      </div>
      
      <div class="module-card" onclick="showCategory('suicide')" style="border-left: 3px solid var(--red);">
        <div class="module-header">
          <div class="module-icon">🚫</div>
          <div class="module-title">Suicide Targets</div>
        </div>
        <div class="module-desc">FF > 5.2 | Too strong, waste of energy</div>
        <div class="module-stats">
          <div class="module-stat">
            <div class="label">Targets</div>
            <div class="value" style="color: var(--red);" id="suicideCount">0</div>
          </div>
          <div class="module-stat">
            <div class="label">Status</div>
            <div class="value" style="font-size: 11px; color: var(--red);">NOT VIABLE</div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
  
  <!-- TARGET CATEGORY DRILL-DOWN -->
  <div id="categoryView" style="display: none;">
    <button class="back-btn" onclick="showTargetAnalysis()">← Back to Target Analysis</button>
    <h2 class="section-title" id="categoryTitle">Targets</h2>
    
    <div class="drill-layout">
      <div class="drill-main">
        <div id="categoryTargets"></div>
      </div>
      
      <div class="drill-sidebar">
        <h3 style="font-size: 12px; font-weight: 700; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Tactical Advice</h3>
        <div id="categoryAdvice"></div>
      </div>
    </div>
  </div>
  
  <!-- MONTHLY PROGRESS DRILL-DOWN -->
  <div id="progressView" class="drill-down">
    <button class="back-btn" onclick="showDashboard()">← Back to Command Center</button>
    <h2 class="section-title">Monthly Progress Tracker</h2>
    
    <div class="drill-layout">
      <div class="drill-main">
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="font-size: 12px; color: var(--text-dim);">Overall Progress</div>
            <div style="font-size: 14px; font-weight: 700;" id="progressPercent">0%</div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="progressBar" style="width: 0%;"></div>
          </div>
        </div>
        
        <h3 style="font-size: 13px; font-weight: 700; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">This Month's Tasks</h3>
        <div id="tasksList"></div>
      </div>
      
      <div class="drill-sidebar">
        <h3 style="font-size: 12px; font-weight: 700; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Why These Tasks?</h3>
        <div id="progressAdvice"></div>
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
  myLevel: 1,
  targets: [],
  tasks: [],
  stats: {
    total: 0,
    beatable: 0,
    prime: 0,
    safe: 0,
    risky: 0,
    avoid: 0,
    respect: 0
  }
};

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
  
  document.getElementById('initStatus').innerHTML = '<div class="loading">⏳ Scanning faction...</div>';
  
  try {
    const userRes = await fetch('/api/get-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid })
    });
    const userData = await userRes.json();
    
    SESSION.myTornStats = userData.totalEffective || userData.total;
    SESSION.myFFStats = 70000000;
    SESSION.myLevel = userData.level || 1;
    
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userLevel').textContent = SESSION.myLevel;
    document.getElementById('userTornStats').textContent = formatStats(SESSION.myTornStats);
    document.getElementById('userFFStats').textContent = formatStats(SESSION.myFFStats);
    
    const factionRes = await fetch('/api/get-faction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fid })
    });
    const factionData = await factionRes.json();
    
    document.getElementById('factionName').textContent = factionData.name;
    
    await processTargets(factionData.members.filter(m => m.id !== uid));
    generateMonthlyTasks();
    
    document.getElementById('initScreen').style.display = 'none';
    document.getElementById('dashboardView').style.display = 'block';
    
  } catch (error) {
    console.error('Init error:', error);
    console.error('Error stack:', error.stack);
    document.getElementById('initStatus').innerHTML = '<div style="color: var(--red);">Error: ' + error.message + '</div>';
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
        respect,
        respectPerEnergy: (respect / 25).toFixed(1)
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
  
  const reasoning = \`You have \${ratio.toFixed(2)}x stat advantage for \${winChance}% win chance.\`;
  
  return { winChance, verdict, reasoning };
}

function calculateRespect(enemyTotal, ff, enemyLevel = 50) {
  // Base respect from level (1.0 at level 1, 1.5 at level 100)
  const levelRespect = 1.0 + ((enemyLevel - 1) / 100) * 0.5;
  
  // Apply FF multiplier
  const baseRespect = levelRespect * ff;
  
  // War bonus (2x during ranked war)
  const warRespect = baseRespect * 2;
  
  // Warlord weapon bonus (+16%)
  const finalRespect = warRespect * 1.16;
  
  return Math.round(finalRespect * 10) / 10; // Round to 1 decimal
}

function calculateStats() {
  SESSION.stats.total = SESSION.targets.length;
  SESSION.stats.beatable = SESSION.targets.filter(t => t.winChance >= 50).length;
  SESSION.stats.prime = SESSION.targets.filter(t => t.tier === 'green').length;
  SESSION.stats.safe = SESSION.targets.filter(t => t.tier === 'amber').length;
  SESSION.stats.risky = SESSION.targets.filter(t => t.tier === 'blue').length;
  SESSION.stats.avoid = SESSION.targets.filter(t => t.tier === 'red').length;
  SESSION.stats.respect = SESSION.targets.filter(t => t.winChance >= 50).reduce((sum, t) => sum + t.respect, 0);
}

function updateDashboard() {
  // Populate member list
  renderMemberList();
  
  // Calculate war verdict
  const beatable = SESSION.targets.filter(t => t.winChance >= 50);
  const twentyHits = beatable.slice(0, 20).reduce((sum, t) => sum + t.respect, 0);
  const wastedHits = SESSION.targets.filter(t => t.winChance < 50).length;
  const avgResp = beatable.length > 0 ? (SESSION.stats.respect / beatable.length).toFixed(2) : 0;
  
  document.getElementById('twentyHitEst').textContent = twentyHits.toFixed(1);
  document.getElementById('gapAnalysis').textContent = wastedHits;
  document.getElementById('efficiencyScore').textContent = avgResp;
  
  // Set verdict
  let verdict = 'GOOD RANK WAR';
  let verdictDesc = 'Solid target pool with good respect potential';
  let verdictColor = 'var(--green)';
  
  if (beatable.length < SESSION.stats.total * 0.3) {
    verdict = 'POOR RANK WAR';
    verdictDesc = 'Low beatable percentage - mathematically challenging';
    verdictColor = 'var(--red)';
  } else if (beatable.length > SESSION.stats.total * 0.7) {
    verdict = 'EXCELLENT RANK WAR';
    verdictDesc = 'High beatable percentage - favorable matchup';
    verdictColor = 'var(--cyan)';
  }
  
  document.getElementById('verdictText').textContent = verdict;
  document.getElementById('verdictText').style.color = verdictColor;
  document.getElementById('verdictDesc').textContent = verdictDesc;
  
  // Update category tiles
  const safe = SESSION.targets.filter(t => t.tier === 'amber' && t.winChance >= 50);
  const prime = SESSION.targets.filter(t => t.tier === 'green' && t.winChance >= 50);
  const risky = SESSION.targets.filter(t => t.tier === 'blue' && t.winChance >= 50);
  const suicide = SESSION.targets.filter(t => t.tier === 'red');
  
  document.getElementById('safeCount').textContent = safe.length;
  document.getElementById('safeSim').textContent = Math.min(safe.length, 20);
  document.getElementById('safeRespect').textContent = safe.reduce((s, t) => s + t.respect, 0).toFixed(1);
  document.getElementById('safeAvg').textContent = safe.length > 0 ? (safe.reduce((s, t) => s + t.respect, 0) / safe.length).toFixed(2) : 0;
  
  document.getElementById('primeCount').textContent = prime.length;
  document.getElementById('primeSim').textContent = Math.min(prime.length, 20);
  document.getElementById('primeRespect').textContent = prime.reduce((s, t) => s + t.respect, 0).toFixed(1);
  document.getElementById('primeAvg').textContent = prime.length > 0 ? (prime.reduce((s, t) => s + t.respect, 0) / prime.length).toFixed(2) : 0;
  
  document.getElementById('riskyCount').textContent = risky.length;
  document.getElementById('riskySim').textContent = Math.min(risky.length, 20);
  document.getElementById('riskyRespect').textContent = risky.reduce((s, t) => s + t.respect, 0).toFixed(1);
  document.getElementById('riskyAvg').textContent = risky.length > 0 ? (risky.reduce((s, t) => s + t.respect, 0) / risky.length).toFixed(2) : 0;
  
  document.getElementById('suicideCount').textContent = suicide.length;
  
  document.getElementById('memberCount').textContent = SESSION.stats.total;
  
  // Update progress
  const completed = SESSION.tasks.filter(t => t.completed).length;
  document.getElementById('tasksCompleted').textContent = completed;
  document.getElementById('tasksTotal').textContent = SESSION.tasks.length;
  const percent = Math.round((completed / SESSION.tasks.length) * 100);
  document.getElementById('progressBarMain').style.width = percent + '%';
}

function renderMemberList() {
  const sorted = [...SESSION.targets].sort((a, b) => b.respect - a.respect);
  
  const html = sorted.map(t => {
    const tierColors = { amber: 'var(--amber)', green: 'var(--green)', blue: 'var(--blue)', red: 'var(--red)' };
    return \`
      <div style="background: var(--panel); border: 1px solid var(--border); border-left: 3px solid \${tierColors[t.tier]}; padding: 10px 12px; border-radius: 6px; margin-bottom: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--blue)'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="display: flex; justify-content: space-between; align-items: center;">
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
    \`;
  }).join('');
  
  document.getElementById('memberList').innerHTML = html;
}

function generateMonthlyTasks() {
  const statBased = [
    {
      title: "Train at Gym Daily",
      desc: "Complete 50 energy worth of gym training every day this month",
      reward: "+5% monthly stat gain",
      category: "training",
      difficulty: "easy"
    },
    {
      title: "Attack 10 Prime Targets",
      desc: "Win fights against targets with FF 2.0-4.0 to practice optimal targeting",
      reward: "Improved combat tactics",
      category: "combat",
      difficulty: "medium"
    },
    {
      title: "Complete Education Course",
      desc: "Finish one education to improve passive bonuses",
      reward: "Permanent stat/combat boost",
      category: "education",
      difficulty: "hard"
    }
  ];
  
  if (SESSION.myLevel < 50) {
    statBased.push({
      title: "Reach Level " + (SESSION.myLevel + 5),
      desc: "Level up through combat and training",
      reward: "Unlock new features",
      category: "progression",
      difficulty: "medium"
    });
  }
  
  if (SESSION.myTornStats < 100000000) {
    statBased.push({
      title: "Break 100M Battle Stats",
      desc: "Focus training on your main stat to reach 100M total",
      reward: "Mid-tier fighter status",
      category: "training",
      difficulty: "hard"
    });
  } else if (SESSION.myTornStats < 1000000000) {
    statBased.push({
      title: "Break 1B Battle Stats",
      desc: "Consistent training to reach 1 billion total stats",
      reward: "High-tier fighter status",
      category: "training",
      difficulty: "hard"
    });
  }
  
  SESSION.tasks = statBased.map((t, i) => ({ ...t, id: i, completed: false }));
}

function showDashboard() {
  document.getElementById('dashboardView').style.display = 'block';
  document.getElementById('targetAnalysisView').style.display = 'none';
  document.getElementById('categoryView').style.display = 'none';
  document.getElementById('progressView').style.display = 'none';
}

function showTargetAnalysis() {
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('targetAnalysisView').style.display = 'block';
  document.getElementById('categoryView').style.display = 'none';
  document.getElementById('progressView').style.display = 'none';
}

function showCategory(tier) {
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('targetAnalysisView').style.display = 'none';
  document.getElementById('categoryView').style.display = 'block';
  document.getElementById('progressView').style.display = 'none';
  
  let tierName, tierColor, filtered;
  
  if (tier === 'prime') {
    tierName = '🎯 Prime Targets';
    tierColor = 'green';
    filtered = SESSION.targets.filter(t => t.tier === 'green');
  } else if (tier === 'safe') {
    tierName = '✓ Safe Targets';
    tierColor = 'amber';
    filtered = SESSION.targets.filter(t => t.tier === 'amber');
  } else if (tier === 'risky') {
    tierName = '⚠️ Risky Targets';
    tierColor = 'blue';
    filtered = SESSION.targets.filter(t => t.tier === 'blue');
  } else {
    tierName = '🚫 Suicide Targets';
    tierColor = 'red';
    filtered = SESSION.targets.filter(t => t.tier === 'red');
  }
  
  document.getElementById('categoryTitle').textContent = tierName;
  
  filtered.sort((a, b) => b.respect - a.respect);
  
  const html = filtered.map(t => \`
    <div class="target-card-mini">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <div style="font-weight: 600;">\${t.name}</div>
        <div style="font-weight: 700; color: var(--\${tierColor});">\${t.ff.toFixed(2)}x</div>
      </div>
      <div class="target-meta">
        <span>Win: <strong style="color: var(--\${tierColor});">\${t.winChance}%</strong></span>
        <span>Respect: <strong>\${t.respect.toFixed(1)}</strong></span>
        <span>Level: <strong>\${t.level}</strong></span>
      </div>
    </div>
  \`).join('');
  
  document.getElementById('categoryTargets').innerHTML = html || '<div style="color: var(--text-dim); text-align: center; padding: 40px;">No targets in this category</div>';
  
  renderCategoryAdvice(tier, filtered);
}

function renderCategoryAdvice(tier, targets) {
  let advice = '';
  
  if (tier === 'prime') {
    advice = \`
      <div class="advice-box">
        <div class="advice-title">🎯 Attack Strategy</div>
        <div class="advice-content">
          <p><strong>These are your optimal targets.</strong></p>
          <p>Focus on these during wars for maximum respect/energy efficiency. Target FF 2.5-3.5 for guaranteed 3x multiplier.</p>
        </div>
      </div>
      <div class="advice-box" style="border-left-color: var(--amber);">
        <div class="advice-title" style="color: var(--amber);">💡 Pro Tip</div>
        <div class="advice-content">
          <p>Attack overseas targets first (+1.25x bonus). Check if they're traveling before attacking.</p>
        </div>
      </div>
    \`;
  } else if (tier === 'safe') {
    advice = \`
      <div class="advice-box">
        <div class="advice-title">✓ Easy Wins</div>
        <div class="advice-content">
          <p><strong>Low risk, guaranteed respect.</strong></p>
          <p>Use these to build chains or when you need quick, safe attacks. Lower FF means less respect per hit.</p>
        </div>
      </div>
    \`;
  } else if (tier === 'risky') {
    advice = \`
      <div class="advice-box" style="border-left-color: var(--blue);">
        <div class="advice-title" style="color: var(--blue);">⚠️ High Risk</div>
        <div class="advice-content">
          <p><strong>Only attack if prepared.</strong></p>
          <p>Use boosters, ensure you have backup, and med timer available. High FF = high reward if you win.</p>
        </div>
      </div>
    \`;
  } else {
    advice = \`
      <div class="advice-box" style="border-left-color: var(--red);">
        <div class="advice-title" style="color: var(--red);">🚫 Do Not Attack</div>
        <div class="advice-content">
          <p><strong>These targets will beat you.</strong></p>
          <p>Save your energy for beatable targets. Focus on training to increase your stats.</p>
        </div>
      </div>
    \`;
  }
  
  document.getElementById('categoryAdvice').innerHTML = advice;
}

function showProgress() {
  document.getElementById('dashboardView').style.display = 'none';
  document.getElementById('categoryView').style.display = 'none';
  document.getElementById('progressView').style.display = 'block';
  
  renderTasks();
  renderProgressAdvice();
}

function renderTasks() {
  const completed = SESSION.tasks.filter(t => t.completed).length;
  const total = SESSION.tasks.length;
  const percent = Math.round((completed / total) * 100);
  
  document.getElementById('progressPercent').textContent = percent + '%';
  document.getElementById('progressBar').style.width = percent + '%';
  
  const html = SESSION.tasks.map(task => \`
    <div class="task-item \${task.completed ? 'completed' : ''}" onclick="toggleTask(\${task.id})">
      <div class="task-checkbox \${task.completed ? 'checked' : ''}"></div>
      <div class="task-content">
        <div class="task-title">\${task.title}</div>
        <div class="task-desc">\${task.desc}</div>
      </div>
      <div class="task-reward">\${task.reward}</div>
    </div>
  \`).join('');
  
  document.getElementById('tasksList').innerHTML = html;
  
  const tasksCompleted = SESSION.tasks.filter(t => t.completed).length;
  const tasksRemaining = SESSION.tasks.length - tasksCompleted;
  document.getElementById('tasksCompleted').textContent = tasksCompleted;
  document.getElementById('tasksRemaining').textContent = tasksRemaining;
}

function renderProgressAdvice() {
  const advice = \`
    <div class="advice-box">
      <div class="advice-title">📈 Your Growth Path</div>
      <div class="advice-content">
        <p><strong>Tasks are personalized to your level (\${SESSION.myLevel}) and stats (\${formatStats(SESSION.myTornStats)}).</strong></p>
        <p>Completing these will accelerate your progression and make you more effective in combat.</p>
      </div>
    </div>
    <div class="advice-box" style="border-left-color: var(--amber);">
      <div class="advice-title" style="color: var(--amber);">💡 Priority Focus</div>
      <div class="advice-content">
        <p>Training tasks have the biggest long-term impact. Combat tasks help you practice and earn respect.</p>
      </div>
    </div>
  \`;
  
  document.getElementById('progressAdvice').innerHTML = advice;
}

function toggleTask(id) {
  SESSION.tasks[id].completed = !SESSION.tasks[id].completed;
  renderTasks();
}
</script>

</body>
</html>`;
}
