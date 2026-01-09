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

      // Fetch Torn Stats - Using the specific v2 stats endpoint
      const tsRes = await fetch(`https://www.tornstats.com/api/v2/${apiKey}/faction/members`).then(r => r.json());

      return new Response(JSON.stringify({ 
        torn: tornRes, 
        ts: tsRes 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};