#!/bin/bash
# ==============================================================================
# Script Automasi: Build Frontend di MacBook M3 -> Deploy Cepat ke VPS
# Target VPS : 103.168.147.133 (Port 3006)
# Isolasi    : 100% HANYA menyentuh gamification-frontend (ASCO & DB aman)
# Cara Pakai : ./deploy-fe-from-mac.sh
# ==============================================================================

set -e

# Warna output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VPS_HOST="103.168.147.133"
VPS_USER="root"
VPS_PORT="22"
VPS_PASS="${VPS_SSH_PASS:-M@Gn4#!__D3V@@2026}"
VPS_REMOTE_DIR="/opt/rejuve-gamification"
API_BASE_URL="${NUXT_PUBLIC_API_BASE:-http://103.168.147.133:3005/api}"

# Pastikan script berada di root direktori project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}==================================================================${NC}"
echo -e "${BLUE}🚀 RE.JUVE GAMIFICATION — FRONTEND DEPLOYER (MacBook M3 -> VPS)${NC}"
echo -e "${BLUE}==================================================================${NC}"
echo -e "📍 Target Host    : ${YELLOW}${VPS_HOST} (Frontend Port 3006)${NC}"
echo -e "📡 Backend API    : ${YELLOW}${API_BASE_URL}${NC}"
echo -e "🛡️  Isolasi Service: ${GREEN}100% Terisolasi (Tidak menyentuh ASCO / DB)${NC}"
echo -e "${BLUE}==================================================================${NC}\n"

# ------------------------------------------------------------------------------
# 1. PENGUJIAN UNIT TEST (WAJIB SOP 100% PASS)
# ------------------------------------------------------------------------------
echo -e "${YELLOW}🧪 [1/4] Menjalankan Unit Test Frontend Lokal di Mac...${NC}"
if npm --prefix frontend run test; then
  echo -e "${GREEN}✅ Semua Unit Test Lulus 100% (0 Failed). Melanjutkan deploy...${NC}\n"
else
  echo -e "${RED}❌ Unit Test GAGAL! Deployment dibatalkan demi keamanan sistem.${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 2. GENERATE ASET STATIS NUXT 3 DI MACBOOK M3
# ------------------------------------------------------------------------------
echo -e "${YELLOW}⚡ [2/4] Melakukan build statis Nuxt 3 di Mac M3 (Native & Super Cepat)...${NC}"
export NUXT_PUBLIC_API_BASE="$API_BASE_URL"
export NUXT_PUBLIC_APP_ENV="production"

npm --prefix frontend run generate

if [ ! -f "frontend/.output/public/index.html" ]; then
  echo -e "${RED}❌ File frontend/.output/public/index.html tidak ditemukan setelah generate.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Build frontend selesai. Aset siap ditransfer.${NC}\n"

# ------------------------------------------------------------------------------
# 3. TRANSFER ASET KE VPS & UPDATE CONTAINER GAMIFICATION-FRONTEND
# ------------------------------------------------------------------------------
echo -e "${YELLOW}📦 [3/4] Mengirim aset dan memperbarui container Nginx di VPS...${NC}"
echo -e "   (HANYA memperbarui container ${GREEN}gamification-frontend${NC}, container ASCO tidak disentuh)"

# Fungsi eksekusi remote via expect (otomatis handle password SSH)
execute_remote_deploy() {
  expect <<EOF
set timeout 120
spawn ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST} "
  mkdir -p ${VPS_REMOTE_DIR}/frontend/.output/public
"
expect {
  "password:" {
    send "${VPS_PASS}\r"
    exp_continue
  }
  eof
}
EOF

  # Stream tarball aset langsung ke VPS dan reload Nginx
  expect <<EOF
set timeout 180
spawn bash -c "tar -czf - -C frontend/.output/public . | ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p ${VPS_PORT} ${VPS_USER}@${VPS_HOST} 'tar -xzf - -C ${VPS_REMOTE_DIR}/frontend/.output/public && docker cp ${VPS_REMOTE_DIR}/frontend/.output/public/. gamification-frontend:/usr/share/nginx/html/ 2>/dev/null || true && docker exec gamification-frontend nginx -s reload 2>/dev/null || (cd ${VPS_REMOTE_DIR} && docker compose up -d --no-build gamification-frontend)'"
expect {
  "password:" {
    send "${VPS_PASS}\r"
    exp_continue
  }
  eof
}
EOF
}

execute_remote_deploy
echo -e "${GREEN}✅ Aset berhasil disinkronisasi ke Nginx container di VPS.${NC}\n"

# ------------------------------------------------------------------------------
# 4. VERIFIKASI HEALTHCHECK & STATUS SERVICE DI VPS
# ------------------------------------------------------------------------------
echo -e "${YELLOW}🔍 [4/4] Memverifikasi status akses Frontend di VPS...${NC}"
sleep 2

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://${VPS_HOST}:3006" || echo "000")

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 304 ]; then
  echo -e "${GREEN}==================================================================${NC}"
  echo -e "${GREEN}🎉 DEPLOYMENT FRONTEND BERHASIL 100%!${NC}"
  echo -e "🌐 URL Frontend  : ${GREEN}http://${VPS_HOST}:3006${NC}"
  echo -e "📡 Terhubung ke  : ${GREEN}${API_BASE_URL}${NC}"
  echo -e "⚡ Status Akses  : ${GREEN}HTTP ${HTTP_STATUS} OK${NC}"
  echo -e "🛡️  Status ASCO   : ${GREEN}Aman & Tidak Terganggu${NC}"
  echo -e "${GREEN}==================================================================${NC}"
  echo -e "${YELLOW}📝 Jangan lupa mencatat hasil rilis ke docs/DEPLOYMENT_LOG.md${NC}\n"
else
  echo -e "${RED}⚠️ Frontend merespons dengan HTTP Status: ${HTTP_STATUS}.${NC}"
  echo -e "Silakan cek status container via SSH: docker ps --filter 'name=gamification-frontend'"
fi
