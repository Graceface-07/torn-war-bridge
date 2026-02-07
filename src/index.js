/**
 * TORN TACTICAL ADVISOR - Main Worker
 * Combines spy database and combat intelligence
 */

import { combatIntelligence } from './combat-intelligence.js';
import { getUI } from './ui.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // ==========================================
      // SPY DATABASE ROUTES
      // ==========================================
      
      if (url.pathname === '/spy' && request.method === 'GET') {
        return await listSpyData(env, corsHeaders);
      }
      
      if (url.pathname === '/spy' && request.method === 'POST') {
        return await saveSpyData(request, env, corsHeaders);
      }
      
      // ==========================================
      // TACTICAL ADVISOR ROUTES
      // ==========================================
      
      if (url.pathname === '/' || url.pathname === '/advisor') {
        return new Response(getUI(), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8', ...corsHeaders }
        });
      }
      
      if (url.pathname === '/api/analyze' && request.method === 'POST') {
        return await analyzeTarget(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/target' && request.method === 'GET') {
        const id = url.searchParams.get('id');
        const fid = url.searchParams.get('fid') || 'global';
        return await getTarget(id, fid, env, corsHeaders);
      }
      
      if (url.pathname === '/api/xanax-timer' && request.method === 'POST') {
        return await calculateXanaxTimer(request, env, corsHeaders);
      }
      
      if (url.pathname === '/api/loadout' && request.method === 'POST') {
        return await getLoadout(request, env, corsHeaders);
      }
      
      if (url.pathname === '/health') {
        return jsonResponse({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          features: ['spy-data', 'tactical-advisor']
        }, corsHeaders);
      }
      
      // 404
      return jsonResponse({ error: 'Not Found' }, corsHeaders, 404);
      
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse({ 
        error: 'Internal Server Error',
        message: error.message 
      }, corsHeaders, 500);
    }
  }
};

// ==========================================
// SPY DATABASE HANDLERS
// ==========================================

async function listSpyData(env, corsHeaders) {
  const list = await env.ROTATOR.list({ prefix: 'spy_' });
  const results = {};
  
  for (const key of list.keys) {
    const data = await env.ROTATOR.get(key.name, { type: 'json' });
    if (data) {
      const pid = key.name.split('_').pop(); 
      results[pid] = data;
    }
  }
  
  return jsonResponse({ 
    count: Object.keys(results).length, 
    members: results 
  }, corsHeaders);
}

async function saveSpyData(request, env, corsHeaders) {
  const body = await request.json();
  const targets = Array.isArray(body.spies) ? body.spies : [body];

  for (const t of targets) {
    const folder = t.fid || 'global';
    const key = `spy_${folder}_${t.uid}`;
    await env.ROTATOR.put(key, JSON.stringify(t.data));
  }
  
  return jsonResponse({ ok: true, count: targets.length }, corsHeaders);
}

// ==========================================
// TACTICAL ADVISOR HANDLERS
// ==========================================

async function analyzeTarget(request, env, corsHeaders) {
  const { userStats, targetId, fid = 'global' } = await request.json();
  
  if (!userStats || !targetId) {
    return jsonResponse({ error: 'Missing userStats or targetId' }, corsHeaders, 400);
  }
  
  // Get target from spy database
  const key = `spy_${fid}_${targetId}`;
  const targetData = await env.ROTATOR.get(key, { type: 'json' });
  
  if (!targetData) {
    return jsonResponse({ error: 'Target not found in spy database' }, corsHeaders, 404);
  }
  
  // Analyze
  const analysis = combatIntelligence.generateCombatRecommendation(
    userStats,
    targetData.stats || targetData,
    {
      id: targetId,
      ffMultiplier: targetData.ff || targetData.fairfight || 1.0,
      respectValue: targetData.respect || 0,
      status: targetData.status || 'unknown'
    }
  );
  
  return jsonResponse(analysis, corsHeaders);
}

async function getTarget(id, fid, env, corsHeaders) {
  if (!id) {
    return jsonResponse({ error: 'Missing target ID' }, corsHeaders, 400);
  }
  
  const key = `spy_${fid}_${id}`;
  const data = await env.ROTATOR.get(key, { type: 'json' });
  
  if (!data) {
    return jsonResponse({ error: 'Target not found' }, corsHeaders, 404);
  }
  
  return jsonResponse(data, corsHeaders);
}

async function calculateXanaxTimer(request, env, corsHeaders) {
  const { warStartTime, currentEnergy = 150 } = await request.json();
  
  if (!warStartTime) {
    return jsonResponse({ error: 'Missing warStartTime' }, corsHeaders, 400);
  }
  
  const timer = combatIntelligence.calculateXanaxTimer(warStartTime, currentEnergy);
  return jsonResponse(timer, corsHeaders);
}

async function getLoadout(request, env, corsHeaders) {
  const { userStats, targetStats } = await request.json();
  
  if (!userStats || !targetStats) {
    return jsonResponse({ error: 'Missing userStats or targetStats' }, corsHeaders, 400);
  }
  
  const loadout = combatIntelligence.recommendWeaponLoadout(userStats, targetStats);
  return jsonResponse(loadout, corsHeaders);
}

// ==========================================
// HELPERS
// ==========================================

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
