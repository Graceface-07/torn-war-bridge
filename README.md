# Torn War Bridge 🎯

**Modern Command Hub Dashboard** for tactical war analysis in Torn City.

## 🚀 Quick Start (Offline & Stable)

### Option 1: One-Command Start (Recommended)
```bash
./start.sh
```

### Option 2: Manual Start
```bash
npm install
node server.js
```

Then open your browser to: **http://localhost:3000**

## ✨ What You Get

This runs **100% locally on your machine** - no cloud services needed!

- ✅ **Offline Stable** - Runs on localhost, no internet required once installed
- ✅ **Modern Dashboard** - Clean UI with real-time scanning
- ✅ **Live API Integration** - Torn API and FF Scouter when online
- ✅ **Target Analysis** - Tier classification and war reports
- ✅ **Data Persistence** - Results saved in browser storage

## 📋 Requirements

- Node.js (v14 or higher)
- Web browser (Chrome, Firefox, Safari, Edge)

## 🎯 Features

✅ **Live API Integration** - Real-time data from Torn API and FF Scouter  
✅ **Target Scanning** - Automated faction member analysis  
✅ **Tier Classification** - Color-coded targets (Secure/Prime/Risky/Suicide)  
✅ **War Analysis** - Comprehensive tactical reports with recommendations  
✅ **Modern UI** - Clean, professional dark theme interface  
✅ **Interactive Filtering** - Sort and filter targets by tier  
✅ **Security** - Input validation, rate limiting, secure API handling

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure API Keys
Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

Edit `.env`:
```
FF_SCOUTER_KEY=your_ff_scouter_key_here
TORN_API_KEY=your_torn_api_key_here
```

### 3. Run the Server
```bash
npm start
```

Open your browser to `http://localhost:3000`

## How to Use

### Main Dashboard

1. **Enter Your User ID** - Your Torn user ID
2. **Enter Target Faction ID** - The enemy faction you want to analyze
3. **Click "Start Scan"** - Begin tactical analysis

### What You'll See

- **Real-time Progress** - Watch as targets are scanned (0-100%)
- **Target Cards** - Each enemy appears with:
  - Name and ID
  - Battle stats estimate
  - Fair fight multiplier
  - Color-coded tier indicator
- **Stats Overview** - Count of Secure, Prime, Risky, and Suicide targets
- **Filter Options** - View specific tier targets

### War Analysis

Click "War Analysis" to see:
- **Tactical Verdict** - Overall assessment of your chances
- **Win Rate** - Percentage of beatable targets
- **Estimated Respect** - Potential respect gains
- **Recommendations** - AI-generated strategy tips
- **Priority Targets** - Top 10 beatable enemies

## Target Tiers

- 🟢 **Secure** - Battle stats < 50% of yours (Easy wins)
- 🔵 **Prime** - Battle stats 50-100% of yours (Optimal respect)
- 🟠 **Risky** - Battle stats 100-200% of yours (Challenging)
- 🔴 **Suicide** - Battle stats > 200% of yours (Very difficult)

## API Endpoints

The server provides these REST endpoints:

- `GET /api/user/:userId` - Fetch user profile and stats
- `GET /api/faction/:factionId/members` - Fetch faction member list
- `GET /api/scouter/:targetId?userId=X` - Fetch FF Scouter battle stats

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Vanilla JavaScript + Modern CSS
- **APIs**: Torn API v2, FF Scouter API
- **Security**: Input validation, rate limiting, CSP compliance

## Development

```bash
# Development mode with auto-reload
npm run dev
```

## Security Notes

- Never commit `.env` file to version control
- API keys are validated before use
- Input sanitization on all parameters
- Rate limiting prevents API throttling
- No inline event handlers (CSP compliant)

## Screenshots

### Command Hub Dashboard
Professional interface with real-time scanning and tier-based classification.

### War Analysis
Comprehensive tactical reports with strategic recommendations.

## License

MIT
