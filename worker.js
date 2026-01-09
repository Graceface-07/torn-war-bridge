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