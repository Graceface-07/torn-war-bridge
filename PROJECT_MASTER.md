# TORN TACTICAL ADVISOR - Project Master Document

**Last Updated:** 2026-02-08  
**Status:** Phase 1 - Building Data Import & Tactical Dashboard  
**Version:** 0.3.0

---

## 🎯 PROJECT VISION

An intelligent **TACTICAL ADVISOR** for Torn City faction wars that acts as your combat coach. It doesn't just show you data - it **analyzes the entire battlefield automatically**, categorizes targets by difficulty, and teaches you WHY each recommendation works.

### Core Philosophy:
- **"Here's what to do and WHY"** - Educational approach, not just data dumps
- **Automatic Intelligence** - Load once, see everything analyzed
- **Smart Categorization** - Prime/Safe/Risky/Avoid targets
- **Performance Coaching** - Track improvement, personalized challenges
- **Multi-source Data** - Combines Torn API, FF Scouter, and Spy Database

---

## 🔄 CORRECT USER FLOW

### **Initial Load:**
1. User enters **2 fields:**
   - Their Torn User ID (e.g., 2702970)
   - Enemy Faction ID (e.g., 42505)

2. Click **"INITIALIZE SCAN"**

3. System **AUTOMATICALLY fetches ALL data:**
   - **YOUR stats** from Torn API (includes merits, education, enhancements)
   - **YOUR stats** from FF Scouter (their estimate)
   - **Enemy faction roster** (all members)
   - **FF Scouter data** for EVERY enemy (FF multiplier + estimated stats)
   - **Spy database** check for each enemy (key: `spy_{uid}`)

4. System **ANALYZES EVERY TARGET** and categorizes:
   - **Amber** - Prime targets (high respect, good win chance)
   - **Green** - Safe targets (easy wins, guaranteed respect)
   - **Blue** - Risky targets (possible but dangerous)
   - **Red** - Avoid targets (you'll lose, waste energy)

### **Dashboard Display:**
User sees:
- **YOUR profile** - Both Torn stats AND FF Scouter stats
- **FULL target list** - Already sorted and categorized
- **Stat source selector** - Choose Torn stats OR FF Scouter stats for calculations
- **Category breakdown** - Count of targets in each tier
- **Click any target** → Detailed analysis modal with educational reasoning

### **Generate Report:**
- User chooses which stat source to use (Torn vs FF Scouter)
- System recalculates ALL targets using chosen stat source
- Shows updated categorization
- Each target shows: Win %, FF multiplier, verdict, data source

---

## 📋 COMPLETE TODO LIST

### ✅ PHASE 0: Planning (COMPLETE)
- [x] Define project vision
- [x] Document correct user flow
- [x] Identify data sources (Torn API, FF Scouter, Spy DB)
- [x] Choose tech stack (Cloudflare Workers)
- [x] Create master documentation

---

### 🔄 PHASE 1: Data Import & Tactical Dashboard (IN PROGRESS)

#### 1.1 Initial Setup Screen
- [ ] Create 2-field input form (User ID, Enemy Faction ID)
- [ ] "Initialize Scan" button
- [ ] Loading state with progress indicators
- [ ] Error handling for invalid IDs

#### 1.2 Data Fetching
- [ ] **Torn API Integration:**
  - [ ] Fetch user stats with `selections=profile,battlestats`
  - [ ] Parse response for total stats (includes enhancements)
  - [ ] Fetch enemy faction roster with `selections=basic`
  - [ ] Extract all enemy member IDs
  - [ ] Handle API errors gracefully
  - [ ] Implement rate limiting (100 requests/min)

- [ ] **FF Scouter Integration:**
  - [ ] Research FF Scouter API endpoint
  - [ ] Batch request for user stats
  - [ ] Batch request for enemy stats (by chunks)
  - [ ] Parse FF multiplier for each target
  - [ ] Parse estimated battle stats
  - [ ] Handle API failures

- [ ] **Spy Database Integration:**
  - [ ] Check KV for each enemy: `spy_{uid}`
  - [ ] Parse spy data if exists
  - [ ] Use spy stats as priority over FF Scouter estimates
  - [ ] Track which enemies have spy data vs estimates

#### 1.3 Combat Intelligence Engine
- [ ] **Win Probability Calculator:**
  - [ ] Calculate using Torn stats vs enemy stats
  - [ ] Calculate using FF Scouter stats vs enemy stats
  - [ ] Apply FF multiplier to calculations
  - [ ] Return probability (0-1), confidence level, stat ratio
  - [ ] Generate educational reasoning text

- [ ] **Target Categorization:**
  - [ ] Amber: High respect + good win chance (FF 3.0-4.7, Win >70%)
  - [ ] Green: Easy wins (FF >4.7, Win >85%)
  - [ ] Blue: Risky but possible (FF 2.0-3.0, Win 40-70%)
  - [ ] Red: Avoid (Win <40%)
  - [ ] Sort within each category by respect potential

- [ ] **Respect Calculation:**
  - [ ] Base respect from target stats
  - [ ] FF multiplier impact
  - [ ] Respect per energy ratio
  - [ ] Total potential respect per target

- [ ] **Data Source Priority:**
  - [ ] For enemies: Spy DB > FF Scouter estimate
  - [ ] Track which source was used for each target
  - [ ] Display data source to user

#### 1.4 Dashboard UI
- [ ] **User Profile Card:**
  - [ ] Display user name and Torn ID
  - [ ] Show Torn total stats
  - [ ] Show FF Scouter total stats
  - [ ] Highlight which is higher
  - [ ] "Edit" button to restart scan

- [ ] **Stat Source Selector:**
  - [ ] Radio buttons: Torn Stats / FF Scouter Stats
  - [ ] Recalculate all targets when changed
  - [ ] Update all displays in real-time

- [ ] **Target List Display:**
  - [ ] Color-coded cards (Amber/Green/Blue/Red)
  - [ ] Show: Name, FF multiplier, Win %, Verdict
  - [ ] Sort by category, then by respect
  - [ ] Click to open detailed modal

- [ ] **Category Breakdown:**
  - [ ] Show count in each tier
  - [ ] Total potential respect
  - [ ] Click to filter by category

- [ ] **Target Detail Modal:**
  - [ ] Full stats comparison (user vs target)
  - [ ] Win probability with confidence level
  - [ ] Educational reasoning ("Why this works")
  - [ ] FF multiplier impact explanation
  - [ ] Data source indicator (spy vs estimate)
  - [ ] Direct link to attack in Torn
  - [ ] Close/back button

#### 1.5 Mobile Optimization
- [ ] Responsive layout (320px to 1920px)
- [ ] Touch-friendly buttons (min 44px)
- [ ] Readable fonts on small screens
- [ ] Optimized for Discord embedded browser
- [ ] Fast loading (< 3 seconds)

#### 1.6 Testing & Refinement
- [ ] Test with real Torn data
- [ ] Verify calculations match real outcomes
- [ ] User feedback collection
- [ ] Edge case handling (empty faction, API failures)
- [ ] Performance optimization

---

### ⏳ PHASE 2: War Intelligence Module (UPCOMING)

#### 2.1 Faction Comparison
- [ ] Your faction roster analysis
- [ ] Enemy faction roster analysis
- [ ] Power comparison visualization
- [ ] Identify vulnerable targets for each faction member

#### 2.2 Respect Prediction
- [ ] Total potential respect calculator
- [ ] Per-member respect breakdown
- [ ] Best-case vs realistic scenarios
- [ ] Time-based projections (if war lasts X hours)

#### 2.3 Strategy Recommendations
- [ ] Optimal timing analysis (when enemies are offline)
- [ ] Focus target recommendations (high value, low risk)
- [ ] Attack pattern suggestions (who hits whom)
- [ ] Coordination advice for faction

#### 2.4 Weapon Loadout System
- [ ] Analyze target stat distribution
- [ ] Recommend 4 weapon slots:
  - PRIMARY (exploits weakness)
  - BACKUP (reliable melee)
  - TEMPORARY (2x damage for critical fights)
  - ULTIMATE (best weapon for high-value only)
- [ ] Educational explanations for each choice
- [ ] Pre-configuration instructions

#### 2.5 Xanax War Timer
- [ ] War start time input
- [ ] Current energy input
- [ ] Calculate time to reach 1000E
- [ ] Alerts at 5hr, 1hr, 15min before war
- [ ] "Take Xanax Now" recommendations
- [ ] Educational: Why 5 hours? (energy refill math)

---

### ⏳ PHASE 3: Performance Coach (UPCOMING)

#### 3.1 Battle History Tracking
- [ ] Log every fight (target, outcome, respect gained)
- [ ] Store in KV with user ID
- [ ] Calculate win rate over time
- [ ] Energy efficiency tracking

#### 3.2 Performance Metrics
- [ ] Total fights, wins, losses
- [ ] Win rate percentage
- [ ] Average respect per fight
- [ ] Energy efficiency (respect per energy)
- [ ] Improvement rate (week over week)

#### 3.3 Personalized Challenges
- [ ] Analyze user performance to identify weaknesses
- [ ] Generate achievable challenges:
  - "Attack 3 targets with FF >3.0"
  - "Achieve 90% win rate this week"
  - "Earn 5000 respect in one war"
- [ ] Track challenge completion
- [ ] Reward system (badges/achievements)

#### 3.4 Weakness Analysis
- [ ] Identify patterns in losses
- [ ] Suggest training focus (which stats to train)
- [ ] Recommend gym routines
- [ ] Battle strategy improvements

---

### ⏳ PHASE 4: Discord Bot Integration (UPCOMING)

#### 4.1 Discord Bot Setup
- [ ] Create Discord application
- [ ] Generate bot token
- [ ] Configure OAuth2 permissions
- [ ] Invite bot to server

#### 4.2 Slash Commands
- [ ] `/advisor initialize <user_id> <enemy_faction>`
- [ ] `/advisor targets [category]`
- [ ] `/advisor analyze <target_id>`
- [ ] `/advisor war-timer <war_time>`
- [ ] `/advisor stats`
- [ ] `/advisor challenges`

#### 4.3 Embed Design
- [ ] Compact target list embeds
- [ ] Detailed analysis embeds
- [ ] Interactive buttons (Next, Previous, Details)
- [ ] Color-coded by category
- [ ] Mobile-friendly formatting

#### 4.4 Real-time Features
- [ ] Alert when high-value target comes online
- [ ] War countdown notifications
- [ ] Challenge completion notifications
- [ ] Weekly performance reports

---

### ⏳ PHASE 5: Production Deployment (UPCOMING)

#### 5.1 Cloudflare Worker
- [ ] Deploy to production
- [ ] Configure KV namespace
- [ ] Set environment variables
- [ ] Enable caching
- [ ] Set up error monitoring

#### 5.2 Security
- [ ] Encrypt Torn API keys in KV
- [ ] Validate all user inputs
- [ ] Rate limiting per user
- [ ] CORS configuration
- [ ] API authentication

#### 5.3 Performance
- [ ] Cache frequently accessed data
- [ ] Batch API requests efficiently
- [ ] Optimize KV reads/writes
- [ ] Monitor response times
- [ ] CDN optimization

#### 5.4 Monitoring
- [ ] Error logging (Sentry/LogFlare)
- [ ] Analytics (request counts, response times)
- [ ] User feedback collection
- [ ] API usage tracking
- [ ] Uptime monitoring

---

## 💾 DATA STRUCTURES

### User Data (KV: `user_{tornId}`)
```json
{
  "tornId": "2702970",
  "name": "OPERATOR",
  "tornStats": {
    "total": 2000000000,
    "strength": 500000000,
    "defense": 480000000,
    "speed": 520000000,
    "dexterity": 500000000,
    "lastUpdated": 1707307800000
  },
  "ffScouterStats": {
    "total": 1950000000,
    "strength": 490000000,
    "defense": 475000000,
    "speed": 510000000,
    "dexterity": 475000000,
    "lastUpdated": 1707307800000
  },
  "preferences": {
    "preferredStatSource": "torn",
    "autoAnalyze": true
  }
}
```

### Spy Data (KV: `spy_{uid}`)
```json
{
  "stats": {
    "strength": 180000000,
    "defense": 160000000,
    "speed": 190000000,
    "dexterity": 170000000
  },
  "lastUpdated": 1707307800000,
  "source": "manual_spy"
}
```

### Target Analysis (Calculated in real-time)
```json
{
  "uid": "123456",
  "name": "EnemyPlayer",
  "fairFight": 2.5,
  "enemyStats": {
    "total": 800000000,
    "source": "spy"
  },
  "analysis": {
    "winProbability": 0.85,
    "confidence": "high",
    "statRatio": 1.65,
    "tier": "amber",
    "verdict": "RECOMMENDED",
    "reasoning": "Your 2.0B total with 2.5x FF gives you 5.0B effective stats vs their 800M. This 6.25x advantage means 95% win chance with minimal damage taken.",
    "respectValue": 450,
    "respectPerEnergy": 18.0
  }
}
```

---

## 🔌 API INTEGRATIONS

### Torn Official API
- **Base URL:** `https://api.torn.com/`
- **Authentication:** API key per user
- **Rate Limit:** 100 requests/minute

**Endpoints Used:**
```
GET /user/{id}?selections=profile,battlestats&key={key}
→ Returns: name, total battle stats (includes all enhancements)

GET /faction/{id}?selections=basic&key={key}
→ Returns: faction info, member list with IDs
```

### FF Scouter API
- **Base URL:** `https://ffscouter.com/api/v1/`
- **Authentication:** API key
- **Batch Support:** Yes (up to 100 IDs per request)

**Endpoint:**
```
GET /get-stats?key={key}&targets={csv_ids}&user_id={uid}
→ Returns: Array of {fair_fight, bs_estimate} for each target
```

### Spy Database (KV)
- **Namespace:** ROTATOR (existing)
- **Key Format:** `spy_{uid}` (NO faction ID)
- **Value:** JSON with stats object
- **Priority:** Use spy data if available, else FF Scouter

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│           USER INTERFACE                         │
│  (Cloudflare Worker serving HTML)               │
│                                                  │
│  ┌────────────────────────────────────────────┐│
│  │  INITIALIZE SCAN                           ││
│  │  [User ID] [Enemy Faction ID] [GO]        ││
│  └────────────────────────────────────────────┘│
│                    ↓                             │
│  ┌────────────────────────────────────────────┐│
│  │  LOADING: Fetching data...                 ││
│  │  ✓ Your Torn stats                         ││
│  │  ✓ Your FF Scouter stats                   ││
│  │  ✓ Enemy faction roster (45 members)       ││
│  │  ⏳ FF Scouter data (batch 1/4)            ││
│  └────────────────────────────────────────────┘│
│                    ↓                             │
│  ┌────────────────────────────────────────────┐│
│  │  TACTICAL DASHBOARD                        ││
│  │                                            ││
│  │  Your Profile: 2.0B (Torn) | 1.95B (FF)   ││
│  │  Stat Source: ○ Torn  ● FF Scouter        ││
│  │                                            ││
│  │  Categories:                               ││
│  │  🟢 Green (12) - Safe targets             ││
│  │  🟠 Amber (18) - Prime targets            ││
│  │  🔵 Blue (10) - Risky targets             ││
│  │  🔴 Red (5) - Avoid                        ││
│  │                                            ││
│  │  [Target Cards - Click for details]       ││
│  └────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Torn API │ │FF Scouter│ │ Spy DB   │
  │          │ │   API    │ │  (KV)    │
  │ - Stats  │ │ - FF     │ │ - Intel  │
  │ - Roster │ │ -估计    │ │          │
  └──────────┘ └──────────┘ └──────────┘
```

---

## 🎨 DESIGN SYSTEM

### Color Coding (Torn-style)
```
🟢 Green (Safe):    #00ff9c  - FF >4.7, Win >85%
🟠 Amber (Prime):   #f6da00  - FF 3.0-4.7, Win 70-85%
🔵 Blue (Risky):    #009fff  - FF 2.0-3.0, Win 40-70%
🔴 Red (Avoid):     #ff3333  - FF <2.0, Win <40%
```

### Typography
- **Primary:** Inter (clean, readable)
- **Accent:** Orbitron (headers, stats)
- **Monospace:** Courier New (tactical data)

---

## ✅ CURRENT SESSION STATUS

### What We've Built:
1. ✅ Clarified correct user flow
2. ✅ Identified all data sources
3. ✅ Defined data priority (Spy > FF Scouter)
4. ✅ Created comprehensive TODO list
5. ✅ Updated project documentation

### What We're Building Next:
1. 🔄 Data import system (Torn API + FF Scouter + Spy DB)
2. 🔄 Combat intelligence engine
3. 🔄 Tactical dashboard UI
4. 🔄 Target categorization display

### Blockers:
- [ ] Need FF Scouter API documentation/key
- [ ] Need Torn API key for testing
- [ ] Confirm exact spy database key format

---

## 📞 QUICK REFERENCE

### API Keys Needed:
- Torn API key (user provides)
- FF Scouter API key (system-wide)

### KV Namespace:
- ROTATOR: `7d26ddc573674ba19db3af3951322bf7`

### Deployment:
- URL: `https://torn-war-bridge.tmecf.workers.dev`
- Command: `wrangler deploy`

### Important Links:
- Torn API Docs: https://www.torn.com/api.html
- FF Scouter: https://ffscouter.com/
- Cloudflare Docs: https://developers.cloudflare.com/workers/

---

**END OF MASTER DOCUMENT**  
*Updated: 2026-02-08 - Reflects correct data flow and complete TODO list*
