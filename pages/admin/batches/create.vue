<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Buat Batch Baru</span>
    </div>

    <!-- Main Clean Card Form -->
    <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843]">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Buat Batch Baru
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Isi informasi cabang, tetapkan penanggung jawab, dan pilih template SOP.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6 pt-6">
        
        <!-- 1. Informasi Cabang -->
        <div class="space-y-3">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Informasi Gerai & Cabang
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Batch / Cabang *</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Contoh: Batch 4"
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Mall / Outlet *</label>
              <input
                v-model="form.storeLocation"
                type="text"
                required
                placeholder="Contoh: Grand Indonesia, Jakarta"
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>
        </div>

        <!-- 2. Penanggung Jawab Approval -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            2. Penanggung Jawab Evaluasi & Approval
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                👔 Supervisor Penilai (Evaluator) *
              </label>
              <select
                v-model="form.assignment.supervisorId"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
              >
                <option v-for="spv in availableSupervisors" :key="spv.id" :value="spv.id">
                  {{ spv.name }} ({{ spv.position }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                👑 Head of Operations (Approver) *
              </label>
              <select
                v-model="form.assignment.headId"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
              >
                <option v-for="h in availableHeads" :key="h.id" :value="h.id">
                  {{ h.name }} ({{ h.position }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 3. Paket Template SOP Misi -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Paket Misi Standar SOP
            </h3>
            <NuxtLink to="/admin/templates" class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold hover:underline">
              Kelola Template →
            </NuxtLink>
          </div>

          <div>
            <select
              v-model="form.templatePackageId"
              class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
            >
              <option v-for="pkg in templateStore.allPackages" :key="pkg.id" :value="pkg.id">
                {{ pkg.name }} ({{ pkg.templates.length }} Misi • {{ pkg.targetType }})
              </option>
              <option value="NONE">-- Mulai dengan Misi Kosong --</option>
            </select>
          </div>
        </div>

        <!-- 4. Pilih Anggota Crew (Compact Tag Selector) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Anggota Kru yang Ditugaskan ({{ form.assignment.crewIds.length }} Terpilih)
            </h3>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="selectAllCrew"
                class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold hover:underline cursor-pointer"
              >
                Pilih Semua
              </button>
              <span class="text-slate-300">|</span>
              <button
                type="button"
                @click="form.assignment.crewIds = []"
                class="text-xs text-slate-400 hover:text-rose-500 font-semibold cursor-pointer"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <!-- Compact Crew Badges Grid -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="crew in allCrews"
              :key="crew.id"
              type="button"
              @click="toggleCrewSelection(crew.id)"
              class="px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
              :class="[
                form.assignment.crewIds.includes(crew.id)
                  ? 'bg-[#831843] text-white border-[#831843] shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              ]"
            >
              <img :src="crew.avatar" :alt="crew.name" class="w-5 h-5 rounded-full object-cover" />
              <span>{{ crew.name }}</span>
              <span class="text-[10px] opacity-75">({{ crew.position }})</span>
            </button>
          </div>
        </div>

        <!-- 5. Pengaturan Lanjutan (Collapsible Accordion) -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="showAdvanced = !showAdvanced"
            class="flex items-center justify-between w-full text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <span>⚙️ Pengaturan Lanjutan & Tanggal (Opsional)</span>
            <ChevronDown class="w-4 h-4 transition-transform duration-200" :class="{ 'rotate-180': showAdvanced }" />
          </button>

          <div v-if="showAdvanced" class="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Kode Batch</label>
                <input
                  v-model="form.code"
                  type="text"
                  class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Tanggal Mulai</label>
                <input
                  v-model="form.startDate"
                  type="date"
                  class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Tanggal Selesai</label>
                <input
                  v-model="form.endDate"
                  type="date"
                  class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Min. Skor Bintang 5</label>
                <input
                  v-model.number="form.approvalConfig.minScoreFor5Stars"
                  type="number"
                  class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label class="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">Deskripsi Tambahan</label>
                <input
                  v-model="form.description"
                  type="text"
                  placeholder="Catatan gerai..."
                  class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/admin/batches"
            class="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan Batch
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft, Layers, ChevronDown } from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const userStore = useUserStore()
const templateStore = useTemplateStore()
const toast = useToast()

const showAdvanced = ref(false)

const availableSupervisors = computed(() => {
  return userStore.allUsers.filter(u => u.role === 'SUPERVISOR')
})

const availableHeads = computed(() => {
  return userStore.allUsers.filter(u => u.role === 'HEAD')
})

const allCrews = computed(() => {
  return userStore.allUsers.filter(u => u.role === 'CREW')
})

const form = ref({
  name: '',
  code: `BTH-0${batchStore.allBatches.length + 1}`,
  storeLocation: '',
  startDate: '2026-09-01',
  endDate: '2026-09-21',
  description: '',
  templatePackageId: templateStore.allPackages[0]?.id || 'pkg-sop-standard',
  assignment: {
    supervisorId: availableSupervisors.value[0]?.id || 'spv-001',
    supervisorName: availableSupervisors.value[0]?.name || 'Budi Santoso',
    headId: availableHeads.value[0]?.id || 'head-001',
    headName: availableHeads.value[0]?.name || 'Ahmad Dahlan',
    crewIds: ['crew-001', 'crew-002', 'crew-003', 'crew-004', 'crew-005', 'crew-006']
  },
  approvalConfig: {
    minScoreFor5Stars: 90,
    minEvidenceCount: 1,
    maxRevisions: 3,
    requireEvidence: true
  }
})

const toggleCrewSelection = (crewId) => {
  const idx = form.value.assignment.crewIds.indexOf(crewId)
  if (idx > -1) {
    form.value.assignment.crewIds.splice(idx, 1)
  } else {
    form.value.assignment.crewIds.push(crewId)
  }
}

const selectAllCrew = () => {
  form.value.assignment.crewIds = allCrews.value.map(c => c.id)
}

const handleSubmit = () => {
  const selectedSpv = availableSupervisors.value.find(s => s.id === form.value.assignment.supervisorId)
  const selectedHead = availableHeads.value.find(h => h.id === form.value.assignment.headId)

  if (selectedSpv) form.value.assignment.supervisorName = selectedSpv.name
  if (selectedHead) form.value.assignment.headName = selectedHead.name

  const applyTemplate = form.value.templatePackageId !== 'NONE'
  const newB = batchStore.createBatch({
    ...form.value,
    applyTemplatePackage: applyTemplate,
    templatePackageId: form.value.templatePackageId
  })

  // Reassign selected crew members to this new batch
  form.value.assignment.crewIds.forEach(cId => {
    userStore.assignUserToBatch(cId, newB.id, newB.storeLocation || newB.name)
  })

  toast.success('Batch Berhasil Dibuat!', `Batch ${newB.name} aktif dengan ${form.value.assignment.crewIds.length} kru.`)
  router.push('/admin/batches')
}
</script>
