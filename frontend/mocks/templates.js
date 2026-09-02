/**
 * Mock Data: Master Template Packages & SOP Presets Re.juve
 * Mendukung katalog paket template multi-week: 2 Minggu, 3 Minggu, 4 Minggu, dan 5 Minggu.
 */

export const mockTemplatePackages = [
  // ==========================================
  // 1. PAKET 3 MINGGU (STANDAR MALL)
  // ==========================================
  {
    id: 'pkg-sop-standard',
    name: 'Paket Standar Operasional Mall (12 Misi • 3 Minggu)',
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
        title: 'Kalibrasi Takaran Botol Jus (250ml & 500ml)',
        category: 'Presisi',
        description: 'Pastikan volume jus yang dituangkan pas sesuai batas leher botol tanpa tumpah.',
        requirements: [
          'Periksa volume isi botol 250ml dan 500ml',
          'Segel tutup botol rapat dan pastikan tidak bocor'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-08',
        week: 2,
        codePrefix: 'M-08',
        title: 'Kebersihan Wastafel & Floor Bar',
        category: 'Kebersihan',
        description: 'Jaga kebersihan area basah wastafel dan lantai bar agar kering dan bebas licin.',
        requirements: [
          'Kuras dan bersihkan saringan wastafel cuci',
          'Pel lantai bar dengan disinfektan food-safe setiap 3 jam'
        ],
        maxStars: 5
      },
      // Week 3
      {
        id: 'tmpl-std-09',
        week: 3,
        codePrefix: 'M-09',
        title: 'Cek Expired Date & Label Botol',
        category: 'Keamanan Pangan',
        description: 'Periksa label tanggal kedaluwarsa pada setiap botol di display chiller, terapkan rotasi FIFO.',
        requirements: [
          'Terapkan rotasi First In First Out (FIFO)',
          'Tarik produk yang mendekati tanggal best before'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-10',
        week: 3,
        codePrefix: 'M-10',
        title: 'Stok Opname Harian Bahan Baku',
        category: 'Stok',
        description: 'Hitung sisa buah segar, botol kosong, dan kemasan takeaway di akhir shift.',
        requirements: [
          'Hitung stok fisik buah dan botol di ruang penyimpanan',
          'Cocokkan data stok fisik dengan sistem POS'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-11',
        week: 3,
        codePrefix: 'M-11',
        title: 'Closing Logbook & Matikan Mesin',
        category: 'Closing',
        description: 'Lakukan prosedur penutupan gerai: matikan chiller non-utama, kunci display, dan isi logbook.',
        requirements: [
          'Isi form checklist penutupan gerai dengan lengkap',
          'Pastikan semua mesin bersih dan dimatikan aman'
        ],
        maxStars: 5
      },
      {
        id: 'tmpl-std-12',
        week: 3,
        codePrefix: 'M-12',
        title: 'Kepatuhan Serah Terima Shift',
        category: 'Komunikasi',
        description: 'Lakukan briefing handover antar-shift mencakup sisa stok, kendala mesin, dan catatan customer.',
        requirements: [
          'Serah terima uang kasir dan catatan logbook ke shift berikutnya',
          'Pastikan area bar ditinggalkan dalam keadaan bersih'
        ],
        maxStars: 5
      }
    ]
  },

  // ==========================================
  // 2. PAKET 4 MINGGU (INTENSIF FLAGSHIP)
  // ==========================================
  {
    id: 'pkg-flagship-4weeks',
    name: 'Paket Intensif Pelayanan & Kualitas Flagship (16 Misi • 4 Minggu)',
    code: 'PKG-FLAGSHIP-16',
    category: 'Flagship Quality & Service',
    targetType: 'Gerai Flagship & High-Traffic Mall',
    description: 'Kurikulum komprehensif 4 minggu mencakup Cold Chain, Standar Barista, Service Excellence, dan Audit Kepatuhan HACCP.',
    totalMissions: 16,
    totalWeeks: 4,
    weeks: [
      { weekNumber: 1, title: 'Minggu 1: Fondasi Cold Chain & Sanitasi Higienis' },
      { weekNumber: 2, title: 'Minggu 2: Kalibrasi Resep & Kecepatan Operasional' },
      { weekNumber: 3, title: 'Minggu 3: Service Excellence & Upselling Nutrisi' },
      { weekNumber: 4, title: 'Minggu 4: Manajemen Stok & Audit HACCP' }
    ],
    templates: [
      // Week 1
      {
        id: 'tmpl-flg-01',
        week: 1,
        codePrefix: 'FLG-01',
        title: 'Verifikasi Kalibrasi Termometer Chiller',
        category: 'Suhu Dingin',
        description: 'Uji akurasi termometer digital chiller display dan storage box di suhu 2-4°C.',
        requirements: ['Catat logbook suhu 3x sehari (pagi, siang, malam)', 'Cek elastisitas karet penutup pintu chiller'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-02',
        week: 1,
        codePrefix: 'FLG-02',
        title: 'Prosedur 6 Langkah Cuci Tangan & APD Lengkap',
        category: 'Kebersihan',
        description: 'Penerapan standar cuci tangan WHO dan kelengkapan apron, hairnet, masker sebelum memegang produk.',
        requirements: ['Cuci tangan 6 langkah minimal 20 detik', 'Gunakan sarung tangan food-grade saat memotong buah'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-03',
        week: 1,
        codePrefix: 'FLG-03',
        title: 'Deep Cleaning Ekstraktor & Pisau Mesin Press',
        category: 'Kebersihan',
        description: 'Pembongkaran dan perendaman partisi mesin press dengan cairan sanitasi food-grade berstandar lab.',
        requirements: ['Bongkar corong dan pisau mesin press', 'Rendam dan sterilkan selama 15 menit'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-04',
        week: 1,
        codePrefix: 'FLG-04',
        title: 'Inspeksi Kualitas Buah Masuk & Cold Storage',
        category: 'Kualitas Buah',
        description: 'Pengecekan kesegaran sayur kale, bayam, wortel, dan buah apel dari vendor rantai dingin.',
        requirements: ['Uji fisik kekerasan dan kesegaran buah', 'Pisahkan buah non-standar ke wadah karantina'],
        maxStars: 5
      },
      // Week 2
      {
        id: 'tmpl-flg-05',
        week: 2,
        codePrefix: 'FLG-05',
        title: 'Uji Brix & Kemanisan Alami Refraktometer',
        category: 'Kualitas Buah',
        description: 'Pengukuran kadar brix buah alami untuk menjaga profil rasa Re.juve 100% konsisten tanpa pemanis.',
        requirements: ['Ambil sampel 5ml jus dan uji refraktometer', 'Pastikan skor brix berada pada rentang formula standar'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-06',
        week: 2,
        codePrefix: 'FLG-06',
        title: 'Simulasi Kecepatan Antrean (< 35 Detik)',
        category: 'Pelayanan',
        description: 'Latihan efisiensi operasional penyajian produk saat jam sibuk (peak hour siang dan sore).',
        requirements: ['Lakukan transaksi dan penyerahan botol < 35 detik', 'Kemaskan tas ramah lingkungan dengan rapi'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-07',
        week: 2,
        codePrefix: 'FLG-07',
        title: 'Kalibrasi Presisi Penutupan & Induction Seal',
        category: 'Presisi',
        description: 'Pengecekan segel anti-bocor pada botol 250ml, 500ml, dan 1350ml family size.',
        requirements: ['Uji ketat botol dibalik 180 derajat selama 5 detik', 'Pastikan cincin segel botol utuh dan bersih'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-08',
        week: 2,
        codePrefix: 'FLG-08',
        title: 'Maintenance Kompresor & Kerapian Drainase',
        category: 'Operasional',
        description: 'Pemeriksaan sirkulasi udara kompresor chiller dan kelancaran saluran pembuangan air es.',
        requirements: ['Bersihkan debu kisi-kisi ventilasi kompresor', 'Pastikan selang drainase tidak tersumbat lumut'],
        maxStars: 5
      },
      // Week 3
      {
        id: 'tmpl-flg-09',
        week: 3,
        codePrefix: 'FLG-09',
        title: 'Greeting Ramah 3S (Senyum, Salam, Sapa)',
        category: 'Pelayanan',
        description: 'Praktik hospitality hangat Re.juve kepada seluruh pelanggan yang melintas dan mampir ke gerai.',
        requirements: ['Sapa pelanggan dengan kontak mata dan senyum tulus', 'Gunakan intonasi ramah dan bahasa tubuh terbuka'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-10',
        week: 3,
        codePrefix: 'FLG-10',
        title: 'Konsultasi Manfaat Nutrisi #CleanLabel',
        category: 'Edukasi',
        description: 'Edukasi ke pelanggan tentang keunggulan cold-pressed tanpa air, tanpa gula, dan tanpa pengawet.',
        requirements: ['Mampu menjelaskan 3 varian jus andalan', 'Beri rekomendasi jus sesuai kebutuhan imun/detoks pelanggan'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-11',
        week: 3,
        codePrefix: 'FLG-11',
        title: 'Penanganan Komplain Pelanggan secara Solutif',
        category: 'Pelayanan',
        description: 'Simulasi mendengarkan keluhan pelanggan dengan empati, penukaran produk, dan eskalasi sopan.',
        requirements: ['Dengarkan keluhan tanpa memotong pembicaraan', 'Tawarkan solusi penggantian botol baru segera'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-12',
        week: 3,
        codePrefix: 'FLG-12',
        title: 'Upselling Sehat Paket Bundling & Member',
        category: 'Penjualan',
        description: 'Menawarkan promosi paket combo mingguan atau membership program dengan cara yang elegan.',
        requirements: ['Tawarkan program loyalitas member dengan luwes', 'Jelaskan keuntungan paket bundling 3 botol hemat'],
        maxStars: 5
      },
      // Week 4
      {
        id: 'tmpl-flg-13',
        week: 4,
        codePrefix: 'FLG-13',
        title: 'Audit Rotasi FIFO & Masa Simpan Produk',
        category: 'Keamanan Pangan',
        description: 'Pemeriksaan ketat tanggal kadaluwarsa pada display dan ruang penyimpanan cold room.',
        requirements: ['Pastikan botol dengan exp terdekat di baris terdepan', 'Catat produk exp < 24 jam ke log disposisi'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-14',
        week: 4,
        codePrefix: 'FLG-14',
        title: 'Opname Fisik Harian & Rekonsiliasi Kasir POS',
        category: 'Stok & Kasir',
        description: 'Pencocokan total penjualan sistem POS dengan fisik botol dan batch settlement bank EDC.',
        requirements: ['Hitung selisih stok fisik vs sistem POS (toleransi 0)', 'Cetak bukti settlement mesin EDC per shift'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-15',
        week: 4,
        codePrefix: 'FLG-15',
        title: 'Checklist Audit Kepatuhan Standar HACCP',
        category: 'Audit',
        description: 'Simulasi audit standar keamanan pangan: suhu, kontaminasi silang, dan catatan pest control.',
        requirements: ['Lengkapi lembar audit kepatuhan HACCP', 'Verifikasi ketiadaan potensi kontaminasi silang'],
        maxStars: 5
      },
      {
        id: 'tmpl-flg-16',
        week: 4,
        codePrefix: 'FLG-16',
        title: 'Closing Paripurna & Serah Terima Manajerial',
        category: 'Closing',
        description: 'Prosedur menyeluruh penutupan gerai flagship, penguncian kas besi, dan serah terima ke tim esok hari.',
        requirements: ['Kunci seluruh unit chiller dan brankas kasir', 'Upload rekapitulasi penjualan harian ke grup operasional'],
        maxStars: 5
      }
    ]
  },

  // ==========================================
  // 3. PAKET 5 MINGGU (ONBOARDING & LEADERSHIP SPECIALIST)
  // ==========================================
  {
    id: 'pkg-leadership-5weeks',
    name: 'Paket Onboarding Spesialis & Leadership Gerai (20 Misi • 5 Minggu)',
    code: 'PKG-MASTER-20',
    category: 'Orientasi & Spesialisasi',
    targetType: 'Program Onboarding & Gerai Baru',
    description: 'Program komprehensif 5 minggu untuk mencetak Store Specialist bersertifikasi #CleanLabel hingga kesiapan closing mandiri & manajemen shift.',
    totalMissions: 20,
    totalWeeks: 5,
    weeks: [
      { weekNumber: 1, title: 'Minggu 1: Edukasi #CleanLabel & Keamanan Cold Chain' },
      { weekNumber: 2, title: 'Minggu 2: Teknik Cold-Pressed & Sanitasi Mesin' },
      { weekNumber: 3, title: 'Minggu 3: Customer Hospitality & Konsultasi Sehat' },
      { weekNumber: 4, title: 'Minggu 4: Sistem Kasir POS Cashless & Audit Stok' },
      { weekNumber: 5, title: 'Minggu 5: Simulasi Shift Leader & Graduation Audit' }
    ],
    templates: [
      // Week 1
      {
        id: 'tmpl-mst-01',
        week: 1,
        codePrefix: 'MST-01',
        title: 'Ujian Prinsip Cold-Chain & Standar 2–4°C',
        category: 'Edukasi SOP',
        description: 'Mampu menjelaskan sains rantai dingin dan mengapa jus murni rusak jika terpapar suhu di atas 4°C.',
        requirements: ['Presentasi lisan pemahaman cold chain ke supervisor', 'Praktik monitoring suhu chiller display'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-02',
        week: 1,
        codePrefix: 'MST-02',
        title: 'Sertifikasi Kebersihan Diri & Higienitas Bar',
        category: 'Kebersihan',
        description: 'Demonstrasi kepatuhan seragam, kuku pendek higienis, apron bersih, hairnet, dan masker.',
        requirements: ['Pemeriksaan kelengkapan APD harian', 'Simulasi desinfeksi tangan sebelum bersentuhan dengan botol'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-03',
        week: 1,
        codePrefix: 'MST-03',
        title: 'Sanitasi Wadah Buah & Pisau Food-Grade',
        category: 'Kebersihan',
        description: 'Pembersihan alat perajang dan wadah penampung buah dengan larutan sanitasi bersertifikat BPOM.',
        requirements: ['Cuci wadah buah dengan deterjen food-grade', 'Keringkan peralatan di rak steril khusus'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-04',
        week: 1,
        codePrefix: 'MST-04',
        title: 'Verifikasi Kalibrasi Termometer Digital',
        category: 'Suhu Dingin',
        description: 'Pencatatan suhu 3 kali per shift pada logbook fisik dan verifikasi di sistem aplikasi.',
        requirements: ['Catat temperatur di logbook tepat waktu', 'Laporkan anomali suhu di atas 4°C segera'],
        maxStars: 5
      },
      // Week 2
      {
        id: 'tmpl-mst-05',
        week: 2,
        codePrefix: 'MST-05',
        title: 'Operasional Mesin Press Cold-Pressed Hidrolik',
        category: 'Teknis',
        description: 'Pemahaman operasional mesin peras hidrolik dingin tanpa gesekan panas.',
        requirements: ['Atur tekanan hidrolik sesuai panduan pabrik', 'Hindari pembebanan berlebih pada saringan buah'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-06',
        week: 2,
        codePrefix: 'MST-06',
        title: 'Blind Test & Kalibrasi 5 Varian Rasa Utama',
        category: 'Kualitas Buah',
        description: 'Uji kepekaan rasa untuk membedakan varian rasa manis apel fuji, nanas honi, dan keasaman lemon.',
        requirements: ['Mengenali 5 varian rasa dengan mata tertutup', 'Menjelaskan komposisi buah di setiap botol'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-07',
        week: 2,
        codePrefix: 'MST-07',
        title: 'Pembersihan Filter Saringan Ekstraktor',
        category: 'Kebersihan',
        description: 'Pembersihan ampas serat buah pada saringan halus dengan sikat khusus food-grade.',
        requirements: ['Bersihkan ampas tanpa merusak pori-pori saringan', 'Bilas dengan air mengalir bertekanan'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-08',
        week: 2,
        codePrefix: 'MST-08',
        title: 'Presisi Penuangan & Segel Botol Family Size',
        category: 'Presisi',
        description: 'Teknik pengisian botol 1350ml family size agar kedap udara dan tidak berbusa.',
        requirements: ['Isi botol sampai batas takaran leher', 'Pastikan tutup tersegel rapat anti bocor'],
        maxStars: 5
      },
      // Week 3
      {
        id: 'tmpl-mst-09',
        week: 3,
        codePrefix: 'MST-09',
        title: 'Standard Greeting & Hospitality Re.juve',
        category: 'Pelayanan',
        description: 'Penerapan senyum ramah, sapaan tulus, dan kesiapan melayani kebutuhan hidrasi sehat pelanggan.',
        requirements: ['Beri salam ramah dalam 3 detik saat pelanggan datang', 'Gunakan kalimat sopan dan bersahabat'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-10',
        week: 3,
        codePrefix: 'MST-10',
        title: 'Konsultasi Program Nutrisi & Detox',
        category: 'Edukasi',
        description: 'Menjelaskan fungsi cold-pressed juice untuk stamina, pencernaan, dan kebutuhan vitamin harian.',
        requirements: ['Berikan saran kombinasi jus hijau dan jeruk', 'Edukasi prinsip 100% murni tanpa pengawet'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-11',
        week: 3,
        codePrefix: 'MST-11',
        title: 'Kecepatan Pelayanan Jam Padat (< 30 Detik)',
        category: 'Pelayanan',
        description: 'Kecepatan barista mengambil botol dari chiller, input POS, dan menyerahkan ke pelanggan.',
        requirements: ['Selesaikan transaksi kasir dan serah produk < 30 detik', 'Konfirmasi ulang produk yang dibeli'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-12',
        week: 3,
        codePrefix: 'MST-12',
        title: 'Resolusi Komplain & Service Recovery',
        category: 'Pelayanan',
        description: 'Menangani situasi rasa asam/rusak dengan sigap, sopan, dan penggantian botol baru tanpa debat.',
        requirements: ['Ucapkan permohonan maaf dengan tulus', 'Ganti produk baru dan catat di logbook komplain'],
        maxStars: 5
      },
      // Week 4
      {
        id: 'tmpl-mst-13',
        week: 4,
        codePrefix: 'MST-13',
        title: 'Operasional POS Kasir & Transaksi Cashless',
        category: 'Kasir',
        description: 'Menguasai fitur POS, promo QRIS bank, loyalty point, dan split bill.',
        requirements: ['Input transaksi kasir tanpa kesalahan harga', 'Pastikan struk transaksi tercetak jelas'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-14',
        week: 4,
        codePrefix: 'MST-14',
        title: 'Opname Stok Fisik Harian & FIFO Display',
        category: 'Stok',
        description: 'Menghitung sisa botol di display dan storage box serta memastikan rotasi tanggal expired teratur.',
        requirements: ['Hitung sisa fisik botol dan cocokkan di POS', 'Tata botol dengan tanggal expired terdekat di depan'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-15',
        week: 4,
        codePrefix: 'MST-15',
        title: 'Rekonsiliasi Settlement EDC & Kas Harian',
        category: 'Kasir',
        description: 'Prosedur settlement bank EDC, penghitungan uang kas kecil, dan rekap mutasi harian.',
        requirements: ['Cetak settlement semua mesin EDC bank', 'Cocokkan nominal settlement dengan laporan sistem'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-16',
        week: 4,
        codePrefix: 'MST-16',
        title: 'Penerimaan Pasokan Bahan & Karantina Retur',
        category: 'Logistik',
        description: 'Pemeriksaan suhu truk pendingin delivery supplier dan pemilahan botol retur.',
        requirements: ['Cek suhu boks delivery supplier < 5°C', 'Tandatangani surat jalan barang dengan teliti'],
        maxStars: 5
      },
      // Week 5
      {
        id: 'tmpl-mst-17',
        week: 5,
        codePrefix: 'MST-17',
        title: 'Simulasi Peran Shift Leader & Pembagian Tugas',
        category: 'Kepemimpinan',
        description: 'Latihan memimpin briefing pagi, pembagian stasiun kerja kru, dan monitoring target harian gerai.',
        requirements: ['Pimpin briefing pagi selama 5 menit dengan energik', 'Alokasikan kru ke stasiun bar dan kasir'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-18',
        week: 5,
        codePrefix: 'MST-18',
        title: 'Audit Komprehensif HACCP & Kebersihan Gerai',
        category: 'Audit',
        description: 'Pemeriksaan menyeluruh 20 titik audit kepatuhan higienitas, pest control, dan cold chain.',
        requirements: ['Lengkapi lembar audit inspeksi 20 titik', 'Raih skor kepatuhan audit minimal 95%'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-19',
        week: 5,
        codePrefix: 'MST-19',
        title: 'Prosedur Closing Mandiri & Pengamanan Kasir',
        category: 'Closing',
        description: 'Melakukan seluruh tahapan penutupan gerai, kunci brankas, dan laporan harian tanpa supervisi.',
        requirements: ['Selesaikan checklist penutupan gerai 100%', 'Kunci seluruh pintu gerai dan brankas kasir'],
        maxStars: 5
      },
      {
        id: 'tmpl-mst-20',
        week: 5,
        codePrefix: 'MST-20',
        title: 'Evaluasi Kelulusan & Sertifikasi Store Specialist',
        category: 'Kelulusan',
        description: 'Ujian komprehensif bersama Store Leader dan District Manager untuk pengangkatan resmi.',
        requirements: ['Lulus uji kompetensi praktik & teori', 'Mendapatkan tanda tangan persetujuan kelulusan dari DM'],
        maxStars: 5
      }
    ]
  },

  // ==========================================
  // 4. PAKET 2 MINGGU (EXPRESS KIOSK & BANDARA)
  // ==========================================
  {
    id: 'pkg-kiosk-express',
    name: 'Paket Gerai Kiosk & Bandara Express (6 Misi • 2 Minggu)',
    code: 'PKG-KIOSK-06',
    category: 'Gerai Express',
    targetType: 'Kiosk & Bandara',
    description: 'Format ringkas 6 misi prioritas untuk format gerai island/kiosk: Fokus pada speed layanan kilat, chiller grab-and-go, dan kasir cashless.',
    totalMissions: 6,
    totalWeeks: 2,
    weeks: [
      { weekNumber: 1, title: 'Minggu 1: Kecepatan Layanan & Kasir' },
      { weekNumber: 2, title: 'Minggu 2: Suhu Display & Stok Grab-and-Go' }
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
        week: 1,
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
        week: 2,
        codePrefix: 'K-05',
        title: 'Opname Stok Harian & Rekonsiliasi EDC',
        category: 'Kasir',
        description: 'Pencocokan total botol terjual dengan struk settlement EDC harian.',
        requirements: ['Cetak settlement EDC bank', 'Hitung sisa fisik botol dan cocokkan di sistem'],
        maxStars: 5
      },
      {
        id: 'tmpl-kio-06',
        week: 2,
        codePrefix: 'K-06',
        title: 'Closing Kiosk & Kunci Pengaman Chiller',
        category: 'Closing',
        description: 'Prosedur tutup kiosk pulau di koridor mall / bandara.',
        requirements: ['Pasang gembok penutup chiller', 'Matikan lampu display dan rapikan banner'],
        maxStars: 5
      }
    ]
  }
]

// Default active single flat template list (for backwards-compatibility)
export const mockMissionTemplates = mockTemplatePackages[0].templates
