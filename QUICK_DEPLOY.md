# ⚡ QUICK DEPLOY - Get External URL in 5 Minutes

## 🎯 You Asked: "Need External URL"

**HERE'S THE FASTEST WAY:**

---

## Option 1: Vercel (EASIEST - Click & Deploy)

### Step 1: Click This Button
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Graceface-07/torn-war-bridge)

### Step 2: Login to Vercel
- Use your GitHub account (free)

### Step 3: Add Your API Keys
In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Add:
   - `FF_SCOUTER_KEY` = your FF Scouter key
   - `TORN_API_KEY` = your Torn API key
3. Click Save

### Step 4: Done!
Your app is live at: `https://your-app.vercel.app`

**Total Time: 3-5 minutes** ⚡

---

## Option 2: Ngrok (INSTANT - For Testing)

### If You Just Want to Test:

```bash
# 1. Start your local server
node server.js

# 2. In another terminal, run:
npx ngrok http 3000
```

You'll get: `https://abc123.ngrok.io` (temporary URL)

**Total Time: 30 seconds** ⚡⚡⚡

**⚠️ Note:** Ngrok URL expires when you close it. Good for quick testing!

---

## 🆚 WHICH ONE?

| Need | Use |
|------|-----|
| Permanent URL | **Vercel** |
| Share with faction | **Vercel** |
| Quick test | **Ngrok** |
| Try it now | **Ngrok** |
| Professional | **Vercel** |

---

## 📝 What You Get

**Vercel:**
- ✅ Permanent URL: `your-app.vercel.app`
- ✅ Always online (24/7)
- ✅ Free tier (more than enough)
- ✅ Auto-updates when you push to GitHub

**Ngrok:**
- ✅ Instant URL: `random.ngrok.io`
- ✅ No signup needed
- ✅ Perfect for testing
- ⚠️ Temporary (expires when stopped)

---

## 🔑 Where to Get API Keys

**FF Scouter Key:**
- Go to FF Scouter website
- Your API key is in settings/profile

**Torn API Key:**
- Go to Torn.com
- Settings → API Key
- Generate new key if needed

---

## ✅ DONE!

Once deployed, anyone can access your Torn War Bridge at your external URL!

**Share it with your faction!** 🎉

For more options and details, see [DEPLOYMENT.md](DEPLOYMENT.md)
