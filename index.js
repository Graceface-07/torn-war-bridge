const FF_SCOUTER_KEY = "rwLgZTyqgWDxhoCx";

export default {
  async fetch(request, env) {
    if(request.method !== "POST") return new Response("Use POST", {status:405});

    const payload = await request.json();
    const { attacker, targets } = payload;

    // Score each target
    const scoredTargets = await Promise.all(targets.map(async t => {
      let ffStats = null;

      // Fetch FF Scouter stats
      try {
        const res = await fetch(`https://ffscouter.com/api/v1/get-stats?key=${FF_SCOUTER_KEY}&targets=${t.player_id}&user_id=0`);
        const data = await res.json();
        if(data && data[0]){
          ffStats = data[0];
          t.total = ffStats.fair_fight*100; // scale for scoring
        }
      } catch(e){ /* fallback to dummy */ }

      // If no FF stats, ensure dummy stats exist
      if(!t.total) t.total = Math.floor(Math.random()*1000+500);

      // Score = total + strength + defense + speed + dexterity
      t.score = t.total + (t.strength||0) + (t.defense||0) + (t.speed||0) + (t.dexterity||0);

      return t;
    }));

    // Sort descending and pick top 3
    scoredTargets.sort((a,b)=>b.score - a.score);

    return new Response(JSON.stringify({ top_3_targets: scoredTargets.slice(0,3) }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
