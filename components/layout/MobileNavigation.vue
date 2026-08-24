<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 shadow-2xl safe-area-bottom">
    <div class="flex items-center justify-around max-w-md mx-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-[10px] font-bold transition-all relative group flex-1"
        :class="[
          $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard')
            ? 'text-[#24779f] dark:text-[#84cded] scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        ]"
      >
        <div class="relative p-1 rounded-xl transition-colors" :class="[
          $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard')
            ? 'bg-[#499ec7]/15 dark:bg-[#499ec7]/20'
            : ''
        ]">
          <component :is="item.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
          
          <!-- Notification badge -->
          <span
            v-if="item.hasBadge"
            class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"
          ></span>
        </div>
        <span class="mt-0.5 tracking-tight font-extrabold truncate max-w-[64px]">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useApprovalStore } from '~/stores/approval.js'
import { useMissionStore } from '~/stores/mission.js'
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
  Compass
} from 'lucide-vue-next'

const userStore = useUserStore()
const approvalStore = useApprovalStore()
const missionStore = useMissionStore()

const navItems = computed(() => {
  const role = userStore.currentRole

  if (role === 'SUPERADMIN') {
    return [
      { label: 'Admin', path: '/admin', icon: Sliders },
      { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Gerai', path: '/batches', icon: Layers },
      { label: 'Missions', path: '/missions', icon: Target },
      {
        label: 'Approvals',
        path: '/approvals',
        icon: ShieldCheck,
        hasBadge: approvalStore.pendingApprovals.length > 0
      }
    ]
  }

  if (role === 'CREW') {
    return [
      { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Journey', path: '/journey', icon: Compass },
      { label: 'Missions', path: '/missions', icon: Target },
      { label: 'Ranking', path: '/leaderboard', icon: Medal },
      { label: 'Profile', path: '/profile', icon: User }
    ]
  }

  if (role === 'SUPERVISOR') {
    return [
      { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Gerai', path: '/batches', icon: Layers },
      { label: 'Missions', path: '/missions', icon: Target },
      {
        label: 'Evaluate',
        path: '/evaluations',
        icon: ClipboardCheck,
        hasBadge: missionStore.revisionCount > 0
      },
      { label: 'Ranking', path: '/leaderboard', icon: Medal }
    ]
  }

  // HEAD
  return [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Gerai', path: '/batches', icon: Layers },
    {
      label: 'Approvals',
      path: '/approvals',
      icon: ShieldCheck,
      hasBadge: approvalStore.pendingApprovals.length > 0
    },
    { label: 'Ranking', path: '/leaderboard', icon: Medal },
    { label: 'Badges', path: '/achievements', icon: Trophy }
  ]
})
</script>
