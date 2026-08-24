# 🎮 Gamification Mission Management System

> **Frontend-Only Prototype**: Nuxt 4 + Vue 3 + Tailwind CSS + Pinia + Pure JavaScript

Sistem pengelolaan **Batch (20 Crew), Siklus 3-Minggu, Evaluasi Supervisor, Head Review (Approve / Revise), Gamifikasi Bintang (⭐ Stars & Levels 1-10), Realtime Leaderboard, dan Badges Achievement**.

---

## 📚 Dokumentasi & Aturan Project (Project Docs)

Seluruh aturan kerja, arsitektur data, dan rencana implementasi didokumentasikan secara persisten di folder [`docs/`](file:///Users/ikhsan/Documents/dev/Gamification/docs):

1. 📜 **[docs/RULES.md](file:///Users/ikhsan/Documents/dev/Gamification/docs/RULES.md)**
   - Aturan teknis wajib (*Strict JavaScript, Pure Frontend, Zero TypeScript, No Backend/API*).
   - Rumus kalkulasi bintang (*Score to Stars*), level progression (*Level 1 - 10*), dan aturan keputusan Head (*Approve / Revise*).
2. 📋 **[docs/IMPLEMENTATION_PLAN.md](file:///Users/ikhsan/Documents/dev/Gamification/docs/IMPLEMENTATION_PLAN.md)**
   - Struktur direktori modular dan daftar checklist implementasi 22 Fase (Phase 0 hingga Phase 22).
3. 🚀 **[docs/WALKTHROUGH.md](file:///Users/ikhsan/Documents/dev/Gamification/docs/WALKTHROUGH.md)**
   - Panduan modul lengkap dan 5 skenario pengujian alur interaktif (*End-to-End Demo Flow*).

---

## ⚡ Quick Start

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan Development Server
```bash
npm run dev
```
Buka browser di: `http://localhost:3000`

### 3. Build & Preview Produksi
```bash
npm run build
npm run preview
```

---

## 🎭 Simulasi Role (Tanpa Otentikasi Server)
Gunakan role switcher di header atau halaman `/settings` untuk beralih instan:
- **👤 Crew (Andi Pratama)**: Meninjau misi, level bintang, leaderboard, dan badges (Read-Only).
- **📋 Supervisor (Budi Santoso)**: Input nilai (0-100), kalkulasi bintang instan, unggah bukti gambar, simpan draft, kirim ke review, dan perbaikan revisi.
- **🛡️ Head (Ahmad Dahlan)**: Mengambil keputusan **Approve** (resmi memberikan bintang) atau **Request Revision** (wajib menyertakan catatan revisi).
