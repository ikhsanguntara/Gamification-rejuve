<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- KOLOM KIRI: DAFTAR PAKET MASTER (4/12) -->
    <div class="lg:col-span-4 space-y-3">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Daftar Paket Template ({{ (templateStore.journeyTemplates.length > 0 ? templateStore.journeyTemplates : templateStore.allPackages).length }})
        </h3>
        <button
          type="button"
          @click="$emit('open-create')"
          class="text-[11px] text-[#831843] dark:text-[#f472b6] font-bold hover:underline cursor-pointer"
        >
          + Paket Baru
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="pkg in (templateStore.journeyTemplates.length > 0 ? templateStore.journeyTemplates : templateStore.allPackages)"
          :key="pkg.id"
          @click="selectPackageTab(pkg.id)"
          class="p-4 rounded-2xl border transition-all cursor-pointer relative"
          :class="[
            templateStore.selectedPackageId === pkg.id
              ? 'border-[#831843] bg-white dark:bg-slate-900 ring-2 ring-[#831843]/40 shadow-xs'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
          ]"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
              {{ pkg.code }}
            </span>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
              <span>{{ formatPackageDuration(pkg) }}</span>
              <span>•</span>
              <span>{{ pkg.templates.length }} Misi</span>
            </div>
          </div>

          <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
            {{ pkg.name }}
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            {{ pkg.description }}
          </p>

          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-medium">🎯 {{ pkg.targetType }}</span>
            <div class="flex items-center gap-1">
              <button
                v-if="templateStore.allPackages.length > 1"
                type="button"
                @click.stop="confirmDeletePackage(pkg)"
                title="Hapus Paket"
                class="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- KOLOM KANAN: DETAIL PAKET & TABS MINGGUAN (8/12) -->
    <div class="lg:col-span-8">
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        
        <!-- Package Header Summary -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-[#831843] text-white">
                {{ activePackage?.code }}
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                {{ activePackage?.name }}
              </span>
              <span v-if="isCardLoading" class="inline-flex items-center gap-1 text-[10px] text-[#831843] dark:text-[#f472b6] font-semibold animate-pulse">
                <Loader2 class="w-3 h-3 animate-spin" /> Memuat detail...
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ activePackage?.description }}
            </p>
          </div>

          <div class="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              @click="$emit('open-edit', activePackage)"
              class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <Edit3 class="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Template</span>
            </button>
          </div>
        </div>

        <!-- Week Tabs via Reka UI dengan Dukungan Lebih dari 3 Week & Judul Week -->
        <TabsRoot :model-value="String(activeWeekTab)" @update:model-value="activeWeekTab = Number($event)" class="w-full space-y-4">
          
          <!-- Week Selector Navigation & Add Week Button -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-2 flex-wrap">
              <TabsList class="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
                <TabsTrigger
                  v-for="w in activePackageWeeks"
                  :key="w.weekNumber"
                  :value="String(w.weekNumber)"
                  class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                  :class="[
                    Number(activeWeekTab) === Number(w.weekNumber)
                      ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  ]"
                >
                  {{ getWeekTabTitle(w.weekNumber) }}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <!-- Content per Week -->
          <TabsContent
            v-for="w in activePackageWeeks"
            :key="w.weekNumber"
            :value="String(w.weekNumber)"
            class="space-y-3 pt-2"
          >
            <div
              v-for="item in (activePackage?.templates || []).filter(t => Number(t.week) === Number(w.weekNumber))"
              :key="item.id"
              class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5 transition-all"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {{ item.codePrefix }}
                    </span>
                    <span class="text-xs font-bold text-slate-900 dark:text-white">
                      {{ item.title }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-600 dark:text-slate-300">
                    {{ item.description }}
                  </p>
                </div>
              </div>

              <!-- Checklist Standar Pelaksanaan -->
              <div v-if="item.requirements && item.requirements.length > 0" class="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Standar Pelaksanaan (Checklist SOP)
                </span>
                <div class="space-y-1">
                  <div
                    v-for="(req, rIdx) in item.requirements"
                    :key="rIdx"
                    class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-[#831843]/60 shrink-0"></span>
                    <span>{{ req }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="!(activePackage?.templates || []).some(t => Number(t.week) === Number(w.weekNumber))"
              class="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl"
            >
              Belum ada butir misi SOP di {{ getWeekTabTitle(w.weekNumber) }}. Klik "Edit Template" di atas untuk mengelola butir SOP.
            </div>
          </TabsContent>
        </TabsRoot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'
import { Trash2, Loader2, Edit3 } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'

const props = defineProps({
  isCardLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['open-create', 'open-edit', 'open-apply', 'open-add-mission', 'update:loading'])

const templateStore = useTemplateStore()
const toast = useToast()

const activeWeekTab = ref(1)
const currentWeekTitle = ref('')

const activePackage = computed(() => {
  const list = templateStore.journeyTemplates.length > 0 ? templateStore.journeyTemplates : templateStore.allPackages
  return list.find(p => p.id === templateStore.selectedPackageId) || list[0] || null
})

const activePackageWeeks = computed(() => {
  if (!activePackage.value) return []
  return templateStore.packageWeeks(activePackage.value.id)
})

const formatPackageDuration = (pkg) => {
  const tabsCount = (pkg.weeks || []).length || pkg.totalWeeks || 1
  const code = (pkg.durationCode || 'WEEK').toUpperCase()
  if (code === 'DAY') return `${tabsCount} Hari`
  if (code === 'MONTH') return `${tabsCount} Bulan`
  return `${tabsCount} Minggu`
}

const getWeekTabTitle = (weekNumber) => {
  const code = (activePackage.value?.durationCode || 'WEEK').toUpperCase()
  if (code === 'DAY') return `Hari ${weekNumber}`
  if (code === 'MONTH') return `Bulan ${weekNumber}`
  return `Minggu ${weekNumber}`
}

const syncWeekTitle = () => {
  const currentWeekObj = activePackageWeeks.value.find(w => Number(w.weekNumber) === Number(activeWeekTab.value))
  currentWeekTitle.value = currentWeekObj ? currentWeekObj.title : `Minggu ${activeWeekTab.value}: Tema SOP`
}

watch([activeWeekTab, activePackageWeeks], () => {
  syncWeekTitle()
}, { immediate: true })

const selectPackageTab = async (pkgId) => {
  templateStore.selectedPackageId = pkgId
  activeWeekTab.value = 1
  emit('update:loading', true)
  try {
    await templateStore.fetchTemplateById(pkgId, 'JOURNEY')
  } finally {
    emit('update:loading', false)
    syncWeekTitle()
  }
}

const confirmDeletePackage = async (pkg) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Paket Template?',
    text: `Apakah Anda yakin ingin menghapus paket template kurikulum "${pkg.name}"?`,
    confirmButtonText: 'Ya, Hapus Paket'
  })

  if (isConfirmed) {
    const success = await templateStore.deletePackage(pkg.id)
    if (success) {
      toast.success('Paket Dihapus', `Paket "${pkg.name}" telah dihapus.`)
      syncWeekTitle()
    }
  }
}

defineExpose({
  activeWeekTab,
  syncWeekTitle
})
</script>
