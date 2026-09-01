/**
 * Mock Data: Misi Operasional Gerai Re.juve untuk Seluruh Batch (Batch 1, Batch 2, Batch 3)
 * Format ringkas, jelas, dan realistis untuk operasional harian gerai.
 */

// Master Blueprint Missions
const standardMissionTemplates = [
  // Week 1
  {
    code: 'M-01',
    week: 1,
    title: 'Cek Suhu Chiller (2–4°C)',
    category: 'Suhu Dingin',
    description: 'Pastikan suhu chiller display dan penyimpanan stabil di 2–4°C setiap pagi dan sore.',
    requirements: [
      'Catat suhu chiller pada logbook pagi dan sore (2–4°C)',
      'Pastikan pintu chiller tertutup rapat dan tidak ada kebocoran udara dingin'
    ]
  },
  {
    code: 'M-02',
    week: 1,
    title: 'Sanitasi Mesin Press & Meja Bar',
    category: 'Kebersihan',
    description: 'Bersihkan mesin press jus, nampan penampung, dan meja bar agar selalu bersih higienis.',
    requirements: [
      'Cuci plat dan corong mesin press dengan cairan food-grade',
      'Lap meja bar dan pastikan tidak ada sisa tetesan jus'
    ]
  },
  {
    code: 'M-03',
    week: 1,
    title: 'Sortir & Cuci Buah Segar',
    category: 'Kualitas Buah',
    description: 'Pilih buah yang masuk (apel, nanas, bayam), buang yang rusak, dan cuci bersih sebelum diproses.',
    requirements: [
      'Pisahkan buah yang memar atau tidak layak konsumsi',
      'Cuci buah dengan air mengalir bersih sesuai SOP'
    ]
  },
  {
    code: 'M-04',
    week: 1,
    title: 'Kerapian Seragam & APD Crew',
    category: 'Standar Tim',
    description: 'Seluruh crew wajib menggunakan celemek bersih, topi/hairnet, masker, dan name tag standar.',
    requirements: [
      'Gunakan hairnet rapat dan celemek bebas noda',
      'Cuci tangan 7 langkah sebelum menyentuh produk'
    ]
  },

  // Week 2
  {
    code: 'M-05',
    week: 2,
    title: 'Cek Rasa & Kemanisan Alami Buah',
    category: 'Kualitas Buah',
    description: 'Uji sampel rasa jus apel dan nanas sebelum dikemas ke botol agar rasa 100% segar dan alami.',
    requirements: [
      'Cek sampel rasa per batch jus yang diproduksi',
      'Pastikan tidak ada penambahan air, gula, atau pengawet (#CleanLabel)'
    ]
  },
  {
    code: 'M-06',
    week: 2,
    title: 'Kecepatan Layanan Barista (< 45 Detik)',
    category: 'Pelayanan',
    description: 'Sambut customer dengan ramah dan siapkan produk pesanan dalam waktu kurang dari 45 detik.',
    requirements: [
      'Beri salam ramah (Greeting standar Re.juve)',
      'Serahkan pesanan tepat waktu dan kemas dengan kantong ramah lingkungan'
    ]
  },
  {
    code: 'M-07',
    week: 2,
    title: 'Display & FIFO Botol Jus di Showcase',
    category: 'Display',
    description: 'Tata botol jus di chiller display menghadap depan dengan label jelas, terapkan sistem FIFO ketat.',
    requirements: [
      'Pastikan produk dengan masa simpan terdekat berada di baris terdepan',
      'Semua logo botol menghadap ke depan dengan rapi'
    ]
  },
  {
    code: 'M-08',
    week: 2,
    title: 'Kebersihan Area Kasir & Wastafel',
    category: 'Kebersihan',
    description: 'Pastikan mesin POS, EDC, counter kasir, dan wastafel cuci tangan selalu kering dan wangi.',
    requirements: [
      'Lap meja kasir berkala dan rapikan struk belanja',
      'Pastikan sabun cuci tangan dan tisu wastafel selalu terisi penuh'
    ]
  },

  // Week 3
  {
    code: 'M-09',
    week: 3,
    title: 'Pembersihan Total Chiller Mingguan',
    category: 'Kebersihan',
    description: 'Kuras dan bersihkan rak chiller display serta chiller penyimpanan belakang secara menyeluruh.',
    requirements: [
      'Pindahkan botol jus ke cooler box sementara saat rak dibersihkan',
      'Lap rak dengan cairan disinfektan food-grade dan keringkan'
    ]
  },
  {
    code: 'M-10',
    week: 3,
    title: 'Kalibrasi Timbangan & Termometer',
    category: 'Peralatan',
    description: 'Uji akurasi timbangan digital gramasi buah dan termometer infrared chiller.',
    requirements: [
      'Lakukan tes kalibrasi dengan anak timbang standar',
      'Catat hasil pengujian pada kartu pemeliharaan alat'
    ]
  },
  {
    code: 'M-11',
    week: 3,
    title: 'Stock Opname Buah, Botol & Tutup',
    category: 'Inventaris',
    description: 'Hitung fisik sisa stok buah segar, botol kosong, tutup botol, dan kantong belanja.',
    requirements: [
      'Hitung fisik stok dan cocokkan dengan sistem POS',
      'Laporkan selisih (jika ada) ke supervisor sebelum tutup buku'
    ]
  },
  {
    code: 'M-12',
    week: 3,
    title: 'Closing Gerai & Evaluasi Siklus',
    category: 'Closing',
    description: 'Lakukan checklist penutupan gerai, matikan peralatan non-chiller, dan pastikan chiller tetap menyala aman.',
    requirements: [
      'Pastikan seluruh chiller menyala 24 jam dan suhu stabil',
      'Kunci pintu gerai dan pastikan area kasir rapi aman'
    ]
  }
]

// ===================== GENERATE MISSIONS FOR BATCH 1 =====================
const batch1Crews = ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006']
const batch1Missions = standardMissionTemplates.map((tpl, idx) => {
  const mNum = idx + 1
  let status = 'LOCKED'
  let avgScore = 0
  let awardedStars = null
  let calculatedStars = null
  let crewEvals = []

  if (tpl.week === 1) {
    status = 'COMPLETED'
    avgScore = 93
    awardedStars = 5
    calculatedStars = 5
    crewEvals = batch1Crews.map(cId => ({ crewId: cId, score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }))
  } else if (tpl.week === 2) {
    if (mNum === 5) {
      status = 'PENDING_REVIEW'
      avgScore = 94
      calculatedStars = 5
      crewEvals = batch1Crews.map(cId => ({ crewId: cId, score: 95, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' }))
    } else if (mNum === 6) {
      status = 'PENDING_REVIEW'
      avgScore = 82
      calculatedStars = 4
      crewEvals = batch1Crews.map(cId => ({ crewId: cId, score: 82, calculatedStars: 4, awardedStars: 0, status: 'PENDING_REVIEW' }))
    } else {
      status = 'IN_PROGRESS'
      avgScore = 0
      crewEvals = []
    }
  }

  return {
    id: `msn-w${tpl.week}-00${((idx % 4) + 1)}`,
    batchId: 'batch-alpha',
    week: tpl.week,
    code: tpl.code,
    title: tpl.title,
    category: tpl.category,
    description: tpl.description,
    requirements: tpl.requirements,
    deadline: tpl.week === 1 ? '2026-08-31' : tpl.week === 2 ? '2026-09-07' : '2026-09-15',
    maxStars: 5,
    assignedCrewIds: batch1Crews,
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status,
    averageScore: avgScore,
    calculatedStars,
    awardedStars,
    crewEvaluations: crewEvals
  }
})

// ===================== GENERATE MISSIONS FOR BATCH 2 =====================
const batch2Crews = ['crew-007', 'crew-008', 'crew-009', 'crew-010', 'crew-011']
const batch2Missions = standardMissionTemplates.map((tpl, idx) => {
  const mNum = idx + 1
  let status = 'LOCKED'
  let avgScore = 0
  let awardedStars = null
  let calculatedStars = null
  let crewEvals = []

  if (tpl.week === 1) {
    if (mNum === 1) {
      status = 'PENDING_REVIEW'
      avgScore = 93
      calculatedStars = 5
      crewEvals = batch2Crews.map(cId => ({ crewId: cId, score: 93, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' }))
    } else {
      status = 'IN_PROGRESS'
      avgScore = 0
      crewEvals = []
    }
  }

  return {
    id: `msn-b2-w${tpl.week}-00${((idx % 4) + 1)}`,
    batchId: 'batch-beta',
    week: tpl.week,
    code: tpl.code,
    title: `${tpl.title} - Senayan City`,
    category: tpl.category,
    description: `${tpl.description} (Outlet Senayan City)`,
    requirements: tpl.requirements,
    deadline: tpl.week === 1 ? '2026-09-07' : tpl.week === 2 ? '2026-09-14' : '2026-09-22',
    maxStars: 5,
    assignedCrewIds: batch2Crews,
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status,
    averageScore: avgScore,
    calculatedStars,
    awardedStars,
    crewEvaluations: crewEvals
  }
})

// ===================== GENERATE MISSIONS FOR BATCH 3 =====================
const batch3Crews = ['crew-012', 'crew-013', 'crew-014', 'crew-015']
const batch3Missions = standardMissionTemplates.map((tpl, idx) => {
  const mNum = idx + 1
  let status = 'LOCKED'
  let avgScore = 0
  let awardedStars = null
  let calculatedStars = null
  let crewEvals = []

  if (tpl.week === 1 || tpl.week === 2) {
    status = 'COMPLETED'
    avgScore = 92
    awardedStars = 5
    calculatedStars = 5
    crewEvals = batch3Crews.map(cId => ({ crewId: cId, score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }))
  } else if (tpl.week === 3) {
    if (mNum === 9) {
      status = 'PENDING_REVIEW'
      avgScore = 95
      calculatedStars = 5
      crewEvals = batch3Crews.map(cId => ({ crewId: cId, score: 95, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' }))
    } else {
      status = 'IN_PROGRESS'
      avgScore = 0
      crewEvals = []
    }
  }

  return {
    id: `msn-b3-w${tpl.week}-00${((idx % 4) + 1)}`,
    batchId: 'batch-gamma',
    week: tpl.week,
    code: tpl.code,
    title: `${tpl.title} - PIM`,
    category: tpl.category,
    description: `${tpl.description} (Outlet Pondok Indah Mall)`,
    requirements: tpl.requirements,
    deadline: tpl.week === 1 ? '2026-08-24' : tpl.week === 2 ? '2026-08-31' : '2026-09-08',
    maxStars: 5,
    assignedCrewIds: batch3Crews,
    supervisorId: 'spv-002',
    supervisorName: 'Dewi Lestari (Supervisor)',
    status,
    averageScore: avgScore,
    calculatedStars,
    awardedStars,
    crewEvaluations: crewEvals
  }
})

export const mockMissions = [
  ...batch1Missions,
  ...batch2Missions,
  ...batch3Missions
]
