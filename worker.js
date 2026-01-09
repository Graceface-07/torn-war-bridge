export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const TORN_KEY = "TS_gc43XVxOpCcwLnY6";
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
      // 1. Fetch Torn Data
      const tornRes = await fetch("https://api.torn.com/faction/" + id + "?selections=basic&key=" + TORN_KEY);
      const tornText = await tornRes.text(); // Get raw text first to avoid crash
      
      let tornData = { error: "Unknown Torn Error" };
      try { tornData = JSON.parse(tornText); } catch(e) { return new Response(JSON.stringify({ error: "Torn API returned HTML" }), { status: 200, headers }); }

      // 2. Fetch YATA Data
      let yataData = { members: {} };
      try {
        const yataRes = await fetch("https://yata.yt/api/v1/faction/export/" + id + "?key=" + YATA_KEY);
        const yataText = await yataRes.text();
        const yataJson = JSON.parse(yataText);
        if (yataJson && !yataJson.error) { yataData = yataJson; }
      } catch (yataErr) {
        console.log("YATA Fetch Failed - Using Torn only");
      }

      return new Response(JSON.stringify({ 
        torn: tornData, 
        ts: yataData 
      }), { status: 200, headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Bridge Crash: " + e.message }), { status: 500, headers });
    }
  }
};