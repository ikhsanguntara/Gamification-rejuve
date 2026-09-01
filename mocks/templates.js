/**
 * Mock Data: Master Template Packages & SOP Presets Re.juve
 * Mendukung banyak paket master template (Multi-Template Catalog)
 */

export const mockTemplatePackages = [
  {
    id: 'pkg-sop-standard',
    name: 'Paket Standar Operasional Mall (12 Misi)',
    code: 'PKG-MALL-12',
    category: 'Standar Operasional',
    targetType: 'Gerai Flagship & Mall',
    description: 'Paket standar 12 misi operasional 3 minggu: Suhu Chiller, Sanitasi Bar, Uji Kemanisan Buah, Speed Layanan Barista, dan Stok Opname.',
    totalMissions: 12,
    totalWeeks: 3,
    weeks: [
      { weekNumber: 1, title: 'Minggu 1: Suhu & Sanitasi Dasar' },
      { weekNumber: 2, title: 'Minggu 2: Kualitas Rasa & Layanan' },
      { weekNumber: 3, title: 'Minggu 3: Audit Akhir & Stok' }
    ],
    templates: [
      // Week 1
      {
        id: 'tmpl-std-01',
        week: 1,
        codePrefix: 'M-01',
        title: 'Cek Suhu Chiller (2–4°C)',
        category: 'Suhu Dingin',
        description: 'Pastikan suhu chiller display dan penyimpanan stabil di 2–4°C setiap pagi dan sore.',
        requirements: [
          'Catat suhu chiller pada logbook pagi dan sore (2–4°C)',
          'Pastikan pintu chiller tertutup rapat dan tidak ada kebocoran udara dingin'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-02',
        week: 1,
        codePrefix: 'M-02',
        title: 'Sanitasi Mesin Press & Meja Bar',
        category: 'Kebersihan',
        description: 'Bersihkan mesin press jus, nampan penampung, dan meja bar agar selalu bersih higienis.',
        requirements: [
          'Cuci plat dan corong mesin press dengan cairan food-grade',
          'Lap meja bar dan pastikan tidak ada sisa tetesan jus'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-03',
        week: 1,
        codePrefix: 'M-03',
        title: 'Sortir & Cuci Buah Segar',
        category: 'Kualitas Buah',
        description: 'Pilih buah yang masuk (apel, nanas, bayam), buang yang rusak, dan cuci bersih sebelum diproses.',
        requirements: [
          'Pisahkan buah yang memar atau tidak layak konsumsi',
          'Cuci buah dengan air mengalir bersih sesuai SOP'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-04',
        week: 1,
        codePrefix: 'M-04',
        title: 'Kerapian Seragam & APD Crew',
        category: 'Kerapian',
        description: 'Pastikan seluruh crew memakai seragam bersih, apron, masker, dan hairnet dengan rapi saat melayani.',
        requirements: [
          'Pakai apron bersih, hairnet, dan masker lengkap',
          'Kuku bersih dan tidak memakai aksesoris tangan saat bertugas'
        ],
        maxStars: 5
      },
      // Week 2
      {
        id: 'tmpl-std-05',
        week: 2,
        codePrefix: 'M-05',
        title: 'Cek Rasa & Kemanisan Alami Buah',
        category: 'Kualitas Buah',
        description: 'Uji sampel rasa jus sebelum dikemas ke botol agar rasa 100% segar dan alami tanpa gula tambahan.',
        requirements: [
          'Cek sampel rasa per batch jus yang diproduksi',
          'Pastikan tidak ada penambahan air atau pemanis buatan'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-06',
        week: 2,
        codePrefix: 'M-06',
        title: 'Kecepatan Layanan Barista (< 45 Detik)',
        category: 'Pelayanan',
        description: 'Sambut customer dengan ramah dan siapkan produk pesanan dalam waktu kurang dari 45 detik.',
        requirements: [
          'Beri salam ramah kepada setiap customer yang datang',
          'Serahkan pesanan tepat waktu dan kemas dengan rapi'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-07',
        week: 2,
        codePrefix: 'M-07',
        title: 'Cek Tanggal Expired & Rotasi FIFO',
        category: 'Stok',
        description: 'Pajang botol jus di chiller dengan sistem FIFO (First In, First Out). Tanggal terdekat di depan.',
        requirements: [
          'Letakkan botol dengan expired date terdekat di baris paling depan',
          'Pisahkan botol yang sudah mendekati batas tanggal konsumsi'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-08',
        week: 2,
        codePrefix: 'M-08',
        title: 'Kebersihan Wastafel & Area Kasir',
        category: 'Kebersihan',
        description: 'Jaga area kasir tetap rapi, wastafel cuci tangan selalu bersih, dan sabun selalu terisi.',
        requirements: [
          'Pastikan sabun cuci tangan dan tisu selalu tersedia',
          'Bersihkan meja kasir dan buang sampah sebelum penuh'
        ],
        maxStars: 5
      },
      // Week 3
      {
        id: 'tmpl-std-09',
        week: 3,
        codePrefix: 'M-09',
        title: 'Pembersihan Total Chiller Mingguan',
        category: 'Kebersihan',
        description: 'Kuras dan bersihkan rak chiller display & chiller gudang secara menyeluruh di akhir minggu.',
        requirements: [
          'Pindahkan botol jus ke chiller cadangan saat dibersihkan',
          'Lap rak chiller hingga bersih kering dan susun kembali dengan rapi'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-10',
        week: 3,
        codePrefix: 'M-10',
        title: 'Rekap & Opname Stok Botol Harian',
        category: 'Stok',
        description: 'Hitung sisa stok botol jus fisik di gerai dan cocokkan dengan data sistem kasir.',
        requirements: [
          'Hitung fisik botol per varian rasa',
          'Catat dan laporkan jika ada selisih stok harian'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-11',
        week: 3,
        codePrefix: 'M-11',
        title: 'Cek Mesin Kasir POS & EDC',
        category: 'Kasir',
        description: 'Pastikan mesin kasir (POS), mesin EDC pembayaran, dan printer struk berfungsi lancar.',
        requirements: [
          'Tes mesin kasir & EDC sebelum buka gerai',
          'Pastikan kertas struk terpasang rapi'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-12',
        week: 3,
        codePrefix: 'M-12',
        title: 'Closing Gerai & Evaluasi Siklus',
        category: 'Closing',
        description: 'Lakukan checklist penutupan gerai, matikan peralatan non-chiller, dan pastikan chiller tetap menyala aman.',
        requirements: [
          'Pastikan seluruh chiller menyala 24 jam dan suhu stabil',
          'Kunci pintu gerai dan pastikan area kasir rapi aman'
        ],
        maxStars: 5
      }
    ]
  },
  {
    id: 'pkg-kiosk-express',
    name: 'Paket Gerai Kiosk & Bandara Express (6 Misi)',
    code: 'PKG-KIOSK-06',
    category: 'Gerai Express',
    targetType: 'Kiosk & Bandara',
    description: 'Format ringkas 6 misi prioritas untuk format gerai island/kiosk: Fokus pada speed layanan kilat, chiller grab-and-go, dan kasir cashless.',
    totalMissions: 6,
    totalWeeks: 3,
    weeks: [
      { weekNumber: 1, title: 'Minggu 1: Kecepatan Layanan & Kasir' },
      { weekNumber: 2, title: 'Minggu 2: Suhu Display & Stok Grab-and-Go' },
      { weekNumber: 3, title: 'Minggu 3: Closing Kiosk & Opname' }
    ],
    templates: [
      {
        id: 'tmpl-kio-01',
        week: 1,
        codePrefix: 'K-01',
        title: 'Cek Suhu Display Chiller Grab-and-Go',
        category: 'Suhu Dingin',
        description: 'Memastikan open-chiller display grab-and-go stabil di bawah 4°C untuk menjaga kesegaran botol.',
        requirements: ['Cek termometer digital chiller display setiap pergantian shift', 'Pastikan tirai malam (night blind) tertutup saat gerai tutup'],
        maxStars: 5
      },
      {
        id: 'tmpl-kio-02',
        week: 1,
        codePrefix: 'K-02',
        title: 'Sanitasi Area Counter Mini & Hand Hygiene',
        category: 'Kebersihan',
        description: 'Membersihkan counter transaksi kecil dan menjaga higienitas tangan kasir.',
        requirements: ['Lap counter dengan sanitizer food-grade', 'Gunakan hand sanitizer sebelum menyentuh botol'],
        maxStars: 5
      },
      {
        id: 'tmpl-kio-03',
        week: 2,
        codePrefix: 'K-03',
        title: 'Express Checkout < 30 Detik',
        category: 'Pelayanan',
        description: 'Kecepatan transaksi pembayaran non-tunai (QRIS/EDC) dalam waktu di bawah 30 detik per customer.',
        requirements: ['Scan barcode produk dan arahkan pembayaran cashless', 'Serahkan kantong ramah lingkungan dengan senyum ramah'],
        maxStars: 5
      },
      {
        id: 'tmpl-kio-04',
        week: 2,
        codePrefix: 'K-04',
        title: 'Restock Cepat & Rotasi FIFO Display',
        category: 'Stok',
        description: 'Pengisian ulang botol jus ke display dengan rotasi tanggal expired terdekat di baris depan.',
        requirements: ['Isi ulang chiller saat botol tersisa 30%', 'Pastikan botol baru ditaruh di belakang'],
        maxStars: 5
      },
      {
        id: 'tmpl-kio-05',
        week: 3,
        codePrefix: 'K-05',
        title: 'Opname Stok Harian & Rekonsiliasi EDC',
        category: 'Kasir',
        description: 'Pencocokan total botol terjual dengan struk settlement EDC harian.',
        requirements: ['Cetak settlement EDC bank', 'Hitung sisa fisik botol dan cocokkan di sistem'],
        maxStars: 5
      },
      {
        id: 'tmpl-kio-06',
        week: 3,
        codePrefix: 'K-06',
        title: 'Closing Kiosk & Kunci Pengaman Chiller',
        category: 'Closing',
        description: 'Prosedur tutup kiosk pulau di koridor mall / bandara.',
        requirements: ['Pasang gembok penutup chiller', 'Matikan lampu display dan rapikan banner'],
        maxStars: 5
      }
    ]
  },
  {
    id: 'pkg-onboarding-crew',
    name: 'Paket Onboarding & Pelatihan Kru Baru (6 Misi)',
    code: 'PKG-TRAIN-06',
    category: 'Pelatihan & Onboarding',
    targetType: 'Kru Baru / Gerai Pembukaan Baru',
    description: 'Kurikulum misi 3 minggu untuk orientasi kru baru: Pengenalan standar #CleanLabel, kalibrasi indra rasa jus, dan etika pelayanan prima.',
    totalMissions: 6,
    totalWeeks: 3,
    weeks: [
      { weekNumber: 1, title: 'Minggu 1: Edukasi Standar & Cold Chain' },
      { weekNumber: 2, title: 'Minggu 2: Kalibrasi Rasa & Pelayanan Prima' },
      { weekNumber: 3, title: 'Minggu 3: POS Kasir & Graduation Milestone' }
    ],
    templates: [
      {
        id: 'tmpl-tr-01',
        week: 1,
        codePrefix: 'TR-01',
        title: 'Ujian Pemahaman SOP Cold Chain Re.juve',
        category: 'Edukasi SOP',
        description: 'Pelajari rentang suhu aman 2–4°C dan mengapa cold-pressed juice tidak boleh terpapar panas.',
        requirements: ['Mampu menjelaskan prinsip cold-chain', 'Praktik membaca termometer chiller'],
        maxStars: 5
      },
      {
        id: 'tmpl-tr-02',
        week: 1,
        codePrefix: 'TR-02',
        title: 'Praktik Kebersihan Pribadi & Pemakaian APD',
        category: 'Kebersihan',
        description: 'Simulasi cuci tangan 6 langkah, pemakaian apron, masker, dan hairnet yang benar.',
        requirements: ['Demonstrasi cuci tangan sesuai standar WHO', 'Pemeriksaan kuku & kerapian seragam'],
        maxStars: 5
      },
      {
        id: 'tmpl-tr-03',
        week: 2,
        codePrefix: 'TR-03',
        title: 'Blind Test & Kalibrasi Sensorik Rasa Jus',
        category: 'Kualitas Buah',
        description: 'Mencicipi varian rasa jus untuk mengenali karakteristik rasa buah murni tanpa gula.',
        requirements: ['Mengenali 5 varian rasa utama Re.juve', 'Menjelaskan komposisi buah kepada supervisor'],
        maxStars: 5
      },
      {
        id: 'tmpl-tr-04',
        week: 2,
        codePrefix: 'TR-04',
        title: 'Roleplay Pelayanan Ramah & Upselling Sehat',
        category: 'Pelayanan',
        description: 'Latihan menyapa pelanggan, memberi rekomendasi jus sesuai kebutuhan nutrisi.',
        requirements: ['Simulasi percakapan dengan pelanggan', 'Menjelaskan manfaat nutrisi #CleanLabel'],
        maxStars: 5
      },
      {
        id: 'tmpl-tr-05',
        week: 3,
        codePrefix: 'TR-05',
        title: 'Simulasi Transaksi POS & Penanganan Komplain',
        category: 'Kasir',
        description: 'Latihan mengoperasikan POS, penerimaan berbagai metode pembayaran, dan refund.',
        requirements: ['Input pesanan di POS dalam < 20 detik', 'Penyelesaian simulasi kendala pembayaran'],
        maxStars: 5
      },
      {
        id: 'tmpl-tr-06',
        week: 3,
        codePrefix: 'TR-06',
        title: 'Uji Kelayakan Mandiri (Graduation Milestone)',
        category: 'Evaluasi Kelulusan',
        description: 'Audit komprehensif oleh supervisor untuk meluluskan kru menjadi Store Specialist resmi.',
        requirements: ['Skor kepatuhan SOP di atas 90%', 'Rekomendasi tertulis dari Supervisor'],
        maxStars: 5
      }
    ]
  }
]

// Default active single flat template list (for backwards-compatibility)
export const mockMissionTemplates = mockTemplatePackages[0].templates
