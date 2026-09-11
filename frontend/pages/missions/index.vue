<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Katalog Misi Gerai
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Standar penugasan operasional gerai, kriteria audit SOP, dan perolehan bintang.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
          {{ filteredMissions.length }} Misi Terdaftar
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
            placeholder="Cari judul atau kode misi..."
            class="w-full text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
          />
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Week Selector Filter -->
        <div class="relative">
          <select
            v-model="selectedWeekFilter"
            class="w-full appearance-none bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option value="ALL">Semua Minggu (1, 2, 3)</option>
            <option value="1">Week 1 (Selesai)</option>
            <option value="2">Week 2 (Siklus Aktif)</option>
            <option value="3">Week 3 (Terkunci)</option>
          </select>
          <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <!-- Status Filter -->
        <div class="relative">
          <select
            v-model="selectedStatusFilter"
            class="w-full appearance-none bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING_REVIEW">Menunggu Review DM</option>
            <option value="REVISION_REQUIRED">Perlu Revisi</option>
            <option value="COMPLETED">Selesai / Disetujui</option>
            <option value="IN_PROGRESS">Sedang Berjalan</option>
            <option value="DRAFT">Draf Disimpan</option>
            <option value="LOCKED">Terkunci</option>
          </select>
          <ChevronDown class="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <!-- Category Filter -->
        <div class="relative">
          <select
            v-model="selectedCategoryFilter"
            class="w-full appearance-none bg-slate-100 dark:bg-slate-800 border-none text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl pl-3 pr-8 py-2.5 focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Cold Chain">Cold Chain</option>
            <option value="Quality Control">Quality Control</option>
            <option value="Sanitation">Sanitasi & Kebersihan</option>
            <option value="Service">Pelayanan & Kasir</option>
            <option value="Compliance">Kepatuhan SOP</option>
            <option value="Logistics">Logistik & Stok</option>
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
        v-for="mission in paginatedMissions"
        :key="mission.id"
        :mission="mission"
      />
    </div>

    <!-- App Pagination for Grid Cards (9 Items / Page) -->
    <AppPagination
      v-if="filteredMissions.length > 0"
      v-model:current-page="currentPage"
      :total-items="filteredMissions.length"
      :items-per-page="itemsPerPage"
      item-label="misi"
    />

    <!-- Empty State -->
    <EmptyState
      v-else
      title="Tidak ada misi yang sesuai filter"
      description="Coba bersihkan kata kunci pencarian atau pilih minggu dan status yang berbeda."
      icon="Search"
    >
      <template #action>
        <button
          type="button"
          @click="resetFilters"
          class="px-4 py-2 text-xs font-semibold rounded-xl bg-[#831843] text-white hover:bg-[#701a40] transition-colors cursor-pointer"
        >
          Reset Semua Filter
        </button>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import MissionCard from '~/components/mission/MissionCard.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import { Search, ChevronDown } from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()

const search = ref('')
const selectedWeekFilter = ref('ALL')
const selectedStatusFilter = ref('ALL')
const selectedCategoryFilter = ref('ALL')

const currentPage = ref(1)
const itemsPerPage = 9

onMounted(async () => {
  await batchStore.fetchBatchesFromApi()
  await missionStore.fetchMissionsFromApi()
})

const filteredMissions = computed(() => {
  const targetBatchId = userStore.isCrew ? userStore.currentUser?.batchId : batchStore.selectedBatchId

  return (missionStore.allMissions || []).filter(m => {
    // Branch Filter
    if (m.batchId !== targetBatchId) return false

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

// Auto-reset ke halaman 1 saat filter atau pencarian berubah
watch([search, selectedWeekFilter, selectedStatusFilter, selectedCategoryFilter], () => {
  currentPage.value = 1
})

const paginatedMissions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredMissions.value.slice(start, start + itemsPerPage)
})

const resetFilters = () => {
  search.value = ''
  selectedWeekFilter.value = 'ALL'
  selectedStatusFilter.value = 'ALL'
  selectedCategoryFilter.value = 'ALL'
  currentPage.value = 1
}
</script>
