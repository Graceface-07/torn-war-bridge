function dailyPushToHUD() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("HUD_MASTER");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 8).getValues();
  let queue = [];

  // 1. PREPARE CLEAN BATCH
  for (let i = 0; i < data.length; i++) {
    const alreadyPushed = data[i][7] === true;
    if (alreadyPushed) continue;

    const cleanID = Math.floor(data[i][0]).toString().replace(/,/g, "");
    queue.push({
      player_id: cleanID,
      name: data[i][1],
      strength: parseFloat(data[i][2]) || 0,
      defense: parseFloat(data[i][3]) || 0,
      speed: parseFloat(data[i][4]) || 0,
      dexterity: parseFloat(data[i][5]) || 0,
      total: parseFloat(data[i][6]) || 0
    });

    if (queue.length >= 950) break; // Quota Protection (Stay under 1,000)
  }

  if (queue.length === 0) return Logger.log("Nothing to push.");

  // 2. EXECUTE VERIFIED PUSH
  try {
    const res = UrlFetchApp.fetch(WORKER_URL, {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify({ spies: queue }),
      muteHttpExceptions: true
    });

    if (res.getResponseCode() === 200) {
      // 3. SUCCESS: Mark only the IDs we sent as TRUE
      const finalFlags = data.map(row => {
        const idStr = Math.floor(row[0]).toString();
        const wasSent = queue.some(q => q.player_id === idStr);
        return [row[7] === true || wasSent];
      });
      sheet.getRange(2, 8, finalFlags.length, 1).setValues(finalFlags);
      Logger.log(`Successfully populated ${queue.length} records.`);
    }
  } catch (e) {
    Logger.log("Push failed: " + e.message);
  }
}