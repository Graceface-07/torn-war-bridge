export default {
  async getSettings(env) {
    return {
      TORN_KEYS: [
        "gc43XVxOpCcwLnY6","rKP5EwA6DmSufqEm","8YgzsJntLW3yTboP",
        "fiwzsFpv7BuGuTH3","3grddfsZEZsTlWBp","RQmyHvIAIuJ2iCZX",
        "rwLgZTyqgWDxhoCx","CZP2D2ZnbXWsYiDT","5zgirNZtPxRdeFFL",
        "C9cgPgQFpGzA6n32","sUMyDEhMUi3kNgY7","UO429efUvPIQW5Zq"
      ]
    };
  },

  async fetch(request, env) {
    const settings = await this.getSettings(env);
    const url = new URL(request.url);
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    // --- HUD GET HANDLER ---
    if (request.method === "GET" && url.searchParams.has("fac")) {
      const facId = url.searchParams.get("fac");
      if (!/^\d+$/.test(facId)) return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400, headers });

      try {
        const tornData = await this.fetchTornRotated(facId, settings.TORN_KEYS, env.ROTATOR);
        
        if (!tornData || !tornData.members) {
           return new Response(JSON.stringify({ error: "No members in API response" }), { status: 500, headers });
        }

        const members = Object.entries(tornData.members);
        const results = await Promise.all(members.map(async ([id, m]) => {
          // Cross-reference with KV using the 'spy_' prefix we established
          const spyData = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
          return {
            id,
            name: m.name,
            level: m.level,
            status: m.status.description,
            total: spyData ? spyData.total : 0
          };
        }));

        return new Response(JSON.stringify({ 
          factionName: tornData.name || "Unknown Faction", 
          members: results 
        }), { headers });

      } catch (e) {
        return new Response(JSON.stringify({ error: "WORKER_FAILURE", details: e.toString() }), { status: 502, headers });
      }
    }

    // --- POST HANDLER (IMPORTS) ---
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const spies = body.spies || body;
        let count = 0;
        for (const spy of spies) {
          const id = (spy.player_id || spy.user_id || spy.id).toString();
          if (!id) continue;
          
          await env.ROTATOR.put(`spy_${id}`, JSON.stringify({
            name: spy.player_name || spy.name || "Unknown",
            total: spy.total || 0,
            strength: spy.strength || 0,
            defense: spy.defense || 0,
            speed: spy.speed || 0,
            dexterity: spy.dexterity || 0,
            timestamp: spy.timestamp || Date.now()
          }));
          count++;
        }
        return new Response(JSON.stringify({ success: true, added: count }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    return new Response(JSON.stringify({ status: "OK" }), { headers });
  },

  async fetchTornRotated(factionId, keys, KV) {
    const v = await KV.get("idx");
    let idx = v ? parseInt(v, 10) : 0;
    
    for (let i = 0; i < keys.length; i++) {
      const currentIdx = (idx + i) % keys.length;
      const key = keys[currentIdx];
      const r = await fetch(`https://api.torn.com/faction/${factionId}?selections=&key=${key}`);
      const data = await r.json();

      if (data && !data.error) {
        await KV.put("idx", String(currentIdx));
        return data;
      }
    }
    throw "ALL_KEYS_FAILED";
  }
};