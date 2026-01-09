export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = env.API_KEY;

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    try {
      // 1. Fetch Torn Data
      const tornResponse = await fetch('https://api.torn.com/faction/' + id + '?selections=basic&key=' + apiKey);
      if (!tornResponse.ok) return new Response(JSON.stringify({ error: "Torn API Down" }), { status: 502, headers });
      const tornRes = await tornResponse.json();

      // 2. Fetch YATA Data
      const yataResponse = await fetch('https://yata.yt/api/v1/factions/' + id + '/?key=' + apiKey);
      
      let yataMembers = {};
      // Check if YATA returned valid JSON instead of an HTML error page
      if (yataResponse.ok && yataResponse.headers.get("content-type")?.includes("application/json")) {
        const yataRes = await yataResponse.json();
        yataMembers = yataRes.members || {};
      }

      return new Response(JSON.stringify({ 
        torn: tornRes, 
        ts: { members: yataMembers } 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Worker Logic Error: " + e.message }), { status: 500, headers });
    }
  }
};
// worker.js update
const tsRes = await fetch('https://www.tornstats.com/api/v2/' + tsKey + '/spy/faction/' + id).then(r => r.json());

// Structural Analysis of Torn Stats Spy Return
if (tsRes.status && tsRes.faction && tsRes.faction.members) {
    Object.keys(tsRes.faction.members).forEach(uid => {
        const spy = tsRes.faction.members[uid];
        mergedStats[uid] = {
            strength: spy.strength || 0,
            defense: spy.defense || 0,
            speed: spy.speed || 0,
            dexterity: spy.dexterity || 0,
            total: spy.total || 0,
            timestamp: spy.timestamp || 0
        };
    });
}