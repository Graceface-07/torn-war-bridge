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

    try {
      // --- 1. ACCURATE STATUS CHECK (PAGINATED AUDIT) ---
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

      // --- 2. DATA IMPORT (PARALLEL PROCESSING WITH METADATA) ---
      if (request.method === "POST") {
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
      }

      // --- 3. HUD: INDIVIDUAL SPY CHECK ---
      if (url.searchParams.has("check")) {
        const id = url.searchParams.get("check");
        const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
        return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
      }

      // --- 4. HUD: FACTION DATA FETCH (THE MAGIC FIX) ---
      if (url.searchParams.has("fac")) {
        const facId = url.searchParams.get("fac");
        const v = await env.ROTATOR.get("idx");
        let idx = v ? parseInt(v, 10) : 0;
        
        for (let i = 0; i < TORN_KEYS.length; i++) {
          const currentIdx = (idx + i) % TORN_KEYS.length;
          // RESTORED: Empty selections and cache-control bust
          const res = await fetch(`https://api.torn.com/faction/${facId}?selections=&key=${TORN_KEYS[currentIdx]}`, {
            headers: { "Cache-Control": "no-cache" }
          });
          const data = await res.json();
          
          // RESTORED: Dual-name check for 'Unknown Faction' fix
          const factionName = data.name || data.faction_name;
          
          if (data && factionName) {
            await env.ROTATOR.put("idx", String(currentIdx));
            data.name = factionName; // Force the name for the HUD
            return new Response(JSON.stringify(data), { headers });
          }
        }
        return new Response(JSON.stringify({ error: "KEYS_EXHAUSTED" }), { headers });
      }

    } catch (e) {
      return new Response(JSON.stringify({ error: "WORKER_EXCEPTION", message: e.message }), { headers });
    }

    return new Response(JSON.stringify({ message: "BRIDGE_ONLINE" }), { headers });
  }
};