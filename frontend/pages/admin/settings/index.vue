<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pengaturan Sistem (Application Settings)
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ totalSettings }} Pengaturan
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi variabel global, kode objek sistem, dan preferensi aplikasi Re.juve.
        </p>
      </div>

      <button
        type="button"
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Pengaturan</span>
      </button>
    </div>

    <!-- Search Toolbar -->
    <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="relative w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama pengaturan..."
          class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
        />
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>
    </div>

    <!-- Table Card with TanStack Table -->
    <TanStackTable
      :data="settings"
      :columns="settingColumns"
      :loading="isLoading"
      empty-text="Tidak ada data pengaturan sistem ditemukan."
    >
      <template #settingName="{ row }">
        <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#831843] dark:text-[#f472b6] font-mono font-bold">
          {{ row.settingName }}
        </span>
      </template>

      <template #settingValue="{ row }">
        <span class="font-mono text-slate-800 dark:text-slate-200 font-medium">
          {{ row.settingValue }}
        </span>
      </template>

      <template #objectCode="{ row }">
        <span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500">
          {{ row.objectCode || 'SETTING' }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="inline-flex items-center gap-2">
          <button
            type="button"
            @click="openEditModal(row)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-[#831843] hover:bg-[#831843]/10 transition-colors cursor-pointer"
            title="Edit Pengaturan"
          >
            <Edit3 class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="confirmDelete(row)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Hapus Pengaturan"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </TanStackTable>

    <!-- App Pagination -->
    <div v-if="totalSettings > 0" class="p-4 border-t border-slate-100 dark:border-slate-800">
      <AppPagination
        v-model:current-page="currentPage"
        :total-items="totalSettings"
        :items-per-page="itemsPerPage"
        item-label="pengaturan"
      />
    </div>


    <!-- Modal Form Tambah/Edit Setting -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          {{ isEditMode ? 'Perbarui Pengaturan' : 'Tambah Pengaturan Baru' }}
        </h3>

        <form @submit.prevent="saveSetting" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Pengaturan (Key)</label>
            <input
              v-model="form.settingName"
              type="text"
              required
              :disabled="isEditMode"
              placeholder="e.g. APP_THEME_COLOR"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 uppercase font-mono text-slate-900 dark:text-white disabled:opacity-50"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nilai (Value)</label>
            <input
              v-model="form.settingValue"
              type="text"
              required
              placeholder="e.g. #831843"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-5 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white font-semibold shadow-md shadow-[#831843]/20 cursor-pointer disabled:opacity-50"
            >
              {{ isSaving ? 'Menyimpan...' : 'Simpan Pengaturan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmationModal
      :model-value="showDeleteModal"
      title="Hapus Pengaturan?"
      :message="`Apakah Anda yakin ingin menghapus pengaturan '${settingToDelete?.settingName}'?`"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      variant="danger"
      @update:model-value="showDeleteModal = $event"
      @confirm="deleteSetting"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { adminApi } from '~/services/api.js'
import { buildPrismaQuery } from '~/utils/queryBuilder.js'
import { useToast } from '~/composables/useToast.js'
import AppPagination from '~/components/ui/AppPagination.vue'
import TanStackTable from '~/components/ui/TanStackTable.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import { Plus, Search, Edit3, Trash2 } from 'lucide-vue-next'

const toast = useToast()

const settings = ref([])
const totalSettings = ref(0)
const isLoading = ref(false)
const isSaving = ref(false)

const settingColumns = [
  {
    id: 'settingName',
    header: 'Nama Pengaturan (Key)',
    accessorKey: 'settingName'
  },
  {
    id: 'settingValue',
    header: 'Nilai (Value)',
    accessorKey: 'settingValue'
  },
  {
    id: 'objectCode',
    header: 'Object Code',
    accessorKey: 'objectCode'
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    meta: { align: 'right' }
  }
]

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const showModal = ref(false)
const isEditMode = ref(false)
const form = ref({ settingId: '', settingName: '', settingValue: '', objectCode: 'SETTING' })

const showDeleteModal = ref(false)
const settingToDelete = ref(null)

const loadSettings = async (page = 1) => {
  isLoading.value = true
  try {
    const contains = {}
    if (searchQuery.value.trim()) {
      contains.settingName = searchQuery.value.trim().toUpperCase()
    }

    const query = buildPrismaQuery({
      page,
      limit: itemsPerPage,
      contains
    })

    const res = await adminApi.getSettings(query)
    if (res && res.data) {
      settings.value = res.data
      const meta = res.meta || res.pagination || {}
      totalSettings.value = meta.total !== undefined ? meta.total : res.data.length
    }
  } catch (err) {
    console.warn('loadSettings error:', err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadSettings(1)
})

watch(currentPage, (newPage) => {
  loadSettings(newPage)
})

let searchTimer = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadSettings(1)
  }, 350)
})

const openCreateModal = () => {
  isEditMode.value = false
  form.value = { settingId: '', settingName: '', settingValue: '', objectCode: 'SETTING' }
  showModal.value = true
}

const openEditModal = (s) => {
  isEditMode.value = true
  form.value = { settingId: s.settingId, settingName: s.settingName, settingValue: s.settingValue, objectCode: s.objectCode || 'SETTING' }
  showModal.value = true
}

const saveSetting = async () => {
  isSaving.value = true
  try {
    if (isEditMode.value) {
      await adminApi.updateSetting(form.value.settingId, { settingValue: form.value.settingValue })
      toast.success('Pengaturan Diperbarui', `Nilai ${form.value.settingName} telah diperbarui.`)
    } else {
      await adminApi.createSetting({
        settingName: form.value.settingName.toUpperCase().trim(),
        settingValue: form.value.settingValue.trim(),
        objectCode: 'SETTING',
        companyId: null
      })
      toast.success('Pengaturan Dibuat', `Pengaturan baru ${form.value.settingName} berhasil disimpan.`)
    }
    showModal.value = false
    loadSettings(currentPage.value)
  } catch (err) {
    toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan data.')
  } finally {
    isSaving.value = false
  }
}

import { confirmDeleteDialog } from '~/utils/dialog.js'

const confirmDelete = async (s) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Pengaturan?',
    text: `Apakah Anda yakin ingin menghapus pengaturan "${s.settingName}"?`,
    confirmButtonText: 'Ya, Hapus Pengaturan'
  })

  if (isConfirmed) {
    try {
      await adminApi.deleteSetting(s.settingId)
      toast.success('Pengaturan Dihapus', `Pengaturan ${s.settingName} telah dihapus.`)
      loadSettings(1)
    } catch (err) {
      toast.error('Gagal Menghapus', err.message || 'Tidak dapat menghapus data.')
    }
  }
}
</script>
