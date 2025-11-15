# Google Sheets Integration Setup Guide

This guide will help you migrate your P&L Management Software from Firebase to Google Sheets.

## Prerequisites

- A Google Account
- Basic understanding of Google Cloud Console
- The INDEX.html file from this repository

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `PNL-Management` (or any name you prefer)
5. Click **"Create"**
6. Wait for the project to be created (takes a few seconds)

---

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, make sure your new project is selected
2. Go to **"APIs & Services"** > **"Library"** (or [click here](https://console.cloud.google.com/apis/library))
3. Search for **"Google Sheets API"**
4. Click on **"Google Sheets API"**
5. Click **"Enable"**
6. Wait for it to enable (takes a few seconds)

---

## Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** > **"Credentials"** (or [click here](https://console.cloud.google.com/apis/credentials))
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

### Configure OAuth Consent Screen (if prompted)

If you haven't set up the OAuth consent screen:

1. Click **"CONFIGURE CONSENT SCREEN"**
2. Select **"External"** (unless you have a Google Workspace account, then choose Internal)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `P&L Management Software`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the **Scopes** page, click **"Add or Remove Scopes"**
7. Add these scopes:
   - `https://www.googleapis.com/auth/spreadsheets` (for read/write access to sheets)
   - `https://www.googleapis.com/auth/drive.file` (for creating spreadsheets)
8. Click **"Update"**
9. Click **"Save and Continue"**
10. On **Test users** page (if External), click **"Add Users"** and add your email
11. Click **"Save and Continue"**
12. Review and click **"Back to Dashboard"**

### Create the OAuth Client ID

1. Go back to **"APIs & Services"** > **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Select **Application type**: **"Web application"**
4. **Name**: `PNL Management Web Client`
5. Under **"Authorized JavaScript origins"**:
   - Click **"+ Add URI"**
   - Add: `http://localhost:8000` (for local testing)
   - Click **"+ Add URI"** again
   - Add: `http://127.0.0.1:8000` (alternative local address)
   - If you're hosting online, add your domain (e.g., `https://yourdomain.com`)
6. Under **"Authorized redirect URIs"**:
   - Click **"+ Add URI"**
   - Add: `http://localhost:8000` (or your domain)
7. Click **"Create"**
8. **IMPORTANT**: Copy your **Client ID** - you'll need this in Step 5
   - It looks like: `123456789-abc123def456.apps.googleusercontent.com`
9. You can ignore the Client Secret for now (not needed for JavaScript apps)
10. Click **"OK"**

---

## Step 4: Create Your Google Sheets Database

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it: `PNL Management Database`
4. Create the following sheets (tabs at the bottom):
   - `etrade_asinData`
   - `etrade_invoices`
   - `etrade_advertising`
   - `etrade_vretcogs`
   - `etrade_freight`
   - `retailez_asinData`
   - `retailez_invoices`
   - `retailez_advertising`
   - `retailez_vretcogs`
   - `retailez_freight`
   - `clicktech_asinData`
   - `clicktech_invoices`
   - `clicktech_advertising`
   - `clicktech_vretcogs`
   - `clicktech_freight`
   - `metadata`

### Set up headers for each sheet:

**For `*_asinData` sheets:**
Row 1: `ASIN | Vendor Price | Date`

**For `*_invoices` sheets:**
Row 1: `Date | ASIN | Quantity | Item Price | Freight`

**For `*_advertising` sheets:**
Row 1: `Date | ASIN | Spend | Sales | Orders | Clicks | Impressions`

**For `*_vretcogs` sheets:**
Row 1: `Date | ASIN | VRET Amount | COGS`

**For `*_freight` sheets:**
Row 1: `Invoice ID | Amount`

**For `metadata` sheet:**
Row 1: `Key | Value`
Row 2: `lastUpdated | [leave empty]`

5. **Copy the Spreadsheet ID** from the URL:
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` part (a long string of letters, numbers, and hyphens)
   - Example: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

## Step 5: Update the INDEX.html File

1. Open `INDEX.html` in a text editor
2. Find this line (around line 5720):
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID from Step 3
4. Find this line (around line 5721):
   ```javascript
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
5. Replace `YOUR_SPREADSHEET_ID_HERE` with your Spreadsheet ID from Step 4

---

## Step 6: Run the Application Locally

You need to serve the HTML file through a web server (not just opening the file directly) because Google OAuth requires a proper origin.

### Option A: Using Python (Recommended)

If you have Python installed:

```bash
# For Python 3.x
python3 -m http.server 8000

# For Python 2.x
python -m SimpleHTTPServer 8000
```

Then open your browser and go to: `http://localhost:8000/INDEX.html`

### Option B: Using Node.js

If you have Node.js installed:

```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000/INDEX.html`

### Option C: Using VS Code Live Server

1. Install the "Live Server" extension in VS Code
2. Right-click on `INDEX.html`
3. Select "Open with Live Server"

---

## Step 7: First Time Login

1. Open the application in your browser
2. Click **"Sign in with Google"**
3. Select your Google account
4. **Grant permissions** when prompted:
   - "See, edit, create, and delete your spreadsheets in Google Drive"
   - Click **"Allow"**
5. You'll be redirected back to the application
6. Your data will now be saved to your Google Sheet!

---

## Step 8: Verify Data Storage

1. Add some test data in the application (e.g., add an ASIN, invoice, or advertising data)
2. Go back to your Google Sheet
3. Check the appropriate tab (e.g., `etrade_asinData`)
4. You should see your data appearing in rows 2, 3, 4, etc. (Row 1 is headers)

---

## Troubleshooting

### Issue: "Access blocked: This app's request is invalid"

**Solution**: Make sure you've added your localhost URL to "Authorized JavaScript origins" in Step 3.

### Issue: "The OAuth client was not found"

**Solution**: Double-check that you copied the Client ID correctly in Step 5.

### Issue: "Spreadsheet not found"

**Solution**:
- Verify the Spreadsheet ID in Step 5
- Make sure you're logged in with the same Google account that owns the spreadsheet
- Share the spreadsheet with "Anyone with the link can edit" temporarily to test

### Issue: Data not saving

**Solution**:
- Open browser console (F12) and check for errors
- Verify all sheet names match exactly (case-sensitive)
- Check that headers are in Row 1 of each sheet

### Issue: "Failed to fetch"

**Solution**: Make sure you're accessing the file through a web server (http://localhost:8000), not directly (file:///)

---

## Hosting Online (Optional)

If you want to host this online:

1. Upload `INDEX.html` to your web hosting service (GitHub Pages, Netlify, Vercel, etc.)
2. Get your public URL (e.g., `https://yourusername.github.io/pnl-management`)
3. Go back to Google Cloud Console > Credentials
4. Edit your OAuth Client ID
5. Add your public URL to "Authorized JavaScript origins"
6. Update the `GOOGLE_CLIENT_ID` in your hosted INDEX.html file

---

## Security Notes

⚠️ **IMPORTANT**:
- Never share your Client ID publicly if it's configured for a specific domain
- Keep your Spreadsheet ID private
- Use OAuth consent screen in "Internal" mode if using Google Workspace for better security
- Consider adding user validation logic if multiple users will access the sheet

---

## Benefits of Google Sheets vs Firebase

✅ **Advantages**:
- No database costs (Firebase has usage limits)
- Easy to view/edit data directly in Google Sheets
- Familiar spreadsheet interface
- Built-in data export (CSV, Excel)
- No complex database rules needed
- Better for small to medium datasets

⚠️ **Considerations**:
- Google Sheets API has rate limits (60 requests per minute per user)
- Not ideal for very large datasets (>1000 rows per sheet may be slow)
- Concurrent editing by multiple users can cause conflicts
- Requires Google account and OAuth permissions

---

## Data Migration from Firebase (Optional)

If you have existing data in Firebase:

1. Go to your Firebase Console
2. Navigate to Realtime Database
3. Click the three dots menu > "Export JSON"
4. Save the JSON file
5. Use a JSON-to-CSV converter (many free online tools)
6. Import the CSV data into your Google Sheets tabs
7. Make sure column order matches the headers defined in Step 4

---

## Support

If you encounter issues:
1. Check the browser console for error messages (F12)
2. Verify all setup steps were completed
3. Test with a fresh incognito window
4. Review the Google Cloud Console > APIs & Services > Dashboard for quota/error metrics

---

## Next Steps

Once everything is working:
- Customize the spreadsheet with additional columns if needed
- Set up data validation rules in Google Sheets
- Create charts/dashboards directly in the Google Sheet
- Share the spreadsheet with team members (View Only or Editor access)

**Congratulations! Your P&L Management Software is now powered by Google Sheets!** 🎉
