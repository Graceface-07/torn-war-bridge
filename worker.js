// Inside your Cloudflare Worker fetch handler
async function handleRequest(request) {
  const { searchParams } = new URL(request.url);
  const factionId = searchParams.get('id');
  const apiKey = "YOUR_API_KEY"; // Ensure this is valid

  // 1. API Response Handling: Check for null/empty ID
  if (!factionId) return new Response(JSON.stringify({error: 'Missing ID'}), {status: 400});

  try {
    const url = `https://api.torn.com/faction/${factionId}?selections=basic&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // 2. Type-compatibility: Ensure members object exists before returning
    if (!data || data.error || !data.members) {
      return new Response(JSON.stringify({error: 'Invalid API response from Torn'}), {status: 500});
    }

    return new Response(JSON.stringify({torn: data}), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (e) {
    return new Response(JSON.stringify({error: e.message}), {status: 500});
  }
}