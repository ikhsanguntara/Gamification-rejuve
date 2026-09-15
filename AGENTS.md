# Workspace Agent Guidelines

## 1. Bahasa
- Selalu gunakan bahasa Indonesia sebagai bahasa utama dalam setiap respon dan percakapan dengan pengguna.

## 2. Kebijakan Commit, Push, dan Deploy (Strict Policy)
- **DILARANG KERAS** melakukan `git commit`, `git push`, atau `deploy` secara otomatis/inisiatif sendiri.
- Setiap update/perubahan kode cukup diverifikasi di lokal (test & audit).
- Laporkan hasil kepada user dan **TUNGGU PERINTAH EKSPLISIT** dari user (seperti "commit", "push", "deploy", "push deploy") sebelum melakukan commit, push, atau deploy.

## 3. Kebijakan Integrasi Sinkronisasi Lynx ERP (Strict Policy)
- **DILARANG KERAS** melakukan pengetesan atau memicu (trigger/hit) endpoint Sinkronisasi Lynx ERP (`/api/lynx-sync/*`) secara otomatis atau mandiri.
- Hanya lakukan pengujian / hit API Lynx ERP jika ada **PERINTAH EKSPLISIT** langsung dari user.

## 4. Kebijakan Wajib Test & Pencatatan Log Sebelum Deploy (Strict Policy)
- **WAJIB MENJALANKAN UNIT TEST SEBELUM DEPLOY**:
  - Sebelum menjalankan deployer (baik deploy Frontend maupun Backend, baik ke Firebase maupun ke VPS), **WAJIB** menjalankan pengujian unit test terlebih dahulu:
    ```bash
    npm --prefix frontend run test
    ```
    (Mencakup `test_all_cruds.mjs` dan `test_unit_tester_suite.mjs`).
  - Deploy **HANYA BOLEH DILANJUTKAN** jika hasil test menunjukkan kelulusan **100% (0 error, 0 fail)**. Jika ada test yang gagal, perbaiki terlebih dahulu dan dilarang deploy.
- **PENCATATAN LOG DEPLOYMENT**:
  - Setiap kali proses deployment selesai dieksekusi (berhasil atau gagal), **WAJIB** mencatat riwayatnya ke dalam dokumen [`docs/DEPLOYMENT_LOG.md`](file:///Users/ikhsan/Documents/dev/Gamification/docs/DEPLOYMENT_LOG.md).
  - Format log wajib mencakup: Tanggal & Waktu (WIB), Target Environment (VPS/Firebase/Staging/Production), Commit Hash & Branch, Hasil Unit Test (X/X Pass), Port & URL Akses, serta Ringkasan Perubahan.

## 5. Kebijakan Pembatasan Perubahan Kode Backend (BE) (Strict Policy)
- **DILARANG KERAS** mengubah, mengedit, atau memperbarui kode Backend (BE) secara otomatis/inisiatif sendiri.
- Fokus pengerjaan hanya pada sisi Frontend, kecuali ada **PERINTAH EKSPLISIT** langsung dari pengguna untuk memodifikasi Backend.

