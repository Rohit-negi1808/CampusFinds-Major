# CampusFinds Frontend - Deployment Verification Checklist

Use this checklist before deploying to Vercel to ensure everything works correctly.

## Pre-Deployment Verification (Local)

### Step 1: Code Review
- [ ] No hardcoded URLs like `http://localhost:5000` or `https://campusfinds-major.onrender.com` in component files
- [ ] All API calls use one of these patterns:
  - [ ] `import api from '@/api'` and then `api.get('/endpoint')`
  - [ ] `const baseUrl = import.meta.env.VITE_API_URL || ''; fetch(\`${baseUrl}/api/endpoint\`)`
- [ ] No relative URLs like `fetch('/api/items')` used directly (only through proxy or with baseUrl)
- [ ] All `fetch()` calls check response status: `if (!res.ok) throw new Error(...)`
- [ ] All new API integrations documented

### Step 2: Local Development Testing
```bash
# Terminal 1: Backend
cd backend
npm run dev
# ✅ Should show: "Server running on port 5000"

# Terminal 2: Frontend
cd frontend
npm run dev
# ✅ Should show: "Local: http://localhost:3000"
```

- [ ] Frontend loads at `http://localhost:3000`
- [ ] Can navigate to all pages (Home, Lost Items, Found Items, etc.)
- [ ] Can login with test credentials
- [ ] Can view items, claims, and dashboard
- [ ] No console errors (check DevTools)
- [ ] No network 404 or CORS errors

### Step 3: Test VITE_API_URL Behavior

**Test 1: Local with Proxy (Default)**
```bash
# In frontend folder, make sure .env.local is empty or doesn't override dev URL
rm .env.local 2>/dev/null || true
npm run dev

# In browser console:
console.log(import.meta.env.VITE_API_URL);
// Should be: undefined or empty

# Test a fetch call - should use proxy
# Network tab should show: http://localhost:3000/api/... (via proxy)
```

- [ ] Relative URLs work with Vite proxy
- [ ] Network requests go through `localhost:3000` proxy

**Test 2: Local with Explicit Backend URL**
```bash
# Create .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:5000
EOF

npm run dev

# In browser console:
console.log(import.meta.env.VITE_API_URL);
// Should be: "http://localhost:5000"

# Test a fetch call
# Network tab should show: http://localhost:5000/api/... (direct)
```

- [ ] Explicit URL works
- [ ] Requests go directly to backend
- [ ] Both methods work

### Step 4: Test Production Build Locally
```bash
# Build for production
npm run build

# ✅ Should complete without errors
# ✅ Should create: dist/ folder with optimized files

# Serve built version
npm run preview

# Visit: http://localhost:4173
# This simulates production (NO Vite proxy!)
```

- [ ] Build completes successfully
- [ ] No console errors
- [ ] Preview server starts (usually on port 4173)
- [ ] Site loads at localhost:4173
- [ ] BUT: Requests will fail (expected - no backend URL set for local)

**Note:** Preview failing is OK - it proves production won't use proxy. This is why VITE_API_URL is critical for production.

### Step 5: Environment Variables File Check
```bash
# Verify .env.example is comprehensive
cat .env.example
```

- [ ] `.env.example` has clear instructions
- [ ] Instructions explain dev vs production
- [ ] Instructions explain Vercel setup
- [ ] No secrets in `.env.example`
- [ ] `.env` is in .gitignore (don't commit real env vars)

### Step 6: Code Quality

```bash
# Search for any remaining hardcoded issues
grep -r "http://localhost\|https://campusfinds-major\|fetch(['\"]/" src/ --include="*.jsx" --include="*.js"
# ✅ Should return: No matches (besides comments)
```

- [ ] No hardcoded LocalHost URLs
- [ ] No hardcoded production URLs
- [ ] No suspicious fetch patterns

---

## Vercel Deployment Setup

### Step 7: Vercel Project Configuration

1. **GitHub Integration**
   - [ ] Repository connected to Vercel
   - [ ] Vercel has permission to your GitHub repo
   - [ ] Automatic deployments enabled on push to main

2. **Environment Variables in Vercel**
   - [ ] Log in to https://vercel.com/dashboard
   - [ ] Select project: `campusfinds`
   - [ ] Go to Settings → Environment Variables
   - [ ] Add new variable:
     - Name: `VITE_API_URL`
     - Value: `https://campusfinds-major.onrender.com`
     - Environments: Production (+ Preview if testing)
   - [ ] Click "Save"

3. **Build Configuration**
   - [ ] Framework: Auto Detect (should show Vite)
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`
   - [ ] Install Command: `npm install`

### Step 8: Backend Readiness

- [ ] Backend deployed to Render at `https://campusfinds-major.onrender.com`
- [ ] Backend is running and accessible
- [ ] Test directly: `curl https://campusfinds-major.onrender.com/api/lost-items`
  - [ ] Returns JSON array (expected)
  - [ ] Does NOT return 404 or connection error
- [ ] CORS headers configured in backend for `https://campusfinds.vercel.app`
- [ ] Check backend `server.js`:
  ```javascript
  app.use(cors({
    origin: ['http://localhost:3000', 'https://campusfinds.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  ```

---

## Deployment Execution

### Step 9: Deploy to Vercel

**Option A: Automatic via Git**
```bash
# Ensure .gitignore has .env and .env.local
git add .
git commit -m "Prepare for production deployment"
git push origin main

# Vercel auto-triggers build
# Wait for deployment to complete at https://vercel.com/dashboard
```

- [ ] Git push successful
- [ ] Vercel starts deployment automatically
- [ ] Build completes without errors
- [ ] Deployment URL provided (e.g., https://campusfinds.vercel.app)

**Option B: Manual Redeploy**
- [ ] Go to https://vercel.com/dashboard
- [ ] Select campusfinds project
- [ ] Go to "Deployments"
- [ ] Find latest deployment
- [ ] Click "..." → "Redeploy"
- [ ] Wait for build to complete

### Step 10: Post-Deployment Verification

1. **Check Environment Variables Baked In**
   ```javascript
   // Open browser DevTools at https://campusfinds.vercel.app
   // Run in console:
   console.log(import.meta.env.VITE_API_URL);
   // ✅ Should show: https://campusfinds-major.onrender.com
   
   // If shows: undefined or empty
   // ❌ Problem: Env var not set or build not updated
   // Solution: Redeploy!
   ```
   
   - [ ] VITE_API_URL shows correct backend URL in console

2. **Test Critical User Flows**
   
   All these should work without network errors:
   
   - [ ] Load landing page
   - [ ] Click "Get Started" → Auth modal appears
   - [ ] Try login with test credentials
   - [ ] If login works:
     - [ ] Dashboard loads with live data
     - [ ] Can view Lost Items
     - [ ] Can view Found Items
     - [ ] Can view analytics (admin)
   - [ ] Browser Network tab shows requests to `https://campusfinds-major.onrender.com/api/...` (not localhost)

3. **Check Browser Console & Network**
   - [ ] No 404 errors
   - [ ] No CORS errors
   - [ ] No "Failed to fetch" errors
   - [ ] API responses show 200 status
   - [ ] No JavaScript errors in console

4. **Test Specific Features**
   - [ ] Load Lost Items: Requests `/api/lost-items`
   - [ ] Load Found Items: Requests `/api/found-items`
   - [ ] Login: POST to `/api/users/login` or `/api/admin/login`
   - [ ] Admin Dashboard: Requests `/api/analytics/stats`
   - [ ] Claim Item: POST to `/api/claims`

---

## Troubleshooting During Deployment

### If Deployment Fails to Build

```
Error: Vite build failed
```

**Check:**
- [ ] No syntax errors in JavaScript
- [ ] All imports exist
- [ ] No conflicting dependencies
- [ ] See build log for specific error
- [ ] Fix error locally: `npm run build`
- [ ] Redeploy once local build succeeds

### If Frontend Loads but Requests Fail

```
Error: "Failed to fetch" in console
```

**Checklist:**
- [ ] Did you redeploy AFTER setting VITE_API_URL? (Required!)
- [ ] Backend URL in Vercel matches actual Render URL
- [ ] Backend is running at the URL
- [ ] Backend CORS allows `https://campusfinds.vercel.app`
- [ ] Check network tab: what's the full request URL?

### If VITE_API_URL Shows Undefined

```javascript
console.log(import.meta.env.VITE_API_URL);
// Logs: undefined
```

**Solution:**
- [ ] Go to Vercel Project Settings → Environment Variables
- [ ] Check VITE_API_URL is set correctly
- [ ] Check environment is "Production" or "All"
- [ ] Redeploy the project
- [ ] Wait a few minutes for new build

### If CORS Error in Network Tab

```
Access to XMLHttpRequest at 'https://campusfinds-major.onrender.com/api/...'
has been blocked by CORS policy
```

**Solution:**
- [ ] Backend must have CORS enabled
- [ ] Check backend `server.js` includes Vercel domain
- [ ] Format: `origin: ['...', 'https://campusfinds.vercel.app']`
- [ ] Restart backend after CORS changes
- [ ] Test backend directly: `curl -H "Origin: https://campusfinds.vercel.app" https://campusfinds-major.onrender.com/api/lost-items`

---

## Rollback Plan

If production deployment has critical issues:

1. **Immediate: Revert Environment Variable**
   - [ ] Go to Vercel Project Settings
   - [ ] Remove or change `VITE_API_URL`
   - [ ] Redeploy (reverts to fallback behavior)

2. **Permanent: Revert Git**
   ```bash
   git revert HEAD              # Undo last commit
   git push origin main         # Redeploy old version
   ```

3. **Check Logs**
   - [ ] See Vercel build log for error
   - [ ] See backend logs on Render
   - [ ] Check browser console for frontend errors

---

## Success Indicators ✅

When deployment is successful, you should see:

- ✅ Frontend loads at `https://campusfinds.vercel.app`
- ✅ Console shows: `import.meta.env.VITE_API_URL = "https://campusfinds-major.onrender.com"`
- ✅ Network requests go to backend: `https://campusfinds-major.onrender.com/api/...`
- ✅ All requests return 200 OK
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ Users can login
- ✅ Data loads and displays correctly
- ✅ Admin dashboard shows live analytics
- ✅ Can create/update/delete items (admin)

---

## Performance Check (Optional)

After verifying functionality, check performance:

```bash
# Check build size
npm run build
# Look for: "dist/index.js" size (should be < 500KB)
# Look for: "dist/assets/*.js" sizes

# Check Vercel Analytics
# Go to Vercel Dashboard → Analytics tab
# Verify no unusual errors or slowness
```

---

## Handoff Checklist

Before marking deployment complete:

- [ ] All acceptance criteria met
- [ ] No critical bugs reported
- [ ] Performance acceptable
- [ ] Team notified of new URL
- [ ] Users can access production app
- [ ] Database backups exist (if applicable)
- [ ] Monitoring enabled on Vercel
- [ ] Support team briefed on new features

---

## Links for Reference

- **Frontend URL:** https://campusfinds.vercel.app
- **Backend URL:** https://campusfinds-major.onrender.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repository:** (Your repo URL)
- **Environment Guide:** See `ENV_AND_CORS_GUIDE.md` in this folder

---

**Last Updated:** April 2026  
**Status:** Ready for Production ✅

**Next Steps:**
1. Follow Steps 1-6 for local verification
2. Follow Steps 7-8 for Vercel setup
3. Follow Steps 9-10 for deployment
4. Use troubleshooting guide if issues arise
