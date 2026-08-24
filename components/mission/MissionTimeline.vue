<template>
  <div class="space-y-4">
    <div class="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      <!-- Step 1: Mission Assigned -->
      <div class="relative">
        <div class="absolute -left-6 top-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
          <Check class="w-3 h-3" />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white">Mission Assigned & Initiated</span>
            <span class="text-[10px] text-slate-400">10 Aug 2026</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mission allocated to {{ crewName || 'Crew' }} for Batch Alpha.
          </p>
        </div>
      </div>

      <!-- Step 2: Supervisor Evaluation -->
      <div v-if="evaluation" class="relative">
        <div
          class="absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 text-white"
          :class="evaluation.score > 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'"
        >
          <Check v-if="evaluation.score > 0" class="w-3 h-3" />
          <Clock v-else class="w-3 h-3" />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white">
              Supervisor Evaluation (Score: {{ evaluation.score }}/100)
            </span>
            <span class="text-[10px] text-slate-400">{{ formatDate(evaluation.evaluatedAt, true) }}</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Evaluated by {{ evaluation.supervisorName }}. Calculated: ⭐ {{ evaluation.calculatedStars }} Stars.
          </p>
        </div>
      </div>

      <!-- Step 3: Revision Cycle if applicable -->
      <template v-if="evaluation && evaluation.revisionHistory && evaluation.revisionHistory.length > 0">
        <div
          v-for="rev in evaluation.revisionHistory"
          :key="rev.id"
          class="relative"
        >
          <div class="absolute -left-6 top-0 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
            <RotateCcw class="w-3 h-3" />
          </div>
          <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-rose-700 dark:text-rose-300">
                Revision #{{ rev.revisionNumber }} Requested by {{ rev.requestedBy }}
              </span>
              <span class="text-[10px] text-rose-500">{{ formatDate(rev.requestedAt, true) }}</span>
            </div>
            <p class="text-xs text-rose-800 dark:text-rose-200 mt-1 italic">
              "{{ rev.note }}"
            </p>
            <span
              v-if="rev.status === 'RESOLVED'"
              class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5"
            >
              <CheckCircle2 class="w-3 h-3" /> Resolved & Resubmitted on {{ formatDate(rev.resolvedAt, true) }}
            </span>
          </div>
        </div>
      </template>

      <!-- Step 4: Head Review & Decision -->
      <div class="relative">
        <div
          class="absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 text-white"
          :class="isApproved ? 'bg-amber-500' : isRevision ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'"
        >
          <Star v-if="isApproved" class="w-3 h-3 fill-white" />
          <RotateCcw v-else-if="isRevision" class="w-3 h-3" />
          <Clock v-else class="w-3 h-3" />
        </div>
        <div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 dark:text-white">
              {{ isApproved ? 'Head Approved & Stars Awarded' : isRevision ? 'Revision Required by Head' : 'Pending Head Approval' }}
            </span>
            <span v-if="approvalDate" class="text-[10px] text-slate-400">{{ formatDate(approvalDate, true) }}</span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span v-if="isApproved">
              ⭐ Officially awarded <strong>{{ awardedStars }} Stars</strong> to {{ crewName }}.
            </span>
            <span v-else-if="isRevision">
              Awaiting supervisor adjustments before final sign-off.
            </span>
            <span v-else>
              Under review by Division Head.
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '~/utils/date.js'
import {
  Check,
  CheckCircle2,
  Clock,
  RotateCcw,
  Star
} from 'lucide-vue-next'

const props = defineProps({
  mission: {
    type: Object,
    required: true
  },
  evaluation: {
    type: Object,
    default: null
  },
  crewName: {
    type: String,
    default: ''
  }
})

const isApproved = computed(() => {
  return props.mission.status === 'APPROVED' || props.mission.status === 'COMPLETED'
})

const isRevision = computed(() => {
  return props.mission.status === 'REVISION_REQUIRED'
})

const awardedStars = computed(() => {
  return props.mission.awardedStars || props.mission.calculatedStars || 5
})

const approvalDate = computed(() => {
  return props.evaluation?.reviewedAt || props.evaluation?.submittedAt
})
</script>
