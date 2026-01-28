# 🚀 START HERE - Use It RIGHT NOW

## ⚡ FASTEST WAY TO USE IT (30 Seconds)

### OPTION 1: Discord Bot (What you wanted!)

**Step 1: Get a Discord Bot Token**
1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name it anything
3. Go to "Bot" tab → Click "Reset Token" → COPY IT
4. Enable "MESSAGE CONTENT INTENT" and "SERVER MEMBERS INTENT"

**Step 2: Run It**
```bash
cd torn-war-bridge

# Create .env file
echo "DISCORD_TOKEN=PASTE_YOUR_TOKEN_HERE" > .env
echo "FF_SCOUTER_KEY=rwLgZTyqgWDxhoCx" >> .env
echo "TORN_API_KEY=CZP2D2ZnbXWsYiDT" >> .env

# Install and run
npm install
npm start
```

**Step 3: Invite Bot**
The console will show a link like:
```
https://discord.com/api/oauth2/authorize?client_id=123456...
```
Click it to add bot to your Discord server!

**Step 4: Use It**
In Discord, type:
```
/scan user_id:YOUR_TORN_ID faction_id:ENEMY_FACTION_ID
/war-analysis
```

**DONE!** 🎉

---

## OPTION 2: Keep It Running 24/7 (Railway - FREE)

1. Push this code to GitHub (or use the existing repo)
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repo
5. Add environment variables:
   - `DISCORD_TOKEN` = your bot token
   - `FF_SCOUTER_KEY` = rwLgZTyqgWDxhoCx
   - `TORN_API_KEY` = CZP2D2ZnbXWsYiDT
6. Deploy!

**Your bot runs 24/7 for FREE!** 

---

## 🎯 THAT'S IT!

**Local testing:** Just run `npm start` after setting up .env
**Always-on bot:** Deploy to Railway once

**No complicated web hosting, no external URLs, no browser needed.**

**Just Discord commands!** 🤖
