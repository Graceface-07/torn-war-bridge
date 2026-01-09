import nacl from 'tweetnacl';

export default {
  async fetch(request, env) {
    // 1. Check for Discord's mandatory security headers
    const signature = request.headers.get('X-Signature-Ed25519');
    const timestamp = request.headers.get('X-Signature-Timestamp');
    
    // 2. If it's a normal dashboard request, ignore the security check
    if (!signature || !timestamp) {
      return new Response("Worker Online", { status: 200 });
    }

    try {
      const body = await request.text();
      
      // 3. Cryptographic Handshake
      const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(env.DISCORD_PUBLIC_KEY, 'hex')
      );

      if (!isVerified) return new Response('Invalid signature', { status: 401 });

      const interaction = JSON.parse(body);

      // 4. Respond to Discord's PING (Type 1) - THIS FIXES THE VALIDATION ERROR
      if (interaction.type === 1) {
        return new Response(JSON.stringify({ type: 1 }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Handle commands here later
      return new Response(JSON.stringify({ type: 4, data: { content: "Acknowledged" } }));

    } catch (e) {
      return new Response("Error: " + e.message, { status: 500 });
    }
  }
};