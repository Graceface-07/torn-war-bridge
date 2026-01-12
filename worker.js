var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const forceUpdate = url.searchParams.has("update"); // Add ?update=1 to bypass cache
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

    if (!id) return new Response(JSON.stringify({ error: "No ID" }), { status: 400, headers });

    // 1. Check Cache First (KV Storage)
    const cachedData = await env.ROTATOR.get(`spy_${id}`);
    if (cachedData && !forceUpdate) {
      return new Response(cachedData, { headers: { ...headers, "X-Cache": "HIT" } });
    }

    // 2. Fetch Fresh Data (Only if not in cache or forced)
    try {
      const data = await this.getIntegratedData(id, env);
      
      // 3. Store in KV for 24 hours (86400 seconds)
      await env.ROTATOR.put(`spy_${id}`, JSON.stringify(data), { expirationTtl: 86400 });
      
      return new Response(JSON.stringify(data), { headers: { ...headers, "X-Cache": "MISS" } });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  },

  async getIntegratedData(id, env) {
    const key = "gc43XVxOpCcwLnY6"; 
    const tsUrl = `https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`;
    const tornUrl = `https://api.torn.com/user/${id}?selections=profile&key=${key}`;

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
  }
};

export { worker_default as default };