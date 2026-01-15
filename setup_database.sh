#!/bin/bash

# ============================================
#   GSM Motor - Database Setup Script
# ============================================
# Script untuk membuat database, user, dan
# import schema ke MariaDB
# ============================================

set -e  # Exit on error

# Warna untuk output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fungsi untuk print dengan warna
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_header() {
    echo ""
    echo "==========================================="
    echo "  $1"
    echo "==========================================="
    echo ""
}

# Konfigurasi Database
DB_NAME="db_gsm_motor"
DB_USER="gsm_user"
DB_PASS="gsm_user_admin_123456789@@_987654321"
SQL_FILE="db_gsm_motorl.sql"

print_header "GSM Motor - Database Setup"

# ============================================
# 1. Cek apakah MariaDB sudah terinstall
# ============================================
print_info "Memeriksa instalasi MariaDB..."

if ! command -v mysql &> /dev/null; then
    print_error "MariaDB/MySQL tidak ditemukan!"
    print_info "Silakan install MariaDB terlebih dahulu:"
    echo "  sudo apt update"
    echo "  sudo apt install mariadb-server -y"
    exit 1
fi

print_success "MariaDB ditemukan"

# ============================================
# 2. Cek apakah MariaDB service berjalan
# ============================================
print_info "Memeriksa status MariaDB service..."

if ! sudo systemctl is-active --quiet mariadb; then
    print_warning "MariaDB service tidak berjalan, mencoba start..."
    sudo systemctl start mariadb
    sleep 2
fi

if sudo systemctl is-active --quiet mariadb; then
    print_success "MariaDB service berjalan"
else
    print_error "Gagal menjalankan MariaDB service"
    exit 1
fi

# ============================================
# 3. Input Password untuk Database User
# ============================================
print_header "Konfigurasi Database User"

echo "Masukkan password untuk database user '${DB_USER}':"
echo "(Password ini akan digunakan di backend/.env)"
echo ""
read -sp "Password: " DB_PASS
echo ""
read -sp "Konfirmasi Password: " DB_PASS_CONFIRM
echo ""

if [ "$DB_PASS" != "$DB_PASS_CONFIRM" ]; then
    print_error "Password tidak cocok!"
    exit 1
fi

if [ -z "$DB_PASS" ]; then
    print_error "Password tidak boleh kosong!"
    exit 1
fi

print_success "Password valid"

# ============================================
# 4. Cek apakah database sudah ada
# ============================================
print_info "Memeriksa database yang ada..."

DB_EXISTS=$(sudo mysql -sse "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='${DB_NAME}'")

if [ ! -z "$DB_EXISTS" ]; then
    print_warning "Database '${DB_NAME}' sudah ada!"
    echo ""
    echo "Pilih opsi:"
    echo "  1) Hapus dan buat ulang (DATA AKAN HILANG!)"
    echo "  2) Gunakan database yang ada"
    echo "  3) Batal"
    echo ""
    read -p "Pilihan [1-3]: " choice
    
    case $choice in
        1)
            print_info "Menghapus database lama..."
            sudo mysql -e "DROP DATABASE ${DB_NAME};"
            print_success "Database lama dihapus"
            ;;
        2)
            print_info "Menggunakan database yang ada"
            ;;
        *)
            print_info "Setup dibatalkan"
            exit 0
            ;;
    esac
fi

# ============================================
# 5. Buat Database
# ============================================
print_info "Membuat database '${DB_NAME}'..."

sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "Database '${DB_NAME}' berhasil dibuat"
else
    print_error "Gagal membuat database"
    exit 1
fi

# ============================================
# 6. Buat User dan Berikan Akses
# ============================================
print_info "Membuat user '${DB_USER}'..."

# Hapus user jika sudah ada
sudo mysql -e "DROP USER IF EXISTS '${DB_USER}'@'localhost';" 2>/dev/null

# Buat user baru
sudo mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';" 2>/dev/null

if [ $? -eq 0 ]; then
    print_success "User '${DB_USER}' berhasil dibuat"
else
    print_error "Gagal membuat user"
    exit 1
fi

# Berikan hak akses
print_info "Memberikan hak akses ke database..."
sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
print_success "Hak akses berhasil diberikan"

# ============================================
# 7. Import Schema Database
# ============================================
print_info "Memeriksa file SQL schema..."

if [ ! -f "$SQL_FILE" ]; then
    print_warning "File '${SQL_FILE}' tidak ditemukan!"
    print_info "Database dan user sudah dibuat, tapi schema belum diimport"
    print_info "Anda bisa import manual nanti dengan:"
    echo "  mysql -u ${DB_USER} -p ${DB_NAME} < ${SQL_FILE}"
else
    print_info "Mengimport schema database dari '${SQL_FILE}'..."
    
    mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${SQL_FILE} 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Schema database berhasil diimport"
        
        # Hitung jumlah tabel
        TABLE_COUNT=$(mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -sse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${DB_NAME}';")
        print_info "Total tabel: ${TABLE_COUNT}"
    else
        print_error "Gagal mengimport schema database"
        print_info "Coba import manual dengan:"
        echo "  mysql -u ${DB_USER} -p ${DB_NAME} < ${SQL_FILE}"
    fi
fi

# ============================================
# 8. Update File .env
# ============================================
print_info "Mengupdate file backend/.env..."

ENV_FILE="backend/.env"
ENV_EXAMPLE="backend/.env.example"

if [ ! -f "$ENV_FILE" ]; then
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        print_success "File .env dibuat dari .env.example"
    else
        print_warning "File .env.example tidak ditemukan"
        print_info "Buat file .env manual di backend/"
    fi
fi

if [ -f "$ENV_FILE" ]; then
    # Update konfigurasi database di .env
    sed -i "s/^DB_HOST=.*/DB_HOST=localhost/" "$ENV_FILE"
    sed -i "s/^DB_PORT=.*/DB_PORT=3306/" "$ENV_FILE"
    sed -i "s/^DB_USER=.*/DB_USER=${DB_USER}/" "$ENV_FILE"
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASS}/" "$ENV_FILE"
    sed -i "s/^DB_NAME=.*/DB_NAME=${DB_NAME}/" "$ENV_FILE"
    
    print_success "File .env berhasil diupdate"
fi

# ============================================
# 9. Test Koneksi Database
# ============================================
print_info "Testing koneksi database..."

TEST_RESULT=$(mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -sse "SELECT 1;" 2>/dev/null)

if [ "$TEST_RESULT" == "1" ]; then
    print_success "Koneksi database berhasil!"
else
    print_error "Koneksi database gagal!"
    exit 1
fi

# ============================================
# 10. Tampilkan Ringkasan
# ============================================
print_header "Setup Database Selesai!"

echo "📊 Informasi Database:"
echo "  Database Name : ${DB_NAME}"
echo "  Database User : ${DB_USER}"
echo "  Database Pass : ${DB_PASS}"
echo "  Host          : localhost"
echo "  Port          : 3306"
echo ""
echo "📝 Konfigurasi telah disimpan di:"
echo "  ${ENV_FILE}"
echo ""
echo "🔧 Perintah Berguna:"
echo "  # Login ke database"
echo "  mysql -u ${DB_USER} -p ${DB_NAME}"
echo ""
echo "  # Lihat semua tabel"
echo "  mysql -u ${DB_USER} -p ${DB_NAME} -e 'SHOW TABLES;'"
echo ""
echo "  # Backup database"
echo "  mysqldump -u ${DB_USER} -p ${DB_NAME} > backup.sql"
echo ""

print_success "Anda sekarang bisa menjalankan aplikasi dengan ./run.sh"
echo ""
