import { defineStore } from 'pinia'
import { mockMissions } from '~/mocks/missions.js'
import { calculateStars } from '~/utils/star.js'

/**
 * Mission Store: Manages store-wide missions across batches and weeks
 */

export const useMissionStore = defineStore('mission', {
  state: () => ({
    missions: JSON.parse(JSON.stringify(mockMissions)),
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
    },

    setFilters({ search, category, status } = {}) {
      if (search !== undefined) this.searchQuery = search
      if (category !== undefined) this.selectedCategory = category
      if (status !== undefined) this.selectedStatus = status
    }
  }
})
