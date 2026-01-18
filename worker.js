export default {
  async fetch(request, env) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(request.url);

    try {

      /* -------------------------------------------------
         EXISTING: CHECK SINGLE SPY (UNCHANGED)
      ------------------------------------------------- */
      if (url.searchParams.has("check")) {
        const id = url.searchParams.get("check");
        const spy = await env.ROTATOR.get(`spy_${id}`, { type: "json" });

        return new Response(JSON.stringify(spy || { error: "NOT_FOUND" }), { headers });
      }

      /* -------------------------------------------------
         EXISTING: INGEST SPIES (UNCHANGED)
      ------------------------------------------------- */
      if (request.method === "POST" && url.pathname === "/") {
        const body = await request.json();
        const now = Date.now();

        await Promise.all(
          (body.spies || []).map(s => {
            return env.ROTATOR.put(
              `spy_${s.player_id}`,
              JSON.stringify({
                name: s.name,
                strength: s.strength,
                defense: s.defense,
                speed: s.speed,
                dexterity: s.dexterity,
                total: s.total
              }),
              { metadata: { lastUpdated: now } }
            );
          })
        );

        return new Response(JSON.stringify({
          success: true,
          count: body.spies.length
        }), { headers });
      }

      /* -------------------------------------------------
         NEW: MATCH / SCORE ENGINE
         POST /match
      ------------------------------------------------- */
      if (request.method === "POST" && url.pathname === "/match") {
        const body = await request.json();

        const {
          mode,              // "pvf" | "fvf"
          attacker,          // { player_id, stats }
          faction_a,         // array of ids
          faction_b,         // optional array
          ff_data,           // ff scouter response indexed by target id
          war_context = {}   // weights / mode
        } = body;

        const now = Date.now();

        const respectWeight = war_context.respect_weight ?? 1.2;
        const mugWeight = war_context.mug_weight ?? 0.8;

        /* ---------- helper ---------- */
        const scoreTarget = (spy, ff, status) => {
          let score = 0;

          // Respect
          score += (ff.respect || 0) * respectWeight;

          // Mug value (optional)
          if (ff.mug_value) {
            score += ff.mug_value * mugWeight;
          }

          // FF banding
          if (ff.fair_fight >= 3.5 && ff.fair_fight <= 4.6) score += 50;
          else if (ff.fair_fight >= 3.0 && ff.fair_fight <= 5.2) score += 20;
          else score -= 100;

          // Status penalties
          if (status?.state === "Hospital") {
            const mins = Math.max(0, (status.until * 1000 - now) / 60000);
            score -= mins * 2;
          }
          if (status?.state === "Traveling") score -= 200;
          if (status?.state === "Jail") score -= 300;

          // Data age penalty
          if (spy._age_days > 90) score -= 300;
          else if (spy._age_days > 30) score -= 100;

          return Math.round(score * 10) / 10;
        };

        /* ---------- load spies ---------- */
        const loadSpy = async (id) => {
          const entry = await env.ROTATOR.get(`spy_${id}`, { type: "json", metadata: true });
          if (!entry?.value) return null;

          const ageDays = entry.metadata?.lastUpdated
            ? (now - entry.metadata.lastUpdated) / 86400000
            : 999;

          return {
            player_id: id,
            ...entry.value,
            _age_days: ageDays
          };
        };

        const targets = [];
        const ids = mode === "fvf"
          ? [...new Set([...faction_a, ...(faction_b || [])])]
          : faction_a;

        for (const id of ids) {
          const spy = await loadSpy(id);
          if (!spy) continue;

          const ff = ff_data?.[id];
          if (!ff) continue; // rely on FF scouter only if spy exists

          const score = scoreTarget(spy, ff, ff.status);

          targets.push({
            player_id: id,
            name: spy.name,
            total: spy.total,
            fair_fight: ff.fair_fight,
            respect: ff.respect,
            score
          });
        }

        /* ---------- sort ---------- */
        targets.sort((a, b) => b.score - a.score);

        /* ---------- FvF pairing ---------- */
        let pairings = null;
        if (mode === "fvf" && faction_b) {
          pairings = [];
          const available = [...targets];

          for (const atk of faction_a) {
            const match = available.shift();
            if (!match) break;
            pairings.push({ attacker: atk, target: match.player_id });
          }
        }

        return new Response(JSON.stringify({
          best_target: targets[0] || null,
          ranked_targets: targets.slice(0, 25),
          pairings
        }), { headers });
      }

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { headers });
    }

    return new Response(JSON.stringify({ status: "BRIDGE_ONLINE" }), { headers });
  }
};
