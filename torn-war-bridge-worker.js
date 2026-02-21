/**
 * WARHUB Cloudflare Worker — Member Data Store
 * Worker: torn-war-bridge.tmecf.workers.dev
 * KV Binding: ROTATOR
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

const MAX_SNAPSHOTS = 60;

export default {
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

    // GET /data — load member profile
    if (path === "/data" && request.method === "GET") {
      const raw = await env.ROTATOR.get(KEY);
      if (!raw) {
        return respond(emptyProfile(uid));
      }
      return respond(JSON.parse(raw));
    }

    // POST /data — save member profile
    if (path === "/data" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return respond({ error: "Invalid JSON" }, 400);
      }
      body.uid = uid;
      body.lastSeen = new Date().toISOString();
      if (Array.isArray(body.snapshots) && body.snapshots.length > MAX_SNAPSHOTS) {
        body.snapshots = body.snapshots.slice(-MAX_SNAPSHOTS);
      }
      await env.ROTATOR.put(KEY, JSON.stringify(body));
      return respond({ ok: true, uid, saved: body.lastSeen });
    }

    // POST /snapshot — append a stat snapshot
    if (path === "/snapshot" && request.method === "POST") {
      let snap;
      try {
        snap = await request.json();
      } catch {
        return respond({ error: "Invalid JSON" }, 400);
      }
      const raw = await env.ROTATOR.get(KEY);
      const profile = raw ? JSON.parse(raw) : emptyProfile(uid);
      const today = new Date().toISOString().split("T")[0];
      snap.date = today;
      snap.ts = Date.now();
      profile.snapshots = profile.snapshots.filter((s) => s.date !== today);
      profile.snapshots.push(snap);
      if (profile.snapshots.length > MAX_SNAPSHOTS) {
        profile.snapshots = profile.snapshots.slice(-MAX_SNAPSHOTS);
      }
      profile.lastSeen = new Date().toISOString();
      await env.ROTATOR.put(KEY, JSON.stringify(profile));
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

function emptyProfile(uid) {
  return {
    uid,
    snapshots: [],
    dailyTasks: {},
    weeklyMilestones: {},
    notes: "",
    lastSeen: null
  };
}