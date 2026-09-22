<template>
  <div class="space-y-6 pb-16">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-700 text-white flex items-center justify-center font-bold shadow-md shadow-pink-600/20">
            <Award class="w-5 h-5" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Score Report (Nilai Misi & Skor Kru)
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            📊 Excel Ready (.xlsx)
          </span>
          <span v-if="batchStore.currentBatch?.name" class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Rekapitulasi nilai mingguan misi (Week 1, Week 2, Week 3), skor bintang, skor poin, serta penugasan Buddy dan SL.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          @click="handleExport"
          :disabled="reportStore.isExporting"
          class="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          title="Download Spreadsheet Excel Score Report (.xlsx)"
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
              placeholder="Cari nama Kru / Batch / Toko..."
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
            Score Report (Nilai Misi & Skor Kru)
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Perolehan skor nilai mingguan dan total konversi bintang & poin gamifikasi.
          </p>
        </div>
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300">
          Total: {{ filteredScoreList.length }} Kru
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="reportStore.isLoading" class="p-12 text-center">
        <Loader2 class="w-8 h-8 animate-spin text-[#831843] dark:text-[#f472b6] mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data score report...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredScoreList.length === 0" class="p-12 text-center">
        <Award class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada data score report.</p>
        <p class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter batch & gerai.</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4">Kru & Batch</th>
              <th class="py-3.5 px-4">Toko Penugasan</th>
              <th class="py-3.5 px-4">Buddy & SL Penilai</th>
              <th class="py-3.5 px-4 text-center">Nilai W1</th>
              <th class="py-3.5 px-4 text-center">Nilai W2</th>
              <th class="py-3.5 px-4 text-center">Nilai W3</th>
              <th class="py-3.5 px-4 text-center">Bintang</th>
              <th class="py-3.5 px-4 text-right">Gamifikasi Poin</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <tr
              v-for="(item, idx) in filteredScoreList"
              :key="item.userId || idx"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="py-3.5 px-4 text-center text-slate-400 font-mono">
                {{ idx + 1 }}
              </td>
              <td class="py-3.5 px-4">
                <div class="font-bold text-slate-900 dark:text-white">
                  {{ item.name }}
                </div>
                <div class="text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                  {{ item.batch || '-' }}
                </div>
              </td>
              <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-700 dark:text-slate-300">
                  {{ item.assignmentStoreCode || '-' }}
                </div>
                <div class="text-[10px] text-slate-400">
                  SL: {{ item.assignmentSL || '-' }}
                </div>
              </td>
              <td class="py-3.5 px-4">
                <div class="font-medium text-slate-800 dark:text-slate-200">
                  {{ item.buddySL || '-' }}
                </div>
                <div class="text-[10px] text-purple-600 dark:text-purple-400">
                  Toko Buddy: {{ item.buddyStoreCode || '-' }}
                </div>
              </td>
              <td class="py-3.5 px-4 text-center font-bold">
                <span :class="item.week1Score ? 'text-slate-900 dark:text-white' : 'text-slate-400'">
                  {{ item.week1Score !== null && item.week1Score !== undefined ? item.week1Score : '-' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center font-bold">
                <span :class="item.week2Score ? 'text-slate-900 dark:text-white' : 'text-slate-400'">
                  {{ item.week2Score !== null && item.week2Score !== undefined ? item.week2Score : '-' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center font-bold">
                <span :class="item.week3Score ? 'text-slate-900 dark:text-white' : 'text-slate-400'">
                  {{ item.week3Score !== null && item.week3Score !== undefined ? item.week3Score : '-' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-amber-500 dark:text-amber-400">
                ⭐ {{ item.scoreBintang || item.stars || 0 }}
              </td>
              <td class="py-3.5 px-4 text-right font-black text-rose-600 dark:text-rose-400 font-mono">
                💎 {{ (item.scorePoint || item.points || 0).toLocaleString('id-ID') }}
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
  Award,
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
  await reportStore.fetchScoreReport(customParams)
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
  toast.success('Data Diperbarui', 'Data score report berhasil dimuat ulang.')
}

const filteredScoreList = computed(() => {
  let list = reportStore.scoreReports || []
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(s =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.batch && s.batch.toLowerCase().includes(q)) ||
      (s.buddySL && s.buddySL.toLowerCase().includes(q)) ||
      (s.buddyStoreCode && s.buddyStoreCode.toLowerCase().includes(q)) ||
      (s.assignmentSL && s.assignmentSL.toLowerCase().includes(q)) ||
      (s.assignmentStoreCode && s.assignmentStoreCode.toLowerCase().includes(q))
    )
  }
  return list
})

const handleExport = async () => {
  try {
    await reportStore.exportScoreReport()
    toast.success('Ekspor Berhasil', 'Spreadsheet Score Report (.xlsx) telah diunduh.')
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kesalahan saat mengekspor laporan: ' + err.message)
  }
}
</script>
