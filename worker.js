import nacl from 'tweetnacl';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // FIX: Discord MUST hit this specific path
    if (request.method === 'POST' && url.pathname === '/interactions') {
      const signature = request.headers.get('X-Signature-Ed25519');
      const timestamp = request.headers.get('X-Signature-Timestamp');
      const body = await request.text();

      // Basic security check
      const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(env.DISCORD_PUBLIC_KEY, 'hex')
      );

      if (!isVerified) return new Response('Invalid signature', { status: 401 });

      const interaction = JSON.parse(body);
      
      // Respond to the PING (Type 1)
      if (interaction.type === 1) {
        return new Response(JSON.stringify({ type: 1 }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response("Bridge Online", { status: 200 });
  }
};