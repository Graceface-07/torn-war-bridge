export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- GET: ?check=ID ---
    if (url.searchParams.has("check")) {
      const id = url.searchParams.get("check");
      const key = "spy_" + id;

      try {
        const raw = await env.ROTATOR.get(key);

        if (!raw) {
          return new Response(JSON.stringify({
            strength: 0,
            defense: 0,
            speed: 0,
            dexterity: 0,
            total: 0
          }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }

        return new Response(raw, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({
          strength: 0,
          defense: 0,
          speed: 0,
          dexterity: 0,
          total: 0
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // --- POST: bulk spy upload ---
    if (request.method === "POST") {
      try {
        const body = await request.json();
        const spies = body.spies || {};

        const ops = [];
        for (const id in spies) {
          const key = "spy_" + id;
          ops.push(env.ROTATOR.put(key, JSON.stringify(spies[id])));
        }

        await Promise.all(ops);

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });

      } catch (err) {
        return new Response(JSON.stringify({
          ok: false,
          error: err.toString()
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    // fallback
    return new Response("KV Worker Active (ROTATER + spy_ prefix)", {
      status: 200
    });
  }
};
