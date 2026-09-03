<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#831843] dark:text-[#f472b6] font-semibold">Master Templates</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Master Template SOP Misi
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Katalog paket SOP operasional dengan struktur mingguan dinamis siap diterapkan ke gerai.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Action Buttons when in BATCH tab -->
        <template v-if="activeCatalogCategory === 'BATCH'">
          <button
            type="button"
            @click="openCreatePackageModal('JOURNEY')"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
          >
            <Plus class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
            <span>Buat Paket Master Baru</span>
          </button>

          <button
            type="button"
            @click="showApplyModal = true"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            <Sparkles class="w-4 h-4" />
            <span>Terapkan ke Gerai</span>
          </button>
        </template>

        <!-- Action Buttons when in BUDDY tab -->
        <template v-else-if="activeCatalogCategory === 'BUDDY'">
          <button
            type="button"
            @click="openCreatePackageModal('BUDDY')"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all shadow-xs cursor-pointer"
          >
            <Plus class="w-4 h-4 text-purple-600" />
            <span>Buat Paket Buddy Baru</span>
          </button>

          <button
            type="button"
            @click="openAddBuddyMissionModal()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Butir SOP Buddy</span>
          </button>
        </template>

        <!-- Action Buttons when in FEEDBACK tab -->
        <template v-else>
          <button
            type="button"
            @click="openCreatePackageModal('FEEDBACK')"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all shadow-xs cursor-pointer"
          >
            <Plus class="w-4 h-4 text-blue-600" />
            <span>Buat Paket Feedback Baru</span>
          </button>

          <button
            type="button"
            @click="openAddSurveyQuestionModal"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Pertanyaan Survei</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Template Type Switcher Tabs (Batch Kurikulum vs Buddy Pre-Batch vs Feedback & Rapor) -->
    <div class="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit text-xs font-semibold flex-wrap">
      <button
        type="button"
        @click="switchCatalogTab('BATCH')"
        class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        :class="[
          activeCatalogCategory === 'BATCH'
            ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Layers class="w-4 h-4" />
        <span>1. Paket Misi Batch ({{ (templateStore.journeyTemplates.length > 0 ? templateStore.journeyTemplates : templateStore.allPackages).length }})</span>
      </button>

      <button
        type="button"
        @click="switchCatalogTab('BUDDY')"
        class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        :class="[
          activeCatalogCategory === 'BUDDY'
            ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Handshake class="w-4 h-4" />
        <span>2. Paket Misi Buddy ({{ templateStore.buddyTemplates.length }})</span>
      </button>

      <button
        type="button"
        @click="switchCatalogTab('FEEDBACK')"
        class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        :class="[
          activeCatalogCategory === 'FEEDBACK'
            ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <MessageSquareText class="w-4 h-4" />
        <span>3. Feedback & Rapor New Hire ({{ templateStore.feedbackTemplates.length }})</span>
      </button>
    </div>

    <!-- TAB 1: WORKSPACE PAKET KURIKULUM ONBOARDING (BATCH JOURNEY) -->
    <BatchJourneyTab
      v-if="activeCatalogCategory === 'BATCH'"
      ref="batchTabRef"
      :is-card-loading="isCardLoading"
      @open-create="openCreatePackageModal('JOURNEY')"
      @open-apply="showApplyModal = true"
      @open-add-mission="showAddMissionModal = true"
      @update:loading="isCardLoading = $event"
    />

    <!-- TAB 2: WORKSPACE PAKET ORIENTASI PRE-BATCH (BUDDY) -->
    <BuddyMissionTab
      v-else-if="activeCatalogCategory === 'BUDDY'"
      ref="buddyTabRef"
      v-model:selected-buddy-pkg-id="selectedBuddyPkgId"
      :is-card-loading="isCardLoading"
      @open-create="openCreatePackageModal('BUDDY')"
      @open-add-mission="openAddBuddyMissionModal()"
      @open-add-indicator="openAddBuddyIndicatorModal"
      @open-edit-indicator="openEditBuddyIndicatorModal"
      @update:loading="isCardLoading = $event"
    />

    <!-- TAB 3: WORKSPACE FEEDBACK & RAPOR NEW HIRE (FEEDBACK) -->
    <FeedbackRaporTab
      v-else
      ref="feedbackTabRef"
      v-model:selected-feedback-pkg-id="selectedFeedbackPkgId"
      v-model:active-feedback-sub-tab="activeFeedbackSubTab"
      :is-card-loading="isCardLoading"
      @open-create="openCreatePackageModal('FEEDBACK')"
      @open-add-survey="openAddSurveyQuestionModal"
      @open-edit-survey="openEditSurveyQuestionModal"
      @open-add-rapor-indicator="openAddRaporIndicatorModal"
      @update:loading="isCardLoading = $event"
    />

    <!-- MODALS MODULAR -->
    <CreateTemplateModal
      v-model="showCreatePackageModal"
      :initial-type="createModalType"
      @created="handlePackageCreated"
    />

    <ApplyToStoreModal
      v-model="showApplyModal"
      :active-package="templateStore.selectedPackage"
    />

    <AddMissionModal
      v-model="showAddMissionModal"
      :active-package="templateStore.selectedPackage"
      :active-week="batchTabRef?.activeWeekTab || 1"
    />

    <BuddyIndicatorModal
      v-model="showAddBuddyMissionModal"
      :active-package="buddyTabRef?.activeBuddyPkg"
      :initial-competency-id="activeBuddyCompId"
      :editing-indicator="editingBuddyIndicator"
    />

    <SurveyQuestionModal
      v-model="showAddSurveyQuestionModal"
      :editing-question="editingSurveyQuestion"
    />

    <RaporIndicatorModal
      v-model="showAddRaporIndModal"
      :competency-id="activeRaporCompId"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Sparkles, Layers, Handshake, MessageSquareText } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'

// Sub-Komponen Modul Template
import BatchJourneyTab from '~/components/template/BatchJourneyTab.vue'
import BuddyMissionTab from '~/components/template/BuddyMissionTab.vue'
import FeedbackRaporTab from '~/components/template/FeedbackRaporTab.vue'
import CreateTemplateModal from '~/components/template/CreateTemplateModal.vue'
import ApplyToStoreModal from '~/components/template/ApplyToStoreModal.vue'
import AddMissionModal from '~/components/template/AddMissionModal.vue'
import BuddyIndicatorModal from '~/components/template/BuddyIndicatorModal.vue'
import SurveyQuestionModal from '~/components/template/SurveyQuestionModal.vue'
import RaporIndicatorModal from '~/components/template/RaporIndicatorModal.vue'

definePageMeta({
  title: 'Master Templates SOP | Re.juve Training & Gamification',
  roles: ['SUPER_ADMIN', 'DISTRICT_MANAGER', 'STORE_LEADER']
})

const templateStore = useTemplateStore()

// State Kategori Tab
const activeCatalogCategory = ref('BATCH') // 'BATCH' | 'BUDDY' | 'FEEDBACK'
const activeFeedbackSubTab = ref('API_FEEDBACK') // 'API_FEEDBACK' | 'RAPOR' | 'SURVEY'

const selectedBuddyPkgId = ref('')
const selectedFeedbackPkgId = ref('')
const isCardLoading = ref(false)

// Template Refs
const batchTabRef = ref(null)
const buddyTabRef = ref(null)
const feedbackTabRef = ref(null)

// Modal Visibility State
const showCreatePackageModal = ref(false)
const createModalType = ref('JOURNEY')

const showApplyModal = ref(false)
const showAddMissionModal = ref(false)

const showAddBuddyMissionModal = ref(false)
const activeBuddyCompId = ref('comp-pk')
const editingBuddyIndicator = ref(null)

const showAddSurveyQuestionModal = ref(false)
const editingSurveyQuestion = ref(null)

const showAddRaporIndModal = ref(false)
const activeRaporCompId = ref('comp-pk')

onMounted(async () => {
  await templateStore.fetchAllTemplateTypes()
  if (templateStore.journeyTemplates.length > 0) {
    const firstJourneyId = templateStore.journeyTemplates[0].id
    templateStore.selectedPackageId = firstJourneyId
    await templateStore.fetchTemplateById(firstJourneyId, 'JOURNEY')
  }
  if (templateStore.buddyTemplates.length > 0) {
    selectedBuddyPkgId.value = templateStore.buddyTemplates[0].id
    await templateStore.fetchTemplateById(templateStore.buddyTemplates[0].id, 'BUDDY')
  }
  if (templateStore.feedbackTemplates.length > 0) {
    selectedFeedbackPkgId.value = templateStore.feedbackTemplates[0].id
    await templateStore.fetchTemplateById(templateStore.feedbackTemplates[0].id, 'FEEDBACK')
  }
  if (batchTabRef.value?.syncWeekTitle) {
    batchTabRef.value.syncWeekTitle()
  }
})

const switchCatalogTab = async (category) => {
  activeCatalogCategory.value = category
  const typeMap = { BATCH: 'JOURNEY', BUDDY: 'BUDDY', FEEDBACK: 'FEEDBACK' }
  const currentType = typeMap[category] || 'JOURNEY'
  await templateStore.fetchTemplatesByType(currentType, { limit: 10 })
  if (category === 'BATCH' && templateStore.journeyTemplates.length > 0) {
    const targetId = templateStore.selectedPackageId || templateStore.journeyTemplates[0].id
    templateStore.selectedPackageId = targetId
    await templateStore.fetchTemplateById(targetId, 'JOURNEY')
    if (batchTabRef.value?.syncWeekTitle) {
      batchTabRef.value.syncWeekTitle()
    }
  } else if (category === 'BUDDY' && templateStore.buddyTemplates.length > 0) {
    if (!selectedBuddyPkgId.value || !templateStore.buddyTemplates.find(b => b.id === selectedBuddyPkgId.value)) {
      selectedBuddyPkgId.value = templateStore.buddyTemplates[0].id
    }
    await templateStore.fetchTemplateById(selectedBuddyPkgId.value, 'BUDDY')
  } else if (category === 'FEEDBACK' && templateStore.feedbackTemplates.length > 0) {
    activeFeedbackSubTab.value = 'API_FEEDBACK'
    if (!selectedFeedbackPkgId.value || !templateStore.feedbackTemplates.find(f => f.id === selectedFeedbackPkgId.value)) {
      selectedFeedbackPkgId.value = templateStore.feedbackTemplates[0].id
    }
    await templateStore.fetchTemplateById(selectedFeedbackPkgId.value, 'FEEDBACK')
  }
}

const openCreatePackageModal = (type = 'JOURNEY') => {
  createModalType.value = type
  showCreatePackageModal.value = true
}

const handlePackageCreated = (payload) => {
  if (payload.type === 'JOURNEY') {
    activeCatalogCategory.value = 'BATCH'
    templateStore.selectedPackageId = payload.id || payload.tplMissionId || ''
    if (batchTabRef.value) {
      batchTabRef.value.activeWeekTab = 1
      batchTabRef.value.syncWeekTitle()
    }
  } else if (payload.type === 'BUDDY') {
    activeCatalogCategory.value = 'BUDDY'
    selectedBuddyPkgId.value = payload.id || payload.tplMissionId || ''
  } else if (payload.type === 'FEEDBACK') {
    activeCatalogCategory.value = 'FEEDBACK'
    activeFeedbackSubTab.value = 'API_FEEDBACK'
    selectedFeedbackPkgId.value = payload.id || payload.tplMissionId || ''
  }
}

const openAddBuddyMissionModal = () => {
  editingBuddyIndicator.value = null
  activeBuddyCompId.value = 'comp-pk'
  showAddBuddyMissionModal.value = true
}

const openAddBuddyIndicatorModal = (compId = 'comp-pk') => {
  editingBuddyIndicator.value = null
  activeBuddyCompId.value = compId
  showAddBuddyMissionModal.value = true
}

const openEditBuddyIndicatorModal = (compId, ind) => {
  editingBuddyIndicator.value = ind
  activeBuddyCompId.value = compId
  showAddBuddyMissionModal.value = true
}

const openAddSurveyQuestionModal = () => {
  editingSurveyQuestion.value = null
  showAddSurveyQuestionModal.value = true
}

const openEditSurveyQuestionModal = (question) => {
  editingSurveyQuestion.value = question
  showAddSurveyQuestionModal.value = true
}

const openAddRaporIndicatorModal = (compId) => {
  activeRaporCompId.value = compId
  showAddRaporIndModal.value = true
}
</script>
