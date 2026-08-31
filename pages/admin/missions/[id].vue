<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/missions" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Misi</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Edit Misi Gerai</span>
    </div>

    <!-- Error State -->
    <div v-if="!mission" class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Misi tidak ditemukan.</p>
      <NuxtLink to="/admin/missions" class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- Edit Form Card -->
    <div v-else class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843] dark:text-[#f472b6]">
          <Target class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Edit Misi: {{ mission.title }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Perbarui kode, judul, kategori mutu, deskripsi, checklist SOP, dan target cabang gerai.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cabang Gerai Target *</label>
            <select
              v-model="form.batchId"
              required
              class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            >
              <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                {{ b.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Minggu Operasional *</label>
            <select
              v-model="form.week"
              required
              class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            >
              <option :value="1">Week 1 (Cold Chain Setup)</option>
              <option :value="2">Week 2 (Core Quality - Active Cycle)</option>
              <option :value="3">Week 3 (HACCP & Customer Service)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Misi SOP *</label>
          <input
            v-model="form.title"
            type="text"
            required
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Misi *</label>
            <input
              v-model="form.code"
              type="text"
              required
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Standar Mutu *</label>
            <select
              v-model="form.category"
              class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
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
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Misi</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <!-- Requirements Checklist Builder -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Spesifikasi Checklist SOP ({{ (form.requirements || []).length }} Poin)
            </label>
            <button
              type="button"
              @click="addRequirement"
              class="text-xs font-semibold text-[#831843] dark:text-[#f472b6] hover:underline cursor-pointer"
            >
              + Tambah Poin SOP
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(req, idx) in form.requirements"
              :key="idx"
              class="flex items-center gap-2"
            >
              <input
                v-model="form.requirements[idx]"
                type="text"
                required
                class="flex-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
              <button
                type="button"
                @click="removeRequirement(idx)"
                class="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                :disabled="form.requirements.length <= 1"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="pt-4 flex items-center justify-end gap-3">
          <NuxtLink
            to="/admin/missions"
            class="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft, Target } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const toast = useToast()

const mission = computed(() => {
  return missionStore.missionById(route.params.id)
})

const form = ref({
  title: '',
  code: '',
  category: 'Quality Control',
  batchId: 'batch-alpha',
  week: 2,
  description: '',
  requirements: ['Pemeriksaan standar mutu gerai']
})

watch(
  mission,
  (m) => {
    if (m) {
      form.value = {
        title: m.title || '',
        code: m.code || '',
        category: m.category || 'Quality Control',
        batchId: m.batchId || 'batch-alpha',
        week: m.week || 2,
        description: m.description || '',
        requirements: m.requirements && m.requirements.length > 0 ? [...m.requirements] : ['Pemeriksaan standar mutu gerai']
      }
    }
  },
  { immediate: true }
)

const addRequirement = () => {
  if (!form.value.requirements) form.value.requirements = []
  form.value.requirements.push('Poin spesifikasi standar mutu baru...')
}

const removeRequirement = (idx) => {
  if (form.value.requirements && form.value.requirements.length > 1) {
    form.value.requirements.splice(idx, 1)
  }
}

const handleUpdate = () => {
  if (!mission.value) return
  missionStore.updateMission(mission.value.id, form.value)
  toast.success('Misi Diperbarui', `Data ${form.value.title} telah berhasil disimpan.`)
  router.push('/admin/missions')
}
</script>
