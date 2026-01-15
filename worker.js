export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { searchParams } = url;

    // --- CONFIG & KEYS ---
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

    if (request.method === "OPTIONS") return new Response(null, { headers });

    // --- 1. HUD GET HANDLER (FACTION COMPARISON) ---
    // Triggered when the HUD sends ?fac=ID
    if (request.method === "GET" && searchParams.has("fac")) {
      const facId = searchParams.get("fac");
      if (!/^\d+$/.test(facId)) return new Response(JSON.stringify({ error: "Invalid ID" }), { status: 400, headers });

      try {
        // Fetch the live roster from Torn using key rotation
        const tornData = await this.fetchTornRotated(facId, TORN_KEYS, env.ROTATOR);
        const members = Object.entries(tornData.members || {});
        
        // Match every faction member against our local KV Vault
        const results = await Promise.all(members.map(async ([id, m]) => {
          const spyData = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
          return {
            id,
            name: m.name,
            level: m.level,
            status: m.status.description,
            // If match found in KV, provide stats; otherwise return 0
            total: spyData ? spyData.total : 0,
            strength: spyData ? spyData.strength : 0,
            defense: spyData ? spyData.defense : 0,
            speed: spyData ? spyData.speed : 0,
            dexterity: spyData ? spyData.dexterity : 0
          };
        }));

        return new Response(JSON.stringify({ factionName: tornData.name, members: results }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: "API_FAILURE", details: e }), { status: 502, headers });
      }
    }

    // --- 2. SPY VAULT POST (AUTOMATED IMPORT) ---
    // Triggered by your Apps Script daily sync
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const spies = body.spies || body;
        let count = 0;
        for (const spy of spies) {
          const id = (spy.player_id || spy.user_id || spy.id).toString();
          // Store data with 'spy_' prefix to differentiate from 'idx' key
          await env.ROTATOR.put(`spy_${id}`, JSON.stringify({
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
        return new Response(JSON.stringify({ success: true, added: count }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    return new Response(JSON.stringify({ status: "Tactical Bridge Online" }), { headers });
  },

  // --- HELPER: KEY ROTATION ---
  async fetchTornRotated(factionId, keys, KV) {
    const v = await KV.get("idx");
    let idx = v ? parseInt(v, 10) : 0;
    for (let i = 0; i < keys.length; i++) {
      const currentIdx = (idx + i) % keys.length;
      const key = keys[currentIdx];
      const r = await fetch(`https://api.torn.com/faction/${factionId}?selections=&key=${key}`);
      const data = await r.json();
      if (!data.error) {
        await KV.put("idx", String(currentIdx)); // Save current key index
        return data;
      }
    }
    throw "ALL_KEYS_FAILED";
  }
};