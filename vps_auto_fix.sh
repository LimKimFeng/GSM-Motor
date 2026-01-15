#!/bin/bash

# ============================================
#   GSM Motor - VPS Auto Fix Script
# ============================================
# Script untuk diagnosa dan fix error 500
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "==========================================="
echo "  GSM Motor - VPS Auto Fix"
echo "==========================================="
echo ""

# ============================================
# 1. Diagnosa - Cek semua service
# ============================================
echo -e "${BLUE}[STEP 1/8] Checking services...${NC}"
echo ""

echo "MariaDB:"
if systemctl is-active --quiet mariadb; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running - Starting...${NC}"
    sudo systemctl start mariadb
fi

echo ""
echo "Nginx:"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running - Starting...${NC}"
    sudo systemctl start nginx
fi

echo ""
echo "GSM-Motor Backend:"
if systemctl is-active --quiet gsm-motor 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}! Not running or not configured${NC}"
fi

echo ""

# ============================================
# 2. Setup Database
# ============================================
echo -e "${BLUE}[STEP 2/8] Setting up database...${NC}"

DB_NAME="db_gsm_motor"
DB_USER="gsm_user"
DB_PASS="gsm_user_admin_123456789@@_987654321"

# Create database and user
sudo mysql <<EOF 2>/dev/null || echo "Database might already exist"
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DROP USER IF EXISTS '${DB_USER}'@'localhost';
CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✓ Database configured${NC}"

# Import schema if exists
if [ -f "db_gsm_motorl.sql" ]; then
    echo "Importing schema..."
    mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} < db_gsm_motorl.sql 2>/dev/null || echo "Schema might already be imported"
    echo -e "${GREEN}✓ Schema imported${NC}"
fi

echo ""

# ============================================
# 3. Setup Backend .env
# ============================================
echo -e "${BLUE}[STEP 3/8] Configuring backend...${NC}"

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
fi

# Update .env with correct values
sed -i "s|^DB_USER=.*|DB_USER=${DB_USER}|" backend/.env
sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=${DB_PASS}|" backend/.env
sed -i "s|^DB_NAME=.*|DB_NAME=${DB_NAME}|" backend/.env
sed -i "s|^JWT_SECRET=.*|JWT_SECRET=FeO73G3QM3EvLMgwQIl82GYoTGcKPtr5WZW1JLL7dC4=|" backend/.env
sed -i "s|^APP_ENV=.*|APP_ENV=production|" backend/.env

echo -e "${GREEN}✓ Backend .env configured${NC}"
echo ""

# ============================================
# 4. Build Backend
# ============================================
echo -e "${BLUE}[STEP 4/8] Building backend...${NC}"

cd backend

# Install Go if not exists
if ! command -v go &> /dev/null; then
    echo "Installing Go..."
    wget -q https://go.dev/dl/go1.21.6.linux-amd64.tar.gz
    sudo rm -rf /usr/local/go
    sudo tar -C /usr/local -xzf go1.21.6.linux-amd64.tar.gz
    export PATH=$PATH:/usr/local/go/bin
    echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
fi

# Build
go mod tidy
CGO_ENABLED=0 GOOS=linux go build -o gsm-motor ./cmd/main.go

if [ -f "gsm-motor" ]; then
    echo -e "${GREEN}✓ Backend built successfully${NC}"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi

cd ..
echo ""

# ============================================
# 5. Build Frontend
# ============================================
echo -e "${BLUE}[STEP 5/8] Building frontend...${NC}"

cd frontend

# Install Node if not exists
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Build
npm install --legacy-peer-deps
npm run build

if [ -d "dist" ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi

cd ..
echo ""

# ============================================
# 6. Setup Systemd Service
# ============================================
echo -e "${BLUE}[STEP 6/8] Setting up systemd service...${NC}"

sudo tee /etc/systemd/system/gsm-motor.service > /dev/null <<EOF
[Unit]
Description=GSM Motor E-commerce Backend
After=network.target mariadb.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$(pwd)/backend
ExecStart=$(pwd)/backend/gsm-motor
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable gsm-motor
sudo systemctl restart gsm-motor

echo -e "${GREEN}✓ Systemd service configured${NC}"
echo ""

# ============================================
# 7. Setup Nginx
# ============================================
echo -e "${BLUE}[STEP 7/8] Configuring Nginx...${NC}"

sudo tee /etc/nginx/sites-available/gsm.linjinfeng.site > /dev/null <<'EOF'
server {
    listen 80;
    server_name gsm.linjinfeng.site;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    server_tokens off;

    # Frontend
    root /home/ubuntu/GSM-Motor/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_hide_header X-Powered-By;
    }

    # Uploads
    location /uploads {
        proxy_pass http://localhost:8080/uploads;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:8080/health;
        access_log off;
    }

    # Block hidden files
    location ~ /\. {
        deny all;
        access_log off;
    }

    access_log /var/log/nginx/gsm_access.log;
    error_log /var/log/nginx/gsm_error.log;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/gsm.linjinfeng.site /etc/nginx/sites-enabled/

# Test and reload
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx configured${NC}"
else
    echo -e "${RED}✗ Nginx config error!${NC}"
    exit 1
fi

echo ""

# ============================================
# 8. Verify Everything
# ============================================
echo -e "${BLUE}[STEP 8/8] Verifying installation...${NC}"
echo ""

# Wait for backend to start
sleep 3

# Check services
echo "Service Status:"
echo -n "  MariaDB: "
systemctl is-active --quiet mariadb && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "  Backend: "
systemctl is-active --quiet gsm-motor && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo -n "  Nginx: "
systemctl is-active --quiet nginx && echo -e "${GREEN}✓${NC}" || echo -e "${RED}✗${NC}"

echo ""

# Test backend
echo "Backend Test:"
if curl -s http://localhost:8080/health | grep -q "healthy"; then
    echo -e "  ${GREEN}✓ Backend responding${NC}"
else
    echo -e "  ${RED}✗ Backend not responding${NC}"
    echo ""
    echo "Backend logs:"
    sudo journalctl -u gsm-motor -n 20 --no-pager
fi

echo ""

# Test database
echo "Database Test:"
if mysql -u ${DB_USER} -p${DB_PASS} ${DB_NAME} -e "SELECT COUNT(*) FROM users;" &>/dev/null; then
    echo -e "  ${GREEN}✓ Database connection OK${NC}"
else
    echo -e "  ${YELLOW}! Database might be empty (run seed_database.sh)${NC}"
fi

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "==========================================="
echo ""
echo "🌐 Website: http://gsm.linjinfeng.site"
echo ""
echo "📊 Check status:"
echo "  sudo systemctl status gsm-motor"
echo "  sudo journalctl -u gsm-motor -f"
echo ""
echo "🔧 Useful commands:"
echo "  sudo systemctl restart gsm-motor  # Restart backend"
echo "  sudo systemctl reload nginx       # Reload Nginx"
echo "  ./seed_database.sh                # Add sample data"
echo ""
