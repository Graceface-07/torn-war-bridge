export default {
  async fetch(request, env) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const apiKey = env.API_KEY; // Ensure this is in Settings -> Variables

    if (!id || !apiKey) {
      return new Response(JSON.stringify({ error: 'Missing ID or API_KEY' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    try {
      const [tornRes, tsRes] = await Promise.all([
        fetch(`https://api.torn.com/faction/${id}?selections=basic&key=${apiKey}`).then(r => r.json()),
        fetch(`https://www.tornstats.com/api/v2/${apiKey}/faction/${id}`).then(r => r.json())
      ]);

      return new Response(JSON.stringify({ torn: tornRes, ts: tsRes }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};