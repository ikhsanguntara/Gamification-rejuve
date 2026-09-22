<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            District Manager Review & Approvals
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            District Manager (DM)
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Tinjau evaluasi Store Leader, setujui sekaligus secara <strong>Bulk Approve</strong>, atau minta revisi evaluasi.
        </p>
      </div>

      <!-- Quick Action: Direct Summary for DM -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <span class="text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5 shadow-xs">
          <Hourglass class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{{ filteredPendingApprovals.length }} Menunggu Keputusan</span>
        </span>
      </div>
    </div>

    <!-- Filter & Search Toolbar (Adaptive for DM) -->
    <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
        <!-- Search Input -->
        <div class="lg:col-span-4">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Pencarian
          </label>
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama kru / misi / kode / toko..."
              class="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 focus:border-[#831843] dark:focus:border-[#f472b6] text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>

        <!-- Filter Tipe Penilaian -->
        <div class="lg:col-span-3">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Tipe Evaluasi
          </label>
          <select
            v-model="selectedType"
            class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 focus:border-[#831843] dark:focus:border-[#f472b6] text-slate-900 dark:text-white cursor-pointer transition-all"
          >
            <option value="ALL">Semua Tipe Evaluasi</option>
            <option value="AUTO_FORWARD">⚡ Penilaian Langsung DM (Otomatis)</option>
            <option value="REGULAR">📋 Penilaian Reguler SL</option>
          </select>
        </div>

        <!-- Filter Gerai / Store -->
        <div class="lg:col-span-3">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Gerai / Lokasi
          </label>
          <select
            v-model="selectedStore"
            class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 focus:border-[#831843] dark:focus:border-[#f472b6] text-slate-900 dark:text-white cursor-pointer transition-all"
          >
            <option value="">Semua Gerai</option>
            <option
              v-for="s in storeStore.allStores"
              :key="s.code || s.id"
              :value="s.name || s.code"
            >
              {{ s.name }}
            </option>
          </select>
        </div>

        <!-- Filter Week -->
        <div class="lg:col-span-1">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Week
          </label>
          <select
            v-model="selectedWeek"
            class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 focus:border-[#831843] dark:focus:border-[#f472b6] text-slate-900 dark:text-white cursor-pointer transition-all"
          >
            <option value="">Semua</option>
            <option :value="1">W1</option>
            <option :value="2">W2</option>
            <option :value="3">W3</option>
          </select>
        </div>

        <!-- Reset Button -->
        <div class="lg:col-span-1 flex justify-end">
          <button
            type="button"
            @click="resetFilters"
            :disabled="!hasActiveFilter"
            class="w-full py-2 px-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 transition-all"
            title="Reset Seluruh Filter"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Action Toolbar (When on PENDING tab and items available) -->
    <div
      v-if="activeTab === 'PENDING' && filteredPendingApprovals.length > 0"
      class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 select-none">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 rounded text-[#831843] focus:ring-[#831843] cursor-pointer"
          />
          <span>Pilih Semua ({{ filteredPendingApprovals.length }} Misi Terfilter)</span>
        </label>
        <span
          v-if="selectedIds.length > 0"
          class="text-xs px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-bold"
        >
          {{ selectedIds.length }} Terpilih
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="selectedIds.length > 0"
          type="button"
          @click="selectedIds = []"
          class="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
        >
          Batal Pilih
        </button>

        <button
          type="button"
          :disabled="selectedIds.length === 0"
          @click="handleBulkApprove"
          class="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          :class="[
            selectedIds.length > 0
              ? 'bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white shadow-[#831843]/20 active:scale-95'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          ]"
        >
          <Sparkles class="w-4 h-4" />
          <span>⚡ Bulk Approve ({{ selectedIds.length }} Misi Terpilih)</span>
        </button>
      </div>
    </div>

    <!-- Tabs via Reka UI TabsRoot -->
    <TabsRoot v-model="activeTab" class="w-full space-y-6">
      <TabsList class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit max-w-full overflow-x-auto">
        <TabsTrigger
          value="PENDING"
          class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
        >
          <Hourglass class="w-3.5 h-3.5" />
          <span>Menunggu Persetujuan</span>
          <span class="px-1.5 py-0.2 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            {{ filteredPendingApprovals.length }}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="APPROVED"
          class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Disetujui (Approved)</span>
          <span class="px-1.5 py-0.2 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {{ filteredApprovedItems.length }}
          </span>
        </TabsTrigger>
      </TabsList>

      <!-- Pending Tab Content -->
      <TabsContent value="PENDING" class="focus:outline-hidden space-y-4">
        <div
          v-if="filteredPendingApprovals.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"
        >
          <ApprovalCard
            v-for="item in paginatedPending"
            :key="item.id"
            :item="item"
            :selectable="true"
            :selected="selectedIds.includes(item.id)"
            @toggle-select="toggleSelectItem"
            @approve="openApproveModal"
          />
        </div>
        <AppPagination
          v-if="filteredPendingApprovals.length > 0"
          v-model:current-page="currentPendingPage"
          :total-items="filteredPendingApprovals.length"
          :items-per-page="itemsPerPage"
          item-label="evaluasi"
        />
        <EmptyState
          v-else
          title="Tidak Ada Evaluasi yang Cocok"
          description="Tidak ditemukan kartu evaluasi yang sesuai dengan filter atau kata kunci pencarian Anda."
          icon="CheckCircle2"
        />
      </TabsContent>

      <!-- Approved Tab Content -->
      <TabsContent value="APPROVED" class="focus:outline-hidden space-y-4">
        <div
          v-if="filteredApprovedItems.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"
        >
          <ApprovalCard
            v-for="item in paginatedApproved"
            :key="item.id"
            :item="item"
            @approve="openApproveModal"
          />
        </div>
        <AppPagination
          v-if="approvalStore.approvedItems.length > 0"
          v-model:current-page="currentApprovedPage"
          :total-items="approvalStore.approvedItems.length"
          :items-per-page="itemsPerPage"
          item-label="evaluasi"
        />
        <EmptyState
          v-else
          title="Belum Ada Misi Disetujui"
          description="Misi yang telah disetujui akan tercatat di sini beserta histori pencairan bintang."
          icon="ClipboardList"
        />
      </TabsContent>
    </TabsRoot>

    <!-- Approve Modal -->
    <ApprovalModal
      :modelValue="isApproveModalOpen"
      :item="selectedItem"
      @cancel="isApproveModalOpen = false"
      @confirm="handleApprove"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'
import { useApprovalStore } from '~/stores/approval.js'
import { useStoreStore } from '~/stores/store.js'
import { useBatchStore } from '~/stores/batch.js'
import { useToast } from '~/composables/useToast.js'
import { useConfetti } from '~/composables/useConfetti.js'
import ApprovalCard from '~/components/approval/ApprovalCard.vue'
import ApprovalModal from '~/components/approval/ApprovalModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import { confirmActionDialog } from '~/utils/dialog.js'
import {
  Hourglass,
  CheckCircle2,
  Sparkles,
  Search,
  RotateCcw
} from 'lucide-vue-next'

const approvalStore = useApprovalStore()
const storeStore = useStoreStore()
const batchStore = useBatchStore()
const toast = useToast()
const confetti = useConfetti()

const activeTab = ref('PENDING')
const isApproveModalOpen = ref(false)
const selectedItem = ref(null)
const selectedIds = ref([])

// Filter State
const searchQuery = ref('')
const selectedType = ref('ALL') // 'ALL' | 'AUTO_FORWARD' | 'REGULAR'
const selectedStore = ref('')
const selectedWeek = ref('')

const currentPendingPage = ref(1)
const currentApprovedPage = ref(1)
const itemsPerPage = 9

const hasActiveFilter = computed(() => {
  return Boolean(
    searchQuery.value.trim() ||
    selectedType.value !== 'ALL' ||
    selectedStore.value ||
    selectedWeek.value
  )
})

const resetFilters = () => {
  searchQuery.value = ''
  selectedType.value = 'ALL'
  selectedStore.value = ''
  selectedWeek.value = ''
  currentPendingPage.value = 1
  currentApprovedPage.value = 1
}

const loadApprovals = async (page = 1) => {
  await approvalStore.fetchApprovalsFromApi({
    page,
    limit: 50
  })
}

onMounted(async () => {
  loadApprovals(1)
  if (storeStore.allStores.length === 0) {
    await storeStore.fetchStoresFromApi().catch(() => {})
  }
  if (batchStore.allBatches.length === 0) {
    await batchStore.fetchBatchesFromApi().catch(() => {})
  }
})

watch([currentPendingPage, currentApprovedPage], ([pPage, aPage]) => {
  const targetPage = activeTab.value === 'PENDING' ? pPage : aPage
  loadApprovals(targetPage)
})

// Reset pagination to page 1 whenever search/filter changes
watch([searchQuery, selectedType, selectedStore, selectedWeek], () => {
  currentPendingPage.value = 1
  currentApprovedPage.value = 1
})

// Helper filter function
const applyApprovalFilters = (items) => {
  let list = items || []

  // 1. Search Query
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(item =>
      (item.crewName && item.crewName.toLowerCase().includes(q)) ||
      (item.missionTitle && item.missionTitle.toLowerCase().includes(q)) ||
      (item.missionCode && item.missionCode.toLowerCase().includes(q)) ||
      (item.storeLocation && item.storeLocation.toLowerCase().includes(q)) ||
      (item.supervisorName && item.supervisorName.toLowerCase().includes(q))
    )
  }

  // 2. Type Filter (Auto-Forward vs Regular)
  if (selectedType.value === 'AUTO_FORWARD') {
    list = list.filter(item => item.isSlNotScored)
  } else if (selectedType.value === 'REGULAR') {
    list = list.filter(item => !item.isSlNotScored)
  }

  // 3. Store Filter
  if (selectedStore.value) {
    const s = selectedStore.value.toLowerCase()
    list = list.filter(item =>
      (item.storeLocation && item.storeLocation.toLowerCase().includes(s)) ||
      (item.storeName && item.storeName.toLowerCase().includes(s))
    )
  }

  // 4. Week Filter
  if (selectedWeek.value) {
    list = list.filter(item => String(item.week) === String(selectedWeek.value))
  }

  return list
}

const filteredPendingApprovals = computed(() => {
  return applyApprovalFilters(approvalStore.pendingApprovals)
})

const filteredApprovedItems = computed(() => {
  return applyApprovalFilters(approvalStore.approvedItems)
})

const paginatedPending = computed(() => {
  const start = (currentPendingPage.value - 1) * itemsPerPage
  return filteredPendingApprovals.value.slice(start, start + itemsPerPage)
})

const paginatedApproved = computed(() => {
  const start = (currentApprovedPage.value - 1) * itemsPerPage
  return filteredApprovedItems.value.slice(start, start + itemsPerPage)
})

const isAllSelected = computed(() => {
  const pending = filteredPendingApprovals.value
  return pending.length > 0 && selectedIds.value.length === pending.length
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredPendingApprovals.value.map(a => a.id)
  }
}

function toggleSelectItem(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

async function handleBulkApprove() {
  if (selectedIds.value.length === 0) return

  const count = selectedIds.value.length
  const confirmed = await confirmActionDialog({
    title: `Setujui ${count} Evaluasi Sekaligus?`,
    text: `Persetujuan massal akan memfinalisasi evaluasi dan otomatis mencairkan bintang ke ${count} kru terkait. Lanjutkan?`,
    icon: 'question',
    confirmButtonText: `Ya, Setujui ${count} Misi`,
    cancelButtonText: 'Batal'
  })

  if (!confirmed) return

  const res = approvalStore.bulkApprove(selectedIds.value)
  selectedIds.value = []

  // Efek semarak bintang gamifikasi
  confetti.triggerApprovalStars({ x: 0.5, y: 0.35 })

  toast.success('Bulk Approve Berhasil', `${res.approvedCount || count} evaluasi misi kru telah disetujui sekaligus. Bintang otomatis dicairkan! 🚀`)
}

const openApproveModal = (payload) => {
  if (payload && payload.item) {
    selectedItem.value = {
      ...payload.item,
      adjustedScore: payload.adjustedScore,
      dmNote: payload.dmNote
    }
  } else {
    selectedItem.value = payload
  }
  isApproveModalOpen.value = true
}

const handleApprove = (overrideData = {}) => {
  if (selectedItem.value) {
    const result = approvalStore.approveMission(selectedItem.value.id, overrideData)
    isApproveModalOpen.value = false

    // Efek semarak bintang gamifikasi
    confetti.triggerApprovalStars({ x: 0.5, y: 0.35 })

    const adjustNote = result.isAdjustedByDm ? ` (Skor Akhir: ${result.score}/100)` : ''
    toast.success('Evaluasi Disetujui', `+${result.awardedStars || 5} ⭐ Bintang telah dicairkan ke akun ${result.crewName || 'kru'}${adjustNote}. 🎉`)
  }
}
</script>
