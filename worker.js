// const WORKER_URL = 'https://torn-war-bridge.tmecf.workers.dev/';
// const BATCH_SIZE = 500; // Send 500 at a time

function dailyPushToHUD() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HUD_MASTER");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  
  const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  let uploadQueue = [];
  let rowsToMark = [];
  
  for (let i = 0; i < data.length; i++) {
    const id = data[i][0].toString().replace(/,/g, "").split(".")[0].trim();
    if (data[i][7] === true) continue;
    
    uploadQueue.push({
      uid: id,
      data: {
        player_id: id,
        name: data[i][1],
        strength: data[i][2],
        defense: data[i][3],
        speed: data[i][4],
        dexterity: data[i][5],
        total: (parseFloat(data[i][2])||0) + (parseFloat(data[i][3])||0) + (parseFloat(data[i][4])||0) + (parseFloat(data[i][5])||0)
      }
    });
    rowsToMark.push(i + 2);
    
    if ((i + 1) % 50 === 0) {
      Logger.log(`✓ Prepared ${i + 1} records`);
    }
  }
  
  if (uploadQueue.length > 0) {
    Logger.log(`📤 Uploading ${uploadQueue.length} total records in batches of ${BATCH_SIZE}...`);
    
    let totalUploaded = 0;
    let batchNum = 1;
    
    for (let i = 0; i < uploadQueue.length; i += BATCH_SIZE) {
      const batch = uploadQueue.slice(i, i + BATCH_SIZE);
      
      try {
        const response = UrlFetchApp.fetch(WORKER_URL, {
          method: 'POST',
          contentType: 'application/json',
          payload: JSON.stringify({ spies: batch }),
          muteHttpExceptions: true
        });
        
        const result = JSON.parse(response.getContentText());
        
        if (response.getResponseCode() === 200) {
          totalUploaded += result.count;
          Logger.log(`✅ Batch ${batchNum}: ${result.count} records uploaded (Total: ${totalUploaded})`);
        } else {
          Logger.log(`❌ Batch ${batchNum} FAILED: ${response.getContentText()}`);
        }
      } catch (e) {
        Logger.log(`❌ Batch ${batchNum} ERROR: ${e.message}`);
      }
      
      batchNum++;
      Utilities.sleep(500); // 500ms delay between batches
    }
    
    if (totalUploaded === uploadQueue.length) {
      Logger.log(`🎉 ALL DONE: ${totalUploaded} records uploaded successfully`);
      rowsToMark.forEach(row => sheet.getRange(row, 8).setValue(true));
    }
  } else {
    Logger.log("⚠️ No records to upload");
  }
}
function markExistingKV() {
  const acc = props.getProperty('CF_ACCOUNT_ID'), ns = props.getProperty('CF_NAMESPACE_ID'), tk = props.getProperty('CF_API_TOKEN');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HUD_MASTER");
  let allKeys = [], cursor = "";
  while (true) {
    const res = JSON.parse(UrlFetchApp.fetch("https://api.cloudflare.com/client/v4/accounts/"+acc+"/storage/kv/namespaces/"+ns+"/keys?limit=1000&cursor="+cursor, {headers: {"Authorization": "Bearer "+tk}}).getContentText());
    res.result.forEach(k => allKeys.push(k.name.replace("spy_", "")));
    cursor = res.result_info?.cursor || "";
    if (!cursor) break;
  }
  const kvSet = new Set(allKeys);
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  const updates = ids.map(r => [kvSet.has(r[0].toString()) ? true : ""]);
  sheet.getRange(2, 8, updates.length, 1).setValues(updates);
}

function saveCloudflareCredentials() {
  props.setProperties({
    'CF_ACCOUNT_ID': '3c83ffec4f796f99ffd54ba39d3787b5',
    'CF_NAMESPACE_ID': '7d26ddc573674ba19db3af3951322bf7',
    'CF_API_TOKEN': 'pzHJG7oMwTvrOnxCB9-jQ-bFL01jAENg3Q1QXaoF'
  });
  SpreadsheetApp.getUi().alert("Auth Saved.");
}
const props = PropertiesService.getScriptProperties();

const BATCH_SIZE = 500;

function markExistingKV() {
  const acc = props.getProperty('3c83ffec4f796f99ffd54ba39d3787b5'), 
        ns = props.getProperty('7d26ddc573674ba19db3af3951322bf7'), 
        tk = props.getProperty('pzHJG7oMwTvrOnxCB9-jQ-bFL01jAENg3Q1QXao');
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HUD_MASTER");
  let allKeys = [], cursor = "";
  
  while (true) {
    const res = JSON.parse(UrlFetchApp.fetch("https://api.cloudflare.com/client/v4/accounts/"+acc+"/storage/kv/namespaces/"+ns+"/keys?limit=1000&cursor="+cursor, {headers: {"Authorization": "Bearer "+tk}}).getContentText());
    res.result.forEach(k => allKeys.push(k.name.replace("spy_", "")));
    cursor = res.result_info?.cursor || "";
    if (!cursor) break;
  }
  
  const kvSet = new Set(allKeys);
  const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  const updates = ids.map(r => [kvSet.has(r[0].toString()) ? true : ""]);
  sheet.getRange(2, 8, updates.length, 1).setValues(updates);
  
  Logger.log(`✅ Marked ${allKeys.length} existing records in column H`);
}
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HUD_MASTER");
  let allKeys = [], cursor = "", pageCount = 0;
  
  try {
    while (pageCount < 100) { // Safety limit
      Logger.log(`📄 Fetching page ${pageCount + 1}...`);
      
      const url = `https://api.cloudflare.com/client/v4/accounts/${acc}/storage/kv/namespaces/${ns}/keys?limit=1000${cursor ? '&cursor=' + cursor : ''}`;
      const response = UrlFetchApp.fetch(url, {
        headers: {"Authorization": "Bearer " + tk},
        muteHttpExceptions: true
      });
      
      if (response.getResponseCode() !== 200) {
        Logger.log(`❌ API Error: ${response.getContentText()}`);
        return;
      }
      
      const res = JSON.parse(response.getContentText());
      
      if (!res.result || res.result.length === 0) {
        Logger.log(`✓ No more pages`);
        break;
      }
    
      res.result.forEach(k => allKeys.push(k.name.replace("spy_", "")));
      Logger.log(`✓ Got ${res.result.length} keys, total: ${allKeys.length}`);
      
      cursor = res.result_info?.cursor;
      if (!cursor) {
        Logger.log(`✓ End of results`);
        break;
      }
      
      pageCount++;
      Utilities.sleep(100); // Small delay between requests
    }
    
    Logger.log(`📊 Total keys found: ${allKeys.length}`);
    
    const kvSet = new Set(allKeys);
    const ids = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    const updates = ids.map(r => [kvSet.has(r[0].toString()) ? true : ""]);
    sheet.getRange(2, 8, updates.length, 1).setValues(updates);
    
    Logger.log(`✅ Marked ${allKeys.length} existing records in column H`);
    
  } catch (e) {
    Logger.log(`❌ Error: ${e.message}`);
  }

function doGet() { where
  return HtmlService.createHtmlOutput(getHtmlContent())
    .setTitle('TACTICAL HUD V5.5.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); 
}
