#!/bin/bash
set -e

echo "Checking Node.js version (should be v14+)"
node -v

echo "Installing dependencies..."
npm install

echo "Running server locally..."
npm start &
PID=$!
sleep 5

echo "Testing if server is up..."
if curl -s http://localhost:3000 | grep -q "Torn Command Hub"; then
    echo "✅ Local server running! View at http://localhost:3000"
else
    echo "❌ Server did not start correctly."
    kill $PID
    exit 1
fi

echo "To shutdown, run: kill $PID"