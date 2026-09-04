<template>
  <BaseModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEditMode ? 'Edit Template Paket Feedback' : 'Buat Template Paket Feedback Baru'"
    :subtitle="isEditMode ? 'Perbarui konfigurasi header dan butir kuesioner evaluasi onboarding.' : 'Susun butir kuesioner evaluasi onboarding kru 1 bulan (Skala 0–10 & Esai).'"
    max-width="5xl"
  >
    <form id="feedback-template-form" @submit.prevent="executeSaveAll" class="space-y-6">
      <!-- ========================================== -->
      <!-- BAGIAN 1: HEADER & METADATA PAKET FEEDBACK -->
      <!-- ========================================== -->
      <div class="p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div class="flex items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-600 text-white">
              FEEDBACK
            </span>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
              {{ form.code || 'TPL-FEEDBACK' }}
            </span>
          </div>
          <span class="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
            Evaluasi Onboarding (durationNumber: 1)
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
              placeholder="Contoh: TPL-FEEDBACK-01"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-600 uppercase"
            />
          </div>

          <div class="sm:col-span-8">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Paket Kuesioner *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Feedback Pengalaman Onboarding Rejuve (1 Bulan)"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div class="sm:col-span-4">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Satuan Durasi *
            </label>
            <select
              v-model="form.durationCode"
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="MONTH">Bulan (MONTH)</option>
              <option value="DAY">Hari (DAY)</option>
            </select>
          </div>

          <div class="sm:col-span-3">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Lama Evaluasi *
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="form.durationValue"
                type="number"
                min="1"
                required
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-600"
              />
              <span class="text-xs text-slate-400 font-bold whitespace-nowrap">
                {{ form.durationCode === 'MONTH' ? 'Bulan' : 'Hari' }}
              </span>
            </div>
          </div>

          <div class="sm:col-span-5">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi / Petunjuk Pengisian
            </label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Petunjuk pembuka untuk kru..."
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- BAGIAN 2: DAFTAR BUTIR PERTANYAAN KUESIONER-->
      <!-- ========================================== -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span>Daftar Butir Pertanyaan Kuesioner</span>
              <span class="px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                {{ questions.length }} Butir Pertanyaan
              </span>
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Pertanyaan disusun berurutan dalam satu list terpadu tanpa pembagian tab.
            </p>
          </div>

          <button
            type="button"
            @click="addNewQuestion"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer self-start sm:self-auto active:scale-95"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Tambah Pertanyaan</span>
          </button>
        </div>

        <!-- List Pertanyaan Form Rows -->
        <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          <div
            v-for="(q, idx) in questions"
            :key="q.tempId || idx"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 hover:border-blue-200 transition-all"
          >
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
              <!-- Nomor Urut -->
              <div class="sm:col-span-1 flex items-center pt-2">
                <span class="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center font-mono">
                  #{{ idx + 1 }}
                </span>
              </div>

              <!-- Kalimat Pertanyaan -->
              <div class="sm:col-span-6 space-y-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Kalimat Pertanyaan Survei *
                </label>
                <textarea
                  v-model="q.question"
                  rows="2"
                  required
                  placeholder="Contoh: Training mudah dipahami dan membantu saya mengenal produk..."
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-blue-600 resize-none"
                ></textarea>
              </div>

              <!-- Tipe Input -->
              <div class="sm:col-span-2 space-y-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tipe Input *
                </label>
                <select
                  v-model="q.inputType"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="SCALE">SCALE (Skala 0–10)</option>
                  <option value="TEXT">TEXT (Esai Bebas)</option>
                </select>
              </div>

              <!-- Topik / Kategori -->
              <div class="sm:col-span-2 space-y-1">
                <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Topik / Aspek
                </label>
                <input
                  v-model="q.topic"
                  type="text"
                  list="topic-options"
                  placeholder="Contoh: Peran Buddy"
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-600"
                />
                <datalist id="topic-options">
                  <option v-for="t in FEEDBACK_TOPIC_OPTIONS" :key="t" :value="t" />
                </datalist>
              </div>

              <!-- Tombol Hapus -->
              <div class="sm:col-span-1 flex items-center justify-end pt-2">
                <button
                  type="button"
                  @click="confirmRemoveQuestion(q, idx + 1)"
                  class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Hapus Pertanyaan"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Preview Respon Peserta Sesuai Tipe Input -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div v-if="q.inputType === 'SCALE'" class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[10px] text-slate-400 font-medium mr-1">Preview Respon:</span>
                <span class="text-[10px] text-slate-400 font-semibold italic">0 (Sangat Tidak Setuju)</span>
                <span
                  v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9]"
                  :key="n"
                  class="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center"
                >
                  {{ n }}
                </span>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold italic">10 (Sangat Setuju)</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <span class="text-[10px] text-slate-400 font-medium">Preview Respon:</span>
                <span class="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] italic border border-slate-200 dark:border-slate-700">
                  Kolom input teks esai masukan terbuka untuk kru...
                </span>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="questions.length === 0"
            class="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
          >
            <p>Belum ada butir pertanyaan kuesioner.</p>
            <button
              type="button"
              @click="addNewQuestion"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-200 cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Pertanyaan Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </form>

    <!-- STICKY FOOTER -->
    <template #footer>
      <div class="w-full flex items-center justify-between gap-3 flex-wrap">
        <p class="text-[11px] text-slate-400">
          * Seluruh konfigurasi evaluasi dan {{ questions.length }} butir pertanyaan akan disimpan serentak ke API.
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
            form="feedback-template-form"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Template Feedback' }}</span>
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
import {
  FEEDBACK_TOPIC_OPTIONS,
  normalizeFeedbackDetails,
  compileFeedbackDetailsForApi
} from '~/utils/feedbackHelper.js'

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

const form = ref({
  id: '',
  code: '',
  name: '',
  type: 'FEEDBACK',
  durationCode: 'MONTH',
  durationValue: 1,
  description: ''
})

const questions = ref([])

const isEditMode = computed(() => Boolean(form.value.id))

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.template) {
      // Mode Edit
      form.value = {
        id: props.template.id || props.template.tplMissionId,
        code: props.template.code || 'TPL-FEEDBACK-01',
        name: props.template.name || '',
        type: 'FEEDBACK',
        durationCode: props.template.durationCode || 'MONTH',
        durationValue: Number(props.template.durationValue || 1),
        description: props.template.description || ''
      }

      const sourceDetails = props.template.details || props.template.templates || []
      questions.value = normalizeFeedbackDetails(sourceDetails)
    } else {
      // Mode Create Baru (Bersih dan Kosong)
      form.value = {
        id: '',
        code: '',
        name: '',
        type: 'FEEDBACK',
        durationCode: 'MONTH',
        durationValue: 1,
        description: ''
      }

      questions.value = []
    }
  }
})

const addNewQuestion = () => {
  const nextNum = questions.value.length + 1
  questions.value.push({
    id: `fb-${Date.now()}-${nextNum}`,
    tempId: `fb-${Date.now()}-${nextNum}`,
    question: '',
    inputType: 'SCALE',
    topic: 'Umum',
    category: 'SOFT_SKILL'
  })
}

const confirmRemoveQuestion = async (q, questionNumber) => {
  const confirmed = await confirmDeleteDialog({
    title: `Hapus Pertanyaan #${questionNumber}?`,
    text: `Yakin ingin menghapus butir "${q.question ? (q.question.slice(0, 40) + '...') : 'Pertanyaan'}" dari template?`,
    confirmButtonText: 'Ya, Hapus'
  })

  if (confirmed) {
    removeQuestion(q)
    toast.success('Pertanyaan Dihapus', `Pertanyaan #${questionNumber} berhasil dihapus.`)
  }
}

const removeQuestion = (q) => {
  const idx = questions.value.findIndex(item => item === q || item.tempId === q.tempId)
  if (idx !== -1) {
    questions.value.splice(idx, 1)
  }
}

const executeSaveAll = async () => {
  if (!form.value.name?.trim()) {
    toast.error('Validasi Gagal', 'Nama paket kuesioner feedback wajib diisi.')
    return
  }

  for (let i = 0; i < questions.value.length; i++) {
    const q = questions.value[i]
    if (!q.question?.trim()) {
      toast.error('Validasi Gagal', `Pertanyaan #${i + 1} masih kosong.`)
      return
    }
  }

  const compiledDetails = compileFeedbackDetailsForApi(questions.value)
  const pkgCode = form.value.code?.trim() || `TPL-FEEDBACK-${Date.now().toString().slice(-6)}`

  const fullPayload = {
    code: pkgCode,
    name: form.value.name.trim(),
    type: 'FEEDBACK',
    durationCode: form.value.durationCode,
    durationValue: Number(form.value.durationValue || 1),
    totalWeeks: 1,
    description: form.value.description?.trim() || '',
    category: 'Feedback Onboarding',
    targetType: 'Semua Gerai',
    details: compiledDetails
  }

  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      const updated = await templateStore.updatePackage(form.value.id, fullPayload)
      emit('update:modelValue', false)
      emit('updated', updated || { id: form.value.id, ...fullPayload })
      toast.success('Template Feedback Diperbarui', `Kuesioner "${form.value.name}" berhasil diperbarui.`)
    } else {
      const created = await templateStore.createPackage(fullPayload)
      emit('update:modelValue', false)
      emit('created', created || fullPayload)
      toast.success('Template Feedback Dibuat', `Kuesioner "${form.value.name}" berhasil dibuat dengan ${compiledDetails.length} butir pertanyaan.`)
    }
  } catch (err) {
    toast.error('Gagal Menyimpan Kuesioner', err.message || 'Terjadi kesalahan saat simpan ke API.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
