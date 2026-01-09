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
      return new Response(JSON.stringify({ error: 'Missing ID or API_KEY' }), { status: 400, headers });
    }

    try {
      // Parallel fetch for speed
      const [tornRes, tsRes] = await Promise.all([
        fetch(`https://api.torn.com/faction/${id}?selections=basic&key=${apiKey}`).then(r => r.json()),
        fetch(`https://www.tornstats.com/api/v2/${apiKey}/faction/members`).then(r => r.json())
      ]);

      return new Response(JSON.stringify({ torn: tornRes, ts: tsRes }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};