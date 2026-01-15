export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { searchParams } = url;
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "*" };
    const TORN_KEYS = ["gc43XVxOpCcwLnY6","rKP5EwA6DmSufqEm","8YgzsJntLW3yTboP","fiwzsFpv7BuGuTH3","3grddfsZEZsTlWBp","RQmyHvIAIuJ2iCZX","rwLgZTyqgWDxhoCx","CZP2D2ZnbXWsYiDT","5zgirNZtPxRdeFFL","C9cgPgQFpGzA6n32","sUMyDEhMUi3kNgY7","UO429efUvPIQW5Zq"];

    if (request.method === "OPTIONS") return new Response(null, { headers });

    // --- FACTION ROSTER LOOKUP ---
    if (searchParams.has("fac")) {
      const facId = searchParams.get("fac");
      const v = await env.ROTATOR.get("idx");
      let idx = v ? parseInt(v, 10) : 0;
      
      for (let i = 0; i < TORN_KEYS.length; i++) {
        const currentIdx = (idx + i) % TORN_KEYS.length;
        const res = await fetch(`https://api.torn.com/faction/${facId}?selections=&key=${TORN_KEYS[currentIdx]}`);
        const data = await res.json();
        if (data && !data.error) {
          await env.ROTATOR.put("idx", String(currentIdx));
          return new Response(JSON.stringify(data), { headers });
        }
      }
      return new Response(JSON.stringify({ error: "API_FAILED" }), { status: 502, headers });
    }

    // --- SINGLE STAT LOOKUP (For your HTML) ---
    if (searchParams.has("check")) {
      const id = searchParams.get("check");
      const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
      if (!spy) return new Response(JSON.stringify({ error: "NOT_FOUND" }), { headers });
      return new Response(JSON.stringify(spy), { headers });
    }

    return new Response(JSON.stringify({ status: "READY" }), { headers });
  }
};