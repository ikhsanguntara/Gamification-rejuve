/**
 * Mock Data: Antrean Persetujuan District Manager (POV 1 User Mengerjakan 1 Misi)
 */

export const mockApprovals = [
  // ===================== BATCH 1 (Grand Indonesia) =====================
  {
    id: 'appr-001',
    evaluationId: 'eval-001-c1',
    missionId: 'msn-w2-001',
    missionCode: 'M-05',
    missionTitle: 'Cek Rasa & Kemanisan Alami Buah',
    missionCategory: 'Kualitas Produk',
    week: 2,
    batchId: 'batch-alpha',
    batchName: 'Batch 1 - Grand Indonesia',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Store Leader)',
    crewId: 'crew-001',
    crewName: 'Andi Pratama',
    crewAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    crewRole: 'Senior Barista',
    score: 95,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pemeriksaan rasa jus cold-pressed sangat segar dan takaran brix kemanisan buah presisi sesuai SOP.',
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto pengecekan sampel brix jus segar di GI'
      }
    ],
    submittedAt: '2026-08-20T11:00:00Z',
    reviewedAt: null
  },
  {
    id: 'appr-002',
    evaluationId: 'eval-001-c2',
    missionId: 'msn-w2-001',
    missionCode: 'M-05',
    missionTitle: 'Cek Rasa & Kemanisan Alami Buah',
    missionCategory: 'Kualitas Produk',
    week: 2,
    batchId: 'batch-alpha',
    batchName: 'Batch 1 - Grand Indonesia',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Store Leader)',
    crewId: 'crew-002',
    crewName: 'Bella Saphira',
    crewAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    crewRole: 'Junior Barista',
    score: 93,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Proses ekstraksi buah rapi dan higienis, rasa buah konsisten.',
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Lembar logbook pemeriksaan kualitas rasa harian GI'
      }
    ],
    submittedAt: '2026-08-20T11:15:00Z',
    reviewedAt: null
  },
  {
    id: 'appr-003',
    evaluationId: 'eval-002-c1',
    missionId: 'msn-w2-002',
    missionCode: 'M-06',
    missionTitle: 'Kecepatan Layanan Barista (< 45 Detik)',
    missionCategory: 'Kecepatan & Service',
    week: 2,
    batchId: 'batch-alpha',
    batchName: 'Batch 1 - Grand Indonesia',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Store Leader)',
    crewId: 'crew-001',
    crewName: 'Andi Pratama',
    crewAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    crewRole: 'Senior Barista',
    score: 88,
    calculatedStars: 4,
    status: 'PENDING_REVIEW',
    comment: 'Kerja cepat dan ramah, rata-rata waktu penyajian 40 detik saat jam makan siang.',
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto observasi counter antrean kasir GI'
      }
    ],
    submittedAt: '2026-08-21T14:30:00Z',
    reviewedAt: null
  },

  // ===================== BATCH 2 (Senayan City) =====================
  {
    id: 'appr-b2-001',
    evaluationId: 'eval-b2-001-c7',
    missionId: 'msn-b2-w1-001',
    missionCode: 'M-01',
    missionTitle: 'Cek Suhu Chiller (2–4°C)',
    missionCategory: 'Suhu Dingin',
    week: 1,
    batchId: 'batch-beta',
    batchName: 'Batch 2 - Senayan City',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Store Leader)',
    crewId: 'crew-007',
    crewName: 'Gita Gutawa',
    crewAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    crewRole: 'Senior Barista',
    score: 94,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pengecekan termometer infrared chiller Senayan City stabil di 2.8°C. Logbook diisi lengkap.',
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto termometer infrared pada chiller display Senayan City'
      }
    ],
    submittedAt: '2026-09-01T09:30:00Z',
    reviewedAt: null
  },

  // ===================== BATCH 3 (Pondok Indah Mall) =====================
  {
    id: 'appr-b3-001',
    evaluationId: 'eval-b3-001-c12',
    missionId: 'msn-b3-w3-001',
    missionCode: 'M-09',
    missionTitle: 'Pembersihan Total Chiller Mingguan',
    missionCategory: 'Kebersihan',
    week: 3,
    batchId: 'batch-gamma',
    batchName: 'Batch 3 - Pondok Indah Mall',
    supervisorId: 'spv-002',
    supervisorName: 'Dewi Lestari (Store Leader)',
    crewId: 'crew-012',
    crewName: 'Lina Marlina',
    crewAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    crewRole: 'Store Leader',
    score: 96,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pembersihan total chiller mingguan di PIM berjalan sangat baik. Semua rak disanitasi menyeluruh.',
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto rak chiller PIM setelah kuras & sanitasi'
      }
    ],
    submittedAt: '2026-09-01T09:00:00Z',
    reviewedAt: null
  }
]
