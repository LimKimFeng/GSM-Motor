#!/bin/bash

# Deploy Script - Update backend dan nginx config di VPS

set -e

# Add Go to PATH
export PATH=$PATH:/usr/local/go/bin

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "==========================================="
echo "  Deploy Backend & Nginx Update"
echo "==========================================="
echo ""

# Step 1: Rebuild backend
echo -e "${YELLOW}[1/4] Rebuilding backend...${NC}"
cd backend
CGO_ENABLED=1 GOOS=linux go build -o gsm-motor ./cmd/main.go
echo -e "${GREEN}✓ Backend rebuilt${NC}"
echo ""

# Step 2: Update nginx config (if running on VPS)
echo -e "${YELLOW}[2/4] Updating Nginx config...${NC}"
if [ -f "/etc/nginx/sites-available/gsm.linjinfeng.site" ]; then
    sudo cp ../nginx-config-gsm.conf /etc/nginx/sites-available/gsm.linjinfeng.site
    sudo nginx -t
    echo -e "${GREEN}✓ Nginx config updated${NC}"
else
    echo "ℹ️  Nginx config not found (local environment)"
fi
echo ""

# Step 3: Restart backend service
echo -e "${YELLOW}[3/4] Restarting backend...${NC}"
if systemctl is-active --quiet gsm-motor 2>/dev/null; then
    sudo systemctl restart gsm-motor
    echo -e "${GREEN}✓ Backend service restarted${NC}"
else
    echo "⚠️  Manual restart required"
    echo "   Run: sudo systemctl restart gsm-motor"
fi
echo ""

# Step 4: Restart nginx
echo -e "${YELLOW}[4/4] Restarting Nginx...${NC}"
if systemctl is-active --quiet nginx 2>/dev/null; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✓ Nginx reloaded${NC}"
else
    echo "ℹ️  Nginx not found (local environment)"
fi
echo ""

echo "==========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "==========================================="
echo ""
echo "🌐 Website: http://gsm.linjinfeng.site"
echo ""
echo "Test dengan:"
echo "  curl -I http://gsm.linjinfeng.site"
echo "  curl http://gsm.linjinfeng.site/health"
echo ""
