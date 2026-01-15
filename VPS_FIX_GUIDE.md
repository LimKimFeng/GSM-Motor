# 🚀 Panduan Fix VPS - Error 500

**VPS Info:**
- IP: 157.20.32.131
- Port: 14034
- User: ubuntu
- Password: lim2026

---

## ⚡ Quick Fix (Recommended)

### Step 1: Upload Script ke VPS

```bash
# Di komputer lokal, upload script
scp -P 14034 vps_auto_fix.sh ubuntu@157.20.32.131:~/GSM-Motor/

# Atau jika sudah clone, script sudah ada di folder
```

### Step 2: SSH ke VPS

```bash
ssh -p 14034 ubuntu@157.20.32.131
# Password: lim2026
```

### Step 3: Jalankan Auto Fix

```bash
cd ~/GSM-Motor
chmod +x vps_auto_fix.sh
./vps_auto_fix.sh
```

**Script ini akan otomatis:**
1. ✅ Cek semua service (MariaDB, Nginx, Backend)
2. ✅ Setup database (create DB, user, import schema)
3. ✅ Configure backend .env
4. ✅ Build backend Go
5. ✅ Build frontend React
6. ✅ Setup systemd service
7. ✅ Configure Nginx
8. ✅ Verify semua berjalan

**Waktu:** ~5-10 menit

---

## 🔍 Jika Masih Error

### Cek Log Backend

```bash
# Lihat log real-time
sudo journalctl -u gsm-motor -f

# Lihat 50 baris terakhir
sudo journalctl -u gsm-motor -n 50
```

### Cek Log Nginx

```bash
# Error log
sudo tail -f /var/log/nginx/gsm_error.log

# Access log
sudo tail -f /var/log/nginx/gsm_access.log
```

### Test Backend Manual

```bash
# Test health endpoint
curl http://localhost:8080/health

# Test API
curl http://localhost:8080/api/products
```

### Restart Services

```bash
# Restart backend
sudo systemctl restart gsm-motor

# Restart Nginx
sudo systemctl reload nginx

# Restart MariaDB
sudo systemctl restart mariadb
```

---

## 📊 Verify Installation

```bash
# Cek status semua service
sudo systemctl status gsm-motor
sudo systemctl status nginx
sudo systemctl status mariadb

# Test database
mysql -u gsm_user -pgsm_user_admin_123456789@@_987654321 db_gsm_motor -e "SHOW TABLES;"

# Test website
curl -I http://gsm.linjinfeng.site
```

---

## 🎯 Expected Result

Setelah script selesai, Anda harus bisa:

1. ✅ Akses http://gsm.linjinfeng.site → Frontend React muncul
2. ✅ Akses http://gsm.linjinfeng.site/health → `{"status":"healthy"}`
3. ✅ Akses http://gsm.linjinfeng.site/api/products → JSON products

---

## 🆘 Manual Fix (Jika Script Gagal)

### 1. Setup Database

```bash
sudo mysql <<EOF
CREATE DATABASE IF NOT EXISTS db_gsm_motor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DROP USER IF EXISTS 'gsm_user'@'localhost';
CREATE USER 'gsm_user'@'localhost' IDENTIFIED BY 'gsm_user_admin_123456789@@_987654321';
GRANT ALL PRIVILEGES ON db_gsm_motor.* TO 'gsm_user'@'localhost';
FLUSH PRIVILEGES;
EOF

mysql -u gsm_user -pgsm_user_admin_123456789@@_987654321 db_gsm_motor < db_gsm_motorl.sql
```

### 2. Configure Backend

```bash
cd ~/GSM-Motor/backend
cp .env.example .env

# Edit .env
nano .env

# Update:
# DB_USER=gsm_user
# DB_PASSWORD=gsm_user_admin_123456789@@_987654321
# DB_NAME=db_gsm_motor
# JWT_SECRET=FeO73G3QM3EvLMgwQIl82GYoTGcKPtr5WZW1JLL7dC4=
# APP_ENV=production
```

### 3. Build Backend

```bash
cd ~/GSM-Motor/backend
go mod tidy
CGO_ENABLED=0 GOOS=linux go build -o gsm-motor ./cmd/main.go
```

### 4. Build Frontend

```bash
cd ~/GSM-Motor/frontend
npm install --legacy-peer-deps
npm run build
```

### 5. Create Systemd Service

```bash
sudo nano /etc/systemd/system/gsm-motor.service
```

Paste:
```ini
[Unit]
Description=GSM Motor E-commerce Backend
After=network.target mariadb.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/GSM-Motor/backend
ExecStart=/home/ubuntu/GSM-Motor/backend/gsm-motor
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable & start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable gsm-motor
sudo systemctl start gsm-motor
```

### 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/gsm.linjinfeng.site
```

Paste config dari `nginx-config-gsm.conf`, lalu:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📞 Troubleshooting Spesifik

### Error: "Access denied for user"
```bash
# Reset database password
sudo mysql -e "ALTER USER 'gsm_user'@'localhost' IDENTIFIED BY 'gsm_user_admin_123456789@@_987654321';"
```

### Error: "Port 8080 already in use"
```bash
# Kill process di port 8080
sudo lsof -ti:8080 | xargs sudo kill -9
sudo systemctl restart gsm-motor
```

### Error: "Nginx 502 Bad Gateway"
```bash
# Backend tidak running
sudo systemctl start gsm-motor
sudo systemctl status gsm-motor
```

### Error: "Frontend tidak muncul"
```bash
# Rebuild frontend
cd ~/GSM-Motor/frontend
npm run build
sudo systemctl reload nginx
```

---

## ✅ Checklist

- [ ] Script `vps_auto_fix.sh` dijalankan
- [ ] MariaDB running
- [ ] Backend running (systemctl status gsm-motor)
- [ ] Nginx running
- [ ] Database ada isi (SHOW TABLES)
- [ ] Backend respond (curl localhost:8080/health)
- [ ] Website accessible (curl gsm.linjinfeng.site)

---

## 🎉 Success Indicators

Jika berhasil, Anda akan lihat:

```bash
$ curl http://gsm.linjinfeng.site/health
{"status":"healthy"}

$ curl http://gsm.linjinfeng.site/api/products
{"data":[...]}  # JSON products

$ curl -I http://gsm.linjinfeng.site
HTTP/1.1 200 OK
Content-Type: text/html
...
```

Dan di browser: **Frontend React muncul** ✅

---

**Good luck! 🚀**
