# SafeDocs Rwanda - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Storage Configuration](#storage-configuration)
5. [Deployment Options](#deployment-options)
6. [Production Checklist](#production-checklist)

---

## Prerequisites

### Required Software

- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher
- **npm**: v9.x or higher
- **Git**: For version control

### Optional (for MinIO storage)

- **MinIO Server**: Latest stable version
- **Docker**: For containerized deployment

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/JaredKilly/SafeDocs-Rwanda.git
cd SafeDocs-Rwanda/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=safedocs_rwanda
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_very_secure_random_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# MinIO Configuration (Optional)
USE_MINIO=false
MINIO_ENDPOINT=minio.yourdomain.com
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your_minio_access_key
MINIO_SECRET_KEY=your_minio_secret_key
MINIO_BUCKET_NAME=safedocs

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
```

---

## Database Setup

### Option 1: Using Migrations (Recommended)

```bash
# Run all migrations
npm run migrate

# Check migration status
npm run migrate:status

# Rollback last migration (if needed)
npm run migrate:undo
```

### Option 2: Manual Setup

1. Create the database:

```sql
CREATE DATABASE safedocs_rwanda;
```

2. Run the application (it will auto-sync tables in development):

```bash
npm run dev
```

---

## Storage Configuration

### Option 1: Local File Storage

Default configuration. Files are stored in the `uploads/` directory.

**Requirements:**
- Ensure sufficient disk space
- Regular backups of the `uploads/` directory

**Configuration:**
```env
USE_MINIO=false
UPLOAD_DIR=./uploads
```

### Option 2: MinIO Object Storage (Recommended for Production)

**Install MinIO:**

Using Docker:
```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -v /data/minio:/data \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  quay.io/minio/minio server /data --console-address ":9001"
```

Or install standalone: https://min.io/docs/minio/linux/index.html

**Configuration:**
```env
USE_MINIO=true
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=safedocs
```

**MinIO Console:**
- Access at: http://localhost:9001
- Create access keys for the application
- Configure bucket policies if needed

---

## Deployment Options

### Option 1: Traditional Server Deployment

#### 1. Build the Application

```bash
npm run build
```

#### 2. Start with PM2 (Process Manager)

Install PM2:
```bash
npm install -g pm2
```

Start the application:
```bash
pm2 start dist/app.js --name safedocs-api
pm2 save
pm2 startup
```

Monitor:
```bash
pm2 status
pm2 logs safedocs-api
```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/app.js"]
```

#### Create docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: safedocs_rwanda
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - safedocs-network

  minio:
    image: quay.io/minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"
    networks:
      - safedocs-network

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=safedocs_rwanda
      - DB_USER=postgres
      - DB_PASSWORD=your_password
      - USE_MINIO=true
      - MINIO_ENDPOINT=minio
      - MINIO_PORT=9000
    depends_on:
      - postgres
      - minio
    networks:
      - safedocs-network

volumes:
  postgres_data:
  minio_data:

networks:
  safedocs-network:
    driver: bridge
```

#### Deploy with Docker Compose

```bash
docker-compose up -d
```

### Option 3: Cloud Deployment

#### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create safedocs-rwanda-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# Run migrations
heroku run npm run migrate
```

#### AWS EC2

1. Launch an EC2 instance (Ubuntu 20.04 LTS)
2. Install Node.js and PostgreSQL
3. Clone repository and configure
4. Use PM2 for process management
5. Configure Nginx as reverse proxy
6. Set up SSL with Let's Encrypt

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build and run commands
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

---

## Production Checklist

### Security

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable rate limiting (to be implemented)
- [ ] Regular security updates

### Database

- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Optimize indexes
- [ ] Set up monitoring
- [ ] Plan for scaling

### Storage

- [ ] Configure backup strategy
- [ ] Set up CDN (if using MinIO)
- [ ] Monitor storage usage
- [ ] Plan for growth

### Monitoring

- [ ] Set up application monitoring (e.g., New Relic, DataDog)
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure alerts
- [ ] Log aggregation

### Performance

- [ ] Enable gzip compression
- [ ] Configure caching headers
- [ ] Optimize database queries
- [ ] Set up CDN for static assets
- [ ] Load testing

### Backup & Recovery

- [ ] Database backup schedule
- [ ] File storage backup
- [ ] Disaster recovery plan
- [ ] Test restoration process
- [ ] Document recovery procedures

---

## Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name api.safedocs.rw;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.safedocs.rw;

    ssl_certificate /etc/letsencrypt/live/api.safedocs.rw/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.safedocs.rw/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # File Upload Size
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Scaling Considerations

### Horizontal Scaling

- Use load balancer (Nginx, HAProxy, AWS ALB)
- Stateless application design
- Session management with Redis
- Shared file storage (MinIO cluster or S3)

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Use caching strategies
- Database connection pooling

---

## Maintenance

### Regular Tasks

- **Daily**: Monitor logs and errors
- **Weekly**: Review performance metrics
- **Monthly**: Security updates, backup verification
- **Quarterly**: Load testing, disaster recovery drills

### Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run migrations
npm run migrate

# Build
npm run build

# Restart with PM2
pm2 restart safedocs-api
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
psql -h localhost -U postgres -d safedocs_rwanda

# Check logs
pm2 logs safedocs-api
```

### File Upload Issues

```bash
# Check directory permissions
ls -la uploads/

# Set correct permissions
chmod 755 uploads/
```

### MinIO Connection Issues

```bash
# Test MinIO connectivity
mc alias set myminio http://localhost:9000 minioadmin minioadmin
mc ls myminio/safedocs
```

---

## Support

For deployment issues, contact the development team or refer to:
- GitHub Issues: https://github.com/JaredKilly/SafeDocs-Rwanda/issues
- Documentation: See `/docs` directory
