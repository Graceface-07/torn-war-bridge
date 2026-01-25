// --- HUD PROTECTED NAMESPACE ---
const CONFIG = {
    TORN_API_KEY: 'CZP2D2ZnbXWsYiDT',
    SC_KEY: 'rwLgZTyqgWDxhoCx',
    WORKER_URL: 'https://torn-war-bridge.tmecf.workers.dev/'
};

function doGet() {
    return HtmlService.createHtmlOutput(getHTML())
        .setTitle("TACTICAL HUD — MASTER SYSTEM")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getHTML() {
    return `<!DOCTYPE html>
<html lang="en">
</html>`;
}