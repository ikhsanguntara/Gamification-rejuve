<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {{ userStore.isCrew ? 'My Personal Achievements & Badges' : 'Re.juve Store Milestone & Badge Catalog' }}
          </h2>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-md uppercase"
            :class="userStore.isCrew ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
          >
            {{ userStore.isCrew ? 'Crew Profile: ' + userStore.currentUser.name : 'Master Standards' }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span v-if="userStore.isCrew">
            Lencana prestasi yang berhasil Anda raih melalui misi operasional gerai yang telah diapprove.
          </span>
          <span v-else>
            Standar pencapaian dan lencana prestasi yang dapat diraih oleh seluruh 20 anggota Crew gerai.
          </span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
          {{ unlockedCount }} / {{ gamificationStore.allAchievements.length }} Badges Unlocked
        </span>
      </div>
    </div>

    <!-- Category Filter Tabs via Reka UI -->
    <TabsRoot v-model="selectedCategory" class="w-full space-y-6">
      <TabsList class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit max-w-full overflow-x-auto">
        <TabsTrigger
          v-for="cat in categories"
          :key="cat"
          :value="cat"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
        >
          {{ cat }}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        v-for="cat in categories"
        :key="cat"
        :value="cat"
        class="focus:outline-hidden"
      >
        <!-- Achievements Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          <AchievementCard
            v-for="ach in (cat === 'All Badges' ? gamificationStore.allAchievements : gamificationStore.allAchievements.filter(a => a.category === cat))"
            :key="ach.id"
            :achievement="ach"
          />
        </div>
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent
} from 'reka-ui'
import { useUserStore } from '~/stores/user.js'
import { useGamificationStore } from '~/stores/gamification.js'
import AchievementCard from '~/components/gamification/AchievementCard.vue'

const userStore = useUserStore()
const gamificationStore = useGamificationStore()

const selectedCategory = ref('All Badges')
const categories = ['All Badges', 'Missions', 'Excellence', 'Consistency', 'Progression', 'Safety', 'Ranking']

const unlockedCount = computed(() => gamificationStore.unlockedAchievements.length)

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'All Badges') return gamificationStore.allAchievements
  return gamificationStore.allAchievements.filter(a => a.category === selectedCategory.value)
})
</script>
