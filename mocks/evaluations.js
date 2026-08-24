/**
 * Mock Data: Multi-Crew Store Evaluations (Store-Wide Mission Evaluations)
 * Re.juve Indonesia Store Batches
 */

export const mockEvaluations = [
  {
    id: 'eval-001',
    missionId: 'msn-w2-001',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 92,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Audit ekstraksi cold-pressed u.Glow dan Asian Green berjalan sangat baik. Semua 6 crew mematuhi SOP rasio ekstraksi 100% Pure tanpa air dan gula.',
    crewScores: [
      { crewId: 'crew-001', score: 95, calculatedStars: 5 },
      { crewId: 'crew-002', score: 93, calculatedStars: 5 },
      { crewId: 'crew-003', score: 91, calculatedStars: 5 },
      { crewId: 'crew-004', score: 89, calculatedStars: 4 },
      { crewId: 'crew-005', score: 92, calculatedStars: 5 },
      { crewId: 'crew-006', score: 90, calculatedStars: 5 }
    ],
    evidence: [
      {
        id: 'ev-01',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Refractometer Brix level log & yield measurement'
      },
      {
        id: 'ev-02',
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Cold-pressed quality certificate signed by team'
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
    averageScore: 78,
    calculatedStars: 3,
    status: 'REVISION_REQUIRED',
    comment: 'Sanitasi kaca display dan order counter sudah dilakukan, namun rekaman swab test ATP di prep bar belakang belum lengkap.',
    crewScores: [
      { crewId: 'crew-001', score: 82, calculatedStars: 4 },
      { crewId: 'crew-002', score: 76, calculatedStars: 3 },
      { crewId: 'crew-003', score: 80, calculatedStars: 4 },
      { crewId: 'crew-004', score: 75, calculatedStars: 3 },
      { crewId: 'crew-005', score: 78, calculatedStars: 3 },
      { crewId: 'crew-006', score: 77, calculatedStars: 3 }
    ],
    evidence: [
      {
        id: 'ev-03',
        url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
        caption: 'Store front glass and counter sanitation check'
      }
    ],
    evaluatedAt: '2026-08-19T14:15:00Z',
    submittedAt: '2026-08-19T15:00:00Z',
    revisionHistory: [
      {
        id: 'rev-01',
        revisionNumber: 1,
        requestedBy: 'Ahmad Dahlan (Head)',
        requestedAt: '2026-08-20T09:15:00Z',
        note: 'Mohon lengkapi bukti foto swab test ATP di area prep counter juice dan log pembuangan ampas organik sebelum approval.',
        status: 'PENDING_SUPERVISOR_ACTION'
      }
    ]
  },
  {
    id: 'eval-003',
    missionId: 'msn-w2-003',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 86,
    calculatedStars: 4,
    status: 'DRAFT',
    comment: 'Stock count botol rPET dan kemasan almond milk di chiller display cocok dengan sistem POS.',
    crewScores: [
      { crewId: 'crew-001', score: 88, calculatedStars: 4 },
      { crewId: 'crew-002', score: 85, calculatedStars: 4 },
      { crewId: 'crew-003', score: 87, calculatedStars: 4 },
      { crewId: 'crew-004', score: 86, calculatedStars: 4 },
      { crewId: 'crew-005', score: 84, calculatedStars: 4 },
      { crewId: 'crew-006', score: 86, calculatedStars: 4 }
    ],
    evidence: [
      {
        id: 'ev-04',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
        caption: 'Chiller inventory reconciliation scanning'
      }
    ],
    evaluatedAt: '2026-08-21T08:45:00Z',
    submittedAt: null,
    revisionHistory: []
  },
  {
    id: 'eval-004',
    missionId: 'msn-w1-001',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 92,
    calculatedStars: 5,
    status: 'APPROVED',
    comment: 'Audit suhu chiller display dan walk-in cold room stabil sempurna di kisaran 2.4°C - 3.2°C sepanjang minggu.',
    crewScores: [
      { crewId: 'crew-001', score: 95, calculatedStars: 5 },
      { crewId: 'crew-002', score: 92, calculatedStars: 5 },
      { crewId: 'crew-003', score: 90, calculatedStars: 5 },
      { crewId: 'crew-004', score: 88, calculatedStars: 4 },
      { crewId: 'crew-005', score: 94, calculatedStars: 5 },
      { crewId: 'crew-006', score: 93, calculatedStars: 5 }
    ],
    evidence: [
      {
        id: 'ev-06',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Digital cold chain temperature sensor reading 2.8°C'
      }
    ],
    evaluatedAt: '2026-08-14T10:00:00Z',
    submittedAt: '2026-08-14T11:00:00Z',
    reviewedAt: '2026-08-15T14:20:00Z',
    headReviewerName: 'Ahmad Dahlan (Head)',
    revisionHistory: []
  }
]
