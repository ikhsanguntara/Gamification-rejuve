<template>
  <div class="space-y-6">
    <!-- Header & Workstation Context -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Workstation Evaluasi Supervisor
          </h2>
          <span class="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch.name }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Evaluasi misi operasional untuk <strong>seluruh {{ batchCrews.length }} anggota Crew</strong>, lampirkan bukti foto inspeksi, dan kirim ke Head Review.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-black px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Week {{ batchStore.selectedWeek }} Aktif Dinilai</span>
        </span>
      </div>
    </div>

    <!-- 3-Week Progression Selector -->
    <WeekSelector />

    <!-- Store Missions Evaluation Progress KPI Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="p-2 text-center sm:text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Misi Minggu Ini</span>
        <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">
          {{ weeklyMissions.length }} Misi ({{ batchCrews.length }} Crew)
        </p>
      </div>

      <div class="p-2 text-center sm:text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Misi Diajukan</span>
        <p class="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
          <CheckCircle2 class="w-4 h-4" />
          {{ submittedCount }} / {{ weeklyMissions.length }} ({{ completionPercentage }}%)
        </p>
      </div>

      <div class="p-2 text-center sm:text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Belum Dinilai</span>
        <p class="text-lg font-black text-amber-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
          <Clock class="w-4 h-4" />
          {{ pendingScoringCount }} Misi
        </p>
      </div>

      <div class="p-2 text-center sm:text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perlu Revisi</span>
        <p class="text-lg font-black text-rose-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
          <RotateCcw class="w-4 h-4" />
          {{ revisionRequiredCount }} Misi
        </p>
      </div>
    </div>

    <!-- 2 Column Layout: Store Missions Queue (4 cols) & Active Multi-Crew Evaluation Form (8 cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Store Missions Queue (4 cols, Sticky) -->
      <div class="lg:col-span-4 space-y-3 lg:sticky lg:top-20">
        <div class="flex items-center justify-between gap-2 px-1">
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Daftar Misi ({{ filteredMissions.length }})
          </h3>
          <span class="text-[11px] text-slate-400">Pilih misi untuk menilai</span>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto text-xs">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            type="button"
            @click="activeFilter = tab.key"
            class="px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-[11px]"
            :class="[
              activeFilter === tab.key
                ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Mission Search Bar for Large Data handling -->
        <div class="relative">
          <input
            v-model="missionSearchQuery"
            type="text"
            placeholder="Cari judul, kode, atau kategori..."
            class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pl-8 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843] shadow-sm"
          />
          <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Missions List Queue -->
        <div class="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          <div
            v-for="m in filteredMissions"
            :key="m.id"
            @click="selectedMissionId = m.id"
            class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden"
            :class="[
              selectedMissionId === m.id
                ? 'ring-2 ring-[#831843] bg-[#831843]/5 dark:bg-[#831843]/15 border-[#831843]/60 shadow-md'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700',
              m.status === 'REVISION_REQUIRED' ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10' : ''
            ]"
          >
            <!-- Mission Header Info -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 mb-1">
                  <span class="text-[10px] font-black text-slate-500">
                    {{ m.code }}
                  </span>
                  <span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {{ m.category }}
                  </span>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ m.title }}
                </h4>
              </div>

              <MissionStatus :status="m.status" />
            </div>

            <!-- Assigned Crew Preview Row -->
            <div class="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <div class="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Users class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                <span>{{ batchCrews.length }} Crew Anggota</span>
              </div>

              <div class="flex items-center gap-2">
                <span v-if="m.averageScore > 0" class="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  {{ m.averageScore }}%
                </span>
                <StarReward
                  :stars="m.awardedStars || m.calculatedStars || 1"
                  size="sm"
                  :show-label="false"
                />
              </div>
            </div>
          </div>

          <div
            v-if="filteredMissions.length === 0"
            class="py-12 text-center text-slate-400 text-xs bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            Tidak ada misi untuk filter yang dipilih.
          </div>
        </div>
      </div>

      <!-- Right Column: Active Multi-Crew Evaluation Form (8 cols) -->
      <div class="lg:col-span-8">
        <MissionEvaluationForm
          v-if="selectedMission"
          :mission="selectedMission"
          :initial-evaluation="currentEvaluation"
          @saved="handleRefresh"
          @submitted="handleRefresh"
        />

        <EmptyState
          v-else
          title="Pilih misi untuk memulai penilaian"
          description="Pilih salah satu misi dari daftar di sebelah kiri untuk memasukkan nilai seluruh anggota crew dan melampirkan foto bukti."
          icon="ClipboardList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useGamificationStore } from '~/stores/gamification.js'
import WeekSelector from '~/components/batch/WeekSelector.vue'
import MissionEvaluationForm from '~/components/mission/MissionEvaluationForm.vue'
import MissionStatus from '~/components/mission/MissionStatus.vue'
import StarReward from '~/components/gamification/StarReward.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  Users,
  Search
} from 'lucide-vue-next'

const route = useRoute()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const evalStore = useEvaluationStore()
const gamificationStore = useGamificationStore()

const activeFilter = ref('ALL')
const missionSearchQuery = ref('')
const filterTabs = [
  { key: 'ALL', label: 'Semua' },
  { key: 'NEEDS_SCORING', label: 'Belum Dinilai' },
  { key: 'SUBMITTED', label: 'Diajukan' },
  { key: 'REVISION', label: 'Revisi' },
  { key: 'COMPLETED', label: 'Disetujui' }
]

const batchCrews = computed(() => {
  return gamificationStore.crewsByBatch(batchStore.currentBatch.id)
})

const weeklyMissions = computed(() => {
  return missionStore.missionsByWeek(batchStore.currentBatch.id, batchStore.selectedWeek)
})

// KPI Metrics for Weekly Missions
const submittedCount = computed(() => {
  return weeklyMissions.value.filter(m =>
    m.status === 'PENDING_REVIEW' ||
    m.status === 'APPROVED' ||
    m.status === 'COMPLETED'
  ).length
})

const pendingScoringCount = computed(() => {
  return weeklyMissions.value.filter(m =>
    m.status === 'NOT_STARTED' ||
    m.status === 'IN_PROGRESS' ||
    m.status === 'DRAFT'
  ).length
})

const revisionRequiredCount = computed(() => {
  return weeklyMissions.value.filter(m => m.status === 'REVISION_REQUIRED').length
})

const completionPercentage = computed(() => {
  if (weeklyMissions.value.length === 0) return 0
  return Math.round((submittedCount.value / weeklyMissions.value.length) * 100)
})

// Filtered Queue with Search & Status Filtering
const filteredMissions = computed(() => {
  let list = weeklyMissions.value

  if (activeFilter.value === 'NEEDS_SCORING') {
    list = list.filter(m =>
      m.status === 'NOT_STARTED' ||
      m.status === 'IN_PROGRESS' ||
      m.status === 'DRAFT'
    )
  } else if (activeFilter.value === 'SUBMITTED') {
    list = list.filter(m => m.status === 'PENDING_REVIEW')
  } else if (activeFilter.value === 'REVISION') {
    list = list.filter(m => m.status === 'REVISION_REQUIRED')
  } else if (activeFilter.value === 'COMPLETED') {
    list = list.filter(m =>
      m.status === 'APPROVED' || m.status === 'COMPLETED'
    )
  }

  if (missionSearchQuery.value.trim()) {
    const q = missionSearchQuery.value.toLowerCase()
    list = list.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    )
  }

  return list
})

const selectedMissionId = ref(null)

// Auto-select first mission or query param
onMounted(() => {
  if (route.query.missionId) {
    selectedMissionId.value = route.query.missionId
  }
})

watch(filteredMissions, (list) => {
  if (list && list.length > 0) {
    if (!list.find(m => m.id === selectedMissionId.value)) {
      selectedMissionId.value = list[0].id
    }
  } else {
    selectedMissionId.value = null
  }
}, { immediate: true })

const selectedMission = computed(() => {
  return missionStore.missionById(selectedMissionId.value)
})

const currentEvaluation = computed(() => {
  if (!selectedMission.value) return null
  return evalStore.evaluationByMissionId(selectedMission.value.id)
})

const handleRefresh = () => {
  // Triggers reactive computed update
}
</script>
