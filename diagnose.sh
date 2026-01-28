#!/bin/bash
# Diagnostic Script - Run this to check your setup

echo "========================================"
echo "   TORN WAR BRIDGE - DIAGNOSTIC TOOL"
echo "========================================"
echo ""

echo "1. Checking Current Directory..."
echo "   You are in: $(pwd)"
echo ""

echo "2. Checking for required files..."
if [ -f "server.js" ]; then
    echo "   ✅ server.js found"
else
    echo "   ❌ server.js NOT FOUND"
    echo "      → You are NOT in the torn-war-bridge folder!"
    echo "      → Run: cd torn-war-bridge"
fi

if [ -f "package.json" ]; then
    echo "   ✅ package.json found"
else
    echo "   ❌ package.json NOT FOUND"
fi

if [ -d "public" ]; then
    echo "   ✅ public/ folder found"
else
    echo "   ❌ public/ folder NOT FOUND"
fi

if [ -f "public/index.html" ]; then
    echo "   ✅ public/index.html found"
else
    echo "   ❌ public/index.html NOT FOUND"
fi

echo ""
echo "3. Checking Node.js installation..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js is installed: $(node --version)"
else
    echo "   ❌ Node.js NOT FOUND"
    echo "      → Install from: https://nodejs.org/"
fi

if command -v npm &> /dev/null; then
    echo "   ✅ npm is installed: $(npm --version)"
else
    echo "   ❌ npm NOT FOUND"
    echo "      → Install from: https://nodejs.org/"
fi

echo ""
echo "4. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules folder exists"
else
    echo "   ⚠️  node_modules NOT FOUND"
    echo "      → Run: npm install"
fi

echo ""
echo "5. Checking Git repository..."
if [ -d ".git" ]; then
    echo "   ✅ This is a Git repository"
else
    echo "   ⚠️  Not a Git repository"
    echo "      → Did you clone the repo?"
fi

echo ""
echo "========================================"
echo "   RECOMMENDED NEXT STEPS:"
echo "========================================"
echo ""

if [ ! -f "server.js" ]; then
    echo "❌ PROBLEM: You are not in the torn-war-bridge folder"
    echo ""
    echo "FIX:"
    echo "1. Find where you cloned the repository"
    echo "2. Run: cd torn-war-bridge"
    echo "3. Run this diagnostic again"
    echo ""
elif [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed"
    echo ""
    echo "FIX:"
    echo "   npm install"
    echo ""
elif ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "FIX:"
    echo "1. Go to https://nodejs.org/"
    echo "2. Download and install Node.js"
    echo "3. Restart your terminal"
    echo "4. Try again"
    echo ""
else
    echo "✅ Everything looks good!"
    echo ""
    echo "TO START THE SERVER:"
    echo "   node server.js"
    echo ""
    echo "Then open: http://localhost:3000"
    echo ""
fi

echo "========================================"
