const FF_SCOUTER_KEY = "rwLgZTyqgWDxhoCx";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const checkId = url.searchParams.get("check");

    if (!checkId) {
      return new Response(JSON.stringify({ error: "Missing check parameter" }), {
        headers: { "Content-Type": "application/json" },
        status: 400
      });
    }

    try {
      const ffRes = await fetch(
        "https://ffscouter.com/api/v1/get-stats?key=" +
          FF_SCOUTER_KEY +
          "&targets=" +
          checkId +
          "&user_id=0"
      );

      const ffData = await ffRes.json();

      if (!ffData || !ffData[0]) {
        return new Response(JSON.stringify({}), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const ff = ffData[0];

      return new Response(
        JSON.stringify({
          fair_fight: ff.fair_fight || 0,
          respect: ff.respect || 0,
          estimate: ff.estimate || "?",
          total: Math.round((ff.fair_fight || 1) * 1000),
          strength: 0,
          defense: 0,
          speed: 0,
          dexterity: 0
        }),
        {
          headers: { "Content-Type": "application/json" }
        }
      );
    } catch (e) {
      return new Response(JSON.stringify({ error: "Fetch failed" }), {
        headers: { "Content-Type": "application/json" },
        status: 500
      });
    }
  }
};
