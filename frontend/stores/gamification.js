import { defineStore } from 'pinia'
import { calculateStarLevel } from '../utils/star.js'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { gamificationApi } from '../services/api.js'
import { cachedApiCall, invalidateApiCache } from '../utils/apiCache.js'

/**
 * Gamification Store: Stars, Levels, Leaderboard & Achievements
 */

export const useGamificationStore = defineStore('gamification', {
  state: () => ({
    crews: getStoredData('rejuve_crews_v3', []),
    achievements: getStoredData('rejuve_achievements_v3', []),
    apiLeaderboard: [],
    apiPodium: [],
    isLoadingLeaderboard: false
  }),

  getters: {
    allCrews: (state) => state.crews || [],
    crewsByBatch: (state) => (batchId) => (state.crews || []).filter(c => c.batchId === batchId),
    crewById: (state) => (id) => (state.crews || []).find(c => c.id === id),
    allAchievements: (state) => state.achievements || [],
    unlockedAchievements: (state) => (state.achievements || []).filter(a => a.isUnlocked),
    lockedAchievements: (state) => (state.achievements || []).filter(a => !a.isUnlocked),

    /**
     * Realtime Reactive Leaderboard sorted by total stars descending
     */
    leaderboard: (state) => {
      if (state.apiLeaderboard && state.apiLeaderboard.length > 0) {
        return state.apiLeaderboard
      }
      return (state.crews || [])
        .slice()
        .sort((a, b) => (b.stars || 0) - (a.stars || 0))
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
      if (state.apiLeaderboard && state.apiLeaderboard.length > 0) {
        return state.apiLeaderboard
      }
      const list = state.crews || []
      const filtered = batchId && batchId !== 'ALL' ? list.filter(c => c.batchId === batchId) : list
      return filtered
        .slice()
        .sort((a, b) => (b.stars || 0) - (a.stars || 0))
        .map((crew, index) => ({
          id: crew.id,
          crewId: crew.id,
          userId: crew.id,
          rank: index + 1,
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

    podiumTopThree: (state) => {
      if (state.apiPodium && state.apiPodium.length > 0) {
        return state.apiPodium
      }
      return state.leaderboard.slice(0, 3)
    },

    podiumTopThreeByBatch: (state) => (batchId) => {
      if (state.apiPodium && state.apiPodium.length > 0) {
        return state.apiPodium
      }
      return state.leaderboardByBatch(batchId).slice(0, 3)
    }
  },

  actions: {
    // ==================== REST API LEADERBOARD ====================
    async fetchLeaderboardFromApi(params = {}, forceRefresh = false) {
      this.isLoadingLeaderboard = true
      try {
        const cleanParams = {}
        if (params.search && params.search.trim()) {
          cleanParams.search = params.search.trim()
        }
        if (params.batchId && params.batchId !== 'ALL') {
          cleanParams.batchId = params.batchId
        }
        if (params.departmentId && params.departmentId !== 'ALL') {
          cleanParams.departmentId = params.departmentId
        }
        cleanParams.limit = params.limit || 50

        const cacheKey = `leaderboard:${JSON.stringify(cleanParams)}`
        const res = await cachedApiCall(cacheKey, () => gamificationApi.getLeaderboard(cleanParams), 20000, forceRefresh)
        if (res?.success && res.data) {
          const rawList = res.data.rankings || res.data.leaderboard || res.data.list || (Array.isArray(res.data) ? res.data : [])
          this.apiLeaderboard = rawList.map((c, index) => ({
            id: c.userId || c.id || c.crewId,
            crewId: c.userId || c.id || c.crewId,
            userId: c.userId || c.id || c.crewId,
            rank: c.rank || index + 1,
            name: c.name || 'Crew Member',
            email: c.email || '',
            code: c.departmentCode && c.departmentCode !== '-' ? `CRW-${c.departmentCode}` : (c.code || 'CRW-NEW'),
            avatar: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || 'Crew')}`,
            position: c.position || 'Store Specialist',
            department: c.departmentName || c.department || 'Store Operations',
            storeLocation: c.departmentName || c.storeLocation || 'Gerai Re.juve',
            batchId: c.batchId,
            batchName: c.batchName || 'Batch Re.juve',
            stars: Number(c.stars) || 0,
            points: Number(c.points) || (Number(c.stars) || 0) * 20,
            level: Number(c.level) || 1,
            levelTitle: c.levelTitle || `Level ${c.level || 1}`,
            completedMissions: Number(c.completedMissions) || 0,
            averageScore: Number(c.averageScore) || 0,
            rankChange: c.rankChange || (index === 0 ? 'same' : (index % 2 === 0 ? 'up' : 'same')),
            rankChangeAmount: c.rankChangeAmount || (index % 2 === 0 ? 1 : 0)
          }))

          const rawPodium = res.data.podium || []
          this.apiPodium = rawPodium.length > 0
            ? rawPodium.map((c, index) => ({
                id: c.userId || c.id || c.crewId,
                crewId: c.userId || c.id || c.crewId,
                userId: c.userId || c.id || c.crewId,
                rank: c.rank || index + 1,
                name: c.name || 'Crew Member',
                avatar: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || 'Crew')}`,
                position: c.position || 'Store Specialist',
                storeLocation: c.departmentName || c.storeLocation || 'Gerai Re.juve',
                stars: Number(c.stars) || 0,
                points: Number(c.points) || (Number(c.stars) || 0) * 20,
                level: Number(c.level) || 1,
                levelTitle: c.levelTitle || `Level ${c.level || 1}`,
                completedMissions: Number(c.completedMissions) || 0
              }))
            : this.apiLeaderboard.slice(0, 3)

          return res.data
        }
      } catch (err) {
        console.warn('Gagal memuat leaderboard dari API:', err.message)
      } finally {
        this.isLoadingLeaderboard = false
      }
      return null
    },

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
