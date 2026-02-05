export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // GET — Pull Faction ROTATOR
    if (request.method === "GET") {
      const url = new URL(request.url);
      const fid = url.searchParams.get("fid");

      if (!fid) {
        return new Response(JSON.stringify({ error: "NO_FACTION_ID" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const prefix = `spy_${fid}_`;
      const list = await env.ROTATOR.list({ prefix });
      const results = {};

      for (const key of list.keys) {
        const data = await env.ROTATOR.get(key.name, { type: "json" });
        if (data) {
          const pid = key.name.replace(prefix, "");
          results[pid] = data;
        }
      }

      return new Response(JSON.stringify({
        faction: fid,
        count: Object.keys(results).length,
        members: results
      }), { headers: corsHeaders });
    }

    // POST — Write ROTATOR (Parallel Batching)
    if (request.method === "POST") {
      try {
        const body = await request.json();
        let targets = [];

        if (Array.isArray(body.spies)) {
          targets = body.spies;
        } else if (body.fid && body.uid && body.data) {
          targets = [body];
        } else {
          return new Response(JSON.stringify({ error: "INVALID_PAYLOAD" }), {
            status: 400,
            headers: corsHeaders
          });
        }

        // Run all KV puts in parallel for speed
        await Promise.all(
          targets.map(t => {
            const key = `spy_${t.fid}_${t.uid}`;
            return env.ROTATOR.put(key, JSON.stringify(t.data));
          })
        );

        return new Response(JSON.stringify({
          ok: true,
          count: targets.length
        }), { headers: corsHeaders });

      } catch (e) {
        return new Response(JSON.stringify({ error: "BAD_JSON_OR_KV_FAILURE" }), {
          status: 400,
          headers: corsHeaders
        });
      }
    }

    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: corsHeaders
    });
  }
};