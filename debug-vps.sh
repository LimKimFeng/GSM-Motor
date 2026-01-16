#!/bin/bash

# Debug script untuk troubleshoot VPS deployment

echo "=== GSM Motor VPS Debug ==="
echo ""

echo "1. Checking systemd service status..."
sudo systemctl status gsm-motor --no-pager

echo ""
echo "2. Checking if binary exists and is executable..."
ls -lh /opt/gsm-motor/backend/gsm-motor

echo ""
echo "3. Checking .env file..."
if [ -f "/opt/gsm-motor/backend/.env" ]; then
    echo "✓ .env exists"
    echo "DB_HOST=$(grep DB_HOST /opt/gsm-motor/backend/.env | cut -d '=' -f2)"
    echo "DB_NAME=$(grep DB_NAME /opt/gsm-motor/backend/.env | cut -d '=' -f2)"
    echo "SERVER_PORT=$(grep SERVER_PORT /opt/gsm-motor/backend/.env | cut -d '=' -f2)"
else
    echo "✗ .env NOT FOUND!"
fi

echo ""
echo "4. Trying to run binary manually..."
cd /opt/gsm-motor/backend
sudo -u www-data ./gsm-motor &
MANUAL_PID=$!
sleep 3

if ps -p $MANUAL_PID > /dev/null; then
    echo "✓ Binary runs successfully (PID: $MANUAL_PID)"
    sudo kill $MANUAL_PID 2>/dev/null
else
    echo "✗ Binary failed to run"
fi

echo ""
echo "5. Checking port 8080..."
sudo netstat -tlnp | grep :8080 || echo "Port 8080: NOT LISTENING"

echo ""
echo "6. Checking nginx config..."
sudo nginx -t

echo ""
echo "7. Recent systemd logs..."
sudo journalctl -u gsm-motor -n 50 --no-pager

echo ""
echo "=== Debug Complete ==="
