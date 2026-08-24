<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Head Review & Approvals
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Tinjau evaluasi store supervisor, periksa bukti audit, setujui misi untuk membagikan ⭐ Bintang ke seluruh crew, atau minta revisi.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
          {{ approvalStore.pendingApprovals.length }} Pending Decision
        </span>
      </div>
    </div>

    <!-- Tabs: Pending Review | Approved | Revision Required -->
    <div class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit max-w-full overflow-x-auto">
      <button
        type="button"
        @click="activeTab = 'PENDING'"
        class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer"
        :class="[
          activeTab === 'PENDING'
            ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Hourglass class="w-3.5 h-3.5" />
        <span>Pending Review</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
          {{ approvalStore.pendingApprovals.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'APPROVED'"
        class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer"
        :class="[
          activeTab === 'APPROVED'
            ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <CheckCircle2 class="w-3.5 h-3.5" />
        <span>Approved</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
          {{ approvalStore.approvedItems.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'REVISION'"
        class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer"
        :class="[
          activeTab === 'REVISION'
            ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>Revision Required</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
          {{ approvalStore.revisionRequiredItems.length }}
        </span>
      </button>
    </div>

    <!-- Cards Grid (1 col on mobile, 2 on tablet, 3 on desktop) -->
    <div
      v-if="displayedItems.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
    >
      <ApprovalCard
        v-for="item in displayedItems"
        :key="item.id"
        :item="item"
        @approve="openApproveModal"
        @request-revision="openRevisionModal"
      />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      :title="emptyStateTitle"
      :description="emptyStateDesc"
      :icon="activeTab === 'PENDING' ? 'CheckCircle2' : activeTab === 'REVISION' ? 'RotateCcw' : 'ClipboardList'"
    />

    <!-- Approve Confirmation Modal -->
    <ApprovalModal
      :modelValue="showApproveModal"
      :item="selectedItem"
      @update:modelValue="showApproveModal = $event"
      @confirm="executeApprove"
      @cancel="showApproveModal = false"
    />

    <!-- Request Revision Modal -->
    <RevisionModal
      :modelValue="showRevisionModal"
      :item="selectedItem"
      @update:modelValue="showRevisionModal = $event"
      @confirm="executeRevision"
      @cancel="showRevisionModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useApprovalStore } from '~/stores/approval.js'
import { useToast } from '~/composables/useToast.js'
import { useConfetti } from '~/composables/useConfetti.js'
import ApprovalCard from '~/components/approval/ApprovalCard.vue'
import ApprovalModal from '~/components/approval/ApprovalModal.vue'
import RevisionModal from '~/components/approval/RevisionModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import {
  Hourglass,
  CheckCircle2,
  RotateCcw
} from 'lucide-vue-next'

const approvalStore = useApprovalStore()
const toast = useToast()
const confetti = useConfetti()

const activeTab = ref('PENDING')

const selectedItem = ref(null)
const showApproveModal = ref(false)
const showRevisionModal = ref(false)

const displayedItems = computed(() => {
  if (activeTab.value === 'PENDING') return approvalStore.pendingApprovals
  if (activeTab.value === 'APPROVED') return approvalStore.approvedItems
  return approvalStore.revisionRequiredItems
})

const emptyStateTitle = computed(() => {
  if (activeTab.value === 'PENDING') return 'All Evaluations Reviewed'
  if (activeTab.value === 'APPROVED') return 'No Approved Missions'
  return 'No Revisions in Progress'
})

const emptyStateDesc = computed(() => {
  if (activeTab.value === 'PENDING') return 'There are no pending supervisor evaluations waiting for approval at this time.'
  if (activeTab.value === 'APPROVED') return 'Approved missions will appear here once you sign off on evaluations.'
  return 'Any evaluations returned to supervisors with revision notes will be tracked here.'
})

const openApproveModal = (item) => {
  selectedItem.value = item
  showApproveModal.value = true
}

const openRevisionModal = (item) => {
  selectedItem.value = item
  showRevisionModal.value = true
}

const executeApprove = () => {
  if (!selectedItem.value) return

  const result = approvalStore.approveMission(selectedItem.value.id)
  showApproveModal.value = false

  if (result.success) {
    // 1. Confetti star burst
    confetti.triggerStarBurst()

    // 2. Toast notification
    toast.star(
      `⭐ Stars Awarded to All ${result.crewCount} Crew!`,
      `Store mission completed. ${result.totalStarsAwardedAll} Total Stars credited to crew profiles and leaderboard updated.`
    )
  } else {
    toast.error('Approval Failed', result.error)
  }
}

const executeRevision = (note) => {
  if (!selectedItem.value) return

  const result = approvalStore.requestRevision(selectedItem.value.id, note)
  showRevisionModal.value = false

  if (result.success) {
    toast.warning(
      'Revision Requested',
      `Store evaluation returned to Supervisor with revision instruction.`
    )
  } else {
    toast.error('Revision Request Failed', result.error)
  }
}
</script>
