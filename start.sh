#!/bin/bash
# Torn War Bridge - Quick Start Script

echo "🎯 Starting Torn War Bridge..."

# Check if .env exists, if not create it from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    sed -i 's/your_ff_scouter_key_here/rwLgZTyqgWDxhoCx/' .env
    sed -i 's/your_torn_api_key_here/CZP2D2ZnbXWsYiDT/' .env
    echo "✅ .env file created with API keys"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🚀 Starting server on http://localhost:3000"
echo "   Press Ctrl+C to stop"
echo ""

# Start the server
node server.js
