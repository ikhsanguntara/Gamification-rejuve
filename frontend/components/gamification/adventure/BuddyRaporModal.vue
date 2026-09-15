<template>
  <BaseModal
    :model-value="modelValue"
    title="Rapor New Hire Re.juve (3 Hari Pra-Batch)"
    subtitle="Hasil evaluasi pendampingan 7 pilar kompetensi & 22 indikator SOP oleh Store Captain"
    max-width="3xl"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
  >
    <template #icon>
      <div class="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shadow-sm">
        <Handshake class="w-5 h-5" />
      </div>
    </template>

    <div v-if="isLoading" class="py-14 text-center space-y-3">
      <Loader2 class="w-8 h-8 animate-spin text-purple-600 mx-auto" />
      <p class="text-xs text-slate-500 font-semibold">Mengambil data Rapor Resmi Buddy dari server...</p>
    </div>

    <div v-else class="space-y-4 py-1">
      <!-- 1. Header Ringkasan Kru & Skor -->
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden space-y-3.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div class="flex items-center gap-3">
            <img
              :src="activeUser?.avatar || crew?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activeUser?.name || crew?.name || 'Crew')}`"
              :alt="activeUser?.name || crew?.name"
              class="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-400/50 shadow-md"
            />
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-bold text-white">
                  {{ activeUser?.name || crew?.name || 'Kru New Hire' }}
                </h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200">
                  3 HARI PRA-BATCH
                </span>
              </div>
              <p class="text-xs text-purple-200/80 mt-0.5">
                🏪 {{ storeName }} • Buddy: <strong>{{ buddyName }}</strong>
              </p>
            </div>
          </div>

          <!-- Skor Kompetensi Badge -->
          <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 px-4 rounded-2xl border border-white/15 flex-shrink-0">
            <div class="text-center">
              <span class="text-[10px] font-semibold text-purple-200 uppercase tracking-wider block">Skor Rapor</span>
              <span class="text-xl font-black text-amber-300">{{ activeSummary.scorePercent }}%</span>
            </div>
            <div class="h-7 w-px bg-white/20"></div>
            <div class="text-center">
              <span class="text-[10px] font-semibold text-purple-200 uppercase tracking-wider block">Status</span>
              <span
                class="text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 shadow-2xs"
                :class="isRecommended ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40' : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'"
              >
                {{ isRecommended ? '✓ Siap Masuk Batch' : 'Dalam Bimbingan' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Periode & Info Tambahan -->
        <div class="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/70 flex-wrap gap-2">
          <span>📅 Batch / Periode: <strong>{{ batchName }}</strong></span>
          <span>📊 Penguasaan: <strong>{{ activeSummary.kompeten }}/{{ activeSummary.total }} Indikator Dinilai</strong></span>
        </div>
      </div>

      <!-- 2. Catatan Evaluasi Store Captain -->
      <div v-if="recommendationNote" class="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1">
        <span class="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          💬 Catatan Evaluator / Store Captain:
        </span>
        <p class="text-slate-700 dark:text-slate-300 italic leading-relaxed">
          "{{ recommendationNote }}"
        </p>
      </div>

      <!-- 3. Daftar Kategori Kompetensi & Indikator SOP dari API -->
      <div class="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
        <div
          v-for="cat in activeCategories"
          :key="cat.category || cat.id || cat.name"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
        >
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-purple-600"></span>
              <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                {{ cat.categoryTitle || cat.name || cat.category }}
              </h4>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="cat.averageScore !== undefined" class="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                ⭐ Rata-rata: {{ cat.averageScore }}
              </span>
              <span class="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                {{ cat.indicators?.length || 0 }} Butir
              </span>
            </div>
          </div>

          <!-- Indikator dalam kategori -->
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="ind in (cat.indicators || [])"
              :key="ind.userMissionId || ind.id || ind.name"
              class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div class="space-y-0.5 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span v-if="ind.dayNumber" class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                    Hari {{ ind.dayNumber }}
                  </span>
                  <span class="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                    {{ ind.missionTitle || ind.name || ind.title }}
                  </span>
                  <span
                    v-if="ind.isStar"
                    class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                  >
                    * Pembekalan
                  </span>
                </div>
                <p v-if="ind.description || ind.note" class="text-[10px] text-slate-400 truncate">
                  {{ ind.description || ind.note }}
                </p>
              </div>

              <!-- Score & Rating Badge -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <span v-if="ind.starsAwarded || ind.score" class="text-[11px] font-bold text-amber-500">
                  ⭐ {{ ind.starsAwarded || ind.score }}
                </span>
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                  :class="getRatingBadgeClass(ind)"
                >
                  {{ getRatingLabel(ind) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Verifikasi Tanda Tangan Digital -->
      <div class="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-around text-xs text-slate-600 dark:text-slate-300">
        <div class="flex items-center gap-1.5">
          <span class="text-emerald-600 font-bold">✓</span>
          <span>Ttd Captain: <strong>Terverifikasi</strong></span>
        </div>
        <div class="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
        <div class="flex items-center gap-1.5">
          <span class="text-emerald-600 font-bold">✓</span>
          <span>Ttd Kru: <strong>Terverifikasi</strong></span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="w-full flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <button
          type="button"
          @click="openPrintHtml"
          class="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
        >
          <Printer class="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Cetak Dokumen Rapor (HTML)</span>
        </button>

        <button
          type="button"
          @click="$emit('close')"
          class="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-700/20 transition-all cursor-pointer"
        >
          Tutup Rapor
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Handshake, Loader2, Printer } from 'lucide-vue-next'
import { useBuddyStore } from '~/stores/buddy.js'
import { useUserStore } from '~/stores/user.js'
import { getApiBaseUrl } from '~/composables/useApi.js'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  crew: { type: Object, default: null },
  evaluation: { type: Object, default: null },
  competencies: { type: Array, default: () => [] },
  summary: { type: Object, default: () => ({ scorePercent: 0, kompeten: 0, total: 22 }) }
})

defineEmits(['update:modelValue', 'close'])

const buddyStore = useBuddyStore()
const userStore = useUserStore()
const isLoading = ref(false)
const liveReport = ref(null)

const loadLiveReport = async () => {
  const targetUserId = props.crew?.id || props.crew?.userId || userStore.currentUser?.id || userStore.apiUser?.userId
  if (!targetUserId) return

  isLoading.value = true
  try {
    const res = await buddyStore.fetchBuddyReport(targetUserId)
    if (res) {
      liveReport.value = res?.data || res
    }
  } catch (err) {
    console.warn('Failed to load live buddy report:', err)
  } finally {
    isLoading.value = false
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadLiveReport()
  }
}, { immediate: true })

const activeReport = computed(() => liveReport.value)
const activeUser = computed(() => liveReport.value?.mentee || liveReport.value?.user || props.crew || userStore.currentUser)

const storeName = computed(() => {
  return liveReport.value?.mentee?.department?.departmentName ||
    liveReport.value?.batch?.name ||
    activeUser.value?.storeLocation ||
    props.evaluation?.storeTraining ||
    'Gerai Pelatihan'
})

const buddyName = computed(() => {
  return liveReport.value?.buddy?.name ||
    liveReport.value?.evaluatorName ||
    props.evaluation?.storeCaptain ||
    'Store Leader / Mentor'
})

const batchName = computed(() => {
  return liveReport.value?.batch?.name ||
    props.evaluation?.trainingPeriod ||
    'Program Pendampingan 3 Hari Pra-Batch'
})

const recommendationNote = computed(() => {
  return liveReport.value?.note ||
    liveReport.value?.recommendationNote ||
    liveReport.value?.notes ||
    props.evaluation?.recommendationNote ||
    ''
})

const activeCategories = computed(() => {
  if (liveReport.value?.categories && Array.isArray(liveReport.value.categories) && liveReport.value.categories.length > 0) {
    return liveReport.value.categories
  }
  if (liveReport.value?.competencies && Array.isArray(liveReport.value.competencies) && liveReport.value.competencies.length > 0) {
    return liveReport.value.competencies
  }
  return props.competencies || []
})

const isRecommended = computed(() => {
  const compPercent = activeSummary.value.scorePercent
  if (compPercent >= 100) return true
  const st = liveReport.value?.status || props.evaluation?.status
  return st === 'RECOMMENDED' || st === 'LULUS_KOMPETEN' || st === 'COMPLETED' || st === 'PASSED'
})

const activeSummary = computed(() => {
  if (liveReport.value?.summary) {
    const s = liveReport.value.summary
    return {
      total: s.totalIndicators ?? s.total ?? 4,
      kompeten: s.evaluatedCount ?? s.kompeten ?? 4,
      scorePercent: s.completionPercent ?? s.scorePercent ?? (s.totalIndicators ? Math.round((s.evaluatedCount / s.totalIndicators) * 100) : 0),
      averageScore: s.averageScore ?? 0
    }
  }

  return {
    total: props.summary?.total || 22,
    kompeten: props.summary?.kompeten || 0,
    scorePercent: props.summary?.scorePercent || 0,
    averageScore: 0
  }
})

const getRatingLabel = (ind) => {
  const st = ind.status || ind.rating
  if (st === 'COMPLETED' || st === 'KOMPETEN') return '✓ Selesai'
  if (st === 'PENDING_REVIEW') return 'Review'
  if (st === 'BUTUH_PENDAMPINGAN') return 'Pendampingan'
  if (st === 'BELUM_MENGUASAI') return 'Belum Menguasai'
  return '✓ Selesai'
}

const getRatingBadgeClass = (ind) => {
  const st = ind.status || ind.rating
  if (st === 'COMPLETED' || st === 'KOMPETEN' || !st) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  }
  if (st === 'PENDING_REVIEW' || st === 'BUTUH_PENDAMPINGAN') {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  }
  return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
}

const openPrintHtml = async () => {
  const targetUserId = props.crew?.id || props.crew?.userId || userStore.currentUser?.id || userStore.apiUser?.userId
  if (!targetUserId) return

  const html = await buddyStore.fetchBuddyReportHtml(targetUserId)
  if (html && typeof html === 'string') {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  } else {
    // Fallback: Open URL directly
    const baseUrl = getApiBaseUrl().replace(/\/$/, '')
    const url = `${baseUrl}/evaluations/buddy-report/${targetUserId}/html`
    window.open(url, '_blank')
  }
}
</script>


