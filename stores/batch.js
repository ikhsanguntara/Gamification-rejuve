import { defineStore } from 'pinia'
import { mockBatches } from '~/mocks/batches.js'
import { useTemplateStore } from './template.js'
import { useUserStore } from './user.js'

/**
 * Batch Store: Manage active batch, 3-week lifecycle, aggregated metrics, and Superadmin CRUD
 */

export const useBatchStore = defineStore('batch', {
  state: () => ({
    batches: JSON.parse(JSON.stringify(mockBatches)),
    selectedBatchId: 'batch-alpha',
    selectedWeek: 2 // Active week for Batch Alpha
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
    currentBatchWeeks: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      return batch ? batch.weeks : []
    },
    activeWeekNumber: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      return batch ? batch.currentWeek : 2
    },
    isWeekSelectedLocked: (state) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      if (!batch) return false
      return state.selectedWeek !== batch.currentWeek
    },
    isWeekLocked: (state) => (weekNumber) => {
      const batch = state.batches.find(b => b.id === state.selectedBatchId)
      if (!batch) return false
      return Number(weekNumber) !== Number(batch.currentWeek)
    }
  },

  actions: {
    selectBatch(batchId) {
      const batch = this.batches.find(b => b.id === batchId)
      if (batch) {
        this.selectedBatchId = batchId
        this.selectedWeek = batch.currentWeek
      }
    },

    selectWeek(weekNumber) {
      this.selectedWeek = Number(weekNumber)
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
      }
    },

    // ==================== SUPERADMIN ACTIONS ====================

    createBatch(payload) {
      const id = `batch-${Date.now()}`
      const code = payload.code || `BTH-${String(this.batches.length + 1).padStart(2, '0')}`
      const startDate = payload.startDate || '2026-09-01'
      const endDate = payload.endDate || '2026-09-21'
      const crewIds = payload.assignment?.crewIds || payload.crewIds || []

      // Automatically generate 3-week sequence
      const newBatch = {
        id,
        code,
        name: payload.name,
        storeLocation: payload.storeLocation || payload.name,
        description: payload.description || `Siklus gamifikasi dan penjaminan mutu gerai ${payload.name}.`,
        currentWeek: 1,
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
        weeks: [
          {
            weekNumber: 1,
            title: 'Minggu 1: Suhu & Sanitasi Dasar',
            startDate: 'Week 1',
            endDate: 'Day 7',
            status: 'ACTIVE',
            isLocked: false,
            missionCount: 4,
            completionRate: 0
          },
          {
            weekNumber: 2,
            title: 'Minggu 2: Kualitas Rasa & Layanan',
            startDate: 'Week 2',
            endDate: 'Day 14',
            status: 'LOCKED',
            isLocked: true,
            missionCount: 4,
            completionRate: 0
          },
          {
            weekNumber: 3,
            title: 'Minggu 3: Audit Akhir & Stok',
            startDate: 'Week 3',
            endDate: 'Day 21',
            status: 'LOCKED',
            isLocked: true,
            missionCount: 4,
            completionRate: 0
          }
        ]
      }

      this.batches.push(newBatch)

      // ⚡ Automatically apply template package (12 missions) if enabled!
      if (payload.applyTemplatePackage !== false) {
        const templateStore = useTemplateStore()
        templateStore.applyPackageToBatch(id, payload.templatePackageId || 'pkg-rejuve-standard')
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

      Object.assign(batch, {
        name: payload.name !== undefined ? payload.name : batch.name,
        code: payload.code !== undefined ? payload.code : batch.code,
        storeLocation: payload.storeLocation !== undefined ? payload.storeLocation : batch.storeLocation,
        description: payload.description !== undefined ? payload.description : batch.description,
        startDate: payload.startDate !== undefined ? payload.startDate : batch.startDate,
        endDate: payload.endDate !== undefined ? payload.endDate : batch.endDate,
        status: payload.status !== undefined ? payload.status : batch.status
      })

      return batch
    },

    deleteBatch(id) {
      const idx = this.batches.findIndex(b => b.id === id)
      if (idx !== -1) {
        const removed = this.batches.splice(idx, 1)[0]
        if (this.selectedBatchId === id) {
          this.selectedBatchId = this.batches[0]?.id || ''
        }
        return removed
      }
      return null
    }
  }
})
