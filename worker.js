export default {
  async fetch(request, env) {
    // 1. ENVIRONMENT CHECK
    // Verifies the 'ROTATOR' KV binding is connected via Cloudflare Dashboard
    if (!env.ROTATOR) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "KV Binding 'ROTATOR' missing. Check Settings > Variables." 
      }), { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" 
        } 
      });
    }

    const url = new URL(request.url);

    // 2. GET METHOD (Used by HUD to pull stats)
    if (request.method === "GET") {
      const targetId = url.searchParams.get("check");
      if (!targetId) return new Response("Missing Target ID", { status: 400 });
      
      const data = await env.ROTATOR.get(`spy_${targetId}`);
      return new Response(data || "{}", {
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    // 3. POST METHOD (Used by pushdaily to batch-upload 10 records)
    if (request.method === "POST") {
      try {
        const body = await request.json();
        
        // Ensure data is formatted as an array under 'spies'
        if (!body.spies || !Array.isArray(body.spies)) {
          throw new Error("Malformed data: 'spies' array required.");
        }

        // Write each spy in the batch to the KV database
        for (const spy of body.spies) {
          if (spy.player_id) {
            await env.ROTATOR.put(`spy_${spy.player_id}`, JSON.stringify(spy));
          }
        }

        return new Response(JSON.stringify({ ok: true, count: body.spies.length }), {
          status: 200,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      } catch (e) {
        // Return 500 Error with CORS headers so Google Script can read the message
        return new Response(JSON.stringify({ ok: false, error: e.message }), { 
          status: 500,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
          }
        });
      }
    }

    // 4. FALLBACK
    return new Response("Method Not Allowed", { 
      status: 405,
      headers: { "Access-Control-Allow-Origin": "*" } 
    });
  }
};