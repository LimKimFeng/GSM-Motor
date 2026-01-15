#!/bin/bash

# Quick fix script untuk update di VPS

echo "🔧 Quick Fix: Update Backend & Nginx"
echo ""

# 1. Rebuild backend
echo "[1/3] Rebuilding backend..."
cd ~/GSM-Motor/backend
CGO_ENABLED=0 GOOS=linux go build -o gsm-motor ./cmd/main.go
echo "✅ Done"
echo ""

# 2. Update nginx
echo "[2/3] Updating Nginx config..."
sudo cp ~/GSM-Motor/nginx-config-gsm.conf /etc/nginx/sites-available/gsm.linjinfeng.site

# Test nginx config
if sudo nginx -t; then
    echo "✅ Nginx config valid"
else
    echo "❌ Nginx config error!"
    exit 1
fi
echo ""

# 3. Restart services
echo "[3/3] Restarting services..."
sudo systemctl restart gsm-motor
sudo systemctl reload nginx
echo "✅ Services restarted"
echo ""

echo "=========================================="
echo "✅ Fix Complete!"
echo "=========================================="
echo ""
echo "Test sekarang:"
echo "  curl -I http://gsm.linjinfeng.site"
echo ""
echo "Harusnya frontend React muncul, bukan JSON!"
echo ""
