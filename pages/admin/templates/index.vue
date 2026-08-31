<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#831843] dark:text-[#f472b6] font-semibold">Master Templates</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Master Template SOP Misi
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Katalog paket SOP operasional siap pakai untuk langsung diterapkan ke gerai.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openCreatePackageModal"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
        >
          <Plus class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
          <span>Buat Paket Master Baru</span>
        </button>

        <button
          type="button"
          @click="openApplyPackageModal"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
        >
          <Sparkles class="w-4 h-4" />
          <span>Terapkan ke Gerai</span>
        </button>
      </div>
    </div>

    <!-- 2-Column Clean Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- KOLOM KIRI: DAFTAR PAKET MASTER (4/12) -->
      <div class="lg:col-span-4 space-y-3">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Daftar Paket Template ({{ templateStore.allPackages.length }})
        </h3>

        <div class="space-y-2">
          <div
            v-for="pkg in templateStore.allPackages"
            :key="pkg.id"
            @click="templateStore.selectPackage(pkg.id)"
            class="p-4 rounded-2xl border transition-all cursor-pointer relative"
            :class="[
              templateStore.selectedPackageId === pkg.id
                ? 'border-[#831843] bg-white dark:bg-slate-900 ring-2 ring-[#831843]/40 shadow-sm'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
            ]"
          >
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                {{ pkg.code }}
              </span>
              <span class="text-[10px] text-slate-400 font-semibold">
                {{ pkg.templates.length }} Misi
              </span>
            </div>

            <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              {{ pkg.name }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {{ pkg.description }}
            </p>

            <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">🎯 {{ pkg.targetType }}</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click.stop="duplicatePackage(pkg.id)"
                  title="Duplikat"
                  class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <Copy class="w-3 h-3" />
                </button>
                <button
                  v-if="templateStore.allPackages.length > 1"
                  type="button"
                  @click.stop="confirmDeletePackage(pkg)"
                  title="Hapus"
                  class="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN: DETAIL BUTIR MISI PAKET (8/12) -->
      <div class="lg:col-span-8">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
          
          <!-- Package Header Summary -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-[#831843] text-white">
                  {{ activePackage?.code }}
                </span>
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ activePackage?.name }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ activePackage?.description }}
              </p>
            </div>

            <button
              type="button"
              @click="openAddMissionModal"
              class="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Butir SOP</span>
            </button>
          </div>

          <!-- Week Tabs -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
              <button
                v-for="w in [1, 2, 3]"
                :key="w"
                type="button"
                @click="activeWeekTab = w"
                class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                :class="[
                  activeWeekTab === w
                    ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                ]"
              >
                Week {{ w }} ({{ currentWeekTemplates.length }})
              </button>
            </div>

            <span class="text-xs text-slate-400">
              Total <strong>{{ activePackage?.templates.length || 0 }} Misi</strong>
            </span>
          </div>

          <!-- Missions Simple Clean List -->
          <div v-if="currentWeekTemplates.length === 0" class="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <p class="text-xs text-slate-500">Belum ada butir misi untuk Week {{ activeWeekTab }}.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="tmpl in currentWeekTemplates"
              :key="tmpl.id"
              class="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2 relative group"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                    {{ tmpl.codePrefix }}
                  </span>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ tmpl.title }}
                  </h4>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700">
                    {{ tmpl.category }}
                  </span>
                  <button
                    type="button"
                    @click="removeMission(tmpl.id)"
                    class="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-600 transition-opacity cursor-pointer"
                    title="Hapus Misi"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {{ tmpl.description }}
              </p>

              <!-- SOP Points -->
              <div class="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1">
                <div
                  v-for="(req, idx) in tmpl.requirements"
                  :key="idx"
                  class="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300"
                >
                  <Check class="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{{ req }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- MODAL 1: BUAT MASTER PAKET BARU -->
    <BaseModal
      :modelValue="showCreatePackageModal"
      title="Buat Master Paket Baru"
      subtitle="Definisikan nama dan format gerai untuk paket template ini"
      max-width="sm"
      @update:modelValue="showCreatePackageModal = $event"
      @close="showCreatePackageModal = false"
    >
      <form @submit.prevent="executeCreatePackage" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Paket *</label>
          <input
            v-model="newPkgForm.name"
            type="text"
            required
            placeholder="Contoh: Standar Gerai Bandara"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Format Gerai</label>
          <input
            v-model="newPkgForm.targetType"
            type="text"
            placeholder="Kiosk / Bandara / Mall"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Singkat</label>
          <textarea
            v-model="newPkgForm.description"
            rows="2"
            placeholder="Deskripsi target penggunaan..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showCreatePackageModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan Paket
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 2: TAMBAH BUTIR MISI SOP KE PAKET -->
    <BaseModal
      :modelValue="showAddMissionModal"
      title="Tambah Butir SOP"
      :subtitle="`Ke dalam ${activePackage?.name}`"
      max-width="sm"
      @update:modelValue="showAddMissionModal = $event"
      @close="showAddMissionModal = false"
    >
      <form @submit.prevent="executeAddMission" class="space-y-3 py-2">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Minggu (Week) *</label>
            <select
              v-model.number="newMissionForm.week"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
            >
              <option :value="1">Week 1</option>
              <option :value="2">Week 2</option>
              <option :value="3">Week 3</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
            <input
              v-model="newMissionForm.category"
              type="text"
              placeholder="Sanitasi / Pelayanan"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Misi SOP *</label>
          <input
            v-model="newMissionForm.title"
            type="text"
            required
            placeholder="Contoh: Kalibrasi Timbangan Buah"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Ringkas</label>
          <textarea
            v-model="newMissionForm.description"
            rows="2"
            placeholder="Instruksi SOP singkat..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Poin Checklist SOP (1 baris per poin)</label>
          <textarea
            v-model="newMissionForm.requirementsText"
            rows="2"
            placeholder="Poin 1&#10;Poin 2"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showAddMissionModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Tambah Misi
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 3: TERAPKAN PAKET KE BATCH GERAI -->
    <BaseModal
      :modelValue="showApplyModal"
      title="Terapkan Paket SOP ke Gerai"
      :subtitle="`Paket: ${activePackage?.name}`"
      max-width="sm"
      @update:modelValue="showApplyModal = $event"
      @close="showApplyModal = false"
    >
      <form @submit.prevent="executeApplyPackage" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Pilih Batch Gerai Tujuan *
          </label>
          <select
            v-model="targetBatchId"
            required
            class="w-full text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          >
            <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
              {{ b.name }} — {{ b.storeLocation }}
            </option>
          </select>
        </div>

        <p class="text-[11px] text-slate-500">
          Seluruh {{ activePackage?.templates.length }} butir misi SOP akan otomatis dibuat untuk batch yang dipilih.
        </p>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showApplyModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Terapkan Sekarang
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Sparkles, Check, Plus, Copy, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const templateStore = useTemplateStore()
const toast = useToast()

const activeWeekTab = ref(1)
const showApplyModal = ref(false)
const showCreatePackageModal = ref(false)
const showAddMissionModal = ref(false)

const targetBatchId = ref(batchStore.selectedBatchId || 'batch-alpha')

const activePackage = computed(() => templateStore.currentPackage)

const currentWeekTemplates = computed(() => {
  return templateStore.templatesByWeek(activeWeekTab.value)
})

// Package Creation Form
const newPkgForm = ref({
  name: '',
  category: 'Standar Operasional',
  targetType: 'Gerai Flagship',
  description: ''
})

// Mission Template Creation Form
const newMissionForm = ref({
  week: 1,
  title: '',
  category: 'Quality Control',
  description: '',
  requirementsText: ''
})

const openCreatePackageModal = () => {
  newPkgForm.value = {
    name: '',
    category: 'Standar Operasional',
    targetType: 'Gerai Flagship',
    description: ''
  }
  showCreatePackageModal.value = true
}

const executeCreatePackage = () => {
  const created = templateStore.createPackage({
    ...newPkgForm.value,
    code: `PKG-0${templateStore.allPackages.length + 1}`
  })
  showCreatePackageModal.value = false
  toast.success('Paket Dibuat', `Paket "${created.name}" siap digunakan.`)
}

const duplicatePackage = (pkgId) => {
  const dup = templateStore.duplicatePackage(pkgId)
  if (dup) {
    toast.success('Paket Diduplikasi', `Salinan "${dup.name}" berhasil dibuat.`)
  }
}

const confirmDeletePackage = (pkg) => {
  if (confirm(`Hapus paket master "${pkg.name}"?`)) {
    templateStore.deletePackage(pkg.id)
    toast.info('Paket Dihapus', `Paket "${pkg.name}" telah dihapus.`)
  }
}

const openAddMissionModal = () => {
  newMissionForm.value = {
    week: activeWeekTab.value,
    title: '',
    category: 'Standar Operasional',
    description: '',
    requirementsText: ''
  }
  showAddMissionModal.value = true
}

const executeAddMission = () => {
  const reqs = newMissionForm.value.requirementsText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  templateStore.addMissionToPackage(activePackage.value.id, {
    ...newMissionForm.value,
    codePrefix: `M-0${(activePackage.value?.templates.length || 0) + 1}`,
    requirements: reqs.length > 0 ? reqs : ['Pemeriksaan kepatuhan standar SOP Re.juve']
  })

  showAddMissionModal.value = false
  toast.success('Butir SOP Ditambahkan', `Misi "${newMissionForm.value.title}" ditambahkan ke Week ${newMissionForm.value.week}.`)
}

const removeMission = (tmplId) => {
  if (confirm('Hapus butir SOP ini?')) {
    templateStore.removeMissionFromPackage(activePackage.value.id, tmplId)
    toast.info('Butir SOP Dihapus', 'Misi telah dihapus dari paket.')
  }
}

const openApplyPackageModal = () => {
  showApplyModal.value = true
}

const executeApplyPackage = () => {
  const created = templateStore.applyPackageToBatch(targetBatchId.value, activePackage.value.id)
  showApplyModal.value = false
  const targetBatch = batchStore.batchById(targetBatchId.value)
  toast.success(
    'Paket SOP Diterapkan!',
    `${created.length} Misi dari "${activePackage.value?.name}" aktif untuk ${targetBatch?.name || 'Batch'}.`
  )
  router.push('/admin/missions')
}
</script>
