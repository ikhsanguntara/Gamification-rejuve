<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Sisi Kiri: Daftar Template Feedback -->
    <div class="lg:col-span-4 space-y-3">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Daftar Template Feedback ({{ templateStore.feedbackTemplates.length }})
        </h3>
      </div>

      <div class="space-y-2">
        <!-- Live Feedback Templates from Backend -->
        <div
          v-for="fpkg in templateStore.feedbackTemplates"
          :key="fpkg.id"
          @click="selectFeedbackPackageTab(fpkg.id)"
          class="p-4 rounded-2xl border transition-all cursor-pointer relative"
          :class="[
            selectedFeedbackPkgId === fpkg.id
              ? 'border-blue-600 bg-white dark:bg-slate-900 ring-2 ring-blue-600/40 shadow-xs'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
          ]"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono">
              {{ fpkg.code }}
            </span>
            <span class="text-[10px] text-slate-400 font-semibold">
              {{ getQuestionsCount(fpkg) }} Butir Evaluasi
            </span>
          </div>

          <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
            {{ fpkg.name }}
          </h4>

          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-medium">📋 Kuesioner Feedback</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click.stop="confirmDeleteFeedbackPkg(fpkg)"
                title="Hapus Template"
                class="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="templateStore.feedbackTemplates.length === 0"
          class="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 p-4"
        >
          <p>Belum ada paket template feedback.</p>
          <button
            type="button"
            @click="$emit('open-create')"
            class="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-100 cursor-pointer"
          >
            + Buat Template Pertama
          </button>
        </div>
      </div>
    </div>

    <!-- Sisi Kanan: Detail & Daftar Pertanyaan Kuesioner (List Vertikal, Bukan Tab) -->
    <div class="lg:col-span-8">
      <div v-if="activeFeedbackPkg" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <!-- Header Detail Template -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-mono">
                {{ activeFeedbackPkg.code || 'TPL-FEEDBACK' }}
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                {{ activeFeedbackPkg.name || 'Template Feedback' }}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                {{ activeFeedbackPkg.durationValue || 1 }} {{ activeFeedbackPkg.durationCode === 'MONTH' ? 'Bulan' : 'Hari' }}
              </span>
              <span v-if="isCardLoading" class="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
                <Loader2 class="w-3 h-3 animate-spin" /> Memuat detail...
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              @click="$emit('open-edit', activeFeedbackPkg)"
              class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <Edit3 class="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Template</span>
            </button>
          </div>
        </div>

        <!-- Banner Informasi Format Kuesioner -->
        <div class="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
          <span class="text-base leading-none mt-0.5">📋</span>
          <div>
            <span class="font-bold">Format Survei Onboarding:</span>
            <span class="ml-1 text-[11px] opacity-90">
              Kuesioner disusun berurutan dalam satu list untuk diisi oleh kru baru di akhir periode onboarding. Terdiri dari butir skala penilaian (0–10) dan masukan kualitatif (esai).
            </span>
          </div>
        </div>

        <!-- Header List Pertanyaan -->
        <div class="flex items-center justify-between px-1">
          <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>Daftar Pertanyaan Kuesioner</span>
            <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
              {{ questionsList.length }} Butir
            </span>
          </h4>
        </div>

        <!-- Items List Pertanyaan (List Vertikal) -->
        <div class="space-y-3">
          <div
            v-for="(q, idx) in questionsList"
            :key="q.id || idx"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-2xs hover:border-blue-300 dark:hover:border-blue-800 transition-all"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1.5 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-blue-600 dark:text-blue-400 font-mono font-bold text-[11px]">
                    #{{ idx + 1 }}
                  </span>
                  <h5 class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ q.question }}
                  </h5>
                  <span
                    v-if="q.topic"
                    class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex-shrink-0"
                  >
                    {{ q.topic }}
                  </span>
                  <span
                    class="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                    :class="q.inputType === 'TEXT' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'"
                  >
                    {{ q.inputType === 'TEXT' ? 'Esai Masukan' : 'Skala 0–10' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Preview Respon Peserta -->
            <div class="pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div v-if="q.inputType === 'SCALE'" class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[10px] text-slate-400 font-medium mr-1">Preview:</span>
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
                <span class="text-[10px] text-slate-400 font-medium">Preview:</span>
                <span class="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] italic border border-slate-200 dark:border-slate-700">
                  Kolom pengisian masukan esai terbuka untuk kru baru...
                </span>
              </div>
            </div>
          </div>

          <!-- Empty State Jika Pertanyaan Kosong -->
          <div
            v-if="questionsList.length === 0"
            class="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-2"
          >
            <p>Belum ada butir pertanyaan kuesioner pada template ini.</p>
            <button
              type="button"
              @click="$emit('open-edit', activeFeedbackPkg)"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-200 cursor-pointer"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>Edit / Tambah Pertanyaan</span>
            </button>
          </div>
        </div>
      </div>

      <div
        v-else
        class="p-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900"
      >
        Pilih salah satu template feedback di sisi kiri atau buat template feedback baru.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Trash2, Loader2, Edit3 } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'
import { normalizeFeedbackDetails } from '~/utils/feedbackHelper.js'

const props = defineProps({
  selectedFeedbackPkgId: {
    type: String,
    default: ''
  },
  isCardLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'open-create',
  'open-edit',
  'update:selectedFeedbackPkgId',
  'update:loading'
])

const templateStore = useTemplateStore()
const toast = useToast()

const activeFeedbackPkg = computed(() => {
  return templateStore.feedbackTemplates.find(f => f.id === props.selectedFeedbackPkgId)
    || templateStore.feedbackTemplates[0]
    || null
})

const getQuestionsCount = (pkg) => {
  if (pkg.details && pkg.details.length > 0) return pkg.details.length
  if (pkg.templates && pkg.templates.length > 0) return pkg.templates.length
  return 0
}

const questionsList = computed(() => {
  if (!activeFeedbackPkg.value) return []
  const details = activeFeedbackPkg.value.details || activeFeedbackPkg.value.templates || []
  return normalizeFeedbackDetails(details)
})

const selectFeedbackPackageTab = async (fpkgId) => {
  emit('update:selectedFeedbackPkgId', fpkgId)
  emit('update:loading', true)
  try {
    await templateStore.fetchTemplateById(fpkgId, 'FEEDBACK')
  } finally {
    emit('update:loading', false)
  }
}

const confirmDeleteFeedbackPkg = async (fpkg) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Template Feedback?',
    text: `Apakah Anda yakin ingin menghapus template "${fpkg.name}"?`,
    confirmButtonText: 'Ya, Hapus Template'
  })

  if (isConfirmed) {
    await templateStore.deletePackage(fpkg.id, 'FEEDBACK')
    const nextId = templateStore.feedbackTemplates[0]?.id || ''
    emit('update:selectedFeedbackPkgId', nextId)
    toast.success('Template Dihapus', `Template "${fpkg.name}" telah dihapus.`)
  }
}

defineExpose({
  activeFeedbackPkg
})
</script>
