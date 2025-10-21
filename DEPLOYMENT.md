# 🚀 Deployment Guide - Vibeenengineer LMS

## 📋 Table of Contents
- [Production Build](#production-build)
- [Environment Variables](#environment-variables)
- [Docker Production](#docker-production)
- [Manual Deployment](#manual-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Health Checks](#health-checks)

---

## 🏗️ Production Build

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local builds)
- PostgreSQL 16+ (if not using Docker)

### Quick Build (Docker)
```bash
# Build all services
docker compose up --build -d

# Or build without cache
docker compose build --no-cache
docker compose up -d
```

### Local Build (Without Docker)
```bash
# Install root dependencies
npm install

# Build both API and Web
npm run build

# Or build separately
npm run build:api   # Build API → api/dist/
npm run build:web   # Build Web → web/dist/
```

---

## 🔐 Environment Variables

### Production Environment Variables

#### **Database (PostgreSQL)**
```bash
POSTGRES_USER=app
POSTGRES_PASSWORD=<STRONG_PASSWORD>  # ⚠️ Change this!
POSTGRES_DB=vibeen
```

#### **API (Backend)**
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=postgres://app:<PASSWORD>@db:5432/vibeen
JWT_SECRET=<RANDOM_SECRET_KEY>  # ⚠️ Generate a strong secret!
```

#### **Web (Frontend)**
```bash
NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com  # Your production API URL
```

### Generate Secure Secrets
```bash
# Generate JWT secret (32 characters)
openssl rand -base64 32

# Generate database password
openssl rand -hex 16
```

---

## 🐳 Docker Production

### Create Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.9'

services:
  db:
    image: postgres:16
    container_name: vibeen-db-prod
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - db_data_prod:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - vibeen-network

  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    container_name: vibeen-api-prod
    restart: always
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      DATABASE_URL: postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      JWT_SECRET: ${JWT_SECRET}
      PORT: 4000
    ports:
      - "4000:4000"
    command: sh -c "npm install --production && npx prisma generate && npx prisma migrate deploy && npm start"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - vibeen-network

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
      args:
        - VITE_API_URL=${VITE_API_URL}
    container_name: vibeen-web-prod
    restart: always
    depends_on:
      - api
    ports:
      - "80:80"
    networks:
      - vibeen-network

volumes:
  db_data_prod:

networks:
  vibeen-network:
    driver: bridge
```

### Production Deployment
```bash
# Create .env file for production
cp .env.example .env.prod
# Edit .env.prod with your production values

# Build and start production services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Run migrations
docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy

# Seed database (optional)
docker compose -f docker-compose.prod.yml exec api npm run prisma:seed
```

---

## 🖥️ Manual Deployment

### API Deployment

```bash
# 1. Navigate to API directory
cd api

# 2. Install dependencies
npm ci --production

# 3. Generate Prisma Client
npx prisma generate

# 4. Run migrations
npx prisma migrate deploy

# 5. Build TypeScript
npm run build

# 6. Start production server
NODE_ENV=production npm start
```

### Web Deployment

```bash
# 1. Navigate to Web directory
cd web

# 2. Install dependencies
npm ci

# 3. Build for production
VITE_API_URL=https://api.yourdomain.com npm run build

# 4. Serve static files
# Option A: Using serve
npx serve -s dist -l 3000

# Option B: Using nginx (recommended)
# Copy dist/ to nginx web root
sudo cp -r dist/* /var/www/html/
```

---

## ☁️ Cloud Deployment

### Deploy to Railway

1. **Create Railway Account**: https://railway.app
2. **Connect GitHub**: Link your repository
3. **Create New Project** → Deploy from GitHub
4. **Add Services**:
   - PostgreSQL database (from Railway)
   - API service (from `api/`)
   - Web service (from `web/`)
5. **Set Environment Variables**:
   - Copy from `.env.example`
   - Update `DATABASE_URL` from Railway DB
   - Set production `JWT_SECRET`
   - Set `VITE_API_URL` to Railway API URL
6. **Deploy**: Railway auto-deploys on push

### Deploy to Render

1. **Create Render Account**: https://render.com
2. **Create PostgreSQL Database**
3. **Create Web Service (API)**:
   - Build Command: `cd api && npm install && npx prisma generate && npm run build`
   - Start Command: `cd api && npx prisma migrate deploy && npm start`
4. **Create Static Site (Web)**:
   - Build Command: `cd web && npm install && npm run build`
   - Publish Directory: `web/dist`
5. **Set Environment Variables**

### Deploy to Vercel (Frontend) + Railway (Backend)

**Backend (Railway)**:
- Deploy API + DB to Railway as above

**Frontend (Vercel)**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel --prod
```

---

## 🏥 Health Checks

### API Health Check
```bash
# Check if API is running
curl http://localhost:4000/health
# Expected: {"ok":true}

# Check with database connection
curl http://localhost:4000/health
# If DB is down, returns {"ok":false}
```

### Database Health Check
```bash
# Check if PostgreSQL is accepting connections
docker compose exec db pg_isready -U app -d vibeen

# Check database tables
docker compose exec -T db psql -U app -d vibeen -c "\dt"
```

### Full System Health Check
```bash
# Check all containers
docker compose ps

# Check logs for errors
docker compose logs --tail=100 | grep -i error

# Test complete flow
# 1. Register user
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"12345"}'

# 2. Access frontend
curl -I http://localhost:5173
# Expected: HTTP/1.1 200 OK
```

---

## 🔒 Security Checklist

### Before Production Deployment

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domains only
- [ ] Set `NODE_ENV=production`
- [ ] Remove debug logs
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure monitoring (Sentry, DataDog)
- [ ] Review and update security headers
- [ ] Enable firewall rules
- [ ] Use environment secrets manager (AWS Secrets, Railway vars)

### Security Headers (Nginx)

Add to your nginx config:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

---

## 📊 Monitoring

### Application Logs
```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f api
docker compose logs -f web
docker compose logs -f db

# Follow logs with timestamp
docker compose logs -f --timestamps
```

### Database Monitoring
```bash
# Connect to database
docker compose exec db psql -U app -d vibeen

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('vibeen'));

# Check table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## 🔄 Backup & Restore

### Database Backup
```bash
# Backup database
docker compose exec -T db pg_dump -U app vibeen > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with custom format (compressed)
docker compose exec -T db pg_dump -U app -Fc vibeen > backup_$(date +%Y%m%d_%H%M%S).dump
```

### Database Restore
```bash
# Restore from SQL file
cat backup.sql | docker compose exec -T db psql -U app vibeen

# Restore from custom format
docker compose exec -T db pg_restore -U app -d vibeen backup.dump
```

### Automated Backups (cron)
```bash
# Add to crontab (daily backup at 2 AM)
0 2 * * * cd /path/to/LMS && docker compose exec -T db pg_dump -U app -Fc vibeen > /backups/vibeen_$(date +\%Y\%m\%d).dump
```

---

## 🚦 Rollback Strategy

### Rollback to Previous Version
```bash
# 1. Check Git history
git log --oneline -10

# 2. Rollback to specific commit
git checkout <commit-hash>

# 3. Rebuild and redeploy
docker compose down
docker compose up --build -d

# 4. Or return to main branch
git checkout main
```

---

## 📞 Support

For deployment issues:
- 📧 Email: support@vibeenengineer.com
- 🐛 GitHub Issues: https://github.com/chrfsa/LMS/issues
- 📖 Docs: https://github.com/chrfsa/LMS/blob/main/README.md

---

**Built with ❤️ for Production** 🚀

