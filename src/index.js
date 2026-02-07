/**
 * TORN WAR BRIDGE + TACTICAL ADVISOR
 * src/index.js
 */

import { combatIntelligence } from './combat-intelligence.js';

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
      if (url.pathname === "/spy" && request.method === "GET") return await handleSpyList(env, corsHeaders);
      if (url.pathname === "/spy" && request.method === "POST") return await handleSpySave(request, env, corsHeaders);
      
      if (url.pathname === "/" || url.pathname === "/advisor") {
        // This would import from your ui.js if you prefer, 
        // but kept here for route handling
        return new Response("HUD ACTIVE", { headers: corsHeaders });
      }

      if (url.pathname === "/api/analyze" && request.method === "POST") {
        const body = await request.json();
        const key = `spy_${body.fid || 'global'}_${body.targetId}`;
        const targetData = await env.ROTATOR.get(key, { type: "json" });
        const analysis = combatIntelligence.generateCombatRecommendation(body.userStats, targetData, { id: body.targetId });
        return new Response(JSON.stringify(analysis), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};

async function handleSpyList(env, corsHeaders) {
  const list = await env.ROTATOR.list({ prefix: "spy_" });
  const results = {};
  for (const key of list.keys) {
    const data = await env.ROTATOR.get(key.name, { type: "json" });
    if (data) results[key.name.split('_').pop()] = data;
  }
  return new Response(JSON.stringify(results), { headers: corsHeaders });
}

async function handleSpySave(request, env, corsHeaders) {
  const body = await request.json();
  const targets = Array.isArray(body.spies) ? body.spies : [body];
  for (const t of targets) {
    await env.ROTATOR.put(`spy_${t.fid || "global"}_${t.uid}`, JSON.stringify(t.data));
  }
  return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
}