// const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
// const SC_KEY = 'rwLgZTyqgWDxhoCx';
// const WORKER_URL = 'https://torn-war-bridge.tmecf.workers.dev/';

// Helper function to get API keys from Script Properties with fallback
function getApiKey(keyName, fallbackValue = '') {
  try {
    const props = PropertiesService.getScriptProperties();
    const value = props.getProperty(keyName);
    if (value) return value;
    
    return fallbackValue;
  } catch (e) {
    return fallbackValue;
  }
}

function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('TACTICAL HUD V1.9.8')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// SERVER SIDE FETCHERS
// Get user name and total stats from Torn API
function getUserName(uid) {
  try {
    const tornKey = getApiKey('TORN_API_KEY', 'DEMO_KEY');
    if (tornKey === 'DEMO_KEY') {
      return { name: 'Demo User', total: 50000000, demoMode: true };
    }
    
    const url = `https://api.torn.com/user/${uid}?selections=basic,personalstats&key=${tornKey}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(response.getContentText());
    
    if (data.error) {
      return { name: 'Error: ' + data.error.error, total: 0, demoMode: true };
    }
    
    const total = (data.personalstats?.strength || 0) + 
                  (data.personalstats?.speed || 0) + 
                  (data.personalstats?.dexterity || 0) + 
                  (data.personalstats?.defense || 0);
    
    return { name: data.name || 'Unknown', total: total };
  } catch (e) {
    return { name: 'Demo User', total: 50000000, demoMode: true };
  }
}

// Get faction data wrapper
function getFactionData(fid) {
  const result = fetchFactionMembersV2(fid);
  return result;
}

function getScouterData(tid, uid) {
  try {
    const scKey = getApiKey('SC_KEY', 'DEMO_KEY');
    if (scKey === 'DEMO_KEY') {
      return [{
        bs_estimate: Math.floor(Math.random() * 100000000) + 10000000,
        fair_fight: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        demoMode: true
      }];
    }
    
    const url = "https://ffscouter.com/api/v1/get-stats?key=" + scKey + "&targets=" + tid + "&user_id=" + uid;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    
    if (!data || data.error) {
      return [{
        bs_estimate: Math.floor(Math.random() * 100000000) + 10000000,
        fair_fight: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
        demoMode: true
      }];
    }
    
    return data;
  } catch (e) {
    return [{
      bs_estimate: Math.floor(Math.random() * 100000000) + 10000000,
      fair_fight: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
      demoMode: true
    }];
  }
}

function fetchFactionMembersV2(fid) {
  try {
    const tornKey = getApiKey('TORN_API_KEY', 'DEMO_KEY');
    if (tornKey === 'DEMO_KEY') {
      return {
        name: 'Demo Faction',
        members: {
          '12345': { name: 'Alice' },
          '67890': { name: 'Bob' },
          '11111': { name: 'Charlie' }
        },
        demoMode: true
      };
    }
    
    const url = `https://api.torn.com/v2/faction/${fid}/members?key=${tornKey}`;
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const data = JSON.parse(res.getContentText());
    
    if (data.error) {
      return {
        name: 'Demo Faction',
        members: {
          '12345': { name: 'Alice' },
          '67890': { name: 'Bob' },
          '11111': { name: 'Charlie' }
        },
        demoMode: true
      };
    }
    
    return {
      name: data.name || 'UNKNOWN',
      members: data.members || {}
    };
  } catch (e) {
    return {
      name: 'Demo Faction',
      members: {
        '12345': { name: 'Alice' },
        '67890': { name: 'Bob' },
        '11111': { name: 'Charlie' }
      },
      demoMode: true
    };
  }
}

function fetchUserTorn(uid) {
  try {
    const tornKey = getApiKey('TORN_API_KEY', 'DEMO_KEY');
    if (tornKey === 'DEMO_KEY') {
      return { name: 'Demo User', player_id: uid };
    }
    
    const url = `https://api.torn.com/user/${uid}?selections=basic,profile&key=${tornKey}`;
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    return JSON.parse(response.getContentText());
  } catch (e) {
    return { name: 'Demo User', player_id: uid };
  }
}


function getHTML() {
  const workerUrl = getApiKey('WORKER_URL', '');
  const hasWorkerUrl = workerUrl !== '';
  
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
  button:hover:not(:disabled) { background: #333; border-color: var(--prime); }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-push { color: var(--prime); border: 1px dashed var(--prime); margin-top: auto; text-align: center; }
  
  /* Main Content */
  .main { flex: 1; padding: 25px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; }
  .faction-header { font-size: 24px; font-weight: bold; color: var(--prime); border-bottom: 1px solid #333; padding-bottom: 10px; }
  
  /* Demo Mode Banner */
  .demo-banner { background: linear-gradient(90deg, #ff4444, #ffaa00); color: #fff; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: bold; margin-bottom: 15px; display: none; }
  
  /* Error Banner */
  .error-banner { background: #ff4444; color: #fff; padding: 12px 20px; border-radius: 8px; text-align: center; font-weight: bold; margin-bottom: 15px; display: none; }
  
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
  .card { background: var(--card); border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #222; transition: 0.3s; cursor: pointer; }
  .card:hover { transform: translateY(-2px); border-color: #444; box-shadow: 0 4px 12px rgba(0,229,255,0.2); }
  
  /* Visual Trace Bar */
  #progress-container { background: #111; padding: 15px; border-radius: 10px; border: 1px solid #222; }
  .bar-bg { background: #000; height: 4px; width: 100%; border-radius: 2px; margin-top: 8px; }
  .bar-fill { height: 100%; width: 0%; background: var(--prime); box-shadow: 0 0 10px var(--prime); transition: 0.3s; }
  
  /* Modal */
  .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; align-items: center; justify-content: center; }
  .modal-content { background: var(--card); border: 1px solid #444; border-radius: 12px; padding: 25px; max-width: 500px; width: 90%; box-shadow: 0 8px 32px rgba(0,229,255,0.3); }
  .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #333; }
  .modal-title { font-size: 20px; font-weight: bold; color: var(--prime); }
  .modal-close { background: none; border: none; color: #999; font-size: 24px; cursor: pointer; padding: 0; width: auto; }
  .modal-close:hover { color: #fff; }
  .modal-body { display: flex; flex-direction: column; gap: 15px; }
  .modal-row { display: flex; justify-content: space-between; padding: 10px; background: #0a0a0b; border-radius: 6px; }
  .modal-label { color: #999; font-size: 12px; text-transform: uppercase; }
  .modal-value { color: #fff; font-weight: bold; }
  .modal-actions { display: flex; gap: 10px; margin-top: 10px; }
  .modal-btn { flex: 1; padding: 10px; background: #222; border: 1px solid #444; color: var(--prime); border-radius: 6px; cursor: pointer; font-weight: bold; text-align: center; transition: 0.2s; }
  .modal-btn:hover { background: #333; border-color: var(--prime); }
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
  <button id="push-btn" class="btn-push" onclick="pushToKV()" ${!hasWorkerUrl ? 'disabled title="Worker URL not configured in Script Properties"' : ''}>Daily KV Push</button>
</div>

<div class="main">
  <div id="demo-banner" class="demo-banner">⚠️ DEMO MODE: Using sample data. Configure Script Properties for live data.</div>
  <div id="error-banner" class="error-banner"></div>
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

<!-- Modal -->
<div id="modal" class="modal-overlay" onclick="closeModalIfOutside(event)">
  <div class="modal-content" onclick="event.stopPropagation()">
    <div class="modal-header">
      <div class="modal-title" id="modal-title">Member Details</div>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body" id="modal-body"></div>
  </div>
</div>

<script>
let SESSION = { data: [], myStats: 0, uid: null, demoMode: false, isScanning: false };
const WORKER_URL = '${workerUrl}';

function showError(message) {
  const banner = document.getElementById('error-banner');
  banner.style.background = '#ff4444';
  banner.textContent = message;
  banner.style.display = 'block';
  setTimeout(() => { banner.style.display = 'none'; }, 5000);
}

function showDemoMode() {
  SESSION.demoMode = true;
  document.getElementById('demo-banner').style.display = 'block';
}

function runTacticalScan() {
  const uid = document.getElementById('uid').value;
  const fid = document.getElementById('fid').value;
  if(!uid || !fid) return alert("Credentials missing.");
  
  if (SESSION.isScanning) {
    showError('Scan already in progress. Please wait.');
    return;
  }
  
  SESSION.isScanning = true;
  SESSION.uid = uid;
  SESSION.data = [];
  document.getElementById('grid').innerHTML = "";
  document.getElementById('progress-container').style.display = "block";
  document.getElementById('demo-banner').style.display = "none";
  
  google.script.run
    .withSuccessHandler(user => {
      if (user.demoMode) showDemoMode();
      document.getElementById('op-name').textContent = user.name;
      document.getElementById('op-stats').textContent = formatNum(user.total);
      SESSION.myStats = user.total;

      google.script.run
        .withSuccessHandler(fac => {
          if (fac.demoMode) showDemoMode();
          document.getElementById('fac-name').textContent = fac.name.toUpperCase();
          const members = Object.keys(fac.members);
          let count = 0;

          members.forEach(id => {
            google.script.run
              .withSuccessHandler(scouter => {
                if (scouter && scouter[0] && scouter[0].demoMode) showDemoMode();
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
                if(count === members.length) {
                  setTimeout(() => {
                    document.getElementById('progress-container').style.display = "none";
                    SESSION.isScanning = false;
                  }, 1000);
                }
              })
              .withFailureHandler(err => {
                showError('Failed to fetch scouter data: ' + (err.message || String(err)));
                count++;
                if(count === members.length) SESSION.isScanning = false;
              })
              .getScouterData(id, uid);
          });
        })
        .withFailureHandler(err => {
          showError('Failed to fetch faction data: ' + (err.message || String(err)));
          document.getElementById('progress-container').style.display = 'none';
          SESSION.isScanning = false;
        })
        .getFactionData(fid);
    })
    .withFailureHandler(err => {
      showError('Failed to fetch user data: ' + (err.message || String(err)));
      document.getElementById('progress-container').style.display = 'none';
      SESSION.isScanning = false;
    })
    .getUserName(uid);
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
  card.onclick = () => openModal(o);
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

function openModal(member) {
  const modalTitle = document.getElementById('modal-title');
  modalTitle.textContent = member.name;
  
  const tierColors = {
    secure: 'var(--secure)',
    prime: 'var(--prime)',
    risky: 'var(--risky)',
    suicide: 'var(--suicide)'
  };
  
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = '';
  
  // Create and append elements safely
  const idRow = createModalRow('Player ID', member.id);
  const statsRow = createModalRow('Battle Stats', formatNum(member.stats));
  const ffRow = createModalRow('Fair Fight', member.ff.toFixed(2) + 'x', tierColors[member.tier]);
  const tierRow = createModalRow('Tier', member.tier.toUpperCase(), tierColors[member.tier]);
  
  modalBody.appendChild(idRow);
  modalBody.appendChild(statsRow);
  modalBody.appendChild(ffRow);
  modalBody.appendChild(tierRow);
  
  // Create action buttons
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'modal-actions';
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'modal-btn';
  copyBtn.textContent = 'Copy ID';
  copyBtn.onclick = () => copyToClipboard(member.id);
  
  const profileBtn = document.createElement('button');
  profileBtn.className = 'modal-btn';
  profileBtn.textContent = 'Open Profile';
  profileBtn.onclick = () => window.open('https://www.torn.com/profiles.php?XID=' + encodeURIComponent(member.id), '_blank');
  
  actionsDiv.appendChild(copyBtn);
  actionsDiv.appendChild(profileBtn);
  modalBody.appendChild(actionsDiv);
  
  document.getElementById('modal').style.display = 'flex';
}

function createModalRow(label, value, color) {
  const row = document.createElement('div');
  row.className = 'modal-row';
  
  const labelSpan = document.createElement('span');
  labelSpan.className = 'modal-label';
  labelSpan.textContent = label;
  
  const valueSpan = document.createElement('span');
  valueSpan.className = 'modal-value';
  valueSpan.textContent = value;
  if (color) {
    valueSpan.style.color = color;
  }
  
  row.appendChild(labelSpan);
  row.appendChild(valueSpan);
  return row;
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function closeModalIfOutside(event) {
  if (event.target.id === 'modal') {
    closeModal();
  }
}

function copyToClipboard(text) {
  // Try modern Clipboard API first
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showInfo('ID copied to clipboard: ' + text);
    }).catch(() => {
      // Fallback to deprecated execCommand
      fallbackCopyToClipboard(text);
    });
  } else {
    // Fallback for older browsers
    fallbackCopyToClipboard(text);
  }
}

function fallbackCopyToClipboard(text) {
  const input = document.createElement('input');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  try {
    document.execCommand('copy');
    showInfo('ID copied to clipboard: ' + text);
  } catch (e) {
    showError('Failed to copy ID to clipboard');
  }
  document.body.removeChild(input);
}

function showInfo(message) {
  const banner = document.getElementById('error-banner');
  banner.style.background = '#00e5ff';
  banner.textContent = message;
  banner.style.display = 'block';
  setTimeout(() => { 
    banner.style.display = 'none'; 
    banner.style.background = '#ff4444';
  }, 3000);
}

async function pushToKV() {
  if (!WORKER_URL) {
    showError('Worker URL not configured. Set WORKER_URL in Script Properties.');
    return;
  }
  
  const btn = document.getElementById('push-btn');
  btn.textContent = "UPLOADING...";
  btn.disabled = true;
  
  for (let item of SESSION.data) {
    try {
      const res = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spies: [{ player_id: item.id, name: item.name, total_stats: item.stats, operator: SESSION.uid }] })
      });
      const ack = await res.json();
      if(!ack.ok) throw "Fail";
    } catch(e) { 
      btn.textContent = "HTTPS ERROR";
      btn.disabled = false;
      showError('Failed to push data to Worker: ' + (e.message || String(e)));
      return;
    }
  }
  btn.textContent = "SYNC COMPLETE";
  setTimeout(() => {
    btn.textContent = "Daily KV Push";
    btn.disabled = false;
  }, 2000);
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