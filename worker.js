function uploadNewRecordsToKV() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("HUD_MASTER");
  const lastRow = sheet.getLastRow();
  const factionId = 42505;
  const workerUrl = "https://torn-war-bridge.tmecf.workers.dev"; // Your worker
  
  const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  
  let toUpload = [];
  
  // Filter only records marked FALSE in column H (not in KV)
  data.forEach((row, i) => {
    const inKV = row[7]; // Column H
    if (inKV === false || inKV === "FALSE" || inKV === "") {
      const playerId = row[0].toString().trim();
      const record = {
        uid: playerId,
        fid: factionId,
        data: {
          player_id: playerId,
          name: row[1],
          total: row[2],
          strength: row[3],
          defense: row[4],
          speed: row[5],
          dexterity: row[6],
          timestamp: row[8] || new Date().getTime()
        }
      };
      toUpload.push(record);
    }
  });
  
  Logger.log(`📊 Found ${toUpload.length} records to upload`);
  
  if (toUpload.length === 0) {
    Logger.log("✅ All records already in KV!");
    return;
  }
  
  // Upload in batches of 1000
  const batchSize = 1000;
  let uploaded = 0;
  
  for (let i = 0; i < toUpload.length; i += batchSize) {
    const batch = toUpload.slice(i, i + batchSize);
    
    const payload = {
      spies: batch
    };
    
    try {
      Logger.log(`📤 Uploading batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)...`);
      
      const response = UrlFetchApp.fetch(workerUrl, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      });
      
      const result = JSON.parse(response.getContentText());
      
      if (response.getResponseCode() === 200 && result.ok) {
        uploaded += result.count;
        Logger.log(`✅ Batch ${Math.floor(i / batchSize) + 1}: ${result.count} uploaded`);
      } else {
        Logger.log(`❌ Batch failed: ${response.getContentText()}`);
      }
    } catch (e) {
      Logger.log(`❌ Error: ${e.message}`);
    }
    
    // Rate limit - wait 1 second between batches
    Utilities.sleep(1000);
  }
  
  Logger.log(`\n🎉 UPLOAD COMPLETE: ${uploaded}/${toUpload.length} records`);
}