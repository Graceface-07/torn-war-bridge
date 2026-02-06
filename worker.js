export default {
  async fetch(request, env) {

    function log(step, data) {
      console.log(`[LOG] ${step}`, data || "");
    }

    function trap(step, fn) {
      try {
        log(step + " (start)");
        const out = fn();
        log(step + " (ok)", out);
        return out;
      } catch (e) {
        console.error(`[ERROR @ ${step}]`, e);
        throw e;
      }
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      log("OPTIONS preflight");
      return new Response(null, { headers: corsHeaders });
    }

    // -------------------------
    // GET
    // -------------------------
    if (request.method === "GET") {
      log("GET request received");

      const url = new URL(request.url);
      const fid = url.searchParams.get("fid");

      log("GET fid", fid);

      if (!fid) {
        return new Response(JSON.stringify({ error: "NO_FACTION_ID" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      const prefix = `spy_${fid}_`;

      const list = await trap("KV LIST", () =>
        env.ROTATOR.list({ prefix })
      );

      const results = {};

      for (const key of list.keys) {
        const data = await trap("KV GET " + key.name, () =>
          env.ROTATOR.get(key.name, { type: "json" })
        );
        if (data) {
          const pid = key.name.replace(prefix, "");
          results[pid] = data;
        }
      }

      log("GET complete", results);

      return new Response(JSON.stringify({
        faction: fid,
        count: Object.keys(results).length,
        members: results
      }), {
        headers: corsHeaders
      });
    }

    // -------------------------
    // POST
    // -------------------------
    if (request.method === "POST") {
      log("POST request received");

      let body;
      try {
        body = await trap("PARSE JSON", () => request.json());
      } catch (e) {
        return new Response(JSON.stringify({ error: "BAD_JSON" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      let targets = [];

      if (Array.isArray(body.spies)) {
        log("POST batch mode");
        targets = body.spies;
      } else if (body.fid && body.uid && body.data) {
        log("POST single mode");
        targets = [body];
      } else {
        return new Response(JSON.stringify({ error: "INVALID_PAYLOAD" }), {
          status: 400,
          headers: corsHeaders
        });
      }

      for (const t of targets) {
        const key = `spy_${t.fid}_${t.uid}`;
        await trap("KV PUT " + key, () =>
          env.ROTATOR.put(key, JSON.stringify(t.data))
        );
      }

      log("POST complete", targets.length);

      return new Response(JSON.stringify({
        ok: true,
        count: targets.length
      }), {
        headers: corsHeaders
      });
    }

    // -------------------------
    // Unsupported
    // -------------------------
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: corsHeaders
    });
  }
};
