<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/missions" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Misi</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Buat Misi Baru</span>
    </div>

    <!-- Header Card -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-2xl bg-[#963189]/10 flex items-center justify-center text-[#963189] dark:text-[#db92d7]">
          <Target class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white">
            Buat Misi Operasional Gerai Baru
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Tentukan target cabang gerai, siklus minggu, kode SOP, dan daftar spesifikasi yang dinilai.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cabang Gerai Target *</label>
            <select
              v-model="form.batchId"
              required
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                {{ b.name.split('—')[1] || b.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Minggu Operasional *</label>
            <select
              v-model="form.week"
              required
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option :value="1">Week 1 (Cold Chain Setup)</option>
              <option :value="2">Week 2 (Core Quality - Active Cycle)</option>
              <option :value="3">Week 3 (HACCP & Customer Service)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Misi SOP *</label>
          <input
            v-model="form.title"
            type="text"
            required
            placeholder="Contoh: Audit Suhu Chiller 2-4°C & Rotasi Stok Cold-Pressed"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Misi *</label>
            <input
              v-model="form.code"
              type="text"
              required
              placeholder="MSN-W2-05"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Standar Mutu *</label>
            <select
              v-model="form.category"
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option value="Cold Chain">Cold Chain (2-4°C)</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Sanitation">Sanitation & Swab Test</option>
              <option value="Service">Customer Service & CleanLabel</option>
              <option value="Compliance">Compliance & SOP</option>
              <option value="Logistics">Logistics & Storage</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Misi</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Instruksi operasional detail bagi Supervisor dan Crew..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
          ></textarea>
        </div>

        <div class="p-3.5 rounded-2xl bg-[#963189]/10 text-xs text-[#963189] dark:text-[#db92d7]">
          ℹ️ Misi ini akan otomatis ditugaskan ke <strong>seluruh Crew</strong> yang terdaftar di cabang gerai terpilih dan langsung tersedia pada form evaluasi Supervisor.
        </div>

        <div class="pt-4 flex items-center justify-end gap-3">
          <NuxtLink
            to="/admin/missions"
            class="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#963189] hover:bg-[#812474] text-white shadow-md shadow-[#963189]/20 active:scale-95 cursor-pointer"
          >
            Buat Misi Gerai
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
import { useMissionStore } from '~/stores/mission.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft, Target } from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const toast = useToast()

const form = ref({
  title: '',
  code: `MSN-W2-0${missionStore.allMissions.length + 1}`,
  category: 'Quality Control',
  batchId: batchStore.selectedBatchId || 'batch-alpha',
  week: 2,
  description: ''
})

const handleSubmit = () => {
  const newM = missionStore.createMission(form.value)
  toast.success('Misi Baru Dibuat', `Misi ${newM.title} berhasil ditambahkan ke katalog gerai.`)
  router.push('/admin/missions')
}
</script>
