#!/bin/bash
# ==============================================================================
# Script Automasi Deploy / Update Gamification Frontend (Dev/Staging Server)
# Jalankan script ini: ./deploy-fe-gamification.sh
# ==============================================================================
set -e

REAL_SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "$REAL_SCRIPT_PATH")" && pwd)"

if [ -d "/opt/rejuve-gamification" ]; then
  cd "/opt/rejuve-gamification"
else
  cd "$SCRIPT_DIR"
fi

echo "=================================================================="
echo "🚀 [1/3] Mengambil pembaruan kode frontend terbaru dari Git..."
echo "=================================================================="
git pull origin main || git pull

echo "=================================================================="
echo "📦 [2/3] Build & Restart HANYA container gamification-frontend..."
echo "   (Container ASCO, DB, dan service lain TIDAK AKAN DISENTUH/DIGANGGU)"
echo "=================================================================="
docker compose up -d --build gamification-frontend

echo "=================================================================="
echo "🔍 [3/3] Memeriksa Status Container & Port Frontend..."
echo "=================================================================="
docker ps --filter "name=gamification-frontend"

SERVER_IP=$(curl -s --max-time 3 ifconfig.me || echo "103.168.147.133")

echo "=================================================================="
echo "🎉 DEPLOYMENT GAMIFICATION FRONTEND BERHASIL!"
echo "🌐 URL Frontend : http://${SERVER_IP}:3006"
echo "📡 Terhubung ke : http://${SERVER_IP}:3005/api"
echo "=================================================================="
