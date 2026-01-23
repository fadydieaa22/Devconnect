# ✅ Railway Fix Checklist - Do This Now!

## 🎯 3 Files to Change + 2 Railway Settings

---

## **File 1: Fix Backend CORS** ⚠️ CRITICAL

**File**: `devconnect/server/server.js`

**Line 17-20, change from:**
```javascript
cors: {
  origin: process.env.CLIENT_URL || "http://localhost:5174",
  credentials: true,
},
```

**To:**
```javascript
cors: {
  origin: process.env.CLIENT_URL ? 
    process.env.CLIENT_URL.split(',').map(url => url.trim()) : 
    ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
},
```

**Line 44-46, change from:**
```javascript
origin: process.env.CLIENT_URL || "http://localhost:5174",
```

**To:**
```javascript
origin: process.env.CLIENT_URL ? 
  process.env.CLIENT_URL.split(',').map(url => url.trim()) : 
  ["http://localhost:5173", "http://localhost:5174"],
```

---

## **File 2: Fix Frontend API URL**

**File**: `devconnect/client/src/api/axios.js`

**Line 2, change from:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || "devconnect1.up.railway.app";
```

**To:**
```javascript
const API_URL = import.meta.env.VITE_API_URL || "https://devconnect1.up.railway.app/api";
```

---

## **File 3: Fix Frontend Config**

**File**: `devconnect/client/vite.config.js`

**Replace entire file with:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000
  }
})
```

**File**: `devconnect/client/package.json`

**In the "scripts" section, change:**
```json
"preview": "vite preview",
"start": "vite preview"
```

**To:**
```json
"preview": "vite preview --host 0.0.0.0 --port $PORT",
"start": "vite preview --host 0.0.0.0 --port $PORT"
```

---

## **Railway Backend Settings**

Go to Railway → Your Backend Project → **Variables** tab

**Add this variable:**
```
CLIENT_URL=https://imaginative-liberation-production.up.railway.app,http://localhost:5173
```

---

## **Railway Frontend Settings**

Go to Railway → Your Frontend Project → **Variables** tab

**Add this variable:**
```
VITE_API_URL=https://YOUR_BACKEND_URL_HERE.railway.app/api
```

⚠️ **Replace `YOUR_BACKEND_URL_HERE`** with your actual backend URL from Railway!

**To find your backend URL:**
1. Go to your backend Railway project
2. Look at the top or go to Settings → Domains
3. Copy the `.railway.app` URL
4. Add `/api` at the end

---

## **Deploy**

After making these changes:

1. **Commit your code changes**
   ```bash
   git add .
   git commit -m "Fix Railway deployment - CORS and port config"
   git push
   ```

2. **Railway will auto-redeploy**, or manually click "Redeploy" in each project

---

## **Verify It Works**

### 1. Check Backend (30 seconds after deploy):
Visit: `https://your-backend-url.railway.app/api/health`

**Should see:**
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 123,
  "environment": "production"
}
```

### 2. Check Frontend (1 minute after deploy):
Visit: `https://imaginative-liberation-production.up.railway.app`

**Should see:** Your app loading (NOT a white screen!)

### 3. Check Browser Console:
1. Press **F12**
2. Go to **Console** tab
3. **Should NOT see** CORS errors

---

## **If Still Not Working**

Check Railway logs:
1. Go to Railway project
2. Click on latest deployment
3. Read **Deploy Logs**
4. Look for errors

**Common issues:**
- ❌ "Error: listen EADDRINUSE" → Port already in use (Railway issue, redeploy)
- ❌ "CORS error" → Check `CLIENT_URL` variable is set correctly
- ❌ Build failed → Check Build Logs for npm errors

---

## **Quick Test Commands**

Test your backend is accessible:
```bash
curl https://your-backend-url.railway.app/api/health
```

Should return JSON with "status": "healthy"

---

## 📝 Summary

**3 Code Changes:**
- ✅ Backend CORS (server.js) - Allow multiple origins
- ✅ Frontend API URL (axios.js) - Add https:// and /api
- ✅ Frontend Config (vite.config.js + package.json) - Dynamic port

**2 Railway Settings:**
- ✅ Backend: Set CLIENT_URL environment variable
- ✅ Frontend: Set VITE_API_URL environment variable

**Total time:** ~10 minutes

**After this, your site will work! 🚀**
