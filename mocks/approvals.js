/**
 * Mock Data: Antrean Persetujuan Head of Operations untuk Seluruh Batch
 */

export const mockApprovals = [
  // ===================== BATCH 1 (Head: Ahmad Dahlan) =====================
  {
    id: 'appr-001',
    evaluationId: 'eval-001',
    missionId: 'msn-w2-001',
    missionCode: 'M-05',
    missionTitle: 'Cek Rasa & Kemanisan Alami Buah',
    week: 2,
    batchId: 'batch-alpha',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 94,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pemeriksaan rasa jus segar dan proses pembuatan di Grand Indonesia sudah sesuai standar. Disiplin kebersihan bar sangat baik.',
    crewScores: [
      { crewId: 'crew-001', crewName: 'Andi Pratama', score: 95, calculatedStars: 5 },
      { crewId: 'crew-002', crewName: 'Bella Saphira', score: 93, calculatedStars: 5 },
      { crewId: 'crew-003', crewName: 'Candra Wijaya', score: 92, calculatedStars: 5 },
      { crewId: 'crew-004', crewName: 'Dedi Kurniawan', score: 96, calculatedStars: 5 },
      { crewId: 'crew-005', crewName: 'Eka Putri', score: 94, calculatedStars: 5 },
      { crewId: 'crew-006', crewName: 'Fajar Nugraha', score: 94, calculatedStars: 5 }
    ],
    evidenceCount: 2,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto pengecekan sampel rasa botol jus segar di Grand Indonesia'
      },
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Lembar logbook pemeriksaan kualitas harian GI'
      }
    ],
    submittedAt: '2026-08-20T11:00:00Z',
    reviewedAt: null,
    revisionNote: null
  },
  {
    id: 'appr-002',
    evaluationId: 'eval-002',
    missionId: 'msn-w2-002',
    missionCode: 'M-06',
    missionTitle: 'Kecepatan Layanan Barista (< 45 Detik)',
    week: 2,
    batchId: 'batch-alpha',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 82,
    calculatedStars: 4,
    status: 'PENDING_REVIEW',
    comment: 'Layanan ramah, namun waktu pembuatan pesanan masih di atas 45 detik saat jam sibuk siang.',
    crewScores: [
      { crewId: 'crew-001', crewName: 'Andi Pratama', score: 85, calculatedStars: 4 },
      { crewId: 'crew-002', crewName: 'Bella Saphira', score: 82, calculatedStars: 4 },
      { crewId: 'crew-003', crewName: 'Candra Wijaya', score: 80, calculatedStars: 4 },
      { crewId: 'crew-004', crewName: 'Dedi Kurniawan', score: 84, calculatedStars: 4 },
      { crewId: 'crew-005', crewName: 'Eka Putri', score: 80, calculatedStars: 4 },
      { crewId: 'crew-006', crewName: 'Fajar Nugraha', score: 81, calculatedStars: 4 }
    ],
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto observasi antrean di kasir GI'
      }
    ],
    submittedAt: '2026-08-21T14:30:00Z',
    reviewedAt: '2026-08-21T16:00:00Z',
    revisionNote: 'Mohon evaluasi ulang pembagian tugas barista saat peak hours agar speed of service lebih optimal.'
  },

  // ===================== BATCH 2 (Head: Ahmad Dahlan) =====================
  {
    id: 'appr-b2-001',
    evaluationId: 'eval-b2-001',
    missionId: 'msn-b2-w1-001',
    missionCode: 'M-01',
    missionTitle: 'Cek Suhu Chiller (2–4°C) - Senayan City',
    week: 1,
    batchId: 'batch-beta',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 93,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pengecekan suhu chiller di Senayan City stabil di 2.8°C. Pencatatan logbook sangat rapi dan tertib.',
    crewScores: [
      { crewId: 'crew-007', crewName: 'Gita Gutawa', score: 94, calculatedStars: 5 },
      { crewId: 'crew-008', crewName: 'Hendra Setiawan', score: 92, calculatedStars: 5 },
      { crewId: 'crew-009', crewName: 'Indah Permata', score: 93, calculatedStars: 5 },
      { crewId: 'crew-010', crewName: 'Joko Widodo', score: 95, calculatedStars: 5 },
      { crewId: 'crew-011', crewName: 'Kurnia Meiga', score: 91, calculatedStars: 5 }
    ],
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto termometer infrared pada chiller Senayan City'
      }
    ],
    submittedAt: '2026-09-01T09:30:00Z',
    reviewedAt: null,
    revisionNote: null
  },

  // ===================== BATCH 3 (Head: Citra Dewi) =====================
  {
    id: 'appr-b3-001',
    evaluationId: 'eval-b3-001',
    missionId: 'msn-b3-w3-001',
    missionCode: 'M-09',
    missionTitle: 'Pembersihan Total Chiller Mingguan - PIM',
    week: 3,
    batchId: 'batch-gamma',
    supervisorId: 'spv-002',
    supervisorName: 'Dewi Lestari',
    averageScore: 95,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pembersihan total chiller mingguan di Pondok Indah Mall berjalan sangat baik. Semua rak disanitasi menyeluruh.',
    crewScores: [
      { crewId: 'crew-012', crewName: 'Lina Marlina', score: 96, calculatedStars: 5 },
      { crewId: 'crew-013', crewName: 'Muhammad Ridwan', score: 94, calculatedStars: 5 },
      { crewId: 'crew-014', crewName: 'Nurul Hidayah', score: 95, calculatedStars: 5 },
      { crewId: 'crew-015', crewName: 'Oscar Pratama', score: 95, calculatedStars: 5 }
    ],
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Foto rak chiller PIM setelah kuras & sanitasi'
      }
    ],
    submittedAt: '2026-09-01T09:00:00Z',
    reviewedAt: null,
    revisionNote: null
  }
]
