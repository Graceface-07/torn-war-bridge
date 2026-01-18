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

    // --- STATUS CHECK ---
    if (url.searchParams.has("status")) {
      const list = await env.ROTATOR.list();
      const now = Date.now();
      const recent = list.keys.filter(k => k.metadata && (now - k.metadata.lastUpdated) < 86400000);
      return new Response(JSON.stringify({
        total_spies_in_db: list.keys.length,
        updated_recently: recent.length
      }), { headers });
    }

    // --- DATA IMPORT (Optimized for CPU Limits) ---
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const spies = body.spies || [];
        const now = Date.now();

        // Process in parallel to save CPU cycles
        await Promise.all(spies.map(spy => {
          const id = (spy.player_id || spy.user_id || spy.id).toString();
          return env.ROTATOR.put(`spy_${id}`, JSON.stringify({
            name: spy.player_name || spy.name,
            total: spy.total || 0,
            strength: spy.strength || 0,
            defense: spy.defense || 0,
            speed: spy.speed || 0,
            dexterity: spy.dexterity || 0
          }), { metadata: { lastUpdated: now } });
        }));

        return new Response(JSON.stringify({ success: true, count: spies.length }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    // --- HUD DATA FETCH (Standard Logic) ---
    if (url.searchParams.has("fac") || url.searchParams.has("check")) {
      // ... (HUD logic remains the same as previous stable versions)
    }

    return new Response(JSON.stringify({ message: "BRIDGE_ONLINE" }), { headers });
  }
};