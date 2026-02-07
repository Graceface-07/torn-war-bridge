/**
 * TORN WAR BRIDGE + TACTICAL ADVISOR
 * FIXED: Removed external import for Dashboard compatibility
 * Ensure combatIntelligence is defined below or in the same script.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
      // FIX: Handle cases where pathname might not have leading slash or is empty
      const path = url.pathname === "/" ? "/advisor" : url.pathname;

      if (path === "/spy" && request.method === "GET") return await handleSpyList(env, corsHeaders);
      if (path === "/spy" && request.method === "POST") return await handleSpySave(request, env, corsHeaders);
      
      if (path === "/advisor" || path === "/") {
        return new Response(getAdvisorHTML(), {
          headers: { "Content-Type": "text/html;charset=UTF-8", ...corsHeaders }
        });
      }

      // API Routes
      if (path === "/api/analyze") return await handleAnalyze(request, env, corsHeaders);
      if (path === "/api/target") {
          const targetId = url.searchParams.get('id');
          const fid = url.searchParams.get('fid') || 'global';
          return await handleGetTarget(targetId, fid, env, corsHeaders);
      }

      return new Response(JSON.stringify({ error: 'Not Found', path: path }), { status: 404, headers: corsHeaders });
      
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Worker Error', message: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};

// --- SPY HANDLERS ---
async function handleSpyList(env, corsHeaders) {
  const list = await env.ROTATOR.list({ prefix: "spy_" });
  const results = {};
  for (const key of list.keys) {
    const data = await env.ROTATOR.get(key.name, { type: "json" });
    if (data) {
      const parts = key.name.split('_');
      const pid = parts[parts.length - 1]; 
      results[pid] = data;
    }
  }
  return new Response(JSON.stringify({ count: Object.keys(results).length, members: results }), { headers: corsHeaders });
}

async function handleSpySave(request, env, corsHeaders) {
  const body = await request.json();
  const targets = Array.isArray(body.spies) ? body.spies : [body];
  for (const t of targets) {
    const fid = t.fid || "global";
    const key = `spy_${fid}_${t.uid}`;
    await env.ROTATOR.put(key, JSON.stringify(t.data));
  }
  return new Response(JSON.stringify({ ok: true, count: targets.length }), { headers: corsHeaders });
}

// --- PLACEHOLDER FOR MISSING INTELLIGENCE ---
// If combatIntelligence is in a different file, you MUST use 'npx wrangler deploy'
// If you are pasting into the browser, paste the code from combat-intelligence.js here.

async function handleAnalyze(request, env, corsHeaders) {
    return new Response(JSON.stringify({ error: "Intelligence module not linked. Use Wrangler to deploy." }), { status: 500, headers: corsHeaders });
}

async function handleGetTarget(targetId, fid, env, corsHeaders) {
    const key = `spy_${fid}_${targetId}`;
    const data = await env.ROTATOR.get(key, { type: "json" });
    if (!data) return new Response(JSON.stringify({ error: 'Target not found' }), { status: 404, headers: corsHeaders });
    return new Response(JSON.stringify(data), { headers: corsHeaders });
}

function getAdvisorHTML() {
    return `<h1>Torn Tactical Advisor</h1><p>Worker is Live. Check /spy for data.</p>`;
}