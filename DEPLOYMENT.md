# 🚀 GSM Motor - Deployment Guide

## Quick Start (VPS Deployment)

**First time setup:**
```bash
# 1. SSH to your VPS
ssh user@your-vps-ip

# 2. Clone/upload project to VPS
# (upload to ~/GSM-Motor or any directory)

# 3. Run setup script (creates directories, services, nginx config)
cd ~/GSM-Motor
sudo ./setup-vps.sh

# 4. Configure environment
nano backend/.env
# (Set DB credentials, JWT secret, SMTP, etc.)

# 5. Build and deploy
./run.sh
```

**After initial setup, to update/redeploy:**
```bash
# Just run:
./run.sh
```

---

## Prerequisites
- Server dengan Ubuntu/Debian
- Nginx
- MariaDB 10.5+
- Go 1.21+
- Node.js 18+
- Domain (optional)

---

## 1. Database Setup

```bash
# Login ke MySQL/MariaDB
mysql -u root -p

# Create database dan user
CREATE DATABASE gsm_motor;
CREATE USER 'gsm_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON gsm_motor.* TO 'gsm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema (jika ada)
mysql -u gsm_user -p gsm_motor < database.sql
```

---

## 2. Backend Deployment

### Clone & Setup
```bash
cd /var/www
git clone <your-repo-url> gsm-motor
cd gsm-motor/backend

# Copy dan edit .env
cp .env.example .env
nano .env
```

### Configure .env
```env
# Server
SERVER_PORT=8080
APP_ENV=production

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=gsm_user
DB_PASSWORD=your_secure_password_here
DB_NAME=gsm_motor

# JWT (Generate random base64 strings)
JWT_SECRET=<base64-random-string>
REFRESH_EXPIRE_DAYS=30

# SMTP (Gmail/Other)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com

# RajaOngkir
RAJAONGKIR_API_KEY=your-api-key
RAJAONGKIR_DELIVERY_KEY=your-delivery-key
RAJAONGKIR_BASE_URL=https://rajaongkir.komerce.id/api/v1

# Store
STORE_WHATSAPP=6281234567890
STORE_NAME=GSM Motor

# Upload
UPLOAD_PATH=./uploads
MAX_IMAGE_SIZE=10485760

# Frontend
FRONTEND_URL=https://yourdomain.com
```

### Build & Run
```bash
# Build
go build -o gsm-motor ./cmd

# Create systemd service
sudo nano /etc/systemd/system/gsm-motor.service
```

**Service File:**
```ini
[Unit]
Description=GSM Motor API
After=network.target mariadb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/gsm-motor/backend
ExecStart=/var/www/gsm-motor/backend/gsm-motor
Restart=always
RestartSec=5

Environment="APP_ENV=production"

[Install]
WantedBy=multi-user.target
```

```bash
# Start service
sudo systemctl daemon-reload
sudo systemctl enable gsm-motor
sudo systemctl start gsm-motor
sudo systemctl status gsm-motor
```

---

## 3. Frontend Deployment

```bash
cd /var/www/gsm-motor/frontend

# Configure environment
nano .env.production
```

**Frontend .env.production:**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

```bash
# Install & Build
npm install
npm run build

# Hasil build ada di folder dist/
```

---

## 4. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/gsm-motor
```

**Nginx Config:**
```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload files
    location /uploads {
        alias /var/www/gsm-motor/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/gsm-motor/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/gsm-motor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

---

## 6. File Permissions

```bash
cd /var/www/gsm-motor
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
sudo chmod -R 775 backend/uploads
```

---

## 7. Admin Credentials

**Super Admin:**
- Email: `superadmin@gsmmotor.com`
- Password: `Admin@123456`

**Sub Admin:**
- Email: `subadmin@gsmmotor.com`
- Password: `Admin@123456`

> ⚠️ **PENTING**: Ganti password ini setelah login pertama kali!

---

## 8. Production Checklist

- [ ] Database configured dengan password kuat
- [ ] `.env` dengan credentials aman
- [ ] JWT_SECRET random dan aman
- [ ] SMTP configured untuk email OTP
- [ ] RajaOngkir API key valid
- [ ] File permissions correct
- [ ] Firewall configured (UFW)
- [ ] SSL certificates installed
- [ ] Backend service running
- [ ] Nginx configured dan running
- [ ] Admin password diganti
- [ ] Backup setup configured
- [ ] Monitoring setup (optional)

---

## 9. Maintenance Commands

```bash
# View backend logs
sudo journalctl -u gsm-motor -f

# Restart backend
sudo systemctl restart gsm-motor

# Restart nginx
sudo systemctl restart nginx

# Database backup
mysqldump -u gsm_user -p gsm_motor > backup_$(date +%Y%m%d).sql

# Check disk space
df -h
du -sh /var/www/gsm-motor/backend/uploads
```

---

## 10. Firewall Setup (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## 🎉 Deployment Complete!

Access aplikasi di: `https://yourdomain.com`
Access admin di: `https://yourdomain.com/admin`

**Need help?** Check logs atau contact developer.
