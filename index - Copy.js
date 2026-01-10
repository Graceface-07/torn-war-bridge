/**
 * TACTICAL HUD V15 - SELF-CONFIGURING ENGINE huh
 * Automated Sheet Provisioning + Local Database Delivery
 */

const DUMMY_KEYS = ['gc43XVxOpCcwLnY6','rKP5EwA6DmSufqEm','8YgzsJntLW3yTboP','fiwzsFpv7BuGuTH3','3grddfsZEZsTlWBp','RQmyHvIAIuJ2iCZX','rwLgZTyqgWDxhoCx','CZP2D2ZnbXWsYiDT','5zgirNZtPxRdeFFL','C9cgPgQFpGzA6n32','sUMyDEhMUi3kNgY7','UO429efUvPIQW5Zq'];

function doGet() {
  setupDatabase(); // Self-heal/Creation check on every load
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle('COMMAND HUD - AUTO')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 1. AUTO-PROVISIONING: Creates the DB if it doesn't exist
function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("HUD_DB");
  
  if (!sheet) {
    sheet = ss.insertSheet("HUD_DB");
    sheet.getRange("A1:C1").setValues([["User ID", "Name", "Total Stats"]])
         .setBackground("#000000").setFontColor("#00f2ff").setFontWeight("bold");
    sheet.setFrozenRows(1);
    // Self-destruct logic: Provisioning complete, log and exit
    console.log("Database Provisioned Successfully.");
  }
}

// 2. THE HARVESTER: Taps away to keep the "Delivered" data fresh
function harvestSpies(factionId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HUD_DB");
  try {
    const res = UrlFetchApp.fetch('https://torn-war-bridge.tmecf.workers.dev/?id=' + factionId);
    const bridge = JSON.parse(res.getContentText());
    if (bridge.stats) {
      const data = sheet.getDataRange().getValues();
      const existingIds = data.map(r => r[0].toString());
      
      Object.keys(bridge.stats).forEach(uid => {
        let stats = bridge.stats[uid].total;
        let rowIdx = existingIds.indexOf(uid.toString());
        
        if (rowIdx > -1) {
          sheet.getRange(rowIdx + 1, 3).setValue(stats);
        } else {
          sheet.appendRow([uid, "Target", stats]);
        }
      });
    }
  } catch(e) { return {error: true}; }
}

// 3. THE DELIVERY: Instant push to HUD
function getLocalStats() {
  const data = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HUD_DB").getDataRange().getValues();
  let db = {};
  data.shift(); // Remove headers
  data.forEach(row => { db[row[0]] = row[2]; });
  return db;

}
function fetchTornData(id) {
  let k = DUMMY_KEYS[Math.floor(Math.random() * DUMMY_KEYS.length)];
  let r = UrlFetchApp.fetch('https://api.torn.com/faction/'+id+'?selections=basic&key='+k);
  return {data: JSON.parse(r.getContentText()), serverTime: Math.floor(Date.now()/1000)};
}