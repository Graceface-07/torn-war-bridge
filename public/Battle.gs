const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx';

function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('TACTICAL HUD V1.8.3')
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

:root {
  --amber:#f6da00;
  --green:#00ff88;
  --blue:#009fff;
  --red:#ff3333;
  --bg:#000;
  --panel:#1c1c1c;
  --border:#333;
  --text:#eee;
}

body {
  background:var(--bg);
  color:var(--text);
  font-family:'Inter', sans-serif;
  margin:0;
  overflow:hidden;
  height:100vh;
  width:100vw;
  padding:15px;
  box-sizing:border-box;
}

#main-ui.blur {
  filter: blur(10px);
  opacity: 0.3;
  pointer-events: none;
}

#t1 {
  width:100%;
  height:45px;
  background:var(--panel);
  border-radius:25px;
  border:1px solid var(--border);
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:Orbitron;
  font-size:14px;
  letter-spacing:4px;
  color:var(--blue);
  margin-bottom:10px;
}

#t2 {
  width:100%;
  height:75px;
  display:flex;
  gap:10px;
  margin-bottom:10px;
}

.t2-box {
  flex:1;
  background:var(--panel);
  border-radius:25px;
  border:1px solid var(--border);
  display:flex;
  align-items:center;
  padding:0 30px;
}

#viewport {
  height:calc(100vh - 340px);
  width:100%;
  display:flex;
  justify-content:space-between;
  overflow:hidden;
}

#list-area {
  width:450px;
  overflow-y:auto;
  padding-right:10px;
}

#intel-area {
  width:450px;
  background:var(--panel);
  border:1px solid var(--border);
  padding:30px;
  box-sizing:border-box;
  border-radius:25px;
  display:none;
  position:relative;
}

footer {
  position:fixed;
  bottom:15px;
  left:15px;
  right:15px;
  height:110px;
  display:flex;
  gap:10px;
}

#f-left {
  width:35%;
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:25px;
  padding:20px 30px;
}

#f-right {
  width:65%;
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:25px;
  padding:20px 30px;
}

.label {
  font-size:9px;
  color:#888;
  font-family:Orbitron;
  letter-spacing:1px;
  margin-bottom:4px;
}

.card {
  background:var(--panel);
  border:1px solid var(--border);
  margin-bottom:10px;
  padding:15px 25px;
  border-radius:30px;
  cursor:pointer;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.nav-pill {
  background:#333;
  border:1px solid #444;
  padding:8px 18px;
  border-radius:25px;
  color:#fff;
  cursor:pointer;
  font-size:10px;
  font-weight:600;
  text-decoration:none;
  border:none;
}

#modal-overlay {
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background:rgba(0,0,0,0.85);
  display:none;
  align-items:center;
  justify-content:center;
  z-index:1000;
}

#briefing-window {
  width:850px;
  background:var(--panel);
  border:1px solid var(--border);
  border-radius:30px;
  padding:40px;
  position:relative;
}

.close-btn-small {
  position:absolute;
  top:15px;
  right:15px;
  background:#444;
  color:#fff;
  border:none;
  width:26px;
  height:26px;
  border-radius:50%;
  cursor:pointer;
  font-size:10px;
}

.target-row {
  display:flex;
  gap:20px;
  background:#111;
  padding:20px;
  border-radius:20px;
  margin-top:15px;
  align-items:center;
}

#modalReportBg {
  position:fixed;
  left:0;
  top:0;
  width:100vw;
  height:100vh;
  background:#000;
  opacity:0.7;
  z-index:1100;
  display:none;
}

#modalReport {
  position:fixed;
  top:50%;
  left:50%;
  transform:translate(-50%, -50%);
  min-width:400px;
  max-width:98vw;
  max-height:95vh;
  background:#181c22;
  border-radius:22px;
  padding:26px;
  z-index:1200;
  box-shadow:0 0 54px #000b;
  display:none;
  border:2px solid var(--blue);
}

#modalReportHeader {
  font-size:2em;
  font-family:Orbitron;
  color:var(--blue);
  margin-bottom:12px;
}

#reportCloseBtn {
  position:absolute;
  top:24px;
  right:38px;
  background:#181c22;
  border:none;
  color:var(--blue);
  font-size:30px;
  font-weight:900;
  cursor:pointer;
}

</style>
</head>

<body>

<div id="modal-overlay">
  <div id="briefing-window">
    <button class="close-btn-small" onclick="closeModal()">X</button>
    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #333; padding-bottom:20px;">
      <div>
        <div class="label">OPERATOR POWER</div>
        <div id="m-my-stats" style="font-size:22px; font-family:Orbitron; color:var(--blue);">---</div>
      </div>
      <div style="text-align:right;">
        <div class="label">TIER ANALYSIS</div>
        <div id="m-tier-label" style="font-size:22px; font-family:Orbitron;">---</div>
      </div>
    </div>
    <div id="briefing-content"></div>
  </div>
</div>

<div id="modalReportBg"></div>
<div id="modalReport">
  <button id="reportCloseBtn" onclick="closeReportModal()">✕</button>
  <div id="modalReportHeader">Rank War Attack Report</div>
  <div id="modalReportBody"></div>
</div>

<div id="main-ui">
  <div id="t1">TACTICAL INTERFACE V1.8.3</div>

  <div id="t2">
    <div class="t2-box" style="flex:1; justify-content:space-between;">
      <div>
        <div class="label">OPERATOR</div>
        <div id="h-user" style="color:var(--blue); font-family:Orbitron;">---</div>
      </div>
      <div style="text-align:right;">
        <div class="label">POWER</div>
        <div id="h-power" style="color:#fff; font-family:Orbitron;">---</div>
      </div>
    </div>

    <div class="t2-box" style="flex:1;">
      <div>
        <div class="label">SYSTEM STATUS</div>
        <div id="h-status" style="color:var(--green); font-family:Orbitron;">READY</div>
      </div>
    </div>
  </div>

  <div id="viewport">
    <div id="list-area"><div id="grid"></div></div>
    <div id="intel-area"><div id="intel-content"></div></div>
  </div>

  <footer>
    <div id="f-left">
      <div class="label">UNIT DATA</div>
      <div style="font-size:10px; color:#888;">DBL-CLICK CARD TO DISMISS</div>
    </div>

    <div id="f-right">
      <div style="display:flex; justify-content:space-between;">
        <div class="label">SELECT CATEGORY</div>
        <div class="nav-pill" onclick="toggleOverride()">OVERRIDE</div>
      </div>

      <div style="display:flex; gap:8px; margin-top:12px;">
        <button class="nav-pill" onclick="generateReport()">GENERATE REPORT</button>
        <div id="breakdown" style="display:flex; gap:8px;"></div>
      </div>
    </div>
  </footer>
</div>

<div id="override-panel" style="position:fixed; top:-500px; left:50%; transform:translateX(-50%); width:380px; background:var(--panel); border-radius:25px; transition:0.6s; padding:40px; text-align:center; border:1px solid var(--border); z-index:99;">
  <input type="number" id="m-fid" style="width:90%; padding:14px; margin:10px 0; background:#000; border:1px solid var(--border); color:#fff; border-radius:25px;" value="42505">
  <input type="number" id="m-uid" style="width:90%; padding:14px; margin:10px 0; background:#000; border:1px solid var(--border); color:#fff; border-radius:25px;" value="2702970">
  <button class="nav-pill" style="width:100%; height:50px; background:var(--green); color:#000;" onclick="engage()">INITIALIZE SCAN</button>
</div>

<script>
function buildReportHTML(verdict, verdictColor, totalRespect, gapAnalysis, efficiency, tierCounts) {
  var html = "";
  html += '<div style="text-align:center; margin-bottom:35px;">';
  html +=   '<div style="font-family:Orbitron; font-size:28px; color:#f6da00; letter-spacing:3px; font-weight:800;">COMMAND VERDICT</div>';
  html +=   '<div style="font-family:Orbitron; font-size:40px; font-weight:900; color:' + verdictColor + '; margin-top:6px;">' + verdict + '</div>';
  html +=   '<div style="font-family:monospace; font-size:15px; color:#fff; letter-spacing:2px; margin-top:10px; text-transform:uppercase;">' +
              (gapAnalysis === 0 ? 'EXPECTED TO EXCEED RESPECT GOAL' : '8.0 GOAL MATHEMATICALLY IMPOSSIBLE AGAINST THIS POOL') +
            '</div>';
  html += '</div>';
  html += '<div style="text-align:center; margin-bottom:40px;">';
  html +=   '<div style="font-family:Orbitron; font-size:20px; color:#fff; margin-bottom:12px;">20‑HIT EST.: <span style="font-weight:700;">' +
              totalRespect.toFixed(2) + ' RESPECT</span></div>';
  html +=   '<div style="font-family:Orbitron; font-size:20px; color:#fff; margin-bottom:12px;">GAP ANALYSIS: <span style="font-weight:700;">' +
              gapAnalysis + ' WASTED HITS</span></div>';
  html +=   '<div style="font-family:Orbitron; font-size:20px; color:#fff;">EFFICIENCY: <span style="font-weight:700;">' +
              efficiency + ' AVG / HIT</span></div>';
  html += '</div>';
  html += '<div style="display:flex; justify-content:center; gap:28px; margin-bottom:10px;">';
  var ordered = [
    { key: "amber", label: "SAFE",    color: "var(--amber)" },
    { key: "green", label: "PRIME",   color: "var(--green)" },
    { key: "blue",  label: "RISKY",   color: "var(--blue)" },
    { key: "red",   label: "SUICIDE", color: "var(--red)" }
  ];
  ordered.forEach(function(tier) {
    var tc = tierCounts[tier.key];
    var hitsUsed = tc.hitsUsed;
    var avgHit = hitsUsed ? (tc.respect / hitsUsed).toFixed(2) : "0.00";
    html += '<div style="flex:1; min-width:120px;">';
    html +=   '<div style="font-family:Orbitron; font-size:24px; font-weight:700; color:' + tier.color + '; margin-bottom:10px;">' +
                tier.label + '</div>';
    html +=   '<div style="font-size:16px; margin:6px 0;">TARGETS: ' + tc.targets + '</div>';
    if (tier.label === "SUICIDE" && hitsUsed === 0) {
      html += '<div style="font-size:16px; margin:6px 0;">STATUS: NOT VIABLE</div>';
    } else {
      html += '<div style="font-size:16px; margin:6px 0;">SIM HITS: ' + hitsUsed + '</div>';
      html += '<div style="font-size:16px; margin:6px 0;">EST. RESP: ' + tc.respect + '</div>';
      html += '<div style="font-size:16px; margin:6px 0;">AVG/HIT: ' + avgHit + '</div>';
    }
    html += '</div>';
  });
  html += '</div>';
  return html;
}

let SESSION = { uid:0, myStats:0, rawData:[], counts:{amber:0,green:0,blue:0,red:0} };

function formatStats(num) {
  if (!num || num === 0) return "---";
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  return num.toLocaleString();
}

function engage() {
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
    document.getElementById('h-status').textContent = "SCANNING FACTION...";
    google.script.run.withSuccessHandler(fData => {
      if(fData.error) {
        document.getElementById('h-status').textContent = "FACTION ERR";
        return;
      }
      toggleOverride();
      document.getElementById('h-status').textContent = "OPERATIONAL";
      startScan(fData);
    }).getFactionData(fid);
  }).getUserName(uid);
}

function startScan(d){
  document.getElementById('grid').innerHTML = '';
  SESSION.rawData = [];
  SESSION.counts = {amber:0,green:0,blue:0,red:0};
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
        const scDatum = (scData && scData[0]) ? scData[0] : scData || { fair_fight: 1.0, bs_estimate: 0 };
        const total = Number(scDatum.bs_estimate) || 0;
        const ff = Number(scDatum.fair_fight) || 1.0;
        let tier;
        if (ff < 3.2) tier = 'amber';
        else if (ff < 4.7) tier = 'green';
        else if (ff < 5.3) tier = 'blue';
        else tier = 'red';
        const obj = { m: d.members[id], id, total, ff, tier };
        SESSION.rawData.push(obj);
        SESSION.counts[tier]++;
        renderCard(obj);
        updateBreakdown();
      });
    }).getScouterDataBatch(chunkCsv, SESSION.uid);
  }
}

function renderCard(obj){
  const card = document.createElement('div');
  card.className = 'card';
  card.style.borderLeft = '4px solid var(--'+obj.tier+')';
  card.innerHTML =
    '<div>' +
      '<div style="color:var(--' + obj.tier + '); font-weight:700;">' + obj.ff.toFixed(2) + 'x FF</div>' +
      '<div style="font-size:13px;">' + obj.m.name + '</div>' +
    '</div>' +
    '<div style="text-align:right;">' +
      '<div class="label" style="margin:0;">EST. POWER</div>' +
      '<div style="font-size:14px; font-weight:700; color:#fff;">' + formatStats(obj.total) + '</div>' +
      '</div>';
  card.ondblclick = closeIntel;
  document.getElementById('grid').prepend(card);
}

function closeIntel(){
  document.getElementById('intel-area').style.display = 'none';
}

function updateBreakdown(){
  const cont = document.getElementById('breakdown');
  cont.innerHTML = '';
  Object.keys(SESSION.counts).forEach(t => {
    if(SESSION.counts[t] > 0) {
      const pill = document.createElement('div');
      pill.className = 'nav-pill';
      pill.style.color = 'var(--'+t+')';
      pill.style.borderColor = 'var(--'+t+')';
      pill.textContent = SESSION.counts[t] + ' ' + t.toUpperCase();
      pill.onclick = () => showTacticalBriefing(t);
      cont.appendChild(pill);
    }
  });
}

function showTacticalBriefing(tier) {
  const targets = SESSION.rawData
    .filter(t => t.tier === tier)
    .sort((a,b) => b.ff - a.ff)
    .slice(0,3);

  document.getElementById('m-tier-label').textContent = tier.toUpperCase();
  document.getElementById('m-tier-label').style.color = 'var(--'+tier+')';

  let html = '';

  targets.forEach(t => {
    const ratio = SESSION.myStats / (t.total || 1);
    const advice = ratio > 1.5 ? "DOMINANT" : ratio > 0.9 ? "FAVORABLE" : "HIGH RISK";

    html +=
      '<div class="target-row" style="border-left: 5px solid var(--' + tier + ')">' +
        '<div style="flex:1.5;">' +
          '<div class="label">TARGET</div>' +
          '<div style="font-size:16px; font-weight:700;">' + t.m.name + '</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div class="label">EST. POWER</div>' +
          '<div style="font-size:14px; color:#fff;">' + formatStats(t.total) + '</div>' +
        '</div>' +
        '<div style="flex:1;">' +
          '<div class="label">MULT</div>' +
          '<div style="font-size:14px; color:var(--' + tier + '); font-weight:700;">' + t.ff.toFixed(2) + 'x</div>' +
        '</div>' +
        '<div style="flex:2;">' +
          '<div class="label">ADVICE</div>' +
          '<div style="font-size:10px; font-weight:600; color:#aaa;">' + advice + '</div>' +
          '<div style="display:flex; gap:8px; margin-top:8px;">' +
            '<a href="https://www.torn.com/loader.php?sid=attack&user2ID=' + t.id + '" target="_blank" class="nav-pill" style="background:var(--green); color:#000; padding:5px 12px; font-size:9px;">ENGAGE</a>' +
          '</div>' +
        '</div>' +
      '</div>';
  });

  document.getElementById('briefing-content').innerHTML =
    html || '<div style="padding:40px; text-align:center;">NO DATA.</div>';

  document.getElementById('main-ui').classList.add('blur');
  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('main-ui').classList.remove('blur');
}

function generateReport() {
  if (!SESSION.rawData.length) {
    alert('No scan data. Run a scan first.');
    return;
  }

  const hitCount = 20;
  const RESP_MULT = 2.71 * 1.40;
  var tornStats = SESSION.myStats || 1;
  var allData = SESSION.rawData;

  var categorized = { amber: [], green: [], blue: [], red: [] };

  allData.forEach(function(member) {
    var ratio = tornStats / (member.total || 1);
    var winProb = 'red';
    if (ratio > 1.2) winProb = 'green';
    else if (ratio >= 0.85) winProb = 'blue';

    member.winProb = winProb;
    member.respect = member.ff * RESP_MULT;

    categorized[member.tier].push(member);
  });

  var hits = [];
  var hitsRemaining = hitCount;
  var totalRespect = 0;

  Object.keys(categorized).forEach(function(key) {
    categorized[key].forEach(function(target) {
      if (hitsRemaining > 0) {
        hits.push(target);
        totalRespect += target.respect;
        hitsRemaining--;
      }
    });
  });

  var efficiency = (totalRespect / hitCount).toFixed(2);
  var gapAnalysis = totalRespect >= 8 ? 0 : Math.ceil((8 - totalRespect) / efficiency);

  var verdict = 'EXCELLENT RANK WAR';
  var verdictColor = '#00ff88';
  if (efficiency < 4) { verdict = 'POOR RANK WAR'; verdictColor = '#ff3333'; }
  else if (efficiency < 7) { verdict = 'MODERATE RANK WAR'; verdictColor = '#f6da00'; }

  var tierCounts = {
    amber: {
      targets: categorized.amber.length,
      hitsUsed: hits.filter(h => h.tier === 'amber').length,
      respect: Math.round(hits.filter(h => h.tier === 'amber').reduce((a,b)=>a+b.respect,0))
    },
    green: {
      targets: categorized.green.length,
      hitsUsed: hits.filter(h => h.tier === 'green').length,
      respect: Math.round(hits.filter(h => h.tier === 'green').reduce((a,b)=>a+b.respect,0))
    },
    blue: {
      targets: categorized.blue.length,
      hitsUsed: hits.filter(h => h.tier === 'blue').length,
      respect: Math.round(hits.filter(h => h.tier === 'blue').reduce((a,b)=>a+b.respect,0))
    },
    red: {
      targets: categorized.red.length,
      hitsUsed: hits.filter(h => h.tier === 'red').length,
      respect: Math.round(hits.filter(h => h.tier === 'red').reduce((a,b)=>a+b.respect,0))
    }
  };

  var body = buildReportHTML(
    verdict,
    verdictColor,
    totalRespect,
    gapAnalysis,
    efficiency,
    tierCounts
  );

  document.getElementById('modalReportBody').innerHTML = body;
  document.getElementById('modalReportBg').style.display = 'block';
  document.getElementById('modalReport').style.display = 'block';
}
function toggleOverride(){
  const p = document.getElementById('override-panel');
  if (!p) return;
  p.style.top = (p.style.top === '60px') ? '-500px' : '60px';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('main-ui').classList.remove('blur');
}

document.addEventListener('DOMContentLoaded', () => {
  toggleOverride();
});

function showInitialModal() {
  document.getElementById('initialModalBg').style.display = 'block';
  document.getElementById('initialModal').style.display = 'block';
}
</script>
</body>
</html>
`;
}
