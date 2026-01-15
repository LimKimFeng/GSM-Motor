#!/bin/bash

# GSM Motor Run Script
# Builds and deploys the application

set -e

echo "==========================================="
echo "    GSM Motor Build & Deploy Script       "
echo "==========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_DIR=$(dirname "$(readlink -f "$0")")
cd "$APP_DIR"

echo -e "${YELLOW}[1/4] Building Go backend...${NC}"
cd backend

# Download dependencies
go mod tidy
go mod download

# Build binary
CGO_ENABLED=0 GOOS=linux go build -o gsm-motor ./cmd/main.go

echo -e "${GREEN}Backend built successfully!${NC}"

echo -e "${YELLOW}[2/4] Building React frontend...${NC}"
cd ../frontend

# Install dependencies
npm install

# Build for production
npm run build

echo -e "${GREEN}Frontend built successfully!${NC}"

echo -e "${YELLOW}[3/4] Copying files...${NC}"
# If running on VPS with setup.sh, copy to /opt/gsm-motor
if [ -d "/opt/gsm-motor" ]; then
    cp -r dist/* /opt/gsm-motor/frontend/dist/ 2>/dev/null || true
    cp ../backend/gsm-motor /opt/gsm-motor/backend/ 2>/dev/null || true
    cp ../backend/.env /opt/gsm-motor/backend/ 2>/dev/null || true
fi

echo -e "${YELLOW}[4/4] Restarting services...${NC}"
if systemctl is-active --quiet gsm-motor; then
    systemctl restart gsm-motor
    systemctl restart nginx
    echo -e "${GREEN}Services restarted!${NC}"
else
    echo -e "${YELLOW}Running locally for development...${NC}"
    cd ../backend
    
    # Start backend in background
    ./gsm-motor &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    
    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    
    echo ""
    echo -e "${GREEN}Development servers started!${NC}"
    echo "Backend: http://localhost:8080"
    echo "Frontend: http://localhost:5173"
    echo ""
    echo "Press Ctrl+C to stop"
    
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
    wait
fi

echo ""
echo -e "${GREEN}Deployment complete!${NC}"
