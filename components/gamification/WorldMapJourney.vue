<template>
  <div class="space-y-6 select-none">
    <!-- Top Adventure Banner & Current Location Indicator -->
    <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1a4257] via-[#24779f] to-[#491b41] text-white relative overflow-hidden shadow-xl border border-white/10">
      <!-- Glow ambient -->
      <div class="absolute -right-10 -top-10 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="relative flex-shrink-0">
            <img
              :src="userStore.currentUser.avatar"
              :alt="userStore.currentUser.name"
              class="w-14 h-14 rounded-2xl object-cover ring-4 ring-amber-400 shadow-xl"
            />
            <span class="absolute -bottom-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black shadow">
              LVL {{ myProgress.currentLevel }}
            </span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                <span>📍 PULAU AKTIF: CHAPTER 2</span>
              </span>
              <span class="text-xs text-amber-200 font-bold">
                {{ batchStore.currentBatch.name }}
              </span>
            </div>
            <h3 class="text-lg sm:text-2xl font-black tracking-tight mt-0.5">
              Ekspedisi Bintang: {{ userStore.currentUser.name }}
            </h3>
            <p class="text-xs text-slate-200 mt-0.5">
              Jelajahi peta dunia gamifikasi Re.juve! Klik pulau mana saja untuk melihat pos misi & perolehan ⭐ Bintang.
            </p>
          </div>
        </div>

        <!-- Star Vault & Stage Status -->
        <div class="flex items-center gap-3 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/15 self-start md:self-auto">
          <div class="text-center px-2">
            <span class="text-[10px] text-slate-300 font-bold uppercase block">Pundi Bintang</span>
            <span class="text-base font-black text-amber-300 flex items-center justify-center gap-1">
              ⭐ {{ myTotalStars.toLocaleString() }}
            </span>
          </div>
          <div class="w-px h-8 bg-white/20"></div>
          <div class="text-center px-2">
            <span class="text-[10px] text-slate-300 font-bold uppercase block">Peringkat</span>
            <span class="text-base font-black text-emerald-400">#{{ myRank }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🗺️ WORLD MAP CANVAS (SVG + CSS Adventure Landscape) -->
    <div class="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-[#24779f]/30 dark:border-slate-800 bg-[#38bdf8] dark:bg-[#0369a1] aspect-[16/10] sm:aspect-[16/9] min-h-[520px]">
      <!-- Animated Ocean Waves Surface -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] dark:from-[#0369a1] dark:via-[#075985] dark:to-[#0c4a6e]"></div>

      <!-- Animated Wave Ripple Overlays -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="waves" width="80" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0 20 Q 20 10 40 20 T 80 20" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" class="animate-wave-drift" />
      </svg>

      <!-- ☁️ Drifting Ambient Clouds -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <!-- Cloud 1 -->
        <div class="absolute top-[8%] -left-32 animate-cloud-slow opacity-85">
          <div class="flex items-center text-white/90 drop-shadow-md">
            <span class="text-5xl sm:text-7xl">☁️</span>
          </div>
        </div>
        <!-- Cloud 2 -->
        <div class="absolute top-[35%] -left-48 animate-cloud-medium opacity-75">
          <div class="flex items-center text-white/80 drop-shadow-md">
            <span class="text-6xl sm:text-8xl">☁️</span>
          </div>
        </div>
        <!-- Cloud 3 -->
        <div class="absolute top-[65%] -left-36 animate-cloud-fast opacity-80">
          <div class="flex items-center text-white/85 drop-shadow-md">
            <span class="text-4xl sm:text-6xl">☁️</span>
          </div>
        </div>
        <!-- Little Birds / Flying Leaf -->
        <div class="absolute top-[18%] left-[45%] animate-pulse text-white/60 text-xs sm:text-sm">
          🕊️ 🕊️
        </div>
      </div>

      <!-- 🛤️ MAIN ADVENTURE TRAIL (SVG Winding Stepping Trail Connecting Islands) -->
      <svg class="absolute inset-0 w-full h-full z-10 pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
        <defs>
          <!-- Trail Gradient -->
          <linearGradient id="trailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="50%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#963189" />
          </linearGradient>
          <!-- Trail Glow Filter -->
          <filter id="trailGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Base Stepping Trail Path -->
        <path
          d="M 180 430 C 300 460, 320 280, 500 290 C 680 300, 720 180, 830 160"
          fill="none"
          stroke="#ffffff"
          stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="8 16"
          class="opacity-60"
        />

        <!-- Animated Glowing Particle Stream Trail -->
        <path
          d="M 180 430 C 300 460, 320 280, 500 290 C 680 300, 720 180, 830 160"
          fill="none"
          stroke="url(#trailGrad)"
          stroke-width="6"
          stroke-linecap="round"
          stroke-dasharray="14 18"
          filter="url(#trailGlow)"
          class="animate-trail-flow"
        />
      </svg>

      <!-- ========================================================================= -->
      <!-- 🏝️ ISLAND 1: COLD CHAIN LAGOON (Week 1 - Selesai & Berkilau Emas) -->
      <!-- ========================================================================= -->
      <div
        @click="openIslandModal(1)"
        class="absolute left-[8%] sm:left-[12%] top-[55%] sm:top-[58%] -translate-y-1/2 z-20 cursor-pointer group transition-transform duration-300 hover:scale-105"
      >
        <!-- Island Landmass Illustration -->
        <div class="relative w-44 sm:w-56 h-36 sm:h-44 flex flex-col items-center justify-center">
          <!-- Island Shadow on Water -->
          <div class="absolute -bottom-2 w-40 sm:w-52 h-14 bg-[#0369a1]/60 dark:bg-black/40 rounded-full blur-md"></div>

          <!-- Island Sand & Grass Shape -->
          <div class="relative w-36 sm:w-48 h-24 sm:h-30 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-gradient-to-b from-[#86efac] via-[#22c55e] to-[#15803d] border-4 border-[#fef08a] shadow-2xl overflow-hidden flex items-center justify-center">
            <!-- Shimmer effect on completed island -->
            <div class="absolute inset-0 bg-white/20 animate-pulse"></div>

            <!-- Island Elements -->
            <div class="flex items-center gap-1 text-2xl sm:text-3xl z-10">
              <span>🌴</span>
              <span class="text-3xl sm:text-4xl animate-bounce-gentle">🧊</span>
              <span>🌴</span>
            </div>
          </div>

          <!-- ✨ Golden Victory Flag & Star Laurel -->
          <div class="absolute -top-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white border-2 border-emerald-300 shadow-xl animate-float-slow">
            <span class="text-xs">🏆</span>
            <span class="text-[10px] font-black uppercase tracking-wider">Chapter 1 • Selesai</span>
            <span class="text-amber-300 text-xs font-black">⭐ 5/5</span>
          </div>

          <!-- Island Label Banner -->
          <div class="mt-2 px-3 py-1 rounded-xl bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-emerald-500/40 shadow-lg text-center backdrop-blur-sm group-hover:ring-2 group-hover:ring-emerald-400">
            <h4 class="text-xs font-black">Cold Chain Lagoon</h4>
            <p class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Week 1 • 4 Misi Selesai ✓</p>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 🏝️ ISLAND 2: PURE EXTRACTION ARCHIPELAGO (Week 2 - CURRENT ACTIVE STAGE) -->
      <!-- ========================================================================= -->
      <div
        @click="openIslandModal(2)"
        class="absolute left-[40%] sm:left-[43%] top-[34%] sm:top-[36%] -translate-y-1/2 z-30 cursor-pointer group transition-transform duration-300 hover:scale-105"
      >
        <div class="relative w-52 sm:w-64 h-44 sm:h-52 flex flex-col items-center justify-center">
          <!-- 📍 Active Radar Pulse Beacons (Current Stage Highlight) -->
          <div class="absolute inset-0 rounded-full bg-[#499ec7]/30 animate-ping pointer-events-none scale-90"></div>
          <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse pointer-events-none scale-110"></div>

          <!-- Island Shadow on Water -->
          <div class="absolute -bottom-2 w-48 sm:w-60 h-16 bg-[#0369a1]/70 dark:bg-black/50 rounded-full blur-lg"></div>

          <!-- Island Sand & Citrus Grass Body -->
          <div class="relative w-44 sm:w-56 h-28 sm:h-34 rounded-[55%_45%_50%_50%/45%_55%_45%_55%] bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#c2410c] border-4 border-amber-200 shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-[#499ec7] ring-offset-2">
            <!-- Juice spring / Cold pressed fountain -->
            <div class="flex items-center gap-1.5 text-2xl sm:text-4xl z-10">
              <span>🍊</span>
              <span class="text-3xl sm:text-5xl animate-bounce-gentle">🥤</span>
              <span>🍍</span>
            </div>
          </div>

          <!-- 👨 USER CHARACTER MASCOT STANDING ON CURRENT STAGE -->
          <div class="absolute -top-12 sm:-top-14 z-40 flex flex-col items-center animate-bob-character">
            <!-- Character Speech/Location Tag -->
            <div class="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#499ec7] to-[#24779f] text-white text-[9px] sm:text-[10px] font-black shadow-lg border border-white/40 flex items-center gap-1 mb-1">
              <span class="animate-pulse">📍</span>
              <span>POS ANDA (WEEK 2)</span>
            </div>

            <!-- Avatar Character Token -->
            <div class="relative">
              <img
                :src="userStore.currentUser.avatar"
                :alt="userStore.currentUser.name"
                class="w-11 sm:w-13 h-11 sm:h-13 rounded-2xl object-cover ring-4 ring-white shadow-2xl border-2 border-amber-400"
              />
              <span class="absolute -bottom-1 -right-1 text-xs">⭐</span>
            </div>
          </div>

          <!-- Active Island Label Banner -->
          <div class="mt-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black shadow-xl text-center border-2 border-white group-hover:scale-105 transition-transform">
            <h4 class="text-xs font-black">Pure Extraction Ridge</h4>
            <p class="text-[10px] text-amber-950 font-extrabold flex items-center justify-center gap-1">
              <span>⚡ TAHAP AKTIF DINILAI</span>
            </p>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 🏝️ ISLAND 3: HACCP SUMMIT FORTRESS (Week 3 - LOCKED / TERKUNCI DENGAN AWAN) -->
      <!-- ========================================================================= -->
      <div
        @click="openIslandModal(3)"
        class="absolute right-[6%] sm:right-[10%] top-[14%] sm:top-[16%] -translate-y-1/2 z-20 cursor-pointer group transition-transform duration-300 hover:scale-105"
      >
        <div class="relative w-48 sm:w-58 h-40 sm:h-48 flex flex-col items-center justify-center">
          <!-- Soft Fog of War Clouds obscuring the locked island -->
          <div class="absolute inset-0 bg-white/40 dark:bg-slate-900/40 rounded-full blur-xl pointer-events-none"></div>

          <!-- Island Shadow -->
          <div class="absolute -bottom-2 w-44 sm:w-54 h-14 bg-[#0369a1]/50 dark:bg-black/30 rounded-full blur-md"></div>

          <!-- Mountain Peak Body -->
          <div class="relative w-40 sm:w-50 h-26 sm:h-32 rounded-[50%_50%_60%_40%/60%_60%_40%_40%] bg-gradient-to-b from-[#e0e7ff] via-[#818cf8] to-[#4338ca] border-4 border-slate-300 shadow-2xl overflow-hidden flex items-center justify-center opacity-85">
            <div class="flex items-center gap-1.5 text-2xl sm:text-4xl z-10">
              <span>🏔️</span>
              <span class="text-3xl sm:text-5xl">🏆</span>
              <span>🌲</span>
            </div>
          </div>

          <!-- 🔒 Frosted Ice Padlock on Locked Summit -->
          <div class="absolute -top-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 border border-slate-700 shadow-xl backdrop-blur-md">
            <Lock class="w-3.5 h-3.5 text-amber-400" />
            <span class="text-[10px] font-black uppercase tracking-wider">Terkunci • Week 3</span>
          </div>

          <!-- Summit Island Label -->
          <div class="mt-2 px-3 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-md text-center">
            <h4 class="text-xs font-black">HACCP Legend Summit</h4>
            <p class="text-[10px] text-amber-500 font-bold">Bounty Hadiah: ⭐ 500 Stars</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 🎯 ADVENTURE STAGE INTEL MODAL (Popup saat Klik Pulau) -->
    <BaseModal
      :modelValue="!!activeIslandModal"
      :title="islandMeta?.title || 'Detail Tahap Pulau'"
      :subtitle="`${islandMeta?.subtitle || ''} • ${batchStore.currentBatch.name}`"
      max-width="lg"
      @update:modelValue="activeIslandModal = null"
      @close="activeIslandModal = null"
    >
      <div v-if="islandMeta" class="space-y-4 py-2">
        <!-- Island Description & Status Banner -->
        <div
          class="p-4 rounded-2xl border flex items-center justify-between gap-4"
          :class="[
            islandMeta.week === 1 ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' :
            islandMeta.week === 2 ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' :
            'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ islandMeta.icon }}</span>
            <div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                {{ islandMeta.title }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ islandMeta.description }}
              </p>
            </div>
          </div>

          <span
            class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex-shrink-0"
            :class="[
              islandMeta.week === 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' :
              islandMeta.week === 2 ? 'bg-amber-400 text-amber-950 font-black' :
              'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            ]"
          >
            {{ islandMeta.statusLabel }}
          </span>
        </div>

        <!-- 4 Mission Stepping Tasks for This Island -->
        <div class="space-y-2.5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Daftar 4 Pos Misi di Pulau Ini:
          </span>

          <div
            v-for="(m, idx) in islandMissions"
            :key="m.id"
            class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-[#499ec7] transition-all shadow-sm"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
                :class="[
                  m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  m.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                  m.status === 'REVISION_REQUIRED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                ]"
              >
                {{ idx + 1 }}
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-bold text-slate-400">{{ m.code }}</span>
                  <span class="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#963189]/10 text-[#963189] dark:text-[#db92d7]">
                    {{ m.category }}
                  </span>
                </div>
                <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {{ m.title }}
                </h5>
              </div>
            </div>

            <!-- Score / Action -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <span v-if="userStore.isCrew && getCrewMissionScore(m) > 0" class="text-xs font-bold text-amber-500">
                ⭐ {{ getCrewMissionScore(m) }}/100
              </span>

              <NuxtLink
                :to="`/missions/${m.id}`"
                class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#499ec7] hover:text-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
              >
                <span>Buka</span>
                <ChevronRight class="w-3 h-3" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="pt-3 flex items-center justify-end">
          <button
            type="button"
            @click="activeIslandModal = null"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Tutup Peta
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { getStarProgress } from '~/utils/star.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  Lock,
  ChevronRight
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()

const activeIslandModal = ref(null)

const myCrewData = computed(() => {
  if (userStore.isCrew) {
    return gamificationStore.crewById(userStore.currentUser.id) || userStore.currentUser
  }
  return gamificationStore.allCrews[0]
})

const myTotalStars = computed(() => {
  return myCrewData.value?.stars || userStore.currentUser.stars || 0
})

const myProgress = computed(() => {
  return getStarProgress(myTotalStars.value)
})

const storeCrews = computed(() => {
  return gamificationStore.crewsByBatch(batchStore.selectedBatchId)
})

const myRank = computed(() => {
  const sorted = [...storeCrews.value].sort((a, b) => b.stars - a.stars)
  const idx = sorted.findIndex(c => (c.crewId || c.id) === userStore.currentUser.id)
  return idx !== -1 ? idx + 1 : 1
})

const activeBatchMissions = computed(() => {
  const batchId = userStore.isCrew ? userStore.currentUser.batchId : batchStore.selectedBatchId
  return missionStore.missionsByBatch(batchId)
})

const islandMissions = computed(() => {
  if (!activeIslandModal.value) return []
  return activeBatchMissions.value.filter(m => m.week === activeIslandModal.value)
})

const islandMeta = computed(() => {
  if (activeIslandModal.value === 1) {
    return {
      week: 1,
      icon: '🏝️',
      title: 'Pulau 1: Cold Chain Lagoon & Basecamp',
      subtitle: 'Chapter 1 • Minggu 1 Selesai',
      description: 'Audit suhu chiller 2-4°C, sanitasi mesin hidrolik, uji kemanisan brix buah segar, dan standar keselamatan gerai.',
      statusLabel: '✓ VERIFIED & COMPLETED'
    }
  }
  if (activeIslandModal.value === 2) {
    return {
      week: 2,
      icon: '🍊',
      title: 'Pulau 2: Pure Extraction & #CleanLabel Ridge',
      subtitle: 'Chapter 2 • Minggu 2 Aktif Dinilai',
      description: 'Audit rasio ekstraksi jus 100% murni, sanitasi bar berkala, rekonsiliasi stok harian, dan kecepatan barista < 45 detik.',
      statusLabel: '⚡ SIKLUS AKTIF DINILAI'
    }
  }
  if (activeIslandModal.value === 3) {
    return {
      week: 3,
      icon: '🏔️',
      title: 'Pulau 3: HACCP Summit Fortress & Legend Trophy',
      subtitle: 'Chapter 3 • Segera Dibuka Minggu Depan',
      description: 'Puncak evaluasi sertifikasi higienitas total HACCP, perawatan preventif chiller, dan penandatanganan sertifikat mutu gerai.',
      statusLabel: '🔒 TERKUNCI (MINGGU 3)'
    }
  }
  return null
})

const openIslandModal = (weekNumber) => {
  activeIslandModal.value = weekNumber
}

const getCrewMissionScore = (mission) => {
  if (mission.crewEvaluations) {
    const e = mission.crewEvaluations.find(ce => ce.crewId === userStore.currentUser.id)
    if (e && e.score > 0) return e.score
  }
  return mission.averageScore || 0
}
</script>

<style scoped>
/* 🌊 Wave Ripple Animation */
@keyframes wave-drift {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 10px); }
  100% { transform: translate(0, 0); }
}

.animate-wave-drift {
  animation: wave-drift 10s ease-in-out infinite;
}

/* ☁️ Cloud Drifting Animations */
@keyframes cloud-slow {
  0% { transform: translateX(0); }
  100% { transform: translateX(1200px); }
}

@keyframes cloud-medium {
  0% { transform: translateX(0); }
  100% { transform: translateX(1100px); }
}

@keyframes cloud-fast {
  0% { transform: translateX(0); }
  100% { transform: translateX(1300px); }
}

.animate-cloud-slow {
  animation: cloud-slow 35s linear infinite;
}

.animate-cloud-medium {
  animation: cloud-medium 25s linear infinite;
}

.animate-cloud-fast {
  animation: cloud-fast 18s linear infinite;
}

/* 🛤️ Animated Stepping Trail Flow */
@keyframes trail-flow {
  to {
    stroke-dashoffset: -64;
  }
}

.animate-trail-flow {
  animation: trail-flow 2.5s linear infinite;
}

/* 👨 Floating Character Bob */
@keyframes bob-character {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.03);
  }
}

.animate-bob-character {
  animation: bob-character 2.2s ease-in-out infinite;
}

@keyframes float-slow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-float-slow {
  animation: float-slow 3s ease-in-out infinite;
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}
</style>
