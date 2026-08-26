/**
 * Mock Data: Paket Template Misi Standar Re.juve (12 Misi)
 * Template siap pakai untuk membuat misi 3 minggu dalam 1 klik.
 */

export const mockMissionTemplates = [
  // ==================== WEEK 1 ====================
  {
    id: 'tmpl-w1-01',
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
    id: 'tmpl-w1-02',
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
    id: 'tmpl-w1-03',
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
    id: 'tmpl-w1-04',
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

  // ==================== WEEK 2 ====================
  {
    id: 'tmpl-w2-01',
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
    id: 'tmpl-w2-02',
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
    id: 'tmpl-w2-03',
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
    id: 'tmpl-w2-04',
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

  // ==================== WEEK 3 ====================
  {
    id: 'tmpl-w3-01',
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
    id: 'tmpl-w3-02',
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
    id: 'tmpl-w3-03',
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
    id: 'tmpl-w3-04',
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

export const mockTemplatePackages = [
  {
    id: 'pkg-rejuve-master-12',
    name: 'Paket Standar Operasional Gerai Re.juve (12 Misi)',
    code: 'PKG-SOP-12',
    description: 'Paket standar 12 misi operasional 3 minggu: Suhu Chiller, Sanitasi Bar, Kualitas Buah, Layanan Kasir, dan Stok.',
    totalMissions: 12,
    totalWeeks: 3,
    templates: mockMissionTemplates
  }
]
