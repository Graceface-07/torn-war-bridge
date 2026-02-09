# TORN TACTICAL ADVISOR - Project Master Document

**Last Updated:** 2026-02-08  
**Status:** Phase 1 - Deployed Basic Version, Building Auto-Analysis  
**Version:** 0.2.0

---

## 🎯 PROJECT VISION

An intelligent combat advisor for Torn City that gives players **smart, actionable advice** - not just data dumps. Acts like an expert coach analyzing their performance, recommending optimal strategies, and helping them improve at PvP combat and faction wars.

### Core Philosophy:
- **"Here's what to do and WHY"** - not just "here's the data"
- **Setup Once, Use Forever** - Enter details once, system does the rest
- **Automatic Analysis** - System fetches data and analyzes ALL targets automatically
- **Smart predictions** for faction wars using FF Scouter data
- **Tactical recommendations** for each combat scenario
- **Performance coaching** that tracks improvement over time

---

## 🔄 CORRECT USER FLOW

### **Step 1: Initial Setup (Done Once)**
User provides:
- Their Torn User ID
- Their Faction ID

System automatically:
- Fetches user's battle stats from Torn API / FF Scouter
- Loads user's faction roster
- Calculates user's total stats (including buffs/perks)
- Saves this data for future use

### **Step 2: War Analysis (Automatic)**
When user wants war intel:
- System identifies active faction war
- Loads enemy faction roster (from war opponent)
- Cross-references each enemy with spy database
- For EACH enemy, automatically calculates:
  - Win probability (user's stats vs their stats)
  - FF multiplier impact
  - Weapon recommendations
  - Risk assessment
  - Respect value

### **Step 3: Target Prioritization (Automatic)**
System generates sorted target list:
- **Prime Targets** - High respect, good win chance
- **Safe Targets** - Easy wins, guaranteed respect
- **Risky Targets** - Possible but dangerous
- **Avoid Targets** - Don't attack (you'll lose)

### **Step 4: User Selection**
User clicks a target → sees:
- Detailed win probability analysis
- Weapon loadout recommendations (4 slots)
- Educational reasoning (WHY this works)
- Risk warnings
- Optimal timing advice

---

## 📋 CURRENT STATUS

### ✅ COMPLETED
- [x] Basic worker deployed to Cloudflare
- [x] Spy database working (GET/POST /spy)
- [x] Combat intelligence engine (win probability, weapons, xanax timer)
- [x] Basic web UI showing health and spy data
- [x] Manual target analysis (user enters stats each time)

### 🔄 IN PROGRESS
- [ ] User setup screen (enter Torn ID, Faction ID)
- [ ] Auto-fetch user stats from Torn API / FF Scouter
- [ ] Auto-load faction war opponent roster
- [ ] Auto-analyze ALL targets and generate prioritized list
- [ ] Target list UI with sorting/filtering

### ⏳ PENDING
- [ ] Torn API integration (requires API key management)
- [ ] FF Scouter integration (research needed)
- [ ] User data persistence (save setup in KV)
- [ ] Discord bot version
- [ ] Performance tracking over time

---

## 🔌 API INTEGRATIONS NEEDED

### 1. Torn Official API
**Purpose:** Fetch user stats and faction data
**Endpoint:** `https://api.torn.com/user/{id}?selections=battlestats&key={apikey}`
**Data Needed:**
- User's battle stats (strength, defense, speed, dexterity)
- User's faction ID
- Faction roster
- Current faction wars

**Implementation:**
- User provides their Torn API key during setup
- Store encrypted in KV
- Fetch on-demand when user logs in

### 2. FF Scouter (Research Needed)
**Purpose:** Get fair fight multipliers for targets
**Status:** Need to research if there's an API or if we scrape
**Data Needed:**
- FF multiplier for each potential target

### 3. Spy Database (Existing)
**Purpose:** Enemy stats intelligence
**Status:** ✅ Already working
**Format:** `spy_{fid}_{uid}` in KV

---

## 💾 DATA FLOW

```
User Setup
    ↓
[User enters Torn ID + Faction ID]
    ↓
[System calls Torn API]
    ↓
[Fetches user stats + faction roster]
    ↓
[Saves to KV: user_{tornId}]
    ↓
War Analysis Request
    ↓
[Load user data from KV]
    ↓
[Identify enemy faction from active war]
    ↓
[Load enemy roster from Torn API]
    ↓
[For each enemy:]
    ├─ Check spy database (spy_{fid}_{uid})
    ├─ Calculate win probability
    ├─ Assess risk
    └─ Recommend weapons
    ↓
[Sort targets: Prime → Safe → Risky → Avoid]
    ↓
[Display prioritized list to user]
```

---

## 🗂️ KV STORAGE SCHEMA

### User Data
**Key:** `user_{tornId}`
**Value:**
```json
{
  "tornId": "2864818",
  "factionId": "12345",
  "stats": {
    "strength": 500000000,
    "defense": 480000000,
    "speed": 520000000,
    "dexterity": 500000000
  },
  "totalStats": 2000000000,
  "apiKey": "encrypted_key_here",
  "lastUpdated": 1707307800000,
  "preferences": {
    "autoAnalyze": true,
    "mode": "war"
  }
}
```

### Spy Data (Existing)
**Key:** `spy_{fid}_{uid}`
**Value:**
```json
{
  "stats": {
    "strength": 180000000,
    "defense": 160000000,
    "speed": 190000000,
    "dexterity": 170000000
  },
  "ff": 2.1,
  "respect": 320,
  "status": "online",
  "lastUpdated": 1707307800000
}
```

### Analysis Cache
**Key:** `analysis_{userId}_{warId}_{timestamp}`
**Expiration:** 1 hour
**Value:**
```json
{
  "targets": [
    {
      "uid": "123456",
      "name": "EnemyPlayer",
      "verdict": "PRIME",
      "winProb": 0.85,
      "respect": 450,
      "weapon": "Rifle"
    }
  ],
  "totalPotentialRespect": 5000,
  "generatedAt": 1707307800000
}
```

---

## 🚀 NEXT IMMEDIATE STEPS

### Priority 1: User Setup Screen
1. Create login/setup modal
2. Input fields: Torn ID, Faction ID, API Key
3. "Save & Fetch Stats" button
4. Store in KV under `user_{tornId}`

### Priority 2: Torn API Integration
1. Research Torn API authentication
2. Implement safe API key storage (encryption)
3. Create function to fetch user stats
4. Create function to fetch faction roster
5. Error handling for API failures

### Priority 3: Auto-Analysis Engine
1. Load user data from KV
2. Identify active war (from Torn API)
3. Get enemy faction roster
4. For each enemy, run combat analysis
5. Sort and categorize targets
6. Cache results

### Priority 4: Target List UI
1. Display sorted target cards
2. Color-coded by category (Prime/Safe/Risky/Avoid)
3. Click to see detailed analysis
4. Filter/sort options

---

## 📚 SESSION HISTORY

### Session 2026-02-07:
- Built combat intelligence engine
- Created basic worker and deployed
- Got spy database working
- Deployed to: https://torn-war-bridge.tmecf.workers.dev

### Session 2026-02-08:
- Clarified correct user flow (setup once, auto-analyze)
- Updated project vision and architecture
- Identified need for Torn API integration
- Documented KV schema for user data
- Defined next steps for auto-analysis

---

## ⚠️ KNOWN ISSUES & DECISIONS

### Issue: Faction Data in Spy Database
**Problem:** Storing faction ID with spy data causes stale data (people change factions)
**Solution:** 
- Spy database stores ONLY: stats, FF multiplier, respect value
- NO faction data stored
- Faction roster fetched fresh from Torn API each time
- Cross-reference by player ID only

### Issue: API Key Security
**Concern:** Storing user Torn API keys
**Solution:**
- Store encrypted in KV
- Use only when user is authenticated
- Never expose in client-side code
- Allow users to revoke/update keys

### Issue: Rate Limiting
**Concern:** Torn API has rate limits
**Solution:**
- Cache user stats (refresh every 24 hours)
- Cache faction rosters (refresh every 6 hours)
- Implement backoff retry logic
- Show loading states to users

---

## 🎯 SUCCESS METRICS

How we'll know it's working:
1. ✅ User can set up once and never re-enter stats
2. ✅ Target list generated automatically
3. ✅ Win probabilities are accurate (user feedback)
4. ✅ Users report winning more fights
5. ✅ System responds < 3 seconds
6. ✅ 99%+ uptime

---

**END OF MASTER DOCUMENTATION**

*Next Update: After implementing user setup screen and Torn API integration*
