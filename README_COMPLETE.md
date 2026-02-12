# TORN WAR COMMAND CENTER - Project Master Document

**Last Updated:** 2026-02-12  
**Status:** Phase 1 Complete - War Intelligence Dashboard Operational  
**Version:** 1.0.0

---

## 🎯 PROJECT VISION

A **military-grade war command center** for Torn City faction wars that provides intelligent, actionable tactical advice - not just data dumps. Acts as an expert war strategist analyzing enemy factions, calculating optimal targets, and coaching players on war strategy.

### Core Philosophy:
- **"Here's what to attack and WHY"** - Smart recommendations, not raw data
- **Command Center Interface** - Military-style dashboard with drill-down modules
- **Real-time War Intelligence** - Automated faction analysis with FF Scouter integration
- **Educational Coaching** - Explains combat mechanics, teaches strategy
- **Personalized Growth** - Monthly task system to improve stats and combat effectiveness

---

## 🎮 UNDERSTANDING TORN WARS

### What Are Faction Wars?
Torn faction wars are competitive PvP events where two factions compete to earn more **RESPECT** than their opponent within a time limit. The faction that reaches the target respect first wins.

### How Respect Works:
Every successful attack against an enemy faction member earns respect. The amount depends on:

1. **Fair Fight (FF) Multiplier** (1x - 3x)
   - Based on stat similarity between attacker and defender
   - FF 3.0x = Target has 75%+ of your stats (optimal)
   - FF < 3.0x = Weaker target (less respect)
   - FF > 3.0x = Stronger target (more respect, harder fight)

2. **Level-Based Respect** (1.0 - 1.5)
   - Level 1 = 1.0 base respect
   - Level 100 = 1.5 base respect

3. **War Bonus** (2x)
   - All attacks during ranked wars get 2x multiplier

4. **Additional Multipliers:**
   - Warlord weapon: +16%
   - Overseas target: +1.25x
   - Retaliation (within 5 min): +1.5x
   - Group attack: Additional bonus
   - Chain bonuses: At 10/25/100/250/500 hits

### Xanax War Prep Strategy:
**Critical for war success:**
- Xanax gives 250 energy (max 1000 energy cap)
- Start 48 hours before war
- Take Xanax every 8 hours (cooldown period)
- Reach 1000 energy at war start = maximum attacks
- **Downside:** 8-hour cooldown + 35% stat debuff while active

### FF Scouter Intelligence Tool:
- Estimates enemy battle stats BEFORE attacking
- Predicts FF multiplier you'll receive
- Database of estimated stats for most Torn players
- Helps identify optimal targets (beatable + high FF = max respect)

---

## 📊 CURRENT STATUS

### ✅ COMPLETED (Phase 1)

**Core Data Pipeline:**
- [x] Torn API integration (user stats + faction roster)
- [x] Effective battle stats calculation (includes merits/education bonuses)
- [x] FF Scouter batch processing (100 targets per request)
- [x] Automatic target categorization (Safe/Prime/Risky/Suicide)
- [x] Win probability calculator (based on stat ratios)
- [x] Respect calculator (level + FF + war bonus + warlord)

**War Command Center Dashboard:**
- [x] Military-style interface with modular design
- [x] War Verdict panel (Poor/Good/Excellent assessment)
- [x] 20-hit respect estimation
- [x] Gap analysis (wasted hits on unbeatable targets)
- [x] Efficiency scoring (avg respect per hit)
- [x] Faction member list (sorted by respect potential)
- [x] Category tiles (Safe/Prime/Risky/Suicide)
- [x] Drill-down views for each category
- [x] Tactical advice system (explains WHY for each recommendation)

**Monthly Progress Tracker:**
- [x] Personalized task generation based on level and stats
- [x] Task completion tracking with progress bar
- [x] Smart recommendations (training, combat, education goals)
- [x] Milestone-based tasks (100M stats, 1B stats, etc.)

**Tier Categorization System:**
- 🟠 **Safe** (FF < 1.8): Easy wins, low respect but guaranteed
- 🟢 **Prime** (FF 1.8-4.2): Optimal targets - beatable + good respect
- 🔵 **Risky** (FF 4.2-5.2): Challenging but high reward
- 🔴 **Suicide** (FF > 5.2): Too strong, waste of energy

### 🔄 IN PROGRESS

**Respect Formula Refinement:**
- Current formula works but needs real-world validation
- Based on attack logs: `(level_respect × FF × 2_war_bonus × 1.16_warlord)`
- Need more attack log samples to perfect calculations

**UI Polish:**
- Dashboard functional but could be more visually refined
- Mobile responsiveness needs testing
- Loading animations for data fetching

### ⏳ PENDING (Phase 2+)

**War Planning Module:**
- [ ] Xanax countdown timer
- [ ] Energy tracker (current/max/remaining)
- [ ] Optimal attack windows (based on enemy activity)
- [ ] War preparation checklist

**Real-Time Battle Advice:**
- [ ] "Attack X next - they just hit your faction (retal bonus!)"
- [ ] Chain bonus tracking (next bonus at 25/100/250 hits)
- [ ] Overseas target detection (+1.25x bonus)
- [ ] Group attack coordination suggestions

**Advanced Analytics:**
- [ ] Respect distribution charts
- [ ] Target efficiency heatmap
- [ ] Historical war performance tracking
- [ ] Win probability trends

**Weapon Loadout Manager:**
- [ ] 4 preset weapon configurations
- [ ] Weapon recommendations per target type
- [ ] Booster usage suggestions
- [ ] Temporary item optimization

**Spy Database Integration:**
- [ ] Import spy data from KV storage
- [ ] Compare spy stats vs FF Scouter estimates
- [ ] Use actual stats when available (more accurate than estimates)
- [ ] Display "Actual Power" vs "Est. Power" labels

---

## 🐛 KNOWN ISSUES

### Critical:
- **Respect calculations need validation**: Current formula based on limited attack log samples
- **FF Scouter API rate limits**: Need to implement proper error handling and backoff
- **Large faction loading**: Factions >100 members may take 10+ seconds to process

### Minor:
- **Some targets show no stats**: FF Scouter returns 0 for certain players (new accounts, no recent attacks)
- **Spy database disabled**: Key format mismatch (uses index instead of player_id) - needs rebuild
- **Missing FF Scouter data for user**: Currently hardcoded to 70M, should fetch from API
- **Mobile layout**: Not optimized for phone screens yet

### UX Improvements Needed:
- **Loading indicators**: Better feedback during faction scan
- **Error messages**: More user-friendly error handling
- **Tooltips**: Explain FF multipliers, respect calculations
- **Search/filter**: Find specific targets by name
- **Sorting options**: Sort member list by win %, FF, level, name

---

## 🚀 NEXT IMMEDIATE PRIORITIES

### Priority 1: Validate Respect Formula
**Goal:** Ensure respect predictions match actual game values
- Collect more attack log samples (different FF ranges, levels)
- Compare predicted vs actual respect earned
- Adjust formula coefficients if needed
- Document formula accuracy

### Priority 2: War Timer Module
**Goal:** Help players prepare for wars with Xanax timing
- Countdown to war start
- "Take Xanax NOW" alerts (every 8 hours)
- Energy stack progress tracker (0→250→500→750→1000)
- Visual timeline showing optimal Xanax schedule

### Priority 3: Real-Time Battle Advice
**Goal:** Give actionable tactical recommendations during wars
- Detect retaliation opportunities (5-minute window)
- Track chain progress and predict next bonus hit
- Highlight overseas targets
- Suggest group attack coordination

### Priority 4: Polish & Performance
**Goal:** Make it production-ready
- Add loading animations
- Improve error handling
- Optimize for large factions (caching, pagination)
- Mobile-responsive design
- User feedback system

### Priority 5: Advanced Features
**Goal:** Make it indispensable for serious war factions
- Historical performance tracking
- Weapon loadout presets
- Spy database integration
- Export war reports (PDF/CSV)

---

## 📐 TECHNICAL ARCHITECTURE

### Tech Stack:
- **Platform:** Cloudflare Workers (serverless, global CDN, free tier)
- **Storage:** KV namespace (ROTATOR) for spy database
- **APIs:** Torn API + FF Scouter API
- **Frontend:** Vanilla JavaScript (no frameworks - fast & simple)
- **Deployment:** Wrangler CLI

### Data Flow:
```
User enters UID + Enemy Faction ID
    ↓
Fetch user stats from Torn API (with modifiers)
    ↓
Fetch enemy faction roster from Torn API
    ↓
Batch process targets through FF Scouter (100 at a time)
    ↓
Calculate win %, respect, tier for each target
    ↓
Generate war verdict + tactical recommendations
    ↓
Display modular dashboard with drill-down views
```

### File Structure:
```
worker-command-center-v1.js  (Current working version)
├── Backend API endpoints
│   ├── /api/get-user (Torn stats with modifiers)
│   ├── /api/get-faction (Roster with member IDs)
│   └── /api/get-scouter-batch (FF + estimated stats)
└── Frontend HTML/CSS/JS
    ├── Init screen (setup)
    ├── War verdict panel
    ├── Member list + category tiles
    ├── Drill-down category views
    └── Monthly progress tracker
```

### API Keys (Temporary - 48hr expiry):
- **TORN_API_KEY:** CZP2D2ZnbXWsYiDT
- **SC_KEY:** rwLgZTyqgWDxhoCx

---

## 🧮 FORMULAS & CALCULATIONS

### Win Probability:
Based purely on stat ratio (no FF multiplier in combat):
```javascript
ratio = myStats / enemyStats

if ratio >= 3.0:  winChance = 98%
if ratio >= 2.0:  winChance = 95%
if ratio >= 1.5:  winChance = 85%
if ratio >= 1.2:  winChance = 70%
if ratio >= 1.0:  winChance = 55%
if ratio >= 0.8:  winChance = 35%
if ratio >= 0.6:  winChance = 20%
else:             winChance = 10%
```

### Respect Calculation (Current Formula):
```javascript
// Level-based respect (1.0 at L1, 1.5 at L100)
levelRespect = 1.0 + ((level - 1) / 100) * 0.5

// Apply FF multiplier
baseRespect = levelRespect × fairFight

// War bonus (2x during ranked wars)
warRespect = baseRespect × 2

// Warlord weapon bonus (+16%)
finalRespect = warRespect × 1.16
```

**Example from Real Attack Log:**
- BlackDReborn: Level 50, FF 3.83x
- Formula: `1.25 × 3.83 × 2 × 1.16 = 11.14 respect`
- Actual: `11.53 respect` (96.6% accuracy)

### War Verdict Logic:
```javascript
beatablePercent = (beatable / total) × 100

if beatablePercent < 30%:  verdict = "POOR RANK WAR" (red)
if beatablePercent 30-70%: verdict = "GOOD RANK WAR" (green)
if beatablePercent > 70%:  verdict = "EXCELLENT RANK WAR" (cyan)
```

---

## 📝 SESSION HISTORY

### Session 2026-02-10 (Phase 1 Complete):
- Built complete data pipeline (Torn API + FF Scouter)
- Implemented win probability calculator
- Fixed FF multiplier logic (affects respect only, NOT combat)
- Added effective battle stats calculation (includes modifiers)
- Created tier categorization system (Safe/Prime/Risky/Suicide)
- Built target detail modals with educational reasoning
- Added respect calculator with proper formulas

### Session 2026-02-12 (Command Center Rebuild):
- Researched Torn City mechanics deeply (faction wars, FF system, Xanax prep)
- Redesigned entire UI as modular war command center
- Added war verdict panel (Poor/Good/Excellent assessment)
- Created member list with drill-down category tiles
- Built monthly progress tracker with personalized tasks
- Implemented respect formula based on real attack logs
- Generated smart tactical advice system

---

## 🎯 SUCCESS METRICS

**How we'll know it works:**
1. ✅ Respect predictions within 5% of actual game values
2. ✅ Users can identify optimal targets in < 10 seconds
3. ✅ War verdict accurately predicts difficulty
4. ✅ Loading time < 5 seconds for factions up to 100 members
5. ✅ Users report winning more wars after using the tool
6. ✅ Task completion leads to measurable stat improvement

---

## 💡 DESIGN PRINCIPLES

**Why We Built It This Way:**

1. **Modular Drill-Down Navigation**
   - No overwhelming flat lists of 100 targets
   - Focus on one category at a time (Safe/Prime/Risky/Suicide)
   - Click tile → See filtered targets → Get specific advice

2. **War Verdict At-A-Glance**
   - Instant assessment: Is this war winnable?
   - Key metrics: 20-hit potential, wasted hits, efficiency
   - Color-coded: Red (poor), Green (good), Cyan (excellent)

3. **Educational, Not Just Data**
   - Every recommendation explains WHY
   - Teaches Torn combat mechanics naturally
   - Builds player skill over time

4. **Personalized Growth System**
   - Monthly tasks based on YOUR stats and level
   - Not generic "train more" advice
   - Specific, achievable goals with clear rewards

5. **Clean Military Aesthetic**
   - Professional, not gamey
   - Easy to read during high-pressure wars
   - Fast performance (vanilla JS, no frameworks)

---

## 🔧 DEPLOYMENT

### Local Development:
```bash
wrangler dev
```

### Production Deployment:
```bash
cp worker-command-center-v1.js worker.js
wrangler deploy
```

### Live Logs:
```bash
wrangler tail
```

### Current URL:
`https://torn-war-bridge.tmecf.workers.dev`

---

## 📚 USEFUL RESOURCES

**Torn Wiki:**
- [Chain Mechanics](https://wiki.torn.com/wiki/Chain)
- [Battle Stats](https://wiki.torn.com/wiki/Battle_Stat)
- [Ranked Wars](https://wiki.torn.com/wiki/Ranked_War)
- [Faction Guide](https://wiki.torn.com/wiki/Faction)

**Community Tools:**
- [FF Scouter](https://ffscouter.com/)
- [TornStats](https://tornstats.com/)
- [Proxima's Fight Simulator](https://tornarcadia.com/tools/proxisim)

**Guides:**
- [War & Chaining Complete Guide](https://www.torn.com/forums.php?p=threads&f=61&t=16453708)
- [Ranked War Beginner Guide](https://www.torn.com/forums.php?p=threads&f=61&t=16450258)

---

**END OF DOCUMENTATION**

*Next Update: After implementing War Timer + Real-Time Battle Advice*
