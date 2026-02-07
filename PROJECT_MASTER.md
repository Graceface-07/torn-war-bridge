# TORN TACTICAL ADVISOR - Master Documentation
**Living Document - Always Up to Date**

**Last Updated:** 2026-02-07  
**Version:** 2.0.0  
**Status:** Fresh Build - Ready for Deployment

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [TODO List](#todo-list)
3. [Project Structure](#project-structure)
4. [API Reference](#api-reference)
5. [Architecture](#architecture)
6. [KV Storage Schema](#kv-storage-schema)
7. [Known Issues](#known-issues)
8. [Deployment Checklist](#deployment-checklist)
9. [Session History](#session-history)

---

## 🎯 PROJECT OVERVIEW

### What This Is:
An intelligent combat advisor for Torn City that combines:
- **Spy Database** - Track enemy stats and FF multipliers
- **Combat Intelligence** - Calculate win probability, recommend strategies
- **Educational System** - Teach players WHY recommendations work
- **War Tools** - Xanax timers, weapon loadouts, efficiency metrics

### Core Philosophy:
Not just "here's the data" - it's "here's what to do and WHY"

### Tech Stack:
- **Platform:** Cloudflare Workers (24/7, global, free tier)
- **Storage:** KV namespace (ROTATOR)
- **Language:** JavaScript (ES modules)
- **Deployment:** Wrangler CLI + GitHub (optional)

---

## ✅ TODO LIST

### PHASE 1: Core Setup ✅ COMPLETE
- [x] Clean project structure
- [x] Archive old files
- [x] Configure Wrangler
- [x] Set up KV namespace (ROTATOR: 7d26ddc573674ba19db3af3951322bf7)

### PHASE 2: Spy Database ✅ COMPLETE
- [x] GET /spy - List all spy data
- [x] POST /spy - Save spy data
- [x] Key format: `spy_{fid}_{uid}`
- [x] Support for global spies (fid="global")

### PHASE 3: Combat Intelligence 🔄 IN PROGRESS
- [x] Win probability calculator
- [x] Risk assessment (5 categories)
- [x] Weapon loadout recommendations (4 slots)
- [x] Xanax war timer
- [x] Educational reasoning for all recommendations
- [ ] Test with real Torn data
- [ ] Refine algorithms based on feedback

### PHASE 4: Web Interface 🔄 IN PROGRESS
- [x] Basic HTML UI
- [x] Target analysis form
- [x] Xanax timer calculator
- [ ] Advanced UI with React (optional)
- [ ] Mobile optimization
- [ ] Add dark/light theme toggle

### PHASE 5: API Endpoints ✅ COMPLETE
- [x] POST /api/analyze - Combat analysis
- [x] GET /api/target - Get spy data
- [x] POST /api/xanax-timer - War timer
- [x] POST /api/loadout - Weapon recommendations
- [x] GET /health - Health check

### PHASE 6: Discord Integration ⏳ PENDING
- [ ] Create Discord bot application
- [ ] Implement slash commands
- [ ] Add Discord webhook handler
- [ ] Create embeds for results
- [ ] Test in Discord server

### PHASE 7: Advanced Features ⏳ PENDING
- [ ] Faction war intelligence
- [ ] Performance tracking
- [ ] Personalized challenges
- [ ] Battle history analysis
- [ ] Torn API integration (live data)

### PHASE 8: Production ⏳ PENDING
- [ ] Load testing
- [ ] Error monitoring
- [ ] Rate limiting
- [ ] Caching strategy
- [ ] User documentation

---

## 📁 PROJECT STRUCTURE

```
torn-war-bridge/
│
├── src/                              # Source code
│   ├── index.js                      # Main worker entry point
│   ├── combat-intelligence.js        # Combat algorithms & logic
│   └── ui.js                         # Web interface HTML
│
├── docs/                             # Documentation
│   ├── PROJECT_MASTER.md            # This file - master doc
│   ├── API_REFERENCE.md             # API endpoint details
│   └── DEPLOYMENT.md                # Deployment guide
│
├── archive_YYYYMMDD_HHMMSS/         # Archived old files
│   └── (old messy files)
│
├── wrangler.toml                     # Cloudflare config
├── package.json                      # Dependencies
├── .gitignore                        # Git ignore rules
└── README.md                         # Project README

```

### File Descriptions:

**src/index.js**
- Main worker entry point
- Routes all requests
- Handles CORS
- Error handling

**src/combat-intelligence.js**
- Win probability calculations
- Risk assessment logic
- Weapon recommendations
- Xanax timer calculations
- All combat algorithms

**src/ui.js**
- Embedded HTML for web interface
- Forms for user input
- Results display
- Mobile-friendly design

---

## 🔌 API REFERENCE

### Base URL
- **Production:** `https://torn-war-bridge.tmecf.workers.dev`
- **Local Dev:** `http://localhost:8787`

### Authentication
None required (consider adding API keys later for production)

### CORS
All endpoints support CORS with `Access-Control-Allow-Origin: *`

---

### 📊 Spy Database Endpoints

#### `GET /spy`
**List all spy data**

**Response:**
```json
{
  "count": 42,
  "members": {
    "123456": {
      "stats": { "strength": 500000000, "defense": 480000000, ... },
      "ff": 1.85,
      "respect": 450,
      "status": "online"
    },
    ...
  }
}
```

#### `POST /spy`
**Save spy data**

**Request:**
```json
{
  "spies": [
    {
      "fid": "12345",
      "uid": "67890",
      "data": {
        "stats": { ... },
        "ff": 1.85,
        "respect": 450
      }
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "count": 1
}
```

---

### 🎯 Tactical Advisor Endpoints

#### `POST /api/analyze`
**Analyze combat matchup**

**Request:**
```json
{
  "targetId": "123456",
  "fid": "global",
  "userStats": {
    "strength": 500000000,
    "defense": 480000000,
    "speed": 520000000,
    "dexterity": 500000000
  }
}
```

**Response:**
```json
{
  "verdict": {
    "action": "RECOMMENDED",
    "color": "#00ff9c",
    "confidence": "high"
  },
  "winProbability": {
    "probability": 0.85,
    "confidence": "high",
    "statRatio": 1.65,
    "reasoning": "You have a 65% stat advantage..."
  },
  "weaponLoadouts": {
    "loadouts": [
      {
        "slot": 1,
        "name": "PRIMARY",
        "weapon": "Rifle",
        "when": "Use as your go-to weapon",
        "why": "Their defense is weakest...",
        "priority": "high"
      },
      ...
    ],
    "quickTip": "Pre-configure these in your items...",
    "education": "Why multiple weapons? Different weapons..."
  },
  "riskAssessment": {
    "overall": "low",
    "categories": [...],
    "warnings": [],
    "opportunities": []
  }
}
```

#### `GET /api/target?id=123456&fid=global`
**Get target spy data**

**Response:**
```json
{
  "stats": { ... },
  "ff": 1.85,
  "respect": 450,
  "status": "online"
}
```

#### `POST /api/xanax-timer`
**Calculate Xanax timing for war**

**Request:**
```json
{
  "warStartTime": 1707336000000,
  "currentEnergy": 150
}
```

**Response:**
```json
{
  "warStartTime": "2026-02-07T20:00:00.000Z",
  "currentEnergy": 150,
  "targetEnergy": 1000,
  "energyNeeded": 850,
  "timeUntilWar": "3h 15m",
  "timeUntilXanax": "45m",
  "isReady": false,
  "advice": {
    "action": "💊 Take Xanax Soon",
    "detail": "You need 850 energy, which takes 4.2 hours..."
  }
}
```

#### `POST /api/loadout`
**Get weapon loadout recommendations**

**Request:**
```json
{
  "userStats": { ... },
  "targetStats": { ... }
}
```

**Response:**
```json
{
  "loadouts": [...],
  "quickTip": "...",
  "education": "..."
}
```

---

### 🔧 System Endpoints

#### `GET /health`
**Health check**

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-07T10:30:00.000Z",
  "version": "2.0.0",
  "features": ["spy-data", "tactical-advisor"]
}
```

#### `GET /` or `GET /advisor`
**Web interface (HTML)**

Returns the tactical advisor web UI

---

## 🏗️ ARCHITECTURE

### System Flow

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                          │
│              (Web / API / Discord)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Worker                           │
│           (torn-war-bridge.workers.dev)                  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routing    │  │  CORS        │  │  Error       │  │
│  │   Handler    │──│  Handler     │──│  Handler     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Request Router                           │  │
│  │  /spy → Spy Database Handler                     │  │
│  │  /api/* → Tactical Advisor Handlers              │  │
│  │  / → Web UI                                       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Combat       │ │ KV Storage   │ │ External APIs    │
│ Intelligence │ │ (ROTATOR)    │ │ (Future: Torn)   │
│              │ │              │ │                  │
│ - Win Calc   │ │ spy_*_*      │ │ - User stats     │
│ - Weapons    │ │ user_*       │ │ - Faction data   │
│ - Timer      │ │ analysis_*   │ │ - Battle logs    │
│ - Risk       │ │              │ │                  │
└──────────────┘ └──────────────┘ └──────────────────┘
```

### Component Responsibilities

**Main Worker (index.js):**
- Route incoming requests
- Handle CORS
- Manage errors
- Return responses

**Combat Intelligence (combat-intelligence.js):**
- Calculate win probability
- Assess risks
- Recommend weapons
- Calculate timers
- Generate educational explanations

**KV Storage (ROTATOR):**
- Store spy data
- Cache analysis results
- User preferences (future)

---

## 💾 KV STORAGE SCHEMA

### Namespace: ROTATOR
**ID:** `7d26ddc573674ba19db3af3951322bf7`

### Key Patterns:

#### Spy Data
**Pattern:** `spy_{fid}_{uid}`

**Example:** `spy_12345_67890`

**Value:**
```json
{
  "stats": {
    "strength": 500000000,
    "defense": 480000000,
    "speed": 520000000,
    "dexterity": 500000000
  },
  "ff": 1.85,
  "respect": 450,
  "status": "online",
  "lastUpdated": 1707307800000
}
```

#### User Preferences (Future)
**Pattern:** `user_{discord_id}`

**Example:** `user_discord_123456789`

**Value:**
```json
{
  "tornId": "123456",
  "stats": { ... },
  "factionId": "12345",
  "preferences": {
    "mode": "war",
    "autoAdvice": true
  }
}
```

#### Analysis Cache (Future)
**Pattern:** `analysis_{userId}_{targetId}`

**Expiration:** 24 hours

**Value:**
```json
{
  "verdict": { ... },
  "winProbability": { ... },
  "timestamp": 1707307800000
}
```

---

## ⚠️ KNOWN ISSUES

### Current Issues:
*None - fresh build!*

### Future Considerations:

**Rate Limiting:**
- [ ] Add rate limiting per IP
- [ ] Add rate limiting per user
- [ ] Implement backoff strategies

**Error Handling:**
- [ ] Better error messages
- [ ] Retry logic for KV failures
- [ ] Fallback responses

**Performance:**
- [ ] Cache frequently accessed spy data
- [ ] Optimize KV list operations
- [ ] Consider Durable Objects for real-time features

**Security:**
- [ ] Add API key authentication
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Implement CSRF protection

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment:
- [ ] All files in correct locations
- [ ] wrangler.toml configured with KV namespace
- [ ] package.json has all dependencies
- [ ] Code tested locally (`wrangler dev`)
- [ ] No console errors

### Deployment:
- [ ] Run `wrangler deploy`
- [ ] Verify deployment success
- [ ] Check worker URL works
- [ ] Test all endpoints

### Post-Deployment:
- [ ] Test web UI
- [ ] Test API endpoints
- [ ] Test spy data save/retrieve
- [ ] Monitor logs (`wrangler tail`)
- [ ] Check analytics in Cloudflare dashboard

### Ongoing Maintenance:
- [ ] Monitor error rates
- [ ] Check KV storage usage
- [ ] Review request counts
- [ ] Update documentation
- [ ] Gather user feedback

---

## 📚 SESSION HISTORY

### Session 2026-02-07 (This Session):
**Goals Achieved:**
- ✅ Built complete tactical advisor system
- ✅ Created combat intelligence engine
- ✅ Designed web interface
- ✅ Set up proper project structure
- ✅ Created comprehensive documentation
- ✅ Integrated with existing spy database
- ✅ Ready for deployment

**Files Created:**
- `src/index.js` - Main worker
- `src/combat-intelligence.js` - Intelligence engine
- `src/ui.js` - Web interface
- `docs/PROJECT_MASTER.md` - This file
- `docs/API_REFERENCE.md` - API documentation
- `docs/DEPLOYMENT.md` - Deployment guide
- `setup-fresh-project.sh` - Setup script

**Decisions Made:**
- Use existing ROTATOR KV namespace
- Move spy endpoints to `/spy` route
- Keep all code modular and clean
- Build educational features into every recommendation
- Archive old files instead of deleting

**Next Steps:**
1. Run setup script to organize files
2. Deploy to Cloudflare
3. Test all features
4. Gather user feedback
5. Iterate and improve

---

## 🎯 QUICK COMMANDS

```bash
# Setup
bash setup-fresh-project.sh

# Development
wrangler dev                    # Test locally
wrangler tail                   # View live logs

# Deployment
wrangler deploy                 # Deploy to production

# KV Operations
wrangler kv:key list --namespace-id=7d26ddc573674ba19db3af3951322bf7
wrangler kv:key get "spy_global_123456" --namespace-id=7d26ddc573674ba19db3af3951322bf7

# Monitoring
wrangler tail --format pretty   # Pretty logs
```

---

**END OF MASTER DOCUMENTATION**

*This document is continuously updated as the project evolves*
