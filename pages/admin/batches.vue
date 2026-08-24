<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#499ec7] dark:text-[#84cded] font-bold">Batch Management</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Manajemen Cabang Gerai (Batches)
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola cabang gerai Re.juve, inisialisasi siklus 3 minggu operasional, dan pantau status aktif.
        </p>
      </div>

      <button
        type="button"
        @click="openCreateBatchModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#499ec7] hover:bg-[#24779f] text-white text-xs font-bold transition-all shadow-md shadow-[#499ec7]/20 active:scale-95 cursor-pointer self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>+ Buat Batch Gerai Baru</span>
      </button>
    </div>

    <!-- Batches Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="b in batchStore.allBatches"
        :key="b.id"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-sm relative group"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ b.code }}
            </span>
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              {{ b.status }}
            </span>
          </div>

          <h4 class="text-base font-black text-slate-900 dark:text-white">
            {{ b.name }}
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-[#499ec7]" />
            <span>{{ b.storeLocation }}</span>
          </p>
          <p class="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {{ b.description }}
          </p>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-[10px] text-slate-400 block">Total Crew:</span>
              <span class="font-bold text-slate-800 dark:text-slate-200">
                {{ gamificationStore.crewsByBatch(b.id).length }} Crew Members
              </span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 block">Active Cycle:</span>
              <span class="font-bold text-[#499ec7] dark:text-[#84cded]">
                Week {{ b.currentWeek }} of {{ b.totalWeeks }}
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            @click="editBatch(b)"
            class="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#499ec7] dark:hover:text-[#84cded] flex items-center gap-1 cursor-pointer"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit Gerai</span>
          </button>

          <button
            type="button"
            @click="confirmDeleteBatch(b)"
            class="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Batch Modal -->
    <BaseModal
      :modelValue="showBatchModal"
      :title="editingBatch ? 'Edit Cabang Gerai' : 'Tambah Cabang Gerai Baru'"
      subtitle="Konfigurasi nama gerai, kode batch, dan lokasi operasional"
      max-width="md"
      @update:modelValue="showBatchModal = $event"
      @close="showBatchModal = false"
    >
      <form @submit.prevent="saveBatch" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Cabang / Batch</label>
          <input
            v-model="batchForm.name"
            type="text"
            required
            placeholder="Contoh: Batch Delta — Re.juve Kota Kasablanka"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Batch</label>
            <input
              v-model="batchForm.code"
              type="text"
              required
              placeholder="BTH-KK-04"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Mall / Outlet</label>
            <input
              v-model="batchForm.storeLocation"
              type="text"
              required
              placeholder="Kota Kasablanka LG Floor"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Gerai</label>
          <textarea
            v-model="batchForm.description"
            rows="2"
            placeholder="Deskripsi operasional gerai..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
          ></textarea>
        </div>

        <div class="p-3 rounded-xl bg-[#499ec7]/10 text-xs text-[#24779f] dark:text-[#84cded]">
          ℹ️ Sistem akan secara otomatis menginisialisasi <strong>Siklus 3 Minggu Operasional</strong> untuk gerai ini.
        </div>

        <div class="pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="showBatchModal = false"
            class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#499ec7] text-white shadow-md shadow-[#499ec7]/20 cursor-pointer"
          >
            {{ editingBatch ? 'Simpan Perubahan' : 'Buat Gerai' }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useBatchStore } from '~/stores/batch.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { useToast } from '~/composables/useToast.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Plus, Edit3, Trash2, MapPin } from 'lucide-vue-next'

const batchStore = useBatchStore()
const gamificationStore = useGamificationStore()
const toast = useToast()

const showBatchModal = ref(false)
const editingBatch = ref(null)

const batchForm = ref({
  name: '',
  code: '',
  storeLocation: '',
  description: ''
})

const openCreateBatchModal = () => {
  editingBatch.value = null
  batchForm.value = {
    name: '',
    code: `BTH-${String(batchStore.allBatches.length + 1).padStart(2, '0')}`,
    storeLocation: '',
    description: ''
  }
  showBatchModal.value = true
}

const editBatch = (batch) => {
  editingBatch.value = batch
  batchForm.value = { ...batch }
  showBatchModal.value = true
}

const saveBatch = () => {
  if (editingBatch.value) {
    batchStore.updateBatch(editingBatch.value.id, batchForm.value)
    toast.success('Gerai Diperbarui', `Data gerai ${batchForm.value.name} berhasil disimpan.`)
  } else {
    const newB = batchStore.createBatch(batchForm.value)
    toast.success('Gerai Baru Dibuat', `Cabang ${newB.name} berhasil ditambahkan dengan siklus 3 minggu.`)
  }
  showBatchModal.value = false
}

const confirmDeleteBatch = (batch) => {
  if (confirm(`Apakah Anda yakin ingin menghapus cabang ${batch.name}?`)) {
    batchStore.deleteBatch(batch.id)
    toast.info('Gerai Dihapus', `Cabang ${batch.name} telah dihapus dari sistem.`)
  }
}
</script>
