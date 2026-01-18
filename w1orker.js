export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Health Check Endpoint
    if (url.searchParams.has("status")) {
      const list = await env.ROTATOR.list();
      const keys = list.keys;
      
      // Filter keys updated in the last 24 hours
      const now = Date.now();
      const last24h = keys.filter(k => (now - k.expiration * 1000) < 86400000); 

      return new Response(JSON.stringify({
        total_spies_in_db: keys.length,
        updated_recently: last24h.length,
        status: keys.length > 0 ? "DATABASE_ACTIVE" : "DATABASE_EMPTY"
      }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response("Use ?status to check DB health.");
  }
};