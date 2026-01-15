#!/bin/bash

# Quick rebuild backend only (for code changes)

set -e

echo "🔨 Rebuilding Go backend..."

cd backend

# Build binary
CGO_ENABLED=0 GOOS=linux go build -o gsm-motor ./cmd/main.go

echo "✅ Backend rebuilt successfully!"
echo ""
echo "To restart the server:"
echo "  1. Stop current server (Ctrl+C)"
echo "  2. Run: cd backend && ./gsm-motor"
echo ""
