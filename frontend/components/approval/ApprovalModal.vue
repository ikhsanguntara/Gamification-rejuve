<template>
  <BaseModal
    :modelValue="modelValue"
    title="Setujui Evaluasi & Cairkan Bintang?"
    :subtitle="item ? `${item.missionCode} • ${item.missionTitle}` : ''"
    max-width="md"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('cancel')"
  >
    <template #icon>
      <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-500">
        <Star class="w-5 h-5 fill-amber-400" />
      </div>
    </template>

    <div v-if="item" class="space-y-3.5 py-1">
      <!-- Crew & Mission Summary Box -->
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Anggota Kru</span>
            <p class="text-sm font-bold text-slate-900 dark:text-white">
              {{ item.crewName || 'Crew Member' }}
            </p>
            <span class="text-[11px] text-[#831843] dark:text-[#f472b6] font-semibold">
              {{ item.crewRole || 'Barista' }} • Week {{ item.week }}
            </span>
          </div>

          <div class="text-right">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Skor Evaluasi
            </span>
            <p class="text-sm font-black text-[#831843] dark:text-[#f472b6]">
              {{ dmScore }}/100
            </p>
            <span class="text-xs text-amber-500 font-bold">
              +{{ finalStars }} ⭐ Bintang
            </span>
          </div>
        </div>

        <!-- Slider for DM Score -->
        <div class="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center justify-between text-[11px]">
            <div class="flex items-center gap-1.5">
              <span class="font-semibold text-slate-700 dark:text-slate-300">
                Input Nilai Baru (DM):
              </span>
              <span
                class="px-2 py-0.5 rounded-full text-[9px] font-extrabold border"
                :class="getScoreTier(dmScore).bgSoftClass"
              >
                {{ getScoreTier(dmScore).label }}
              </span>
            </div>
            <span v-if="isAdjusted" class="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
              (Disesuaikan DM)
            </span>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model.number="dmScore"
              type="range"
              min="0"
              max="100"
              step="1"
              :style="getSliderTrackStyle(dmScore)"
              class="w-full h-2 rounded-full appearance-none cursor-pointer custom-score-slider shadow-inner"
            />
            <div
              class="flex items-center rounded-lg border px-2 py-1 bg-white dark:bg-slate-800 shadow-xs flex-shrink-0"
              :class="getScoreTier(dmScore).borderClass"
            >
              <input
                v-model.number="dmScore"
                type="number"
                min="0"
                max="100"
                step="1"
                class="w-10 text-center font-black text-xs bg-transparent outline-none p-0"
                :class="getScoreTier(dmScore).textClass"
              />
              <span class="text-[10px] text-slate-400 font-bold select-none">/100</span>
            </div>
          </div>

          <!-- Quick Markers -->
          <div class="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 px-0.5 select-none">
            <button type="button" class="hover:text-rose-600 cursor-pointer" @click="dmScore = 0">0</button>
            <button type="button" class="hover:text-rose-500 cursor-pointer" @click="dmScore = 25">25</button>
            <button type="button" class="hover:text-amber-500 cursor-pointer" @click="dmScore = 50">50</button>
            <button type="button" class="hover:text-sky-500 cursor-pointer" @click="dmScore = 75">75</button>
            <button type="button" class="hover:text-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold cursor-pointer" @click="dmScore = 100">100</button>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p class="font-medium text-slate-800 dark:text-slate-200">
            🎯 <strong>{{ item.missionCode }}</strong>: {{ item.missionTitle }}
          </p>
          <p v-if="item.comment" class="italic text-[11px] text-slate-500">
            💬 Catatan SL: "{{ item.comment }}"
          </p>
        </div>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Menyetujui evaluasi ini akan menandai misi sebagai <strong>COMPLETED</strong> dan langsung mencairkan <strong>+{{ finalStars }} Bintang ⭐</strong> ke saldo akun <strong>{{ item.crewName }}</strong>.
      </p>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        Batal
      </button>
      <button
        type="button"
        @click="$emit('confirm', { dmScore, score: finalScore, dmNote })"
        class="inline-flex items-center gap-2 px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white shadow-md shadow-[#831843]/20 transition-all active:scale-95 cursor-pointer"
      >
        <Star class="w-3.5 h-3.5 fill-white" />
        <span>Setujui & Cairkan {{ finalStars }} ⭐</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { calculateStars, calculateAverageDmSl } from '~/utils/star.js'
import { Star } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
})

defineEmits(['update:modelValue', 'confirm', 'cancel'])

const slScore = computed(() => Number(props.item?.slScore ?? props.item?.originalScore ?? props.item?.score ?? props.item?.averageScore ?? 0))
const dmScore = ref(0)
const dmNote = ref('')

watch(() => props.item, (newItem) => {
  if (newItem) {
    const base = Number(newItem.slScore ?? newItem.originalScore ?? newItem.score ?? newItem.averageScore ?? 0)
    dmScore.value = Number(newItem.dmScore ?? base)
    dmNote.value = newItem.dmNote || ''
  }
}, { immediate: true, deep: true })

// Rumus Resmi: Avg(SL + DM) Score -> (Avg/100)*5 dibulatkan 1 angka di belakang koma
const averageCalc = computed(() => calculateAverageDmSl(slScore.value, dmScore.value))
const finalScore = computed(() => averageCalc.value.avgScore)
const finalStars = computed(() => averageCalc.value.stars)
const isAdjusted = computed(() => Number(dmScore.value) !== Number(slScore.value))

function getScoreTier(score) {
  const val = Math.min(100, Math.max(0, Number(score) || 0))
  if (val >= 85) {
    return {
      label: 'Sangat Baik',
      color: '#10b981',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-400 dark:border-emerald-600',
      bgSoftClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    }
  } else if (val >= 70) {
    return {
      label: 'Baik',
      color: '#0284c7',
      textClass: 'text-sky-600 dark:text-sky-400',
      borderClass: 'border-sky-400 dark:border-sky-600',
      bgSoftClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    }
  } else if (val >= 50) {
    return {
      label: 'Cukup',
      color: '#f59e0b',
      textClass: 'text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-400 dark:border-amber-600',
      bgSoftClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    }
  } else {
    return {
      label: 'Kurang',
      color: '#ef4444',
      textClass: 'text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-400 dark:border-rose-600',
      bgSoftClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    }
  }
}

function getSliderTrackStyle(score) {
  const val = Math.min(100, Math.max(0, Number(score) || 0))
  const tier = getScoreTier(val)
  return {
    background: `linear-gradient(to right, ${tier.color} 0%, ${tier.color} ${val}%, rgba(148, 163, 184, 0.28) ${val}%, rgba(148, 163, 184, 0.28) 100%)`,
    accentColor: tier.color,
    color: tier.color
  }
}
</script>

<style scoped>
.custom-score-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid currentColor;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.custom-score-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.custom-score-slider::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid currentColor;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.1s ease;
}
</style>
