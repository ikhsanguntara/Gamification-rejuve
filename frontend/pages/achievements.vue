<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {{ userStore.isCrew ? 'Lencana Prestasi & Pencapaian Saya' : 'Katalog Standar Lencana & Prestasi Gerai' }}
          </h2>
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-md uppercase"
            :class="userStore.isCrew ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
          >
            {{ userStore.isCrew ? 'Profil Kru: ' + userStore.currentUser.name : 'Standar Utama' }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <span v-if="userStore.isCrew">
            Lencana prestasi yang berhasil Anda raih melalui misi operasional gerai yang telah disetujui.
          </span>
          <span v-else>
            Standar pencapaian dan lencana prestasi yang dapat diraih oleh seluruh anggota Crew gerai.
          </span>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
          {{ unlockedCount }} / {{ gamificationStore.allAchievements.length }} Lencana Terbuka
        </span>
      </div>
    </div>

    <!-- Category Filter Tabs via Reka UI -->
    <TabsRoot v-model="selectedCategory" class="w-full space-y-6">
      <TabsList class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit max-w-full overflow-x-auto">
        <TabsTrigger
          v-for="cat in categoryTabs"
          :key="cat.key"
          :value="cat.key"
          class="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
        >
          {{ cat.label }}
        </TabsTrigger>
      </TabsList>

      <TabsContent
        v-for="cat in categoryTabs"
        :key="cat.key"
        :value="cat.key"
        class="focus:outline-hidden space-y-4"
      >
        <!-- Achievements Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          <AchievementCard
            v-for="ach in paginatedAchievements"
            :key="ach.id"
            :achievement="ach"
          />
        </div>

        <AppPagination
          v-if="filteredAchievements.length > 0"
          v-model:current-page="currentPage"
          :total-items="filteredAchievements.length"
          :items-per-page="itemsPerPage"
          item-label="lencana"
        />
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent
} from 'reka-ui'
import { useUserStore } from '~/stores/user.js'
import { useGamificationStore } from '~/stores/gamification.js'
import AchievementCard from '~/components/gamification/AchievementCard.vue'
import AppPagination from '~/components/ui/AppPagination.vue'

const userStore = useUserStore()
const gamificationStore = useGamificationStore()

const selectedCategory = ref('ALL')
const categoryTabs = [
  { key: 'ALL', label: 'Semua Lencana' },
  { key: 'Missions', label: 'Misi' },
  { key: 'Excellence', label: 'Kualitas SOP' },
  { key: 'Consistency', label: 'Konsistensi' },
  { key: 'Progression', label: 'Progresi' },
  { key: 'Safety', label: 'Keselamatan' },
  { key: 'Ranking', label: 'Peringkat' }
]

const currentPage = ref(1)
const itemsPerPage = 9

const unlockedCount = computed(() => gamificationStore.unlockedAchievements.length)

const filteredAchievements = computed(() => {
  if (selectedCategory.value === 'ALL') return gamificationStore.allAchievements
  return gamificationStore.allAchievements.filter(a => a.category === selectedCategory.value)
})

watch(selectedCategory, () => {
  currentPage.value = 1
})

const paginatedAchievements = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredAchievements.value.slice(start, start + itemsPerPage)
})
</script>
