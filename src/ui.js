/**
 * Tactical Advisor Web UI
 */

export function getUI() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Torn Tactical Advisor</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: monospace;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a0f 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 {
      font-size: 48px;
      text-align: center;
      background: linear-gradient(135deg, #ff2b2b, #ff9d00, #00d2ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 4px;
      margin-bottom: 40px;
    }
    .card {
      background: rgba(26, 26, 26, 0.8);
      border-radius: 20px;
      padding: 30px;
      margin-bottom: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .card h2 { color: #ff9d00; font-size: 24px; margin-bottom: 20px; }
    input, button {
      font-family: monospace;
      font-size: 14px;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.4);
      color: #fff;
      width: 100%;
      margin-bottom: 15px;
    }
    button {
      background: linear-gradient(135deg, #ff2b2b, #ff6b2b);
      border: none;
      cursor: pointer;
      font-weight: 600;
    }
    button:hover { transform: translateY(-2px); }
    .success { color: #00ff9c; }
    .warning { color: #ff9d00; }
    .danger { color: #ff2b2b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>TACTICAL ADVISOR</h1>
    
    <div class="card">
      <h2>🎯 System Status</h2>
      <button onclick="checkHealth()">Check Health</button>
      <div id="health"></div>
    </div>
    
    <div class="card">
      <h2>📊 Spy Database</h2>
      <button onclick="checkSpy()">View Spy Data</button>
      <div id="spy"></div>
    </div>
  </div>

  <script>
    async function checkHealth() {
      const res = await fetch('/health');
      const data = await res.json();
      document.getElementById('health').innerHTML = '<p class="success">✅ ' + data.status + ' - v' + data.version + '</p>';
    }
    
    async function checkSpy() {
      const res = await fetch('/spy');
      const data = await res.json();
      document.getElementById('spy').innerHTML = '<p>Count: ' + data.count + '</p><pre>' + JSON.stringify(data.members, null, 2) + '</pre>';
    }
  </script>
</body>
</html>`;
}