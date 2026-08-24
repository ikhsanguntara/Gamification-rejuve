<template>
  <div class="space-y-6">
    <!-- Header & Workstation Context -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Supervisor Evaluation Workstation
          </h2>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
            {{ batchStore.currentBatch.name.split('—')[1] || batchStore.currentBatch.name }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Evaluasi misi operasional gerai mingguan untuk <strong>seluruh {{ batchCrews.length }} anggota Crew</strong>, lampirkan bukti foto inspeksi, dan kirim ke Head Review.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          Week {{ batchStore.selectedWeek }} Evaluation Active
        </span>
      </div>
    </div>

    <!-- 3-Week Progression Selector -->
    <WeekSelector />

    <!-- Store Missions Evaluation Progress KPI Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="p-2 text-center sm:text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weekly Store Missions</span>
        <p class="text-lg font-black text-slate-900 dark:text-white mt-0.5">
          {{ weeklyMissions.length }} Missions ({{ batchCrews.length }} Crew)
        </p>
      </div>

      <div class="p-2 text-center sm:text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Missions Submitted</span>
        <p class="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
          <CheckCircle2 class="w-4 h-4" />
          {{ submittedCount }} / {{ weeklyMissions.length }} ({{ completionPercentage }}%)
        </p>
      </div>

      <div class="p-2 text-center sm:text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Scoring</span>
        <p class="text-lg font-black text-amber-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
          <Clock class="w-4 h-4" />
          {{ pendingScoringCount }} Missions
        </p>
      </div>

      <div class="p-2 text-center sm:text-left">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revisions Required</span>
        <p class="text-lg font-black text-rose-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
          <RotateCcw class="w-4 h-4" />
          {{ revisionRequiredCount }} Needs Edit
        </p>
      </div>
    </div>

    <!-- 2 Column Layout: Store Missions Queue & Active Multi-Crew Evaluation Form -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column: Store Missions Queue (5 cols) -->
      <div class="lg:col-span-5 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Weekly Store Missions ({{ filteredMissions.length }})
          </h3>
          <span class="text-[11px] text-slate-400">Click mission to score all crew</span>
        </div>

        <!-- Filter Tabs -->
        <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto text-xs">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            type="button"
            @click="activeFilter = tab.key"
            class="px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-all"
            :class="[
              activeFilter === tab.key
                ? 'bg-white dark:bg-slate-900 text-[#24779f] dark:text-[#84cded] shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Missions List Queue -->
        <div class="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          <div
            v-for="m in filteredMissions"
            :key="m.id"
            @click="selectedMissionId = m.id"
            class="p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden"
            :class="[
              selectedMissionId === m.id
                ? 'ring-2 ring-[#499ec7] bg-[#499ec7]/5 dark:bg-[#499ec7]/15 border-[#499ec7]/60 shadow-md'
                : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700',
              m.status === 'REVISION_REQUIRED' ? 'border-rose-300 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10' : ''
            ]"
          >
            <!-- Mission Header Info -->
            <div class="flex items-start justify-between gap-3 mb-2">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[10px] font-bold text-slate-400">
                    {{ m.code }}
                  </span>
                  <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#963189]/10 text-[#963189] dark:text-[#db92d7]">
                    {{ m.category }}
                  </span>
                </div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ m.title }}
                </h4>
              </div>

              <MissionStatus :status="m.status" />
            </div>

            <!-- Assigned Crew Preview Row -->
            <div class="mt-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
              <div class="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Users class="w-3.5 h-3.5 text-[#499ec7]" />
                <span>Assigned to <strong>{{ batchCrews.length }} Crew</strong></span>
              </div>

              <div class="flex items-center gap-2">
                <span v-if="m.averageScore > 0" class="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                  Avg {{ m.averageScore }}%
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
            No missions match the selected filter for Week {{ batchStore.selectedWeek }}.
          </div>
        </div>
      </div>

      <!-- Right Column: Active Multi-Crew Evaluation Form (7 cols) -->
      <div class="lg:col-span-7">
        <MissionEvaluationForm
          v-if="selectedMission"
          :mission="selectedMission"
          :initial-evaluation="currentEvaluation"
          @saved="handleRefresh"
          @submitted="handleRefresh"
        />

        <EmptyState
          v-else
          title="Select a store mission to evaluate"
          description="Choose any mission from the list on the left to input scores for all crew members, attach evidence photos, and submit for Head Review."
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
  Users
} from 'lucide-vue-next'

const route = useRoute()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const evalStore = useEvaluationStore()
const gamificationStore = useGamificationStore()

const activeFilter = ref('ALL')
const filterTabs = [
  { key: 'ALL', label: 'All Missions' },
  { key: 'NEEDS_SCORING', label: 'Needs Scoring' },
  { key: 'SUBMITTED', label: 'Under Review' },
  { key: 'REVISION', label: 'Revisions' },
  { key: 'COMPLETED', label: 'Approved' }
]

const batchCrews = computed(() => {
  return gamificationStore.crewsByBatch(batchStore.currentBatch.id)
})

const weeklyMissions = computed(() => {
  return missionStore.missionsByWeek(batchStore.currentBatch.id, batchStore.selectedWeek)
})

// KPI Metrics for Weekly Store Missions
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

// Filtered Queue
const filteredMissions = computed(() => {
  if (activeFilter.value === 'NEEDS_SCORING') {
    return weeklyMissions.value.filter(m =>
      m.status === 'NOT_STARTED' ||
      m.status === 'IN_PROGRESS' ||
      m.status === 'DRAFT'
    )
  }
  if (activeFilter.value === 'SUBMITTED') {
    return weeklyMissions.value.filter(m => m.status === 'PENDING_REVIEW')
  }
  if (activeFilter.value === 'REVISION') {
    return weeklyMissions.value.filter(m => m.status === 'REVISION_REQUIRED')
  }
  if (activeFilter.value === 'COMPLETED') {
    return weeklyMissions.value.filter(m =>
      m.status === 'APPROVED' || m.status === 'COMPLETED'
    )
  }
  return weeklyMissions.value
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
