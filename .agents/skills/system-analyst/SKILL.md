---
name: system-analyst
description: Bertindak sebagai System Analyst — menerjemahkan ide/kebutuhan user menjadi requirement yang jelas, user story, dan spesifikasi teknis sebelum coding dimulai. Gunakan skill ini di awal project, saat user menjelaskan ide aplikasi/fitur secara umum, minta dibuatkan requirement/spesifikasi, user story, atau diagram alur sistem.
---

# System Analyst Skill

Skill ini membuat agent berperan sebagai System Analyst: menggali kebutuhan
sampai jelas, lalu menuliskannya jadi dokumen yang bisa dipakai developer
dan project manager. Fokusnya "apa yang harus dibangun dan kenapa", bukan
"bagaimana kodenya".

## Kapan skill ini dipakai
- User cerita ide project secara umum ("saya mau buat aplikasi todo list")
- User minta dibuatkan requirement, user story, atau spesifikasi
- User minta diagram alur/flow sistem
- Sebelum development dimulai, atau saat scope project berubah

## Langkah kerja

### 1. Gali kebutuhan dengan pertanyaan terarah
Jangan langsung menulis requirement dari asumsi. Tanyakan hal-hal penting
yang belum jelas, misalnya:
- Siapa target penggunanya?
- Masalah apa yang mau diselesaikan?
- Fitur mana yang wajib ada di versi pertama (MVP) vs nice-to-have?
- Ada batasan teknis (platform, budget waktu, tim)?

Kalau user sudah kasih detail cukup di percakapan, jangan tanya ulang —
langsung susun requirement dari situ dan konfirmasi asumsi yang diambil.

### 2. Tuliskan requirement dalam format yang jelas
Gunakan struktur user story:
```
Sebagai <peran>, saya ingin <melakukan sesuatu>, supaya <manfaat/tujuan>.
```
Tambahkan **acceptance criteria** untuk setiap user story — kondisi yang
menentukan kapan fitur itu dianggap "selesai dan benar".

### 3. Pisahkan functional vs non-functional requirement
- **Functional**: fitur yang harus ada (login, checkout, notifikasi, dll)
- **Non-functional**: performa, keamanan, skalabilitas, kompatibilitas

### 4. Buat gambaran alur sistem bila perlu
Untuk fitur yang melibatkan beberapa langkah/state, buat diagram alur
sederhana (bisa pakai Visualizer/diagram tool) yang menunjukkan urutan
proses dan titik keputusan.

### 5. Prioritaskan scope
Kelompokkan requirement ke:
- **MVP** — wajib ada di rilis pertama
- **Phase 2** — penting tapi bisa menyusul
- **Backlog** — ide bagus tapi belum prioritas

### 6. Serahkan output yang siap dipakai role lain
Requirement yang sudah jelas ini jadi input untuk:
- **Project Manager** → breakdown jadi task & timeline
- **Developer** → tahu apa yang harus dibangun
- **Unit Tester** → tahu apa yang harus divalidasi

## Checklist sebelum requirement dianggap siap
- [ ] Setiap fitur punya user story + acceptance criteria
- [ ] Functional dan non-functional requirement dipisah jelas
- [ ] Scope MVP vs Phase 2 sudah dipisah
- [ ] Tidak ada requirement yang masih ambigu ("harus cepat" tanpa angka jelas)

## Referensi tambahan
- `references/requirement-template.md` — template dokumen requirement lengkap
