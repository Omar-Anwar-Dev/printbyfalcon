#!/bin/bash
# PrintByFalcon — Production Deploy Script
# Run this on the VPS as the deploy user
# Usage: bash scripts/deploy.sh

set -e  # Exit immediately if any command fails

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🦅 PrintByFalcon — Starting Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Navigate to project
cd /home/deploy/printbyfalcon

# Pull latest code from GitHub
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Rebuild and restart all containers
echo "🐳 Rebuilding containers (this takes a few minutes)..."
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

# Clean up old Docker images to save disk space
echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
sleep 10

# Health check
echo "🔍 Running health check..."
HEALTH=$(curl -sf http://localhost:4000/health || echo "FAILED")

if echo "$HEALTH" | grep -q "ok"; then
  echo "✅ Health check passed!"
else
  echo "❌ Health check FAILED. Check logs:"
  docker compose -f docker-compose.prod.yml logs nestjs-api --tail=30
  exit 1
fi

# Show status
echo ""
echo "📊 Container Status:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deployment Complete!"
echo "🌐 https://printbyfalcon.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
