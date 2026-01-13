# 🐳 Docker Deployment Guide

Complete guide for deploying DevConnect using Docker and Docker Compose.

---

## 📋 Prerequisites

- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)
- Git installed

---

## 🚀 Quick Start (Local Development with Docker)

### 1. Clone and Navigate
```bash
git clone <your-repo>
cd devconnect
```

### 2. Update Environment Variables
Edit `docker-compose.yml` and update:
- `JWT_SECRET` - Use a strong secret (32+ characters)
- `MONGO_INITDB_ROOT_PASSWORD` - Change default password
- `VITE_API_URL` - Your backend URL

### 3. Build and Run
```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

### 5. Stop Services
```bash
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

---

## 🌐 Production Deployment with Docker

### Option 1: Single Server Deployment

#### 1. Prepare Your Server
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Clone Your Repository
```bash
git clone <your-repo>
cd devconnect
```

#### 3. Create Production Environment Files
```bash
# Backend
cp server/.env.production.example server/.env.production
nano server/.env.production  # Edit with your values

# Frontend
cp client/.env.production.example client/.env.production
nano client/.env.production  # Edit with your values
```

#### 4. Update docker-compose.yml for Production
- Change MongoDB credentials
- Update JWT_SECRET
- Set production URLs
- Consider using MongoDB Atlas instead of local MongoDB

#### 5. Deploy
```bash
docker-compose up -d --build
```

#### 6. Set Up Nginx Reverse Proxy (Recommended)
```nginx
# /etc/nginx/sites-available/devconnect
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 7. Enable SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Cloud Deployment (AWS, DigitalOcean, etc.)

#### AWS ECS/Fargate
1. Push images to ECR (Elastic Container Registry)
2. Create ECS cluster
3. Define task definitions
4. Create services
5. Configure load balancer

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Configure Dockerfiles
3. Set environment variables
4. Deploy

#### Google Cloud Run
1. Build and push to Google Container Registry
2. Deploy to Cloud Run
3. Configure environment variables

---

## 🔧 Docker Commands Reference

### Build Commands
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend

# Build without cache
docker-compose build --no-cache
```

### Run Commands
```bash
# Start services
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart
```

### Management Commands
```bash
# Stop services
docker-compose stop

# Start stopped services
docker-compose start

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# View running containers
docker-compose ps

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh
```

### Maintenance Commands
```bash
# View container stats
docker stats

# Clean up unused images
docker image prune -a

# Clean up everything
docker system prune -a --volumes
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Container Stats
```bash
docker-compose stats
```

### Health Checks
```bash
# Check backend health
curl http://localhost:5000/api/health

# Check container health
docker inspect devconnect-backend | grep Health
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use strong JWT secrets (32+ characters)
- Change default MongoDB passwords
- Use different secrets for dev/prod

### 2. Network Security
- Use Docker networks for service isolation
- Expose only necessary ports
- Use HTTPS in production
- Configure firewall rules

### 3. Image Security
- Use official base images
- Regularly update images
- Scan images for vulnerabilities
- Use multi-stage builds (already implemented)

### 4. Database Security
- Use MongoDB Atlas for production (recommended)
- Enable authentication
- Use strong passwords
- Regular backups
- Restrict network access

---

## 🐛 Troubleshooting

### Issue: Cannot connect to MongoDB
```bash
# Check if MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string in backend
docker-compose exec backend env | grep MONGO_URI
```

### Issue: Frontend can't reach backend
```bash
# Check VITE_API_URL in frontend
docker inspect devconnect-frontend | grep VITE_API_URL

# Check if backend is accessible
curl http://localhost:5000/api/health
```

### Issue: Port already in use
```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process or change port in docker-compose.yml
```

### Issue: Build fails
```bash
# Clear Docker cache
docker-compose build --no-cache

# Check Docker disk space
docker system df

# Clean up
docker system prune -a
```

---

## 📈 Performance Optimization

### 1. Use Production Builds
- Already configured in Dockerfiles
- Multi-stage builds reduce image size
- Nginx serves static files efficiently

### 2. Database Optimization
- Use MongoDB Atlas with auto-scaling
- Enable database indexes (already configured)
- Set up connection pooling

### 3. Caching
- Nginx caches static assets (configured)
- Browser caching enabled
- Consider Redis for API caching

### 4. Resource Limits
Add to docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          memory: 256M
```

---

## 🔄 CI/CD with Docker

### GitHub Actions Example
```yaml
name: Deploy with Docker

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build images
        run: docker-compose build
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker-compose push
      
      - name: Deploy to server
        run: |
          ssh user@server "cd /app && docker-compose pull && docker-compose up -d"
```

---

## 📝 Backup & Recovery

### Backup MongoDB
```bash
# Create backup
docker-compose exec mongodb mongodump --out=/data/backup

# Copy backup to host
docker cp devconnect-mongo:/data/backup ./mongodb-backup
```

### Restore MongoDB
```bash
# Copy backup to container
docker cp ./mongodb-backup devconnect-mongo:/data/backup

# Restore
docker-compose exec mongodb mongorestore /data/backup
```

---

## 🎊 Production Checklist

- [ ] Updated all environment variables
- [ ] Changed default passwords
- [ ] Set strong JWT secret
- [ ] Configured SSL/HTTPS
- [ ] Set up domain name
- [ ] Configured reverse proxy
- [ ] Set up database backups
- [ ] Configured monitoring
- [ ] Set up logging
- [ ] Tested all features
- [ ] Set up CI/CD (optional)

---

## 📞 Support

For issues and questions:
- Check Docker logs: `docker-compose logs -f`
- Verify environment variables
- Check network connectivity
- Review Docker documentation

---

**Your DevConnect platform is ready to deploy with Docker! 🐳🚀**

*Last Updated: January 2026*
