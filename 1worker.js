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
      // --- FACTION ROSTER LOOKUP ---
      if (url.searchParams.has("fac")) {
        const facId = url.searchParams.get("fac");
        const v = await env.ROTATOR.get("idx");
        let idx = v ? parseInt(v, 10) : 0;
        
        let tornData = null;
        for (let i = 0; i < TORN_KEYS.length; i++) {
          const currentIdx = (idx + i) % TORN_KEYS.length;
          // Forced cache bust to ensure fresh data
          const res = await fetch(`https://api.torn.com/faction/${facId}?selections=&key=${TORN_KEYS[currentIdx]}`, {
            headers: { "Cache-Control": "no-cache" }
          });
          const data = await res.json();
          
          if (data && !data.error) {
            tornData = data;
            // Map name properly if Torn uses a different key
            tornData.factionName = data.name || data.faction_name || "NAME_NOT_FOUND";
            await env.ROTATOR.put("idx", String(currentIdx));
            break;
          }
        }

        if (!tornData) return new Response(JSON.stringify({ error: "KEYS_EXHAUSTED_OR_INVALID_ID" }), { headers });
        return new Response(JSON.stringify(tornData), { headers });
      }

      // --- INDIVIDUAL STAT LOOKUP ---
      if (url.searchParams.has("check")) {
        const id = url.searchParams.get("check");
        const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
        return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
      }

      // --- DATA IMPORT ---
      if (request.method === "POST") {
        const body = await request.json();
        const spies = body.spies || body;
        for (const spy of spies) {
          const id = (spy.player_id || spy.user_id || spy.id).toString();
          await env.ROTATOR.put(`spy_${id}`, JSON.stringify({
            name: spy.player_name || spy.name,
            total: spy.total || 0,
            strength: spy.strength || 0,
            defense: spy.defense || 0,
            speed: spy.speed || 0,
            dexterity: spy.dexterity || 0
          }));
        }
        return new Response(JSON.stringify({ success: true }), { headers });
      }

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { headers });
    }

    return new Response(JSON.stringify({ status: "BRIDGE_ACTIVE" }), { headers });
  }
};