export default {
  async fetch(request, env) {
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
    
    try {
      // Fetching TS data to check volume
      const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spies`);
      const tsData = await tsRes.json();
      
      const tsCount = Object.keys(tsData.spies || {}).length;

      return new Response(JSON.stringify({
        source: "Torn Stats",
        record_count: tsCount,
        status: "Read-only volume check complete"
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};