<template>
  <div class="space-y-6">
    <!-- Top Greeting & Context Hero -->
    <div class="rounded-3xl bg-gradient-to-r from-[#1a4257] via-[#24779f] to-[#491b41] text-white p-5 sm:p-8 relative overflow-hidden shadow-xl border border-white/10">
      <!-- Glow decoration -->
      <div class="absolute -right-10 -top-10 w-60 h-60 bg-[#499ec7]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute right-1/4 -bottom-10 w-48 h-48 bg-[#963189]/25 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-[11px] sm:text-xs font-semibold mb-2.5 sm:mb-3 border border-white/15">
            <Star class="w-3.5 h-3.5 fill-amber-300" />
            <span class="truncate max-w-[160px] sm:max-w-none">{{ batchStore.currentBatch.name }}</span>
            <span>•</span>
            <span>Week {{ batchStore.selectedWeek }}/3</span>
          </div>

          <h2 class="text-xl sm:text-3xl font-black tracking-tight">
            {{ greetingText }}, {{ userStore.currentUser.name.split(' ')[0] }}! 🥤
          </h2>
          <p class="text-slate-200 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            <span v-if="userStore.isCrew">
              Re.juve Store Specialist • Saat ini berada di <strong class="text-amber-300">Level 8</strong> dengan <strong>1.850 Stars</strong>. Terus jaga standar cold-chain & kebersihan gerai!
            </span>
            <span v-else-if="userStore.isSupervisor">
              Area Store Supervisor • Week {{ batchStore.selectedWeek }} aktif dinilai. Terdapat <strong class="text-amber-300">{{ pendingReviewCount }} misi diajukan</strong> dan <strong class="text-rose-300">{{ missionStore.revisionCount }} revisi</strong>.
            </span>
            <span v-else>
              Head of Operations & Quality • <strong class="text-amber-300">{{ approvalStore.pendingApprovals.length }} evaluasi gerai</strong> menunggu keputusan (Approve / Revise).
            </span>
          </p>
        </div>

        <!-- Quick Context CTA -->
        <div class="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <NuxtLink
            v-if="userStore.isSupervisor"
            to="/evaluations"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#499ec7] to-[#24779f] hover:from-[#24779f] hover:to-[#1d5e7f] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#499ec7]/30 transition-all active:scale-95 border border-white/20"
          >
            <ClipboardCheck class="w-4 h-4" />
            <span>Evaluate Store Missions</span>
          </NuxtLink>

          <NuxtLink
            v-else-if="userStore.isHead"
            to="/approvals"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#963189] to-[#812474] hover:from-[#812474] hover:to-[#6a1d5f] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#963189]/30 transition-all active:scale-95 border border-white/20"
          >
            <ShieldCheck class="w-4 h-4" />
            <span>Review Approvals ({{ approvalStore.pendingApprovals.length }})</span>
          </NuxtLink>

          <NuxtLink
            v-else
            to="/missions"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#499ec7] to-[#24779f] hover:from-[#24779f] hover:to-[#1d5e7f] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-[#499ec7]/30 transition-all active:scale-95 border border-white/20"
          >
            <Target class="w-4 h-4" />
            <span>Explore Missions</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 5 Core Dashboard Metric Cards (Responsive Grid) -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <StatCard
        title="Store Crew"
        :value="batchStore.currentBatch.totalCrew"
        unit="Crew"
        subtext="Active in branch"
        :icon="Users"
        variant="blue"
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
        variant="purple"
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

    <!-- Interactive Weekly Progression Stepper -->
    <WeekSelector />

    <!-- 2 Column Layout: Star Gamification & Leaderboard + Feed -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Gamification & Top Performers -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Crew Personal / Highlight Star Level Progression -->
        <StarProgress :stars="gamificationStore.allCrews[0].stars" />

        <!-- Top 3 Leaderboard Preview Widget -->
        <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Top Star Performers
              </h3>
              <p class="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Current Store Standings
              </p>
            </div>
            <NuxtLink
              to="/leaderboard"
              class="text-xs font-bold text-[#499ec7] dark:text-[#84cded] hover:underline flex items-center gap-1"
            >
              <span>View Leaderboard</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>

          <!-- Top 3 Mini Podium List -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              v-for="(crew, index) in gamificationStore.topThree"
              :key="crew.crewId"
              class="p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden transition-all"
              :class="[
                index === 0
                  ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'
              ]"
            >
              <!-- Rank Medal Badge -->
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-2 shadow-sm"
                :class="[
                  index === 0 ? 'bg-amber-400 text-amber-950' : index === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-white'
                ]"
              >
                {{ index + 1 }}
              </span>

              <img
                :src="crew.avatar"
                :alt="crew.name"
                class="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-md mb-2"
              />

              <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate w-full">
                {{ crew.name }}
              </h4>
              <span class="text-[11px] text-slate-400 dark:text-slate-500 truncate w-full">
                {{ crew.position }}
              </span>

              <!-- Stars Counter -->
              <div class="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
                <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{{ crew.stars.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Recent Activity Stream -->
      <div class="space-y-6">
        <RecentActivity />
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
import StatCard from '~/components/dashboard/StatCard.vue'
import WeekSelector from '~/components/batch/WeekSelector.vue'
import StarProgress from '~/components/gamification/StarProgress.vue'
import RecentActivity from '~/components/dashboard/RecentActivity.vue'
import {
  Users,
  CheckCircle2,
  Award,
  Hourglass,
  Star,
  ClipboardCheck,
  ShieldCheck,
  Target,
  ChevronRight
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const approvalStore = useApprovalStore()
const gamificationStore = useGamificationStore()

const pendingReviewCount = computed(() => approvalStore.pendingApprovals.length)

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 17) return 'Selamat Siang'
  return 'Selamat Malam'
})
</script>
