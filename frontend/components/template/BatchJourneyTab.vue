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
              <span>{{ (pkg.weeks || []).length || pkg.totalWeeks || 3 }} Minggu</span>
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
                type="button"
                @click.stop="duplicatePackage(pkg.id)"
                title="Duplikat Paket"
                class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <Copy class="w-3 h-3" />
              </button>
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

          <button
            type="button"
            @click="$emit('open-add-mission')"
            class="px-3.5 py-2 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Tambah Butir SOP</span>
          </button>
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
                  Minggu {{ w.weekNumber }}
                </TabsTrigger>
              </TabsList>

              <!-- Tombol Tambah Week Dinamis -->
              <button
                type="button"
                @click="handleAddNewWeek"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#831843] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#831843] transition-all cursor-pointer"
                title="Tambah Minggu Baru ke Paket Ini"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>Tambah Week</span>
              </button>
            </div>

            <!-- Action buttons for currently active week -->
            <div class="flex items-center gap-2">
              <button
                v-if="activePackageWeeks.length > 1"
                type="button"
                @click="handleRemoveCurrentWeek"
                class="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Hapus Minggu Ini
              </button>
            </div>
          </div>

          <!-- Dynamic Week Title Editor Card -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-1">
                <Bookmark class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                <span>Judul Minggu {{ activeWeekTab }}:</span>
              </span>
              <input
                v-model="currentWeekTitle"
                type="text"
                placeholder="Contoh: Minggu 1: Suhu & Sanitasi Dasar"
                class="flex-1 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-[#831843]"
              />
            </div>
            <button
              type="button"
              @click="saveCurrentWeekTitle"
              class="px-3 py-1.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95 flex-shrink-0"
            >
              Simpan Judul
            </button>
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
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ item.description }}
                  </p>
                </div>

                <button
                  type="button"
                  @click="removeMission(item.id)"
                  class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Hapus butir SOP ini"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>

              <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Checklist & Poin SOP:
                </span>
                <ul class="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                  <li v-for="(req, rIdx) in item.requirements" :key="rIdx">
                    {{ req }}
                  </li>
                </ul>
              </div>
            </div>

            <div
              v-if="!(activePackage?.templates || []).some(t => Number(t.week) === Number(w.weekNumber))"
              class="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl"
            >
              Belum ada butir misi SOP di Minggu {{ w.weekNumber }}. Klik "Tambah Butir SOP" di atas.
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
import { Copy, Trash2, Plus, Bookmark, Loader2 } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'

const props = defineProps({
  isCardLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['open-create', 'open-apply', 'open-add-mission', 'update:loading'])

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

const duplicatePackage = (pkgId) => {
  const dup = templateStore.duplicatePackage(pkgId)
  if (dup) {
    toast.success('Paket Diduplikasi', `Salinan "${dup.name}" berhasil dibuat.`)
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

const saveCurrentWeekTitle = () => {
  if (!currentWeekTitle.value.trim() || !activePackage.value) return
  templateStore.updateWeekTitle(activePackage.value.id, activeWeekTab.value, currentWeekTitle.value.trim())
  toast.success('Judul Week Disimpan', `Judul Week ${activeWeekTab.value} berhasil diperbarui.`)
}

const handleAddNewWeek = () => {
  if (!activePackage.value) return
  const created = templateStore.addWeekToPackage(activePackage.value.id)
  if (created) {
    activeWeekTab.value = created.weekNumber
    syncWeekTitle()
    toast.success('Week Ditambahkan', `Week ${created.weekNumber} siap ditambahkan butir SOP.`)
  }
}

const handleRemoveCurrentWeek = async () => {
  if (!activePackage.value) return
  const isConfirmed = await confirmDeleteDialog({
    title: `Hapus Week ${activeWeekTab.value}?`,
    text: `Seluruh butir misi di dalam Week ${activeWeekTab.value} akan ikut dihapus.`,
    confirmButtonText: 'Ya, Hapus Week'
  })

  if (isConfirmed) {
    const success = templateStore.removeWeekFromPackage(activePackage.value.id, activeWeekTab.value)
    if (success) {
      activeWeekTab.value = 1
      syncWeekTitle()
      toast.success('Week Dihapus', 'Minggu beserta seluruh butir SOP di dalamnya telah dihapus.')
    }
  }
}

const removeMission = (missionId) => {
  if (!activePackage.value) return
  templateStore.removeTemplateFromPackage(activePackage.value.id, missionId)
  toast.success('Butir SOP Dihapus', 'Misi telah dihapus dari paket master ini.')
}

defineExpose({
  activeWeekTab,
  syncWeekTitle
})
</script>
