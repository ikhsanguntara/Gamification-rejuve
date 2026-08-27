<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Batch Star Leaderboard
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Realtime ranking based on approved Stars earned through verified operational mission excellence.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1">
          <Star class="w-3.5 h-3.5 fill-amber-400" />
          <span>Total Batch Stars: {{ totalBatchStars.toLocaleString() }}</span>
        </span>
      </div>
    </div>

    <!-- Leaderboard Component -->
    <LeaderboardTable />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGamificationStore } from '~/stores/gamification.js'
import LeaderboardTable from '~/components/gamification/LeaderboardTable.vue'
import { Star } from 'lucide-vue-next'

const gamificationStore = useGamificationStore()

const totalBatchStars = computed(() => {
  return gamificationStore.allCrews.reduce((acc, c) => acc + (c.stars || 0), 0)
})
</script>
