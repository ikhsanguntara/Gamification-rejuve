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
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {{ b.status }}
            </span>
          </div>

          <h3 class="font-bold text-base text-slate-900 dark:text-white mb-1">
            {{ b.name }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
            <MapPin class="w-3.5 h-3.5 text-slate-400" />
            <span>{{ b.storeLocation }}</span>
          </p>

          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">📅 Periode:</span>
              <span class="font-medium">{{ b.startDate }} s/d {{ b.endDate }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">👤 Store Leader:</span>
              <span class="font-semibold">{{ b.assignment?.storeLeaderName || '-' }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">👑 Head Approver:</span>
              <span class="font-semibold">{{ b.assignment?.headName || b.assignment?.districtManagerName || '-' }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <span class="text-slate-400">👥 Total Kru:</span>
              <span class="font-bold text-[#831843] dark:text-[#f472b6]">
                {{ b.assignment?.crewIds?.length || gamificationStore.crewsByBatch(b.id).length }} Anggota
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <NuxtLink
            :to="`/admin/batches/${b.id}`"
            class="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#831843] dark:hover:text-[#f472b6] flex items-center gap-1 cursor-pointer"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Pengaturan</span>
          </NuxtLink>

          <button
            type="button"
            @click="confirmDeleteBatch(b)"
            class="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
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
import { useGamificationStore } from '~/stores/gamification.js'
import { useToast } from '~/composables/useToast.js'
import AppPagination from '~/components/ui/AppPagination.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import { Plus, Edit3, Trash2, MapPin } from 'lucide-vue-next'

const batchStore = useBatchStore()
const gamificationStore = useGamificationStore()
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

import { batchApi } from '~/services/api.js'

import { confirmDeleteDialog } from '~/utils/dialog.js'

const confirmDeleteBatch = async (batch) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Batch Gerai?',
    text: `Apakah Anda yakin ingin menghapus "${batch.name}"? Seluruh alokasi misi pada batch ini akan dihapus.`,
    confirmButtonText: 'Ya, Hapus Batch'
  })

  if (isConfirmed) {
    try {
      await batchApi.delete(batch.id)
      toast.success('Batch Dihapus', `Batch ${batch.name} telah dihapus dari backend server.`)
      await loadBatches(currentPage.value)
    } catch (err) {
      console.error('Delete batch error:', err)
      toast.error('Gagal Menghapus Batch', err.message || 'Tidak dapat menghapus data dari server.')
    }
  }
}
</script>
