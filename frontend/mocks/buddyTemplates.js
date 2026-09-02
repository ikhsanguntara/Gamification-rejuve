/**
 * Mock Data: Master Template Paket Pendampingan Buddy (Rapor New Hire 3 Hari Pre-Batch) Re.juve
 * Dijalankan selama periode pendampingan 3 hari pra-batch untuk new hire.
 * Terdiri dari 7 Kompetensi Utama & 22 Indikator Penilaian Standar SOP Re.juve.
 */

export const mockBuddyCompetencies = [
  {
    id: 'comp-pk',
    name: 'Product Knowledge',
    code: 'PK',
    description: 'Pemahaman produk, bahan baku alami, manfaat kesehatan, dan rekomendasi kebutuhan pelanggan.',
    indicators: [
      {
        id: 'ind-pk-01',
        name: 'Menjelaskan produk & ingredients*',
        isStar: true,
        note: 'Wajib pembekalan, dimaklumi bila belum praktik langsung',
        description: 'Mampu menjelaskan bahan alami 100% #CleanLabel tanpa tambahan air, gula, atau pengawet.'
      },
      {
        id: 'ind-pk-02',
        name: 'Menjelaskan manfaat produk',
        isStar: false,
        description: 'Mampu menjelaskan khasiat fungsional cold-pressed juice, shot, dan nut milk ke konsumen.'
      },
      {
        id: 'ind-pk-03',
        name: 'Memberikan rekomendasi sesuai kebutuhan customer',
        isStar: false,
        description: 'Mampu menganalisis preferensi rasa/kesehatan konsumen dan memberi saran varian yang tepat.'
      }
    ]
  },
  {
    id: 'comp-cs',
    name: 'Customer Service',
    code: 'CS',
    description: 'Penerapan standar keramahan, greeting 3S, dan standar pelayanan prima Re.juve.',
    indicators: [
      {
        id: 'ind-cs-01',
        name: 'Menyapa customer sesuai standard',
        isStar: false,
        description: 'Greeting hangat dalam 3 detik dengan senyum, kontak mata, dan intonasi ramah.'
      },
      {
        id: 'ind-cs-02',
        name: 'Menggali kebutuhan customer',
        isStar: false,
        description: 'Mengajukan pertanyaan terbuka untuk memahami kebutuhan spesifik konsumen.'
      },
      {
        id: 'ind-cs-03',
        name: 'Memberikan pelayanan sesuai Service Standard Re.juve',
        isStar: false,
        description: 'Mematuhi seluruh alur pelayanan counter mulai dari kedatangan hingga ucapan terima kasih.'
      }
    ]
  },
  {
    id: 'comp-su',
    name: 'Sales & Upselling',
    code: 'SU',
    description: 'Teknik penawaran paket hemat, cross-selling makanan sehat, dan pendaftaran membership.',
    indicators: [
      {
        id: 'ind-su-01',
        name: 'Melakukan upselling paket juice/qty juice',
        isStar: false,
        description: 'Menawarkan upgrade ukuran botol atau paket bundling promo harian.'
      },
      {
        id: 'ind-su-02',
        name: 'Melakukan cross-selling produk food',
        isStar: false,
        description: 'Menawarkan pendamping camilan sehat, sandwich, atau plant-based snack.'
      },
      {
        id: 'ind-su-03',
        name: 'Menawarkan membership secara konsisten',
        isStar: false,
        description: 'Mengajak setiap konsumen mendaftarkan nomor telepon untuk poin loyalty Re.juve Club.'
      }
    ]
  },
  {
    id: 'comp-co',
    name: 'Cashier Operation',
    code: 'CO',
    description: 'Kecakapan operasional mesin kasir POS, EDC bank, QRIS, dan akurasi transaksi pembayaran.',
    indicators: [
      {
        id: 'ind-co-01',
        name: 'Melakukan transaksi di EDC dengan benar',
        isStar: false,
        description: 'Mengoperasikan mesin EDC kartu debit/kredit tanpa kendala koneksi atau salah nominal.'
      },
      {
        id: 'ind-co-02',
        name: 'Melakukan repeat order & payment dengan benar',
        isStar: false,
        description: 'Mengulang pesanan dan nominal pembayaran dengan jelas sebelum memproses kasir.'
      },
      {
        id: 'ind-co-03',
        name: 'Melakukan proses pembayaran di cashier tanpa kesalahan',
        isStar: false,
        description: 'Akurasi cetak struk, settlement QRIS, dan kerapian penyerahan struk & produk.'
      }
    ]
  },
  {
    id: 'comp-so',
    name: 'Store Operation',
    code: 'SO',
    description: 'Prosedur opening/closing gerai, penerimaan logistik barang, kebersihan, dan kerapian bar.',
    indicators: [
      {
        id: 'ind-so-01',
        name: 'Memahami proses opening & closing sesuai SOP*',
        isStar: true,
        note: 'Wajib pembekalan, dimaklumi bila belum praktik langsung',
        description: 'Mengetahui checklist persiapan gerai pagi dan prosedur serah terima shift malam.'
      },
      {
        id: 'ind-so-02',
        name: 'Melakukan cleaning & refill produk sesuai standard',
        isStar: false,
        description: 'Mengisi ulang display chiller dan membersihkan area bar secara berkala.'
      },
      {
        id: 'ind-so-03',
        name: 'Melakukan penerimaan kedatangan barang dengan baik*',
        isStar: true,
        note: 'Wajib pembekalan, dimaklumi bila belum praktik langsung',
        description: 'Memeriksa surat jalan, fisik segel botol, dan suhu logistik saat barang tiba dari central kitchen.'
      },
      {
        id: 'ind-so-04',
        name: 'Menjaga area kerja sesuai standard',
        isStar: false,
        description: 'Memastikan clean area dan wash area tertata rapi, kering, dan bebas kontaminasi.'
      }
    ]
  },
  {
    id: 'comp-fsq',
    name: 'Food Safety & Quality',
    code: 'FSQ',
    description: 'Standar sanitasi personal, pemeliharaan suhu rantai dingin 2–4°C, dan rotasi produk FIFO/FEFO.',
    indicators: [
      {
        id: 'ind-fsq-01',
        name: 'Menjalankan standard hygiene',
        isStar: false,
        description: 'Kepatuhan cuci tangan 6 langkah, pemakaian sarung tangan food-grade, hairnet, dan masker.'
      },
      {
        id: 'ind-fsq-02',
        name: 'Melakukan handling produk dengan benar',
        isStar: false,
        description: 'Memperlakukan botol jus dingin dengan hati-hati, tidak membiarkan botol di suhu ruang > 15 menit.'
      },
      {
        id: 'ind-fsq-03',
        name: 'Menjalankan FIFO/FEFO',
        isStar: false,
        description: 'Memeriksa tanggal kedaluwarsa botol dan meletakkan tanggal terdekat di barisan terdepan.'
      }
    ]
  },
  {
    id: 'comp-ta',
    name: 'Teamwork & Attitude',
    code: 'TA',
    description: 'Kedisiplinan waktu, komunikasi efektif dengan tim gerai, dan kepatuhan arahan atasan.',
    indicators: [
      {
        id: 'ind-ta-01',
        name: 'Menunjukkan sikap positif & disiplin',
        isStar: false,
        description: 'Hadir tepat waktu, berpakaian rapi sesuai standar grooming, dan bersemangat belajar.'
      },
      {
        id: 'ind-ta-02',
        name: 'Berkomunikasi dengan baik',
        isStar: false,
        description: 'Menyampaikan informasi dengan jelas dan sopan kepada sesama rekan kerja dan Store Leader.'
      },
      {
        id: 'ind-ta-03',
        name: 'Mengikuti arahan atasan',
        isStar: false,
        description: 'Menerima masukan dan menjalankan instruksi kerja dari Store Captain / Store Leader secara sigap.'
      }
    ]
  }
]

export const mockBuddyPackages = [
  {
    id: 'pkg-buddy-standard',
    name: 'Rapor Pendampingan New Hire (3 Hari Pra-Batch)',
    code: 'BUDDY-STD-03',
    durationDays: 3,
    description: 'Format resmi evaluasi pendampingan 3 hari untuk new hire mencakup 7 pilar kompetensi & 22 indikator penilaian.',
    competencies: JSON.parse(JSON.stringify(mockBuddyCompetencies))
  },
  {
    id: 'pkg-buddy-express',
    name: 'Rapor Pendampingan New Hire Kiosk / Express',
    code: 'BUDDY-EXP-02',
    durationDays: 3,
    description: 'Format ringkas evaluasi pendampingan pra-batch untuk outlet kiosk koridor mall.',
    competencies: JSON.parse(JSON.stringify(mockBuddyCompetencies))
  }
]
