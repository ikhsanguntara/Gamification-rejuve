/**
 * Mock Data: Misi Operasional Gerai Re.juve
 * Format ringkas, jelas, dan realistis untuk operasional harian gerai.
 */

export const mockMissions = [
  // ===================== WEEK 1 (COMPLETED) =====================
  {
    id: 'msn-w1-001',
    batchId: 'batch-alpha',
    week: 1,
    code: 'M-01',
    title: 'Cek Suhu Chiller (2–4°C)',
    category: 'Suhu Dingin',
    description: 'Pastikan suhu chiller display dan penyimpanan stabil di 2–4°C setiap pagi dan sore.',
    requirements: [
      'Catat suhu chiller pada logbook pagi dan sore (2–4°C)',
      'Pastikan pintu chiller tertutup rapat dan tidak ada kebocoran udara dingin'
    ],
    deadline: '2026-08-16',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'COMPLETED',
    averageScore: 94,
    awardedStars: 5,
    crewEvaluations: [
      { crewId: 'crew-001', score: 95, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-002', score: 93, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-003', score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-004', score: 96, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-005', score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-006', score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }
    ]
  },
  {
    id: 'msn-w1-002',
    batchId: 'batch-alpha',
    week: 1,
    code: 'M-02',
    title: 'Sanitasi Mesin Press & Meja Bar',
    category: 'Kebersihan',
    description: 'Bersihkan mesin press jus, nampan penampung, dan meja bar agar selalu bersih higienis.',
    requirements: [
      'Cuci plat dan corong mesin press dengan cairan food-grade',
      'Lap meja bar dan pastikan tidak ada sisa tetesan jus'
    ],
    deadline: '2026-08-16',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'COMPLETED',
    averageScore: 92,
    awardedStars: 5,
    crewEvaluations: [
      { crewId: 'crew-001', score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-002', score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-003', score: 90, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-004', score: 93, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-005', score: 91, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-006', score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }
    ]
  },
  {
    id: 'msn-w1-003',
    batchId: 'batch-alpha',
    week: 1,
    code: 'M-03',
    title: 'Sortir & Cuci Buah Segar',
    category: 'Kualitas Buah',
    description: 'Pilih buah yang masuk (apel, nanas, bayam), buang yang rusak, dan cuci bersih sebelum diproses.',
    requirements: [
      'Pisahkan buah yang memar atau tidak layak konsumsi',
      'Cuci buah dengan air mengalir bersih sesuai SOP'
    ],
    deadline: '2026-08-16',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'COMPLETED',
    averageScore: 91,
    awardedStars: 5,
    crewEvaluations: [
      { crewId: 'crew-001', score: 93, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-002', score: 90, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-003', score: 91, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-004', score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-005', score: 89, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' },
      { crewId: 'crew-006', score: 91, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }
    ]
  },
  {
    id: 'msn-w1-004',
    batchId: 'batch-alpha',
    week: 1,
    code: 'M-04',
    title: 'Kerapian Seragam & APD Crew',
    category: 'Kerapian',
    description: 'Pastikan seluruh crew memakai seragam bersih, apron, masker, dan hairnet dengan rapi saat melayani.',
    requirements: [
      'Pakai apron bersih, hairnet, dan masker lengkap',
      'Kuku bersih dan tidak memakai aksesoris tangan saat bertugas'
    ],
    deadline: '2026-08-16',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'COMPLETED',
    averageScore: 95,
    awardedStars: 5,
    crewEvaluations: [
      { crewId: 'crew-001', score: 96, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-002', score: 95, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-003', score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-004', score: 95, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-005', score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-006', score: 96, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }
    ]
  },

  // ===================== WEEK 2 (ACTIVE) =====================
  {
    id: 'msn-w2-001',
    batchId: 'batch-alpha',
    week: 2,
    code: 'M-05',
    title: 'Cek Rasa & Kemanisan Alami Buah',
    category: 'Kualitas Buah',
    description: 'Uji sampel rasa jus sebelum dikemas ke botol agar rasa 100% segar dan alami tanpa gula tambahan.',
    requirements: [
      'Cek sampel rasa per batch jus yang diproduksi',
      'Pastikan tidak ada penambahan air atau pemanis buatan'
    ],
    deadline: '2026-08-23',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'PENDING_REVIEW',
    averageScore: 94,
    calculatedStars: 5,
    awardedStars: null,
    crewEvaluations: [
      { crewId: 'crew-001', score: 95, calculatedStars: 5, status: 'PENDING_REVIEW' },
      { crewId: 'crew-002', score: 93, calculatedStars: 5, status: 'PENDING_REVIEW' },
      { crewId: 'crew-003', score: 92, calculatedStars: 5, status: 'PENDING_REVIEW' },
      { crewId: 'crew-004', score: 96, calculatedStars: 5, status: 'PENDING_REVIEW' },
      { crewId: 'crew-005', score: 94, calculatedStars: 5, status: 'PENDING_REVIEW' },
      { crewId: 'crew-006', score: 94, calculatedStars: 5, status: 'PENDING_REVIEW' }
    ]
  },
  {
    id: 'msn-w2-002',
    batchId: 'batch-alpha',
    week: 2,
    code: 'M-06',
    title: 'Kecepatan Layanan Barista (< 45 Detik)',
    category: 'Pelayanan',
    description: 'Sambut customer dengan ramah dan siapkan produk pesanan dalam waktu kurang dari 45 detik.',
    requirements: [
      'Beri salam ramah kepada setiap customer yang datang',
      'Serahkan pesanan tepat waktu dan kemas dengan rapi'
    ],
    deadline: '2026-08-23',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'REVISION_REQUIRED',
    averageScore: 82,
    calculatedStars: 4,
    awardedStars: null,
    crewEvaluations: [
      { crewId: 'crew-001', score: 85, calculatedStars: 4, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-002', score: 82, calculatedStars: 4, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-003', score: 80, calculatedStars: 4, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-004', score: 84, calculatedStars: 4, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-005', score: 80, calculatedStars: 4, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-006', score: 81, calculatedStars: 4, status: 'REVISION_REQUIRED' }
    ]
  },
  {
    id: 'msn-w2-003',
    batchId: 'batch-alpha',
    week: 2,
    code: 'M-07',
    title: 'Cek Tanggal Expired & Rotasi FIFO',
    category: 'Stok',
    description: 'Pajang botol jus di chiller dengan sistem FIFO (First In, First Out). Tanggal terdekat di depan.',
    requirements: [
      'Letakkan botol dengan expired date terdekat di baris paling depan',
      'Pisahkan botol yang sudah mendekati batas tanggal konsumsi'
    ],
    deadline: '2026-08-23',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'IN_PROGRESS',
    averageScore: 0,
    calculatedStars: null,
    awardedStars: null,
    crewEvaluations: []
  },
  {
    id: 'msn-w2-004',
    batchId: 'batch-alpha',
    week: 2,
    code: 'M-08',
    title: 'Kebersihan Wastafel & Area Kasir',
    category: 'Kebersihan',
    description: 'Jaga area kasir tetap rapi, wastafel cuci tangan selalu bersih, dan sabun selalu terisi.',
    requirements: [
      'Pastikan sabun cuci tangan dan tisu selalu tersedia',
      'Bersihkan meja kasir dan buang sampah sebelum penuh'
    ],
    deadline: '2026-08-23',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'IN_PROGRESS',
    averageScore: 0,
    calculatedStars: null,
    awardedStars: null,
    crewEvaluations: []
  },

  // ===================== WEEK 3 (LOCKED / UPCOMING) =====================
  {
    id: 'msn-w3-001',
    batchId: 'batch-alpha',
    week: 3,
    code: 'M-09',
    title: 'Pembersihan Total Chiller Mingguan',
    category: 'Kebersihan',
    description: 'Kuras dan bersihkan rak chiller display & chiller gudang secara menyeluruh di akhir minggu.',
    requirements: [
      'Pindahkan botol jus ke chiller cadangan saat dibersihkan',
      'Lap rak chiller hingga bersih kering dan susun kembali dengan rapi'
    ],
    deadline: '2026-08-30',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'LOCKED',
    averageScore: 0,
    calculatedStars: null,
    awardedStars: null,
    crewEvaluations: []
  },
  {
    id: 'msn-w3-002',
    batchId: 'batch-alpha',
    week: 3,
    code: 'M-10',
    title: 'Rekap & Opname Stok Botol Harian',
    category: 'Stok',
    description: 'Hitung sisa stok botol jus fisik di gerai dan cocokkan dengan data sistem kasir.',
    requirements: [
      'Hitung fisik botol per varian rasa',
      'Catat dan laporkan jika ada selisih stok harian'
    ],
    deadline: '2026-08-30',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'LOCKED',
    averageScore: 0,
    calculatedStars: null,
    awardedStars: null,
    crewEvaluations: []
  },
  {
    id: 'msn-w3-003',
    batchId: 'batch-alpha',
    week: 3,
    code: 'M-11',
    title: 'Cek Mesin Kasir POS & EDC',
    category: 'Kasir',
    description: 'Pastikan mesin kasir (POS), mesin EDC pembayaran, dan printer struk berfungsi lancar.',
    requirements: [
      'Tes mesin kasir & EDC sebelum buka gerai',
      'Pastikan kertas struk terpasang rapi'
    ],
    deadline: '2026-08-30',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'LOCKED',
    averageScore: 0,
    calculatedStars: null,
    awardedStars: null,
    crewEvaluations: []
  },
  {
    id: 'msn-w3-004',
    batchId: 'batch-alpha',
    week: 3,
    code: 'M-12',
    title: 'Closing Gerai & Evaluasi Siklus',
    category: 'Closing',
    description: 'Lakukan checklist penutupan gerai, matikan peralatan non-chiller, dan pastikan chiller tetap menyala aman.',
    requirements: [
      'Pastikan seluruh chiller menyala 24 jam dan suhu stabil',
      'Kunci pintu gerai dan pastikan area kasir rapi aman'
    ],
    deadline: '2026-08-30',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'LOCKED',
    averageScore: 0,
    calculatedStars: null,
    awardedStars: null,
    crewEvaluations: []
  }
]
