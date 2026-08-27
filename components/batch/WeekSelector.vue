<template>
  <div class="space-y-4">
    <!-- Interactive Weekly Progression Stepper -->
    <div class="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Weekly Progression Cycle
          </h4>
          <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            3-Week Store Operational Sequence
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
            Week {{ activeWeekNumber }} Active
          </span>
        </div>
      </div>

      <!-- Step Cards Grid (1 col on mobile, 3 cols on tablet/desktop) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 relative">
        <button
          v-for="week in weeks"
          :key="week.weekNumber"
          type="button"
          @click="selectWeek(week.weekNumber)"
          class="relative text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
          :class="[
            selectedWeek === week.weekNumber
              ? 'ring-2 ring-[#499ec7] bg-[#499ec7]/5 dark:bg-[#499ec7]/15 border-[#499ec7]/60 shadow-md scale-[1.01]'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
          ]"
        >
          <!-- Top row: Week & Status Badge -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <!-- Icon indicator -->
              <div
                class="w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-xs font-semibold"
                :class="getWeekIconStyle(week.weekNumber)"
              >
                <Check v-if="week.weekNumber < activeWeekNumber" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span v-else-if="week.weekNumber === activeWeekNumber" class="w-2 h-2 rounded-full bg-[#499ec7] animate-ping"></span>
                <Lock v-else class="w-3 h-3 text-slate-400" />
              </div>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                WEEK {{ week.weekNumber }}
              </span>
            </div>

            <!-- Status tag -->
            <span
              class="text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider"
              :class="getWeekStatusBadge(week.weekNumber)"
            >
              {{ getWeekStatusLabel(week.weekNumber) }}
            </span>
          </div>

          <!-- Title & Dates -->
          <div class="my-1">
            <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {{ week.title }}
            </p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {{ week.startDate }} – {{ week.endDate }}
            </p>
          </div>

          <!-- Completion Progress bar -->
          <div class="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
            <div class="flex items-center justify-between text-xs mb-1">
              <span class="text-slate-500 dark:text-slate-400">Completion</span>
              <span class="font-semibold text-slate-700 dark:text-slate-300">
                {{ week.completionRate || 0 }}%
              </span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="week.weekNumber < activeWeekNumber ? 'bg-emerald-500' : 'bg-[#499ec7]'"
                :style="{ width: `${week.completionRate || 0}%` }"
              ></div>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Locked Week Informational Alert Banner -->
    <div
      v-if="selectedWeek !== activeWeekNumber"
      class="flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
    >
      <div class="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">
        <Lock class="w-4 h-4" />
      </div>
      <div class="text-xs space-y-0.5">
        <p class="font-semibold text-slate-900 dark:text-white">
          🔒 Week {{ selectedWeek }} is Locked (Read-Only)
        </p>
        <p class="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
          <span v-if="selectedWeek < activeWeekNumber">
            Minggu ini telah selesai dan seluruh hasil evaluasi telah difinalisasi. Anda tetap dapat meninjau rincian misi dan skor.
          </span>
          <span v-else>
            Minggu ini belum dimulai. Evaluasi baru dapat diinput setelah minggu ini menjadi siklus aktif.
          </span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBatchStore } from '~/stores/batch.js'
import { Check, Lock } from 'lucide-vue-next'

const batchStore = useBatchStore()

const weeks = computed(() => batchStore.currentBatchWeeks)
const activeWeekNumber = computed(() => batchStore.activeWeekNumber)
const selectedWeek = computed(() => batchStore.selectedWeek)

const selectWeek = (weekNumber) => {
  batchStore.selectWeek(weekNumber)
}

const getWeekStatusLabel = (weekNumber) => {
  if (weekNumber < activeWeekNumber.value) return 'Completed'
  if (weekNumber === activeWeekNumber.value) return 'Active'
  return 'Locked'
}

const getWeekStatusBadge = (weekNumber) => {
  if (weekNumber < activeWeekNumber.value) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  }
  if (weekNumber === activeWeekNumber.value) {
    return 'bg-[#499ec7]/15 text-[#24779f] dark:text-[#84cded]'
  }
  return 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

const getWeekIconStyle = (weekNumber) => {
  if (weekNumber < activeWeekNumber.value) {
    return 'bg-emerald-100 dark:bg-emerald-950/60'
  }
  if (weekNumber === activeWeekNumber.value) {
    return 'bg-[#499ec7]/20 dark:bg-[#499ec7]/30'
  }
  return 'bg-slate-200 dark:bg-slate-800'
}
</script>
