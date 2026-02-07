// TORN TACTICAL ADVISOR - Combat Intelligence Engine
// This module provides smart, educational combat advice

/**
 * COMBAT FORMULAS & CONSTANTS
 * Based on Torn City combat mechanics
 */
const COMBAT_CONSTANTS = {
  // Fair Fight multiplier impact on respect
  FF_RESPECT_MULTIPLIER: {
    excellent: 3.0,  // FF > 2.5
    good: 2.0,       // FF 1.5-2.5
    average: 1.0,    // FF 0.8-1.5
    poor: 0.5        // FF < 0.8
  },
  
  // Energy costs
  ENERGY_COST: {
    attack: 25,
    mug: 25,
    hospitalize: 50
  },
  
  // Xanax mechanics
  XANAX: {
    maxEnergy: 1000,
    normalMax: 150,
    refillTime: 300, // 5 minutes per energy
    warPrepTime: 5 * 60 // 5 hours to stack from 0 to 1000
  },
  
  // Weapon effectiveness multipliers
  WEAPON_EFFECTIVENESS: {
    // Primary weapons
    rifle: { damage: 1.2, accuracy: 0.9, speed: 0.7, bestAgainst: 'defense' },
    smg: { damage: 0.8, accuracy: 0.7, speed: 1.3, bestAgainst: 'speed' },
    shotgun: { damage: 1.5, accuracy: 0.6, speed: 0.5, bestAgainst: 'strength' },
    pistol: { damage: 0.7, accuracy: 1.0, speed: 1.0, bestAgainst: 'balanced' },
    
    // Melee weapons
    club: { damage: 1.3, accuracy: 0.8, speed: 0.6, bestAgainst: 'strength' },
    knife: { damage: 0.9, accuracy: 0.9, speed: 1.2, bestAgainst: 'dexterity' },
    
    // Temporary weapons
    temporary: { damage: 2.0, accuracy: 0.5, speed: 0.8, bestAgainst: 'surprise' }
  }
};

/**
 * Calculate win probability based on stats comparison
 * @param {Object} userStats - Your battle stats
 * @param {Object} targetStats - Target's battle stats
 * @param {number} fairFightMultiplier - Current FF multiplier
 * @returns {Object} - Win probability and confidence level
 */
export function calculateWinProbability(userStats, targetStats, fairFightMultiplier) {
  // Calculate total effective stats
  const userTotal = userStats.strength + userStats.defense + userStats.speed + userStats.dexterity;
  const targetTotal = targetStats.strength + targetStats.defense + targetStats.speed + targetStats.dexterity;
  
  // Adjust for fair fight multiplier
  const effectiveUserStats = userTotal * fairFightMultiplier;
  
  // Calculate stat advantage ratio
  const statRatio = effectiveUserStats / targetTotal;
  
  // Convert ratio to probability (sigmoid-like curve)
  let winProbability;
  if (statRatio >= 2.0) {
    winProbability = 0.95; // Nearly guaranteed
  } else if (statRatio >= 1.5) {
    winProbability = 0.85;
  } else if (statRatio >= 1.2) {
    winProbability = 0.70;
  } else if (statRatio >= 1.0) {
    winProbability = 0.55;
  } else if (statRatio >= 0.8) {
    winProbability = 0.35;
  } else if (statRatio >= 0.6) {
    winProbability = 0.15;
  } else {
    winProbability = 0.05; // Nearly impossible
  }
  
  // Determine confidence level
  let confidence;
  if (winProbability >= 0.85) confidence = 'high';
  else if (winProbability >= 0.60) confidence = 'medium';
  else confidence = 'low';
  
  return {
    probability: winProbability,
    confidence,
    statRatio,
    effectiveAdvantage: statRatio - 1.0,
    reasoning: generateWinProbabilityReasoning(statRatio, fairFightMultiplier, winProbability)
  };
}

/**
 * Generate educational reasoning for win probability
 */
function generateWinProbabilityReasoning(statRatio, ff, winProb) {
  const advantage = ((statRatio - 1) * 100).toFixed(1);
  
  let reasoning = '';
  
  if (statRatio >= 1.5) {
    reasoning = `You have a ${advantage}% stat advantage. Combined with your FF multiplier of ${ff}x, this gives you strong dominance. `;
    reasoning += `Your effective stats are ${statRatio.toFixed(2)}x their total, meaning you'll deal significantly more damage per round. `;
    reasoning += `\n\n💡 **Why this works:** In Torn combat, a 50%+ stat advantage typically means you'll win 3-5 rounds faster, taking minimal damage.`;
  } else if (statRatio >= 1.2) {
    reasoning = `You have a ${advantage}% stat advantage with ${ff}x FF multiplier. This is a solid edge but not overwhelming. `;
    reasoning += `Expect a competitive fight where your higher stats give you the upper hand. `;
    reasoning += `\n\n💡 **Strategy tip:** Use temporary weapons or boosters to maximize this advantage and ensure victory.`;
  } else if (statRatio >= 1.0) {
    reasoning = `Nearly even match with slight ${advantage}% advantage. Your FF multiplier (${ff}x) helps but this could go either way. `;
    reasoning += `\n\n⚠️ **Risk:** With close stats, weapon choice and RNG matter more. Consider if the respect reward justifies the risk.`;
  } else {
    const disadvantage = ((1 - statRatio) * 100).toFixed(1);
    reasoning = `You're at a ${disadvantage}% stat disadvantage. Even with FF ${ff}x, they have the edge. `;
    reasoning += `\n\n❌ **Not recommended:** High chance of hospitalization. Save your energy for better targets.`;
  }
  
  return reasoning;
}

/**
 * Assess all risks for an attack
 */
export function assessRisks(userStats, targetStats, targetStatus, respectValue, energyCost) {
  const risks = {
    overall: 'low',
    categories: [],
    warnings: [],
    opportunities: []
  };
  
  const winCalc = calculateWinProbability(userStats, targetStats, 1.0);
  
  // 1. Combat Risk
  if (winCalc.probability < 0.5) {
    risks.categories.push({
      type: 'Combat Risk',
      level: 'high',
      description: `${(winCalc.probability * 100).toFixed(0)}% win chance - likely hospitalization`,
      impact: 'You lose respect, waste energy, and get hospitalized for hours',
      icon: '🏥'
    });
    risks.warnings.push('High chance of losing this fight');
    risks.overall = 'high';
  } else if (winCalc.probability < 0.7) {
    risks.categories.push({
      type: 'Combat Risk',
      level: 'medium',
      description: 'Competitive fight - could go either way',
      impact: 'Uncertain outcome, possible energy waste',
      icon: '⚔️'
    });
    risks.overall = 'medium';
  }
  
  // 2. Energy Efficiency Risk
  const respectPerEnergy = respectValue / energyCost;
  if (respectPerEnergy < 5) {
    risks.categories.push({
      type: 'Energy Waste',
      level: 'high',
      description: `Only ${respectPerEnergy.toFixed(1)} respect per energy`,
      impact: 'Better targets available with higher respect/energy ratio',
      icon: '⚡'
    });
    risks.warnings.push('Low energy efficiency - consider other targets');
  } else if (respectPerEnergy > 15) {
    risks.opportunities.push({
      type: 'High Value',
      description: `Excellent ${respectPerEnergy.toFixed(1)} respect per energy!`,
      icon: '💎'
    });
  }
  
  // 3. Timing Risk
  if (targetStatus === 'online') {
    risks.categories.push({
      type: 'Timing Risk',
      level: 'medium',
      description: 'Target is online - might use medical items',
      impact: 'They could heal mid-fight or escape',
      icon: '👁️'
    });
    risks.warnings.push('Target online - consider waiting until offline');
  } else if (targetStatus === 'hospital') {
    risks.opportunities.push({
      type: 'Hospitalized',
      description: 'Target already hospitalized - free respect!',
      icon: '🎯'
    });
  }
  
  // 4. Opportunity Cost
  // This would compare against other available targets
  // For now, just flag if this seems suboptimal
  if (respectPerEnergy < 8 && winCalc.probability < 0.8) {
    risks.categories.push({
      type: 'Opportunity Cost',
      level: 'medium',
      description: 'Moderate reward with moderate risk',
      impact: 'You might find safer, higher-value targets',
      icon: '🎲'
    });
  }
  
  return risks;
}

/**
 * Recommend optimal weapon loadout for a target
 */
export function recommendWeaponLoadout(userStats, targetStats, situation = 'standard') {
  const loadouts = [];
  
  // Analyze target's stat distribution
  const targetTotal = targetStats.strength + targetStats.defense + targetStats.speed + targetStats.dexterity;
  const statBreakdown = {
    strength: targetStats.strength / targetTotal,
    defense: targetStats.defense / targetTotal,
    speed: targetStats.speed / targetTotal,
    dexterity: targetStats.dexterity / targetTotal
  };
  
  // Find their strongest and weakest stats
  const strongestStat = Object.entries(statBreakdown).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  const weakestStat = Object.entries(statBreakdown).reduce((a, b) => a[1] < b[1] ? a : b)[0];
  
  // PRIMARY LOADOUT - Exploit their weakness
  let primaryWeapon, primaryReason;
  if (weakestStat === 'defense') {
    primaryWeapon = 'Rifle';
    primaryReason = `Their defense (${(statBreakdown.defense * 100).toFixed(0)}% of stats) is weakest. Rifles deal high damage that penetrates low defense.`;
  } else if (weakestStat === 'speed') {
    primaryWeapon = 'SMG';
    primaryReason = `They're slow (${(statBreakdown.speed * 100).toFixed(0)}% of stats). SMGs attack faster, landing more hits before they can react.`;
  } else if (weakestStat === 'strength') {
    primaryWeapon = 'Shotgun';
    primaryReason = `Low strength (${(statBreakdown.strength * 100).toFixed(0)}% of stats). Shotguns overwhelm weak opponents with massive burst damage.`;
  } else {
    primaryWeapon = 'Pistol';
    primaryReason = `Balanced stats. Pistol offers reliable all-around performance.`;
  }
  
  loadouts.push({
    slot: 1,
    name: 'PRIMARY',
    weapon: primaryWeapon,
    when: 'Use as your go-to weapon',
    why: primaryReason,
    priority: 'high'
  });
  
  // SECONDARY LOADOUT - Balanced backup
  loadouts.push({
    slot: 2,
    name: 'BACKUP',
    weapon: strongestStat === 'strength' ? 'Knife' : 'Club',
    when: 'If primary gets damaged or you need melee',
    why: `Melee weapons are reliable and ${strongestStat === 'strength' ? 'knives counter their strength with dexterity' : 'clubs match their power'}.`,
    priority: 'medium'
  });
  
  // SITUATIONAL LOADOUT - Temporary weapon
  loadouts.push({
    slot: 3,
    name: 'TEMPORARY',
    weapon: 'Temporary Weapon',
    when: 'For guaranteed critical hits',
    why: 'Temporary weapons (found in city) deal 2x damage. Perfect for finishing tough opponents or ensuring victory in close matches.',
    priority: situation === 'war' ? 'high' : 'low'
  });
  
  // SPECIALIST LOADOUT - Ultimate power
  if (situation === 'war' || situation === 'critical') {
    loadouts.push({
      slot: 4,
      name: 'ULTIMATE',
      weapon: 'Your Best Weapon',
      when: 'High-value targets only',
      why: 'Use your most expensive/powerful weapon for prime targets worth maximum respect. Save durability for when it really counts.',
      priority: 'situational'
    });
  }
  
  return {
    loadouts,
    quickTip: `💡 **Pro Tip:** Pre-configure these in your items. During war, quickly switch based on target - no time to think in the heat of battle!`,
    education: `**Why multiple weapons?** Different weapons exploit different weaknesses. Like a golfer choosing clubs, you need the right tool for each situation. This isn't just about damage - it's about efficiency and strategy.`
  };
}

/**
 * Calculate Xanax timing for war preparation
 */
export function calculateXanaxTimer(warStartTime, currentEnergy = 150, currentTime = Date.now()) {
  const warStart = new Date(warStartTime).getTime();
  const now = currentTime;
  const timeUntilWar = warStart - now;
  
  // Calculate energy needed
  const energyNeeded = COMBAT_CONSTANTS.XANAX.maxEnergy - currentEnergy;
  const minutesNeeded = energyNeeded * 5; // 5 mins per energy
  const timeNeededMs = minutesNeeded * 60 * 1000;
  
  // When should they take Xanax?
  const xanaxTime = warStart - timeNeededMs;
  const timeUntilXanax = xanaxTime - now;
  
  // Alert levels
  const alerts = [];
  const fiveHours = 5 * 60 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;
  const fifteenMins = 15 * 60 * 1000;
  
  if (timeUntilWar <= fifteenMins && timeUntilWar > 0) {
    alerts.push({
      level: 'critical',
      message: '⚠️ WAR STARTS IN 15 MINUTES! Stack energy NOW!',
      color: '#ff2b2b'
    });
  } else if (timeUntilWar <= oneHour && timeUntilWar > fifteenMins) {
    alerts.push({
      level: 'warning',
      message: '⏰ War in 1 hour - Prepare your energy stack',
      color: '#ff9d00'
    });
  } else if (timeUntilWar <= fiveHours && timeUntilWar > oneHour) {
    alerts.push({
      level: 'info',
      message: '📢 War approaching - Start planning your Xanax timing',
      color: '#00d2ff'
    });
  }
  
  // Calculate optimal Xanax timing
  const optimalXanaxTime = warStart - (5 * 60 * 60 * 1000); // 5 hours before
  
  return {
    warStartTime: new Date(warStart),
    currentEnergy,
    targetEnergy: COMBAT_CONSTANTS.XANAX.maxEnergy,
    energyNeeded,
    minutesNeeded,
    xanaxTime: new Date(xanaxTime),
    optimalXanaxTime: new Date(optimalXanaxTime),
    timeUntilWar: formatTimeRemaining(timeUntilWar),
    timeUntilXanax: formatTimeRemaining(timeUntilXanax),
    isReady: currentEnergy >= COMBAT_CONSTANTS.XANAX.maxEnergy,
    alerts,
    advice: generateXanaxAdvice(timeUntilWar, currentEnergy, energyNeeded)
  };
}

/**
 * Generate smart Xanax timing advice
 */
function generateXanaxAdvice(timeUntilWar, currentEnergy, energyNeeded) {
  const hours = timeUntilWar / (1000 * 60 * 60);
  
  if (currentEnergy >= COMBAT_CONSTANTS.XANAX.maxEnergy) {
    return {
      action: '✅ Ready for War',
      detail: `You're at max energy! Don't attack anyone before war starts or you'll waste stacked energy.`,
      education: `**Xanax Strategy:** The drug lets you stack to 1000E instead of normal 150E. That's 40 attacks worth of energy - but only if you don't waste it before war!`
    };
  }
  
  if (hours > 5) {
    return {
      action: '⏳ Wait to Take Xanax',
      detail: `War is ${hours.toFixed(1)} hours away. Take Xanax about 5 hours before war to maximize your stacked energy.`,
      education: `**Why wait?** Energy refills at 1 per 5 mins (12/hour, 60/5hr). If you take Xanax too early, you hit 1000E before war starts and waste potential energy generation.`
    };
  }
  
  if (hours <= 5 && hours > 1) {
    const hoursToFull = energyNeeded / 12; // 12 energy per hour
    return {
      action: '💊 Take Xanax Soon',
      detail: `You need ${energyNeeded} energy, which takes ${hoursToFull.toFixed(1)} hours. Take Xanax now to be ready!`,
      education: `**Perfect timing:** Taking Xanax now means you'll hit 1000E right around war start. This maximizes your combat potential without wasting any energy ticks.`
    };
  }
  
  if (hours <= 1) {
    return {
      action: '🚨 TAKE XANAX IMMEDIATELY',
      detail: `War starts in less than an hour! You need ${energyNeeded} energy but might not reach 1000E in time. Take Xanax NOW!`,
      education: `**Emergency mode:** Even partial energy stacking is better than nothing. Take Xanax immediately and use whatever energy you get.`
    };
  }
  
  return {
    action: 'Calculate Timing',
    detail: 'Monitor war schedule and plan accordingly',
    education: 'Proper Xanax timing is the difference between 150 energy (6 attacks) and 1000 energy (40 attacks) in war.'
  };
}

/**
 * Format milliseconds into human-readable time
 */
function formatTimeRemaining(ms) {
  if (ms < 0) return 'War has started!';
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Generate complete combat recommendation
 */
export function generateCombatRecommendation(userStats, targetStats, targetInfo, context = {}) {
  const { fairFightMultiplier = 1.0, warMode = false, warStartTime = null } = context;
  
  // Calculate core metrics
  const winCalc = calculateWinProbability(userStats, targetStats, fairFightMultiplier);
  const risks = assessRisks(userStats, targetStats, targetInfo.status, targetInfo.respectValue, 25);
  const weapons = recommendWeaponLoadout(userStats, targetStats, warMode ? 'war' : 'standard');
  
  // Xanax timer if war mode
  let xanaxTimer = null;
  if (warMode && warStartTime) {
    xanaxTimer = calculateXanaxTimer(warStartTime);
  }
  
  // Overall recommendation
  let recommendation, color;
  if (winCalc.probability >= 0.85 && risks.overall !== 'high') {
    recommendation = 'RECOMMENDED';
    color = '#00ff9c';
  } else if (winCalc.probability >= 0.6 && risks.overall === 'low') {
    recommendation = 'ACCEPTABLE';
    color = '#ff9d00';
  } else if (winCalc.probability >= 0.4) {
    recommendation = 'RISKY';
    color = '#00d2ff';
  } else {
    recommendation = 'AVOID';
    color = '#ff2b2b';
  }
  
  return {
    verdict: {
      action: recommendation,
      color,
      confidence: winCalc.confidence
    },
    winProbability: winCalc,
    riskAssessment: risks,
    weaponLoadouts: weapons,
    xanaxTimer,
    tacticalAdvice: generateTacticalAdvice(winCalc, risks, targetInfo),
    educationalNotes: generateEducationalNotes(winCalc, risks)
  };
}

/**
 * Generate specific tactical advice
 */
function generateTacticalAdvice(winCalc, risks, targetInfo) {
  const advice = [];
  
  // Win probability based
  if (winCalc.probability >= 0.85) {
    advice.push({
      title: 'High Confidence Strike',
      detail: 'Attack immediately if energy allows. This is a solid win.',
      priority: 'high'
    });
  } else if (winCalc.probability < 0.5) {
    advice.push({
      title: 'Retreat Recommended',
      detail: 'Find easier targets. Hospitalization sets you back hours.',
      priority: 'critical'
    });
  }
  
  // Target status based
  if (targetInfo.status === 'online') {
    advice.push({
      title: 'Wait for Offline',
      detail: 'Target could heal or escape. Attack when offline for guaranteed isolation.',
      priority: 'medium'
    });
  } else if (targetInfo.status === 'hospital') {
    advice.push({
      title: 'Free Respect',
      detail: 'Hospitalized targets can\'t defend. Easy respect while they\'re down.',
      priority: 'high'
    });
  }
  
  // Energy efficiency
  if (risks.opportunities.some(o => o.type === 'High Value')) {
    advice.push({
      title: 'Premium Target',
      detail: 'Excellent respect-to-energy ratio. Prioritize this over lower-value targets.',
      priority: 'high'
    });
  }
  
  return advice;
}

/**
 * Generate educational notes to help player learn
 */
function generateEducationalNotes(winCalc, risks) {
  const notes = [];
  
  notes.push({
    concept: 'Win Probability',
    explanation: 'Based on your total stats vs theirs, adjusted for FF multiplier. Higher ratio = higher chance of victory.',
    example: `Your ${winCalc.statRatio.toFixed(2)}x advantage means you'll typically win in fewer rounds with less damage taken.`
  });
  
  if (risks.categories.some(r => r.type === 'Energy Waste')) {
    notes.push({
      concept: 'Energy Efficiency',
      explanation: 'Respect gained per 25 energy spent. Smart players maximize this ratio.',
      example: 'Hitting 10 low-value targets (50 respect each, 500 total) wastes more energy than 2 high-value targets (300 each, 600 total).'
    });
  }
  
  notes.push({
    concept: 'Risk vs Reward',
    explanation: 'Balance potential respect gain against chance of hospitalization.',
    example: 'A 40% win chance for 500 respect isn\'t worth risking hours in hospital. Find safer targets.'
  });
  
  return notes;
}

export default {
  calculateWinProbability,
  assessRisks,
  recommendWeaponLoadout,
  calculateXanaxTimer,
  generateCombatRecommendation,
  COMBAT_CONSTANTS
};
