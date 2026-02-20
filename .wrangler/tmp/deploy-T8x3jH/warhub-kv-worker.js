var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// warhub-kv-worker.js
var CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};
var MAX_SNAPSHOTS = 60;
var warhub_kv_worker_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }
    const url = new URL(request.url);
    const path = url.pathname;
    const uid = url.searchParams.get("uid");
    if (path === "/ping") {
      return respond({ ok: true, ts: Date.now() });
    }
    if (!uid || !/^\d+$/.test(uid)) {
      return respond({ error: "Missing or invalid uid" }, 400);
    }
    const KEY = `uid:${uid}`;
    if (path === "/data" && request.method === "GET") {
      const raw = await env.WARHUB_DATA.get(KEY);
      if (!raw) {
        return respond(emptyProfile(uid));
      }
      return respond(JSON.parse(raw));
    }
    if (path === "/data" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return respond({ error: "Invalid JSON" }, 400);
      }
      body.uid = uid;
      body.lastSeen = (/* @__PURE__ */ new Date()).toISOString();
      if (Array.isArray(body.snapshots) && body.snapshots.length > MAX_SNAPSHOTS) {
        body.snapshots = body.snapshots.slice(-MAX_SNAPSHOTS);
      }
      await env.WARHUB_DATA.put(KEY, JSON.stringify(body));
      return respond({ ok: true, uid, saved: body.lastSeen });
    }
    if (path === "/snapshot" && request.method === "POST") {
      let snap;
      try {
        snap = await request.json();
      } catch {
        return respond({ error: "Invalid JSON" }, 400);
      }
      const raw = await env.WARHUB_DATA.get(KEY);
      const profile = raw ? JSON.parse(raw) : emptyProfile(uid);
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      snap.date = today;
      snap.ts = Date.now();
      profile.snapshots = profile.snapshots.filter((s) => s.date !== today);
      profile.snapshots.push(snap);
      if (profile.snapshots.length > MAX_SNAPSHOTS) {
        profile.snapshots = profile.snapshots.slice(-MAX_SNAPSHOTS);
      }
      profile.lastSeen = (/* @__PURE__ */ new Date()).toISOString();
      await env.WARHUB_DATA.put(KEY, JSON.stringify(profile));
      return respond({
        ok: true,
        date: today,
        totalSnapshots: profile.snapshots.length
      });
    }
    return respond({ error: "Not found" }, 404);
  }
};
function respond(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}
__name(respond, "respond");
function emptyProfile(uid) {
  return {
    uid,
    snapshots: [],
    // [{ date, ts, strength, defense, speed, dexterity, crimes, nerve }]
    dailyTasks: {},
    // { "YYYY-MM-DD": ["task_id", ...] }
    weeklyMilestones: {},
    // { "YYYY-WNN": { week1: bool, week2: bool, ... } }
    notes: "",
    lastSeen: null
  };
}
__name(emptyProfile, "emptyProfile");
export {
  warhub_kv_worker_default as default
};
//# sourceMappingURL=warhub-kv-worker.js.map
