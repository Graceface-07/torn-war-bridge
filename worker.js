/**
 * TO INSTALL DEPENDENCY: 
 * Run 'npm install tweetnacl' in your terminal before deploying.
 */
import nacl from 'tweetnacl';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. DISCORD HANDSHAKE & COMMANDS
    if (request.method === 'POST') {
      return await this.handleDiscord(request, env);
    }

    // 2. DASHBOARD & FILTERING LOGIC
    if (url.searchParams.has('id')) {
      const targetId = url.searchParams.get('id');
      const data = await this.getUnifiedData(targetId, env);
      
      return new Response(JSON.stringify(data), { 
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      });
    }

    return new Response("Bridge Online", { status: 200 });
  },

  async handleDiscord(request, env) {
    const signature = request.headers.get('X-Signature-Ed25519');
    const timestamp = request.headers.get('X-Signature-Timestamp');
    const body = await request.text();

    // Verify Security Handshake
    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(env.DISCORD_PUBLIC_KEY, 'hex')
    );

    if (!isVerified) return new Response('Invalid signature', { status: 401 });

    const interaction = JSON.parse(body);
    if (interaction.type === 1) return new Response(JSON.stringify({ type: 1 }), { headers: { "Content-Type": "application/json" } });

    // Handle /spy command from Discord
    if (interaction.type === 2 && interaction.data.name === 'spy') {
      const userId = interaction.data.options[0].value;
      const data = await this.getUnifiedData(userId, env, true); // true = single user mode

      return new Response(JSON.stringify({
        type: 4,
        data: { embeds: [this.createEmbed(data)] }
      }), { headers: { "Content-Type": "application/json" } });
    }
  },

  async getUnifiedData(id, env, isUser = false) {
    const tornUrl = isUser ? `https://api.torn.com/user/${id}?selections=profile&key=${env.API_KEY}` : `https://api.torn.com/faction/${id}?selections=basic&key=${env.API_KEY}`;
    const tsUrl = isUser ? `https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}` : `https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/faction/${id}`;

    const [tornRes, tsRes] = await Promise.all([
      fetch(tornUrl).then(r => r.json()),
      fetch(tsUrl).then(r => r.json())
    ]);

    // Format stats to prevent "Hidden" errors
    const statsMap = {};
    const tsData = isUser ? { [id]: tsRes.spy } : (tsRes.faction?.members || {});
    
    Object.keys(tsData).forEach(uid => {
      if (tsData[uid]) {
        statsMap[uid] = {
          total: tsData[uid].total || 0,
          dexterity: tsData[uid].dexterity || 0,
          defense: tsData[uid].defense || 0,
          strength: tsData[uid].strength || 0,
          speed: tsData[uid].speed || 0
        };
      }
    });

    return { torn: tornRes, stats: statsMap, single: isUser ? { name: tornRes.name, id: id, status: tornRes.status?.description, state: tornRes.status?.state, stats: statsMap[id] } : null };
  },

  createEmbed(data) {
    const s = data.single;
    const total = s.stats?.total || 0;
    let advice = "No spy data. Use caution.";
    if (total > 0) {
      if (s.stats.dexterity > total * 0.35) advice = "DEX TANK: Use Tear Gas.";
      else if (s.stats.defense > total * 0.35) advice = "TURTLE: Use Piercing Ammo.";
      else advice = "Balanced Build.";
    }

    return {
      title: `Spy Report: ${s.name} [${s.id}]`,
      color: s.state === 'Okay' ? 0x00ff00 : (s.state === 'Abroad' ? 0x3a86ff : 0xff4444),
      fields: [
        { name: "Total Stats", value: total > 0 ? (total / 1000000).toFixed(1) + "M" : "HIDDEN", inline: true },
        { name: "Status", value: s.status || "Unknown" }
      ],
      footer: { text: "Tactical Advice: " + advice }
    };
  }
};