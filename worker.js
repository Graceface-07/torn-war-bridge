export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (method === "OPTIONS") return new Response(null, { headers });

    try {
      if (method === "POST" && url.searchParams.get("mode") === "global_sync") {
        let tsCount = 0;
        let yataCount = 0;

        // 1. TORN STATS BULK (Full stats included in their export)
        const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spies`);
        const tsData = await tsRes.json();
        
        if (tsData.status && tsData.spies) {
          for (const [id, s] of Object.entries(tsData.spies)) {
            const payload = {
              total: s.total || 0,
              strength: s.strength || 0,
              defense: s.defense || 0,
              speed: s.speed || 0,
              dexterity: s.dexterity || 0,
              timestamp: s.timestamp || Math.floor(Date.now() / 1000),
              source: "ts"
            };
            await env.ROTATOR.put(`spy_${id}`, JSON.stringify(payload));
            tsCount++;
          }
        }

        // 2. YATA BULK (Full stats included in export)
        const yataRes = await fetch(`https://yata.yt/api/v1/spies/?key=${env.YATA_KEY}`);
        const yataData = await yataRes.json();
        
        if (yataData.spies) {
          for (const [id, s] of Object.entries(yataData.spies)) {
            const payload = {
              total: s.total || 0,
              strength: s.strength || 0,
              defense: s.defense || 0,
              speed: s.speed || 0,
              dexterity: s.dexterity || 0,
              timestamp: s.timestamp || Math.floor(Date.now() / 1000),
              source: "yata"
            };
            await env.ROTATOR.put(`spy_${id}`, JSON.stringify(payload));
            yataCount++;
          }
        }

        return new Response(JSON.stringify({ success: true, ts: tsCount, yata: yataCount }), { headers });
      }

      // --- HUD GET HANDLER (Now returns full objects) ---
      const idParam = url.searchParams.get("id");
      if (!idParam) return new Response("Missing ID", { status: 400, headers });

      const tornRes = await fetch(`https://api.torn.com/faction/${idParam}?selections=basic&key=${env.TORN_KEY}`);
      const tornData = await tornRes.json();
      const membersList = [];

      for (const id of Object.keys(tornData.members)) {
        const m = tornData.members[id];
        const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
        
        membersList.push({
          id, 
          name: m.name, 
          level: m.level, 
          status: m.status.description, 
          spyData: spy || null // This now contains all 4 stats + total
        });
      }

      return new Response(JSON.stringify({ faction: tornData.name, members: membersList }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};