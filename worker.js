export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. HANDLE CORS PREFLIGHT (Mandatory for Dashboard)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Signature-Ed25519, X-Signature-Timestamp",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. DISCORD INTERACTION HANDLER
    if (request.method === 'POST' && url.pathname === '/interactions') {
      const signature = request.headers.get('X-Signature-Ed25519');
      const timestamp = request.headers.get('X-Signature-Timestamp');
      const body = await request.text();

      const isVerified = await this.verifyDiscordRequest(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
      if (!isVerified) return new Response('Invalid signature', { status: 401 });

      const interaction = JSON.parse(body);
      if (interaction.type === 1) {
        return new Response(JSON.stringify({ type: 1 }), { headers: { "Content-Type": "application/json" } });
      }

      if (interaction.type === 2 && interaction.data.name === 'spy') {
        const id = interaction.data.options[0].value;
        const data = await this.getTornStats(id, env);
        return new Response(JSON.stringify({
          type: 4,
          data: { embeds: [this.createSpyEmbed(data)] }
        }), { headers: { "Content-Type": "application/json" } });
      }
    }

    // 3. DASHBOARD DATA HANDLER (GET)
    if (url.searchParams.has('id')) {
      const data = await this.getTornStats(url.searchParams.get('id'), env);
      return new Response(JSON.stringify(data), { 
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": "*" // This fixes the CORS error
        } 
      });
    }

    return new Response("Bridge Online", { status: 200 });
  },

  async verifyDiscordRequest(body, signature, timestamp, publicKey) {
    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw', 
        new Uint8Array(publicKey.match(/.{1,2}/g).map(val => parseInt(val, 16))), 
        { name: 'NODE-ED25519', namedCurve: 'ED25519' }, 
        false, 
        ['verify']
      );
      return await crypto.subtle.verify(
        'NODE-ED25519',
        key,
        new Uint8Array(signature.match(/.{1,2}/g).map(val => parseInt(val, 16))),
        encoder.encode(timestamp + body)
      );
    } catch (e) {
      return false;
    }
  },

  async getTornStats(id, env) {
    const tsUrl = `https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`;
    const tornUrl = `https://api.torn.com/user/${id}?selections=profile&key=${env.API_KEY}`;
    const [tsRes, tornRes] = await Promise.all([
      fetch(tsUrl).then(r => r.json()),
      fetch(tornUrl).then(r => r.json())
    ]);
    const stats = tsRes.spy || { total: 0 };
    return { name: tornRes.name, id, total: stats.total, status: tornRes.status?.description || "Unknown" };
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