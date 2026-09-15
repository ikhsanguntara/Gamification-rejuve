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
import { useGamificationStore } from '~/stores/gamification.js'
import WorldMapJourney from '~/components/gamification/WorldMapJourney.vue'
import { Target, Trophy } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()

onMounted(async () => {
  const targetBatchId = userStore.isCrew
    ? (userStore.currentUser?.batchId || userStore.currentUser?.activeBatchId || batchStore.selectedBatchId || batchStore.currentBatch?.id)
    : (batchStore.selectedBatchId || batchStore.currentBatch?.id)

  const missionParams = (userStore.isCrew && userStore.currentUser?.id) ? { userId: userStore.currentUser.id } : {}
  await Promise.allSettled([
    batchStore.fetchBatchesFromApi(),
    targetBatchId ? batchStore.fetchBatchByIdFromApi(targetBatchId) : Promise.resolve(),
    userStore.fetchUsersFromApi({ limit: 100 }),
    missionStore.fetchMissionsFromApi(false, missionParams),
    gamificationStore.fetchLeaderboardFromApi(targetBatchId ? { batchId: targetBatchId } : {})
  ])
})
</script>
