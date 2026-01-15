export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode"); // Explicitly capture the mode
    const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

    try {
      // DEBUG: If you hit this in a browser, it will tell you what mode it sees
      if (request.method === "GET" && !url.searchParams.has("id")) {
        return new Response(JSON.stringify({ status: "Online", detected_mode: mode }), { headers });
      }

      // Handle the Global Sync
      if (mode === "global_sync") {
        const [tsRes, yataRes] = await Promise.all([
          fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spies`),
          fetch(`https://yata.yt/api/v1/spies/?key=${env.Yata}`) // Matches your "Yata" naming
        ]);

        const tsData = await tsRes.json();
        const yataData = await yataRes.json();

        const allIds = new Set([...Object.keys(tsData.spies || {}), ...Object.keys(yataData.spies || {})]);
        const ids = Array.from(allIds);
        let count = 0;

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

      return new Response(JSON.stringify({ error: "No mode selected", received_mode: mode }), { status: 400, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};