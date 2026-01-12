export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const idParam = url.searchParams.get("id");
    const forceUpdate = url.searchParams.get("update") === "true";
    const headers = { 
      "Content-Type": "application/json", 
      "Access-Control-Allow-Origin": "*" 
    };

    if (!idParam) return new Response(JSON.stringify({ error: "No ID" }), { status: 400, headers });

    // 1. Get Basic Faction Data from Torn (Always fresh for Status/Roster)
    const tornRes = await fetch(`https://api.torn.com/faction/${idParam}?selections=basic&key=${env.TORN_KEY}`);
    const tornData = await tornRes.json();

    if (!tornData.members) {
      return new Response(JSON.stringify({ error: "Invalid Faction ID" }), { status: 404, headers });
    }

    const memberIds = Object.keys(tornData.members);
    const membersList = [];

    // 2. Iterate through members and check the Vault (KV)
    for (const id of memberIds) {
      const m = tornData.members[id];
      let spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });

      // 3. If "Manual Import" clicked OR not in Vault, fetch from Torn Stats
      if (forceUpdate || !spy) {
        try {
          const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`);
          const tsData = await tsRes.json();
          
          if (tsData.status && tsData.spy) {
            spy = {
              total: tsData.spy.total || 0,
              strength: tsData.spy.strength || 0,
              defense: tsData.spy.defense || 0,
              speed: tsData.spy.speed || 0,
              dexterity: tsData.spy.dexterity || 0
            };
            // Save to Local Vault
            await env.ROTATOR.put(`spy_${id}`, JSON.stringify(spy));
          }
        } catch (e) {
          console.error("TS API Error for " + id);
        }
      }

      // 4. Combine Torn Live Data with Vaulted Spy Data
      membersList.push({
        id: id,
        name: m.name,
        level: m.level,
        status_desc: m.status.description,
        total: spy ? spy.total : 0,
        strength: spy ? spy.strength : 0,
        defense: spy ? spy.defense : 0,
        speed: spy ? spy.speed : 0,
        dexterity: spy ? spy.dexterity : 0
      });
    }

    // 5. Final structure for the Dashboard
    const responsePayload = {
      faction: { name: tornData.name, tag: tornData.tag },
      members: membersList
    };

    return new Response(JSON.stringify(responsePayload), { headers });
  }
};