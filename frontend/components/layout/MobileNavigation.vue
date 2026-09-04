<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 shadow-2xl safe-area-bottom">
    <div class="flex items-center justify-around max-w-md mx-auto">
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-xs font-medium transition-all relative group flex-1"
        :class="[
          $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard')
            ? 'text-[#831843] dark:text-[#f472b6] font-semibold scale-105'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
        ]"
      >
        <div class="relative p-1 rounded-xl transition-colors" :class="[
          $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard')
            ? 'bg-[#831843]/15 dark:bg-[#831843]/20'
            : ''
        ]">
          <component :is="item.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
          
          <!-- Notification badge -->
          <span
            v-if="item.hasBadge"
            class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"
          ></span>
        </div>
        <span class="mt-0.5 tracking-tight truncate max-w-[64px]">{{ item.label }}</span>
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
  Compass,
  MessageSquareText
} from 'lucide-vue-next'

const userStore = useUserStore()
const approvalStore = useApprovalStore()
const missionStore = useMissionStore()

const navItems = computed(() => {
  const role = userStore.currentRole

  if (role === 'SUPERADMIN') {
    return [
      { label: 'Admin', path: '/admin', icon: Sliders },
      { label: 'Beranda', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Batch', path: '/batches', icon: Layers },
      { label: 'Misi', path: '/missions', icon: Target },
      {
        label: 'Approval',
        path: '/approvals',
        icon: ShieldCheck,
        hasBadge: approvalStore.pendingApprovals.length > 0
      }
    ]
  }

  if (role === 'CREW') {
    return [
      { label: 'Petualangan', path: '/journey', icon: Compass },
      { label: 'Misi', path: '/missions', icon: Target },
      { label: 'Survei', path: '/feedback', icon: MessageSquareText },
      { label: 'Peringkat', path: '/leaderboard', icon: Medal },
      { label: 'Profil', path: '/profile', icon: User }
    ]
  }

  if (role === 'STORE_LEADER' || role === 'SUPERVISOR' || role === 'SL') {
    return [
      { label: 'Beranda', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Batch', path: '/batches', icon: Layers },
      {
        label: 'Penilaian',
        path: '/evaluations',
        icon: ClipboardCheck,
        hasBadge: missionStore.revisionCount > 0
      },
      { label: 'Misi', path: '/missions', icon: Target },
      { label: 'Peringkat', path: '/leaderboard', icon: Medal }
    ]
  }

  // DISTRICT_MANAGER / HEAD
  return [
    { label: 'Beranda', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batch', path: '/batches', icon: Layers },
    {
      label: 'Approval',
      path: '/approvals',
      icon: ShieldCheck,
      hasBadge: approvalStore.pendingApprovals.length > 0
    },
    { label: 'Peringkat', path: '/leaderboard', icon: Medal },
    { label: 'Lencana', path: '/achievements', icon: Trophy }
  ]
})
</script>
