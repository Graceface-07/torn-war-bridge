const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx';

function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('TACTICAL HUD V1.8.10')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getScouterDataBatch(targetsCsv, uid) {
  try {
    const url = "https://ffscouter.com/api/v1/get-stats?key=" + SC_KEY + "&targets=" + targetsCsv + "&user_id=" + uid;
    return JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText());
  } catch (e) { return []; }
}

function getFactionData(fid) {
  try {
    const res = UrlFetchApp.fetch("https://api.torn.com/faction/"+fid+"?selections=basic&key="+TORN_API_KEY, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    return { name: (data.name || "UNKNOWN FACTION").toUpperCase(), members: data.members };
  } catch (e) { return { name: "OFFLINE", members: {} }; }
}

function getUserName(uid) {
  try {
    const res = JSON.parse(UrlFetchApp.fetch("https://api.torn.com/user/"+uid+"?selections=profile,battlestats&key="+TORN_API_KEY, { muteHttpExceptions: true }).getContentText());
    return { 
      name: (res.name || "OPERATOR").toUpperCase(), 
      total: Number(res.total_battlestats) || 0 
    };
  } catch (e) { return { name: "FETCH FAIL", total: 0 }; }
}

function getHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Inter:wght@400;600&display=swap');
:root {
  --amber:#f6da00; --green:#00ff88; --blue:#009fff; --red:#ff3333; --bg:#000;
  --panel:#1c1c1c; --border:#333; --text:#eee;
}
body { background:var(--bg); color:var(--text); font-family:'Inter', sans-serif; margin:0; overflow:hidden; height:100vh; width:100vw; padding:15px; box-sizing:border-box; }
#t1 { width:100%; height:45px; background:var(--panel); border-radius:25px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-family:Orbitron; font-size:14px; letter-spacing:4px; color:var(--blue); margin-bottom:10px; }
#t2 { width:100%; height:75px; display:flex; gap:10px; margin-bottom:10px; }
.t2-box { flex:1; background:var(--panel); border-radius:25px; border:1px solid var(--border); display:flex; align-items:center; padding:0 30px; }
#viewport { height:calc(100vh - 340px); width:100%; display:flex; justify-content:space-between; overflow:hidden; }
#list-area { width:450px; overflow-y:auto; padding-right:10px; }
#intel-area { width:450px; background:var(--panel); border:1px solid var(--border); padding:30px; box-sizing:border-box; border-radius:25px; display:none; position:relative; }
footer { position:fixed; bottom:15px; left:15px; right:15px; height:110px; display:flex; gap:10px; }
#f-left { width:30%; background:var(--panel); border:1px solid var(--border); border-radius:25px; padding:20px 30px; }
#f-right { flex:1; background:var(--panel); border:1px solid var(--border); border-radius:25px; padding:20px 30px; }
.label { font-size:9px; color:#888; font-family:Orbitron; letter-spacing:1px; margin-bottom:4px; }
.card { background:var(--panel); border:1px solid var(--border); margin-bottom:10px; padding:15px 25px; border-radius:30px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
.nav-pill { background:#333; border:1px solid #444; padding:8px 18px; border-radius:25px; color:#fff; cursor:pointer; font-size:10px; font-weight:600; text-decoration:none; border:none; }
#modalReportBg {position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:1100; display:none;}
#modalReport {position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:650px; max-height:85vh; background:#181c22; border-radius:22px; padding:26px; z-index:1200; border:2px solid var(--blue); overflow-y:auto;}
.reportGrid {display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:20px 0;}
.reportBlock {background:#12181f; padding:15px 5px; border-radius:10px; border-left:5px solid; text-align:center;}
.reportTable {width:100%; border-collapse:collapse; color:#eee; margin-top:10px;}
.reportTable th {background:#111; padding:10px; font-size:11px; font-family:Orbitron; text-align:left; border:1px solid #333;}
.reportTable td {padding:8px; font-size:12px; border:1px solid #222;}
#override-panel {position:fixed; top:-500px; left:50%; transform:translateX(-50%); width:380px; background:var(--panel); border-radius:25px; transition:0.6s; padding:40px; border:1px solid var(--border); z-index:2000;}
</style>
</head>
<body>
<div id="modalReportBg" onclick="closeReportModal()"></div>
<div id="modalReport">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div style="font-family:Orbitron; color:var(--blue); font-size:18px;">RANK WAR INTELLIGENCE</div>
    <button class="nav-pill" onclick="closeReportModal()">✕</button>
  </div>
  <div id="modalReportBody"></div>
</div>
<div id="main-ui">
  <div id="t1">TACTICAL INTERFACE V1.8.10</div>
  <div id="t2">
    <div class="t2-box" style="justify-content:space-between;">
      <div><div class="label">BATTLE STATS</div><div id="h-power" style="color:var(--amber); font-family:Orbitron;">---</div></div>
      <div style="text-align:right;"><div class="label">OPERATOR</div><div id="h-user" style="color:var(--blue); font-family:Orbitron;">---</div></div>
    </div>
    <div class="t2-box">
      <div><div class="label">TARGET FACTION</div><div id="h-faction" style="color:var(--green); font-family:Orbitron;">READY</div></div>
    </div>
  </div>
  <div id="viewport">
    <div id="list-area"><div id="grid"></div></div>
    <div id="intel-area"><div id="intel-content"></div></div>
  </div>
  <footer>
    <div id="f-left"><div class="label">SYSTEM DATA</div><div style="color:var(--green); font-size:10px;">ENCRYPTED</div></div>
    <div id="f-right">
      <div style="display:flex; justify-content:space-between;">
        <div class="label">COMMAND CONTROLS</div>
        <div class="nav-pill" onclick="toggleOverride()">OVERRIDE</div>
      </div>
      <div style="display:flex; gap:12px; margin-top:12px;">
        <button class="nav-pill" onclick="generateReport()">GENERATE REPORT</button>
        <div id="breakdown" style="display:flex; gap:8px;"></div>
      </div>
    </div>
  </footer>
</div>
<div id="override-panel">
  <input type="number" id="m-fid" style="width:90%; padding:14px; margin:10px 0; background:#000; border:1px solid var(--border); color:#fff; border-radius:25px;" value="42505">
  <input type="number" id="m-uid" style="width:90%; padding:14px; margin:10px 0; background:#000; border:1px solid var(--border); color:#fff; border-radius:25px;" value="2702970">
  <button class="nav-pill" style="width:100%; height:50px; background:var(--green); color:#000;" onclick="engage()">INITIALIZE SCAN</button>
</div>
<script>
/* SESSION variable already declared above, removed duplicate declaration */
function formatStats(n) { if(!n) return "---"; if(n>=1e9) return (n/1e9).toFixed(2)+'B'; if(n>=1e6) return (n/1e6).toFixed(1)+'M'; return n.toLocaleString(); }

function engage() {
  const uid = document.getElementById('m-uid').value;
  const fid = document.getElementById('m-fid').value;
  SESSION.uid = uid;
  google.script.run.withSuccessHandler(u => {
    document.getElementById('h-user').textContent = uid; // Changed to uid
    SESSION.myStats = u.total;
    document.getElementById('h-power').textContent = formatStats(u.total);
    google.script.run.withSuccessHandler(d => { 
      document.getElementById('h-faction').textContent = d.name;
      toggleOverride(); 
      startScan(d); 
    }).getFactionData(fid);
  }).getUserName(uid);
}

function startScan(d) {
  const members = Object.keys(d.members || {});
  SESSION.rawData = []; SESSION.counts = {amber:0,green:0,blue:0,red:0};
  document.getElementById('grid').innerHTML = '';
  const CHUNK = 12;
  for(let i=0; i<members.length; i+=CHUNK) {
    const ids = members.slice(i, i+CHUNK);
    google.script.run.withSuccessHandler(res => {
      res.forEach((sc, idx) => {
        const s = sc || { fair_fight:1.0, bs_estimate:0 };
        const ff = Number(s.fair_fight) || 1.0;
        let t = ff < 3.2 ? 'amber' : ff < 4.7 ? 'green' : ff < 5.3 ? 'blue' : 'red';
        const obj = { m:d.members[ids[idx]], id:ids[idx], total:s.bs_estimate, ff:ff, tier:t, respect:(ff * (SESSION.myStats / (s.bs_estimate || 1)) * 10) }; // Adjusted respect
        renderCard(obj);
        SESSION.rawData.push(obj); SESSION.counts[t]++;
        updateBreakdown();
      });
    }).getScouterDataBatch(ids.join(','), SESSION.uid);
  }
}

function renderCard(obj){
  const card = document.createElement('div');
  card.className = 'card'; card.style.borderLeft = '4px solid var(--'+obj.tier+')';
  card.innerHTML = '<div><div style="color:var(--' + obj.tier + '); font-weight:700;">' + obj.ff.toFixed(2) + 'x FF</div><div>' + obj.m.name + '</div></div>' +
    '<div style="text-align:right;"><div class="label" style="margin:0;">EST. POWER</div><div style="font-weight:700;">' + formatStats(obj.total) + '</div></div>';
  card.onclick = () => {
    document.getElementById('intel-area').style.display = 'block';
    document.getElementById('intel-content').innerHTML = '<button style="position:absolute;top:10px;right:10px;background:#444;color:#fff;border:none;border-radius:50%;cursor:pointer;width:24px;height:24px;" onclick="closeIntel()">X</button>' +
      '<div style="font-weight:700; font-size:22px; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:5px;">' + obj.m.name.toUpperCase() + '</div>' +
      '<div style="display:flex; justify-content:space-between;">' +
        '<div><div class="label">MULT</div><div style="font-size:24px; color:var(--' + obj.tier + ');">' + obj.ff.toFixed(2) + 'x</div></div>' +
        '<div><div class="label">EST. POWER</div><div style="font-size:20px;">' + formatStats(obj.total) + '</div></div>' +
      '</div><a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + obj.id + '" target="_blank" class="nav-pill" style="display:block; text-align:center; background:var(--green); color:#000; margin-top:20px; padding:15px;">INITIATE</a>';
  };
  document.getElementById('grid').prepend(card);
}

function updateBreakdown(){
  const b = document.getElementById('breakdown'); b.innerHTML = '';
  Object.keys(SESSION.counts).forEach(t => {
    if(SESSION.counts[t]>0) {
      const p = document.createElement('div'); p.className = 'nav-pill'; p.style.color = 'var(--'+t+')';
      p.textContent = SESSION.counts[t]+' '+t.toUpperCase(); b.appendChild(p);
    }
  });
}

function generateReport() {
  let body = '<div class="reportGrid">';
  ['amber','green','blue','red'].forEach(t => {
    const subset = SESSION.rawData.filter(x => x.tier === t);
    const sumResp = subset.reduce((a, b) => a + b.respect, 0);
    body += '<div class="reportBlock" style="border-left-color:var(--'+t+')"><div class="label">'+t.toUpperCase()+'</div><div style="font-size:18px; font-weight:700;">'+subset.length+'</div><div style="font-size:10px; color:#888;">'+Math.round(sumResp)+' RESP</div></div>';
  });
  body += '</div><table class="reportTable"><thead><tr><th>ID</th><th>NAME</th><th>TIER</th><th>FF</th><th>BS</th><th>PROB%</th><th>RESP</th></tr></thead><tbody>';
  SESSION.rawData.sort((a,b)=>b.ff-a.ff).forEach(t => {
    let prob = Math.min(0.95, Math.max(0.05, SESSION.myStats / (t.total || 1)));
    body += '<tr><td>'+t.id+'</td><td>'+t.m.name+'</td><td style="color:var(--'+t.tier+')">'+t.tier.toUpperCase()+'</td><td>'+t.ff.toFixed(2)+'</td><td>'+formatStats(t.total)+'</td><td>'+(prob*100).toFixed(1)+'%</td><td>'+t.respect.toFixed(2)+'</td></tr>';
  });
  body += '</tbody></table>';
  document.getElementById('modalReportBody').innerHTML = body;
  document.getElementById('modalReportBg').style.display = 'block';
  document.getElementById('modalReport').style.display = 'block';
}

function closeReportModal(){ document.getElementById('modalReportBg').style.display = 'none'; document.getElementById('modalReport').style.display = 'none'; }
function closeIntel(){ document.getElementById('intel-area').style.display = 'none'; }
function toggleOverride(){ 
  const p = document.getElementById('override-panel');
  p.style.top = (p.style.top === '60px') ? '-500px' : '60px'; 
}

window.onload = function() {
  document.getElementById('override-panel').style.top = '60px';
  document.getElementById('modalReportBg').style.display = 'none';
  document.getElementById('modalReport').style.display = 'none';
};
</script>
</body>
</html>`;
//  }const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
// const SC_KEY = 'rwLgZTyqgWDxhoCx';

function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('TACTICAL HUD V1.8.10')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getScouterDataBatch(targetsCsv, uid) {
  try {
    const url = "https://ffscouter.com/api/v1/get-stats?key=" + SC_KEY + "&targets=" + targetsCsv + "&user_id=" + uid;
    return JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText());
  } catch (e) { return []; }
}

function getFactionData(fid) {
  try {
    const res = UrlFetchApp.fetch("https://api.torn.com/faction/"+fid+"?selections=basic&key="+TORN_API_KEY, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    return { name: (data.name || "UNKNOWN FACTION").toUpperCase(), members: data.members };
  } catch (e) { return { name: "OFFLINE", members: {} }; }
}

function getUserName(uid) {
  try {
    const res = JSON.parse(UrlFetchApp.fetch("https://api.torn.com/user/"+uid+"?selections=profile,battlestats&key="+TORN_API_KEY, { muteHttpExceptions: true }).getContentText());
    return { 
      name: (res.name || "OPERATOR").toUpperCase(), 
      total: Number(res.total_battlestats) || 0 
    };
  } catch (e) { return { name: "FETCH FAIL", total: 0 }; }
}

function getHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Inter:wght@400;600&display=swap');
:root {
  --amber:#f6da00; --green:#00ff88; --blue:#009fff; --red:#ff3333; --bg:#000;
  --panel:#1c1c1c; --border:#333; --text:#eee;
}
body { background:var(--bg); color:var(--text); font-family:'Inter', sans-serif; margin:0; overflow:hidden; height:100vh; width:100vw; padding:15px; box-sizing:border-box; }
#t1 { width:100%; height:45px; background:var(--panel); border-radius:25px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-family:Orbitron; font-size:14px; letter-spacing:4px; color:var(--blue); margin-bottom:10px; }
#t2 { width:100%; height:75px; display:flex; gap:10px; margin-bottom:10px; }
.t2-box { flex:1; background:var(--panel); border-radius:25px; border:1px solid var(--border); display:flex; align-items:center; padding:0 30px; }
#viewport { height:calc(100vh - 340px); width:100%; display:flex; justify-content:space-between; overflow:hidden; }
#list-area { width:450px; overflow-y:auto; padding-right:10px; }
#intel-area { width:450px; background:var(--panel); border:1px solid var(--border); padding:30px; box-sizing:border-box; border-radius:25px; display:none; position:relative; }
footer { position:fixed; bottom:15px; left:15px; right:15px; height:110px; display:flex; gap:10px; }
#f-left { width:30%; background:var(--panel); border:1px solid var(--border); border-radius:25px; padding:20px 30px; }
#f-right { flex:1; background:var(--panel); border:1px solid var(--border); border-radius:25px; padding:20px 30px; }
.label { font-size:9px; color:#888; font-family:Orbitron; letter-spacing:1px; margin-bottom:4px; }
.card { background:var(--panel); border:1px solid var(--border); margin-bottom:10px; padding:15px 25px; border-radius:30px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
.nav-pill { background:#333; border:1px solid #444; padding:8px 18px; border-radius:25px; color:#fff; cursor:pointer; font-size:10px; font-weight:600; text-decoration:none; border:none; }
#modalReportBg {position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:1100; display:none;}
#modalReport {position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:650px; max-height:85vh; background:#181c22; border-radius:22px; padding:26px; z-index:1200; border:2px solid var(--blue); overflow-y:auto;}
.reportGrid {display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin:20px 0;}
.reportBlock {background:#12181f; padding:15px 5px; border-radius:10px; border-left:5px solid; text-align:center;}
.reportTable {width:100%; border-collapse:collapse; color:#eee; margin-top:10px;}
.reportTable th {background:#111; padding:10px; font-size:11px; font-family:Orbitron; text-align:left; border:1px solid #333;}
.reportTable td {padding:8px; font-size:12px; border:1px solid #222;}
#override-panel {position:fixed; top:-500px; left:50%; transform:translateX(-50%); width:380px; background:var(--panel); border-radius:25px; transition:0.6s; padding:40px; border:1px solid var(--border); z-index:2000;}
</style>
</head>
<body>
<div id="modalReportBg" onclick="closeReportModal()"></div>
<div id="modalReport">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div style="font-family:Orbitron; color:var(--blue); font-size:18px;">RANK WAR INTELLIGENCE</div>
    <button class="nav-pill" onclick="closeReportModal()">✕</button>
  </div>
  <div id="modalReportBody"></div>
</div>
<div id="main-ui">
  <div id="t1">TACTICAL INTERFACE V1.8.10</div>
  <div id="t2">
    <div class="t2-box" style="justify-content:space-between;">
      <div><div class="label">BATTLE STATS</div><div id="h-power" style="color:var(--amber); font-family:Orbitron;">---</div></div>
      <div style="text-align:right;"><div class="label">OPERATOR</div><div id="h-user" style="color:var(--blue); font-family:Orbitron;">---</div></div>
    </div>
    <div class="t2-box">
      <div><div class="label">TARGET FACTION</div><div id="h-faction" style="color:var(--green); font-family:Orbitron;">READY</div></div>
    </div>
  </div>
  <div id="viewport">
    <div id="list-area"><div id="grid"></div></div>
    <div id="intel-area"><div id="intel-content"></div></div>
  </div>
  <footer>
    <div id="f-left"><div class="label">SYSTEM DATA</div><div style="color:var(--green); font-size:10px;">ENCRYPTED</div></div>
    <div id="f-right">
      <div style="display:flex; justify-content:space-between;">
        <div class="label">COMMAND CONTROLS</div>
        <div class="nav-pill" onclick="toggleOverride()">OVERRIDE</div>
      </div>
      <div style="display:flex; gap:12px; margin-top:12px;">
        <button class="nav-pill" onclick="generateReport()">GENERATE REPORT</button>
        <div id="breakdown" style="display:flex; gap:8px;"></div>
      </div>
    </div>
  </footer>
</div>
<div id="override-panel">
  <input type="number" id="m-fid" style="width:90%; padding:14px; margin:10px 0; background:#000; border:1px solid var(--border); color:#fff; border-radius:25px;" value="42505">
  <input type="number" id="m-uid" style="width:90%; padding:14px; margin:10px 0; background:#000; border:1px solid var(--border); color:#fff; border-radius:25px;" value="2702970">
  <button class="nav-pill" style="width:100%; height:50px; background:var(--green); color:#000;" onclick="engage()">INITIALIZE SCAN</button>
</div>
<script>
let SESSION = { uid:0, myStats:0, rawData:[], counts:{amber:0,green:0,blue:0,red:0} };
function formatStats(n) { if(!n) return "---"; if(n>=1e9) return (n/1e9).toFixed(2)+'B'; if(n>=1e6) return (n/1e6).toFixed(1)+'M'; return n.toLocaleString(); }

function engage() {
  const uid = document.getElementById('m-uid').value;
  const fid = document.getElementById('m-fid').value;
  SESSION.uid = uid;
  google.script.run.withSuccessHandler(u => {
    document.getElementById('h-user').textContent = uid; // Changed to uid
    SESSION.myStats = u.total;
    document.getElementById('h-power').textContent = formatStats(u.total);
    google.script.run.withSuccessHandler(d => { 
      document.getElementById('h-faction').textContent = d.name;
      toggleOverride(); 
      startScan(d); 
    }).getFactionData(fid);
  }).getUserName(uid);
}

function startScan(d) {
  const members = Object.keys(d.members || {});
  SESSION.rawData = []; SESSION.counts = {amber:0,green:0,blue:0,red:0};
  document.getElementById('grid').innerHTML = '';
  const CHUNK = 12;
  for(let i=0; i<members.length; i+=CHUNK) {
    const ids = members.slice(i, i+CHUNK);
    google.script.run.withSuccessHandler(res => {
      res.forEach((sc, idx) => {
        const s = sc || { fair_fight:1.0, bs_estimate:0 };
        const ff = Number(s.fair_fight) || 1.0;
        let t = ff < 3.2 ? 'amber' : ff < 4.7 ? 'green' : ff < 5.3 ? 'blue' : 'red';
        const obj = { m:d.members[ids[idx]], id:ids[idx], total:s.bs_estimate, ff:ff, tier:t, respect:(ff * (SESSION.myStats / (s.bs_estimate || 1)) * 10) }; // Adjusted respect
        renderCard(obj);
        SESSION.rawData.push(obj); SESSION.counts[t]++;
        updateBreakdown();
      });
    }).getScouterDataBatch(ids.join(','), SESSION.uid);
  }
}

function renderCard(obj){
  const card = document.createElement('div');
  card.className = 'card'; card.style.borderLeft = '4px solid var(--'+obj.tier+')';
  card.innerHTML = '<div><div style="color:var(--' + obj.tier + '); font-weight:700;">' + obj.ff.toFixed(2) + 'x FF</div><div>' + obj.m.name + '</div></div>' +
    '<div style="text-align:right;"><div class="label" style="margin:0;">EST. POWER</div><div style="font-weight:700;">' + formatStats(obj.total) + '</div></div>';
  card.onclick = () => {
    document.getElementById('intel-area').style.display = 'block';
    document.getElementById('intel-content').innerHTML = '<button style="position:absolute;top:10px;right:10px;background:#444;color:#fff;border:none;border-radius:50%;cursor:pointer;width:24px;height:24px;" onclick="closeIntel()">X</button>' +
      '<div style="font-weight:700; font-size:22px; margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:5px;">' + obj.m.name.toUpperCase() + '</div>' +
      '<div style="display:flex; justify-content:space-between;">' +
        '<div><div class="label">MULT</div><div style="font-size:24px; color:var(--' + obj.tier + ');">' + obj.ff.toFixed(2) + 'x</div></div>' +
        '<div><div class="label">EST. POWER</div><div style="font-size:20px;">' + formatStats(obj.total) + '</div></div>' +
      '</div><a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + obj.id + '" target="_blank" class="nav-pill" style="display:block; text-align:center; background:var(--green); color:#000; margin-top:20px; padding:15px;">INITIATE</a>';
  };
  document.getElementById('grid').prepend(card);
}

function updateBreakdown(){
  const b = document.getElementById('breakdown'); b.innerHTML = '';
  Object.keys(SESSION.counts).forEach(t => {
    if(SESSION.counts[t]>0) {
      const p = document.createElement('div'); p.className = 'nav-pill'; p.style.color = 'var(--'+t+')';
      p.textContent = SESSION.counts[t]+' '+t.toUpperCase(); b.appendChild(p);
    }
  });
}

function generateReport() {
  let body = '<div class="reportGrid">';
  ['amber','green','blue','red'].forEach(t => {
    const subset = SESSION.rawData.filter(x => x.tier === t);
    const sumResp = subset.reduce((a, b) => a + b.respect, 0);
    body += '<div class="reportBlock" style="border-left-color:var(--'+t+')"><div class="label">'+t.toUpperCase()+'</div><div style="font-size:18px; font-weight:700;">'+subset.length+'</div><div style="font-size:10px; color:#888;">'+Math.round(sumResp)+' RESP</div></div>';
  });
  body += '</div><table class="reportTable"><thead><tr><th>ID</th><th>NAME</th><th>TIER</th><th>FF</th><th>BS</th><th>PROB%</th><th>RESP</th></tr></thead><tbody>';
  SESSION.rawData.sort((a,b)=>b.ff-a.ff).forEach(t => {
    let prob = Math.min(0.95, Math.max(0.05, SESSION.myStats / (t.total || 1)));
    body += '<tr><td>'+t.id+'</td><td>'+t.m.name+'</td><td style="color:var(--'+t.tier+')">'+t.tier.toUpperCase()+'</td><td>'+t.ff.toFixed(2)+'</td><td>'+formatStats(t.total)+'</td><td>'+(prob*100).toFixed(1)+'%</td><td>'+t.respect.toFixed(2)+'</td></tr>';
  });
  body += '</tbody></table>';
  document.getElementById('modalReportBody').innerHTML = body;
  document.getElementById('modalReportBg').style.display = 'block';
  document.getElementById('modalReport').style.display = 'block';
}

function closeReportModal(){ document.getElementById('modalReportBg').style.display = 'none'; document.getElementById('modalReport').style.display = 'none'; }
function closeIntel(){ document.getElementById('intel-area').style.display = 'none'; }
function toggleOverride(){ 
  const p = document.getElementById('override-panel');
  p.style.top = (p.style.top === '60px') ? '-500px' : '60px'; 
}

window.onload = function() {
  document.getElementById('override-panel').style.top = '60px';
  document.getElementById('modalReportBg').style.display = 'none';
  document.getElementById('modalReport').style.display = 'none';
};
</script>
</body>
<html>`;
}