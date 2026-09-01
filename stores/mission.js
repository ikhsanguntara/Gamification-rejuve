import { defineStore } from 'pinia'
import { mockMissions } from '~/mocks/missions.js'
import { calculateStars } from '~/utils/star.js'
import { useGamificationStore } from './gamification.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

/**
 * Mission Store: Manages store-wide missions across batches and weeks, and Superadmin CRUD
 */

export const useMissionStore = defineStore('mission', {
  state: () => ({
    missions: getStoredData('rejuve_missions_v4', mockMissions),
    searchQuery: '',
    selectedCategory: 'ALL',
    selectedStatus: 'ALL'
  }),

  getters: {
    allMissions: (state) => state.missions,
    missionsByBatch: (state) => (batchId) => state.missions.filter(m => m.batchId === batchId),
    missionsByWeek: (state) => (batchId, weekNumber) => {
      return state.missions.filter(m => m.batchId === batchId && m.week === Number(weekNumber))
    },
    missionById: (state) => (id) => state.missions.find(m => m.id === id),
    completedCount: (state) => state.missions.filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length,
    pendingCount: (state) => state.missions.filter(m => m.status === 'PENDING_REVIEW').length,
    revisionCount: (state) => state.missions.filter(m => m.status === 'REVISION_REQUIRED').length,

    /**
     * Get a specific crew's evaluation detail for a given mission
     */
    crewEvaluationForMission: (state) => (missionId, crewId) => {
      const mission = state.missions.find(m => m.id === missionId)
      if (!mission || !mission.crewEvaluations) return null
      return mission.crewEvaluations.find(ce => ce.crewId === crewId)
    }
  },

  actions: {
    updateMissionStatus(missionId, { status, averageScore, calculatedStars, awardedStars, crewScores = [] } = {}) {
      const mission = this.missions.find(m => m.id === missionId)
      if (!mission) return

      if (status !== undefined) mission.status = status
      if (averageScore !== undefined) {
        mission.averageScore = Number(averageScore)
        mission.calculatedStars = calculateStars(averageScore)
      }
      if (calculatedStars !== undefined) mission.calculatedStars = calculatedStars
      if (awardedStars !== undefined) mission.awardedStars = awardedStars

      // Update crew-level evaluations array
      if (crewScores && crewScores.length > 0) {
        if (!mission.crewEvaluations) mission.crewEvaluations = []
        crewScores.forEach(cs => {
          const existing = mission.crewEvaluations.find(e => e.crewId === cs.crewId)
          const stars = calculateStars(cs.score)
          if (existing) {
            existing.score = Number(cs.score)
            existing.calculatedStars = stars
            if (status !== undefined) existing.status = status
            if (awardedStars !== undefined) existing.awardedStars = stars
          } else {
            mission.crewEvaluations.push({
              crewId: cs.crewId,
              score: Number(cs.score),
              calculatedStars: stars,
              awardedStars: awardedStars !== undefined ? stars : 0,
              status: status || mission.status
            })
          }
        })
      }

      setStoredData('rejuve_missions_v4', this.missions)
    },

    setFilters({ search, category, status } = {}) {
      if (search !== undefined) this.searchQuery = search
      if (category !== undefined) this.selectedCategory = category
      if (status !== undefined) this.selectedStatus = status
    },

    // ==================== SUPERADMIN ACTIONS ====================

    createMission(payload) {
      const id = `mission-${Date.now()}`
      const gamificationStore = useGamificationStore()
      const batchCrews = gamificationStore.crewsByBatch(payload.batchId)
      const assignedCrewIds = batchCrews.map(c => c.id)

      const newMission = {
        id,
        code: payload.code || `MSN-${payload.week || 1}-${String(this.missions.length + 1).padStart(2, '0')}`,
        title: payload.title,
        description: payload.description || 'Misi kepatuhan operasional dan standar mutu gerai Re.juve.',
        category: payload.category || 'Quality Control',
        week: Number(payload.week) || 1,
        batchId: payload.batchId || 'batch-alpha',
        assignedCrewIds,
        crewEvaluations: assignedCrewIds.map(cId => ({
          crewId: cId,
          score: 0,
          calculatedStars: 0,
          awardedStars: 0,
          status: 'NOT_STARTED'
        })),
        status: payload.status || 'NOT_STARTED',
        averageScore: 0,
        calculatedStars: 0,
        awardedStars: 0,
        deadline: payload.deadline || '2026-09-14',
        requirements: payload.requirements || [
          'Verifikasi suhu chiller penyimpanan pada kisaran 2-4°C.',
          'Pemeriksaan sanitasi alat pemeras hidrolik cold-pressed.',
          'Uji sampling Brix dan kejernihan sari buah.'
        ],
        supervisorId: 'spv-001',
        createdAt: new Date().toISOString()
      }

      this.missions.push(newMission)
      setStoredData('rejuve_missions_v4', this.missions)
      return newMission
    },

    updateMission(id, payload) {
      const mission = this.missions.find(m => m.id === id)
      if (!mission) return null
      Object.assign(mission, payload)
      setStoredData('rejuve_missions_v4', this.missions)
      return mission
    },

    deleteMission(id) {
      const idx = this.missions.findIndex(m => m.id === id)
      if (idx !== -1) {
        const removed = this.missions.splice(idx, 1)[0]
        setStoredData('rejuve_missions_v4', this.missions)
        return removed
      }
      return null
    }
  }
})
