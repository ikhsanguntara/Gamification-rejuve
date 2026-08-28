<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Pengaturan Batch: {{ batch?.name }}</span>
    </div>

    <!-- Error State -->
    <div v-if="!batch" class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch tidak ditemukan.</p>
      <NuxtLink to="/admin/batches" class="text-xs text-[#831843] font-semibold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- Edit Form Card -->
    <div v-else class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843]">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Pengaturan & Penugasan: {{ batch.name }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Perbarui data Batch, mutasi Supervisor & Head, kelola anggota Crew, serta ubah aturan approval.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-8 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
        
        <!-- SEKSI 1: INFORMASI DASAR BATCH -->
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#831843] text-white text-xs font-bold flex items-center justify-center">1</span>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Informasi Dasar Batch & Lokasi
            </h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Batch *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Batch *</label>
              <input
                v-model="form.code"
                type="text"
                required
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lokasi Mall / Gerai *</label>
              <input
                v-model="form.storeLocation"
                type="text"
                required
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai Siklus</label>
              <input
                v-model="form.startDate"
                type="date"
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Selesai Siklus</label>
              <input
                v-model="form.endDate"
                type="date"
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Gerai</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            ></textarea>
          </div>
        </div>

        <!-- SEKSI 2: STRUKTUR APPROVAL & ROUTING PEJABAT -->
        <div class="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#831843] text-white text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Struktur Approval Routing (Supervisor & Head)
              </h3>
              <p class="text-xs text-slate-400">
                Pilih akun pejabat yang bertugas mengevaluasi dan menyetujui misi batch ini.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <!-- Supervisor Selector -->
            <div>
              <label class="block text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <span class="text-base">👔</span>
                <span>Supervisor Penilai (Evaluator) *</span>
              </label>
              <select
                v-model="form.assignment.supervisorId"
                required
                class="w-full text-xs font-medium rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
              >
                <option v-for="spv in availableSupervisors" :key="spv.id" :value="spv.id">
                  {{ spv.name }} — {{ spv.position }} ({{ spv.email }})
                </option>
              </select>
              <p class="text-[11px] text-slate-400 mt-1">
                Bertugas menilai kepatuhan SOP 6 kru di menu <code>/evaluations</code>.
              </p>
            </div>

            <!-- Head of Operations Selector -->
            <div>
              <label class="block text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1.5">
                <span class="text-base">👑</span>
                <span>Head of Operations (Approver) *</span>
              </label>
              <select
                v-model="form.assignment.headId"
                required
                class="w-full text-xs font-medium rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
              >
                <option v-for="h in availableHeads" :key="h.id" :value="h.id">
                  {{ h.name }} — {{ h.position }} ({{ h.email }})
                </option>
              </select>
              <p class="text-[11px] text-slate-400 mt-1">
                Menerima antrean review dan memberi approval bintang di <code>/approvals</code>.
              </p>
            </div>
          </div>
        </div>

        <!-- SEKSI 3: ROSTER ANGGOTA CREW (MULTI-SELECT ASSIGNMENT) -->
        <div class="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-[#831843] text-white text-xs font-bold flex items-center justify-center">3</span>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Penugasan Roster Anggota Crew
                </h3>
                <p class="text-xs text-slate-400">
                  Pilih anggota kru yang dialokasikan ke dalam batch ini (Total Terpilih: <strong>{{ form.assignment.crewIds.length }} Kru</strong>).
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="selectAllCrew"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#831843] hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Pilih Semua
              </button>
              <button
                type="button"
                @click="form.assignment.crewIds = []"
                class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <!-- Crew Search & Role Filter -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="relative">
              <input
                v-model="crewSearchQuery"
                type="text"
                placeholder="Cari nama kru atau ID..."
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-8 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
              />
              <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <select
              v-model="crewRoleFilter"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
            >
              <option value="ALL">Semua Posisi Jabatan</option>
              <option value="Store Leader">Store Leader</option>
              <option value="Senior Barista">Senior Barista</option>
              <option value="Barista">Barista</option>
              <option value="Kasir">Kasir</option>
              <option value="Crew Barista">Crew Barista</option>
            </select>
          </div>

          <!-- Crew Selection Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
            <div
              v-for="crew in filteredCrewList"
              :key="crew.id"
              @click="toggleCrewSelection(crew.id)"
              class="p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all relative overflow-hidden"
              :class="[
                form.assignment.crewIds.includes(crew.id)
                  ? 'border-[#831843] bg-[#831843]/10 ring-2 ring-[#831843]/30 dark:bg-[#831843]/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              ]"
            >
              <input
                type="checkbox"
                :checked="form.assignment.crewIds.includes(crew.id)"
                class="w-4 h-4 rounded text-[#831843] focus:ring-[#831843] pointer-events-none"
              />
              
              <img
                :src="crew.avatar"
                :alt="crew.name"
                class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
              />

              <div class="min-w-0 flex-1">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ crew.name }}
                </h4>
                <p class="text-[11px] text-slate-400 truncate">
                  {{ crew.position }}
                </p>
                <span class="text-[10px] font-semibold text-slate-500 block">
                  {{ crew.batchId === batch.id ? 'Saat ini: di Batch ini' : crew.batchId ? `Saat ini: ${crew.batchId}` : 'Belum di-assign' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- SEKSI 4: ATURAN APPROVAL & GAMIFIKASI (APPROVAL CONFIG) -->
        <div class="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#831843] text-white text-xs font-bold flex items-center justify-center">4</span>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Logika Persetujuan & Gamifikasi
              </h3>
              <p class="text-xs text-slate-400">
                Sesuaikan kriteria evaluasi dan standar kelulusan bintang untuk batch ini.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batas Minimum Skor 5 Bintang
              </label>
              <input
                v-model.number="form.approvalConfig.minScoreFor5Stars"
                type="number"
                min="50"
                max="100"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white"
              />
              <span class="text-[10px] text-slate-400 mt-1 block">Skor di atas nilai ini mendapat ⭐ 5 bintang</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Minimal Foto Bukti Inspeksi
              </label>
              <input
                v-model.number="form.approvalConfig.minEvidenceCount"
                type="number"
                min="0"
                max="5"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white"
              />
              <span class="text-[10px] text-slate-400 mt-1 block">Jumlah wajib foto saat submit evaluasi</span>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Batas Maksimal Siklus Revisi
              </label>
              <input
                v-model.number="form.approvalConfig.maxRevisions"
                type="number"
                min="1"
                max="10"
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white"
              />
              <span class="text-[10px] text-slate-400 mt-1 block">Toleransi revisi sebelum eskalasi</span>
            </div>
          </div>
        </div>

        <!-- Tombol Aksi Submit -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/admin/batches"
            class="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan Perubahan Batch
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft, Layers, Search } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const batchStore = useBatchStore()
const userStore = useUserStore()
const toast = useToast()

const crewSearchQuery = ref('')
const crewRoleFilter = ref('ALL')

const batch = computed(() => {
  return batchStore.batchById(route.params.id)
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

const filteredCrewList = computed(() => {
  let list = allCrews.value
  if (crewRoleFilter.value !== 'ALL') {
    list = list.filter(c => c.position === crewRoleFilter.value)
  }
  if (crewSearchQuery.value.trim()) {
    const q = crewSearchQuery.value.toLowerCase()
    list = list.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
  }
  return list
})

const form = ref({
  name: '',
  code: '',
  storeLocation: '',
  startDate: '',
  endDate: '',
  description: '',
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

onMounted(() => {
  if (batch.value) {
    form.value.name = batch.value.name
    form.value.code = batch.value.code
    form.value.storeLocation = batch.value.storeLocation || ''
    form.value.startDate = batch.value.startDate || '2026-08-10'
    form.value.endDate = batch.value.endDate || '2026-08-30'
    form.value.description = batch.value.description || ''

    if (batch.value.assignment) {
      form.value.assignment = {
        supervisorId: batch.value.assignment.supervisorId || 'spv-001',
        supervisorName: batch.value.assignment.supervisorName || 'Budi Santoso',
        headId: batch.value.assignment.headId || 'head-001',
        headName: batch.value.assignment.headName || 'Ahmad Dahlan',
        crewIds: [...(batch.value.assignment.crewIds || [])]
      }
    } else {
      // Fallback: collect crews with this batchId
      const currentBatchCrews = allCrews.value.filter(c => c.batchId === batch.value.id).map(c => c.id)
      form.value.assignment.crewIds = currentBatchCrews
    }

    if (batch.value.approvalConfig) {
      form.value.approvalConfig = { ...batch.value.approvalConfig }
    }
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

const handleUpdate = () => {
  const selectedSpv = availableSupervisors.value.find(s => s.id === form.value.assignment.supervisorId)
  const selectedHead = availableHeads.value.find(h => h.id === form.value.assignment.headId)

  if (selectedSpv) form.value.assignment.supervisorName = selectedSpv.name
  if (selectedHead) form.value.assignment.headName = selectedHead.name

  batchStore.updateBatch(route.params.id, form.value)

  // Reassign selected crew members to this batch
  form.value.assignment.crewIds.forEach(cId => {
    userStore.assignUserToBatch(cId, batch.value.id, form.value.storeLocation || batch.value.name)
  })

  toast.success('Batch Berhasil Diperbarui', `Perubahan penugasan SPV (${form.value.assignment.supervisorName}), Head (${form.value.assignment.headName}), dan ${form.value.assignment.crewIds.length} Crew tersimpan.`)
  router.push('/admin/batches')
}
</script>
