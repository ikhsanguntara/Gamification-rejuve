import { defineStore } from 'pinia'
import { mockBatches } from '~/mocks/batches.js'
import { useTemplateStore } from './template.js'
import { useUserStore } from './user.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

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
 * Helper: Calculate which week is active (1, 2, or 3) based on batch startDate and today's date
 */
export function calculateActiveWeek(batch) {
  if (!batch || !batch.startDate) return batch?.currentWeek || 1
  
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const parts = batch.startDate.split('-').map(Number)
    const start = new Date(parts[0], parts[1] - 1, parts[2])
    start.setHours(0, 0, 0, 0)

    const diffTime = today.getTime() - start.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 1
    if (diffDays < 7) return 1
    if (diffDays < 14) return 2
    return 3
  } catch {
    return batch?.currentWeek || 1
  }
}

/**
 * Helper: Compute 3 weeks calendar dates and status dynamically
 */
export function computeWeeksLifecycle(startDateStr, customWeeks = []) {
  const defaultStartDate = startDateStr || new Date().toISOString().split('T')[0]
  const parts = defaultStartDate.split('-').map(Number)
  const baseStart = new Date(parts[0], parts[1] - 1, parts[2])

  const defaultTitles = [
    'Minggu 1: Suhu & Sanitasi Dasar',
    'Minggu 2: Kualitas Rasa & Layanan',
    'Minggu 3: Audit Akhir & Stok'
  ]

  const activeWeek = calculateActiveWeek({ startDate: defaultStartDate })

  return [1, 2, 3].map(wNum => {
    const custom = customWeeks[wNum - 1] || {}
    const wStart = new Date(baseStart.getTime() + (wNum - 1) * 7 * 24 * 60 * 60 * 1000)
    const wEnd = new Date(wStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    const title = custom.title || defaultTitles[wNum - 1]

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
      missionCount: 4,
      completionRate: custom.completionRate !== undefined ? custom.completionRate : (wNum < activeWeek ? 100 : 0)
    }
  })
}

/**
 * Batch Store: Manage active batch, 3-week lifecycle, aggregated metrics, and Superadmin CRUD
 */

export const useBatchStore = defineStore('batch', {
  state: () => ({
    batches: getStoredData('rejuve_batches_v3', mockBatches),
    selectedBatchId: 'batch-alpha',
    customSelectedWeek: null // Follows batch's active week if not manually clicked
  }),

  getters: {
    allBatches: (state) => state.batches,
    accessibleBatches: (state) => {
      const userStore = useUserStore()
      if (userStore.isSuperadmin) return state.batches
      if (userStore.isSupervisor) {
        const my = state.batches.filter(b => b.assignment?.supervisorId === userStore.currentUserId)
        return my.length > 0 ? my : state.batches
      }
      if (userStore.isHead) {
        const my = state.batches.filter(b => b.assignment?.headId === userStore.currentUserId)
        return my.length > 0 ? my : state.batches
      }
      if (userStore.isCrew) {
        const cBatch = userStore.currentUser?.batchId
        const my = state.batches.filter(b => b.id === cBatch)
        return my.length > 0 ? my : state.batches
      }
      return state.batches
    },
    currentBatch: (state) => {
      const found = state.batches.find(b => b.id === state.selectedBatchId)
      if (found) return found
      const userStore = useUserStore()
      if (userStore.isSupervisor || userStore.isHead || userStore.isCrew) {
        const acc = state.accessibleBatches
        return acc[0] || state.batches[0]
      }
      return state.batches[0]
    },
    batchById: (state) => (id) => state.batches.find(b => b.id === id),
    activeWeekNumber: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      return calculateActiveWeek(batch)
    },
    selectedWeek: (state) => {
      if (state.customSelectedWeek !== null) {
        return state.customSelectedWeek
      }
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      return calculateActiveWeek(batch)
    },
    currentBatchWeeks: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      if (!batch) return []
      return computeWeeksLifecycle(batch.startDate, batch.weeks || [])
    },
    isWeekSelectedLocked: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      if (!batch) return false
      const activeW = calculateActiveWeek(batch)
      const selW = state.customSelectedWeek !== null ? state.customSelectedWeek : activeW
      return selW !== activeW
    },
    isWeekLocked: (state) => (weekNumber) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      if (!batch) return false
      return Number(weekNumber) !== calculateActiveWeek(batch)
    }
  },

  actions: {
    selectBatch(batchId) {
      const batch = this.batches.find(b => b.id === batchId)
      if (batch) {
        this.selectedBatchId = batchId
        this.customSelectedWeek = calculateActiveWeek(batch)
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
        setStoredData('rejuve_batches_v3', this.batches)
      }
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

      const customWeeks = payload.weeks && payload.weeks.length === 3 ? payload.weeks : [
        { weekNumber: 1, title: payload.week1Title || 'Minggu 1: Suhu & Sanitasi Dasar' },
        { weekNumber: 2, title: payload.week2Title || 'Minggu 2: Kualitas Rasa & Layanan' },
        { weekNumber: 3, title: payload.week3Title || 'Minggu 3: Audit Akhir & Stok' }
      ]

      const computedWeeks = computeWeeksLifecycle(startDate, customWeeks)
      const currentActiveWeek = calculateActiveWeek({ startDate })

      const newBatch = {
        id,
        code,
        name: payload.name,
        storeLocation: payload.storeLocation || payload.name,
        description: payload.description || `Siklus gamifikasi dan penjaminan mutu gerai ${payload.name}.`,
        currentWeek: currentActiveWeek,
        totalWeeks: 3,
        startDate,
        endDate,
        status: payload.status || 'ACTIVE',
        totalCrew: crewIds.length,
        totalMissions: 12,
        completedMissions: 0,
        averageScore: 0,
        totalStars: 0,
        assignment: {
          supervisorId: payload.assignment?.supervisorId || payload.supervisorId || 'spv-001',
          supervisorName: payload.assignment?.supervisorName || payload.supervisorName || 'Budi Santoso',
          headId: payload.assignment?.headId || payload.headId || 'head-001',
          headName: payload.assignment?.headName || payload.headName || 'Ahmad Dahlan',
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
      setStoredData('rejuve_batches_v3', this.batches)

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

      setStoredData('rejuve_batches_v3', this.batches)
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
        setStoredData('rejuve_batches_v3', this.batches)
        return removed
      }
      return null
    }
  }
})
