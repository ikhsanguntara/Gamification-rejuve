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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

          <h4 class="text-base font-bold text-slate-900 dark:text-white">
            {{ b.name }}
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
            <span>{{ b.storeLocation }}</span>
          </p>

          <!-- Clean Info Rows -->
          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">👔 Supervisor:</span>
              <span class="font-semibold">{{ b.assignment?.supervisorName || 'Budi Santoso' }}</span>
            </div>
            <div class="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span class="text-slate-400">👑 Head Approver:</span>
              <span class="font-semibold">{{ b.assignment?.headName || 'Ahmad Dahlan' }}</span>
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
  </div>
</template>

<script setup>
import { useBatchStore } from '~/stores/batch.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { useToast } from '~/composables/useToast.js'
import { Plus, Edit3, Trash2, MapPin } from 'lucide-vue-next'

const batchStore = useBatchStore()
const gamificationStore = useGamificationStore()
const toast = useToast()

const confirmDeleteBatch = (batch) => {
  if (confirm(`Apakah Anda yakin ingin menghapus cabang ${batch.name}?`)) {
    batchStore.deleteBatch(batch.id)
    toast.info('Gerai Dihapus', `Cabang ${batch.name} telah dihapus dari sistem.`)
  }
}
</script>
