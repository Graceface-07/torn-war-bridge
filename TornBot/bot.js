require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// TACTICAL HUD THEME
const COLORS = { bg: "#121212", teal: "#008080", amber: "#FFBF00", red: "#8B0000" };

// OC 2.0 ROLE DATA MAP
const ROLE_MAP = {
    "driver": { label: "Lead Driver", crimes: ["bootlegging", "logistics"], stat: "racing_skill", weight: 0.7 },
    "muscle": { label: "Enforcer / Muscle", crimes: ["disposal", "murder"], stat: "strength", weight: 0.8 },
    "hustler": { label: "The Hustler", crimes: ["hustling", "scams"], stat: "intelligence", weight: 0.6 },
    "thief": { label: "Infiltrator", crimes: ["shoplifting", "pickpocketing", "burglary"], stat: "dexterity", weight: 0.7 },
    "planner": { label: "Tactical Planner", crimes: ["forgery", "cracking"], stat: "intelligence", weight: 0.9 }
};

client.once('ready', () => console.log('OPERATIVE ANALYZER ONLINE'));

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!analyser')) return;
    const apiKey = message.content.split(' ')[1];
    if (!apiKey) return message.reply("TERMINAL ERROR: API KEY REQUIRED.");

    try {
        const res = await axios.get(`https://api.torn.com/user/?selections=crimes,personalstats,profile&key=${apiKey}`);
        const data = res.data;
        if (data.error) throw new Error(data.error.error);

        const generateRoleEmbed = (roleKey) => {
            const role = ROLE_MAP[roleKey];
            const avgCS = role.crimes.reduce((acc, c) => acc + (data.crimes[c]?.skill || 0), 0) / role.crimes.length;
            const statVal = data.personalstats[role.stat] || 0;
            
            // Logic: Success probability based on CS level vs Tier thresholds
            const readiness = Math.min(100, (avgCS / 100) * 100);
            
            const embed = new EmbedBuilder()
                .setTitle(`[ ROLE ANALYSIS: ${role.label.toUpperCase()} ]`)
                .setColor(readiness > 75 ? COLORS.teal : COLORS.amber)
                .addFields(
                    { name: 'READINESS RATING', value: `> ${readiness.toFixed(1)}%`, inline: true },
                    { name: 'PRIMARY CS', value: `${avgCS.toFixed(0)}/100`, inline: true },
                    { name: 'SUPPORT STAT', value: `${role.stat.replace('_', ' ')}: ${statVal.toLocaleString()}`, inline: false }
                );

            // Actionable advice logic
            let advice = "STABLE: You are cleared for this role in T1-T5 OCs.";
            if (readiness < 40) advice = "CRITICAL: Level up your individual crimes before attempting this role.";
            if (readiness > 85) advice = "ELITE: Optimized for High-Tier (T7+) operations.";
            
            embed.setDescription(`**COMMANDER ADVICE:** ${advice}`);
            return embed;
        };

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('role_select')
            .setPlaceholder('CHOOSE A ROLE TO ANALYZE...')
            .addOptions(Object.keys(ROLE_MAP).map(k => ({ label: ROLE_MAP[k].label, value: k })));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const mainEmbed = new EmbedBuilder()
            .setTitle(`[ TACTICAL HUD: ${data.name.toUpperCase()} ]`)
            .setDescription("Select a role below to see your specific pass rates and what you need to upgrade.")
            .setColor(COLORS.teal)
            .setFooter({ text: "SYSTEM STATUS: READY" });

        const response = await message.channel.send({ embeds: [mainEmbed], components: [row] });

        const collector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 300000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: "Unauthorized access.", ephemeral: true });
            await i.update({ embeds: [generateRoleEmbed(i.values[0])], components: [row] });
        });

    } catch (err) {
        message.reply(`SYSTEM CRASH: ${err.message}`);
    }
});

client.login(process.env.MTQ2NjExMjAzNzcwNzg0MTg1Mg.GTyJpf.qB6Hw9w5XQ43Eb7k8gsMKZN43jDdATqoQtNWec);