<template>
  <div class="space-y-6">
    <!-- Journey Header & Odyssey Level Progress -->
    <div class="p-6 rounded-3xl bg-gradient-to-br from-[#1a4257] via-[#24779f] to-[#491b41] text-white relative overflow-hidden shadow-xl border border-white/10">
      <!-- Ambient Glows -->
      <div class="absolute -right-12 -top-12 w-64 h-64 bg-[#499ec7]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-12 -bottom-12 w-64 h-64 bg-[#963189]/25 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold mb-2.5 border border-white/15">
            <Compass class="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>Re.juve Cold-Pressed 3-Week Star Odyssey</span>
            <span>•</span>
            <span>{{ batchStore.currentBatch.name }}</span>
          </div>

          <h2 class="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <span>Peta Ekspedisi Gamifikasi</span>
            <span class="text-xl">🗺️</span>
          </h2>
          <p class="text-slate-200 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Selesaikan 12 pos misi operasional sepanjang 3 minggu untuk mengumpulkan ⭐ Bintang, menaikkan Level, dan meraih predikat <strong>Star Legend Re.juve</strong>.
          </p>
        </div>

        <!-- Quick Summary Box -->
        <div class="flex items-center gap-3 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex-shrink-0">
          <div class="text-center px-2">
            <span class="text-xs text-slate-300 font-semibold uppercase block">Pos Selesai</span>
            <span class="text-lg font-bold text-emerald-400">{{ completedMissionsCount }} / 12</span>
          </div>
          <div class="w-px h-8 bg-white/20"></div>
          <div class="text-center px-2">
            <span class="text-xs text-slate-300 font-semibold uppercase block">Pos Aktif</span>
            <span class="text-lg font-bold text-amber-400">Week {{ batchStore.selectedWeek }}</span>
          </div>
          <div class="w-px h-8 bg-white/20"></div>
          <div class="text-center px-2">
            <span class="text-xs text-slate-300 font-semibold uppercase block">Total Stars</span>
            <span class="text-lg font-bold text-amber-300 flex items-center justify-center gap-1">
              ⭐ {{ myTotalStars.toLocaleString() }}
            </span>
          </div>
        </div>
      </div>

      <!-- Fluid Odyssey Progress Bar -->
      <div class="mt-6 pt-5 border-t border-white/15">
        <div class="flex items-center justify-between text-xs font-semibold text-slate-200 mb-2">
          <span>Progres Ekspedisi Siklus 3 Minggu</span>
          <span class="text-amber-300 font-bold">{{ odysseyProgressPercent }}% Selesai</span>
        </div>
        <div class="w-full h-3 rounded-full bg-black/30 overflow-hidden p-0.5 border border-white/10">
          <div
            class="h-full rounded-full bg-gradient-to-r from-[#499ec7] via-[#963189] to-amber-400 transition-all duration-1000 relative"
            :style="{ width: `${odysseyProgressPercent}%` }"
          >
            <!-- Animated fluid sheen -->
            <div class="absolute inset-0 bg-white/30 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Journey Map Canvas (Winding SVG Pipeline & Waypoints) -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
      <!-- Background Grid Pattern -->
      <div class="absolute inset-0 bg-[radial-gradient(#499ec7_1px,transparent_1px)] [background-size:24px_24px] opacity-10 dark:opacity-20 pointer-events-none"></div>

      <!-- Chapter Milestones Stepper -->
      <div class="relative z-10 space-y-12">
        <!-- ==================== CHAPTER 1: WEEK 1 (Basecamp) ==================== -->
        <div class="space-y-4">
          <!-- Chapter Header Banner -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              W1
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  Chapter 1: Cold Chain & Sanitation Basecamp
                </h3>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ✓ VERIFIED & COMPLETED
                </span>
              </div>
              <p class="text-xs text-slate-400">Fondasi integritas suhu 2-4°C, sanitasi mesin hidrolik, dan keamanan mutu awal.</p>
            </div>
          </div>

          <!-- Week 1 Waypoint Nodes Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div
              v-for="(m, idx) in week1Missions"
              :key="m.id"
              @click="selectMissionNode(m)"
              class="group p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden"
              :class="[
                selectedNode?.id === m.id
                  ? 'border-[#499ec7] ring-2 ring-[#499ec7]/40 bg-[#499ec7]/10'
                  : isMissionCompleted(m)
                  ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 hover:border-emerald-400 hover:shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300'
              ]"
            >
              <!-- Completed Badge -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Pos {{ idx + 1 }} • {{ m.category }}
                </span>
                <span class="text-xs font-medium">⭐ 5/5</span>
              </div>

              <h4 class="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#499ec7] transition-colors">
                {{ m.title }}
              </h4>

              <div class="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                <span class="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 class="w-3.5 h-3.5" />
                  <span>Nilai: {{ getMissionScore(m) }}/100</span>
                </span>
                <span class="text-slate-400 group-hover:text-[#499ec7] font-medium">Lihat Info →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Animated Connecting Fluid Tube (W1 to W2) -->
        <div class="flex items-center justify-center py-2 relative">
          <div class="w-full max-w-md h-2 rounded-full bg-gradient-to-r from-emerald-500 via-[#499ec7] to-[#963189] relative overflow-hidden shadow-sm">
            <div class="absolute inset-0 bg-white/40 animate-fluid-stream"></div>
          </div>
          <span class="absolute px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
            🌊 Aliran Cold-Pressed Juice Aktif
          </span>
        </div>

        <!-- ==================== CHAPTER 2: WEEK 2 (Active Extraction Ridge) ==================== -->
        <div class="space-y-4">
          <!-- Chapter Header Banner -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-[#499ec7]/20 border border-[#499ec7]/40 flex items-center justify-center text-[#499ec7] dark:text-[#84cded] font-bold text-sm relative">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-2xl bg-[#499ec7]/30 opacity-75"></span>
              <span>W2</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  Chapter 2: 100% Pure Extraction & #CleanLabel Peak
                </h3>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                  ⚡ SIKLUS AKTIF DINILAI
                </span>
              </div>
              <p class="text-xs text-slate-400">Tahap inti audit rasio jus murni, kecepatan barista, dan sanitasi berkala gerai.</p>
            </div>
          </div>

          <!-- Week 2 Waypoint Nodes Grid with Avatar Stepping Pin -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div
              v-for="(m, idx) in week2Missions"
              :key="m.id"
              @click="selectMissionNode(m)"
              class="group p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden"
              :class="[
                selectedNode?.id === m.id
                  ? 'border-[#499ec7] ring-2 ring-[#499ec7]/40 bg-[#499ec7]/10 shadow-lg'
                  : m.status === 'PENDING_REVIEW'
                  ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20 shadow-sm hover:border-amber-400'
                  : m.status === 'REVISION_REQUIRED'
                  ? 'border-rose-300 dark:border-rose-700/80 bg-rose-50/40 dark:bg-rose-950/20 shadow-sm'
                  : 'border-[#499ec7]/40 bg-white dark:bg-slate-900 hover:border-[#499ec7] shadow-sm'
              ]"
            >
              <!-- Stepping Mascot Pin on Current Active Mission -->
              <div
                v-if="idx === 0"
                class="absolute -top-1 -right-1 z-20 flex items-center gap-1 px-2 py-0.5 rounded-bl-xl bg-gradient-to-r from-[#499ec7] to-[#24779f] text-white text-xs font-semibold shadow-md animate-bounce-gentle"
              >
                <img
                  :src="userStore.currentUser.avatar"
                  :alt="userStore.currentUser.name"
                  class="w-4 h-4 rounded-full object-cover ring-1 ring-white"
                />
                <span>POS ANDA</span>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
                  Pos {{ idx + 5 }} • {{ m.category }}
                </span>
                <span
                  class="text-xs font-semibold px-1.5 py-0.2 rounded"
                  :class="[
                    m.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    m.status === 'REVISION_REQUIRED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  ]"
                >
                  {{ m.status === 'PENDING_REVIEW' ? 'Diajukan' : m.status === 'REVISION_REQUIRED' ? 'Revisi' : 'Aktif' }}
                </span>
              </div>

              <h4 class="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#499ec7] transition-colors">
                {{ m.title }}
              </h4>

              <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span class="font-semibold text-amber-600 dark:text-amber-400">
                  {{ getMissionScore(m) > 0 ? `Nilai: ${getMissionScore(m)}/100` : 'Menunggu Nilai' }}
                </span>
                <span class="text-[#499ec7] font-semibold group-hover:underline">Buka Intel →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Animated Connecting Fluid Tube (W2 to W3) -->
        <div class="flex items-center justify-center py-2 relative">
          <div class="w-full max-w-md h-2 rounded-full bg-gradient-to-r from-[#963189] via-indigo-500 to-amber-500 relative overflow-hidden shadow-sm">
            <div class="absolute inset-0 bg-white/40 animate-fluid-stream"></div>
          </div>
          <span class="absolute px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
            🏔️ Menuju Puncak Sertifikasi HACCP
          </span>
        </div>

        <!-- ==================== CHAPTER 3: WEEK 3 (HACCP Grand Summit) ==================== -->
        <div class="space-y-4">
          <!-- Chapter Header Banner -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
              W3
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold text-slate-900 dark:text-white">
                  Chapter 3: HACCP Grandmaster Summit & Legend Trophy
                </h3>
                <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                  <Lock class="w-3 h-3" />
                  <span>SEGERA DIBUKA MINGGU DEPAN</span>
                </span>
              </div>
              <p class="text-xs text-slate-400">Puncak evaluasi sertifikasi higienitas total, audit chiller berkala, dan verifikasi akhir siklus.</p>
            </div>
          </div>

          <!-- Week 3 Waypoint Nodes Grid (Frosted Ice Locked Effect) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div
              v-for="(m, idx) in week3Missions"
              :key="m.id"
              @click="selectMissionNode(m)"
              class="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 relative overflow-hidden opacity-80 hover:opacity-100 transition-all cursor-pointer"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Pos {{ idx + 9 }} • {{ m.category }}
                </span>
                <Lock class="w-3.5 h-3.5 text-slate-400" />
              </div>

              <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                {{ m.title }}
              </h4>

              <div class="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-400 italic">Locked Milestone</span>
                <span class="text-amber-500 font-semibold">Bounty ⭐ 5 Stars</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Summit Trophy Finale Banner -->
        <div class="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border-2 border-amber-400/40 flex items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg animate-bounce-gentle flex-shrink-0">
              <Trophy class="w-6 h-6" />
            </div>
            <div>
              <h4 class="text-sm font-semibold text-slate-900 dark:text-white">
                Grand Finale: Sertifikat Keunggulan Gerai & Badge Star Legend 🏆
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selesaikan seluruh 12 pos misi untuk mengklaim bonus <strong>+500 Bintang Kehormatan</strong> bagi seluruh Store Specialist cabang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Waypoint Intel Modal / Drawer -->
    <BaseModal
      :modelValue="!!selectedNode"
      :title="selectedNode?.title || 'Detail Pos Misi'"
      :subtitle="`${selectedNode?.code || ''} • Week ${selectedNode?.week || 1} (${selectedNode?.category || ''})`"
      max-width="md"
      @update:modelValue="selectedNode = null"
      @close="selectedNode = null"
    >
      <div v-if="selectedNode" class="space-y-4 py-2">
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {{ selectedNode.description }}
        </p>

        <!-- SOP Checklist Preview -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            Checklist Standar Mutu SOP:
          </span>
          <ul class="space-y-1.5">
            <li
              v-for="(req, idx) in (selectedNode.requirements || ['Pemeriksaan standar operasional prosedur mutu gerai Re.juve.'])"
              :key="idx"
              class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{{ req }}</span>
            </li>
          </ul>
        </div>

        <!-- Personal Score / Status Banner -->
        <div class="p-3.5 rounded-xl bg-[#499ec7]/10 flex items-center justify-between text-xs">
          <div>
            <span class="text-xs text-slate-400 block">Status Pos:</span>
            <strong class="text-slate-800 dark:text-slate-200 font-semibold">{{ selectedNode.status }}</strong>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-400 block">Perolehan Bintang:</span>
            <strong class="text-amber-500 font-semibold">⭐ {{ getMissionScore(selectedNode) > 0 ? '5 Bintang' : 'Hingga 5 Bintang' }}</strong>
          </div>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="selectedNode = null"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Tutup
          </button>
          <NuxtLink
            :to="`/missions/${selectedNode.id}`"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#499ec7] hover:bg-[#24779f] text-white shadow-md shadow-[#499ec7]/20 flex items-center gap-1.5"
          >
            <span>Buka Detail Misi</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
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
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  Compass,
  CheckCircle2,
  Lock,
  Trophy,
  ChevronRight
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()

const selectedNode = ref(null)

const activeBatchMissions = computed(() => {
  const batchId = userStore.isCrew ? userStore.currentUser.batchId : batchStore.selectedBatchId
  return missionStore.missionsByBatch(batchId)
})

const week1Missions = computed(() => activeBatchMissions.value.filter(m => m.week === 1))
const week2Missions = computed(() => activeBatchMissions.value.filter(m => m.week === 2))
const week3Missions = computed(() => activeBatchMissions.value.filter(m => m.week === 3))

const myTotalStars = computed(() => {
  if (userStore.isCrew) {
    const c = gamificationStore.crewById(userStore.currentUser.id)
    return c?.stars || userStore.currentUser.stars || 0
  }
  return batchStore.currentBatch.totalStars || 0
})

const completedMissionsCount = computed(() => {
  return activeBatchMissions.value.filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length
})

const odysseyProgressPercent = computed(() => {
  const total = activeBatchMissions.value.length || 12
  return Math.round((completedMissionsCount.value / total) * 100) || 33
})

const isMissionCompleted = (mission) => {
  return mission.status === 'COMPLETED' || mission.status === 'APPROVED'
}

const getMissionScore = (mission) => {
  if (userStore.isCrew && mission.crewEvaluations) {
    const e = mission.crewEvaluations.find(ce => ce.crewId === userStore.currentUser.id)
    if (e && e.score > 0) return e.score
  }
  return mission.averageScore || (isMissionCompleted(mission) ? 92 : 0)
}

const selectMissionNode = (mission) => {
  selectedNode.value = mission
}
</script>

<style scoped>
@keyframes fluid-stream {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-fluid-stream {
  animation: fluid-stream 2s linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 12s linear infinite;
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}
</style>
