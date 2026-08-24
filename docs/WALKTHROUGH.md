# Walkthrough & Feature Guide: Re.juve Indonesia Gamification System

Dokumen ini memuat panduan lengkap fitur, antarmuka pengguna bertema **Re.juve Indonesia (True Cold-Pressed)**, arsitektur data, serta skenario pengujian end-to-end.

---

## 🍃 Re.juve Indonesia Brand & Visual Identity
- **Palet Warna Signature**:
  - `rejuve-blue` (`#499ec7`): Primary CTA, status aktif, gradient aksen Re.juve.
  - `rejuve-berry` (`#963189`): Quality & HACCP distinction, persona Head.
  - `rejuve-green` (`#16a34a`): Kesegaran cold-pressed, status completed.
  - `rejuve-orange` & `star-gold` (`#f59e0b` / `#fbbf24`): Gamifikasi ⭐ Bintang dan partikel confetti.
- **Optimasi Mode HP (Smartphone Responsive Experience)**:
  - **Floating Dock Bottom Navigation**: Menu bawah bergaya aplikasi native iOS/Android dengan safe-area padding dan active indicator.
  - **Header Ringkas & Dropdown Cepat**: Navigasi ganti gerai batch tanpa terpotong di layar kecil.
  - **Multi-Crew Touch Sliders**: Slider nilai dan tombol bulk helper berukuran optimal untuk sentuhan jari di smartphone.
- **Konteks Operasional**: Standard operating procedure (SOP) gerai Re.juve, Cold Chain 2-4°C, sanitasi bar, dan audit kualitas cold-pressed.

---

## 🌟 Fitur Utama & Panduan Modul

### 0. Authentication & Role Login (`/login`)
- **Login Persona Cards**: Pilihan login instan untuk 3 persona:
  - 👤 **Crew Member**: Andi Pratama (`andi.pratama@enterprise.com`)
  - 📋 **Supervisor**: Budi Santoso (`budi.santoso@enterprise.com`)
  - 🛡️ **Division Head**: Ahmad Dahlan (`ahmad.dahlan@enterprise.com`)
- **Sesi Otentikasi**: Menyimpan status login dan role persona di `localStorage`, kemudian membaca role yang bersangkutan saat masuk ke aplikasi.
- **Sign Out**: Tombol logout di header dan sidebar yang membersihkan sesi dan mengarahkan kembali ke `/login`.

### 1. Dashboard (`/dashboard`)
- **Top Greeting & Role Context**: Banner ucapan selamat datang yang beradaptasi dengan peran pengguna aktif (Crew, Supervisor, Head).
- **5 Metrik KPI Utama**: Total Crew (20), Missions Completed, Average Score (%), Pending Reviews, dan Total Stars (⭐).
- **Weekly Progression Stepper**: Menampilkan status 3 minggu (Active, Completed, Locked) dengan progress bar dan indikator tanggal.
- **Star Level Progress Bar**: Menampilkan status level (Level 1 - 10), bintang terkumpul, dan sisa bintang untuk mencapai level berikutnya.
- **Top 3 Star Performers**: Mini-podium menampilkan 3 crew teratas.
- **Recent Activity Feed**: Stream aktivitas penilaian, revisi, dan approval terkini.

### 2. Batch Management (`/batches` & `/batches/[id]`)
- **Katalog Batch**: Menampilkan Batch Alpha, Batch Beta, dan Batch Gamma.
- **Detail Batch**: Informasi siklus 3-mingguan, ringkasan skor rata-rata, dan daftar lengkap **20 Crew Roster** beserta level dan perolehan bintangnya.

### 3. Mission Catalog & Detail (`/missions` & `/missions/[id]`)
- **Pencarian & Filter Multi-Kriteria**: Filter berdasarkan Minggu (1, 2, 3), Status Misi, dan Kategori operasional.
- **Detail Misi Lengkap**: Menampilkan spesifikasi kebutuhan, kartu crew yang ditugaskan, detail evaluasi supervisor, feedback revisi Head, serta **Audit Lifecycle Timeline**.

### 4. Supervisor Evaluation Workstation (`/evaluations`)
- **Store-Wide Multi-Crew Missions**: Setiap misi gerai mingguan (seperti *Audit Suhu Chiller 2-4°C*, *Sanitasi Mesin Cold-Pressed*, *Uji Brix Buah Segar*) berlaku dan ditugaskan ke **SELURUH Crew** di batch gerai tersebut.
- **Roster Penilaian Seluruh Crew**: Supervisor memilih misi gerai, lalu langsung dapat mengatur skor individual untuk setiap crew (slider 0-100 & realtime kalkulasi 1-5 ⭐ per crew).
- **Quick Bulk Scoring**: Fitur tombol cepat (*Set All to 95*, *Set All to 90*, *Set All to 85*) untuk mempermudah evaluasi bersama.
- **Lampiran Bukti Mock & Catatan**: Galeri foto inspeksi gerai dan catatan temuan supervisor.
- **Simpan Draft & Submit**: Opsi simpan draft multi-crew (`DRAFT`) atau kirim ke antrian Head Review (`PENDING_REVIEW`).

### 5. Head Review & Approvals Workspace (`/approvals`)
- **Review Evaluasi Gerai Multi-Crew**: Head memeriksa ringkasan skor seluruh crew yang terlibat dalam misi.
- **2 Aksi Tegas**: Hanya tombol **APPROVE** atau **REQUEST REVISION** (tanpa opsi Reject).
- **Pembagian Bintang Otomatis ke Seluruh Crew**: Saat Head menekan **Approve**, sistem secara instan mengkreditkan ⭐ Bintang ke seluruh akun profil Crew yang dinilai, memicu animasi confetti star burst, pembaruan level otomatis, dan pembaruan peringkat Leaderboard secara realtime.me.
  - **Request Revision**: Wajib mengisi *Revision Note* $\rightarrow$ Evaluasi berpindah ke tab *Revision Required* $\rightarrow$ Supervisor menerima instruksi perbaikan.
  - *(Sistem tidak memiliki status Reject)*.

### 6. Star Gamification Engine & Leaderboard (`/leaderboard`)
- **Podium Visual Top 3**: Desain khusus emas (#1), perak (#2), dan perunggu (#3).
- **Tabel Klasemen 20 Crew**: Pemeringkatan dinamis berdasarkan Total Stars yang otomatis bergeser realtime saat terjadi approval.

### 7. Achievements Gallery (`/achievements`)
- **10 Badges Gamifikasi**: *Mission Master*, *Perfect Score*, *Consistent Performer*, *Top Performer*, *Star Collector*, *Rising Star*, *Star Legend*, dll.
- **Status Locked vs Unlocked**: Indikator progress bar pencapaian dan reward bonus bintang.

### 8. Role Simulation & Pengaturan (`/settings` & Header)
- **Role Switcher Dropdown**: Beralih instan antara **Crew (Andi)**, **Supervisor (Budi)**, dan **Head (Ahmad)**.
- **Dark Mode**: Pilihan Light, Dark, dan System Sync dengan persistensi di `localStorage`.

---

## 🧪 Skenario Demonstrasi Alur Kerja (End-to-End Flow)

Untuk memverifikasi alur prototype secara utuh:

1. **Langkah 1 (Simulasi Supervisor)**:
   - Pilih peran **Supervisor** di header.
   - Buka menu **Evaluations** (`/evaluations`).
   - Pilih misi "Production Line Quality Control" pada Week 2 (Active).
   - Geser slider skor ke **95** $\rightarrow$ Bintang otomatis terhitung menjadi ⭐⭐⭐⭐⭐ (5 Stars).
   - Masukkan catatan evaluasi & klik **Submit for Head Review** $\rightarrow$ Konfirmasi submit $\rightarrow$ Status menjadi `PENDING_REVIEW`.

2. **Langkah 2 (Simulasi Permintaan Revisi oleh Head)**:
   - Beralih peran ke **Head** melalui role switcher di header.
   - Buka menu **Approvals** (`/approvals`).
   - Pada tab *Pending Review*, temukan misi "Emergency Power Backup Simulation Test".
   - Klik **Request Revision** $\rightarrow$ Masukkan catatan: *"Mohon lengkapi foto amperemeter sub-panel B dan data log transfer switch."* $\rightarrow$ Klik Submit.
   - Evaluasi berpindah ke tab *Revision Required*.

3. **Langkah 3 (Perbaikan & Resubmit oleh Supervisor)**:
   - Beralih peran kembali ke **Supervisor**.
   - Buka menu **Evaluations** (`/evaluations`).
   - Misi yang diminta revisi menampilkan banner merah *"Head Review Revision Required"* beserta instruksi Head.
   - Tambahkan foto bukti $\rightarrow$ Klik **Resubmit for Head Review** $\rightarrow$ Status kembali ke `PENDING_REVIEW`.

4. **Langkah 4 (Approval & Gamification Cascade)**:
   - Beralih peran ke **Head** $\rightarrow$ Buka menu **Approvals** (`/approvals`).
   - Klik tombol **Approve Mission** pada misi Andi Pratama $\rightarrow$ Konfirmasi approval.
   - **Hasil Realtime**:
     - Efek partikel confetti bintang (*Star burst*) muncul di layar.
     - Toast notifikasi `⭐ +5 Stars Awarded!` muncul.
     - Buka menu **Leaderboard** (`/leaderboard`) $\rightarrow$ Total Stars Andi Pratama bertambah 5 bintang dan posisinya naik di klasemen.
     - Buka menu **Dashboard** (`/dashboard`) $\rightarrow$ Metrik missions completed dan total bintang ter-update seketika tanpa refresh halaman.

5. **Langkah 5 (Pengujian Week Lock)**:
   - Pada halaman **Evaluations** atau **Batches**, pilih **Week 1** (lampau) atau **Week 3** (mendatang).
   - Muncul banner informatif `🔒 Week Locked (Read-Only)`.
   - Slider dan tombol submit berstatus *disabled*.
