// Torn War Bridge - Discord Bot
// Simple bot for faction analysis in Discord

const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Configuration
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const FF_SCOUTER_KEY = process.env.FF_SCOUTER_KEY;
const TORN_API_KEY = process.env.TORN_API_KEY;

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ]
});

// Store scan results temporarily
const scanResults = new Map();

// Helper function to get tier based on stats
function getTier(targetStats, myStats) {
    const ratio = targetStats / myStats;
    if (ratio < 0.5) return { name: 'Secure', color: 0x10b981, emoji: '🟢' };
    if (ratio < 1.0) return { name: 'Prime', color: 0x3b82f6, emoji: '🔵' };
    if (ratio < 2.0) return { name: 'Risky', color: 0xf59e0b, emoji: '🟠' };
    return { name: 'Suicide', color: 0xef4444, emoji: '🔴' };
}

// Scan faction command
async function scanFaction(interaction, userId, factionId) {
    await interaction.deferReply();

    try {
        // Get user stats
        const userResponse = await axios.get(
            `https://api.torn.com/v2/user/${userId}?key=${TORN_API_KEY}`,
            { timeout: 10000 }
        );
        const myStats = userResponse.data.battle_stats?.total || 0;

        // Get faction members
        const factionResponse = await axios.get(
            `https://api.torn.com/v2/faction/${factionId}/members?key=${TORN_API_KEY}`,
            { timeout: 10000 }
        );
        const members = factionResponse.data.members || {};
        const factionName = factionResponse.data.name || `Faction ${factionId}`;

        const targets = [];
        let scanned = 0;
        const total = Object.keys(members).length;

        // Send initial progress
        await interaction.editReply(`🎯 Scanning ${factionName}... 0/${total}`);

        for (const [memberId, member] of Object.entries(members)) {
            try {
                // Get battle stats from FF Scouter
                const scoutResponse = await axios.get(
                    `https://www.ff-scouter.com/api/v1/user/${memberId}/battlestats.json?key=${FF_SCOUTER_KEY}`,
                    { timeout: 10000 }
                );

                const targetStats = scoutResponse.data?.estimated_battle_stats || 0;
                const tier = getTier(targetStats, myStats);

                targets.push({
                    id: memberId,
                    name: member.name,
                    level: member.level,
                    stats: targetStats,
                    tier: tier,
                    status: member.status
                });

                scanned++;
                
                // Update progress every 5 members
                if (scanned % 5 === 0) {
                    await interaction.editReply(`🎯 Scanning ${factionName}... ${scanned}/${total}`);
                }

                // Rate limit
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`Error scanning ${memberId}:`, error.message);
            }
        }

        // Store results
        scanResults.set(interaction.user.id, {
            targets,
            factionName,
            userId,
            myStats,
            timestamp: Date.now()
        });

        // Create summary embed
        const tiers = {
            secure: targets.filter(t => t.tier.name === 'Secure').length,
            prime: targets.filter(t => t.tier.name === 'Prime').length,
            risky: targets.filter(t => t.tier.name === 'Risky').length,
            suicide: targets.filter(t => t.tier.name === 'Suicide').length,
        };

        const embed = new EmbedBuilder()
            .setTitle(`✅ Scan Complete: ${factionName}`)
            .setColor(0x10b981)
            .addFields(
                { name: '🟢 Secure', value: `${tiers.secure}`, inline: true },
                { name: '🔵 Prime', value: `${tiers.prime}`, inline: true },
                { name: '🟠 Risky', value: `${tiers.risky}`, inline: true },
                { name: '🔴 Suicide', value: `${tiers.suicide}`, inline: true },
                { name: '📊 Total Scanned', value: `${targets.length}`, inline: true },
                { name: '⚔️ Your Stats', value: `${myStats.toLocaleString()}`, inline: true }
            )
            .setFooter({ text: 'Use /war-analysis to see tactical report' })
            .setTimestamp();

        await interaction.editReply({ content: null, embeds: [embed] });

    } catch (error) {
        console.error('Scan error:', error);
        await interaction.editReply(`❌ Error: ${error.message}`);
    }
}

// War analysis command
async function warAnalysis(interaction) {
    const data = scanResults.get(interaction.user.id);

    if (!data) {
        await interaction.reply('❌ No scan data found. Use `/scan` first!');
        return;
    }

    const { targets, factionName, myStats } = data;
    const beatable = targets.filter(t => t.tier.name === 'Secure' || t.tier.name === 'Prime');
    const winRate = (beatable.length / targets.length) * 100;

    let verdict = '';
    if (winRate >= 70) verdict = '🎯 Highly Favorable - Attack Now!';
    else if (winRate >= 50) verdict = '✅ Favorable - Good Odds';
    else if (winRate >= 30) verdict = '⚠️ Challenging - Careful Strategy Needed';
    else verdict = '❌ Difficult - Consider Alternative Targets';

    // Top 10 priority targets
    const priority = beatable
        .sort((a, b) => b.stats - a.stats)
        .slice(0, 10)
        .map((t, i) => `${i + 1}. ${t.name} [${t.level}] - ${t.tier.emoji} ${t.tier.name}`)
        .join('\n') || 'None';

    const embed = new EmbedBuilder()
        .setTitle(`⚔️ War Analysis: ${factionName}`)
        .setColor(winRate >= 50 ? 0x10b981 : 0xef4444)
        .addFields(
            { name: '📊 Tactical Verdict', value: verdict },
            { name: '📈 Win Rate', value: `${winRate.toFixed(1)}% Beatable` },
            { name: '🎯 Priority Targets', value: priority },
            { name: '💡 Recommendation', value: winRate >= 50 
                ? 'Strike while the odds are in your favor!' 
                : 'Focus on hit-and-run tactics. Target isolated members.' 
            }
        )
        .setFooter({ text: `Analysis based on ${targets.length} targets` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

// Bot ready event
client.once('ready', () => {
    console.log(`✅ Bot logged in as ${client.user.tag}`);
    console.log(`🌐 Invite link: https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=2048&scope=bot%20applications.commands`);
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    try {
        if (commandName === 'scan') {
            const userId = interaction.options.getString('user_id');
            const factionId = interaction.options.getString('faction_id');
            await scanFaction(interaction, userId, factionId);
        }
        else if (commandName === 'war-analysis') {
            await warAnalysis(interaction);
        }
        else if (commandName === 'help') {
            const embed = new EmbedBuilder()
                .setTitle('🎯 Torn War Bridge - Commands')
                .setColor(0x3b82f6)
                .addFields(
                    { 
                        name: '/scan', 
                        value: 'Scan a faction\nExample: `/scan user_id:123456 faction_id:789`' 
                    },
                    { 
                        name: '/war-analysis', 
                        value: 'Get tactical war analysis\n(Run after /scan)' 
                    },
                    { 
                        name: '/help', 
                        value: 'Show this help message' 
                    }
                )
                .setFooter({ text: 'Torn War Bridge Bot' });
            
            await interaction.reply({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Command error:', error);
        if (interaction.deferred) {
            await interaction.editReply(`❌ Error: ${error.message}`);
        } else {
            await interaction.reply(`❌ Error: ${error.message}`);
        }
    }
});

// Register slash commands
async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('scan')
            .setDescription('Scan a faction for war analysis')
            .addStringOption(option =>
                option.setName('user_id')
                    .setDescription('Your Torn user ID')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('faction_id')
                    .setDescription('Enemy faction ID to scan')
                    .setRequired(true)),
        
        new SlashCommandBuilder()
            .setName('war-analysis')
            .setDescription('Get tactical war analysis (run after /scan)'),
        
        new SlashCommandBuilder()
            .setName('help')
            .setDescription('Show bot commands and help')
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

    try {
        console.log('📝 Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Slash commands registered!');
    } catch (error) {
        console.error('❌ Error registering commands:', error);
    }
}

// Login to Discord
client.login(DISCORD_TOKEN).then(() => {
    setTimeout(registerCommands, 2000);
});
