#!/bin/bash

# ==========================================
# GSM Motor VPS Setup Script
# ==========================================
# Run this ONCE when deploying to a new VPS
# This creates the directory structure and systemd service

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "==========================================="
echo "    🔧 GSM Motor VPS Setup Script         "
echo "==========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# ==========================================
# 1. Create Directory Structure
# ==========================================
echo -e "${YELLOW}[1/5] 📁 Creating directory structure...${NC}"

mkdir -p /opt/gsm-motor/backend
mkdir -p /opt/gsm-motor/frontend/dist
mkdir -p /opt/gsm-motor/backend/uploads

echo -e "${GREEN}  ✓ Directories created${NC}"
echo ""

# ==========================================
# 2. Set Permissions
# ==========================================
echo -e "${YELLOW}[2/5] 🔐 Setting permissions...${NC}"

chown -R www-data:www-data /opt/gsm-motor
chmod -R 755 /opt/gsm-motor
chmod -R 775 /opt/gsm-motor/backend/uploads

echo -e "${GREEN}  ✓ Permissions set${NC}"
echo ""

# ==========================================
# 3. Create Systemd Service
# ==========================================
echo -e "${YELLOW}[3/5] ⚙️  Creating systemd service...${NC}"

cat > /etc/systemd/system/gsm-motor.service << 'EOF'
[Unit]
Description=GSM Motor API Backend
After=network.target mariadb.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/gsm-motor/backend
ExecStart=/opt/gsm-motor/backend/gsm-motor
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Environment
Environment="APP_ENV=production"

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable gsm-motor

echo -e "${GREEN}  ✓ Systemd service created${NC}"
echo ""

# ==========================================
# 4. Configure Nginx
# ==========================================
echo -e "${YELLOW}[4/5] 🌐 Configuring Nginx...${NC}"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}  → Installing Nginx...${NC}"
    apt update
    apt install -y nginx
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# Create nginx config
cat > /etc/nginx/sites-available/gsm-motor << EOF
# GSM Motor Backend API
server {
    listen 80;
    server_name $SERVER_IP api.yourdomain.com;

    location /api {
        proxy_pass http://localhost:8080/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Upload files
    location /uploads {
        alias /opt/gsm-motor/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}

# GSM Motor Frontend
server {
    listen 80 default_server;
    server_name $SERVER_IP yourdomain.com www.yourdomain.com;

    root /opt/gsm-motor/frontend/dist;
    index index.html;

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|webp|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/gsm-motor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

echo -e "${GREEN}  ✓ Nginx configured${NC}"
echo ""

# ==========================================
# 5. Configure Firewall (UFW)
# ==========================================
echo -e "${YELLOW}[5/5] 🔥 Configuring firewall...${NC}"

if command -v ufw &> /dev/null; then
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    
    # Enable if not already enabled
    ufw --force enable
    
    echo -e "${GREEN}  ✓ Firewall configured${NC}"
else
    echo -e "${YELLOW}  ⚠ UFW not installed, skipping...${NC}"
fi

echo ""
echo "==========================================="
echo -e "${GREEN}  🎉 VPS Setup Complete!${NC}"
echo "==========================================="
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Configure backend/.env file"
echo "  2. Run ./run.sh to build and deploy"
echo "  3. Access your site at: http://$SERVER_IP"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  • View backend logs: sudo journalctl -u gsm-motor -f"
echo "  • Restart backend: sudo systemctl restart gsm-motor"
echo "  • Restart nginx: sudo systemctl restart nginx"
echo "  • Check status: sudo systemctl status gsm-motor"
echo ""
