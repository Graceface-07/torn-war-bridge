export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = env.API_KEY;

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };

    if (!id || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing ID/KEY' }), { status: 400, headers });
    }

    try {
      // Fetch Torn Basic Data
      const tornUrl = `https://api.torn.com/faction/${id}?selections=basic&key=${apiKey}`;
      const tornRes = await fetch(tornUrl).then(r => r.json());

      // Fetch Torn Stats (Corrected endpoint for the "1." version)
      // Note: Torn Stats v2 often requires the faction ID in the URL path
      const tsUrl = `https://www.tornstats.com/api/v2/${apiKey}/faction/members/${id}`;
      const tsRes = await fetch(tsUrl).then(r => r.json()).catch(() => ({members: {}}));

      return new Response(JSON.stringify({ 
        torn: tornRes, 
        ts: tsRes 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Worker Logic Error" }), { status: 500, headers });
    }
  }
};