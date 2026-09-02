/**
 * Mock Data: Evaluasi Misi oleh Supervisor untuk Seluruh Batch
 */

export const mockEvaluations = [
  // ===================== BATCH 1 (SPV: Budi Santoso) =====================
  {
    id: 'eval-001',
    missionId: 'msn-w2-001',
    batchId: 'batch-alpha',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 94,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pemeriksaan rasa jus segar dan proses pembuatan di Grand Indonesia sudah sesuai standar. Disiplin kebersihan bar sangat baik.',
    crewScores: [
      { crewId: 'crew-001', score: 95, calculatedStars: 5 },
      { crewId: 'crew-002', score: 93, calculatedStars: 5 },
      { crewId: 'crew-003', score: 92, calculatedStars: 5 },
      { crewId: 'crew-004', score: 96, calculatedStars: 5 },
      { crewId: 'crew-005', score: 94, calculatedStars: 5 },
      { crewId: 'crew-006', score: 94, calculatedStars: 5 }
    ],
    evidence: [
      {
        id: 'ev-01',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto pengecekan sampel rasa botol jus segar di Grand Indonesia'
      },
      {
        id: 'ev-02',
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Lembar logbook pemeriksaan kualitas harian GI'
      }
    ],
    evaluatedAt: '2026-08-20T10:30:00Z',
    submittedAt: '2026-08-20T11:00:00Z',
    revisionHistory: []
  },
  {
    id: 'eval-002',
    missionId: 'msn-w2-002',
    batchId: 'batch-alpha',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 82,
    calculatedStars: 4,
    status: 'PENDING_REVIEW',
    comment: 'Layanan ramah, namun waktu pembuatan pesanan masih di atas 45 detik saat jam sibuk siang.',
    crewScores: [
      { crewId: 'crew-001', score: 85, calculatedStars: 4 },
      { crewId: 'crew-002', score: 82, calculatedStars: 4 },
      { crewId: 'crew-003', score: 80, calculatedStars: 4 },
      { crewId: 'crew-004', score: 84, calculatedStars: 4 },
      { crewId: 'crew-005', score: 80, calculatedStars: 4 },
      { crewId: 'crew-006', score: 81, calculatedStars: 4 }
    ],
    evidence: [
      {
        id: 'ev-03',
        url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto observasi antrean di kasir GI'
      }
    ],
    evaluatedAt: '2026-08-21T14:00:00Z',
    submittedAt: '2026-08-21T14:30:00Z',
    revisionHistory: [
      {
        id: 'rev-01',
        reviewerId: 'head-001',
        reviewerName: 'Ahmad Dahlan (Head of Ops)',
        requestedAt: '2026-08-21T16:00:00Z',
        note: 'Mohon evaluasi ulang pembagian tugas barista saat peak hours agar speed of service lebih optimal.'
      }
    ]
  },

  // ===================== BATCH 2 (SPV: Budi Santoso) =====================
  {
    id: 'eval-b2-001',
    missionId: 'msn-b2-w1-001',
    batchId: 'batch-beta',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 93,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pengecekan suhu chiller di Senayan City stabil di 2.8°C. Pencatatan logbook sangat rapi dan tertib.',
    crewScores: [
      { crewId: 'crew-007', score: 94, calculatedStars: 5 },
      { crewId: 'crew-008', score: 92, calculatedStars: 5 },
      { crewId: 'crew-009', score: 93, calculatedStars: 5 },
      { crewId: 'crew-010', score: 95, calculatedStars: 5 },
      { crewId: 'crew-011', score: 91, calculatedStars: 5 }
    ],
    evidence: [
      {
        id: 'ev-b2-01',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto termometer infrared pada chiller Senayan City'
      }
    ],
    evaluatedAt: '2026-09-01T09:00:00Z',
    submittedAt: '2026-09-01T09:30:00Z',
    revisionHistory: []
  },

  // ===================== BATCH 3 (SPV: Dewi Lestari) =====================
  {
    id: 'eval-b3-001',
    missionId: 'msn-b3-w3-001',
    batchId: 'batch-gamma',
    supervisorId: 'spv-002',
    supervisorName: 'Dewi Lestari',
    averageScore: 95,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pembersihan total chiller mingguan di Pondok Indah Mall berjalan sangat baik. Semua rak disanitasi menyeluruh.',
    crewScores: [
      { crewId: 'crew-012', score: 96, calculatedStars: 5 },
      { crewId: 'crew-013', score: 94, calculatedStars: 5 },
      { crewId: 'crew-014', score: 95, calculatedStars: 5 },
      { crewId: 'crew-015', score: 95, calculatedStars: 5 }
    ],
    evidence: [
      {
        id: 'ev-b3-01',
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto rak chiller PIM setelah kuras & sanitasi'
      }
    ],
    evaluatedAt: '2026-09-01T08:30:00Z',
    submittedAt: '2026-09-01T09:00:00Z',
    revisionHistory: []
  }
]
