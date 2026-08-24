/**
 * Mock Data: Store-Wide Operational Missions (1 Mission for All Crew in the Batch)
 * Tailored for Re.juve Indonesia Store Batches
 */

export const mockMissions = [
  // ===================== BATCH ALPHA (Grand Indonesia - 6 Crew) — WEEK 1 (COMPLETED & LOCKED) =====================
  {
    id: 'msn-w1-001',
    batchId: 'batch-alpha',
    week: 1,
    code: 'MSN-GI-W1-01',
    title: 'Cold Storage Chiller Temp & Sensor Audit (2-4°C)',
    category: 'Cold Chain',
    description: 'Inspect digital thermometer sensors inside main display chillers and walk-in cold rooms. All crew must verify daily logging.',
    requirements: [
      'Verify digital temperature log is strictly between 2.0°C - 4.0°C',
      'Inspect door gasket seals for cold air leakage',
      'Check secondary backup thermometer calibration'
    ],
    deadline: '2026-08-16',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'COMPLETED',
    averageScore: 92,
    awardedStars: 5,
    crewEvaluations: [
      { crewId: 'crew-001', score: 95, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-002', score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-003', score: 90, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-004', score: 88, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' },
      { crewId: 'crew-005', score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-006', score: 93, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }
    ]
  },
  {
    id: 'msn-w1-002',
    batchId: 'batch-alpha',
    week: 1,
    code: 'MSN-GI-W1-02',
    title: 'Cold-Pressed Hydraulic Press Sanitation & Swab Test',
    category: 'Sanitation',
    description: 'Perform deep food-grade sanitizing on hydraulic juice pressing bags and stainless steel contact trays.',
    requirements: [
      'Disassemble press plates and sanitize with food-grade solution',
      'Inspect filter mesh integrity with zero tear',
      'Confirm ATP swab test hygiene reading < 10 RLU'
    ],
    deadline: '2026-08-16',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'COMPLETED',
    averageScore: 90,
    awardedStars: 5,
    crewEvaluations: [
      { crewId: 'crew-001', score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-002', score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-003', score: 89, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' },
      { crewId: 'crew-004', score: 86, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' },
      { crewId: 'crew-005', score: 91, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-006', score: 88, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' }
    ]
  },
  {
    id: 'msn-w1-003',
    batchId: 'batch-alpha',
    week: 1,
    code: 'MSN-GI-W1-03',
    title: 'Fresh Organic Produce Brix Sweetness & Sorting Inspection',
    category: 'Quality Control',
    description: 'Inspect incoming batches of fresh pineapples, apples, and organic spinach for sweetness Brix grade and zero defect.',
    requirements: [
      'Measure fruit Brix sweetness with digital refractometer',
      'Quarantine bruised or sub-standard fresh produce',
      'Ensure triple-washing ozonated water bath protocol'
    ],
    deadline: '2026-08-16',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'COMPLETED',
    averageScore: 89,
    awardedStars: 4,
    crewEvaluations: [
      { crewId: 'crew-001', score: 90, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-002', score: 88, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' },
      { crewId: 'crew-003', score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-004', score: 87, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' },
      { crewId: 'crew-005', score: 89, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' },
      { crewId: 'crew-006', score: 88, calculatedStars: 4, awardedStars: 4, status: 'COMPLETED' }
    ]
  },

  // ===================== BATCH ALPHA (Grand Indonesia - 6 Crew) — WEEK 2 (ACTIVE WEEK) =====================
  {
    id: 'msn-w2-001',
    batchId: 'batch-alpha',
    week: 2,
    code: 'MSN-GI-W2-01',
    title: 'Cold-Pressed Extraction Ratio & Pure Recipe Quality Audit',
    category: 'Quality Control',
    description: 'Conduct yield ratio inspection for signature cold-pressed recipes (u.Glow, Asian Green, Tropic Golden). All crew assessed on recipe adherence.',
    requirements: [
      'Measure exact juice yield per kg of raw organic produce',
      'Ensure strictly 100% Pure, zero water, zero added sugar, zero preservatives',
      'Document pH and density parameters on quality control sheet'
    ],
    deadline: '2026-08-23',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'PENDING_REVIEW',
    averageScore: 92,
    awardedStars: 0,
    crewEvaluations: [
      { crewId: 'crew-001', score: 95, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' },
      { crewId: 'crew-002', score: 93, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' },
      { crewId: 'crew-003', score: 91, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' },
      { crewId: 'crew-004', score: 89, calculatedStars: 4, awardedStars: 0, status: 'PENDING_REVIEW' },
      { crewId: 'crew-005', score: 92, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' },
      { crewId: 'crew-006', score: 90, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' }
    ]
  },
  {
    id: 'msn-w2-002',
    batchId: 'batch-alpha',
    week: 2,
    code: 'MSN-GI-W2-02',
    title: 'Store Front Cleanroom Sanitation & Glass Polish Standards',
    category: 'Sanitation',
    description: 'Hourly sanitizing audit on customer ordering counter, touchscreens, stainless bar surfaces, and display windows.',
    requirements: [
      'Sanitize bar prep tables with food-grade alcohol wipes',
      'Inspect floor dry mat and slip hazard protection',
      'Check trash bin segregation (organics vs clean recyclables)'
    ],
    deadline: '2026-08-23',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'REVISION_REQUIRED',
    averageScore: 78,
    awardedStars: 0,
    crewEvaluations: [
      { crewId: 'crew-001', score: 82, calculatedStars: 4, awardedStars: 0, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-002', score: 76, calculatedStars: 3, awardedStars: 0, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-003', score: 80, calculatedStars: 4, awardedStars: 0, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-004', score: 75, calculatedStars: 3, awardedStars: 0, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-005', score: 78, calculatedStars: 3, awardedStars: 0, status: 'REVISION_REQUIRED' },
      { crewId: 'crew-006', score: 77, calculatedStars: 3, awardedStars: 0, status: 'REVISION_REQUIRED' }
    ]
  },
  {
    id: 'msn-w2-003',
    batchId: 'batch-alpha',
    week: 2,
    code: 'MSN-GI-W2-03',
    title: 'Daily Stock Count & Packaging Buffer Reconciliation',
    category: 'Logistics',
    description: 'Perform serialized barcode count for almond milk, booster shots, and cold-pressed bottles across store chillers.',
    requirements: [
      'Scan 100% of stored SKU inventory tags',
      'Match digital ERP stock against physical chiller inventory',
      'Verify thermal insulated bag and ice gel pack stock levels'
    ],
    deadline: '2026-08-23',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'DRAFT',
    averageScore: 86,
    awardedStars: 0,
    crewEvaluations: [
      { crewId: 'crew-001', score: 88, calculatedStars: 4, awardedStars: 0, status: 'DRAFT' },
      { crewId: 'crew-002', score: 85, calculatedStars: 4, awardedStars: 0, status: 'DRAFT' },
      { crewId: 'crew-003', score: 87, calculatedStars: 4, awardedStars: 0, status: 'DRAFT' },
      { crewId: 'crew-004', score: 86, calculatedStars: 4, awardedStars: 0, status: 'DRAFT' },
      { crewId: 'crew-005', score: 84, calculatedStars: 4, awardedStars: 0, status: 'DRAFT' },
      { crewId: 'crew-006', score: 86, calculatedStars: 4, awardedStars: 0, status: 'DRAFT' }
    ]
  },
  {
    id: 'msn-w2-004',
    batchId: 'batch-alpha',
    week: 2,
    code: 'MSN-GI-W2-04',
    title: 'Barista Service Speed & #CleanLabel Customer Education',
    category: 'Service',
    description: 'Evaluate customer greeting fluency, product health recommendation, and speed of service under 45 seconds.',
    requirements: [
      'Maintain average checkout time under 45 seconds',
      'Provide clear explanation of #CleanLabel benefits to customers',
      'Receive 5-star customer feedback rating on digital survey'
    ],
    deadline: '2026-08-23',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'IN_PROGRESS',
    averageScore: 0,
    awardedStars: 0,
    crewEvaluations: [
      { crewId: 'crew-001', score: 0, calculatedStars: 1, awardedStars: 0, status: 'IN_PROGRESS' },
      { crewId: 'crew-002', score: 0, calculatedStars: 1, awardedStars: 0, status: 'IN_PROGRESS' },
      { crewId: 'crew-003', score: 0, calculatedStars: 1, awardedStars: 0, status: 'IN_PROGRESS' },
      { crewId: 'crew-004', score: 0, calculatedStars: 1, awardedStars: 0, status: 'IN_PROGRESS' },
      { crewId: 'crew-005', score: 0, calculatedStars: 1, awardedStars: 0, status: 'IN_PROGRESS' },
      { crewId: 'crew-006', score: 0, calculatedStars: 1, awardedStars: 0, status: 'IN_PROGRESS' }
    ]
  },

  // ===================== BATCH ALPHA (Grand Indonesia - 6 Crew) — WEEK 3 (LOCKED) =====================
  {
    id: 'msn-w3-001',
    batchId: 'batch-alpha',
    week: 3,
    code: 'MSN-GI-W3-01',
    title: 'Final Cycle Re.juve Audit & Store Excellence Sign-off',
    category: 'Quality Control',
    description: 'Consolidated end-of-cycle hygiene audit, equipment maintenance check, and store operations sign-off.',
    requirements: [
      'Complete 80-point Re.juve store audit checklist',
      'Verify calibration certificate for all store chillers',
      'Submit executive report to Head of Operations'
    ],
    deadline: '2026-08-30',
    maxStars: 5,
    assignedCrewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'LOCKED',
    averageScore: 0,
    awardedStars: 0,
    crewEvaluations: []
  },

  // ===================== BATCH BETA (Senayan City - 5 Crew) =====================
  {
    id: 'msn-sc-001',
    batchId: 'batch-beta',
    week: 1,
    code: 'MSN-SC-W1-01',
    title: 'Senayan City Store Chiller Calibration & Setup',
    category: 'Cold Chain',
    description: 'Initial chiller calibration and inventory temperature testing for Senayan City branch.',
    requirements: [
      'Calibrate thermometers to 2.5°C benchmark',
      'Verify drainage pipe slope and condensate pan',
      'Affix calibration stickers'
    ],
    deadline: '2026-09-13',
    maxStars: 5,
    assignedCrewIds: ['crew-007', 'crew-008', 'crew-009', 'crew-010', 'crew-011'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'LOCKED',
    averageScore: 0,
    awardedStars: 0,
    crewEvaluations: []
  },

  // ===================== BATCH GAMMA (Pondok Indah Mall - 5 Crew) =====================
  {
    id: 'msn-pim-001',
    batchId: 'batch-gamma',
    week: 3,
    code: 'MSN-PIM-W3-01',
    title: 'Comprehensive Master Hygiene & HACCP Audit',
    category: 'Compliance',
    description: 'Full store hygiene inspection and food safety certification verification across all store crew.',
    requirements: [
      'Achieve 100% audit score on food contact surface tests',
      'Complete safety record sign-off',
      'Award certified store quality banner'
    ],
    deadline: '2026-07-26',
    maxStars: 5,
    assignedCrewIds: ['crew-012', 'crew-013', 'crew-014', 'crew-015', 'crew-016'],
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Supervisor)',
    status: 'COMPLETED',
    averageScore: 96,
    awardedStars: 5,
    crewEvaluations: [
      { crewId: 'crew-012', score: 98, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-013', score: 96, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-014', score: 95, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-015', score: 96, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' },
      { crewId: 'crew-016', score: 94, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }
    ]
  }
]
