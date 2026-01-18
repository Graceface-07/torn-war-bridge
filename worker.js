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
      // 1. HUD LOOKUP (GET)
      if (url.searchParams.has("check")) {
        const id = url.searchParams.get("check");
        const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
        return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
      }

      // 2. SHEET IMPORT (POST)
      if (request.method === "POST") {
        const body = await request.json();
        const now = Date.now();
        await Promise.all(body.spies.map(s => {
          return env.ROTATOR.put(`spy_${s.player_id}`, JSON.stringify({
            name: s.name, total: s.total, strength: s.strength, 
            defense: s.defense, speed: s.speed, dexterity: s.dexterity
          }), { metadata: { lastUpdated: now } });
        }));
        return new Response(JSON.stringify({ success: true, count: body.spies.length }), { headers });
      }

      // 3. FULL DB AUDIT (PAGINATED)
      if (url.searchParams.has("status")) {
        let keys = []; let cursor = "";
        while (true) {
          const list = await env.ROTATOR.list({ cursor });
          keys.push(...list.keys);
          if (list.list_complete) break;
          cursor = list.cursor;
        }
        return new Response(JSON.stringify({ total: keys.length, status: "ONLINE" }), { headers });
      }
    } catch (e) { return new Response(JSON.stringify({ error: e.message }), { headers }); }
    return new Response(JSON.stringify({ message: "BRIDGE_ACTIVE" }), { headers });
  }
};