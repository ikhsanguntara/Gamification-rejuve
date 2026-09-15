<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#831843] dark:text-[#f472b6] font-semibold">Batch Management</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Manajemen Batch Gerai
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Daftar seluruh batch aktif, lokasi cabang, penanggung jawab, dan progres siklus.
        </p>
      </div>

      <NuxtLink
        to="/admin/batches/create"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-semibold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>Buat Batch Baru</span>
      </NuxtLink>
    </div>

    <!-- Clean Batches Cards Grid -->
    <div v-if="batchStore.allBatches.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="b in batchStore.allBatches"
        :key="b.id"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-sm relative hover:border-slate-300 dark:hover:border-slate-700 transition-all"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {{ b.code }}
            </span>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="[
                b.status === 'DRAFT'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60'
                  : b.status === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
              ]"
            >
              {{ b.status }}
            </span>
          </div>

          <h3 class="font-bold text-base text-slate-900 dark:text-white mb-1 line-clamp-1">
            {{ b.name }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-3">
            <MapPin class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span class="truncate">{{ b.storeLocation || b.name }}</span>
          </p>

          <!-- Template Terpasang -->
          <div class="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-400 flex-shrink-0">🏃 Kurikulum SOP:</span>
              <span class="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[130px] sm:max-w-[190px]">
                {{ b.journeyTemplate?.name || 'SOP Reguler' }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] text-slate-400 flex-shrink-0">🤝 Program Buddy:</span>
              <span class="text-[11px] font-semibold text-purple-700 dark:text-purple-300 truncate max-w-[130px] sm:max-w-[190px]">
                {{ b.buddyTemplate?.name || 'Tanpa Buddy' }}
              </span>
            </div>
          </div>

          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">📅 Periode:</span>
              <span class="font-medium">{{ b.startDate }} s/d {{ b.endDate }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">🎯 Total Misi:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200">
                {{ b.totalMissions || b._count?.missions || 0 }} Misi Terdaftar
              </span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <span class="text-slate-400">👥 Anggota Kru:</span>
              <span class="font-bold text-[#831843] dark:text-[#f472b6]">
                {{ b.totalCrew || b._count?.users || b.assignment?.crewIds?.length || 0 }} Anggota
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <NuxtLink
              :to="`/admin/batches/${b.id}`"
              class="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#831843] dark:hover:text-[#f472b6] flex items-center gap-1 cursor-pointer"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Detail Batch</span>
            </NuxtLink>

            <button
              v-if="b.status === 'DRAFT'"
              type="button"
              @click="handleGenerateMissions(b)"
              class="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-amber-200 cursor-pointer transition-all"
            >
              <Zap class="w-3.5 h-3.5" />
              <span>Generate Misi</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- App Pagination for Grid Cards (9 Items / Page) -->
    <AppPagination
      v-if="batchStore.allBatches.length > 0 && batchStore.serverPagination.total > 0"
      v-model:current-page="currentPage"
      :total-items="batchStore.serverPagination.total"
      :items-per-page="itemsPerPage"
      item-label="batch"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="!batchStore.loading"
      title="Belum Ada Batch Gerai"
      description="Belum ada data batch operasional yang terdaftar di sistem."
      icon="Layers"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useBatchStore } from '~/stores/batch.js'
import { useToast } from '~/composables/useToast.js'
import AppPagination from '~/components/ui/AppPagination.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import { Plus, Eye, MapPin, Zap } from 'lucide-vue-next'
import { batchApi } from '~/services/api.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'

const batchStore = useBatchStore()
const toast = useToast()

const currentPage = ref(1)
const itemsPerPage = 9

const loadBatches = async (page = 1) => {
  await batchStore.fetchBatchesFromApi({
    page,
    limit: itemsPerPage
  })
}

onMounted(() => {
  loadBatches(1)
})

// Pindah halaman via pagination -> HIT API Backend!
watch(currentPage, (newPage) => {
  loadBatches(newPage)
})

const handleGenerateMissions = async (batch) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Generate Misi Batch?',
    text: `Generate penugasan seluruh misi untuk batch "${batch.name}"? Status batch akan berubah menjadi OPEN.`,
    confirmButtonText: 'Ya, Generate Misi'
  })

  if (isConfirmed) {
    try {
      await batchApi.generate(batch.id)
      toast.success('Misi Berhasil Di-generate', `Seluruh misi untuk batch ${batch.name} telah diaktifkan ke status OPEN.`)
      await loadBatches(currentPage.value)
    } catch (err) {
      console.error('Generate missions error:', err)
      toast.error('Gagal Generate Misi', err.message || 'Tidak dapat meng-generate misi dari backend.')
    }
  }
}
</script>
