# 📚 GSM Motor E-commerce - Dokumentasi Lengkap

**Tanggal:** 15 Januari 2026  
**Versi:** 1.0.0  
**Developer:** Lim Kim Feng  
**AI Assistant:** Antigravity (Google Deepmind)

---

## 📋 Daftar Isi

1. [Ringkasan Aplikasi](#ringkasan-aplikasi)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Teknologi Stack](#teknologi-stack)
4. [Fitur Utama](#fitur-utama)
5. [Struktur Database](#struktur-database)
6. [API Endpoints](#api-endpoints)
7. [Security Implementation](#security-implementation)
8. [Deployment Guide](#deployment-guide)
9. [Troubleshooting](#troubleshooting)
10. [Riwayat Percakapan & Solusi](#riwayat-percakapan--solusi)

---

## 🎯 Ringkasan Aplikasi

**GSM Motor E-commerce** adalah platform jual-beli sparepart motor online yang dibangun dengan teknologi modern. Aplikasi ini memungkinkan pelanggan untuk:

- 🛒 Membeli sparepart motor dengan sistem keranjang belanja
- 💰 Mendapatkan diskon otomatis untuk pembelian dalam jumlah tertentu (tiered pricing)
- 🚚 Menghitung ongkos kirim real-time menggunakan RajaOngkir API
- 📦 Melacak status pesanan dari pending hingga completed
- 🔐 Login dengan email/password atau Google OAuth
- 📧 Verifikasi akun melalui OTP email

### Target Pengguna

1. **Customer** - Pembeli sparepart motor
2. **SubAdmin** - Karyawan toko yang mengelola produk dan pesanan
3. **Admin** - Pemilik toko dengan akses penuh ke semua fitur

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                   (React SPA - Port 5173)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     NGINX (Port 80/443)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  - Serve Frontend Static Files                       │   │
│  │  - Reverse Proxy to Backend API (/api/*)            │   │
│  │  - Security Headers                                  │   │
│  │  - SSL/TLS Termination                              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Proxy Pass
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  GO BACKEND (Port 8080)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Framework: Gin                                      │   │
│  │  - JWT Authentication                                │   │
│  │  - Rate Limiting                                     │   │
│  │  - Image Processing (WebP)                          │   │
│  │  - Email Service (SMTP)                             │   │
│  │  - External API Integration                         │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  MariaDB (Port 3306)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database: db_gsm_motor                              │   │
│  │  User: gsm_user                                      │   │
│  │  Tables: 13 tables                                   │   │
│  │  - users, products, categories                       │   │
│  │  - orders, cart_items, banners                       │   │
│  │  - product_images, order_items, etc.                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

External Services:
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  RajaOngkir API  │  │  Google OAuth    │  │  SMTP Server     │
│  (Shipping Cost) │  │  (Login)         │  │  (Email OTP)     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 💻 Teknologi Stack

### Backend
- **Language:** Go 1.21+
- **Framework:** Gin (HTTP Web Framework)
- **ORM:** GORM (Object-Relational Mapping)
- **Authentication:** JWT (JSON Web Tokens)
- **Image Processing:** WebP conversion
- **Email:** SMTP (Gmail)

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 7
- **Routing:** React Router v6
- **State Management:** React Context API
- **HTTP Client:** Axios
- **UI Components:** Custom components dengan Tailwind CSS (jika ada)

### Database
- **DBMS:** MariaDB 10.11+
- **Character Set:** utf8mb4
- **Collation:** utf8mb4_unicode_ci

### Infrastructure
- **Web Server:** Nginx
- **OS:** Ubuntu 22.04 LTS
- **Process Manager:** systemd
- **SSL/TLS:** Let's Encrypt (Certbot)

### External APIs
- **RajaOngkir:** Shipping cost calculation
- **Google OAuth 2.0:** Social login
- **SMTP:** Email verification

---

## ✨ Fitur Utama

### 1. 🔐 Authentication & Authorization

#### A. Email/Password Authentication
- **Registration:**
  - User mendaftar dengan email, password, nama, phone
  - Password di-hash dengan bcrypt (cost 12)
  - OTP dikirim ke email untuk verifikasi
  
- **Login:**
  - Email + password
  - Generate JWT access token (expire 60 menit)
  - Generate refresh token (expire 30 hari)
  
- **OTP Verification:**
  - 6 digit random code
  - Expire dalam 10 menit
  - Max 3 kali resend per 10 menit (rate limiting)

#### B. Google OAuth
- Login dengan akun Google
- Auto-create user jika belum ada
- Langsung verified (skip OTP)

#### C. Role-Based Access Control (RBAC)
```
┌─────────────┬──────────────────────────────────────────┐
│    Role     │              Permissions                 │
├─────────────┼──────────────────────────────────────────┤
│  customer   │ - Browse products                        │
│             │ - Add to cart                            │
│             │ - Checkout & create order                │
│             │ - View own orders                        │
│             │ - Update own profile                     │
├─────────────┼──────────────────────────────────────────┤
│  subadmin   │ - All customer permissions               │
│             │ - Manage products (CRUD)                 │
│             │ - View all orders                        │
│             │ - Update order status                    │
│             │ - Manage categories                      │
├─────────────┼──────────────────────────────────────────┤
│   admin     │ - All subadmin permissions               │
│             │ - Manage users                           │
│             │ - View dashboard analytics               │
│             │ - Manage banners                         │
│             │ - Bulk price updates                     │
│             │ - System configuration                   │
└─────────────┴──────────────────────────────────────────┘
```

---

### 2. 🛒 Shopping Cart

- **Session-based cart** untuk guest users
- **Database-persisted cart** untuk logged-in users
- **Features:**
  - Add/remove items
  - Update quantity
  - Auto-calculate subtotal
  - Show tiered pricing discount
  - Sync across devices (logged-in users)

---

### 3. 💰 Tiered Pricing System

Sistem diskon otomatis berdasarkan quantity:

```
┌──────────────┬─────────────┬──────────────┬──────────────┐
│   Product    │  Base Price │  3+ Items    │  5+ Items    │
├──────────────┼─────────────┼──────────────┼──────────────┤
│ Oli Yamalube │  Rp 45,000  │  Rp 42,000   │  Rp 40,000   │
│ Kampas Rem   │  Rp 35,000  │  Rp 33,000   │  Rp 31,000   │
│ Spion Lipat  │  Rp 75,000  │  Rp 70,000   │  Rp 65,000   │
└──────────────┴─────────────┴──────────────┴──────────────┘

Logic:
- Beli 1-2 items → Harga normal
- Beli 3-4 items → Harga tier 3
- Beli 5+ items  → Harga tier 5
```

**Implementation:**
```go
func GetEffectivePrice(product Product, quantity int) float64 {
    if quantity >= 5 && product.Price5Items != nil {
        return *product.Price5Items
    }
    if quantity >= 3 && product.Price3Items != nil {
        return *product.Price3Items
    }
    return product.Price
}
```

---

### 4. 🚚 Shipping Integration (RajaOngkir)

#### A. Destination Search
- Search provinsi, kota, kecamatan, kelurahan
- Auto-complete dengan debounce
- Caching untuk performa

#### B. Shipping Cost Calculation
```
Input:
- Origin: Toko (subdistrict_id dari .env)
- Destination: User address (subdistrict_id)
- Weight: Total berat produk (gram)
- Courier: JNE, TIKI, POS, etc.

Output:
- Service options (REG, YES, OKE, dll)
- Cost per service
- Estimated delivery time
```

#### C. Supported Couriers
- JNE (Jalur Nugraha Ekakurir)
- TIKI (Titipan Kilat)
- POS Indonesia
- J&T Express
- SiCepat
- AnterAja

---

### 5. 📦 Order Management

#### Order Flow
```
1. Customer → Add to Cart
2. Customer → Checkout (pilih alamat + kurir)
3. System   → Create Order (status: pending)
4. Customer → Upload Payment Proof
5. Admin    → Verify Payment (status: processing)
6. Admin    → Input Tracking Number
7. Admin    → Update Status (shipped)
8. Customer → Receive Order
9. Admin    → Update Status (completed)
```

#### Order Status
```
┌──────────────┬────────────────────────────────────────────┐
│   Status     │              Description                   │
├──────────────┼────────────────────────────────────────────┤
│  pending     │ Menunggu pembayaran                        │
│  processing  │ Pembayaran verified, sedang diproses       │
│  shipped     │ Barang sudah dikirim                       │
│  completed   │ Barang sudah diterima                      │
│  cancelled   │ Order dibatalkan                           │
└──────────────┴────────────────────────────────────────────┘
```

---

### 6. 🖼️ Image Upload & Processing

#### Features
- **Upload:** Multipart form-data
- **Validation:**
  - Max size: 10MB
  - Allowed types: JPG, PNG, WebP
- **Processing:**
  - Auto-convert to WebP (compression)
  - Watermark (optional)
  - Resize (optional)
- **Storage:** Local filesystem (`./uploads/`)
- **Serving:** Static file server via Gin

#### Directory Structure
```
uploads/
├── products/
│   ├── product-1.webp
│   ├── product-1-thumb.webp
│   └── product-2.webp
├── banners/
│   └── banner-promo.webp
└── payments/
    └── proof-order-123.webp
```

---

### 7. 👨‍💼 Admin Panel

#### Dashboard
- **Statistics:**
  - Total revenue (hari ini, minggu ini, bulan ini)
  - Total orders
  - Total products
  - Total users
  - Pending orders count
  
- **Charts:**
  - Revenue trend (line chart)
  - Top selling products (bar chart)
  - Order status distribution (pie chart)

#### Product Management
- **CRUD Operations:**
  - Create product (dengan multiple images)
  - Update product (info, harga, stock)
  - Delete product (soft delete)
  - Bulk price update (update banyak produk sekaligus)
  
- **Features:**
  - Category assignment
  - Stock management
  - Tiered pricing setup
  - Image gallery

#### Order Management
- **View Orders:**
  - Filter by status
  - Search by order number
  - Sort by date
  
- **Actions:**
  - View order details
  - Verify payment proof
  - Update order status
  - Input tracking number
  - Generate receipt (PDF/print)

#### Banner Management
- **CRUD Operations:**
  - Upload banner image
  - Set order/priority
  - Toggle active/inactive
  - Delete banner

---

## 🗄️ Struktur Database

### ER Diagram (Simplified)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │────┬───▶│  cart_items  │         │  categories │
└─────────────┘    │    └──────────────┘         └─────────────┘
                   │                                     │
                   │                                     │
                   │    ┌──────────────┐                 │
                   ├───▶│    orders    │                 │
                   │    └──────────────┘                 │
                   │           │                         │
                   │           │                         ▼
                   │           │                  ┌─────────────┐
                   │           │                  │  products   │
                   │           │                  └─────────────┘
                   │           │                         │
                   │           │                         │
                   │           ▼                         │
                   │    ┌──────────────┐                 │
                   │    │ order_items  │◀────────────────┘
                   │    └──────────────┘
                   │
                   │    ┌──────────────┐
                   └───▶│payment_proofs│
                        └──────────────┘
```

### Tabel Detail

#### 1. **users**
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  google_id VARCHAR(255) NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(255),
  role ENUM('admin', 'subadmin', 'customer') DEFAULT 'customer',
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255),
  
  -- Address fields
  province VARCHAR(255),
  province_id VARCHAR(255),
  city VARCHAR(255),
  city_id VARCHAR(255),
  district VARCHAR(255),
  district_id VARCHAR(255),
  subdistrict VARCHAR(255),
  subdistrict_id VARCHAR(255),
  postal_code VARCHAR(255),
  address_detail TEXT,
  
  -- OTP fields
  otp_code VARCHAR(6),
  otp_expires_at TIMESTAMP,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 2. **products**
```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  price_3_items DECIMAL(12,2),  -- Tiered pricing
  price_5_items DECIMAL(12,2),  -- Tiered pricing
  stock INT DEFAULT 0,
  image_path VARCHAR(255),
  last_price_update TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

#### 3. **orders**
```sql
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(255) UNIQUE NOT NULL,
  user_id BIGINT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  courier VARCHAR(255),
  tracking_number VARCHAR(255),
  status ENUM('pending','processing','shipped','completed','cancelled') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### 4. **cart_items**
```sql
CREATE TABLE cart_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  UNIQUE KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### 5. **categories**
```sql
CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 6. **banners**
```sql
CREATE TABLE banners (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  image_path VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  `order` INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 7. **product_images**
```sql
CREATE TABLE product_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

#### 8. **order_items**
```sql
CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

---

## 🔌 API Endpoints

### Public Endpoints (No Auth Required)

#### Products
```
GET    /api/products                    # List all products
GET    /api/products/:slug              # Get product detail
GET    /api/products/search?q=oli       # Search products
```

#### Categories
```
GET    /api/categories                  # List all categories
GET    /api/categories/:slug            # Get products by category
```

#### Banners
```
GET    /api/banners                     # Get active banners
```

#### Shipping
```
GET    /api/shipping/destinations?q=jakarta  # Search destinations
GET    /api/shipping/store                   # Get store info
```

#### Health
```
GET    /health                          # Health check
```

---

### Authentication Endpoints

```
POST   /api/auth/register               # Register new user
POST   /api/auth/login                  # Login with email/password
POST   /api/auth/logout                 # Logout (invalidate token)
POST   /api/auth/refresh                # Refresh access token
POST   /api/auth/verify-otp             # Verify email OTP
POST   /api/auth/resend-otp             # Resend OTP
GET    /api/auth/google/redirect        # Initiate Google OAuth
GET    /api/auth/google/callback        # Google OAuth callback
GET    /api/auth/me                     # Get current user info
```

**Request/Response Examples:**

#### Register
```json
// POST /api/auth/register
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123",
  "phone": "081234567890"
}

// Response
{
  "message": "Registrasi berhasil. Silakan cek email untuk verifikasi OTP.",
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "customer"
  }
}
```

#### Login
```json
// POST /api/auth/login
{
  "email": "budi@example.com",
  "password": "password123"
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "customer"
  }
}
```

---

### Protected Endpoints (Requires Auth)

#### Cart
```
GET    /api/cart                        # Get user's cart
GET    /api/cart/count                  # Get cart item count
POST   /api/cart                        # Add item to cart
PATCH  /api/cart/:id                    # Update cart item quantity
DELETE /api/cart/:id                    # Remove item from cart
DELETE /api/cart                        # Clear entire cart
```

#### Checkout
```
GET    /api/checkout                    # Prepare checkout (get cart summary)
POST   /api/checkout                    # Process checkout (create order)
POST   /api/shipping/cost               # Calculate shipping cost
```

#### Orders
```
GET    /api/orders                      # Get user's orders
GET    /api/orders/:id                  # Get order detail
POST   /api/orders/:id/payment          # Upload payment proof
```

#### Profile
```
PATCH  /api/profile                     # Update profile (name, phone)
PATCH  /api/profile/address             # Update address
```

---

### Admin Endpoints (Requires Admin/SubAdmin Role)

#### Dashboard
```
GET    /api/admin/dashboard             # Get dashboard statistics
```

#### Products
```
GET    /api/admin/products              # List all products (with filters)
POST   /api/admin/products              # Create new product
PUT    /api/admin/products/:id          # Update product
DELETE /api/admin/products/:id          # Delete product
POST   /api/admin/products/bulk-price   # Bulk price update
```

#### Categories
```
GET    /api/admin/categories            # List categories
POST   /api/admin/categories            # Create category
PUT    /api/admin/categories/:id        # Update category
DELETE /api/admin/categories/:id        # Delete category
```

#### Banners
```
GET    /api/admin/banners               # List banners
POST   /api/admin/banners               # Create banner
DELETE /api/admin/banners/:id           # Delete banner
PATCH  /api/admin/banners/:id/toggle    # Toggle active status
```

#### Orders
```
GET    /api/admin/orders                # List all orders
GET    /api/admin/orders/:id            # Get order detail
PATCH  /api/admin/orders/:id            # Update order status
POST   /api/admin/orders/:id/verify-payment/:proofId  # Verify payment
GET    /api/admin/orders/:id/receipt    # Get receipt data
```

---

## 🔒 Security Implementation

### 1. Password Security

#### Bcrypt Hashing
```go
// Saat register
hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 12)

// Saat login
err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
```

**Kenapa Aman?**
- ✅ One-way hash (tidak bisa di-decrypt)
- ✅ Cost factor 12 (lambat untuk brute force)
- ✅ Salt otomatis (setiap hash unik)

**Contoh:**
```
Password: password123
Hash: $2y$12$LQv3c1yycaGdyND3YKfmlOPSa/3RX0qSAOM.pbV6.yvpL1wYqKw4e

☝️ Hash ini TIDAK BISA di-convert balik jadi "password123"
```

---

### 2. JWT Token Security

#### Token Structure
```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VyX2lkIjoxLCJyb2xlIjoiY3VzdG9tZXIiLCJleHAiOjE3MDY4NTAwMDB9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

#### Payload Example
```json
{
  "user_id": 1,
  "role": "customer",
  "exp": 1706850000,  // Expiration timestamp
  "iat": 1706846400   // Issued at timestamp
}
```

#### Security Features
- ✅ Signed dengan secret key (dari .env)
- ✅ Auto-expire (60 menit untuk access token)
- ✅ Refresh token untuk perpanjangan
- ✅ Tidak bisa dimodifikasi tanpa secret key

**Kenapa Aman?**
- Jika hacker ubah payload (misal role jadi "admin"), signature jadi invalid
- Server akan reject token yang signature-nya tidak match

---

### 3. Rate Limiting

#### Configuration
```go
// Login/Register: Max 5 requests per 5 menit
StrictRateLimitMiddleware() // 5 req/5min

// OTP: Max 3 requests per 10 menit
OTPRateLimitMiddleware()    // 3 req/10min
```

**Tujuan:**
- ❌ Mencegah brute force attack
- ❌ Mencegah spam registration
- ❌ Mencegah OTP flooding

---

### 4. Security Headers

```go
// Backend (Go)
c.Header("X-Content-Type-Options", "nosniff")
c.Header("X-Frame-Options", "DENY")
c.Header("X-XSS-Protection", "1; mode=block")
c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
c.Header("Server", "")  // Hide server info
```

```nginx
# Nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
server_tokens off;  # Hide Nginx version
```

**Proteksi:**
- ✅ XSS (Cross-Site Scripting)
- ✅ Clickjacking
- ✅ MIME sniffing
- ✅ Information disclosure

---

### 5. SQL Injection Prevention

#### GORM Auto-Escaping
```go
// ✅ AMAN - GORM auto-escape
db.Where("email = ?", userInput).First(&user)

// ❌ BAHAYA - Raw SQL tanpa escape
db.Raw("SELECT * FROM users WHERE email = '" + userInput + "'")
```

**Semua query di aplikasi ini menggunakan GORM**, jadi aman dari SQL injection.

---

### 6. Environment Variables

#### Sensitive Data di .env
```env
# ❌ JANGAN di-commit ke Git!
JWT_SECRET=FeO73G3QM3EvLMgwQIl82GYoTGcKPtr5WZW1JLL7dC4=
DB_PASSWORD=gsm_user_admin_123456789@@_987654321
GOOGLE_CLIENT_SECRET=your-secret
SMTP_PASSWORD=your-app-password
RAJAONGKIR_API_KEY=your-api-key
```

**Best Practice:**
- ✅ File `.env` ada di `.gitignore`
- ✅ Commit `.env.example` dengan placeholder
- ✅ Setiap developer/server punya `.env` sendiri

---

### 7. CORS (Cross-Origin Resource Sharing)

```go
func CORSMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", config.AppConfig.FrontendURL)
        c.Header("Access-Control-Allow-Credentials", "true")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    }
}
```

**Tujuan:**
- ✅ Hanya frontend yang diizinkan bisa akses API
- ✅ Mencegah request dari domain lain

---

## 🚀 Deployment Guide

### Prerequisites

- Ubuntu 22.04 LTS
- Domain name (e.g., gsm.linjinfeng.site)
- Root/sudo access
- Minimum 1GB RAM, 1 CPU core

---

### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install basic tools
sudo apt install -y git curl wget vim ufw

# Setup firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

### Step 2: Clone Repository

```bash
# Clone dari GitHub (atau upload manual)
cd ~
git clone https://github.com/yourusername/GSM-Motor.git
cd GSM-Motor
```

---

### Step 3: Run Setup Script

```bash
# Jalankan setup script (install dependencies)
sudo ./setup.sh
```

**Script ini akan:**
1. Install Node.js 20
2. Install Go 1.21
3. Install MariaDB
4. Install Nginx
5. Setup systemd service

---

### Step 4: Setup Database

```bash
# Setup database
./setup_database.sh

# Isi data sample (optional)
./seed_database.sh
```

---

### Step 5: Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
nano backend/.env

# Update:
# - DB_PASSWORD
# - JWT_SECRET (generate dengan: openssl rand -base64 32)
# - SMTP credentials
# - Google OAuth credentials
# - RajaOngkir API key

# Frontend
cp frontend/.env.example frontend/.env
nano frontend/.env

# Update:
# - VITE_API_URL=https://gsm.linjinfeng.site/api
```

---

### Step 6: Build & Deploy

```bash
# Build semua
./run.sh
```

---

### Step 7: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d gsm.linjinfeng.site

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

### Step 8: Verify Deployment

```bash
# Check services
sudo systemctl status gsm-motor
sudo systemctl status nginx
sudo systemctl status mariadb

# Check logs
sudo journalctl -u gsm-motor -n 50
sudo tail -f /var/log/nginx/gsm_error.log

# Test endpoints
curl https://gsm.linjinfeng.site/health
curl https://gsm.linjinfeng.site/api/products
```

---

## 🔧 Troubleshooting

### Problem 1: Website Menampilkan JSON Backend (Bukan Frontend)

**Gejala:**
```json
{
  "name": "GSM Motor E-commerce API",
  "version": "1.0.0",
  ...
}
```

**Penyebab:**
- Backend Go punya route `/` yang return JSON
- Nginx tidak bisa serve frontend karena backend override

**Solusi:**
```bash
# 1. Update backend (hapus route root)
cd ~/GSM-Motor
./quick_fix_vps.sh

# 2. Atau manual:
cd backend
CGO_ENABLED=0 go build -o gsm-motor ./cmd/main.go
sudo systemctl restart gsm-motor

# 3. Update Nginx config
sudo cp nginx-config-gsm.conf /etc/nginx/sites-available/gsm.linjinfeng.site
sudo nginx -t
sudo systemctl reload nginx
```

---

### Problem 2: 500 Internal Server Error

**Gejala:**
- Nginx return 500
- Backend tidak bisa diakses

**Penyebab:**
- Backend crash atau tidak running
- Database connection error
- File `.env` tidak ada atau salah

**Solusi:**
```bash
# 1. Cek backend status
sudo systemctl status gsm-motor

# 2. Cek logs
sudo journalctl -u gsm-motor -n 100

# 3. Cek database connection
mysql -u gsm_user -p db_gsm_motor -e "SHOW TABLES;"

# 4. Restart backend
sudo systemctl restart gsm-motor
```

---

### Problem 3: Database Connection Error

**Gejala:**
```
Error 1698 (28000): Access denied for user 'root'@'localhost'
```

**Penyebab:**
- Database belum di-setup
- User/password salah di `.env`
- MariaDB tidak running

**Solusi:**
```bash
# 1. Start MariaDB
sudo systemctl start mariadb

# 2. Setup database
./setup_database.sh

# 3. Update .env
nano backend/.env
# Pastikan DB_USER dan DB_PASSWORD benar

# 4. Test connection
mysql -u gsm_user -p db_gsm_motor
```

---

### Problem 4: Frontend Tidak Terupdate

**Gejala:**
- Perubahan di frontend tidak muncul
- Masih tampil versi lama

**Solusi:**
```bash
# 1. Rebuild frontend
cd frontend
npm run build

# 2. Clear browser cache
# Tekan Ctrl+Shift+R di browser

# 3. Restart Nginx
sudo systemctl restart nginx
```

---

### Problem 5: CORS Error

**Gejala:**
```
Access to fetch at 'http://...' from origin 'http://...' has been blocked by CORS policy
```

**Solusi:**
```bash
# Update FRONTEND_URL di backend/.env
nano backend/.env

# Set ke domain frontend yang benar
FRONTEND_URL=https://gsm.linjinfeng.site

# Restart backend
sudo systemctl restart gsm-motor
```

---

## 📝 Riwayat Percakapan & Solusi

### Sesi 1: Setup Database & Error VPS Lock

**Tanggal:** 15 Januari 2026, 07:54 WIB

**Problem:**
User menjalankan `./setup.sh` di VPS dan mendapat error:
```
Waiting for cache lock: Could not get lock /var/lib/dpkg/lock-frontend. 
It is held by process 118558 (apt)
```

**Penyebab:**
Ada proses `apt` lain yang sedang berjalan di background, mengunci package manager.

**Solusi yang Diberikan:**

1. **Tunggu proses selesai** (paling aman)
2. **Kill proses yang mengunci:**
   ```bash
   sudo kill 118558
   sudo rm /var/lib/dpkg/lock-frontend
   sudo rm /var/lib/dpkg/lock
   sudo dpkg --configure -a
   ```
3. **Modifikasi setup.sh** untuk auto-handle lock

**Status:** User memilih menunggu atau manual kill process

---

### Sesi 2: Setup Database - Prompt Data

**Tanggal:** 15 Januari 2026, 10:31 WIB

**Pertanyaan User:**
"Kalau mau masukkin ke mariadb datanya apa saja yang mau dimasukkan, berikan prompt nya"

**Jawaban:**
Saya memberikan prompt lengkap untuk data yang perlu dimasukkan:

1. **USERS** - Admin, SubAdmin, Customer (5 users)
2. **CATEGORIES** - 7 kategori (Oli Motor, Spare Part, dll)
3. **PRODUCTS** - 18 produk dengan tiered pricing
4. **PRODUCT_IMAGES** - Gambar tambahan produk
5. **BANNERS** - 4 banner promosi
6. **CART_ITEMS** - Sample cart (optional)
7. **ORDERS** - Sample orders (optional)
8. **ORDER_ITEMS** - Item dalam order

**File yang Dibuat:**
- SQL insert statements lengkap
- Contoh data realistic untuk e-commerce sparepart motor

---

### Sesi 3: Cara Buat Database & Akses

**Tanggal:** 15 Januari 2026, 10:32 WIB

**Pertanyaan User:**
"Kalau buat db dan akses bagaimana?"

**Jawaban:**
Saya memberikan panduan lengkap:

1. **Login ke MariaDB:**
   ```bash
   sudo mysql -u root -p
   ```

2. **Buat Database:**
   ```sql
   CREATE DATABASE db_gsm_motor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Buat User & Berikan Akses:**
   ```sql
   CREATE USER 'gsm_user'@'localhost' IDENTIFIED BY 'password_kuat_123';
   GRANT ALL PRIVILEGES ON db_gsm_motor.* TO 'gsm_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Import Schema:**
   ```bash
   mysql -u gsm_user -p db_gsm_motor < db_gsm_motorl.sql
   ```

5. **Update .env:**
   ```env
   DB_USER=gsm_user
   DB_PASSWORD=password_kuat_123
   DB_NAME=db_gsm_motor
   ```

**Security Best Practices:**
- Generate password kuat dengan `openssl rand -base64 32`
- Batasi hak akses user
- Disable root remote access

---

### Sesi 4: Script Otomatis Database

**Tanggal:** 15 Januari 2026, 10:33 WIB

**Request User:**
"Ya buat script otomatisnya, dibedakan file nya untuk database"

**Solusi:**
Saya membuat 3 script terpisah:

1. **`setup_database.sh`** - Setup database lengkap
   - Create database
   - Create user dengan password input
   - Import schema
   - Update .env otomatis
   - Test connection

2. **`seed_database.sh`** - Isi data sample
   - Insert 5 users (admin, subadmin, customer)
   - Insert 7 categories
   - Insert 18 products
   - Insert banners
   - Show summary

3. **`reset_database.sh`** - Reset database
   - Drop semua tabel
   - Import ulang schema kosong
   - Konfirmasi sebelum execute

**Features:**
- ✅ Interactive (input password)
- ✅ Colored output
- ✅ Error handling
- ✅ Auto-update .env
- ✅ Verification steps

---

### Sesi 5: Website Menampilkan Backend JSON

**Tanggal:** 15 Januari 2026, 10:53 WIB

**Problem:**
User akses `gsm.linjinfeng.site` dan muncul JSON backend:
```json
{
  "documentation": {...},
  "endpoints": {...},
  "name": "GSM Motor E-commerce API"
}
```

**Screenshot:** Website menampilkan JSON di browser (hitam dengan text JSON)

**Penyebab:**
1. Backend Go punya route `/` yang return JSON API info
2. Route ini override Nginx yang seharusnya serve frontend React
3. Nginx config proxy semua request ke backend

**Solusi:**

1. **Hapus route root di backend:**
   ```go
   // HAPUS route ini:
   r.GET("/", func(c *gin.Context) {
       c.JSON(200, gin.H{"name": "GSM Motor API", ...})
   })
   ```

2. **Update Nginx config:**
   ```nginx
   # Frontend - serve static files
   location / {
       try_files $uri $uri/ /index.html;
   }
   
   # Backend - hanya /api/*
   location /api {
       proxy_pass http://localhost:8080;
   }
   ```

3. **Tambah security headers:**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: DENY
   - X-XSS-Protection: 1; mode=block
   - Hide server version

**Files Created:**
- `quick_fix_vps.sh` - Quick fix script
- `nginx-config-gsm.conf` - Updated Nginx config
- `deploy.sh` - Deployment script

---

### Sesi 6: Security - Data Terlalu Transparan

**Tanggal:** 15 Januari 2026, 10:53 WIB

**Concern User:**
"Aku berpikir untuk update yang backend ini karena datanya terlalu transparan dan 'bisa saja' diakses orang orang, mungkin apakah kamu bisa buat dengan enkripsi pakai apapun itu untuk membuatnya tidak bisa di apa apa kan dengan cara apapun?"

**Jawaban & Implementasi:**

#### A. Password Encryption
```go
// ✅ SUDAH AMAN - Bcrypt hash
hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), 12)

// Contoh:
// Input:  password123
// Output: $2y$12$LQv3c1yycaGdyND3YKfmlOPSa/3RX0qSAOM.pbV6.yvpL1wYqKw4e
// ☝️ TIDAK BISA di-decrypt kembali!
```

#### B. JWT Token Security
```go
// Token signed dengan secret key
token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
signedToken, _ := token.SignedString([]byte(config.AppConfig.JWTSecret))

// Jika hacker ubah payload, signature jadi invalid
```

#### C. API Structure Hidden
```go
// ❌ SEBELUM: Expose semua endpoint
r.GET("/", func(c *gin.Context) {
    c.JSON(200, gin.H{"documentation": allEndpoints})
})

// ✅ SETELAH: Hidden, return 404
r.NoRoute(func(c *gin.Context) {
    c.JSON(404, gin.H{"error": "Not found"})
})
```

#### D. Security Headers
```go
// Protect against XSS, Clickjacking, etc.
c.Header("X-Content-Type-Options", "nosniff")
c.Header("X-Frame-Options", "DENY")
c.Header("X-XSS-Protection", "1; mode=block")
c.Header("Server", "")  // Hide server info
```

#### E. Rate Limiting
```go
// Prevent brute force
StrictRateLimitMiddleware()  // 5 req/5min untuk login
OTPRateLimitMiddleware()     // 3 req/10min untuk OTP
```

**File Created:**
- `SECURITY.md` - Comprehensive security documentation

**Data yang TER-ENKRIPSI:**
- ✅ Password (bcrypt hash)
- ✅ JWT Token (signed)
- ✅ API Keys (di .env, not exposed)
- ✅ Database credentials (server-side only)

**Data yang AMAN untuk Public:**
- ✅ Product info (nama, harga, stock)
- ✅ Category list
- ✅ Banners

**Data yang PROTECTED (Auth Required):**
- 🔐 User profile (hanya owner)
- 🔐 Order history (hanya owner & admin)
- 🔐 Cart items (hanya owner)

---

### Sesi 7: JWT_SECRET - Penjelasan

**Tanggal:** 15 Januari 2026, 11:55 WIB

**Pertanyaan User:**
"Step ke-4 itu apa maksudnya? dapat dari mana?"

**Context:**
User bingung tentang step "Change JWT_SECRET" di dokumentasi.

**Penjelasan:**

#### Apa itu JWT_SECRET?
Kunci rahasia untuk sign & verify JWT token.

#### Kenapa Harus Diganti?
Default value di `.env.example`:
```env
JWT_SECRET=your-super-secret-key-change-in-production-32chars
```

Ini:
- ❌ Bisa ditebak orang lain
- ❌ Jika bocor, hacker bisa buat token palsu
- ❌ Bisa login sebagai admin tanpa password

#### Cara Generate:
```bash
# Opsi 1: OpenSSL (Recommended)
openssl rand -base64 32

# Output contoh:
# FeO73G3QM3EvLMgwQIl82GYoTGcKPtr5WZW1JLL7dC4=

# Opsi 2: Online generator
# https://randomkeygen.com/

# Opsi 3: Manual
# Buat string random 32+ karakter
```

#### Kapan Harus Diganti?
- ✅ **WAJIB** sebelum deploy ke production
- ✅ **WAJIB** jika website sudah public
- ✅ **WAJIB** jika ada user real
- ❌ Tidak perlu di development lokal

#### Cara Update:
```bash
# 1. Generate
openssl rand -base64 32

# 2. Update .env
nano backend/.env
JWT_SECRET=FeO73G3QM3EvLMgwQIl82GYoTGcKPtr5WZW1JLL7dC4=

# 3. Restart backend
sudo systemctl restart gsm-motor
```

**User Action:**
User generate JWT_SECRET dan simpan di file `openssl base 32`:
```
FeO73G3QM3EvLMgwQIl82GYoTGcKPtr5WZW1JLL7dC4=
```

---

### Sesi 8: Error 500 - Database Connection

**Tanggal:** 15 Januari 2026, 11:59 WIB

**Problem:**
User jalankan `./run.sh` dan website return **500 Internal Server Error**.

**Screenshot:** Nginx error page "500 Internal Server Error"

**Diagnosis:**

1. **Cek backend process:**
   ```bash
   ps aux | grep gsm-motor
   # Output: (kosong) - backend tidak running
   ```

2. **Cek backend log:**
   ```bash
   cd backend && ./gsm-motor
   # Error: Access denied for user 'root'@'localhost'
   ```

3. **Root cause:**
   - File `backend/.env` tidak ada
   - Database belum di-setup
   - Backend tidak bisa connect ke database

**Solusi:**

1. **Create .env file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Update JWT_SECRET:**
   ```bash
   sed -i 's|^JWT_SECRET=.*|JWT_SECRET=FeO73G3QM3EvLMgwQIl82GYoTGcKPtr5WZW1JLL7dC4=|' backend/.env
   ```

3. **Setup database:**
   ```bash
   sudo mysql <<EOF
   CREATE DATABASE IF NOT EXISTS db_gsm_motor;
   CREATE USER 'gsm_user'@'localhost' IDENTIFIED BY 'gsm_user_admin_123456789@@_987654321';
   GRANT ALL PRIVILEGES ON db_gsm_motor.* TO 'gsm_user'@'localhost';
   FLUSH PRIVILEGES;
   EOF
   
   mysql -u gsm_user -p db_gsm_motor < db_gsm_motorl.sql
   ```

4. **Update .env dengan DB credentials:**
   ```bash
   sed -i 's/^DB_USER=.*/DB_USER=gsm_user/' backend/.env
   sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=gsm_user_admin_123456789@@_987654321/' backend/.env
   ```

5. **Rebuild & run:**
   ```bash
   cd backend
   go build -o gsm-motor ./cmd/main.go
   ./gsm-motor
   ```

**Files Created:**
- `setup_db_local.sh` - Simplified database setup for local dev

**Status:** Menunggu user jalankan command manual (sudo required)

---

## 📊 Statistik Aplikasi

### Code Statistics
```
Backend (Go):
- Total files: ~50 files
- Lines of code: ~5,000 LOC
- Packages: 8 internal packages
- Dependencies: 15+ Go modules

Frontend (React):
- Total files: ~80 files
- Lines of code: ~8,000 LOC
- Components: 30+ components
- Dependencies: 20+ npm packages

Database:
- Tables: 13 tables
- Indexes: 15+ indexes
- Foreign keys: 10+ relationships
```

### Performance Targets
```
- Page load time: < 2 seconds
- API response time: < 200ms (avg)
- Database query time: < 50ms (avg)
- Image optimization: WebP compression
- Caching: Browser cache + Nginx cache
```

---

## 🎓 Lessons Learned

### 1. Security First
- Selalu hash password dengan bcrypt
- Jangan expose API structure di public
- Gunakan environment variables untuk secrets
- Implement rate limiting untuk prevent abuse
- Add security headers di semua response

### 2. Database Design
- Gunakan foreign keys untuk data integrity
- Index kolom yang sering di-query
- Normalize data tapi jangan over-normalize
- Simpan price_at_purchase di order_items (historical data)

### 3. API Design
- RESTful endpoints dengan HTTP verbs yang benar
- Consistent response format (JSON)
- Error handling dengan status code yang tepat
- Pagination untuk list endpoints
- Filtering & sorting support

### 4. Deployment
- Automate dengan scripts (setup.sh, deploy.sh)
- Use systemd untuk process management
- Nginx sebagai reverse proxy + static file server
- SSL/TLS dengan Let's Encrypt
- Monitoring dengan logs (journalctl, nginx logs)

### 5. Development Workflow
- Separate .env untuk dev/staging/production
- Git ignore sensitive files (.env, uploads/)
- Documentation is important (README, SECURITY)
- Testing sebelum deploy
- Backup database regularly

---

## 🔮 Future Enhancements

### Phase 2 (Planned)
- [ ] Payment gateway integration (Midtrans, Xendit)
- [ ] Real-time notification (WebSocket)
- [ ] Product review & rating
- [ ] Wishlist feature
- [ ] Promo code / voucher system
- [ ] Stock alert notification
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

### Phase 3 (Ideas)
- [ ] Multi-vendor marketplace
- [ ] Loyalty program / points
- [ ] Live chat customer service
- [ ] Product recommendation AI
- [ ] Inventory management system
- [ ] Barcode scanner integration
- [ ] Multi-language support
- [ ] Multi-currency support

---

## 📞 Support & Contact

### Developer
- **Name:** Lim Kim Feng
- **Email:** linjinfeng@example.com
- **GitHub:** github.com/LimKimFeng

### AI Assistant
- **Name:** Antigravity
- **Provider:** Google Deepmind
- **Session:** 15 Januari 2026

### Resources
- **Documentation:** `/home/linjinfeng/Documents/GSM-Motor/`
- **Repository:** (Private/Local)
- **Production:** https://gsm.linjinfeng.site

---

## 📄 License

MIT License

Copyright (c) 2026 Lim Kim Feng

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🙏 Acknowledgments

- **Go Community** - Gin framework & GORM
- **React Team** - React & Vite
- **MariaDB Foundation** - Database system
- **RajaOngkir** - Shipping API
- **Google** - OAuth & Cloud services
- **Nginx** - Web server
- **Let's Encrypt** - Free SSL certificates
- **Stack Overflow** - Countless solutions
- **GitHub** - Code hosting & collaboration

---

**Dokumentasi ini dibuat dengan ❤️ oleh AI Assistant Antigravity**

**Last Updated:** 15 Januari 2026, 12:07 WIB

---

## 📝 Catatan Akhir

Dokumentasi ini mencakup:
- ✅ Penjelasan lengkap aplikasi GSM Motor
- ✅ Semua percakapan & solusi yang diberikan
- ✅ Technical specifications detail
- ✅ Security implementation
- ✅ Deployment guide
- ✅ Troubleshooting common issues
- ✅ Future roadmap

Untuk pertanyaan lebih lanjut atau update dokumentasi, silakan hubungi developer atau buat issue di repository.

**Happy Coding! 🚀**
