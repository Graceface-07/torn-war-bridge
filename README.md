# torn-war-bridge

Automated Tactical Dashboard for Torn Warfare - A professional Command Hub for managing faction operations and war strategy.

## Features

### 🎯 Command Hub Dashboard
A centralized, professional dashboard for all your Torn warfare needs with:
- **Player Statistics**: View your stats, level, faction, and battle statistics
- **Faction Insights**: Comprehensive faction data including members, respect, and territory
- **War Analysis**: Strategic war planning with tier-based analysis and recommendations
- **Member Statistics**: Track faction member activity and online status

### 🔧 Technical Highlights
- **Centralized API Service**: Intelligent caching (5-minute timeout) to minimize API calls
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Professional UI that works on desktop and mobile
- **Modal Windows**: Detailed views for war analysis and member lists
- **localStorage Integration**: API key persistence and data caching

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- A Torn API key ([Get one here](https://www.torn.com/preferences.php#tab=api))

### Installation

```bash
# Clone the repository
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge

# Install dependencies
npm install

# Start the server
npm start
```

The application will be available at `http://localhost:3000`

### Development Mode

```bash
npm run dev
```

This runs the server with nodemon for automatic restart on file changes.

## Usage

1. **Set Your API Key**
   - Enter your Torn API key in the input field at the top
   - Click "Save API Key" to persist it

2. **View Player Stats**
   - Click "Player Stats" quick action or the Refresh button in the Player Statistics card
   - View your profile, level, faction, and battle stats

3. **Check Faction Insights**
   - Click "Faction Insights" to load your faction's data
   - See member count, respect, age, and territory information

4. **Analyze Wars**
   - Click "War Analysis" to view faction readiness
   - See active member count, readiness percentage, and recommendations
   - Click "View Detailed Analysis" for in-depth war strategy

5. **Review Member Stats**
   - Click "Member Stats" to see faction member overview
   - View online/offline counts and activity rates
   - Click "View Member List" for detailed member information

## Project Structure

```
torn-war-bridge/
├── public/
│   ├── index.html           # Main Command Hub dashboard
│   ├── command-hub.js       # Main controller for UI interactions
│   ├── api-service.js       # Centralized Torn API service
│   ├── styles.css           # Professional styling
│   ├── war-analysis.html    # Standalone war analysis page
│   ├── war-analysis.js      # War analysis calculations
│   └── dashboard.js         # Legacy dashboard (backward compatible)
├── server.js                # Express server
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## API Service

The centralized API service (`api-service.js`) provides:
- Caching with configurable timeout (default: 5 minutes)
- Automatic error handling for network and API errors
- Support for all Torn API endpoints
- Methods for common operations:
  - `getPlayerData(playerId, apiKey, selections)`
  - `getFactionData(factionId, apiKey, selections)`
  - `getMemberStats(factionId, apiKey)`

## War Analysis

The war analysis module provides:
- **Tier Classification**: Players ranked from S to D based on total stats
- **Respect Calculation**: Estimated respect gains from battles
- **Beatable Range**: Identifies suitable targets (30%-150% of your stats)
- **Lineup Simulation**: Optimal matchup recommendations
- **Strategic Verdicts**: Analysis of war favorability

### Configuration Constants

War analysis thresholds can be adjusted in `war-analysis.js`:
```javascript
WAR_CONFIG = {
    TIER_S_THRESHOLD: 100000,    // Stats needed for S tier
    TIER_A_THRESHOLD: 50000,     // Stats needed for A tier
    TIER_B_THRESHOLD: 20000,     // Stats needed for B tier
    TIER_C_THRESHOLD: 5000,      // Stats needed for C tier
    BEATABLE_RANGE_MIN: 0.3,     // Lower bound (30% of your stats)
    BEATABLE_RANGE_MAX: 1.5,     // Upper bound (150% of your stats)
    WIN_RATE_HIGH: 0.7,          // 70% for highly favorable
    WIN_RATE_MEDIUM: 0.5,        // 50% for favorable
    WIN_RATE_LOW: 0.3            // 30% for challenging
}
```

## Security

- ✅ No vulnerabilities detected (CodeQL scan)
- API keys stored in localStorage (client-side only)
- No sensitive data transmitted to third parties
- HTTPS recommended for production deployment

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built for the Torn community
- API powered by [Torn API](https://www.torn.com/api.html)

