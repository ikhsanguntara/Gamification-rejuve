<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Store Mission Catalog
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Standard operational store assignments, audit criteria, and star milestones.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-3 py-1 rounded-full bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
          {{ filteredMissions.length }} Missions Listed
        </span>
      </div>
    </div>

    <!-- Filter & Search Toolbar (Responsive Grid) -->
    <div class="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-sm">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <!-- Search Input -->
        <div class="relative">
          <input
            v-model="search"
            type="text"
            placeholder="Search mission title or code..."
            class="w-full text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#499ec7]"
          />
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Week Selector Filter -->
        <div class="relative">
          <select
            v-model="selectedWeekFilter"
            class="w-full appearance-none bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-[#499ec7] cursor-pointer"
          >
            <option value="ALL">All Weeks (1, 2, 3)</option>
            <option value="1">Week 1 (Completed)</option>
            <option value="2">Week 2 (Active Cycle)</option>
            <option value="3">Week 3 (Locked)</option>
          </select>
          <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <!-- Status Filter -->
        <div class="relative">
          <select
            v-model="selectedStatusFilter"
            class="w-full appearance-none bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-[#499ec7] cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="REVISION_REQUIRED">Revision Required</option>
            <option value="COMPLETED">Completed / Approved</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DRAFT">Draft</option>
            <option value="LOCKED">Locked</option>
          </select>
          <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <!-- Category Filter -->
        <div class="relative">
          <select
            v-model="selectedCategoryFilter"
            class="w-full appearance-none bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-[#499ec7] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Cold Chain">Cold Chain</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Service">Service</option>
            <option value="Compliance">Compliance</option>
            <option value="Logistics">Logistics</option>
          </select>
          <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>

    <!-- Mission Cards Grid (Responsive 1 col on mobile, 2 on tablet, 3 on desktop) -->
    <div
      v-if="filteredMissions.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
    >
      <MissionCard
        v-for="mission in filteredMissions"
        :key="mission.id"
        :mission="mission"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      title="No missions match your filter criteria"
      description="Try clearing search keywords or choosing a different week or status filter."
      icon="Search"
    >
      <template #action>
        <button
          type="button"
          @click="resetFilters"
          class="px-4 py-2 text-xs font-bold rounded-xl bg-[#499ec7] text-white hover:bg-[#24779f] transition-colors"
        >
          Reset All Filters
        </button>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useMissionStore } from '~/stores/mission.js'
import MissionCard from '~/components/mission/MissionCard.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import { Search, ChevronDown } from 'lucide-vue-next'

const missionStore = useMissionStore()

const search = ref('')
const selectedWeekFilter = ref('ALL')
const selectedStatusFilter = ref('ALL')
const selectedCategoryFilter = ref('ALL')

const filteredMissions = computed(() => {
  return missionStore.allMissions.filter(m => {
    // Search
    if (search.value) {
      const q = search.value.toLowerCase().trim()
      const matchTitle = m.title.toLowerCase().includes(q)
      const matchCode = m.code.toLowerCase().includes(q)
      if (!matchTitle && !matchCode) return false
    }

    // Week
    if (selectedWeekFilter.value !== 'ALL') {
      if (m.week !== Number(selectedWeekFilter.value)) return false
    }

    // Status
    if (selectedStatusFilter.value !== 'ALL') {
      if (selectedStatusFilter.value === 'COMPLETED') {
        if (m.status !== 'COMPLETED' && m.status !== 'APPROVED') return false
      } else if (m.status !== selectedStatusFilter.value) {
        return false
      }
    }

    // Category
    if (selectedCategoryFilter.value !== 'ALL') {
      if (m.category !== selectedCategoryFilter.value) return false
    }

    return true
  })
})

const resetFilters = () => {
  search.value = ''
  selectedWeekFilter.value = 'ALL'
  selectedStatusFilter.value = 'ALL'
  selectedCategoryFilter.value = 'ALL'
}
</script>
