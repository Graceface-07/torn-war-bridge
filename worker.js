export default {
  async fetch(request, env) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };
    
    if (request.method === "OPTIONS") return new Response(null, { headers });
    
    try {
      if (request.method === "POST") {
        const body = await request.json();
        const attacker = body.attacker || { total: 0 };
        const targets = body.targets || [];

        // For each target, try KV first, fallback to FF Scouter stats
        const scoredTargets = await Promise.all(targets.map(async t => {
          // Try KV
          const kv = await env.ROTATOR.get(`spy_${t.player_id}`, { type: "json" }) || {};
          const ff = t.ff || kv.ff || 0;
          const totalStats = kv.total || t.total || 0;
          const score = totalStats + ff * 100; // simple scoring formula
          return {
            player_id: t.player_id,
            name: t.name || kv.name || "Unknown",
            score,
            total: totalStats
          };
        }));

        // Sort by score descending, pick top 3
        const top_3_targets = scoredTargets.sort((a,b)=>b.score - a.score).slice(0,3);

        return new Response(JSON.stringify({ top_3_targets }), { headers });
      }
    } catch(e){
      return new Response(JSON.stringify({ error: e.message }), { headers });
    }

    return new Response(JSON.stringify({ status: "Worker Online" }), { headers });
  }
};
