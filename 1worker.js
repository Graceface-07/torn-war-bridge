<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Command Hub | Torn Tactical</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --bg:#0b0f14; --panel:#121822; --panel2:#151c27; --border:#1f2a3a;
      --text:#e6e9ef; --muted:#9aa7be; --amber:#f5b641; --cyan:#52d6ff;
      --teal:#3ed1a5; --violet:#b78bff; --danger:#ff5f6d; --success:#6ae38f;
    }
    * { box-sizing:border-box; }
    body { margin:0; background:var(--bg); color:var(--text); font-family:'Inter','Roboto',sans-serif; font-size:16px; }
    button { cursor:pointer; font-size:15px; }
    .app-container { min-height:100vh; display:flex; flex-direction:column; }
    .topbar { display:flex; justify-content:space-between; padding:14px 18px; background:var(--panel); border-bottom:1px solid var(--border); gap:12px; flex-wrap:wrap; }
    .brand { font-weight:700; font-size:18px; }
    .subtitle { color:var(--muted); font-size:14px; }
    .id-inputs { display:flex; gap:8px; flex-wrap:wrap; }
    .id-inputs input { padding:10px; border:1px solid var(--border); border-radius:10px; background:var(--panel2); color:var(--text); min-width:160px; }
    .btn { background:var(--amber); color:#000; border:none; padding:10px 14px; border-radius:10px; font-weight:700; }
    .btn.btn-secondary { background:var(--panel2); color:var(--text); border:1px solid var(--border); }
    .status-ribbon { padding:8px 12px; border:1px solid var(--border); border-radius:10px; font-size:13px; color:var(--amber); }
    .layout { display:flex; flex:1; overflow:hidden; }
    .drawer { position:relative; width:360px; background:var(--panel); border-right:1px solid var(--border); padding:14px; overflow:auto; }
    .drawer-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .drawer-title { font-weight:700; }
    .drawer-sub { color:var(--muted); font-size:13px; }
    .filters label { display:flex; flex-direction:column; gap:4px; color:var(--muted); font-size:13px; margin-bottom:10px; }
    select, input, textarea { background:var(--panel2); border:1px solid var(--border); color:var(--text); padding:10px; border-radius:10px; font-size:15px; }
    textarea { min-height:60px; }
    .task-form { display:flex; flex-direction:column; gap:10px; margin:12px 0; }
    .form-actions { display:flex; gap:10px; }
    .task-list { display:flex; flex-direction:column; gap:10px; }
    .task-item { padding:10px; border:1px solid var(--border); border-radius:10px; background:var(--panel2); }
    .main { flex:1; padding:14px; overflow:auto; display:flex; flex-direction:column; gap:12px; }
    .top-controls { display:flex; gap:10px; flex-wrap:wrap; }
    .tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; }
    .tile { padding:14px; background:var(--panel); border:1px solid var(--border); border-radius:12px; }
    .tile-title { font-weight:700; }
    .tile-sub { color:var(--muted); font-size:13px; }
    .stat-band { display:flex; gap:40px; padding:12px; background:var(--panel); border:1px solid var(--border); border-radius:12px; }
    .band-label { color:var(--muted); font-size:13px; }
    .band-value { font-size:22px; font-weight:700; }
    .hub-grid { display:flex; gap:12px; flex-wrap:wrap; }
    .hub-col { flex:1; min-width:260px; }
    .card { background:var(--panel2); border:1px solid var(--border); border-radius:12px; padding:12px; min-height:80px; }
    .label { color:var(--muted); font-size:13px; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.6px; }
    .reports-area .report-row { display:flex; gap:12px; flex-wrap:wrap; }
    .report-block { flex:1; min-width:260px; }
    .sub-label { color:var(--muted); font-size:13px; margin-bottom:6px; }
    .helper { position:fixed; right:14px; bottom:14px; width:300px; background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:14px; box-shadow:0 8px 20px rgba(0,0,0,0.35); font-size:14px; }
    .helper-title { font-weight:700; margin-bottom:8px; }
    .helper-row { margin-bottom:6px; color:var(--muted); }
    .loading-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.4); align-items:center; justify-content:center; z-index:20; }
    .loading-overlay.active { display:flex; }
    .loader { width:60px; height:60px; border:8px solid var(--panel2); border-top:8px solid var(--amber); border-radius:50%; animation:spin 1s linear infinite; }
    @keyframes spin { 100% { transform:rotate(360deg); } }
    .modal { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); align-items:center; justify-content:center; z-index:30; }
    .modal-body { background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:18px; min-width:320px; max-width:90vw; max-height:85vh; overflow:auto; position:relative; }
    .close { position:absolute; right:10px; top:6px; font-size:22px; color:var(--muted); cursor:pointer; }
    .data-row { display:flex; flex-wrap:wrap; gap:6px 12px; margin-bottom:6px; }
    .data-label { color:var(--muted); font-size:13px; font-weight:700; }
    .data-value { font-size:15px; }
    .placeholder { color:var(--danger); }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="topbar">
      <div class="brand-block">
        <div class="brand">Command Hub</div>
        <div class="subtitle">Torn Tactical HUD</div>
      </div>
      <div class="top-actions">
        <div class="id-inputs">
          <input id="userId" type="number" placeholder="Operator (User ID)">
          <input id="factionId" type="number" placeholder="Faction ID">
          <input id="apiKey" type="password" placeholder="Torn API Key">
          <button id="saveIds" class="btn btn-primary">Save</button>
        </div>
        <div class="status-ribbon" id="apiStatus" aria-live="polite">Idle</div>
      </div>
    </header>

    <div class="layout">
      <aside class="drawer" id="drawer">
        <div class="drawer-header">
          <div>
            <div class="drawer-title">Plan & Checklist</div>
            <div class="drawer-sub">Month · Week 1–4 · Filters</div>
          </div>
          <button id="drawerToggle" class="btn btn-secondary">Close</button>
        </div>

        <div class="filters">
          <label>Goal
            <select id="filterGoal"></select>
          </label>
          <label>Status
            <select id="filterStatus">
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
          </label>
          <label>Time
            <select id="filterTime">
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </label>
        </div>

        <form id="taskForm" class="task-form">
          <input type="hidden" id="taskId" value="">
          <label>Title
            <input type="text" id="taskTitle" required placeholder="Task title">
          </label>
          <label>Goal
            <select id="taskGoal"></select>
          </label>
          <label>Bucket
            <select id="taskBucket">
              <option value="today">Today</option>
              <option value="week1">Week 1</option>
              <option value="week2">Week 2</option>
              <option value="week3">Week 3</option>
              <option value="week4">Week 4</option>
              <option value="month">Month</option>
            </select>
          </label>
          <label>Note
            <textarea id="taskNote" rows="2" placeholder="Add a note"></textarea>
          </label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Save Task</button>
            <button type="button" id="resetForm" class="btn btn-secondary">Clear</button>
          </div>
        </form>

        <div id="taskList" class="task-list"></div>
      </aside>

      <main class="main">
        <div class="top-controls">
          <button id="openDrawer" class="btn btn-secondary">Open Plan</button>
          <button class="btn btn-secondary" data-action="player">Load Player Stats</button>
          <button class="btn btn-secondary" data-action="faction">Load Faction Info</button>
          <button class="btn btn-secondary" data-action="members">Load Members</button>
          <button class="btn btn-primary" id="generateReportBtn">Generate Reports</button>
        </div>

        <section class="tiles" id="categoryTiles">
          <div class="tile" data-category="stat">
            <div class="tile-title">Stat Growth</div>
            <div class="tile-sub">Default focus</div>
          </div>
          <div class="tile" data-category="war">
            <div class="tile-title">War Readiness</div>
            <div class="tile-sub">Matches / risk</div>
          </div>
          <div class="tile" data-category="income">
            <div class="tile-title">Income</div>
            <div class="tile-sub">Money / passive</div>
          </div>
          <div class="tile" data-category="faction">
            <div class="tile-title">Faction Support</div>
            <div class="tile-sub">Duties / assists</div>
          </div>
          <div class="tile" data-category="custom">
            <div class="tile-title">Custom</div>
            <div class="tile-sub">Your plan</div>
          </div>
        </section>

        <section class="stat-band band-operator">
          <div>
            <div class="band-label">Operator</div>
            <div id="h-user" class="band-value">---</div>
          </div>
          <div>
            <div class="band-label">Power</div>
            <div id="h-power" class="band-value">---</div>
          </div>
        </section>

        <section class="hub-grid" id="hudArea">
          <div class="hub-col">
            <div class="label">Player</div>
            <div id="playerContent" class="card"></div>
          </div>
          <div class="hub-col">
            <div class="label">Faction</div>
            <div id="factionContent" class="card"></div>
          </div>
          <div class="hub-col">
            <div class="label">Members</div>
            <div id="membersContent" class="card"></div>
          </div>
        </section>

        <section class="reports-area">
          <div class="label">Reports & Faction Comparison</div>
          <div class="report-row">
            <div class="report-block">
              <div class="sub-label">Operator Report</div>
              <div id="operatorReport" class="card"></div>
            </div>
            <div class="report-block">
              <div class="sub-label">Faction Comparison</div>
              <div id="factionComparison" class="card"></div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <div class="helper" id="helperPanel">
      <div class="helper-title">Helper</div>
      <div class="helper-row"><strong>Quick:</strong> <span id="hQuick">Set IDs and load Player/Faction.</span></div>
      <div class="helper-row"><strong>Alternatives:</strong> <span id="hAlt">Use cached data if API is slow.</span></div>
      <div class="helper-row"><strong>Caution:</strong> <span id="hCaution">Respect rate limits.</span></div>
      <div class="helper-row"><strong>Next step:</strong> <span id="hNext">Open Plan and add Week 1 tasks.</span></div>
    </div>

    <div id="loadingOverlay" class="loading-overlay"><div class="loader"></div></div>
    <div id="modal" class="modal">
      <div class="modal-body" id="modalBody"></div>
      <span class="close" id="modalClose">&times;</span>
    </div>
  </div>

  <script>
    const API_CONFIG = { CACHE_TIMEOUT: 5 * 60 * 1000, BASE_URL: 'https://api.torn.com' };
    class TornAPIService {
      constructor() { this.cache = new Map(); this.cacheTimeout = API_CONFIG.CACHE_TIMEOUT; }
      clearCache(){ this.cache.clear(); }
      async fetch(url, options = {}) {
        const cacheKey = url;
        if (this.cache.has(cacheKey)) {
          const cached = this.cache.get(cacheKey);
          if (Date.now() - cached.timestamp < this.cacheTimeout) return cached.data;
        }
        const response = await fetch(url, { method:'GET', ...options });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        const data = await response.json();
        if (data.error) throw new Error(data.error.error || data.error);
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      }
      async getPlayerData(playerId, apiKey) {
        return this.fetch(`${API_CONFIG.BASE_URL}/user/${playerId}?selections=profile,battlestats&key=${apiKey}`);
      }
      async getFactionData(factionId, apiKey) {
        return this.fetch(`${API_CONFIG.BASE_URL}/v2/faction/${factionId}?selections=basic,members&key=${apiKey}`);
      }
      async getUserDisplay(userId, apiKey) {
        const res = await this.fetch(`${API_CONFIG.BASE_URL}/user/${userId}?selections=profile,battlestats&key=${apiKey}`);
        return { name: (res.name || "OPERATOR").toUpperCase(), total: Number(res.total || 0) };
      }
    }
    const apiService = new TornAPIService();

    class CommandHub {
      constructor() {
        this.uid = localStorage.getItem('tornUserId') || '';
        this.fid = localStorage.getItem('tornFactionId') || '';
        this.apiKey = localStorage.getItem('tornApiKey') || '';
        this.session = { name: '', myStats: 0, members: [], faction: null };
        this.init();
      }
      init() {
        this.setupEventListeners();
        this.loadIdsStatus();
      }
      setupEventListeners() {
        document.getElementById('saveIds').addEventListener('click', () => this.saveIds());
        document.querySelectorAll('[data-action]').forEach(btn => {
          btn.addEventListener('click', e => this.handleAction(e.currentTarget.dataset.action));
        });
        document.getElementById('generateReportBtn').addEventListener('click', () => this.generateReports());
        document.querySelector('.close')?.addEventListener('click', () => this.closeModal());
        document.getElementById('modalClose')?.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', e => { if (e.target.id === 'modal') this.closeModal(); });
      }
      saveIds() {
        const uid = document.getElementById('userId').value.trim();
        const fid = document.getElementById('factionId').value.trim();
        const key = document.getElementById('apiKey').value.trim();
        if (!uid || !fid || !key) { this.showStatus('User ID, Faction ID, and API Key required', 'error'); return; }
        this.uid = uid; this.fid = fid; this.apiKey = key;
        localStorage.setItem('tornUserId', uid);
        localStorage.setItem('tornFactionId', fid);
        localStorage.setItem('tornApiKey', key);
        this.showStatus('IDs & API key saved', 'success');
      }
      loadIdsStatus() {
        if (this.uid) document.getElementById('userId').value = this.uid;
        if (this.fid) document.getElementById('factionId').value = this.fid;
        if (this.apiKey) document.getElementById('apiKey').value = this.apiKey;
        if (this.uid && this.fid && this.apiKey) this.showStatus('IDs & API key loaded', 'success');
      }
      showStatus(msg, type) {
        const el = document.getElementById('apiStatus');
        el.textContent = msg;
        el.className = `status-ribbon ${type || ''}`.trim();
      }
      showLoading(){ document.getElementById('loadingOverlay')?.classList.add('active'); }
      hideLoading(){ document.getElementById('loadingOverlay')?.classList.remove('active'); }

      async handleAction(action, forceRefresh = false) {
        if (!this.uid || !this.fid || !this.apiKey) {
          this.showStatus('Set User ID, Faction ID, and API Key', 'error'); return;
        }
        this.showLoading();
        try {
          switch (action) {
            case 'player': await this.loadPlayerStats(forceRefresh); break;
            case 'faction': await this.loadFactionStats(forceRefresh); break;
            case 'members': await this.loadMembers(forceRefresh); break;
          }
        } catch (err) {
          const msg = err?.message || 'Request failed';
          if (msg.toLowerCase().includes('429')) this.showStatus('Rate limited: slow down', 'error');
          else this.showStatus(`Error: ${msg}`, 'error');
          console.error('Action error:', err);
        } finally { this.hideLoading(); }
      }

      async loadPlayerStats(forceRefresh=false) {
        if (forceRefresh) apiService.clearCache();
        const res = await apiService.getUserDisplay(this.uid, this.apiKey);
        this.session.name = res.name;
        this.session.myStats = res.total;
        document.getElementById('h-user').textContent = res.name;
        document.getElementById('h-power').textContent = this.formatStats(res.total);
        document.getElementById('playerContent').innerHTML = `
          <div class="data-row"><span class="data-label">Operator:</span><span class="data-value">${res.name}</span></div>
          <div class="data-row"><span class="data-label">Power Stats:</span><span class="data-value">${this.formatStats(res.total)}</span></div>
        `;
        localStorage.setItem('playerData', JSON.stringify(res));
      }

      async loadFactionStats(forceRefresh=false) {
        if (forceRefresh) apiService.clearCache();
        const f = await apiService.getFactionData(this.fid, this.apiKey);
        this.session.faction = f;
        const basic = f.basic || {};
        document.getElementById('factionContent').innerHTML = `
          <div class="data-row"><span class="data-label">Faction Name:</span><span class="data-value">${basic.name || 'N/A'}</span></div>
          <div class="data-row"><span class="data-label">Members:</span><span class="data-value">${Object.keys(f.members || {}).length}</span></div>
          <div class="data-row"><span class="data-label">Respect:</span><span class="data-value">${this.formatStats(basic.respect || 0)}</span></div>
          <div class="data-row"><span class="data-label">Age:</span><span class="data-value">${basic.age || 0}</span></div>
        `;
        localStorage.setItem('factionData', JSON.stringify(f));
      }

      async loadMembers(forceRefresh=false) {
        if (forceRefresh) apiService.clearCache();
        const f = await apiService.getFactionData(this.fid, this.apiKey);
        this.session.members = [];
        const cont = document.getElementById('membersContent');
        cont.innerHTML = '';
        Object.keys(f.members || {}).forEach(id => {
          const m = f.members[id];
          this.session.members.push(m);
          cont.innerHTML += `
            <div class="data-row" style="margin-bottom:8px;">
              <span class="data-label">Name:</span><span class="data-value">${m.name || "N/A"}</span>
              <span class="data-label">Level:</span><span class="data-value">${m.level || "?"}</span>
              <span class="data-label">Days in Faction:</span><span class="data-value">${m.days_in_faction || "?"}</span>
              <span class="data-label">Position:</span><span class="data-value">${m.position || "?"}</span>
              <span class="data-label">Status:</span><span class="data-value">${(m.last_action && m.last_action.status) || "?"}</span>
            </div>
          `;
        });
        localStorage.setItem('membersData', JSON.stringify(this.session.members));
      }

      generateReports() {
        const player = this.session.name || "---";
        const power = this.session.myStats ? this.formatStats(this.session.myStats) : "---";
        document.getElementById('operatorReport').innerHTML = `
          <div class="data-row"><span class="data-label">Operator:</span><span class="data-value">${player}</span></div>
          <div class="data-row"><span class="data-label">Power:</span><span class="data-value">${power}</span></div>
        `;
        const f = this.session.faction;
        const basic = (f && f.basic) ? f.basic : {};
        document.getElementById('factionComparison').innerHTML = f ? `
          <div class="data-row"><span class="data-label">Name:</span><span class="data-value">${basic.name || 'N/A'}</span></div>
          <div class="data-row"><span class="data-label">Respect:</span><span class="data-value">${this.formatStats(basic.respect || 0)}</span></div>
          <div class="data-row"><span class="data-label">Age:</span><span class="data-value">${basic.age || 0}</span></div>
          <div class="data-row"><span class="data-label">Members:</span><span class="data-value">${Object.keys(f.members || {}).length}</span></div>
        ` : `<span style="color:var(--danger);">No faction data loaded.</span>`;
      }

      closeModal(){ const m=document.getElementById('modal'); if(m) m.style.display='none'; }
      formatStats(num){ if(!num||num===0) return "---"; if(num>=1e9) return (num/1e9).toFixed(2)+'B'; if(num>=1e6) return (num/1e6).toFixed(1)+'M'; return Number(num).toLocaleString(); }
    }

    window.commandHub = new CommandHub();
  </script>
</body>
</html>