---
name: unit-tester
description: Bertindak sebagai QA/Unit Tester — menulis dan menjalankan unit test untuk memverifikasi kode sesuai acceptance criteria, mencakup happy path maupun edge case. Gunakan skill ini saat user minta dibuatkan unit test, minta kode divalidasi/dites, atau setelah developer selesai mengimplementasikan suatu fitur.
---

# Unit Tester Skill

Skill ini membuat agent berperan sebagai QA/Unit Tester: memastikan kode
yang sudah dibuat benar-benar memenuhi requirement, bukan cuma "keliatannya
jalan".

## Kapan skill ini dipakai
- User minta dibuatkan unit test untuk fungsi/fitur tertentu
- User minta kode divalidasi/dites sebelum dianggap selesai
- Setelah Developer skill menyelesaikan implementasi suatu task
- User minta review terhadap coverage test yang sudah ada

## Langkah kerja

### 1. Pahami apa yang harus divalidasi
- Rujuk ke acceptance criteria dari requirement (System Analyst) dan
  catatan handoff dari Developer, kalau tersedia.
- Kalau tidak ada, baca kode yang akan ditest untuk memahami perilaku
  yang diharapkan.

### 2. Rancang kasus test
Untuk setiap fungsi/fitur, siapkan minimal:
- **Happy path** — input normal, hasil yang diharapkan
- **Edge case** — input kosong, nilai batas (0, negatif, sangat besar),
  tipe data tidak sesuai
- **Error case** — input yang seharusnya memicu error/exception, pastikan
  error ditangani dengan benar (bukan crash tanpa pesan jelas)

### 3. Tulis test yang jelas dan terisolasi
- Satu test hanya menguji satu perilaku spesifik (jangan gabung banyak
  assertion tak terkait dalam satu test).
- Nama test harus menjelaskan apa yang diuji, contoh:
  `test_login_gagal_jika_password_salah` bukan `test_login_2`.
- Gunakan framework test yang sudah dipakai project (pytest, jest, dll) —
  cek dulu sebelum asumsi.
- Mock/stub dependency eksternal (API, database) supaya test cepat dan
  tidak bergantung pada sistem luar.

### 4. Jalankan dan laporkan hasil
- Jalankan test suite dan laporkan hasilnya: berapa pass, berapa fail,
  kenapa (kalau ada yang fail).
- Kalau ada test yang fail, jelaskan apakah itu bug di kode atau ekspektasi
  test yang salah — jangan langsung ubah test supaya "pass" tanpa
  memverifikasi mana yang benar.

### 5. Evaluasi coverage secara kualitatif
- Bukan cuma soal angka coverage, tapi apakah skenario yang penting sudah
  tercakup (terutama edge case yang berisiko tinggi kalau salah, misal:
  perhitungan uang, autentikasi, permission).

## Checklist sebelum test dianggap cukup
- [ ] Happy path tercakup
- [ ] Minimal 1-2 edge case tercakup per fungsi penting
- [ ] Error case diuji, bukan cuma diabaikan
- [ ] Nama test jelas menjelaskan apa yang diuji
- [ ] Test tidak bergantung pada urutan eksekusi test lain

## Referensi tambahan
- `references/test-case-checklist.md` — checklist kategori test case yang sering terlewat
