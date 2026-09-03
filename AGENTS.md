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
