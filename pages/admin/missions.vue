<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#963189] dark:text-[#db92d7] font-bold">Mission Management</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Manajemen Misi Operasional Gerai
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Buat dan kelola misi standar SOP operasional per cabang gerai dan minggu evaluasi, otomatis menugaskan seluruh Crew.
        </p>
      </div>

      <button
        type="button"
        @click="openCreateMissionModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#963189] hover:bg-[#812474] text-white text-xs font-bold transition-all shadow-md shadow-[#963189]/20 active:scale-95 cursor-pointer self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>+ Buat Misi Baru</span>
      </button>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
      <div class="relative w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari judul atau kode misi..."
          class="w-full text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#963189]"
        />
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
        <!-- Batch Filter -->
        <select
          v-model="missionBatchFilter"
          class="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#963189] cursor-pointer"
        >
          <option value="ALL">Semua Cabang Gerai</option>
          <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
            {{ b.name.split('—')[1] || b.name }}
          </option>
        </select>

        <!-- Week Filter -->
        <select
          v-model="missionWeekFilter"
          class="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#963189] cursor-pointer"
        >
          <option value="ALL">Semua Minggu</option>
          <option value="1">Week 1</option>
          <option value="2">Week 2</option>
          <option value="3">Week 3</option>
        </select>
      </div>
    </div>

    <!-- Missions Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="m in filteredMissions"
        :key="m.id"
        class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-sm"
      >
        <div>
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#963189]/10 text-[#963189] dark:text-[#db92d7]">
              {{ m.code }} • Week {{ m.week }}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {{ m.category }}
            </span>
          </div>

          <h4 class="text-sm font-black text-slate-900 dark:text-white">
            {{ m.title }}
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {{ m.description }}
          </p>

          <!-- Target Branch & Assigned Crew Count -->
          <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-400">
              Cabang: <strong class="text-slate-700 dark:text-slate-300">{{ getBatchName(m.batchId) }}</strong>
            </span>
            <span class="font-bold text-[#499ec7]">
              {{ (m.assignedCrewIds || []).length || gamificationStore.crewsByBatch(m.batchId).length }} Crew
            </span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            @click="editMission(m)"
            class="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#963189] dark:hover:text-[#db92d7] flex items-center gap-1 cursor-pointer"
          >
            <Edit3 class="w-3.5 h-3.5" />
            <span>Edit Misi</span>
          </button>

          <button
            type="button"
            @click="confirmDeleteMission(m)"
            class="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 class="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Create / Edit Mission Modal -->
    <BaseModal
      :modelValue="showMissionModal"
      :title="editingMission ? 'Edit Misi Gerai' : 'Buat Misi Operasional Gerai'"
      subtitle="Tentukan batch cabang, minggu aktif, dan rincian SOP yang dinilai"
      max-width="lg"
      @update:modelValue="showMissionModal = $event"
      @close="showMissionModal = false"
    >
      <form @submit.prevent="saveMission" class="space-y-3 py-2">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cabang Gerai Target</label>
            <select
              v-model="missionForm.batchId"
              required
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                {{ b.name.split('—')[1] || b.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Minggu Operasional (Week)</label>
            <select
              v-model="missionForm.week"
              required
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option :value="1">Week 1</option>
              <option :value="2">Week 2 (Active Cycle)</option>
              <option :value="3">Week 3</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Misi SOP</label>
          <input
            v-model="missionForm.title"
            type="text"
            required
            placeholder="Contoh: Audit Suhu Chiller 2-4°C & Rotasi Stok Cold-Pressed"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Misi</label>
            <input
              v-model="missionForm.code"
              type="text"
              placeholder="MSN-W2-05"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
            <select
              v-model="missionForm.category"
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option value="Cold Chain">Cold Chain</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Service">Service</option>
              <option value="Compliance">Compliance</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Misi</label>
          <textarea
            v-model="missionForm.description"
            rows="2"
            placeholder="Instruksi operasional misi..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
          ></textarea>
        </div>

        <div class="p-3 rounded-xl bg-[#963189]/10 text-xs text-[#963189] dark:text-[#db92d7]">
          ℹ️ Misi ini akan otomatis ditugaskan ke <strong>seluruh Crew</strong> yang terdaftar di cabang gerai terpilih.
        </div>

        <div class="pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="showMissionModal = false"
            class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#963189] text-white shadow-md shadow-[#963189]/20 cursor-pointer"
          >
            {{ editingMission ? 'Simpan Misi' : 'Buat Misi' }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { useToast } from '~/composables/useToast.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Plus, Edit3, Trash2, Search } from 'lucide-vue-next'

const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()
const toast = useToast()

const searchQuery = ref('')
const missionBatchFilter = ref('ALL')
const missionWeekFilter = ref('ALL')

const showMissionModal = ref(false)
const editingMission = ref(null)

const missionForm = ref({
  title: '',
  code: '',
  category: 'Quality Control',
  batchId: 'batch-alpha',
  week: 2,
  description: ''
})

const filteredMissions = computed(() => {
  return missionStore.allMissions.filter(m => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchTitle = m.title.toLowerCase().includes(q)
      const matchCode = m.code.toLowerCase().includes(q)
      if (!matchTitle && !matchCode) return false
    }
    if (missionBatchFilter.value !== 'ALL' && m.batchId !== missionBatchFilter.value) return false
    if (missionWeekFilter.value !== 'ALL' && m.week !== Number(missionWeekFilter.value)) return false
    return true
  })
})

const getBatchName = (batchId) => {
  const b = batchStore.batchById(batchId)
  return b ? (b.name.split('—')[1] || b.name) : 'Semua Gerai'
}

const openCreateMissionModal = () => {
  editingMission.value = null
  missionForm.value = {
    title: '',
    code: `MSN-W2-0${missionStore.allMissions.length + 1}`,
    category: 'Quality Control',
    batchId: batchStore.selectedBatchId || 'batch-alpha',
    week: 2,
    description: ''
  }
  showMissionModal.value = true
}

const editMission = (mission) => {
  editingMission.value = mission
  missionForm.value = { ...mission }
  showMissionModal.value = true
}

const saveMission = () => {
  if (editingMission.value) {
    missionStore.updateMission(editingMission.value.id, missionForm.value)
    toast.success('Misi Diperbarui', `Misi ${missionForm.value.title} berhasil disimpan.`)
  } else {
    const newM = missionStore.createMission(missionForm.value)
    toast.success('Misi Baru Dibuat', `Misi ${newM.title} berhasil dibuat dan ditugaskan ke seluruh Crew di gerai.`)
  }
  showMissionModal.value = false
}

const confirmDeleteMission = (mission) => {
  if (confirm(`Hapus misi ${mission.title}?`)) {
    missionStore.deleteMission(mission.id)
    toast.info('Misi Dihapus', `Misi ${mission.title} telah dihapus.`)
  }
}
</script>
