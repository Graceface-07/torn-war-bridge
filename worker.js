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
      const tornRes = await tornResponse.json();

      // If Torn API returns an error (e.g. "Incorrect Key")
      if (tornRes.error) {
        return new Response(JSON.stringify({ error: tornRes.error.error, code: tornRes.error.code }), { status: 401, headers });
      }

      // 2. Fetch YATA Data
      const yataResponse = await fetch('https://yata.yt/api/v1/factions/' + id + '/?key=' + apiKey);
      const yataRes = await yataResponse.json();

      return new Response(JSON.stringify({ 
        torn: tornRes, 
        ts: { members: yataRes.members || {} } 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: "Worker Crash: " + e.message }), { status: 500, headers });
    }
  }
};