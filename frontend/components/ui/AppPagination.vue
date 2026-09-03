<template>
  <div
    v-if="totalPages > 1 || totalItems > 0"
    class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200/70 dark:border-slate-800/70 text-xs w-full"
  >
    <!-- Left: Information Summary -->
    <div class="text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
      <span>Menampilkan </span>
      <span class="font-bold text-slate-800 dark:text-slate-200">{{ startItem }}</span>
      <span> - </span>
      <span class="font-bold text-slate-800 dark:text-slate-200">{{ endItem }}</span>
      <span> dari </span>
      <span class="font-bold text-[#831843] dark:text-[#f472b6]">{{ totalItems.toLocaleString() }}</span>
      <span> {{ itemLabel }}</span>
    </div>

    <!-- Right: Page Controls -->
    <div v-if="totalPages > 1" class="flex items-center justify-center sm:justify-end gap-1 flex-wrap">
      <!-- Previous Button -->
      <button
        type="button"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        title="Halaman Sebelumnya"
      >
        <ChevronLeft class="w-4 h-4" />
        <span class="hidden xs:inline">Sebelumnya</span>
      </button>

      <!-- Page Numbers with Smart Ellipsis -->
      <div class="flex items-center gap-1">
        <template v-for="(p, idx) in visiblePages" :key="idx">
          <span
            v-if="p === '...'"
            class="px-2 py-1 text-slate-400 dark:text-slate-500 select-none font-bold text-xs"
          >
            ...
          </span>
          <button
            v-else
            type="button"
            @click="goToPage(p)"
            class="min-w-[32px] h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer"
            :class="[
              p === currentPage
                ? 'bg-[#831843] text-white shadow-xs scale-105'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
            ]"
          >
            {{ p }}
          </button>
        </template>
      </div>

      <!-- Next Button -->
      <button
        type="button"
        :disabled="currentPage >= totalPages"
        @click="goToPage(currentPage + 1)"
        class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
        title="Halaman Selanjutnya"
      >
        <span class="hidden xs:inline">Selanjutnya</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 9
  },
  itemLabel: {
    type: String,
    default: 'data'
  }
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => {
  if (!props.totalItems || props.totalItems <= 0) return 1
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

/**
 * Smart Ellipsis Page Algorithm:
 * Max 7 buttons visible: [1, ..., 4, 5, 6, ..., 20]
 */
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = props.currentPage

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})
</script>
