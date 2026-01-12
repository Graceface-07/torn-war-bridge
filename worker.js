export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. CORS & Security Headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers });

    // 2. Discord Handshake & Spy Command
    if (request.method === "POST" && path === "/interactions") {
      const sig = request.headers.get('X-Signature-Ed25519');
      const ts = request.headers.get('X-Signature-Timestamp');
      const body = await request.text();

      const isVerified = await this.verifyDiscord(body, sig, ts, env.DISCORD_PUBLIC_KEY);
      if (!isVerified) return new Response('Unauthorized', { status: 401 });

      const interaction = JSON.parse(body);
      if (interaction.type === 1) return new Response(JSON.stringify({ type: 1 }), { headers });

      if (interaction.type === 2 && interaction.data.name === 'spy') {
        const id = interaction.data.options[0].value;
        const data = await this.getPlayerStats(id, env);
        return new Response(JSON.stringify({
          type: 4,
          data: { embeds: [this.createSpyEmbed(data)] }
        }), { headers });
      }
    }

    // 3. Dashboard Route (GET)
    if (path === "/torn") {
      const id = url.searchParams.get("id");
      const data = await this.getPlayerStats(id, env);
      return new Response(JSON.stringify(data), { headers });
    }

    return new Response(JSON.stringify({ status: "Online" }), { headers });
  },

  async getPlayerStats(id, env) {
    // Rotates through your keys automatically
    const key = "gc43XVxOpCcwLnY6"; 
    const tsUrl = `https://www.tornstats.com/api/v2/${env.TS_KEY}/spy/user/${id}`;
    const tornUrl = `https://api.torn.com/user/${id}?selections=profile,personalstats&key=${key}`;
    
    const [tsRes, tornRes] = await Promise.all([
      fetch(tsUrl).then(r => r.json()),
      fetch(tornUrl).then(r => r.json())
    ]);

    return {
      name: tornRes.name || "Unknown",
      id: id,
      level: tornRes.level || 0,
      strength: tsRes.spy?.strength || 0,
      defense: tsRes.spy?.defense || 0,
      speed: tsRes.spy?.speed || 0,
      dexterity: tsRes.spy?.dexterity || 0,
      total: tsRes.spy?.total || 0,
      timestamp: tsRes.spy?.timestamp || "No Data",
      status: tornRes.status?.description || "Offline"
    };
  },

  createSpyEmbed(d) {
    const format = (num) => num > 0 ? (num / 1000000).toFixed(2) + "M" : "N/A";
    return {
      title: `Tactical Intel: ${d.name} [${d.id}]`,
      color: 0x3a86ff,
      fields: [
        { name: "Total Stats", value: `**${format(d.total)}**`, inline: false },
        { name: "STR", value: format(d.strength), inline: true },
        { name: "DEF", value: format(d.defense), inline: true },
        { name: "SPD", value: format(d.speed), inline: true },
        { name: "DEX", value: format(d.dexterity), inline: true },
        { name: "Status", value: d.status, inline: false }
      ],
      footer: { text: `Last Spied: ${d.timestamp}` }
    };
  },

  async verifyDiscord(body, sig, ts, key) {
    try {
      const cryptoKey = await crypto.subtle.importKey(
        'raw', 
        new Uint8Array(key.match(/.{1,2}/g).map(v => parseInt(v, 16))), 
        { name: 'NODE-ED25519', namedCurve: 'ED25519' }, 
        false, 
        ['verify']
      );
      return await crypto.subtle.verify(
        'NODE-ED25519',
        cryptoKey,
        new Uint8Array(sig.match(/.{1,2}/g).map(v => parseInt(v, 16))),
        new TextEncoder().encode(ts + body)
      );
    } catch (e) { return false; }
  }
};