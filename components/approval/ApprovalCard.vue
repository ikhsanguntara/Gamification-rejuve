<template>
  <div
    class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm flex flex-col justify-between transition-all"
    :class="[
      item.status === 'REVISION_REQUIRED'
        ? 'border-rose-300 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/10'
        : item.status === 'APPROVED'
        ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/10 dark:bg-emerald-950/10'
        : ''
    ]"
  >
    <!-- Top: Mission Info & Batch Details -->
    <div>
      <div class="flex items-start justify-between gap-3 mb-4">
        <div>
          <span class="text-[10px] font-bold text-slate-400 block mb-0.5">
            {{ item.missionCode }}
          </span>
          <h4 class="text-sm font-black text-slate-900 dark:text-white">
            {{ item.missionTitle }}
          </h4>
          <span class="text-[11px] text-slate-400 mt-1 block">
            Evaluated by: <strong class="text-slate-700 dark:text-slate-300">{{ item.supervisorName }}</strong>
          </span>
        </div>

        <!-- Status & Week Pill -->
        <div class="flex flex-col items-end gap-1 flex-shrink-0">
          <MissionStatus :status="item.status" />
          <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
            Week {{ item.week }}
          </span>
        </div>
      </div>

      <!-- Evaluated Crew Members Count & Average Score -->
      <div class="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-br from-amber-50/50 via-slate-50 to-transparent dark:from-amber-950/30 dark:via-slate-800/40 border border-amber-200/60 dark:border-amber-800/50 mb-4">
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Store Score</span>
          <span class="text-lg font-black text-slate-900 dark:text-white">{{ item.averageScore || item.score }} / 100</span>
        </div>

        <div class="text-right">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calculated Reward</span>
          <StarReward :stars="item.calculatedStars || 5" size="md" />
        </div>
      </div>

      <!-- Multi-Crew Scores Mini-Roster -->
      <div class="space-y-1.5 mb-4">
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-bold uppercase tracking-wider text-slate-400">
            Assessed Crew Scores ({{ item.crewScores?.length || 0 }})
          </span>
          <span class="text-[10px] text-[#499ec7] dark:text-[#84cded] font-semibold">
            All Crew in Batch
          </span>
        </div>

        <div class="max-h-36 overflow-y-auto space-y-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
          <div
            v-for="cs in item.crewScores"
            :key="cs.crewId"
            class="flex items-center justify-between py-1 px-1.5 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px]"
          >
            <span class="font-bold text-slate-800 dark:text-slate-200 truncate">
              {{ cs.crewName }}
            </span>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="font-extrabold text-slate-900 dark:text-white">{{ cs.score }}/100</span>
              <span class="text-amber-500 font-bold text-[10px]">{{ cs.calculatedStars }}⭐</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Supervisor Comments -->
      <div class="space-y-1 mb-4">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Supervisor Notes
        </span>
        <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
          "{{ item.comment }}"
        </p>
      </div>

      <!-- Evidence Photos -->
      <div v-if="item.evidenceList && item.evidenceList.length > 0" class="space-y-1 mb-4">
        <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Evidence Photos ({{ item.evidenceList.length }})
        </span>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="(ev, idx) in item.evidenceList"
            :key="idx"
            class="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800"
          >
            <img :src="ev.url" :alt="ev.caption" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-slate-950/60 flex items-end p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="text-[9px] text-white truncate">{{ ev.caption }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Revision Note Banner if present -->
      <div
        v-if="item.revisionNote"
        class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 mb-4"
      >
        <span class="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
          Head Revision Instruction:
        </span>
        <p class="text-xs text-rose-800 dark:text-rose-200 italic mt-0.5">
          "{{ item.revisionNote }}"
        </p>
      </div>
    </div>

    <!-- Bottom Actions for Head -->
    <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
      <!-- Pending State Action Buttons -->
      <div v-if="item.status === 'PENDING_REVIEW'" class="grid grid-cols-2 gap-3">
        <button
          type="button"
          @click="$emit('request-revision', item)"
          class="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Request Revision</span>
        </button>

        <button
          type="button"
          @click="$emit('approve', item)"
          class="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[#499ec7] to-[#24779f] hover:from-[#24779f] hover:to-[#1d5e7f] text-white shadow-md shadow-[#499ec7]/20 transition-all active:scale-95"
        >
          <Star class="w-3.5 h-3.5 fill-white" />
          <span>Approve All ({{ item.crewScores?.length || 0 }})</span>
        </button>
      </div>

      <!-- Approved State Badge -->
      <div
        v-else-if="item.status === 'APPROVED'"
        class="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60"
      >
        <CheckCircle2 class="w-4 h-4" />
        <span>Approved & Stars Awarded to All Crew</span>
      </div>

      <!-- Revision Required State -->
      <div
        v-else
        class="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800/60"
      >
        <RotateCcw class="w-4 h-4" />
        <span>Revision In Progress by Supervisor</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import MissionStatus from '~/components/mission/MissionStatus.vue'
import StarReward from '~/components/gamification/StarReward.vue'
import {
  RotateCcw,
  Star,
  CheckCircle2
} from 'lucide-vue-next'

defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['approve', 'request-revision'])
</script>
