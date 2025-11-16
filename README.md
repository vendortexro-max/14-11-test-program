# P&L Analytics MCP Server

Model Context Protocol (MCP) server for Multi-Vendor Business Analytics & P&L Management System. This server enables Claude AI to query and analyze your e-commerce business data stored in Firebase.

## Features

The MCP server provides Claude AI with access to:

- **ASIN Data**: Product performance metrics, sales, costs, and profit across vendors
- **Invoice Data**: Direct Fulfillment (DF) and Fulfillment Center (FC) invoices
- **Advertising Data**: Campaign spend, impressions, clicks, and ACOS metrics
- **VRET & COGS**: Vendor returns and cost of goods sold tracking
- **Profit Summaries**: Aggregated P&L calculations across time periods

## Supported Vendors

- eTrade
- RetailEZ
- ClickTech

## Prerequisites

- Node.js 18+ and npm
- Firebase Admin SDK credentials (service account key)
- Access to the Firebase Realtime Database: `pnl-amzon`

## Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Set up Firebase credentials**:

   Option A: Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

   Then download your Firebase service account key:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `pnl-amzon`
   - Go to **Project Settings** > **Service Accounts**
   - Click **Generate New Private Key**
   - Save the JSON file as `firebase-credentials.json` in the project root

   Option B: Set environment variable with JSON content:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   ```

3. **Build the server**:

```bash
npm run build
```

## Usage

### Running the Server

Start the MCP server:

```bash
npm start
```

For development with auto-rebuild:

```bash
npm run watch
```

### Connecting to Claude Desktop

Add this configuration to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pnl-analytics": {
      "command": "node",
      "args": ["/absolute/path/to/14-11-test-program/dist/index.js"],
      "env": {
        "FIREBASE_SERVICE_ACCOUNT_PATH": "/absolute/path/to/firebase-credentials.json",
        "FIREBASE_DATABASE_URL": "https://pnl-amzon-default-rtdb.firebaseio.com"
      }
    }
  }
}
```

Replace `/absolute/path/to/` with your actual paths.

### Restart Claude Desktop

After adding the configuration, restart Claude Desktop to load the MCP server.

## Available Tools

### 1. `list_users`
List all user IDs in the system.

**Example**: "Show me all users in the system"

### 2. `get_asin_data`
Retrieve product performance data.

**Parameters**:
- `userId` (required): User ID
- `asin` (optional): Filter by specific ASIN
- `vendor` (optional): Filter by vendor
- `month` (optional): Filter by month (YYYY-MM)
- `limit` (optional): Limit results (default: 100)

**Example**: "Get ASIN data for user xyz123 from vendor eTrade"

### 3. `get_invoices`
Retrieve invoice records.

**Parameters**:
- `userId` (required): User ID
- `invoiceType` (optional): "df", "fc", or "all" (default: all)
- `vendor` (optional): Filter by vendor
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Limit results (default: 100)

**Example**: "Show me all DF invoices for user xyz123 from January 2024"

### 4. `get_advertising_data`
Retrieve advertising campaign data.

**Parameters**:
- `userId` (required): User ID
- `vendor` (optional): Filter by vendor
- `campaignName` (optional): Filter by campaign name
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)
- `limit` (optional): Limit results (default: 100)

**Example**: "What's my advertising spend for RetailEZ in Q1 2024?"

### 5. `get_vret_cogs`
Retrieve vendor returns and COGS data.

**Parameters**:
- `userId` (required): User ID
- `vendor` (optional): Filter by vendor
- `month` (optional): Filter by month (YYYY-MM)
- `limit` (optional): Limit results (default: 100)

**Example**: "Show VRET data for ClickTech in March 2024"

### 6. `get_profit_summary`
Get aggregated P&L summary.

**Parameters**:
- `userId` (required): User ID
- `startMonth` (optional): Start month (YYYY-MM)
- `endMonth` (optional): End month (YYYY-MM)
- `vendor` (optional): Filter by vendor

**Example**: "Calculate my total profit for 2024"

## Example Queries for Claude

Once connected, you can ask Claude questions like:

- "List all users in the P&L system"
- "What's the total revenue for user abc123 in 2024?"
- "Show me the top performing ASINs for eTrade last month"
- "Calculate my net profit across all vendors for Q1 2024"
- "What's my ACOS for advertising campaigns in February?"
- "Compare performance between eTrade and RetailEZ"
- "Show me all invoices over $10,000 from last quarter"

## Development

### Project Structure

```
.
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
└── README.md            # This file
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled server
- `npm run dev` - Build and run in one command
- `npm run watch` - Watch mode for development

## Security Notes

- **Never commit** `firebase-credentials.json` or `.env` files
- The `.gitignore` file is configured to exclude sensitive files
- Firebase credentials provide full admin access to your database
- Ensure proper user authentication in production use

## Troubleshooting

### Server won't start

1. Check that Firebase credentials are correctly configured
2. Verify the database URL is correct
3. Ensure Node.js 18+ is installed: `node --version`

### Claude can't connect

1. Verify the absolute paths in `claude_desktop_config.json`
2. Check that the server builds without errors: `npm run build`
3. Look at Claude Desktop logs for error messages
4. Restart Claude Desktop after config changes

### No data returned

1. Verify the user ID exists using `list_users`
2. Check that data exists in Firebase Console
3. Ensure proper data structure in Firebase Realtime Database

## Firebase Data Structure

Expected data structure in Firebase:

```
users/
  {userId}/
    asinData/
      batch_0: [...]
      batch_1: [...]
    savedInvoices/
      batch_0: [...]
    advertisingData/
      batch_0: [...]
    savedVretCogs/
      batch_0: [...]
```

## License

MIT

## Support

For issues with:
- **MCP Server**: Check server logs and Firebase credentials
- **Claude Integration**: See [MCP Documentation](https://modelcontextprotocol.io/)
- **Firebase**: Verify database rules and authentication
