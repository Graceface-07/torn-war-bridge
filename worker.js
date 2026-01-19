export default {
  async fetch(request, env) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers });

    const url = new URL(request.url);

    try {
      // Check a single player in KV
      if (url.searchParams.has("check")) {
        const spy = await env.ROTATOR.get(`spy_${url.searchParams.get("check")}`, { type: "json" });
        return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
      }
if (request.method === "GET") {
  const url = new URL(request.url);
  const key = url.pathname.slice(1); // Gets "spy_12345" from "/spy_12345"
  
  if (key.startsWith("spy_")) {
    const data = await env.ROTATOR.get(key, { type: "json" });
    return new Response(JSON.stringify(data || {}), { headers });
  }
}
      // Score targets
      if (request.method === "POST") {
        const body = await request.json();
        const attacker = body.attacker;
        const targets = body.targets || [];

        // Fill dummy stats or fallback to FF Scouter if KV empty
        const scoredTargets = await Promise.all(targets.map(async t => {
          // Try KV first
          let spy = await env.ROTATOR.get(`spy_${t.player_id}`, { type: "json" });

          // Fallback to FF Scouter
          if (!spy) {
            const ffRes = await fetch(`https://ffscouter.com/api/v1/get-stats?key=${env.FF_SCOUTER_KEY}&targets=${t.player_id}&user_id=${body.attacker_id||0}`);
            const ffData = await ffRes.json();
            if (ffData && ffData[0]) {
              spy = {
                total: ffData[0].fair_fight * 250, // convert FF to dummy total
                strength: ffData[0].fair_fight * 60,
                defense: ffData[0].fair_fight * 60,
                speed: ffData[0].fair_fight * 60,
                dexterity: ffData[0].fair_fight * 60
              };
            } else {
              // Dummy stats if nothing
              spy = { total: Math.floor(Math.random() * 1000 + 500), strength: 250, defense: 250, speed: 250, dexterity: 250 };
            }
          }

          // Simple scoring: attacker total minus target total
          const score = attacker.total / spy.total;
          return { ...t, ...spy, score: parseFloat(score.toFixed(2)) };
        }));

        // Return top 3 by score
        scoredTargets.sort((a,b)=>b.score-a.score);
        return new Response(JSON.stringify({ top_3_targets: scoredTargets.slice(0,3) }), { headers });
      }

    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { headers });
    }

    return new Response(JSON.stringify({ status: "WORKER_ONLINE" }), { headers });
  }
};
