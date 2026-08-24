<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6">
    <div class="flex items-center justify-between mb-5">
      <div>
        <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Recent Activity Feed
        </h3>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Live stream of evaluations, reviews, and star awards
        </p>
      </div>
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
    </div>

    <div class="space-y-4">
      <div
        v-for="act in activities"
        :key="act.id"
        class="flex items-start gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 last:pb-0"
      >
        <!-- Activity Icon -->
        <div
          class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          :class="getActivityBg(act.type)"
        >
          <Star v-if="act.type === 'award'" class="w-4 h-4 text-amber-500 fill-amber-400" />
          <CheckCircle2 v-else-if="act.type === 'approve'" class="w-4 h-4 text-emerald-500" />
          <RotateCcw v-else-if="act.type === 'revision'" class="w-4 h-4 text-rose-500" />
          <ClipboardCheck v-else class="w-4 h-4 text-blue-500" />
        </div>

        <!-- Activity Body -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
            <span class="text-slate-900 dark:text-white font-bold">{{ act.actor }}</span>
            {{ act.action }}
            <span class="text-amber-600 dark:text-amber-400 font-semibold">"{{ act.target }}"</span>
          </p>
          <p v-if="act.details" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 italic">
            "{{ act.details }}"
          </p>
          <div class="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
            <span>{{ act.time }}</span>
            <span v-if="act.badge" class="font-bold text-amber-500 flex items-center gap-0.5">
              ⭐ {{ act.badge }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useApprovalStore } from '~/stores/approval.js'
import {
  Star,
  CheckCircle2,
  RotateCcw,
  ClipboardCheck
} from 'lucide-vue-next'

const approvalStore = useApprovalStore()

const activities = computed(() => approvalStore.allActivities)

const getActivityBg = (type) => {
  switch (type) {
    case 'award': return 'bg-amber-100 dark:bg-amber-950/60'
    case 'approve': return 'bg-emerald-100 dark:bg-emerald-950/60'
    case 'revision': return 'bg-rose-100 dark:bg-rose-950/60'
    default: return 'bg-blue-100 dark:bg-blue-950/60'
  }
}
</script>
