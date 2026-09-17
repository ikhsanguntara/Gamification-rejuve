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
              <span>Klasemen Bintang Ekspedisi</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                BATCH RANKING
              </span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Podium 3 besar & urutan seluruh perolehan bintang kru pada batch ekspedisi ini.
            </p>
          </div>
        </div>
      </div>

      <!-- Quick Stats & Active Batch Name -->
      <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <span class="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MapPin class="w-3.5 h-3.5 text-amber-500" />
          <span class="font-bold">{{ currentBatchName }}</span>
        </span>
        <span class="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center gap-1">
          <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{{ totalBatchStars.toLocaleString() }} Bintang Batch</span>
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="gamificationStore.isLoadingLeaderboard" class="py-12 text-center space-y-2">
      <Loader2 class="w-7 h-7 text-amber-500 animate-spin mx-auto" />
      <p class="text-xs text-slate-400 font-medium">Memuat klasemen batch ekspedisi...</p>
    </div>

    <template v-else>
      <!-- ============================================================
           TOP 3 VISUAL PODIUM (#1, #2, #3)
      ============================================================ -->
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

          <div class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <div class="inline-flex items-center gap-1 font-black text-amber-300 text-xs px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-950 shadow-2xs border border-amber-400/20">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{{ formatStars(topThreeList[1].stars) }}</span>
            </div>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
              {{ formatPoints(topThreeList[1].points || topThreeList[1].stars) }} Points
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

          <div class="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-amber-400/40 shadow-md">
            <div class="inline-flex items-center gap-1 text-amber-300 font-black text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-950 shadow-2xs border border-amber-400/30">
              <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{{ formatStars(topThreeList[0].stars) }}</span>
            </div>
            <span class="text-xs font-black text-slate-900 dark:text-white">
              {{ formatPoints(topThreeList[0].points || topThreeList[0].stars) }} Points
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

          <div class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <div class="inline-flex items-center gap-1 font-black text-amber-300 text-xs px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-950 shadow-2xs border border-amber-400/20">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{{ formatStars(topThreeList[2].stars) }}</span>
            </div>
            <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
              {{ formatPoints(topThreeList[2].points || topThreeList[2].stars) }} Points
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
           TABEL URUTAN PERINGKAT SISA KRU (#4 s/d #N)
      ============================================================ -->
      <div v-if="remainingRanksList.length > 0" class="rounded-3xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-xs">
        <!-- Table Toolbar & Title -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#831843]/10 dark:bg-[#831843]/20 text-[#831843] dark:text-[#f472b6] flex items-center justify-center font-bold">
              <ListOrdered class="w-4 h-4" />
            </div>
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daftar Peringkat Kru Ekspedisi (#4 s/d #{{ leaderboardList.length }})</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                  {{ remainingRanksList.length }} Kru
                </span>
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Urutan peringkat kru pada {{ currentBatchName }} berdasarkan akumulasi bintang & poin.
              </p>
            </div>
          </div>

          <!-- Search Input for remaining ranks -->
          <div v-if="remainingRanksList.length > 5" class="relative w-full sm:w-64 flex-shrink-0">
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama kru atau gerai..."
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <!-- Table Responsive -->
        <div class="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="py-3 px-3.5 w-16 text-center">Peringkat</th>
                <th class="py-3 px-3.5">Kru Ekspedisi</th>
                <th class="py-3 px-3.5">Lokasi Gerai</th>
                <th class="py-3 px-3.5 text-center">Level Bintang</th>
                <th class="py-3 px-3.5 text-center">Misi Selesai</th>
                <th class="py-3 px-3.5 text-right">Perolehan Bintang & Poin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              <tr
                v-for="crew in paginatedRemainingRanks"
                :key="crew.crewId || crew.id || crew.userId"
                class="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                :class="[
                  isCurrentUser(crew)
                    ? 'bg-blue-50/60 dark:bg-blue-950/40 font-bold ring-1 ring-inset ring-blue-500/50'
                    : ''
                ]"
              >
                <!-- Rank -->
                <td class="py-3 px-3.5 text-center font-bold">
                  <span
                    class="inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-xs font-black shadow-2xs"
                    :class="[
                      isCurrentUser(crew)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    ]"
                  >
                    #{{ crew.rank }}
                  </span>
                </td>

                <!-- Kru Identity -->
                <td class="py-3 px-3.5">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <img
                      :src="crew.avatar"
                      :alt="crew.name"
                      class="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                    />
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-bold text-slate-900 dark:text-white truncate">{{ crew.name }}</span>
                        <span
                          v-if="isCurrentUser(crew)"
                          class="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-black"
                        >
                          ANDA
                        </span>
                      </div>
                      <span class="text-[11px] text-slate-400 block truncate">{{ crew.position || 'Store Specialist' }}</span>
                    </div>
                  </div>
                </td>

                <!-- Store Location -->
                <td class="py-3 px-3.5 text-slate-600 dark:text-slate-300">
                  <div class="flex items-center gap-1.5">
                    <MapPin class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span class="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {{ crew.storeLocation || 'Gerai Re.juve' }}
                    </span>
                  </div>
                </td>

                <!-- Star Level -->
                <td class="py-3 px-3.5 text-center">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Lvl {{ crew.level || 1 }} ({{ crew.levelTitle || 'Novice' }})
                  </span>
                </td>

                <!-- Completed Missions -->
                <td class="py-3 px-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                  {{ crew.completedMissions || 0 }} Misi
                </td>

                <!-- Stars & Points -->
                <td class="py-3 px-3.5 text-right">
                  <div class="inline-flex items-center gap-2 justify-end">
                    <div class="inline-flex items-center gap-1 font-black text-amber-300 text-xs px-2.5 py-1 rounded-xl bg-slate-900 dark:bg-slate-950 shadow-2xs border border-amber-400/20">
                      <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{{ formatStars(crew.stars) }}</span>
                    </div>
                    <span class="text-xs font-bold text-slate-600 dark:text-slate-300">
                      {{ formatPoints(crew.points || crew.stars) }} Points
                    </span>
                  </div>
                </td>
              </tr>

              <!-- Empty Filter State -->
              <tr v-if="filteredRemainingRanks.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
                  Tidak ada kru yang cocok dengan kata kunci "{{ searchQuery }}".
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination for table -->
        <div v-if="totalPages > 1" class="flex items-center justify-between pt-2 px-1 text-xs">
          <span class="text-slate-500 dark:text-slate-400">
            Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredRemainingRanks.length) }} dari {{ filteredRemainingRanks.length }} kru
          </span>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              :disabled="currentPage === 1"
              @click="currentPage--"
              class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft class="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span class="px-2.5 py-1 text-slate-600 dark:text-slate-400 font-bold">
              {{ currentPage }} / {{ totalPages }}
            </span>

            <button
              type="button"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Selanjutnya</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Info note if all batch members are in Top 3 -->
      <div v-else-if="topThreeList.length > 0 && leaderboardList.length <= 3" class="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-center text-xs text-amber-800 dark:text-amber-300">
        ✨ Seluruh kru pada batch ini ({{ leaderboardList.length }} anggota) telah berada di posisi podium Top 3.
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGamificationStore } from '~/stores/gamification.js'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import {
  Trophy,
  Crown,
  Star,
  MapPin,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  ListOrdered
} from 'lucide-vue-next'

const props = defineProps({
  batchId: { type: String, default: '' },
  batchName: { type: String, default: '' }
})

const gamificationStore = useGamificationStore()
const userStore = useUserStore()
const batchStore = useBatchStore()

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 8

const currentCrewId = computed(() => {
  return userStore.currentUser?.id || userStore.currentUser?.userId || userStore.apiUser?.userId || ''
})

// Menentukan batchId yang aktif: untuk kru, selalu utamakan batch miliknya
const effectiveBatchId = computed(() => {
  if (userStore.isCrew) {
    return userStore.currentUser?.batchId || userStore.currentUser?.activeBatchId || userStore.currentUser?.batch?.id || props.batchId || batchStore.selectedBatchId || batchStore.currentBatch?.id || ''
  }
  return props.batchId || batchStore.selectedBatchId || batchStore.currentBatch?.id || ''
})

const activeBatch = computed(() => {
  const bId = effectiveBatchId.value
  if (!bId) return batchStore.currentBatch || null
  return (batchStore.batches || []).find(b => b.id === bId || b.code === bId) || batchStore.currentBatch || null
})

const currentBatchName = computed(() => {
  if (props.batchName) return props.batchName
  if (activeBatch.value?.name) return activeBatch.value.name
  return batchStore.currentBatch?.name || 'Batch Ekspedisi'
})

// Kumpulan ID kru yang sah terdaftar pada batch ini
const batchCrewIds = computed(() => {
  const ids = new Set()
  const b = activeBatch.value
  const bId = effectiveBatchId.value

  if (b) {
    if (b.assignment?.crewIds && Array.isArray(b.assignment.crewIds)) {
      b.assignment.crewIds.forEach(id => id && ids.add(id))
    }
    if (b.crews && Array.isArray(b.crews)) {
      b.crews.forEach(c => {
        const cId = c.id || c.userId || c.crewId
        if (cId) ids.add(cId)
      })
    }
    if (b.users && Array.isArray(b.users)) {
      b.users.forEach(u => {
        const uId = u.id || u.userId || u.crewId
        if (uId) ids.add(uId)
      })
    }
  }

  // Dari userStore
  const allUsers = userStore.allUsers || userStore.userDirectory || []
  allUsers.forEach(u => {
    const uId = u.id || u.userId
    if (bId && (u.batchId === bId || u.activeBatchId === bId || u.assignedBatchId === bId)) {
      if (uId) ids.add(uId)
    }
  })

  // Dari gamificationStore
  const gamiCrews = gamificationStore.crewsByBatch(bId) || []
  gamiCrews.forEach(c => {
    const cId = c.id || c.userId || c.crewId
    if (cId) ids.add(cId)
  })

  // Tambahkan user yang sedang login jika batchId cocok
  if (userStore.isCrew && userStore.currentUser?.id) {
    const myBatchId = userStore.currentUser?.batchId || userStore.currentUser?.activeBatchId
    if (!bId || myBatchId === bId) {
      ids.add(userStore.currentUser.id)
    }
  }

  return ids
})

const isCurrentUser = (crew) => {
  if (!crew || !currentCrewId.value) return false
  const crewId = crew.crewId || crew.id || crew.userId
  return crewId === currentCrewId.value
}

// Trigger load API saat mounted atau batchId berganti
const loadLeaderboardData = async () => {
  if (effectiveBatchId.value) {
    await Promise.allSettled([
      gamificationStore.fetchLeaderboardFromApi({ batchId: effectiveBatchId.value }, true),
      userStore.fetchUsersFromApi({ limit: 100 }),
      batchStore.fetchBatchByIdFromApi(effectiveBatchId.value)
    ])
  } else {
    await Promise.allSettled([
      gamificationStore.fetchLeaderboardFromApi({}, true),
      userStore.fetchUsersFromApi({ limit: 100 })
    ])
  }
}

onMounted(() => {
  loadLeaderboardData()
})

watch(effectiveBatchId, () => {
  currentPage.value = 1
  loadLeaderboardData()
})

// Filter data leaderboard HANYA untuk kru yang terdaftar pada batch aktif
const rawBatchLeaderboard = computed(() => {
  const batchId = effectiveBatchId.value
  const validCrewIds = batchCrewIds.value
  const crewMap = new Map()

  const addOrUpdateCrew = (c) => {
    if (!c) return
    const id = c.userId || c.id || c.crewId
    if (!id) return

    const existing = crewMap.get(id)
    if (!existing) {
      crewMap.set(id, {
        id,
        crewId: id,
        userId: id,
        name: c.name || 'Crew Member',
        email: c.email || '',
        code: c.code || 'CRW',
        avatar: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || 'Crew')}`,
        position: c.position || c.role || 'Store Specialist',
        department: c.department || c.departmentName || 'Store Operations',
        storeLocation: c.storeLocation || c.departmentName || currentBatchName.value,
        batchId: c.batchId || batchId,
        stars: Number(c.stars) || 0,
        points: Number(c.points) || (Number(c.stars) || 0) * 20,
        level: Number(c.level) || 1,
        levelTitle: c.levelTitle || `Level ${c.level || 1}`,
        completedMissions: Number(c.completedMissions) || 0
      })
    } else {
      if ((Number(c.stars) || 0) > existing.stars) {
        existing.stars = Number(c.stars) || 0
        existing.points = Number(c.points) || existing.stars * 20
      }
      if (c.name && (!existing.name || existing.name === 'Crew Member')) {
        existing.name = c.name
      }
      if (c.avatar && (!existing.avatar || existing.avatar.includes('Crew'))) {
        existing.avatar = c.avatar
      }
      if (c.level) existing.level = Number(c.level) || existing.level
      if (c.completedMissions) existing.completedMissions = Number(c.completedMissions) || existing.completedMissions
    }
  }

  // 1. Ambil dari apiLeaderboard (hanya yang cocok dengan batchId atau validCrewIds)
  if (gamificationStore.apiLeaderboard && gamificationStore.apiLeaderboard.length > 0) {
    gamificationStore.apiLeaderboard.forEach(c => {
      const cId = c.userId || c.id || c.crewId
      const matchBatch = Boolean(batchId && c.batchId && c.batchId === batchId)
      const matchCrewId = Boolean(validCrewIds.size > 0 && validCrewIds.has(cId))
      if (matchBatch || matchCrewId) {
        addOrUpdateCrew(c)
      }
    })
  }

  // 2. Ambil dari userStore (kru yang terdaftar pada batch ini)
  const allUsers = userStore.allUsers || userStore.userDirectory || []
  allUsers.forEach(u => {
    const uId = u.id || u.userId
    const isCrewRole = !u.role || u.role === 'CREW' || u.roleCode === 'CREW'
    const matchBatch = Boolean(batchId && (u.batchId === batchId || u.activeBatchId === batchId || u.assignedBatchId === batchId))
    const matchCrewId = Boolean(validCrewIds.size > 0 && validCrewIds.has(uId))
    if (isCrewRole && (matchBatch || matchCrewId)) {
      addOrUpdateCrew(u)
    }
  })

  // 3. Ambil dari gamificationStore.crewsByBatch
  const storeCrews = gamificationStore.crewsByBatch(batchId) || []
  storeCrews.forEach(c => addOrUpdateCrew(c))

  // 4. Ambil dari activeBatch.crews atau activeBatch.users
  const b = activeBatch.value
  if (b?.crews && Array.isArray(b.crews)) {
    b.crews.forEach(c => addOrUpdateCrew(c))
  }
  if (b?.users && Array.isArray(b.users)) {
    b.users.forEach(u => addOrUpdateCrew(u))
  }

  // 5. Pastikan kru yang sedang login dimasukkan jika berada di batch ini
  if (userStore.isCrew && userStore.currentUser?.id) {
    const myId = userStore.currentUser.id
    const myBatchId = userStore.currentUser?.batchId || userStore.currentUser?.activeBatchId
    if (!batchId || myBatchId === batchId || validCrewIds.has(myId)) {
      addOrUpdateCrew(userStore.currentUser)
    }
  }

  return Array.from(crewMap.values())
})

// Urutkan dan beri nomor peringkat 1 s/d N
const leaderboardList = computed(() => {
  const sorted = [...rawBatchLeaderboard.value].sort((a, b) => {
    const starsB = Number(b.stars) || 0
    const starsA = Number(a.stars) || 0
    if (starsB !== starsA) return starsB - starsA
    const ptsB = Number(b.points) || 0
    const ptsA = Number(a.points) || 0
    return ptsB - ptsA
  })

  return sorted.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }))
})

// Top 3 Podium
const topThreeList = computed(() => {
  return leaderboardList.value.slice(0, 3)
})

// Sisa kru setelah Top 3 (Peringkat #4 s/d #N)
const remainingRanksList = computed(() => {
  return leaderboardList.value.slice(3)
})

// Filter pencarian sisa peringkat
const filteredRemainingRanks = computed(() => {
  if (!searchQuery.value.trim()) return remainingRanksList.value
  const q = searchQuery.value.toLowerCase().trim()
  return remainingRanksList.value.filter(c =>
    (c.name && c.name.toLowerCase().includes(q)) ||
    (c.storeLocation && c.storeLocation.toLowerCase().includes(q)) ||
    (c.position && c.position.toLowerCase().includes(q))
  )
})

const totalPages = computed(() => Math.ceil(filteredRemainingRanks.value.length / itemsPerPage) || 1)

const paginatedRemainingRanks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRemainingRanks.value.slice(start, start + itemsPerPage)
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

