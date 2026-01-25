if (request.method === "POST") {
  try {
    const body = await request.json();

    // Support both HUD direct push (single) and batch push (spies array)
    let targets = [];

    if (Array.isArray(body.spies)) {
      targets = body.spies; // [{ fid, uid, data }, ...]
    } else if (body.fid && body.uid && body.data) {
      targets = [body];     // single payload
    } else {
      return new Response(JSON.stringify({ error: "INVALID_PAYLOAD" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    for (const t of targets) {
      const key = `spy_${t.fid}_${t.uid}`;
      await env.INTEL.put(key, JSON.stringify(t.data));
    }

    return new Response(JSON.stringify({ ok: true, count: targets.length }), {
      headers: corsHeaders
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "BAD_JSON" }), {
      status: 400,
      headers: corsHeaders
    });
  }
}
