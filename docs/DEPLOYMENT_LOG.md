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
| **DEP-008** | 2026-09-10 23:44 | **Firebase Hosting** | Frontend (Nuxt 3 SPA) | `54fe832` (`main`) | **91/91 PASS (100%)** | `https://gamification-dde4b.web.app` | 🟢 **SUCCESS** |
| **DEP-007** | 2026-09-10 18:50 | **Firebase Hosting** | Frontend (Nuxt 3 SPA) | `8339783` (`main`) | **86/86 PASS (100%)** | `https://gamification-dde4b.web.app` | 🟢 **SUCCESS** |
| **DEP-006** | 2026-09-09 14:20 | **Firebase Hosting** | Frontend (Nuxt 3 SPA) | `4b496e7` (`main`) | **86/86 PASS (100%)** | `https://gamification-dde4b.web.app` | 🟢 **SUCCESS** |
| **DEP-005** | 2026-09-07 17:44 | **Firebase Hosting** | Frontend (Nuxt 3 SPA) | `4b496e7` (`main`) | **86/86 PASS (100%)** | `https://gamification-dde4b.web.app` | 🟢 **SUCCESS** |
| **DEP-004** | 2026-09-07 14:15 | **VPS Dev Server** (`103.168.147.133`) | Frontend (Nuxt 3 SPA via Nginx) | `0c42431` (`main`) | **86/86 PASS (100%)** | `http://103.168.147.133:3006` | 🟢 **SUCCESS** |
| **DEP-003** | 2026-09-07 13:42 | **Firebase Hosting** | Frontend (Nuxt 3 SPA) | `2badd97` (`main`) | **86/86 PASS (100%)** | `https://gamification-dde4b.web.app` | 🟢 **SUCCESS** |
| **DEP-002** | 2026-09-05 12:53 | **VPS Dev Server** (`103.168.147.133`) | Frontend (Nuxt 3 SPA via Nginx) | `81b5963` (`stg-fe` & `main`) | **86/86 PASS (100%)** | `http://103.168.147.133:3006` | 🟢 **SUCCESS** |
| **DEP-001** | 2026-09-02 00:59 | **Firebase Hosting** | Frontend (Static SSR/SPA) | `20efaaf` (`main`) | **44/44 PASS (100%)** | `https://gamification-dde4b.web.app` | 🟢 **SUCCESS** |

---

## 📝 Rincian Log Tiap Deployment

### [DEP-008] — 2026-09-10 23:44 WIB
- **Pelaksana**: Antigravity Agent (atas perintah eksplisit user: *"depoy firebase"*)
- **Target Host**: Google Firebase Hosting (`gamification-dde4b`)
- **Komponen Di-Deploy**: 
  - Nuxt 3 Frontend SPA ter-generate ke static distribution (`.output/public`)
  - Target REST API: `https://cagelike-flukily-niels.ngrok-free.dev/api`
  - Mapping presisi response data JSON Rapor Buddy dari backend (`GET /evaluations/buddy-report/:userId`) ke modal petualangan
  - Penambahan visual podium Top 3 Klasemen Petualangan beserta kartu indikator peringkat posisi kru
  - Pembersihan tombol "Lihat Detail" pada kartu daftar misi modal petualangan mingguan
- **Branch & Commit**: `54fe832` di branch `main`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: `54/54 Tests PASS (100%)`
  - **QA Unit Tester Suite**: `37/37 Tests PASS (100%)`
  - **Total Pengujian**: `91/91 Tests PASS (0 Failed)`
- **Verifikasi Live Hosting Pasca Deploy**:
  - Hosting URL $\rightarrow$ **`https://gamification-dde4b.web.app`**
  - Status Distribusi $\rightarrow$ **200 OK / Live & Online**
  - Prerendered Routes: 32 routes
- **Status Akhir**: 🟢 **SUCCESS (BERHASIL 100%)**

### [DEP-007] — 2026-09-10 18:50 WIB
- **Pelaksana**: Antigravity Agent (atas perintah eksplisit user: *"deploy firebase"*)
- **Target Host**: Google Firebase Hosting (`gamification-dde4b`)
- **Komponen Di-Deploy**: 
  - Nuxt 3 Frontend SPA ter-generate ke static distribution (`.output/public`)
  - Target REST API: `https://cagelike-flukily-niels.ngrok-free.dev/api`
  - Perbaikan kalkulasi dinamis siklus minggu batch (Week 1 s/d 5+) pada selector & header
  - Filter real API khusus `type: 'JOURNEY'` pada katalog dan modal petualangan ekspedisi
  - Penghapusan 100% seluruh string & array fallback dummy (murni baca data database)
  - Sinkronisasi instan hasil approval District Manager ke kartu misi dan reward bintang
- **Branch & Commit**: `8339783` di branch `main`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: `49/49 Tests PASS (100%)`
  - **QA Unit Tester Suite**: `37/37 Tests PASS (100%)`
  - **Total Pengujian**: `86/86 Tests PASS (0 Failed)`
- **Verifikasi Live Hosting Pasca Deploy**:
  - Hosting URL $\rightarrow$ **`https://gamification-dde4b.web.app`**
  - Status Distribusi $\rightarrow$ **200 OK / Live & Online**

### [DEP-006] — 2026-09-09 14:20 WIB
- **Pelaksana**: Antigravity Agent (atas perintah eksplisit user: *"deploy ke firebase"*)
- **Target Host**: Google Firebase Hosting (`gamification-dde4b`)
- **Komponen Di-Deploy**: 
  - Nuxt 3 Frontend SPA ter-generate ke static distribution (`.output/public`)
  - Target REST API: `https://cagelike-flukily-niels.ngrok-free.dev/api`
  - Host dinamis pada login & preset cepat Ngrok di halaman settings
- **Branch & Commit**: `4b496e7` di branch `main`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: `49/49 Tests PASS (100%)`
  - **QA Unit Tester Suite**: `37/37 Tests PASS (100%)`
  - **Total Pengujian**: `86/86 Tests PASS (0 Failed)`
- **Verifikasi Live Hosting Pasca Deploy**:
  - Hosting URL $\rightarrow$ **`https://gamification-dde4b.web.app`**
  - Status Akses $\rightarrow$ `HTTP/2 200 OK`
  - Prerendered Routes: 32 routes
- **Status Akhir**: 🟢 **SUCCESS (BERHASIL 100%)**

---

### [DEP-005] — 2026-09-07 17:44 WIB
- **Pelaksana**: Antigravity Agent (atas perintah eksplisit user: *"https://cagelike-flukily-niels.ngrok-free.dev rubah env pake ini dulu lalu deploy ke firebase dulu jangan vps"*)
- **Target Host**: Google Firebase Hosting (`gamification-dde4b`)
- **Komponen Di-Deploy**: 
  - Switch REST API Base URL ke Ngrok Tunnel: `https://cagelike-flukily-niels.ngrok-free.dev/api`
  - Injeksi Business Parameter `MISSION_CATEGORY` & `BUDDY_CATEGORY` ke database backend Ngrok
  - Indikator koneksi API di halaman Login diset dinamis sesuai hostname backend yang aktif
  - Penambahan preset cepat Ngrok Dev di halaman Settings
- **Branch & Commit**: `4b496e7` di branch `main`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: `49/49 Tests PASS (100%)`
  - **QA Unit Tester Suite**: `37/37 Tests PASS (100%)`
  - **Total Pengujian**: `86/86 Tests PASS (0 Failed)`
- **Verifikasi Live Hosting Pasca Deploy**:
  - Hosting URL $\rightarrow$ **`https://gamification-dde4b.web.app`**
  - Prerendered Routes: 32 routes (100% OK)
  - Nuxt Client Runtime API Target $\rightarrow$ `https://cagelike-flukily-niels.ngrok-free.dev/api`
- **Status Akhir**: 🟢 **SUCCESS (BERHASIL 100%)**

---

### [DEP-004] — 2026-09-07 14:15 WIB
- **Pelaksana**: Antigravity Agent (atas perintah eksplisit user: *"deploy ke vps maksud saya sekarang deploy di vps jangan firebase. ikutin rule jangan ngerusak punya be dan servis project lainya cek dulu..."*)
- **Target Host**: VPS Linux Ubuntu 22.04 LTS (`103.168.147.133`)
- **Komponen Di-Deploy**: 
  - `gamification-frontend` (Container Docker: Nuxt 3 SPA + Nginx Alpine)
  - Integrasi dropdown Kategori SOP & Rapor Buddy ke REST API Bisnis Parameter (`/api/params`)
  - Konfigurasi Nginx `port_in_redirect off;` dan `absolute_redirect off;` untuk mengatasi port hilang saat redirect new tab
- **Branch & Commit**: `0c42431` di branch `main`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: `49/49 Tests PASS (100%)`
  - **QA Unit Tester Suite**: `37/37 Tests PASS (100%)`
  - **Total Pengujian**: `86/86 Tests PASS (0 Failed)`
- **Verifikasi Container & Port Pasca Deploy**:
  - `gamification-frontend` $\rightarrow$ Status: **Up / Running** pada port **`3006`** (`0.0.0.0:3006->80/tcp`)
  - `gamification-backend` $\rightarrow$ Status: **Up 2 days (Untouched / Tidak Disentuh)** pada port **`3005`**
  - Response `curl -I http://127.0.0.1:3006/` $\rightarrow$ **`HTTP/1.1 200 OK`**
  - Response `curl -I http://127.0.0.1:3006/admin` $\rightarrow$ **`Location: /admin/`** (Port 3006 tidak hilang)
- **Dampak ke Service Lain di VPS**:
  - Seluruh 20+ service ASCO (`asco_frontend`, `asco-sales-service`, `asco-postgres:5433`, `asco-rabbitmq`, dll) diverifikasi **100% aman, tidak disentuh, dan tetap berjalan normal**.
- **Status Akhir**: 🟢 **SUCCESS (BERHASIL 100%)**

---

### [DEP-003] — 2026-09-07 13:42 WIB
- **Pelaksana**: Antigravity Agent (atas perintah eksplisit user: *"push deploy"*)
- **Target Host**: Google Firebase Hosting
- **Komponen Di-Deploy**: 
  - Frontend Nuxt 3 SPA: Integrasi dropdown Kategori SOP (`EditTemplateModal.vue`, `CreateTemplateModal.vue`) dan Kategori Rapor Buddy (`BuddyTemplateModal.vue`) ke REST API Bisnis Parameter (`/api/params`).
- **Branch & Commit**: `2badd97` di branch `main`
- **Hasil Pengujian Unit Test Sebelum Deploy**:
  - **CRUD Test Suite**: `49/49 Tests PASS (100%)`
  - **QA Unit Tester Suite**: `37/37 Tests PASS (100%)`
  - **Total Pengujian**: `86/86 Tests PASS (0 Failed)`
- **Verifikasi Pasca Deploy**:
  - Prerendered 32 routes
  - Release status: **Complete / Finalized**
  - URL Akses Live: `https://gamification-dde4b.web.app`
- **Status Akhir**: 🟢 **SUCCESS (BERHASIL 100%)**

---

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
