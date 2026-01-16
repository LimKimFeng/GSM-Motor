#!/bin/bash

# ==========================================
# GSM Motor Build & Deploy Script
# ==========================================
# This script builds and deploys the application
# for both production (VPS) and development environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
APP_DIR=$(dirname "$(readlink -f "$0")")
cd "$APP_DIR"

echo ""
echo "==========================================="
echo "    🚀 GSM Motor Build & Deploy Script    "
echo "==========================================="
echo ""

# Check if running as root when needed
IS_PRODUCTION=false
if [ -d "/opt/gsm-motor" ] || systemctl is-active --quiet gsm-motor 2>/dev/null; then
    IS_PRODUCTION=true
    echo -e "${BLUE}Mode: Production (VPS)${NC}"
else
    echo -e "${BLUE}Mode: Development (Local)${NC}"
fi

echo ""

# ==========================================
# 1. Build Go Backend
# ==========================================
echo -e "${YELLOW}[1/5] 🔨 Building Go backend...${NC}"
cd "$APP_DIR/backend"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo -e "${RED}Error: Go is not installed!${NC}"
    exit 1
fi

# Download and tidy dependencies
echo "  → Downloading dependencies..."
go mod download
go mod tidy

# Build binary with optimizations
echo "  → Compiling binary..."
if [ "$IS_PRODUCTION" = true ]; then
    # Production build: optimized, no debug symbols
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o gsm-motor ./cmd
else
    # Development build: with debug symbols
    go build -o gsm-motor ./cmd
fi

echo -e "${GREEN}  ✓ Backend built successfully!${NC}"
echo ""

# ==========================================
# 2. Build React Frontend
# ==========================================
echo -e "${YELLOW}[2/5] ⚛️  Building React frontend...${NC}"
cd "$APP_DIR/frontend"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed!${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed!${NC}"
    exit 1
fi

# Install dependencies
echo "  → Installing npm dependencies..."
npm install --silent

# Build for production
echo "  → Building production bundle..."
npm run build

echo -e "${GREEN}  ✓ Frontend built successfully!${NC}"
echo ""

# ==========================================
# 3. Deploy Files (Production Only)
# ==========================================
if [ "$IS_PRODUCTION" = true ]; then
    echo -e "${YELLOW}[3/5] 📦 Deploying files...${NC}"
    
    # Create backup of current deployment
    if [ -f "/opt/gsm-motor/backend/gsm-motor" ]; then
        echo "  → Creating backup..."
        cp /opt/gsm-motor/backend/gsm-motor /opt/gsm-motor/backend/gsm-motor.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Copy backend binary
    if [ -d "/opt/gsm-motor" ]; then
        echo "  → Copying backend binary..."
        sudo cp "$APP_DIR/backend/gsm-motor" /opt/gsm-motor/backend/
        sudo chmod +x /opt/gsm-motor/backend/gsm-motor
        
        # Copy .env if it doesn't exist
        if [ ! -f "/opt/gsm-motor/backend/.env" ]; then
            echo "  → Copying .env configuration..."
            sudo cp "$APP_DIR/backend/.env" /opt/gsm-motor/backend/
        fi
        
        # Copy frontend dist
        echo "  → Copying frontend files..."
        sudo rm -rf /opt/gsm-motor/frontend/dist/*
        sudo cp -r "$APP_DIR/frontend/dist/"* /opt/gsm-motor/frontend/dist/
        
        # Copy uploads directory if doesn't exist
        if [ ! -d "/opt/gsm-motor/backend/uploads" ]; then
            echo "  → Creating uploads directory..."
            sudo mkdir -p /opt/gsm-motor/backend/uploads
        fi
        
        # Set proper permissions
        echo "  → Setting permissions..."
        sudo chown -R www-data:www-data /opt/gsm-motor
        sudo chmod -R 755 /opt/gsm-motor
        sudo chmod -R 775 /opt/gsm-motor/backend/uploads
    fi
    
    echo -e "${GREEN}  ✓ Files deployed successfully!${NC}"
else
    echo -e "${YELLOW}[3/5] ⏭️  Skipping deployment (development mode)${NC}"
fi
echo ""

# ==========================================
# 4. Restart Services (Production Only)
# ==========================================
if [ "$IS_PRODUCTION" = true ]; then
    echo -e "${YELLOW}[4/5] 🔄 Restarting services...${NC}"
    
    # Restart backend service
    if systemctl is-active --quiet gsm-motor; then
        echo "  → Restarting gsm-motor service..."
        sudo systemctl restart gsm-motor
        sleep 2
        
        if systemctl is-active --quiet gsm-motor; then
            echo -e "${GREEN}  ✓ Backend service running${NC}"
        else
            echo -e "${RED}  ✗ Backend service failed to start${NC}"
            echo "  → Checking logs:"
            sudo journalctl -u gsm-motor -n 20 --no-pager
            exit 1
        fi
    else
        echo -e "${YELLOW}  ⚠ Backend service not found, skipping...${NC}"
    fi
    
    # Restart nginx
    if systemctl is-active --quiet nginx; then
        echo "  → Restarting nginx..."
        sudo systemctl restart nginx
        echo -e "${GREEN}  ✓ Nginx restarted${NC}"
    else
        echo -e "${YELLOW}  ⚠ Nginx not running, skipping...${NC}"
    fi
    
    echo -e "${GREEN}  ✓ Services restarted successfully!${NC}"
else
    echo -e "${YELLOW}[4/5] 🚀 Starting development servers...${NC}"
    
    cd "$APP_DIR/backend"
    
    # Kill any existing processes
    pkill -f "gsm-motor" 2>/dev/null || true
    
    # Start backend
    echo "  → Starting backend on :8080..."
    ./gsm-motor &
    BACKEND_PID=$!
    sleep 2
    
    # Check if backend started
    if ps -p $BACKEND_PID > /dev/null; then
        echo -e "${GREEN}  ✓ Backend started (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${RED}  ✗ Backend failed to start${NC}"
        exit 1
    fi
    
    # Note: Frontend dev server is usually already running
    # If you want to start it here, uncomment below:
    # cd "$APP_DIR/frontend"
    # npm run dev &
    # FRONTEND_PID=$!
fi
echo ""

# ==========================================
# 5. Verification
# ==========================================
echo -e "${YELLOW}[5/5] ✅ Verifying deployment...${NC}"

if [ "$IS_PRODUCTION" = true ]; then
    # Check backend service
    if systemctl is-active --quiet gsm-motor; then
        echo -e "${GREEN}  ✓ Backend service: RUNNING${NC}"
    else
        echo -e "${RED}  ✗ Backend service: STOPPED${NC}"
    fi
    
    # Check nginx
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}  ✓ Nginx: RUNNING${NC}"
    else
        echo -e "${RED}  ✗ Nginx: STOPPED${NC}"
    fi
    
    # Check if backend is responding
    if curl -s http://localhost:8080/health > /dev/null 2>&1; then
        echo -e "${GREEN}  ✓ Backend API: RESPONDING${NC}"
    else
        echo -e "${YELLOW}  ⚠ Backend API: NOT RESPONDING (may need time to start)${NC}"
    fi
else
    echo -e "${GREEN}  ✓ Development build complete${NC}"
    echo -e "${GREEN}  ✓ Backend running on http://localhost:8080${NC}"
    echo ""
    echo -e "${BLUE}  → Frontend dev server should be started with: npm run dev${NC}"
    echo -e "${BLUE}  → Or access production build: http://localhost:8080${NC}"
fi

echo ""
echo "==========================================="
echo -e "${GREEN}  🎉 Deployment Complete!${NC}"
echo "==========================================="
echo ""

if [ "$IS_PRODUCTION" = true ]; then
    echo "📊 View backend logs:"
    echo "   sudo journalctl -u gsm-motor -f"
    echo ""
    echo "🔧 Restart services:"
    echo "   sudo systemctl restart gsm-motor"
    echo "   sudo systemctl restart nginx"
else
    echo "🛑 Stop backend:"
    echo "   pkill -f gsm-motor"
    echo ""
    echo "📝 View logs:"
    echo "   tail -f backend/logs/*.log"
fi

echo ""
