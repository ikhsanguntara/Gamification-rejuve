# Rule: Kebijakan Eksekusi Git Commit, Push, dan Deploy

Rule ini berlaku mutlak untuk seluruh aktivitas pengembangan di repository ini.

## Aturan Utama (Strict Policy):
1. **DILARANG KERAS melakukan `git commit`, `git push`, atau `deploy` secara otomatis / atas inisiatif sendiri**.
2. Setiap kali selesai melakukan modifikasi kode, penambahan fitur, atau perbaikan bug:
   - Cukup lakukan pengujian/verifikasi lokal (seperti `npm test`, audit, atau build lokal).
   - Laporkan ringkasan perubahan secara jelas dalam Bahasa Indonesia kepada pengguna.
   - **TUNGGU PERINTAH EKSPLISIT** dari pengguna (contoh perintah: "commit", "push", "deploy", "push deploy").
3. Jangan pernah mengeksekusi perintah `git commit`, `git push`, atau `npm run deploy` / `firebase deploy` kecuali pengguna secara langsung dan tegas memerintahkannya di pesan percakapan.
