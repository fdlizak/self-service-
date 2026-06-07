# Panduan Deployment - Production

Panduan lengkap untuk melakukan deployment aplikasi Emas Kiosk ke environment production.

## 1. Server Setup (Linux/Ubuntu 20.04+)

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git
```

### 1.2 Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

### 1.3 Install MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Start MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
sudo systemctl status mysql
```

### 1.4 Install Nginx (Reverse Proxy)
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 1.5 Install Certbot (SSL/HTTPS)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

---

## 2. Database Setup

### 2.1 Create Database User
```bash
sudo mysql -u root -p
```

```sql
CREATE USER 'emas_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON emas_kiosk.* TO 'emas_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2.2 Import Database Schema
```bash
mysql -u emas_user -p emas_kiosk < schema.sql
```

### 2.3 Verify Database
```bash
mysql -u emas_user -p emas_kiosk -e "SHOW TABLES;"
```

---

## 3. Application Deployment

### 3.1 Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/fdlizak/self-service-.git emas-kiosk
sudo chown -R $USER:$USER emas-kiosk
cd emas-kiosk
```

### 3.2 Install Backend Dependencies
```bash
cd backend
npm install --production
cp .env.example .env
```

### 3.3 Configure Environment
```bash
nano .env
```

Edit `.env` untuk production:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=emas_user
DB_PASSWORD=secure_password_here
DB_NAME=emas_kiosk

PORT=3000
NODE_ENV=production

ADMIN_USERNAME=admin
ADMIN_PASSWORD=strong_password_123

JWT_SECRET=your_very_secret_jwt_key_12345
```

### 3.4 Test Application
```bash
npm start
# Ctrl+C untuk stop
```

---

## 4. Setup PM2 (Process Manager)

### 4.1 Install PM2 Globally
```bash
sudo npm install -g pm2
```

### 4.2 Start Application with PM2
```bash
cd /var/www/emas-kiosk/backend
pm2 start server.js --name "emas-kiosk"
pm2 save
pm2 startup
```

### 4.3 Monitor Application
```bash
pm2 status
pm2 logs emas-kiosk
pm2 restart emas-kiosk
```

---

## 5. Setup Nginx Reverse Proxy

### 5.1 Create Nginx Config
```bash
sudo nano /etc/nginx/sites-available/emas-kiosk
```

Paste konfigurasi:
```nginx
upstream emas_kiosk_backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Certificate (akan ditambah dengan Certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript;

    # Frontend Static Files
    location / {
        root /var/www/emas-kiosk/frontend;
        try_files $uri $uri/ =404;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # API Proxy
    location /api {
        proxy_pass http://emas_kiosk_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health Check
    location /health {
        proxy_pass http://emas_kiosk_backend;
    }
}
```

### 5.2 Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/emas-kiosk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Setup SSL Certificate

### 6.1 Get Certificate with Certbot
```bash
sudo certbot certonly --nginx -d your-domain.com -d www.your-domain.com
```

### 6.2 Auto Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
sudo systemctl status certbot.timer
```

---

## 7. Firewall Configuration

### 7.1 Setup UFW
```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

## 8. Database Backup

### 8.1 Automatic Backup Script
```bash
sudo nano /usr/local/bin/backup-emas-kiosk.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/emas-kiosk"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="emas_kiosk"
DB_USER="emas_user"

mkdir -p $BACKUP_DIR
mysqldump -u $DB_USER -p'secure_password_here' $DB_NAME > $BACKUP_DIR/db_$TIMESTAMP.sql
gzip $BACKUP_DIR/db_$TIMESTAMP.sql

# Keep only last 30 days backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Database backup completed: $BACKUP_DIR/db_$TIMESTAMP.sql.gz"
```

### 8.2 Set Cron Job
```bash
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-emas-kiosk.sh >> /var/log/emas-kiosk-backup.log 2>&1
```

---

## 9. Monitoring & Logging

### 9.1 Check Application Status
```bash
pm2 status
pm2 logs emas-kiosk --lines 100
journalctl -u nginx -f
tail -f /var/log/mysql/error.log
```

### 9.2 Monitor Resources
```bash
top
htop
df -h
free -h
```

---

## 10. Performance Optimization

### 10.1 MySQL Optimization
Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:
```ini
max_connections = 200
query_cache_size = 256M
query_cache_type = 1
innodb_buffer_pool_size = 2G
```

### 10.2 Node.js Optimization
```bash
NODE_ENV=production NODE_OPTIONS="--max-old-space-size=2048" pm2 start server.js
```

### 10.3 Nginx Optimization
Edit `/etc/nginx/nginx.conf`:
```nginx
worker_processes auto;
worker_connections 2048;
keepalive_timeout 65;
```

---

## 11. Domain Configuration

Update frontend `js/kiosk.js` dan `js/admin.js`:
```javascript
const API_BASE_URL = 'https://your-domain.com/api';
```

---

## 12. Post-Deployment Checklist

- [ ] Database disetup dan terisi data
- [ ] Environment variables dikonfigurasi
- [ ] SSL certificate aktif
- [ ] Nginx reverse proxy berjalan
- [ ] PM2 process manager aktif
- [ ] Backup database berjalan
- [ ] Monitoring setup
- [ ] Firewall dikonfigurasi
- [ ] Domain DNS pointing ke server
- [ ] Test kiosk.html, admin.html, display.html
- [ ] Test API endpoints
- [ ] Performance tested

---

## 13. Troubleshooting

### Application tidak berjalan
```bash
pm2 logs emas-kiosk
```

### Database connection error
```bash
mysql -u emas_user -p -h localhost emas_kiosk
```

### Nginx error
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### SSL certificate error
```bash
sudo certbot renew --dry-run
```

---

## 14. Scaling untuk High Traffic

### 14.1 Load Balancing dengan PM2
```bash
pm2 start server.js -i max --name "emas-kiosk"
```

### 14.2 Database Optimization
- Setup replication untuk backup server
- Enable query caching
- Optimize indexes

### 14.3 CDN Setup
- Upload static files ke CloudFront atau Cloudflare
- Cache agresif untuk frontend assets

---

## Support

Untuk masalah deployment, silakan:
1. Cek logs: `pm2 logs emas-kiosk`
2. Check nginx: `sudo systemctl status nginx`
3. Open GitHub issue: https://github.com/fdlizak/self-service-/issues

**Selamat! Aplikasi production sudah siap!** 🚀
