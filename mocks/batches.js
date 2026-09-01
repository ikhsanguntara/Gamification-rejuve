/**
 * Mock Data: Batch Misi Re.juve dengan Penugasan Supervisor, Head, dan Roster Crew
 */

export const mockBatches = [
  {
    id: 'batch-alpha',
    name: 'Batch 1',
    code: 'BTH-01',
    description: 'Siklus misi 3 minggu untuk tim Batch 1.',
    storeLocation: 'Grand Indonesia, Jakarta Pusat',
    startDate: '2026-08-25',
    endDate: '2026-09-15',
    currentWeek: 2,
    totalWeeks: 3,
    totalCrew: 6,
    totalMissions: 12,
    completedMissions: 4,
    averageScore: 93.0,
    totalStars: 1850,
    status: 'ACTIVE',
    assignment: {
      supervisorId: 'spv-001',
      supervisorName: 'Budi Santoso',
      headId: 'head-001',
      headName: 'Ahmad Dahlan',
      crewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006']
    },
    approvalConfig: {
      minScoreFor5Stars: 90,
      minEvidenceCount: 1,
      maxRevisions: 3,
      requireEvidence: true
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'Minggu 1: Suhu & Sanitasi Dasar',
        startDate: '25 Agu',
        endDate: '31 Agu',
        status: 'COMPLETED',
        isLocked: false,
        completionRate: 100,
        totalMissions: 4,
        completedMissions: 4,
        totalStarsAwarded: 620
      },
      {
        weekNumber: 2,
        title: 'Minggu 2: Kualitas Rasa & Layanan',
        startDate: '01 Sep',
        endDate: '07 Sep',
        status: 'ACTIVE',
        isLocked: false,
        completionRate: 50,
        totalMissions: 4,
        completedMissions: 2,
        totalStarsAwarded: 540
      },
      {
        weekNumber: 3,
        title: 'Minggu 3: Audit Akhir & Stok',
        startDate: '08 Sep',
        endDate: '15 Sep',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 4,
        completedMissions: 0,
        totalStarsAwarded: 0
      }
    ]
  },
  {
    id: 'batch-beta',
    name: 'Batch 2',
    code: 'BTH-02',
    description: 'Siklus misi 3 minggu untuk tim Batch 2.',
    storeLocation: 'Senayan City, Jakarta Pusat',
    startDate: '2026-09-01',
    endDate: '2026-09-22',
    currentWeek: 1,
    totalWeeks: 3,
    totalCrew: 5,
    totalMissions: 12,
    completedMissions: 1,
    averageScore: 91.5,
    totalStars: 1540,
    status: 'ACTIVE',
    assignment: {
      supervisorId: 'spv-001',
      supervisorName: 'Budi Santoso',
      headId: 'head-001',
      headName: 'Ahmad Dahlan',
      crewIds: ['crew-007', 'crew-008', 'crew-009', 'crew-010', 'crew-011']
    },
    approvalConfig: {
      minScoreFor5Stars: 90,
      minEvidenceCount: 1,
      maxRevisions: 3,
      requireEvidence: true
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'Minggu 1: Suhu & Sanitasi Dasar',
        startDate: '01 Sep',
        endDate: '07 Sep',
        status: 'ACTIVE',
        isLocked: false,
        completionRate: 25,
        totalMissions: 4,
        completedMissions: 1,
        totalStarsAwarded: 520
      },
      {
        weekNumber: 2,
        title: 'Minggu 2: Kualitas Rasa & Layanan',
        startDate: '08 Sep',
        endDate: '14 Sep',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 4,
        completedMissions: 0,
        totalStarsAwarded: 0
      },
      {
        weekNumber: 3,
        title: 'Minggu 3: Audit Akhir & Stok',
        startDate: '15 Sep',
        endDate: '22 Sep',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 4,
        completedMissions: 0,
        totalStarsAwarded: 0
      }
    ]
  },
  {
    id: 'batch-gamma',
    name: 'Batch 3',
    code: 'BTH-03',
    description: 'Siklus misi 3 minggu untuk tim Batch 3.',
    storeLocation: 'Pondok Indah Mall, Jakarta Selatan',
    startDate: '2026-08-18',
    endDate: '2026-09-08',
    currentWeek: 3,
    totalWeeks: 3,
    totalCrew: 4,
    totalMissions: 12,
    completedMissions: 8,
    averageScore: 89.8,
    totalStars: 1420,
    status: 'ACTIVE',
    assignment: {
      supervisorId: 'spv-002',
      supervisorName: 'Dewi Lestari',
      headId: 'head-002',
      headName: 'Citra Dewi',
      crewIds: ['crew-012', 'crew-013', 'crew-014', 'crew-015']
    },
    approvalConfig: {
      minScoreFor5Stars: 90,
      minEvidenceCount: 1,
      maxRevisions: 3,
      requireEvidence: true
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'Minggu 1: Suhu & Sanitasi Dasar',
        startDate: '18 Agu',
        endDate: '24 Agu',
        status: 'COMPLETED',
        isLocked: false,
        completionRate: 100,
        totalMissions: 4,
        completedMissions: 4,
        totalStarsAwarded: 480
      },
      {
        weekNumber: 2,
        title: 'Minggu 2: Kualitas Rasa & Layanan',
        startDate: '25 Agu',
        endDate: '31 Agu',
        status: 'COMPLETED',
        isLocked: false,
        completionRate: 100,
        totalMissions: 4,
        completedMissions: 4,
        totalStarsAwarded: 520
      },
      {
        weekNumber: 3,
        title: 'Minggu 3: Audit Akhir & Stok',
        startDate: '01 Sep',
        endDate: '08 Sep',
        status: 'ACTIVE',
        isLocked: false,
        completionRate: 0,
        totalMissions: 4,
        completedMissions: 0,
        totalStarsAwarded: 0
      }
    ]
  }
]
