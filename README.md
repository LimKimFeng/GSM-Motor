# GSM Motor E-commerce

Platform e-commerce sparepart motor menggunakan **Go (Gin)** untuk backend dan **React (Vite)** untuk frontend.

## Struktur Proyek

```
GSM-Motor/
├── backend/              # Go API Server
│   ├── cmd/main.go       # Entry point
│   ├── internal/         # Handler, middleware, models, utils
│   ├── uploads/          # Image storage
│   └── .env.example      # Environment template
├── frontend/             # React SPA
│   ├── src/              # Components, pages, services
│   └── .env.example      # Environment template
├── setup.sh              # VPS setup script
└── run.sh                # Build & deploy script
```

## Requirements

- Go 1.21+
- Node.js 20+
- MariaDB/MySQL
- (Production) Nginx

## Quick Start

### 1. Database Setup

```bash
# Setup database, user, dan import schema
./setup_database.sh

# Isi dengan data sample (opsional)
./seed_database.sh
```

### 2. Development

```bash
# Setup backend environment
cp backend/.env.example backend/.env
# Edit backend/.env dengan kredensial database

# Setup frontend environment
cp frontend/.env.example frontend/.env

# Run development servers
./run.sh
```

### 3. Production (VPS)

```bash
# Pertama kali - setup system dependencies
sudo ./setup.sh

# Setup database
./setup_database.sh
./seed_database.sh

# Build & deploy
./run.sh
```

## 🔥 Quick Fix (VPS)

Jika website menampilkan JSON backend alih-alih frontend:

```bash
# Upload file ke VPS, lalu jalankan:
./quick_fix_vps.sh
```

## 📦 Available Scripts

| Script | Fungsi |
|--------|--------|
| `setup.sh` | Install dependencies (Node, Go, Nginx, MariaDB) |
| `setup_database.sh` | Create database, user, import schema |
| `seed_database.sh` | Populate database dengan sample data |
| `reset_database.sh` | Reset database (hapus semua data) |
| `rebuild_backend.sh` | Rebuild Go backend saja (quick) |
| `run.sh` | Build semua & jalankan aplikasi |
| `deploy.sh` | Deploy ke VPS (rebuild + restart services) |
| `quick_fix_vps.sh` | Quick fix untuk masalah frontend tidak muncul |

## Features

- 🔐 JWT Authentication + Google OAuth + bcrypt password hashing
- 📧 OTP Email Verification (SMTP)
- 🛒 Shopping Cart dengan session persistence
- 💰 Tiered Pricing (beli 3+/5+ dapat diskon otomatis)
- 🚚 RajaOngkir Shipping Integration (real-time ongkir)
- 📦 Order Management dengan status tracking
- 🖼️ Image Upload dengan WebP Conversion otomatis
- 👨‍💼 Admin Panel untuk manage products, orders, users
- 🛡️ Security Headers (XSS, CSRF, Clickjacking protection)
- ⚡ Rate Limiting (brute force protection)

## 🔒 Security

**Data yang TER-ENKRIPSI dan AMAN:**
- ✅ Password → bcrypt hash (tidak bisa di-decrypt)
- ✅ JWT Token → signed dengan secret key
- ✅ API Keys → disimpan di `.env` (not exposed)
- ✅ Database credentials → server-side only

Lihat [SECURITY.md](./SECURITY.md) untuk detail lengkap tentang security implementation.

## API Endpoints

### Public
- `GET /api/products` - Product list
- `GET /api/products/:slug` - Product detail
- `GET /api/categories` - Categories
- `GET /api/banners` - Active banners
- `GET /health` - Health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-otp` - Verify email OTP
- `GET /api/auth/google/redirect` - Google OAuth

### Protected (requires login)
- `GET /api/cart` - View cart
- `POST /api/cart` - Add to cart
- `POST /api/checkout` - Process order
- `GET /api/orders` - Order history
- `PATCH /api/profile` - Update profile

### Admin Only
- `GET /api/admin/dashboard` - Dashboard stats
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `PATCH /api/admin/orders/:id` - Update order status

## Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=gsm_user
DB_PASSWORD=your_secure_password
DB_NAME=db_gsm_motor

# JWT Secret (MUST CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-key-change-this-32chars

# SMTP untuk email OTP
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# RajaOngkir API
RAJAONGKIR_API_KEY=your-api-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8080/api
```

## Troubleshooting

### Website menampilkan JSON backend
```bash
./quick_fix_vps.sh
```

### Database connection error
```bash
# Cek service MariaDB
sudo systemctl status mariadb

# Test connection
mysql -u gsm_user -p db_gsm_motor
```

### Frontend tidak terupdate
```bash
cd frontend
npm run build
sudo systemctl restart nginx
```

### Backend tidak running
```bash
sudo systemctl status gsm-motor
sudo journalctl -u gsm-motor -n 50
```

## License

MIT

