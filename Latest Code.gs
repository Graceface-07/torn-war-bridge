const TORN_API_KEY = 'CZP2D2ZnbXWsYiDT';
const SC_KEY = 'rwLgZTyqgWDxhoCx';
const TORN_MAIN_KEY = 'gc43XVxOpCcwLnY6';

const DEFAULT_USER_ID = '2702970';
const DEFAULT_FACTION_ID = '42505';

function doGet() {
  return HtmlService.createHtmlOutput(getHTML())
    .setTitle('Command Center v2')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// CORS-safe, server-side API functions
function getUserDataV2(uid) {
  try {
    var url = 'https://api.torn.com/v2/user/' + encodeURIComponent(uid) +
      '?selections=profile,battlestats,inventory&key=' + encodeURIComponent(TORN_MAIN_KEY);
    var res = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    var data = JSON.parse(res.getContentText());
    return { success: true, data: data };
  } catch(e) {
    return { success: false, error: 'USER_API_FAIL', details: e.toString() };
  }
}

function getFactionDataV2(fid) {
  try {
    var url = 'https://api.torn.com/v2/faction/' + encodeURIComponent(fid) +
      '?selections=basic&key=' + encodeURIComponent(TORN_MAIN_KEY);
    var res = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
    var data = JSON.parse(res.getContentText());
    return { success: true, data: data };
  } catch(e) {
    return { success: false, error: 'FACTION_API_FAIL', details: e.toString() };
  }
}

function getHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Command Center v2</title>
<style>
body { background: #181c22; color: #dee3ea; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; margin: 0;}
.header { background: #171a1e; padding: 14px 30px; font-size: 20px; color: #fff; font-weight: 800; letter-spacing: 0.7px; display: flex; align-items: center; justify-content: space-between; box-shadow:0 4px 18px #03080e78;}
.menu-right { display:flex; align-items:center; gap:8px;}
.select, .button { border: none; background: #232731; color: #eee; border-radius: 5px; padding: 6px 13px; font-size: 13px; font-family: inherit;}
.select { margin-right: 4px; }
.button { background: #f5b641; font-weight: 700; color: #181c22; cursor:pointer;}
.button.secondary { background: #232731; color: #f5b641; border:1.5px solid #f5b641;}
.live { color:#deb942; font-weight:700; font-size:13px; background:#222932; border-radius:8px; display:inline-block; padding:3px 13px;}
.tiles { display: flex; flex-wrap: wrap; gap: 22px; margin: 27px 32px 0 32px;}
.tile {flex:1; min-width:210px; background: linear-gradient(110deg, #212935 64%, #25304a 100%); border: 2.2px solid #313c54; border-radius: 15px; padding: 22px 27px 17px 24px; margin-bottom:0;
transition: border-color 0.16s, box-shadow 0.18s, background 0.12s; position:relative; cursor:pointer; max-width:278px; box-shadow:0 6px 36px #0007,0 0.5px 0 #15181c;}
.tile:not(:last-child){margin-right:16px;}
.tile:hover { border-color: #f5b641; background:linear-gradient(110deg, #262c38 64%, #343b4f 100%);}
.tile .title { font-size:17.5px; font-weight:900; color:#f5b641; margin-bottom:6px; letter-spacing:0.25px; text-shadow: 0 1.5px 2.5px #0007;}
.tile .desc { font-size:13.5px; color:#90badf; opacity:0.96; }
.tile.war .title { color:#51d6ff;}
.tile.income .title { color:#3ed1a5;}
.tile.faction .title { color:#be9aff;}
.tile.custom .title { color:#adb5bd;}
/* Modal */
#modal-backdrop {
  display:none; position:fixed; left:0; top:0; width:100vw; height:100vh;
  background:rgba(16,16,20,0.87); z-index:99; justify-content:center; align-items:center;
}
#modal-backdrop.active{display:flex;}
#modal-content {
  width:clamp(380px, 68vw, 730px);
  background: linear-gradient(110deg, #23273a 72%,#252f43 100%);
  border-radius: 21px;
  border:2.7px solid #363c56;
  box-shadow:0 11px 62px #000c;
  min-height:350px; min-width:320px; padding:0;position:relative;
  display:flex; flex-direction:column;overflow:hidden;
}
#modal-header {
  background:#15181f;
  padding:24px 34px 16px 32px;
  font-size: 22px;
  font-weight:900;
  color: #ffc04c;
  letter-spacing:0.13px;
  display:flex;align-items:center;justify-content:space-between;
  border-bottom:2.1px solid #222435;
}
#modal-close {
  background:none; border:none; color:#ffc04c; font-size:30px;font-weight:700;cursor:pointer;line-height:1;
  margin:-9px 0 0 9px; opacity:0.88; transition:opacity 0.15s;}
#modal-close:hover{opacity:1;}
#modal-body { padding:32px 37px 28px 34px; color:#dee3ea; font-size:16.8px; min-height:210px; }
@media(max-width:1020px){ .tiles{flex-direction:column;} .tile:not(:last-child){margin-right:0;} #modal-body { padding:18px 10vw 16px 6vw;} #modal-content{width:98vw;} }
</style>
</head>
<body>
  <div class="header">
    <div>Command Center v2</div>
    <div class="menu-right">
      <button class="button" id="addTaskBtn">Add Task</button>
      <select class="select" id="goalDropdown"><option>All goals</option></select>
      <select class="select" id="bucketDropdown"><option>All buckets</option></select>
      <span class="live">Live</span>
    </div>
  </div>
  <div class="tiles">
    <div class="tile stat" onclick="openCategoryModal('statGrowth')"><div class="title">Stat Growth</div><div class="desc">Default focus</div></div>
    <div class="tile war" onclick="openCategoryModal('warReadiness')"><div class="title">War Readiness</div><div class="desc">Click to open</div></div>
    <div class="tile income" onclick="openCategoryModal('income')"><div class="title">Income</div><div class="desc">Click to open</div></div>
    <div class="tile faction" onclick="openCategoryModal('factionSupport')"><div class="title">Faction Support</div><div class="desc">Click to open</div></div>
    <div class="tile custom" onclick="openCategoryModal('custom')"><div class="title">Custom</div><div class="desc">Click to open</div></div>
  </div>
  <div id="modal-backdrop">
    <div id="modal-content">
      <div id="modal-header">
        <span id="modal-title"></span>
        <button id="modal-close" onclick="closeCategoryModal()">&times;</button>
      </div>
      <div id="modal-body"></div>
    </div>
  </div>
<script>
function openCategoryModal(category) {
  document.getElementById('modal-title').textContent = getModalTitle(category);
  document.getElementById('modal-body').innerHTML =
    '<div style="color:#ccb;opacity:.92;font-size:17px;padding:12px;">Loading...</div>';
  document.getElementById('modal-backdrop').classList.add('active');

  if(['statGrowth','warReadiness','income','factionSupport'].includes(category)){
    google.script.run.withSuccessHandler(function(resUser){
      if(!resUser || !resUser.success) {
        setModalError('Error loading user data: ' + (resUser?.error || 'Unknown'));
        return;
      }
      let user = resUser.data;
      if(category==='statGrowth') showStatGrowthModal(user);
      else if(category==='warReadiness') showWarReadinessModal(user);
      else if(category==='income') showIncomeModal(user);
      else if(category==='factionSupport') {
        google.script.run.withSuccessHandler(function(resFac){
          if(!resFac || !resFac.success) {
            setModalError('Error loading faction data: ' + (resFac?.error || 'Unknown'));
            return;
          }
          let faction = resFac.data;
          showFactionSupportModal(faction);
        }).getFactionDataV2('${DEFAULT_FACTION_ID}');
      }
    }).getUserDataV2('${DEFAULT_USER_ID}');
  } else if(category==='custom'){
    document.getElementById('modal-body').innerHTML =
      '<div><strong>Custom widget area.</strong> Put your own data, reminders, or plugin here.</div>';
  }
}
function closeCategoryModal() {
  document.getElementById('modal-backdrop').classList.remove('active');
}
function getModalTitle(category) {
  switch(category){
    case 'statGrowth':return 'Stat Growth Hub';
    case 'warReadiness':return 'War Readiness Hub';
    case 'income':return 'Income & Inventory Hub';
    case 'factionSupport':return 'Faction Support Hub';
    case 'custom':return 'Custom Hub';
    default:return '';
  }
}
function setModalError(msg){
  document.getElementById('modal-body').innerHTML =
    '<div style="color:#faa;font-weight:bold;padding:16px;">'+msg+'</div>';
}
function showStatGrowthModal(user){
  let html = '';
  html += '<div><strong>Player:</strong> <b>' + (user.profile?.name || '') +
          '</b> (Level: ' + (user.profile?.level || '') + ')</div>';
  html += '<div style="margin-top:14px;"><strong>Battle Stats:</strong><ul>';
  html += '<li>Strength: <b>' + (user.battlestats?.strength?.toLocaleString() || '-') + '</b></li>';
  html += '<li>Speed: <b>' + (user.battlestats?.speed?.toLocaleString() || '-') + '</b></li>';
  html += '<li>Defense: <b>' + (user.battlestats?.defense?.toLocaleString() || '-') + '</b></li>';
  html += '<li>Dexterity: <b>' + (user.battlestats?.dexterity?.toLocaleString() || '-') + '</b></li>';
  html += '</ul></div>';
  document.getElementById('modal-body').innerHTML = html;
}
function showWarReadinessModal(user){
  let html = '';
  html += '<div><strong>Vitals:</strong><ul>';
  html += '<li>Life: <b>'+(user.profile?.life?.current||'-')+'/'+(user.profile?.life?.maximum||'-')+'</b></li>';
  html += '<li>Energy: <b>'+(user.profile?.energy?.current||'-')+'/'+(user.profile?.energy?.maximum||'-')+'</b></li>';
  html += '<li>Nerve: <b>'+(user.profile?.nerve?.current||'-')+'/'+(user.profile?.nerve?.maximum||'-')+'</b></li>';
  html += '<li>Happy: <b>'+(user.profile?.happy?.current||'-')+'/'+(user.profile?.happy?.maximum||'-')+'</b></li>';
  html += '</ul></div>';
  document.getElementById('modal-body').innerHTML = html;
}
function showIncomeModal(user){
  let html = '';
  html += '<div><strong>Income & Points:</strong><ul>';
  html += '<li>Cash: <b>$'+(user.profile?.money?.toLocaleString()||'-')+'</b></li>';
  html += '<li>Points: <b>'+(user.profile?.points||'-')+'</b></li>';
  html += '</ul></div>';
  html += '<div style="margin-top:14px;"><strong>Inventory items:</strong> <b>'+ (user.inventory ? Object.keys(user.inventory).length : "0")+'</b></div>';
  document.getElementById('modal-body').innerHTML = html;
}
function showFactionSupportModal(faction){
  let html = '';
  html += '<div><strong>Faction:</strong> <b>'+(faction.basic?.name||'-')+'</b></div>';
  html += '<div style="margin-top:10px;"><strong>Respect:</strong> <b>'+(faction.basic?.respect?.toLocaleString()||'-')+'</b></div>';
  html += '<div style="margin-top:10px;"><strong>Members:</strong> <b>'+(faction.basic?.members||'-')+'</b></div>';
  document.getElementById('modal-body').innerHTML = html;
}
document.getElementById('addTaskBtn').onclick=function(){alert('Task dialog coming soon')};
</script>
</body>
</html>
  `;
}