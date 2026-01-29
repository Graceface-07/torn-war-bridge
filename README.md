# torn-war-bridge

Automated tactical dashboard for Torn City war operations.

## Google Apps Script (GAS) Deployment

### Quick Start

1. **Create a New Google Apps Script Project**
   - Go to [script.google.com](https://script.google.com)
   - Click "New Project"
   - Delete the default `myFunction()` code

2. **Add Check.js Code**
   - Copy the entire contents of `Check.js` from this repository
   - Paste it into the script editor
   - Save the project (Ctrl+S or File > Save)
   - Name your project (e.g., "Torn War Bridge")

3. **Configure Script Properties (API Keys)**
   - In the Apps Script editor, go to **Project Settings** (gear icon on left sidebar)
   - Scroll to **Script Properties** section
   - Click **Add script property** and add:
     - Property: `TORN_API_KEY`, Value: Your Torn API key
     - Property: `SC_KEY`, Value: Your FF Scouter API key (optional)
     - Property: `WORKER_URL`, Value: Your Cloudflare Worker URL (optional, for KV sync)
   
   **Note**: All keys are optional. If not provided, the app runs in **Demo Mode** with sample data.

4. **Deploy as Web App**
   - Click **Deploy** > **New deployment**
   - Click the gear icon ⚙️ next to "Select type"
   - Choose **Web app**
   - Configure:
     - Description: "Torn War Bridge v1"
     - Execute as: **Me**
     - Who has access: **Anyone** (or "Anyone with Google account" for restricted access)
   - Click **Deploy**
   - **Authorize** the app when prompted (review permissions)
   - Copy the **Web app URL** provided

5. **Test the Dashboard**
   - Open the Web app URL in your browser
   - Enter your Torn user ID in "YOUR UID"
   - Enter a target faction ID in "TARGET FACTION ID"
   - Click **Execute Scan**
   
   **Expected Behavior:**
   - With valid API keys: Real data loads from Torn API and FF Scouter
   - Without API keys (Demo Mode): Sample data loads with 3 demo members
   - Click any member card to see detailed stats in a modal popup
   - If WORKER_URL is not set, the "Daily KV Push" button will be disabled

### Demo Mode

If API keys are not configured in Script Properties, the app automatically runs in **Demo Mode**:
- Shows a banner: "⚠️ DEMO MODE: Using sample data"
- Loads 3 sample faction members with randomized stats
- Operator shows as "Demo User" with 50M total stats
- All functionality works, but data is simulated

This is useful for:
- Testing the UI without real API keys
- Demonstrating the dashboard
- Development and debugging

### Troubleshooting

- **"Failed to fetch user data" error**: Check that TORN_API_KEY is set correctly in Script Properties
- **"Failed to fetch faction data" error**: Verify the faction ID is valid and your API key has access
- **Cards not loading**: Check browser console (F12) for JavaScript errors
- **Modal not opening**: Ensure you're clicking on the card area
- **KV Push disabled**: Set WORKER_URL in Script Properties to enable Cloudflare Worker sync

### Security Notes

- Never commit real API keys to the repository
- Use Script Properties to store sensitive keys
- Keys are only accessible to the script owner
- The web app runs under your Google account's permissions

### Updates

To update the dashboard:
1. Copy new code from `Check.js`
2. Paste into your Apps Script project
3. Save the project
4. No need to redeploy - changes are live immediately for existing deployments
5. For major changes, create a new deployment version

---

## Additional Files

This repository also contains:
- `worker.js`, `1worker.js`, `index.js` - Cloudflare Worker implementations (optional)
- `war-analysis.html` - War analysis page (work in progress)
- `public/` - Additional dashboard and analysis modules
