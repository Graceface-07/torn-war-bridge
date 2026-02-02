function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('Tactical HUD V9.8.6')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Server-side: set these in Project Settings > Script properties:
 * API_BASE = https://your-api.example.com
 * API_KEY  = <your_key_here>
 */
const API_BASE = PropertiesService.getScriptProperties().getProperty('API_BASE');
const API_KEY  = PropertiesService.getScriptProperties().getProperty('API_KEY');

function getHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
:root {
  --bg: #0b0f14; --panel: #121822; --panel-2: #151c27;
  --border: #1f2a3a; --text: #e6e9ef; --muted: #9aa7be;
  --amber: #f5b641; --cyan: #52d6ff; --teal: #3ed1a5; --violet: #b78bff;
  --danger: #ff5f6d; --success: #6ae38f;
}
body { margin:0; background:var(--bg); color:var(--text); font-family: 'Inter','Roboto',sans-serif; }
h1,h2,h3,h4 { margin:0; }
.container { display:flex; flex-direction:column; min-height:100vh; }
.topbar { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--panel); border-bottom:1px solid var(--border); }
.status-ribbon { padding:6px 10px; border:1px solid var(--border); border-radius:8px; font-size:12px; color:var(--amber); }
.main { display:flex; flex:1; overflow:hidden; }
.tiles { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; padding:12px; background:var(--panel-2); }
.tile { padding:12px; background:var(--panel); border:1px solid var(--border); border-radius:10px; cursor:pointer; transition:0.15s; }
.tile:hover { border-color:var(--amber); }
.tile.stat { border-left:4px solid var(--amber); }
.tile.war { border-left:4px solid var(--cyan); }
.tile.income { border-left:4px solid var(--teal); }
.tile.faction { border-left:4px solid var(--violet); }
.tile.custom { border-left:4px solid var(--muted); }
.center { flex:1; padding:12px; overflow:auto; }
.helper { position:fixed; right:12px; bottom:12px; width:280px; background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:12px; box-shadow:0 8px 20px rgba(0,0,0,0.35); }
.helper h4 { margin-bottom:6px; }
.helper-section { margin-bottom:8px; font-size:12px; color:var(--muted); }
.helper-section strong { color:var(--text); }
.drawer { position:fixed; left:-320px; top:0; width:300px; height:100%; background:var(--panel); border-right:1px solid var(--border); padding:12px; transition:0.2s; overflow:auto; }
.drawer.open { left:0; }
.drawer-toggle { position:fixed; left:0; top:50%; transform:translate(-50%,-50%); background:var(--amber); color:#000; padding:8px; border-radius:50%; cursor:pointer; font-weight:700; border:2px solid #000; }
.section-title { font-size:13px; color:var(--muted); margin:10px 0 6px; }
.checklist-item { padding:8px; border:1px solid var(--border); border-radius:8px; margin-bottom:6px; background:var(--panel-2); display:flex; align-items:center; gap:8px; }
.checklist-item input { cursor:pointer; }
.badge { padding:2px 6px; border-radius:6px; font-size:11px; color:#000; font-weight:700; }
.badge.week { background:var(--amber); }
.badge.today { background:var(--cyan); color:#000; }
.modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:none; align-items:center; justify-content:center; }
.modal { background:var(--panel); border:1px solid var(--border); border-radius:12px; padding:16px; width:90%; max-width:720px; max-height:85vh; overflow:auto; }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.modal-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; }
.kpi { padding:10px; border:1px solid var(--border); border-radius:10px; background:var(--panel-2); }
.button { background:var(--amber); color:#000; border:none; padding:8px 12px; border-radius:8px; font-weight:700; cursor:pointer; }
.button.secondary { background:var(--panel-2); color:var(--text); border:1px solid var(--border); }
.small { font-size:12px; color:var(--muted); }
/* ID modal */
#idModal .modal { max-width:420px; }
.input-group { display:flex; flex-direction:column; gap:4px; margin-bottom:10px; }
input[type="number"], input[type="text"] { background:var(--panel-2); border:1px solid var(--border); color:var(--text); padding:8px; border-radius:8px; }
.error { color:var(--danger); font-size:12px; }
</style>
</head>
<body>
<div class="container">
  <div class="topbar">
    <div>Command Center v2</div>
    <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
      <div class="small" id="idDisplay">UID: — | Faction: —</div>
      <button class="button secondary" onclick="openIdModal()">IDs</button>
      <button class="button secondary" onclick="resetAll()">Reset data</button>
      <button class="button secondary" onclick="profileInsight()">Profile Insight</button>
      <button class="button" onclick="generatePlan()">Generate Plan</button>
      <div class="status-ribbon" id="statusRibbon">Live</div>
    </div>
  </div>
  <div class="main">
    <div class="center">
      <div class="tiles">
        <div class="tile stat" onclick="openCategory('stat')"><div>Stat Growth</div><div class="small">Default focus</div></div>
        <div class="tile war" onclick="openCategory('war')"><div>War Readiness</div><div class="small">Matches / risk</div></div>
        <div class="tile income" onclick="openCategory('income')"><div>Income</div><div class="small">Money / passive</div></div>
        <div class="tile faction" onclick="openCategory('faction')"><div>Faction Support</div><div class="small">Duties / assists</div></div>
        <div class="tile custom" onclick="openCategory('custom')"><div>Custom</div><div class="small">Your plan</div></div>
      </div>
      <div id="hudArea">
        <!-- Place existing HUD grid + filters here -->
      </div>
    </div>
  </div>
</div>

<div class="drawer" id="drawer">
  <div class="section-title">This Month (Week 1–4)</div>
  <div id="checklist"></div>
</div>
<div class="drawer-toggle" onclick="toggleDrawer()">›</div>

<div class="helper" id="helper">
  <h4>Helper</h4>
  <div class="helper-section"><strong>Quick:</strong> <span id="hQuick">—</span></div>
  <div class="helper-section"><strong>Alternatives:</strong> <span id="hAlt">—</span></div>
  <div class="helper-section"><strong>Caution:</strong> <span id="hCaution">—</span></div>
  <div class="helper-section"><strong>Next step:</strong> <span id="hNext">—</span></div>
</div>

<div class="modal-backdrop" id="backdrop">
  <div class="modal">
    <div class="modal-header">
      <div id="modalTitle">Category</div>
      <button class="button secondary" onclick="closeCategory()">Close</button>
    </div>
    <div class="modal-grid" id="modalKpis"></div>
    <div class="section-title">Tasks (Week 1–4)</div>
    <div id="modalTasks"></div>
  </div>
</div>

<!-- ID Modal -->
<div class="modal-backdrop" id="idModal">
  <div class="modal">
    <div class="modal-header">
      <div>Set IDs</div>
      <button class="button secondary" onclick="closeIdModal()">Close</button>
    </div>
    <div class="input-group">
      <label class="small">User Name (optional)</label>
      <input type="text" id="userNameInput" placeholder="Enter your name">
    </div>
    <div class="input-group">
      <label class="small">User ID (numbers)</label>
      <input type="number" id="userIdInput" placeholder="Enter your User ID">
    </div>
    <div class="input-group">
      <label class="small">Faction Name (optional)</label>
      <input type="text" id="factionNameInput" placeholder="Enter faction name">
    </div>
    <div class="input-group">
      <label class="small">Faction ID (numbers)</label>
      <input type="number" id="factionIdInput" placeholder="Enter faction ID">
    </div>
    <div class="error" id="idError"></div>
    <button class="button" onclick="saveIds()">Save</button>
  </div>
</div>

<script>
const categories = {
  stat:    { key:'stat',    name:'Stat Growth',     color:'var(--amber)' },
  war:     { key:'war',     name:'War Readiness',   color:'var(--cyan)' },
  income:  { key:'income',  name:'Income',          color:'var(--teal)' },
  faction: { key:'faction', name:'Faction Support', color:'var(--violet)' },
  custom:  { key:'custom',  name:'Custom',          color:'var(--muted)' },
};

const defaults = {
  tasks: [],
  currentCategory: 'stat',
  userId: '',
  userName: '',
  factionId: '',
  factionName: '',
  kpis: {}
};

let state = { ...defaults };

function save() { localStorage.setItem('twb_state', JSON.stringify(state)); }
function load() {
  const raw = localStorage.getItem('twb_state');
  if (raw) state = { ...defaults, ...JSON.parse(raw) };
}

function resetAll() {
  localStorage.removeItem('twb_state');
  state = { ...defaults };
  renderAll();
  openIdModal();
}

function toggleDrawer() {
  document.getElementById('drawer').classList.toggle('open');
}

function renderChecklist(goalId) {
  const wrap = document.getElementById('checklist');
  wrap.innerHTML = '';
  const buckets = ['week1','week2','week3','week4','month','today'];
  buckets.forEach(b => {
    const section = document.createElement('div');
    section.innerHTML = \`<div class="section-title">\${labelBucket(b)}</div>\`;
    state.tasks.filter(t => (!goalId || t.goalId===goalId) && t.bucket===b)
      .forEach(t => section.appendChild(renderTaskItem(t)));
    wrap.appendChild(section);
  });
}

function renderTaskItem(t) {
  const div = document.createElement('div');
  div.className = 'checklist-item';
  div.innerHTML = \`
    <input type="checkbox" \${t.status==='done'?'checked':''} onchange="toggleTask('\${t.id}')">
    <div>
      <div>\${t.title}</div>
      <div class="small">\${t.note||''}</div>
    </div>
    <span class="badge week">\${labelBucket(t.bucket)}</span>
  \`;
  return div;
}

function toggleTask(id) {
  state.tasks = state.tasks.map(t => t.id===id ? {...t, status: t.status==='done'?'todo':'done'} : t);
  save(); renderAll();
}
function labelBucket(b) {
  if (b==='today') return 'Today';
  if (b==='month') return 'Month';
  return b.replace('week','Week ');
}

function openCategory(cat) {
  state.currentCategory = cat || 'stat';
  const c = categories[state.currentCategory];
  document.getElementById('modalTitle').textContent = c.name;
  renderModalKpis(c);
  renderModalTasks(c);
  document.getElementById('backdrop').style.display = 'flex';
  helperSuggest(c);
}
function closeCategory() { document.getElementById('backdrop').style.display = 'none'; }

function renderModalKpis(cat) {
  const el = document.getElementById('modalKpis');
  el.innerHTML = '';
  const keyLower = cat.name ? cat.name.toLowerCase() : '';
  const kpis = getKpis(cat, keyLower);
  kpis.forEach(k => {
    const d = document.createElement('div');
    d.className = 'kpi';
    d.innerHTML = \`<div class="small">\${k.label}</div><div style="font-size:16px;font-weight:700;">\${k.value}</div><div class="small">\${k.sub||''}</div>\`;
    el.appendChild(d);
  });
}
function renderModalTasks(cat) {
  const el = document.getElementById('modalTasks');
  el.innerHTML = '';
  state.tasks.filter(t => t.goalId===state.currentCategory).forEach(t => el.appendChild(renderTaskItem(t)));
}

function getKpis(cat, keyLower) {
  const data = state.kpis[cat.key] || (keyLower ? state.kpis[keyLower] : undefined);
  if (cat.name === 'Stat Growth') {
    const d = data || {};
    const done = d.sessionsDone != null ? d.sessionsDone : 3;
    const plan = d.sessionsPlanned != null ? d.sessionsPlanned : 5;
    return [
      {label:'Sessions done / planned', value:\`\${done} / \${plan}\`, sub:'Today'},
      {label:'Time spent', value:d.timeSpent || '45m', sub:'Today'},
      {label:'Est. gain', value:d.estGain || '+1.2%', sub:'This week'},
      {label:'FF band align', value:d.ffBand || '3.8–4.4x', sub:'On target'},
    ];
  }
  if (cat.name === 'War Readiness') {
    const d = data || {};
    return [{label:'Progress', value:d.progress || '—', sub:d.sub || 'Coming soon'}];
  }
  return [{label:'Progress', value:'—', sub:'Coming soon'}];
}

function helperSuggest(cat) {
  const q = document.getElementById('hQuick');
  const a = document.getElementById('hAlt');
  const c = document.getElementById('hCaution');
  const n = document.getElementById('hNext');
  if (cat.name === 'Stat Growth') {
    q.textContent = 'Run 2 more stat sessions; focus on your best multiplier.';
    a.textContent = 'If blocked, do a short warm-up or plan for Week 2.';
    c.textContent = 'Avoid burning energy if hospital countdown <15m.';
    n.textContent = 'Re-check FF band and rerun scout in 30–45s.';
  } else {
    q.textContent = 'Prioritize this category now.';
    a.textContent = 'If blocked, shift to Stat Growth tasks.';
    c.textContent = 'Watch timers/limits before committing.';
    n.textContent = 'Set 1–2 tasks in Week 1, then proceed.';
  }
}

function generatePlan() {
  if (!state.tasks.length) {
    state.tasks = [
      {id:'t1', title:'Do 2 stat sessions', goalId:'stat', status:'todo', bucket:'week1', note:'Use best gym bonus', link:'', createdAt:Date.now(), updatedAt:Date.now()},
      {id:'t2', title:'Check FF band targets', goalId:'war', status:'todo', bucket:'week1', note:'Aim 3.5–4.4x', link:'', createdAt:Date.now(), updatedAt:Date.now()},
      {id:'t3', title:'Set income routine', goalId:'income', status:'todo', bucket:'week2', note:'Pick passive cycle', link:'', createdAt:Date.now(), updatedAt:Date.now()},
    ];
    save();
  }
  renderAll();
}

function profileInsight() {
  if (!state.tasks.some(t => t.goalId==='stat')) {
    state.tasks.push({id:'t4', title:'Profile-based: stat push', goalId:'stat', status:'todo', bucket:'week1', note:'Suggested by profile insight', link:'', createdAt:Date.now(), updatedAt:Date.now()});
    save();
    renderAll();
  }
}

function openIdModal() {
  document.getElementById('userNameInput').value = state.userName || '';
  document.getElementById('userIdInput').value = state.userId || '';
  document.getElementById('factionNameInput').value = state.factionName || '';
  document.getElementById('factionIdInput').value = state.factionId || '';
  document.getElementById('idError').textContent = '';
  document.getElementById('idModal').style.display = 'flex';
}
function closeIdModal() { document.getElementById('idModal').style.display = 'none'; }

function saveIds() {
  const uName = document.getElementById('userNameInput').value.trim();
  const uId = document.getElementById('userIdInput').value.trim();
  const fName = document.getElementById('factionNameInput').value.trim();
  const fId = document.getElementById('factionIdInput').value.trim();
  const err = document.getElementById('idError');
  err.textContent = '';

  if (!uId || isNaN(Number(uId))) { err.textContent = 'User ID must be numeric.'; return; }
  if (!fId || isNaN(Number(fId))) { err.textContent = 'Faction ID must be numeric.'; return; }

  state.userName = uName;
  state.userId = uId;
  state.factionName = fName;
  state.factionId = fId;
  save();
  renderIds();
  closeIdModal();
  autoFillNames(uId, fId);
}

function renderIds() {
  const uLabel = state.userName ? \`\${state.userName} (\${state.userId||'—'})\` : (state.userId || '—');
  const fLabel = state.factionName ? \`\${state.factionName} (\${state.factionId||'—'})\` : (state.factionId || '—');
  document.getElementById('idDisplay').textContent = \`UID: \${uLabel} | Faction: \${fLabel}\`;
}

function setStatus(text, colorVar) {
  const el = document.getElementById('statusRibbon');
  el.textContent = text;
  el.style.color = `var(${colorVar})`;
}

// Client -> Server: resolve names by ID using google.script.run
function autoFillNames(uId, fId) {
  if (!uId && !fId) return;
  setStatus('Fetching...', '--cyan');
  google.script.run
    .withSuccessHandler(function(res) {
      if (res.userName) state.userName = res.userName;
      if (res.factionName) state.factionName = res.factionName;
      save();
      renderIds();
      setStatus('Live', '--amber');
    })
    .withFailureHandler(function(err) {
      console.error(err);
      setStatus('Error', '--danger');
    })
    .resolveUserFaction(uId, fId);
}

function renderAll() {
  renderChecklist();
  renderIds();
  if (document.getElementById('backdrop').style.display==='flex') {
    renderModalTasks(categories[state.currentCategory]);
    renderModalKpis(categories[state.currentCategory]);
  }
  helperSuggest(categories[state.currentCategory]);
}

(function init(){
  load();
  renderAll();
  if (!state.userId || !state.factionId) openIdModal();
  else autoFillNames(state.userId, state.factionId);
})();
</script>
</body>
</html>`;
}

/**
 * Server-side: fetch user/faction names from your API.
 * Replace path construction with your real endpoints.
 */
function resolveUserFaction(userId, factionId) {
  const out = {};
  if (!API_BASE || !API_KEY) throw new Error('API_BASE or API_KEY not set in Script properties');
  if (userId) {
    const u = fetchJson_( '/user/' + userId );
    out.userName = u.name || '';
  }
  if (factionId) {
    const f = fetchJson_( '/faction/' + factionId );
    out.factionName = f.name || '';
  }
  return out;
}

function fetchJson_(path) {
  const url = API_BASE.replace(/\/$/,'') + path;
  const res = UrlFetchApp.fetch(url, {
    method: 'get',
    muteHttpExceptions: true,
    headers: {
      'Authorization': API_KEY ? 'Bearer ' + API_KEY : '',
      'Content-Type': 'application/json',
    }
  });
  const code = res.getResponseCode();
  const body = res.getContentText();
  if (code < 200 || code >= 300) {
    throw new Error('HTTP ' + code + ' ' + body);
  }
  return JSON.parse(body || '{}');
}