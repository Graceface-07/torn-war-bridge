#!/bin/bash
# SIMPLE WEB DASHBOARD - Just Run This!

echo "╔════════════════════════════════════════╗"
echo "║  🎯 TORN WAR BRIDGE - WEB DASHBOARD   ║"
echo "║         Super Simple Setup             ║"
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

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file with API keys..."
    echo "FF_SCOUTER_KEY=rwLgZTyqgWDxhoCx" > .env
    echo "TORN_API_KEY=CZP2D2ZnbXWsYiDT" >> .env
    echo "✅ API keys configured!"
else
    echo "✅ API keys already configured"
fi

echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed!"
else
    echo "✅ Dependencies ready"
fi

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  🌐 STARTING WEB SERVER...             ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "✅ Server starting on http://localhost:3000"
echo ""
echo "Open your web browser and go to:"
echo "   👉 http://localhost:3000"
echo ""
echo "Then:"
echo "   1. Enter your User ID"
echo "   2. Enter enemy Faction ID"  
echo "   3. Click 'Start Scan'"
echo ""
echo "Press Ctrl+C to stop the server"
echo "════════════════════════════════════════"
echo ""

# Start the web server
node server.js
