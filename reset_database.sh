#!/bin/bash

# ============================================
#   GSM Motor - Database Reset Script
# ============================================
# Script untuk reset database (hapus semua data)
# dan import ulang schema
# ============================================

set -e

# Warna
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

# Konfigurasi
DB_NAME="db_gsm_motor"
DB_USER="gsm_user"
SQL_FILE="db_gsm_motorl.sql"

echo ""
echo "==========================================="
echo "  GSM Motor - Database Reset"
echo "==========================================="
echo ""

print_warning "PERINGATAN: Script ini akan menghapus SEMUA DATA di database!"
echo ""
read -p "Apakah Anda yakin ingin melanjutkan? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Reset dibatalkan"
    exit 0
fi

echo ""
read -sp "Masukkan password database user '${DB_USER}': " DB_PASS
echo ""

# Test koneksi
mysql -u ${DB_USER} -p${DB_PASS} -e "SELECT 1;" &>/dev/null

if [ $? -ne 0 ]; then
    print_error "Password salah atau user tidak memiliki akses!"
    exit 1
fi

print_success "Koneksi berhasil"

# Drop semua tabel
echo ""
print_warning "Menghapus semua tabel..."

mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -e "
SET FOREIGN_KEY_CHECKS = 0;
SET @tables = NULL;
SELECT GROUP_CONCAT(table_name) INTO @tables
  FROM information_schema.tables
  WHERE table_schema = '${DB_NAME}';
SET @tables = CONCAT('DROP TABLE IF EXISTS ', @tables);
PREPARE stmt FROM @tables;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET FOREIGN_KEY_CHECKS = 1;
" 2>/dev/null

print_success "Semua tabel berhasil dihapus"

# Import ulang schema
if [ -f "$SQL_FILE" ]; then
    echo ""
    print_warning "Mengimport ulang schema..."
    
    mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${SQL_FILE} 2>/dev/null
    
    if [ $? -eq 0 ]; then
        print_success "Schema berhasil diimport"
        
        TABLE_COUNT=$(mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -sse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '${DB_NAME}';")
        echo "Total tabel: ${TABLE_COUNT}"
    else
        print_error "Gagal mengimport schema"
        exit 1
    fi
else
    print_error "File ${SQL_FILE} tidak ditemukan!"
    exit 1
fi

echo ""
print_success "Database berhasil direset!"
echo ""
