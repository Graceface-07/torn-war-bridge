export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (method === "OPTIONS") return new Response(null, { headers });

    try {
      if (method === "POST") {
        const body = await request.json();
        await env.ROTATOR.put(`spy_${body.id}`, JSON.stringify({ total: Number(body.total) }));
        return new Response(JSON.stringify({ success: true }), { headers });
      }

      const idParam = url.searchParams.get("id");
      const forceUpdate = url.searchParams.get("update") === "true";
      if (!idParam) return new Response("Missing ID", { status: 400, headers });

      const tornRes = await fetch(`https://api.torn.com/faction/${idParam}?selections=basic&key=${env.TORN_KEY}`);
      const tornData = await tornRes.json();
      
      const membersList = [];
      const memberIds = Object.keys(tornData.members);

      // Limit subrequests by only checking Torn Stats for the first 40 members if forcing update
      // Otherwise, just rely on the Vault (KV) which doesn't count as a subrequest
      for (let i = 0; i < memberIds.length; i++) {
        const id = memberIds[i];
        const m = tornData.members[id];
        let spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });

        // Only call external API (Torn Stats) if missing and under the subrequest limit
        if (!spy && forceUpdate && i < 40) { 
          const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`);
          const tsData = await tsRes.json();
          if (tsData.status && tsData.spy) {
            spy = { total: tsData.spy.total };
            await env.ROTATOR.put(`spy_${id}`, JSON.stringify(spy));
          }
        }

        membersList.push({
          id, name: m.name, level: m.level, 
          status_desc: m.status.description, 
          total: spy ? spy.total : 0 
        });
      }

      return new Response(JSON.stringify({ faction: { name: tornData.name }, members: membersList }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};