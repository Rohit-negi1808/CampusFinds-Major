# CampusFinds Frontend - Environment & CORS Configuration Guide

## Quick Overview

| Scenario | Backend URL | VITE_API_URL | How Requests Route |
|----------|-------------|-------------|-------------------|
| **Local Dev** | `http://localhost:5000` | Not set (uses proxy) | Vite proxy `/api` → `localhost:5000/api` |
| **Vercel Dev Preview** | `https://campusfinds-major.onrender.com` | Set in Vercel env vars | Direct: `${VITE_API_URL}/api/...` |
| **Vercel Production** | `https://campusfinds-major.onrender.com` | Set in Vercel env vars | Direct: `${VITE_API_URL}/api/...` |

---

## 1. Local Development Setup

### 1.1 Prerequisites
- Backend running: `npm run dev` in `/backend` folder (port 5000)
- Frontend: `npm run dev` in `/frontend` folder (port 3000)

### 1.2 Environment Configuration

**For Local Dev, choose ONE approach:**

#### Option A: Use Vite Proxy (Recommended)
```bash
# Create .env.local in /frontend
VITE_API_URL=

# OR don't set VITE_API_URL at all
# The app defaults to relative /api URLs which Vite proxies to localhost:5000
```

**How it works:**
```javascript
// Your code
fetch('/api/items')

// Vite intercepts and converts to:
// http://localhost:5000/api/items

// No CORS issues because it's all same-origin in dev!
```

#### Option B: Explicit Backend URL (For remote testing)
```bash
# Create .env.local in /frontend
VITE_API_URL=https://campusfinds-major.onrender.com

# Now all requests go to the Render backend
fetch(`${import.meta.env.VITE_API_URL}/api/items`)
// → https://campusfinds-major.onrender.com/api/items
```

### 1.3 Verification

```bash
# Terminal 1: Start backend
cd backend
npm run dev
# Should see: "Server running on port 5000"

# Terminal 2: Start frontend
cd frontend
npm run dev
# Should see: "Local: http://localhost:3000"

# Browser: Visit http://localhost:3000
# Try login - should work if backend is reachable
```

---

## 2. Production Setup (Vercel Deployment)

### 2.1 Setting Environment Variables in Vercel

1. **Go to Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `campusfinds`
   - Click "Settings" tab

2. **Add Environment Variable:**
   - Click "Environment Variables" in left sidebar
   - Name: `VITE_API_URL`
   - Value: `https://campusfinds-major.onrender.com`
   - Environment: Select "Production" (or all if unsure)
   - Click "Save"

3. **Redeploy Your Project:**
   - Option A: Push a commit to GitHub
     ```bash
     git add .
     git commit -m "Update env variables"
     git push origin main
     ```
   - Option B: Manual redeploy in Vercel Dashboard
     - Click "Deployments" tab
     - Find latest deployment
     - Click "..." menu → "Redeploy"

4. **Verify Build Includes Variables:**
   - Wait for deployment to complete
   - Check build logs for success
   - Visit https://campusfinds.vercel.app
   - Check browser console: 
     ```javascript
     console.log(import.meta.env.VITE_API_URL)
     // Should show: https://campusfinds-major.onrender.com
     ```

### 2.2 Why Redeploy is Required

Vite environment variables are **baked into the build at compile time**, not loaded at runtime.

```javascript
// During build, this is replaced with the actual value:
import.meta.env.VITE_API_URL

// After build: "https://campusfinds-major.onrender.com"
// This string is hardcoded in the compiled .js file
```

If you change `VITE_API_URL` without rebuilding:
- ❌ Old value stays in the compiled code
- ❌ Frontend still calls old backend URL
- ❌ Requests fail with CORS or 404 errors

**Solution:** Always redeploy after changing env vars.

---

## 3. Understanding CORS (Cross-Origin Resource Sharing)

### 3.1 What's CORS?

When your frontend (domain A) makes requests to your backend (domain B), browsers block them by default for security. The backend must explicitly allow it via CORS headers.

```
Browser sees:
  Frontend origin:  https://campusfinds.vercel.app
  Backend origin:   https://campusfinds-major.onrender.com
  
  ❌ Different domains → CORS required
```

### 3.2 Local Dev: No CORS Issue (Vite Proxy)

```
Browser:     http://localhost:3000
Vite proxy:  Intercepts /api requests
Backend:     http://localhost:5000

REQUEST FLOW:
fetch('/api/items')
    ↓
[Vite Proxy intercepts]
    ↓
Forwards to http://localhost:5000/api/items
    ↓
Browser sees: Same origin (localhost:3000) talking to itself
    ↓
✅ No CORS error!
```

### 3.3 Production: CORS Headers Required

```
Browser:     https://campusfinds.vercel.app
Backend:     https://campusfinds-major.onrender.com

REQUEST FLOW:
fetch('https://campusfinds-major.onrender.com/api/items')
    ↓
Browser sees: Cross-origin request
    ↓
Checks backend CORS headers:
  - Access-Control-Allow-Origin: https://campusfinds.vercel.app ✅
  - Allow-Control-Allow-Methods: GET, POST, PUT, DELETE ✅
    ↓
✅ CORS check passes, request proceeds
```

**If CORS headers missing:**
```javascript
// Console error:
// Access to XMLHttpRequest at 'https://campusfinds-major.onrender.com/api/items'
// from origin 'https://campusfinds.vercel.app' has been blocked by CORS policy
```

### 3.4 Ensuring Backend Has Correct CORS

**Backend `/server.js` should include:**

```javascript
const cors = require('cors');

// Allow only your Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:3000',           // Local dev
    'https://campusfinds.vercel.app'   // Production Vercel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Troubleshooting CORS:**
1. Check backend logs during error
2. Verify CORS middleware is applied BEFORE routes
3. Ensure frontend origin is in `cors()` whitelist
4. Check `credentials: true` if cookies/auth needed

---

## 4. API Consumption Patterns in Frontend Code

### Pattern 1: Using Pre-configured Axios (Recommended)

**File:** Any component or service

```javascript
import api from '@/api';

// Automatically uses VITE_API_URL + auto-includes JWT token
api.get('/lost-items')
  .then(res => res.data)
  .catch(err => console.error(err));
```

**Why best:** 
- ✅ JWT token auto-included
- ✅ Handles both relative URLs (dev) and absolute URLs (prod)
- ✅ Centralized base URL management

### Pattern 2: Direct Fetch with Environment Variable

**File:** Components making direct fetch calls

```javascript
// ✅ CORRECT - Always works locally AND in production
const baseUrl = import.meta.env.VITE_API_URL || '';
fetch(`${baseUrl}/api/lost-items`)
  .then(res => res.json())
  .then(data => console.log(data));

// ❌ WRONG - Only works in local dev, fails in production
fetch('/api/lost-items')
```

**Explanation:**
- Local dev: `baseUrl = ''` → `/api/lost-items` → Vite proxy → `localhost:5000/api/lost-items` ✅
- Production: `baseUrl = 'https://...'` → `https://.../api/lost-items` → Direct call ✅
- Relative URLs alone:  `/api/lost-items` → Fails in prod ❌

### Pattern 3: If Using Custom Axios Instance

```javascript
import axios from 'axios';

// Make sure it uses VITE_API_URL!
const BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api';

const customApi = axios.create({ baseURL: BASE });
```

---

## 5. Troubleshooting: Common Issues

### Issue 1: "Failed to fetch" in Vercel Production

**Symptoms:**
- Works locally ✅
- Works in Vercel preview ✅
- Fails in production ❌
- Error: `Failed to fetch` or network timeout

**Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Backend URL wrong in `VITE_API_URL` | Check Vercel env vars match Render backend URL |
| Backend port changed | Render often puts services on random ports; verify `campusfinds-major.onrender.com` in browser |
| Environment vars not baked into build | Did you redeploy after changing env vars? Redeploy required! |
| CORS headers not set in backend | Backend must include `Access-Control-Allow-Origin: https://campusfinds.vercel.app` |
| Relative URLs used in code | Search for `fetch('/')` or `fetch('/api/` without `${VITE_API_URL}` prefix |

**Debug Steps:**

```javascript
// In browser console on Vercel site:
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Trying to fetch:', import.meta.env.VITE_API_URL + '/api/lost-items');

// Check if URL is correct manually:
// Copy URL and paste in new browser tab
// Should get JSON response or proper error, not "cannot reach"
```

### Issue 2: Localhost Works, Vercel Fails

**Cause:** `VITE_API_URL` not set in Vercel environment variables

**Solution:**
1. Go to Vercel dashboard
2. Project Settings → Environment Variables
3. Add `VITE_API_URL=https://campusfinds-major.onrender.com`
4. Redeploy

### Issue 3: CORS Error Only in Production

**Symptom:** 
```
Access to XMLHttpRequest at 'https://campusfinds-major.onrender.com/api/...'
has been blocked by CORS policy
```

**Solution:**
1. Check backend `/backend/server.js` has CORS configured
2. Ensure `https://campusfinds.vercel.app` is in CORS `origin` whitelist
3. Verify `credentials: true` if using cookies
4. Backend must be restarted after CORS changes

### Issue 4: Environment Variables Not Showing in Build

**Checklist:**
- [ ] Variable name starts with `VITE_` (Vite-specific requirement)
- [ ] Variable is set in Vercel dashboard (not just `.env` file)
- [ ] Did you redeploy after setting variable? (Required!)
- [ ] Check Vercel build log mentions the variable

---

## 6. File Structure & Configuration

```
/frontend
├── .env                          # Current config (git-tracked)
├── .env.example                  # Template with instructions
├── .env.local                    # Personal dev overrides (git-ignored)
├── vite.config.js                # Proxy config for local dev
│
├── src/
│   ├── api/
│   │   ├── index.js              # Main axios instance (uses VITE_API_URL)
│   │   ├── adminService.js       # Admin endpoints (uses axios instance)
│   │   └── adminDashboardService.js  # Dashboard data (delegates to adminService)
│   │
│   ├── routes/
│   │   └── AppRouter.jsx         # Login/register (uses direct fetch with VITE_API_URL)
│   │
│   └── pages/
│       ├── landing/LandingPage.jsx    # (uses fetch with VITE_API_URL)
│       ├── user/HomePage.jsx          # (uses fetch with VITE_API_URL)
│       ├── admin/Analytics.jsx        # (uses fetch with VITE_API_URL)
│       └── ... (all use VITE_API_URL)
```

---

## 7. Deployment Checklist

- [ ] Backend URL verified (https://campusfinds-major.onrender.com)
- [ ] Backend is running and accessible
- [ ] `VITE_API_URL` set in Vercel Project Settings
- [ ] No hardcoded localhost URLs in code
- [ ] All API calls use `${import.meta.env.VITE_API_URL}/api/...` or axios
- [ ] Backend CORS allows `https://campusfinds.vercel.app`
- [ ] Project redeployed after env var changes
- [ ] Test login on Vercel site
- [ ] Check browser console for errors
- [ ] Test data fetching (dashboard, items, etc.)

---

## 8. Quick Reference: Commands

```bash
# Local Development
cd backend && npm run dev      # Terminal 1: Backend on port 5000
cd frontend && npm run dev     # Terminal 2: Frontend on port 3000

# Production Build
npm run build                  # Creates optimized build

# Preview Production Build Locally
npm run preview                # Serves compiled build on localhost:4173
                               # Tests VITE_API_URL behavior (no proxy!)

# Environment Setup
cp .env.example .env.local     # Create local env file
# Edit .env.local with your settings

# Vercel Deployment
git push origin main           # Auto-redeploy on Vercel
# Or manual redeploy in https://vercel.com/dashboard
```

---

## 9. Helpful Resources

- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-modes.html
- **Vercel Environment Variables:** https://vercel.com/docs/environment-variables
- **CORS Explained:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Render Deployment:** https://render.com/docs
- **Axios Documentation:** https://axios-http.com/

---

## 10. Support

If issues persist:

1. **Check logs:**
   - Browser console (F12): Network tab for request failures
   - Vercel build log: Deployment settings → Build logs
   - Backend logs: `npm run dev` output

2. **Verify endpoints:**
   ```bash
   # Test backend directly (backend must be running):
   curl https://campusfinds-major.onrender.com/api/lost-items
   # Should return JSON array
   ```

3. **Verify environment variables:**
   ```javascript
   // In browser console on Vercel:
   console.log(import.meta.env.VITE_API_URL);
   // Should show: https://campusfinds-major.onrender.com
   ```

---

**Last Updated:** April 2026  
**Status:** Ready for Vercel Production Deployment ✅
