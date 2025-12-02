#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import admin from "firebase-admin";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const path = join(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      serviceAccount = JSON.parse(readFileSync(path, "utf8"));
    } else {
      throw new Error(
        "Firebase credentials not found. Please set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON"
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://pnl-amzon-default-rtdb.firebaseio.com",
    });

    console.error("Firebase initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    throw error;
  }
}

// Initialize Firebase
initializeFirebase();
const db = admin.database();

// Create MCP server
const server = new Server(
  {
    name: "pnl-analytics-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to get user data
async function getUserData(userId: string, dataPath: string): Promise<any> {
  const snapshot = await db.ref(`users/${userId}/${dataPath}`).once("value");
  return snapshot.val();
}

// Helper function to query data with filters
function filterData(data: any[], filters: Record<string, any>): any[] {
  if (!data || !Array.isArray(data)) return [];

  return data.filter((item) => {
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_asin_data",
        description: "Retrieve ASIN (product) data for analysis. Returns monthly product performance data including sales, costs, and profit metrics across multiple vendors (eTrade, RetailEZ, ClickTech).",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID to fetch data for (required for authentication)",
            },
            asin: {
              type: "string",
              description: "Filter by specific ASIN (optional)",
            },
            vendor: {
              type: "string",
              description: "Filter by vendor: eTrade, RetailEZ, or ClickTech (optional)",
            },
            month: {
              type: "string",
              description: "Filter by month in format YYYY-MM (optional)",
            },
            limit: {
              type: "number",
              description: "Limit number of results (default: 100)",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "get_invoices",
        description: "Retrieve invoice data (both Direct Fulfillment and Fulfillment Center invoices). Returns detailed invoice records with amounts, dates, and vendor information.",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID to fetch data for",
            },
            invoiceType: {
              type: "string",
              enum: ["df", "fc", "all"],
              description: "Invoice type: 'df' for Direct Fulfillment, 'fc' for Fulfillment Center, 'all' for both (default: all)",
            },
            vendor: {
              type: "string",
              description: "Filter by vendor (optional)",
            },
            startDate: {
              type: "string",
              description: "Filter invoices from this date (YYYY-MM-DD format, optional)",
            },
            endDate: {
              type: "string",
              description: "Filter invoices until this date (YYYY-MM-DD format, optional)",
            },
            limit: {
              type: "number",
              description: "Limit number of results (default: 100)",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "get_advertising_data",
        description: "Retrieve advertising campaign data including ad spend, impressions, clicks, and ACOS metrics across vendors.",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID to fetch data for",
            },
            vendor: {
              type: "string",
              description: "Filter by vendor (optional)",
            },
            campaignName: {
              type: "string",
              description: "Filter by campaign name (optional)",
            },
            startDate: {
              type: "string",
              description: "Filter data from this date (YYYY-MM-DD format, optional)",
            },
            endDate: {
              type: "string",
              description: "Filter data until this date (YYYY-MM-DD format, optional)",
            },
            limit: {
              type: "number",
              description: "Limit number of results (default: 100)",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "get_vret_cogs",
        description: "Retrieve VRET (Vendor Returns) and COGS (Cost of Goods Sold) data for analyzing returns and cost metrics.",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID to fetch data for",
            },
            vendor: {
              type: "string",
              description: "Filter by vendor (optional)",
            },
            month: {
              type: "string",
              description: "Filter by month in format YYYY-MM (optional)",
            },
            limit: {
              type: "number",
              description: "Limit number of results (default: 100)",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "get_freight_costs",
        description: "Retrieve freight cost data for shipments and logistics. Returns freight charges, dates, and related shipping information.",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID to fetch data for",
            },
            vendor: {
              type: "string",
              description: "Filter by vendor (optional)",
            },
            startDate: {
              type: "string",
              description: "Filter freight costs from this date (YYYY-MM-DD format, optional)",
            },
            endDate: {
              type: "string",
              description: "Filter freight costs until this date (YYYY-MM-DD format, optional)",
            },
            limit: {
              type: "number",
              description: "Limit number of results (default: 100)",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "get_profit_summary",
        description: "Get aggregated profit and loss summary across all vendors. Calculates total revenue, costs, advertising spend, and net profit for a specified time period.",
        inputSchema: {
          type: "object",
          properties: {
            userId: {
              type: "string",
              description: "User ID to fetch data for",
            },
            startMonth: {
              type: "string",
              description: "Start month in format YYYY-MM (optional)",
            },
            endMonth: {
              type: "string",
              description: "End month in format YYYY-MM (optional)",
            },
            vendor: {
              type: "string",
              description: "Filter by specific vendor (optional)",
            },
          },
          required: ["userId"],
        },
      },
      {
        name: "list_users",
        description: "List all user IDs in the system. Useful for discovering available user data.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "list_users": {
        const snapshot = await db.ref("users").once("value");
        const users = snapshot.val();
        const userIds = users ? Object.keys(users) : [];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                userIds,
                count: userIds.length,
              }, null, 2),
            },
          ],
        };
      }

      case "get_asin_data": {
        const { userId, asin, vendor, month, limit = 100 } = args as any;

        const asinData = await getUserData(userId, "asinData");
        let results: any[] = [];

        if (asinData) {
          // Firebase can store data in batches, collect all
          for (const key in asinData) {
            const batch = asinData[key];
            if (Array.isArray(batch)) {
              results.push(...batch);
            } else if (typeof batch === "object") {
              results.push(batch);
            }
          }

          // Apply filters
          const filters: Record<string, any> = {};
          if (asin) filters.asin = asin;
          if (vendor) filters.vendor = vendor;
          if (month) filters.month = month;

          results = filterData(results, filters);
          results = results.slice(0, limit);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                count: results.length,
                data: results,
              }, null, 2),
            },
          ],
        };
      }

      case "get_invoices": {
        const { userId, invoiceType = "all", vendor, startDate, endDate, limit = 100 } = args as any;

        let results: any[] = [];

        // Fetch DF invoices
        if (invoiceType === "df" || invoiceType === "all") {
          const dfInvoices = await getUserData(userId, "savedInvoices");
          if (dfInvoices) {
            for (const key in dfInvoices) {
              const batch = dfInvoices[key];
              if (Array.isArray(batch)) {
                results.push(...batch.map(inv => ({ ...inv, type: "df" })));
              } else if (typeof batch === "object") {
                results.push({ ...batch, type: "df" });
              }
            }
          }
        }

        // Fetch FC invoices (if they're stored separately)
        if (invoiceType === "fc" || invoiceType === "all") {
          const fcInvoices = await getUserData(userId, "fcInvoices");
          if (fcInvoices) {
            for (const key in fcInvoices) {
              const batch = fcInvoices[key];
              if (Array.isArray(batch)) {
                results.push(...batch.map(inv => ({ ...inv, type: "fc" })));
              } else if (typeof batch === "object") {
                results.push({ ...batch, type: "fc" });
              }
            }
          }
        }

        // Apply filters
        if (vendor) {
          results = results.filter(inv => inv.vendor === vendor);
        }

        if (startDate) {
          results = results.filter(inv => inv.date >= startDate);
        }

        if (endDate) {
          results = results.filter(inv => inv.date <= endDate);
        }

        results = results.slice(0, limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                count: results.length,
                data: results,
              }, null, 2),
            },
          ],
        };
      }

      case "get_advertising_data": {
        const { userId, vendor, campaignName, startDate, endDate, limit = 100 } = args as any;

        const adData = await getUserData(userId, "advertisingData");
        let results: any[] = [];

        if (adData) {
          for (const key in adData) {
            const batch = adData[key];
            if (Array.isArray(batch)) {
              results.push(...batch);
            } else if (typeof batch === "object") {
              results.push(batch);
            }
          }

          // Apply filters
          if (vendor) {
            results = results.filter(ad => ad.vendor === vendor);
          }

          if (campaignName) {
            results = results.filter(ad => ad.campaignName?.includes(campaignName));
          }

          if (startDate) {
            results = results.filter(ad => ad.date >= startDate);
          }

          if (endDate) {
            results = results.filter(ad => ad.date <= endDate);
          }

          results = results.slice(0, limit);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                count: results.length,
                data: results,
              }, null, 2),
            },
          ],
        };
      }

      case "get_vret_cogs": {
        const { userId, vendor, month, limit = 100 } = args as any;

        const vretData = await getUserData(userId, "savedVretCogs");
        let results: any[] = [];

        if (vretData) {
          for (const key in vretData) {
            const batch = vretData[key];
            if (Array.isArray(batch)) {
              results.push(...batch);
            } else if (typeof batch === "object") {
              results.push(batch);
            }
          }

          // Apply filters
          const filters: Record<string, any> = {};
          if (vendor) filters.vendor = vendor;
          if (month) filters.month = month;

          results = filterData(results, filters);
          results = results.slice(0, limit);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                count: results.length,
                data: results,
              }, null, 2),
            },
          ],
        };
      }

      case "get_freight_costs": {
        const { userId, vendor, startDate, endDate, limit = 100 } = args as any;

        let results: any[] = [];
        const vendors = vendor ? [vendor] : ['etrade', 'retailez', 'clicktech'];

        // Freight costs are stored per vendor as: {invoiceId: cost}
        for (const vendorName of vendors) {
          const freightData = await getUserData(userId, `freightCosts/${vendorName}`);

          if (freightData && typeof freightData === 'object') {
            // Convert invoice ID -> cost mapping to array of objects
            for (const [invoiceId, cost] of Object.entries(freightData)) {
              results.push({
                vendor: vendorName,
                invoiceId: invoiceId,
                freightCost: cost,
              });
            }
          }
        }

        // If we need to filter by date, we need to fetch invoice data to get dates
        if (startDate || endDate) {
          // Fetch invoice data to get dates for each invoice
          const invoiceData: any = {};

          for (const vendorName of vendors) {
            const dfInvoices = await getUserData(userId, `savedInvoices/${vendorName}`);
            if (dfInvoices) {
              // Collect all invoices from batches
              for (const key in dfInvoices) {
                const batch = dfInvoices[key];
                const invoices = Array.isArray(batch) ? batch : [batch];
                invoices.forEach((inv: any) => {
                  if (inv.invoiceId) {
                    invoiceData[inv.invoiceId] = inv.date;
                  }
                });
              }
            }
          }

          // Add dates to freight results and filter
          results = results.map(freight => ({
            ...freight,
            date: invoiceData[freight.invoiceId] || null,
          }));

          if (startDate) {
            results = results.filter(freight => freight.date && freight.date >= startDate);
          }

          if (endDate) {
            results = results.filter(freight => freight.date && freight.date <= endDate);
          }
        }

        results = results.slice(0, limit);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                count: results.length,
                data: results,
              }, null, 2),
            },
          ],
        };
      }

      case "get_profit_summary": {
        const { userId, startMonth, endMonth, vendor } = args as any;

        // Fetch ASIN data for revenue calculations
        const asinData = await getUserData(userId, "asinData");
        const advertisingData = await getUserData(userId, "advertisingData");

        let asinRecords: any[] = [];
        let adRecords: any[] = [];

        // Collect ASIN data
        if (asinData) {
          for (const key in asinData) {
            const batch = asinData[key];
            if (Array.isArray(batch)) {
              asinRecords.push(...batch);
            } else if (typeof batch === "object") {
              asinRecords.push(batch);
            }
          }
        }

        // Collect advertising data
        if (advertisingData) {
          for (const key in advertisingData) {
            const batch = advertisingData[key];
            if (Array.isArray(batch)) {
              adRecords.push(...batch);
            } else if (typeof batch === "object") {
              adRecords.push(batch);
            }
          }
        }

        // Apply month and vendor filters
        if (startMonth) {
          asinRecords = asinRecords.filter(r => r.month >= startMonth);
          adRecords = adRecords.filter(r => r.month >= startMonth || r.date >= startMonth);
        }

        if (endMonth) {
          asinRecords = asinRecords.filter(r => r.month <= endMonth);
          adRecords = adRecords.filter(r => r.month <= endMonth || r.date <= endMonth);
        }

        if (vendor) {
          asinRecords = asinRecords.filter(r => r.vendor === vendor);
          adRecords = adRecords.filter(r => r.vendor === vendor);
        }

        // Calculate summary
        const totalRevenue = asinRecords.reduce((sum, r) => sum + (parseFloat(r.revenue) || 0), 0);
        const totalCosts = asinRecords.reduce((sum, r) => sum + (parseFloat(r.costs) || 0), 0);
        const totalAdSpend = adRecords.reduce((sum, r) => sum + (parseFloat(r.spend) || 0), 0);

        const summary = {
          totalRevenue,
          totalCosts,
          totalAdSpend,
          netProfit: totalRevenue - totalCosts - totalAdSpend,
          recordCount: asinRecords.length,
          adRecordCount: adRecords.length,
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error: any) {
    console.error("Tool execution error:", error);
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error.message}`
    );
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("P&L Analytics MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
