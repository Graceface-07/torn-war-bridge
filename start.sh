#!/bin/bash
# Torn War Bridge - Quick Start Script

echo "🎯 Starting Torn War Bridge..."
echo ""

# Check if .env exists, if not create it from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    if [ -f .env.example ]; then
        cp .env.example .env
        # Replace placeholder API keys with actual keys from the codebase
        sed -i 's/your_ff_scouter_key_here/rwLgZTyqgWDxhoCx/' .env
        sed -i 's/your_torn_api_key_here/CZP2D2ZnbXWsYiDT/' .env
        echo "✅ .env file created with API keys"
    else
        echo "⚠️  Warning: .env.example not found, creating basic .env"
        cat > .env << 'EOF'
FF_SCOUTER_KEY=rwLgZTyqgWDxhoCx
TORN_API_KEY=CZP2D2ZnbXWsYiDT
WORKER_URL=https://torn-war-bridge.tmecf.workers.dev/
EOF
        echo "✅ .env file created"
    fi
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🚀 Starting server..."
echo "   Open http://localhost:3000 in your browser"
echo "   Press Ctrl+C to stop"
echo ""

# Start the server
node server.js
