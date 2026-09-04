<template>
  <div>
    <!-- Breadcrumb & Page Header (compact, adventure-themed) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Gamifikasi</span>
          <span>/</span>
          <span class="text-amber-600 dark:text-amber-400 font-bold">Petualangan Misi</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>🗺️</span>
          <span>Petualangan Ekspedisi New Hire</span>
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Selesaikan setiap misi operasional Re.juve dan jadilah <strong class="text-amber-600">Star Legend</strong>!
        </p>
      </div>

      <div class="flex items-center gap-2 flex-shrink-0">
        <NuxtLink
          to="/missions"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold transition-all cursor-pointer border border-amber-200 dark:border-amber-800"
        >
          <Target class="w-4 h-4" />
          <span>Katalog Misi</span>
        </NuxtLink>

        <NuxtLink
          to="/leaderboard"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/25 active:scale-95 cursor-pointer"
        >
          <Trophy class="w-4 h-4" />
          <span>Papan Peringkat</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Main Adventure Journey Component -->
    <WorldMapJourney />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import WorldMapJourney from '~/components/gamification/WorldMapJourney.vue'
import { Target, Trophy } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()

onMounted(async () => {
  await Promise.allSettled([
    batchStore.fetchBatchesFromApi(),
    missionStore.fetchMissionsFromApi()
  ])
})
</script>
