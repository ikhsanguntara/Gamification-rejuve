<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Back Button -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/missions" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>{{ userStore.isCrew ? 'Kembali ke Misi Saya' : 'Back to Missions' }}</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">{{ mission?.code || 'Mission Detail' }}</span>
    </div>

    <!-- Error State if Mission Not Found -->
    <div v-if="!mission" class="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Mission not found</p>
      <NuxtLink to="/missions" class="text-xs text-[#499ec7] mt-2 inline-block font-bold">Return to Catalog</NuxtLink>
    </div>

    <template v-else>
      <!-- Hero Header Card -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2.5 mb-2.5">
              <span class="text-xs font-bold text-slate-400">
                {{ mission.code }}
              </span>
              <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#963189]/10 text-[#963189] dark:text-[#db92d7] uppercase tracking-wider">
                {{ mission.category }}
              </span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
                Week {{ mission.week }}
              </span>
              <MissionStatus :status="mission.status" />
            </div>

            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {{ mission.title }}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
              {{ mission.description }}
            </p>
          </div>

          <!-- Star Reward / Score Display Box: Personal for Crew vs Average for Non-Crew -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center justify-center min-w-[220px] text-center">
            <!-- CREW View -->
            <template v-if="userStore.isCrew">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Bintang & Nilai Anda
              </span>
              <div class="my-1.5">
                <StarReward
                  :stars="myStars"
                  size="lg"
                  :show-label="false"
                />
              </div>
              <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
                <span v-if="myScore > 0" class="text-amber-600 dark:text-amber-400">
                  ⭐ {{ myStars }} Stars Diperoleh ({{ myScore }}/100)
                </span>
                <span v-else>
                  Hingga 5 Bintang
                </span>
              </p>
            </template>

            <!-- NON-CREW View -->
            <template v-else>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Average Store Score
              </span>
              <div class="my-1.5">
                <StarReward
                  :stars="mission.awardedStars || mission.calculatedStars || 1"
                  size="lg"
                  :show-label="false"
                />
              </div>
              <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
                <span v-if="mission.awardedStars" class="text-emerald-600 dark:text-emerald-400">
                  ⭐ {{ mission.awardedStars }} Stars Awarded to All Crew
                </span>
                <span v-else-if="mission.calculatedStars" class="text-amber-600 dark:text-amber-400">
                  ⭐ {{ mission.calculatedStars }} Stars (Calculated)
                </span>
                <span v-else>
                  Up to 5 Stars per Crew
                </span>
              </p>
            </template>
          </div>
        </div>
      </div>

      <!-- Main 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2 Cols: Requirements, Evaluation Result & Feedback -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Requirements Checklist -->
          <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Spesifikasi Standar SOP Mutu Misi
            </h3>
            <ul class="space-y-2.5">
              <li
                v-for="(req, idx) in (mission.requirements || ['Pemeriksaan standar operasional prosedur mutu gerai Re.juve.'])"
                :key="idx"
                class="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
              >
                <CheckCircle2 class="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span class="leading-relaxed">{{ req }}</span>
              </li>
            </ul>
          </div>

          <!-- CREW View: Personal Evaluation Result Card -->
          <div v-if="userStore.isCrew" class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Hasil Evaluasi Personal Anda
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  Dinilai oleh {{ evaluation ? evaluation.supervisorName : 'Area Supervisor' }}
                </p>
              </div>
              <span class="text-xs font-black px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {{ myScore > 0 ? `Nilai: ${myScore}/100` : 'Menunggu Penilaian' }}
              </span>
            </div>

            <!-- Personal Performance Highlight Box -->
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <img
                  :src="userStore.currentUser.avatar"
                  :alt="userStore.currentUser.name"
                  class="w-11 h-11 rounded-full object-cover ring-2 ring-[#499ec7]/30"
                />
                <div>
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                    {{ userStore.currentUser.name }}
                  </h4>
                  <p class="text-xs text-slate-400">{{ userStore.currentUser.position }} • {{ batchStore.currentBatch.name }}</p>
                </div>
              </div>

              <div class="text-right">
                <span class="text-xs font-black text-amber-500 block">
                  ⭐ {{ myStars }} Stars Diperoleh
                </span>
                <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  {{ mission.status === 'COMPLETED' ? 'Selesai Terverifikasi' : 'Siklus Berjalan' }}
                </span>
              </div>
            </div>

            <!-- Supervisor Comment for this Mission -->
            <div v-if="evaluation" class="pt-2">
              <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Catatan & Observasi Supervisor
                </p>
                <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{{ evaluation.comment || 'Pemeriksaan operasional cold-chain & sanitasi gerai berjalan sesuai SOP.' }}"
                </p>
              </div>
            </div>

            <!-- Evidence Gallery -->
            <div v-if="evaluation?.evidence?.length" class="pt-2">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Foto Bukti Inspeksi Gerai ({{ evaluation.evidence.length }})
              </p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="(img, idx) in evaluation.evidence"
                  :key="idx"
                  class="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    :src="img.url"
                    :alt="img.caption"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-[10px] text-white font-medium truncate">{{ img.caption }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- NON-CREW View: Multi-Crew Assessment Breakdown -->
          <div v-else class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Store Crew Performance Breakdown ({{ participatingCrews.length }} Members)
                </h3>
                <p class="text-xs text-slate-400 mt-0.5">
                  Evaluated by {{ evaluation ? evaluation.supervisorName : 'Supervisor' }}
                </p>
              </div>
              <span v-if="evaluation?.averageScore" class="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Avg Score: <strong class="text-slate-900 dark:text-white">{{ evaluation.averageScore }}/100</strong>
              </span>
            </div>

            <!-- Crew Scores Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                v-for="c in participatingCrews"
                :key="c.id"
                class="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <img
                    :src="c.avatar"
                    :alt="c.name"
                    class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                  />
                  <div class="min-w-0">
                    <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {{ c.name }}
                    </h4>
                    <p class="text-[10px] text-slate-400 truncate">{{ c.position }}</p>
                  </div>
                </div>

                <div class="text-right flex-shrink-0">
                  <span class="text-xs font-black text-slate-900 dark:text-white block">
                    {{ getCrewScore(c.id) }} / 100
                  </span>
                  <span class="text-[10px] font-bold text-amber-500">
                    ⭐ {{ getCrewStars(c.id) }} Stars
                  </span>
                </div>
              </div>
            </div>

            <!-- Supervisor Comment -->
            <div v-if="evaluation" class="pt-2">
              <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Supervisor Observations & Notes
                </p>
                <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{{ evaluation.comment || 'No comment provided.' }}"
                </p>
              </div>
            </div>

            <!-- Evidence Gallery -->
            <div v-if="evaluation?.evidence?.length" class="pt-2">
              <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Evidence Photos ({{ evaluation.evidence.length }})
              </p>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="(img, idx) in evaluation.evidence"
                  :key="idx"
                  class="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800"
                >
                  <img
                    :src="img.url"
                    :alt="img.caption"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span class="text-[10px] text-white font-medium truncate">{{ img.caption }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Head Review Feedback if Revision or Approved -->
          <div
            v-if="mission.status === 'REVISION_REQUIRED' || mission.status === 'COMPLETED' || mission.status === 'APPROVED'"
            class="rounded-2xl p-5 sm:p-6 border"
            :class="[
              mission.status === 'REVISION_REQUIRED'
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
            ]"
          >
            <div class="flex items-center gap-2 mb-2">
              <RotateCcw v-if="mission.status === 'REVISION_REQUIRED'" class="w-5 h-5 text-rose-500" />
              <CheckCircle2 v-else class="w-5 h-5 text-emerald-500" />
              <h3
                class="text-sm font-bold"
                :class="mission.status === 'REVISION_REQUIRED' ? 'text-rose-900 dark:text-rose-200' : 'text-emerald-900 dark:text-emerald-200'"
              >
                {{ mission.status === 'REVISION_REQUIRED' ? 'Catatan Permintaan Revisi' : 'Keputusan Head: Approved & Bintang Didistribusikan' }}
              </h3>
            </div>

            <p
              v-if="latestRevisionNote"
              class="text-xs leading-relaxed mt-1"
              :class="mission.status === 'REVISION_REQUIRED' ? 'text-rose-800 dark:text-rose-300' : 'text-emerald-800 dark:text-emerald-300'"
            >
              <strong>Catatan:</strong> "{{ latestRevisionNote }}"
            </p>
          </div>
        </div>

        <!-- Right 1 Col: Assigned Batch & Audit Timeline -->
        <div class="space-y-6">
          <!-- Batch Branch Info -->
          <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Penugasan Gerai
            </h3>

            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#499ec7]/10 flex items-center justify-center text-[#499ec7]">
                <Users class="w-5 h-5" />
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ batchStore.currentBatch.name }}
                </h4>
                <p class="text-[11px] text-slate-400">
                  {{ participatingCrews.length }} Active Store Crew Members
                </p>
              </div>
            </div>
          </div>

          <!-- Mission Audit Timeline -->
          <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Audit Lifecycle Trail
            </h3>
            <MissionTimeline
              :mission="mission"
              :evaluation="evaluation"
              crew-name="All Store Crew Members"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { calculateStars } from '~/utils/star.js'
import MissionStatus from '~/components/mission/MissionStatus.vue'
import StarReward from '~/components/gamification/StarReward.vue'
import MissionTimeline from '~/components/mission/MissionTimeline.vue'
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Users
} from 'lucide-vue-next'

const route = useRoute()
const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const evalStore = useEvaluationStore()
const gamificationStore = useGamificationStore()

const mission = computed(() => {
  return missionStore.missionById(route.params.id)
})

const evaluation = computed(() => {
  if (!mission.value) return null
  return evalStore.evaluationByMissionId(mission.value.id)
})

const participatingCrews = computed(() => {
  if (!mission.value) return []
  return gamificationStore.crewsByBatch(mission.value.batchId || batchStore.selectedBatchId)
})

const myEvaluation = computed(() => {
  if (!mission.value?.crewEvaluations) return null
  return mission.value.crewEvaluations.find(e => e.crewId === userStore.currentUser.id)
})

const myScore = computed(() => {
  if (myEvaluation.value && myEvaluation.value.score > 0) {
    return myEvaluation.value.score
  }
  return 0
})

const myStars = computed(() => {
  if (myEvaluation.value && (myEvaluation.value.awardedStars || myEvaluation.value.calculatedStars)) {
    return myEvaluation.value.awardedStars || myEvaluation.value.calculatedStars
  }
  if (myScore.value > 0) {
    return calculateStars(myScore.value)
  }
  return 1
})

const getCrewScore = (crewId) => {
  if (evaluation.value?.crewScores) {
    const cs = evaluation.value.crewScores.find(e => e.crewId === crewId)
    if (cs) return cs.score
  }
  if (mission.value?.crewEvaluations) {
    const ce = mission.value.crewEvaluations.find(e => e.crewId === crewId)
    if (ce) return ce.score
  }
  return mission.value?.averageScore || 85
}

const getCrewStars = (crewId) => {
  const score = getCrewScore(crewId)
  return calculateStars(score)
}

const latestRevisionNote = computed(() => {
  if (!evaluation.value?.revisionHistory?.length) return null
  return evaluation.value.revisionHistory[evaluation.value.revisionHistory.length - 1].note
})
</script>
