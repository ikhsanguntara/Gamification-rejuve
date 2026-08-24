<template>
  <div
    class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 card-hover flex flex-col justify-between transition-all"
    :class="[
      mission.status === 'REVISION_REQUIRED'
        ? 'border-rose-300 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/10'
        : ''
    ]"
  >
    <!-- Top Row: Category & Status Badge -->
    <div>
      <div class="flex items-center justify-between gap-2 mb-3">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#963189]/10 text-[#963189] dark:text-[#db92d7] tracking-wide uppercase">
          {{ mission.category || 'Quality SOP' }}
        </span>
        <MissionStatus :status="mission.status" />
      </div>

      <!-- Title & Code -->
      <NuxtLink
        :to="`/missions/${mission.id}`"
        class="block group"
      >
        <p class="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1">
          {{ mission.code }} • Week {{ mission.week }}
        </p>
        <h4 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#499ec7] dark:group-hover:text-[#84cded] transition-colors line-clamp-2">
          {{ mission.title }}
        </h4>
      </NuxtLink>

      <!-- Description preview -->
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
        {{ mission.description }}
      </p>
    </div>

    <!-- Middle/Bottom info: Multi-Crew Roster & Personal vs Store Score -->
    <div class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
      <!-- Assigned Multi-Crew Summary -->
      <div class="flex items-center justify-between text-xs">
        <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold">
          <Users class="w-3.5 h-3.5 text-[#499ec7]" />
          <span>{{ assignedCrewList.length }} Store Crew Members</span>
        </div>

        <span class="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1">
          <Calendar class="w-3.5 h-3.5" />
          {{ formatDate(mission.deadline) }}
        </span>
      </div>

      <!-- Score & Star Preview: Personalized for Crew vs Store Aggregate for Non-Crew -->
      <div class="flex items-center justify-between pt-1">
        <!-- CREW Personal Display -->
        <template v-if="userStore.isCrew">
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-slate-500 dark:text-slate-400">Nilai Saya:</span>
            <span
              class="text-xs font-bold"
              :class="myScore > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'"
            >
              {{ myScore > 0 ? `${myScore}/100` : 'Menunggu Penilaian' }}
            </span>
          </div>

          <!-- Personal Stars -->
          <StarReward
            :stars="myStars"
            size="sm"
            :show-label="false"
          />
        </template>

        <!-- SUPERVISOR / HEAD / ADMIN Store Aggregate Display -->
        <template v-else>
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-slate-500 dark:text-slate-400">Avg Score:</span>
            <span
              class="text-xs font-bold"
              :class="mission.averageScore > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'"
            >
              {{ mission.averageScore > 0 ? `${mission.averageScore}/100` : '—' }}
            </span>
          </div>

          <!-- Store Stars -->
          <StarReward
            :stars="mission.awardedStars || mission.calculatedStars || 1"
            size="sm"
            :show-label="false"
          />
        </template>
      </div>

      <!-- Action Button / Link -->
      <div class="pt-2">
        <NuxtLink
          :to="`/missions/${mission.id}`"
          class="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-[#499ec7] hover:text-white dark:hover:bg-[#499ec7] dark:hover:text-white text-slate-700 dark:text-slate-200 transition-all group"
        >
          <span>{{ userStore.isCrew ? 'Lihat Evaluasi & SOP Misi' : 'View Mission Details' }}</span>
          <ChevronRight class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { formatDate } from '~/utils/date.js'
import { calculateStars } from '~/utils/star.js'
import MissionStatus from './MissionStatus.vue'
import StarReward from '~/components/gamification/StarReward.vue'
import {
  Calendar,
  ChevronRight,
  Users
} from 'lucide-vue-next'

const props = defineProps({
  mission: {
    type: Object,
    required: true
  }
})

const userStore = useUserStore()
const gamificationStore = useGamificationStore()

const assignedCrewList = computed(() => {
  if (props.mission.assignedCrewIds && props.mission.assignedCrewIds.length > 0) {
    return props.mission.assignedCrewIds.map(id => gamificationStore.crewById(id)).filter(Boolean)
  }
  return gamificationStore.crewsByBatch(props.mission.batchId)
})

const myEvaluation = computed(() => {
  if (!props.mission.crewEvaluations) return null
  return props.mission.crewEvaluations.find(e => e.crewId === userStore.currentUser.id)
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
</script>
