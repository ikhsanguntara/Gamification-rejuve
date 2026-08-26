/**
 * Mock Data: Antrean Persetujuan Head of Operations
 */

export const mockApprovals = [
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
    comment: 'Pemeriksaan rasa jus segar dan proses pembuatan sudah sesuai standar. Disiplin kebersihan bar sangat baik.',
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
        caption: 'Foto pengecekan sampel rasa botol jus segar'
      },
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Lembar logbook pemeriksaan kualitas harian'
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
    status: 'REVISION_REQUIRED',
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
        caption: 'Foto observasi antrean di kasir'
      }
    ],
    submittedAt: '2026-08-21T14:30:00Z',
    reviewedAt: '2026-08-21T16:00:00Z',
    revisionNote: 'Mohon evaluasi ulang pembagian tugas barista saat peak hours agar speed of service lebih optimal.'
  }
]
