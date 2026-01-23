# 🚂 Railway Deployment - Complete Environment Setup Guide

## ✅ Code Fixes Applied

### 1. **Fixed Cloudinary Variable Names**
- ✅ Updated `server/config/cloudinary.js` to use correct variable names
- Changed from: `CLOUDINARY_NAME`, `CLOUDINARY_KEY`, `CLOUDINARY_SECRET`
- Changed to: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 2. **Removed Hardcoded Production URL**
- ✅ Updated `client/src/api/axios.js` fallback to localhost
- Now requires `VITE_API_URL` to be set explicitly in production

### 3. **Generated Secure JWT Secret**
- ✅ Created cryptographically secure 64-character JWT secret

---

## 🎯 Railway Deployment Steps

### **Step 1: Create Two Railway Services**

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Add two services:
   - **Service 1:** Backend (from `devconnect/server`)
   - **Service 2:** Frontend (from `devconnect/client`)

---

### **Step 2: Configure Backend Service**

#### **Root Directory Setting:**
Set the root directory to: `devconnect/server`

#### **Environment Variables:**

```env
# ═══════════════════════════════════════════════════════
# DATABASE - MongoDB Connection (REQUIRED)
# ═══════════════════════════════════════════════════════
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devconnect?retryWrites=true&w=majority

# Get this from MongoDB Atlas (https://cloud.mongodb.com)
# OR use Railway's MongoDB plugin:
# 1. Click "New" → "Database" → "MongoDB"
# 2. Copy the connection string from the MongoDB service

# ═══════════════════════════════════════════════════════
# SECURITY - JWT Authentication (REQUIRED)
# ═══════════════════════════════════════════════════════
JWT_SECRET=pDUfYvOo+NGNUBOwMK5r6MJMrGMHBdOhBny+xh1pJhbfTQRB+TZ5pl5IXuO87vGC

# ⚠️ IMPORTANT: Use the generated secret above OR generate your own
# Must be at least 32 characters long for security

# ═══════════════════════════════════════════════════════
# CORS - Frontend URL (REQUIRED)
# ═══════════════════════════════════════════════════════
CLIENT_URL=https://your-frontend-service.up.railway.app

# ⚠️ UPDATE THIS after frontend deploys!
# You can find this in Railway's frontend service settings
# Multiple URLs can be comma-separated: https://app1.com,https://app2.com

# ═══════════════════════════════════════════════════════
# SERVER CONFIGURATION
# ═══════════════════════════════════════════════════════
PORT=5000
NODE_ENV=production

# ═══════════════════════════════════════════════════════
# CLOUDINARY - Image Uploads (OPTIONAL but RECOMMENDED)
# ═══════════════════════════════════════════════════════
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Get these from Cloudinary Dashboard (https://cloudinary.com)
# Free tier: 25GB storage, 25GB bandwidth/month
# Without Cloudinary, image uploads will fail
```

---

### **Step 3: Configure Frontend Service**

#### **Root Directory Setting:**
Set the root directory to: `devconnect/client`

#### **Environment Variables:**

```env
# ═══════════════════════════════════════════════════════
# API URL - Backend Service (REQUIRED)
# ═══════════════════════════════════════════════════════
VITE_API_URL=https://your-backend-service.up.railway.app

# ⚠️ IMPORTANT: 
# 1. Deploy backend first to get this URL
# 2. DO NOT include /api at the end (it's added in the code)
# 3. Must be HTTPS (Railway provides this automatically)
```

---

## 📝 Deployment Checklist

### **Before Deployment:**

- [ ] **MongoDB Setup:**
  - [ ] Create MongoDB Atlas account OR use Railway MongoDB plugin
  - [ ] Copy connection string
  - [ ] Whitelist all IPs (0.0.0.0/0) in Atlas Network Access

- [ ] **Cloudinary Setup (Optional):**
  - [ ] Sign up at [cloudinary.com](https://cloudinary.com)
  - [ ] Get Cloud Name, API Key, and API Secret from dashboard
  - [ ] Note: App works without Cloudinary, but image uploads will fail

### **Deployment Order:**

#### **Step 1: Deploy Backend First**
- [ ] Create backend service in Railway
- [ ] Set root directory: `devconnect/server`
- [ ] Add all backend environment variables (see above)
- [ ] Wait for deployment to complete
- [ ] Copy the backend URL (e.g., `https://devconnect-backend.up.railway.app`)
- [ ] Test backend health: Visit `https://your-backend-url.railway.app/api/health`

#### **Step 2: Deploy Frontend**
- [ ] Create frontend service in Railway
- [ ] Set root directory: `devconnect/client`
- [ ] Set `VITE_API_URL` to your backend URL (from Step 1)
- [ ] Wait for deployment to complete
- [ ] Copy the frontend URL (e.g., `https://devconnect-frontend.up.railway.app`)

#### **Step 3: Update Backend CORS**
- [ ] Go back to backend service settings
- [ ] Update `CLIENT_URL` with your frontend URL (from Step 2)
- [ ] Redeploy backend (Railway does this automatically)

#### **Step 4: Test Everything**
- [ ] Visit your frontend URL
- [ ] Try to register a new account
- [ ] Try to login
- [ ] Upload a profile picture (if Cloudinary is configured)
- [ ] Create a post/project

---

## 🔒 Security Best Practices

### **JWT Secret:**
- ✅ **DO:** Use the generated 64-character secret above
- ✅ **DO:** Generate a new secret for each environment
- ❌ **DON'T:** Use simple strings like "mysecret" or "12345"
- ❌ **DON'T:** Share your JWT secret publicly

### **MongoDB:**
- ✅ **DO:** Use a strong database password
- ✅ **DO:** Enable IP whitelist (or use 0.0.0.0/0 for Railway)
- ❌ **DON'T:** Use default passwords
- ❌ **DON'T:** Expose your connection string

### **Cloudinary:**
- ✅ **DO:** Keep API Secret private
- ✅ **DO:** Set upload presets in Cloudinary dashboard
- ❌ **DON'T:** Commit API keys to version control

---

## 🐛 Troubleshooting

### **Problem: CORS Errors**
**Solution:** 
- Make sure `CLIENT_URL` in backend matches your frontend URL exactly
- Check for trailing slashes (should not have one)
- Redeploy backend after updating `CLIENT_URL`

### **Problem: "No token provided" or 401 errors**
**Solution:**
- Verify `JWT_SECRET` is set in backend
- Clear browser localStorage and try logging in again
- Check browser console for errors

### **Problem: Image uploads fail**
**Solution:**
- Verify all three Cloudinary variables are set correctly:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Check Cloudinary dashboard for error logs

### **Problem: Can't connect to database**
**Solution:**
- Verify `MONGO_URI` is correct
- For MongoDB Atlas: Whitelist 0.0.0.0/0 in Network Access
- Check if database user has correct permissions
- Test connection string using MongoDB Compass

### **Problem: Frontend shows "API is not responding"**
**Solution:**
- Check `VITE_API_URL` is set correctly
- Verify backend is running (visit `/api/health` endpoint)
- Check browser network tab for failed requests
- Ensure HTTPS is used (Railway provides this)

---

## 🎉 Post-Deployment

### **Custom Domains (Optional):**
1. In Railway, go to service settings
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Update `CLIENT_URL` and `VITE_API_URL` accordingly

### **Monitoring:**
- Railway provides automatic health checks
- Monitor logs in Railway dashboard
- Set up alerts for downtime

### **Scaling:**
- Railway auto-scales based on usage
- Monitor resource usage in Railway dashboard
- Upgrade plan if needed

---

## 📋 Quick Reference Card

### **Backend Environment Variables (7 total):**
```
✅ MONGO_URI              - Database connection
✅ JWT_SECRET             - Auth security
✅ CLIENT_URL             - Frontend URL
✅ PORT                   - 5000
✅ NODE_ENV               - production
🔧 CLOUDINARY_CLOUD_NAME  - Image uploads
🔧 CLOUDINARY_API_KEY     - Image uploads
🔧 CLOUDINARY_API_SECRET  - Image uploads
```

### **Frontend Environment Variables (1 total):**
```
✅ VITE_API_URL           - Backend URL
```

**Legend:**
- ✅ = Required
- 🔧 = Optional (but recommended)

---

## 🚀 Ready to Deploy!

All code fixes have been applied. You're ready to deploy to Railway!

**Your generated JWT_SECRET:**
```
pDUfYvOo+NGNUBOwMK5r6MJMrGMHBdOhBny+xh1pJhbfTQRB+TZ5pl5IXuO87vGC
```

**Need help?** 
- Railway Docs: https://docs.railway.app
- MongoDB Atlas: https://cloud.mongodb.com
- Cloudinary: https://cloudinary.com

---

*Last updated: 2026-01-15*
*DevConnect - Professional Developer Networking Platform*
