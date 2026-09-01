<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Edit Batch: {{ batch?.name }}</span>
    </div>

    <!-- Error State -->
    <div v-if="!batch" class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch tidak ditemukan.</p>
      <NuxtLink to="/admin/batches" class="text-xs text-[#831843] font-semibold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- Main Clean Card Form -->
    <div v-else class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843]">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Pengaturan & Penugasan: {{ batch.name }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Perbarui data gerai, periode pelaksanaan, tema mingguan, penanggung jawab, dan sesuaikan anggota kru.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-6 pt-6">
        
        <!-- 1. Informasi Gerai & Periode Pelaksanaan -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Informasi Gerai & Periode Pelaksanaan
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Nama Batch -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Batch / Cabang *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <!-- Kode Batch -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Batch</label>
              <input
                v-model="form.code"
                type="text"
                readonly
                class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Lokasi Gerai -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Mall / Outlet *</label>
              <input
                v-model="form.storeLocation"
                type="text"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <!-- Min. Skor Bintang 5 -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min. Skor Bintang 5</label>
              <input
                v-model.number="form.approvalConfig.minScoreFor5Stars"
                type="number"
                min="50"
                max="100"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <!-- Tanggal Mulai & Tanggal Selesai (Auto-Calculate +21 Hari) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                  <span>Tanggal Mulai Siklus *</span>
                </span>
                <span class="text-[10px] text-slate-400 font-medium">Pilih Tanggal Mulai</span>
              </label>
              <input
                v-model="form.startDate"
                type="date"
                required
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
              <p class="text-[11px] text-slate-400 mt-1">Awal pembukaan misi Week 1.</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                <span class="flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                  <span>Tanggal Selesai Siklus</span>
                </span>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                  ⚡ Auto (+21 Hari)
                </span>
              </label>
              <input
                v-model="form.endDate"
                type="date"
                readonly
                class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
              />
              <p class="text-[11px] text-slate-400 mt-1">Dihitung otomatis 3 minggu (21 hari) dari tanggal mulai.</p>
            </div>
          </div>
        </div>

        <!-- 2. Tema & Judul Siklus Mingguan -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Tema & Judul Siklus Mingguan
            </h3>
            <span class="text-[11px] text-slate-400">Tampil pada kartu urutan Dashboard & Timeline</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label class="block text-[11px] font-bold text-[#831843] dark:text-[#f472b6] mb-1.5">
                📌 Judul Minggu 1
              </label>
              <input
                v-model="form.weeks[0].title"
                type="text"
                required
                placeholder="Minggu 1: Suhu & Sanitasi Dasar"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label class="block text-[11px] font-bold text-[#831843] dark:text-[#f472b6] mb-1.5">
                📌 Judul Minggu 2
              </label>
              <input
                v-model="form.weeks[1].title"
                type="text"
                required
                placeholder="Minggu 2: Kualitas Rasa & Layanan"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <label class="block text-[11px] font-bold text-[#831843] dark:text-[#f472b6] mb-1.5">
                📌 Judul Minggu 3
              </label>
              <input
                v-model="form.weeks[2].title"
                type="text"
                required
                placeholder="Minggu 3: Audit Akhir & Stok"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>
        </div>

        <!-- 3. Penanggung Jawab Approval -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            3. Penanggung Jawab Evaluasi & Approval
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                👔 Store Leader (SL) - Penilai Kru *
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
                👑 District Manager (DM) - Approver *
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

        <!-- 4. Paket Template SOP Misi -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Paket Misi Standar SOP
            </h3>
            <NuxtLink to="/admin/templates" class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold hover:underline">
              Kelola Template →
            </NuxtLink>
          </div>

          <div class="space-y-2">
            <select
              v-model="form.templatePackageId"
              class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
            >
              <option v-for="pkg in templateStore.allPackages" :key="pkg.id" :value="pkg.id">
                {{ pkg.name }} ({{ pkg.templates.length }} Misi • {{ pkg.targetType }})
              </option>
              <option value="NONE">-- Tidak Mengubah / Menambah Template --</option>
            </select>

            <div class="flex items-center justify-between p-3 rounded-xl bg-[#831843]/5 border border-[#831843]/15">
              <div class="text-[11px] text-slate-600 dark:text-slate-400">
                <span class="font-bold text-slate-900 dark:text-white">Status Misi Batch:</span>
                {{ batchMissions.length }} Misi terdaftar pada batch ini.
              </div>
              <button
                v-if="form.templatePackageId !== 'NONE'"
                type="button"
                @click="applyTemplateNow"
                class="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#831843] hover:bg-[#6b133a] text-white shadow-xs transition-all cursor-pointer"
              >
                Terapkan Template ke Batch
              </button>
            </div>
          </div>
        </div>

        <!-- 5. Pilih Anggota Crew (Compact Tag Selector) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              5. Anggota Kru yang Ditugaskan ({{ form.assignment.crewIds.length }} Terpilih)
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
import { useUserStore } from '~/stores/user.js'
import { useTemplateStore } from '~/stores/template.js'
import { useMissionStore } from '~/stores/mission.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft, Layers, Calendar } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const batchStore = useBatchStore()
const userStore = useUserStore()
const templateStore = useTemplateStore()
const missionStore = useMissionStore()
const toast = useToast()

const batch = computed(() => {
  return batchStore.batchById(route.params.id)
})

const batchMissions = computed(() => {
  return missionStore.missionsByBatch(route.params.id)
})

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
  code: '',
  storeLocation: '',
  startDate: '',
  endDate: '',
  description: '',
  templatePackageId: 'pkg-sop-standard',
  weeks: [
    { weekNumber: 1, title: 'Minggu 1: Suhu & Sanitasi Dasar', status: 'ACTIVE', isLocked: false },
    { weekNumber: 2, title: 'Minggu 2: Kualitas Rasa & Layanan', status: 'LOCKED', isLocked: true },
    { weekNumber: 3, title: 'Minggu 3: Audit Akhir & Stok', status: 'LOCKED', isLocked: true }
  ],
  assignment: {
    supervisorId: 'spv-001',
    supervisorName: 'Budi Santoso',
    headId: 'head-001',
    headName: 'Ahmad Dahlan',
    crewIds: []
  },
  approvalConfig: {
    minScoreFor5Stars: 90,
    minEvidenceCount: 1,
    maxRevisions: 3,
    requireEvidence: true
  }
})

const populateForm = (b) => {
  if (!b) return
  form.value.name = b.name || ''
  form.value.code = b.code || ''
  form.value.storeLocation = b.storeLocation || ''
  form.value.startDate = b.startDate || '2026-08-10'
  form.value.endDate = b.endDate || '2026-08-30'
  form.value.description = b.description || ''
  form.value.templatePackageId = b.templatePackageId || 'pkg-sop-standard'

  if (b.weeks && b.weeks.length === 3) {
    form.value.weeks = b.weeks.map(w => ({
      weekNumber: w.weekNumber,
      title: w.title,
      status: w.status,
      isLocked: w.isLocked
    }))
  }

  if (b.assignment) {
    form.value.assignment = {
      supervisorId: b.assignment.supervisorId || 'spv-001',
      supervisorName: b.assignment.supervisorName || 'Budi Santoso',
      headId: b.assignment.headId || 'head-001',
      headName: b.assignment.headName || 'Ahmad Dahlan',
      crewIds: [...(b.assignment.crewIds || [])]
    }
  } else {
    const currentBatchCrews = allCrews.value.filter(c => c.batchId === b.id).map(c => c.id)
    form.value.assignment.crewIds = currentBatchCrews
  }

  if (b.approvalConfig) {
    form.value.approvalConfig = { ...b.approvalConfig }
  }
}

watch(batch, (newB) => {
  if (newB) populateForm(newB)
}, { immediate: true })

// Automatically calculate End Date (+21 days) whenever Start Date changes
watch(
  () => form.value.startDate,
  (newStart) => {
    if (newStart) {
      const parts = newStart.split('-').map(Number)
      const d = new Date(parts[0], parts[1] - 1, parts[2])
      d.setDate(d.getDate() + 21)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      form.value.endDate = `${year}-${month}-${day}`
    }
  }
)

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

const applyTemplateNow = () => {
  if (!form.value.templatePackageId || form.value.templatePackageId === 'NONE') return
  const created = templateStore.applyPackageToBatch(route.params.id, form.value.templatePackageId)
  if (created && created.length > 0) {
    toast.success('Template Diterapkan', `Berhasil menambahkan ${created.length} butir misi baru ke batch ini.`)
  } else {
    toast.info('Template Sudah Sesuai', 'Seluruh misi dari paket template ini sudah terdaftar pada batch.')
  }
}

const handleUpdate = () => {
  const selectedSpv = availableSupervisors.value.find(s => s.id === form.value.assignment.supervisorId)
  const selectedHead = availableHeads.value.find(h => h.id === form.value.assignment.headId)

  if (selectedSpv) form.value.assignment.supervisorName = selectedSpv.name
  if (selectedHead) form.value.assignment.headName = selectedHead.name

  batchStore.updateBatch(route.params.id, form.value)

  // Apply template if selected
  if (form.value.templatePackageId && form.value.templatePackageId !== 'NONE') {
    templateStore.applyPackageToBatch(route.params.id, form.value.templatePackageId)
  }

  // Reassign selected crew members to this batch
  form.value.assignment.crewIds.forEach(cId => {
    userStore.assignUserToBatch(cId, batch.value.id, form.value.storeLocation || batch.value.name)
  })

  toast.success('Batch Berhasil Diperbarui', `Perubahan data batch ${batch.value.name} tersimpan.`)
  router.push('/admin/batches')
}
</script>
