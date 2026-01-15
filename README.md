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

### Development

```bash
# 1. Setup backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your config

# 2. Setup frontend environment
cp frontend/.env.example frontend/.env

# 3. Run development servers
./run.sh
```

### Production (VPS)

```bash
# Run as root
sudo ./setup.sh

# Deploy
./run.sh
```

## Features

- 🔐 JWT Authentication + Google OAuth
- 📧 OTP Email Verification
- 🛒 Shopping Cart
- 💰 Tiered Pricing (beli 3+/5+ dapat diskon)
- 🚚 RajaOngkir Shipping Integration
- 📦 Order Management
- 🖼️ Image Upload dengan WebP Conversion
- 👨‍💼 Admin Panel

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/products` - Product list
- `GET /api/products/:slug` - Product detail
- `GET /api/cart` - View cart
- `POST /api/checkout` - Process order
- `GET /api/admin/dashboard` - Admin dashboard

## License

MIT
