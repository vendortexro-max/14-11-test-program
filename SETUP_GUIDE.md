# MCP Server Setup Guide

This guide will help you get the MCP server working with Claude AI.

## Quick Diagnosis Checklist

Run through this checklist to identify the issue:

- [ ] **Step 1**: Firebase credentials configured
- [ ] **Step 2**: MCP server builds without errors
- [ ] **Step 3**: MCP server can start
- [ ] **Step 4**: Claude Desktop config is correct
- [ ] **Step 5**: Claude Desktop is restarted

---

## Step 1: Configure Firebase Credentials

### Option A: Using Service Account JSON File (Recommended)

1. **Get your Firebase Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `pnl-amzon`
   - Go to **Project Settings** (gear icon) > **Service Accounts**
   - Click **"Generate New Private Key"**
   - Save the downloaded JSON file as `firebase-credentials.json` in this directory

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file** and set:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
   FIREBASE_DATABASE_URL=https://pnl-amzon-default-rtdb.firebaseio.com
   ```

### Option B: Using Environment Variable

Instead of a file, you can paste the entire JSON content as an environment variable:

1. Copy the entire contents of your service account JSON
2. Create `.env` file:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"pnl-amzon",...}'
   FIREBASE_DATABASE_URL=https://pnl-amzon-default-rtdb.firebaseio.com
   ```

---

## Step 2: Build the MCP Server

```bash
npm install
npm run build
```

**Expected output:**
```
added 249 packages, and audited 250 packages in 12s
> pnl-mcp-server@1.0.0 build
> tsc
```

**If you see errors:** Check the error message and ensure TypeScript is installed correctly.

---

## Step 3: Test the MCP Server

Try starting the server manually:

```bash
npm start
```

**Expected output:**
```
P&L Analytics MCP Server running on stdio
Firebase initialized successfully
```

**Common errors:**

### Error: "Firebase credentials not found"
```
Failed to initialize Firebase: Error: Firebase credentials not found
```
**Fix:** Go back to Step 1 and configure Firebase credentials.

### Error: "ENOENT: no such file or directory"
```
Error: ENOENT: no such file or directory, open './firebase-credentials.json'
```
**Fix:** Make sure `firebase-credentials.json` is in the project root directory.

### Error: "Invalid service account"
```
Error: Service account object must contain a string "project_id" property
```
**Fix:** Your Firebase credentials JSON is malformed. Re-download from Firebase Console.

---

## Step 4: Configure Claude Desktop

### Get Absolute Paths

First, find the absolute paths you'll need:

```bash
# Get project directory path
pwd

# Get Firebase credentials path (if using file)
realpath firebase-credentials.json
```

### macOS Configuration

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pnl-analytics": {
      "command": "node",
      "args": ["/REPLACE/WITH/YOUR/PATH/14-11-test-program/dist/index.js"],
      "env": {
        "FIREBASE_SERVICE_ACCOUNT_PATH": "/REPLACE/WITH/YOUR/PATH/firebase-credentials.json",
        "FIREBASE_DATABASE_URL": "https://pnl-amzon-default-rtdb.firebaseio.com"
      }
    }
  }
}
```

### Windows Configuration

Edit: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pnl-analytics": {
      "command": "node",
      "args": ["C:\\REPLACE\\WITH\\YOUR\\PATH\\14-11-test-program\\dist\\index.js"],
      "env": {
        "FIREBASE_SERVICE_ACCOUNT_PATH": "C:\\REPLACE\\WITH\\YOUR\\PATH\\firebase-credentials.json",
        "FIREBASE_DATABASE_URL": "https://pnl-amzon-default-rtdb.firebaseio.com"
      }
    }
  }
}
```

### Linux Configuration

Edit: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pnl-analytics": {
      "command": "node",
      "args": ["/home/user/14-11-test-program/dist/index.js"],
      "env": {
        "FIREBASE_SERVICE_ACCOUNT_PATH": "/home/user/14-11-test-program/firebase-credentials.json",
        "FIREBASE_DATABASE_URL": "https://pnl-amzon-default-rtdb.firebaseio.com"
      }
    }
  }
}
```

**Important:**
- Use **absolute paths**, not relative paths
- Replace `/REPLACE/WITH/YOUR/PATH/` with your actual directory path
- Windows users: Use double backslashes `\\` or forward slashes `/`

---

## Step 5: Restart Claude Desktop

After updating the configuration:

1. **Completely quit** Claude Desktop (not just close the window)
   - macOS: Cmd+Q
   - Windows: Right-click taskbar icon → Quit
   - Linux: Quit from system tray

2. **Wait 5 seconds**

3. **Restart** Claude Desktop

---

## Verifying It Works

Once Claude Desktop is running, start a new conversation and ask:

```
Can you list the available MCP tools?
```

You should see tools like:
- `list_users`
- `get_asin_data`
- `get_invoices`
- `get_advertising_data`
- `get_vret_cogs`
- `get_freight_costs`
- `get_profit_summary`

Then test with:

```
List all users in the P&L system
```

---

## Troubleshooting

### Issue: MCP Server Not Appearing in Claude

**Check Claude Desktop Logs:**

**macOS:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows:**
```cmd
type %APPDATA%\Claude\logs\mcp*.log
```

**Linux:**
```bash
tail -f ~/.config/Claude/logs/mcp*.log
```

Look for error messages related to `pnl-analytics`.

### Issue: "Tool execution failed"

This usually means:
1. Firebase credentials are incorrect
2. User ID doesn't exist
3. No data in Firebase

**Solution:**
```
Ask Claude: "List all users in the P&L system"
```

If you get user IDs, try:
```
"Get ASIN data for user {USER_ID_HERE}"
```

### Issue: "No data returned"

1. Check Firebase Console to verify data exists
2. Make sure you're logged into your web app and have saved data
3. Verify the Firebase Database URL is correct

### Issue: Server crashes immediately

Run the server manually to see the error:
```bash
cd /home/user/14-11-test-program
node dist/index.js
```

Check the error message and fix accordingly.

---

## Testing Without Claude Desktop

You can test the MCP server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

This opens a web interface to test your MCP tools.

---

## Common Mistakes

1. ❌ Using relative paths in Claude Desktop config
   ✅ Use absolute paths like `/home/user/14-11-test-program/...`

2. ❌ Forgetting to restart Claude Desktop after config changes
   ✅ Always fully quit and restart

3. ❌ Missing `.env` file or Firebase credentials
   ✅ Create `.env` and add Firebase service account

4. ❌ Not rebuilding after code changes
   ✅ Run `npm run build` after any changes

5. ❌ Wrong Firebase Database URL
   ✅ Use `https://pnl-amzon-default-rtdb.firebaseio.com`

---

## Quick Test Script

Save this as `test-mcp.sh` and run it to diagnose issues:

```bash
#!/bin/bash

echo "🔍 MCP Server Diagnostics"
echo "========================"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
node --version || echo "❌ Node.js not found"

# Check npm
echo "✓ Checking npm..."
npm --version || echo "❌ npm not found"

# Check if dependencies are installed
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✓ node_modules exists"
else
    echo "  ❌ node_modules missing - run: npm install"
fi

# Check build
echo "✓ Checking build..."
if [ -f "dist/index.js" ]; then
    echo "  ✓ dist/index.js exists"
else
    echo "  ❌ Build missing - run: npm run build"
fi

# Check Firebase credentials
echo "✓ Checking Firebase credentials..."
if [ -f ".env" ]; then
    echo "  ✓ .env file exists"
else
    echo "  ❌ .env file missing - create from .env.example"
fi

if [ -f "firebase-credentials.json" ]; then
    echo "  ✓ firebase-credentials.json exists"
else
    echo "  ⚠️  firebase-credentials.json missing (if using FIREBASE_SERVICE_ACCOUNT_JSON env var, ignore this)"
fi

echo ""
echo "📊 Summary"
echo "=========="
echo "Run 'npm start' to test if the server starts correctly."
echo "Check logs for any errors."
```

---

## Need More Help?

If you're still having issues:

1. **Check the error message** carefully
2. **Search the error** in the troubleshooting section above
3. **Verify all paths** are absolute and correct
4. **Check Firebase Console** to ensure data exists
5. **Try the test script** above to diagnose the issue

Remember: The most common issue is missing or incorrect Firebase credentials!
