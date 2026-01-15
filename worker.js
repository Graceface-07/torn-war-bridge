export default {
  async fetch(request, env) {
    const headers = { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    const url = new URL(request.url);
    const TORN_API_KEY = "YOUR_PUBLIC_TORN_KEY"; // Need a basic key for live roster

    // --- GET HANDLER: For the HUD ---
    if (request.method === "GET") {
      const facId = url.searchParams.get("fac");
      if (!facId) return new Response("Missing fac ID", { status: 400, headers });

      try {
        // 1. Fetch live roster from Torn
        const tornRes = await fetch(`https://api.torn.com/faction/${facId}?selections=&key=${TORN_API_KEY}`);
        const tornData = await tornRes.json();
        
        if (!tornData.members) throw new Error("Invalid Faction ID or API Key");

        const members = Object.entries(tornData.members);
        
        // 2. Decorate members with KV stats
        const results = await Promise.all(members.map(async ([id, m]) => {
          const spyData = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
          return {
            id: id,
            name: m.name,
            level: m.level,
            status: m.status.description,
            total: spyData ? spyData.total : 0,
            strength: spyData ? spyData.strength : 0,
            defense: spyData ? spyData.defense : 0,
            speed: spyData ? spyData.speed : 0,
            dexterity: spyData ? spyData.dexterity : 0
          };
        }));

        return new Response(JSON.stringify({
          factionName: tornData.name,
          members: results
        }), { headers });

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    // --- POST HANDLER: For the Automated Import ---
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const data = body.spies || body; // Support both wrapped and unwrapped JSON
        let added = 0;

        for (const player of data) {
          const id = player.player_id || player.user_id; // Support different JSON keys
          const key = `spy_${id}`;
          const value = JSON.stringify({
            name: player.player_name || player.name,
            faction: player.player_faction || player.faction,
            strength: player.strength,
            defense: player.defense,
            speed: player.speed,
            dexterity: player.dexterity,
            total: player.total,
            timestamp: player.timestamp
          });

          await env.ROTATOR.put(key, value);
          added++;
        }

        return new Response(JSON.stringify({ success: true, added }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }
  }
}