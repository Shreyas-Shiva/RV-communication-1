# COMMUNIQ Deployment and Custom Domain Connection Guide

This guide describes the complete procedure for deploying COMMUNIQ frontend and backend services, connecting custom domains, setting up DNS records, enforcing HTTPS, and configuring production environment variables.

---

## 1. Architecture Overview

- **Frontend**: Single-Page Application and Progressive Web App (PWA) built with React, Vite, and Tailwind CSS. Hosted on any high-availability static edge CDN (such as Cloudflare Pages, Vercel, Netlify, or Firebase Hosting).
- **Backend**: Python FastAPI service providing optional cloud log synchronization to MongoDB Atlas. Hosted on containerized platforms (such as Render, Railway, Fly.io, or AWS App Runner).
- **Offline Reliability**: Even if the backend server is temporarily offline or disconnected, all core features (speech synthesis, picture boards, intent templates, and daily logs) function continuously on the user's device via IndexedDB.

---

## 2. Environment Variables

### Frontend (`/frontend/.env.production`)
Create or set the following environment variables in your deployment dashboard:

```env
# Canonical public URL of your web application (used for Open Graph and sitemaps)
VITE_APP_URL=https://communiq.app

# Public base URL of your FastAPI backend API
VITE_API_URL=https://api.communiq.app
```

### Backend (`/backend/.env`)
Set the following environment variables in your backend hosting service:

```env
# MongoDB Atlas cluster connection string
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/communiq?retryWrites=true&w=majority

# Target database name
DATABASE_NAME=communiq

# Allowed frontend origins for CORS
CORS_ORIGINS=https://communiq.app,https://www.communiq.app
```

---

## 3. Step-by-Step DNS and Domain Setup

Assume you own the domain `communiq.app` and want:
- Web App: `communiq.app` and `www.communiq.app`
- API Service: `api.communiq.app`

### Step 3.1: Apex Domain and Subdomain Configuration

Log in to your DNS provider (Cloudflare, Namecheap, Google Domains / Squarespace, or GoDaddy). Add the following DNS records:

| Type | Name / Host | Target / Value | TTL | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **A** | `@` (or apex) | `192.0.2.1` (Replace with your static hosting IP) | Auto / 300 | Directs root domain to web host |
| **CNAME** | `www` | `communiq.app` (or host CNAME target) | Auto / 300 | Aliases www traffic to apex |
| **CNAME** | `api` | `communiq-api.onrender.com` (Your backend target) | Auto / 300 | Directs API requests to backend |

### Step 3.2: Enforce HTTPS-Only Traffic

1. In your DNS or CDN provider (for example Cloudflare SSL/TLS dashboard):
   - Set encryption mode to **Full (Strict)**.
   - Enable **Always Use HTTPS** to automatically redirect any `http://` traffic to `https://`.
   - Enable **Automatic HTTPS Rewrites**.
   - Enable **HTTP Strict Transport Security (HSTS)** with a minimum max-age of 6 months.
2. Web browsers require a secure HTTPS context to grant Web Speech API capabilities and Service Worker registration.

---

## 4. Frontend Deployment Instructions

### Option A: Cloudflare Pages (Recommended)
1. Link your Git repository to Cloudflare Pages.
2. Build Settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Root directory: `frontend`
3. Environment variables: Add `VITE_APP_URL` and `VITE_API_URL`.
4. Custom Domains: In the Cloudflare Pages project settings, add `communiq.app` and `www.communiq.app`.

### Option B: Vercel or Netlify
1. Import repository into Vercel or Netlify.
2. Root directory: `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set Single Page Application rewrites so all routes route to `/index.html`.

---

## 5. Backend Deployment Instructions

### Deploying FastAPI on Render
1. Create a new **Web Service** on Render and connect your repository.
2. Root Directory: `backend`.
3. Runtime: `Python 3`.
4. Build Command: `pip install -r requirements.txt`.
5. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port 10000`.
6. Environment Variables:
   - Set `MONGO_URI` to your MongoDB Atlas connection URI.
   - Set `CORS_ORIGINS` to `https://communiq.app,https://www.communiq.app`.
7. Add Custom Domain: Set `api.communiq.app` under the custom domains settings.

---

## 6. Pre-Launch Verification Checklist

Before directing real users to the custom domain:
1. Verify SSL Certificate: Visit `https://communiq.app` and confirm the browser lock icon shows a valid certificate.
2. Verify HTTP Redirect: Confirm that entering `http://communiq.app` automatically redirects to `https://communiq.app`.
3. Verify PWA Manifest: Inspect DevTools Application tab to confirm `site.webmanifest` loads with all icons.
4. Verify Offline Support: Disconnect network in DevTools and confirm cards, speech, and activity logs continue functioning.
5. Verify Brand Audit: Run `npm run check:branding` and confirm zero template watermarks exist.
