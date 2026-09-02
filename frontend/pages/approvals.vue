<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            District Manager Review & Approvals
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            District Manager (DM)
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Tinjau evaluasi Store Leader, setujui sekaligus secara <strong>Bulk Approve</strong>, atau lakukan penilaian langsung.
        </p>
      </div>

      <!-- Quick Action: Direct Evaluate as DM -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <NuxtLink
          to="/evaluations"
          class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <ClipboardEdit class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
          <span>Form Penilaian Kru (DM)</span>
        </NuxtLink>
        <span class="text-xs font-semibold px-3 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          {{ approvalStore.pendingApprovals.length }} Menunggu Keputusan
        </span>
      </div>
    </div>

    <!-- Bulk Action Toolbar (When on PENDING tab and items available) -->
    <div
      v-if="activeTab === 'PENDING' && approvalStore.pendingApprovals.length > 0"
      class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      <div class="flex items-center gap-3">
        <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200 select-none">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 rounded text-[#831843] focus:ring-[#831843] cursor-pointer"
          />
          <span>Pilih Semua ({{ approvalStore.pendingApprovals.length }} Misi Pending)</span>
        </label>
        <span
          v-if="selectedIds.length > 0"
          class="text-xs px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-bold"
        >
          {{ selectedIds.length }} Terpilih
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="selectedIds.length > 0"
          type="button"
          @click="selectedIds = []"
          class="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
        >
          Batal Pilih
        </button>

        <button
          type="button"
          :disabled="selectedIds.length === 0"
          @click="handleBulkApprove"
          class="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          :class="[
            selectedIds.length > 0
              ? 'bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white shadow-[#831843]/20 active:scale-95'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          ]"
        >
          <Sparkles class="w-4 h-4" />
          <span>⚡ Bulk Approve ({{ selectedIds.length }} Misi Terpilih)</span>
        </button>
      </div>
    </div>

    <!-- Tabs via Reka UI TabsRoot -->
    <TabsRoot v-model="activeTab" class="w-full space-y-6">
      <TabsList class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit max-w-full overflow-x-auto">
        <TabsTrigger
          value="PENDING"
          class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
        >
          <Hourglass class="w-3.5 h-3.5" />
          <span>Menunggu Persetujuan</span>
          <span class="px-1.5 py-0.2 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            {{ approvalStore.pendingApprovals.length }}
          </span>
        </TabsTrigger>

        <TabsTrigger
          value="APPROVED"
          class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Disetujui (Approved)</span>
          <span class="px-1.5 py-0.2 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            {{ approvalStore.approvedItems.length }}
          </span>
        </TabsTrigger>
      </TabsList>

      <!-- Pending Tab Content -->
      <TabsContent value="PENDING" class="focus:outline-hidden">
        <div
          v-if="approvalStore.pendingApprovals.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"
        >
          <ApprovalCard
            v-for="item in approvalStore.pendingApprovals"
            :key="item.id"
            :item="item"
            :selectable="true"
            :selected="selectedIds.includes(item.id)"
            @toggle-select="toggleSelectItem"
            @approve="openApproveModal"
          />
        </div>
        <EmptyState
          v-else
          title="Semua Evaluasi Telah Disetujui"
          description="Tidak ada antrean evaluasi dari Store Leader yang menunggu persetujuan saat ini."
          icon="CheckCircle2"
        />
      </TabsContent>

      <!-- Approved Tab Content -->
      <TabsContent value="APPROVED" class="focus:outline-hidden">
        <div
          v-if="approvalStore.approvedItems.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full"
        >
          <ApprovalCard
            v-for="item in approvalStore.approvedItems"
            :key="item.id"
            :item="item"
            @approve="openApproveModal"
          />
        </div>
        <EmptyState
          v-else
          title="Belum Ada Misi Disetujui"
          description="Misi yang telah disetujui akan tercatat di sini beserta histori pencairan bintang."
          icon="ClipboardList"
        />
      </TabsContent>
    </TabsRoot>

    <!-- Approve Modal -->
    <ApprovalModal
      :modelValue="isApproveModalOpen"
      :item="selectedItem"
      @cancel="isApproveModalOpen = false"
      @confirm="handleApprove"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'
import { useApprovalStore } from '~/stores/approval.js'
import { useToast } from '~/composables/useToast.js'
import ApprovalCard from '~/components/approval/ApprovalCard.vue'
import ApprovalModal from '~/components/approval/ApprovalModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import {
  Hourglass,
  CheckCircle2,
  Sparkles,
  ClipboardEdit
} from 'lucide-vue-next'

const approvalStore = useApprovalStore()
const toast = useToast()

const activeTab = ref('PENDING')
const isApproveModalOpen = ref(false)
const selectedItem = ref(null)

const selectedIds = ref([])

const isAllSelected = computed(() => {
  const pending = approvalStore.pendingApprovals
  return pending.length > 0 && selectedIds.value.length === pending.length
})

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = approvalStore.pendingApprovals.map(a => a.id)
  }
}

function toggleSelectItem(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function handleBulkApprove() {
  if (selectedIds.value.length === 0) return

  const count = selectedIds.value.length
  const res = approvalStore.bulkApprove(selectedIds.value)
  selectedIds.value = []

  toast.success('Bulk Approve Berhasil', `${res.approvedCount || count} evaluasi misi kru telah disetujui sekaligus. Bintang otomatis dicairkan! 🚀`)
}

const openApproveModal = (payload) => {
  if (payload && payload.item) {
    selectedItem.value = {
      ...payload.item,
      adjustedScore: payload.adjustedScore,
      dmNote: payload.dmNote
    }
  } else {
    selectedItem.value = payload
  }
  isApproveModalOpen.value = true
}

const handleApprove = (overrideData = {}) => {
  if (selectedItem.value) {
    const result = approvalStore.approveMission(selectedItem.value.id, overrideData)
    isApproveModalOpen.value = false
    const adjustNote = result.isAdjustedByDm ? ` (Skor Akhir: ${result.score}/100)` : ''
    toast.success('Evaluasi Disetujui', `+${result.awardedStars || 5} ⭐ Bintang telah dicairkan ke akun ${result.crewName || 'kru'}${adjustNote}. 🎉`)
  }
}
</script>
