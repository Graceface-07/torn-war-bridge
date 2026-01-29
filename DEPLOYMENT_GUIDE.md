# Torn Command Hub - Deployment & Usage Guide

## Quick Start

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Graceface-07/torn-war-bridge.git
cd torn-war-bridge

# Install dependencies
npm install

# Start the server
npm start
```

The application will be available at: **http://localhost:3000**

### 2. Using the Application

#### Option A: Demo Mode (Recommended for First-Time Users)

1. Open your browser to http://localhost:3000
2. Click the **"🎮 Try Demo Mode"** button
3. All sections will automatically populate with realistic demo data
4. Explore all features without needing an API key

#### Option B: Real Torn API Data

1. Get your Torn API key from: https://www.torn.com/preferences.php#tab=api
2. Enter your API key in the input field
3. Click **"Save API Key"**
4. Click any of the Quick Action buttons to load real data

## Features

### Dashboard Sections

1. **Player Statistics**
   - View player name, level, faction
   - See battle stats (Strength, Defense, Speed, Dexterity)
   - Monitor life points

2. **Faction Insights**
   - Faction name and tag
   - Member count and respect
   - Best chain record
   - Territory holdings

3. **War Analysis**
   - Total and active members
   - Faction readiness percentage
   - Strategic recommendations
   - Click "View Detailed Analysis" for more details

4. **Member Statistics**
   - Online/offline member counts
   - Online rate percentage
   - Click "View Member List" to see all members

### Interactive Modals

- **War Analysis Modal**: Detailed overview and strategic recommendations
- **Member List Modal**: Complete table of all faction members with status

## Troubleshooting

### Server Won't Start

```bash
# Make sure dependencies are installed
npm install

# Check if port 3000 is available
# On Linux/Mac:
lsof -i :3000

# On Windows:
netstat -ano | findstr :3000
```

### Data Not Loading

1. **Try Demo Mode First**: Click "🎮 Try Demo Mode" to verify the application is working
2. **Check API Key**: Ensure your Torn API key is valid and has the correct permissions
3. **Check Browser Console**: Open Developer Tools (F12) and check for any error messages

### Dependencies Issues

If you encounter dependency issues:

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Production Deployment

### For Production Servers

1. **Environment Setup**:
   ```bash
   # Set NODE_ENV
   export NODE_ENV=production
   ```

2. **Using PM2** (Recommended):
   ```bash
   # Install PM2
   npm install -g pm2

   # Start the application
   pm2 start server.js --name torn-command-hub

   # Save PM2 configuration
   pm2 save

   # Set PM2 to start on boot
   pm2 startup
   ```

3. **Using Docker**:
   ```bash
   # Build the image
   docker build -t torn-command-hub .

   # Run the container
   docker run -d -p 3000:3000 --name torn-hub torn-command-hub
   ```

### Reverse Proxy (Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Support

For issues or questions:
- Check the console for error messages
- Try demo mode to verify functionality
- Review this guide for common solutions
- Open an issue on GitHub with details and screenshots

## Demo Data

The demo mode includes:
- **Player**: CommanderDelta (Level 42, 438M total stats)
- **Faction**: Elite Warriors [ELTW] (12 members, 1.25M respect)
- **Members**: 12 faction members with varying levels (22-42)
- **War Status**: 100% readiness, 8,752 best chain

This data is perfect for demonstrations, testing, and understanding the application's capabilities.
