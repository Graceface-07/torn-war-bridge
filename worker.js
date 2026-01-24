export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    };

    // Handle Pre-flight (for security/browser checks)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. THE PUSH LOGIC (POST)
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const spies = body.spies || [];
        
        if (spies.length === 0) {
          return new Response(JSON.stringify({ ok: false, error: "Empty queue" }), { status: 400, headers: corsHeaders });
        }

        // Use the 'ROTATOR' binding you confirmed exists
        for (const spy of spies) {
          await env.ROTATOR.put(`spy_${spy.player_id}`, JSON.stringify(spy));
        }

        return new Response(JSON.stringify({ ok: true, count: spies.length }), { 
          status: 200, 
          headers: corsHeaders 
        });

      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { 
          status: 500, 
          headers: corsHeaders 
        });
      }
    }

    // 2. THE LOOKUP LOGIC (GET)
    if (request.method === "GET") {
      const url = new URL(request.url);
      const uid = url.searchParams.get("uid");
      if (!uid) return new Response("{}", { headers: corsHeaders });
      
      const kv = await env.ROTATOR.get(`spy_${uid}`);
      return new Response(kv || "{}", { headers: corsHeaders });
    }

    // If it's not GET or POST, send this instead of a blank screen
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }
};