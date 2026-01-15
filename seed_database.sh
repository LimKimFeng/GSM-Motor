#!/bin/bash

# ============================================
#   GSM Motor - Database Seeder Script
# ============================================
# Script untuk mengisi database dengan data sample
# ============================================

set -e

# Warna
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Konfigurasi
DB_NAME="db_gsm_motor"
DB_USER="gsm_user"

echo ""
echo "==========================================="
echo "  GSM Motor - Database Seeder"
echo "==========================================="
echo ""

read -sp "Masukkan password database user '${DB_USER}': " DB_PASS
echo ""

# Test koneksi
mysql -u ${DB_USER} -p${DB_PASS} -e "SELECT 1;" &>/dev/null

if [ $? -ne 0 ]; then
    echo "Password salah atau user tidak memiliki akses!"
    exit 1
fi

print_success "Koneksi berhasil"
echo ""

# ============================================
# Insert Sample Data
# ============================================

print_info "Mengisi data sample..."

mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} <<EOF

-- 1. USERS
INSERT INTO users (name, email, phone, role, password, email_verified_at, created_at, updated_at) VALUES
('Admin GSM Motor', 'admin@gsmmotor.com', '081386363979', 'admin', '\$2y\$12\$LQv3c1yycaGdyND3YKfmlOPSa/3RX0qSAOM.pbV6.yvpL1wYqKw4e', NOW(), NOW(), NOW()),
('Karyawan 1', 'karyawan1@gsmmotor.com', '081234567890', 'subadmin', '\$2y\$12\$LQv3c1yycaGdyND3YKfmlOPSa/3RX0qSAOM.pbV6.yvpL1wYqKw4e', NOW(), NOW(), NOW()),
('Budi Santoso', 'budi@example.com', '081234567891', 'customer', '\$2y\$12\$LQv3c1yycaGdyND3YKfmlOPSa/3RX0qSAOM.pbV6.yvpL1wYqKw4e', NOW(), NOW(), NOW()),
('Siti Nurhaliza', 'siti@example.com', '081234567892', 'customer', '\$2y\$12\$LQv3c1yycaGdyND3YKfmlOPSa/3RX0qSAOM.pbV6.yvpL1wYqKw4e', NOW(), NOW(), NOW()),
('Andi Wijaya', 'andi@example.com', '081234567893', 'customer', '\$2y\$12\$LQv3c1yycaGdyND3YKfmlOPSa/3RX0qSAOM.pbV6.yvpL1wYqKw4e', NOW(), NOW(), NOW());

-- 2. CATEGORIES
INSERT INTO categories (name, slug, created_at, updated_at) VALUES
('Oli Motor', 'oli-motor', NOW(), NOW()),
('Spare Part', 'spare-part', NOW(), NOW()),
('Aksesoris', 'aksesoris', NOW(), NOW()),
('Ban Motor', 'ban-motor', NOW(), NOW()),
('Helm', 'helm', NOW(), NOW()),
('Filter', 'filter', NOW(), NOW()),
('Lampu', 'lampu', NOW(), NOW());

-- 3. PRODUCTS
INSERT INTO products (category_id, name, slug, description, price, price_3_items, price_5_items, stock, image_path, last_price_update, created_at, updated_at) VALUES
(1, 'Oli Yamalube 800ml', 'oli-yamalube-800ml', 'Oli mesin original Yamaha untuk performa maksimal motor Anda', 45000.00, 42000.00, 40000.00, 100, '/uploads/products/oli-yamalube.jpg', NOW(), NOW(), NOW()),
(1, 'Oli Castrol Power1 4T 10W-40', 'oli-castrol-power1', 'Oli sintetik premium untuk motor 4 tak', 85000.00, 80000.00, 75000.00, 75, '/uploads/products/oli-castrol.jpg', NOW(), NOW(), NOW()),
(1, 'Oli Shell Advance AX7 800ml', 'oli-shell-advance', 'Oli berkualitas tinggi dengan teknologi terbaru', 55000.00, 52000.00, 50000.00, 90, '/uploads/products/oli-shell.jpg', NOW(), NOW(), NOW()),
(2, 'Kampas Rem Depan Honda Beat', 'kampas-rem-depan-honda-beat', 'Kampas rem original Honda untuk Beat series', 35000.00, 33000.00, 31000.00, 50, '/uploads/products/kampas-rem-beat.jpg', NOW(), NOW(), NOW()),
(2, 'Kampas Rem Belakang Yamaha Mio', 'kampas-rem-belakang-mio', 'Kampas rem belakang original Yamaha Mio', 30000.00, 28000.00, 26000.00, 60, '/uploads/products/kampas-rem-mio.jpg', NOW(), NOW(), NOW()),
(2, 'Busi NGK Iridium', 'busi-ngk-iridium', 'Busi iridium tahan lama dan performa optimal', 65000.00, 62000.00, 60000.00, 80, '/uploads/products/busi-ngk.jpg', NOW(), NOW(), NOW()),
(3, 'Spion Lipat Universal', 'spion-lipat-universal', 'Spion lipat cocok untuk semua jenis motor', 75000.00, 70000.00, 65000.00, 30, '/uploads/products/spion-lipat.jpg', NOW(), NOW(), NOW()),
(3, 'Cover Motor Jumbo', 'cover-motor-jumbo', 'Cover motor anti air ukuran jumbo', 95000.00, 90000.00, 85000.00, 40, '/uploads/products/cover-motor.jpg', NOW(), NOW(), NOW()),
(3, 'Holder HP Motor Universal', 'holder-hp-motor', 'Holder HP untuk motor dengan kualitas premium', 45000.00, 42000.00, 40000.00, 100, '/uploads/products/holder-hp.jpg', NOW(), NOW(), NOW()),
(4, 'Ban FDR Sport XR Evo 80/90-14', 'ban-fdr-sport-xr-evo', 'Ban tubeless berkualitas untuk motor matic', 250000.00, 240000.00, 230000.00, 20, '/uploads/products/ban-fdr.jpg', NOW(), NOW(), NOW()),
(4, 'Ban IRC NR77 70/90-14', 'ban-irc-nr77', 'Ban IRC dengan grip maksimal', 180000.00, 175000.00, 170000.00, 25, '/uploads/products/ban-irc.jpg', NOW(), NOW(), NOW()),
(5, 'Helm INK Centro Jet', 'helm-ink-centro-jet', 'Helm half face SNI dengan visor', 180000.00, 175000.00, 170000.00, 15, '/uploads/products/helm-ink.jpg', NOW(), NOW(), NOW()),
(5, 'Helm KYT DJ Maru', 'helm-kyt-dj-maru', 'Helm full face racing dengan double visor', 450000.00, 440000.00, 430000.00, 10, '/uploads/products/helm-kyt.jpg', NOW(), NOW(), NOW()),
(5, 'Helm Cargloss Retro', 'helm-cargloss-retro', 'Helm retro klasik dengan desain vintage', 250000.00, 245000.00, 240000.00, 12, '/uploads/products/helm-cargloss.jpg', NOW(), NOW(), NOW()),
(6, 'Filter Udara K&N Racing', 'filter-udara-kn', 'Filter udara racing untuk performa maksimal', 120000.00, 115000.00, 110000.00, 35, '/uploads/products/filter-kn.jpg', NOW(), NOW(), NOW()),
(6, 'Filter Oli Honda Original', 'filter-oli-honda', 'Filter oli original Honda untuk semua tipe', 25000.00, 23000.00, 21000.00, 70, '/uploads/products/filter-oli.jpg', NOW(), NOW(), NOW()),
(7, 'Lampu LED Headlight H4', 'lampu-led-h4', 'Lampu LED super terang 6000K', 150000.00, 145000.00, 140000.00, 45, '/uploads/products/lampu-led.jpg', NOW(), NOW(), NOW()),
(7, 'Lampu Sen LED Running', 'lampu-sen-led-running', 'Lampu sen LED dengan efek running', 85000.00, 80000.00, 75000.00, 50, '/uploads/products/lampu-sen.jpg', NOW(), NOW(), NOW());

-- 4. PRODUCT IMAGES
INSERT INTO product_images (product_id, image_path, created_at, updated_at) VALUES
(1, '/uploads/products/oli-yamalube-2.jpg', NOW(), NOW()),
(1, '/uploads/products/oli-yamalube-3.jpg', NOW(), NOW()),
(2, '/uploads/products/oli-castrol-2.jpg', NOW(), NOW()),
(4, '/uploads/products/kampas-rem-beat-2.jpg', NOW(), NOW()),
(10, '/uploads/products/ban-fdr-2.jpg', NOW(), NOW()),
(12, '/uploads/products/helm-ink-2.jpg', NOW(), NOW()),
(13, '/uploads/products/helm-kyt-2.jpg', NOW(), NOW());

-- 5. BANNERS
INSERT INTO banners (title, image_path, is_active, \`order\`, created_at, updated_at) VALUES
('Promo Tahun Baru 2026 - Diskon Hingga 30%', '/uploads/banners/promo-tahun-baru.jpg', 1, 1, NOW(), NOW()),
('Diskon Oli Motor 20% - Semua Merek', '/uploads/banners/diskon-oli.jpg', 1, 2, NOW(), NOW()),
('Gratis Ongkir Se-Indonesia Min. Belanja 200rb', '/uploads/banners/gratis-ongkir.jpg', 1, 3, NOW(), NOW()),
('Flash Sale Helm - Hanya Hari Ini!', '/uploads/banners/flash-sale-helm.jpg', 1, 4, NOW(), NOW());

EOF

if [ $? -eq 0 ]; then
    print_success "Data sample berhasil diisi!"
    echo ""
    echo "📊 Data yang ditambahkan:"
    
    # Hitung data
    USER_COUNT=$(mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -sse "SELECT COUNT(*) FROM users;")
    CATEGORY_COUNT=$(mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -sse "SELECT COUNT(*) FROM categories;")
    PRODUCT_COUNT=$(mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -sse "SELECT COUNT(*) FROM products;")
    BANNER_COUNT=$(mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -sse "SELECT COUNT(*) FROM banners;")
    
    echo "  Users      : ${USER_COUNT}"
    echo "  Categories : ${CATEGORY_COUNT}"
    echo "  Products   : ${PRODUCT_COUNT}"
    echo "  Banners    : ${BANNER_COUNT}"
    echo ""
    echo "🔑 Login Credentials (Password: password123):"
    echo "  Admin    : admin@gsmmotor.com"
    echo "  SubAdmin : karyawan1@gsmmotor.com"
    echo "  Customer : budi@example.com"
    echo ""
else
    echo "Gagal mengisi data sample!"
    exit 1
fi
