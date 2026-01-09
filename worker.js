export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = env.API_KEY; // Pulled from Settings > Variables

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };

    if (!id || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing ID or API_KEY' }), { status: 400, headers });
    }

    try {
      // 1. Fetch Torn Basic Faction Data
      const tornUrl = `https://api.torn.com/faction/${id}?selections=basic&key=${apiKey}`;
      const tornRes = await fetch(tornUrl).then(r => r.json());

      // 2. Fetch Torn Stats Data (The "1." API we used previously)
      const tsUrl = `https://www.tornstats.com/api/v2/${apiKey}/faction/members`;
      const tsRes = await fetch(tsUrl).then(r => r.json());

      // 3. Return Combined Payload
      return new Response(JSON.stringify({ 
        torn: tornRes, 
        ts: tsRes 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};