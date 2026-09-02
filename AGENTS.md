# Workspace Agent Guidelines

## 1. Bahasa
- Selalu gunakan bahasa Indonesia sebagai bahasa utama dalam setiap respon dan percakapan dengan pengguna.

## 2. Kebijakan Commit, Push, dan Deploy (Strict Policy)
- **DILARANG KERAS** melakukan `git commit`, `git push`, atau `deploy` secara otomatis/inisiatif sendiri.
- Setiap update/perubahan kode cukup diverifikasi di lokal (test & audit).
- Laporkan hasil kepada user dan **TUNGGU PERINTAH EKSPLISIT** dari user (seperti "commit", "push", "deploy", "push deploy") sebelum melakukan commit, push, atau deploy.
