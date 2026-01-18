export default {
  async fetch(request, env) {
    const TORN_KEYS = [
      "gc43XVxOpCcwLnY6", "rKP5EwA6DmSufqEm", "8YgzsJntLW3yTboP",
      "fiwzsFpv7BuGuTH3", "3grddfsZEZsTlWBp", "RQmyHvIAIuJ2iCZX",
      "rwLgZTyqgWDxhoCx", "CZP2D2ZnbXWsYiDT", "5zgirNZtPxRdeFFL",
      "C9cgPgQFpGzA6n32", "sUMyDEhMUi3kNgY7", "UO429efUvPIQW5Zq"
    ];

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    const url = new URL(request.url);

    // --- ACCURATE STATUS CHECK (PAGINATED) ---
    if (url.searchParams.has("status")) {
      let allKeys = [];
      let cursor = "";
      while (true) {
        const list = await env.ROTATOR.list({ cursor: cursor });
        allKeys.push(...list.keys);
        if (list.list_complete) break;
        cursor = list.cursor;
      }
      const now = Date.now();
      const recent = allKeys.filter(k => k.metadata && (now - k.metadata.lastUpdated) < 86400000);
      return new Response(JSON.stringify({
        total_spies_in_db: allKeys.length,
        updated_recently: recent.length,
        status: "BRIDGE_ONLINE"
      }), { headers });
    }

    // --- DATA IMPORT (Parallel Processing) ---
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const spies = body.spies || [];
        const now = Date.now();
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

    // --- HUD: INDIVIDUAL SPY CHECK (STATS FROM KV) ---
    if (url.searchParams.has("check")) {
      const id = url.searchParams.get("check");
      const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
      return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
    }

    // --- HUD: FACTION DATA FETCH (LIVE STATUS/TIMERS FROM TORN) ---
    if (url.searchParams.has("fac")) {
      const facId = url.searchParams.get("fac");
      const v = await env.ROTATOR.get("idx");
      let idx = v ? parseInt(v, 10) : 0;
      
      for (let i = 0; i < TORN_KEYS.length; i++) {
        const currentIdx = (idx + i) % TORN_KEYS.length;
        // Selection updated to basic to include 'status' and 'map'
        const res = await fetch(`https://api.torn.com/faction/${facId}?selections=basic&key=${TORN_KEYS[currentIdx]}`, {
            headers: { "Cache-Control": "no-cache" }
        });
        const data = await res.json();
        if (data && !data.error) {
          await env.ROTATOR.put("idx", String(currentIdx));
          return new Response(JSON.stringify(data), { headers });
        }
      }
      return new Response(JSON.stringify({ error: "KEYS_EXHAUSTED" }), { headers });
    }

    return new Response(JSON.stringify({ message: "BRIDGE_ONLINE" }), { headers });
  }
};