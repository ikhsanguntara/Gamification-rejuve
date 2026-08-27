<template>
  <div class="w-full space-y-6">
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
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843]">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Tambah Batch Baru
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Daftarkan Batch baru dan sistem akan otomatis menginisialisasi siklus 3 minggu serta paket 12 misi.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Batch *</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Contoh: Batch 4"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Batch *</label>
            <input
              v-model="form.code"
              type="text"
              required
              placeholder="BTH-KK-04"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Mall / Outlet *</label>
            <input
              v-model="form.storeLocation"
              type="text"
              required
              placeholder="Kota Kasablanka LG Floor"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Gerai</label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Deskripsi operasional gerai, jam operasional, atau karakteristik cabang..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <!-- ⚡ 1-Click Template Preset Package Generator Toggle -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-[#831843]/10 via-[#9d174d]/5 to-transparent border border-[#831843]/30 dark:border-[#831843]/20 space-y-2">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              v-model="form.applyTemplatePackage"
              type="checkbox"
              class="w-4 h-4 mt-0.5 rounded text-[#831843] focus:ring-[#831843] cursor-pointer"
            />
            <div class="flex-1">
              <span class="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>⚡ Terapkan Paket Misi Standar Re.juve (12 Misi Otomatis)</span>
                <span class="text-xs font-semibold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Direkomendasikan</span>
              </span>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Sistem akan <strong>otomatis membuat 12 Misi Lengkap</strong> (Cold Chain 2-4°C, Sanitasi Swab Test, Uji Brix Buah, Rasio Jus 100%, Rekonsiliasi Stok, Layanan Barista, Audit HACCP) untuk Week 1, 2, dan 3. Anda <strong>tidak perlu mengetik misi satu per satu</strong>!
              </p>
            </div>
          </label>
        </div>

        <div class="pt-4 flex items-center justify-end gap-3">
          <NuxtLink
            to="/admin/batches"
            class="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
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
  description: '',
  applyTemplatePackage: true
})

const handleSubmit = () => {
  const newB = batchStore.createBatch(form.value)
  if (form.value.applyTemplatePackage) {
    toast.success('Gerai & 12 Misi Berhasil Dibuat!', `Cabang ${newB.name} aktif dengan 12 Misi Standar Re.juve untuk Week 1, 2, dan 3.`)
  } else {
    toast.success('Gerai Baru Dibuat', `Cabang ${newB.name} berhasil ditambahkan.`)
  }
  router.push('/admin/batches')
}
</script>
