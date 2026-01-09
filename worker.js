import nacl from 'tweetnacl';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Discord sends a security check to /interactions
    if (request.method === 'POST' && url.pathname === '/interactions') {
      try {
        const signature = request.headers.get('X-Signature-Ed25519');
        const timestamp = request.headers.get('X-Signature-Timestamp');
        const body = await request.text();

        // 1. Check if headers exist
        if (!signature || !timestamp) return new Response('Missing headers', { status: 401 });

        // 2. Perform the cryptographic handshake
        const isVerified = nacl.sign.detached.verify(
          Buffer.from(timestamp + body),
          Buffer.from(signature, 'hex'),
          Buffer.from(env.DISCORD_PUBLIC_KEY, 'hex')
        );

        if (!isVerified) return new Response('Invalid signature', { status: 401 });

        // 3. Respond to Discord PING
        const interaction = JSON.parse(body);
        if (interaction.type === 1) {
          return new Response(JSON.stringify({ type: 1 }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Handle actual commands here...
        return new Response(JSON.stringify({ type: 4, data: { content: "Processing..." } }));

      } catch (err) {
        return new Response(`Verification Error: ${err.message}`, { status: 500 });
      }
    }

    return new Response("Worker is running. Use /interactions for Discord.", { status: 200 });
  }
};