// --- GET: ?check=ID ---
if (url.pathname === "/" && url.searchParams.has("check")) {
  const id = url.searchParams.get("check");
  const key = "spy_" + id;   // <-- FIX

  try {
    const raw = await env.ROTATER.get(key);
    if (!raw) {
      return new Response(JSON.stringify({
        strength: 0,
        defense: 0,
        speed: 0,
        dexterity: 0,
        total: 0
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    return new Response(raw, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      strength: 0,
      defense: 0,
      speed: 0,
      dexterity: 0,
      total: 0
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
}
