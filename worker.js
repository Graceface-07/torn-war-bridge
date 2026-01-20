// worker.js - V9.9.5
   var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Standard CORS Headers for all responses
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    // Handle Pre-flight Options request
    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (!env.ROTATOR) {
      return new Response(JSON.stringify({ ok: false, error: "KV Binding 'ROTATOR' missing." }), { status: 500, headers });
    }

    // --- GET HANDLERS ---
    if (request.method === "GET") {
      // Logic for ?check=ID
      if (request.method === "GET" && url.searchParams.has("check")) {
  const targetId = url.searchParams.get("check");
  const data = await env.ROTATOR.get(`spy_${targetId}`);
  return new Response(data || "{}", { headers });
}
      // Logic for /stats?uid=ID
      if (path === "/stats") {
        const uid = url.searchParams.get("uid");
        if (!uid) return new Response("Missing uid", { status: 400, headers });
        const data = await env.ROTATOR.get(`spy_${uid}`);
        return new Response(data || "{}", { headers });
      }

      // Logic for /faction?id=ID
      if (path === "/faction") {
        const fid = url.searchParams.get("id");
        if (!fid) return new Response("Missing faction id", { status: 400, headers });
        const data = await env.ROTATOR.get(`faction_${fid}`);
        return new Response(data || "{}", { headers });
      }
    }

    // --- POST HANDLER (pushdaily) ---
    // Accepts POST to root "/" or "/push"
    if (request.method === "POST") {
      try {
        const body = await request.json();
        if (!body.spies || !Array.isArray(body.spies)) {
          throw new Error("Malformed data: 'spies' array required.");
        }
        for (const spy of body.spies) {
          if (spy.player_id) {
            await env.ROTATOR.put(`spy_${spy.player_id}`, JSON.stringify(spy));
          }
        }
        return new Response(JSON.stringify({ ok: true, count: body.spies.length }), { status: 200, headers });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message }), { status: 500, headers });
      }
    }

    // --- FALLBACK ---
    return new Response(JSON.stringify({ error: "Method Not Allowed or Invalid Path", path: path }), { status: 405, headers });
  }
};

export { worker_default as default };