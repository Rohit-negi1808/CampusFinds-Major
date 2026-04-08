# CampusFinds - Vercel Deployment Guide

## Overview
This guide explains how to deploy the CampusFinds frontend on Vercel with proper environment variable configuration for the Render backend.

---

## Prerequisites

1. **Frontend Project**: CampusFinds React + Vite app
2. **Backend**: Running on Render at `https://campusfinds-major.onrender.com`
3. **Accounts**: 
   - GitHub (for version control)
   - Vercel (for deployment)

---

## Step 1: Prepare Frontend Code Locally

### 1.1 Verify Environment Variables

Ensure your `.env` file is set up correctly:

```bash
# .env (for local development)
VITE_API_URL=http://localhost:5000
```

### 1.2 Test Locally

```bash
# Frontend (Terminal 1)
cd frontend
npm install
npm run dev

# Backend (Terminal 2) 
cd backend
npm install
npm run dev
```

Visit `http://localhost:3000` and verify that:
- Frontend loads without errors
- API calls work (check Browser DevTools > Console)
- Login, register, and data fetching work

---

## Step 2: Push Code to GitHub

```bash
# Ensure everything is committed
git add .
git commit -m "Prepare for Vercel deployment with Vite environment variables"
git push origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Connect Repository to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Continue with GitHub"
3. Find and import `campusfinds` repository
4. Choose:
   - **Project Name**: `campusfinds`
   - **Framework**: React
   - **Root Directory**: `./frontend`

### 3.2 Set Environment Variables

**CRITICAL STEP**: This is where the production API URL is set.

1. Before deploying, click **Environment Variables** section
2. Add a new environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://campusfinds-major.onrender.com`
   - **Environments**: Select all (Production, Preview, Development)

3. Click **Add**

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete (takes 1-2 minutes)
3. Once deployed, Vercel will give you a URL like:
   ```
   https://campusfinds.vercel.app
   ```

---

## Step 4: Verify Deployment

### 4.1 Test Frontend on Vercel

1. Visit your Vercel deployment URL: `https://campusfinds.vercel.app`
2. Open Browser DevTools (F12)
3. Check Console for errors
4. Run this in the console to verify environment variable:

```javascript
console.log('API URL:', import.meta.env.VITE_API_URL)
```

You should see: `https://campusfinds-major.onrender.com`

### 4.2 Test API Connectivity

In Browser Console:

```javascript
// Test 1: Check environment variable
console.log('API URL:', import.meta.env.VITE_API_URL)

// Test 2: Try a public endpoint
fetch('https://campusfinds-major.onrender.com/api/analytics/stats')
  .then(r => r.json())
  .then(d => console.log('✓ Backend connected:', d))
  .catch(e => console.error('✗ Error:', e))

// Test 3: Check complete flow
fetch('https://campusfinds-major.onrender.com/api/feedback/public')
  .then(r => r.json())
  .then(d => console.log('✓ Feedback loaded:', d.length, 'records'))
  .catch(e => console.error('✗ Error:', e))
```

### 4.3 Test Full User Flow

1. **Navigation**: Browse all pages without errors
2. **Landing Page**: Should load stats and feedback from backend
3. **Registration**: Register a new account
4. **Login**: Sign in with credentials
5. **Browse Items**: View found items, lost items
6. **Report Item**: Submit a new lost/found item
7. **Admin**: Login as admin and access dashboard

---

## Troubleshooting

### Issue: 404 errors on API calls

**Cause**: `VITE_API_URL` environment variable not set in Vercel

**Solution**:
```bash
# In Vercel Project Settings > Environment Variables
VITE_API_URL=https://campusfinds-major.onrender.com
```

Then **redeploy**:
- Go to Vercel Dashboard
- Click "Redeploy" or push a new commit to trigger rebuild

### Issue: CORS errors

**Verify backend** has CORS enabled:
```javascript
// In backend/server.js
app.use(cors());
```

### Issue: API timeouts

**Check if backend is running**:
```bash
curl https://campusfinds-major.onrender.com/api/analytics/stats
```

If Render app is spinning up (takes 30-60 seconds first time), wait and retry.

### Issue: Environment variable shows as undefined

**Quick fix**: Vercel needs a rebuild after adding env vars
```bash
# Go to Vercel > Deployments > Click on latest > Click "Redeploy"
# OR push a new commit to trigger rebuild
git commit --allow-empty -m "Trigger rebuild"
git push origin main
```

---

## Environment Variable Reference

| Name | Local Dev | Production |
|------|-----------|-----------|
| `VITE_API_URL` | `http://localhost:5000` | `https://campusfinds-major.onrender.com` |

## How Environment Variables Work

### Local Development (npm run dev)
```
.env.local: VITE_API_URL=http://localhost:5000
↓
import.meta.env.VITE_API_URL = "http://localhost:5000"
OR falls back to /api (Vite proxy)
```

### Vercel Production (npm run build)
```
Vercel Project Settings: VITE_API_URL=https://campusfinds-major.onrender.com
↓
import.meta.env.VITE_API_URL = "https://campusfinds-major.onrender.com"
```

---

## Code Example: How API Calls Work

All API calls in the frontend use `import.meta.env.VITE_API_URL`:

```javascript
// In any component
const baseUrl = import.meta.env.VITE_API_URL || '';

// This dynamically becomes:
// Local: http://localhost:5000
// Production: https://campusfinds-major.onrender.com

const response = await fetch(`${baseUrl}/api/found-items`);
```

---

## Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Fix: Update API endpoint"
git push origin main
# Vercel will automatically build and deploy!
```

---

## Production Checklist

Before considering deployment complete:

- [ ] Frontend builds without errors (`npm run build`)
- [ ] `VITE_API_URL` is set in Vercel Project Settings
- [ ] Landing page loads and displays live stats
- [ ] User registration works
- [ ] User login works
- [ ] Can browse found/lost items
- [ ] Can report new items
- [ ] Admin panel accessible and functional
- [ ] No console errors in browser DevTools
- [ ] All API calls use environment variable (no hardcoded URLs)

---

## Official Links

- **Vercel**: https://vercel.com
- **Render**: https://render.com
- **Vite Docs**: https://vitejs.dev
- **React Docs**: https://react.dev

---

## Quick Commands

```bash
# Build for production locally
npm run build

# Preview production build locally
npm run preview

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check build size
npm run build
# See output in dist/ folder
```

---

**Last Updated**: April 2026  
**Framework**: Vite + React + Axios  
**Backend API**: Render (Node.js + Express + MongoDB)
