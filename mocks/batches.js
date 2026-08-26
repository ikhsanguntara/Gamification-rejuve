/**
 * Mock Data: Cabang Gerai Re.juve (Batches)
 */

export const mockBatches = [
  {
    id: 'batch-alpha',
    name: 'Gerai Grand Indonesia',
    code: 'GI-01',
    description: 'Siklus misi 3 minggu untuk tim operasional Re.juve Grand Indonesia.',
    storeLocation: 'Grand Indonesia Mall, Jakarta Pusat',
    startDate: '2026-08-10',
    endDate: '2026-08-30',
    currentWeek: 2,
    totalWeeks: 3,
    totalCrew: 6,
    totalMissions: 12,
    completedMissions: 4,
    averageScore: 93.0,
    totalStars: 1850,
    status: 'ACTIVE',
    weeks: [
      {
        weekNumber: 1,
        title: 'Minggu 1: Suhu & Sanitasi Dasar',
        startDate: '2026-08-10',
        endDate: '2026-08-16',
        status: 'COMPLETED',
        isLocked: true,
        completionRate: 100,
        totalMissions: 4,
        completedMissions: 4,
        totalStarsAwarded: 620
      },
      {
        weekNumber: 2,
        title: 'Minggu 2: Kualitas Rasa & Layanan',
        startDate: '2026-08-17',
        endDate: '2026-08-23',
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
        startDate: '2026-08-24',
        endDate: '2026-08-30',
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
    name: 'Gerai Senayan City',
    code: 'SC-02',
    description: 'Siklus misi 3 minggu untuk tim operasional Re.juve Senayan City.',
    storeLocation: 'Senayan City Mall, Jakarta Pusat',
    startDate: '2026-08-10',
    endDate: '2026-08-30',
    currentWeek: 2,
    totalWeeks: 3,
    totalCrew: 5,
    totalMissions: 12,
    completedMissions: 3,
    averageScore: 91.5,
    totalStars: 1540,
    status: 'ACTIVE',
    weeks: [
      {
        weekNumber: 1,
        title: 'Minggu 1: Suhu & Sanitasi Dasar',
        startDate: '2026-08-10',
        endDate: '2026-08-16',
        status: 'COMPLETED',
        isLocked: true,
        completionRate: 100,
        totalMissions: 4,
        completedMissions: 4,
        totalStarsAwarded: 520
      },
      {
        weekNumber: 2,
        title: 'Minggu 2: Kualitas Rasa & Layanan',
        startDate: '2026-08-17',
        endDate: '2026-08-23',
        status: 'ACTIVE',
        isLocked: false,
        completionRate: 25,
        totalMissions: 4,
        completedMissions: 1,
        totalStarsAwarded: 240
      },
      {
        weekNumber: 3,
        title: 'Minggu 3: Audit Akhir & Stok',
        startDate: '2026-08-24',
        endDate: '2026-08-30',
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
    name: 'Gerai Pondok Indah Mall',
    code: 'PIM-03',
    description: 'Siklus misi 3 minggu untuk tim operasional Re.juve PIM 2.',
    storeLocation: 'Pondok Indah Mall 2, Jakarta Selatan',
    startDate: '2026-08-10',
    endDate: '2026-08-30',
    currentWeek: 2,
    totalWeeks: 3,
    totalCrew: 5,
    totalMissions: 12,
    completedMissions: 3,
    averageScore: 89.8,
    totalStars: 1420,
    status: 'ACTIVE',
    weeks: [
      {
        weekNumber: 1,
        title: 'Minggu 1: Suhu & Sanitasi Dasar',
        startDate: '2026-08-10',
        endDate: '2026-08-16',
        status: 'COMPLETED',
        isLocked: true,
        completionRate: 100,
        totalMissions: 4,
        completedMissions: 4,
        totalStarsAwarded: 480
      },
      {
        weekNumber: 2,
        title: 'Minggu 2: Kualitas Rasa & Layanan',
        startDate: '2026-08-17',
        endDate: '2026-08-23',
        status: 'ACTIVE',
        isLocked: false,
        completionRate: 25,
        totalMissions: 4,
        completedMissions: 1,
        totalStarsAwarded: 220
      },
      {
        weekNumber: 3,
        title: 'Minggu 3: Audit Akhir & Stok',
        startDate: '2026-08-24',
        endDate: '2026-08-30',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 4,
        completedMissions: 0,
        totalStarsAwarded: 0
      }
    ]
  }
]
