<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Sisi Kiri: Selector Sub-Kategori Feedback & Rapor -->
    <div class="lg:col-span-4 space-y-3">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Template Feedback ({{ templateStore.feedbackTemplates.length }})
        </h3>
        <button
          type="button"
          @click="$emit('open-create')"
          class="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
        >
          + Paket Baru
        </button>
      </div>

      <div class="space-y-2">
        <!-- Live Feedback Templates from Backend -->
        <div
          v-for="fpkg in templateStore.feedbackTemplates"
          :key="fpkg.id"
          @click="selectFeedbackPackageTab(fpkg.id)"
          class="p-4 rounded-2xl border transition-all cursor-pointer relative"
          :class="[
            activeFeedbackSubTab === 'API_FEEDBACK' && selectedFeedbackPkgId === fpkg.id
              ? 'border-blue-600 bg-white dark:bg-slate-900 ring-2 ring-blue-600/40 shadow-xs'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
          ]"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              {{ fpkg.code }}
            </span>
            <span class="text-[10px] text-slate-400 font-semibold">
              {{ (fpkg.templates || []).length || (fpkg.details || []).length }} Butir Evaluasi
            </span>
          </div>

          <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
            {{ fpkg.name }}
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {{ fpkg.description || 'Kuesioner evaluasi program onboarding oleh Crew' }}
          </p>

          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-medium">📋 Kuesioner Feedback</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click.stop="confirmDeleteFeedbackPkg(fpkg)"
                title="Hapus Template"
                class="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
        </div>
      </div>

        <!-- Divider Format Master -->
        <div class="pt-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Bank Pertanyaan & Format Master
          </span>
        </div>

        <!-- Card 1: Rapor New Hire 7 Kompetensi -->
        <div
          @click="$emit('update:activeFeedbackSubTab', 'RAPOR')"
          class="p-4 rounded-2xl border transition-all cursor-pointer relative"
          :class="[
            activeFeedbackSubTab === 'RAPOR'
              ? 'border-blue-600 bg-white dark:bg-slate-900 ring-2 ring-blue-600/40 shadow-xs'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
          ]"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              RAPOR-07-SOP
            </span>
            <span class="text-[10px] text-slate-400 font-semibold">
              7 Pilar Kompetensi
            </span>
          </div>

          <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
            Rapor New Hire Re.juve (Store Leader)
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            Evaluasi 7 kompetensi inti: Product Knowledge, Service, Sales, Kasir, Store Ops, Food Safety & Attitude.
          </p>
        </div>

        <!-- Card 2: Survei Pengalaman Onboarding 1 Bulan -->
        <div
          @click="$emit('update:activeFeedbackSubTab', 'SURVEY')"
          class="p-4 rounded-2xl border transition-all cursor-pointer relative"
          :class="[
            activeFeedbackSubTab === 'SURVEY'
              ? 'border-blue-600 bg-white dark:bg-slate-900 ring-2 ring-blue-600/40 shadow-xs'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
          ]"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              SURVEY-16-MS
            </span>
            <span class="text-[10px] text-slate-400 font-semibold">
              17 Butir Pertanyaan
            </span>
          </div>

          <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
            Survei Onboarding & Buddy (Kru Baru)
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            Survei kepuasan 360° pengalaman onboarding 1 bulan (16 rating skala 0–10 + 1 masukan esai).
          </p>
        </div>
      </div>
    </div>

    <!-- Sisi Kanan: Detail & Pengaturan Template Feedback / Rapor -->
    <div class="lg:col-span-8">
      
      <!-- SUB-TAB: LIVE API FEEDBACK -->
      <div v-if="activeFeedbackSubTab === 'API_FEEDBACK'" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                {{ activeFeedbackPkg?.code || 'TPL-FEEDBACK' }}
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                {{ activeFeedbackPkg?.name || 'Template Feedback' }}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                {{ activeFeedbackPkg?.durationValue || 1 }} Hari
              </span>
              <span v-if="isCardLoading" class="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
                <Loader2 class="w-3 h-3 animate-spin" /> Memuat detail...
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ activeFeedbackPkg?.description || 'Kuesioner evaluasi program onboarding oleh Crew' }}
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              @click="$emit('open-edit', activeFeedbackPkg)"
              class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <Edit3 class="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Template</span>
            </button>
            <button
              type="button"
              @click="$emit('open-add-survey')"
              class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Pertanyaan Survei</span>
            </button>
          </div>
        </div>

        <!-- Items in this Feedback Template -->
        <div class="space-y-3">
          <div
            v-for="(item, idx) in (activeFeedbackPkg?.templates || [])"
            :key="item.id || idx"
            class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                <h5 class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ item.title || item.missionTitle }}
                </h5>
                <span class="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                  {{ item.category || 'SOFT_SKILL' }}
                </span>
              </div>
              <span class="text-[10px] text-slate-400 font-semibold">
                Tipe Input: {{ item.inputType || 'TEXT' }}
              </span>
            </div>
            <p v-if="item.description" class="text-[11px] text-slate-500 dark:text-slate-400">
              {{ item.description }}
            </p>
          </div>

          <div
            v-if="!activeFeedbackPkg?.templates || activeFeedbackPkg.templates.length === 0"
            class="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl"
          >
            Belum ada butir evaluasi di template ini. Klik "+ Tambah Pertanyaan Survei" di atas.
          </div>
        </div>
      </div>

      <!-- SUB-TAB 1: RAPOR NEW HIRE 7 KOMPETENSI -->
      <div v-else-if="activeFeedbackSubTab === 'RAPOR'" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                RAPOR NEW HIRE RE.JUVE
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                Format Standar Penilaian Store Leader
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ feedbackStore.raporTemplate.specialNotice }}
            </p>
          </div>
        </div>

        <!-- 7 Competencies List -->
        <div class="space-y-4">
          <div
            v-for="(comp, cIdx) in feedbackStore.raporCompetencies"
            :key="comp.id"
            class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-blue-700 dark:text-blue-300">
                  {{ cIdx + 1 }}. {{ comp.name }}
                </span>
                <span class="text-[10px] text-slate-400 font-semibold">
                  ({{ comp.indicators.length }} Indikator)
                </span>
              </div>
              <button
                type="button"
                @click="$emit('open-add-rapor-indicator', comp.id)"
                class="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
              >
                + Tambah Indikator
              </button>
            </div>

            <!-- Indicators Table -->
            <div class="space-y-1.5">
              <div
                v-for="ind in comp.indicators"
                :key="ind.id"
                class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between gap-3 group"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-slate-400 font-bold">•</span>
                  <span class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {{ ind.text }}
                  </span>
                  <span
                    v-if="ind.isMandatoryIntro"
                    class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex-shrink-0"
                  >
                    * Wajib Pembekalan
                  </span>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-[10px] text-slate-400 font-medium hidden sm:inline">
                    [Belum Menguasai / Butuh Pendampingan / Kompeten]
                  </span>
                  <button
                    type="button"
                    @click="deleteRaporIndicator(comp.id, ind.id)"
                    class="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Hapus Indikator"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SUB-TAB 2: SURVEI PENGALAMAN ONBOARDING & BUDDY (MICROSOFT FORMS FORMAT) -->
      <div v-else class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                SURVEI ONBOARDING 1 BULAN
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                Kuesioner Evaluasi Kru Baru
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              16 Butir Skala Likert (0–10: Sangat Tidak Setuju s/d Sangat Setuju) + 1 Pertanyaan Refleksi Esai.
            </p>
          </div>

          <button
            type="button"
            @click="$emit('open-add-survey')"
            class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Tambah Pertanyaan</span>
          </button>
        </div>

        <!-- Questions List -->
        <div class="space-y-2.5">
          <div
            v-for="q in feedbackStore.surveyQuestions"
            :key="q.id"
            class="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 flex items-start justify-between gap-3 group"
          >
            <div class="space-y-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-bold text-blue-600 dark:text-blue-400">
                  No. {{ q.number }}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {{ q.category }}
                </span>
                <span class="text-[10px] font-semibold text-slate-400">
                  {{ q.type === 'SCALE_0_10' ? 'Rating Skala 0–10' : 'Input Esai Deskriptif' }}
                </span>
              </div>

              <p class="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                {{ q.text }}
              </p>
            </div>

            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
              <button
                type="button"
                @click="$emit('open-edit-survey', q)"
                class="p-1.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                title="Edit Pertanyaan"
              >
                <Settings class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="feedbackStore.surveyQuestions.length > 1"
                type="button"
                @click="deleteSurveyQuestion(q.id)"
                class="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                title="Hapus Pertanyaan"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Trash2, Plus, Settings, Loader2, Edit3 } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useToast } from '~/composables/useToast.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'

const props = defineProps({
  selectedFeedbackPkgId: {
    type: String,
    default: ''
  },
  activeFeedbackSubTab: {
    type: String,
    default: 'API_FEEDBACK'
  },
  isCardLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'open-create',
  'open-edit',
  'open-add-survey',
  'open-edit-survey',
  'open-add-rapor-indicator',
  'update:selectedFeedbackPkgId',
  'update:activeFeedbackSubTab',
  'update:loading'
])

const templateStore = useTemplateStore()
const feedbackStore = useFeedbackStore()
const toast = useToast()

const activeFeedbackPkg = computed(() => {
  return templateStore.feedbackTemplates.find(f => f.id === props.selectedFeedbackPkgId)
    || templateStore.feedbackTemplates[0]
    || null
})

const selectFeedbackPackageTab = async (fpkgId) => {
  emit('update:activeFeedbackSubTab', 'API_FEEDBACK')
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
    await templateStore.deletePackage(fpkg.id)
    const nextId = templateStore.feedbackTemplates[0]?.id || ''
    emit('update:selectedFeedbackPkgId', nextId)
    toast.success('Template Dihapus', `Template "${fpkg.name}" telah dihapus.`)
  }
}

const deleteRaporIndicator = (compId, indId) => {
  feedbackStore.deleteIndicator(compId, indId)
  toast.success('Indikator Dihapus', 'Indikator berhasil dihapus dari modul.')
}

const deleteSurveyQuestion = (id) => {
  feedbackStore.deleteQuestion(id)
  toast.success('Pertanyaan Dihapus', 'Butir kuesioner berhasil dihapus.')
}

defineExpose({
  activeFeedbackPkg
})
</script>
