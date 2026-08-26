/**
 * Mock Data: Evaluasi Misi oleh Supervisor
 */

export const mockEvaluations = [
  {
    id: 'eval-001',
    missionId: 'msn-w2-001',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 94,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Pemeriksaan rasa jus segar dan proses pembuatan sudah sesuai standar. Disiplin kebersihan bar sangat baik.',
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
        caption: 'Foto pengecekan sampel rasa botol jus segar'
      },
      {
        id: 'ev-02',
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Lembar logbook pemeriksaan kualitas harian'
      }
    ],
    evaluatedAt: '2026-08-20T10:30:00Z',
    submittedAt: '2026-08-20T11:00:00Z',
    revisionHistory: []
  },
  {
    id: 'eval-002',
    missionId: 'msn-w2-002',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 82,
    calculatedStars: 4,
    status: 'REVISION_REQUIRED',
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
        caption: 'Foto observasi antrean di kasir'
      }
    ],
    evaluatedAt: '2026-08-21T14:00:00Z',
    submittedAt: '2026-08-21T14:30:00Z',
    revisionHistory: [
      {
        id: 'rev-01',
        reviewerId: 'head-001',
        reviewerName: 'Citra Dewi (Head of Ops)',
        requestedAt: '2026-08-21T16:00:00Z',
        note: 'Mohon evaluasi ulang pembagian tugas barista saat peak hours agar speed of service lebih optimal.'
      }
    ]
  }
]
