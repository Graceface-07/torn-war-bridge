#!/bin/bash

# TORN ADVISOR - Quick Deployment Script
# This script automates the deployment process

echo "🚀 TORN TACTICAL ADVISOR - Deployment Script"
echo "=============================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found!"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

echo "✅ Wrangler CLI found"
echo ""

# Check if logged in
echo "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "🔑 Please log in to Cloudflare:"
    wrangler login
else
    echo "✅ Already logged in to Cloudflare"
fi
echo ""

# Create KV namespace if needed
echo "📦 Setting up KV namespace..."
echo "Run this command and copy the ID to wrangler.toml:"
echo ""
echo "  wrangler kv:namespace create TORN_DATA"
echo ""
read -p "Have you updated wrangler.toml with the KV namespace ID? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⚠️  Please update wrangler.toml first, then run this script again"
    exit 1
fi

# Set Discord secrets
echo ""
echo "🔐 Setting up Discord secrets..."
read -p "Do you want to set up Discord integration now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting Discord bot token..."
    wrangler secret put DISCORD_TOKEN
    
    echo "Setting Discord public key..."
    wrangler secret put DISCORD_PUBLIC_KEY
    
    echo "✅ Discord secrets configured"
else
    echo "⏭️  Skipping Discord setup (you can do this later with: wrangler secret put)"
fi

echo ""
echo "📝 Installing dependencies..."
npm install

echo ""
echo "🧪 Testing locally first..."
echo "Starting local dev server (press Ctrl+C to stop)..."
echo ""
read -p "Start local test? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌐 Starting worker at http://localhost:8787"
    echo "Press Ctrl+C when ready to deploy to production"
    echo ""
    wrangler dev
fi

echo ""
read -p "Ready to deploy to production? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "⏸️  Deployment cancelled"
    exit 0
fi

# Deploy
echo ""
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "Your worker is live at:"
wrangler deployments list | head -5
echo ""
echo "🎯 Next steps:"
echo "1. Visit your worker URL to test the web interface"
echo "2. Set up Discord slash commands (see CLOUDFLARE_SETUP_GUIDE.md)"
echo "3. Connect to Torn API"
echo "4. Invite users and gather feedback!"
echo ""
echo "📊 View logs: wrangler tail"
echo "📈 View analytics: Cloudflare Dashboard > Workers"
echo ""
