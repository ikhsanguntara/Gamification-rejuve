<template>
  <div class="space-y-6 w-full">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        System Settings & Simulation Controls
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
        Configure prototype environment, simulate role changes, and test gamification triggers.
      </p>
    </div>

    <!-- 1. Role Switcher Card -->
    <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-4">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
        Role Simulation
      </h3>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Switch the active persona to test differing permission sets, navigation layouts, and evaluation privileges.
      </p>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <button
          type="button"
          @click="switchRole('CREW')"
          class="p-4 rounded-xl border text-left transition-all cursor-pointer"
          :class="[
            userStore.isCrew
              ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500'
              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          ]"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base">👤</span>
            <h4 class="text-xs font-semibold text-slate-900 dark:text-white">Crew Role</h4>
          </div>
          <p class="text-xs text-slate-500">Andi Pratama • View missions, progress, stars, leaderboard, & achievements.</p>
        </button>

        <button
          type="button"
          @click="switchRole('SUPERVISOR')"
          class="p-4 rounded-xl border text-left transition-all cursor-pointer"
          :class="[
            userStore.isSupervisor
              ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500'
              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          ]"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base">📋</span>
            <h4 class="text-xs font-semibold text-slate-900 dark:text-white">Supervisor Role</h4>
          </div>
          <p class="text-xs text-slate-500">Budi Santoso • Input scores, evidence, comments, draft & submit for review.</p>
        </button>

        <button
          type="button"
          @click="switchRole('HEAD')"
          class="p-4 rounded-xl border text-left transition-all cursor-pointer"
          :class="[
            userStore.isHead
              ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500'
              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          ]"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base">🛡️</span>
            <h4 class="text-xs font-semibold text-slate-900 dark:text-white">Head Review Role</h4>
          </div>
          <p class="text-xs text-slate-500">Ahmad Dahlan • Decision review: Approve or Request Revision with note.</p>
        </button>
      </div>
    </div>

    <!-- 2. Theme Preferences -->
    <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-4">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
        Display Theme
      </h3>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Choose your preferred interface theme.
      </p>

      <div class="flex items-center gap-3 pt-1">
        <button
          type="button"
          @click="setTheme('light')"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer"
          :class="theme === 'light' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-800'"
        >
          <Sun class="w-4 h-4" />
          <span>Light Mode</span>
        </button>

        <button
          type="button"
          @click="setTheme('dark')"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer"
          :class="theme === 'dark' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-800'"
        >
          <Moon class="w-4 h-4" />
          <span>Dark Mode</span>
        </button>

        <button
          type="button"
          @click="setTheme('system')"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer"
          :class="theme === 'system' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-800'"
        >
          <Laptop class="w-4 h-4" />
          <span>System Sync</span>
        </button>
      </div>
    </div>

    <!-- 3. Gamification Trigger Testing -->
    <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-4">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
        Interactive Animation & Star Triggers
      </h3>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Manually test star burst particle celebrations and level up transitions.
      </p>

      <div class="flex items-center gap-3 pt-1">
        <button
          type="button"
          @click="testStarBurst"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Star class="w-4 h-4 fill-slate-950" />
          <span>Trigger Star Burst</span>
        </button>

        <button
          type="button"
          @click="testLevelUp"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Trophy class="w-4 h-4" />
          <span>Trigger Level Up Celebration</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user.js'
import { useTheme } from '~/composables/useTheme.js'
import { useToast } from '~/composables/useToast.js'
import { useConfetti } from '~/composables/useConfetti.js'
import {
  Sun,
  Moon,
  Laptop,
  Star,
  Trophy
} from 'lucide-vue-next'

const userStore = useUserStore()
const { theme, setTheme } = useTheme()
const toast = useToast()
const confetti = useConfetti()

const switchRole = (role) => {
  userStore.switchRole(role)
  toast.info('Role Changed', `Switched active role to ${userStore.currentUser.roleTitle}`)
}

const testStarBurst = () => {
  confetti.triggerStarBurst()
  toast.star('⭐ +5 Stars Awarded!', 'Star celebration animation test triggered successfully.')
}

const testLevelUp = () => {
  confetti.triggerLevelUp()
  toast.star('🎉 Level Up Celebration!', 'Level up fanfare and particle stream test triggered.')
}
</script>
