# Checklist Kategori Test Case yang Sering Terlewat

## Input & Validasi
- [ ] Input kosong/null/undefined
- [ ] Input dengan tipe data salah
- [ ] Input di batas minimum/maksimum (boundary value)
- [ ] Input dengan karakter khusus (untuk string), misal quote, emoji, HTML tag

## Angka & Perhitungan
- [ ] Angka nol
- [ ] Angka negatif
- [ ] Angka sangat besar (overflow potensial)
- [ ] Pembagian dengan pembagi nol

## Autentikasi & Otorisasi
- [ ] Request tanpa autentikasi
- [ ] Request dengan token/session kadaluarsa
- [ ] User mencoba akses resource milik user lain
- [ ] User dengan role/permission tidak cukup

## Concurrency & State
- [ ] Dua request bersamaan mengubah data yang sama (race condition)
- [ ] State yang berubah di tengah proses (misal item dibeli saat stok jadi 0)

## Integrasi Eksternal
- [ ] API eksternal timeout atau tidak merespons
- [ ] API eksternal mengembalikan format response tak terduga
- [ ] Koneksi database terputus di tengah transaksi

## Format & Bahasa
- [ ] Input dalam bahasa/karakter non-ASCII (misal nama dengan aksen, teks Arab/Jepang)
- [ ] Format tanggal/angka yang berbeda locale
