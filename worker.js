export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/interactions') {
      const signature = request.headers.get('X-Signature-Ed25519');
      const timestamp = request.headers.get('X-Signature-Timestamp');
      const body = await request.text();

      // 1. Zero-Dependency Verification (Native Crypto)
      const isVerified = await this.verifyDiscordRequest(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
      if (!isVerified) return new Response('Invalid signature', { status: 401 });

      const interaction = JSON.parse(body);

      // 2. Respond to Discord PING
      if (interaction.type === 1) {
        return new Response(JSON.stringify({ type: 1 }), { headers: { "Content-Type": "application/json" } });
      }

      // 3. Handle /spy Command
      if (interaction.type === 2 && interaction.data.name === 'spy') {
        const id = interaction.data.options[0].value;
        const data = await this.getTornStats(id, env);
        return new Response(JSON.stringify({
          type: 4,
          data: { embeds: [this.createSpyEmbed(data)] }
        }), { headers: { "Content-Type": "application/json" } });
      }
    }

    return new Response("Bridge Online", { status: 200 });
  },

  async verifyDiscordRequest(body, signature, timestamp, publicKey) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', 
      this.hexToUint8Array(publicKey), 
      { name: 'NODE-ED25519', namedCurve: 'ED25519' }, 
      false, 
      ['verify']
    );
    return await crypto.subtle.verify(
      'NODE-ED25519',
      key,
      this.hexToUint8Array(signature),
      encoder.encode(timestamp + body)
    );
  },

  hexToUint8Array(hex) {
    return new Uint8Array(hex.match(/.{1,2}/g).map(val => parseInt(val, 16)));
  },

  async getTornStats(id, env) {
    const tsUrl = `https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`;
    const tornUrl = `https://api.torn.com/user/${id}?selections=profile&key=${env.API_KEY}`;
    const [tsRes, tornRes] = await Promise.all([
      fetch(tsUrl).then(r => r.json()),
      fetch(tornUrl).then(r => r.json())
    ]);
    const stats = tsRes.spy || { total: 0 };
    return { name: tornRes.name, id, total: stats.total, status: tornRes.status.description };
  },

  createSpyEmbed(data) {
    return {
      title: `Spy Report: ${data.name} [${data.id}]`,
      color: 0x00ff00,
      fields: [
        { name: "Total Stats", value: data.total > 0 ? (data.total / 1000000).toFixed(1) + "M" : "HIDDEN", inline: true },
        { name: "Status", value: data.status }
      ]
    };
  }
};