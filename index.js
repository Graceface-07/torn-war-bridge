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
        const uid = body.attacker?.user_id || "0";

        // Score each target using KV + FF Scouter
        const scoredTargets = await Promise.all(targets.map(async t => {
          // KV database first
          const kv = await env.ROTATOR.get(`spy_${t.player_id}`, { type: "json" }) || {};
          
          // FF Scouter fallback
          const ffStats = await fetch(`https://ffscouter.com/api/v1/get-stats?key=${rwLgZTyqgWDxhoCx}&targets=${t.player_id}&user_id=${uid}`)
                            .then(r=>r.json())
                            .catch(()=>[]);

          const ff = (ffStats[0]?.fair_fight) || kv.ff || 0;
          const totalStats = kv.total || t.total || 0;
          const respect = (ffStats[0]?.respect) || 0;

          // Scoring formula: combination of stats, FF multiplier, respect
          const score = totalStats + ff*100 + respect;

          return {
            player_id: t.player_id,
            name: t.name || kv.name || "Unknown",
            score,
            total: totalStats,
            ff,
            respect
          };
        }));

        // Sort descending and pick top 3
        const top_3_targets = scoredTargets.sort((a,b)=>b.score - a.score).slice(0,3);

        return new Response(JSON.stringify({ top_3_targets }), { headers });
      }
    } catch(e){
      return new Response(JSON.stringify({ error: e.message }), { headers });
    }

    return new Response(JSON.stringify({ status: "Worker Online" }), { headers });
  }
};
