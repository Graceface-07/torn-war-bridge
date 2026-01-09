export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // YOUR KEYS
    const TORN_KEY = "C9cgPgQFpGzA6n32"; 
    const TS_KEY = "CZP2D2ZnbXWsYiDT"; 

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (!id) return new Response(JSON.stringify({ error: "No ID" }), { status: 400, headers });

    try {
      // 1. Fetch Torn Basic
      const tornRes = await fetch("https://api.torn.com/faction/" + id + "?selections=basic&key=" + TORN_KEY);
      const tornText = await tornRes.text();
      if (tornText.includes("<")) return new Response(JSON.stringify({ error: "Torn Key Rejected (HTML)" }), { status: 200, headers });
      const tornData = JSON.parse(tornText);

      // 2. Fetch Torn Stats (TS)
      let tsData = { members: {} };
      try {
        const tsRes = await fetch("https://yata.yt/api/v1/faction/export/" + id + "/?key=" + TS_KEY);
        const tsText = await tsRes.text();
        if (!tsText.includes("<") && tsText.trim().startsWith("{")) {
          tsData = JSON.parse(tsText);
        }
      } catch (e) { /* Fallback to basic only */ }

      return new Response(JSON.stringify({ torn: tornData, ts: tsData }), { status: 200, headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Worker Error: " + e.message }), { status: 500, headers });
    }
  }
};