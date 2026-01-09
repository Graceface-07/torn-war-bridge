// index.js - The Unified Intelligence Worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- PART A: DASHBOARD & WEBHOOK LOGIC ---
    if (url.searchParams.has('id')) {
      const targetId = url.searchParams.get('id');
      const data = await this.getTornData(targetId, env);

      // If 'notify=true' is in the URL, push a report to your old webhook
      if (url.searchParams.get('notify') === 'true') {
        await this.sendToWebhook(data, env.OLD_WEBHOOK_URL);
      }

      return new Response(JSON.stringify(data), { 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      });
    }

    // --- PART B: DISCORD SLASH COMMANDS ---
    // Discord sends a "POST" to your Worker URL for every interaction
    if (request.method === 'POST') {
      const interaction = await request.json();

      // 1. Respond to Discord's Security "Ping"
      if (interaction.type === 1) {
        return new Response(JSON.stringify({ type: 1 }), { headers: { "Content-Type": "application/json" } });
      }

      // 2. Handle /spy [ID]
      if (interaction.type === 2 && interaction.data.name === 'spy') {
        const targetId = interaction.data.options[0].value;
        const data = await this.getTornData(targetId, env);

        return new Response(JSON.stringify({
          type: 4, // "ChannelMessageWithSource"
          data: {
            embeds: [this.createEmbed(data)]
          }
        }), { headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response("Intelligence System Online", { status: 200 });
  },

  async getTornData(id, env) {
    // Merged logic from your BOW OC and Torn Stats endpoints
    const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`).then(r => r.json());
    const tornRes = await fetch(`https://api.torn.com/user/${id}?selections=profile&key=${env.API_KEY}`).then(r => r.json());
    
    const stats = tsRes.spy || { total: 0 };
    return {
      id: id,
      name: tornRes.name,
      level: tornRes.level,
      status: tornRes.status.description,
      state: tornRes.status.state,
      total: stats.total,
      advice: this.getAdvice(stats)
    };
  },

  getAdvice(s) {
    if (s.total === 0) return "No Spy Found. Proceed with caution.";
    if (s.dexterity > s.total * 0.3) return "DEX TANK: Use Tear Gas.";
    return "Target confirmed. Standard combat boosters.";
  },

  createEmbed(data) {
    return {
      title: `Spy Report: ${data.name} [${data.id}]`,
      color: data.state === 'Okay' ? 0x00ff00 : 0x3a86ff, // Green if OK, Blue if Traveling
      fields: [
        { name: "Stats", value: data.total > 0 ? (data.total / 1000000).toFixed(1) + "M" : "HIDDEN", inline: true },
        { name: "Level", value: data.level.toString(), inline: true },
        { name: "Status", value: data.status }
      ],
      footer: { text: "Tactical Advice: " + data.advice }
    };
  },

  async sendToWebhook(data, url) {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [this.createEmbed(data)] })
    });
  }
};