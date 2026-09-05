# Buku Log Deployment & Riwayat Rilis
## Re.juve Gamification Mission Management System

Dokumen ini mencatat seluruh riwayat deployment (Frontend & Backend), hasil verifikasi pengujian unit testing, serta Standar Operasional Prosedur (SOP) yang wajib dipatuhi sebelum dan sesudah eksekusi deployment.

---

## 📋 SOP Kebijakan Deployment (Strict Policy)

Setiap proses deployment **WAJIB** mengikuti tahapan berurutan berikut:

```text
1. Modifikasi Kode / Fitur
           ↓
2. Jalankan Unit Test Lokal (WAJIB 100% PASS):
   $ npm --prefix frontend run test
           ↓
3. Tunggu Perintah Eksplisit dari User ("deploy" / "push deploy")
           ↓
4. Eksekusi Deployer (VPS Docker Container / Firebase Hosting)
           ↓
5. Verifikasi Service (Healthcheck 200 OK & Port Listening)
           ↓
6. Catat Hasil Deployment ke Dokumen Log Ini (docs/DEPLOYMENT_LOG.md)
```

> [!IMPORTANT]
> **DILARANG KERAS** menjalankan deployer jika masih ada pengujian unit test yang gagal (FAIL) atau jika belum ada perintah eksplisit langsung dari user.

---

## 📊 Tabel Ringkasan Riwayat Deployment

| ID | Tanggal & Waktu (WIB) | Target Environment | Komponen | Commit Hash & Branch | Hasil Unit Test | Port / URL Akses | Status |
| :---: | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **DEP-002** | 2026-09-05 12:53 | **VPS Dev Server** (`103.168.147.133`) | Frontend (Nuxt 3 SPA via Nginx) | `81b5963` (`stg-fe` & `main`) | **86/86 PASS (100%)** | `http://103.168.147.133:3006` | 🟢 **SUCCESS** |
| **DEP-001** | 2026-09-02 00:59 | **Firebase Hosting** | Frontend (Static SSR/SPA) | `20efaaf` (`main`) | **44/44 PASS (100%)** | `https://gamification-dde4b.web.app` | 🟢 **SUCCESS** |

---

## 📝 Rincian Log Tiap Deployment

### [DEP-002] — 2026-09-05 12:53 WIB
- **Pelaksana**: Antigravity Agent (atas perintah eksplisit user: *"coba coba exsekusi sekarang buat deploy fenya rubah bse url apinya ke http://103.168.147.133:3005..."*)
- **Target Host**: VPS Linux Ubuntu 22.04 LTS (`103.168.147.133`)
- **Komponen Di-Deploy**: 
  - `gamification-frontend` (Container Docker: Nuxt 3 SPA + Nginx Alpine)
  - Penyelarasan API Base URL Frontend ke Backend port `3005` (`http://103.168.147.133:3005/api`)
- **Branch & Commit**: `81b5963` di branch `stg-fe` dan `main`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: `49/49 Tests PASS (100%)`
  - **QA Unit Tester Suite**: `37/37 Tests PASS (100%)`
  - **Total Pengujian**: `86/86 Tests PASS (0 Failed)`
- **Verifikasi Container & Port Pasca Deploy**:
  - `gamification-frontend` $\rightarrow$ Status: **Up / Running** pada port **`3006`** (`0.0.0.0:3006->80/tcp`)
  - `gamification-backend` $\rightarrow$ Status: **Up / Running** pada port **`3005`** (`0.0.0.0:3005->3005/tcp`)
  - Response `curl -I http://127.0.0.1:3006` $\rightarrow$ **`HTTP/1.1 200 OK`**
  - Response `curl http://127.0.0.1:3005/health` $\rightarrow$ **`HTTP/1.1 200 OK`**
- **Dampak ke Service Lain di VPS**:
  - Seluruh 20 container ASCO (`asco_frontend`, `asco-yarp-gateway`, `asco-postgres:5433`, `asco-keycloak:8080`, `asco-rabbitmq`, dll) diverifikasi **100% aman, tidak disentuh, dan tetap berjalan normal**.
- **Status Akhir**: 🟢 **SUCCESS (BERHASIL 100%)**

---

### [DEP-001] — 2026-09-02 00:59 WIB
- **Pelaksana**: Antigravity Agent (atas perintah eksplisit user: *"push deploy"*)
- **Target Host**: Google Firebase Hosting
- **Komponen Di-Deploy**: Frontend Nuxt 3 (World Map Adventure Journey & Multi-batch Crew Login)
- **Branch & Commit**: `20efaaf` di branch `main`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: `44/44 Tests PASS (100%)`
  - **Audit Halaman & Komponen**: `66/66 Checks PASS (100%)`
- **Verifikasi Pasca Deploy**:
  - Prerendered 254 routes
  - URL Akses Live: `https://gamification-dde4b.web.app`
- **Status Akhir**: 🟢 **SUCCESS (BERHASIL 100%)**

---

## 📌 Template Log untuk Deployment Berikutnya (Copy-Paste Ready)

```markdown
### [DEP-XXX] — YYYY-MM-DD HH:MM WIB
- **Pelaksana**: [Nama Pengembang / Agent] (Perintah user: "[Kutip perintah user]")
- **Target Host**: [VPS 103.168.147.133 / Firebase Hosting / Staging / Production]
- **Komponen Di-Deploy**: [Frontend / Backend / Fullstack]
- **Branch & Commit**: `[commit_hash]` di branch `[branch_name]`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: [XX/XX] Tests PASS
  - **QA Unit Tester Suite**: [XX/XX] Tests PASS
  - **Total**: [XX/XX] PASS (100%)
- **Verifikasi Pasca Deploy**:
  - URL Akses: [http://... / https://...]
  - Healthcheck / Response Code: [200 OK]
  - Isolasi Service Lain: [Terverifikasi aman / N/A]
- **Ringkasan Perubahan**:
  1. [Perubahan 1]
  2. [Perubahan 2]
- **Status Akhir**: 🟢 SUCCESS / 🔴 FAILED
```
