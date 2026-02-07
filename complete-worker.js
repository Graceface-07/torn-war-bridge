/**
 * TORN TACTICAL ADVISOR - Complete Single File
 * Everything in one place - no imports needed
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // SPY DATABASE ROUTES
      if (url.pathname === '/spy' && request.method === 'GET') {
        return await listSpyData(env, corsHeaders);
      }
      
      if (url.pathname === '/spy' && request.method === 'POST') {
        return await saveSpyData(request, env, corsHeaders);
      }
      
      // WEB UI
      if (url.pathname === '/' || url.pathname === '/advisor') {
        return new Response(getUI(), {
          headers: { 'Content-Type': 'text/html;charset=UTF-8', ...corsHeaders }
        });
      }
      
      // HEALTH CHECK
      if (url.pathname === '/health') {
        return jsonResponse({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }, corsHeaders);
      }
      
      // 404
      return jsonResponse({ error: 'Not Found' }, corsHeaders, 404);
      
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ 
        error: 'Server Error',
        message: error.message 
      }, corsHeaders, 500);
    }
  }
};

// ==========================================
// SPY DATABASE
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
// WEB UI
// ==========================================

function getUI() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Torn Tactical Advisor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0f 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 {
      font-size: 42px;
      text-align: center;
      background: linear-gradient(135deg, #ff2b2b, #ff9d00, #00d2ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 4px;
      margin-bottom: 40px;
      text-transform: uppercase;
    }
    .card {
      background: rgba(26, 26, 26, 0.8);
      border-radius: 16px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .card h2 { 
      color: #ff9d00; 
      font-size: 22px; 
      margin-bottom: 20px; 
    }
    button {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      padding: 14px 24px;
      border-radius: 8px;
      border: none;
      background: linear-gradient(135deg, #ff2b2b, #ff6b2b);
      color: #fff;
      cursor: pointer;
      font-weight: 600;
      letter-spacing: 1px;
      transition: all 0.3s ease;
      text-transform: uppercase;
    }
    button:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 6px 20px rgba(255, 43, 43, 0.4);
    }
    .status {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 255, 156, 0.2);
      border: 1px solid #00ff9c;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 600;
    }
    .result {
      margin-top: 20px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .success { color: #00ff9c; }
    .warning { color: #ff9d00; }
    .danger { color: #ff2b2b; }
    pre {
      white-space: pre-wrap;
      font-size: 12px;
      line-height: 1.6;
      margin-top: 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .stat-card {
      background: rgba(0, 0, 0, 0.3);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .stat-label {
      font-size: 11px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 28px;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="status">🟢 ONLINE</div>
  
  <div class="container">
    <h1>Tactical Advisor</h1>
    
    <div class="card">
      <h2>🎯 System Status</h2>
      <button onclick="checkHealth()">Check System Health</button>
      <div id="healthResult"></div>
    </div>
    
    <div class="card">
      <h2>📊 Spy Database</h2>
      <button onclick="checkSpyData()">View Spy Data</button>
      <div id="spyResult"></div>
    </div>
    
    <div class="card">
      <h2>ℹ️ About</h2>
      <p style="color: #aaa; line-height: 1.6;">
        <strong>Torn Tactical Advisor</strong> is your combat intelligence system.<br><br>
        ✅ Spy database for tracking enemy stats<br>
        ✅ Combat analysis and recommendations<br>
        ✅ War planning tools<br><br>
        <strong>Status:</strong> <span class="success">Operational</span>
      </p>
    </div>
  </div>

  <script>
    async function checkHealth() {
      try {
        const response = await fetch('/health');
        const data = await response.json();
        
        document.getElementById('healthResult').innerHTML = \`
          <div class="result">
            <div class="grid">
              <div class="stat-card">
                <div class="stat-label">Status</div>
                <div class="stat-value success">\${data.status.toUpperCase()}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Version</div>
                <div class="stat-value warning">\${data.version}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">Timestamp</div>
                <div class="stat-value" style="font-size: 12px; color: #00d2ff;">\${new Date(data.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        \`;
      } catch (error) {
        document.getElementById('healthResult').innerHTML = 
          '<div class="result"><p class="danger">❌ Error: ' + error.message + '</p></div>';
      }
    }
    
    async function checkSpyData() {
      try {
        const response = await fetch('/spy');
        const data = await response.json();
        
        document.getElementById('spyResult').innerHTML = \`
          <div class="result">
            <div class="stat-card">
              <div class="stat-label">Total Spies</div>
              <div class="stat-value success">\${data.count}</div>
            </div>
            \${data.count > 0 ? '<pre>' + JSON.stringify(data.members, null, 2) + '</pre>' : '<p style="margin-top: 20px; color: #888;">No spy data yet. Use POST /spy to add data.</p>'}
          </div>
        \`;
      } catch (error) {
        document.getElementById('spyResult').innerHTML = 
          '<div class="result"><p class="danger">❌ Error: ' + error.message + '</p></div>';
      }
    }
  </script>
</body>
</html>`;
}

// ==========================================
// HELPER
// ==========================================

function jsonResponse(data, corsHeaders, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
