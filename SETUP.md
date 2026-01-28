# 🚀 SETUP GUIDE - Torn War Bridge

## ⚡ Quick Setup (3 Steps)

### Step 1: Download/Clone the Code
If you haven't already, get the code on YOUR computer:
```bash
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start the Server
```bash
node server.js
```

You should see this:
```
╔════════════════════════════════════════╗
║   🎯 TORN WAR BRIDGE - SERVER RUNNING  ║
╚════════════════════════════════════════╝

✅ Server Status: ONLINE
🌐 URL: http://localhost:3000
📊 Health Check: http://localhost:3000/api/health
⏰ Started: [timestamp]

Ready to accept connections!
```

### Step 4: Open in Your Browser
Go to any of these URLs:
- **Main Dashboard**: http://localhost:3000
- **Status Check**: http://localhost:3000/status.html
- **Health API**: http://localhost:3000/api/health

---

## ✅ How to Verify It's Working

### Test 1: Check the Status Page
Open: http://localhost:3000/status.html

You should see:
- ✅ Green checkmark
- "Server is Running!"
- Server uptime information

### Test 2: Check the Terminal
The terminal where you ran `node server.js` should show:
```
✅ Server Status: ONLINE
🌐 URL: http://localhost:3000
```

### Test 3: Check the Dashboard
Open: http://localhost:3000

You should see the Torn War Bridge dashboard with:
- 🎯 Tactical Scanner heading
- Input fields for User ID and Faction ID
- Server Status showing "● ONLINE" in green

---

## ❌ Troubleshooting

### "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### "Port 3000 is already in use"
**Solution:** Edit `server.js` line 7:
```javascript
const port = 3001;  // Change to 3001 or any other port
```

### Server starts then immediately stops
**Solution:** Check if another program is using port 3000:
```bash
# On Windows:
netstat -ano | findstr :3000

# On Mac/Linux:
lsof -i :3000
```

### "I can't access localhost:3000"
**Make sure:**
1. You ran the commands ON YOUR COMPUTER (not in GitHub)
2. The terminal shows "Server Status: ONLINE"
3. You're using http:// not https://
4. The browser is on the same computer as the server

---

## 🎯 What Each URL Does

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Main dashboard - scan factions and analyze targets |
| http://localhost:3000/status.html | Server status checker - verify server is running |
| http://localhost:3000/api/health | JSON health check - for monitoring scripts |
| http://localhost:3000/war-analysis.html | War analysis page - view tactical reports |

---

## 🛑 How to Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

---

Need more help? Check the main README.md or open an issue on GitHub.
