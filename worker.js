export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const forceUpdate = url.searchParams.get("update") === "true"; 
    const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

    if (!idParam) return new Response("No ID", { status: 400 });

    const ids = idParam.split(",");
    const results = [];

    for (let id of ids) {
      id = id.trim();
      let stored = await env.ROTATOR.get(`spy_${id}`, { type: "json" });

      // If we have it and didn't click "Update", return local data
      if (stored && !forceUpdate) {
        results.push({ ...stored, cached: true });
      } 
      // If we don't have it OR we clicked the manual button
      else if (forceUpdate) {
        const tsData = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`).then(r => r.json());
        if (tsData.spy) {
          const newSpy = {
            id,
            name: tsData.spy.player_name,
            total: tsData.spy.total,
            strength: tsData.spy.strength,
            defense: tsData.spy.defense,
            speed: tsData.spy.speed,
            dexterity: tsData.spy.dexterity,
            last_updated: new Date().toISOString()
          };
          await env.ROTATOR.put(`spy_${id}`, JSON.stringify(newSpy));
          results.push({ ...newSpy, cached: false });
        } else {
          results.push({ id, status: "No Spy Found", cached: false });
        }
      } else {
        results.push({ id, status: "Not in Vault", cached: false });
      }
    }
    return new Response(JSON.stringify(results), { headers });
  }
};