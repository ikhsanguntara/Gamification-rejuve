<template>
  <div class="space-y-6">
    <!-- Top Greeting & Context Hero -->
    <div class="rounded-3xl bg-gradient-to-r from-[#4a0e28] via-[#6b133a] to-[#831843] text-white p-5 sm:p-8 relative overflow-hidden shadow-xl border border-white/10">
      <!-- Glow decoration -->
      <div class="absolute -right-10 -top-10 w-60 h-60 bg-[#be185d]/25 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute right-1/4 -bottom-10 w-48 h-48 bg-[#9d174d]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-2.5 sm:mb-3 border border-white/15">
            <Star class="w-3.5 h-3.5 fill-amber-300" />
            <span class="truncate max-w-[160px] sm:max-w-none">{{ batchStore.currentBatch.name }}</span>
            <span>•</span>
            <span>Week {{ batchStore.selectedWeek }}/3</span>
          </div>

          <h2 class="text-xl sm:text-3xl font-bold tracking-tight">
            {{ greetingText }}, {{ userStore.currentUser.name.split(' ')[0] }}! 🥤
          </h2>
          <p class="text-slate-200 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            <span v-if="userStore.isCrew">
              Re.juve Specialist • Saat ini berada di <strong class="text-amber-300 font-semibold">Level {{ myProgress.currentLevel }} ({{ myProgress.currentLevelTitle }})</strong> dengan <strong class="font-semibold">{{ myStars.toLocaleString() }} ⭐ Stars</strong>. Terus selesaikan seluruh misi di {{ batchStore.currentBatch.name }}!
            </span>
            <span v-else-if="userStore.isSupervisor">
              Area Supervisor • Week {{ batchStore.selectedWeek }} aktif dinilai. Terdapat <strong class="text-amber-300 font-semibold">{{ pendingReviewCount }} misi diajukan</strong> dan <strong class="text-rose-300 font-semibold">{{ missionStore.revisionCount }} revisi</strong>.
            </span>
            <span v-else-if="userStore.isHead">
              Head of Operations & Quality • <strong class="text-amber-300 font-semibold">{{ approvalStore.pendingApprovals.length }} evaluasi Batch</strong> menunggu keputusan (Approve / Revise).
            </span>
            <span v-else>
              System Superadmin • Master Control Console aktif untuk seluruh Batch Re.juve.
            </span>
          </p>
        </div>

        <!-- Quick Context CTA -->
        <div class="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <NuxtLink
            v-if="userStore.isSupervisor"
            to="/evaluations"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#831843]/30 transition-all active:scale-95 border border-white/20"
          >
            <ClipboardCheck class="w-4 h-4" />
            <span>Evaluate Store Missions</span>
          </NuxtLink>

          <NuxtLink
            v-else-if="userStore.isHead"
            to="/approvals"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#9d174d]/30 transition-all active:scale-95 border border-white/20"
          >
            <ShieldCheck class="w-4 h-4" />
            <span>Review Approvals ({{ approvalStore.pendingApprovals.length }})</span>
          </NuxtLink>

          <NuxtLink
            v-else-if="userStore.isSuperadmin"
            to="/admin/users"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#9d174d]/30 transition-all active:scale-95 border border-white/20"
          >
            <Settings class="w-4 h-4" />
            <span>Administrator Console</span>
          </NuxtLink>

          <NuxtLink
            v-else
            to="/missions"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#831843]/30 transition-all active:scale-95 border border-white/20"
          >
            <Target class="w-4 h-4" />
            <span>Misi Saya</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 5 Core Dashboard Metric Cards (Personalized for Crew vs Operational for Supervisor/Head) -->
    <div v-if="userStore.isCrew" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <!-- 1. My Total Stars -->
      <StatCard
        title="⭐ Bintang Saya"
        :value="myStars.toLocaleString()"
        unit="Stars"
        :subtext="`Level ${myProgress.currentLevel} ${myProgress.currentLevelTitle}`"
        :icon="Star"
        variant="amber"
      />

      <!-- 2. My Completed Missions -->
      <StatCard
        title="Misi Selesai Saya"
        :value="`${myCompletedCount} / ${myTotalMissions}`"
        :subtext="`${Math.round((myCompletedCount / myTotalMissions) * 100 || 0)}% progres siklus`"
        :icon="CheckCircle2"
        variant="emerald"
        trend="up"
        trendValue="Aktif"
      />

      <!-- 3. My Average Quality Score -->
      <StatCard
        title="Rata-rata Skor Saya"
        :value="`${myAverageScore}%`"
        subtext="Skor evaluasi mutu personal"
        :icon="Award"
        variant="brand"
        trend="up"
        trendValue="Optimal"
      />

      <!-- 4. My Rank in Store -->
      <StatCard
        title="Peringkat di Gerai"
        :value="`#${myRank}`"
        :subtext="`dari ${storeCrewCount} Store Crew`"
        :icon="Trophy"
        variant="brand"
      />

      <!-- 5. Assigned Store Branch -->
      <StatCard
        title="Cabang Penempatan"
        :value="batchStore.currentBatch.name.split('—')[1] || batchStore.currentBatch.name"
        :subtext="`Week ${batchStore.selectedWeek}/3 Aktif`"
        :icon="MapPin"
        variant="slate"
        class="col-span-2 sm:col-span-1"
      />
    </div>

    <!-- 5 Core Dashboard Metric Cards for Non-Crew (Supervisor / Head / Admin) -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <StatCard
        title="Store Crew"
        :value="batchStore.currentBatch.totalCrew"
        unit="Crew"
        subtext="Active in branch"
        :icon="Users"
        variant="brand"
      />

      <StatCard
        title="Missions Completed"
        :value="`${batchStore.currentBatch.completedMissions} / ${batchStore.currentBatch.totalMissions}`"
        :subtext="`${Math.round((batchStore.currentBatch.completedMissions / batchStore.currentBatch.totalMissions) * 100)}% cycle progress`"
        :icon="CheckCircle2"
        variant="emerald"
        trend="up"
        trendValue="+4 this week"
      />

      <StatCard
        title="Average Score"
        :value="`${batchStore.currentBatch.averageScore}%`"
        subtext="Branch benchmark"
        :icon="Award"
        variant="brand"
        trend="up"
        trendValue="+2.1%"
      />

      <StatCard
        title="Pending Review"
        :value="approvalStore.pendingApprovals.length"
        subtext="Awaiting Head decision"
        :icon="Hourglass"
        variant="amber"
      />

      <StatCard
        title="Total Stars"
        :value="batchStore.currentBatch.totalStars.toLocaleString()"
        unit="⭐"
        subtext="Earned across store"
        :icon="Star"
        variant="amber"
        class="col-span-2 sm:col-span-1"
      />
    </div>

    <!-- 🗺️ Interactive Journey Odyssey Banner Widget (Strictly for Crew) -->
    <div
      v-if="userStore.isCrew"
      class="rounded-3xl bg-gradient-to-r from-[#4a0e28] via-[#6b133a] to-[#831843] text-white p-5 sm:p-6 border border-white/10 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <div class="flex items-center gap-4 relative z-10">
        <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-md animate-bounce-gentle">
          <Compass class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm sm:text-base font-semibold tracking-tight">
              Peta Ekspedisi Gamifikasi 3 Minggu (Star Odyssey)
            </h3>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
              INTERAKTIF
            </span>
          </div>
          <p class="text-xs text-slate-200 mt-0.5 max-w-xl">
            Jelajahi alur pipa fluida pos misi Week 1 sampai Week 3. Pantau posisi pin Anda dan kumpulkan seluruh bintang!
          </p>
        </div>
      </div>

      <NuxtLink
        to="/journey"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all active:scale-95 shadow-md flex-shrink-0 cursor-pointer"
      >
        <span>Buka Peta Ekspedisi</span>
        <ChevronRight class="w-4 h-4 text-[#831843]" />
      </NuxtLink>
    </div>

    <!-- Interactive Weekly Progression Stepper -->
    <WeekSelector />

    <!-- Star Gamification & Top Performers Section -->
    <div class="space-y-6">
      <!-- Crew Personal / Highlight Star Level Progression -->
      <StarProgress :stars="myStars" />

      <!-- Top 3 Leaderboard Preview Widget -->
      <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Top Star Performers — {{ batchStore.currentBatch.name.split('—')[1] || batchStore.currentBatch.name }}
            </h3>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Peringkat Crew Cabang Gerai
            </p>
          </div>
          <NuxtLink
            to="/leaderboard"
            class="text-xs font-semibold text-[#831843] dark:text-[#f472b6] hover:underline flex items-center gap-1"
          >
            <span>Lihat Leaderboard Penuh</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <!-- Top 3 Mini Podium List -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            v-for="(crew, index) in branchTopThree"
            :key="crew.crewId || crew.id"
            class="p-4 sm:p-5 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden transition-all"
            :class="[
              (crew.crewId || crew.id) === userStore.currentUser.id
                ? 'border-[#831843] dark:border-[#831843] bg-[#831843]/10 ring-2 ring-[#831843]/30'
                : index === 0
                ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'
            ]"
          >
            <!-- You Indicator Badge -->
            <span
              v-if="(crew.crewId || crew.id) === userStore.currentUser.id"
              class="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#831843] text-white text-xs font-semibold tracking-wider"
            >
              ANDA
            </span>

            <!-- Rank Medal Badge -->
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-2 shadow-sm"
              :class="[
                index === 0 ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-white'
              ]"
            >
              {{ index + 1 }}
            </span>

            <img
              :src="crew.avatar"
              :alt="crew.name"
              class="w-14 h-14 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-md mb-2"
            />

            <h4 class="text-sm font-semibold text-slate-900 dark:text-white truncate w-full">
              {{ crew.name }}
            </h4>
            <span class="text-xs text-slate-400 dark:text-slate-500 truncate w-full">
              {{ crew.position }}
            </span>

            <!-- Stars Counter -->
            <div class="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-semibold text-xs">
              <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{{ (crew.stars || 0).toLocaleString() }} Stars</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useApprovalStore } from '~/stores/approval.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { getStarProgress } from '~/utils/star.js'
import StatCard from '~/components/dashboard/StatCard.vue'
import WeekSelector from '~/components/batch/WeekSelector.vue'
import StarProgress from '~/components/gamification/StarProgress.vue'
import {
  Users,
  CheckCircle2,
  Award,
  Hourglass,
  Star,
  ClipboardCheck,
  ShieldCheck,
  Target,
  Trophy,
  MapPin,
  Settings,
  ChevronRight,
  Compass
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const approvalStore = useApprovalStore()
const gamificationStore = useGamificationStore()

const pendingReviewCount = computed(() => approvalStore.pendingApprovals.length)

// Personal Crew stats
const myCrewData = computed(() => {
  if (userStore.isCrew) {
    const found = gamificationStore.crewById(userStore.currentUser.id)
    return found || userStore.currentUser
  }
  return gamificationStore.allCrews[0]
})

const myStars = computed(() => {
  return myCrewData.value?.stars || userStore.currentUser.stars || 0
})

const myProgress = computed(() => {
  return getStarProgress(myStars.value)
})

const storeCrews = computed(() => {
  return gamificationStore.crewsByBatch(batchStore.selectedBatchId)
})

const storeCrewCount = computed(() => {
  return storeCrews.value.length || 6
})

const branchTopThree = computed(() => {
  const sorted = [...storeCrews.value].sort((a, b) => b.stars - a.stars)
  return sorted.slice(0, 3)
})

const myRank = computed(() => {
  const sorted = [...storeCrews.value].sort((a, b) => b.stars - a.stars)
  const idx = sorted.findIndex(c => (c.crewId || c.id) === userStore.currentUser.id)
  return idx !== -1 ? idx + 1 : 1
})

const myMissions = computed(() => {
  const batchId = userStore.isCrew ? userStore.currentUser.batchId : batchStore.selectedBatchId
  return missionStore.missionsByBatch(batchId)
})

const myTotalMissions = computed(() => {
  return myMissions.value.length || 12
})

const myCompletedCount = computed(() => {
  const crewId = userStore.currentUser.id
  return myMissions.value.filter(m => {
    if (m.crewEvaluations && m.crewEvaluations.length > 0) {
      const e = m.crewEvaluations.find(ce => ce.crewId === crewId)
      return e && (e.status === 'COMPLETED' || m.status === 'COMPLETED')
    }
    return m.status === 'COMPLETED'
  }).length
})

const myAverageScore = computed(() => {
  const crewId = userStore.currentUser.id
  let totalScore = 0
  let evaluatedCount = 0

  myMissions.value.forEach(m => {
    if (m.crewEvaluations && m.crewEvaluations.length > 0) {
      const e = m.crewEvaluations.find(ce => ce.crewId === crewId)
      if (e && e.score > 0) {
        totalScore += e.score
        evaluatedCount++
      }
    } else if (m.averageScore > 0) {
      totalScore += m.averageScore
      evaluatedCount++
    }
  })

  return evaluatedCount > 0 ? (totalScore / evaluatedCount).toFixed(1) : '92.0'
})

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 17) return 'Selamat Siang'
  return 'Selamat Malam'
})
</script>
