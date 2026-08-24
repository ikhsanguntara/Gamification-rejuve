# Coding Rules & Sequential Guidelines: Gamification Mission Management System

Dokumen ini adalah **aturan kerja resmi dan pedoman teknis** untuk membangun dan memelihara Frontend Gamification Mission Management System (Nuxt 4 + Vue 3 + JavaScript).

---

## 📌 PART A — CODING RULES

### RULE 00 — MANDATORY DOCUMENTATION & RULE CHECK BEFORE ANY TASK / UPDATE
**Sebelum mengerjakan task baru, perbaikan bug, refactor, atau penambahan fitur apa pun, WAJIB membaca dan meninjau seluruh dokumen panduan terlebih dahulu:**
- [`docs/RULES.md`](file:///Users/ikhsan/Documents/dev/Gamification/docs/RULES.md)
- [`docs/IMPLEMENTATION_PLAN.md`](file:///Users/ikhsan/Documents/dev/Gamification/docs/IMPLEMENTATION_PLAN.md)
- [`docs/WALKTHROUGH.md`](file:///Users/ikhsan/Documents/dev/Gamification/docs/WALKTHROUGH.md)

Tujuannya agar setiap pembaruan:
1. Tidak keluar dari jalur arsitektur (*Pure JavaScript, Nuxt 4, Pinia, Zero Backend/API, No TypeScript*).
2. Tidak merusak flow gamifikasi (*⭐ Star, Week Lock, Approve/Revise*).
3. Tidak menduplikasi atau menimpa fitur yang sudah berjalan dengan benar.

### RULE 01 — FOLLOW THE TASK ORDER
**WAJIB mengerjakan task sesuai urutan.**
Urutan kerja tidak boleh melompat:
```text
Foundation → Mock Data → Utilities → Pinia Stores → Layout → Shared Components → Dashboard → Batch → Mission → Supervisor Evaluation → Head Approval → Revision → Star Gamification → Leaderboard → Achievement → Responsive → Animation → Polishing → Final QA
```

### RULE 02 — JAVASCRIPT ONLY
**DILARANG menggunakan TypeScript.**
- Gunakan ekstensi `.js` dan `.vue`.
- Jangan membuat file `.ts`, `.d.ts`, atau menggunakan syntax `interface`, `type`, `enum`, atau generic type.
- Semua state, logika store, utilitas, dan composables harus ditulis dalam JavaScript murni.

### RULE 03 — FRONTEND ONLY
- Jangan membuat Backend, Database, REST API, GraphQL, atau otentikasi server.
- Semua persistensi dan reaktivitas menggunakan:
  ```text
  Mock Data + Pinia Store + Local State
  ```
- Seluruh interaksi harus langsung mengubah state aplikasi secara realtime tanpa reload halaman.

### RULE 04 — MOCK DATA MUST BE SEPARATE
- Dilarang keras menaruh mock data langsung di dalam template atau komponen.
- Semua data mock wajib berada di direktori `/mocks/` (misal: `mocks/crews.js`, `mocks/batches.js`).
- Pinia store mengonsumsi mock data tersebut sebagai initial state.

### RULE 05 — BUSINESS LOGIC MUST BE SEPARATE
- Dilarang menaruh logika bisnis kompleks di dalam template komponen.
- Gunakan fungsi utilitas terisolasi di `/utils/` (misal: `utils/star.js`, `utils/mission.js`, `utils/status.js`).

### RULE 06 — PINIA IS THE SOURCE OF TRUTH
- State global utama harus dikelola secara reaktif oleh Pinia store (`batch.js`, `mission.js`, `evaluation.js`, `approval.js`, `gamification.js`, `user.js`).
- Jangan membuat duplikasi global state di komponen lokal.

### RULE 07 — COMPONENT REUSABILITY & NO GIANT COMPONENTS
- Setiap elemen UI yang dipakai berulang harus dijadikan komponen terpisah (`MissionCard.vue`, `StatCard.vue`, `StarReward.vue`, `WeekSelector.vue`, dll).
- Hindari komponen raksasa (giant `.vue` file dengan 1000+ baris). Pecah menjadi sub-komponen terstruktur.

### RULE 08 — DESIGN SYSTEM CONSISTENCY
- Desain mengusung konsep: **Modern Enterprise SaaS + Gamification**.
- Konsistensi dalam border radius (`rounded-2xl`, `rounded-xl`), palet warna (slate/zinc neutral, star amber gold `#f59e0b`, emerald `#10b981`, rose `#f43f5e`), dan tipografi.

### RULE 09 — ICONS VIA LUCIDE
- Gunakan **Lucide Icons** (`lucide-vue-next`).
- Dilarang menggunakan emoji sebagai icon antarmuka (UI) utama.
- Karakter ⭐ diperbolehkan hanya sebagai visual aksen gamifikasi bintang.

### RULE 10 — ⭐ STAR, NOT XP
- Sistem gamifikasi **hanya menggunakan Star** (`Stars`, `Total Stars`, `Star Reward`, `Star Level`, `Star Progress`, `Star Ranking`).
- **DILARANG MENGGUNAKAN ISTILAH XP ATAU EXPERIENCE POINT**.

### RULE 11 — APPROVE / REVISE DECISION RULE
- Head **HANYA** memiliki 2 opsi keputusan:
  1. **APPROVE**: Misi selesai, bintang resmi di-award ke Crew.
  2. **REVISE**: Evaluasi dikembalikan ke Supervisor untuk diperbaiki. Wajib menyertakan *Revision Note*.
- **TIDAK ADA OPSI REJECT / REJECTED**.

### RULE 12 — STAR AWARD TIMING
- Skor yang diinput Supervisor (0-100) hanya menghasilkan **Calculated Star Reward**.
- Bintang baru **resmi ditambahkan** ke profil Crew dan Leaderboard ketika Head menekan tombol **APPROVE**.

### RULE 13 — WEEK LOCKING & BATCH ISOLATION SYSTEM
- Batch mewakili **Cabang Gerai Re.juve** dengan ukuran realistis **5 - 6 Crew Anggota** (maksimal 10 crew per batch):
  - **Batch Alpha**: Re.juve Grand Indonesia (6 Crew)
  - **Batch Beta**: Re.juve Senayan City (5 Crew)
  - **Batch Gamma**: Re.juve Pondok Indah Mall (5 Crew)
- Setiap Batch terdiri dari 3 Minggu (Week 1, Week 2, Week 3).
- **Hanya Current Week yang ACTIVE dan dapat diedit oleh Supervisor**.
- Week lampau dan week mendatang berstatus **LOCKED** (*Read-only*). Data tetap dapat dilihat dan direview, namun form evaluasi berstatus disabled dengan banner informatif.

### RULE 14 — REVISION WORKFLOW
- Jika Head memilih Revise $\rightarrow$ Status berubah menjadi `REVISION_REQUIRED`.
- Supervisor dapat mengedit skor, bukti foto, dan komentar, kemudian menekan "Resubmit for Head Review".
- Status kembali menjadi `PENDING_REVIEW` untuk ditinjau kembali oleh Head.

### RULE 15 — REALTIME REACTIVITY WITHOUT REFRESH
- Setiap aksi (Approve, Revise, Submit, Role Switch) harus langsung memperbarui UI, Counter Bintang, Level, dan Leaderboard secara otomatis melalui Pinia tanpa page reload.

---

## 🎯 STAR CALCULATION SPECIFICATION
```text
Score 90 - 100 → ⭐⭐⭐⭐⭐ (5 Stars)
Score 80 - 89  → ⭐⭐⭐⭐ (4 Stars)
Score 70 - 79  → ⭐⭐⭐ (3 Stars)
Score 60 - 69  → ⭐⭐ (2 Stars)
Score 0 - 59   → ⭐ (1 Star)
```

## 🏆 STAR LEVEL THRESHOLDS
```text
Level 1  → 0 Stars (Novice Crew)
Level 2  → 100 Stars (Apprentice Specialist)
Level 3  → 250 Stars (Field Operator)
Level 4  → 500 Stars (Senior Operator)
Level 5  → 800 Stars (Rising Star)
Level 6  → 1,200 Stars (Master Specialist)
Level 7  → 1,500 Stars (Elite Inspector)
Level 8  → 2,000 Stars (Operations Veteran)
Level 9  → 2,500 Stars (Grandmaster)
Level 10 → 3,500 Stars (Star Legend)
```
