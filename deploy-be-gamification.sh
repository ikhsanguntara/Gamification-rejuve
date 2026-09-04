#!/bin/bash
# ==============================================================================
# Script Automasi Deploy / Update Gamification Backend (Dev Server)
# Jalankan script ini: ./deploy-be-gamification.sh
# ==============================================================================
set -e

# Pastikan script berpindah ke direktori repository di mana script ini berada
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=================================================================="
echo "🚀 [1/4] Mengambil pembaruan kode backend terbaru dari Git..."
echo "=================================================================="
git pull origin main || git pull

echo "=================================================================="
echo "📦 [2/4] Build & Restart HANYA container gamification-backend..."
echo "   (Container ASCO & aplikasi lain tidak akan disentuh/disenggol)"
echo "=================================================================="
docker compose up -d --build gamification-backend

echo "=================================================================="
echo "⏳ [3/4] Menunggu inisialisasi database (Prisma db push)..."
echo "=================================================================="
sleep 5

echo "=================================================================="
echo "🔍 [4/4] Memeriksa Status Container & Log Backend..."
echo "=================================================================="
docker ps --filter "name=gamification-backend"
echo ""
docker logs --tail 20 gamification-backend

SERVER_IP=$(curl -s --max-time 3 ifconfig.me || echo "IP_SERVER_ANDA")

echo "=================================================================="
echo "🎉 DEPLOYMENT GAMIFICATION BACKEND BERHASIL!"
echo "📡 Base URL Backend : http://${SERVER_IP}:3005"
echo "📑 Swagger API Docs : http://${SERVER_IP}:3005/swagger"
echo "=================================================================="
