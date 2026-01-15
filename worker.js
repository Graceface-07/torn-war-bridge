export default {
  async fetch(request, env) {
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
    
    try {
      const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spies`, {
        headers: { "User-Agent": "TornWarBridge-Worker" }
      });
      
      const text = await tsRes.text(); // Get raw text first to check if it's HTML
      
      if (text.startsWith("<!DOCTYPE")) {
        return new Response(JSON.stringify({ 
          error: "Torn Stats returned HTML instead of data.",
          preview: text.substring(0, 100) 
        }), { status: 500, headers });
      }

      const tsData = JSON.parse(text);
      const tsCount = Object.keys(tsData.spies || {}).length;

      return new Response(JSON.stringify({
        source: "Torn Stats",
        record_count: tsCount,
        status: "Read-only check successful"
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};