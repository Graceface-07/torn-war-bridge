export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    if (request.method === "POST") {
      try {
        const body = await request.json();
        const targets = Array.isArray(body.spies) ? body.spies : (body.uid ? [body] : []);

        if (targets.length === 0) throw new Error("No data found");

        await Promise.all(targets.map(t => {
          const key = `spy_${t.fid}_${t.uid}`;
          return env.ROTATOR.put(key, JSON.stringify(t.data));
        }));

        return new Response(JSON.stringify({ ok: true, count: targets.length }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    if (request.method === "GET") {
      const fid = new URL(request.url).searchParams.get("fid");
      if (!fid) return new Response("Missing FID", { status: 400 });
      
      const list = await env.ROTATOR.list({ prefix: `spy_${fid}_` });
      const results = {};
      for (const key of list.keys) {
        results[key.name.split('_')[2]] = await env.ROTATOR.get(key.name, "json");
      }
      return new Response(JSON.stringify(results), { headers: corsHeaders });
    }
  }
};