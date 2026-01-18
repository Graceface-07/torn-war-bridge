export default {
  async fetch(request, env) {
    const headers = { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*", 
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS", 
      "Access-Control-Allow-Headers": "*" 
    };
    if (request.method === "OPTIONS") return new Response(null, { headers });
    const url = new URL(request.url);

    try {
      // FETCH SPY DATA (GET)
      if (url.searchParams.has("check")) {
        const spy = await env.ROTATOR.get(`spy_${url.searchParams.get("check")}`, { type: "json" });
        return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
      }

      // UPDATE KV (POST - Triggered by pushToHUD)
      if (request.method === "POST") {
        const body = await request.json();
        const now = Date.now();
        await Promise.all(body.spies.map(s => {
          return env.ROTATOR.put(`spy_${s.player_id}`, JSON.stringify({
            name: s.name,
            total: s.total,
            strength: s.strength,
            defense: s.defense,
            speed: s.speed,
            dexterity: s.dexterity
          }), { metadata: { lastUpdated: now } });
        }));
        return new Response(JSON.stringify({ success: true }), { headers });
      }
    } catch (e) { return new Response(JSON.stringify({ error: e.message }), { headers }); }
    return new Response(JSON.stringify({ status: "ONLINE" }), { headers });
  }
};