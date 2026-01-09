export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // UPDATE THESE WITH YOUR WORKING KEYS
    const TORN_KEY = "C9cgPgQFpGzA6n32"; 
    const YATA_KEY = "CZP2D2ZnbXWsYiDT"; 

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });
    if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400, headers });

    try {
      // TEST TORN
      const tornRes = await fetch("https://api.torn.com/faction/" + id + "?selections=basic&key=" + TORN_KEY);
      const tornText = await tornRes.text();
      if (tornText.includes("<!doctype") || tornText.includes("<html")) {
        return new Response(JSON.stringify({ error: "Torn API Key Rejected (HTML Returned)" }), { status: 200, headers });
      }
      const tornData = JSON.parse(tornText);

      // TEST YATA
      let yataData = { members: {} };
      const yataRes = await fetch("https://yata.yt/api/v1/faction/export/" + id + "/?key=" + YATA_KEY);
      const yataText = await yataRes.text();
      if (!yataText.includes("<!doctype") && yataText.trim().startsWith("{")) {
        yataData = JSON.parse(yataText);
      }

      return new Response(JSON.stringify({ torn: tornData, ts: yataData }), { status: 200, headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Bridge Logic Error: " + e.message }), { status: 500, headers });
    }
  }
};