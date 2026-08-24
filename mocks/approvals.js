/**
 * Mock Data: Approval Items Queue for Head Review (Store-Wide Multi-Crew Missions)
 */

export const mockApprovals = [
  {
    id: 'appr-001',
    evaluationId: 'eval-001',
    missionId: 'msn-w2-001',
    missionCode: 'MSN-GI-W2-01',
    missionTitle: 'Cold-Pressed Extraction Ratio & Pure Recipe Quality Audit',
    week: 2,
    batchId: 'batch-alpha',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 92,
    calculatedStars: 5,
    status: 'PENDING_REVIEW',
    comment: 'Audit ekstraksi cold-pressed u.Glow dan Asian Green berjalan sangat baik. Semua 6 crew mematuhi SOP rasio ekstraksi 100% Pure tanpa air dan gula.',
    crewScores: [
      { crewId: 'crew-001', crewName: 'Andi Pratama', score: 95, calculatedStars: 5 },
      { crewId: 'crew-002', crewName: 'Bella Saphira', score: 93, calculatedStars: 5 },
      { crewId: 'crew-003', crewName: 'Candra Wijaya', score: 91, calculatedStars: 5 },
      { crewId: 'crew-004', crewName: 'Dedi Kurniawan', score: 89, calculatedStars: 4 },
      { crewId: 'crew-005', crewName: 'Eka Prasetya', score: 92, calculatedStars: 5 },
      { crewId: 'crew-006', crewName: 'Fani Rahmawati', score: 90, calculatedStars: 5 }
    ],
    evidenceCount: 2,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Refractometer Brix level log & yield measurement'
      },
      {
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
        caption: 'Cold-pressed quality certificate signed by team'
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
    missionCode: 'MSN-GI-W2-02',
    missionTitle: 'Store Front Cleanroom Sanitation & Glass Polish Standards',
    week: 2,
    batchId: 'batch-alpha',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 78,
    calculatedStars: 3,
    status: 'REVISION_REQUIRED',
    comment: 'Sanitasi kaca display dan order counter sudah dilakukan, namun rekaman swab test ATP di prep bar belakang belum lengkap.',
    crewScores: [
      { crewId: 'crew-001', crewName: 'Andi Pratama', score: 82, calculatedStars: 4 },
      { crewId: 'crew-002', crewName: 'Bella Saphira', score: 76, calculatedStars: 3 },
      { crewId: 'crew-003', crewName: 'Candra Wijaya', score: 80, calculatedStars: 4 },
      { crewId: 'crew-004', crewName: 'Dedi Kurniawan', score: 75, calculatedStars: 3 },
      { crewId: 'crew-005', crewName: 'Eka Prasetya', score: 78, calculatedStars: 3 },
      { crewId: 'crew-006', crewName: 'Fani Rahmawati', score: 77, calculatedStars: 3 }
    ],
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
        caption: 'Store front glass and counter sanitation check'
      }
    ],
    submittedAt: '2026-08-19T15:00:00Z',
    reviewedAt: '2026-08-20T09:15:00Z',
    revisionNote: 'Mohon lengkapi bukti foto swab test ATP di area prep counter juice dan log pembuangan ampas organik sebelum approval.'
  },
  {
    id: 'appr-003',
    evaluationId: 'eval-004',
    missionId: 'msn-w1-001',
    missionCode: 'MSN-GI-W1-01',
    missionTitle: 'Cold Storage Chiller Temp & Sensor Audit (2-4°C)',
    week: 1,
    batchId: 'batch-alpha',
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    averageScore: 92,
    calculatedStars: 5,
    status: 'APPROVED',
    comment: 'Audit suhu chiller display dan walk-in cold room stabil sempurna di kisaran 2.4°C - 3.2°C sepanjang minggu.',
    crewScores: [
      { crewId: 'crew-001', crewName: 'Andi Pratama', score: 95, calculatedStars: 5 },
      { crewId: 'crew-002', crewName: 'Bella Saphira', score: 92, calculatedStars: 5 },
      { crewId: 'crew-003', crewName: 'Candra Wijaya', score: 90, calculatedStars: 5 },
      { crewId: 'crew-004', crewName: 'Dedi Kurniawan', score: 88, calculatedStars: 4 },
      { crewId: 'crew-005', crewName: 'Eka Prasetya', score: 94, calculatedStars: 5 },
      { crewId: 'crew-006', crewName: 'Fani Rahmawati', score: 93, calculatedStars: 5 }
    ],
    evidenceCount: 1,
    evidenceList: [
      {
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        caption: 'Digital cold chain temperature sensor reading 2.8°C'
      }
    ],
    submittedAt: '2026-08-14T11:00:00Z',
    reviewedAt: '2026-08-15T14:20:00Z',
    revisionNote: null
  }
]
