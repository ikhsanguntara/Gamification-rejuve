import { defineStore } from 'pinia'
import { calculateStars } from '../utils/star.js'
import { useGamificationStore } from './gamification.js'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { batchApi, evaluationApi } from '../services/api.js'
import { cachedApiCall, invalidateApiCache } from '../utils/apiCache.js'

/**
 * Mission Store: Manages store-wide missions across batches and weeks, and Superadmin CRUD
 */

export const useMissionStore = defineStore('mission', {
  state: () => ({
    missions: getStoredData('rejuve_missions_v4', []),
    searchQuery: '',
    selectedCategory: 'ALL',
    selectedStatus: 'ALL'
  }),

  getters: {
    allMissions: (state) => state.missions || [],
    missionsByBatch: (state) => (batchId) => {
      const all = state.missions || []
      if (!batchId || batchId === 'ALL') return all
      const filtered = all.filter(m => m.batchId === batchId)
      if (filtered.length > 0) return filtered
      // Fallback: jika misi tidak memiliki batchId spesifik, sertakan misi umum
      return all.filter(m => !m.batchId || m.batchId === batchId)
    },
    missionsByWeek: (state) => (batchId, weekNumber) => {
      const bMissions = (state.missions || []).filter(m => !batchId || batchId === 'ALL' || m.batchId === batchId || !m.batchId)
      return bMissions.filter(m => m.week === Number(weekNumber))
    },
    missionById: (state) => (id) => (state.missions || []).find(m => m.id === id || m.missionId === id || m.userMissionId === id),
    completedCount: (state) => (state.missions || []).filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length,
    pendingCount: (state) => (state.missions || []).filter(m => m.status === 'PENDING_REVIEW').length,
    revisionCount: (state) => (state.missions || []).filter(m => m.status === 'REVISION_REQUIRED').length,

    /**
     * Get a specific crew's evaluation detail for a given mission
     */
    crewEvaluationForMission: (state) => (missionId, crewId) => {
      const mission = state.missions.find(m => m.id === missionId || m.missionId === missionId)
      if (!mission || !mission.crewEvaluations) return null
      return mission.crewEvaluations.find(ce => ce.crewId === crewId)
    }
  },

  actions: {
    async fetchMissionsFromApi(params = {}, forceRefresh = false) {
      let actualParams = params
      let actualForce = forceRefresh

      // Polymorphic compatibility: mendukung pemanggilan (forceRefresh, queryParams) maupun (queryParams, forceRefresh)
      if (typeof params === 'boolean') {
        actualForce = params
        actualParams = forceRefresh && typeof forceRefresh === 'object' ? forceRefresh : {}
      }

      try {
        const cacheKey = `missions:${JSON.stringify(actualParams || {})}`
        const resData = await cachedApiCall(cacheKey, async () => {
          const [batchRes, missionRes] = await Promise.allSettled([
            batchApi.getAll({ limit: 50 }),
            evaluationApi.getUserMissions({ limit: 100, type: 'JOURNEY', ...(actualParams || {}) })
          ])

          const userMissions = (missionRes.status === 'fulfilled' && missionRes.value?.data && Array.isArray(missionRes.value.data))
            ? missionRes.value.data
            : []
          const batches = (batchRes.status === 'fulfilled' && batchRes.value?.data && Array.isArray(batchRes.value.data))
            ? batchRes.value.data
            : []

          return { userMissions, batches }
        }, 15000, actualForce)

        const userMissions = resData?.userMissions || []
        const batches = resData?.batches || []

        if (userMissions.length > 0) {
          // Filter hanya misi bertipe JOURNEY (misi operasional mingguan) agar kuesioner feedback atau buddy tidak tercampur
          const journeyUserMissions = userMissions.filter(um => {
            const mType = (um.mission?.type || '').toUpperCase()
            return !mType || mType === 'JOURNEY'
          })

          const targetList = journeyUserMissions.length > 0 ? journeyUserMissions : userMissions

          const missionMap = new Map()

          targetList.forEach((um, idx) => {
            const m = um.mission || {}
            const missionKey = m.missionId || um.userMissionId || `msn-${idx}`

            let status = 'IN_PROGRESS'
            if (um.status === 'LOCKED') status = 'LOCKED'
            else if (um.status === 'SCORED_BY_TL') status = 'PENDING_REVIEW'
            else if (um.status === 'APPROVED_BY_DM' || um.status === 'COMPLETED') status = 'COMPLETED'
            else if (um.status === 'REVISED_BY_DM') status = 'REVISION_REQUIRED'
            else if (um.status === 'OPEN' || um.status === 'ACTIVE') status = 'IN_PROGRESS'

            const score = Number(um.finalScore !== null && um.finalScore !== undefined ? um.finalScore : (um.dmScore !== null && um.dmScore !== undefined ? um.dmScore : (um.tlScore || 0)))
            const earnedStars = calculateStars(score)

            // Extract real SOP Checklist from database
            let sopChecklist = []
            if (Array.isArray(m.sopChecklist) && m.sopChecklist.length > 0) {
              sopChecklist = m.sopChecklist.map(s => typeof s === 'string' ? s : (s.item || s.text || s.title || JSON.stringify(s)))
            }

            const crewEval = {
              crewId: um.userId,
              crewName: um.user?.name || 'Crew',
              score: score,
              calculatedStars: earnedStars,
              awardedStars: (status === 'COMPLETED') ? earnedStars : 0,
              status
            }

            const rawBatchId = um.batchId || m.batchId || um.user?.batchId || um.user?.activeBatchId || actualParams?.batchId || ''
            const matchedBatch = batches.find(b => b.batchId === rawBatchId || b.id === rawBatchId || b.code === rawBatchId)
            const resolvedBatchId = rawBatchId || matchedBatch?.batchId || matchedBatch?.id || ''

            if (!missionMap.has(missionKey)) {
              missionMap.set(missionKey, {
                id: missionKey,
                missionId: m.missionId || missionKey,
                userMissionId: um.userMissionId,
                batchId: resolvedBatchId,
                week: Number(m.weekOrDayNumber || m.week || 1),
                code: m.code || `MSN-0${missionMap.size + 1}`,
                title: m.missionTitle || 'Misi Standar Operasional',
                category: m.category || 'TECHNICAL',
                description: m.description || `Evaluasi standar operasional ${m.missionTitle || 'misi'}`,
                assignedCrewIds: um.userId ? [um.userId] : [],
                crewEvaluations: [crewEval],
                status,
                averageScore: score,
                calculatedStars: earnedStars,
                awardedStars: (status === 'COMPLETED') ? earnedStars : 0,
                deadline: m.endDate?.split('T')[0] || '',
                requirements: sopChecklist,
                supervisorId: um.tlId || '',
                reviewerId: um.dmId || '',
                createdAt: um.createdAt || new Date().toISOString()
              })
            } else {
              const existing = missionMap.get(missionKey)
              if (um.userId && !existing.assignedCrewIds.includes(um.userId)) {
                existing.assignedCrewIds.push(um.userId)
              }
              const evalIdx = existing.crewEvaluations.findIndex(e => e.crewId === um.userId)
              if (evalIdx !== -1) {
                existing.crewEvaluations[evalIdx] = crewEval
              } else {
                existing.crewEvaluations.push(crewEval)
              }

              // Hitung rata-rata skor dan status gabungan seluruh kru
              const validScores = existing.crewEvaluations.map(e => e.score).filter(s => s > 0)
              const avgScore = validScores.length > 0
                ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                : 0
              existing.averageScore = avgScore
              existing.calculatedStars = calculateStars(avgScore)

              const allDone = existing.crewEvaluations.length > 0 && existing.crewEvaluations.every(e => e.status === 'COMPLETED')
              const anyRev = existing.crewEvaluations.some(e => e.status === 'REVISION_REQUIRED')
              const anyPending = existing.crewEvaluations.some(e => e.status === 'PENDING_REVIEW')
              if (allDone) existing.status = 'COMPLETED'
              else if (anyRev) existing.status = 'REVISION_REQUIRED'
              else if (anyPending) existing.status = 'PENDING_REVIEW'
              else existing.status = 'IN_PROGRESS'

              existing.awardedStars = (existing.status === 'COMPLETED') ? existing.calculatedStars : 0
            }
          })

          this.missions = Array.from(missionMap.values())
          setStoredData('rejuve_missions_v4', this.missions)
          return this.missions
        }
      } catch (err) {
        console.warn('fetchMissionsFromApi error:', err.message)
      }
    },

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
        batchId: payload.batchId || null,
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
        requirements: Array.isArray(payload.requirements) ? payload.requirements : (Array.isArray(payload.sopChecklist) ? payload.sopChecklist : []),
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
