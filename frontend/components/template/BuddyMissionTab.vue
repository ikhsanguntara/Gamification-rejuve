<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
    <!-- Sisi Kiri: Daftar Paket Template Buddy -->
    <div class="lg:col-span-4 space-y-3">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Daftar Template Buddy ({{ allBuddyPackages.length }})
        </h3>
      </div>

      <div class="space-y-2">
        <div
          v-for="bpkg in allBuddyPackages"
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
              {{ bpkg.durationValue || 3 }} Hari • {{ totalIndicatorsForPkg(bpkg) }} Indikator
            </span>
          </div>

          <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
            {{ bpkg.name }}
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
            {{ bpkg.description || 'Program orientasi dan pendampingan kru baru bersama Buddy' }}
          </p>

          <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span class="text-slate-400 font-medium">🎯 Target Kru Baru (Rapor)</span>
            <div class="flex items-center gap-1">
              <button
                type="button"
                @click.stop="confirmDeleteBuddyPkg(bpkg)"
                title="Hapus Paket"
                class="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sisi Kanan: Detail Rapor 3 Hari (1 Periode, Kategori & Indikator Penilaian) -->
    <div class="lg:col-span-8">
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
        <!-- Header Banner Detail Template -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                {{ activeBuddyPkg?.code }}
              </span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                {{ activeBuddyPkg?.name }}
              </h3>
              <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                Jangka Waktu: {{ activeBuddyPkg?.durationValue || 3 }} Hari
              </span>
              <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {{ indicatorsList.length }} Indikator Penilaian
              </span>
              <span v-if="isCardLoading" class="inline-flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-semibold animate-pulse">
                <Loader2 class="w-3 h-3 animate-spin" /> Memuat detail...
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ activeBuddyPkg?.description || 'Program orientasi dan evaluasi pendampingan 3 hari untuk kru baru.' }}
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
          </div>
        </div>

        <!-- Catatan Resmi Rapor PDF -->
        <div class="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <span class="text-base leading-none">📋</span>
          <div>
            <b>Standar Penilaian Rapor 3 Hari:</b> Indikator bertanda bintang (<span class="font-bold text-amber-700 dark:text-amber-400">★</span>) wajib diberikan pembekalan oleh Store Captain. Kru dimaklumi bila belum sempat praktik langsung selama masa pendampingan 3 hari.
          </div>
        </div>

        <!-- Filter Kategori Resmi Backend -->
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
            <button
              type="button"
              @click="selectedCategory = 'ALL'"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
              :class="[
                selectedCategory === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <span>Semua Kategori</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {{ indicatorsList.length }}
              </span>
            </button>

            <button
              v-for="cat in availableCategories"
              :key="cat"
              type="button"
              @click="selectedCategory = cat"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5"
              :class="[
                selectedCategory === cat
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <span>{{ cat }}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {{ countByCategory(cat) }}
              </span>
            </button>
          </div>

          <span class="text-xs text-slate-400 font-medium">
            Menampilkan {{ filteredIndicators.length }} dari {{ indicatorsList.length }} Butir
          </span>
        </div>

        <!-- Daftar Indikator Penilaian Rapor -->
        <div class="space-y-2.5">
          <div
            v-for="(ind, idx) in filteredIndicators"
            :key="ind.id || idx"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2 hover:border-purple-300 dark:hover:border-purple-800 transition-all shadow-2xs"
          >
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div class="space-y-1.5 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-purple-600 dark:text-purple-400 font-mono font-bold text-[11px]">#{{ idx + 1 }}</span>
                  <h5 class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ ind.name }}
                  </h5>
                  <span
                    v-if="ind.isStar || ind.name.includes('*')"
                    class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex-shrink-0"
                  >
                    ★ Wajib Pembekalan
                  </span>
                  <span
                    class="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                  >
                    {{ ind.category }}
                  </span>
                </div>
                <p v-if="ind.description" class="text-xs text-slate-600 dark:text-slate-300">
                  {{ ind.description }}
                </p>
              </div>

              <!-- Preview 3 Kolom Opsi Rapor Penilaian New Hire Sesuai PDF -->
              <div class="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
                <span class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                  Belum Menguasai
                </span>
                <span class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-medium border border-slate-200 dark:border-slate-700">
                  Butuh Pendampingan
                </span>
                <span class="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/40">
                  Kompeten
                </span>
              </div>
            </div>
          </div>

          <!-- Empty State Jika Filter Kosong -->
          <div
            v-if="filteredIndicators.length === 0"
            class="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl space-y-2"
          >
            <p>Tidak ada indikator penilaian pada kategori ini.</p>
            <button
              type="button"
              @click="$emit('open-edit', activeBuddyPkg)"
              class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-200 cursor-pointer"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>Edit / Tambah Indikator</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Trash2, Loader2, Edit3 } from 'lucide-vue-next'
import { useTemplateStore } from '~/stores/template.js'
import { useBuddyStore } from '~/stores/buddy.js'
import { useToast } from '~/composables/useToast.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'
import { normalizeBuddyDetails } from '~/utils/buddyHelper.js'

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
  'update:selectedBuddyPkgId',
  'update:loading'
])

const templateStore = useTemplateStore()
const buddyStore = useBuddyStore()
const toast = useToast()

const selectedCategory = ref('ALL')

const allBuddyPackages = computed(() => {
  return templateStore.buddyTemplates.length > 0
    ? templateStore.buddyTemplates
    : buddyStore.allPackages
})

const activeBuddyPkg = computed(() => {
  return templateStore.buddyTemplates.find(b => b.id === props.selectedBuddyPkgId)
    || templateStore.buddyTemplates[0]
    || buddyStore.packageById(props.selectedBuddyPkgId)
    || buddyStore.defaultPackage
})

const totalIndicatorsForPkg = (pkg) => {
  if (!pkg) return 22
  if (pkg.details && pkg.details.length > 0) return pkg.details.length
  if (pkg.templates && pkg.templates.length > 0) return pkg.templates.length
  return 22
}

const indicatorsList = computed(() => {
  if (!activeBuddyPkg.value) return []
  const details = activeBuddyPkg.value.details || activeBuddyPkg.value.templates || []
  return normalizeBuddyDetails(details)
})

const availableCategories = computed(() => {
  const cats = new Set()
  indicatorsList.value.forEach(i => {
    if (i.category) cats.add(i.category)
  })
  return Array.from(cats)
})

const countByCategory = (cat) => {
  return indicatorsList.value.filter(i => i.category === cat).length
}

const filteredIndicators = computed(() => {
  if (selectedCategory.value === 'ALL') {
    return indicatorsList.value
  }
  return indicatorsList.value.filter(i => i.category === selectedCategory.value)
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

defineExpose({
  activeBuddyPkg
})
</script>
