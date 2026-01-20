export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Ensure KV binding exists
    if (!env.ROTATOR) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "KV Binding 'ROTATOR' missing. Check Settings > Variables."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // -------------------------------
    // GET /check?uid=123  (existing)
    // -------------------------------
    if (request.method === "GET" && url.searchParams.has("check")) {
      const targetId = url.searchParams.get("check");
      const data = await env.ROTATOR.get(`spy_${targetId}`);
      return new Response(data || "{}", {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // -------------------------------
    // GET /stats?uid=123  (new)
    // -------------------------------
    if (request.method === "GET" && url.pathname === "/stats") {
      const uid = url.searchParams.get("uid");
      if (!uid) {
        return new Response("Missing uid", { status: 400 });
      }

      const data = await env.ROTATOR.get(`spy_${uid}`);
      return new Response(data || "{}", {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // -------------------------------
    // GET /faction?id=123  (new)
    // -------------------------------
    if (request.method === "GET" && url.pathname === "/faction") {
      const fid = url.searchParams.get("id");
      if (!fid) {
        return new Response("Missing faction id", { status: 400 });
      }

      const data = await env.ROTATOR.get(`faction_${fid}`);
      return new Response(data || "{}", {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // -----------------------------------------------------
    // GET /faction-search?query=xxx  (autocomplete)
    // -----------------------------------------------------
    if (request.method === "GET" && url.pathname === "/faction-search") {
      const query = url.searchParams.get("query")?.toLowerCase() || "";
      if (!query) {
        return new Response("[]", {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      let cursor = null;
      const results = [];

      do {
        const list = await env.ROTATOR.list({
          prefix: "faction_",
          cursor
        });

        cursor = list.cursor;

        for (const key of list.keys) {
          const raw = await env.ROTATOR.get(key.name);
          if (!raw) continue;

          const obj = JSON.parse(raw);

          const name = obj.name?.toLowerCase() || "";
          const tag = obj.tag?.toLowerCase() || "";
          const id = String(obj.id);

          if (
            name.includes(query) ||
            tag.includes(query) ||
            id.startsWith(query)
          ) {
            results.push({
              id: obj.id,
              name: obj.name,
              tag: obj.tag
            });
          }
        }
      } while (cursor);

      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // -------------------------------
    // POST (batch spy upload)
    // -------------------------------
    if (request.method === "POST") {
      try {
        const body = await request.json();

        if (!body.spies || !Array.isArray(body.spies)) {
          throw new Error("Malformed data: 'spies' array required.");
        }

        for (const spy of body.spies) {
          if (spy.player_id) {
            await env.ROTATOR.put(
              `spy_${spy.player_id}`,
              JSON.stringify(spy)
            );
          }
        }

        return new Response(
          JSON.stringify({ ok: true, count: body.spies.length }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ ok: false, error: e.message }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
      }
    }

    // -------------------------------
    // FALLBACK
    // -------------------------------
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
};
