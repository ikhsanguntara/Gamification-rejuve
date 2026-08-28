<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Manajemen Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Buat Batch Baru</span>
    </div>

    <!-- Header Card -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843]">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Konfigurasi & Pembuatan Batch Baru
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Daftarkan batch gerai, tentukan Supervisor penilai, Head yang menyetujui, dan alokasikan anggota Crew.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8 pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
        
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
                placeholder="Contoh: Batch 4"
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Batch *</label>
              <input
                v-model="form.code"
                type="text"
                required
                placeholder="BTH-04"
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
                placeholder="Contoh: Kota Kasablanka Mall, Jakarta"
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Mulai Siklus *</label>
              <input
                v-model="form.startDate"
                type="date"
                required
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Selesai Siklus *</label>
              <input
                v-model="form.endDate"
                type="date"
                required
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Operasional</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Deskripsi operasional batch, target gerai, atau catatan khusus..."
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            ></textarea>
          </div>
        </div>

        <!-- SEKSI 2: STRUKTUR APPROVAL & ROUTING PEJABAT -->
        <div class="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-full bg-[#831843] text-white text-xs font-bold flex items-center justify-center">2</span>
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Struktur Approval Routing (Penetapan Supervisor & Head)
              </h3>
              <p class="text-xs text-slate-400">
                Pilih akun pejabat yang bertanggung jawab mengevaluasi dan menyetujui misi batch ini.
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
                Menerima antrean review, memberi persetujuan bintang / revisi di <code>/approvals</code>.
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
                  {{ crew.batchId ? `Saat ini: ${crew.batchId}` : 'Belum di-assign' }}
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

          <!-- ⚡ Dynamic Master Template Package Selector -->
          <div class="p-4 rounded-2xl bg-gradient-to-br from-[#831843]/10 via-[#9d174d]/5 to-transparent border border-[#831843]/30 dark:border-[#831843]/20 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>⚡ Paket Master Template SOP Misi</span>
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Auto Generate</span>
              </span>
              <NuxtLink to="/admin/templates" target="_blank" class="text-xs text-[#831843] dark:text-[#f472b6] font-bold hover:underline">
                Katalog Master Template →
              </NuxtLink>
            </div>

            <select
              v-model="form.templatePackageId"
              class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
            >
              <option v-for="pkg in templateStore.allPackages" :key="pkg.id" :value="pkg.id">
                {{ pkg.name }} ({{ pkg.totalMissions }} Misi • {{ pkg.targetType }})
              </option>
              <option value="NONE">-- Jangan Terapkan Template (Mulai dengan Misi Kosong) --</option>
            </select>

            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Paket master yang dipilih akan <strong>langsung menduplikasi seluruh butir misi SOP</strong> ke dalam batch ini secara instan saat tombol simpan ditekan.
            </p>
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
            class="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan & Aktifkan Batch
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
import { ArrowLeft, Layers, Search } from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const userStore = useUserStore()
const templateStore = useTemplateStore()
const toast = useToast()

const crewSearchQuery = ref('')
const crewRoleFilter = ref('ALL')

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

  // Reassign selected crew members to this new batch in userStore
  form.value.assignment.crewIds.forEach(cId => {
    userStore.assignUserToBatch(cId, newB.id, newB.storeLocation || newB.name)
  })

  toast.success('Batch & Routing Berhasil Dibuat!', `Batch ${newB.name} aktif dengan SPV: ${form.value.assignment.supervisorName}, Head: ${form.value.assignment.headName}, dan ${form.value.assignment.crewIds.length} Crew.`)
  router.push('/admin/batches')
}
</script>
