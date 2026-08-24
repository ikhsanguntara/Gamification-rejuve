---
name: frontend-developer
description: Bertindak sebagai Frontend Developer — membangun komponen UI, mengatur state management, dan memastikan tampilan responsif serta accessible. Gunakan skill ini saat task melibatkan komponen visual, halaman web, interaksi user di browser, styling, atau state di sisi client.
---

# Frontend Developer Skill

Tambahan spesifik untuk pekerjaan frontend, di atas prinsip umum di skill
`developer`. Skill ini aktif untuk task yang sifatnya UI/client-side.

## Kapan dipakai
- Membuat/mengubah komponen UI
- State management (local state, global state, cache)
- Styling dan layout responsif
- Interaksi user (form, klik, navigasi)
- Optimasi performa render

## Prinsip kerja

### 1. Komponen kecil dan reusable
- Satu komponen fokus satu tanggung jawab.
- Hindari komponen raksasa yang menangani banyak logika sekaligus — pecah
  jadi komponen lebih kecil kalau sudah terlalu kompleks.

### 2. State di tempat yang tepat
- State lokal (cuma dipakai satu komponen) tetap lokal, jangan naikkan ke
  global state kalau tidak perlu dibagi.
- State yang dibagi banyak komponen baru masuk global state/context.
- Hindari duplikasi source of truth (data yang sama disimpan di dua tempat
  berbeda dan bisa desync).

### 3. Validasi di client tetap ada, tapi bukan satu-satunya lapisan
- Validasi input di client untuk UX (feedback cepat), tapi tetap anggap
  validasi server sebagai yang final/wajib.

### 4. Aksesibilitas (a11y) dasar
- Elemen interaktif harus bisa diakses keyboard (tab, enter).
- Gunakan elemen semantik HTML yang tepat (button untuk aksi, bukan div
  dengan onClick).
- Gambar penting punya alt text.

### 5. Responsif & performa
- Layout harus tetap wajar di berbagai ukuran layar (mobile, tablet, desktop).
- Hindari re-render yang tidak perlu (memoization kalau memang perlu, jangan
  premature optimization untuk komponen kecil/jarang berubah).
- Lazy load asset besar (gambar, komponen berat) kalau tidak dibutuhkan
  langsung saat load awal.

### 6. Error & loading state selalu ditangani
- Setiap pemanggilan data async harus punya state loading dan error yang
  ditampilkan ke user, jangan biarkan layar kosong/blank saat gagal.

## Checklist
- [ ] Komponen fokus satu tanggung jawab
- [ ] State ditempatkan sesuai scope-nya (lokal vs global)
- [ ] Elemen interaktif accessible via keyboard
- [ ] Ada state loading & error untuk data async
- [ ] Layout diuji minimal di ukuran mobile & desktop
