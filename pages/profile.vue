<template>
  <div class="space-y-6">
    <!-- Profile Hero Card -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <img
          :src="userStore.currentUser.avatar"
          :alt="userStore.currentUser.name"
          class="w-24 h-24 rounded-2xl object-cover ring-4 ring-amber-500/30 shadow-lg flex-shrink-0"
        />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <h2 class="text-2xl font-black text-slate-900 dark:text-white">
              {{ userStore.currentUser.name }}
            </h2>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              {{ userStore.currentUser.roleTitle }}
            </span>
          </div>

          <p class="text-xs text-slate-400">
            {{ userStore.currentUser.position }} • {{ userStore.currentUser.department }} • {{ userStore.currentUser.email }}
          </p>

          <!-- Quick Metrics Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Assigned Batch</span>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Batch Alpha</p>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Total Stars Earned</span>
              <p class="text-xs font-black text-amber-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <Star class="w-3.5 h-3.5 fill-amber-400" />
                {{ crewProfile?.stars?.toLocaleString() || '1,850' }}
              </p>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 col-span-2 sm:col-span-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Badges Unlocked</span>
              <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {{ gamificationStore.unlockedAchievements.length }} Unlocked
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Star Level Progression Card -->
    <StarProgress :stars="crewProfile?.stars || 1850" />

    <!-- Unlocked Achievements Showcase -->
    <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Earned Badges & Distinctions ({{ gamificationStore.unlockedAchievements.length }})
        </h3>
        <NuxtLink to="/achievements" class="text-xs font-semibold text-amber-600 hover:underline">
          View All Achievements
        </NuxtLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AchievementCard
          v-for="ach in gamificationStore.unlockedAchievements.slice(0, 6)"
          :key="ach.id"
          :achievement="ach"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useGamificationStore } from '~/stores/gamification.js'
import StarProgress from '~/components/gamification/StarProgress.vue'
import AchievementCard from '~/components/gamification/AchievementCard.vue'
import { Star } from 'lucide-vue-next'

const userStore = useUserStore()
const gamificationStore = useGamificationStore()

const crewProfile = computed(() => {
  return gamificationStore.crewById(userStore.currentUser.id) || gamificationStore.crewById('crew-001')
})
</script>
