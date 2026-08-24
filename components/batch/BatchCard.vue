<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 card-hover flex flex-col justify-between transition-all">
    <!-- Top Row: Code & Status -->
    <div>
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="text-xs font-bold text-slate-400 dark:text-slate-500">
          {{ batch.code }}
        </span>
        <span
          class="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
          :class="getStatusBadgeClass(batch.status)"
        >
          {{ batch.status }}
        </span>
      </div>

      <!-- Title & Description -->
      <NuxtLink
        :to="`/batches/${batch.id}`"
        class="block group"
      >
        <h3 class="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {{ batch.name }}
        </h3>
      </NuxtLink>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
        {{ batch.description }}
      </p>

      <!-- Key Metadata Row -->
      <div class="grid grid-cols-2 gap-2 mt-4 text-xs">
        <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Users class="w-3.5 h-3.5 text-slate-400" />
          <span>{{ batch.totalCrew }} Crew Members</span>
        </div>
        <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
          <Calendar class="w-3.5 h-3.5 text-slate-400" />
          <span>Week {{ batch.currentWeek }} of {{ batch.totalWeeks }}</span>
        </div>
      </div>
    </div>

    <!-- Middle/Bottom Progress & Stats -->
    <div class="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
      <!-- Progress Bar -->
      <div>
        <div class="flex items-center justify-between text-xs mb-1.5">
          <span class="font-semibold text-slate-600 dark:text-slate-400">Mission Progress</span>
          <span class="font-bold text-slate-900 dark:text-white">
            {{ batch.completedMissions }} / {{ batch.totalMissions }} ({{ completionPercentage }}%)
          </span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            class="h-full bg-amber-500 rounded-full transition-all duration-500"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Average Score & Total Stars -->
      <div class="flex items-center justify-between text-xs pt-1">
        <div class="flex items-center gap-1.5">
          <span class="text-slate-400">Avg Score:</span>
          <span class="font-bold text-slate-800 dark:text-slate-200">
            {{ batch.averageScore > 0 ? `${batch.averageScore}%` : 'N/A' }}
          </span>
        </div>

        <div class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
          <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{{ batch.totalStars.toLocaleString() }} Stars</span>
        </div>
      </div>

      <!-- Action Button -->
      <NuxtLink
        :to="`/batches/${batch.id}`"
        class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 transition-all group"
      >
        <span>Open Batch Dashboard</span>
        <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Users,
  Calendar,
  Star,
  ChevronRight
} from 'lucide-vue-next'

const props = defineProps({
  batch: {
    type: Object,
    required: true
  }
})

const completionPercentage = computed(() => {
  if (!props.batch.totalMissions) return 0
  return Math.round((props.batch.completedMissions / props.batch.totalMissions) * 100)
})

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    case 'UPCOMING':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    case 'COMPLETED':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}
</script>
