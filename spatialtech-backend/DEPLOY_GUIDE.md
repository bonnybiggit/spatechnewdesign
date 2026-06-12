# 🚀 Spatial Heights Technologies — cPanel Deployment Guide

Follow these exact steps to ensure your backend runs perfectly on cPanel.

## 1. Folder Structure
Ensure your files are uploaded to the folder you designated as the **Application Root** (e.g., `/home/username/spatialtech-backend`).

**Essential Files Checklist:**
- [ ] `app.js` (The entry point bridge)
- [ ] `server.js` (Main logic)
- [ ] `package.json`
- [ ] `.htaccess` (Routing and security)
- [ ] `public/` (Frontend assets)
- [ ] `.env` (Environment variables)

## 2. cPanel Node.js Setup
Go to **"Setup Node.js App"** in cPanel and configure as follows:

- **Node.js version:** 18.x or 20.x
- **Application mode:** Production
- **Application root:** `spatialtech-backend` (or your folder name)
- **Application URL:** `yourdomain.com`
- **Application startup file:** `app.js`

Click **"Save"** and then **"Run NPM Install"**.

## 3. Environment Variables (VERY IMPORTANT)
cPanel often ignores the file `.env`. You **MUST** add these variables manually in the "Environment variables" section at the bottom of the Setup page:

| Key | Value (Example) |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | *Your MongoDB Atlas string* |
| `JWT_SECRET` | *A long random string* |
| `PORT` | `3000` |
| `EMAIL_USER` | *Your SMTP email* |
| `EMAIL_PASS` | *Your App Password* |

## 4. Database Whitelisting
If you are using MongoDB Atlas, the connection will fail unless you authorize your server.
1. Find your **Server IP** in cPanel (usually in the right sidebar under "Shared IP Address").
2. Go to **MongoDB Atlas** -> **Network Access**.
3. Click **"Add IP Address"** and paste your Server IP.

## 5. Troubleshooting
- **503 / 504 Error:** Usually means the server crashed. Click the **"Restart"** button in cPanel.
- **Can't see site:** Ensure you deleted any default `index.html` or `index.php` that cPanel might have placed in your `public_html` folder if they are conflicting with your Node app.
- **Logs:** Check the `stderr.log` file in your application root to see specific error messages.

---
*Created by Antigravity for Spatial Heights Technologies*
