#!/bin/bash
# Super Simple Setup Script - Just Run This!

echo "╔════════════════════════════════════════╗"
echo "║  🤖 TORN WAR BRIDGE - DISCORD BOT     ║"
echo "║        Easy Setup Script               ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    
    read -p "Enter your Discord Bot Token: " discord_token
    
    # Use default API keys
    echo "DISCORD_TOKEN=$discord_token" > .env
    echo "FF_SCOUTER_KEY=rwLgZTyqgWDxhoCx" >> .env
    echo "TORN_API_KEY=CZP2D2ZnbXWsYiDT" >> .env
    
    echo "✅ .env file created!"
else
    echo "✅ .env file exists"
fi

echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  🚀 STARTING DISCORD BOT...            ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "The bot will show you an invite link."
echo "Click it to add the bot to your Discord server!"
echo ""
echo "Then use these commands in Discord:"
echo "  /scan user_id:YOUR_ID faction_id:ENEMY_ID"
echo "  /war-analysis"
echo ""
echo "Press Ctrl+C to stop the bot"
echo "════════════════════════════════════════"
echo ""

# Start the bot
node discord-bot.js
