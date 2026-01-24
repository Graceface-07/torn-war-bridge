export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    };

    // 1. DATABASE LOOKUP (GET)
    if (request.method === "GET") {
      const url = new URL(request.url);
      const uid = url.searchParams.get("uid");
      if (!uid) return new Response("{}", { headers: corsHeaders });
      
      const kv = await env.ROTATOR.get(`spy_${uid}`);
      return new Response(kv || "{}", { headers: corsHeaders });
    }

    // 2. DATABASE UPLOAD (POST)
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const spies = body.spies || [];
        
        for (const spy of spies) {
          // Store each spy using player_id as the key
          await env.ROTATOR.put(`spy_${spy.player_id}`, JSON.stringify(spy));
        }

        return new Response(JSON.stringify({ ok: true, count: spies.length }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers: corsHeaders });
      }
    }

    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
};