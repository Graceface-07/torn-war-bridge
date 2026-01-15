export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = { "Content-Type": "application/json" };
    const YATA_KEY = 'CZP2D2ZnbXWsYiDT';

    try {
      // 1. Fetch the full list from YATA
      const yataRes = await fetch(`https://yata.yt/api/v1/spies/?key=${YATA_KEY}`);
      const yataData = await yataRes.json();
      const allIds = Object.keys(yataData.spies || {});

      // 2. Get the "Offset" (where we left off)
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const batchSize = 500; // Cloudflare Free limit is roughly 500-1000 writes per trigger
      const chunk = allIds.slice(offset, offset + batchSize);

      // 3. Save this chunk to your ROTATOR KV
      await Promise.all(chunk.map(id => {
        const s = yataData.spies[id];
        return env.ROTATOR.put(`spy_${id}`, JSON.stringify({
          total: s.total || 0,
          strength: s.strength || 0,
          defense: s.defense || 0,
          speed: s.speed || 0,
          dexterity: s.dexterity || 0,
          timestamp: Math.floor(Date.now() / 1000)
        }));
      }));

      return new Response(JSON.stringify({
        success: true,
        imported_this_batch: chunk.length,
        next_offset: offset + batchSize,
        total_remaining: allIds.length - (offset + batchSize),
        done: (offset + batchSize) >= allIds.length
      }), { headers });

    } catch (e) {
      return new Response("IMPORT_ERROR: " + e.message, { status: 500 });
    }
  }
};