/**
 * TORN WAR BRIDGE // MAIN WORKER
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
      // API: ANALYZE TARGET
      if (url.pathname === "/api/analyze" && request.method === "POST") {
        const body = await request.json();
        const { userStats, targetId, fid = 'global' } = body;
        
        // Fetch from KV using the Rotator Namespace
        const targetData = await env.ROTATOR.get(`spy_${fid}_${targetId}`, { type: "json" });
        
        if (!targetData) {
          return new Response(JSON.stringify({ error: "Target Not Found in KV" }), { status: 404, headers: corsHeaders });
        }

        const analysis = combatIntelligence.generateCombatRecommendation(userStats, targetData, { id: targetId });
        return new Response(JSON.stringify(analysis), { headers: corsHeaders });
      }

      // API: SAVE SPY DATA
      if (url.pathname === "/spy" && request.method === "POST") {
        const body = await request.json();
        const targets = Array.isArray(body.spies) ? body.spies : [body];
        for (const t of targets) {
          await env.ROTATOR.put(`spy_${t.fid || "global"}_${t.uid}`, JSON.stringify(t.data));
        }
        return new Response(JSON.stringify({ ok: true, count: targets.length }), { headers: corsHeaders });
      }

      // API: XANAX TIMER
      if (url.pathname === "/api/xanax-timer" && request.method === "POST") {
        const body = await request.json();
        const timerData = combatIntelligence.calculateXanaxTimer(body.warStartTime, body.currentEnergy);
        return new Response(JSON.stringify(timerData), { headers: corsHeaders });
      }

      return new Response(JSON.stringify({ status: "Tactical HUD Online" }), { headers: corsHeaders });
      
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
    }
  }
};