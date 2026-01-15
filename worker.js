export default {
  async fetch(request, env) {
    const headers = { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    if (request.method === "POST") {
      try {
        const data = await request.json();
        let added = 0;

        for (const player of data) {
          // Mapping your JSON format to KV storage
          const key = `spy_${player.player_id}`;
          const value = JSON.stringify({
            name: player.player_name,
            level: player.player_level,
            faction: player.player_faction,
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

    return new Response("Worker is ready for JSON upload.", { headers });
  }
}