import { defineStore } from 'pinia'
import { mockBatches } from '~/mocks/batches.js'

/**
 * Batch Store: Manage active batch, 3-week lifecycle, and aggregated metrics
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
    }
  }
})
