# 🚀 DEPLOYMENT INSTRUCTIONS
## Upgrading your torn-war-bridge to include Tactical Advisor

---

## WHAT YOU'RE DOING:

Adding the Tactical Advisor features to your existing `torn-war-bridge` worker WITHOUT breaking your spy data functionality.

---

## FILE STRUCTURE:

Your project should look like this:

```
torn-war-bridge/
├── worker.js                    ← Replace with enhanced-worker.js
├── combat-intelligence.js       ← NEW FILE (add this)
├── wrangler.jsonc              ← Keep as is (already configured)
└── package.json                ← Keep as is
```

---

## STEP-BY-STEP DEPLOYMENT:

### 1. BACKUP YOUR CURRENT WORKER

```bash
cp worker.js worker.js.backup
```

### 2. ADD THE NEW FILES

Copy these files into your project folder:

**A. Replace worker.js:**
```bash
# Copy enhanced-worker.js and rename it to worker.js
cp enhanced-worker.js worker.js
```

**B. Add combat-intelligence.js:**
```bash
# Copy combat-intelligence.js to your project root
cp combat-intelligence.js .
```

### 3. VERIFY YOUR FILES

You should now have:
- ✅ `worker.js` (the enhanced version)
- ✅ `combat-intelligence.js` (the intelligence engine)
- ✅ `wrangler.jsonc` (unchanged - already has your KV config)

### 4. TEST LOCALLY (OPTIONAL BUT RECOMMENDED)

```bash
wrangler dev
```

This starts a local server at `http://localhost:8787`

Test:
- Visit `http://localhost:8787/` → Should show Tactical Advisor UI
- Visit `http://localhost:8787/spy` → Should show your spy data (existing functionality)

Press `Ctrl+C` to stop when done testing.

### 5. DEPLOY TO PRODUCTION

```bash
wrangler deploy
```

That's it! Your worker is now live with both features.

---

## WHAT'S CHANGED:

### NEW ROUTES (Added):
- `GET /` → Tactical Advisor web interface
- `GET /advisor` → Same as above
- `POST /api/analyze` → Combat analysis
- `GET /api/target?id=X&fid=Y` → Get target from spy database
- `POST /api/xanax-timer` → War timer calculator
- `POST /api/loadout` → Weapon recommendations

### EXISTING ROUTES (Moved but still work):
- Your spy data is now at `/spy` instead of `/`
- `GET /spy` → List all spy data (same as old GET /)
- `POST /spy` → Save spy data (same as old POST /)

**IMPORTANT:** If you have scripts/tools calling your old endpoints (`GET /` or `POST /`), you need to update them to use `/spy` instead.

---

## HOW TO USE:

### Web Interface:
1. Visit: `https://torn-war-bridge.tmecf.workers.dev/`
2. Enter target ID and your stats
3. Click "Analyze Target"
4. Get intelligent recommendations!

### API Usage:

**Analyze a target:**
```bash
curl -X POST https://torn-war-bridge.tmecf.workers.dev/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "targetId": "123456",
    "fid": "global",
    "userStats": {
      "strength": 500000000,
      "defense": 480000000,
      "speed": 520000000,
      "dexterity": 500000000
    }
  }'
```

**Calculate Xanax timer:**
```bash
curl -X POST https://torn-war-bridge.tmecf.workers.dev/api/xanax-timer \
  -H "Content-Type: application/json" \
  -d '{
    "warStartTime": 1707336000000,
    "currentEnergy": 150
  }'
```

---

## ROLLBACK (If something goes wrong):

```bash
# Restore your old worker
cp worker.js.backup worker.js

# Redeploy
wrangler deploy
```

---

## VERIFY DEPLOYMENT:

After deploying, test these URLs:

1. **Tactical Advisor UI:**
   https://torn-war-bridge.tmecf.workers.dev/

2. **Spy Data (existing functionality):**
   https://torn-war-bridge.tmecf.workers.dev/spy

3. **Health Check:**
   https://torn-war-bridge.tmecf.workers.dev/health

All should work! ✅

---

## NOTES:

- Your ROTATOR KV namespace is already configured ✅
- No new KV namespaces needed ✅
- Spy data format unchanged ✅
- Combat intelligence uses your existing spy data ✅

---

## TROUBLESHOOTING:

**Error: "Cannot find module 'combat-intelligence.js'"**
→ Make sure `combat-intelligence.js` is in the same folder as `worker.js`

**Error: "ROTATOR is not defined"**
→ Check `wrangler.jsonc` has the KV binding (it should already)

**Spy data not working:**
→ Update your scripts to use `/spy` instead of `/`

**Need help?**
→ Run `wrangler tail` to see live logs
