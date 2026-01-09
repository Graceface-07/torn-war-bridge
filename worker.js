export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = env.API_KEY;
    const tsKey = env.TS_KEY;

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    try {
      // 1. Fetch Torn Basic (Critical)
      const tornRes = await fetch('https://api.torn.com/faction/' + id + '?selections=basic&key=' + apiKey).then(r => r.json());
      if (tornRes.error) throw new Error("Torn API: " + tornRes.error.error);

      // 2. Fetch YATA (Optional - Fail-safe)
      let yataRes = { members: {} };
      try {
        yataRes = await fetch('https://yata.yt/api/v1/factions/' + id + '/?key=' + apiKey).then(r => r.json());
      } catch (e) { console.log("YATA Down"); }

      // 3. Fetch Torn Stats (Optional - Fail-safe)
      let tsRes = { members: {} };
      try {
        tsRes = await fetch('https://www.tornstats.com/api/v2/' + tsKey + '/factions/' + id).then(r => r.json());
      } catch (e) { console.log("TornStats Down"); }

      // Merge Logic
      const mergedStats = {};
      const uids = Object.keys(tornRes.members || {});

      uids.forEach(uid => {
        const y = (yataRes.members && yataRes.members[uid]) ? yataRes.members[uid] : {};
        // Torn Stats sometimes nests data under .members or .data
        const t = (tsRes.members && tsRes.members[uid]) ? tsRes.members[uid] : {};
        
        mergedStats[uid] = {
          strength: t.strength || y.strength || 0,
          defense: t.defense || y.defense || 0,
          speed: t.speed || y.speed || 0,
          dexterity: t.dexterity || y.dexterity || 0,
          total: t.total || y.total_stats || y.total || 0
        };
      });

      return new Response(JSON.stringify({ 
        torn: tornRes, 
        stats: mergedStats 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};