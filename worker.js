export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const { searchParams } = url;

    // ---------------------------------------------------------
    // CONFIG
    // ---------------------------------------------------------

    const TORN_KEYS = [
      "gc43XVxOpCcwLnY6","rKP5EwA6DmSufqEm","8YgzsJntLW3yTboP",
      "fiwzsFpv7BuGuTH3","3grddfsZEZsTlWBp","RQmyHvIAIuJ2iCZX",
      "rwLgZTyqgWDxhoCx","CZP2D2ZnbXWsYiDT","5zgirNZtPxRdeFFL",
      "C9cgPgQFpGzA6n32","sUMyDEhMUi3kNgY7","UO429efUvPIQW5Zq"
    ];

    const TS_KEY = env.API_KEY;
    const KV = env.ROTATOR;

    const WEBHOOK_URL =
      "https://script.google.com/macros/s/AKfycbzGbzT36ppGFG3bkNBeYYkd0lrO73Jk-wySf5hdiNoHlHy0XBY_0SPbpJCfYcSNwYPUDg/exec?key=REPLACE_ME";

    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    };

    if (request.method === "OPTIONS")
      return new Response(null, { headers });

    // ---------------------------------------------------------
    // KEY ROTATION
    // ---------------------------------------------------------

    async function getIndex() {
      const v = await KV.get("idx");
      const i = v ? parseInt(v, 10) : 0;
      return Number.isNaN(i) ? 0 : i;
    }

    async function setIndex(i) {
      await KV.put("idx", String(i));
    }

    async function tryKey(key, factionId) {
      const r = await fetch(
        `https://api.torn.com/faction/${factionId}?selections=basic&key=${key}`
      );
      const s = r.status;
      const t = await r.text();

      if (s === 429) throw "RATE";
      if (!t || t.includes("<")) throw "BAD";
      let j;
      try { j = JSON.parse(t); } catch { throw "JSON"; }
      if (j.error) throw "ERR";
      return j;
    }

    async function fetchTorn(factionId) {
      const total = TORN_KEYS.length;
      let idx = await getIndex();
      if (idx < 0 || idx >= total) idx = 0;

      let last = null;

      for (let i = 0; i < total; i++) {
        const k = TORN_KEYS[(idx + i) % total];
        try {
          const d = await tryKey(k, factionId);
          await setIndex((idx + i) % total);
          return d;
        } catch (e) {
          last = e;
        }
      }

      throw last || "FAIL";
    }

    // ---------------------------------------------------------
    // TS FETCH
    // ---------------------------------------------------------

    async function fetchTS(factionId) {
      if (!TS_KEY) return { members: {} };
      try {
        const r = await fetch(
          `https://yata.yt/api/v1/faction/export/${factionId}/?key=${TS_KEY}`
        );
        const t = await r.text();
        if (!t || t.includes("<") || !t.trim().startsWith("{"))
          return { members: {} };
        return JSON.parse(t);
      } catch {
        return { members: {} };
      }
    }

    // ---------------------------------------------------------
    // SHEET WRITER
    // ---------------------------------------------------------

    async function sendToSheet(payload) {
      const r = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const t = await r.text();
      return { ok: r.ok, status: r.status, response: t };
    }

    // ---------------------------------------------------------
    // ITEM UNIVERSE (SCAFFOLD)
    // ---------------------------------------------------------

    const ITEM_UNIVERSE = {
      BUY: {},
      SELL: {},
      TRADE: {},
      UNKNOWN: {}
    };

    function classifyItem(name) {
      const n = name.toLowerCase();
      if (n.includes("ammo")) return "BUY";
      if (n.includes("vest")) return "BUY";
      if (n.includes("chain")) return "SELL";
      return "UNKNOWN";
    }

    // ---------------------------------------------------------
    // TRANSACTION PARSER (SCAFFOLD)
    // ---------------------------------------------------------

    function parseTransaction(body) {
      const ts = Date.now();
      const type = body.type || "UNKNOWN";
      const item = body.item || "UNKNOWN";
      const price = body.price || 0;
      const qty = body.qty || 1;
      const side = classifyItem(item);

      return {
        ts,
        type,
        item,
        price,
        qty,
        side
      };
    }

    // ---------------------------------------------------------
    // ROUTES
    // ---------------------------------------------------------

    // EVENT → SHEET
    if (path === "/event" && request.method === "POST") {
      const body = await request.json();
      const tx = parseTransaction(body);
      const r = await sendToSheet(tx);
      return new Response(JSON.stringify(r), { headers });
    }

    // TORN + TS MERGE
    if (path === "/torn") {
      const factionId = searchParams.get("id");
      if (!factionId)
        return new Response(JSON.stringify({ error: "NO_ID" }), { status: 400, headers });

      try {
        const torn = await fetchTorn(factionId);
        const ts = await fetchTS(factionId);
        return new Response(JSON.stringify({ torn, ts }), { headers });
      } catch (e) {
        return new Response(JSON.stringify({ error: "FAIL", details: e }), {
          status: 502,
          headers
        });
      }
    }

    // DEFAULT
    return new Response(JSON.stringify({ status: "OK" }), { headers });
  }
};
I