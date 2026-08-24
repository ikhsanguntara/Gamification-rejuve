import { defineStore } from 'pinia'
import { mockCrews } from '~/mocks/crews.js'
import { mockAchievements } from '~/mocks/achievements.js'
import { calculateStarLevel } from '~/utils/star.js'

/**
 * Gamification Store: Stars, Levels, Leaderboard & Achievements
 */

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    crews: JSON.parse(JSON.stringify(mockCrews)),
    achievements: JSON.parse(JSON.stringify(mockAchievements))
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
