export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const API_KEY = env.TORN_KEY; // optional, only needed for fallback

    // CORS
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    };

    // Helper: Torn API fetch
    async function torn(endpoint) {
      const res = await fetch(`https://api.torn.com/${endpoint}&key=${API_KEY}`);
      return res.json();
    }

    // -------------------------------
    // GET /check?uid=123
    // -------------------------------
    if (url.pathname === "/check") {
      const uid = url.searchParams.get("uid");
      if (!uid) return new Response("{}", { headers: corsHeaders });

      const kv = await env.ROTATOR.get(`spy_${uid}`);
      return new Response(kv || "{}", { headers: corsHeaders });
    }

    // -------------------------------
    // GET /stats?uid=123
    // -------------------------------
    if (url.pathname === "/stats") {
      const uid = url.searchParams.get("uid");
      if (!uid) return new Response("{}", { headers: corsHeaders });

      // Try KV first
      const kv = await env.ROTATOR.get(`spy_${uid}`);
      if (kv) return new Response(kv, { headers: corsHeaders });

      // Fallback: Torn API
      const data = await torn(`user/${uid}?selections=basic`);
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // -------------------------------
    // GET /faction?id=420
    // -------------------------------
    if (url.pathname === "/faction") {
      const fid = url.searchParams.get("id");
      if (!fid) return new Response("{}", { headers: corsHeaders });

      // Try KV first
      const kv = await env.ROTATOR.get(`faction_${fid}`);
      if (kv) return new Response(kv, { headers: corsHeaders });

      // Fallback: Torn API
      const data = await torn(`faction/${fid}?selections=basic`);
      return new Response(JSON.stringify(data), { headers: corsHeaders });
    }

    // -----------------------------------------------------
    // GET /faction-search?query=xxx
    // -----------------------------------------------------
    if (url.pathname === "/faction-search") {
      const query = url.searchParams.get("query")?.toLowerCase() || "";

      // 1. Try KV first
      let cursor = null;
      const results = [];

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

          if (
            name.includes(query) ||
            tag.includes(query) ||
            id.startsWith(query)
          ) {
            results.push({ id: obj.id, name: obj.name, tag: obj.tag });
          }
        }
      } while (cursor);

      if (results.length > 0) {
        return new Response(JSON.stringify(results), { headers: corsHeaders });
      }

      // 2. Fallback: Torn API (search by name)
      const tornData = await torn(`faction/?selections=basic`);
      const tornResults = Object.values(tornData.factions || {}).filter(f => {
        const name = f.name?.toLowerCase() || "";
        const tag = f.tag?.toLowerCase() || "";
        const id = String(f.ID);
        return (
          name.includes(query) ||
          tag.includes(query) ||
          id.startsWith(query)
        );
      });

      return new Response(JSON.stringify(tornResults), { headers: corsHeaders });
    }

    // -------------------------------
    // POST (DISABLED — NO KV WRITES TODAY)
    // -------------------------------
    if (request.method === "POST") {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "KV write quota reached — write operations disabled today."
        }),
        { status: 429, headers: corsHeaders }
      );
    }

    // -------------------------------
    // FALLBACK
    // -------------------------------
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders
    });
  }
};
