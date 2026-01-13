# 🚀 DevConnect - Deployment Guide

Complete guide for deploying your DevConnect platform to production.

---

## 📋 Pre-Deployment Checklist

### Backend
- [ ] MongoDB Atlas account set up
- [ ] Environment variables configured
- [ ] Cloudinary account for images (optional)
- [ ] JWT secret generated
- [ ] CORS origins configured
- [ ] Database indexes created

### Frontend
- [ ] API URLs updated
- [ ] Environment variables set
- [ ] Build tested locally
- [ ] Assets optimized
- [ ] Analytics configured (optional)

---

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for free account
3. Create a new cluster (Free tier available)

### 2. Configure Database
1. **Create Database User**:
   - Database Access → Add New User
   - Create username/password
   - Grant read/write permissions

2. **Whitelist IP Addresses**:
   - Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
   - (Or specific IPs for better security)

3. **Get Connection String**:
   - Clusters → Connect → Connect your application
   - Copy MongoDB URI
   - Replace `<password>` with your password

---

## 🖼️ Image Storage (Cloudinary - Optional)

### 1. Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Get credentials from Dashboard

### 2. Get API Credentials
- Cloud Name
- API Key
- API Secret

---

## 🔧 Backend Deployment

### Option 1: Heroku

#### 1. Install Heroku CLI
```bash
npm install -g heroku
heroku login
```

#### 2. Prepare App
```bash
cd devconnect/server
# Add Procfile
echo "web: node server.js" > Procfile
```

#### 3. Create Heroku App
```bash
heroku create your-app-name
```

#### 4. Set Environment Variables
```bash
heroku config:set MONGO_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set CLIENT_URL="your_frontend_url"
heroku config:set CLOUDINARY_CLOUD_NAME="your_cloud_name"
heroku config:set CLOUDINARY_API_KEY="your_api_key"
heroku config:set CLOUDINARY_API_SECRET="your_api_secret"
```

#### 5. Deploy
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Option 2: Railway

#### 1. Go to [railway.app](https://railway.app)
2. Connect GitHub repo
3. Select `devconnect/server` folder
4. Add environment variables
5. Deploy automatically

### Option 3: Render

#### 1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables
7. Deploy

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Deploy
```bash
cd devconnect/client
vercel
```

#### 3. Configure
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: `devconnect/client`

#### 4. Environment Variables
```bash
VITE_API_URL=your_backend_url
```

#### 5. Custom Domain (Optional)
- Go to Vercel Dashboard
- Settings → Domains
- Add your domain

### Option 2: Netlify

#### 1. Go to [netlify.com](https://netlify.com)
2. Connect GitHub repo
3. Configure build settings:
   - Base directory: `devconnect/client`
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables
5. Deploy

### Option 3: GitHub Pages

```bash
cd devconnect/client
npm run build
# Deploy dist folder to gh-pages branch
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
# Required
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/devconnect
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CLIENT_URL=https://your-frontend-domain.com
PORT=5000

# Optional (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com
```

---

## 🔒 Security Checklist

### Backend
- [ ] JWT secret is strong (32+ characters)
- [ ] MongoDB URI is secure
- [ ] CORS configured for specific origins
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] No sensitive data in code
- [ ] Environment variables not committed

### Frontend
- [ ] API keys not exposed in code
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] XSS protection enabled

---

## 🧪 Testing Production Build

### Backend
```bash
cd devconnect/server
NODE_ENV=production node server.js
```

### Frontend
```bash
cd devconnect/client
npm run build
npm run preview
```

---

## 📊 Performance Optimization

### Backend
- [x] Database indexes created
- [x] Response compression enabled
- [x] Rate limiting configured
- [ ] CDN for static files (optional)
- [ ] Redis caching (optional)

### Frontend
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading enabled
- [ ] Bundle analyzed and optimized
- [ ] Fonts preloaded

### Optimize Images
```bash
# Compress images before uploading
# Use tools like TinyPNG, ImageOptim
```

---

## 🔍 Monitoring

### Recommended Tools
- **Backend**: New Relic, Datadog, LogRocket
- **Frontend**: Google Analytics, Vercel Analytics
- **Errors**: Sentry, Bugsnag
- **Uptime**: Uptime Robot, Pingdom

### Setup Error Tracking (Sentry)
```bash
npm install @sentry/node @sentry/react
```

---

## 📈 Scaling Considerations

### Database
- Enable MongoDB Atlas auto-scaling
- Set up database backups
- Monitor performance metrics
- Add read replicas if needed

### Backend
- Use load balancer for multiple instances
- Implement Redis for caching
- Use PM2 for process management
- Set up horizontal scaling

### Frontend
- Use CDN for static assets
- Enable browser caching
- Implement service workers
- Consider server-side rendering

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod
```

---

## 📝 Post-Deployment

### 1. Test Everything
- [ ] Sign up / Login
- [ ] Create post
- [ ] Upload images
- [ ] Send messages
- [ ] Search functionality
- [ ] Notifications
- [ ] Mobile responsiveness

### 2. Monitor Performance
- Check server response times
- Monitor database queries
- Watch error logs
- Track user analytics

### 3. Set Up Backups
- Daily database backups
- Store backups securely
- Test restore process

---

## 🐛 Common Issues

### Issue: CORS Errors
**Solution**: Update `CLIENT_URL` in backend .env

### Issue: Images Not Loading
**Solution**: Check Cloudinary credentials or file upload path

### Issue: Socket.io Not Connecting
**Solution**: Ensure WebSocket support on hosting platform

### Issue: Build Fails
**Solution**: Check Node version compatibility (use Node 16+)

---

## 📞 Support

### Resources
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- Heroku Docs: [devcenter.heroku.com](https://devcenter.heroku.com)

---

## 🎊 You're Live!

Congratulations! Your DevConnect platform is now deployed and accessible worldwide! 🌍

### Final Steps:
1. ✅ Share your link with the community
2. ✅ Monitor performance
3. ✅ Gather user feedback
4. ✅ Continue improving

**Your platform is ready to connect developers globally!** 🚀💚

---

*Last Updated: January 2026*
