<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEditMode ? 'Edit Template Rapor Buddy' : 'Buat Template Rapor Buddy Baru'"
    max-width="5xl"
  >
    <form id="buddy-template-form" @submit.prevent="executeSaveAll" class="space-y-6">
      <!-- ========================================== -->
      <!-- BAGIAN 1: KONFIGURASI HEADER PAKET BUDDY   -->
      <!-- ========================================== -->
      <div class="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
        <div class="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-600 text-white uppercase tracking-wider shadow-2xs">
              BUDDY
            </span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">
              {{ form.code || 'BUDDY-STD' }}
            </span>
          </div>
          <span class="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
            Periode Rapor 3 Hari (durationNumber: 1)
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div class="sm:col-span-4">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kode Template *
            </label>
            <input
              v-model="form.code"
              type="text"
              required
              placeholder="Contoh: BUDDY-STD-03"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-purple-600 uppercase"
            />
          </div>

          <div class="sm:col-span-8">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Paket Rapor *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Rapor Pendampingan New Hire (3 Hari Pre-Batch)"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div class="sm:col-span-4">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Satuan Durasi *
            </label>
            <select
              v-model="form.durationCode"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-purple-600 cursor-pointer"
            >
              <option value="DAY">DAYS (Hari)</option>
              <option value="WEEK">WEEK (Minggu)</option>
            </select>
          </div>

          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jangka Waktu *
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="form.durationValue"
                type="number"
                min="1"
                max="30"
                required
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-purple-600"
              />
              <span class="text-xs text-slate-400 font-bold whitespace-nowrap">Hari</span>
            </div>
          </div>

          <div class="sm:col-span-5">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Paket
            </label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Keterangan evaluasi pendampingan 3 hari..."
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN 2: DAFTAR INDIKATOR & KATEGORI BE   -->
      <!-- ========================================== -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Daftar Indikator Penilaian Rapor</span>
              <span class="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                {{ indicators.length }} Butir Indikator
              </span>
            </h4>
          </div>

          <button
            type="button"
            @click="addNewIndicator"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer self-start sm:self-auto active:scale-95"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Tambah Indikator</span>
          </button>
        </div>

        <!-- Filter Tab Kategori di Modal -->
        <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
          <button
            type="button"
            @click="filterCat = 'ALL'"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
            :class="[
              filterCat === 'ALL'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <span>Semua ({{ indicators.length }})</span>
          </button>
          <button
            v-for="cat in buddyCategories"
            :key="cat.value"
            type="button"
            @click="filterCat = cat.value"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
            :class="[
              filterCat === cat.value
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            <span>{{ cat.label }} ({{ countCat(cat.value) }})</span>
          </button>
        </div>

        <!-- List of Indicators Form Rows -->
        <div class="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          <div
            v-for="(ind, idx) in displayedIndicators"
            :key="ind.tempId || idx"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-purple-200 transition-all"
          >
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <div class="sm:col-span-5 space-y-1">
                <div class="flex items-center justify-between">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Judul Indikator Penilaian *
                  </label>
                  <label class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 cursor-pointer">
                    <input
                      type="checkbox"
                      v-model="ind.isStar"
                      class="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>★ Wajib Pembekalan</span>
                  </label>
                </div>
                <input
                  v-model="ind.name"
                  type="text"
                  required
                  placeholder="Contoh: Menjelaskan produk & ingredients"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div class="sm:col-span-3 space-y-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Kategori *
                </label>
                <select
                  v-model="ind.category"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-purple-600 cursor-pointer"
                >
                  <option v-for="cat in buddyCategories" :key="cat.value" :value="cat.value">
                    {{ cat.label }}
                  </option>
                </select>
              </div>

              <div class="sm:col-span-3 space-y-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Keterangan / Standar
                </label>
                <input
                  v-model="ind.description"
                  type="text"
                  placeholder="Panduan pelaksanaan..."
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div class="sm:col-span-1 flex items-end justify-center pt-5">
                <button
                  type="button"
                  @click="confirmRemoveIndicator(ind)"
                  class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Hapus Indikator"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            v-if="indicators.length === 0"
            class="py-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
          >
            <p>Belum ada indikator penilaian rapor.</p>
            <button
              type="button"
              @click="addNewIndicator"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Indikator Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- STICKY FOOTER -->
    <template #footer>
      <div class="w-full flex items-center justify-between gap-3 flex-wrap">
        <p class="text-[11px] text-slate-400">
          * Seluruh konfigurasi rapor dan {{ indicators.length }} butir indikator akan disimpan serentak ke API.
        </p>
        <div class="flex items-center gap-2">
          <button
            type="button"
            @click="$emit('update:modelValue', false)"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="buddy-template-form"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Rapor Buddy' }}</span>
          </button>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Plus, Trash2, Loader2 } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'
import { paramApi } from '~/services/api.js'
import {
  BUDDY_CATEGORIES,
  mapBuddyCategoryToEnum,
  normalizeBuddyDetails,
  compileBuddyDetailsForApi
} from '~/utils/buddyHelper.js'

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

const emit = defineEmits(['update:modelValue', 'created', 'updated'])

const templateStore = useTemplateStore()
const toast = useToast()
const isSubmitting = ref(false)

const buddyCategories = ref([...BUDDY_CATEGORIES])

const loadBuddyCategoriesFromApi = async () => {
  try {
    const res = await paramApi.getByGroupCode('BUDDY_CATEGORY')
    if (res?.success && Array.isArray(res.data?.list) && res.data.list.length > 0) {
      buddyCategories.value = res.data.list.map(p => ({
        code: p.code,
        value: p.value,
        label: p.value,
        enumVal: mapBuddyCategoryToEnum(p.value || p.code)
      }))
    }
  } catch (err) {
    console.warn('Gagal memuat parameter BUDDY_CATEGORY dari Bispar:', err)
  }
}

const filterCat = ref('ALL')

const form = ref({
  id: '',
  code: 'BUDDY-STD-03',
  name: 'Rapor Pendampingan New Hire (3 Hari Pre-Batch)',
  type: 'BUDDY',
  durationCode: 'DAY',
  durationValue: 3,
  description: 'Program orientasi dan evaluasi pendampingan 3 hari untuk kru baru.'
})

const indicators = ref([])

const isEditMode = computed(() => Boolean(form.value.id))

const countCat = (cat) => indicators.value.filter(i => i.category === cat).length

const displayedIndicators = computed(() => {
  if (filterCat.value === 'ALL') {
    return indicators.value
  }
  return indicators.value.filter(i => i.category === filterCat.value)
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadBuddyCategoriesFromApi()
    if (props.template) {
      // Edit Mode
      form.value = {
        id: props.template.id || props.template.tplMissionId,
        code: props.template.code || 'BUDDY-STD-03',
        name: props.template.name || '',
        type: 'BUDDY',
        durationCode: props.template.durationCode || 'DAY',
        durationValue: Number(props.template.durationValue || 3),
        description: props.template.description || ''
      }

      const sourceDetails = props.template.details || props.template.templates || []
      indicators.value = normalizeBuddyDetails(sourceDetails)
    } else {
      // Create Mode (Bersih dan Kosong)
      form.value = {
        id: '',
        code: '',
        name: '',
        type: 'BUDDY',
        durationCode: 'DAY',
        durationValue: 3,
        description: ''
      }

      indicators.value = []
    }

    filterCat.value = 'ALL'
  }
})

const addNewIndicator = () => {
  const nextNum = indicators.value.length + 1
  const defaultCat = buddyCategories.value[0]?.value || 'Product Knowledge'
  const newInd = {
    id: `ind-${Date.now()}-${nextNum}`,
    tempId: `ind-${Date.now()}-${nextNum}`,
    name: '',
    category: filterCat.value !== 'ALL' ? filterCat.value : defaultCat,
    isStar: false,
    description: '',
    durationNumber: 1,
    inputType: 'RADIO',
    options: ['Belum Menguasai', 'Butuh Pendampingan', 'Kompeten']
  }
  indicators.value.unshift(newInd)
}

const confirmRemoveIndicator = async (ind) => {
  const confirmed = await confirmDeleteDialog({
    title: 'Hapus Indikator?',
    text: `Yakin ingin menghapus butir "${ind.name || 'Indikator Penilaian'}" dari rapor?`,
    confirmButtonText: 'Ya, Hapus'
  })

  if (confirmed) {
    removeIndicator(ind)
  }
}

const removeIndicator = (ind) => {
  const idx = indicators.value.indexOf(ind)
  if (idx !== -1) {
    indicators.value.splice(idx, 1)
    toast.success('Indikator Dihapus', 'Butir indikator telah dihapus.')
  }
}

const executeSaveAll = async () => {
  if (!form.value.name?.trim()) {
    toast.error('Validasi Gagal', 'Nama paket rapor wajib diisi.')
    return
  }

  for (const ind of indicators.value) {
    if (!ind.name?.trim()) {
      toast.error('Validasi Gagal', 'Terdapat butir indikator yang judulnya masih kosong.')
      return
    }
  }

  const compiledDetails = compileBuddyDetailsForApi(indicators.value)

  const pkgCode = form.value.code?.trim() || `TPL-BUDDY-${Date.now().toString().slice(-6)}`

  const fullPayload = {
    code: pkgCode,
    name: form.value.name.trim(),
    type: 'BUDDY',
    durationCode: form.value.durationCode,
    durationValue: Number(form.value.durationValue || 3),
    totalWeeks: 1,
    description: form.value.description?.trim() || '',
    category: 'Orientasi Buddy',
    targetType: 'Semua Gerai',
    details: compiledDetails
  }

  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      const updated = await templateStore.updatePackage(form.value.id, fullPayload)
      emit('update:modelValue', false)
      emit('updated', updated || { id: form.value.id, ...fullPayload })
      toast.success('Template Buddy Diperbarui', `Rapor "${form.value.name}" berhasil diperbarui.`)
    } else {
      const created = await templateStore.createPackage(fullPayload)
      emit('update:modelValue', false)
      emit('created', created || fullPayload)
      toast.success('Template Buddy Dibuat', `Rapor "${form.value.name}" berhasil dibuat dengan ${compiledDetails.length} butir indikator.`)
    }
  } catch (err) {
    toast.error('Gagal Menyimpan Template', err.message || 'Terjadi kesalahan saat simpan ke API.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
