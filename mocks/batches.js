/**
 * Mock Data: Batch Misi Re.juve dengan Penugasan Multi-Week:
 * - Batch 1: 3 Minggu (12 Misi • Paket Standar Mall)
 * - Batch 2: 4 Minggu (16 Misi • Paket Intensif Flagship)
 * - Batch 3: 5 Minggu (20 Misi • Paket Onboarding & Leadership)
 */

export const mockBatches = [
  // ==========================================
  // BATCH 1: 3 MINGGU (21 HARI)
  // ==========================================
  {
    id: 'batch-alpha',
    name: 'Batch 1 — Standar Operasional Mall',
    code: 'BTH-01',
    description: 'Siklus misi 3 minggu untuk program kepatuhan standar mall.',
    storeLocation: 'Grand Indonesia, Jakarta Pusat',
    templatePackageId: 'pkg-sop-standard',
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

  // ==========================================
  // BATCH 2: 4 MINGGU (28 HARI)
  // ==========================================
  {
    id: 'batch-beta',
    name: 'Batch 2 — Akselerasi Kualitas Flagship',
    code: 'BTH-02',
    description: 'Siklus misi 4 minggu untuk program akselerasi gerai flagship.',
    storeLocation: 'Senayan City, Jakarta Pusat',
    templatePackageId: 'pkg-flagship-4weeks',
    startDate: '2026-09-01',
    endDate: '2026-09-29',
    currentWeek: 1,
    totalWeeks: 4,
    totalCrew: 5,
    totalMissions: 16,
    completedMissions: 2,
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
        title: 'Minggu 1: Fondasi Cold Chain & Sanitasi Higienis',
        startDate: '01 Sep',
        endDate: '07 Sep',
        status: 'ACTIVE',
        isLocked: false,
        completionRate: 50,
        totalMissions: 4,
        completedMissions: 2,
        totalStarsAwarded: 520
      },
      {
        weekNumber: 2,
        title: 'Minggu 2: Kalibrasi Resep & Kecepatan Operasional',
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
        title: 'Minggu 3: Service Excellence & Upselling Nutrisi',
        startDate: '15 Sep',
        endDate: '21 Sep',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 4,
        completedMissions: 0,
        totalStarsAwarded: 0
      },
      {
        weekNumber: 4,
        title: 'Minggu 4: Manajemen Stok & Audit HACCP',
        startDate: '22 Sep',
        endDate: '29 Sep',
        status: 'LOCKED',
        isLocked: true,
        completionRate: 0,
        totalMissions: 4,
        completedMissions: 0,
        totalStarsAwarded: 0
      }
    ]
  },

  // ==========================================
  // BATCH 3: 5 MINGGU (35 HARI)
  // ==========================================
  {
    id: 'batch-gamma',
    name: 'Batch 3 — Leadership & Onboarding Spesialis',
    code: 'BTH-03',
    description: 'Siklus misi 5 minggu untuk program komprehensif orientasi & calon Shift Leader.',
    storeLocation: 'Pondok Indah Mall, Jakarta Selatan',
    templatePackageId: 'pkg-leadership-5weeks',
    startDate: '2026-08-18',
    endDate: '2026-09-22',
    currentWeek: 3,
    totalWeeks: 5,
    totalCrew: 4,
    totalMissions: 20,
    completedMissions: 9,
    averageScore: 92.4,
    totalStars: 2180,
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
        title: 'Minggu 1: Edukasi #CleanLabel & Keamanan Cold Chain',
        startDate: '18 Agu',
        endDate: '24 Agu',
        status: 'COMPLETED',
        isLocked: false,
        completionRate: 100,
        totalMissions: 4,
        completedMissions: 4,
        totalStarsAwarded: 520
      },
      {
        weekNumber: 2,
        title: 'Minggu 2: Teknik Cold-Pressed & Sanitasi Mesin',
        startDate: '25 Agu',
        endDate: '31 Agu',
        status: 'COMPLETED',
        isLocked: false,
        completionRate: 100,
        totalMissions: 4,
        completedMissions: 4,
        totalStarsAwarded: 540
      },
      {
        weekNumber: 3,
        title: 'Minggu 3: Customer Hospitality & Konsultasi Sehat',
        startDate: '01 Sep',
        endDate: '07 Sep',
        status: 'ACTIVE',
        isLocked: false,
        completionRate: 25,
        totalMissions: 4,
        completedMissions: 1,
        totalStarsAwarded: 480
      },
      {
        weekNumber: 4,
        title: 'Minggu 4: Sistem Kasir POS Cashless & Audit Stok',
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
        weekNumber: 5,
        title: 'Minggu 5: Simulasi Shift Leader & Graduation Audit',
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
  }
]
