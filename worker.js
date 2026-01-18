/* =========================================================
   CLOUDFLARE WORKER — FULL UPDATED SCRIPT
   Features included:
   - KV spy ingest (daily, <=1000 writes)
   - Scoring with FF-only / KV-only / Both
   - Top 3 recommendation
   - Hit decay (anti-dogpile)
   - Cooldown awareness
   - Hospital timer awareness
   - Faction vs faction balancing
========================================================= */

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

      /* ---------- SPY CHECK ---------- */
      if (url.searchParams.has("check")) {
        const spy = await env.ROTATOR.get(`spy_${url.searchParams.get("check")}`, { type: "json" });
        return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
      }

      /* ---------- DAILY INGEST ---------- */
      if (request.method === "POST" && url.pathname === "/ingest") {
        const body = await request.json();
        const now = Date.now();

        await Promise.all(
          body.spies.map(s =>
            env.ROTATOR.put(
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
            )
          )
        );

        return new Response(JSON.stringify({ success: true, count: body.spies.length }), { headers });
      }

      /* ---------- MATCH + SCORE ---------- */
      if (request.method === "POST" && url.pathname === "/match") {
        const body = await request.json();
        const { attacker, targets, faction_context } = body;

        const now = Date.now();
        const scored = [];

        for (const t of targets) {
          const spy = await env.ROTATOR.get(`spy_${t.player_id}`, { type: "json" });

          let score = 0;
          let components = {};

          /* --- KV SPY --- */
          if (spy?.total && attacker.total) {
            const ratio = attacker.total / spy.total;
            components.spy_ratio = ratio;
            score += ratio * 60;
          }

          /* --- FF DATA --- */
          if (t.ff?.ff && t.ff?.respect) {
            const ffScore = 1 / t.ff.ff;
            const respectWeight = Math.log10(t.ff.respect + 1);
            components.ff = ffScore;
            score += (ffScore * 30) + (respectWeight * 10);
          }

          /* --- HIT DECAY (DOGPILE PREVENTION) --- */
          if (t.last_hit) {
            const minutesAgo = (now - t.last_hit) / 60000;
            if (minutesAgo < 30) score *= 0.4;
            else if (minutesAgo < 60) score *= 0.7;
          }

          /* --- COOLDOWN AWARENESS --- */
          if (t.cooldown_active === true) score *= 0.25;

          /* --- HOSPITAL TIMER --- */
          if (t.hospital_until && t.hospital_until > now) continue;

          /* --- FACTION BALANCING --- */
          if (faction_context) {
            const load = faction_context.current_hits[t.player_id] || 0;
            score *= 1 / (1 + load);
          }

          if (score <= 0) continue;

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

        return new Response(JSON.stringify({
          best_target: scored[0] || null,
          top_3_targets: scored.slice(0, 3),
          ranked_targets: scored.slice(0, 25)
        }), { headers });
      }

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { headers });
    }

    return new Response(JSON.stringify({ status: "ROTATOR_ONLINE" }), { headers });
  }
};
