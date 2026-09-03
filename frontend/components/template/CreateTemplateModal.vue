<template>
  <BaseModal
    :modelValue="modelValue"
    :title="modalTitle"
    :subtitle="modalSubtitle"
    max-width="sm"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="executeCreatePackage" class="space-y-3 py-2">
      <!-- Tipe Template (Defaulted per Tab Aktif) -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Template *</label>
        <select
          v-model="newPkgForm.type"
          @change="onTypeChange"
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-[#831843]"
        >
          <option value="JOURNEY">JOURNEY (Paket Misi Batch Onboarding)</option>
          <option value="BUDDY">BUDDY (Paket Misi Buddy 3 Hari)</option>
          <option value="FEEDBACK">FEEDBACK (Kuesioner Feedback & Rapor)</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Template *</label>
        <input
          v-model="newPkgForm.code"
          type="text"
          required
          placeholder="Contoh: TPL-JOURNEY-01"
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-[#831843]"
        />
      </div>

      <!-- Dua Field Durasi: durationCode (DAYS, WEEK, MONTH) & durationValue -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Satuan Durasi (Code) *</label>
          <select
            v-model="newPkgForm.durationCode"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-[#831843]"
          >
            <option value="DAY">DAYS (Hari)</option>
            <option value="WEEK">WEEK (Minggu)</option>
            <option value="MONTH">MONTH (Bulan)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nilai Durasi (Value) *
          </label>
          <input
            v-model.number="newPkgForm.durationValue"
            type="number"
            min="1"
            :max="newPkgForm.durationCode === 'MONTH' ? 12 : (newPkgForm.durationCode === 'WEEK' ? 52 : 365)"
            required
            placeholder="Contoh: 1"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Paket / Template *</label>
        <input
          v-model="newPkgForm.name"
          type="text"
          required
          :placeholder="namePlaceholder"
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
        />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Format Gerai</label>
          <input
            v-model="newPkgForm.targetType"
            type="text"
            placeholder="Semua Gerai / Mall / Kiosk"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
          <input
            v-model="newPkgForm.category"
            type="text"
            placeholder="Standar Operasional"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Paket</label>
        <textarea
          v-model="newPkgForm.description"
          rows="2"
          placeholder="Penjelasan ringkas fokus kurikulum paket..."
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
        ></textarea>
      </div>

      <div class="pt-3 flex items-center justify-end gap-3">
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
          class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Paket' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'

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

const newPkgForm = ref({
  type: 'JOURNEY',
  code: '',
  name: '',
  category: 'Standar Operasional',
  targetType: 'Semua Gerai',
  durationCode: 'WEEK',
  durationValue: 3,
  description: ''
})

const resetForm = (type = 'JOURNEY') => {
  const count = type === 'JOURNEY'
    ? templateStore.journeyTemplates.length
    : (type === 'BUDDY' ? templateStore.buddyTemplates.length : templateStore.feedbackTemplates.length)

  const defaultDurationCode = type === 'JOURNEY' ? 'WEEK' : 'DAY'
  const defaultDurationValue = type === 'JOURNEY' ? 3 : (type === 'BUDDY' ? 3 : 1)

  newPkgForm.value = {
    type,
    code: `TPL-${type}-${String(count + 1).padStart(2, '0')}`,
    name: '',
    category: type === 'JOURNEY' ? 'Standar Operasional' : (type === 'BUDDY' ? 'Orientasi Buddy' : 'Feedback & Evaluasi'),
    targetType: 'Semua Gerai',
    durationCode: defaultDurationCode,
    durationValue: defaultDurationValue,
    description: ''
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    resetForm(props.initialType || 'JOURNEY')
  }
})

const onTypeChange = () => {
  resetForm(newPkgForm.value.type)
}

const modalTitle = computed(() => {
  if (newPkgForm.value.type === 'BUDDY') return 'Buat Template Paket Buddy'
  if (newPkgForm.value.type === 'FEEDBACK') return 'Buat Template Paket Feedback'
  return 'Buat Master Paket Baru (Batch Journey)'
})

const modalSubtitle = computed(() => {
  if (newPkgForm.value.type === 'BUDDY') return 'Definisikan nama, jumlah hari, dan deskripsi paket orientasi kru baru bersama Buddy'
  if (newPkgForm.value.type === 'FEEDBACK') return 'Definisikan nama, format evaluasi, dan butir kuesioner feedback onboarding'
  return 'Definisikan nama, durasi (hari/minggu/bulan), dan format gerai untuk paket template kurikulum ini'
})

const namePlaceholder = computed(() => {
  if (newPkgForm.value.type === 'BUDDY') return 'Contoh: Onboarding Buddy Barista 3 Hari'
  if (newPkgForm.value.type === 'FEEDBACK') return 'Contoh: End-of-Journey Crew Feedback'
  return 'Contoh: Standar Gerai Bandara & Kiosk'
})

const executeCreatePackage = async () => {
  if (!newPkgForm.value.name?.trim()) {
    toast.error('Validasi Gagal', 'Nama paket/template wajib diisi')
    return
  }

  const dVal = Number(newPkgForm.value.durationValue || 1)
  const dCode = newPkgForm.value.durationCode || (newPkgForm.value.type === 'JOURNEY' ? 'WEEK' : 'DAY')

  const payload = {
    code: newPkgForm.value.code?.trim() || `TPL-${newPkgForm.value.type}-${Date.now()}`,
    name: newPkgForm.value.name.trim(),
    type: newPkgForm.value.type,
    durationCode: dCode,
    durationValue: dVal,
    totalWeeks: dCode === 'WEEK' ? dVal : (dCode === 'MONTH' ? dVal * 4 : Math.ceil(dVal / 7)),
    category: newPkgForm.value.category || 'Standar Operasional',
    targetType: newPkgForm.value.targetType || 'Semua Gerai',
    description: newPkgForm.value.description?.trim() || '',
    details: []
  }

  isSubmitting.value = true
  try {
    const created = await templateStore.createPackage(payload)
    emit('update:modelValue', false)
    emit('created', { ...created, ...payload })
    toast.success('Paket Dibuat', `Paket "${created?.name || payload.name}" (${payload.type}) siap digunakan.`)
  } catch (err) {
    toast.error('Gagal Membuat Paket', err.message || 'Terjadi kesalahan')
  } finally {
    isSubmitting.value = false
  }
}
</script>
