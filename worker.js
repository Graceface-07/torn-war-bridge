export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = env.API_KEY; // Your Torn Key
    const tsKey = env.TS_KEY;   // Your Torn Stats Key

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    try {
      // 1. Fetch Torn Basic Data
      const tornRes = await fetch('https://api.torn.com/faction/' + id + '?selections=basic&key=' + apiKey).then(r => r.json());

      // 2. Fetch YATA Stats
      const yataRes = await fetch('https://yata.yt/api/v1/factions/' + id + '/?key=' + apiKey).then(r => r.json());

      // 3. Fetch Torn Stats (Detailed Spy Data)
      // Note: This requires the TS_KEY you put in wrangler secrets
      const tsRes = await fetch('https://www.tornstats.com/api/v2/' + tsKey + '/factions/' + id).then(r => r.json());

      // Merge Logic: Prioritize Torn Stats (Spies) > YATA > Level Ratio
      const mergedMembers = {};
      const uids = Object.keys(tornRes.members);

      uids.forEach(uid => {
        const yataData = (yataRes.members && yataRes.members[uid]) ? yataRes.members[uid] : {};
        const tsData = (tsRes.members && tsRes.members[uid]) ? tsRes.members[uid] : {};
        
        // Choose the most complete data set
        mergedMembers[uid] = {
          strength: tsData.strength || yataData.strength || 0,
          defense: tsData.defense || yataData.defense || 0,
          speed: tsData.speed || yataData.speed || 0,
          dexterity: tsData.dexterity || yataData.dexterity || 0,
          total: tsData.total || yataData.total_stats || 0,
          source: tsData.total ? "TornStats" : (yataData.total_stats ? "YATA" : "None")
        };
      });

      return new Response(JSON.stringify({ 
        torn: tornRes, 
        stats: mergedMembers 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};