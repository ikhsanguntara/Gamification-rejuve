<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    @click.self="handleClose"
  >
    <div
      class="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] transition-all"
    >
      <!-- ========================================== -->
      <!-- MODAL HEADER                               -->
      <!-- ========================================== -->
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-[#831843]/10 dark:bg-[#831843]/20 text-[#831843] dark:text-[#f472b6] flex items-center justify-center font-bold">
            <FileSpreadsheet class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">
              Bulk Import Pengguna (Excel)
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Unggah dan daftarkan kru atau pimpinan gerai secara massal melalui file Excel (.xlsx).
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="handleClose"
          class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- ========================================== -->
      <!-- MODAL BODY                                 -->
      <!-- ========================================== -->
      <div class="p-5 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
        <!-- STEP INDICATOR -->
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div class="flex items-center gap-2">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              :class="currentStep === 1 ? 'bg-[#831843] text-white' : 'bg-emerald-500 text-white'"
            >
              <Check v-if="currentStep > 1" class="w-3.5 h-3.5" />
              <span v-else>1</span>
            </span>
            <span class="text-xs font-bold" :class="currentStep === 1 ? 'text-[#831843] dark:text-[#f472b6]' : 'text-slate-600 dark:text-slate-400'">
              Pilih & Upload File
            </span>
          </div>

          <div class="w-12 h-0.5 bg-slate-200 dark:bg-slate-700"></div>

          <div class="flex items-center gap-2">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              :class="currentStep === 2 ? 'bg-[#831843] text-white' : (currentStep > 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500')"
            >
              <Check v-if="currentStep > 2" class="w-3.5 h-3.5" />
              <span v-else>2</span>
            </span>
            <span class="text-xs font-bold" :class="currentStep === 2 ? 'text-[#831843] dark:text-[#f472b6]' : 'text-slate-500 dark:text-slate-400'">
              Preview Validasi (Dry Run)
            </span>
          </div>

          <div class="w-12 h-0.5 bg-slate-200 dark:bg-slate-700"></div>

          <div class="flex items-center gap-2">
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              :class="currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'"
            >
              3
            </span>
            <span class="text-xs font-bold" :class="currentStep === 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'">
              Selesai & Tersimpan
            </span>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 1: UPLOAD & TEMPLATE DOWNLOAD         -->
        <!-- ========================================== -->
        <div v-if="currentStep === 1" class="space-y-4 animate-in fade-in-50 duration-150">
          <!-- Download Template Card -->
          <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-start gap-3">
              <Download class="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 class="text-xs font-bold text-amber-900 dark:text-amber-300">
                  Gunakan Template Resmi Excel (.xlsx)
                </h4>
                <p class="text-[11px] text-amber-700/90 dark:text-amber-400/90 mt-0.5">
                  Pastikan kolom data (NIK/Username, Nama, Email, Role, Department) sesuai format standar sistem.
                </p>
              </div>
            </div>

            <button
              type="button"
              @click="handleDownloadTemplate"
              :disabled="isDownloading"
              class="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer flex-shrink-0 disabled:opacity-60"
            >
              <Loader2 v-if="isDownloading" class="w-3.5 h-3.5 animate-spin" />
              <Download v-else class="w-3.5 h-3.5" />
              <span>{{ isDownloading ? 'Mengunduh...' : 'Download Template (.xlsx)' }}</span>
            </button>
          </div>

          <!-- Dropzone Area -->
          <div
            class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center relative"
            :class="[
              isDragging ? 'border-[#831843] bg-[#831843]/5' : 'border-slate-200 dark:border-slate-700 hover:border-[#831843]/50 bg-slate-50/50 dark:bg-slate-800/20',
              selectedFile ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/10' : ''
            ]"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onFileDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx, .xls, .csv"
              class="hidden"
              @change="onFileSelected"
            />

            <!-- Jika Belum Ada File Terpilih -->
            <div v-if="!selectedFile" class="space-y-3">
              <div class="w-14 h-14 rounded-2xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud class="w-7 h-7" />
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Tarik & letakkan file Excel di sini, atau <span class="text-[#831843] dark:text-[#f472b6] underline">pilih file</span>
                </p>
                <p class="text-xs text-slate-400 mt-1">
                  Mendukung format .xlsx, .xls, atau .csv (Maksimal 10MB)
                </p>
              </div>
            </div>

            <!-- Jika File Sudah Dipilih -->
            <div v-else class="flex items-center gap-4 text-left w-full max-w-md p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-emerald-500/30 shadow-xs">
              <div class="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet class="w-6 h-6" />
              </div>
              <div class="flex-1 min-w-0">
                <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ selectedFile.name }}
                </h5>
                <p class="text-[11px] text-slate-400">
                  {{ formatBytes(selectedFile.size) }} • Siap diproses
                </p>
              </div>
              <button
                type="button"
                @click.stop="removeFile"
                class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Hapus file"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 2: PREVIEW VALIDASI (DRY RUN)         -->
        <!-- ========================================== -->
        <div v-if="currentStep === 2" class="space-y-4 animate-in fade-in-50 duration-150">
          <!-- Summary Stat Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
              <div>
                <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Baris</p>
                <h4 class="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{{ previewSummary.total }}</h4>
              </div>
              <div class="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                <Users class="w-4 h-4" />
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between">
              <div>
                <p class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Siap Disimpan</p>
                <h4 class="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{{ previewSummary.validCount }}</h4>
              </div>
              <div class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 class="w-4 h-4" />
              </div>
            </div>

            <div class="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/80 flex items-center justify-between">
              <div>
                <p class="text-[11px] font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Ada Kesalahan</p>
                <h4 class="text-xl font-bold text-rose-700 dark:text-rose-300 mt-0.5">{{ previewSummary.invalidCount }}</h4>
              </div>
              <div class="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle class="w-4 h-4" />
              </div>
            </div>
          </div>

          <!-- Alert Note jika ada error -->
          <div v-if="previewSummary.invalidCount > 0" class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <AlertCircle class="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>
              Terdapat <strong>{{ previewSummary.invalidCount }} data tidak valid</strong>. Baris yang memiliki error akan dilewati saat proses commit, atau Anda dapat memperbaiki file Excel dan mengunggah ulang.
            </span>
          </div>

          <!-- Table Preview Toolbar Filter -->
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                @click="filterPreviewStatus = 'ALL'"
                class="px-3 py-1 rounded-lg transition-all cursor-pointer"
                :class="filterPreviewStatus === 'ALL' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Semua ({{ previewSummary.total }})
              </button>
              <button
                type="button"
                @click="filterPreviewStatus = 'VALID'"
                class="px-3 py-1 rounded-lg transition-all cursor-pointer"
                :class="filterPreviewStatus === 'VALID' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Hanya Valid ({{ previewSummary.validCount }})
              </button>
              <button
                type="button"
                @click="filterPreviewStatus = 'INVALID'"
                class="px-3 py-1 rounded-lg transition-all cursor-pointer"
                :class="filterPreviewStatus === 'INVALID' ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
              >
                Hanya Error ({{ previewSummary.invalidCount }})
              </button>
            </div>

            <span class="text-xs text-slate-400">
              Menampilkan {{ filteredPreviewRows.length }} dari {{ previewSummary.total }} baris
            </span>
          </div>

          <!-- Preview Table -->
          <div class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-72 overflow-y-auto custom-scrollbar">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th class="py-2.5 px-3">No</th>
                  <th class="py-2.5 px-3">NIK / User</th>
                  <th class="py-2.5 px-3">Nama Lengkap</th>
                  <th class="py-2.5 px-3">Email</th>
                  <th class="py-2.5 px-3">Role</th>
                  <th class="py-2.5 px-3">Gerai / Dept</th>
                  <th class="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="(row, idx) in filteredPreviewRows"
                  :key="idx"
                  class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  :class="row.isValid === false ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''"
                >
                  <td class="py-2.5 px-3 text-slate-400 font-mono">{{ row.rowNumber || idx + 1 }}</td>
                  <td class="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">{{ row.nik || row.username || '—' }}</td>
                  <td class="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{{ row.name || row.fullName || '—' }}</td>
                  <td class="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">{{ row.email || '—' }}</td>
                  <td class="py-2.5 px-3">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {{ row.role || 'CREW' }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-slate-600 dark:text-slate-300">{{ row.department || row.departmentCode || row.storeLocation || '—' }}</td>
                  <td class="py-2.5 px-3 text-center">
                    <span
                      v-if="row.isValid !== false"
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    >
                      <CheckCircle2 class="w-3 h-3" /> Valid
                    </span>
                    <div v-else class="inline-flex flex-col items-center">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        <AlertCircle class="w-3 h-3" /> Error
                      </span>
                      <span v-if="row.errorMessage || row.error" class="text-[9px] text-rose-500 mt-0.5 max-w-[130px] truncate" :title="row.errorMessage || row.error">
                        {{ row.errorMessage || row.error }}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- STEP 3: HASIL SUKSES COMMIT                -->
        <!-- ========================================== -->
        <div v-if="currentStep === 3" class="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div class="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 class="w-8 h-8" />
          </div>
          <div class="max-w-md mx-auto space-y-1">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Bulk Import Berhasil!
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Sebanyak <strong>{{ commitResult?.count || previewSummary.validCount }} user</strong> telah berhasil didaftarkan ke dalam database dan sistem direktori Re.juve.
            </p>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- MODAL FOOTER                               -->
      <!-- ========================================== -->
      <div class="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
        <div>
          <button
            v-if="currentStep === 2"
            type="button"
            @click="currentStep = 1"
            class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ← Ganti File Excel
          </button>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {{ currentStep === 3 ? 'Tutup' : 'Batal' }}
          </button>

          <!-- Button Preview (Step 1) -->
          <button
            v-if="currentStep === 1"
            type="button"
            @click="handleRunPreview"
            :disabled="!selectedFile || isPreviewing"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#831843] hover:bg-[#701a40] text-white text-xs font-semibold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isPreviewing" class="w-4 h-4 animate-spin" />
            <Search v-else class="w-4 h-4" />
            <span>{{ isPreviewing ? 'Memvalidasi File...' : 'Preview Validasi (Dry Run)' }}</span>
          </button>

          <!-- Button Commit (Step 2) -->
          <button
            v-if="currentStep === 2"
            type="button"
            @click="handleCommit"
            :disabled="previewSummary.validCount === 0 || isCommitting"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="isCommitting" class="w-4 h-4 animate-spin" />
            <Check v-else class="w-4 h-4" />
            <span>{{ isCommitting ? 'Menyimpan ke Database...' : `Commit & Simpan (${previewSummary.validCount} User)` }}</span>
          </button>

          <!-- Button Selesai (Step 3) -->
          <button
            v-if="currentStep === 3"
            type="button"
            @click="handleClose"
            class="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>Selesai & Lihat Data</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  X,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Users,
  Search,
  Loader2
} from 'lucide-vue-next'
import { useUserStore } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'
import { useConfetti } from '~/composables/useConfetti.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'imported'])

const userStore = useUserStore()
const toast = useToast()
const confetti = useConfetti()

const currentStep = ref(1)
const fileInputRef = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const isDownloading = ref(false)
const isPreviewing = ref(false)
const isCommitting = ref(false)

const filterPreviewStatus = ref('ALL')
const previewData = ref(null)
const previewRows = ref([])
const commitResult = ref(null)

const previewSummary = computed(() => {
  const rows = previewRows.value || []
  const total = rows.length
  const invalidCount = rows.filter(r => r.isValid === false || r.status === 'INVALID' || r.error).length
  const validCount = total - invalidCount
  return {
    total,
    validCount: Math.max(0, validCount),
    invalidCount: Math.max(0, invalidCount)
  }
})

const filteredPreviewRows = computed(() => {
  if (filterPreviewStatus.value === 'VALID') {
    return previewRows.value.filter(r => r.isValid !== false && r.status !== 'INVALID' && !r.error)
  }
  if (filterPreviewStatus.value === 'INVALID') {
    return previewRows.value.filter(r => r.isValid === false || r.status === 'INVALID' || r.error)
  }
  return previewRows.value
})

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileSelected(e) {
  const file = e.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

function onFileDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

function removeFile() {
  selectedFile.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

async function handleDownloadTemplate() {
  isDownloading.value = true
  try {
    await userStore.downloadTemplate()
    toast.success('Download Berhasil', 'Template Excel (.xlsx) siap diisi.')
  } catch (err) {
    toast.error('Gagal Mengunduh Template', err.message || 'Terjadi kesalahan saat mengunduh template Excel.')
  } finally {
    isDownloading.value = false
  }
}

async function handleRunPreview() {
  if (!selectedFile.value) return

  isPreviewing.value = true
  try {
    const res = await userStore.previewBulkUsers(selectedFile.value)
    previewData.value = res

    // Normalize rows from various possible BE response shapes
    let rows = []
    if (Array.isArray(res)) {
      rows = res
    } else if (Array.isArray(res?.rows)) {
      rows = res.rows
    } else if (Array.isArray(res?.data?.rows)) {
      rows = res.data.rows
    } else if (Array.isArray(res?.data)) {
      rows = res.data
    } else if (Array.isArray(res?.users)) {
      rows = res.users
    } else if (Array.isArray(res?.preview)) {
      rows = res.preview
    }

    // Map each row with fallback defaults
    previewRows.value = rows.map((r, i) => ({
      rowNumber: r.rowNumber || r.row || i + 1,
      nik: r.nik || r.username || r.employeeId || r.code || '',
      name: r.name || r.fullName || r.nama || '',
      email: r.email || '',
      role: r.role || r.roleCode || 'CREW',
      roleCode: r.roleCode || r.role || 'CREW',
      department: r.department || r.departmentCode || r.storeLocation || r.store || '',
      departmentCode: r.departmentCode || r.department || '',
      isBuddy: Boolean(r.isBuddy),
      buddyEmail: r.buddyEmail || null,
      batchCode: r.batchCode || null,
      isValid: r.isValid !== undefined ? r.isValid : (r.status ? r.status === 'VALID' : !r.error),
      errorMessage: r.errorMessage || r.error || (Array.isArray(r.errors) ? r.errors.join(', ') : '')
    }))

    if (previewRows.value.length === 0) {
      toast.warning('Preview Kosong', 'Tidak ada baris data yang terbaca dari file Excel.')
    } else {
      currentStep.value = 2
      toast.info('Preview Selesai', `Berhasil membaca ${previewRows.value.length} baris data dari Excel.`)
    }
  } catch (err) {
    toast.error('Gagal Validasi Excel', err.message || 'Terjadi kesalahan saat memproses preview bulk user.')
  } finally {
    isPreviewing.value = false
  }
}

async function handleCommit() {
  if (previewSummary.value.validCount === 0) {
    toast.error('Tidak Ada Data Valid', 'Perbaiki error pada file Excel sebelum menyimpan.')
    return
  }

  isCommitting.value = true
  try {
    const validRows = previewRows.value
      .filter(r => r.isValid !== false && r.status !== 'INVALID' && !r.errorMessage && !r.error)
      .map(r => ({
        name: r.name,
        email: r.email,
        roleCode: (r.roleCode || r.role || 'CREW').toUpperCase(),
        departmentCode: r.departmentCode || r.department || null,
        isBuddy: Boolean(r.isBuddy),
        buddyEmail: r.buddyEmail || null,
        batchCode: r.batchCode || null
      }))

    const payload = {
      onDuplicate: 'SKIP',
      users: validRows
    }

    const res = await userStore.commitBulkUsers(payload)
    commitResult.value = res
    currentStep.value = 3
    try {
      if (confetti?.triggerExplosion) {
        confetti.triggerExplosion()
      } else if (confetti?.triggerStarBurst) {
        confetti.triggerStarBurst()
      }
    } catch {
      // Non-blocking animation failure
    }
    emit('imported', res)
    toast.success('Bulk Import Selesai', `Berhasil menyimpan ${validRows.length} pengguna ke database.`)
  } catch (err) {
    toast.error('Gagal Commit Data', err.message || 'Terjadi kesalahan saat menyimpan data ke database.')
  } finally {
    isCommitting.value = false
  }
}

function handleClose() {
  emit('update:modelValue', false)
  // Reset modal state
  setTimeout(() => {
    currentStep.value = 1
    selectedFile.value = null
    previewData.value = null
    previewRows.value = []
    commitResult.value = null
    filterPreviewStatus.value = 'ALL'
  }, 250)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}
</style>
