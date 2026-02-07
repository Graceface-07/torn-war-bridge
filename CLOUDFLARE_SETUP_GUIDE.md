# 🚀 CLOUDFLARE WORKERS SETUP GUIDE
## Deploying Torn Tactical Advisor to Cloudflare

---

## 📋 PREREQUISITES

You need:
- ✅ Cloudflare account (you already have this)
- ✅ A domain added to Cloudflare (or use workers.dev subdomain - free)
- ✅ Wrangler CLI installed (we'll do this together)

---

## STEP 1: INSTALL WRANGLER CLI

Wrangler is Cloudflare's command-line tool for managing Workers.

### Option A: Using npm (Recommended)
```bash
npm install -g wrangler
```

### Option B: Using yarn
```bash
yarn global add wrangler
```

### Verify Installation
```bash
wrangler --version
```

---

## STEP 2: AUTHENTICATE WITH CLOUDFLARE

Login to your Cloudflare account:

```bash
wrangler login
```

This will:
1. Open your browser
2. Ask you to authorize Wrangler
3. Save your credentials locally

---

## STEP 3: CREATE YOUR WORKER PROJECT

```bash
# Create a new directory for your project
mkdir torn-advisor
cd torn-advisor

# Initialize the worker
wrangler init

# When prompted:
# - Name: torn-advisor
# - Type: "Fetch handler" (select this)
# - TypeScript: No (we'll use JavaScript)
# - Git: Yes (optional but recommended)
```

This creates:
```
torn-advisor/
├── wrangler.toml      # Configuration file
├── src/
│   └── index.js       # Your worker code
└── package.json
```

---

## STEP 4: CONFIGURE YOUR WORKER

Edit `wrangler.toml`:

```toml
name = "torn-advisor"
main = "src/index.js"
compatibility_date = "2024-01-01"

# KV Namespace Bindings (for storing user data)
kv_namespaces = [
  { binding = "TORN_DATA", id = "YOUR_KV_NAMESPACE_ID" }
]

# Environment Variables
[vars]
ENVIRONMENT = "production"

# Routes (if you have a custom domain)
# routes = [
#   { pattern = "advisor.yourdomain.com/*", zone_name = "yourdomain.com" }
# ]

# Or use workers.dev subdomain (free)
workers_dev = true
```

---

## STEP 5: CREATE KV NAMESPACE

KV (Key-Value) storage is where we'll store user data.

```bash
# Create production KV namespace
wrangler kv:namespace create "TORN_DATA"

# This will output something like:
# { binding = "TORN_DATA", id = "abc123xyz456" }

# Copy that ID and add it to wrangler.toml
```

For development/testing:
```bash
# Create preview namespace for testing
wrangler kv:namespace create "TORN_DATA" --preview
```

---

## STEP 6: PROJECT STRUCTURE

Your project should look like this:

```
torn-advisor/
├── wrangler.toml
├── package.json
├── src/
│   ├── index.js              # Main worker entry point
│   ├── combat-intelligence.js # Combat logic (from our earlier file)
│   ├── discord-handler.js     # Discord interactions
│   └── ui/
│       └── advisor-ui.html    # Web interface
└── README.md
```

---

## STEP 7: DEPLOY YOUR WORKER

### Test Locally First
```bash
wrangler dev
```
This runs your worker locally at `http://localhost:8787`

### Deploy to Production
```bash
wrangler deploy
```

Your worker will be live at:
- `https://torn-advisor.YOUR-SUBDOMAIN.workers.dev` (workers.dev)
- OR your custom domain if configured

---

## STEP 8: SET UP DISCORD BOT (Optional - for Discord integration)

### A. Create Discord Application
1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it "Torn Tactical Advisor"
4. Go to "Bot" tab → "Add Bot"
5. Copy the Bot Token (you'll need this)

### B. Set Up Interactions
1. Go to "General Information"
2. Set "Interactions Endpoint URL" to:
   ```
   https://torn-advisor.YOUR-SUBDOMAIN.workers.dev/discord
   ```
3. Discord will verify this endpoint (we'll handle that in code)

### C. Add Bot to Your Server
1. Go to "OAuth2" → "URL Generator"
2. Select scopes:
   - `bot`
   - `applications.commands`
3. Select bot permissions:
   - Send Messages
   - Embed Links
   - Read Message History
4. Copy the generated URL and open it to invite the bot

### D. Add Secrets to Worker
```bash
# Add Discord bot token
wrangler secret put DISCORD_TOKEN
# Paste your token when prompted

# Add Discord public key (from General Information page)
wrangler secret put DISCORD_PUBLIC_KEY
# Paste your public key when prompted
```

---

## STEP 9: ACCESSING YOUR EXISTING SPY DATABASE

Since you already have a KV namespace for spy data:

### Option A: Share the Same KV Namespace
In `wrangler.toml`, add both bindings:
```toml
kv_namespaces = [
  { binding = "TORN_DATA", id = "new_namespace_id" },
  { binding = "SPY_DB", id = "your_existing_spy_db_id" }
]
```

### Option B: Use the Same Namespace
Just use your existing KV namespace:
```toml
kv_namespaces = [
  { binding = "TORN_DATA", id = "your_existing_spy_db_id" }
]
```

Then in code:
```javascript
// Read spy data
const spyData = await env.TORN_DATA.get('spy:player123');

// Write advisor data (use different key prefix)
await env.TORN_DATA.put('advisor:player123', JSON.stringify(data));
```

---

## STEP 10: MONITORING & DEBUGGING

### View Logs
```bash
wrangler tail
```
This shows real-time logs from your worker.

### View Analytics
Go to Cloudflare Dashboard:
1. Workers & Pages
2. Select your worker
3. View metrics, errors, and usage

### Debug Issues
```bash
# Check worker status
wrangler deployments list

# View recent deployments
wrangler deployments list --name torn-advisor
```

---

## 📝 QUICK REFERENCE COMMANDS

```bash
# Development
wrangler dev                    # Run locally
wrangler dev --remote           # Run on Cloudflare but with live logs

# Deployment  
wrangler deploy                 # Deploy to production
wrangler deploy --dry-run       # Test deployment without publishing

# KV Operations
wrangler kv:namespace list                           # List all namespaces
wrangler kv:key list --namespace-id=<ID>            # List keys in namespace
wrangler kv:key get <KEY> --namespace-id=<ID>       # Get value
wrangler kv:key put <KEY> <VALUE> --namespace-id=<ID>  # Set value

# Secrets
wrangler secret list            # List all secrets
wrangler secret put <NAME>      # Add/update secret
wrangler secret delete <NAME>   # Remove secret

# Logs & Monitoring
wrangler tail                   # Real-time logs
wrangler tail --format pretty   # Formatted logs
```

---

## 🔧 TROUBLESHOOTING

### Issue: "wrangler: command not found"
**Solution:** Install wrangler globally or use npx:
```bash
npx wrangler [command]
```

### Issue: "Namespace not found"
**Solution:** Make sure the namespace ID in `wrangler.toml` matches the one created.

### Issue: "Authentication failed"
**Solution:** Re-authenticate:
```bash
wrangler logout
wrangler login
```

### Issue: Discord verification fails
**Solution:** Make sure your worker responds to Discord's verification request (we handle this in code).

### Issue: Worker not updating
**Solution:** Clear cache and redeploy:
```bash
wrangler deploy --force
```

---

## 💰 PRICING (All Free Tier Limits)

**Workers:**
- ✅ 100,000 requests/day FREE
- ✅ 10ms CPU time per request
- ✅ Unlimited workers

**KV Storage:**
- ✅ 1GB storage FREE
- ✅ 100,000 reads/day FREE
- ✅ 1,000 writes/day FREE

**You should stay well within free limits!**

---

## 🎯 NEXT STEPS

After deployment:
1. Test the web interface at your worker URL
2. Integrate Discord bot (if using)
3. Connect to Torn API
4. Link with your existing spy database
5. Invite users and gather feedback!

---

## 📞 NEED HELP?

- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Discord Developer Portal: https://discord.com/developers/docs
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler/

---

**You're ready to deploy! 🚀**

Let me know when you're at any step and need the actual code files!
