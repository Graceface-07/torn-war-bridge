export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" };
    const YATA_KEY = 'CZP2D2ZnbXWsYiDT';

    try {
      const factionId = url.searchParams.get("id");
      if (!factionId) return new Response(JSON.stringify({ error: "Missing Faction ID" }), { status: 400, headers });

      // 1. Get the current Faction members from Torn
      const tornRes = await fetch(`https://api.torn.com/faction/${factionId}?selections=basic&key=${env.TORN_KEY}`);
      const tornData = await tornRes.json();
      
      // 2. Fetch the massive YATA list (One big pull is allowed)
      const yataRes = await fetch(`https://yata.yt/api/v1/spies/?key=${YATA_KEY}`);
      const yataData = await yataRes.json();

      const membersList = [];
      const memberIds = Object.keys(tornData.members);

      // 3. Match faction members against the 14,712 spies
      for (const id of memberIds) {
        const m = tornData.members[id];
        const spy = yataData.spies?.[id] || null;

        // Auto-save found spies to your KV Vault for faster future access (up to 50 per load)
        if (spy && memberIds.indexOf(id) < 50) {
          await env.ROTATOR.put(`spy_${id}`, JSON.stringify(spy));
        }

        membersList.push({
          id,
          name: m.name,
          level: m.level,
          status: m.status.description,
          total: spy ? spy.total : 0,
          strength: spy ? spy.strength : 0,
          defense: spy ? spy.defense : 0,
          speed: spy ? spy.speed : 0,
          dexterity: spy ? spy.dexterity : 0
        });
      }

      return new Response(JSON.stringify({ 
        faction: tornData.name, 
        member_count: memberIds.length,
        members: membersList 
      }), { headers });

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }
};