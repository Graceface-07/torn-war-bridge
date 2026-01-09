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
      // Fetch Torn Basic Data
      const tornRes = await fetch(`https://api.torn.com/faction/${id}?selections=basic&key=${apiKey}`).then(r => r.json());

      // Fetch YATA Faction Data
      const yataRes = await fetch(`https://yata.yt/api/v1/factions/${id}/?key=${apiKey}`).then(r => r.json());

      // Map YATA members to the 'ts' key so the Google App UI doesn't break
      return new Response(JSON.stringify({ 
        torn: tornRes, 
        ts: { members: yataRes.members || {} } 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};