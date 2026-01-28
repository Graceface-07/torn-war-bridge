# 🤖 DISCORD BOT - SIMPLE SETUP

## ✨ THIS IS WHAT YOU WANTED!

**A simple Discord bot that:**
- ✅ Runs 24/7 automatically
- ✅ Works in your Discord server
- ✅ Simple commands
- ✅ Just fun!

---

## 🚀 SUPER SIMPLE SETUP (5 Minutes)

### Step 1: Create Discord Bot

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "Torn War Bridge"
4. Go to "Bot" tab
5. Click "Reset Token" and COPY the token
6. Enable these under "Privileged Gateway Intents":
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT

### Step 2: Deploy to Railway (FREE - Always Running)

**ONE CLICK:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Graceface-07/torn-war-bridge)

Then add these variables in Railway:
- `DISCORD_TOKEN` = (your bot token from step 1)
- `FF_SCOUTER_KEY` = (your FF Scouter key)
- `TORN_API_KEY` = (your Torn API key)

**DONE!** Your bot is now online 24/7! 🎉

### Step 3: Invite Bot to Your Server

The bot will show you an invite link when it starts, OR:

Go to: `https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=2048&scope=bot%20applications.commands`

(Replace YOUR_BOT_ID with your bot's ID from Discord Developer Portal)

---

## 🎮 HOW TO USE

Once the bot is in your server:

### Scan a Faction
```
/scan user_id:YOUR_ID faction_id:ENEMY_FACTION_ID
```

The bot will:
- ✅ Scan all members
- ✅ Show you who you can beat
- ✅ Categorize targets (Secure/Prime/Risky/Suicide)

### Get War Analysis
```
/war-analysis
```

The bot shows:
- ✅ Win rate percentage
- ✅ Tactical verdict
- ✅ Top 10 priority targets
- ✅ Strategic recommendations

### Help
```
/help
```

---

## 🎯 EXAMPLE

```
You: /scan user_id:123456 faction_id:789

Bot: 🎯 Scanning Faction XYZ... 15/30
     
     ✅ Scan Complete!
     🟢 Secure: 12
     🔵 Prime: 8
     🟠 Risky: 7
     🔴 Suicide: 3

You: /war-analysis

Bot: ⚔️ War Analysis: Faction XYZ
     📊 Tactical Verdict: Highly Favorable - Attack Now!
     📈 Win Rate: 66.7% Beatable
     
     🎯 Priority Targets:
     1. PlayerName [45] - 🔵 Prime
     2. OtherPlayer [38] - 🟢 Secure
     ...
```

---

## 🌟 WHY THIS IS BETTER

**OLD WAY (Web App):**
- ❌ Complicated deployment
- ❌ Need to open browser
- ❌ Hard to share
- ❌ Not always on

**NEW WAY (Discord Bot):**
- ✅ One command in Discord
- ✅ Always running (24/7)
- ✅ Everyone in server can use
- ✅ Simple and fun!

---

## 🆓 FREE HOSTING OPTIONS

### Railway (RECOMMENDED)
- ✅ Free tier (500 hours/month)
- ✅ One-click deploy
- ✅ Always running
- ✅ Auto-restarts

### Replit
1. Go to https://replit.com
2. Create new Repl
3. Upload files
4. Add secrets (environment variables)
5. Run!

### Heroku
```bash
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge
heroku create
heroku config:set DISCORD_TOKEN=your_token
heroku config:set FF_SCOUTER_KEY=your_key
heroku config:set TORN_API_KEY=your_key
git push heroku main
```

---

## 🔧 LOCAL TESTING (Optional)

If you want to test first:

```bash
# Install
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your tokens

# Run
npm start
```

---

## ❓ TROUBLESHOOTING

**Bot is offline:**
- Check Railway logs
- Verify DISCORD_TOKEN is correct
- Make sure bot has permissions

**Commands don't appear:**
- Wait 1 hour (Discord caches)
- Or kick and re-invite bot

**Scan fails:**
- Verify API keys are correct
- Check you have FF Scouter access

---

## 🎉 THAT'S IT!

**Just 3 steps:**
1. Create Discord bot (2 min)
2. Deploy to Railway (1 click)
3. Invite to your server (1 click)

**Then just type `/scan` in Discord and have fun!** 🎮

No complicated web stuff, no localhost, no deployment confusion.

**Just a simple bot that works!** 🤖✨
