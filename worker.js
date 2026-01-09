export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const TORN_KEY = "TS_gc43XVxOpCcwLnY6";
    const YATA_KEY = "CZP2D2ZnbXWsYiDT";

    // Static Analysis: Critical for Google Apps Script Fetch compatibility
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    // Handle Preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400, headers });

    try {
      // Fetch Torn
      const tornRes = await fetch("https://api.torn.com/faction/" + id + "?selections=basic&key=" + TORN_KEY);
      const tornData = await tornRes.json();

      // Fetch YATA (Using correct endpoint for faction export)
      const yataRes = await fetch("https://yata.yt/api/v1/faction/export/" + id + "/?key=" + YATA_KEY);
      const yataData = await yataRes.json();

      return new Response(JSON.stringify({ 
        torn: tornData, 
        ts: yataData 
      }), { status: 200, headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Sync Failed: " + e.message }), { status: 500, headers });
    }
  }
};

// sss