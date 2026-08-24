<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Buat Batch Baru</span>
    </div>

    <!-- Header Card -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-2xl bg-[#499ec7]/10 flex items-center justify-center text-[#499ec7]">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white">
            Tambah Cabang Gerai (Batch) Baru
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Daftarkan outlet cabang baru dan sistem akan otomatis menginisialisasi siklus 3 minggu.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Cabang / Batch *</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Contoh: Batch Delta — Re.juve Kota Kasablanka"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Batch *</label>
            <input
              v-model="form.code"
              type="text"
              required
              placeholder="BTH-KK-04"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Mall / Outlet *</label>
            <input
              v-model="form.storeLocation"
              type="text"
              required
              placeholder="Kota Kasablanka LG Floor"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Gerai</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Deskripsi operasional gerai, jam operasional, atau karakteristik cabang..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
          ></textarea>
        </div>

        <div class="p-3.5 rounded-2xl bg-[#499ec7]/10 text-xs text-[#24779f] dark:text-[#84cded]">
          ℹ️ Sistem akan secara otomatis menginisialisasi <strong>Siklus 3 Minggu Operasional</strong> (*Week 1 Cold Chain Setup, Week 2 Core Quality, Week 3 HACCP Certification*).
        </div>

        <div class="pt-4 flex items-center justify-end gap-3">
          <NuxtLink
            to="/admin/batches"
            class="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#499ec7] hover:bg-[#24779f] text-white shadow-md shadow-[#499ec7]/20 active:scale-95 cursor-pointer"
          >
            Buat Cabang Gerai
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft, Layers } from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const toast = useToast()

const form = ref({
  name: '',
  code: `BTH-0${batchStore.allBatches.length + 1}`,
  storeLocation: '',
  description: ''
})

const handleSubmit = () => {
  const newB = batchStore.createBatch(form.value)
  toast.success('Gerai Baru Dibuat', `Cabang ${newB.name} berhasil ditambahkan dengan siklus 3 minggu.`)
  router.push('/admin/batches')
}
</script>
