<template>
  <BaseModal
    :modelValue="modelValue"
    :title="isEditing ? 'Edit Pertanyaan Survei' : 'Tambah Pertanyaan Survei Baru'"
    subtitle="Kuesioner evaluasi pengalaman onboarding & pendampingan kru baru"
    max-width="md"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="executeSaveSurveyQuestion" class="space-y-3 py-2">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Pertanyaan *</label>
          <input
            v-model="form.category"
            type="text"
            required
            placeholder="Contoh: Peran Buddy, Teamwork, Budaya"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Input Jawaban</label>
          <select
            v-model="form.type"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer font-bold"
          >
            <option value="SCALE_0_10">Rating Skala 0 s/d 10</option>
            <option value="ESSAY">Input Esai Deskriptif</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Teks Pertanyaan Kuesioner *</label>
        <textarea
          v-model="form.text"
          rows="3"
          required
          placeholder="Tuliskan butir pernyataan kuesioner..."
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 resize-none"
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
          class="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
        >
          {{ isEditing ? 'Simpan Perubahan' : 'Tambah Pertanyaan' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useToast } from '~/composables/useToast.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  editingQuestion: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const feedbackStore = useFeedbackStore()
const toast = useToast()

const isEditing = computed(() => Boolean(props.editingQuestion))

const form = ref({
  category: '',
  type: 'SCALE_0_10',
  text: ''
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.editingQuestion) {
      form.value = {
        category: props.editingQuestion.category || '',
        type: props.editingQuestion.type || 'SCALE_0_10',
        text: props.editingQuestion.text || ''
      }
    } else {
      form.value = {
        category: '',
        type: 'SCALE_0_10',
        text: ''
      }
    }
  }
})

const executeSaveSurveyQuestion = () => {
  if (!form.value.text.trim()) return

  if (isEditing.value) {
    feedbackStore.updateQuestion(props.editingQuestion.id, {
      category: form.value.category.trim(),
      type: form.value.type,
      text: form.value.text.trim()
    })
    toast.success('Pertanyaan Diperbarui', 'Butir kuesioner berhasil diperbarui.')
  } else {
    feedbackStore.addQuestion({
      category: form.value.category.trim() || 'Umum',
      type: form.value.type,
      text: form.value.text.trim()
    })
    toast.success('Pertanyaan Ditambahkan', 'Butir kuesioner baru berhasil disimpan.')
  }

  emit('update:modelValue', false)
  emit('saved', { ...form.value })
}
</script>
