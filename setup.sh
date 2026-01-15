#!/bin/bash

# GSM Motor E-commerce Setup Script
# Run this script on a fresh VPS with Ubuntu/Debian

set -e

echo "==========================================="
echo "    GSM Motor E-commerce Setup Script     "
echo "==========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
DOMAIN="gsm.linjinfeng.site"
APP_DIR="/opt/gsm-motor"
GO_VERSION="1.21.0"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

echo -e "${YELLOW}[1/8] Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl git build-essential nginx certbot python3-certbot-nginx mariadb-server

echo -e "${YELLOW}[2/8] Installing Node.js 20...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo -e "${YELLOW}[3/8] Installing Go ${GO_VERSION}...${NC}"
if [ ! -f "/usr/local/go/bin/go" ]; then
    wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
    rm go${GO_VERSION}.linux-amd64.tar.gz
fi
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile

echo -e "${YELLOW}[4/8] Setting up MariaDB...${NC}"
systemctl start mariadb
systemctl enable mariadb

# Create database and user
mysql -e "CREATE DATABASE IF NOT EXISTS gsm_motor CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'gsm_motor'@'localhost' IDENTIFIED BY 'GsmMotor2024!';"
mysql -e "GRANT ALL PRIVILEGES ON gsm_motor.* TO 'gsm_motor'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo -e "${GREEN}Database created: gsm_motor${NC}"

echo -e "${YELLOW}[5/8] Creating application directory...${NC}"
mkdir -p ${APP_DIR}
mkdir -p ${APP_DIR}/uploads/{products,banners,payments,qrcodes}
mkdir -p ${APP_DIR}/logs

echo -e "${YELLOW}[6/8] Configuring Nginx...${NC}"
cat > /etc/nginx/sites-available/gsm-motor << EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    # Frontend
    root ${APP_DIR}/frontend/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Uploads
    location /uploads {
        alias ${APP_DIR}/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Frontend routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF

ln -sf /etc/nginx/sites-available/gsm-motor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${YELLOW}[7/8] Creating systemd service...${NC}"
cat > /etc/systemd/system/gsm-motor.service << EOF
[Unit]
Description=GSM Motor Backend
After=network.target mariadb.service

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}/backend
ExecStart=${APP_DIR}/backend/gsm-motor
Restart=on-failure
RestartSec=5
StandardOutput=append:${APP_DIR}/logs/backend.log
StandardError=append:${APP_DIR}/logs/backend.log
Environment=PATH=/usr/local/go/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gsm-motor

echo -e "${YELLOW}[8/8] Setting up SSL certificate...${NC}"
certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || true

echo ""
echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}    Setup Complete!                      ${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Copy your project files to ${APP_DIR}/"
echo "2. Create backend/.env file with your configuration"
echo "3. Create frontend/.env file with VITE_API_URL=https://${DOMAIN}/api"
echo "4. Run: cd ${APP_DIR} && ./run.sh"
echo ""
echo "Database credentials:"
echo "  Database: gsm_motor"
echo "  User: gsm_motor"
echo "  Password: GsmMotor2024!"
echo ""
