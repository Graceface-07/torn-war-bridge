export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    };

    try {
      if (request.method === "POST" && url.searchParams.get("mode") === "global_sync") {
        if (!env.ROTATOR) throw new Error("KV Namespace 'ROTATOR' missing.");

        const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spies`);
        const tsData = await tsRes.json();
        
        const yataRes = await fetch(`https://yata.yt/api/v1/spies/?key=${env.YATA}`);
        const yataData = await yataRes.json();

        // Combine all unique IDs
        const allIds = new Set([
          ...Object.keys(tsData.spies || {}),
          ...Object.keys(yataData.spies || {})
        ]);

        let count = 0;
        // Process in chunks of 50 to avoid CPU/Memory crashes
        const ids = Array.from(allIds);
        for (let i = 0; i < ids.length; i += 50) {
          const chunk = ids.slice(i, i + 50);
          await Promise.all(chunk.map(id => {
            const s = yataData.spies?.[id] || tsData.spies?.[id];
            return env.ROTATOR.put(`spy_${id}`, JSON.stringify({
              total: s.total || 0,
              strength: s.strength || 0,
              defense: s.defense || 0,
              speed: s.speed || 0,
              dexterity: s.dexterity || 0,
              timestamp: Math.floor(Date.now() / 1000)
            }));
          }));
          count += chunk.length;
        }

        return new Response(JSON.stringify({ success: true, total_imported: count }), { headers });
      }

      return new Response(JSON.stringify({ error: "No mode selected" }), { status: 400, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};