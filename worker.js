export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // Updated Keys from your request
    const TORN_KEY = "TS_gc43XVxOpCcwLnY6";
    const YATA_KEY = "CZP2D2ZnbXWsYiDT";

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    };

    if (!id) return new Response(JSON.stringify({ error: "Missing ID" }), { status: 400, headers });

    try {
      // 1. Fetch Torn Data
      const tornRes = await fetch("https://api.torn.com/faction/" + id + "?selections=basic&key=" + TORN_KEY);
      const tornData = await tornRes.json();

      // 2. Fetch YATA Data
      const yataRes = await fetch("https://yata.yt/api/v1/faction/members/?key=" + YATA_KEY + "&faction=" + id);
      const yataData = await yataRes.json();

      // 3. Combine and Return
      return new Response(JSON.stringify({ 
        torn: tornData, 
        ts: yataData 
      }), { status: 200, headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Sync Failed" }), { status: 500, headers });
    }
  }
};