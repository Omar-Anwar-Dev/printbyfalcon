#!/bin/bash
set -e

echo "🚀 Starting PrintByFalcon deployment..."

cd /home/deploy/printbyfalcon

echo "📥 Pulling latest code..."
git pull origin main

echo "🐳 Rebuilding and restarting containers..."
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

echo "✅ Deployment complete!"
echo "🔍 Container status:"
docker compose -f docker-compose.prod.yml ps
