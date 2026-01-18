export default {
  async fetch(request, env) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers });

    const url = new URL(request.url);

    try {

      /* -------------------------------------------------
         HEALTH / CHECK
      ------------------------------------------------- */
      if (url.searchParams.has("check")) {
        const spy = await env.ROTATOR.get(
          `spy_${url.searchParams.get("check")}`,
          { type: "json" }
        );
        return new Response(
          JSON.stringify(spy || { error: "NOT_FOUND" }),
          { headers }
        );
      }

      /* -------------------------------------------------
         DAILY SPY INGEST (KV WRITES)
         Source: Master_HUD spreadsheet
      ------------------------------------------------- */
      if (request.method === "POST" && url.pathname === "/ingest") {
        const body = await request.json();
        const now = Date.now();

        await Promise.all(
          body.spies.map(s => {
            return env.ROTATOR.put(
              `spy_${s.player_id}`,
              JSON.stringify({
                name: s.name,
                total: s.total,
                strength: s.strength,
                defense: s.defense,
                speed: s.speed,
                dexterity: s.dexterity
              }),
              { metadata: { lastUpdated: now } }
            );
          })
        );

        return new Response(
          JSON.stringify({ success: true, count: body.spies.length }),
          { headers }
        );
      }

      /* -------------------------------------------------
         TARGET MATCHING & SCORING
      ------------------------------------------------- */
      if (request.method === "POST" && url.pathname === "/match") {
        const body = await request.json();
        const { attacker, targets } = body;

        const scored = [];

        for (const t of targets) {
          const spy = await env.ROTATOR.get(
            `spy_${t.player_id}`,
            { type: "json" }
          );

          let score = 0;
          let components = {};

          /* ---- KV SPY DATA ---- */
          if (spy && spy.total) {
            const statRatio = attacker.total / spy.total;
            components.spy_ratio = statRatio;
            score += statRatio * 60;
          }

          /* ---- FF SCOUTER DATA ---- */
          if (t.ff && t.ff.ff && t.ff.respect) {
            const ffScore = 1 / t.ff.ff;
            const respectWeight = Math.log10(t.ff.respect + 1);
            components.ff_score = ffScore;
            components.respect_weight = respectWeight;
            score += (ffScore * 30) + (respectWeight * 10);
          }

          /* ---- VALID TARGET CHECK ---- */
          if (Object.keys(components).length === 0) continue;

          scored.push({
            player_id: t.player_id,
            name: t.name,
            score: Number(score.toFixed(3)),
            components,
            spy: spy || null,
            ff: t.ff || null
          });
        }

        scored.sort((a, b) => b.score - a.score);

        return new Response(
          JSON.stringify({
            best_target: scored[0] || null,
            top_3_targets: scored.slice(0, 3),
            ranked_targets: scored.slice(0, 25)
          }),
          { headers }
        );
      }

    } catch (e) {
      return new Response(
        JSON.stringify({ error: e.message }),
        { headers }
      );
    }

    return new Response(
      JSON.stringify({ status: "ROTATOR_ONLINE" }),
      { headers }
    );
  }
};
