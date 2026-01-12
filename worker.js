export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

    // Handle Manual Pushes from Google Sheet
    if (method === "POST" && url.pathname === "/manual-update") {
      const body = await request.json();
      await env.ROTATOR.put(`spy_${body.id}`, JSON.stringify({
        total: body.total,
        strength: body.strength,
        defense: body.defense,
        speed: body.speed,
        dexterity: body.dexterity
      }));
      return new Response("Vault Updated for " + body.name, { headers });
    }

    // Handle HUD Requests
    const idParam = url.searchParams.get("id");
    const forceUpdate = url.searchParams.get("update") === "true";

    if (!idParam) return new Response("Missing ID", { status: 400, headers });

    const tornRes = await fetch(`https://api.torn.com/faction/${idParam}?selections=basic&key=${env.TORN_KEY}`);
    const tornData = await tornRes.json();
    const membersList = [];

    for (const id of Object.keys(tornData.members)) {
      const m = tornData.members[id];
      let spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });

      if (forceUpdate || !spy) {
        const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`);
        const tsData = await tsRes.json();
        if (tsData.status && tsData.spy) {
          spy = { total: tsData.spy.total, strength: tsData.spy.strength, defense: tsData.spy.defense, speed: tsData.spy.speed, dexterity: tsData.spy.dexterity };
          await env.ROTATOR.put(`spy_${id}`, JSON.stringify(spy));
        }
      }

      membersList.push({
        id, name: m.name, level: m.level, status_desc: m.status.description,
        total: spy ? spy.total : 0
      });
    }

    return new Response(JSON.stringify({
      faction: { name: tornData.name },
      members: membersList
    }), { headers });
  }
};