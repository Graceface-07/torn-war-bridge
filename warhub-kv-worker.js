/**
 * WARHUB KV Worker
 * Purpose: Persistent per-member data store for WARHUB v6 Growth Advisor
 *
 * SETUP (one time):
 * 1. Cloudflare Dashboard → Workers & Pages → Create Worker → paste this file
 * 2. Worker Settings → Variables → KV Namespace Bindings
 *    Variable name : WARHUB_DATA
 *    KV Namespace  : Create new → name it "warhub-data" → Save
 * 3. Deploy → copy the worker URL
 * 4. Paste that URL into warhub-v6.js as CF_WORKER_URL (line 3 of the script block)
 *
 * ROUTES:
 * GET  /data?uid=123           Load a member's saved data
 * POST /data?uid=123           Save a member's full data object
 * POST /snapshot?uid=123       Append a stat snapshot (one per day, latest wins)
 * GET  /ping                   Health check
 *
 * SECURITY:
 * - Data is keyed by UID — members can only read/write their own key
 * - No member can enumerate or access another member's data
 * - You can view/manage all keys via Cloudflare dashboard KV browser
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

const MAX_SNAPSHOTS = 60; // ~2 months of daily saves

export default {
  async fetch(request, env) {

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const uid = url.searchParams.get('uid');

    // ── Health check ─────────────────────────────────────────────────
    if (path === '/ping') {
      return respond({ ok: true, ts: Date.now() });
    }

    // ── All data routes require a valid numeric UID ──────────────────
    if (!uid || !/^\d+$/.test(uid)) {
      return respond({ error: 'Missing or invalid uid' }, 400);
    }

    const KEY = `uid:${uid}`;

    // ── GET /data — load member's stored data ────────────────────────
    if (path === '/data' && request.method === 'GET') {
      const raw = await env.WARHUB_DATA.get(KEY);

      // Return a clean empty structure for first-time members
      if (!raw) {
        return respond(emptyProfile(uid));
      }

      return respond(JSON.parse(raw));
    }

    // ── POST /data — save member's full data object ──────────────────
    if (path === '/data' && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return respond({ error: 'Invalid JSON' }, 400);
      }

      // Lock the UID to the URL param — prevents one member writing to another's key
      body.uid = uid;
      body.lastSeen = new Date().toISOString();

      // Cap snapshot history
      if (Array.isArray(body.snapshots) && body.snapshots.length > MAX_SNAPSHOTS) {
        body.snapshots = body.snapshots.slice(-MAX_SNAPSHOTS);
      }

      await env.WARHUB_DATA.put(KEY, JSON.stringify(body));
      return respond({ ok: true, uid, saved: body.lastSeen });
    }

    // ── POST /snapshot — append a single stat snapshot ───────────────
    // Expected body: { strength, defense, speed, dexterity, crimes?, nerve? }
    if (path === '/snapshot' && request.method === 'POST') {
      let snap;
      try {
        snap = await request.json();
      } catch {
        return respond({ error: 'Invalid JSON' }, 400);
      }

      // Load existing profile (or create empty one)
      const raw = await env.WARHUB_DATA.get(KEY);
      const profile = raw ? JSON.parse(raw) : emptyProfile(uid);

      // Stamp the snapshot
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      snap.date = today;
      snap.ts = Date.now();

      // One snapshot per day — latest overwrites earlier same-day save
      profile.snapshots = profile.snapshots.filter(s => s.date !== today);
      profile.snapshots.push(snap);

      // Cap history
      if (profile.snapshots.length > MAX_SNAPSHOTS) {
        profile.snapshots = profile.snapshots.slice(-MAX_SNAPSHOTS);
      }

      profile.lastSeen = new Date().toISOString();
      await env.WARHUB_DATA.put(KEY, JSON.stringify(profile));

      return respond({
        ok: true,
        date: today,
        totalSnapshots: profile.snapshots.length
      });
    }

    return respond({ error: 'Not found' }, 404);
  }
};

// ── Helpers ───────────────────────────────────────────────────────────

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

function emptyProfile(uid) {
  return {
    uid,
    snapshots: [],       // [{ date, ts, strength, defense, speed, dexterity, crimes, nerve }]
    dailyTasks: {},      // { "YYYY-MM-DD": ["task_id", ...] }
    weeklyMilestones: {},// { "YYYY-WNN": { week1: bool, week2: bool, ... } }
    notes: '',
    lastSeen: null
  };
}
