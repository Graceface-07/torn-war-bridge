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

    // --- HEALTH & STATUS CHECK ---
    if (url.searchParams.has("status")) {
      const list = await env.ROTATOR.list();
      const now = Date.now();
      const recent = list.keys.filter(k => k.metadata && (now - k.metadata.lastUpdated) < 86400000);

      return new Response(JSON.stringify({
        total_spies_in_db: list.keys.length,
        updated_recently: recent.length,
        status: list.keys.length > 0 ? "DATABASE_ACTIVE" : "DATABASE_EMPTY"
      }), { headers });
    }

    // --- FACTION DATA FETCH (Used by HUD) ---
    if (url.searchParams.has("fac")) {
      const facId = url.searchParams.get("fac");
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
      return new Response(JSON.stringify(tornData || { error: "KEYS_EXHAUSTED" }), { headers });
    }

    // --- INDIVIDUAL SPY CHECK ---
    if (url.searchParams.has("check")) {
      const id = url.searchParams.get("check");
      const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });
      return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
    }

    // --- DATA IMPORT (From Google Apps Script) ---
    if (request.method === "POST") {
      const body = await request.json();
      const spies = body.spies || body;
      const now = Date.now();

      for (const spy of spies) {
        const id = (spy.player_id || spy.user_id || spy.id).toString();
        await env.ROTATOR.put(`spy_${id}`, JSON.stringify({
          name: spy.player_name || spy.name,
          total: spy.total || 0,
          strength: spy.strength || 0,
          defense: spy.defense || 0,
          speed: spy.speed || 0,
          dexterity: spy.dexterity || 0
        }), {
          metadata: { lastUpdated: now }
        });
      }
      return new Response(JSON.stringify({ success: true, count: spies.length }), { headers });
    }

    return new Response(JSON.stringify({ message: "BRIDGE_ONLINE" }), { headers });
  }
};