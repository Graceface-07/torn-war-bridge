export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const TORN_KEY = 'rwLgZTyqgWDxhoCx';
    const TS_KEY = 'TS_gc43XVxOpCcwLnY6';

    if (!id) return new Response("Missing ID", { status: 400, headers: corsHeaders });

    try {
      const [torn, ts] = await Promise.all([
        fetch(`https://api.torn.com/faction/${id}?selections=basic&key=${TORN_KEY}`).then(r => r.json()),
        fetch(`https://www.tornstats.com/api/v2/${TS_KEY}/scouter/faction/${id}`).then(r => r.json())
      ]);

      return new Response(JSON.stringify({ torn, ts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
};
