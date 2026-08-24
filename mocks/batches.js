/**
 * Mock Data: Batches (Re.juve Store Branches)
 */

export const mockBatches = [
  {
    id: 'batch-alpha',
    name: 'Batch Alpha — Re.juve Grand Indonesia',
    code: 'BTH-GI-01',
    description: 'Q3 Mission Cycle for Re.juve Flagship Store Grand Indonesia. Focus on Cold Chain 2-4°C, HACCP Cleanroom sanitation, and barista excellence.',
    storeLocation: 'Grand Indonesia, West Mall Lower Ground',
    startDate: '2026-08-10',
    endDate: '2026-08-30',
    currentWeek: 2,
    totalWeeks: 3,
    totalCrew: 6,
    totalMissions: 18,
    completedMissions: 10,
    averageScore: 90.2,
    totalStars: 1850,
    status: 'ACTIVE',
    weeks: [
      {
        weekNumber: 1,
        title: 'Cold Chain Setup & Safety Audit',
        startDate: '2026-08-10',
        endDate: '2026-08-16',
        status: 'COMPLETED',
        isLocked: true,
        completionRate: 100,
        totalMissions: 6,
        completedMissions: 6,
        totalStarsAwarded: 620
      },
      {
        weekNumber: 2,
        title: 'Core Store Operations & Quality Assurance',
        startDate: '2026-08-17',
        endDate: '2026-08-23',
        status: 'ACTIVE',
        isLocked: false,
        completionRate: 67,
        totalMissions: 6,
        completedMissions: 4,
        totalStarsAwarded: 540
      },
      {
        weekNumber: 3,
        title: 'Final Cycle Audit & Customer Excellence',
        startDate: '2026-08-24',
        endDate: '2026-08-30',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 6,
        completedMissions: 0,
        totalStarsAwarded: 0
      }
    ]
  },
  {
    id: 'batch-beta',
    name: 'Batch Beta — Re.juve Senayan City',
    code: 'BTH-SC-02',
    description: 'Q4 Mission Cycle for Re.juve Senayan City Store. Focus on raw fruit cold-pressed processing and inventory freshness rotation.',
    storeLocation: 'Senayan City, Lower Ground Floor',
    startDate: '2026-09-07',
    endDate: '2026-09-27',
    currentWeek: 1,
    totalWeeks: 3,
    totalCrew: 5,
    totalMissions: 15,
    completedMissions: 0,
    averageScore: 0,
    totalStars: 0,
    status: 'UPCOMING',
    weeks: [
      {
        weekNumber: 1,
        title: 'Store Readiness & Chiller Calibration',
        startDate: '2026-09-07',
        endDate: '2026-09-13',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 5,
        completedMissions: 0,
        totalStarsAwarded: 0
      },
      {
        weekNumber: 2,
        title: 'Operational Execution',
        startDate: '2026-09-14',
        endDate: '2026-09-20',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 5,
        completedMissions: 0,
        totalStarsAwarded: 0
      },
      {
        weekNumber: 3,
        title: 'Store Performance Review',
        startDate: '2026-09-21',
        endDate: '2026-09-27',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 5,
        completedMissions: 0,
        totalStarsAwarded: 0
      }
    ]
  },
  {
    id: 'batch-gamma',
    name: 'Batch Gamma — Re.juve Pondok Indah Mall',
    code: 'BTH-PIM-03',
    description: 'Q2 Comprehensive Master Cycle for Re.juve Pondok Indah Mall (PIM 2). Completed cycle with highest hygiene certification.',
    storeLocation: 'Pondok Indah Mall 2, Level 1',
    startDate: '2026-07-06',
    endDate: '2026-07-26',
    currentWeek: 3,
    totalWeeks: 3,
    totalCrew: 5,
    totalMissions: 15,
    completedMissions: 15,
    averageScore: 93.4,
    totalStars: 2150,
    status: 'COMPLETED',
    weeks: [
      {
        weekNumber: 1,
        title: 'Sanitation & Chiller Standards',
        startDate: '2026-07-06',
        endDate: '2026-07-12',
        status: 'COMPLETED',
        isLocked: true,
        completionRate: 100,
        totalMissions: 5,
        completedMissions: 5,
        totalStarsAwarded: 710
      },
      {
        weekNumber: 2,
        title: 'Cold-Pressed Extraction Quality',
        startDate: '2026-07-13',
        endDate: '2026-07-19',
        status: 'COMPLETED',
        isLocked: true,
        completionRate: 100,
        totalMissions: 5,
        completedMissions: 5,
        totalStarsAwarded: 740
      },
      {
        weekNumber: 3,
        title: 'Final Hygiene & SOP Certification',
        startDate: '2026-07-20',
        endDate: '2026-07-26',
        status: 'COMPLETED',
        isLocked: true,
        completionRate: 100,
        totalMissions: 5,
        completedMissions: 5,
        totalStarsAwarded: 700
      }
    ]
  }
]
