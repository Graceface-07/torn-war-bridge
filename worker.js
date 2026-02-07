export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    // --- GET HANDLER (Now lists all spies without FID) ---
    if (request.method === "GET") {
      const prefix = `spy_`; 
      const list = await env.ROTATOR.list({ prefix });
      const results = {};

      for (const key of list.keys) {
        const data = await env.ROTATOR.get(key.name, { type: "json" });
        if (data) {
          // Removes 'spy_' prefix to get the raw UID
          const pid = key.name.split('_').pop(); 
          results[pid] = data;
        }
      }

      return new Response(JSON.stringify({
        count: Object.keys(results).length,
        members: results
      }), { headers: corsHeaders });
    }

    // --- POST HANDLER (Now handles data without requiring FID) ---
    if (request.method === "POST") {
      let body = await request.json();
      let targets = Array.isArray(body.spies) ? body.spies : [body];

      for (const t of targets) {
        // Fallback to 'global' if fid is missing to prevent crash
        const folder = t.fid || "global";
        const key = `spy_${folder}_${t.uid}`;
        
        await env.ROTATOR.put(key, JSON.stringify(t.data));
      }

      return new Response(JSON.stringify({ ok: true, count: targets.length }), {
        headers: corsHeaders
      });
    }

    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), { status: 405, headers: corsHeaders });
  }
};