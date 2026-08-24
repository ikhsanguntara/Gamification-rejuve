<template>
  <aside class="hidden lg:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 transition-all">
    <!-- Brand Logo & App Name -->
    <div class="h-16 flex items-center px-6 gap-3 border-b border-slate-100 dark:border-slate-800/80">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-[#499ec7] to-[#24779f] flex items-center justify-center text-white shadow-md shadow-[#499ec7]/20">
        <Sparkles class="w-5 h-5 text-white" />
      </div>
      <div>
        <div class="flex items-center gap-1.5">
          <h1 class="font-black text-base text-slate-900 dark:text-white leading-tight">
            Re.juve
          </h1>
          <span class="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#963189]/10 text-[#963189] dark:text-[#db92d7]">
            PRO
          </span>
        </div>
        <p class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          True Cold-Pressed
        </p>
      </div>
    </div>

    <!-- Active Role Indicator Badge -->
    <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Current Persona
        </span>
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-md"
          :class="roleBadgeStyle"
        >
          {{ userStore.currentUser.roleTitle }}
        </span>
      </div>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group"
        :class="[
          $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard')
            ? 'bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded] font-bold shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
        ]"
      >
        <component
          :is="item.icon"
          class="w-5 h-5 flex-shrink-0 transition-colors"
          :class="[
            $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard')
              ? 'text-[#499ec7] dark:text-[#84cded]'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          ]"
        />
        <span>{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
          :class="item.badgeStyle || 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'"
        >
          {{ item.badge }}
        </span>
      </NuxtLink>
    </nav>

    <!-- Active Batch & Week Mini Widget -->
    <div class="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
          {{ batchStore.currentBatch.name.split('—')[1] || batchStore.currentBatch.name.split('-')[0].trim() }}
        </span>
        <span class="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Week {{ batchStore.selectedWeek }} Active
        </span>
      </div>
      <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div
          class="bg-[#499ec7] h-full rounded-full transition-all duration-500"
          :style="{ width: `${batchStore.currentBatch.weeks[batchStore.selectedWeek - 1]?.completionRate || 65}%` }"
        ></div>
      </div>
      <div class="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
        <span>Cycle Progress</span>
        <span>{{ batchStore.currentBatch.weeks[batchStore.selectedWeek - 1]?.completionRate || 65 }}%</span>
      </div>
    </div>

    <!-- Bottom User Section -->
    <div class="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
      <img
        :src="userStore.currentUser.avatar"
        :alt="userStore.currentUser.name"
        class="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {{ userStore.currentUser.name }}
        </p>
        <p class="text-xs text-slate-400 dark:text-slate-500 truncate">
          {{ userStore.currentUser.position }}
        </p>
      </div>
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/settings"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Settings & Simulation Controls"
        >
          <Settings class="w-4 h-4" />
        </NuxtLink>
        <button
          type="button"
          @click="handleLogout"
          class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          title="Sign Out"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useApprovalStore } from '~/stores/approval.js'
import { useMissionStore } from '~/stores/mission.js'
import { useToast } from '~/composables/useToast.js'
import {
  LayoutDashboard,
  Layers,
  Target,
  ClipboardCheck,
  ShieldCheck,
  Sliders,
  Medal,
  Trophy,
  User,
  Settings,
  Sparkles,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const approvalStore = useApprovalStore()
const missionStore = useMissionStore()
const toast = useToast()

const handleLogout = () => {
  userStore.logout()
  toast.info('Logged Out', 'You have been signed out.')
  router.push('/login')
}

const roleBadgeStyle = computed(() => {
  switch (userStore.currentRole) {
    case 'CREW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    case 'SUPERVISOR':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    case 'HEAD':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    case 'SUPERADMIN':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
  }
})

const navItems = computed(() => {
  const role = userStore.currentRole

  if (role === 'SUPERADMIN') {
    return [
      { label: 'Master Admin', path: '/admin', icon: Sliders },
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Cabang Gerai', path: '/batches', icon: Layers },
      { label: 'Missions', path: '/missions', icon: Target },
      {
        label: 'Evaluations',
        path: '/evaluations',
        icon: ClipboardCheck,
        badge: missionStore.revisionCount > 0 ? `${missionStore.revisionCount} Rev` : null,
        badgeStyle: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      },
      {
        label: 'Approvals',
        path: '/approvals',
        icon: ShieldCheck,
        badge: approvalStore.pendingApprovals.length > 0 ? `${approvalStore.pendingApprovals.length}` : null,
        badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      },
      { label: 'Leaderboard', path: '/leaderboard', icon: Medal },
      { label: 'Achievements', path: '/achievements', icon: Trophy }
    ]
  }

  if (role === 'CREW') {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Missions', path: '/missions', icon: Target },
      { label: 'Leaderboard', path: '/leaderboard', icon: Medal },
      { label: 'Achievements', path: '/achievements', icon: Trophy },
      { label: 'My Profile', path: '/profile', icon: User }
    ]
  }

  if (role === 'SUPERVISOR') {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Cabang Gerai', path: '/batches', icon: Layers },
      { label: 'Missions', path: '/missions', icon: Target },
      {
        label: 'Evaluations',
        path: '/evaluations',
        icon: ClipboardCheck,
        badge: missionStore.revisionCount > 0 ? `${missionStore.revisionCount} Rev` : null,
        badgeStyle: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      },
      { label: 'Leaderboard', path: '/leaderboard', icon: Medal },
      { label: 'Achievements', path: '/achievements', icon: Trophy }
    ]
  }

  // HEAD Role
  return [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Cabang Gerai', path: '/batches', icon: Layers },
    {
      label: 'Approvals',
      path: '/approvals',
      icon: ShieldCheck,
      badge: approvalStore.pendingApprovals.length > 0 ? `${approvalStore.pendingApprovals.length}` : null,
      badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    },
    { label: 'Leaderboard', path: '/leaderboard', icon: Medal },
    { label: 'Achievements', path: '/achievements', icon: Trophy }
  ]
})
</script>
