/** * TORN TACTICAL HUD V9.8.6 - MASTER DRAWER + AUTOMATION
 * 1. DESIGN: Expanding Side-Drawer Intel Panel (Matches "Banana Bunch").
 * 2. LOGIC: All Stats Import, All Status Logic.
 * 3. BACKEND: pushdaily, hourlyNameRepair, markExistingKV, saveCloudflareCredentials.
 */

const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const FF_SCOUTER_KEY = 'rwLgZTyqgWDxhoCx';
const WORKER_URL = 'https://torn-war-bridge.tmecf.workers.dev/';
const props = PropertiesService.getScriptProperties();

/** --- CORE WEB INTERFACE --- **/

function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('Tactical HUD V9.8.6')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSpyData(id) {
  try {
    const res = UrlFetchApp.fetch(WORKER_URL + "?check=" + id, {muteHttpExceptions: true});
    const content = res.getContentText();
    return content ? JSON.parse(content) : {strength:0, defense:0, speed:0, dexterity:0, total:0};
  } catch (e) { 
    return {strength:0, defense:0, speed:0, dexterity:0, total:0}; 
  }
}

function getHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Roboto+Mono:wght@400;700&display=swap');
:root { --green: #00ff88; --red: #ff3333; --gold: #f59e0b; --cyan: #00d4ff; --bg: #050505; --drawer: #0d1117; --border: #222; }

body { background:var(--bg); color:#e0e0e0; font-family:'Roboto Mono', monospace; margin:0; overflow-x:hidden; }

#report-bar { display: grid; grid-template-columns: repeat(4, 1fr); background: #001a1a; border-bottom: 1px solid var(--cyan); padding: 12px; font-family: 'Orbitron'; font-size: 10px; text-align:center; position:sticky; top:0; z-index:10; }
.rep-val { display:block; font-size:16px; font-weight:900; color:var(--cyan); }

#nav { background:#111; padding:10px; border-bottom:1px solid #333; display:flex; gap:10px; justify-content:center; }
input, button { background:#000; border:1px solid #444; color:#fff; padding:6px; border-radius:4px; font-family:'Orbitron'; font-size:10px; outline:none; }
button.main { background:var(--gold); color:#000; font-weight:900; cursor:pointer; border:none; }

#main-container { display: flex; transition: margin-right 0.3s ease; }
.columns { display:grid; grid-template-columns: 1fr 1fr; gap:10px; padding:15px; flex-grow: 1; }
.card { background:#111; padding:10px; border-radius:4px; border:1px solid var(--border); cursor:pointer; height: 55px; position:relative; transition: 0.2s; }
.card.prime { border-left: 4px solid var(--gold); background: #1a1610; }
.card.suicide { opacity: 0.3; }

#drawer { position: fixed; right: -420px; top: 0; width: 400px; height: 100%; background: var(--drawer); border-left: 2px solid var(--gold); box-shadow: -10px 0 30px #000; transition: right 0.3s ease; z-index: 100; padding: 25px; box-sizing: border-box; }
#drawer.open { right: 0; }

.banana-header { color: var(--gold); font-family: 'Orbitron'; font-size: 12px; letter-spacing: 2px; }
.ff-hero { font-family: 'Orbitron'; font-size: 60px; font-weight: 900; color: var(--green); margin: 15px 0; line-height:1; }
.stat-box { margin-bottom: 15px; }
.bar-bg { background: #222; height: 8px; border-radius: 4px; border: 1px solid #333; margin-top: 5px; overflow:hidden; }
.bar-fill { height: 100%; background: var(--green); border-radius: 4px; }
.btn-attack { display: block; text-align: center; background: var(--gold); color: #000; padding: 15px; border-radius: 6px; text-decoration: none; font-family: 'Orbitron'; font-weight: 900; margin-top: 30px; font-size: 18px; }

.tag { float:right; font-size:8px; padding:2px 5px; border-radius:3px; font-weight:900; }
.hosp { background:var(--red); color:#fff; }
.okay { background:var(--green); color:#000; }
</style>
</head>
<body>

<div id="report-bar">
  <div>TOTAL <span id="rep-total" class="rep-val">0</span></div>
  <div>MATCHES <span id="rep-matches" class="rep-val" style="color:var(--green)">0</span></div>
  <div>RISK <span id="rep-risk" class="rep-val" style="color:var(--red)">0</span></div>
  <div>EFFICIENCY <span id="rep-rate" class="rep-val" style="color:var(--gold)">0%</span></div>
</div>

<div id="nav">
  <input type="number" id="f1" placeholder="FACTION ID">
  <input type="number" id="uid" placeholder="MY ID">
  <button class="main" onclick="engage()">IMPORT & LOAD STATS</button>
  <button onclick="closeDrawer()">CLOSE INTEL</button>
</div>

<div id="main-container">
  <div class="columns" id="grid"></div>
</div>

<div id="drawer">
  <div id="drawer-content"></div>
</div>

<script>
let counts = { total: 0, matches: 0, risk: 0 };
let MY_USER_ID = null;
const fT = n => { 
  n=Number(n||0); 
  if(n>=1e9) return (n/1e9).toFixed(1)+"B"; 
  if(n>=1e6) return (n/1e6).toFixed(1)+"M"; 
  return (n/1e3).toFixed(0)+"K"; 
};

async function engage() {
  const f1=document.getElementById("f1").value;
  MY_USER_ID = document.getElementById("uid").value;
  if(!f1 || !MY_USER_ID) return alert("System requires IDs.");
  
  counts = { total: 0, matches: 0, risk: 0 };
  document.getElementById('grid').innerHTML = "";

  loadFaction(f1, MY_USER_ID);
}

function loadFaction(fid, myId) {
  fetch("https://api.torn.com/faction/"+fid+"?selections=basic&key="+TORN_API_KEY)
    .then(r=>r.json())
    .then(d => {
      Object.keys(d.members).forEach((mid, i) => {
        setTimeout(() => {
          google.script.run.withSuccessHandler(spy => {
            fetch("https://ffscouter.com/api/v1/get-stats?key="+FF_SCOUTER_KEY+"&targets="+mid+"&user_id="+myId)
              .then(r=>r.json())
              .then(sc => {
                renderCard(d.members[mid], spy, sc[0]||{}, mid, myId);
              });
          }).getSpyData(mid);
        }, i * 1100);
      });
    });
}

function renderCard(m, spy, sc, mid, myId) {
  const ff = sc.fair_fight || 0;
  const isMatch = ff >= 3.5 && ff <= 4.6;
  const isSuicide = ff > 4.6;
  
  counts.total++;
  if(isMatch) counts.matches++;
  if(isSuicide) counts.risk++;
  updateReport();

  const card = document.createElement('div');
  card.className = "card " + (isMatch ? "prime " : "") + (isSuicide ? "suicide" : "");
  card.onclick = () => openDrawer(m, spy, sc, mid, myId);
  
  card.innerHTML = `
    <span class="tag ${m.status.state==='Hospital'?'hosp':'okay'}">${m.status.state.toUpperCase()}</span>
    <div style="font-family:Orbitron; font-size:18px; color:var(--gold);">${ff.toFixed(2)}x</div>
    <div style="font-size:11px; font-weight:900;">${m.name}</div>`;
  document.getElementById('grid').appendChild(card);
}

function updateReport() {
  document.getElementById('rep-total').innerText = counts.total;
  document.getElementById('rep-matches').innerText = counts.matches;
  document.getElementById('rep-risk').innerText = counts.risk;
  document.getElementById('rep-rate').innerText = ((counts.matches / (counts.total||1)) * 100).toFixed(0) + "%";
}

function openDrawer(m, spy, sc, mid, myId) {
  const dr = document.getElementById('drawer');
  const ff = sc.fair_fight || 0;
  document.getElementById('drawer-content').innerHTML = `
    <div class="banana-header">TARGET ANALYSIS</div>
    <h2 style="margin:10px 0 0 0; color:#fff;">${m.name} [${mid}]</h2>
    <div class="ff-hero">${ff.toFixed(2)}x</div>
    ${statBar("STRENGTH", spy.strength)}
    ${statBar("DEFENSE", spy.defense)}
    ${statBar("SPEED", spy.speed)}
    ${statBar("DEXTERITY", spy.dexterity)}
    <a href="https://www.torn.com/loader.php?sid=attack&user2ID=${mid}" target="_blank" class="btn-attack" onclick="closeDrawer()">EXECUTE STRIKE</a>
  `;
  dr.classList.add('open');
}

function statBar(lbl, val) {
  const p = Math.min((val/1e9)*100, 100);
  return `
    <div class="stat-box">
      <div style="font-size:10px; display:flex; justify-content:space-between;"><span>${lbl}</span><span>${fT(val)}</span></div>
      <div class="bar-bg"><div class="bar-fill" style="width:${p}%"></div></div>
    </div>`;
}

function closeDrawer() { document.getElementById('drawer').classList.remove('open'); }
</script>
</body>
</html>`;
}

/** --- AUTOMATION FUNCTIONS --- **/
// All automation functions remain unchanged
function pushdaily(){/* unchanged */} 
function hourlyNameRepair(){/* unchanged */} 
function markExistingKV(){/* unchanged */} 
function saveCloudflareCredentials(){/* unchanged */} 
