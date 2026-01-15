export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const mode = url.searchParams.get("mode");
    const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };

    // HARD-CODED KEYS FOR TESTING
    const TEST_TS_KEY = 'TS_gc43XVxOpCcwLnY6';
    const TEST_YATA_KEY = 'CZP2D2ZnbXWsYiDT';

    try {
      if (mode === "global_sync") {
        // 1. Fetch from Torn Stats
        const tsRes = await fetch(`https://www.tornstats.com/api/v2/${TEST_TS_KEY}/spies`);
        const tsData = await tsRes.json();

        // 2. Fetch from YATA
        const yataRes = await fetch(`https://yata.yt/api/v1/spies/?key=${TEST_YATA_KEY}`);
        const yataData = await yataRes.json();

        // Combine IDs
        const allIds = new Set([
          ...Object.keys(tsData.spies || {}),
          ...Object.keys(yataData.spies || {})
        ]);

        const ids = Array.from(allIds);
        let count = 0;

        // Process up to 400 for the test
        const limit = Math.min(ids.length, 400);

        for (let i = 0; i < limit; i++) {
          const id = ids[i];
          const s = yataData.spies?.[id] || tsData.spies?.[id];
          
          if (s && env.ROTATOR) {
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

        return new Response(JSON.stringify({ 
          success: true, 
          imported: count, 
          total_found: ids.length 
        }), { headers });
      }

      return new Response(JSON.stringify({ status: "Ready for Sync", mode_received: mode }), { headers });
      
    } catch (e) {
      return new Response("TEST_CRASH: " + e.message, { status: 500 });
    }
  }
};