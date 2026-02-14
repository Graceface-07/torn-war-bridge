const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, Events } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const COLORS = { bg: "#121212", teal: "#008080", amber: "#FFBF00" };

// HARDCODED CREDENTIALS
const TORN_KEY = "gc43XVxOpCcwLnY6";
const DISCORD_TOKEN = "MTQ3MjE2MjkzNzkxMjQyNjU3OA.GjlM8_.uazSQIme4HEPiGZOPw08O6iGB1QHLknkZWjrf4";

// HIGH-INFLUENCE ROLES (PERK_RYAN DATA)
const ROLES = {
    "hacker": { name: "Hacker", crimes: ["cracking", "hacking"], influence: 0.1209 },
    "driver": { name: "Driver", crimes: ["bootlegging", "logistics"], influence: 0.0763 },
    "muscle": { name: "Muscle", crimes: ["disposal", "murder"], influence: 0.1170 },
    "impersonator": { name: "Impersonator", crimes: ["scams"], influence: 0.1263 },
    "thief": { name: "Cat Burglar", crimes: ["burglary"], influence: 0.0863 }
};

client.once(Events.ClientReady, () => console.log('--- CRIMES 2.0 PURIST ONLINE ---'));

client.on('messageCreate', async (msg) => {
    if (msg.author.bot || msg.content !== '!analyser') return;

    try {
        const res = await axios.get('https://api.torn.com/user/?selections=crimes,personalstats,profile&key=' + TORN_KEY);
        const d = res.data;

        if (!d.crimes) return msg.reply("CRITICAL: This account is NOT on Crimes 2.0. Analyzer aborted.");

        let scores = Object.keys(ROLES).map(k => {
            const r = ROLES[k];
            const avg = r.crimes.reduce((acc, c) => acc + (d.crimes[c]?.skill || 0), 0) / r.crimes.length;
            return { name: r.name, score: avg, influence: r.influence };
        }).sort((a, b) => b.score - a.score);

        const embed = new EmbedBuilder()
            .setTitle('[ 2.0 OPERATIVE: ' + d.name.toUpperCase() + ' ]')
            .setColor(COLORS.teal)
            .addFields(
                { name: '⭐ OPTIMAL', value: scores[0].name + ' (' + scores[0].score.toFixed(1) + '%)', inline: true },
                { name: '🔥 HIGH INFLUENCE', value: 'Impersonator / Hacker', inline: true }
            )
            .setDescription("CRIMES 1.0 EXCLUDED. Showing 2.0 Skill progression only.");

        await msg.channel.send({ embeds: [embed] });
    } catch (e) { console.error("2.0 EXECUTION ERROR:", e.message); }
});

client.login(DISCORD_TOKEN);
