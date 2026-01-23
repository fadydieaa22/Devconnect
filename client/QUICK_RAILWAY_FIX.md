# 🚀 Quick Fix for Railway Frontend Deployment

## The Problem
Your site `imaginative-liberation-production.up.railway.app` isn't working because:
1. **Port mismatch** - Railway needs dynamic port binding
2. **Missing API URL** - No environment variable set
3. **Wrong API fallback** - Missing `https://` protocol

## ⚡ Quick Fix (5 Minutes)

### Step 1: Fix the API URL
Replace the content of `devconnect/client/src/api/axios.js` with:
```javascript
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://devconnect1.up.railway.app/api";

const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default instance;
```

### Step 2: Fix package.json
Update the `scripts` section in `devconnect/client/package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview --host 0.0.0.0 --port $PORT",
  "start": "vite preview --host 0.0.0.0 --port $PORT"
}
```

### Step 3: Fix vite.config.js
Replace `devconnect/client/vite.config.js` with:
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

### Step 4: Railway Dashboard Settings

**Go to your Railway project → Variables tab, add:**
```
VITE_API_URL=https://your-backend-url.railway.app/api
NODE_ENV=production
```
⚠️ Replace `your-backend-url.railway.app` with your actual backend URL!

**Go to Settings tab, set:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

### Step 5: Redeploy
Either:
- Push your code changes to trigger auto-deploy
- OR click "Redeploy" in Railway dashboard

---

## ✅ Verification

After deployment, check:
1. **Railway Logs** - Should see "Server running on port..."
2. **Open your site** - Should load without white screen
3. **Browser Console (F12)** - Should have no errors
4. **Network tab** - API calls should go to correct backend

---

## 🆘 Still Not Working?

### Option A: Remove Dockerfile (Let Railway Auto-detect)
1. Rename `Dockerfile` to `Dockerfile.backup`
2. Let Railway use its auto-detection (Nixpacks)
3. Make sure environment variables are set
4. Redeploy

### Option B: Check Backend
Make sure your backend:
- Is deployed and running on Railway
- Has CORS configured to allow your frontend domain
- Accepts requests from `imaginative-liberation-production.up.railway.app`

### Check Backend CORS Settings
In your backend server.js, you should have:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://imaginative-liberation-production.up.railway.app'
  ],
  credentials: true
}));
```

---

## 📞 What URL to Use

- **Your Backend URL**: Find it in Railway backend project → "Domains" section
- **Your Frontend URL**: `imaginative-liberation-production.up.railway.app`
- **Local Dev**: `http://localhost:5173`
