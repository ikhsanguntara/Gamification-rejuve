<template>
  <BaseModal
    :modelValue="modelValue"
    title="Tambah Indikator Rapor New Hire"
    subtitle="Tambahkan butir kompetensi standar operasional Re.juve"
    max-width="sm"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="executeSaveRaporIndicator" class="space-y-3 py-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Butir Indikator Penilaian *</label>
        <textarea
          v-model="form.text"
          rows="2"
          required
          placeholder="Contoh: Menjelaskan batas toleransi suhu chiller 2-4°C"
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 resize-none"
        ></textarea>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <input
          id="chkMandatory"
          v-model="form.isMandatoryIntro"
          type="checkbox"
          class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label for="chkMandatory" class="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          Poin Bertanda Bintang (*) Wajib Pembekalan
        </label>
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
          class="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
        >
          Simpan Indikator
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useToast } from '~/composables/useToast.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  competencyId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const feedbackStore = useFeedbackStore()
const toast = useToast()

const form = ref({
  text: '',
  isMandatoryIntro: false
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    form.value = {
      text: '',
      isMandatoryIntro: false
    }
  }
})

const executeSaveRaporIndicator = () => {
  if (!props.competencyId || !form.value.text.trim()) return

  feedbackStore.addIndicator(props.competencyId, {
    text: form.value.text.trim(),
    isMandatoryIntro: form.value.isMandatoryIntro
  })

  emit('update:modelValue', false)
  emit('saved', { ...form.value })
  toast.success('Indikator Ditambahkan', 'Butir penilaian berhasil ditambahkan ke format Rapor.')
}
</script>
