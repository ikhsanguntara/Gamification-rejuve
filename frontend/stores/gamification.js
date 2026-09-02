import { defineStore } from 'pinia'
import { mockCrews } from '~/mocks/crews.js'
import { mockAchievements } from '~/mocks/achievements.js'
import { calculateStarLevel } from '~/utils/star.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

/**
 * Gamification Store: Stars, Levels, Leaderboard & Achievements
 */

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    crews: getStoredData('rejuve_crews_v3', mockCrews),
    achievements: getStoredData('rejuve_achievements_v3', mockAchievements)
  }),

  getters: {
    allCrews: (state) => state.crews,
    crewsByBatch: (state) => (batchId) => state.crews.filter(c => c.batchId === batchId),
    crewById: (state) => (id) => state.crews.find(c => c.id === id),
    allAchievements: (state) => state.achievements,
    unlockedAchievements: (state) => state.achievements.filter(a => a.isUnlocked),
    lockedAchievements: (state) => state.achievements.filter(a => !a.isUnlocked),

    /**
     * Realtime Reactive Leaderboard sorted by total stars descending
     */
    leaderboard: (state) => {
      return state.crews
        .slice()
        .sort((a, b) => b.stars - a.stars)
        .map((crew, index) => ({
          rank: index + 1,
          crewId: crew.id,
          name: crew.name,
          code: crew.code,
          avatar: crew.avatar,
          position: crew.position,
          department: crew.department,
          storeLocation: crew.storeLocation,
          batchId: crew.batchId,
          stars: crew.stars,
          level: crew.level,
          completedMissions: crew.completedMissions,
          averageScore: crew.averageScore,
          rankChange: index === 0 ? 'same' : index % 2 === 0 ? 'up' : 'same',
          rankChangeAmount: index % 2 === 0 ? 1 : 0
        }))
    },

    leaderboardByBatch: (state) => (batchId) => {
      const filtered = batchId && batchId !== 'ALL' ? state.crews.filter(c => c.batchId === batchId) : state.crews
      return filtered
        .slice()
        .sort((a, b) => b.stars - a.stars)
        .map((crew, index) => ({
          rank: index + 1,
          crewId: crew.id,
          name: crew.name,
          code: crew.code,
          avatar: crew.avatar,
          position: crew.position,
          department: crew.department,
          storeLocation: crew.storeLocation,
          batchId: crew.batchId,
          stars: crew.stars,
          level: crew.level,
          completedMissions: crew.completedMissions,
          averageScore: crew.averageScore,
          rankChange: index === 0 ? 'same' : index % 2 === 0 ? 'up' : 'same',
          rankChangeAmount: index % 2 === 0 ? 1 : 0
        }))
    },

    topThree(state) {
      return this.leaderboard.slice(0, 3)
    }
  },

  actions: {
    // ==================== SUPERADMIN ACTIONS ====================
    addNewCrew(payload) {
      return this.addCrew(payload)
    },

    addCrew(payload) {
      const newCrew = {
        id: payload.id || `crew-${Date.now()}`,
        name: payload.name,
        code: payload.code || `CRW-${String(this.crews.length + 1).padStart(3, '0')}`,
        avatar: payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        position: payload.position || 'Store Specialist',
        department: payload.department || 'Store Operations',
        storeLocation: payload.storeLocation || 'Re.juve Store',
        batchId: payload.batchId || null,
        stars: Number(payload.stars) || 0,
        level: calculateStarLevel(Number(payload.stars) || 0),
        completedMissions: Number(payload.completedMissions) || 0,
        averageScore: Number(payload.averageScore) || 0,
        status: 'ACTIVE'
      }

      this.crews.push(newCrew)
      setStoredData('rejuve_crews_v3', this.crews)
      return newCrew
    },

    updateCrew(id, payload) {
      const crew = this.crews.find(c => c.id === id)
      if (!crew) return null
      Object.assign(crew, payload)
      if (payload.stars !== undefined) {
        crew.level = calculateStarLevel(crew.stars)
      }
      setStoredData('rejuve_crews_v3', this.crews)
      return crew
    },

    removeCrew(id) {
      const idx = this.crews.findIndex(c => c.id === id)
      if (idx !== -1) {
        const removed = this.crews.splice(idx, 1)[0]
        setStoredData('rejuve_crews_v3', this.crews)
        return removed
      }
      return null
    },

    reassignCrewBatch(crewId, newBatchId, storeLocation = '') {
      const crew = this.crews.find(c => c.id === crewId)
      if (crew) {
        crew.batchId = newBatchId
        if (storeLocation) crew.storeLocation = storeLocation
        setStoredData('rejuve_crews_v3', this.crews)
        return true
      }
      return false
    },

    // ==================== GAMIFICATION ACTIONS ====================
    awardStarsToCrew(crewId, starsAmount, meta = {}) {
      const crew = this.crews.find(c => c.id === crewId)
      if (!crew) return null

      const prevLevel = crew.level
      const starsToAdd = Number(starsAmount) || 0

      crew.stars += starsToAdd
      crew.completedMissions += 1

      // Recalculate level
      const newLevel = calculateStarLevel(crew.stars)
      const leveledUp = newLevel > prevLevel
      crew.level = newLevel

      // Check achievements
      const newlyUnlocked = this.evaluateAchievements(crew, meta)
      setStoredData('rejuve_crews_v3', this.crews)

      return {
        crewId,
        crewName: crew.name,
        starsAdded: starsToAdd,
        totalStars: crew.stars,
        previousLevel: prevLevel,
        newLevel,
        leveledUp,
        unlockedAchievements: newlyUnlocked
      }
    },

    evaluateAchievements(crew, meta = {}) {
      const unlockedList = []
      const now = new Date().toISOString().split('T')[0]

      this.achievements.forEach(ach => {
        if (ach.isUnlocked) return

        let shouldUnlock = false

        // 1. Mission Master (10 missions)
        if (ach.id === 'ach-001' && crew.completedMissions >= ach.targetValue) {
          ach.currentValue = crew.completedMissions
          shouldUnlock = true
        }

        // 2. Perfect Score (100)
        if (ach.id === 'ach-002' && meta.score >= 100) {
          ach.currentValue = 1
          shouldUnlock = true
        }

        // 3. Star Collector (1,000 Stars)
        if (ach.id === 'ach-005') {
          ach.currentValue = crew.stars
          if (crew.stars >= ach.targetValue) shouldUnlock = true
        }

        // 4. Rising Star (Level 5)
        if (ach.id === 'ach-006') {
          ach.currentValue = crew.level
          if (crew.level >= ach.targetValue) shouldUnlock = true
        }

        // 5. Star Legend (Level 10 / 3,500 Stars)
        if (ach.id === 'ach-007') {
          ach.currentValue = crew.stars
          if (crew.stars >= ach.targetValue) shouldUnlock = true
        }

        if (shouldUnlock) {
          ach.isUnlocked = true
          ach.unlockedAt = now
          crew.stars += (ach.starRewardBonus || 0)
          unlockedList.push(ach)
        }
      })

      return unlockedList
    }
  }
})
