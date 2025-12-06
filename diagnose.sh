#!/bin/bash

echo "🔍 MCP Server Diagnostics"
echo "========================"
echo ""

# Check Node.js
echo "1️⃣  Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js installed: $NODE_VERSION"
else
    echo "   ❌ Node.js not found - install Node.js 18+"
    exit 1
fi

# Check npm
echo ""
echo "2️⃣  Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm installed: $NPM_VERSION"
else
    echo "   ❌ npm not found"
    exit 1
fi

# Check if dependencies are installed
echo ""
echo "3️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules exists"
    PACKAGE_COUNT=$(ls -1 node_modules | wc -l)
    echo "   📦 $PACKAGE_COUNT packages installed"
else
    echo "   ❌ node_modules missing"
    echo "   💡 Fix: Run 'npm install'"
    exit 1
fi

# Check build
echo ""
echo "4️⃣  Checking build..."
if [ -f "dist/index.js" ]; then
    FILE_SIZE=$(du -h dist/index.js | cut -f1)
    echo "   ✅ dist/index.js exists ($FILE_SIZE)"
else
    echo "   ❌ Build missing"
    echo "   💡 Fix: Run 'npm run build'"
    exit 1
fi

# Check Firebase credentials
echo ""
echo "5️⃣  Checking Firebase credentials..."
HAS_ENV=false
HAS_CREDS=false

if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
    HAS_ENV=true

    # Check what's configured in .env
    if grep -q "FIREBASE_SERVICE_ACCOUNT_PATH" .env; then
        CREDS_PATH=$(grep "FIREBASE_SERVICE_ACCOUNT_PATH" .env | cut -d'=' -f2)
        echo "   📝 Using credentials file: $CREDS_PATH"
    fi

    if grep -q "FIREBASE_SERVICE_ACCOUNT_JSON" .env; then
        echo "   📝 Using credentials from environment variable"
    fi
else
    echo "   ❌ .env file missing"
    echo "   💡 Fix: Copy .env.example to .env and configure Firebase credentials"
fi

if [ -f "firebase-credentials.json" ]; then
    echo "   ✅ firebase-credentials.json exists"
    HAS_CREDS=true
else
    echo "   ⚠️  firebase-credentials.json not found"
    echo "   ℹ️  This is OK if using FIREBASE_SERVICE_ACCOUNT_JSON env var"
fi

# Check package.json
echo ""
echo "6️⃣  Checking package.json..."
if [ -f "package.json" ]; then
    echo "   ✅ package.json exists"
    PROJECT_NAME=$(grep '"name"' package.json | head -1 | cut -d'"' -f4)
    echo "   📦 Project: $PROJECT_NAME"
else
    echo "   ❌ package.json missing"
    exit 1
fi

# Summary
echo ""
echo "📊 Summary"
echo "=========="

if [ "$HAS_ENV" = true ]; then
    echo "✅ Configuration looks good!"
    echo ""
    echo "🚀 Next Steps:"
    echo "   1. Test the server: npm start"
    echo "   2. If server starts, configure Claude Desktop (see SETUP_GUIDE.md)"
    echo "   3. Restart Claude Desktop"
    echo ""
    echo "💡 To test the server now, run:"
    echo "   npm start"
    echo ""
    echo "   Expected output: 'P&L Analytics MCP Server running on stdio'"
else
    echo "⚠️  Setup incomplete"
    echo ""
    echo "🔧 Required Actions:"
    echo "   1. Create .env file: cp .env.example .env"
    echo "   2. Get Firebase credentials from Firebase Console"
    echo "   3. Add credentials to .env file"
    echo "   4. Run this diagnostic again"
    echo ""
    echo "📖 See SETUP_GUIDE.md for detailed instructions"
fi

echo ""
echo "📁 Current directory: $(pwd)"
echo "🌐 Expected Firebase URL: https://pnl-amzon-default-rtdb.firebaseio.com"
