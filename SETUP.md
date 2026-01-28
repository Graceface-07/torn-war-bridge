# 🚀 SETUP GUIDE - Torn War Bridge

## Quick Setup (For Your Local Machine)

### Step 1: Get the Code
```bash
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge
```

### Step 2: Install & Run
```bash
npm install
node server.js
```

### Step 3: Open in Browser
Go to: **http://localhost:3000**

---

## That's It! 🎉

The application will now be running on YOUR computer at http://localhost:3000

## Troubleshooting

**If you see "Cannot find module 'express'":**
```bash
npm install
```

**If port 3000 is already in use:**
Edit `server.js` and change `const port = 3000;` to another port like 3001

**Missing API Keys:**
The app will work, but for full functionality, create a `.env` file:
```bash
cp .env.example .env
# Edit .env and add your API keys
```

## What You'll See

When running, you'll see:
```
Server is running on http://localhost:3000
```

Then open http://localhost:3000 in your web browser to use the dashboard.

---

Need help? Check the main README.md
