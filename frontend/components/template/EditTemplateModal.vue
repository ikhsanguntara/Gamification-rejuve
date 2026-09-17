<template>
  <BaseModal
    :modelValue="modelValue"
    title="Edit Master Template & Detail Misi"
    max-width="5xl"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <!-- Navigasi Sub-Tab Modal: Langsung Fokus ke Misi atau Header -->
    <div class="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90">
        <button
          type="button"
          @click="activeModalSection = 'MISSIONS'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
          :class="activeModalSection === 'MISSIONS'
            ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
        >
          <Layers class="w-3.5 h-3.5" />
          <span>Kurikulum & Butir SOP ({{ form.details.length }})</span>
        </button>

        <button
          type="button"
          @click="activeModalSection = 'HEADER'"
          class="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
          :class="activeModalSection === 'HEADER'
            ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'"
        >
          <Settings2 class="w-3.5 h-3.5" />
          <span>Pengaturan Template (Header)</span>
        </button>
      </div>

      <!-- Quick Summary Chip -->
      <div class="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#831843] text-white">
          {{ form.type }}
        </span>
        <span class="font-mono font-bold text-slate-700 dark:text-slate-300">{{ form.code }}</span>
        <span>•</span>
        <span class="truncate max-w-[180px] font-semibold text-slate-800 dark:text-slate-200">{{ form.name }}</span>
      </div>
    </div>

    <!-- Formulir Utama -->
    <form id="edit-template-form" @submit.prevent="executeSaveAll" class="space-y-4">
      <!-- ========================================== -->
      <!-- TAB 1: PENGATURAN HEADER TEMPLATE         -->
      <!-- ========================================== -->
      <div
        v-show="activeModalSection === 'HEADER'"
        class="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4 animate-in fade-in-50 duration-150"
      >
        <div class="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Identitas & Parameter Template
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Konfigurasi dasar paket kurikulum pelatihan dan standar SOP gerai.
            </p>
          </div>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            {{ form.code }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Nama Template -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Paket / Template *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Core Barista Onboarding Standard"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <!-- Satuan & Nilai Durasi -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Satuan Durasi *
              </label>
              <select
                v-model="form.durationCode"
                @change="handleDurationCodeChange"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-2.5 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#831843] cursor-pointer"
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
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2.5 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Deskripsi Paket
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Keterangan kurikulum atau tujuan standar operasional paket ini..."
            class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] resize-none"
          ></textarea>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: DETAIL MISI SOP PER MINGGU/HARI    -->
      <!-- ========================================== -->
      <div v-show="activeModalSection === 'MISSIONS'" class="space-y-3.5 animate-in fade-in-50 duration-150">
        <!-- Header Section Misi & Tombol Tambah Minggu -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Kurikulum Misi SOP Gerai</span>
              <span class="px-2 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] text-[10px] font-bold">
                {{ form.details.length }} Butir Total
              </span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Pilih {{ unitLabel.toLowerCase() }} di bawah untuk mengedit urutan butir SOP dan checklist kepatuhan.
            </p>
          </div>

          <!-- Tombol Tambah Periode / Minggu -->
          <button
            type="button"
            @click="addNewUnitPeriod"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[#831843]/40 hover:border-[#831843] text-xs font-semibold text-[#831843] dark:text-[#f472b6] bg-[#831843]/5 hover:bg-[#831843]/10 transition-all cursor-pointer self-start sm:self-auto shadow-2xs active:scale-95"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>+ Tambah {{ unitLabel }} Baru</span>
          </button>
        </div>

        <!-- Period / Week Selector Tabs -->
        <div class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
          <button
            v-for="period in totalPeriods"
            :key="period"
            type="button"
            @click="activePeriodTab = period"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 group"
            :class="[
              activePeriodTab === period
                ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <span>{{ getTabTitle(period) }}</span>
            <span
              class="text-[10px] px-1.5 py-0.2 rounded-full font-bold"
              :class="activePeriodTab === period ? 'bg-[#831843]/10 text-[#831843]' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
            >
              {{ getMissionsForPeriod(period).length }}
            </span>
            <span
              v-if="totalPeriods > 1"
              @click.stop="confirmRemovePeriod(period)"
              class="ml-0.5 p-0.5 rounded-md hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer inline-flex items-center justify-center opacity-70 group-hover:opacity-100"
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
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 relative group hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <!-- Card Header: Penomoran Urutan & Badge Warna Kategori -->
            <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2.5 flex-wrap">
                <!-- Badge Nomor Urut -->
                <span class="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80">
                  #{{ mIdx + 1 }}
                </span>

                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  Misi {{ mIdx + 1 }}: {{ mission.missionTitle || 'Belum Diberi Judul' }}
                </span>

                <!-- Badge Kategori dengan Dot Warna -->
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full font-bold border inline-flex items-center gap-1.5"
                  :class="getCategoryBadgeClass(mission.category)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="getCategoryDotClass(mission.category)"></span>
                  {{ getCategoryLabel(mission.category) }}
                </span>

                <!-- Badge Tipe Evaluasi -->
                <span class="text-[10px] text-slate-400 font-medium">
                  {{ getInputTypeHelper(mission.inputType) }}
                </span>
              </div>

              <!-- Tombol Hapus dengan Konfirmasi -->
              <button
                type="button"
                @click="confirmRemoveMission(mission, mIdx + 1)"
                class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                :title="`Hapus Misi #${mIdx + 1}`"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Baris 1: Judul, Kategori, Tipe Input -->
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

              <div class="sm:col-span-3">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tipe Input
                </label>
                <select
                  v-model="mission.inputType"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-[#831843] cursor-pointer"
                >
                  <option value="SCALE">Skala Nilai (0 - 100)</option>
                  <option value="CHECKBOX">Checklist (Ya / Tidak)</option>
                  <option value="TEXT">Esai / Catatan Supervisor</option>
                </select>
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
                  Checklist / Poin SOP (1 baris per butir)
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
            class="py-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 bg-slate-50/50 dark:bg-slate-900/30"
          >
            <p class="font-medium">Belum ada butir misi SOP di {{ getTabTitle(activePeriodTab) }}.</p>
            <button
              type="button"
              @click="addNewMissionToCurrentPeriod"
              class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-bold text-xs hover:bg-[#831843]/20 cursor-pointer shadow-2xs active:scale-95"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Butir SOP Sekarang</span>
            </button>
          </div>

          <!-- Tombol Tambah Misi Baru di Periode Aktif -->
          <div v-else class="flex justify-start pt-1">
            <button
              type="button"
              @click="addNewMissionToCurrentPeriod"
              class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#831843] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#831843] transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-2xs active:scale-95"
            >
              <Plus class="w-3.5 h-3.5 text-[#831843]" />
              <span>+ Tambah Butir SOP di {{ getTabTitle(activePeriodTab) }}</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- ========================================== -->
    <!-- STICKY DOCKED FOOTER: SELALU MELAYANG DI BAWAH -->
    <!-- ========================================== -->
    <template #footer>
      <div class="w-full flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-medium">
            {{ form.details.length }} Butir Misi di {{ totalPeriods }} {{ unitLabel }}
          </span>
          <span class="text-slate-300 dark:text-slate-700">•</span>
          <span class="text-[11px] text-slate-400">Tersimpan serentak ke API live</span>
        </div>

        <div class="flex items-center gap-2.5">
          <button
            type="button"
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="edit-template-form"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Seluruh Perubahan (Header + Details)' }}</span>
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Plus, Trash2, Loader2, X, Layers, Settings2 } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'
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
  template: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'updated'])

const templateStore = useTemplateStore()
const toast = useToast()
const isSubmitting = ref(false)

// Section switcher: 'MISSIONS' (default) or 'HEADER'
const activeModalSection = ref('MISSIONS')

const activePeriodTab = ref(1)
const periodCount = ref(3)
const periodTitles = ref({})

const form = ref({
  id: '',
  code: '',
  name: '',
  type: 'JOURNEY',
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

const getCategoryLabel = (cat) => {
  switch (cat) {
    case 'TECHNICAL': return 'Technical'
    case 'SOFT_SKILL': return 'Soft Skill'
    case 'LEADERSHIP': return 'Leadership'
    case 'PROJECT': return 'Project'
    default: return cat || 'Technical'
  }
}

const getCategoryBadgeClass = (cat) => {
  switch (cat) {
    case 'TECHNICAL':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
    case 'SOFT_SKILL':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
    case 'LEADERSHIP':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800'
    case 'PROJECT':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
  }
}

const getCategoryDotClass = (cat) => {
  switch (cat) {
    case 'TECHNICAL': return 'bg-blue-500'
    case 'SOFT_SKILL': return 'bg-emerald-500'
    case 'LEADERSHIP': return 'bg-purple-500'
    case 'PROJECT': return 'bg-amber-500'
    default: return 'bg-slate-400'
  }
}

const getInputTypeHelper = (inp) => {
  switch (inp) {
    case 'SCALE': return '⭐ Skala 0-100'
    case 'CHECKBOX': return '☑️ Checklist Ya/Tidak'
    case 'TEXT': return '✍️ Esai Deskriptif'
    default: return '⭐ Skala 0-100'
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadMissionCategoriesFromApi()
    if (props.template) {
      const rawDetails = (props.template.details && props.template.details.length > 0)
        ? props.template.details
        : (props.template.templates || [])

      // Inisialisasi Judul / Tema per Periode
      const titles = {}

      // 1. Ekstrak tema dari detail asli (API DB) terlebih dahulu
      rawDetails.forEach((item) => {
        const durationNum = Number(item.week || item.durationNumber || 1)
        const tTitle = item.periodTitle || item.scaleConfig?.periodTitle || item.scaleConfig?.weekTitle || item.weekTitle
        if (tTitle && !titles[durationNum]) {
          titles[durationNum] = tTitle
        }
      })

      // 2. Jika ada props.template.weeks dengan judul non-default
      if (Array.isArray(props.template.weeks)) {
        props.template.weeks.forEach(w => {
          if (w.weekNumber && w.title && !titles[w.weekNumber] && !w.title.includes('Tema SOP Operasional') && !w.title.includes('Agenda Orientasi')) {
            titles[w.weekNumber] = w.title
          }
        })
      }

      const mappedDetails = rawDetails.map((item, idx) => {
        const reqs = Array.isArray(item.sopChecklist)
          ? item.sopChecklist.join('\n')
          : (Array.isArray(item.requirements)
            ? item.requirements.join('\n')
            : (item.sopChecklist || item.requirements || ''))

        const durationNum = Number(item.week || item.durationNumber || 1)
        const tTitle = item.periodTitle || item.scaleConfig?.periodTitle || item.scaleConfig?.weekTitle || item.weekTitle
        if (tTitle && !titles[durationNum]) {
          titles[durationNum] = tTitle
        }

        return {
          tempId: item.id || item.tplMissionDetailId || `item-${Date.now()}-${idx}`,
          durationNumber: durationNum,
          missionTitle: item.title || item.missionTitle || `Misi SOP ${idx + 1}`,
          periodTitle: tTitle || titles[durationNum] || '',
          description: item.description || '',
          category: mapCategoryEnum(item.category),
          inputType: mapInputTypeEnum(item.inputType),
          requirementsText: reqs,
          scaleConfig: item.scaleConfig || { min: 0, max: 100, step: 20, starPerStep: 1 }
        }
      })

      periodTitles.value = titles

      const maxInDetails = mappedDetails.reduce((max, d) => Math.max(max, Number(d.durationNumber || 1)), 1)
      periodCount.value = Math.max(maxInDetails, 1)

      form.value = {
        id: props.template.id || props.template.tplMissionId,
        code: props.template.code || '',
        name: props.template.name || '',
        type: props.template.type || 'JOURNEY',
        durationCode: props.template.durationCode || (props.template.type === 'JOURNEY' ? 'WEEK' : 'DAY'),
        durationValue: Number(props.template.durationValue || 1),
        description: props.template.description || '',
        details: mappedDetails
      }

      // Default ke Misi SOP dan Periode 1
      activeModalSection.value = 'MISSIONS'
      activePeriodTab.value = 1
    }
  }
})

const handleDurationCodeChange = () => {
  activePeriodTab.value = 1
}

const addNewUnitPeriod = () => {
  periodCount.value = totalPeriods.value + 1
  activePeriodTab.value = periodCount.value
  toast.success('Tab Ditambahkan', `${getTabTitle(activePeriodTab.value)} siap diisi butir SOP.`)
}

const confirmRemovePeriod = async (periodToDelete) => {
  if (totalPeriods.value <= 1) return

  const missionsInPeriod = getMissionsForPeriod(periodToDelete)
  const tabLabel = getTabTitle(periodToDelete)

  const confirmed = await confirmDeleteDialog({
    title: `Hapus ${tabLabel}?`,
    text: missionsInPeriod.length > 0
      ? `${tabLabel} memiliki ${missionsInPeriod.length} butir misi yang akan ikut terhapus. Lanjutkan?`
      : `Yakin ingin menghapus ${tabLabel}?`,
    confirmButtonText: `Ya, Hapus ${unitLabel.value}`
  })

  if (!confirmed) return

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

const confirmRemoveMission = async (mission, missionNumber) => {
  const confirmed = await confirmDeleteDialog({
    title: `Hapus Misi #${missionNumber}?`,
    text: `Yakin ingin menghapus "${mission.missionTitle || 'Misi #' + missionNumber}" dari template?`,
    confirmButtonText: 'Ya, Hapus Misi'
  })

  if (confirmed) {
    removeMission(mission)
    toast.success('Misi Dihapus', `Misi #${missionNumber} berhasil dikeluarkan.`)
  }
}

const removeMission = (mission) => {
  const idx = form.value.details.findIndex(m => m === mission || m.tempId === mission.tempId)
  if (idx !== -1) {
    form.value.details.splice(idx, 1)
  }
}

const executeSaveAll = async () => {
  if (!form.value.name?.trim()) {
    activeModalSection.value = 'HEADER'
    toast.error('Validasi Gagal', 'Nama template wajib diisi.')
    return
  }

  // Validate that all missions have titles
  for (let i = 0; i < form.value.details.length; i++) {
    const m = form.value.details[i]
    if (!m.missionTitle?.trim()) {
      activeModalSection.value = 'MISSIONS'
      activePeriodTab.value = m.durationNumber
      toast.error('Validasi Gagal', `Judul SOP pada ${getTabTitle(m.durationNumber)} masih kosong.`)
      return
    }
  }

  // Compile clean details payload
  const compiledDetails = form.value.details.map((item) => {
    const checklistArr = item.requirementsText
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
      sopChecklist: checklistArr
    }
  })

  // Full unified payload for BE
  const fullPayload = {
    name: form.value.name.trim(),
    durationCode: form.value.durationCode,
    durationValue: Number(form.value.durationValue || 1),
    description: form.value.description?.trim() || '',
    details: compiledDetails
  }

  isSubmitting.value = true
  try {
    const updated = await templateStore.updatePackage(form.value.id, fullPayload)
    emit('update:modelValue', false)
    emit('updated', updated || { id: form.value.id, ...fullPayload })
    toast.success('Template Berhasil Diperbarui', `Header dan ${compiledDetails.length} butir SOP telah dikirim & disimpan ke server.`)
  } catch (err) {
    toast.error('Gagal Menyimpan Template', err.message || 'Terjadi kesalahan saat update ke API.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
