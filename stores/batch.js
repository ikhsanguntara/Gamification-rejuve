import { defineStore } from 'pinia'
import { mockBatches } from '~/mocks/batches.js'

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
    currentBatch: (state) => state.batches.find(b => b.id === state.selectedBatchId) || state.batches[0],
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

      // Automatically generate 3-week sequence
      const newBatch = {
        id,
        code,
        name: payload.name,
        storeLocation: payload.storeLocation || payload.name.split('—')[1] || payload.name,
        description: payload.description || `Siklus gamifikasi dan penjaminan mutu gerai ${payload.name}.`,
        currentWeek: 1,
        totalWeeks: 3,
        startDate,
        endDate,
        status: payload.status || 'ACTIVE',
        totalCrew: Number(payload.totalCrew) || 0,
        totalMissions: 12,
        completedMissions: 0,
        averageScore: 0,
        totalStars: 0,
        weeks: [
          {
            weekNumber: 1,
            title: 'Cold Chain Setup & Operational Safety',
            startDate: 'Week 1',
            endDate: 'Day 7',
            status: 'ACTIVE',
            isLocked: false,
            missionCount: 4,
            completionRate: 0
          },
          {
            weekNumber: 2,
            title: 'Core Quality SOP & Fresh Extraction Audit',
            startDate: 'Week 2',
            endDate: 'Day 14',
            status: 'LOCKED',
            isLocked: true,
            missionCount: 4,
            completionRate: 0
          },
          {
            weekNumber: 3,
            title: 'HACCP Verification & Customer CleanLabel Service',
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
      return newBatch
    },

    updateBatch(id, payload) {
      const batch = this.batches.find(b => b.id === id)
      if (!batch) return null
      Object.assign(batch, payload)
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
