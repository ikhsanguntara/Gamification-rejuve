<template>
  <div class="space-y-6 pb-16">
    <!-- Header & Action Bar -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
            <Compass class="w-5 h-5" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Active New Recruit Traceability
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            📊 Excel Ready (.xlsx)
          </span>
          <span v-if="batchStore.currentBatch?.name" class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Daftar jejak audit tahapan onboarding seluruh new hire (Pra-Start s/d Stage 3 dan Feedback Onboarding).
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          @click="handleExport"
          :disabled="reportStore.isExporting"
          class="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          title="Download Spreadsheet Excel Active New Recruit Report (.xlsx)"
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
              placeholder="Cari nama Kru / NIK / Gerai..."
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
            Audit Traceability Kru Baru (Active New Recruit)
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Pemantauan kepatuhan SOP dan kemajuan tahapan onboarding per individu kru.
          </p>
        </div>
        <span class="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
          Total: {{ filteredTraceabilityList.length }} Kru
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="reportStore.isLoading" class="p-12 text-center">
        <Loader2 class="w-8 h-8 animate-spin text-[#831843] dark:text-[#f472b6] mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-400">Memuat data traceability...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTraceabilityList.length === 0" class="p-12 text-center">
        <Compass class="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Tidak ada data audit traceability kru.</p>
        <p class="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter batch & gerai.</p>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4">Nama Kru & NIK</th>
              <th class="py-3.5 px-4">Toko / Gerai</th>
              <th class="py-3.5 px-4">Buddy / SL</th>
              <th class="py-3.5 px-4 text-center">Stage Onboarding</th>
              <th class="py-3.5 px-4 text-center">Feedback</th>
              <th class="py-3.5 px-4 text-center">Rata-rata Skor</th>
              <th class="py-3.5 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <tr
              v-for="(item, idx) in filteredTraceabilityList"
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
                  NIK: {{ item.nik || '-' }} • Batch: {{ item.batchName || '-' }}
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
              <td class="py-3.5 px-4">
                <div class="font-medium text-slate-800 dark:text-slate-200">
                  {{ item.buddyName || '-' }}
                </div>
                <div class="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                  Buddy / SL
                </div>
              </td>
              <td class="py-3.5 px-4 text-center">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-bold"
                  :class="[
                    item.currentStage === 'COMPLETED' || item.currentStage === 'Stage 3'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                  ]"
                >
                  {{ item.currentStage || 'Pre-Start' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="[
                    item.feedbackSubmitted
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  ]"
                >
                  {{ item.feedbackSubmitted ? 'Sudah Diisi' : 'Belum' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center font-black text-slate-900 dark:text-white">
                <span :class="item.avgScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'">
                  {{ item.avgScore || 0 }}
                </span>
                <span class="text-[10px] font-normal text-slate-400">/100</span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="openTraceabilityDetail(item.userId)"
                    class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    title="Audit Kartu Kru"
                  >
                    <Eye class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="exportSingleTraceability(item.userId)"
                    class="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
                    title="Download Kartu Audit Kru Ini (.xlsx)"
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

    <!-- Modal Detail User Traceability -->
    <BaseModal
      :model-value="isTraceabilityDetailModalOpen"
      @update:model-value="isTraceabilityDetailModalOpen = $event"
      title="Kartu Audit Traceability Onboarding Kru"
      :subtitle="`${reportStore.traceabilityDetail?.userInfo?.name || 'Detail Kru'} • NIK: ${reportStore.traceabilityDetail?.userInfo?.nik || '-'} • ${reportStore.traceabilityDetail?.userInfo?.storeName || '-'}`"
      max-width="3xl"
    >
      <template #icon>
        <div class="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Compass class="w-5 h-5" />
        </div>
      </template>

      <div class="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <!-- Timeline Stage Cards -->
        <div class="space-y-3">
          <div
            v-for="(stage, sIdx) in (reportStore.traceabilityDetail?.auditTimeline || [])"
            :key="sIdx"
            class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {{ sIdx + 1 }}
                </span>
                <span class="font-bold text-slate-900 dark:text-white text-xs">
                  {{ stage.stageName }}
                </span>
              </div>
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                :class="[
                  stage.status === 'COMPLETED' || stage.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                ]"
              >
                {{ stage.status }}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <div>
                <span class="block text-slate-400 text-[10px]">SL Evaluator</span>
                <span class="font-medium text-slate-700 dark:text-slate-200">{{ stage.slName || '-' }}</span>
              </div>
              <div>
                <span class="block text-slate-400 text-[10px]">DM Approver</span>
                <span class="font-medium text-slate-700 dark:text-slate-200">{{ stage.dmName || '-' }}</span>
              </div>
              <div>
                <span class="block text-slate-400 text-[10px]">Skor Evaluasi</span>
                <span class="font-bold text-slate-900 dark:text-white">{{ stage.score ? `${stage.score}/100` : '-' }}</span>
              </div>
              <div>
                <span class="block text-slate-400 text-[10px]">Tanggal Selesai</span>
                <span class="font-mono text-slate-700 dark:text-slate-200">{{ stage.completedAt || '-' }}</span>
              </div>
            </div>

            <div v-if="stage.slNotes || stage.dmNotes" class="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px] space-y-1">
              <p v-if="stage.slNotes" class="text-slate-600 dark:text-slate-300">
                <strong class="text-purple-600 dark:text-purple-400">Catatan SL:</strong> {{ stage.slNotes }}
              </p>
              <p v-if="stage.dmNotes" class="text-slate-600 dark:text-slate-300">
                <strong class="text-amber-600 dark:text-amber-400">Catatan DM:</strong> {{ stage.dmNotes }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="isTraceabilityDetailModalOpen = false"
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
  Compass,
  Download,
  RefreshCw,
  Search,
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
const isTraceabilityDetailModalOpen = ref(false)

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
  await reportStore.fetchUserTraceability(customParams)
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
  toast.success('Data Diperbarui', 'Data audit traceability kru berhasil dimuat ulang.')
}

const filteredTraceabilityList = computed(() => {
  let list = reportStore.userTraceability || []
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.nik && c.nik.toLowerCase().includes(q)) ||
      (c.storeName && c.storeName.toLowerCase().includes(q)) ||
      (c.buddyName && c.buddyName.toLowerCase().includes(q))
    )
  }
  return list
})

const openTraceabilityDetail = async (userId) => {
  await reportStore.fetchUserTraceabilityDetail(userId)
  isTraceabilityDetailModalOpen.value = true
}

const handleExport = async () => {
  try {
    await reportStore.exportUserTraceability()
    toast.success('Ekspor Berhasil', 'Spreadsheet Active New Recruit Report (.xlsx) telah diunduh.')
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kesalahan saat mengekspor laporan: ' + err.message)
  }
}

const exportSingleTraceability = async (userId) => {
  try {
    await reportStore.exportUserTraceabilityDetail(userId)
    toast.success('Ekspor Berhasil', 'Spreadsheet kartu audit kru (.xlsx) telah diunduh.')
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kendala saat mengunduh kartu audit: ' + err.message)
  }
}
</script>
