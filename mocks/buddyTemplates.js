/**
 * Mock Data: Master Template Misi Buddy (Pre-Batch 3 Hari) Re.juve
 * Dijalankan H-3 sampai H-1 sebelum siklus batch reguler dimulai.
 * Dikhususkan untuk pendampingan dan penilaian kesiapan kru oleh Store Leader (SL).
 */

export const mockBuddyPackages = [
  {
    id: 'pkg-buddy-standard',
    name: 'Paket Pendampingan Buddy Standar (3 Hari Pre-Batch)',
    code: 'BUDDY-STD-03',
    totalDays: 3,
    description: 'Program orientasi dan pendampingan 3 hari pra-batch untuk memastikan kesiapan dasar kru baru sebelum masuk kompetisi batch.',
    days: [
      {
        dayNumber: 1,
        offsetDays: 3, // H-3
        title: 'Hari 1 (H-3): Orientasi Kultur #CleanLabel & Standar Grooming',
        focus: 'Pengenalan Budaya & APD',
        missions: [
          {
            id: 'bm-d1-01',
            title: 'Edukasi Prinsip 100% #CleanLabel Re.juve',
            description: 'Memahami komitmen produk murni tanpa air tambahan, tanpa gula, dan tanpa bahan pengawet.',
            checklist: [
              'Mampu menjelaskan konsep #CleanLabel secara lisan ke Store Leader',
              'Memahami alasan mengapa cold-pressed juice harus selalu dalam rantai dingin'
            ]
          },
          {
            id: 'bm-d1-02',
            title: 'Standar Seragam, Grooming & Kebersihan Diri',
            description: 'Pemeriksaan kepatuhan seragam bersih, hairnet rapi, apron, dan kuku pendek higienis.',
            checklist: [
              'Memakai seragam lengkap, bersih, dan apron terpasang rapi',
              'Kuku pendek bersih tanpa cat kuku, bebas aksesoris tangan saat di bar'
            ]
          },
          {
            id: 'bm-d1-03',
            title: 'Orientasi Tata Letak Gerai & Keselamatan Kerja',
            description: 'Pengenalan area counter, cold storage chiller, wastafel cuci, dan jalur keselamatan.',
            checklist: [
              'Mengetahui lokasi APAR, kotak P3K, dan panel listrik utama',
              'Memahami alur kerja bersih (clean area) dan area basah (wash area)'
            ]
          }
        ]
      },
      {
        dayNumber: 2,
        offsetDays: 2, // H-2
        title: 'Hari 2 (H-2): Higienitas Bar, Sanitasi Mesin & Cold-Chain 2–4°C',
        focus: 'Keamanan Pangan & Sanitasi',
        missions: [
          {
            id: 'bm-d2-01',
            title: 'Praktek 6 Langkah Cuci Tangan & APD Food-Grade',
            description: 'Mempraktikkan standar kebersihan tangan WHO dan pergantian sarung tangan berkala.',
            checklist: [
              'Praktik cuci tangan 6 langkah minimal 20 detik dengan sabun antibakteri',
              'Menggunakan sarung tangan baru sebelum menyentuh botol atau buah'
            ]
          },
          {
            id: 'bm-d2-02',
            title: 'Monitoring & Pencatatan Suhu Chiller (2–4°C)',
            description: 'Latihan membaca termometer digital dan mengisi logbook suhu rantai dingin.',
            checklist: [
              'Mencatat suhu chiller display dan chiller penyimpanan dengan akurat',
              'Mengetahui tindakan darurat bila suhu chiller melebihi 4°C'
            ]
          },
          {
            id: 'bm-d2-03',
            title: 'Sanitasi Plat Pemeras & Meja Counter Bar',
            description: 'Mencuci dan membersihkan bagian mesin press serta meja bar dengan sanitizer food-safe.',
            checklist: [
              'Menggunakan cairan disinfektan food-grade dengan takaran tepat',
              'Menjaga area wastafel dan meja bar tetap kering dan bebas noda'
            ]
          }
        ]
      },
      {
        dayNumber: 3,
        offsetDays: 1, // H-1
        title: 'Hari 3 (H-1): Alur POS Kasir Cashless & Simulasi Kesiapan Batch',
        focus: 'Hospitality & Kesiapan Mental',
        missions: [
          {
            id: 'bm-d3-01',
            title: 'Simulasi Greeting Ramah 3S & Hospitality',
            description: 'Latihan menyapa konsumen dengan senyum tulus, kontak mata hangat, dan intonasi ramah.',
            checklist: [
              'Menyapa pelanggan dalam 3 detik setelah mendekati counter',
              'Mampu merekomendasikan varian jus favorit dengan percaya diri'
            ]
          },
          {
            id: 'bm-d3-02',
            title: 'Operasional Kasir POS & Transaksi QRIS/EDC',
            description: 'Latihan input transaksi di mesin kasir POS dan memproses pembayaran non-tunai.',
            checklist: [
              'Mencetak struk penjualan dan memverifikasi notifikasi settlement QRIS',
              'Menyerahkan botol jus dan kemasan ramah lingkungan dengan rapi'
            ]
          },
          {
            id: 'bm-d3-03',
            title: 'Evaluasi Kelayakan & Rekomendasi Store Leader',
            description: 'Wawancara akhir kesiapan dan penandatanganan kelayakan kru masuk siklus batch resmi.',
            checklist: [
              'Kru menyatakan kesiapan mental dan disiplin waktu mengikuti batch',
              'Store Leader memberikan catatan rekomendasi kesiapan'
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'pkg-buddy-express',
    name: 'Paket Pendampingan Buddy Express Kiosk (2 Hari Pre-Batch)',
    code: 'BUDDY-EXP-02',
    totalDays: 2,
    description: 'Format ringkas 2 hari pra-batch untuk kru outlet express dan kiosk koridor mall.',
    days: [
      {
        dayNumber: 1,
        offsetDays: 2,
        title: 'Hari 1 (H-2): Grooming, Kultur #CleanLabel & Suhu Cold-Chain',
        focus: 'Standar Dasar & Cold Chain',
        missions: [
          {
            id: 'bm-exp-01',
            title: 'Grooming & Standar Rantai Dingin 2-4°C',
            description: 'Pemeriksaan seragam, masker, hairnet, dan kontrol chiller.',
            checklist: ['Seragam rapi', 'Cek suhu chiller < 4°C']
          },
          {
            id: 'bm-exp-02',
            title: 'Sanitasi Area Kiosk & Cuci Tangan Higienis',
            description: 'Pembersihan meja counter kecil dan kepatuhan cuci tangan.',
            checklist: ['Sanitasi counter', 'Gunakan hand sanitizer food-grade']
          }
        ]
      },
      {
        dayNumber: 2,
        offsetDays: 1,
        title: 'Hari 2 (H-1): Kecepatan POS Kasir & Kesiapan Mandiri',
        focus: 'Kasir & Simulasi Layanan',
        missions: [
          {
            id: 'bm-exp-03',
            title: 'Express Checkout POS < 30 Detik',
            description: 'Simulasi transaksi kasir kilat pembayaran QRIS/EDC.',
            checklist: ['Transaksi kasir lancar', 'Greeting ramah ke konsumen']
          },
          {
            id: 'bm-exp-04',
            title: 'Review Kesiapan Bersama Store Leader',
            description: 'Konfirmasi kesiapan kru mengikuti Batch kompetisi.',
            checklist: ['Evaluasi pemahaman dasar', 'Rekomendasi Store Leader']
          }
        ]
      }
    ]
  }
]
