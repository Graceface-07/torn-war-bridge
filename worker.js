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

    if (request.method === "POST") {
      try {
        const text = await request.text();
        console.log(`📥 RAW PAYLOAD: ${text.substring(0, 200)}...`);
        
        const body = JSON.parse(text);
        console.log(`✓ JSON parsed successfully`);

        let targets = [];

        if (Array.isArray(body.spies)) {
          targets = body.spies.filter(t => t.uid && t.data);
          console.log(`📥 Batch: ${targets.length} valid records from ${body.spies.length} total`);
        }

        else if (body.uid && body.data) {
          targets = [body];
          console.log(`📥 Single: 1 record`);
        }

        else {
          console.log(`❌ Invalid payload structure`);
          return new Response(JSON.stringify({ error: "INVALID_PAYLOAD" }), {
            status: 400,
            headers: corsHeaders
          });
        }

        let uploaded = 0;

        for (const t of targets) {
          const key = t.fid ? `spy_${t.fid}_${t.uid}` : `spy_${t.uid}`;
          await env.ROTATOR.put(key, JSON.stringify(t.data));
          uploaded++;

          if (uploaded % 50 === 0) {
            console.log(`✓ Uploaded ${uploaded}...`);
          }
        }

        console.log(`✅ COMPLETE: ${uploaded} records`);

        return new Response(JSON.stringify({
          ok: true,
          count: uploaded
        }), {
          headers: corsHeaders
        });

      } catch (e) {
        console.log(`❌ CATCH ERROR: ${e.message}`);
        return new Response(JSON.stringify({ error: "BAD_JSON", details: e.message }), {
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