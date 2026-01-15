export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");
    const headers = { "Content-Type": "application/json" };

    const YATA_KEY = 'CZP2D2ZnbXWsYiDT';

    try {
      if (mode === "global_sync") {
        // 1. Try to fetch JUST YATA first
        const yataRes = await fetch(`https://yata.yt/api/v1/spies/?key=${YATA_KEY}`);
        
        // If YATA returns HTML instead of JSON, this will catch it
        const contentType = yataRes.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          return new Response("YATA_API_ERROR: YATA returned an HTML error page. Check if your API Key is correct.", { status: 500 });
        }

        const yataData = await yataRes.json();
        
        if (!yataData.spies) {
          return new Response("YATA_DATA_ERROR: Connected but no spies found in account.", { status: 200 });
        }

        const ids = Object.keys(yataData.spies);
        return new Response(JSON.stringify({ 
          success: true, 
          source: "YATA", 
          count_found: ids.length 
        }), { headers });
      }

      return new Response(JSON.stringify({ status: "Isolation Test Ready" }), { headers });
    } catch (e) {
      return new Response("CRASH_DETAIL: " + e.message, { status: 500 });
    }
  }
};