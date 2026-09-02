<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Batch Misi Operasional
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pantau siklus 3 minggu operasional, penugasan kru, dan progres gamifikasi untuk cabang Anda.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {{ batchStore.accessibleBatches.length }} Batch Ditugaskan
        </span>
      </div>
    </div>

    <!-- Batch Cards Grid (Filtered by Accessible Batches) -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <BatchCard
        v-for="batch in batchStore.accessibleBatches"
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
