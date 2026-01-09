import nacl from 'tweetnacl';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. SECURITY HANDSHAKE (Required by Discord)
    if (request.method === 'POST') {
      const signature = request.headers.get('X-Signature-Ed25519');
      const timestamp = request.headers.get('X-Signature-Timestamp');
      const body = await request.text();

      // Verify the request is actually from Discord
      const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(env.DISCORD_PUBLIC_KEY, 'hex')
      );

      if (!isVerified) {
        return new Response('Invalid request signature', { status: 401 });
      }

      const interaction = JSON.parse(body);

      // Respond to Discord's PING (Type 1)
      if (interaction.type === 1) {
        return new Response(JSON.stringify({ type: 1 }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 2. HANDLE /SPY COMMAND (Type 2)
      if (interaction.type === 2 && interaction.data.name === 'spy') {
        const targetId = interaction.data.options[0].value;
        return await this.handleSpyCommand(targetId, env);
      }
    }

    // 3. DASHBOARD ACCESS (GET requests)
    if (url.searchParams.has('id')) {
      const data = await this.getTornData(url.searchParams.get('id'), env);
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response('System Online', { status: 200 });
  },

  async handleSpyCommand(id, env) {
    // Fetch logic reused from your dashboard
    const tsRes = await fetch(`https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`).then(r => r.json());
    const tornRes = await fetch(`https://api.torn.com/user/${id}?selections=profile&key=${env.API_KEY}`).then(r => r.json());

    const stats = tsRes.spy || { total: 0 };
    const color = tornRes.status.state === 'Okay' ? 0x00ff00 : 0x3a86ff;

    return new Response(JSON.stringify({
      type: 4,
      data: {
        embeds: [{
          title: `Spy Report: ${tornRes.name} [${id}]`,
          color: color,
          fields: [
            { name: 'Total Stats', value: stats.total > 0 ? (stats.total / 1000000).toFixed(1) + 'M' : 'HIDDEN', inline: true },
            { name: 'Status', value: tornRes.status.description }
          ],
          footer: { text: 'Tactical Intel System' }
        }]
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
};