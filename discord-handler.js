/**
 * DISCORD INTERACTION HANDLER
 * Handles Discord slash commands and interactions
 */

import { verifyKey } from 'discord-interactions';
import { combatIntelligence } from './combat-intelligence';

/**
 * Handle Discord interactions
 */
export async function handleDiscordInteraction(request, env) {
  // Verify Discord signature
  const signature = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');
  const body = await request.text();
  
  const isValidRequest = verifyKey(
    body,
    signature,
    timestamp,
    env.DISCORD_PUBLIC_KEY
  );
  
  if (!isValidRequest) {
    return new Response('Invalid request signature', { status: 401 });
  }
  
  const interaction = JSON.parse(body);
  
  // Handle Discord PING (verification)
  if (interaction.type === 1) {
    return jsonResponse({ type: 1 });
  }
  
  // Handle slash commands
  if (interaction.type === 2) {
    return await handleCommand(interaction, env);
  }
  
  return new Response('Unknown interaction type', { status: 400 });
}

/**
 * Handle slash commands
 */
async function handleCommand(interaction, env) {
  const { data } = interaction;
  
  switch (data.name) {
    case 'analyze':
      return await handleAnalyzeCommand(interaction, env);
    
    case 'war-timer':
      return await handleWarTimerCommand(interaction, env);
    
    case 'loadout':
      return await handleLoadoutCommand(interaction, env);
    
    case 'setup':
      return await handleSetupCommand(interaction, env);
    
    default:
      return jsonResponse({
        type: 4,
        data: {
          content: '❌ Unknown command'
        }
      });
  }
}

/**
 * Command: /analyze <target_id>
 * Analyze a target and provide recommendations
 */
async function handleAnalyzeCommand(interaction, env) {
  const targetId = interaction.data.options?.find(opt => opt.name === 'target')?.value;
  
  if (!targetId) {
    return jsonResponse({
      type: 4,
      data: {
        content: '❌ Please provide a target ID',
        flags: 64 // Ephemeral (only visible to user)
      }
    });
  }
  
  // Get user data
  const userId = interaction.member.user.id;
  const userData = await env.TORN_DATA.get(`user:discord:${userId}`);
  
  if (!userData) {
    return jsonResponse({
      type: 4,
      data: {
        content: '❌ Please set up your account first with `/setup`',
        flags: 64
      }
    });
  }
  
  const user = JSON.parse(userData);
  
  // Get target data from spy database or Torn API
  const targetData = await getTargetData(targetId, env);
  
  if (!targetData) {
    return jsonResponse({
      type: 4,
      data: {
        content: `❌ Could not find data for target ${targetId}`,
        flags: 64
      }
    });
  }
  
  // Analyze target
  const analysis = combatIntelligence.generateCombatRecommendation(
    user.stats,
    targetData.stats,
    targetData,
    { fairFightMultiplier: targetData.ffMultiplier || 1.0 }
  );
  
  // Create Discord embed
  const embed = createAnalysisEmbed(targetData, analysis);
  
  return jsonResponse({
    type: 4,
    data: {
      embeds: [embed]
    }
  });
}

/**
 * Command: /war-timer <war_start_time>
 * Show Xanax war timer
 */
async function handleWarTimerCommand(interaction, env) {
  const warTime = interaction.data.options?.find(opt => opt.name === 'time')?.value;
  
  if (!warTime) {
    return jsonResponse({
      type: 4,
      data: {
        content: '❌ Please provide war start time (e.g., "2024-02-07 20:00")',
        flags: 64
      }
    });
  }
  
  const userId = interaction.member.user.id;
  const userData = await env.TORN_DATA.get(`user:discord:${userId}`);
  const user = userData ? JSON.parse(userData) : { currentEnergy: 150 };
  
  const warStartTime = new Date(warTime).getTime();
  const xanaxData = combatIntelligence.calculateXanaxTimer(warStartTime, user.currentEnergy);
  
  const embed = {
    title: '⏰ XANAX WAR TIMER',
    color: 0xff9d00,
    fields: [
      {
        name: 'Time Until War',
        value: xanaxData.timeUntilWar,
        inline: true
      },
      {
        name: 'Current Energy',
        value: `${xanaxData.currentEnergy} / 1000`,
        inline: true
      },
      {
        name: 'Energy Needed',
        value: `${xanaxData.energyNeeded}`,
        inline: true
      },
      {
        name: xanaxData.advice.action,
        value: xanaxData.advice.detail,
        inline: false
      }
    ],
    footer: {
      text: '💡 Energy refills at 1 per 5 minutes (12/hour)'
    }
  };
  
  return jsonResponse({
    type: 4,
    data: {
      embeds: [embed]
    }
  });
}

/**
 * Command: /loadout <target_id>
 * Get weapon loadout recommendations
 */
async function handleLoadoutCommand(interaction, env) {
  const targetId = interaction.data.options?.find(opt => opt.name === 'target')?.value;
  
  if (!targetId) {
    return jsonResponse({
      type: 4,
      data: {
        content: '❌ Please provide a target ID',
        flags: 64
      }
    });
  }
  
  const userId = interaction.member.user.id;
  const userData = await env.TORN_DATA.get(`user:discord:${userId}`);
  
  if (!userData) {
    return jsonResponse({
      type: 4,
      data: {
        content: '❌ Please set up your account first with `/setup`',
        flags: 64
      }
    });
  }
  
  const user = JSON.parse(userData);
  const targetData = await getTargetData(targetId, env);
  
  if (!targetData) {
    return jsonResponse({
      type: 4,
      data: {
        content: `❌ Could not find data for target ${targetId}`,
        flags: 64
      }
    });
  }
  
  const weapons = combatIntelligence.recommendWeaponLoadout(user.stats, targetData.stats);
  
  const embed = {
    title: `🎯 WEAPON LOADOUT for ${targetData.name}`,
    color: 0xff9d00,
    description: weapons.quickTip,
    fields: weapons.loadouts.map(loadout => ({
      name: `${loadout.slot}. ${loadout.name} - ${loadout.weapon}`,
      value: `**When:** ${loadout.when}\n**Why:** ${loadout.why}`,
      inline: false
    })),
    footer: {
      text: weapons.education
    }
  };
  
  return jsonResponse({
    type: 4,
    data: {
      embeds: [embed]
    }
  });
}

/**
 * Command: /setup
 * Set up user account
 */
async function handleSetupCommand(interaction, env) {
  // This would show a modal for user to input their data
  // For now, return instructions
  
  return jsonResponse({
    type: 4,
    data: {
      content: `🛠️ **Account Setup**\n\nPlease visit the web interface to set up your account:\n${env.WORKER_URL || 'https://your-worker.workers.dev'}\n\nYou'll need:\n• Your Torn user ID\n• Total battle stats\n• Faction ID`,
      flags: 64
    }
  });
}

/**
 * Create analysis embed for Discord
 */
function createAnalysisEmbed(target, analysis) {
  const { verdict, winProbability, weaponLoadouts, riskAssessment } = analysis;
  
  let color;
  switch (verdict.action) {
    case 'RECOMMENDED': color = 0x00ff9c; break;
    case 'ACCEPTABLE': color = 0xff9d00; break;
    case 'RISKY': color = 0x00d2ff; break;
    case 'AVOID': color = 0xff2b2b; break;
    default: color = 0x888888;
  }
  
  return {
    title: `⚔️ COMBAT ANALYSIS: ${target.name}`,
    color,
    fields: [
      {
        name: '🎯 Verdict',
        value: verdict.action,
        inline: true
      },
      {
        name: '📊 Win Chance',
        value: `${(winProbability.probability * 100).toFixed(0)}%`,
        inline: true
      },
      {
        name: '🛡️ Confidence',
        value: winProbability.confidence.toUpperCase(),
        inline: true
      },
      {
        name: '💡 Analysis',
        value: winProbability.reasoning.substring(0, 500) + '...',
        inline: false
      },
      {
        name: '🔫 Primary Weapon',
        value: weaponLoadouts.loadouts[0].weapon,
        inline: true
      },
      {
        name: '⚠️ Risk Level',
        value: riskAssessment.overall.toUpperCase(),
        inline: true
      }
    ],
    footer: {
      text: `Stat Ratio: ${winProbability.statRatio.toFixed(2)}x • FF: ${target.ffMultiplier}x`
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Get target data from spy database or Torn API
 */
async function getTargetData(targetId, env) {
  // First, check spy database
  const spyData = await env.TORN_DATA.get(`spy:${targetId}`);
  
  if (spyData) {
    return JSON.parse(spyData);
  }
  
  // If not in spy database, fetch from Torn API (if available)
  // This would require the user's Torn API key
  // For now, return null if not found
  
  return null;
}

/**
 * Helper to create JSON response
 */
function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
