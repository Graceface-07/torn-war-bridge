export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const API_KEY = env.TORN_KEY; // Torn API key
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    };

    async function torn(endpoint) {
      const res = await fetch(`https://api.torn.com/${endpoint}&key=${API_KEY}`);
      return res.json();
    }

    // -------------------------------
    // GET /check?uid=123 → KV only
    // -------------------------------
    if (url.pathname === "/check") {
      const uid = url.searchParams.get("uid");
      if (!uid) return new Response("{}", { headers: corsHeaders });
      const kv = await env.ROTATOR.get(`spy_${uid}`);
      return new Response(kv || "{}", { headers: corsHeaders });
    }

    // -------------------------------
    // GET /stats?uid=123 → Always Torn
    // -------------------------------
    if (url.pathname === "/stats") {
      const uid = url.searchParams.get("uid");
      if (!uid) return new Response("{}", { headers: corsHeaders });
      const data = await torn(`user/${uid}?selections=profile,battlestats,cooldowns`);
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // -------------------------------
    // GET /faction?id=123 → Always Torn
    // -------------------------------
    if (url.pathname === "/faction") {
      const fid = url.searchParams.get("id");
      if (!fid) return new Response("{}", { headers: corsHeaders });
      const data = await torn(`faction/${fid}?selections=basic,members`);
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // -------------------------------
    // GET /faction-search?query=xxx → KV + Torn fallback
    // -------------------------------
    if (url.pathname === "/faction-search") {
      const query = url.searchParams.get("query")?.toLowerCase() || "";
      let results = [];

      // Try KV cache for factions
      let cursor = null;
      do {
        const list = await env.ROTATOR.list({ prefix: "faction_", cursor });
        cursor = list.cursor;
        for (const key of list.keys) {
          const raw = await env.ROTATOR.get(key.name);
          if (!raw) continue;
          const obj = JSON.parse(raw);
          const name = obj.name?.toLowerCase() || "";
          const tag = obj.tag?.toLowerCase() || "";
          const id = String(obj.id);
          if (name.includes(query) || tag.includes(query) || id.startsWith(query)) {
            results.push({ id: obj.id, name: obj.name, tag: obj.tag });
          }
        }
      } while (cursor);

      // If no KV results, search Torn
      if (results.length === 0) {
        const tornData = await torn(`faction/?selections=basic`);
        results = Object.values(tornData.factions || {}).filter(f => {
          const name = f.name?.toLowerCase() || "";
          const tag = f.tag?.toLowerCase() || "";
          const id = String(f.ID || f.id);
          return name.includes(query) || tag.includes(query) || id.startsWith(query);
        }).map(f => ({ id: f.ID || f.id, name: f.name, tag: f.tag }));
      }

      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }

    // -------------------------------
    // POST → Only used to write spies (optional)
    // -------------------------------
    if (request.method === "POST") {
  try {
    const body = await request.json();
    const spies = body.spies || [];

    // Loop through the spies sent from the Sheet and save to KV
    for (const spy of spies) {
      // Key: spy_12345 | Value: JSON string of stats
      await env.ROTATOR.put(`spy_${spy.player_id}`, JSON.stringify(spy), {
        expirationTtl: 86400 * 30 // Optional: Auto-expire after 30 days
      });
    }

    return new Response(JSON.stringify({ ok: true, count: spies.length }), { 
      headers: corsHeaders 
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e.message }), { 
      status: 500, headers: corsHeaders 
    });
  }
}
  }
};
