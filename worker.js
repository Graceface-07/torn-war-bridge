export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { searchParams } = url;
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "*" };

    const TORN_KEYS = ["gc43XVxOpCcwLnY6","rKP5EwA6DmSufqEm","8YgzsJntLW3yTboP","fiwzsFpv7BuGuTH3","3grddfsZEZsTlWBp","RQmyHvIAIuJ2iCZX","rwLgZTyqgWDxhoCx","CZP2D2ZnbXWsYiDT","5zgirNZtPxRdeFFL","C9cgPgQFpGzA6n32","sUMyDEhMUi3kNgY7","UO429efUvPIQW5Zq"];

    if (request.method === "OPTIONS") return new Response(null, { headers });

    if (request.method === "GET" && searchParams.has("fac")) {
      const facId = searchParams.get("fac");
      try {
        const v = await env.ROTATOR.get("idx");
        let idx = v ? parseInt(v, 10) : 0;
        let tornData = null;

        for (let i = 0; i < TORN_KEYS.length; i++) {
          const currentIdx = (idx + i) % TORN_KEYS.length;
          const res = await fetch(`https://api.torn.com/faction/${facId}?selections=&key=${TORN_KEYS[currentIdx]}`);
          const data = await res.json();
          if (data && !data.error) {
            tornData = data;
            await env.ROTATOR.put("idx", String(currentIdx));
            break;
          }
        }

        if (!tornData || !tornData.members) throw new Error("API_FAILED");

        // Map members and cross-reference KV for full stats
        const members = await Promise.all(Object.entries(tornData.members).map(async ([id, m]) => {
          const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
          return {
            id,
            name: m.name,
            level: m.level,
            status: m.status.description,
            // Import all stats as requested
            total: spy ? spy.total : 0,
            strength: spy ? spy.strength : 0,
            defense: spy ? spy.defense : 0,
            speed: spy ? spy.speed : 0,
            dexterity: spy ? spy.dexterity : 0
          };
        }));

        return new Response(JSON.stringify({ factionName: tornData.name, members }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message, members: [] }), { headers });
      }
    }

    if (request.method === "POST") {
      try {
        const body = await request.json();
        const spies = body.spies || body;
        let count = 0;
        for (const spy of spies) {
          const id = (spy.player_id || spy.user_id || spy.id).toString();
          await env.ROTATOR.put(`spy_${id}`, JSON.stringify({
            name: spy.player_name || spy.name,
            total: spy.total || 0,
            strength: spy.strength || 0,
            defense: spy.defense || 0,
            speed: spy.speed || 0,
            dexterity: spy.dexterity || 0,
            timestamp: Date.now()
          }));
          count++;
        }
        return new Response(JSON.stringify({ success: true, added: count }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
      }
    }

    return new Response(JSON.stringify({ status: "READY" }), { headers });
  }
};