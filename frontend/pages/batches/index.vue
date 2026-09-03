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

    <!-- App Pagination for Grid Cards (9 Items / Page) -->
    <AppPagination
      v-if="batchStore.serverPagination.total > 0"
      v-model:current-page="currentPage"
      :total-items="batchStore.serverPagination.total"
      :items-per-page="itemsPerPage"
      item-label="batch"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useBatchStore } from '~/stores/batch.js'
import BatchCard from '~/components/batch/BatchCard.vue'
import AppPagination from '~/components/ui/AppPagination.vue'

const batchStore = useBatchStore()

const currentPage = ref(1)
const itemsPerPage = 9

const loadBatches = async (page = 1) => {
  await batchStore.fetchBatchesFromApi({
    page,
    limit: itemsPerPage
  })
}

onMounted(() => {
  loadBatches(1)
})

watch(currentPage, (newPage) => {
  loadBatches(newPage)
})
</script>
