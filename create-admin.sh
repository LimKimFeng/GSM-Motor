#!/bin/bash

# ==========================================
# Create Admin/Subadmin Account Script
# ==========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "==========================================="
echo "   👤 Create Admin/Subadmin Account"
echo "==========================================="
echo ""

# Get database credentials from .env
if [ -f "backend/.env" ]; then
    DB_USER=$(grep DB_USER backend/.env | cut -d '=' -f2)
    DB_PASSWORD=$(grep DB_PASSWORD backend/.env | cut -d '=' -f2)
    DB_NAME=$(grep DB_NAME backend/.env | cut -d '=' -f2)
else
    echo -e "${RED}Error: backend/.env not found!${NC}"
    exit 1
fi

# Menu
echo "Pilih tipe akun:"
echo "1) Super Admin (full access)"
echo "2) Sub Admin (limited access)"
echo ""
read -p "Pilihan (1/2): " CHOICE

if [ "$CHOICE" == "1" ]; then
    ROLE="admin"
    ROLE_NAME="Super Admin"
elif [ "$CHOICE" == "2" ]; then
    ROLE="subadmin"
    ROLE_NAME="Sub Admin"
else
    echo -e "${RED}Pilihan tidak valid!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Membuat akun: ${ROLE_NAME}${NC}"
echo ""

# Get user input
read -p "Nama lengkap: " NAME
read -p "Email: " EMAIL
read -sp "Password: " PASSWORD
echo ""
read -sp "Konfirmasi password: " PASSWORD2
echo ""

# Validate
if [ -z "$NAME" ] || [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
    echo -e "${RED}Semua field harus diisi!${NC}"
    exit 1
fi

if [ "$PASSWORD" != "$PASSWORD2" ]; then
    echo -e "${RED}Password tidak cocok!${NC}"
    exit 1
fi

# Generate password hash using Go
echo ""
echo "Generating password hash..."
cd backend

# Create temporary Go file
cat > /tmp/hash_password.go << 'EOF'
package main

import (
    "fmt"
    "os"
    "golang.org/x/crypto/bcrypt"
)

func main() {
    if len(os.Args) < 2 {
        fmt.Println("Usage: go run hash_password.go <password>")
        os.Exit(1)
    }
    
    password := os.Args[1]
    hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        os.Exit(1)
    }
    
    fmt.Println(string(hash))
}
EOF

HASH=$(go run /tmp/hash_password.go "$PASSWORD")
rm -f /tmp/hash_password.go

if [ -z "$HASH" ]; then
    echo -e "${RED}Gagal generate password hash!${NC}"
    exit 1
fi

# Insert into database
echo "Creating account in database..."

mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" << EOSQL
INSERT INTO users (name, email, password, role, email_verified_at, created_at, updated_at) 
VALUES (
  '${NAME}',
  '${EMAIL}',
  '${HASH}',
  '${ROLE}',
  NOW(),
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE 
  role='${ROLE}',
  password='${HASH}',
  email_verified_at=NOW(),
  updated_at=NOW();
EOSQL

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Akun berhasil dibuat!${NC}"
    echo ""
    echo "==========================================="
    echo -e "${BLUE}Detail Akun:${NC}"
    echo "-------------------------------------------"
    echo "Tipe     : ${ROLE_NAME}"
    echo "Nama     : ${NAME}"
    echo "Email    : ${EMAIL}"
    echo "Password : (sudah di-hash dengan bcrypt)"
    echo "==========================================="
    echo ""
    echo -e "${YELLOW}⚠️  Simpan credentials ini dengan aman!${NC}"
    echo ""
    echo "Login di: http://yourdomain.com/login"
    echo "Admin panel: http://yourdomain.com/admin"
    echo ""
else
    echo -e "${RED}❌ Gagal membuat akun!${NC}"
    echo "Periksa database credentials di backend/.env"
    exit 1
fi
