/** TORN TACTICAL HUD V1.8.3 (MODIFIED + EXTENDED)
 * - Operator FF/Estimate in top panel
 * - Generate Report button/modal and attack probability
 * - All core Tactical HUD behaviors preserved
 */
const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx';
const WORKER_URL = 'https://torn-war-bridge.tmecf.workers.dev/';

function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('TACTICAL HUD V1.8.3')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getScouterData(tid, uid) {
  try {
    const url = "https://ffscouter.com/api/v1/get-stats?key=" + SC_KEY + "&targets=" + tid + "&user_id=" + uid;
    return JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText());
  } catch (e) { return [{ fair_fight: 1.0, bs_estimate: 0 }]; }
}

// Batch endpoint for faster multi-user scouting
function getScouterDataBatch(targetsCsv, uid) {
  try {
    const url = "https://ffscouter.com/api/v1/get-stats?key=" + SC_KEY + "&targets=" + targetsCsv + "&user_id=" + uid;
    return JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText());
  } catch (e) { return []; }
}

function getFactionData(fid) {
  try {
    const res = UrlFetchApp.fetch("https://api.torn.com/faction/"+fid+"?selections=basic&key="+TORN_API_KEY, { muteHttpExceptions: true });
    return JSON.parse(res.getContentText());
  } catch (e) { return { error: "FACTION_API_FAIL" }; }
}

function getUserName(uid) {
  try {
    const res = JSON.parse(UrlFetchApp.fetch("https://api.torn.com/user/"+uid+"?selections=profile,battlestats&key="+SC_KEY, { muteHttpExceptions: true }).getContentText());
    if (res.error) return { name: "API ERROR", total: 0, errCode: res.error.code };
    return { 
      name: (res.name || "OPERATOR").toUpperCase(), 
      total: Number(res.total) || 0 
    }; 
  } catch (e) { return { name: "FETCH FAIL", total: 0, errCode: "SYSTEM" }; }
}

function getHTML() {
  return `<!DOCTYPE html>
<html>
<head>
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Inter:wght@400;600&display=swap');
:root { --easy:#00ff88; --prime:#f59e0b; --risky:#00d4ff; --suicide:#ff3333; --bg:#000; --panel:#1c1c1c; --border:#333; --text:#eee; }
body { background:var(--bg); color:var(--text); font-family:'Inter', sans-serif; margin:0; overflow:hidden; height:100vh; width:100vw; padding:15px; box-sizing:border-box; }
#main-ui.blur { filter: blur(10px); opacity: 0.3; pointer-events: none; }
#t1 { width:100%; height:45px; background:var(--panel); border-radius:25px; border:1px solid var(--border); display:flex; align-items:center; justify-content:center; font-family:Orbitron; font-size:14px; letter-spacing:4px; color:#f59e0b; margin-bottom:10px; }
#t1 .opff, #t1 .opbs { margin-left:25px; font-size:13px; }
#t1 .opff { color:#00ff99; }
#t1 .opbs { color:#89eaff; }
#generateReportBtn {
  background:var(--prime); color:#000; font-weight:900; padding:8px 20px; border:none; border-radius:22px; font-size:12px; margin-left:20px; cursor:pointer;
}
#report-modal {
  display:none; position:fixed; left:0; top:0; width:100vw; height:100vh; z-index:3000;
  background:rgba(12,16,20,0.85); align-items:center; justify-content:center;
}
#report-modal[open], #report-modal.active { display: flex; }
#report-modal-content {
  background:#181c22; padding:38px 44px 34px 42px; border-radius:26px;
  min-width:300px; max-width:94vw; color:#ed9; font-size:16.5px; box-shadow:0 8px 48px #000b;
}
#report-close-btn { float:right; font-size:22px; background:none; border:none; color:#f57e0b; font-weight:900; cursor:pointer;}
/* [Leave all your HUD styles unchanged below...] */
#t2 { width:100%; height:75px; display:flex; gap:10px; margin-bottom:10px; }
.t2-box { flex:1; background:var(--panel); border-radius:25px; border:1px solid var(--border); display:flex; align-items:center; padding:0 30px; }
#viewport { height:calc(100vh - 340px); width:100%; display:flex; justify-content:space-between; overflow:hidden; }
#list-area { width:450px; overflow-y:auto; padding-right:10px; }
#intel-area { width:450px; background:var(--panel); border:1px solid var(--border); padding:30px; box-sizing:border-box; border-radius:25px; display:none; position:relative; }
footer { position:fixed; bottom:15px; left:15px; right:15px; height:110px; display:flex; gap:10px; }
#f-left { width:35%; background:var(--panel); border:1px solid var(--border); border-radius:25px; padding:20px 30px; }
#f-right { width:65%; background:var(--panel); border:1px solid var(--border); border-radius:25px; padding:20px 30px; }
.label { font-size:9px; color:#888; font-family:Orbitron; letter-spacing:1px; margin-bottom:4px; }
.card { background:var(--panel); border:1px solid var(--border); margin-bottom:10px; padding:15px 25px; border-radius:30px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; }
.nav-pill { background:#333; border:1px solid #444; padding:8px 18px; border-radius:25px; color:#fff; cursor:pointer; font-size:10px; font-weight:600; text-decoration:none; border:none; }
#modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); display:none; align-items:center; justify-content:center; z-index:1000; }
#briefing-window { width:850px; background:var(--panel); border:1px solid var(--border); border-radius:30px; padding:40px; position:relative; }
.close-btn-small { position:absolute; top:15px; right:15px; background:#444; color:#fff; border:none; width:26px; height:26px; border-radius:50%; cursor:pointer; font-size:10px; }
.target-row { display:flex; gap:20px; background:#111; padding:20px; border-radius:20px; margin-top:15px; align-items:center; }
</style>
</head>
<body>
<div id="modal-overlay">
  <div id="briefing-window">
    <button class="close-btn-small" onclick="closeModal()">X</button>
    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #333; padding-bottom:20px;">
      <div>
        <div class="label">OPERATOR POWER</div>
        <div id="m-my-stats" style="font-size:22px; font-family:Orbitron; color:var(--risky);">---</div>
      </div>
      <div style="text-align:right;">
        <div class="label">TIER ANALYSIS</div>
        <div id="m-tier-label" style="font-size:22px; font-family:Orbitron;">---</div>
      </div>
      <div id="briefing-content"></div>
    </div>
  </div>
</div>
<div id="main-ui">
  <div id="t1">
    TACTICAL INTERFACE V1.8.3
    <span id="operator-ff" class="opff">FF: --</span>
    <span id="operator-bs" class="opbs">BS: --</span>
    <button id="generateReportBtn" onclick="generateReport()">GENERATE REPORT</button>
  </div>
  <div id="t2">
    <div class="t2-box" style="flex:1; justify-content:space-between;">
      <div><div class="label">OPERATOR</div><div id="h-user" style="color:var(--risky); font-family:Orbitron;">---</div></div>
      <div style="text-align:right;"><div class="label">POWER</div><div id="h-power" style="color:#fff; font-family:Orbitron;">---</div></div>
    </div>
    <div class="t2-box" style="flex:1;"><div><div class="label">SYSTEM STATUS</div><div id="h-status" style="color:var(--easy); font-family:Orbitron;">READY</div></div></div>
  </div>
  <div id="viewport">
    <div id="list-area"><div id="grid"></div></div>
    <div id="intel-area"><div id="intel-content"></div></div>
  </div>
  <footer>
    <div id="f-left"><div class="label">UNIT DATA</div><div style="font-size:10px; color:#888;">DBL-CLICK CARD TO DISMISS</div></div>
    <div id="f-right">
      <div style="display:flex; justify-content:space-between;"><div class="label">SELECT CATEGORY</div><div class="nav-pill" onclick="toggleOverride()">OVERRIDE</div></div>
      <div style="display:flex; gap:8px; margin-top:12px;">
        <button class="nav-pill" onclick="generateReport()">GENERATE REPORT</button>
        <div id="breakdown" style="display:flex; gap:8px; margin-top:0;"></div>
      </div>
    </div>
  </footer>
</div>

<!-- REPORT MODAL -->
<div id="report-modal">
  <div id="report-modal-content">
    <button id="report-close-btn" onclick="closeReportModal()">&times;</button>
    <div id="report-body"></div>
  </div>
</div>

<div id="override-panel" style="position:fixed; top:-500px; left:50%; transform:translateX(-50%); width:380px; background:var(--panel); border-radius:25px; transition:0.6s; padding:40px; text-align:center; border:1px solid var(--border); z-index:99;">
  <input type="number" id="m-fid" style="width:90%; padding:14px; margin:10px 0; background:#000; border:1px solid var(--border); color:#fff; border-radius:25px;" value="42505">
  <input type="number" id="m-uid" style="width:90%; padding:14px; margin:10px 0; background:#000; border:1px solid var(--border); color:#fff; border-radius:25px;" value="2702970">
  <button class="nav-pill" style="width:100%; height:50px; background:var(--prime); color:#000;" onclick="engage()">INITIALIZE SCAN</button>
</div>
<script>
let SESSION = { uid:0, myStats:0, myFF: null, myBS: null, rawData:[], counts:{easy:0,prime:0,risky:0,suicide:0} };

function toggleOverride(){ 
  const p = document.getElementById('override-panel');
  p.style.top = (p.style.top === '60px') ? '-500px' : '60px'; 
}

function closeModal(){ 
  document.getElementById('modal-overlay').style.display = 'none'; 
  document.getElementById('main-ui').classList.remove('blur'); 
}

function closeIntel(){ document.getElementById('intel-area').style.display = 'none'; }

function formatStats(num) {
  if (!num || num === 0) return "---";
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  return num.toLocaleString();
}

// --- OPERATOR & FACTION LOADING ---
function engage(){
  const uid = document.getElementById('m-uid').value;
  const fid = document.getElementById('m-fid').value;
  SESSION.uid = uid;
  document.getElementById('h-status').textContent = "FETCHING OPERATOR...";
  google.script.run.withSuccessHandler(user => {
    if(user.errCode) {
       document.getElementById('h-status').textContent = "API ERR: " + user.errCode;
       return;
    }
    document.getElementById('h-user').textContent = user.name;
    SESSION.myStats = Number(user.total);
    document.getElementById('h-power').textContent = formatStats(SESSION.myStats);
    document.getElementById('m-my-stats').textContent = formatStats(SESSION.myStats);
    // GET OPERATOR FF/BS ESTIMATE
    fetch("https://ffscouter.com/api/v1/get-stats?key=${SC_KEY}&targets="+uid+"&user_id="+uid)
      .then(r=>r.json()).then(sc => {
        const d = (sc && sc[0]) ? sc[0] : {};
        SESSION.myFF = d.fair_fight || "--";
        SESSION.myBS = d.bs_estimate || SESSION.myStats || "--";
        document.getElementById("operator-ff").innerHTML = "FF: <b>"+SESSION.myFF+"</b>";
        document.getElementById("operator-bs").innerHTML = "BS: <b>"+formatStats(SESSION.myBS)+"</b>";
        document.getElementById('h-status').textContent = "SCANNING FACTION...";
        google.script.run.withSuccessHandler(fData => { 
          if(fData.error) { document.getElementById('h-status').textContent = "FACTION ERR"; return; }
          toggleOverride(); 
          document.getElementById('h-status').textContent = "OPERATIONAL";
          startScan(fData); 
        }).getFactionData(fid);
      });
  }).getUserName(uid);
}

// -- CHUNKED/FAST SCAN (unchanged code style) --
function startScan(d){
  document.getElementById('grid').innerHTML = '';
  SESSION.rawData = []; SESSION.counts = {easy:0,prime:0,risky:0,suicide:0};
  const members = Object.keys(d.members || {});
  if(!members.length) {
    document.getElementById('h-status').textContent = "NO MEMBERS";
    return;
  }
  const CHUNK = 12;
  for(let i=0;i<members.length;i+=CHUNK){
    const chunkIds = members.slice(i, i+CHUNK);
    const chunkCsv = chunkIds.join(',');
    google.script.run.withSuccessHandler(results => {
      results.forEach((scData, idx) => {
        const id = chunkIds[idx];
        const scDatum = (scData && scData[0]) ? scData[0] : scData || scData === 0 ? scData : { fair_fight: 1.0, bs_estimate: 0 };
        const total = Number(scDatum.bs_estimate) || 0;
        const ff = Number(scDatum.fair_fight) || 1.0;
        const tier = ff >= 2.9 ? 'easy' : ff >= 2.0 ? 'prime' : ff >= 1.5 ? 'risky' : 'suicide';
        const obj = { m: d.members[id], id, total, bs_estimate: total, ff, fair_fight: ff, tier };
        SESSION.rawData.push(obj); SESSION.counts[tier]++;
        updateBreakdown(); renderCard(obj);
      });
    }).getScouterDataBatch(chunkCsv, SESSION.uid);
  }
}

function showTacticalBriefing(tier) {
  const targets = SESSION.rawData.filter(t => t.tier === tier).sort((a,b) => b.ff - a.ff).slice(0,3);
  document.getElementById('m-tier-label').textContent = tier.toUpperCase();
  document.getElementById('m-tier-label').style.color = 'var(--'+tier+')';
  let html = '';
  targets.forEach(t => {
    const ratio = SESSION.myStats / (t.total || 1);
    const advice = ratio > 1.5 ? "DOMINANT" : ratio > 0.9 ? "FAVORABLE" : "HIGH RISK";
    html += '<div class="target-row" style="border-left: 5px solid var(--' + tier + ')">' +
      '<div style="flex:1.5;"><div class="label">TARGET</div><div style="font-size:16px; font-weight:700;">' + t.m.name + '</div></div>' +
      '<div style="flex:1;"><div class="label">EST. POWER</div><div style="font-size:14px; color:#fff;">' + formatStats(t.total) + '</div></div>' +
      '<div style="flex:1;"><div class="label">MULT</div><div style="font-size:14px; color:var(--' + tier + '); font-weight:700;">' + t.ff.toFixed(2) + 'x</div></div>' +
      '<div style="flex:2;">' +
        '<div class="label">ADVICE</div><div style="font-size:10px; font-weight:600; color:#aaa;">' + advice + '</div>' +
        '<div style="display:flex; gap:8px; margin-top:8px;">' +
          '<a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + t.id + '" target="_blank" class="nav-pill" style="background:var(--easy); color:#000; padding:5px 12px; font-size:9px;">ENGAGE</a>' +
        '</div>' +
      '</div>' +
    '</div>';
  });
  document.getElementById('briefing-content').innerHTML = html || '<div style="padding:40px; text-align:center;">NO DATA.</div>';
  document.getElementById('main-ui').classList.add('blur');
  document.getElementById('modal-overlay').style.display = 'flex';
}

function renderCard(obj){
  const card = document.createElement('div');
  card.className = 'card ' + (obj.tier ? obj.tier : "");
  card.style.borderLeft = '4px solid var(--'+obj.tier+')';
  card.innerHTML = '<div><div style="color:var(--' + obj.tier + '); font-weight:700;">' + obj.ff.toFixed(2) + 'x FF</div><div style="font-size:13px;">' + obj.m.name + '</div></div>' +
    '<div style="text-align:right;"><div class="label" style="margin:0;">EST. POWER</div><div style="font-size:14px; font-weight:700; color:#fff;">' + formatStats(obj.total) + '</div></div>';
  card.onclick = () => {
    document.getElementById('intel-area').style.display = 'block';
    document.getElementById('intel-content').innerHTML = '<button class="close-btn-small" style="top:10px; right:10px;" onclick="closeIntel()">X</button>' +
      '<div style="font-weight:700; font-size:22px; border-bottom:1px solid #333; padding-bottom:10px; margin-bottom:15px; padding-right:30px;">' + obj.m.name.toUpperCase() + '</div>' +
      '<div style="display:flex; justify-content:space-between; margin-bottom:20px;">' +
        '<div><div class="label">MULT</div><div style="font-size:24px; color:var(--' + obj.tier + '); font-weight:700;">' + obj.ff.toFixed(2) + 'x</div></div>' +
        '<div><div class="label">EST. POWER</div><div style="font-size:20px; color:#fff;">' + formatStats(obj.total) + '</div></div>' +
      '</div><a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + obj.id + '" target="_blank" class="nav-pill" style="display:block; text-align:center; background:var(--easy); color:#000; text-decoration:none; padding:15px 0;">INITIATE</a>';
  };
  card.ondblclick = closeIntel;
  document.getElementById('grid').prepend(card);
}

function updateBreakdown(){
  const cont = document.getElementById('breakdown'); cont.innerHTML = '';
  Object.keys(SESSION.counts).forEach(t => {
    if(SESSION.counts[t] > 0) {
      const pill = document.createElement('div'); pill.className = 'nav-pill'; pill.style.color = 'var(--'+t+')'; pill.style.borderColor = 'var(--'+t+')';
      pill.textContent = SESSION.counts[t] + ' ' + t.toUpperCase();
      pill.onclick = () => showTacticalBriefing(t);
      cont.appendChild(pill);
    }
  });
}

// -- GENERATE REPORT FUNCTIONALITY --
function generateReport() {
  if (!SESSION.rawData.length) {
    alert('No scan data. Run a scan first.');
    return;
  }
  const baseRespect = Number(prompt('Respect per successful engagement (estimate)', '1000')) || 1000;
  let expected = 0, n = 0;
  let detailsRows = '<tr><th>Name</th><th>FF</th><th>BS</th><th>Prob%</th><th>Est. Respect</th></tr>';
  let myBS = typeof SESSION.myBS === "number" ? SESSION.myBS : Number(SESSION.myBS) || Number(SESSION.myStats) || 0;
  let myFF = SESSION.myFF || "--";
  
  SESSION.rawData.forEach(t => {
    const theirPower = Number(t.total||0);
    if (!theirPower) return;
    const prob = Math.min(0.95, Math.max(0.05, myBS / (myBS + theirPower)));
    const expResp = prob * baseRespect;
    expected += expResp;
    n++;
    detailsRows += "<tr>"+
      "<td>"+(t.m && t.m.name ? t.m.name : "--")+"</td>"+
      "<td>"+(typeof t.ff !== "undefined" ? t.ff.toFixed(2) : "--")+"</td>"+
      "<td>"+(theirPower ? formatStats(theirPower) : "--")+"</td>"+
      "<td>"+(prob*100).toFixed(1)+"%</td>"+
      "<td>"+formatStats(Math.round(expResp))+"</td>"+
    "</tr>";
  });
  let html = `
    <div>
      <><h3>Attack Expected Value Report</h3><div><b>Your FF:</b> ${myFF} &nbsp; <b>Your BS:</b> ${formatStats(myBS)}</div><div><b>Avg. Expected Respect per attack</b>: ${n ? formatStats(Math.round(expected / n)) : "--"}</div><div><b>Total Expected Respect</b> (all targets): ${formatStats(Math.round(expected))}</div><table style="margin-top:14px; background:#101417; border-radius:7px;" border="1" cellspacing="0" cellpadding="4">
      ${detailsRows}
    </table><div style="margin-top:18px; text-align:right;">
        <button id="report-close-btn" style="padding:7px 25px; background:#f5b641;color:#232731;font-weight:800;border-radius:7px;" onclick="closeReportModal()">Close</button>
      </div></>
    </div>
  `;
  document.getElementById('report-body').innerHTML = html;
  document.getElementById('report-modal').style.display = 'flex';
}

function closeReportModal() {
  document.getElementById('report-modal').style.display = 'none';
}
window.onload = toggleOverride;
</script>
</body>
</html>`;
}