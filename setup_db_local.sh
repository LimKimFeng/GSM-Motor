#!/bin/bash

# Quick database setup for local development (no sudo required)

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DB_NAME="db_gsm_motor"
DB_USER="gsm_user"
DB_PASS="gsm_user_admin_123456789@@_987654321"
SQL_FILE="db_gsm_motorl.sql"

echo ""
echo "==========================================="
echo "  Quick Database Setup (Local Dev)"
echo "==========================================="
echo ""

# Test if MariaDB is running
if ! mysql -e "SELECT 1" &>/dev/null; then
    echo -e "${RED}Error: Cannot connect to MariaDB!${NC}"
    echo ""
    echo "Please make sure MariaDB is running:"
    echo "  sudo systemctl start mariadb"
    echo ""
    echo "Or if using system MariaDB, you might need to run:"
    echo "  sudo mysql < setup_db.sql"
    exit 1
fi

echo -e "${YELLOW}[1/5] Creating database...${NC}"
mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo -e "${RED}Failed to create database. Trying with sudo...${NC}"
    sudo mysql -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
}
echo -e "${GREEN}✓ Database created${NC}"

echo -e "${YELLOW}[2/5] Creating user...${NC}"
mysql -e "DROP USER IF EXISTS '${DB_USER}'@'localhost';" 2>/dev/null || sudo mysql -e "DROP USER IF EXISTS '${DB_USER}'@'localhost';" 2>/dev/null
mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';" 2>/dev/null || {
    sudo mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
}
echo -e "${GREEN}✓ User created${NC}"

echo -e "${YELLOW}[3/5] Granting privileges...${NC}"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';" 2>/dev/null || {
    sudo mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
}
mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || sudo mysql -e "FLUSH PRIVILEGES;"
echo -e "${GREEN}✓ Privileges granted${NC}"

echo -e "${YELLOW}[4/5] Importing schema...${NC}"
if [ -f "$SQL_FILE" ]; then
    mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < ${SQL_FILE} 2>/dev/null
    echo -e "${GREEN}✓ Schema imported${NC}"
else
    echo -e "${RED}✗ File ${SQL_FILE} not found!${NC}"
fi

echo -e "${YELLOW}[5/5] Updating backend/.env...${NC}"
if [ -f "backend/.env" ]; then
    sed -i "s|^DB_USER=.*|DB_USER=${DB_USER}|" backend/.env
    sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASS}|" backend/.env
    sed -i "s|^DB_NAME=.*|DB_NAME=${DB_NAME}|" backend/.env
    echo -e "${GREEN}✓ .env updated${NC}"
else
    echo -e "${YELLOW}! backend/.env not found, skipping${NC}"
fi

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Database Setup Complete!${NC}"
echo "==========================================="
echo ""
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo "Password: ${DB_PASS}"
echo ""
echo "Test connection:"
echo "  mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -e 'SHOW TABLES;'"
echo ""
