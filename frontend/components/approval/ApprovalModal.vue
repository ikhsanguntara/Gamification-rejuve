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
            <span class="font-semibold text-slate-700 dark:text-slate-300">
              Input Nilai Baru (DM):
            </span>
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
              class="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#831843]"
            />
            <input
              v-model.number="dmScore"
              type="number"
              min="0"
              max="100"
              class="w-14 text-center font-bold text-xs py-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
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
import { calculateStars } from '~/utils/star.js'
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

const slScore = computed(() => Number(props.item?.slScore ?? props.item?.originalScore ?? props.item?.score ?? props.item?.averageScore ?? 90))
const dmScore = ref(90)
const dmNote = ref('')

watch(() => props.item, (newItem) => {
  if (newItem) {
    const base = Number(newItem.slScore ?? newItem.originalScore ?? newItem.score ?? newItem.averageScore ?? 90)
    dmScore.value = Number(newItem.dmScore ?? base)
    dmNote.value = newItem.dmNote || ''
  }
}, { immediate: true, deep: true })

// Rumus: (SL + DM) / 2
const finalScore = computed(() => Math.round((slScore.value + Number(dmScore.value)) / 2))
const finalStars = computed(() => calculateStars(finalScore.value))
const isAdjusted = computed(() => Number(dmScore.value) !== Number(slScore.value))
</script>
