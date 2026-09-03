<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Sisi Kiri: Daftar Paket Template Buddy -->
    <div class="lg:col-span-4 space-y-3">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Daftar Template Buddy ({{ (templateStore.buddyTemplates.length > 0 ? templateStore.buddyTemplates : buddyStore.allPackages).length }})
        </h3>
        <button
          type="button"
          @click="$emit('open-create')"
          class="text-[11px] text-purple-600 font-bold hover:underline cursor-pointer"
        >
          + Paket Baru
        </button>
      </div>

      <div class="space-y-2">
        <div
          v-for="bpkg in (templateStore.buddyTemplates.length > 0 ? templateStore.buddyTemplates : buddyStore.allPackages)"
          :key="bpkg.id"
          @click="selectBuddyPackageTab(bpkg.id)"
          class="p-4 rounded-2xl border transition-all cursor-pointer relative"
          :class="[
            selectedBuddyPkgId === bpkg.id
              ? 'border-purple-600 bg-white dark:bg-slate-900 ring-2 ring-purple-600/40 shadow-xs'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
          ]"
        >
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
              {{ bpkg.code }}
            </span>
            <span class="text-[10px] text-slate-400 font-semibold">
              {{ bpkg.durationValue || 3 }} Hari • {{ (bpkg.templates || []).length || (bpkg.details || []).length || 7 }} Butir
            </span>
          </div>

          <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
            {{ bpkg.name }}
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {{ bpkg.description || 'Program orientasi dan pendampingan kru baru bersama Buddy' }}
          </p>

          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-medium">🎯 Target Kru Baru</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click.stop="$emit('open-edit', bpkg)"
                title="Edit Template Paket"
                class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <Edit3 class="w-3 h-3" />
              </button>
              <button
                type="button"
                @click.stop="duplicateBuddyPkg(bpkg.id)"
                title="Duplikat Paket"
                class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <Copy class="w-3 h-3" />
              </button>
              <button
                type="button"
                @click.stop="confirmDeleteBuddyPkg(bpkg)"
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

    <!-- Sisi Kanan: Detail Butir SOP & Kompetensi Buddy -->
    <div class="lg:col-span-8">
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                {{ activeBuddyPkg?.code }}
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                {{ activeBuddyPkg?.name }}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                {{ activeBuddyPkg?.durationValue || 3 }} Hari
              </span>
              <span v-if="isCardLoading" class="inline-flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold animate-pulse">
                <Loader2 class="w-3 h-3 animate-spin" /> Memuat detail...
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ activeBuddyPkg?.description }}
            </p>
          </div>
          
          <div class="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              @click="$emit('open-edit', activeBuddyPkg)"
              class="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
            >
              <Edit3 class="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Template</span>
            </button>
            <button
              type="button"
              @click="$emit('open-add-mission')"
              class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Butir SOP Buddy</span>
            </button>
          </div>
        </div>

        <!-- Live Mission Details from Backend API jika ada -->
        <div v-if="activeBuddyPkg?.templates && activeBuddyPkg.templates.length > 0" class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Butir Misi SOP Buddy ({{ activeBuddyPkg.templates.length }})
            </h4>
            <span class="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Live Backend API</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(item, idx) in activeBuddyPkg.templates"
              :key="item.id || idx"
              class="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span class="w-2 h-2 rounded-full bg-purple-600"></span>
                  <h5 class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ item.title || item.missionTitle }}
                  </h5>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    Hari {{ item.week || item.durationNumber || 1 }}
                  </span>
                </div>
                <span class="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex-shrink-0">
                  {{ item.category || 'TECHNICAL' }}
                </span>
              </div>
              <p v-if="item.description" class="text-[11px] text-slate-500 dark:text-slate-400">
                {{ item.description }}
              </p>
              <div class="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                Tipe Input: {{ item.inputType || 'SCALE' }}
                <span v-if="item.scaleConfig">({{ item.scaleConfig.min }} - {{ item.scaleConfig.max }})</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 7 Competency Categories with Interactive CRUD on each Indicator -->
        <div class="space-y-4">
          <div
            v-for="comp in activeBuddyPkg?.competencies"
            :key="comp.id"
            class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ comp.name }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                  {{ comp.indicators?.length || 0 }} Indikator
                </span>
                <button
                  type="button"
                  @click="$emit('open-add-indicator', comp.id)"
                  class="text-[11px] text-purple-600 hover:underline font-bold cursor-pointer"
                >
                  + Butir Indikator
                </button>
              </div>
            </div>

            <!-- Indicators List in this Competency -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div
                v-for="ind in (comp.indicators || [])"
                :key="ind.id"
                class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5 relative group"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                    <h5 class="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {{ ind.name }}
                    </h5>
                    <span
                      v-if="ind.isStar"
                      class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex-shrink-0"
                    >
                      * Wajib Pembekalan
                    </span>
                  </div>

                  <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                    <button
                      type="button"
                      @click="$emit('open-edit-indicator', comp.id, ind)"
                      class="p-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                      title="Edit Indikator"
                    >
                      <Settings class="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      @click="removeBuddyIndicator(comp.id, ind.id)"
                      class="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Hapus Indikator"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {{ ind.description }}
                </p>
              </div>
            </div>

            <div
              v-if="!comp.indicators || comp.indicators.length === 0"
              class="py-4 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-700 rounded-xl"
            >
              Belum ada butir indikator di kompetensi {{ comp.name }}.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Copy, Trash2, Plus, Settings, Loader2, Edit3 } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useBuddyStore } from '~/stores/buddy.js'
import { useToast } from '~/composables/useToast.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'

const props = defineProps({
  selectedBuddyPkgId: {
    type: String,
    default: ''
  },
  isCardLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'open-create',
  'open-edit',
  'open-add-mission',
  'open-add-indicator',
  'open-edit-indicator',
  'update:selectedBuddyPkgId',
  'update:loading'
])

const templateStore = useTemplateStore()
const buddyStore = useBuddyStore()
const toast = useToast()

const activeBuddyPkg = computed(() => {
  return templateStore.buddyTemplates.find(b => b.id === props.selectedBuddyPkgId)
    || templateStore.buddyTemplates[0]
    || buddyStore.packageById(props.selectedBuddyPkgId)
    || buddyStore.defaultPackage
})

const selectBuddyPackageTab = async (bpkgId) => {
  emit('update:selectedBuddyPkgId', bpkgId)
  emit('update:loading', true)
  try {
    await templateStore.fetchTemplateById(bpkgId, 'BUDDY')
  } finally {
    emit('update:loading', false)
  }
}

const duplicateBuddyPkg = (bpkgId) => {
  const dup = buddyStore.duplicatePackage(bpkgId)
  if (dup) {
    emit('update:selectedBuddyPkgId', dup.id)
    toast.success('Paket Rapor Diduplikasi', `Paket "${dup.name}" berhasil dibuat.`)
  }
}

const confirmDeleteBuddyPkg = async (bpkg) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Paket Template Buddy?',
    text: `Apakah Anda yakin ingin menghapus paket template Buddy "${bpkg.name}"?`,
    confirmButtonText: 'Ya, Hapus Paket'
  })

  if (isConfirmed) {
    if (templateStore.buddyTemplates.some(b => b.id === bpkg.id)) {
      await templateStore.deletePackage(bpkg.id)
    } else {
      buddyStore.deleteBuddyPackage(bpkg.id)
    }
    const nextId = templateStore.buddyTemplates[0]?.id || buddyStore.defaultPackage?.id || ''
    emit('update:selectedBuddyPkgId', nextId)
    toast.success('Paket Buddy Dihapus', `Paket "${bpkg.name}" telah dihapus.`)
  }
}

const removeBuddyIndicator = (compId, indId) => {
  if (!activeBuddyPkg.value) return
  buddyStore.deleteIndicator(activeBuddyPkg.value.id, compId, indId)
  toast.success('Indikator Dihapus', 'Indikator penilaian berhasil dihapus.')
}

defineExpose({
  activeBuddyPkg
})
</script>
