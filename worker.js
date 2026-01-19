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
      const url = new URL(request.url);
      const FF_KEY = "rwLgZTyqgWDxhoCx";

      if (url.searchParams.has("check")) {
        // fetch from KV
        const spy = await env.ROTATOR.get(`spy_${url.searchParams.get("check")}`, { type: "json" });
        return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
      }

      if (request.method === "POST") {
        const body = await request.json();

        // If spies data sent -> push to KV
        if (body.spies && Array.isArray(body.spies)) {
          const now = Date.now();
          await Promise.all(body.spies.map(s => 
            env.ROTATOR.put(`spy_${s.player_id}`, JSON.stringify(s), { metadata: { lastUpdated: now } })
          ));
          return new Response(JSON.stringify({ success: true, count: body.spies.length }), { headers });
        }

        // If attacker + targets sent -> calculate recommendations
        if (body.attacker && body.targets) {
          const attacker = body.attacker;
          const faction_context = body.faction_context || {};
          const scoredTargets = [];

          for (let t of body.targets) {
            // Try KV first
            let kvData = await env.ROTATOR.get(`spy_${t.player_id}`, { type: "json" });

            // If KV empty -> fallback to FF Scouter
            if (!kvData) {
              try {
                const ffRes = await fetch(`https://ffscouter.com/api/v1/get-stats?key=${FF_KEY}&targets=${t.player_id}&user_id=${t.user_id||0}`);
                const ffJson = await ffRes.json();
                if (ffJson && ffJson[0]) {
                  kvData = {
                    name: ffJson[0].name || "Unknown",
                    total: ffJson[0].bs_estimate_human || 0,
                    strength: 0,
                    defense: 0,
                    speed: 0,
                    dexterity: 0,
                    ff: ffJson[0].fair_fight,
                    respect: ffJson[0].respect || 0
                  };
                }
              } catch(e) { kvData = { total:0, ff:0, respect:0, name:"Unknown" }; }
            }

            // Simple scoring: KV total if available, otherwise FF estimate * FF factor + respect
            const score = (kvData.total || 0) + ((kvData.ff||0) * 10) + (kvData.respect||0);
            scoredTargets.push({ player_id: t.player_id, name: kvData.name, score, ff: kvData.ff, respect: kvData.respect });
          }

          // Sort descending
          scoredTargets.sort((a,b)=>b.score-a.score);

          return new Response(JSON.stringify({ top_3_targets: scoredTargets.slice(0,3) }), { headers });
        }
      }

    } catch(e) {
      return new Response(JSON.stringify({ error: e.message }), { headers });
    }

    return new Response(JSON.stringify({ status: "BRIDGE_ONLINE" }), { headers });
  }
};
