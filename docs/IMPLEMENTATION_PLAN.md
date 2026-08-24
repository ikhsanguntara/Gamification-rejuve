# Implementation Plan & Sequential Task List: Gamification Mission Management System

Dokumen ini memuat arsitektur teknis, struktur direktori, serta daftar tugas berurutan (*sequential task list*) dari **Phase 0** sampai **Phase 22** untuk membangun dan memperbarui **Frontend Gamification Mission Management System** menggunakan **Nuxt 4 + Vue 3 + JavaScript**.

---

## 🛠️ Arsitektur & Struktur Direktori

```text
Gamification/
├── assets/
│   └── css/
│       └── main.css                  # Tailwind directives, custom scrollbar, animations
├── components/
│   ├── layout/
│   │   ├── AppSidebar.vue            # Role-aware sidebar navigation
│   │   ├── AppHeader.vue             # Header: Batch info, role switcher, theme toggle, notifications
│   │   └── MobileNavigation.vue      # Bottom navigation for mobile screens
│   ├── dashboard/
│   │   ├── StatCard.vue              # Metric stat card with hover effect
│   │   └── RecentActivity.vue        # Feed of latest evaluations and approvals
│   ├── mission/
│   │   ├── MissionCard.vue           # Grid/list mission card with status badge
│   │   ├── MissionStatus.vue         # Status badge pill (Active, Draft, Pending, Approved, etc.)
│   │   ├── MissionTimeline.vue       # Interactive audit trail / step progress
│   │   └── MissionEvaluationForm.vue # Score slider, Star calculator, evidence, comments
│   ├── batch/
│   │   ├── BatchCard.vue             # Batch summary card with progress indicator
│   │   ├── WeekSelector.vue          # Week 1, 2, 3 selector with lock/active state
│   │   └── CrewList.vue              # 20 Crew roster with star & level indicators
│   ├── gamification/
│   │   ├── StarReward.vue            # Dynamic 1-5 star display with glow/animation
│   │   ├── StarProgress.vue          # Progress bar towards next star level
│   │   ├── AchievementCard.vue       # Locked/unlocked card with progress bar
│   │   └── LeaderboardTable.vue      # Top 3 podium + ranked table with realtime stars
│   ├── approval/
│   │   ├── ApprovalCard.vue          # Evaluation review card for Head
│   │   ├── ApprovalModal.vue         # Confirmation modal to approve and award stars
│   │   └── RevisionModal.vue         # Modal requiring revision notes
│   └── ui/
│       ├── BaseModal.vue             # Reusable accessible modal dialog
│       ├── ConfirmationModal.vue     # Reusable confirm dialog
│       ├── ToastContainer.vue        # Toast notification system
│       ├── SkeletonCard.vue          # Skeleton loading states
│       └── EmptyState.vue            # Reusable empty state with icon & description
├── composables/
│   ├── useToast.js                   # Toast notification composable
│   ├── useTheme.js                   # Light/Dark/System mode switcher
│   └── useConfetti.js                # Star burst celebration animation
├── layouts/
│   └── default.vue                   # Application shell (Sidebar + Header + Content + MobileNav + Toasts)
├── mocks/
│   ├── batches.js                    # 3 Batches with weekly schedules
│   ├── crews.js                      # 20 Crews per active batch with initial stars/levels
│   ├── missions.js                   # Multiple missions across Weeks 1, 2, 3
│   ├── evaluations.js                # Initial evaluations across different states
│   ├── approvals.js                  # Initial approval queue data
│   ├── achievements.js               # 10 comprehensive gamification achievements
│   └── leaderboard.js                # Pre-calculated leaderboard seed
├── pages/
│   ├── index.vue                     # Redirects to /dashboard
│   ├── dashboard.vue                 # Overview dashboard with stats, weekly progression, and activity
│   ├── batches/
│   │   ├── index.vue                 # Batch list view
│   │   └── [id].vue                  # Batch detail: overview, 3-week selector, and 20 crew roster
│   ├── missions/
│   │   ├── index.vue                 # Filterable missions grid (by week, status, crew, score)
│   │   └── [id].vue                  # Mission detail with full evaluation & timeline history
│   ├── evaluations.vue               # Supervisor evaluation workstation
│   ├── approvals.vue                 # Head approval workspace (Pending, Approved, Revision Required)
│   ├── leaderboard.vue               # Gamification leaderboard with podium & filters
│   ├── achievements.vue              # Gamification achievements gallery
│   ├── profile.vue                   # User profile & star achievements summary
│   └── settings.vue                  # Preferences & demo controls (reset state, config week locks)
├── stores/
│   ├── user.js                       # Current simulated user, active role (Crew/Supervisor/Head)
│   ├── batch.js                      # Batches state, current active batch, selected week
│   ├── mission.js                    # Missions state, week filtering, status updates
│   ├── evaluation.js                 # Evaluations state, drafts, evidence, comments
│   ├── approval.js                   # Approval queue, approve action, revision request with notes
│   └── gamification.js               # Crew stars, dynamic level recalculation, leaderboard, achievements
├── utils/
│   ├── star.js                       # Star score mapping, level thresholds
│   ├── mission.js                    # Mission status labels, badge color mappings, completion calculations
│   ├── status.js                     # Week locking logic (current = active, past/future = locked)
│   └── date.js                       # Formatted dates
├── app.vue                           # Nuxt root component with layout integration
├── nuxt.config.js                    # Nuxt 4 config with Tailwind, Pinia, Lucide icons
├── package.json                      # Pure JS dependencies
└── tailwind.config.js                # Custom palette, star amber, dark mode, animations
```

---

## 🚀 Sequential Task Progress & Checklist

### Phase 0 — Project Foundation
- [x] **TASK 0.1**: Inisialisasi project Nuxt 4 (JavaScript only), instalasi Tailwind CSS, `@pinia/nuxt`, `lucide-vue-next`, `@vueuse/core`, `canvas-confetti`.
- [x] **TASK 0.2**: Konfigurasi global styling (`assets/css/main.css`), setup Tailwind tema (warna amber/gold untuk Star, dark mode class, rounded cards, subtle shadows).
- [x] **TASK 0.3**: Pembuatan struktur folder lengkap (`components/`, `pages/`, `layouts/`, `stores/`, `mocks/`, `utils/`, `composables/`).

### Phase 1 — Mock Data Architecture
- [x] **TASK 1.1**: Buat `mocks/batches.js` (minimal 3 batch realistis, status, date range, current week).
- [x] **TASK 1.2**: Buat `mocks/crews.js` (20 crew lengkap dengan nama, avatar, batchId, initial stars, and level).
- [x] **TASK 1.3**: Buat `mocks/missions.js` (kumpulan mission untuk Week 1, Week 2, Week 3 dengan status beragam).
- [x] **TASK 1.4**: Buat `mocks/evaluations.js` (data evaluasi awal dengan score, evidence mock images, supervisor comments).
- [x] **TASK 1.5**: Buat `mocks/approvals.js` (item pending review, approved, dan revision required).
- [x] **TASK 1.6**: Buat `mocks/achievements.js` (10 achievement gamifikasi dengan kriteria unlock dan icon).
- [x] **TASK 1.7**: Buat `mocks/leaderboard.js` (daftar ranking crew berdasarkan total stars).

### Phase 2 — Utility Functions
- [x] **TASK 2.1**: Buat `utils/star.js` (`calculateStars`, `calculateStarLevel`, `getNextStarLevel`, `getStarProgress`).
- [x] **TASK 2.2**: Buat `utils/mission.js` (`getMissionStatusMeta`, `calculateBatchCompletion`).
- [x] **TASK 2.3**: Buat `utils/status.js` (`isWeekLocked`, `isCurrentWeek`, `isFutureWeek`).
- [x] **TASK 2.4**: Buat `utils/date.js` (formatter tanggal standar).

### Phase 3 — Reactive Pinia Stores
- [x] **TASK 3.1**: Buat `stores/user.js` (manajemen role simulator `Crew`, `Supervisor`, `Head` dan profil aktif).
- [x] **TASK 3.2**: Buat `stores/batch.js` (daftar batch, batch aktif, selector week, metrik agregasi).
- [x] **TASK 3.3**: Buat `stores/mission.js` (filtering mission per week/status, update status).
- [x] **TASK 3.4**: Buat `stores/evaluation.js` (save draft, update score/evidence/comment, validation).
- [x] **TASK 3.5**: Buat `stores/approval.js` (approve mission, request revision dengan note, resubmit evaluation).
- [x] **TASK 3.6**: Buat `stores/gamification.js` (award stars ke crew, recalculate level, sync leaderboard, trigger achievement unlock).

### Phase 4 — Application Shell & Navigation
- [x] **TASK 4.1**: Buat `layouts/default.vue` dengan layout responsif (Desktop sidebar + Header + Content container).
- [x] **TASK 4.2**: Buat `components/layout/AppSidebar.vue` (navigasi dinamis menyesuaikan role aktif).
- [x] **TASK 4.3**: Buat `components/layout/AppHeader.vue` (role switcher dropdown, batch selector, dark mode toggle, notifications bell).
- [x] **TASK 4.4**: Buat `components/layout/MobileNavigation.vue` (bottom navigation bar untuk mobile).

### Phase 5 — Shared & UI Components
- [x] **TASK 5.1**: Buat `components/dashboard/StatCard.vue` (kartu metrik dengan trend dan icon).
- [x] **TASK 5.2**: Buat `components/batch/WeekSelector.vue` (interactive weekly progression: Active, Completed, Locked).
- [x] **TASK 5.3**: Buat `components/gamification/StarReward.vue` (visualisasi 1-5 bintang interaktif dan animasi glow).
- [x] **TASK 5.4**: Buat `components/gamification/StarProgress.vue` (progress bar level dan sisa bintang ke level berikutnya).
- [x] **TASK 5.5**: Buat `components/mission/MissionStatus.vue` (badge pill status dengan warna & icon sesuai standar).
- [x] **TASK 5.6**: Buat `components/mission/MissionCard.vue` (kartu mission dengan info crew, deadline, score, dan star reward).
- [x] **TASK 5.7**: Buat komponen modal & feedback: `BaseModal.vue`, `ConfirmationModal.vue`, `ToastContainer.vue`, `SkeletonCard.vue`, `EmptyState.vue`.

### Phase 6 — Dashboard Implementation
- [x] **TASK 6.1**: Buat `pages/dashboard.vue` dan setup layout dashboard utama.
- [x] **TASK 6.2**: Implementasikan komponen statistik dashboard: Total Crew (20), Missions Completed, Average Score, Pending Reviews, Total Stars.
- [x] **TASK 6.3**: Implementasikan weekly progress visualizer, preview leaderboard top 3, dan recent activities feed yang responsif terhadap role aktif.

### Phase 7 — Batch Management Page
- [x] **TASK 7.1**: Buat `pages/batches/index.vue` dengan daftar batch dalam grid cards.
- [x] **TASK 7.2**: Buat `components/batch/BatchCard.vue` dengan progress bar, average score, dan total star counter.
- [x] **TASK 7.3**: Buat `pages/batches/[id].vue` (Detail batch).
- [x] **TASK 7.4**: Implementasikan Batch Overview: 3-Week Interactive Selector + 20 Crew Performance Roster lengkap dengan stars, level, dan status evaluasi.

### Phase 8 — Mission Management Page
- [x] **TASK 8.1**: Buat `pages/missions/index.vue` untuk katalog misi.
- [x] **TASK 8.2**: Implementasikan filtering canggih (Search, Filter by Week 1/2/3, Filter by Status, Filter by Crew).
- [x] **TASK 8.3**: Buat `pages/missions/[id].vue` (Detail misi).
- [x] **TASK 8.4**: Implementasikan tab informasi misi, kartu crew, detail evaluasi supervisor, feedback head, dan interactive audit timeline.

### Phase 9 — Supervisor Evaluation Workspace
- [x] **TASK 9.1**: Buat `pages/evaluations.vue` (Daftar antrian evaluasi untuk Supervisor).
- [x] **TASK 9.2**: Buat `components/mission/MissionEvaluationForm.vue`.
- [x] **TASK 9.3**: Implementasikan slider score, input evidence (mock image selector/uploader), dan textarea komentar.
- [x] **TASK 9.4**: Implementasikan kalkulasi bintang realtime saat slider score digeser.
- [x] **TASK 9.5**: Implementasikan aksi "Save Draft" dan "Submit for Head Review" dengan modal konfirmasi.

### Phase 10 — Head Approval Workspace
- [x] **TASK 10.1**: Buat `pages/approvals.vue` dengan 3 Tab: *Pending Review*, *Approved*, *Revision Required*.
- [x] **TASK 10.2**: Buat `components/approval/ApprovalCard.vue` menampilkan data evaluasi, evidence preview, dan komentar supervisor.
- [x] **TASK 10.3**: Implementasikan aksi review: Tombol **Approve** (membuka `ApprovalModal`) dan **Request Revision** (membuka `RevisionModal`).

### Phase 11 — Revision Workflow & History
- [x] **TASK 11.1**: Buat `components/approval/RevisionModal.vue` dengan validasi textarea *Revision Note*.
- [x] **TASK 11.2**: Update state menjadi `REVISION_REQUIRED` dan catat riwayat revisi (*Revision History*).
- [x] **TASK 11.3**: Tampilkan banner *Revision Required* pada view Supervisor beserta pesan catatan dari Head.
- [x] **TASK 11.4**: Supervisor mengedit evaluasi dan menekan tombol "Resubmit for Head Review".
- [x] **TASK 11.5**: Riwayat revisi ter-update (*Resolved ✓*) dan evaluasi kembali ke tab *Pending Review*.

### Phase 12 — Star Gamification System
- [x] **TASK 12.1**: Implementasi eksekusi reward bintang saat Head Approve (menambah Total Stars crew).
- [x] **TASK 12.2**: Implementasi kalkulasi Star Level (Level 1 hingga Level 10) secara otomatis.
- [x] **TASK 12.3**: Animasi Star burst perolehan bintang (`+5 Stars Awarded!`) menggunakan partikel confetti dan number counting.
- [x] **TASK 12.4**: Animasi notifikasi "Level Up!" saat bintang mencapai ambang level baru.

### Phase 13 — Leaderboard Page
- [x] **TASK 13.1**: Buat `pages/leaderboard.vue`.
- [x] **TASK 13.2**: Implementasikan Top 3 Podium visual (Gold, Silver, Bronze dengan avatar besar, level, dan stars) + Ranked Table untuk posisi 4-20.
- [x] **TASK 13.3**: Pastikan ranking dan total stars ter-update secara live/reactive saat approval terjadi di background store.

### Phase 14 — Achievements Gallery
- [x] **TASK 14.1**: Buat `pages/achievements.vue`.
- [x] **TASK 14.2**: Implementasikan kartu achievement dengan state Locked (dengan progress bar x/y) dan Unlocked (badge emas/hijau).
- [x] **TASK 14.3**: Logic evaluasi unlock otomatis (e.g. *Perfect Score*, *Mission Master*, *Star Collector*) dan trigger toast notifikasi pencapaian baru.

### Phase 15 — Role Simulation & Permissions
- [x] **TASK 15.1**: Pengujian Role **Crew** (melihat misi, leaderboard, profil, achievement; tombol evaluasi & approval tidak tersedia).
- [x] **TASK 15.2**: Pengujian Role **Supervisor** (dapat mengakses form evaluasi, draft, submit, perbaikan revisi, resubmit).
- [x] **TASK 15.3**: Pengujian Role **Head** (dapat mengakses approvals, tombol Approve dan Request Revision).

### Phase 16 — Weekly Lock Enforcement
- [x] **TASK 16.1**: Verifikasi Week Aktif (Current Week) dapat diedit oleh Supervisor.
- [x] **TASK 16.2**: Verifikasi Week Lampau (Previous Week) terkunci dengan banner *Week Locked* dan form disabled.
- [x] **TASK 16.3**: Verifikasi Week Mendatang (Future Week) terkunci.
- [x] **TASK 16.4**: Data pada locked week tetap dapat dibuka dan dilihat (*Read-only*).

### Phase 17 — Interactive Micro-Animations
- [x] **TASK 17.1**: Page transition halus pada route Nuxt.
- [x] **TASK 17.2**: Card hover lift dan border glow effect.
- [x] **TASK 17.3**: Smooth slider transitions dan dynamic star scaling.
- [x] **TASK 17.4**: Modal open/close fade & scale backdrop blur.

### Phase 18 — Responsive Layout QA
- [x] **TASK 18.1**: Desktop layout (1440px+).
- [x] **TASK 18.2**: Laptop layout (1024px - 1366px).
- [x] **TASK 18.3**: Tablet layout (768px - 1023px).
- [x] **TASK 18.4**: Mobile layout (<768px, navigasi bottom bar, responsive card view).

### Phase 19 — Dark Mode Support
- [x] **TASK 19.1**: Styling tema Light (clean SaaS aesthetic).
- [x] **TASK 19.2**: Styling tema Dark (slate/zinc background dengan neon star accent).
- [x] **TASK 19.3**: Theme persistence di `localStorage` dengan pilihan Light / Dark / System.

### Phase 20 — UX Polish & State Handling
- [x] **TASK 20.1**: Skeleton loading pada tabel dan cards saat berpindah filter/week.
- [x] **TASK 20.2**: Empty states informatif di setiap list/tab jika data kosong.
- [x] **TASK 20.3**: Toast notification komprehensif untuk setiap aksi interaktif pengguna.

### Phase 21 — Complete End-to-End Flow Demo Verification
- [x] **TASK 21.1**: Verifikasi alur lengkap: Supervisor evaluasi -> Submit -> Switch Head -> Revise -> Switch Supervisor -> Edit & Resubmit -> Switch Head -> Approve -> Star bertambah -> Level up -> Leaderboard naik -> Toast & Confetti -> Dashboard terupdate.

### Phase 22 — Final Code Cleanliness & Quality
- [x] **TASK 22.1**: Audit bebas TypeScript (pastikan tidak ada file `.ts`, `interface`, `type`, atau syntax TS).
- [x] **TASK 22.2**: Audit console error dan broken links.
- [x] **TASK 22.3**: Verifikasi kesesuaian checklist handoff dan test-case checklist.
