# 🔗 WHICH SCRIPT SHOWS A LINK?

## Quick Answer:

### Want to see the WEB DASHBOARD link?
**Run:** `run-web.bat` (Windows) or `./run-web.sh` (Mac/Linux)

**Shows:** `http://localhost:3000`

---

### Want to see the DISCORD BOT invite link?
**Run:** `setup-bot.bat` (Windows) or `./setup-bot.sh` (Mac/Linux)

**Shows:** `https://discord.com/api/oauth2/authorize?client_id=...`

---

## 📝 Detailed Explanation:

### 1️⃣ Web Dashboard Script (`run-web`)

**Shows this link:**
```
✅ Server starting on http://localhost:3000

Open your web browser and go to:
   👉 http://localhost:3000
```

**What it's for:**
- Local web browser access
- Your computer only (localhost)
- No sharing needed

**When to use:**
- You want to use it yourself in a browser
- Don't need Discord
- Just want to scan factions on your computer

---

### 2️⃣ Discord Bot Script (`setup-bot`)

**Shows this link:**
```
🌐 Invite link: https://discord.com/api/oauth2/authorize?client_id=123456&permissions=2048&scope=bot%20applications.commands
```

**What it's for:**
- Invite bot to your Discord server
- Let faction members use it
- Commands in Discord chat

**When to use:**
- You want faction to use it in Discord
- Need team collaboration
- Want `/scan` commands in Discord

---

## 🎯 What You Probably Want:

### For Personal Use:
```bash
# Windows:
run-web.bat

# Mac/Linux:
./run-web.sh
```
**Link shown:** http://localhost:3000  
**Use:** Open in browser, scan factions

---

### For Team Discord Use:
```bash
# Windows:
setup-bot.bat

# Mac/Linux:
./setup-bot.sh
```
**Link shown:** Discord invite URL  
**Use:** Click to add bot to Discord server

---

## 📊 Summary Table:

| Script | Link It Shows | What For |
|--------|--------------|----------|
| `run-web` | `http://localhost:3000` | Web browser access (local) |
| `setup-bot` | `https://discord.com/...` | Discord bot invite |

---

## 💡 Most Common:

**90% of users want:** `run-web.bat` or `./run-web.sh`

This gives you: `http://localhost:3000` to open in your browser!

---

## ❓ Still Confused?

**Just run:** `run-web.bat` (or `./run-web.sh`)

It will show you: **http://localhost:3000**

Open that in your browser and you're done! 🎉
