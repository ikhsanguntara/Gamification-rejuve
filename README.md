# 🌿 Re.juve Gamification & Onboarding Platform (Monorepo)

Aplikasi Web Gamifikasi dan Manajemen Onboarding Kru Barista Re.juve Indonesia. Platform ini mengintegrasikan petualangan gamifikasi (Adventure Map RPG), evaluasi SOP harian oleh Store Leader (SL), persetujuan dan verifikasi nilai oleh Duty Manager (DM), evaluasi Buddy Pre-Batch 3 Hari, feedback onboarding kru, dan Master Data Gerai.

---

## 📁 Struktur Monorepo

```
rejuve-gamification/
├── frontend/                     # Nuxt.js 3 + Vue 3 + Tailwind CSS + Pinia
│   ├── components/               # Komponen UI (Adventure Map, Modals, Forms, dsb.)
│   ├── pages/                    # Halaman aplikasi (Journey, Evaluations, Approvals, Buddy, Feedback, Admin)
│   ├── stores/                   # State management Pinia (Auth, Missions, Evaluations, Approvals, Stores)
│   ├── composables/              # Helper & utilities composables
│   ├── mocks/                    # Mock data state & template
│   ├── public/                   # Asset statis, gambar lanskap petualangan, avatar
│   └── package.json              # Dependency frontend
├── backend/                      # Service Backend REST API (Node.js / Express / Go / dsb.)
│   └── README.md                 # Petunjuk pengembangan backend
├── docs/                         # Dokumentasi teknis & spesifikasi REST API
│   ├── backend_api_specification.md  # Spesifikasi 9 modul REST API JSON
│   └── *.docx                    # Dokumen alur & spesifikasi resmi
└── README.md                     # Dokumentasi utama proyek
```

---

## 🚀 Panduan Menjalankan Frontend

### 1. Masuk ke direktori frontend
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Jalankan development server
```bash
npm run dev
```
Akses di browser: `http://localhost:3000`

### 4. Build untuk produksi
```bash
npm run build
```

### 5. Deploy ke Firebase Hosting (Live Staging)
```bash
npm run deploy
```
Live URL: [https://gamification-dde4b.web.app](https://gamification-dde4b.web.app)

---

## 👥 Role Pengguna & Akses Halaman

| Role | Kredensial Demo | Akses Halaman |
|---|---|---|
| **CREW** | `budi@rejuve.co.id` / `crew123` | `/journey`, `/leaderboard`, `/profile`, `/feedback` |
| **STORE LEADER (SL)** | `sl.senayan@rejuve.co.id` / `sl123` | `/evaluations`, `/buddy`, `/dashboard` |
| **DUTY MANAGER (DM)** | `dm.jakarta@rejuve.co.id` / `dm123` | `/approvals`, `/dashboard`, `/admin/stores` |
| **ADMIN / HR** | `admin@rejuve.co.id` / `admin123` | `/admin/*`, `/admin/stores`, `/admin/missions` |

---

## 📖 Spesifikasi API Backend
Spesifikasi lengkap untuk tim Backend dapat dilihat di file:
👉 **[`docs/backend_api_specification.md`](./docs/backend_api_specification.md)**
