<template>
  <BaseModal
    :modelValue="modelValue"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    max-width="5xl"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="executeSavePackage" class="space-y-5 py-2">
      <!-- ========================================== -->
      <!-- BAGIAN 1: HEADER CONFIGURATION            -->
      <!-- ========================================== -->
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <div class="flex items-center justify-between gap-2 border-b border-slate-200/70 dark:border-slate-700/70 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#831843] text-white">
              {{ form.type }}
            </span>
            <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              {{ form.code }}
            </span>
          </div>
          <span class="text-[11px] font-semibold text-slate-400">
            Konfigurasi Header Template
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <!-- Tipe Template -->
          <div class="sm:col-span-4">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tipe Template *
            </label>
            <select
              v-model="form.type"
              disabled
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-600 dark:text-slate-400 font-bold cursor-not-allowed"
            >
              <option value="JOURNEY">JOURNEY (Paket Misi Batch Onboarding)</option>
              <option value="BUDDY">BUDDY (Paket Misi Buddy 3 Hari)</option>
              <option value="FEEDBACK">FEEDBACK (Kuesioner Feedback & Rapor)</option>
            </select>
          </div>

          <!-- Kode Template -->
          <div class="sm:col-span-4">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kode Template *
            </label>
            <input
              v-model="form.code"
              type="text"
              required
              placeholder="Contoh: TPL-JOURNEY-01"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <!-- Satuan & Nilai Durasi -->
          <div class="sm:col-span-4 grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Satuan Durasi *
              </label>
              <select
                v-model="form.durationCode"
                @change="handleDurationCodeChange"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#831843] cursor-pointer"
              >
                <option value="DAY">DAYS (Hari)</option>
                <option value="WEEK">WEEK (Minggu)</option>
                <option value="MONTH">MONTH (Bulan)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nilai Durasi (per Tab) *
              </label>
              <input
                v-model.number="form.durationValue"
                type="number"
                min="1"
                max="52"
                required
                placeholder="Contoh: 1"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <!-- Nama Paket / Template -->
          <div class="sm:col-span-12">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Paket / Template *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              :placeholder="namePlaceholder"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <!-- Deskripsi Paket -->
          <div class="sm:col-span-12">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Paket
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Keterangan kurikulum atau tujuan standar operasional paket ini..."
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN 2: DETAIL MISI SOP PER MINGGU/HARI -->
      <!-- ========================================== -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Detail Butir SOP Misi</span>
              <span class="px-2 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] text-[10px] font-bold">
                {{ form.details.length }} Butir Total
              </span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Tambahkan judul, kategori, instruksi, dan checklist butir SOP di setiap {{ unitLabel.toLowerCase() }}.
            </p>
          </div>

          <!-- Tombol Tambah Periode / Minggu -->
          <button
            type="button"
            @click="addNewUnitPeriod"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-[#831843]/40 hover:border-[#831843] text-xs font-semibold text-[#831843] dark:text-[#f472b6] bg-[#831843]/5 hover:bg-[#831843]/10 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Tambah {{ unitLabel }} Baru</span>
          </button>
        </div>

        <!-- Period / Week Selector Tabs -->
        <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
          <button
            v-for="period in totalPeriods"
            :key="period"
            type="button"
            @click="activePeriodTab = period"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
            :class="[
              activePeriodTab === period
                ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <span>{{ getTabTitle(period) }}</span>
            <span
              class="text-[10px] px-1.5 py-0.2 rounded-full"
              :class="activePeriodTab === period ? 'bg-[#831843]/10 text-[#831843]' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
            >
              {{ getMissionsForPeriod(period).length }}
            </span>
            <span
              v-if="totalPeriods > 1"
              @click.stop="removePeriod(period)"
              class="ml-0.5 p-0.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer inline-flex items-center justify-center"
              :title="`Hapus ${getTabTitle(period)}`"
            >
              <X class="w-3 h-3" />
            </span>
          </button>
        </div>

        <!-- Pengaturan Tema / Judul Periode Aktif -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 to-amber-50/40 dark:from-slate-800/80 dark:to-amber-950/20 border border-slate-200/90 dark:border-slate-700/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full bg-[#831843] dark:bg-[#f472b6] flex-shrink-0"></span>
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Tema / Fokus {{ unitLabel }} {{ activePeriodTab }}
              </label>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Judul tema ini akan otomatis tampil pada siklus mingguan penilaian kru & workstation.
              </p>
            </div>
          </div>
          <div class="flex-1 max-w-sm w-full">
            <input
              v-model="periodTitles[activePeriodTab]"
              type="text"
              :placeholder="`Contoh: ${form.type === 'JOURNEY' ? 'Customer Greeting & Hygiene SOP' : 'Orientasi Dasar Gerai'}`"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white font-semibold placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <!-- Missions List in Active Period -->
        <div class="space-y-3">
          <div
            v-for="(mission, mIdx) in getMissionsForPeriod(activePeriodTab)"
            :key="mission.tempId || mIdx"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 relative group"
          >
            <!-- Baris 1: Judul, Kategori, Tipe Input, & Hapus -->
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <div class="sm:col-span-5">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Judul Butir SOP *
                </label>
                <input
                  v-model="mission.missionTitle"
                  type="text"
                  required
                  placeholder="Contoh: Cek Kalibrasi Sensorik Rasa Jus"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-[#831843]"
                />
              </div>

              <div class="sm:col-span-4">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Kategori SOP
                </label>
                <select
                  v-model="mission.category"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-[#831843] cursor-pointer"
                >
                  <option v-for="cat in missionCategories" :key="cat.code" :value="cat.code">
                    {{ cat.value }}
                  </option>
                </select>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tipe Input
                </label>
                <select
                  v-model="mission.inputType"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-[#831843] cursor-pointer"
                >
                  <option value="SCALE">Skala 0-100</option>
                  <option value="CHECKBOX">Checklist</option>
                  <option value="TEXT">Esai Deskripsi</option>
                </select>
              </div>

              <div class="sm:col-span-1 flex items-end justify-center pt-5">
                <button
                  type="button"
                  @click="removeMission(mission)"
                  class="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Hapus butir SOP ini"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Baris 2: Deskripsi & Checklist Poin SOP -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/70">
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Instruksi / Panduan Pelaksanaan
                </label>
                <textarea
                  v-model="mission.description"
                  rows="2"
                  placeholder="Panduan bagi Store Leader dan Kru dalam melakukan evaluasi..."
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#831843] resize-none"
                ></textarea>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Checklist / Poin SOP (1 baris per poin)
                </label>
                <textarea
                  v-model="mission.requirementsText"
                  rows="2"
                  placeholder="Cek temperatur chiller di 2-4°C&#10;Catat di logbook fisik dan submit foto"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 font-mono text-slate-900 dark:text-white focus:ring-1 focus:ring-[#831843] resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Empty State in Active Period -->
          <div
            v-if="getMissionsForPeriod(activePeriodTab).length === 0"
            class="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
          >
            <p>Belum ada butir misi SOP di {{ getTabTitle(activePeriodTab) }}.</p>
            <button
              type="button"
              @click="addNewMissionToCurrentPeriod"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-bold text-xs hover:bg-[#831843]/20 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Butir SOP Sekarang</span>
            </button>
          </div>

          <!-- Tombol Tambah Misi Baru di Periode Aktif -->
          <div v-else class="flex justify-start">
            <button
              type="button"
              @click="addNewMissionToCurrentPeriod"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#831843] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#831843] transition-all cursor-pointer bg-white dark:bg-slate-900"
            >
              <Plus class="w-3.5 h-3.5 text-[#831843]" />
              <span>Tambah Butir SOP di {{ getTabTitle(activePeriodTab) }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- FOOTER: SIMPAN SEKALIGUS (HEADER + DETAILS) -->
      <!-- ========================================== -->
      <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 flex-wrap">
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}</span>
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Plus, Trash2, Loader2, X } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import { paramApi } from '~/services/api.js'

const DEFAULT_MISSION_CATEGORIES = [
  { code: 'TECHNICAL', value: 'TECHNICAL (Operasional)' },
  { code: 'SOFT_SKILL', value: 'SOFT_SKILL (Layanan)' },
  { code: 'LEADERSHIP', value: 'LEADERSHIP (Manajerial)' },
  { code: 'PROJECT', value: 'PROJECT (Proyek Khusus)' }
]

const missionCategories = ref([...DEFAULT_MISSION_CATEGORIES])

const loadMissionCategoriesFromApi = async () => {
  try {
    const res = await paramApi.getByGroupCode('MISSION_CATEGORY')
    if (res?.success && Array.isArray(res.data?.list) && res.data.list.length > 0) {
      missionCategories.value = res.data.list.map(p => ({
        code: p.code,
        value: p.value || p.code
      }))
    }
  } catch (err) {
    console.warn('Gagal memuat parameter MISSION_CATEGORY dari Bispar:', err)
  }
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  initialType: {
    type: String,
    default: 'JOURNEY'
  }
})

const emit = defineEmits(['update:modelValue', 'created'])

const templateStore = useTemplateStore()
const toast = useToast()
const isSubmitting = ref(false)

const activePeriodTab = ref(1)
const periodCount = ref(3)

const form = ref({
  type: 'JOURNEY',
  code: '',
  name: '',
  category: 'Standar Operasional',
  targetType: 'Semua Gerai',
  durationCode: 'WEEK',
  durationValue: 1,
  description: '',
  details: []
})

const unitLabel = computed(() => {
  return 'Periode'
})

const totalPeriods = computed(() => {
  const maxInDetails = form.value.details.reduce((max, d) => Math.max(max, Number(d.durationNumber || 1)), 1)
  return Math.max(periodCount.value, maxInDetails, 1)
})

const getTabTitle = (period) => {
  return `${unitLabel.value} ${period}`
}

const getMissionsForPeriod = (periodNum) => {
  return form.value.details.filter(m => Number(m.durationNumber) === Number(periodNum))
}

const mapCategoryEnum = (cat) => {
  const upper = String(cat || 'TECHNICAL').toUpperCase()
  if (upper.includes('SOFT') || upper.includes('PELAYANAN') || upper.includes('SERVICE')) return 'SOFT_SKILL'
  if (upper.includes('LEAD') || upper.includes('MANAGER')) return 'LEADERSHIP'
  if (upper.includes('PROJ')) return 'PROJECT'
  return 'TECHNICAL'
}

const mapInputTypeEnum = (inp) => {
  const upper = String(inp || 'SCALE').toUpperCase()
  if (['SCALE', 'CHECKBOX', 'RADIO', 'TEXT'].includes(upper)) return upper
  return 'SCALE'
}
const resetForm = (type = 'JOURNEY') => {
  const list = type === 'JOURNEY'
    ? (templateStore.journeyTemplates.length > 0 ? templateStore.journeyTemplates : templateStore.allPackages)
    : (type === 'BUDDY' ? templateStore.buddyTemplates : templateStore.feedbackTemplates)

  // Smart auto-generate code that avoids existing codes and scans for highest number
  let nextNum = (list?.length || 0) + 1
  const existingCodes = new Set((list || []).map(p => (p.code || '').toUpperCase().trim()))
  
  ;(list || []).forEach(p => {
    const match = (p.code || '').match(/(\d+)$/)
    if (match) {
      const num = parseInt(match[1], 10)
      if (!isNaN(num) && num >= nextNum) {
        nextNum = num + 1
      }
    }
  })

  let generatedCode = `TPL-${type}-${String(nextNum).padStart(2, '0')}`
  while (existingCodes.has(generatedCode.toUpperCase())) {
    nextNum++
    generatedCode = `TPL-${type}-${String(nextNum).padStart(2, '0')}`
  }

  const defaultDurationCode = type === 'JOURNEY' ? 'WEEK' : 'DAY'
  const defaultDurationValue = 1
  periodCount.value = 1
  periodTitles.value = {}

  form.value = {
    type,
    code: generatedCode,
    name: '',
    category: type === 'JOURNEY' ? 'Standar Operasional' : (type === 'BUDDY' ? 'Orientasi Buddy' : 'Feedback & Evaluasi'),
    targetType: 'Semua Gerai',
    durationCode: defaultDurationCode,
    durationValue: defaultDurationValue,
    description: '',
    details: []
  }

  activePeriodTab.value = 1
}

const periodTitles = ref({})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadMissionCategoriesFromApi()
    resetForm(props.initialType || 'JOURNEY')
  }
})

const onTypeChange = () => {
  resetForm(form.value.type)
}

const handleDurationCodeChange = () => {
  activePeriodTab.value = 1
}

const addNewUnitPeriod = () => {
  periodCount.value = totalPeriods.value + 1
  activePeriodTab.value = periodCount.value
  toast.success('Tab Ditambahkan', `${getTabTitle(activePeriodTab.value)} siap diisi butir SOP.`)
}

const removePeriod = (periodToDelete) => {
  if (totalPeriods.value <= 1) return

  const tabLabel = getTabTitle(periodToDelete)

  // 1. Hapus misi pada periode ini
  form.value.details = form.value.details.filter(m => Number(m.durationNumber) !== Number(periodToDelete))

  // 2. Geser nomor durationNumber misi setelahnya agar urutan rapi
  form.value.details.forEach(m => {
    if (Number(m.durationNumber) > Number(periodToDelete)) {
      m.durationNumber = Number(m.durationNumber) - 1
    }
  })

  // 3. Kurangi jumlah tab
  periodCount.value = Math.max(1, totalPeriods.value - 1)

  // 4. Sesuaikan tab aktif
  if (activePeriodTab.value === periodToDelete) {
    activePeriodTab.value = Math.min(periodToDelete, periodCount.value)
  } else if (activePeriodTab.value > periodToDelete) {
    activePeriodTab.value = activePeriodTab.value - 1
  }

  toast.success('Tab Dihapus', `${tabLabel} berhasil dihapus.`)
}

const addNewMissionToCurrentPeriod = () => {
  const nextNum = form.value.details.length + 1
  form.value.details.push({
    tempId: `item-${Date.now()}-${nextNum}`,
    durationNumber: Number(activePeriodTab.value),
    missionTitle: '',
    description: '',
    category: 'TECHNICAL',
    inputType: 'SCALE',
    requirementsText: '',
    scaleConfig: { min: 0, max: 100, step: 20, starPerStep: 1 }
  })
}

const removeMission = (mission) => {
  const idx = form.value.details.findIndex(m => m === mission || m.tempId === mission.tempId)
  if (idx !== -1) {
    form.value.details.splice(idx, 1)
  }
}

const modalTitle = computed(() => {
  if (form.value.type === 'BUDDY') return 'Buat Template Paket Buddy'
  if (form.value.type === 'FEEDBACK') return 'Buat Template Paket Feedback'
  return 'Buat Master Paket Baru (Batch Journey)'
})

const modalSubtitle = computed(() => {
  return `Definisikan konfigurasi header dan butir SOP per ${unitLabel.value.toLowerCase()} untuk paket template baru ini.`
})

const namePlaceholder = computed(() => {
  if (form.value.type === 'BUDDY') return 'Contoh: Onboarding Buddy Barista 3 Hari'
  if (form.value.type === 'FEEDBACK') return 'Contoh: End-of-Journey Crew Feedback'
  return 'Contoh: Standar Gerai Bandara & Kiosk'
})

const executeSavePackage = async () => {
  if (!form.value.name?.trim()) {
    toast.error('Validasi Gagal', 'Nama paket/template wajib diisi.')
    return
  }

  // Validate that all added missions have titles
  for (let i = 0; i < form.value.details.length; i++) {
    const m = form.value.details[i]
    if (!m.missionTitle?.trim()) {
      activePeriodTab.value = m.durationNumber
      toast.error('Validasi Gagal', `Judul SOP pada ${getTabTitle(m.durationNumber)} masih kosong.`)
      return
    }
  }

  // Compile clean details payload according to Prisma backend schema
  const compiledDetails = form.value.details.map((item) => {
    const reqList = item.requirementsText
      ? item.requirementsText.split('\n').map(r => r.trim()).filter(Boolean)
      : (Array.isArray(item.sopChecklist) ? item.sopChecklist : (Array.isArray(item.requirements) ? item.requirements : []))

    const durNum = Number(item.durationNumber || 1)
    const periodTitle = periodTitles.value[durNum]?.trim() || (form.value.type === 'JOURNEY' ? `Minggu ${durNum}: Tema SOP Operasional` : `Hari ${durNum}: Agenda Orientasi`)

    return {
      periodTitle,
      durationNumber: durNum,
      missionTitle: item.missionTitle.trim(),
      description: item.description?.trim() || '',
      category: mapCategoryEnum(item.category),
      inputType: mapInputTypeEnum(item.inputType),
      scaleConfig: item.inputType === 'SCALE' ? (item.scaleConfig || { min: 0, max: 100, step: 20, starPerStep: 1 }) : null,
      sopChecklist: reqList
    }
  })

  const dVal = Number(form.value.durationValue || 1)
  const dCode = form.value.durationCode || (form.value.type === 'JOURNEY' ? 'WEEK' : 'DAY')

  const createPayload = {
    code: form.value.code?.trim() || `TPL-${form.value.type}-${Date.now()}`,
    name: form.value.name.trim(),
    type: form.value.type,
    durationCode: dCode,
    durationValue: dVal,
    category: form.value.category || 'Standar Operasional',
    targetType: form.value.targetType || 'Semua Gerai',
    description: form.value.description?.trim() || '',
    details: compiledDetails
  }

  isSubmitting.value = true
  try {
    const created = await templateStore.createPackage(createPayload)
    emit('update:modelValue', false)
    emit('created', { ...created, ...createPayload })
    toast.success(
      'Paket Berhasil Dibuat',
      `Paket "${created?.name || createPayload.name}" beserta ${compiledDetails.length} butir SOP siap digunakan.`
    )
  } catch (err) {
    console.error('Gagal membuat paket template:', err)
    toast.error('Gagal Membuat Paket', err.message || 'Terjadi kesalahan pada server saat membuat paket template.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
