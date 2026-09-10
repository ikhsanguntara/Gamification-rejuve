<template>
  <div class="adventure-leaderboard-card rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-2xs">
            <Trophy class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Top 3 Bintang Ekspedisi</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                PODIUM
              </span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Podium 3 besar perolehan bintang kru pada batch ekspedisi ini.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Stats & Active Batch Name -->
      <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <span class="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MapPin class="w-3.5 h-3.5 text-amber-500" />
          <span class="font-bold">{{ batchName || 'Batch Operasional' }}</span>
        </span>
        <span class="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center gap-1">
          <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{{ totalBatchStars.toLocaleString() }} Bintang Gerai</span>
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="gamificationStore.isLoadingLeaderboard" class="py-12 text-center space-y-2">
      <Loader2 class="w-7 h-7 text-amber-500 animate-spin mx-auto" />
      <p class="text-xs text-slate-400 font-medium">Memuat klasemen podium...</p>
    </div>

    <template v-else>
      <!-- Top 3 Visual Podium (Hanya 3 Besar) -->
      <div v-if="topThreeList.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <!-- 2nd Place (Silver) -->
        <div
          v-if="topThreeList[1]"
          class="order-2 sm:order-1 rounded-3xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center text-center relative shadow-xs transition-all hover:scale-[1.01]"
          :class="[
            isCurrentUser(topThreeList[1])
              ? 'ring-2 ring-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
              : ''
          ]"
        >
          <span class="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold shadow-xs">
            🥈 #2 Silver
          </span>
          <img
            :src="topThreeList[1].avatar"
            :alt="topThreeList[1].name"
            class="w-14 h-14 rounded-full object-cover ring-3 ring-slate-300 dark:ring-slate-600 mt-2 mb-2.5 shadow-sm"
          />
          <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate w-full flex items-center justify-center gap-1">
            <span>{{ topThreeList[1].name }}</span>
            <span v-if="isCurrentUser(topThreeList[1])" class="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-black">ANDA</span>
          </h4>
          <p class="text-[11px] text-slate-400 truncate w-full">{{ topThreeList[1].position || 'Store Specialist' }}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate w-full mt-0.5">
            📍 {{ topThreeList[1].storeLocation || 'Gerai Re.juve' }}
          </p>

          <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <div class="inline-flex items-center gap-1 font-black text-amber-500 text-xs">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{{ formatStars(topThreeList[1].stars) }}</span>
            </div>
            <span class="text-[11px] text-slate-400">|</span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
              {{ formatPoints(topThreeList[1].points || topThreeList[1].stars) }} Poin
            </span>
          </div>
          <span class="text-[10px] font-bold text-slate-400 mt-2">
            Lvl {{ topThreeList[1].level || 1 }} ({{ topThreeList[1].levelTitle || 'Novice' }})
          </span>
        </div>

        <!-- 1st Place (Gold Podium - Elevated) -->
        <div
          v-if="topThreeList[0]"
          class="order-1 sm:order-2 rounded-3xl bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-950/40 border-2 border-amber-400 dark:border-amber-500/80 p-5 sm:p-6 flex flex-col items-center text-center relative sm:-translate-y-2 shadow-md shadow-amber-500/10 transition-all hover:scale-[1.01]"
          :class="[
            isCurrentUser(topThreeList[0])
              ? 'ring-2 ring-blue-600'
              : ''
          ]"
        >
          <div class="absolute -top-3.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-xs font-black shadow-md flex items-center gap-1">
            <Crown class="w-3.5 h-3.5 fill-amber-950" />
            <span>🥇 #1 Juara Ekspedisi</span>
          </div>
          <img
            :src="topThreeList[0].avatar"
            :alt="topThreeList[0].name"
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-amber-400 dark:ring-amber-500 mt-2 mb-2.5 shadow-md"
          />
          <h4 class="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate w-full flex items-center justify-center gap-1.5">
            <span>{{ topThreeList[0].name }}</span>
            <span v-if="isCurrentUser(topThreeList[0])" class="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-black">ANDA</span>
          </h4>
          <p class="text-xs text-amber-600 dark:text-amber-400 font-semibold truncate w-full">
            {{ topThreeList[0].position || 'Store Specialist' }}
          </p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate w-full mt-0.5">
            📍 {{ topThreeList[0].storeLocation || 'Gerai Re.juve' }}
          </p>

          <div class="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-md border border-amber-400/40">
            <div class="inline-flex items-center gap-1 text-amber-400 font-black text-xs sm:text-sm">
              <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{{ formatStars(topThreeList[0].stars) }}</span>
            </div>
            <span class="text-slate-500">|</span>
            <span class="text-xs font-black text-white">
              {{ formatPoints(topThreeList[0].points || topThreeList[0].stars) }} Poin
            </span>
          </div>

          <span class="text-xs font-bold text-amber-700 dark:text-amber-300 mt-2">
            Level {{ topThreeList[0].level || 1 }} ({{ topThreeList[0].levelTitle || 'Star' }})
          </span>
        </div>

        <!-- 3rd Place (Bronze) -->
        <div
          v-if="topThreeList[2]"
          class="order-3 rounded-3xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 flex flex-col items-center text-center relative shadow-xs transition-all hover:scale-[1.01]"
          :class="[
            isCurrentUser(topThreeList[2])
              ? 'ring-2 ring-blue-600 bg-blue-50/20 dark:bg-blue-950/20'
              : ''
          ]"
        >
          <span class="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-800/20 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[11px] font-bold shadow-xs">
            🥉 #3 Bronze
          </span>
          <img
            :src="topThreeList[2].avatar"
            :alt="topThreeList[2].name"
            class="w-14 h-14 rounded-full object-cover ring-3 ring-amber-700/30 dark:ring-amber-800 mt-2 mb-2.5 shadow-sm"
          />
          <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate w-full flex items-center justify-center gap-1">
            <span>{{ topThreeList[2].name }}</span>
            <span v-if="isCurrentUser(topThreeList[2])" class="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-black">ANDA</span>
          </h4>
          <p class="text-[11px] text-slate-400 truncate w-full">{{ topThreeList[2].position || 'Store Specialist' }}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate w-full mt-0.5">
            📍 {{ topThreeList[2].storeLocation || 'Gerai Re.juve' }}
          </p>

          <div class="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
            <div class="inline-flex items-center gap-1 font-black text-amber-500 text-xs">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{{ formatStars(topThreeList[2].stars) }}</span>
            </div>
            <span class="text-[11px] text-slate-400">|</span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
              {{ formatPoints(topThreeList[2].points || topThreeList[2].stars) }} Poin
            </span>
          </div>
          <span class="text-[10px] font-bold text-slate-400 mt-2">
            Lvl {{ topThreeList[2].level || 1 }} ({{ topThreeList[2].levelTitle || 'Novice' }})
          </span>
        </div>
      </div>

      <!-- Empty State jika belum ada kru -->
      <div v-else class="py-8 text-center text-slate-400 text-xs">
        Belum ada perolehan bintang untuk batch ini.
      </div>

      <!-- ============================================================
           KARTU POSISI SAYA (JIKA USER TIDAK MASUK PODIUM TOP 3)
      ============================================================ -->
      <div
        v-if="myRankInfo && myRankInfo.rank > 3"
        class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs"
      >
        <div class="flex items-center gap-3.5 w-full sm:w-auto">
          <!-- Rank Badge -->
          <div class="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex flex-col items-center justify-center font-black shadow-sm flex-shrink-0 border border-blue-400/40">
            <span class="text-[9px] text-blue-400 uppercase tracking-tighter leading-none">POSISI</span>
            <span class="text-sm leading-tight text-amber-300 font-extrabold">#{{ myRankInfo.rank }}</span>
          </div>

          <!-- User Info -->
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                Posisi Anda Saat Ini
              </span>
              <span class="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                {{ myRankInfo.name }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tingkatkan penyelesaian misi operasional untuk menembus podium 3 besar! 🚀
            </p>
          </div>
        </div>

        <!-- User Stats Right Side -->
        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60 dark:border-slate-800">
          <div class="text-center sm:text-right">
            <span class="text-[10px] font-bold text-slate-400 block uppercase">Level</span>
            <span class="text-xs font-extrabold text-amber-600 dark:text-amber-400">
              Lvl {{ myRankInfo.level || 1 }}
            </span>
          </div>
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div class="text-center sm:text-right">
            <span class="text-[10px] font-bold text-slate-400 block uppercase">Misi Selesai</span>
            <span class="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              {{ myRankInfo.completedMissions || 0 }} Misi
            </span>
          </div>
          <div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
          <div class="text-right">
            <div class="inline-flex items-center gap-1 font-black text-amber-300 text-xs px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-950 shadow-2xs border border-amber-400/20">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{{ formatStars(myRankInfo.stars) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGamificationStore } from '~/stores/gamification.js'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { Trophy, Crown, Star, MapPin, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  batchId: { type: String, default: '' },
  batchName: { type: String, default: '' }
})

const gamificationStore = useGamificationStore()
const userStore = useUserStore()
const batchStore = useBatchStore()

const currentCrewId = computed(() => {
  return userStore.currentUser?.id || userStore.currentUser?.userId || userStore.apiUser?.userId || ''
})

const isCurrentUser = (crew) => {
  if (!crew || !currentCrewId.value) return false
  const crewId = crew.crewId || crew.id || crew.userId
  return crewId === currentCrewId.value
}

const leaderboardList = computed(() => {
  const targetBatchId = props.batchId || batchStore.selectedBatchId
  if (gamificationStore.apiLeaderboard && gamificationStore.apiLeaderboard.length > 0) {
    return gamificationStore.apiLeaderboard
  }
  return gamificationStore.leaderboardByBatch(targetBatchId)
})

const topThreeList = computed(() => {
  if (gamificationStore.apiPodium && gamificationStore.apiPodium.length > 0) {
    return gamificationStore.apiPodium
  }
  return leaderboardList.value.slice(0, 3)
})

// Mendapatkan data posisi peringkat kru yang sedang login
const myRankInfo = computed(() => {
  if (!currentCrewId.value) return null
  const idx = leaderboardList.value.findIndex(c => (c.crewId || c.id || c.userId) === currentCrewId.value)
  if (idx !== -1) {
    const item = leaderboardList.value[idx]
    return {
      ...item,
      rank: item.rank || idx + 1
    }
  }
  // Fallback jika tidak ada di list
  return {
    rank: 1,
    name: userStore.currentUser?.name || 'Kru',
    stars: userStore.currentUser?.stars || 0,
    level: userStore.currentUser?.level || 1,
    completedMissions: 0
  }
})

const totalBatchStars = computed(() => {
  return leaderboardList.value.reduce((acc, c) => acc + (Number(c.stars) || 0), 0)
})

const formatStars = (val) => {
  const num = Number(val) || 0
  return num.toFixed(1).replace(/\.0$/, '')
}

const formatPoints = (val) => {
  const num = Number(val) || 0
  const points = num > 50 ? num : num * 20
  return points.toLocaleString()
}
</script>

<style scoped>
.adventure-leaderboard-card {
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}
</style>
