/**
 * Mock Data: Master Missions Re.juve across Multi-Week Batches:
 * - Batch 1: 12 Misi (3 Minggu • Standar Mall)
 * - Batch 2: 16 Misi (4 Minggu • Flagship Quality)
 * - Batch 3: 20 Misi (5 Minggu • Leadership & Onboarding)
 */
import { mockTemplatePackages } from './templates.js'

const pkg1 = mockTemplatePackages.find(p => p.id === 'pkg-sop-standard') || mockTemplatePackages[0]
const pkg2 = mockTemplatePackages.find(p => p.id === 'pkg-flagship-4weeks') || mockTemplatePackages[1]
const pkg3 = mockTemplatePackages.find(p => p.id === 'pkg-leadership-5weeks') || mockTemplatePackages[2]

// ===================== GENERATE MISSIONS FOR BATCH 1 (3 MINGGU - 12 MISI) =====================
const batch1Crews = ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006']
const batch1Missions = (pkg1?.templates || []).map((tpl, idx) => {
  const mNum = idx + 1
  let status = 'LOCKED'
  let avgScore = 0
  let awardedStars = null
  let calculatedStars = null
  let crewEvals = []

  if (tpl.week === 1) {
    status = 'COMPLETED'
    avgScore = 94
    awardedStars = 5
    calculatedStars = 5
    crewEvals = batch1Crews.map(cId => ({
      crewId: cId,
      score: 94,
      calculatedStars: 5,
      awardedStars: 5,
      status: 'COMPLETED'
    }))
  } else if (tpl.week === 2) {
    if (mNum === 5) {
      status = 'COMPLETED'
      avgScore = 95
      awardedStars = 5
      calculatedStars = 5
      crewEvals = batch1Crews.map(cId => ({ crewId: cId, score: 95, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }))
    } else if (mNum === 6) {
      status = 'PENDING_REVIEW'
      avgScore = 92
      calculatedStars = 5
      crewEvals = batch1Crews.map(cId => ({ crewId: cId, score: 92, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' }))
    } else {
      status = 'IN_PROGRESS'
      avgScore = 0
      crewEvals = []
    }
  }

  return {
    id: `msn-b1-w${tpl.week}-00${((idx % 4) + 1)}`,
    batchId: 'batch-alpha',
    week: tpl.week,
    code: tpl.codePrefix || `M-0${idx + 1}`,
    title: tpl.title,
    category: tpl.category,
    description: tpl.description,
    requirements: tpl.requirements,
    deadline: tpl.week === 1 ? '2026-08-31' : tpl.week === 2 ? '2026-09-07' : '2026-09-15',
    maxStars: 5,
    assignedCrewIds: batch1Crews,
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Store Leader)',
    status,
    averageScore: avgScore,
    calculatedStars,
    awardedStars,
    crewEvaluations: crewEvals
  }
})

// ===================== GENERATE MISSIONS FOR BATCH 2 (4 MINGGU - 16 MISI) =====================
const batch2Crews = ['crew-007', 'crew-008', 'crew-009', 'crew-010', 'crew-011']
const batch2Missions = (pkg2?.templates || []).map((tpl, idx) => {
  const mNum = idx + 1
  let status = 'LOCKED'
  let avgScore = 0
  let awardedStars = null
  let calculatedStars = null
  let crewEvals = []

  if (tpl.week === 1) {
    if (mNum === 1 || mNum === 2) {
      status = 'COMPLETED'
      avgScore = 93
      awardedStars = 5
      calculatedStars = 5
      crewEvals = batch2Crews.map(cId => ({ crewId: cId, score: 93, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }))
    } else if (mNum === 3) {
      status = 'PENDING_REVIEW'
      avgScore = 91
      calculatedStars = 5
      crewEvals = batch2Crews.map(cId => ({ crewId: cId, score: 91, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' }))
    } else {
      status = 'IN_PROGRESS'
      avgScore = 0
      crewEvals = []
    }
  }

  return {
    id: `msn-b2-w${tpl.week}-00${((idx % 4) + 1)}`,
    batchId: 'batch-beta',
    week: tpl.week,
    code: tpl.codePrefix || `FLG-0${idx + 1}`,
    title: tpl.title,
    category: tpl.category,
    description: tpl.description,
    requirements: tpl.requirements,
    deadline: tpl.week === 1 ? '2026-09-07' : tpl.week === 2 ? '2026-09-14' : tpl.week === 3 ? '2026-09-21' : '2026-09-29',
    maxStars: 5,
    assignedCrewIds: batch2Crews,
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso (Store Leader)',
    status,
    averageScore: avgScore,
    calculatedStars,
    awardedStars,
    crewEvaluations: crewEvals
  }
})

// ===================== GENERATE MISSIONS FOR BATCH 3 (5 MINGGU - 20 MISI) =====================
const batch3Crews = ['crew-012', 'crew-013', 'crew-014', 'crew-015']
const batch3Missions = (pkg3?.templates || []).map((tpl, idx) => {
  const mNum = idx + 1
  let status = 'LOCKED'
  let avgScore = 0
  let awardedStars = null
  let calculatedStars = null
  let crewEvals = []

  if (tpl.week === 1 || tpl.week === 2) {
    status = 'COMPLETED'
    avgScore = 92
    awardedStars = 5
    calculatedStars = 5
    crewEvals = batch3Crews.map(cId => ({ crewId: cId, score: 92, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }))
  } else if (tpl.week === 3) {
    if (mNum === 9) {
      status = 'COMPLETED'
      avgScore = 95
      awardedStars = 5
      calculatedStars = 5
      crewEvals = batch3Crews.map(cId => ({ crewId: cId, score: 95, calculatedStars: 5, awardedStars: 5, status: 'COMPLETED' }))
    } else if (mNum === 10) {
      status = 'PENDING_REVIEW'
      avgScore = 90
      calculatedStars = 5
      crewEvals = batch3Crews.map(cId => ({ crewId: cId, score: 90, calculatedStars: 5, awardedStars: 0, status: 'PENDING_REVIEW' }))
    } else {
      status = 'IN_PROGRESS'
      avgScore = 0
      crewEvals = []
    }
  }

  return {
    id: `msn-b3-w${tpl.week}-00${((idx % 4) + 1)}`,
    batchId: 'batch-gamma',
    week: tpl.week,
    code: tpl.codePrefix || `MST-0${idx + 1}`,
    title: tpl.title,
    category: tpl.category,
    description: tpl.description,
    requirements: tpl.requirements,
    deadline: tpl.week === 1 ? '2026-08-24' : tpl.week === 2 ? '2026-08-31' : tpl.week === 3 ? '2026-09-07' : tpl.week === 4 ? '2026-09-14' : '2026-09-22',
    maxStars: 5,
    assignedCrewIds: batch3Crews,
    supervisorId: 'spv-002',
    supervisorName: 'Dewi Lestari (Store Leader)',
    status,
    averageScore: avgScore,
    calculatedStars,
    awardedStars,
    crewEvaluations: crewEvals
  }
})

export const mockMissions = [
  ...batch1Missions,
  ...batch2Missions,
  ...batch3Missions
]
