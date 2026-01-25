// const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT
// const SC_KEY = 'rwLgZTyqgWDxhoCx';
// const WORKER_URL = 'https://torn-war-bridge.tmecf.workers.dev/';

function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('TACTICAL HUD V1.9.8')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// SERVER SIDE FETCHERS
function getScouterData(tid, uid) {
  const url = "https://ffscouter.com/api/v1/get-stats?key=" + SC_KEY + "&targets=" + tid + "&user_id=" + uid;
  const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  return JSON.parse(res.getContentText());
}

function fetchFactionMembersV2(fid) {
  try {
    const url = `https://api.torn.com/v2/faction/${fid}/members?key=${TORN_API_KEY}`;
    const res = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    return {
      name: res.name || 'UNKNOWN',
      members: res.members || {}
    };
  } catch (e) {
    return { name: 'UNKNOWN', members: {} };
  }
}
function fetchUserTorn(uid) {
  try {
    const url = `https://api.torn.com/user/${uid}?selections=basic,profile&key=${SC_KEY}`; 
    return JSON.parse(UrlFetchApp.fetch(url).getContentText());
  } catch (e) {
    return {};
  }
}


function getHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  :root { --secure: #00ff88; --prime: #00e5ff; --risky: #ffaa00; --suicide: #ff4444; --bg: #0a0a0b; --card: #16161a; }
  body { background: var(--bg); color: #e0e0e0; font-family: 'Segoe UI', Roboto, sans-serif; display: flex; margin: 0; height: 100vh; overflow: hidden; }
  
  /* Sidebar */
  .sidebar { width: 240px; background: #111; border-right: 1px solid #222; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
  .stat-box { background: #000; padding: 12px; border-radius: 8px; border-left: 3px solid var(--prime); margin-bottom: 10px; }
  .label { font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase; }
  
  input { width: 100%; padding: 10px; background: #1a1a1d; border: 1px solid #333; color: #fff; border-radius: 4px; box-sizing: border-box; }
  button { width: 100%; padding: 12px; background: #222; color: #fff; border: 1px solid #444; border-radius: 6px; cursor: pointer; text-align: left; font-weight: bold; transition: 0.2s; }
  button:hover { background: #333; border-color: var(--prime); }
  .btn-push { color: var(--prime); border: 1px dashed var(--prime); margin-top: auto; text-align: center; }
  
  /* Main Content */
  .main { flex: 1; padding: 25px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
  .faction-header { font-size: 24px; font-weight: bold; color: var(--prime); border-bottom: 1px solid #333; padding-bottom: 10px; }
  
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
  .card { background: var(--card); border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #222; transition: 0.3s; }
  .card:hover { transform: translateY(-2px); border-color: #444; }
  
  /* Visual Trace Bar */
  #progress-container { background: #111; padding: 15px; border-radius: 10px; border: 1px solid #222; }
  .bar-bg { background: #000; height: 4px; width: 100%; border-radius: 2px; margin-top: 8px; }
  .bar-fill { height: 100%; width: 0%; background: var(--prime); box-shadow: 0 0 10px var(--prime); transition: 0.3s; }
</style>
</head>
<body>

<div class="sidebar">
  <div class="stat-box">
    <div class="label">Operator</div>
    <div id="op-name" style="color:var(--prime)">OFFLINE</div>
    <div class="label" style="margin-top:8px;">Power Level</div>
    <div id="op-stats">0</div>
  </div>

  <input type="text" id="uid" placeholder="YOUR UID">
  <input type="text" id="fid" placeholder="TARGET FACTION ID">
  
  <button onclick="runTacticalScan()">Execute Scan</button>
  <button onclick="showReport()">Generate Report</button>
  <button id="push-btn" class="btn-push" onclick="pushToKV()">Daily KV Push</button>
</div>

<div class="main">
  <div id="fac-name" class="faction-header">SYSTEM READY</div>
  
  <div id="progress-container" style="display:none;">
    <div style="display:flex; justify-content:space-between; font-size:11px;">
      <span id="p-status">TRACING TARGETS...</span>
      <span id="p-percent">0%</span>
    </div>
    <div class="bar-bg"><div id="p-fill" class="bar-fill"></div></div>
  </div>

  <div id="grid" class="grid"></div>
</div>

<script>
let SESSION = { data: [], myStats: 0, uid: null };

function runTacticalScan() {
  const uid = document.getElementById('uid').value;
  const fid = document.getElementById('fid').value;
  if(!uid || !fid) return alert("Credentials missing.");
  
  SESSION.uid = uid;
  document.getElementById('grid').innerHTML = "";
  document.getElementById('progress-container').style.display = "block";
  
  google.script.run.withSuccessHandler(user => {
    document.getElementById('op-name').textContent = user.name;
    document.getElementById('op-stats').textContent = formatNum(user.total);
    SESSION.myStats = user.total;

    google.script.run.withSuccessHandler(fac => {
      document.getElementById('fac-name').textContent = fac.name.toUpperCase();
      const members = Object.keys(fac.members);
      let count = 0;

      members.forEach(id => {
        google.script.run.withSuccessHandler(scouter => {
          const s = Array.isArray(scouter) ? scouter[0] : scouter;
          const stats = Number(s.bs_estimate) || 0;
          const ff = Number(s.fair_fight) || 1.0;
          const tier = getTier(stats);
          
          const obj = { id, name: fac.members[id].name, stats, ff, tier };
          SESSION.data.push(obj);
          renderCard(obj);

          count++;
          let pct = Math.round((count/members.length)*100);
          document.getElementById('p-fill').style.width = pct + "%";
          document.getElementById('p-percent').textContent = pct + "%";
          if(count === members.length) setTimeout(()=>document.getElementById('progress-container').style.display="none", 1000);
        }).getScouterData(id, uid);
      });
    }).getFactionData(fid);
  }).getUserName(uid);
}

function getTier(bs) {
  if (bs < SESSION.myStats * 0.5) return 'secure';
  if (bs < SESSION.myStats * 1.0) return 'prime';
  if (bs < SESSION.myStats * 2.0) return 'risky';
  return 'suicide';
}

function renderCard(o) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.borderLeft = "4px solid var(--"+o.tier+")";
  card.innerHTML = \`
    <div>
      <div style="font-weight:bold;">\${o.name}</div>
      <div style="font-size:10px; color:#666;">ID: \${o.id}</div>
    </div>
    <div style="text-align:right;">
      <div style="color:var(--\${o.tier}); font-weight:bold;">\${o.ff.toFixed(2)}x</div>
      <div style="font-size:12px;">\${formatNum(o.stats)}</div>
    </div>\`;
  document.getElementById('grid').appendChild(card);
}

async function pushToKV() {
  const btn = document.getElementById('push-btn');
  btn.textContent = "UPLOADING...";
  for (let item of SESSION.data) {
    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spies: [{ player_id: item.id, name: item.name, total_stats: item.stats, operator: SESSION.uid }] })
      });
      const ack = await res.json();
      if(!ack.ok) throw "Fail";
    } catch(e) { btn.textContent = "HTTPS ERROR"; return; }
  }
  btn.textContent = "SYNC COMPLETE";
}

function formatNum(n) {
  if (n >= 1e9) return (n/1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
  return n.toLocaleString();
}

function showReport() {
  const summary = SESSION.data.reduce((acc, curr) => { acc[curr.tier]++; return acc; }, {secure:0, prime:0, risky:0, suicide:0});
  alert("WAR REPORT:\\nSecure: " + summary.secure + "\\nPrime: " + summary.prime + "\\nRisky: " + summary.risky + "\\nSuicide: " + summary.suicide);
}
</script>
</body>
</html>`;
}

function saveReportToDrive(content) {
  try {
    const fileName = `HUD_REPORT_${new Date().toISOString().split('T')[0]}.txt`;
    DriveApp.createFile(fileName, content);
    return "SUCCESS: Saved to Drive root.";
  } catch(e) { return "ERROR: " + e.message; }
}