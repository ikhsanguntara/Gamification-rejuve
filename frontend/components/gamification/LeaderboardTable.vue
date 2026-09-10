<template>
  <div class="space-y-6 max-w-full overflow-hidden">
    <!-- Filter Toolbar -->
    <div class="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Batch Filter (Non-Crew) -->
      <div v-if="!userStore.isCrew" class="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto min-w-0">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1.5">
          <Trophy class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
          <span>Filter Batch:</span>
        </label>
        
        <div class="relative w-full sm:w-72">
          <select
            v-model="selectedBatch"
            class="w-full text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option v-for="b in batchOptions" :key="b.id" :value="b.id">
              {{ b.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Batch Info (Crew) -->
      <div v-else class="flex items-center gap-2">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Peringkat Batch:</span>
        <span class="text-xs font-semibold text-[#831843] dark:text-[#f472b6] px-3 py-1 rounded-xl bg-[#831843]/10">
          📍 {{ batchStore.currentBatch?.name || 'Semua Gerai' }}
        </span>
      </div>

      <!-- Search & Member Counter -->
      <div class="flex items-center gap-3 justify-between md:justify-end w-full md:w-auto">
        <div class="relative w-full sm:w-60">
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari nama kru / gerai..."
            class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <span class="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap shadow-2xs">
          {{ filteredLeaderboard.length }} Kru
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="gamificationStore.isLoadingLeaderboard" class="py-16 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
      <Loader2 class="w-8 h-8 text-[#831843] dark:text-[#f472b6] animate-spin mx-auto" />
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        Memuat data klasemen leaderboard...
      </p>
    </div>

    <template v-else>
      <!-- Top 3 Visual Podium -->
      <div v-if="topThreeList.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <!-- 2nd Place (Silver) -->
        <div
          v-if="topThreeList[1]"
          class="order-2 sm:order-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center text-center relative shadow-xs transition-all hover:scale-[1.01]"
          :class="[
            (topThreeList[1].crewId || topThreeList[1].id) === userStore.currentUser?.id
              ? 'ring-2 ring-[#831843] bg-[#831843]/5'
              : ''
          ]"
        >
          <span class="absolute -top-3 px-3.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs">
            🥈 #2 Silver
          </span>
          <img
            :src="topThreeList[1].avatar"
            :alt="topThreeList[1].name"
            class="w-16 h-16 rounded-full object-cover ring-4 ring-slate-200 dark:ring-slate-700 mt-2 mb-3 shadow-md"
          />
          <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate w-full flex items-center justify-center gap-1.5">
            <span>{{ topThreeList[1].name }}</span>
            <span v-if="(topThreeList[1].crewId || topThreeList[1].id) === userStore.currentUser?.id" class="px-1.5 py-0.2 rounded bg-[#831843] text-white text-[10px] font-bold">ANDA</span>
          </h4>
          <p class="text-xs text-slate-400 truncate w-full">{{ topThreeList[1].position || 'Store Specialist' }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate w-full mt-0.5">
            📍 {{ topThreeList[1].storeLocation || 'Gerai Re.juve' }}
          </p>
          <div class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <div class="inline-flex items-center gap-1 font-black text-amber-500 text-xs px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 shadow-2xs">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{{ (Number(topThreeList[1].stars) || 0).toFixed(1).replace(/\.0$/, '') }}</span>
            </div>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
              {{ (topThreeList[1].points || starsToPoints(topThreeList[1].stars)).toLocaleString() }} Poin
            </span>
          </div>
          <span class="text-[11px] font-medium text-slate-400 mt-2">
            Level {{ topThreeList[1].level || 1 }} ({{ topThreeList[1].levelTitle || 'Novice' }})
          </span>
        </div>

        <!-- 1st Place (Gold Podium - Elevated) -->
        <div
          v-if="topThreeList[0]"
          class="order-1 sm:order-2 rounded-3xl bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-950/40 border-2 border-amber-400 dark:border-amber-500/80 p-6 flex flex-col items-center text-center relative sm:-translate-y-2 shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.01]"
          :class="[
            (topThreeList[0].crewId || topThreeList[0].id) === userStore.currentUser?.id
              ? 'ring-2 ring-[#831843]'
              : ''
          ]"
        >
          <div class="absolute -top-3.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black shadow-md flex items-center gap-1.5">
            <Crown class="w-4 h-4 fill-amber-950" />
            <span>🥇 #1 Juara Batch</span>
          </div>
          <img
            :src="topThreeList[0].avatar"
            :alt="topThreeList[0].name"
            class="w-20 h-20 rounded-full object-cover ring-4 ring-amber-400 dark:ring-amber-500 mt-2 mb-3 shadow-lg"
          />
          <h4 class="text-base font-bold text-slate-900 dark:text-white truncate w-full flex items-center justify-center gap-1.5">
            <span>{{ topThreeList[0].name }}</span>
            <span v-if="(topThreeList[0].crewId || topThreeList[0].id) === userStore.currentUser?.id" class="px-1.5 py-0.2 rounded bg-[#831843] text-white text-[10px] font-bold">ANDA</span>
          </h4>
          <p class="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate w-full">
            {{ topThreeList[0].position || 'Store Specialist' }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate w-full mt-0.5">
            📍 {{ topThreeList[0].storeLocation || 'Gerai Re.juve' }}
          </p>

          <div class="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-900 text-white shadow-md border border-amber-400/40">
            <div class="inline-flex items-center gap-1 text-amber-400 font-black text-sm">
              <Star class="w-4 h-4 fill-amber-400" />
              <span>{{ (Number(topThreeList[0].stars) || 0).toFixed(1).replace(/\.0$/, '') }}</span>
            </div>
            <span class="text-slate-400">|</span>
            <span class="text-xs font-black text-white">
              {{ (topThreeList[0].points || starsToPoints(topThreeList[0].stars)).toLocaleString() }} Poin
            </span>
          </div>

          <span class="text-xs font-bold text-amber-700 dark:text-amber-300 mt-2">
            Level {{ topThreeList[0].level || 1 }} ({{ topThreeList[0].levelTitle || 'Star' }})
          </span>
        </div>

        <!-- 3rd Place (Bronze) -->
        <div
          v-if="topThreeList[2]"
          class="order-3 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center text-center relative shadow-xs transition-all hover:scale-[1.01]"
          :class="[
            (topThreeList[2].crewId || topThreeList[2].id) === userStore.currentUser?.id
              ? 'ring-2 ring-[#831843] bg-[#831843]/5'
              : ''
          ]"
        >
          <span class="absolute -top-3 px-3.5 py-0.5 rounded-full bg-amber-800/20 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-xs">
            🥉 #3 Bronze
          </span>
          <img
            :src="topThreeList[2].avatar"
            :alt="topThreeList[2].name"
            class="w-16 h-16 rounded-full object-cover ring-4 ring-amber-700/30 dark:ring-amber-800 mt-2 mb-3 shadow-md"
          />
          <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate w-full flex items-center justify-center gap-1.5">
            <span>{{ topThreeList[2].name }}</span>
            <span v-if="(topThreeList[2].crewId || topThreeList[2].id) === userStore.currentUser?.id" class="px-1.5 py-0.2 rounded bg-[#831843] text-white text-[10px] font-bold">ANDA</span>
          </h4>
          <p class="text-xs text-slate-400 truncate w-full">{{ topThreeList[2].position || 'Store Specialist' }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium truncate w-full mt-0.5">
            📍 {{ topThreeList[2].storeLocation || 'Gerai Re.juve' }}
          </p>

          <div class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <div class="inline-flex items-center gap-1 font-black text-amber-500 text-xs px-2 py-0.5 rounded-lg bg-slate-900 text-amber-300 shadow-2xs">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{{ (Number(topThreeList[2].stars) || 0).toFixed(1).replace(/\.0$/, '') }}</span>
            </div>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
              {{ (topThreeList[2].points || starsToPoints(topThreeList[2].stars)).toLocaleString() }} Poin
            </span>
          </div>
          <span class="text-[11px] font-medium text-slate-400 mt-2">
            Level {{ topThreeList[2].level || 1 }} ({{ topThreeList[2].levelTitle || 'Novice' }})
          </span>
        </div>
      </div>

      <!-- Ranked Table -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xs">
        <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>Peringkat Kru Gerai</span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
              {{ filteredLeaderboard.length }} Data
            </span>
          </h3>
          <span class="text-xs text-slate-400">Diurutkan berdasarkan akumulasi bintang & poin tertinggi</span>
        </div>

        <div v-if="filteredLeaderboard.length === 0" class="py-12 text-center text-slate-400 text-xs space-y-2">
          <p>Belum ada data peringkat kru untuk filter batch ini.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4 w-16 text-center">Peringkat</th>
                <th class="py-3 px-4">Anggota Kru</th>
                <th class="py-3 px-4">Lokasi Gerai</th>
                <th class="py-3 px-4 text-center">Level Bintang</th>
                <th class="py-3 px-4 text-center">Misi Selesai</th>
                <th class="py-3 px-4 text-center">Rata-rata Skor</th>
                <th class="py-3 px-4 text-right">Bintang & Poin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              <tr
                v-for="crew in paginatedLeaderboard"
                :key="crew.crewId || crew.id"
                class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                :class="[
                  (crew.crewId || crew.id) === userStore.currentUser?.id
                    ? 'bg-[#831843]/10 dark:bg-[#831843]/20 font-bold'
                    : crew.rank <= 3
                    ? 'bg-amber-50/20 dark:bg-amber-950/10'
                    : ''
                ]"
              >
                <!-- Rank -->
                <td class="py-3.5 px-4 text-center font-bold">
                  <span
                    v-if="crew.rank === 1"
                    class="inline-flex w-6 h-6 rounded-full bg-amber-400 text-amber-950 items-center justify-center text-xs font-black shadow-xs"
                  >1</span>
                  <span
                    v-else-if="crew.rank === 2"
                    class="inline-flex w-6 h-6 rounded-full bg-slate-300 text-slate-900 items-center justify-center text-xs font-black shadow-xs"
                  >2</span>
                  <span
                    v-else-if="crew.rank === 3"
                    class="inline-flex w-6 h-6 rounded-full bg-amber-700 text-white items-center justify-center text-xs font-black shadow-xs"
                  >3</span>
                  <span v-else class="text-slate-500 dark:text-slate-400 font-bold">
                    #{{ crew.rank }}
                  </span>
                </td>

                <!-- Member -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="crew.avatar"
                      :alt="crew.name"
                      class="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                    />
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-bold text-slate-900 dark:text-white truncate">{{ crew.name }}</span>
                        <span
                          v-if="(crew.crewId || crew.id) === userStore.currentUser?.id"
                          class="px-1.5 py-0.2 rounded bg-[#831843] text-white text-[10px] font-bold"
                        >
                          ANDA
                        </span>
                      </div>
                      <span class="text-[11px] text-slate-400 block">{{ crew.position || 'Store Specialist' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Store Location -->
                <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                  <span class="font-semibold text-slate-800 dark:text-slate-200 block">{{ crew.storeLocation || 'Gerai Re.juve' }}</span>
                  <span v-if="crew.batchName" class="text-[10px] text-slate-400 block truncate max-w-[150px]">{{ crew.batchName }}</span>
                </td>

                <!-- Level -->
                <td class="py-3.5 px-4 text-center">
                  <span class="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                    Lvl {{ crew.level || 1 }}
                  </span>
                </td>

                <!-- Completed Missions -->
                <td class="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-semibold">
                  {{ crew.completedMissions || 0 }}
                </td>

                <!-- Avg Score -->
                <td class="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                  {{ crew.averageScore ? `${crew.averageScore}%` : '-' }}
                </td>

                <!-- Stars & Points -->
                <td class="py-3.5 px-4 text-right">
                  <div class="inline-flex items-center gap-2 justify-end">
                    <div class="inline-flex items-center gap-1 font-black text-amber-300 text-xs px-2 py-0.5 rounded-lg bg-slate-900 dark:bg-slate-950 shadow-2xs">
                      <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{{ (Number(crew.stars) || 0).toFixed(1).replace(/\.0$/, '') }}</span>
                    </div>
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {{ (crew.points || starsToPoints(crew.stars)).toLocaleString() }} Poin
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredLeaderboard.length > itemsPerPage" class="p-4 border-t border-slate-100 dark:border-slate-800">
          <AppPagination
            v-model:current-page="currentPage"
            :total-items="filteredLeaderboard.length"
            :items-per-page="itemsPerPage"
            item-label="kru"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useGamificationStore } from '~/stores/gamification.js'
import AppPagination from '~/components/ui/AppPagination.vue'
import { starsToPoints } from '~/utils/star.js'
import {
  Crown,
  Star,
  Search,
  Trophy,
  Loader2
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const gamificationStore = useGamificationStore()

const selectedBatch = ref('ALL')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const loadLeaderboardData = async () => {
  const batchId = userStore.isCrew ? (userStore.currentUser?.batchId || '') : selectedBatch.value
  await gamificationStore.fetchLeaderboardFromApi({
    batchId: batchId && batchId !== 'ALL' ? batchId : undefined
  })
}

onMounted(async () => {
  try {
    await Promise.allSettled([
      batchStore.fetchBatchesFromApi(),
      userStore.fetchUsersFromApi()
    ])
    if (userStore.isCrew && userStore.currentUser?.batchId) {
      selectedBatch.value = userStore.currentUser.batchId
    }
  } catch (err) {
    console.warn('Init batches in leaderboard failed:', err)
  }
  await loadLeaderboardData()
})

const batchOptions = computed(() => {
  const list = [{ id: 'ALL', label: '🏆 Semua Batch Gerai' }]
  const batches = batchStore.allBatches || []
  batches.forEach(b => {
    const id = b.batchId || b.id
    const crewCount = b.totalCrew || b.assignment?.crewIds?.length || 0
    list.push({
      id,
      label: `${b.name || b.storeLocation || b.code || 'Batch'}${crewCount ? ` (${crewCount})` : ''}`
    })
  })
  return list
})

const displayedLeaderboard = computed(() => {
  const batchId = userStore.isCrew ? (userStore.currentUser?.batchId || '') : selectedBatch.value
  return gamificationStore.leaderboardByBatch(batchId) || []
})

const filteredLeaderboard = computed(() => {
  if (!searchQuery.value?.trim()) return displayedLeaderboard.value
  const q = searchQuery.value.toLowerCase().trim()
  return displayedLeaderboard.value.filter(c =>
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.storeLocation && c.storeLocation.toLowerCase().includes(q)) ||
    (c.department && c.department.toLowerCase().includes(q))
  )
})

watch([selectedBatch, searchQuery], async () => {
  currentPage.value = 1
  if (selectedBatch.value) {
    await loadLeaderboardData()
  }
})

const paginatedLeaderboard = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredLeaderboard.value.slice(start, start + itemsPerPage)
})

const topThreeList = computed(() => {
  if (gamificationStore.topThree && gamificationStore.topThree.length > 0) {
    return gamificationStore.topThree
  }
  return filteredLeaderboard.value.slice(0, 3)
})
</script>
