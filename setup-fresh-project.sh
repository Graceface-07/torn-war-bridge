#!/bin/bash

# TORN TACTICAL ADVISOR - Fresh Setup Script
# This creates a clean project structure and archives old files

echo "🚀 TORN TACTICAL ADVISOR - Clean Setup"
echo "======================================"
echo ""

# Check current directory
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"
echo ""

# Step 1: Archive old files
echo "📦 Step 1: Archiving old files..."
ARCHIVE_DIR="archive_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

echo "Moving old files to $ARCHIVE_DIR/..."

# Archive specific old files (not the new ones we're creating)
[ -f "1worker.js" ] && mv 1worker.js "$ARCHIVE_DIR/"
[ -f "code.gs" ] && mv code.gs "$ARCHIVE_DIR/"
[ -f "code" ] && mv code "$ARCHIVE_DIR/"
[ -f "Latest Code.gs" ] && mv "Latest Code.gs" "$ARCHIVE_DIR/"
[ -f "Latest Code.gs.txt" ] && mv "Latest Code.gs.txt" "$ARCHIVE_DIR/"
[ -f "index.js" ] && mv index.js "$ARCHIVE_DIR/"
[ -f "index - Copy.js" ] && mv "index - Copy.js" "$ARCHIVE_DIR/"
[ -f "Check.js" ] && mv Check.js "$ARCHIVE_DIR/"
[ -f "test" ] && mv test "$ARCHIVE_DIR/"
[ -f "sss" ] && mv sss "$ARCHIVE_DIR/"
[ -d ".wrangler" ] && mv .wrangler "$ARCHIVE_DIR/"

echo "✅ Old files archived in $ARCHIVE_DIR/"
echo ""

# Step 2: Create fresh project structure
echo "📁 Step 2: Creating fresh project structure..."

mkdir -p src
mkdir -p docs

echo "✅ Directory structure created"
echo ""

# Step 3: Move/create core files
echo "📝 Step 3: Setting up core files..."

echo "Created structure:"
echo "  torn-war-bridge/"
echo "  ├── src/"
echo "  │   ├── index.js              (main worker)"
echo "  │   ├── combat-intelligence.js (advisor brain)"
echo "  │   └── ui.js                  (web interface)"
echo "  ├── docs/"
echo "  │   ├── PROJECT_MASTER.md      (living documentation)"
echo "  │   ├── API_REFERENCE.md       (API endpoints)"
echo "  │   └── DEPLOYMENT.md          (deploy instructions)"
echo "  ├── $ARCHIVE_DIR/             (old files)"
echo "  ├── wrangler.toml              (config)"
echo "  ├── package.json               (dependencies)"
echo "  └── README.md                  (project overview)"
echo ""

echo "✅ Project structure ready!"
echo ""

echo "🎯 Next Steps:"
echo "1. Review the files I've created"
echo "2. Run: npm install"
echo "3. Run: wrangler dev (test locally)"
echo "4. Run: wrangler deploy (go live)"
echo ""
echo "📋 Everything is documented in docs/PROJECT_MASTER.md"
