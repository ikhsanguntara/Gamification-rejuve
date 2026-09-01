<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">{{ currentBatch?.code || 'Detail Batch' }}</span>
    </div>

    <!-- Error State if Batch Not Found -->
    <div v-if="!currentBatch" class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch tidak ditemukan.</p>
      <NuxtLink to="/batches" class="text-xs text-[#831843] font-semibold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <template v-else>
      <!-- Batch Hero Overview Card -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2.5 mb-2">
              <span class="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {{ currentBatch.code }}
              </span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {{ currentBatch.status }}
              </span>
            </div>

            <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {{ currentBatch.name }}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
              {{ currentBatch.description }}
            </p>
          </div>

          <!-- Quick Summary Box -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            <div class="text-center p-2">
              <span class="text-xs font-semibold text-slate-400 uppercase">Crew Size</span>
              <p class="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {{ currentBatch.totalCrew || 0 }} / 20
              </p>
            </div>
            <div class="text-center p-2">
              <span class="text-xs font-semibold text-slate-400 uppercase">Avg Score</span>
              <p class="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                {{ currentBatch.averageScore || 0 }}%
              </p>
            </div>
            <div class="text-center p-2">
              <span class="text-xs font-semibold text-slate-400 uppercase">Completed</span>
              <p class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {{ currentBatch.completedMissions || 0 }}/{{ currentBatch.totalMissions || 12 }}
              </p>
            </div>
            <div class="text-center p-2">
              <span class="text-xs font-semibold text-slate-400 uppercase">Total Stars</span>
              <p class="text-base font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                <Star class="w-4 h-4 fill-amber-400" />
                {{ (currentBatch.totalStars || 0).toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3-Week Interactive Progression Component -->
      <WeekSelector />

      <!-- Missions for Selected Week -->
      <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Week {{ batchStore.selectedWeek }} Missions
            </h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Operational tasks assigned for this cycle
            </p>
          </div>
          <NuxtLink
            to="/missions"
            class="text-xs font-semibold text-[#831843] dark:text-[#f472b6] hover:underline"
          >
            View in Mission Catalog
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MissionCard
            v-for="mission in weekMissions"
            :key="mission.id"
            :mission="mission"
          />
        </div>

        <div
          v-if="weekMissions.length === 0"
          class="py-8 text-center text-slate-400 text-xs"
        >
          No missions scheduled for Week {{ batchStore.selectedWeek }}.
        </div>
      </div>

      <!-- Crew Roster Component -->
      <CrewList />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import WeekSelector from '~/components/batch/WeekSelector.vue'
import CrewList from '~/components/batch/CrewList.vue'
import MissionCard from '~/components/mission/MissionCard.vue'
import {
  ArrowLeft,
  Star
} from 'lucide-vue-next'

const route = useRoute()
const batchStore = useBatchStore()
const missionStore = useMissionStore()

onMounted(() => {
  if (route.params.id) {
    batchStore.selectBatch(route.params.id)
  }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    batchStore.selectBatch(newId)
  }
})

const currentBatch = computed(() => {
  return batchStore.accessibleBatches.find(b => b.id === route.params.id) || batchStore.currentBatch
})

const weekMissions = computed(() => {
  if (!currentBatch.value) return []
  return missionStore.missionsByWeek(currentBatch.value.id, batchStore.selectedWeek)
})
</script>
