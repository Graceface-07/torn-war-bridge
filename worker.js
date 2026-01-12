export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const { searchParams } = url;

    // --- CONFIG & TORN KEYS ---
    const TORN_KEYS = [
      "gc43XVxOpCcwLnY6","rKP5EwA6DmSufqEm","8YgzsJntLW3yTboP",
      "fiwzsFpv7BuGuTH3","3grddfsZEZsTlWBp","RQmyHvIAIuJ2iCZX",
      "rwLgZTyqgWDxhoCx","CZP2D2ZnbXWsYiDT","5zgirNZtPxRdeFFL",
      "C9cgPgQFpGzA6n32","sUMyDEhMUi3kNgY7","UO429efUvPIQW5Zq"
    ];

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    // Handle CORS Preflight for browser/Google Script
    if (request.method === "OPTIONS") return new Response(null, { headers });

    // --- ROUTE: PLAYER STATS (For Dashboard/Spying) ---
    if (path === "/torn" || searchParams.has('id')) {
      const id = searchParams.get("id");
      if (!id) return new Response(JSON.stringify({ error: "No ID provided" }), { status: 400, headers });

      try {
        const data = await this.getIntegratedData(id, TORN_KEYS, env);
        return new Response(JSON.stringify(data), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Fetch Failed", details: e.message }), { status: 502, headers });
      }
    }

    return new Response(JSON.stringify({ status: "Worker Online", mode: "Dashboard-Only" }), { headers });
  },

  async getIntegratedData(id, keys, env) {
    // 1. Get current index for key rotation
    const v = await env.ROTATOR.get("idx");
    let idx = v ? parseInt(v, 10) : 0;
    const key = keys[idx % keys.length];

    // 2. Fetch from Torn and Torn Stats simultaneously
    const tsUrl = `https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`;
    const tornUrl = `https://api.torn.com/user/${id}?selections=profile&key=${key}`;

    const [tsRes, tornRes] = await Promise.all([
      fetch(tsUrl).then(r => r.json()),
      fetch(tornUrl).then(r => r.json())
    ]);

    // 3. Handle key rotation if Torn API fails
    if (tornRes.error) {
      await env.ROTATOR.put("idx", String(idx + 1));
    }

    // 4. Map the stats for the individual player
    const s = tsRes.spy || {};
    return {
      name: tornRes.name || "Unknown",
      id: id,
      level: tornRes.level || 0,
      total: s.total || 0,
      strength: s.strength || 0,
      defense: s.defense || 0,
      speed: s.speed || 0,
      dexterity: s.dexterity || 0,
      status: tornRes.status?.description || "Unknown",
      last_spied: s.timestamp ? new Date(s.timestamp * 1000).toLocaleDateString() : "Never",
      source: "TornStats"
    };
  }
};