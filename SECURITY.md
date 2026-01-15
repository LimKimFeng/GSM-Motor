# GSM Motor - Security Best Practices

## 🔒 Implementasi Keamanan

### 1. **Data Protection**

#### Password Hashing
- Semua password di-hash menggunakan **bcrypt** (cost 12)
- Password TIDAK PERNAH disimpan dalam plaintext
- Tidak bisa di-decrypt kembali (one-way hash)

```go
// Contoh di database
password: $2y$12$LQv3c1yycaGdyND3YKfmlOPSa/3RX0qSAOM.pbV6.yvpL1wYqKw4e
// ☝️ Ini TIDAK BISA didecode jadi plaintext
```

#### JWT Token
- Token dienkripsi dengan **secret key** (change di production!)
- Expire otomatis setelah waktu tertentu
- Refresh token untuk keamanan tambahan

---

### 2. **API Security**

#### a) Hidden Endpoints
✅ Struktur API TIDAK ditampilkan di public  
✅ Route `/` sekarang serve frontend, bukan expose API info  
✅ Endpoint `/api/info` hanya bisa diakses admin

#### b) Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Server: (hidden)
```

#### c) Rate Limiting
- Login/Register: Max 5 requests per 5 menit
- OTP: Max 3 requests per 10 menit
- Mencegah brute force attack

---

### 3. **Database Security**

#### Prepared Statements
- Semua query menggunakan GORM (auto-escaping)
- Mencegah SQL Injection

#### User Isolation
```sql
-- User database terbatas hanya ke database sendiri
GRANT ALL PRIVILEGES ON db_gsm_motor.* TO 'gsm_user'@'localhost';
-- TIDAK bisa akses database lain atau system tables
```

---

### 4. **Nginx Security**

#### Request Filtering
```nginx
# Block akses ke hidden files
location ~ /\. {
    deny all;
}

# Hide server version
server_tokens off;
```

#### Proxy Security
- Hide `X-Powered-By` header
- Hide `Server` header dari backend
- HTTPS ready (tinggal tambah SSL)

---

### 5. **What Data CANNOT Be Accessed?**

#### ❌ Password
- Ter-hash dengan bcrypt
- Tidak bisa di-decrypt
- Hanya bisa di-compare saat login

#### ❌ JWT Secret
- Disimpan di `.env` (tidak di-commit ke git)
- Hanya server yang tahu

#### ❌ API Keys (RajaOngkir, Google OAuth)
- Disimpan di `.env`
- Tidak ter-expose di API response

#### ❌ Database Credentials
- Disimpan di `.env`
- Tidak ter-expose di error messages

---

### 6. **What Data IS Accessible?**

#### ✅ Public Product Data
```json
{
  "id": 1,
  "name": "Oli Yamalube",
  "price": 45000,
  "stock": 100
}
```

#### ✅ User Profile (Only Owner)
```json
{
  "name": "Budi",
  "email": "bud***@example.com",  // Ter-censor
  "phone": "081***567"            // Ter-censor
}
```

#### ✅ Order History (Only Owner)
- User hanya bisa lihat order milik sendiri
- Admin bisa lihat semua (untuk management)

---

## 🛡️ Additional Security Measures

### 1. HTTPS (SSL/TLS)
Aktifkan HTTPS untuk enkripsi data in-transit:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d gsm.linjinfeng.site

# Auto-renewal
sudo systemctl enable certbot.timer
```

### 2. Firewall
```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Fail2Ban (Brute Force Protection)
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 4. Regular Updates
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update dependencies
cd backend && go get -u ./...
cd frontend && npm update
```

---

## 🔐 Environment Variables (.env)

**JANGAN PERNAH** commit file `.env` ke Git!

```bash
# .gitignore
backend/.env
frontend/.env.local
```

**Best Practice:**
1. Simpan `.env.example` dengan placeholder
2. Copy ke `.env` dan isi dengan nilai sebenarnya
3. Gunakan secret manager untuk production (e.g., Vault, AWS Secrets)

---

## ⚠️ Security Checklist

### Development
- [ ] `.env` tidak ter-commit di git
- [ ] Password ter-hash sebelum disimpan
- [ ] Input validation di semua endpoint
- [ ] Error messages tidak expose sensitive info

### Production
- [ ] Change `JWT_SECRET` ke random string (32+ chars)
- [ ] Change DB password yang kuat
- [ ] Aktifkan HTTPS/SSL
- [ ] Set `APP_ENV=production`
- [ ] Enable firewall
- [ ] Regular backup database
- [ ] Monitor error logs
- [ ] Rate limiting active

---

## 📊 Monitoring

### Check Security Headers
```bash
curl -I https://gsm.linjinfeng.site
```

### Check for Vulnerabilities
```bash
# Go backend
go install golang.org/x/vuln/cmd/govulncheck@latest
govulncheck ./...

# NPM frontend
npm audit
npm audit fix
```

### Database Audit
```sql
-- Check user permissions
SHOW GRANTS FOR 'gsm_user'@'localhost';

-- Check open connections
SHOW PROCESSLIST;
```

---

## 🚨 Incident Response

### Jika Ada Breach:
1. **Immediately** rotate semua secrets (JWT, API keys)
2. Force logout semua users
3. Change database password
4. Audit logs untuk melihat extent of damage
5. Notify users jika data mereka terpengaruh

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Go Security](https://golang.org/doc/security)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Nginx Security](https://www.nginx.com/blog/mitigating-ddos-attacks-with-nginx-and-nginx-plus/)

---

**Remember:** Security is an ongoing process, not a one-time setup!
