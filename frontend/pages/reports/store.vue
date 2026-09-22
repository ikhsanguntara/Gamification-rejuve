<template>
  <div class="space-y-6 pb-16">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 text-white flex items-center justify-center font-bold shadow-md shadow-teal-600/20">
            <Store class="w-5 h-5" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Report by Store (Progres Gerai)
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            📊 Excel Ready (.xlsx)
          </span>
          <span v-if="batchStore.currentBatch?.name" class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Rekapitulasi progres onboarding new hire per gerai: jumlah kru per step (Buddy, W1, W2, W3, Complete) dan rata-rata durasi penyelesaian.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          @click="handleExport"
          :disabled="reportStore.isExporting"
          class="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          title="Download Spreadsheet Excel Report by Store (.xlsx)"
        >
          <Loader2 v-if="reportStore.isExporting" class="w-4 h-4 animate-spin" />
          <Download v-else class="w-4 h-4" />
          <span>Ekspor Spreadsheet (.xlsx)</span>
        </button>

        <button
          type="button"
          @click="refreshData"
          :disabled="reportStore.isLoading"
          class="text-xs font-bold px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          title="Muat Ulang Data"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': reportStore.isLoading }" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <!-- Search Input -->
        <div class="lg:col-span-2">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Pencarian
          </label>
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari kode gerai / nama gerai / DM / SL..."
              @input="onSearchInput"
              class="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 focus:border-[#831843] dark:focus:border-[#f472b6] text-slate-900 dark:text-white transition-all"
            />
          </div>
        </div>

        <!-- Filter Batch -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Batch
          </label>
          <select
            v-model="selectedBatchId"
            @change="onFilterChange"
            class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 focus:border-[#831843] dark:focus:border-[#f472b6] text-slate-900 dark:text-white cursor-pointer transition-all"
          >
            <option value="">Semua Batch</option>
            <option
              v-for="b in batchStore.allBatches"
              :key="b.id"
              :value="b.id"
            >
              {{ b.name }}
            </option>
          </select>
        </div>

        <!-- Filter Gerai / Store -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Gerai / Store
          </label>
          <select
            v-model="selectedStoreCode"
            @change="onFilterChange"
            class="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 focus:border-[#831843] dark:focus:border-[#f472b6] text-slate-900 dark:text-white cursor-pointer transition-all"
          >
            <option value="">Semua Gerai</option>
            <option
              v-for="s in storeStore.allStores"
              :key="s.code"
              :value="s.code"
            >
              {{ s.name }} ({{ s.code }})
            </option>
          </select>
        </div>

        <!-- Rentang Tanggal Mulai -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Dari Tanggal
          </label>
          <input
            v-model="startDate"
            type="date"
            @change="onFilterChange"
            class="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 text-slate-900 dark:text-white dark:[color-scheme:dark]"
          />
        </div>

        <!-- Rentang Tanggal Selesai -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Sampai Tanggal
          </label>
          <input
            v-model="endDate"
            type="date"
            @change="onFilterChange"
            class="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-[#831843]/20 text-slate-900 dark:text-white dark:[color-scheme:dark]"
          />
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h3 class="font-bold text-base text-slate-900 dark:text-white">
            Report by Store (Progres Onboarding per Gerai)
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Sebaran kru onboarding pada tiap tahapan dan rata-rata durasi penyelesaian misi per gerai.
          </p>
        </div>
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
          Total: {{ filteredStoreList.length }} Gerai
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="reportStore.isLoading" class="p-12 text-center">
        <Loader2 class="w-8 h-8 animate-spin text-[#831843] dark:text-[#f472b6] mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data progres gerai...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredStoreList.length === 0" class="p-12 text-center">
        <Store class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada data report gerai.</p>
        <p class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter batch & gerai.</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4">Kode & Nama Gerai</th>
              <th class="py-3.5 px-4">District Manager</th>
              <th class="py-3.5 px-4">Store Leader</th>
              <th class="py-3.5 px-4 text-center">Jml Batch</th>
              <th class="py-3.5 px-4 text-center">New Hire</th>
              <th class="py-3.5 px-4 text-center">Step Buddy</th>
              <th class="py-3.5 px-4 text-center">Step W1</th>
              <th class="py-3.5 px-4 text-center">Step W2</th>
              <th class="py-3.5 px-4 text-center">Step W3</th>
              <th class="py-3.5 px-4 text-center">Selesai</th>
              <th class="py-3.5 px-4 text-center">Rata-rata Durasi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <tr
              v-for="(item, idx) in filteredStoreList"
              :key="item.storeCode || idx"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="py-3.5 px-4 text-center text-slate-400 font-mono">
                {{ idx + 1 }}
              </td>
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 dark:text-white">
                  {{ item.storeName }}
                </div>
                <div class="text-[11px] text-teal-600 dark:text-teal-400 font-mono font-semibold">
                  {{ item.storeCode }}
                </div>
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                {{ item.dm || '-' }}
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                {{ item.storeLeader || '-' }}
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                {{ item.batchCount || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                {{ item.numberOfNewHire || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                {{ item.newHireStepBuddyCount || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                {{ item.newHireStepWeek1Count || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                {{ item.newHireStepWeek2Count || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                {{ item.newHireStepWeek3Count || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                {{ item.newHireCompleteCount || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px]">
                  {{ item.avgCompleteDays || 0 }} Hari
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Store,
  Download,
  RefreshCw,
  Search,
  Loader2
} from 'lucide-vue-next'

const reportStore = useReportStore()
const batchStore = useBatchStore()
const storeStore = useStoreStore()
const toast = useToast()

const searchQuery = ref('')
const selectedBatchId = ref('')
const selectedStoreCode = ref('')
const startDate = ref('')
const endDate = ref('')

onMounted(async () => {
  if (batchStore.allBatches.length === 0) {
    await batchStore.fetchBatchesFromApi().catch(() => {})
  }
  if (storeStore.allStores.length === 0) {
    await storeStore.fetchStoresFromApi().catch(() => {})
  }
  await loadData()
})

const loadData = async () => {
  const customParams = {
    batchId: selectedBatchId.value || undefined,
    storeCode: selectedStoreCode.value || undefined,
    startDate: startDate.value || undefined,
    endDate: endDate.value || undefined,
    search: searchQuery.value || undefined
  }
  await reportStore.fetchStoreReport(customParams)
}

const onSearchInput = () => {
  reportStore.setFilter('search', searchQuery.value)
  loadData()
}

const onFilterChange = () => {
  reportStore.setFilter('batchId', selectedBatchId.value)
  reportStore.setFilter('storeCode', selectedStoreCode.value)
  reportStore.setFilter('startDate', startDate.value)
  reportStore.setFilter('endDate', endDate.value)
  loadData()
}

const refreshData = async () => {
  await loadData()
  toast.success('Data Diperbarui', 'Data progres gerai berhasil dimuat ulang.')
}

const filteredStoreList = computed(() => {
  let list = reportStore.storeReports || []
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(s =>
      (s.storeName && s.storeName.toLowerCase().includes(q)) ||
      (s.storeCode && s.storeCode.toLowerCase().includes(q)) ||
      (s.dm && s.dm.toLowerCase().includes(q)) ||
      (s.storeLeader && s.storeLeader.toLowerCase().includes(q))
    )
  }
  return list
})

const handleExport = async () => {
  try {
    await reportStore.exportStoreReport()
    toast.success('Ekspor Berhasil', 'Spreadsheet Report by Store (.xlsx) telah diunduh.')
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kesalahan saat mengekspor laporan: ' + err.message)
  }
}
</script>
