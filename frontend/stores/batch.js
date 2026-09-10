import { defineStore } from 'pinia'
import { useTemplateStore } from './template.js'
import { useUserStore } from './user.js'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { batchApi, authApi } from '../services/api.js'
import { buildPrismaQuery } from '../utils/queryBuilder.js'
import { cachedApiCall, invalidateApiCache } from '../utils/apiCache.js'

/**
 * Helper: Format date to short readable string e.g. "01 Sep"
 */
export function formatShortDate(dateObj) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const d = String(dateObj.getDate()).padStart(2, '0')
  const m = months[dateObj.getMonth()]
  return `${d} ${m}`
}

/**
 * Helper: Calculate which week is active based on batch startDate and today's date
 */
export function calculateActiveWeek(batch) {
  if (!batch || !batch.startDate) return batch?.currentWeek || 1
  const totalWeeks = batch?.weeks?.length || batch?.totalWeeks || 3
  
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const parts = batch.startDate.split('-').map(Number)
    const start = new Date(parts[0], parts[1] - 1, parts[2])
    start.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 1
    const weekIndex = Math.floor(diffDays / 7) + 1
    return Math.min(Math.max(weekIndex, 1), totalWeeks)
  } catch {
    return batch?.currentWeek || 1
  }
}

/**
 * Helper: Compute weeks calendar dates and status dynamically (2, 3, 4, 5+ weeks)
 */
export function computeWeeksLifecycle(startDateStr, customWeeks = [], totalWeeksOverride = null) {
  const defaultStartDate = startDateStr || new Date().toISOString().split('T')[0]
  const parts = defaultStartDate.split('-').map(Number)
  const baseStart = new Date(parts[0], parts[1] - 1, parts[2])

  const totalWeeksCount = Math.max(
    Number(totalWeeksOverride) || 0,
    customWeeks.length > 0 ? customWeeks.length : 0,
    3
  )
  const activeWeek = calculateActiveWeek({ startDate: defaultStartDate, totalWeeks: totalWeeksCount })

  const weekNums = Array.from({ length: totalWeeksCount }, (_, i) => i + 1)

  return weekNums.map(wNum => {
    const custom = customWeeks[wNum - 1] || {}
    const wStart = new Date(baseStart.getTime() + (wNum - 1) * 7 * 24 * 60 * 60 * 1000)
    const wEnd = new Date(wStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    const title = custom.title || `Minggu ${wNum}: Tema SOP Operasional`

    let status = 'LOCKED'
    let isLocked = true
    if (wNum < activeWeek) {
      status = 'COMPLETED'
      isLocked = false
    } else if (wNum === activeWeek) {
      status = 'ACTIVE'
      isLocked = false
    }

    return {
      weekNumber: wNum,
      title,
      startDate: formatShortDate(wStart),
      endDate: formatShortDate(wEnd),
      status: custom.status || status,
      isLocked: custom.isLocked !== undefined ? custom.isLocked : isLocked,
      missionCount: custom.missionCount || 4,
      completionRate: custom.completionRate !== undefined ? custom.completionRate : (wNum < activeWeek ? 100 : 0)
    }
  })
}

export const EMPTY_BATCH_FALLBACK = {
  id: '',
  code: '',
  name: '',
  storeLocation: '',
  description: '',
  currentWeek: 1,
  totalWeeks: 3,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  status: 'ACTIVE',
  totalCrew: 0,
  totalMissions: 0,
  completedMissions: 0,
  averageScore: 0,
  totalStars: 0,
  assignment: {
    storeLeaderId: '',
    storeLeaderName: '-',
    districtManagerId: '',
    districtManagerName: '-',
    supervisorId: '',
    supervisorName: '-',
    headId: '',
    headName: '-',
    crewIds: []
  },
  weeks: []
}

/**
 * Batch Store: Manage active batch, 3-week lifecycle, aggregated metrics, and Superadmin CRUD
 */

export const useBatchStore = defineStore('batch', {
  state: () => ({
    batches: getStoredData('rejuve_batches_v4', []),
    selectedBatchId: '',
    customSelectedWeek: null, // Follows batch's active week if not manually clicked
    isLiveApi: false,
    serverPagination: {
      total: 0,
      page: 1,
      limit: 9,
      totalPages: 1
    }
  }),

  getters: {
    allBatches: (state) => state.batches,
    accessibleBatches: (state) => {
      const userStore = useUserStore()
      if (userStore.isSuperadmin) return state.batches
      if (userStore.isStoreLeader) {
        const my = state.batches.filter(b => 
          b.assignment?.storeLeaderId === userStore.currentUserId ||
          b.assignment?.supervisorId === userStore.currentUserId ||
          b.storeLeaderId === userStore.currentUserId
        )
        return my.length > 0 ? my : state.batches
      }
      if (userStore.isDistrictManager) {
        const my = state.batches.filter(b => 
          b.assignment?.districtManagerId === userStore.currentUserId ||
          b.assignment?.headId === userStore.currentUserId ||
          b.districtManagerId === userStore.currentUserId
        )
        return my.length > 0 ? my : state.batches
      }
      if (userStore.isCrew) {
        const cBatch = userStore.currentUser?.batchId
        const my = state.batches.filter(b => b.id === cBatch || b.assignment?.crewIds?.includes(userStore.currentUserId))
        return my.length > 0 ? my : state.batches
      }
      return state.batches
    },
    currentBatch: (state) => {
      const found = state.batches.find(b => b.id === state.selectedBatchId)
      if (found) return found
      const userStore = useUserStore()
      if (userStore.isStoreLeader || userStore.isDistrictManager || userStore.isCrew) {
        const acc = state.accessibleBatches
        if (acc && acc.length > 0) return acc[0]
      }
      return state.batches[0] || EMPTY_BATCH_FALLBACK
    },
    batchById: (state) => (id) => state.batches.find(b => b.id === id),
    activeWeekNumber: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId) || state.batches[0] || EMPTY_BATCH_FALLBACK
      return calculateActiveWeek(batch)
    },
    selectedWeek: (state) => {
      if (state.customSelectedWeek !== null) {
        return state.customSelectedWeek
      }
      const batch = state.batches.find(b => b.id === state.selectedBatchId) || state.batches[0] || EMPTY_BATCH_FALLBACK
      return calculateActiveWeek(batch)
    },
    currentBatchWeeks: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId) || state.batches[0] || EMPTY_BATCH_FALLBACK
      const totalWeeks = batch.totalWeeks || (Array.isArray(batch.weeks) ? batch.weeks.length : 3)
      return computeWeeksLifecycle(batch.startDate, batch.weeks || [], totalWeeks)
    },
    isWeekSelectedLocked: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId) || state.batches[0] || EMPTY_BATCH_FALLBACK
      const activeW = calculateActiveWeek(batch)
      const selW = state.customSelectedWeek !== null ? state.customSelectedWeek : activeW
      return selW !== activeW
    },
    isWeekLocked: (state) => (weekNumber) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId) || state.batches[0] || EMPTY_BATCH_FALLBACK
      return Number(weekNumber) !== calculateActiveWeek(batch)
    }
  },

  actions: {
    async selectBatch(batchId) {
      const batch = this.batches.find(b => b.id === batchId || b.code === batchId)
      const targetId = batch ? batch.id : batchId
      if (batch) {
        this.selectedBatchId = batch.id
        this.customSelectedWeek = calculateActiveWeek(batch)
      } else if (targetId) {
        this.selectedBatchId = targetId
      }

      invalidateApiCache()

      const userStore = useUserStore()
      if (userStore.isAuthenticated && (userStore.token || userStore.isLiveApi) && targetId) {
        try {
          const res = await authApi.setActiveBatch(targetId)
          if (res?.data) {
            if (res.data.token) {
              userStore.token = res.data.token
            }
            if (userStore.apiUser) {
              userStore.apiUser.activeBatchId = res.data.activeBatchId || targetId
              if (res.data.activeBatch) {
                userStore.apiUser.activeBatch = res.data.activeBatch
              }
              if (res.data.availableBatches) {
                userStore.apiUser.availableBatches = res.data.availableBatches
              }
            }
          }
        } catch (err) {
          console.warn('Gagal sinkronisasi active batch ke API:', err.message)
        }
      }
    },

    selectWeek(weekNumber) {
      this.customSelectedWeek = Number(weekNumber)
    },

    updateBatchMetrics({ completedIncrement = 0, starsIncrement = 0 } = {}) {
      const batch = this.batches.find(b => b.id === this.selectedBatchId)
      if (batch) {
        if (completedIncrement > 0) {
          batch.completedMissions = Math.min(batch.totalMissions, batch.completedMissions + completedIncrement)
        }
        if (starsIncrement > 0) {
          batch.totalStars += starsIncrement
        }
        setStoredData('rejuve_batches_v4', this.batches)
      }
    },

    async fetchBatchesFromApi(params = {}, forceRefresh = false) {
      try {
        const contains = {}
        const exact = {}

        if (params.search && params.search.trim()) {
          contains.name = params.search.trim()
        }
        if (params.status && params.status !== 'ALL') {
          exact.status = params.status
        }

        const query = buildPrismaQuery({
          page: params.page || 1,
          limit: params.limit || 9,
          contains,
          exact
        })

        const cacheKey = `batches:${JSON.stringify(query)}`
        const res = await cachedApiCall(cacheKey, () => batchApi.getAll(query), 30000, forceRefresh)
        if (res && res.data && Array.isArray(res.data)) {
          this.isLiveApi = true
          this.batches = res.data.map(b => {
            const startDate = b.startDate ? b.startDate.split('T')[0] : new Date().toISOString().split('T')[0]
            const endDate = b.endDate ? b.endDate.split('T')[0] : new Date().toISOString().split('T')[0]

            const buddyDetail = b.details?.find(d => d.tplMission?.type === 'BUDDY')
            const journeyDetail = b.details?.find(d => d.tplMission?.type === 'JOURNEY')
            const feedbackDetail = b.details?.find(d => d.tplMission?.type === 'FEEDBACK')

            const maxWeeksFromTpl = (journeyDetail?.tplMission?.details || []).reduce((max, d) => Math.max(max, Number(d.durationNumber || d.week || 1)), 1)
            const maxWeeksFromDuration = Number(journeyDetail?.tplMission?.durationValue) || 0
            const maxWeeksFromMissions = (b.missions || []).reduce((max, m) => Math.max(max, Number(m.weekOrDayNumber || m.week || 1)), 1)
            const customWeeksFromTpl = (journeyDetail?.tplMission?.details || []).length > 0
              ? Array.from({ length: Math.max(maxWeeksFromTpl, maxWeeksFromDuration) }, (_, i) => ({
                  weekNumber: i + 1,
                  title: `Minggu ${i + 1}: Tema SOP Operasional`
                }))
              : []

            const calculatedTotalWeeks = Math.max(
              Number(b.totalWeeks) || 0,
              maxWeeksFromTpl,
              maxWeeksFromDuration,
              maxWeeksFromMissions,
              Array.isArray(b.weeks) && b.weeks.length > 0 ? b.weeks.length : 0,
              3
            )

            const finalWeeks = computeWeeksLifecycle(
              startDate,
              (Array.isArray(b.weeks) && b.weeks.length > 0) ? b.weeks : customWeeksFromTpl,
              calculatedTotalWeeks
            )

            return {
              id: b.batchId,
              code: b.code,
              name: b.name,
              storeLocation: b.name,
              description: b.name || `Siklus onboarding ${b.name}`,
              currentWeek: b.currentWeek || 1,
              totalWeeks: calculatedTotalWeeks,
              startDate,
              endDate,
              status: b.status || 'OPEN',
              totalCrew: b._count?.users ?? (b.members?.length || 0),
              totalMissions: b._count?.missions ?? 0,
              completedMissions: b._count?.completedMissions || 0,
              averageScore: Number(b.averageScore) || 0,
              totalStars: Number(b.totalStars) || 0,
              details: b.details || [],
              buddyTemplate: buddyDetail?.tplMission || null,
              journeyTemplate: journeyDetail?.tplMission || null,
              feedbackTemplate: feedbackDetail?.tplMission || null,
              buddyPackageId: buddyDetail?.tplMissionId || 'NONE',
              templatePackageId: journeyDetail?.tplMissionId || 'NONE',
              feedbackPackageId: feedbackDetail?.tplMissionId || 'NONE',
              assignment: {
                storeLeaderId: b.storeLeaderId || b.leaderUserId || '',
                storeLeaderName: b.storeLeader?.name || b.leaderUser?.name || b.storeLeaderName || '-',
                districtManagerId: b.districtManagerId || b.districtManagerUserId || '',
                districtManagerName: b.districtManager?.name || b.districtManagerUser?.name || b.districtManagerName || '-',
                supervisorId: b.storeLeaderId || b.leaderUserId || '',
                supervisorName: b.storeLeader?.name || b.leaderUser?.name || b.storeLeaderName || '-',
                headId: b.districtManagerId || b.districtManagerUserId || '',
                headName: b.districtManager?.name || b.districtManagerUser?.name || b.districtManagerName || '-',
                crewIds: Array.isArray(b.crewIds) ? b.crewIds : Array.isArray(b.users) ? b.users.map(u => u.userId || u.id) : []
              },
              weeks: finalWeeks
            }
          })

          const meta = res.meta || res.pagination || {}
          this.serverPagination = {
            total: meta.total !== undefined ? meta.total : res.data.length,
            page: meta.page || params.page || 1,
            limit: meta.limit || params.limit || 9,
            totalPages: meta.totalPages || 1
          }

          const userStore = useUserStore()
          const preferredId = userStore.apiUser?.activeBatchId
          if (preferredId && this.batches.find(b => b.id === preferredId)) {
            this.selectedBatchId = preferredId
          } else if (this.batches.length > 0 && (!this.selectedBatchId || !this.batches.find(b => b.id === this.selectedBatchId))) {
            this.selectedBatchId = this.batches[0].id
          }
          return this.batches
        }
      } catch (err) {
        console.warn('fetchBatchesFromApi error:', err.message)
      }
    },

    async fetchBatchByIdFromApi(batchId) {
      if (!batchId) return null
      try {
        const res = await batchApi.getById(batchId)
        const b = res?.data?.data || res?.data
        if (b && (b.batchId || b.id)) {
          const id = b.batchId || b.id
          const startDate = b.startDate ? b.startDate.split('T')[0] : new Date().toISOString().split('T')[0]
          const endDate = b.endDate ? b.endDate.split('T')[0] : new Date().toISOString().split('T')[0]

          const buddyDetail = b.details?.find(d => d.tplMission?.type === 'BUDDY')
          const journeyDetail = b.details?.find(d => d.tplMission?.type === 'JOURNEY')
          const feedbackDetail = b.details?.find(d => d.tplMission?.type === 'FEEDBACK')

          const users = Array.isArray(b.users) ? b.users : []
          const missions = Array.isArray(b.missions) ? b.missions : []
          const crewIds = users.map(u => u.userId || u.id)

          const maxWeeksFromTpl = (journeyDetail?.tplMission?.details || []).reduce((max, d) => Math.max(max, Number(d.durationNumber || d.week || 1)), 1)
          const maxWeeksFromDuration = Number(journeyDetail?.tplMission?.durationValue) || 0
          const maxWeeksFromMissions = (missions || []).reduce((max, m) => Math.max(max, Number(m.weekOrDayNumber || m.week || 1)), 1)
          const customWeeksFromTpl = (journeyDetail?.tplMission?.details || []).length > 0
            ? Array.from({ length: Math.max(maxWeeksFromTpl, maxWeeksFromDuration) }, (_, i) => ({
                weekNumber: i + 1,
                title: `Minggu ${i + 1}: Tema SOP Operasional`
              }))
            : []

          const calculatedTotalWeeks = Math.max(
            Number(b.totalWeeks) || 0,
            maxWeeksFromTpl,
            maxWeeksFromDuration,
            maxWeeksFromMissions,
            Array.isArray(b.weeks) && b.weeks.length > 0 ? b.weeks.length : 0,
            3
          )

          const finalWeeks = computeWeeksLifecycle(
            startDate,
            (Array.isArray(b.weeks) && b.weeks.length > 0) ? b.weeks : customWeeksFromTpl,
            calculatedTotalWeeks
          )

          const formattedBatch = {
            id,
            batchId: id,
            code: b.code || '',
            name: b.name || '',
            storeLocation: b.name || 'Multi-Store (Seluruh Cabang Re.juve)',
            description: b.name || `Siklus gamifikasi ${b.name}`,
            currentWeek: b.currentWeek || 1,
            totalWeeks: calculatedTotalWeeks,
            startDate,
            endDate,
            status: b.status || 'OPEN',
            totalCrew: b._count?.users ?? users.length,
            totalMissions: b._count?.missions ?? missions.length,
            completedMissions: b._count?.completedMissions || 0,
            averageScore: Number(b.averageScore) || 0,
            totalStars: Number(b.totalStars) || 0,
            details: b.details || [],
            missions,
            users,
            buddyTemplate: buddyDetail?.tplMission || null,
            journeyTemplate: journeyDetail?.tplMission || null,
            feedbackTemplate: feedbackDetail?.tplMission || null,
            buddyPackageId: buddyDetail?.tplMissionId || 'NONE',
            templatePackageId: journeyDetail?.tplMissionId || 'NONE',
            feedbackPackageId: feedbackDetail?.tplMissionId || 'NONE',
            assignment: {
              storeLeaderId: b.storeLeaderId || b.leaderUserId || '',
              storeLeaderName: b.storeLeader?.name || b.leaderUser?.name || b.storeLeaderName || '-',
              districtManagerId: b.districtManagerId || b.districtManagerUserId || '',
              districtManagerName: b.districtManager?.name || b.districtManagerUser?.name || b.districtManagerName || '-',
              supervisorId: b.storeLeaderId || b.leaderUserId || '',
              supervisorName: b.storeLeader?.name || b.leaderUser?.name || b.storeLeaderName || '-',
              headId: b.districtManagerId || b.districtManagerUserId || '',
              headName: b.districtManager?.name || b.districtManagerUser?.name || b.districtManagerName || '-',
              crewIds
            },
            approvalConfig: {
              minScoreFor5Stars: 90,
              minEvidenceCount: 1,
              maxRevisions: 3,
              requireEvidence: true
            },
            weeks: finalWeeks
          }

          // Sinkronisasikan ke state batches array di store
          const existingIdx = this.batches.findIndex(item => item.id === id)
          if (existingIdx !== -1) {
            this.batches[existingIdx] = { ...this.batches[existingIdx], ...formattedBatch }
          } else {
            this.batches.push(formattedBatch)
          }

          return formattedBatch
        }
      } catch (err) {
        console.warn(`fetchBatchByIdFromApi(${batchId}) error:`, err.message)
      }
      return null
    },

    // ==================== SUPERADMIN ACTIONS ====================

    createBatch(payload) {
      const id = `batch-${Date.now()}`
      const existingCodes = this.batches
        .map(b => b.code)
        .filter(c => /^BTH-\d+$/i.test(c))
        .map(c => parseInt(c.replace(/BTH-/i, ''), 10))
      const maxNum = existingCodes.length > 0 ? Math.max(...existingCodes) : 0
      const autoCode = `BTH-${String(Math.max(maxNum + 1, this.batches.length + 1)).padStart(2, '0')}`
      const code = payload.code || autoCode

      const startDate = payload.startDate || new Date().toISOString().split('T')[0]
      const endDate = payload.endDate || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const crewIds = payload.assignment?.crewIds || payload.crewIds || []

      const totalWeeksCount = Math.max(
        Number(payload.totalWeeks) || 0,
        Array.isArray(payload.weeks) ? payload.weeks.length : 0,
        3
      )

      const customWeeks = Array.isArray(payload.weeks) && payload.weeks.length > 0
        ? payload.weeks
        : Array.from({ length: totalWeeksCount }, (_, i) => ({
            weekNumber: i + 1,
            title: payload[`week${i + 1}Title`] || `Minggu ${i + 1}: Tema SOP Operasional`
          }))

      const computedWeeks = computeWeeksLifecycle(startDate, customWeeks, totalWeeksCount)
      const currentActiveWeek = calculateActiveWeek({ startDate, totalWeeks: totalWeeksCount })

      const newBatch = {
        id,
        code,
        name: payload.name,
        storeLocation: payload.storeLocation || payload.name,
        description: payload.description || `Siklus gamifikasi dan penjaminan mutu gerai ${payload.name}.`,
        currentWeek: currentActiveWeek,
        totalWeeks: totalWeeksCount,
        startDate,
        endDate,
        status: payload.status || 'ACTIVE',
        totalCrew: crewIds.length,
        totalMissions: 12,
        completedMissions: 0,
        averageScore: 0,
        totalStars: 0,
        assignment: {
          storeLeaderId: payload.assignment?.storeLeaderId || payload.storeLeaderId || payload.assignment?.supervisorId || payload.supervisorId || '',
          storeLeaderName: payload.assignment?.storeLeaderName || payload.storeLeaderName || payload.assignment?.supervisorName || payload.supervisorName || '-',
          districtManagerId: payload.assignment?.districtManagerId || payload.districtManagerId || payload.assignment?.headId || payload.headId || '',
          districtManagerName: payload.assignment?.districtManagerName || payload.districtManagerName || payload.assignment?.headName || payload.headName || '-',
          // Backwards compatibility alias
          supervisorId: payload.assignment?.storeLeaderId || payload.storeLeaderId || payload.assignment?.supervisorId || payload.supervisorId || '',
          supervisorName: payload.assignment?.storeLeaderName || payload.storeLeaderName || payload.assignment?.supervisorName || payload.supervisorName || '-',
          headId: payload.assignment?.districtManagerId || payload.districtManagerId || payload.assignment?.headId || payload.headId || '',
          headName: payload.assignment?.districtManagerName || payload.districtManagerName || payload.assignment?.headName || payload.headName || '-',
          crewIds: crewIds
        },
        approvalConfig: {
          minScoreFor5Stars: Number(payload.approvalConfig?.minScoreFor5Stars) || 90,
          minEvidenceCount: Number(payload.approvalConfig?.minEvidenceCount) || 1,
          maxRevisions: Number(payload.approvalConfig?.maxRevisions) || 3,
          requireEvidence: payload.approvalConfig?.requireEvidence !== false
        },
        weeks: computedWeeks
      }

      this.batches.push(newBatch)
      this.selectedBatchId = newBatch.id
      this.customSelectedWeek = currentActiveWeek
      setStoredData('rejuve_batches_v4', this.batches)
      invalidateApiCache('batches')

      // ⚡ Automatically apply template package (12 missions) if enabled!
      if (payload.applyTemplatePackage !== false) {
        const templateStore = useTemplateStore()
        templateStore.applyPackageToBatch(id, payload.templatePackageId || 'pkg-sop-standard')
      }

      return newBatch
    },

    updateBatch(id, payload) {
      const batch = this.batches.find(b => b.id === id)
      if (!batch) return null

      // Deep merge assignments and configs
      if (payload.assignment) {
        batch.assignment = { ...batch.assignment, ...payload.assignment }
        if (payload.assignment.crewIds) {
          batch.totalCrew = payload.assignment.crewIds.length
        }
      }
      if (payload.approvalConfig) {
        batch.approvalConfig = { ...batch.approvalConfig, ...payload.approvalConfig }
      }

      const startDate = payload.startDate || batch.startDate
      if (payload.weeks && Array.isArray(payload.weeks)) {
        batch.weeks = computeWeeksLifecycle(startDate, payload.weeks)
      } else if (payload.startDate && payload.startDate !== batch.startDate) {
        batch.weeks = computeWeeksLifecycle(payload.startDate, batch.weeks)
      }

      batch.currentWeek = calculateActiveWeek({ startDate })

      Object.assign(batch, {
        name: payload.name !== undefined ? payload.name : batch.name,
        code: payload.code !== undefined ? payload.code : batch.code,
        storeLocation: payload.storeLocation !== undefined ? payload.storeLocation : batch.storeLocation,
        description: payload.description !== undefined ? payload.description : batch.description,
        startDate: payload.startDate !== undefined ? payload.startDate : batch.startDate,
        endDate: payload.endDate !== undefined ? payload.endDate : batch.endDate,
        status: payload.status !== undefined ? payload.status : batch.status
      })

      setStoredData('rejuve_batches_v4', this.batches)
      invalidateApiCache('batches')
      return batch
    },

    deleteBatch(id) {
      const idx = this.batches.findIndex(b => b.id === id)
      if (idx !== -1) {
        const removed = this.batches.splice(idx, 1)[0]
        if (this.selectedBatchId === id) {
          this.selectedBatchId = this.batches[0]?.id || ''
          this.customSelectedWeek = null
        }
        setStoredData('rejuve_batches_v4', this.batches)
        invalidateApiCache('batches')
        return removed
      }
      return null
    }
  }
})
