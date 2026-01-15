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

        if (!tornData) throw new Error("KEYS_FAILED");

        const members = Object.entries(tornData.members).map(([id, m]) => ({
          id, name: m.name, level: m.level, status: m.status.description, total: 0
        }));

        for (let m of members) {
          const spy = await env.ROTATOR.get(`spy_${m.id}`, { type: "json" });
          if (spy) m.total = spy.total;
        }

        return new Response(JSON.stringify({ factionName: tornData.name, members }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message, members: [] }), { headers });
      }
    }
    return new Response(JSON.stringify({ status: "READY" }), { headers });
  }
};