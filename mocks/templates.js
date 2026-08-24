/**
 * Mock Data: Re.juve Standard Mission Templates & Presets
 * Used by Superadmin to generate 3-week store-wide operational missions in 1 click.
 */

export const mockMissionTemplates = [
  // ==================== WEEK 1 TEMPLATES (Setup & Cold Chain Safety) ====================
  {
    id: 'tmpl-w1-01',
    week: 1,
    codePrefix: 'W1-CC-01',
    title: 'Audit Suhu Chiller 2-4°C & Sensor Digital Display',
    category: 'Cold Chain',
    description: 'Pemeriksaan harian log suhu termometer digital chiller display dan walk-in cold room gerai. Suhu wajib terjaga konsisten di 2.0°C - 4.0°C.',
    requirements: [
      'Verifikasi log suhu digital setiap 2 jam pada kisaran 2.0°C - 4.0°C',
      'Periksa segel karet pintu chiller (gasket) dari potensi kebocoran udara dingin',
      'Kalibrasi termometer sekunder dengan standar benchmark Re.juve'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w1-02',
    week: 1,
    codePrefix: 'W1-SAN-02',
    title: 'Sanitasi Mesin Cold-Pressed & Swab Test ATP',
    category: 'Sanitation',
    description: 'Pembersihan mendalam dan sanitasi food-grade pada kantong hidrolik (hydraulic press bag) dan nampan stainless steel mesin jus.',
    requirements: [
      'Bongkar plat hidrolik dan cuci menggunakan larutan sanitasi food-grade',
      'Inspeksi kerapatan saringan mesh kantong jus tanpa robekan',
      'Uji swab ATP kebersihan permukaan kontak dengan hasil < 10 RLU'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w1-03',
    week: 1,
    codePrefix: 'W1-QC-03',
    title: 'Uji Brix Kemanisan & Sortir Buah Segar Organik',
    category: 'Quality Control',
    description: 'Inspeksi kualitas bahan baku buah nanas, apel, bayam organik, dan wortel yang masuk. Pengukuran kadar gula alami Brix.',
    requirements: [
      'Ukur kadar kemanisan Brix buah dengan refraktometer digital',
      'Karantina dan laporkan buah yang cacat, memar, atau tidak memenuhi standar',
      'Pastikan protokol pencucian 3 tahap air ber-ozon berjalan sempurna'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w1-04',
    week: 1,
    codePrefix: 'W1-CMP-04',
    title: 'Pemeriksaan APAR & Standar K3 Bar Gerai',
    category: 'Compliance',
    description: 'Audit kelayakan alat pemadam api ringan (APAR), jalur evakuasi gerai, dan kepatuhan penggunaan APD (sarung tangan, apron, hairnet) seluruh crew.',
    requirements: [
      'Periksa jarum tekanan APAR pada zona hijau dan masa berlaku inspeksi',
      'Pastikan seluruh crew mengenakan apron bersih, masker, dan hairnet',
      'Pastikan dry mat lantai kasir dan area bar terpasang rapi mencegah slip'
    ],
    maxStars: 5
  },

  // ==================== WEEK 2 TEMPLATES (Core Quality & Fresh Extraction) ====================
  {
    id: 'tmpl-w2-01',
    week: 2,
    codePrefix: 'W2-QC-01',
    title: 'Audit Rasio Ekstraksi Jus Murni 100% (#CleanLabel)',
    category: 'Quality Control',
    description: 'Audit kepatuhan resep jus khas Re.juve (u.Glow, Asian Green, Tropic Golden). Memastikan 100% murni, 0% air tambahan, 0% gula tambahan, 0% pengawet.',
    requirements: [
      'Ukur gramatur hasil ekstraksi per kg buah segar sesuai SOP resep',
      'Pastikan 100% Cold-Pressed murni tanpa air, gula, atau perisa sintetis',
      'Dokumentasikan parameter pH dan densitas pada lembar kendali mutu'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w2-02',
    week: 2,
    codePrefix: 'W2-SAN-02',
    title: 'Sanitasi Bar Depan & Standar Kebersihan Kaca Gerai',
    category: 'Sanitation',
    description: 'Audit sanitasi berkala setiap jam pada meja pemesanan kasir, layar sentuh POS, permukaan bar stainless steel, dan kaca etalase produk.',
    requirements: [
      'Sanitasi meja bar dan kasir dengan cairan alkohol food-grade',
      'Pastikan kaca etalase chiller bersih berkilau bebas sidik jari',
      'Verifikasi pemilahan tempat sampah organik kulit buah vs daur ulang botol'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w2-03',
    week: 2,
    codePrefix: 'W2-LOG-03',
    title: 'Rekonsiliasi Stok Harian & Buffer Kemasan Botol',
    category: 'Logistics',
    description: 'Penghitungan fisik stok botol cold-pressed, almond milk, dan booster shot dibandingkan dengan data sistem POS/ERP gerai.',
    requirements: [
      'Scan barcode seluruh varian produk di rak chiller display',
      'Cocokkan selisih stok fisik dengan laporan penjualan sistem ERP gerai',
      'Verifikasi ketersediaan tas pendingin (thermal bag) dan ice gel buffer'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w2-04',
    week: 2,
    codePrefix: 'W2-SRV-04',
    title: 'Kecepatan Layanan Barista & Edukasi Pelanggan < 45s',
    category: 'Service',
    description: 'Evaluasi kecepatan pelayanan transaksi kasir, salam ramah Re.juve, dan penjelasan manfaat hidup sehat #CleanLabel kepada pelanggan.',
    requirements: [
      'Pertahankan rata-rata waktu transaksi kasir di bawah 45 detik',
      'Sampaikan penjelasan keunggulan 100% Cold-Pressed dengan fasih',
      'Raih skor kepuasan pelanggan minimal bintang 4.8 pada survei digital'
    ],
    maxStars: 5
  },

  // ==================== WEEK 3 TEMPLATES (HACCP Certification & Final Sign-Off) ====================
  {
    id: 'tmpl-w3-01',
    week: 3,
    codePrefix: 'W3-CMP-01',
    title: 'Audit Sertifikasi HACCP & Higienitas Total',
    category: 'Compliance',
    description: 'Inspeksi komprehensif kepatuhan standar keamanan pangan HACCP internasional pada seluruh alur penanganan produk di gerai.',
    requirements: [
      'Raih skor minimal 95% pada checklist 80 poin audit sanitasi HACCP',
      'Verifikasi catatan sterilisasi botol dan penyimpanan tutup bersegel',
      'Tanda tangani berita acara audit kepatuhan higienitas gerai'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w3-02',
    week: 3,
    codePrefix: 'W3-MNT-02',
    title: 'Audit Perawatan Chiller & Mesin Hidrolik',
    category: 'Maintenance',
    description: 'Pemeriksaan preventif kondensor chiller, pembersihan filter udara mesin, dan pelumasan hidrolik bersertifikasi halal & food-grade.',
    requirements: [
      'Bersihkan sirip kondensor pendingin dari debu dan kotoran',
      'Cek kebocoran oli hidrolik food-grade pada sistem silinder press',
      'Dokumentasikan stiker tanggal servis berkala pada unit mesin'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w3-03',
    week: 3,
    codePrefix: 'W3-SRV-03',
    title: 'Survei Kepuasan Pelanggan Bintang 5',
    category: 'Service',
    description: 'Pengumpulan ulasan dan testimoni pelanggan gerai mengenai kesegaran jus, keramahan crew, dan kenyamanan outlet.',
    requirements: [
      'Kumpulkan minimal 25 ulasan pelanggan bintang 5 dalam seminggu',
      'Pastikan zero komplain kualitas rasa atau suhu botol jus',
      'Implementasikan masukan pelanggan untuk peningkatan kualitas layanan'
    ],
    maxStars: 5
  },
  {
    id: 'tmpl-w3-04',
    week: 3,
    codePrefix: 'W3-QC-04',
    title: 'Final Cycle Store Excellence Sign-off',
    category: 'Quality Control',
    description: 'Verifikasi akhir seluruh pencapaian siklus 3 minggu, penutupan evaluasi crew, dan penandatanganan sertifikat keunggulan gerai.',
    requirements: [
      'Verifikasi kelengkapan seluruh 12 evaluasi misi siklus 3 minggu',
      'Pastikan rata-rata nilai kualitas gerai mencapai target benchmark >= 90%',
      'Kirim laporan evaluasi final ke Head of Operations untuk approval siklus'
    ],
    maxStars: 5
  }
]

export const mockTemplatePackages = [
  {
    id: 'pkg-rejuve-standard',
    name: 'Paket Standar Operasional & Penjaminan Mutu Re.juve (3 Minggu)',
    code: 'PKG-REJUVE-STD-01',
    category: 'Master SOP Package',
    description: 'Paket lengkap 12 misi operasional gerai Re.juve yang mencakup Cold Chain 2-4°C, sanitasi mesin hidrolik, uji brix buah, #CleanLabel service, dan sertifikasi HACCP.',
    totalMissions: 12,
    weeksCovered: [1, 2, 3],
    missionsPerWeek: 4,
    templateIds: mockMissionTemplates.map(t => t.id)
  }
]
