var worker_default = {
  async getSettings(env) {
    return {
      WEBHOOK_SECRET: "RICHARD_SECRET_123",
      BASE_URL: "https://script.google.com/macros/s/AKfycbzq66GAz2wKeySUopH44eVcEtQwfi2fhYKRXsppxKQLeh8vIv7FfSvZSbRCwlT1_WcE/exec",
      // Rotates keys to prevent individual key exhaustion
      TORN_KEYS: ["gc43XVxOpCcwLnY6", "rKP5EwA6DmSufqEm", "8YgzsJntLW3yTboP", "fiwzsFpv7BuGuTH3", "3grddfsZEZsTlWBp", "RQmyHvIAIuJ2iCZX"],
      TS_KEY: env.TORN_STATS_KEY || "", 
      YATA_KEY: env.YATA_KEY || ""
    };
  },

  async fetch(request, env) {
    const settings = await this.getSettings(env);
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // --- HUD GET HANDLER (New Logic) ---
    if (request.method === "GET" && url.searchParams.has("fac")) {
      const facId = url.searchParams.get("fac");
      const randomKey = settings.TORN_KEYS[Math.floor(Math.random() * settings.TORN_KEYS.length)];
      
      try {
        const tornRes = await fetch(`https://api.torn.com/faction/${facId}?selections=&key=${randomKey}`);
        const tornData = await tornRes.json();
        if (!tornData.members) throw new Error("Invalid Faction ID");

        const members = Object.entries(tornData.members);
        const results = await Promise.all(members.map(async ([id, m]) => {
          // Cross-reference with your SPY_VAULT KV
          const spyData = await env.SPY_VAULT.get(id, { type: "json" });
          return {
            id: id,
            name: m.name,
            level: m.level,
            status: m.status.description,
            total: spyData ? spyData.total : 0
          };
        }));

        return new Response(JSON.stringify({ factionName: tornData.name, members: results }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    // --- SPY VAULT IMPORT (Consolidated) ---
    if (request.method === "POST" && !url.searchParams.has("mode")) {
      const body = await request.json();
      const spies = body.spies || body; // Handles batch from Google Script
      let count = 0;

      for (const spy of spies) {
        const id = (spy.player_id || spy.user_id || spy.id).toString();
        if (id) {
          await env.SPY_VAULT.put(id, JSON.stringify({
            name: spy.player_name || spy.name,
            total: spy.total || 0,
            strength: spy.strength || 0,
            defense: spy.defense || 0,
            speed: spy.speed || 0,
            dexterity: spy.dexterity || 0,
            timestamp: spy.timestamp || Date.now()
          }));
          count++;
        }
      }
      return new Response(JSON.stringify({ success: true, count: count }), { headers: corsHeaders });
    }

    // --- MARKET RELAY LOGIC (Your Existing Code) ---
    if (request.method === "POST" && url.searchParams.get("mode") === "market") {
      const body = await request.json();
      const res = await fetch(settings.BASE_URL + "?key=" + settings.WEBHOOK_SECRET, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      return new Response(await res.text(), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ status: "Tactical Bridge Online" }), { headers: corsHeaders });
  }
};

export { worker_default as default };