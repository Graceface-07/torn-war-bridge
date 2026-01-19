// worker.js
var worker_default = {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST only" }), { status: 405 });
    }
    let written = 0;
    let failed = 0;
    let progress = [];
    try {
      const body = await request.json();
      const spies = body.spies || [];
      for (let i = 0; i < spies.length; i++) {
        const s = spies[i];
        if (!s.player_id) {
          failed++;
          continue;
        }
        try {
          await env.ROTATOR.put(
            "spy_" + s.player_id,
            JSON.stringify({
              name: s.name || "",
              strength: s.strength || 0,
              defense: s.defense || 0,
              speed: s.speed || 0,
              dexterity: s.dexterity || 0,
              total: s.total || 0,
              updated: Date.now()
            })
          );
          written++;
          if (written % 50 === 0) {
            progress.push({ written });
          }
        } catch {
          failed++;
        }
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(
      JSON.stringify({
        status: "ok",
        written,
        failed,
        progress
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
