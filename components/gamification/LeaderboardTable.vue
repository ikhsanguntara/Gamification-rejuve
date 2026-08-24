<template>
  <div class="space-y-6">
    <!-- Batch Filter Selector -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Store Branch:</span>
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <button
            v-for="b in batchOptions"
            :key="b.id"
            type="button"
            @click="selectedBatch = b.id"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
            :class="[
              selectedBatch === b.id
                ? 'bg-[#499ec7] text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ b.label }}
          </button>
        </div>
      </div>

      <span class="text-xs font-semibold text-slate-400">
        {{ displayedLeaderboard.length }} Crew Members Ranked
      </span>
    </div>

    <!-- Top 3 Visual Podium -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
      <!-- 2nd Place (Silver) -->
      <div
        v-if="topThreeList[1]"
        class="order-2 sm:order-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center text-center relative card-hover"
      >
        <span class="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black shadow-sm">
          🥈 #2 Silver
        </span>
        <img
          :src="topThreeList[1].avatar"
          :alt="topThreeList[1].name"
          class="w-16 h-16 rounded-full object-cover ring-4 ring-slate-200 dark:ring-slate-700 mt-2 mb-3 shadow-md"
        />
        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate w-full">
          {{ topThreeList[1].name }}
        </h4>
        <p class="text-xs text-slate-400 truncate w-full">{{ topThreeList[1].position }}</p>
        <p class="text-[10px] text-[#499ec7] dark:text-[#84cded] font-semibold truncate w-full mt-0.5">
          📍 {{ topThreeList[1].storeLocation }}
        </p>

        <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-sm">
          <Star class="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{{ topThreeList[1].stars.toLocaleString() }} Stars</span>
        </div>
      </div>

      <!-- 1st Place (Gold Podium - Elevated) -->
      <div
        v-if="topThreeList[0]"
        class="order-1 sm:order-2 rounded-2xl bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-950/40 border-2 border-amber-400 dark:border-amber-500/80 p-6 flex flex-col items-center text-center relative card-hover sm:-translate-y-3 shadow-lg shadow-amber-500/10"
      >
        <div class="absolute -top-4 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black shadow-md flex items-center gap-1">
          <Crown class="w-3.5 h-3.5 fill-amber-950" />
          <span>🥇 #1 Gold Champion</span>
        </div>
        <img
          :src="topThreeList[0].avatar"
          :alt="topThreeList[0].name"
          class="w-20 h-20 rounded-full object-cover ring-4 ring-amber-400 dark:ring-amber-500 mt-3 mb-3 shadow-lg"
        />
        <h4 class="text-base font-extrabold text-slate-900 dark:text-white truncate w-full">
          {{ topThreeList[0].name }}
        </h4>
        <p class="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate w-full">
          {{ topThreeList[0].position }}
        </p>
        <p class="text-[11px] text-[#499ec7] dark:text-[#84cded] font-bold truncate w-full mt-0.5">
          📍 {{ topThreeList[0].storeLocation }}
        </p>

        <div class="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-400 text-amber-950 font-black text-base shadow-sm">
          <Star class="w-4 h-4 fill-amber-950" />
          <span>{{ topThreeList[0].stars.toLocaleString() }} Stars</span>
        </div>

        <span class="text-[11px] font-bold text-amber-700 dark:text-amber-300 mt-2">
          Star Level {{ topThreeList[0].level }} • {{ topThreeList[0].completedMissions }} Missions Completed
        </span>
      </div>

      <!-- 3rd Place (Bronze) -->
      <div
        v-if="topThreeList[2]"
        class="order-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center text-center relative card-hover"
      >
        <span class="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-800/20 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-black shadow-sm">
          🥉 #3 Bronze
        </span>
        <img
          :src="topThreeList[2].avatar"
          :alt="topThreeList[2].name"
          class="w-16 h-16 rounded-full object-cover ring-4 ring-amber-700/30 dark:ring-amber-800 mt-2 mb-3 shadow-md"
        />
        <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate w-full">
          {{ topThreeList[2].name }}
        </h4>
        <p class="text-xs text-slate-400 truncate w-full">{{ topThreeList[2].position }}</p>
        <p class="text-[10px] text-[#499ec7] dark:text-[#84cded] font-semibold truncate w-full mt-0.5">
          📍 {{ topThreeList[2].storeLocation }}
        </p>

        <div class="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold text-sm">
          <Star class="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{{ topThreeList[2].stars.toLocaleString() }} Stars</span>
        </div>
      </div>
    </div>

    <!-- Ranked Table -->
    <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Store Crew Standings
        </h3>
        <span class="text-xs text-slate-400">Ranked by Total Star Accumulation</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th class="py-3 px-4 w-16 text-center">Rank</th>
              <th class="py-3 px-4">Crew Member</th>
              <th class="py-3 px-4">Store Location</th>
              <th class="py-3 px-4 text-center">Star Level</th>
              <th class="py-3 px-4 text-center">Completed</th>
              <th class="py-3 px-4 text-center">Avg Score</th>
              <th class="py-3 px-4 text-right">Total Stars</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            <tr
              v-for="crew in displayedLeaderboard"
              :key="crew.crewId"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              :class="[
                crew.rank <= 3 ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
              ]"
            >
              <!-- Rank -->
              <td class="py-3.5 px-4 text-center font-extrabold">
                <span
                  v-if="crew.rank === 1"
                  class="inline-flex w-6 h-6 rounded-full bg-amber-400 text-amber-950 items-center justify-center text-xs"
                >1</span>
                <span
                  v-else-if="crew.rank === 2"
                  class="inline-flex w-6 h-6 rounded-full bg-slate-300 text-slate-900 items-center justify-center text-xs"
                >2</span>
                <span
                  v-else-if="crew.rank === 3"
                  class="inline-flex w-6 h-6 rounded-full bg-amber-700 text-white items-center justify-center text-xs"
                >3</span>
                <span v-else class="text-slate-500 dark:text-slate-400">
                  #{{ crew.rank }}
                </span>
              </td>

              <!-- Member -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="crew.avatar"
                    :alt="crew.name"
                    class="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <span class="font-bold text-slate-900 dark:text-white block">{{ crew.name }}</span>
                    <span class="text-[11px] text-slate-400">{{ crew.position }}</span>
                  </div>
                </div>
              </td>

              <!-- Store Location -->
              <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-semibold">
                {{ crew.storeLocation || 'Re.juve Store' }}
              </td>

              <!-- Level -->
              <td class="py-3.5 px-4 text-center">
                <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  Lvl {{ crew.level }}
                </span>
              </td>

              <!-- Completed Missions -->
              <td class="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300">
                {{ crew.completedMissions }}
              </td>

              <!-- Avg Score -->
              <td class="py-3.5 px-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                {{ crew.averageScore }}%
              </td>

              <!-- Total Stars -->
              <td class="py-3.5 px-4 text-right">
                <div class="inline-flex items-center gap-1 font-black text-amber-600 dark:text-amber-400 text-sm">
                  <Star class="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{{ crew.stars.toLocaleString() }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGamificationStore } from '~/stores/gamification.js'
import {
  Crown,
  Star
} from 'lucide-vue-next'

const gamificationStore = useGamificationStore()
const selectedBatch = ref('ALL')

const batchOptions = [
  { id: 'ALL', label: 'All Store Batches' },
  { id: 'batch-alpha', label: 'Grand Indonesia (6)' },
  { id: 'batch-beta', label: 'Senayan City (5)' },
  { id: 'batch-gamma', label: 'Pondok Indah Mall (5)' }
]

const displayedLeaderboard = computed(() => {
  return gamificationStore.leaderboardByBatch(selectedBatch.value)
})

const topThreeList = computed(() => {
  return displayedLeaderboard.value.slice(0, 3)
})
</script>
