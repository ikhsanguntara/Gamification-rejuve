<template>
  <div class="space-y-6">
    <!-- Top Header & Workstation Context -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Workstation Penilaian Kru
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
          <span
            class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            :class="userStore.isDistrictManager ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
          >
            POV: {{ userStore.isDistrictManager ? 'District Manager (DM)' : 'Store Leader (SL)' }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Pilih <strong>Crew</strong> terlebih dahulu, lalu nilai <strong>seluruh misi 1 week</strong> satu per satu untuk kru tersebut.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Week {{ batchStore.selectedWeek }} Aktif</span>
        </span>
      </div>
    </div>

    <!-- 3-Week Progression Selector -->
    <WeekSelector />

    <!-- 2-Column Main Workspace: Crew Selector Sidebar (4 Cols) & Weekly Missions Evaluation for Selected Crew (8 Cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Crew Roster Selector (4 Cols, Sticky) -->
      <div class="lg:col-span-4 space-y-3 lg:sticky lg:top-20">
        <div class="flex items-center justify-between gap-2 px-1">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Users class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
            <span>Daftar Crew Gerai ({{ filteredCrewList.length }})</span>
          </h3>
          <span class="text-xs text-slate-400">Pilih kru untuk menilai</span>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="crewSearchQuery"
            type="text"
            placeholder="Cari nama atau jabatan kru..."
            class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-8 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843] shadow-sm"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Filter Tabs: Semua / Belum Selesai / Sudah Diajukan -->
        <div class="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto text-xs">
          <button
            v-for="tab in crewFilterTabs"
            :key="tab.key"
            type="button"
            @click="activeCrewFilter = tab.key"
            class="px-2.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer text-xs"
            :class="[
              activeCrewFilter === tab.key
                ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Crew Cards List -->
        <div class="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          <div
            v-for="crew in filteredCrewList"
            :key="crew.id"
            @click="selectedCrewId = crew.id"
            class="p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 relative overflow-hidden"
            :class="[
              selectedCrewId === crew.id
                ? 'ring-2 ring-[#831843] bg-[#831843]/5 dark:bg-[#831843]/15 border-[#831843]/60 shadow-md'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
            ]"
          >
            <div class="flex items-center gap-3 min-w-0">
              <img
                :src="crew.avatar"
                :alt="crew.name"
                class="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
              />
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ crew.name }}
                  </h4>
                  <span class="text-xs px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    Lv.{{ crew.level || 1 }}
                  </span>
                </div>
                <p class="text-xs text-slate-400 truncate mt-0.5">
                  {{ crew.position || 'Crew Specialist' }}
                </p>
              </div>
            </div>

            <!-- Crew Week Progress Badge -->
            <div class="text-right flex-shrink-0">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="getCrewWeekBadgeClass(crew.id)"
              >
                {{ getCrewWeekProgressLabel(crew.id) }}
              </span>
              <div class="text-xs text-slate-400 mt-1 flex items-center justify-end gap-1 font-semibold">
                <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{{ getCrewWeekAvgScore(crew.id) }}%</span>
              </div>
            </div>
          </div>

          <div
            v-if="filteredCrewList.length === 0"
            class="py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            Tidak ada crew yang sesuai dengan filter.
          </div>
        </div>
      </div>

      <!-- Right Column: 1 Week All Missions for Selected Crew (8 Cols) -->
      <div class="lg:col-span-8 space-y-6">
        <template v-if="selectedCrew">
          <!-- Active Crew Profile & Week Summary Banner -->
          <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <img
                  :src="selectedCrew.avatar"
                  :alt="selectedCrew.name"
                  class="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#831843]/30 shadow-sm"
                />
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {{ selectedCrew.name }}
                    </h3>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {{ selectedCrew.code || 'CRW-01' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ selectedCrew.position || 'Store Specialist' }} • Cabang {{ batchStore.currentBatch?.name }}
                  </p>
                </div>
              </div>

              <!-- Quick Week KPI Stats Box for this Crew -->
              <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <div class="text-center px-2">
                  <span class="text-xs font-semibold text-slate-400 uppercase">Rata-Rata</span>
                  <p class="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {{ currentCrewWeekAvgScore }}%
                  </p>
                </div>
                <div class="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div class="text-center px-2">
                  <span class="text-xs font-semibold text-slate-400 uppercase">Bintang Week</span>
                  <p class="text-base font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                    <Star class="w-4 h-4 fill-amber-400" />
                    {{ currentCrewWeekTotalStars }}
                  </p>
                </div>
                <div class="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div class="text-center px-2">
                  <span class="text-xs font-semibold text-slate-400 uppercase">Misi Dinilai</span>
                  <p class="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {{ currentCrewEvaluatedMissionsCount }} / {{ currentWeekMissions.length }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Quick Bulk Helpers for this Crew -->
            <div class="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span class="text-slate-500 dark:text-slate-400 font-medium">
                ⚡ Set Cepat Semua Misi Kru Ini (Week {{ batchStore.selectedWeek }}):
              </span>
              <div class="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  @click="applyBulkScoreToCrew(95)"
                  class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-300 font-bold transition-all border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                >
                  95 (⭐⭐⭐⭐⭐)
                </button>
                <button
                  type="button"
                  @click="applyBulkScoreToCrew(90)"
                  class="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-800 dark:text-blue-300 font-bold transition-all border border-blue-200 dark:border-blue-800 cursor-pointer"
                >
                  90 (⭐⭐⭐⭐⭐)
                </button>
                <button
                  type="button"
                  @click="applyBulkScoreToCrew(85)"
                  class="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-600 hover:text-white text-amber-800 dark:text-amber-300 font-bold transition-all border border-amber-200 dark:border-amber-800 cursor-pointer"
                >
                  85 (⭐⭐⭐⭐)
                </button>
              </div>
            </div>
          </div>

          <!-- All 4 Missions in 1 Week (Evaluated 1 by 1) -->
          <div class="space-y-4">
            <div class="flex items-center justify-between px-1">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Target class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
                <span>Misi Operasional Week {{ batchStore.selectedWeek }} ({{ currentWeekMissions.length }} Misi)</span>
              </h3>
              <span class="text-xs text-slate-400">Nilai satu per satu per misi di bawah ini</span>
            </div>

            <!-- Single Mission Evaluation Card (1 per 1) -->
            <div
              v-for="(mission, mIdx) in currentWeekMissions"
              :key="mission.id"
              class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4 transition-all"
              :class="[
                getMissionCardBorderClass(mission.id)
              ]"
            >
              <!-- Mission Title Header & Badge -->
              <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div class="space-y-1 min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {{ mission.code }}
                    </span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                      {{ mission.category }}
                    </span>
                    <MissionStatus :status="mission.status" />
                  </div>
                  <h4 class="text-base font-bold text-slate-900 dark:text-white">
                    {{ mIdx + 1 }}. {{ mission.title }}
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ mission.description }}
                  </p>
                </div>

                <!-- Individual Score Display for this Mission -->
                <div class="p-2.5 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex flex-col items-center justify-center min-w-[140px] text-center">
                  <span class="text-xs font-semibold uppercase text-slate-400">Hasil Bintang</span>
                  <div class="my-0.5">
                    <StarReward
                      :stars="calculateMissionStars(missionScores[mission.id])"
                      size="sm"
                      :show-label="false"
                    />
                  </div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {{ missionScores[mission.id] || 0 }} / 100
                  </span>
                </div>
              </div>

              <!-- Checklist SOP Standar -->
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                <span class="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase text-xs flex items-center gap-1.5">
                  <CheckSquare class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                  <span>Checklist Standar SOP:</span>
                </span>
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-400 text-xs">
                  <li
                    v-for="(req, rIdx) in mission.requirements"
                    :key="rIdx"
                    class="flex items-start gap-2 bg-white dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-[#831843] mt-1.5 flex-shrink-0"></span>
                    <span>{{ req }}</span>
                  </li>
                </ul>
              </div>

              <!-- Input Nilai 1 per 1 dengan Slider & Number Box -->
              <div class="space-y-2 pt-1">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Beri Nilai untuk {{ selectedCrew.name }}:
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="missionScores[mission.id]"
                      type="number"
                      min="0"
                      max="100"
                      class="w-16 text-center text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none py-1.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
                    />
                    <span class="text-xs text-slate-400 font-semibold">/ 100</span>
                  </div>
                </div>

                <!-- Range Slider -->
                <input
                  v-model.number="missionScores[mission.id]"
                  type="range"
                  min="0"
                  max="100"
                  class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#831843]"
                />
                <div class="flex items-center justify-between text-xs text-slate-400 px-0.5">
                  <span>0 (Gagal)</span>
                  <span>50 (⭐ 1)</span>
                  <span>80 (⭐ 4)</span>
                  <span>90 (⭐ 5)</span>
                  <span>100</span>
                </div>
              </div>

              <!-- Catatan & Temuan Lapangan untuk Misi Ini -->
              <div>
                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan & Temuan Evaluator (Opsional):
                </label>
                <textarea
                  v-model="missionComments[mission.id]"
                  rows="2"
                  placeholder="Tuliskan catatan kepatuhan SOP atau saran perbaikan untuk kru pada misi ini..."
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
                ></textarea>
              </div>

              <!-- Action Bar Per-Misi (Nilai 1 Misi & Langsung Ajukan Approval ke DM) -->
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <!-- Status Indikator Misi -->
                <div class="flex items-center gap-2 flex-wrap">
                  <span
                    v-if="getMissionStatus(mission.id) === 'PENDING_REVIEW'"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold"
                  >
                    <Clock class="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>⏳ Menunggu Review DM</span>
                  </span>

                  <span
                    v-else-if="getMissionStatus(mission.id) === 'COMPLETED' || getMissionStatus(mission.id) === 'APPROVED'"
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold"
                  >
                    <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
                    <span>✅ Disetujui DM (Bintang Diberikan)</span>
                  </span>

                  <span v-else class="text-xs text-slate-400 font-medium">
                    ⚡ Misi siap dinilai & diajukan approval
                  </span>
                </div>

                <!-- Tombol Aksi Mandiri Per-Misi -->
                <div class="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                  <button
                    type="button"
                    @click="submitSingleMission(mission.id)"
                    class="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    :class="[
                      getMissionStatus(mission.id) === 'PENDING_REVIEW'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : getMissionStatus(mission.id) === 'COMPLETED'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-[#831843] hover:bg-[#6b133a]'
                    ]"
                  >
                    <Send class="w-3.5 h-3.5" />
                    <span v-if="getMissionStatus(mission.id) === 'PENDING_REVIEW'">Perbarui Nilai di DM</span>
                    <span v-else-if="getMissionStatus(mission.id) === 'COMPLETED'">Update Nilai Disetujui</span>
                    <span v-else>Kirim Misi Ini ke DM</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Floating Action Bar for Selected Crew -->
          <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky bottom-4 z-10">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total 4 Misi:
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                Avg {{ currentCrewWeekAvgScore }}% • {{ currentCrewWeekTotalStars }} Bintang
              </span>
            </div>

            <div class="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                @click="submitCrewEvaluations"
                class="px-5 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Send class="w-3.5 h-3.5" />
                <span>Kirim Nilai {{ selectedCrew.name }} ke DM</span>
              </button>

              <button
                type="button"
                @click="goToNextCrew"
                class="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Kru Berikutnya</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </template>

        <EmptyState
          v-else
          title="Pilih Crew untuk memulai penilaian"
          description="Pilih salah satu anggota Crew di daftar sebelah kiri untuk menampilkan seluruh misi 1 week dan memberikan nilai satu per satu."
          icon="Users"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { useUserStore } from '~/stores/user.js'
import { useApprovalStore } from '~/stores/approval.js'
import { calculateStars } from '~/utils/star.js'
import { useToast } from '~/composables/useToast.js'
import WeekSelector from '~/components/batch/WeekSelector.vue'
import MissionStatus from '~/components/mission/MissionStatus.vue'
import StarReward from '~/components/gamification/StarReward.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import {
  Users,
  Search,
  Star,
  Target,
  CheckSquare,
  Send,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-vue-next'

const route = useRoute()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const evalStore = useEvaluationStore()
const approvalStore = useApprovalStore()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()
const toast = useToast()

const crewSearchQuery = ref('')
const activeCrewFilter = ref('ALL')
const crewFilterTabs = [
  { key: 'ALL', label: 'Semua Kru' },
  { key: 'NEEDS_SCORING', label: 'Belum Dinilai' },
  { key: 'COMPLETED', label: 'Selesai' }
]

const batchCrews = computed(() => {
  return gamificationStore.crewsByBatch(batchStore.currentBatch?.id || 'batch-alpha')
})

const selectedCrewId = ref(null)

const filteredCrewList = computed(() => {
  let list = batchCrews.value

  if (activeCrewFilter.value === 'NEEDS_SCORING') {
    list = list.filter(c => getCrewWeekEvaluatedCount(c.id) < currentWeekMissions.value.length)
  } else if (activeCrewFilter.value === 'COMPLETED') {
    list = list.filter(c => getCrewWeekEvaluatedCount(c.id) >= currentWeekMissions.value.length)
  }

  if (crewSearchQuery.value.trim()) {
    const q = crewSearchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.position && c.position.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    )
  }

  return list
})

const selectedCrew = computed(() => {
  return batchCrews.value.find(c => c.id === selectedCrewId.value) || null
})

const currentWeekMissions = computed(() => {
  return missionStore.missionsByWeek(batchStore.currentBatch?.id || 'batch-alpha', batchStore.selectedWeek)
})

// Mission scores map for selected crew: { [missionId]: score }
const missionScores = reactive({})
const missionComments = reactive({})

// Initialize or reload scores when selected crew or week changes
const loadCrewScores = () => {
  if (!selectedCrew.value) return

  currentWeekMissions.value.forEach(m => {
    // Check if crew score already exists in mission or evaluations
    const crewEval = missionStore.crewEvaluationForMission(m.id, selectedCrew.value.id)
    if (crewEval && crewEval.score > 0) {
      missionScores[m.id] = crewEval.score
    } else if (m.crewScores) {
      const found = m.crewScores.find(cs => cs.crewId === selectedCrew.value.id)
      missionScores[m.id] = found ? found.score : 90
    } else {
      if (missionScores[m.id] === undefined) {
        missionScores[m.id] = 90
      }
    }

    if (missionComments[m.id] === undefined) {
      missionComments[m.id] = ''
    }
  })
}

watch([selectedCrewId, () => batchStore.selectedWeek, () => batchStore.selectedBatchId], () => {
  loadCrewScores()
}, { immediate: true })

onMounted(() => {
  if (batchCrews.value.length > 0) {
    selectedCrewId.value = batchCrews.value[0].id
  }
})

watch(filteredCrewList, (list) => {
  if (list.length > 0 && !list.find(c => c.id === selectedCrewId.value)) {
    selectedCrewId.value = list[0].id
  }
})

// KPI helpers for single crew
const currentCrewWeekAvgScore = computed(() => {
  if (currentWeekMissions.value.length === 0) return 0
  const scores = currentWeekMissions.value.map(m => Number(missionScores[m.id]) || 0)
  const sum = scores.reduce((acc, curr) => acc + curr, 0)
  return Math.round(sum / scores.length)
})

const currentCrewWeekTotalStars = computed(() => {
  return currentWeekMissions.value.reduce((acc, m) => {
    return acc + calculateMissionStars(missionScores[m.id])
  }, 0)
})

const currentCrewEvaluatedMissionsCount = computed(() => {
  return currentWeekMissions.value.filter(m => (Number(missionScores[m.id]) || 0) > 0).length
})

function calculateMissionStars(score) {
  return calculateStars(Number(score) || 0)
}

function getCrewWeekEvaluatedCount(crewId) {
  return currentWeekMissions.value.filter(m => {
    const ce = missionStore.crewEvaluationForMission(m.id, crewId)
    return ce && ce.score > 0
  }).length
}

function getCrewWeekAvgScore(crewId) {
  if (currentWeekMissions.value.length === 0) return 0
  const evals = currentWeekMissions.value.map(m => {
    const ce = missionStore.crewEvaluationForMission(m.id, crewId)
    return ce ? ce.score : (crewId === selectedCrewId.value ? (missionScores[m.id] || 90) : 90)
  })
  const sum = evals.reduce((a, b) => a + b, 0)
  return Math.round(sum / evals.length)
}

function getCrewWeekProgressLabel(crewId) {
  const count = getCrewWeekEvaluatedCount(crewId)
  const total = currentWeekMissions.value.length
  if (count === 0) return 'Belum Dinilai'
  if (count < total) return `${count}/${total} Dinilai`
  return 'Lengkap'
}

function getCrewWeekBadgeClass(crewId) {
  const count = getCrewWeekEvaluatedCount(crewId)
  const total = currentWeekMissions.value.length
  if (count === 0) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  if (count < total) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
}

function getMissionCardBorderClass(missionId) {
  const score = missionScores[missionId]
  if (score >= 90) return 'hover:border-emerald-400 dark:hover:border-emerald-700'
  if (score >= 80) return 'hover:border-amber-400 dark:hover:border-amber-700'
  return 'hover:border-slate-300 dark:hover:border-slate-700'
}

function applyBulkScoreToCrew(score) {
  currentWeekMissions.value.forEach(m => {
    missionScores[m.id] = score
  })
  toast.info('Nilai Massal Kru', `Semua 4 misi untuk ${selectedCrew.value?.name || 'kru'} diatur ke nilai ${score}`)
}

function getMissionStatus(missionId) {
  const mission = missionStore.missionById(missionId)
  if (!mission) return 'UNGRADED'
  if (selectedCrew.value) {
    const ce = missionStore.crewEvaluationForMission(missionId, selectedCrew.value.id)
    if (ce && ce.status) return ce.status
  }
  return mission.status || 'UNGRADED'
}

function submitSingleMission(missionId) {
  if (!selectedCrew.value) return
  const targetMission = currentWeekMissions.value.find(m => m.id === missionId)
  const score = Number(missionScores[missionId]) || 90

  evalStore.submitForReview({
    missionId,
    supervisorId: userStore.currentUserId,
    supervisorName: userStore.currentUser?.name || 'Store Leader',
    crewScores: [{ crewId: selectedCrew.value.id, score }],
    comment: missionComments[missionId] || `Evaluasi misi ${targetMission?.code || ''} untuk ${selectedCrew.value.name}`
  })

  toast.success('Misi Berhasil Dikirim ke DM', `Misi "${targetMission?.title || missionId}" untuk ${selectedCrew.value.name} telah diajukan ke DM untuk persetujuan! 🚀`)
}

function submitCrewEvaluations() {
  if (!selectedCrew.value) return

  currentWeekMissions.value.forEach(m => {
    const score = Number(missionScores[m.id]) || 90
    evalStore.submitForReview({
      missionId: m.id,
      supervisorId: userStore.currentUserId,
      supervisorName: userStore.currentUser.name,
      crewScores: [{ crewId: selectedCrew.value.id, score }],
      comment: missionComments[m.id] || `Evaluasi kinerja kru ${selectedCrew.value.name}`
    })
  })

  toast.success('Evaluasi Berhasil Dikirim', `Seluruh 4 misi untuk ${selectedCrew.value.name} telah dikirim ke District Manager untuk disetujui.`)
}

function goToNextCrew() {
  const currentIndex = filteredCrewList.value.findIndex(c => c.id === selectedCrewId.value)
  if (currentIndex !== -1 && currentIndex + 1 < filteredCrewList.value.length) {
    selectedCrewId.value = filteredCrewList.value[currentIndex + 1].id
  } else if (filteredCrewList.value.length > 0) {
    selectedCrewId.value = filteredCrewList.value[0].id
  }
}
</script>
