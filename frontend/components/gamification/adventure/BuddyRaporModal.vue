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

    <div class="space-y-4 py-1">
      <!-- 1. Header Ringkasan Kru & Skor -->
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden space-y-3.5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div class="flex items-center gap-3">
            <img
              :src="crew?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'"
              :alt="crew?.name"
              class="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-400/50 shadow-md"
            />
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base sm:text-lg font-bold text-white">
                  {{ crew?.name || 'Kru New Hire' }}
                </h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400/40 text-purple-200">
                  3 HARI PRA-BATCH
                </span>
              </div>
              <p class="text-xs text-purple-200/80 mt-0.5">
                🏪 {{ evaluation?.storeTraining || 'Re.juve Grand Indonesia' }} • Buddy: <strong>{{ evaluation?.storeCaptain || 'Budi Santoso (Store Leader)' }}</strong>
              </p>
            </div>
          </div>

          <!-- Skor Kompetensi Badge -->
          <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 px-4 rounded-2xl border border-white/15 flex-shrink-0">
            <div class="text-center">
              <span class="text-[10px] font-semibold text-purple-200 uppercase tracking-wider block">Skor Rapor</span>
              <span class="text-xl font-black text-amber-300">{{ summary.scorePercent }}%</span>
            </div>
            <div class="h-7 w-px bg-white/20"></div>
            <div class="text-center">
              <span class="text-[10px] font-semibold text-purple-200 uppercase tracking-wider block">Status</span>
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5"
                :class="evaluation?.status === 'RECOMMENDED' ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40' : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'"
              >
                {{ evaluation?.status === 'RECOMMENDED' ? '✓ Siap Masuk Batch' : 'Dalam Bimbingan' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Periode & Info Tambahan -->
        <div class="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-purple-200/70 flex-wrap gap-2">
          <span>📅 Periode: <strong>{{ evaluation?.trainingPeriod || '1 - 3 September 2026' }}</strong></span>
          <span>📊 Penguasaan: <strong>{{ summary.kompeten }}/22 Indikator Kompeten</strong></span>
        </div>
      </div>

      <!-- 2. Catatan Evaluasi Store Captain -->
      <div v-if="evaluation?.recommendationNote" class="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1">
        <span class="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
          💬 Catatan Evaluator / Store Captain:
        </span>
        <p class="text-slate-700 dark:text-slate-300 italic leading-relaxed">
          "{{ evaluation.recommendationNote }}"
        </p>
      </div>

      <!-- 3. Daftar 7 Pilar Kompetensi & 22 Indikator SOP -->
      <div class="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
        <div
          v-for="comp in competencies"
          :key="comp.id"
          class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
        >
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-purple-600"></span>
              <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                {{ comp.name }}
              </h4>
            </div>
            <span class="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
              {{ comp.indicators?.length || 0 }} Butir
            </span>
          </div>

          <!-- Indikator dalam kompetensi -->
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="ind in (comp.indicators || [])"
              :key="ind.id"
              class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div class="space-y-0.5 min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                    {{ ind.name }}
                  </span>
                  <span
                    v-if="ind.isStar"
                    class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                  >
                    * Pembekalan
                  </span>
                </div>
                <p v-if="ind.description" class="text-[10px] text-slate-400 truncate">
                  {{ ind.description }}
                </p>
              </div>

              <!-- Rating Badge -->
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                :class="getRatingBadgeClass(evaluation?.indicatorRatings?.[ind.id])"
              >
                {{ getRatingLabel(evaluation?.indicatorRatings?.[ind.id]) }}
              </span>
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
      <button
        type="button"
        @click="$emit('close')"
        class="w-full sm:w-auto px-6 py-2.5 text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white shadow-md shadow-purple-700/20 transition-all cursor-pointer"
      >
        Tutup Rapor
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Handshake } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  crew: { type: Object, default: null },
  evaluation: { type: Object, default: null },
  competencies: { type: Array, default: () => [] },
  summary: { type: Object, default: () => ({ scorePercent: 91, kompeten: 20 }) }
})

defineEmits(['update:modelValue', 'close'])

const getRatingLabel = (rating) => {
  if (rating === 'KOMPETEN') return '✓ Kompeten'
  if (rating === 'BUTUH_PENDAMPINGAN') return 'Butuh Pendampingan'
  if (rating === 'BELUM_MENGUASAI') return 'Belum Menguasai'
  return '✓ Kompeten'
}

const getRatingBadgeClass = (rating) => {
  if (rating === 'KOMPETEN' || !rating) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  if (rating === 'BUTUH_PENDAMPINGAN') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
}
</script>
