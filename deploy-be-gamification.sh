#!/bin/bash
# ==============================================================================
# Script Automasi Deploy / Update Gamification Backend (Dev Server - Optimized)
# Jalankan script ini: ./deploy-be-gamification.sh
# ==============================================================================
set -e

# Pastikan script berpindah ke direktori asli repository (mendukung pemanggilan via symlink di ~)
REAL_SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "$REAL_SCRIPT_PATH")" && pwd)"

if [ -d "/opt/rejuve-gamification" ]; then
  cd "/opt/rejuve-gamification"
else
  cd "$SCRIPT_DIR"
fi

echo "=================================================================="
echo "🚀 [1/5] Mengambil pembaruan kode backend terbaru dari Git..."
echo "=================================================================="
git pull origin main || git pull

echo "=================================================================="
echo "📦 [2/5] Build & Start container gamification-backend..."
echo "   (Container ASCO & aplikasi lain tidak akan disentuh/disenggol)"
echo "=================================================================="
docker compose up -d --build gamification-backend

echo "=================================================================="
echo "⏳ [3/5] Sinkronisasi Skema Database (Prisma db push 1x)..."
echo "=================================================================="
docker compose exec -T gamification-backend npx prisma db push --accept-data-loss

echo "=================================================================="
echo "🏥 [4/5] Memeriksa Healthcheck API Backend..."
echo "=================================================================="
MAX_RETRIES=15
COUNTER=0
SUCCESS=false

while [ $COUNTER -lt $MAX_RETRIES ]; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3005/health || echo "000")
  if [ "$HTTP_STATUS" -eq 200 ]; then
    SUCCESS=true
    break
  fi
  echo "Menunggu API siap... ($((COUNTER+1))/$MAX_RETRIES) - HTTP $HTTP_STATUS"
  sleep 2
  COUNTER=$((COUNTER+1))
done

if [ "$SUCCESS" = false ]; then
  echo "❌ Backend gagal merespons dalam waktu yang ditentukan. Menampilkan log error:"
  docker logs --tail 50 gamification-backend
  exit 1
fi

echo "=================================================================="
echo "🧹 [5/5] Membersihkan cache image lama yang tidak terpakai..."
echo "=================================================================="
docker image prune -f >/dev/null 2>&1 || true

SERVER_IP=$(curl -s --max-time 3 ifconfig.me || echo "localhost")

echo "=================================================================="
echo "🎉 DEPLOYMENT GAMIFICATION BACKEND BERHASIL & SEHAT!"
echo "📡 Base URL Backend : http://${SERVER_IP}:3005/api"
echo "📑 Swagger API Docs : http://${SERVER_IP}:3005/swagger"
echo "=================================================================="
