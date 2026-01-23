# Railway Frontend Deployment Guide for DevConnect

## 🚨 Issues Identified with Your Current Deployment

Your deployment at `imaginative-liberation-production.up.railway.app` isn't working because:

1. **Port Issue**: Railway assigns a dynamic `PORT` environment variable, but your nginx is hardcoded to port 80
2. **API URL Missing Protocol**: The fallback API URL doesn't include `https://`
3. **Missing Environment Variables**: No `VITE_API_URL` configured in Railway

## 🛠️ Solution: Two Deployment Options

### **Option 1: Simple Node.js Server (Recommended for Railway)**

This is simpler and works better with Railway's dynamic port assignment.

#### Step 1: Update package.json
Add a production start script:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "eslint .",
  "preview": "vite preview --port $PORT --host 0.0.0.0",
  "start": "vite preview --port $PORT --host 0.0.0.0"
}
```

#### Step 2: Set Environment Variables in Railway
In your Railway project dashboard:
1. Go to **Variables** tab
2. Add these variables:
   ```
   VITE_API_URL=https://your-backend-url.railway.app/api
   PORT=3000
   ```
   Replace `your-backend-url.railway.app` with your actual backend Railway URL

#### Step 3: Configure Railway Build Settings
In Railway dashboard:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

---

### **Option 2: Nginx with Dynamic Port (More Complex)**

If you prefer nginx, you need to make it work with Railway's dynamic port.

#### Step 1: Create a custom start script
Create `start-nginx.sh` in your client folder

#### Step 2: Update Dockerfile to use dynamic port

#### Step 3: Configure Railway
- Set `PORT` environment variable (Railway usually does this automatically)
- Set `VITE_API_URL` as shown above

---

## 🚀 Quick Fix Steps (Option 1 - Recommended)

### 1. Fix API URL Issue First
Update `src/api/axios.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || "https://devconnect1.up.railway.app/api";
```
**Note**: Add `https://` and `/api` to the fallback URL

### 2. Railway Configuration
In your Railway dashboard for the frontend project:

**Environment Variables:**
```
VITE_API_URL=https://your-backend-railway-url.railway.app/api
NODE_ENV=production
```

**Settings:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`
- **Watch Paths**: Leave default or set to `devconnect/client/**`

### 3. Update vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000
  }
})
```

### 4. Redeploy
After making these changes:
1. Commit and push to your repository
2. Railway will automatically redeploy
3. Or manually trigger a redeploy in Railway dashboard

---

## 🔍 Debugging Tips

### Check if your site is loading:
1. Open browser dev tools (F12)
2. Go to Console tab
3. Check for errors
4. Go to Network tab and see if API calls are failing

### Common Issues:

**White Screen / Nothing Loads:**
- Check if `VITE_API_URL` is set correctly
- Verify the build completed successfully in Railway logs
- Check Railway logs for port binding errors

**API Connection Errors:**
- Verify backend is deployed and running
- Check CORS settings on backend allow your frontend domain
- Ensure `VITE_API_URL` includes `https://` and `/api`

**Port Binding Failed:**
- Make sure you're using `--host 0.0.0.0` in preview command
- Verify `$PORT` environment variable is being used
- Check Railway logs for specific error messages

### Check Railway Logs:
```
Click on your deployment → Build Logs
Click on your deployment → Deploy Logs
```

Look for:
- ✅ "Build succeeded"
- ✅ "Server running on port..."
- ❌ Any error messages about ports or bindings

---

## 📋 Checklist

- [ ] Fix `axios.js` to include `https://` in fallback
- [ ] Update `package.json` with proper start script
- [ ] Update `vite.config.js` with host and port config
- [ ] Set `VITE_API_URL` in Railway environment variables
- [ ] Set backend URL correctly (with /api path)
- [ ] Verify build command in Railway settings
- [ ] Verify start command in Railway settings
- [ ] Redeploy and check logs
- [ ] Test the application in browser
- [ ] Check browser console for errors

---

## 🎯 Expected Result

After following these steps:
- ✅ Frontend loads at `imaginative-liberation-production.up.railway.app`
- ✅ API calls connect to your backend
- ✅ No port binding errors in logs
- ✅ Application works as expected

---

## 💡 Alternative: Use Railway's Nixpacks

Railway can auto-detect your setup with Nixpacks. If the above doesn't work:

1. **Remove** any custom Dockerfile from the client folder (temporarily)
2. Let Railway auto-detect it as a Vite React app
3. Just set the environment variables
4. Railway will handle the rest

---

## Need More Help?

If you're still having issues, check:
1. Railway build logs for specific errors
2. Browser console for frontend errors
3. Network tab to see which API calls are failing
4. Backend logs to verify CORS and API health
