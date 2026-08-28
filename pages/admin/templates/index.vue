<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#831843] dark:text-[#f472b6] font-semibold">Master Mission Templates</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Master Template & Paket SOP Misi
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola katalog paket template SOP multi-format (Mall, Kiosk Express, Onboarding) dan terapkan ke batch gerai dalam 1 klik.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          @click="openCreatePackageModal"
          class="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
        >
          <Plus class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
          <span>Buat Paket Master Baru</span>
        </button>

        <button
          type="button"
          @click="openApplyPackageModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white text-xs font-bold transition-all shadow-md shadow-[#831843]/25 active:scale-95 cursor-pointer"
        >
          <Sparkles class="w-4 h-4" />
          <span>Terapkan Paket ke Batch Gerai</span>
        </button>
      </div>
    </div>

    <!-- KATALOG PAKET MASTER TEMPLATES (CARDS GRID / SELECTOR) -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
          Katalog Paket Master Template Tersedia ({{ templateStore.allPackages.length }} Paket)
        </h3>
        <span class="text-xs text-slate-400">Pilih paket di bawah untuk melihat & mengedit butir SOP</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="pkg in templateStore.allPackages"
          :key="pkg.id"
          @click="templateStore.selectPackage(pkg.id)"
          class="p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
          :class="[
            templateStore.selectedPackageId === pkg.id
              ? 'border-[#831843] bg-white dark:bg-slate-900 ring-2 ring-[#831843] shadow-md'
              : 'border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300'
          ]"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                {{ pkg.code }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {{ pkg.category }}
              </span>
            </div>

            <h4 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {{ pkg.name }}
            </h4>
            <p class="text-[11px] font-medium text-[#831843] dark:text-[#f472b6] mt-0.5">
              🎯 Target: {{ pkg.targetType }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              {{ pkg.description }}
            </p>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span class="font-bold text-slate-700 dark:text-slate-300">
              {{ pkg.templates.length }} Butir Misi SOP
            </span>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click.stop="duplicatePackage(pkg.id)"
                title="Duplikat Paket Ini"
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Copy class="w-3.5 h-3.5" />
              </button>
              <button
                v-if="templateStore.allPackages.length > 1"
                type="button"
                @click.stop="confirmDeletePackage(pkg)"
                title="Hapus Paket"
                class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL PAKET AKTIF & DAFTAR MISI -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
      
      <!-- Active Package Banner -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-br from-[#831843]/10 via-[#9d174d]/5 to-transparent border border-[#831843]/20">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold px-2 py-0.5 rounded bg-[#831843] text-white">
              Paket Aktif
            </span>
            <span class="text-xs text-slate-500 font-semibold">
              {{ activePackage?.code }} • {{ activePackage?.category }}
            </span>
          </div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ activePackage?.name }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {{ activePackage?.description }}
          </p>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            @click="openAddMissionModal"
            class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Tambah Butir SOP</span>
          </button>
          <button
            type="button"
            @click="openApplyPackageModal"
            class="px-4 py-2 rounded-xl bg-[#831843] text-white font-bold text-xs hover:bg-[#6b133a] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Terapkan ke Batch</span>
          </button>
        </div>
      </div>

      <!-- Week Filter Tabs -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit">
            <button
              v-for="w in [1, 2, 3]"
              :key="w"
              type="button"
              @click="activeWeekTab = w"
              class="px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              :class="[
                activeWeekTab === w
                  ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              Week {{ w }} ({{ currentWeekTemplates.length }} Misi)
            </button>
          </div>

          <span class="text-xs text-slate-400">
            Total <strong>{{ activePackage?.templates.length || 0 }} Misi</strong> dalam paket ini
          </span>
        </div>

        <!-- Missions Grid for Selected Week -->
        <div v-if="currentWeekTemplates.length === 0" class="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <p class="text-xs font-semibold text-slate-500">Belum ada butir misi SOP untuk Week {{ activeWeekTab }} pada paket ini.</p>
          <button
            type="button"
            @click="openAddMissionModal"
            class="mt-2 text-xs font-bold text-[#831843] hover:underline"
          >
            + Tambah Misi Week {{ activeWeekTab }} Sekarang
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="tmpl in currentWeekTemplates"
            :key="tmpl.id"
            class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between relative group"
          >
            <div>
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                  {{ tmpl.codePrefix }} • Week {{ tmpl.week }}
                </span>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {{ tmpl.category }}
                  </span>
                  <button
                    type="button"
                    @click="removeMission(tmpl.id)"
                    class="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-600 transition-opacity cursor-pointer"
                    title="Hapus butir misi ini"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                {{ tmpl.title }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {{ tmpl.description }}
              </p>

              <!-- Requirements Preview -->
              <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Checklist SOP ({{ tmpl.requirements.length }} Poin):
                </span>
                <ul class="space-y-1">
                  <li
                    v-for="(req, idx) in tmpl.requirements"
                    :key="idx"
                    class="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                  >
                    <Check class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{{ req }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL 1: BUAT MASTER PAKET BARU -->
    <BaseModal
      :modelValue="showCreatePackageModal"
      title="Buat Master Paket Template Baru"
      subtitle="Definisikan paket master SOP baru untuk kategori atau format gerai tertentu"
      max-width="md"
      @update:modelValue="showCreatePackageModal = $event"
      @close="showCreatePackageModal = false"
    >
      <form @submit.prevent="executeCreatePackage" class="space-y-4 py-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Paket Master *</label>
          <input
            v-model="newPkgForm.name"
            type="text"
            required
            placeholder="Contoh: Paket Gerai Stasiun & Hub Transportasi"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Paket *</label>
            <input
              v-model="newPkgForm.code"
              type="text"
              required
              placeholder="PKG-HUB-08"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Format Gerai *</label>
            <input
              v-model="newPkgForm.targetType"
              type="text"
              required
              placeholder="Stasiun & Bandara"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Paket</label>
          <select
            v-model="newPkgForm.category"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option value="Standar Operasional">Standar Operasional</option>
            <option value="Gerai Express">Gerai Express</option>
            <option value="Pelatihan & Onboarding">Pelatihan & Onboarding</option>
            <option value="Audit Mutu HACCP">Audit Mutu HACCP</option>
            <option value="Kampanye Seasonal">Kampanye Seasonal</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Paket</label>
          <textarea
            v-model="newPkgForm.description"
            rows="2"
            placeholder="Deskripsi target penggunaan paket template ini..."
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
            Simpan Paket Master
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 2: TAMBAH BUTIR MISI SOP KE PAKET -->
    <BaseModal
      :modelValue="showAddMissionModal"
      title="Tambah Butir SOP Misi"
      :subtitle="`Menambahkan butir SOP ke dalam ${activePackage?.name}`"
      max-width="md"
      @update:modelValue="showAddMissionModal = $event"
      @close="showAddMissionModal = false"
    >
      <form @submit.prevent="executeAddMission" class="space-y-4 py-2">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alokasi Minggu (Week) *</label>
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
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Prefix</label>
            <input
              v-model="newMissionForm.codePrefix"
              type="text"
              placeholder="M-13"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Misi SOP *</label>
          <input
            v-model="newMissionForm.title"
            type="text"
            required
            placeholder="Contoh: Kalibrasi Timbangan Buah Digital"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
          <input
            v-model="newMissionForm.category"
            type="text"
            placeholder="Kalibrasi Alat / Sanitasi / Pelayanan"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Standar</label>
          <textarea
            v-model="newMissionForm.description"
            rows="2"
            placeholder="Penjelasan ringkas instruksi SOP..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Poin Checklist SOP (Pisahkan per baris)</label>
          <textarea
            v-model="newMissionForm.requirementsText"
            rows="3"
            placeholder="Poin 1: Periksa baterai timbangan&#10;Poin 2: Uji beban standar 500 gram"
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
            Tambahkan Misi
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 3: TERAPKAN PAKET KE BATCH GERAI -->
    <BaseModal
      :modelValue="showApplyModal"
      title="Terapkan Paket SOP ke Batch Gerai"
      :subtitle="`Paket: ${activePackage?.name} (${activePackage?.templates.length} Misi)`"
      max-width="md"
      @update:modelValue="showApplyModal = $event"
      @close="showApplyModal = false"
    >
      <form @submit.prevent="executeApplyPackage" class="space-y-4 py-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Pilih Batch Gerai Tujuan *
          </label>
          <select
            v-model="targetBatchId"
            required
            class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          >
            <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
              {{ b.name }} — {{ b.storeLocation }} ({{ b.code }})
            </option>
          </select>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs space-y-1.5">
          <p class="font-bold text-slate-900 dark:text-white">Rincian yang akan dieksekusi:</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            • Seluruh {{ activePackage?.templates.length }} butir misi SOP akan di-generate otomatis untuk Week 1, 2, dan 3.<br />
            • Otomatis menugaskan seluruh kru aktif yang terdaftar pada batch tersebut.
          </p>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showApplyModal = false"
            class="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Terapkan Paket Sekarang
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
import { Sparkles, Download, Check, Plus, Copy, Trash2 } from 'lucide-vue-next'

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
  code: '',
  category: 'Standar Operasional',
  targetType: 'Gerai Flagship',
  description: ''
})

// Mission Template Creation Form
const newMissionForm = ref({
  week: 1,
  codePrefix: '',
  title: '',
  category: 'Quality Control',
  description: '',
  requirementsText: ''
})

const openCreatePackageModal = () => {
  newPkgForm.value = {
    name: '',
    code: `PKG-SOP-0${templateStore.allPackages.length + 1}`,
    category: 'Standar Operasional',
    targetType: 'Gerai Flagship',
    description: ''
  }
  showCreatePackageModal.value = true
}

const executeCreatePackage = () => {
  const created = templateStore.createPackage(newPkgForm.value)
  showCreatePackageModal.value = false
  toast.success('Paket Master Dibuat', `Paket "${created.name}" berhasil ditambahkan ke katalog.`)
}

const duplicatePackage = (pkgId) => {
  const dup = templateStore.duplicatePackage(pkgId)
  if (dup) {
    toast.success('Paket Berhasil Diduplikasi', `Paket salinan "${dup.name}" siap dimodifikasi.`)
  }
}

const confirmDeletePackage = (pkg) => {
  if (confirm(`Apakah Anda yakin ingin menghapus paket master "${pkg.name}"?`)) {
    templateStore.deletePackage(pkg.id)
    toast.info('Paket Dihapus', `Paket "${pkg.name}" telah dihapus.`)
  }
}

const openAddMissionModal = () => {
  newMissionForm.value = {
    week: activeWeekTab.value,
    codePrefix: `M-0${(activePackage.value?.templates.length || 0) + 1}`,
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
    requirements: reqs.length > 0 ? reqs : ['Pemeriksaan kepatuhan standar SOP Re.juve']
  })

  showAddMissionModal.value = false
  toast.success('Butir SOP Ditambahkan', `Misi "${newMissionForm.value.title}" ditambahkan ke Week ${newMissionForm.value.week}.`)
}

const removeMission = (tmplId) => {
  if (confirm('Hapus butir SOP ini dari paket master?')) {
    templateStore.removeMissionFromPackage(activePackage.value.id, tmplId)
    toast.info('Butir SOP Dihapus', 'Butir misi telah dihapus dari paket master.')
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
    'Paket SOP Berhasil Diterapkan!',
    `${created.length} Misi dari "${activePackage.value?.name}" aktif untuk ${targetBatch?.name || 'Batch'}.`
  )
  router.push('/admin/missions')
}
</script>
