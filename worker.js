export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");
    const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

    try {
      // 1. Validate environment immediately
      if (!env.ROTATOR) return new Response("ERROR: KV 'ROTATOR' not bound", { status: 500 });
      if (!env.TS_KEY || !env.Yata) return new Response("ERROR: Keys TS_KEY or Yata missing", { status: 500 });

      if (mode === "global_sync") {
        // Fetching bulk data
        const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spies`);
        const yataRes = await fetch(`https://yata.yt/api/v1/spies/?key=${env.Yata}`);

        const tsData = await tsRes.json();
        const yataData = await yataRes.json();

        const allIds = new Set([...Object.keys(tsData.spies || {}), ...Object.keys(yataData.spies || {})]);
        const ids = Array.from(allIds);
        
        // We only process the first 400 to stay under the Free Tier limits
        const limit = Math.min(ids.length, 400);
        let count = 0;

        for (let i = 0; i < limit; i++) {
          const id = ids[i];
          const s = yataData.spies?.[id] || tsData.spies?.[id];
          if (s) {
            // We use waitUntil to offload the work so the request doesn't timeout
            await env.ROTATOR.put(`spy_${id}`, JSON.stringify({
              total: s.total || 0,
              strength: s.strength || 0,
              defense: s.defense || 0,
              speed: s.speed || 0,
              dexterity: s.dexterity || 0,
              timestamp: Math.floor(Date.now() / 1000)
            }));
            count++;
          }
        }

        return new Response(JSON.stringify({ success: true, imported: count, total_available: ids.length }), { headers });
      }

      return new Response(JSON.stringify({ error: "No mode selected" }), { status: 400, headers });
      
    } catch (e) {
      // This sends the actual error back to Google instead of the HTML page
      return new Response("WORKER_EXCEPTION: " + e.message, { status: 500 });
    }
  }
};