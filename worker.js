export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method === "GET") {
      const url = new URL(request.url);
      const fid = url.searchParams.get("fid");

      if (!fid) {
        return new Response(JSON.stringify({ error: "NO_FACTION_ID" }), {
          status: 400,
          headers: cors
        });
      }

      const prefix = `spy_${fid}_`;
      const list = await env.ROTATOR.list({ prefix });

      const out = {};

      for (const key of list.keys) {

        if (data) {export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // -------------------------
    // GET — pull faction ROTATOR
    // -------------------------
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
      }), {
        headers: corsHeaders
      });
    }

    // -------------------------
    // POST — write ROTATOR (single or batch)
    // -------------------------
    if (request.method === "POST") {
      try {
        const body = await request.json();

        let targets = [];

        // Batch push: { spies: [ { fid, uid, data }, ... ] }
        if (Array.isArray(body.spies)) {
          targets = body.spies;
        }

        // Single push: { fid, uid, data }
        else if (body.fid && body.uid && body.data) {
          targets = [body];
        }

        else {
          return new Response(JSON.stringify({ error: "INVALID_PAYLOAD" }), {
            status: 400,
            headers: corsHeaders
          });
        }

        for (const t of targets) {
          const key = `spy_${t.fid}_${t.uid}`;
          await env.ROTATOR.put(key, JSON.stringify(t.data));
        }

        return new Response(JSON.stringify({
          ok: true,
          count: targets.length
        }), {
          headers: corsHeaders
        });

      } catch (e) {
        return new Response(JSON.stringify({ error: "BAD_JSON" }), {
          status: 400,
          headers: corsHeaders
        });
      }
    }

    // -------------------------
    // Unsupported method
    // -------------------------
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: corsHeaders
    });
  }
};

          const uid = key.name.replace(prefix, "");
          out[uid] = data;
        }
      }

      return new Response(JSON.stringify(out), { headers: cors });
    }

    return new Response("METHOD_NOT_ALLOWED", { status: 405, headers: cors });
  }
};
