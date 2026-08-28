<template>
  <BaseModal
    :modelValue="modelValue"
    title="Approve Store Mission & Award Stars?"
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

    <div v-if="item" class="space-y-4 py-2">
      <!-- Store Mission Summary Box -->
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Assessed Store Crew</span>
          <p class="text-xs font-semibold text-slate-900 dark:text-white">
            {{ item.crewScores?.length || 0 }} Crew Members
          </p>
        </div>
        <div class="text-right">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Average Score</span>
          <p class="text-sm font-bold text-[#831843] dark:text-[#f472b6]">
            {{ item.averageScore || item.score }}/100
          </p>
        </div>
      </div>

      <!-- Crew Scores List -->
      <div class="space-y-1.5">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Crew Members & Star Rewards:
        </span>
        <div class="max-h-40 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div
            v-for="cs in item.crewScores"
            :key="cs.crewId"
            class="flex items-center justify-between py-1 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs"
          >
            <span class="font-medium text-slate-800 dark:text-slate-200 truncate">
              {{ cs.crewName }}
            </span>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="font-semibold text-slate-500">{{ cs.score }}/100</span>
              <span class="text-amber-500 font-semibold">+{{ cs.calculatedStars }} ⭐</span>
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Approving this store mission marks it as <strong>COMPLETED</strong> and immediately awards ⭐ Stars to all <strong>{{ item.crewScores?.length || 0 }} Crew Members</strong>, updating their profiles and Leaderboard rankings.
      </p>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="$emit('confirm')"
        class="inline-flex items-center gap-2 px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white shadow-md shadow-[#831843]/20 transition-all active:scale-95 cursor-pointer"
      >
        <Star class="w-3.5 h-3.5 fill-white" />
        <span>Setujui Seluruh Crew</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '~/components/ui/BaseModal.vue'
import { Star } from 'lucide-vue-next'

defineProps({
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
</script>
