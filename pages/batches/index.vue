<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Batch Management
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor 3-week operational cycles, crew assignments (max 20 per batch), and gamification progress.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          1 Active Batch Cycle
        </span>
      </div>
    </div>

    <!-- Batch Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BatchCard
        v-for="batch in batchStore.allBatches"
        :key="batch.id"
        :batch="batch"
      />
    </div>
  </div>
</template>

<script setup>
import { useBatchStore } from '~/stores/batch.js'
import BatchCard from '~/components/batch/BatchCard.vue'

const batchStore = useBatchStore()
</script>
