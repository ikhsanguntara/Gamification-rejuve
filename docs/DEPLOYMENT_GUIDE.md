# Panduan Deployment Frontend (Nuxt 3)
## Environment Staging & Production — Re.juve Gamification

Dokumen ini menjelaskan alur, konfigurasi environment file (`.env`), serta perintah build & deployment untuk **Frontend Nuxt 3** pada platform Gamifikasi Re.juve.

---

## 1. File Environment Frontend

Frontend menggunakan file environment terpisah untuk setiap target rilis:

| Environment | File Environment Lokal | File Template Terlacak (Git) | Target REST API Backend |
| :--- | :--- | :--- | :--- |
| **Development** | `frontend/.env` | `frontend/.env.example` | Lokal / Ngrok Dev |
| **Staging (`stg`)** | `frontend/.env.staging` | `frontend/.env.staging.example` | Staging API Server |
| **Production (`prod`)** | `frontend/.env.production` | `frontend/.env.production.example` | Production Live API Server |

---

## 2. Variabel Konfigurasi di `frontend/.env.*`

```ini
# URL REST API Backend
NUXT_PUBLIC_API_BASE=https://staging-api.gamification.rejuve.co.id/api

# Environment Mode: staging | production
NUXT_PUBLIC_APP_ENV=staging

# Informasi Aplikasi
NUXT_PUBLIC_APP_NAME="Rejuve Gamification (Staging)"
NUXT_PUBLIC_APP_VERSION="1.0.0-stg"

# Request Timeout (dalam milidetik)
NUXT_PUBLIC_API_TIMEOUT=30000
```

---

## 3. Perintah Build & Deploy

### A. Deploy Otomatis ke Firebase Hosting
Perintah ini akan men-generate aset statis Nuxt 3 menggunakan file `.env` yang sesuai, kemudian mengunggahnya ke Firebase Hosting:

```bash
# Deploy ke Staging (memuat frontend/.env.staging)
npm run deploy:stg
# atau langsung dari folder frontend:
npm --prefix frontend run deploy:stg

# Deploy ke Production (memuat frontend/.env.production)
npm run deploy:prod
# atau langsung dari folder frontend:
npm --prefix frontend run deploy:prod
```

### B. Generate Output Statis Saja (Nginx / S3 / Cloudflare Pages)
Jika server hosting menggunakan Nginx atau static file server lainnya:

```bash
# Generate untuk Staging
npm run generate:stg

# Generate untuk Production
npm run generate:prod
```
*Hasil generate berada di direktori `frontend/.output/public` siap disajikan oleh web server.*

### C. Build Mode Server (Node SSR Runner)
Jika di masa depan menggunakan server Node.js:

```bash
# Build Staging
npm run build:stg

# Build Production
npm run build:prod
```

### D. Preview Hasil Build di Lokal
Untuk memverifikasi tampilan dan endpoint sebelum push/deploy:

```bash
# Preview hasil generate staging
npm --prefix frontend run preview:stg

# Preview hasil generate production
npm --prefix frontend run preview:prod
```
