// =====================================================
// OC 2.0 PERSONAL READINESS BOT — CLEAN UI EDITION
// =====================================================
// index.js
// End-to-end OC 2.0 readiness using Torn v2: faction crimes + user skills

import axios from 'axios';

// ===== CONFIG =====
const TORN_API_KEY = "rKP5EwA6DmSufqEm";   // ← paste your temporary key here
const FACTION_ID = 42505;          // BoW - Hidden Shadows
const BASE_URL = 'https://api.torn.com/v2';

// Role → primary crime skill stat
const ROLE_SKILL_MAP = {
  Picklock: 'crackingskill',
  Hacker: 'cardskimmingskill',
  Techie: 'cardskimmingskill',
  Engineer: 'forgeryskill',
  Bomber: 'arsonskill',
  Muscle: 'hustlingskill',
  Enforcer: 'hustlingskill',
  Looter: 'burglaryskill',
  Thief: 'pickpocketingskill',
  Lookout: 'searchforcashskill',
  Sniper: 'huntingskill',
  Driver: 'bootleggingskill',
  Robber: 'shopliftingskill',
  Hustler: 'hustlingskill',
  Negotiator: 'scammingskill',
  Imitator: 'graffitiskill',
  Kidnapper: 'burglaryskill',
  Assassin: 'huntingskill',
  Car: 'bootleggingskill'
};

// All skills we care about
const SKILL_STATS = [
  'graffitiskill',
  'shopliftingskill',
  'pickpocketingskill',
  'cardskimmingskill',
  'scammingskill',
  'burglaryskill',
  'hustlingskill',
  'forgeryskill',
  'huntingskill',
  'arsonskill',
  'racingskill',
  'disposalskill',
  'crackingskill',
  'bootleggingskill',
  'searchforcashskill'
];

// ===== API HELPERS =====

async function fetchFactionCrimes() {
  const url = `${BASE_URL}/faction/${FACTION_ID}/basic,crimes?cat=available,completed&striptags=true&key=${API_KEY}`;
  const { data } = await axios.get(url);
  return data.crimes || {};
}

async function fetchUserSkills(userId) {
  const statParam = SKILL_STATS.join(',');
  const url = `${BASE_URL}/user?cat=stats&stat=${statParam}&user=${userId}&key=${API_KEY}`;
  const { data } = await axios.get(url);
  return data.stats || {};
}

// ===== CORE LOGIC =====

function getRoleKey(positionName) {
  if (!positionName) return null;
  const base = positionName.trim();

  if (ROLE_SKILL_MAP[base]) return base;

  if (base.includes('Car Thief')) return 'Car';
  if (base.includes('Thief')) return 'Thief';
  if (base.includes('Muscle')) return 'Muscle';
  if (base.includes('Looter')) return 'Looter';
  if (base.includes('Hacker')) return 'Hacker';
  if (base.includes('Techie')) return 'Techie';
  if (base.includes('Engineer')) return 'Engineer';
  if (base.includes('Bomber')) return 'Bomber';
  if (base.includes('Sniper')) return 'Sniper';
  if (base.includes('Lookout')) return 'Lookout';
  if (base.includes('Robber')) return 'Robber';
  if (base.includes('Hustler')) return 'Hustler';
  if (base.includes('Negotiator')) return 'Negotiator';
  if (base.includes('Imitator')) return 'Imitator';
  if (base.includes('Kidnapper')) return 'Kidnapper';
  if (base.includes('Assassin')) return 'Assassin';

  return null;
}

function computeSlotReadiness(slot, userSkills) {
  if (!slot.user || !slot.user.id) return null;

  const roleKey = getRoleKey(slot.position);
  if (!roleKey) return { userId: slot.user.id, role: slot.position, skill: null, value: null, readiness: null };

  const skillStat = ROLE_SKILL_MAP[roleKey];
  const value = userSkills[skillStat] ?? 0;

  const MAX_SKILL = 1000;
  const readiness = Math.max(0, Math.min(100, (value / MAX_SKILL) * 100));

  return {
    userId: slot.user.id,
    role: slot.position,
    skill: skillStat,
    value,
    readiness: Number(readiness.toFixed(1))
  };
}

function computeCrimeReadiness(crime, userSkillsById) {
  const slotResults = [];
  let sum = 0;
  let count = 0;

  for (const slot of crime.slots || []) {
    if (!slot.user || !slot.user.id) continue;
    const uid = slot.user.id;
    const skills = userSkillsById[uid];

    if (!skills) {
      slotResults.push({
        userId: uid,
        role: slot.position,
        skill: null,
        value: null,
        readiness: null
      });
      continue;
    }

    const res = computeSlotReadiness(slot, skills);
    slotResults.push(res);

    if (res && res.readiness != null) {
      sum += res.readiness;
      count++;
    }
  }

  const avgReadiness = count ? Number((sum / count).toFixed(1)) : null;

  return {
    crimeId: crime.id,
    name: crime.name,
    difficulty: crime.difficulty,
    status: crime.status,
    averageReadiness: avgReadiness,
    slots: slotResults
  };
}

// ===== ORCHESTRATION =====

async function buildReadinessForFactionCrimes(targetUserIds = []) {
  const crimesData = await fetchFactionCrimes();
  const allCrimes = [
    ...(crimesData.available || []),
    ...(crimesData.completed || [])
  ];

  const userIdsSet = new Set();
  for (const crime of allCrimes) {
    for (const slot of crime.slots || []) {
      if (slot.user && slot.user.id) {
        userIdsSet.add(slot.user.id);
      }
    }
  }

  const userIds = targetUserIds.length ? targetUserIds : Array.from(userIdsSet);

  const userSkillsById = {};
  for (const uid of userIds) {
    try {
      const skills = await fetchUserSkills(uid);
      userSkillsById[uid] = skills;
    } catch {
      userSkillsById[uid] = null;
    }
  }

  const readinessResults = allCrimes.map((crime) =>
    computeCrimeReadiness(crime, userSkillsById)
  );

  return readinessResults;
}

// ===== CLI ENTRY =====

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2).map(Number).filter(Boolean);

  buildReadinessForFactionCrimes(args)
    .then((res) => console.log(JSON.stringify(res, null, 2)))
    .catch((err) => {
      console.error('Error:', err?.response?.data || err.message || err);
      process.exit(1);
    });
}
