var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const headers = { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*" 
    };

    // --- RECEIVE DATA FROM GOOGLE SHEET (Pushing to Tactical Command) ---
    if (request.method === "POST" && url.pathname === "/update-bridge") {
      const data = await request.json();
      await env.ROTATOR.put("tactical_data", JSON.stringify(data));
      return new Response(JSON.stringify({ success: true }), { headers });
    }

    // --- SERVE DATA TO TACTICAL COMMAND PAGE ---
    if (url.pathname === "/get-tactical") {
      const data = await env.ROTATOR.get("tactical_data");
      return new Response(data || "[]", { headers });
    }

    // --- FETCH LIVE DATA (For Google Sheets Sync) ---
    if (idParam) {
      const ids = idParam.split(",");
      const results = await Promise.all(ids.map(id => this.getLiveSpyData(id.trim(), env)));
      return new Response(JSON.stringify(results), { headers });
    }

    return new Response("Bridge Active", { headers });
  },

  async getLiveSpyData(id, env) {
    // Rotator Keys (Add more here as needed)
    const TORN_KEYS = ["gc43XVxOpCcwLnY6", "rKP5EwA6DmSufqEm"]; 
    const key = TORN_KEYS[Math.floor(Math.random() * TORN_KEYS.length)];

    const tsUrl = `https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`;
    const tornUrl = `https://api.torn.com/user/${id}?selections=profile&key=${key}`;

    try {
      const [tsRes, tornRes] = await Promise.all([
        fetch(tsUrl).then(r => r.json()),
        fetch(tornUrl).then(r => r.json())
      ]);

      const s = tsRes.spy || {};
      return {
        id,
        name: tornRes.name || "Unknown",
        level: tornRes.level || 0,
        total: s.total || 0,
        strength: s.strength || 0,
        defense: s.defense || 0,
        speed: s.speed || 0,
        dexterity: s.dexterity || 0,
        status: tornRes.status?.description || "Unknown",
        last_updated: new Date().toISOString()
      };
    } catch (e) {
      return { id, name: "Error", status: "Offline" };
    }
  }
};

export { worker_default as default };