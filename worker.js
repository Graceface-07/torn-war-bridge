export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
    const YATA_KEY = 'CZP2D2ZnbXWsYiDT';

    try {
      // 1. Fetch full list from YATA
      const yataRes = await fetch(`https://yata.yt/api/v1/spies/?key=${YATA_KEY}`);
      const yataData = await yataRes.json();
      const allIds = Object.keys(yataData.spies || {});

      // 2. Determine Batch Range
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const batchSize = 500; 
      const chunk = allIds.slice(offset, offset + batchSize);

      // 3. Selective Import Logic
      let added = 0;
      let skipped = 0;

      await Promise.all(chunk.map(async (id) => {
        const s = yataData.spies[id];
        const existing = await env.ROTATOR.get(`spy_${id}`, { type: "json" });

        // If it doesn't exist OR the total stats have changed, update it
        if (!existing || existing.total !== s.total) {
          await env.ROTATOR.put(`spy_${id}`, JSON.stringify({
            total: s.total || 0,
            strength: s.strength || 0,
            defense: s.defense || 0,
            speed: s.speed || 0,
            dexterity: s.dexterity || 0,
            timestamp: Math.floor(Date.now() / 1000)
          }));
          added++;
        } else {
          skipped++;
        }
      }));

      return new Response(JSON.stringify({
        success: true,
        added,
        skipped,
        next_offset: offset + batchSize,
        done: (offset + batchSize) >= allIds.length
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};