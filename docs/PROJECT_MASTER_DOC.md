# TORN TACTICAL ADVISOR - Project Master Document

**Last Updated:** 2026-02-07  
**Status:** Phase 1 - Web Prototype Development  
**Version:** 0.1.0

---

## 🎯 PROJECT VISION

An intelligent combat advisor for Torn City that gives players **smart, actionable advice** - not just data dumps. Acts like an expert coach analyzing their performance, recommending optimal strategies, and helping them improve at PvP combat and faction wars.

### Core Philosophy:
- **"Here's what to do and WHY"** - not just "here's the data"
- **Personalized challenges** based on player performance
- **Smart predictions** for faction wars using FF Scouter data
- **Tactical recommendations** for each combat scenario
- **Performance coaching** that tracks improvement over time

---

## 📋 PROJECT PHASES

### ✅ PHASE 0: Planning & Architecture (COMPLETE)
- [x] Define project vision
- [x] Choose tech stack (Cloudflare Workers + Discord)
- [x] Decide on prototype approach (web first, then port)
- [x] Create master documentation

### 🔄 PHASE 1: Web Prototype Development (IN PROGRESS)
**Goal:** Build and perfect the advisor logic in a web interface

#### 1.1 Core Interface
- [x] Main dashboard with module cards
- [x] Mobile-responsive design (Discord-friendly)
- [x] Setup/configuration modal
- [x] Navigation system
- [ ] Polish animations and interactions

#### 1.2 Combat Advisor Module ✅ COMPLETE
- [x] Target analysis display
- [x] Win probability calculator (universal logic for all users)
- [x] Weapon/attack type recommendations
- [x] **Weapon Loadout System** - Teach users to prepare 3-4 weapon presets
- [x] Optimal timing suggestions
- [x] **Xanax/Energy Timer** - Countdown for war preparation (stack to 1000E)
- [x] Risk assessment system (what you're risking: energy waste, respect loss, hospitalization)
- [x] **Educational tooltips** - Explain WHY each recommendation works
- [x] Combat intelligence engine built
- [x] Integrate intelligence engine into UI ✅ DONE!
- [x] Add interactive demonstrations
- [ ] Test with realistic scenarios
- [ ] User feedback and refinement

#### 1.3 Faction War Intelligence
- [ ] FF Scouter data integration
- [ ] Your faction vs enemy comparison
- [ ] Respect potential calculator
- [ ] Vulnerable target identification
- [ ] War strategy recommendations

#### 1.4 Performance Coach
- [ ] Battle history tracking
- [ ] Performance metrics dashboard
- [ ] Personalized challenges system
- [ ] Improvement tracking over time
- [ ] Weakness identification & advice

#### 1.5 Smart Recommendations Engine
- [ ] Combat damage formulas
- [ ] Win probability algorithms
- [ ] Booster/drug recommendations
- [ ] Energy efficiency calculations
- [ ] Respect per hit optimization

### ⏳ PHASE 2: Logic Refinement (UPCOMING)
- [ ] Test all calculations with real Torn data
- [ ] Refine advice quality
- [ ] Add edge cases handling
- [ ] Performance optimization

### ⏳ PHASE 3: Discord Bot Development (UPCOMING)
- [ ] Cloudflare Worker setup
- [ ] Discord bot registration
- [ ] Slash command implementation
- [ ] Embed message design
- [ ] Interactive buttons/components

### ⏳ PHASE 4: Production Deployment (UPCOMING)
- [ ] Cloudflare Worker deployment
- [ ] KV storage integration
- [ ] Spy database connection
- [ ] Torn API integration
- [ ] User authentication

---

## 🏗️ SYSTEM ARCHITECTURE

### Current (Web Prototype):
```
┌─────────────────────────────────────────┐
│         React Web Interface             │
│  (Testing & Development Environment)    │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Combat Advisor Module          │  │
│  │   - Target Analysis              │  │
│  │   - Win Calculator               │  │
│  │   - Recommendations              │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   War Intelligence Module        │  │
│  │   - Faction Comparison           │  │
│  │   - Respect Prediction           │  │
│  │   - Strategy Advisor             │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   Performance Coach Module       │  │
│  │   - Challenge System             │  │
│  │   - Progress Tracking            │  │
│  │   - Weakness Analysis            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Future (Production):
```
┌──────────────┐         ┌─────────────────────────────┐
│   Discord    │ ◄─────► │   Cloudflare Worker         │
│     Bot      │         │   (Main Application Logic)  │
└──────────────┘         └─────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────────┐ ┌──────────┐ ┌──────────────┐
            │ Cloudflare KV│ │ Torn API │ │ Spy Database │
            │   Storage    │ │          │ │  (Existing)  │
            │              │ │          │ │              │
            │ - User Data  │ │ - Stats  │ │ - FF Scout   │
            │ - History    │ │ - Faction│ │ - Intel      │
            │ - Progress   │ │ - Battles│ │              │
            └──────────────┘ └──────────┘ └──────────────┘
```

---

## 🔌 API INTEGRATIONS

### Phase 1 (Web Prototype):
- **Mock Data** - Simulated Torn data for testing
- **Local Storage** - Browser-based user preferences

### Phase 2 (Production):
- **Torn Official API**
  - Endpoint: `https://api.torn.com/`
  - Data: User stats, faction info, battle logs
  - Authentication: API key per user

- **FF Scouter** (Details TBD)
  - Purpose: Fair fight multiplier data
  - Integration method: TBD

- **Spy Database** (Your Existing System)
  - Storage: Cloudflare KV
  - Purpose: Enemy intelligence
  - Integration: Direct KV access

- **Discord API**
  - Interactions endpoint
  - Slash commands
  - Embed messages

---

## 💾 DATA STRUCTURES

### User Profile
```javascript
{
  userId: "torn_123456",
  discordId: "discord_789",
  totalStats: "2.5B",
  factionId: "12345",
  preferences: {
    mode: "war|chain|retaliation",
    autoAdvice: true,
    challengeLevel: "medium"
  },
  battleHistory: [...],
  currentChallenges: [...],
  performance: {
    wins: 150,
    losses: 30,
    efficiency: 1.95,
    improvementRate: 12.5
  }
}
```

### Target Analysis
```javascript
{
  targetId: "torn_654321",
  name: "EnemyPlayer",
  stats: {
    total: "1.8B",
    strength: 450000000,
    defense: 420000000,
    speed: 480000000,
    dexterity: 450000000
  },
  ffMultiplier: 2.1,
  status: "online|offline|hospital|jail",
  analysis: {
    winProbability: 0.85,
    recommendedApproach: "aggressive",
    optimalWeapon: "rifle",
    suggestedBoosters: ["xanax", "fhc"],
    respectValue: 450,
    risk: "low|medium|high",
    reasoning: "Your stats advantage of 1.4x combined with..."
  }
}
```

### War Prediction
```javascript
{
  enemyFactionId: "67890",
  analysis: {
    totalRespectPotential: 2500,
    beatableTargets: [
      {
        targetId: "...",
        category: "safe|prime|risky",
        expectedRespect: 450,
        confidence: 0.9
      }
    ],
    strategy: "Focus on prime targets during 18:00-22:00 TCT...",
    warnings: ["3 members have higher stats - avoid"],
    optimalTiming: "evenings when 60% are offline"
  }
}
```

---

## 🧠 INTELLIGENCE ALGORITHMS

### Win Probability Calculator
**Status:** To be implemented  
**Formula:** Based on Torn combat mechanics
- Total stats comparison
- FF multiplier impact
- Weapon advantages
- Booster effects
- Historical win rates

### Respect Optimization
**Status:** To be implemented  
**Logic:**
- Respect per energy spent
- Respect per minute calculation
- FF multiplier maximization
- Target selection priority

### Challenge Generator
**Status:** To be implemented  
**Criteria:**
- Current performance level
- Identified weaknesses
- Achievable but stretching goals
- Progressive difficulty

### Strategy Advisor
**Status:** To be implemented  
**Inputs:**
- Player stats vs target stats
- Available resources (weapons, boosters, drugs)
- Target status and timing
- Historical success patterns

**Output:**
- Step-by-step combat plan
- Resource recommendations
- Timing advice
- Risk warnings
- Expected outcomes

---

## 📱 MOBILE-FIRST DESIGN PRINCIPLES

Since this will be used in Discord (heavily mobile):
- **Compact layouts** - information dense but readable
- **Touch-friendly** - buttons min 44px, good spacing
- **Fast loading** - minimize data/images
- **Readable fonts** - 14px minimum for body text
- **Clear hierarchy** - most important info prominent
- **Scrollable sections** - no horizontal scroll
- **Embeds** - use Discord's native embed format

---

## 🎨 DESIGN SYSTEM

### Color Palette
```css
--danger-red: #ff2b2b      /* Suicide targets, warnings */
--safe-green: #00ff9c       /* Safe targets, success */
--prime-orange: #ff9d00     /* Prime targets, important */
--risky-cyan: #00d2ff       /* Risky targets, caution */
--accent-purple: #a855f7    /* Stats, special features */
--accent-pink: #ec4899      /* Target analysis */

--bg-dark: #0a0a0a          /* Main background */
--bg-card: #1a1a1a          /* Card backgrounds */
--bg-elevated: #2a1a2a      /* Modals, elevated surfaces */

--text-primary: #ffffff     /* Main text */
--text-secondary: #888888   /* Labels, less important */
--border-subtle: rgba(255, 255, 255, 0.1)
```

### Typography
- **Primary Font:** IBM Plex Mono (monospace, tactical feel)
- **Accent Font:** Orbitron (headers, important stats)
- **Mobile-friendly sizes**
- **Uppercase for labels** (tactical aesthetic)

---

## 🔧 DEVELOPMENT NOTES

### Current Session Progress:
1. ✅ Created initial Tactical HUD prototype
2. ✅ Established project vision and scope
3. ✅ Decided on phased approach (web → Discord)
4. ✅ Created master documentation with TODO tracking
5. ✅ Built complete combat intelligence engine with:
   - Win probability calculator with educational reasoning
   - Advanced risk assessment (5 categories)
   - Intelligent weapon loadout recommendations (4 slots)
   - Xanax war timer with smart alerts
   - Educational tooltips throughout
6. ✅ Created production-grade web interface with:
   - Target analysis cards with real-time calculations
   - Interactive Xanax timer with energy slider
   - Detailed modal views with full intelligence
   - Mobile-responsive design
   - Smooth animations and interactions
   - Educational sections explaining WHY
7. ✅ **CLOUDFLARE DEPLOYMENT READY:**
   - Complete setup guide (step-by-step)
   - Worker code (index.js with routing)
   - Discord handler (slash commands)
   - Configuration files (wrangler.toml, package.json)
   - Deployment script (automated setup)
   - KV storage integration
   - Ready to deploy to production!
8. 🔄 Next: Deploy to Cloudflare, test live, gather feedback

### Technical Decisions:
- **React** for web prototype (familiar, fast development)
- **Cloudflare Workers** for production (you have existing setup)
- **KV Storage** for data persistence
- **Discord.js** or native API for bot

### Open Questions:
- [ ] FF Scouter API access method?
- [ ] Exact Torn combat damage formulas?
- [ ] Spy database schema details?
- [ ] How many concurrent users expected?

---

## 📞 INTEGRATION CHECKLIST (For Production Phase)

### Discord Bot Setup
- [ ] Create Discord application
- [ ] Generate bot token
- [ ] Set up OAuth2 permissions
- [ ] Configure slash commands
- [ ] Set interaction endpoint to Cloudflare Worker

### Cloudflare Worker
- [ ] Deploy worker code
- [ ] Configure KV namespace bindings
- [ ] Set environment variables (Discord token, Torn API keys)
- [ ] Configure routes
- [ ] Set up cron triggers (for automated analysis)

### Data Migration
- [ ] Connect to existing spy database KV
- [ ] Define shared data structures
- [ ] Implement data sync logic

### Torn API
- [ ] Get API key management working
- [ ] Implement rate limiting
- [ ] Cache frequently accessed data
- [ ] Error handling for API failures

---

## 🎯 SUCCESS METRICS

How we'll know it's working:
1. **Advice Quality** - Users report recommendations are accurate
2. **Win Rate Improvement** - Players show measurable improvement
3. **Engagement** - Users complete challenges and check regularly
4. **Performance** - Bot responds to Discord commands < 2 seconds
5. **Reliability** - 99%+ uptime, no data loss

---

## 🚀 NEXT IMMEDIATE TASKS

### Right Now (Current Session):
1. [ ] Build Combat Advisor logic
2. [ ] Implement win probability calculator
3. [ ] Create recommendation engine
4. [ ] Design target analysis interface
5. [ ] Add mobile-responsive layouts

### Next Session:
1. [ ] War intelligence module
2. [ ] Performance coach with challenges
3. [ ] Testing with realistic data
4. [ ] Refinement based on feedback

---

## 📝 NOTES & IDEAS

### Core Principles:
- **Educational First** - Don't just tell them what to do, teach them WHY
- **They learn by doing** - Each recommendation explains the logic so they internalize it
- **Multi-dimensional thinking** - Consider energy, timing, risk, reward, opportunity cost

### Risk Assessment Categories:
1. **Energy Risk** - Wasting energy on low-value targets
2. **Respect Risk** - Losing respect if you get hospitalized
3. **Timing Risk** - Attacking when conditions aren't optimal
4. **Opportunity Cost** - Could you be hitting a better target instead?
5. **War Impact** - How this affects your faction's war performance

### Xanax Timer Feature:
- Countdown to war start (when users should have 1000E stacked)
- Alerts at key intervals: 5 hours before, 1 hour before, 15 mins before
- Shows current energy and time needed to reach 1000E
- Reminds users to take Xanax at optimal time

### Weapon Loadout System:
- Pre-configure 3-4 weapon setups for different scenarios:
  - **Heavy Damage** - Maximum power (rifles, clubs)
  - **Speed/Dexterity** - Fast attacks (SMGs, knives)  
  - **Balanced** - All-around performance
  - **Specialist** - Situation-specific (shotguns for close range)
- Quick-switch recommendations based on target stats
- Teaches weapon mechanics and when to use each type

- Consider adding a "practice mode" where users can simulate battles
- Voice chat integration? Bot could give live advice during wars
- Achievement/badge system for completing challenges
- Weekly performance reports sent to Discord DM
- Community leaderboard for top improvers
- Integration with training gym recommendations
- Alert system for high-value targets coming online

---

**END OF MASTER DOCUMENT**  
*This document will be updated continuously throughout development*
