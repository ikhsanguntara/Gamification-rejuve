<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Bisnis Parameter
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ groups.length }} Kategori Grup
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="openGroupModal()"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <FolderPlus class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
          <span>Tambah Grup</span>
        </button>
        <button
          type="button"
          @click="openParamModal()"
          :disabled="!selectedGroup"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah Parameter</span>
        </button>
      </div>
    </div>

    <!-- Master-Detail 2 Columns Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Kolom Kiri: Param Groups -->
      <div class="lg:col-span-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-4 space-y-3">
        <div class="flex items-center justify-between px-2">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
            Daftar Grup Parameter
          </span>
          <span class="text-[11px] font-semibold text-slate-500">
            {{ groups.length }} Total
          </span>
        </div>

        <div class="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
          <div
            v-for="g in groups"
            :key="g.paramgroupId"
            @click="selectGroup(g)"
            class="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group"
            :class="[
              selectedGroup?.paramgroupId === g.paramgroupId
                ? 'border-[#831843] bg-[#831843]/10 dark:bg-[#831843]/20 ring-1 ring-[#831843]'
                : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/30'
            ]"
          >
            <div>
              <p class="text-xs font-bold text-slate-900 dark:text-white font-mono">
                {{ g.code }}
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {{ g.name }}
              </p>
            </div>

            <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100">
              <button
                type="button"
                @click.stop="openGroupModal(g)"
                class="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Edit Grup"
              >
                <Edit3 class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click.stop="confirmDeleteGroup(g)"
                class="p-1 rounded-md text-slate-400 hover:text-rose-500"
                title="Hapus Grup"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div v-if="groups.length === 0" class="py-8 text-center text-xs text-slate-400">
            Belum ada grup parameter.
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Items Parameter di dalam Grup terpilih -->
      <div class="lg:col-span-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden flex flex-col justify-between min-h-[460px]">
        <div>
          <!-- Header Kolom Kanan -->
          <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Parameter Dalam Grup:
              </span>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                {{ selectedGroup?.code || 'Pilih salah satu grup' }}
              </h3>
            </div>
            <span
              v-if="selectedGroup"
              class="px-2.5 py-1 rounded-lg text-[10px] font-bold"
              :class="selectedGroup.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'"
            >
              {{ selectedGroup.isActive ? 'STATUS AKTIF' : 'NON-AKTIF' }}
            </span>
          </div>

          <!-- Table Parameter Items with TanStack Table -->
          <TanStackTable
            :data="paramsList"
            :columns="paramColumns"
            :loading="isLoadingParams"
            empty-text="Belum ada butir parameter pada grup ini. Klik '+ Tambah Parameter'."
          >
            <template #code="{ row }">
              <span class="font-mono font-bold text-slate-900 dark:text-white">
                {{ row.code }}
              </span>
            </template>

            <template #value="{ row }">
              <span class="font-medium text-slate-700 dark:text-slate-300">
                {{ row.value }}
              </span>
            </template>

            <template #isActive="{ row }">
              <span
                class="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
                :class="row.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700'"
              >
                {{ row.isActive ? 'Aktif' : 'Non-Aktif' }}
              </span>
            </template>

            <template #actions="{ row }">
              <div class="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  @click="openParamModal(row)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-[#831843] hover:bg-[#831843]/10"
                  title="Edit Param"
                >
                  <Edit3 class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  @click="confirmDeleteParam(row)"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Hapus Param"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </template>
          </TanStackTable>
        </div>

        <!-- Pagination Parameter Items -->
        <div v-if="totalParams > 0" class="p-4 border-t border-slate-100 dark:border-slate-800">
          <AppPagination
            v-model:current-page="paramPage"
            :total-items="totalParams"
            :items-per-page="paramPerPage"
            item-label="parameter"
          />
        </div>
      </div>
    </div>

    <!-- Modal Group Form -->
    <div
      v-if="showGroupModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          {{ isEditGroup ? 'Perbarui Grup Parameter' : 'Tambah Grup Parameter Baru' }}
        </h3>
        <form @submit.prevent="saveGroup" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Grup</label>
            <input
              v-model="groupForm.code"
              type="text"
              required
              :disabled="isEditGroup"
              placeholder="e.g. EVALUATION_SCALE"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 uppercase font-mono text-slate-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Grup</label>
            <input
              v-model="groupForm.name"
              type="text"
              required
              placeholder="e.g. Skala Penilaian Evaluasi"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white"
            />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showGroupModal = false"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white font-semibold shadow-md shadow-[#831843]/20"
            >
              Simpan Grup
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Param Item Form -->
    <div
      v-if="showParamModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          {{ isEditParam ? 'Perbarui Parameter' : 'Tambah Parameter Baru' }}
        </h3>
        <form @submit.prevent="saveParam" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Grup Acuan</label>
            <input
              type="text"
              disabled
              :value="selectedGroup?.name + ' (' + selectedGroup?.code + ')'"
              class="w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-500 dark:text-slate-400"
            />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Parameter</label>
            <input
              v-model="paramForm.code"
              type="text"
              required
              :disabled="isEditParam"
              placeholder="e.g. SCALE_20"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 uppercase font-mono text-slate-900 dark:text-white disabled:opacity-50"
            />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai / Deskripsi</label>
            <input
              v-model="paramForm.value"
              type="text"
              required
              placeholder="e.g. Kelipatan 20 (Max 5 Bintang)"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white"
            />
          </div>
          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showParamModal = false"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white font-semibold shadow-md shadow-[#831843]/20"
            >
              Simpan Parameter
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirmation Modal Delete -->
    <ConfirmationModal
      :model-value="showDeleteModal"
      :title="deleteType === 'group' ? 'Hapus Grup Parameter?' : 'Hapus Butir Parameter?'"
      :message="`Apakah Anda yakin ingin menghapus '${itemToDelete?.name || itemToDelete?.code || itemToDelete?.value}'? Tindakan ini tidak dapat dibatalkan.`"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      variant="danger"
      @update:model-value="showDeleteModal = $event"
      @confirm="executeDelete"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { paramApi } from '~/services/api.js'
import { useToast } from '~/composables/useToast.js'
import AppPagination from '~/components/ui/AppPagination.vue'
import TanStackTable from '~/components/ui/TanStackTable.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import { Plus, FolderPlus, Edit3, Trash2 } from 'lucide-vue-next'

const toast = useToast()

const groups = ref([])
const selectedGroup = ref(null)

const paramsList = ref([])
const totalParams = ref(0)
const paramPage = ref(1)
const paramPerPage = 10
const isLoadingParams = ref(false)

const paramColumns = [
  {
    id: 'code',
    header: 'Kode Parameter',
    accessorKey: 'code'
  },
  {
    id: 'value',
    header: 'Nilai / Label',
    accessorKey: 'value'
  },
  {
    id: 'isActive',
    header: 'Status',
    accessorKey: 'isActive',
    meta: { align: 'center' }
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    meta: { align: 'right' }
  }
]

const showGroupModal = ref(false)
const isEditGroup = ref(false)
const groupForm = ref({ paramgroupId: '', code: '', name: '', isActive: true })

const showParamModal = ref(false)
const isEditParam = ref(false)
const paramForm = ref({ paramId: '', code: '', value: '', isActive: true })

const showDeleteModal = ref(false)
const deleteType = ref('group')
const itemToDelete = ref(null)

const loadGroups = async () => {
  try {
    const res = await paramApi.getGroups({ limit: 100 })
    if (res && res.data) {
      groups.value = res.data
      if (groups.value.length > 0 && !selectedGroup.value) {
        selectGroup(groups.value[0])
      }
    }
  } catch (err) {
    console.warn('loadGroups error:', err.message)
  }
}

const selectGroup = (group) => {
  selectedGroup.value = group
  paramPage.value = 1
  loadParams(1)
}

const loadParams = async (page = 1) => {
  if (!selectedGroup.value) return
  isLoadingParams.value = true
  try {
    const res = await paramApi.getParams({
      'paramgroupId': selectedGroup.value.paramgroupId,
      page,
      limit: paramPerPage
    })
    if (res && res.data) {
      paramsList.value = res.data
      const meta = res.meta || res.pagination || {}
      totalParams.value = meta.total !== undefined ? meta.total : res.data.length
    }
  } catch (err) {
    console.warn('loadParams error:', err.message)
  } finally {
    isLoadingParams.value = false
  }
}

onMounted(() => {
  loadGroups()
})

watch(paramPage, (newPage) => {
  loadParams(newPage)
})

const openGroupModal = (g = null) => {
  if (g) {
    isEditGroup.value = true
    groupForm.value = { paramgroupId: g.paramgroupId, code: g.code, name: g.name, isActive: g.isActive }
  } else {
    isEditGroup.value = false
    groupForm.value = { paramgroupId: '', code: '', name: '', isActive: true }
  }
  showGroupModal.value = true
}

const saveGroup = async () => {
  try {
    if (isEditGroup.value) {
      await paramApi.updateGroup(groupForm.value.paramgroupId, { name: groupForm.value.name })
      toast.success('Grup Diperbarui', `Grup ${groupForm.value.code} telah diupdate.`)
    } else {
      await paramApi.createGroup({
        code: groupForm.value.code.toUpperCase().trim(),
        name: groupForm.value.name.trim(),
        isActive: true
      })
      toast.success('Grup Dibuat', `Grup ${groupForm.value.code} berhasil didaftarkan.`)
    }
    showGroupModal.value = false
    loadGroups()
  } catch (err) {
    toast.error('Gagal Menyimpan Grup', err.message)
  }
}

const openParamModal = (p = null) => {
  if (!selectedGroup.value) return
  if (p) {
    isEditParam.value = true
    paramForm.value = { paramId: p.paramId, code: p.code, value: p.value, isActive: p.isActive }
  } else {
    isEditParam.value = false
    paramForm.value = { paramId: '', code: '', value: '', isActive: true }
  }
  showParamModal.value = true
}

const saveParam = async () => {
  try {
    if (isEditParam.value) {
      await paramApi.updateParam(paramForm.value.paramId, { value: paramForm.value.value })
      toast.success('Parameter Diperbarui', `Parameter ${paramForm.value.code} telah diupdate.`)
    } else {
      await paramApi.createParam({
        paramgroupId: selectedGroup.value.paramgroupId,
        code: paramForm.value.code.toUpperCase().trim(),
        value: paramForm.value.value.trim(),
        isActive: true
      })
      toast.success('Parameter Dibuat', `Parameter ${paramForm.value.code} berhasil ditambahkan.`)
    }
    showParamModal.value = false
    loadParams(paramPage.value)
  } catch (err) {
    toast.error('Gagal Menyimpan Parameter', err.message)
  }
}

import { confirmDeleteDialog } from '~/utils/dialog.js'

const confirmDeleteGroup = async (g) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Grup Parameter?',
    text: `Apakah Anda yakin ingin menghapus grup "${g.name}" (${g.code})? Seluruh parameter di dalamnya akan terhapus.`,
    confirmButtonText: 'Ya, Hapus Grup'
  })

  if (isConfirmed) {
    try {
      await paramApi.deleteGroup(g.paramgroupId)
      toast.success('Grup Dihapus', `Grup ${g.code} telah berhasil dihapus.`)
      selectedGroup.value = null
      loadGroups()
    } catch (err) {
      toast.error('Gagal Menghapus Grup', err.message || 'Tidak dapat menghapus data.')
    }
  }
}

const confirmDeleteParam = async (p) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Parameter?',
    text: `Apakah Anda yakin ingin menghapus parameter "${p.value}" (${p.code})?`,
    confirmButtonText: 'Ya, Hapus Parameter'
  })

  if (isConfirmed) {
    try {
      await paramApi.deleteParam(p.paramId)
      toast.success('Parameter Dihapus', `Parameter ${p.code} telah berhasil dihapus.`)
      loadParams(1)
    } catch (err) {
      toast.error('Gagal Menghapus Parameter', err.message || 'Tidak dapat menghapus data.')
    }
  }
}
</script>
