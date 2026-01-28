# 🌐 DEPLOYMENT GUIDE - External URL Access

## 🎯 Problem: Need External URL?

If you want to access Torn War Bridge from **anywhere** (not just your computer), you need to deploy it to a cloud service.

**Benefits of External Deployment:**
- ✅ Access from any device/location
- ✅ Share with faction members
- ✅ No need to keep your computer running
- ✅ Professional URL (e.g., `torn-war-bridge.vercel.app`)

---

## 🚀 QUICK DEPLOY OPTIONS

### Option 1: Vercel (RECOMMENDED - Easiest & Free)

**1-Click Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Graceface-07/torn-war-bridge)

**Manual Deploy:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd torn-war-bridge
vercel

# Add environment variables in Vercel dashboard:
# - FF_SCOUTER_KEY
# - TORN_API_KEY
```

**Your URL:** `https://your-project.vercel.app`

---

### Option 2: Railway (Easy with Database Support)

**1-Click Deploy:**

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/Graceface-07/torn-war-bridge)

**Manual Deploy:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Add environment variables:
railway variables set FF_SCOUTER_KEY=your_key
railway variables set TORN_API_KEY=your_key
```

**Your URL:** `https://your-app.up.railway.app`

---

### Option 3: Render (Free Tier Available)

**1-Click Deploy:**

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Manual Deploy:**
1. Go to [render.com](https://render.com)
2. Create New → Web Service
3. Connect your GitHub repo
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables:
   - `FF_SCOUTER_KEY`
   - `TORN_API_KEY`

**Your URL:** `https://your-app.onrender.com`

---

### Option 4: Heroku (Classic Option)

```bash
# Install Heroku CLI
# Then:
cd torn-war-bridge
heroku create your-app-name
heroku config:set FF_SCOUTER_KEY=your_key
heroku config:set TORN_API_KEY=your_key
git push heroku main
```

**Your URL:** `https://your-app-name.herokuapp.com`

---

## 🔧 QUICK TESTING: Ngrok (Temporary URL)

**Perfect for quick testing without deployment:**

```bash
# Start your local server
node server.js

# In another terminal:
npx ngrok http 3000
```

You'll get a temporary URL like: `https://abc123.ngrok.io`

**⚠️ Note:** Ngrok URLs expire when you stop it. Good for testing, not production.

---

## 📝 DEPLOYMENT CHECKLIST

Before deploying, make sure you have:

- [ ] Your FF Scouter API key
- [ ] Your Torn API key
- [ ] GitHub repository access
- [ ] Account on chosen platform (Vercel/Railway/Render)

---

## 🔐 SETTING ENVIRONMENT VARIABLES

All platforms need these two variables:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `FF_SCOUTER_KEY` | Your API key | FF Scouter website |
| `TORN_API_KEY` | Your API key | Torn Settings → API Key |

**How to add:**

**Vercel:**
1. Go to project settings
2. Environment Variables
3. Add `FF_SCOUTER_KEY` and `TORN_API_KEY`

**Railway:**
```bash
railway variables set FF_SCOUTER_KEY=your_key
railway variables set TORN_API_KEY=your_key
```

**Render:**
1. Go to your service
2. Environment tab
3. Add variables

---

## 🌐 CUSTOM DOMAIN (Optional)

Want your own domain like `torn.yourdomain.com`?

**Vercel:**
1. Go to project settings
2. Domains
3. Add your domain
4. Update DNS records as shown

**Railway:**
1. Settings → Domains
2. Add custom domain
3. Update DNS

---

## ⚡ RECOMMENDED WORKFLOW

**For Most Users:**
1. Use **Vercel** (easiest, free, fast)
2. Click the 1-click deploy button above
3. Add your API keys in settings
4. Done! Your app is live

**For Testing:**
1. Use **Ngrok** to get a quick temporary URL
2. Test everything works
3. Then deploy to Vercel for permanent URL

---

## 🐛 TROUBLESHOOTING DEPLOYMENT

### "Application Error" or "503"
- ✅ Check environment variables are set
- ✅ Check build logs for errors
- ✅ Verify API keys are correct

### "Cannot find module"
- ✅ Make sure `package.json` is in the repo
- ✅ Build command is `npm install`
- ✅ Start command is `node server.js`

### API calls fail
- ✅ Environment variables must be set on the platform
- ✅ Check `.env.example` for variable names
- ✅ Verify API keys are valid

### Functions don't work
- ✅ Check browser console for errors (F12)
- ✅ Verify the external URL is using HTTPS (not HTTP)
- ✅ Check API rate limits

---

## 📊 PLATFORM COMPARISON

| Platform | Free Tier | Speed | Difficulty | Best For |
|----------|-----------|-------|------------|----------|
| **Vercel** | ✅ Yes | ⚡⚡⚡ | 🟢 Easy | Most users |
| **Railway** | ✅ 500hrs/mo | ⚡⚡ | 🟢 Easy | Need database |
| **Render** | ✅ Yes | ⚡ | 🟡 Medium | Long-running |
| **Heroku** | ⚠️ Limited | ⚡⚡ | 🟡 Medium | Enterprise |
| **Ngrok** | ✅ Temporary | ⚡⚡⚡ | 🟢 Easy | Quick testing |

**Recommendation:** Start with **Vercel** for production, use **Ngrok** for testing.

---

## 🎯 NEXT STEPS

1. **Choose a platform** (Vercel recommended)
2. **Click the deploy button** or follow manual steps
3. **Add your API keys** in platform settings
4. **Visit your new URL** (e.g., `your-app.vercel.app`)
5. **Share with your faction!**

---

## 💡 TIPS

- 🔒 **Security:** Never commit `.env` file to Git (it's in `.gitignore`)
- 🔄 **Updates:** Push to GitHub, and most platforms auto-deploy
- 📊 **Monitoring:** Check platform dashboards for logs and errors
- 💰 **Cost:** All have generous free tiers, enough for faction use

---

## ❓ STILL NEED HELP?

1. Read the platform-specific docs (linked above)
2. Check deployment logs for errors
3. Verify environment variables are set correctly
4. Make sure API keys are valid

**Your app will be accessible from ANY device once deployed!** 🌐
