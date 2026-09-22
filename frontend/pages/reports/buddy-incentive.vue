<template>
  <div class="space-y-6 pb-16">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/20">
            <Handshake class="w-5 h-5" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Rekapitulasi Insentif Buddy
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            📊 Excel Ready (.xlsx)
          </span>
          <span v-if="batchStore.currentBatch?.name" class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Rekapitulasi perolehan insentif pembimbingan Store Leader / Buddy dan audit jejak kepatuhan onboarding kru gerai Re.juve.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          @click="handleExport"
          :disabled="reportStore.isExporting"
          class="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          title="Download Spreadsheet Excel Rekap Insentif Buddy (.xlsx)"
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
              placeholder="Cari nama Buddy / NIK / Gerai..."
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
            Daftar Rekapitulasi Insentif Buddy (Store Leader)
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Perhitungan estimasi insentif pembimbingan kru baru berdasarkan syarat kelulusan misi.
          </p>
        </div>
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
          Total: {{ filteredBuddyList.length }} SL / Buddy
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="reportStore.isLoading" class="p-12 text-center">
        <Loader2 class="w-8 h-8 animate-spin text-[#831843] dark:text-[#f472b6] mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data rekapitulasi...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredBuddyList.length === 0" class="p-12 text-center">
        <Handshake class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada data rekap insentif buddy.</p>
        <p class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter batch & gerai.</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4">SL / Buddy</th>
              <th class="py-3.5 px-4">Toko / Gerai</th>
              <th class="py-3.5 px-4 text-center">Jml Mentee</th>
              <th class="py-3.5 px-4 text-center">Lulus</th>
              <th class="py-3.5 px-4 text-center">Ratio %</th>
              <th class="py-3.5 px-4 text-right">Estimasi Insentif</th>
              <th class="py-3.5 px-4 text-center">Status</th>
              <th class="py-3.5 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <tr
              v-for="(item, idx) in filteredBuddyList"
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
                <div class="text-[11px] text-slate-400 font-mono">
                  NIK: {{ item.nik || '-' }}
                </div>
              </td>
              <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-700 dark:text-slate-300">
                  {{ item.storeName || '-' }}
                </div>
                <div class="text-[10px] text-slate-400">
                  Dept: {{ item.departmentName || '-' }}
                </div>
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                {{ item.totalMentees || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                {{ item.completedMentees || 0 }}
              </td>
              <td class="py-3.5 px-4 text-center font-bold">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px]"
                  :class="[
                    (item.completedMentees / (item.totalMentees || 1)) >= 0.8
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  ]"
                >
                  {{ Math.round(((item.completedMentees || 0) / (item.totalMentees || 1)) * 100) }}%
                </span>
              </td>
              <td class="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                {{ formatRupiah(item.totalIncentive || item.eligibleIncentive || 0) }}
              </td>
              <td class="py-3.5 px-4 text-center">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1"
                  :class="[
                    item.status === 'ELIGIBLE' || item.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  ]"
                >
                  <CheckCircle2 v-if="item.status === 'ELIGIBLE' || item.status === 'PAID'" class="w-3 h-3" />
                  <Clock v-else class="w-3 h-3" />
                  {{ item.status || 'IN_PROGRESS' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="openBuddyDetail(item.userId)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    title="Lihat Rincian Mentee"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="exportSingleBuddy(item.userId)"
                    class="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
                    title="Download Excel SL Ini (.xlsx)"
                  >
                    <Download class="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Detail Insentif Buddy -->
    <BaseModal
      :model-value="isBuddyDetailModalOpen"
      @update:model-value="isBuddyDetailModalOpen = $event"
      title="Rincian Mentee & Insentif Buddy"
      :subtitle="`${reportStore.buddyDetail?.buddyInfo?.name || 'Detail Store Leader'} • NIK: ${reportStore.buddyDetail?.buddyInfo?.nik || '-'}`"
      max-width="2xl"
    >
      <template #icon>
        <div class="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Handshake class="w-5 h-5" />
        </div>
      </template>

      <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            <span class="text-xs text-slate-500">Total Reward Insentif</span>
            <p class="text-lg font-black text-purple-700 dark:text-purple-300">
              {{ formatRupiah(reportStore.buddyDetail?.buddyInfo?.totalIncentive || 0) }}
            </p>
          </div>
          <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
            {{ reportStore.buddyDetail?.mentees?.length || 0 }} Mentee Terdaftar
          </span>
        </div>

        <div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Roster Kru Mentee
          </h4>
          <div
            v-for="(mentee, mIdx) in (reportStore.buddyDetail?.mentees || [])"
            :key="mIdx"
            class="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
          >
            <div>
              <div class="font-bold text-slate-900 dark:text-white">
                {{ mentee.name }}
              </div>
              <div class="text-[11px] text-slate-400">
                NIK: {{ mentee.nik }} • {{ mentee.batchName || 'Batch Terkini' }}
              </div>
            </div>
            <div class="text-right">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                :class="[
                  mentee.stageStatus === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                ]"
              >
                {{ mentee.currentStage || 'Tahap Onboarding' }} ({{ mentee.stageStatus || 'IN_PROGRESS' }})
              </span>
              <div class="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                Skor: {{ mentee.finalScore || mentee.score || '-' }} / 100
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="isBuddyDetailModalOpen = false"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
        >
          Tutup
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Handshake,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  X,
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
const isBuddyDetailModalOpen = ref(false)

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
  await reportStore.fetchBuddyIncentives(customParams)
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
  toast.success('Data Diperbarui', 'Rekapitulasi insentif buddy berhasil dimuat ulang.')
}

const filteredBuddyList = computed(() => {
  let list = reportStore.buddyIncentives || []
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(b =>
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.nik && b.nik.toLowerCase().includes(q)) ||
      (b.storeName && b.storeName.toLowerCase().includes(q))
    )
  }
  return list
})

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const openBuddyDetail = async (userId) => {
  await reportStore.fetchBuddyIncentiveDetail(userId)
  isBuddyDetailModalOpen.value = true
}

const handleExport = async () => {
  try {
    await reportStore.exportBuddyIncentives()
    toast.success('Ekspor Berhasil', 'Spreadsheet rekapitulasi insentif buddy (.xlsx) telah diunduh.')
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kesalahan saat mengekspor laporan: ' + err.message)
  }
}

const exportSingleBuddy = async (userId) => {
  try {
    await reportStore.exportBuddyIncentiveDetail(userId)
    toast.success('Ekspor Berhasil', 'Spreadsheet laporan insentif buddy (.xlsx) telah diunduh.')
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kendala saat mengunduh laporan: ' + err.message)
  }
}
</script>
