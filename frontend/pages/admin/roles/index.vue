<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Master Role & Wewenang
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ totalRoles }} Role
          </span>
        </div>
      </div>

      <button
        type="button"
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Role Baru</span>
      </button>
    </div>

    <!-- Search Toolbar -->
    <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="relative w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode atau nama role..."
          class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
        />
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>
    </div>

    <!-- Table Card with TanStack Table -->
    <TanStackTable
      :data="roles"
      :columns="roleColumns"
      :loading="isLoading"
      empty-text="Tidak ada data role yang ditemukan."
    >
      <template #roleCode="{ row }">
        <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#831843] dark:text-[#f472b6] font-mono font-bold">
          {{ row.roleCode }}
        </span>
      </template>

      <template #roleName="{ row }">
        <span class="font-medium text-slate-800 dark:text-slate-200">
          {{ row.roleName }}
        </span>
      </template>

      <template #createdAt="{ row }">
        <span class="text-slate-400">
          {{ row.createdAt?.split('T')[0] || '-' }}
        </span>
      </template>

      <template #actions="{ row }">
        <div class="inline-flex items-center gap-2">
          <button
            type="button"
            @click="openEditModal(row)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-[#831843] hover:bg-[#831843]/10 transition-colors cursor-pointer"
            title="Edit Role"
          >
            <Edit3 class="w-4 h-4" />
          </button>
          <button
            type="button"
            @click="confirmDelete(row)"
            class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Hapus Role"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </template>
    </TanStackTable>

    <!-- App Pagination -->
    <div v-if="totalRoles > 0" class="p-4 border-t border-slate-100 dark:border-slate-800">
      <AppPagination
        v-model:current-page="currentPage"
        :total-items="totalRoles"
        :items-per-page="itemsPerPage"
        item-label="role"
      />
    </div>


    <!-- Modal Form Tambah/Edit Role -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          {{ isEditMode ? 'Perbarui Jabatan / Role' : 'Tambah Role Baru' }}
        </h3>

        <form @submit.prevent="saveRole" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Role</label>
            <input
              v-model="form.roleCode"
              type="text"
              required
              :disabled="isEditMode"
              placeholder="e.g. OPERATION_MANAGER"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 uppercase font-mono text-slate-900 dark:text-white disabled:opacity-50"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Jabatan</label>
            <input
              v-model="form.roleName"
              type="text"
              required
              placeholder="e.g. Operation Manager"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-5 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white font-semibold shadow-md shadow-[#831843]/20 cursor-pointer disabled:opacity-50"
            >
              {{ isSaving ? 'Menyimpan...' : 'Simpan Role' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmationModal
      :model-value="showDeleteModal"
      title="Hapus Master Role?"
      :message="`Apakah Anda yakin ingin menghapus role '${roleToDelete?.roleName}'? Pengguna dengan role ini mungkin akan terpengaruh.`"
      confirm-text="Ya, Hapus Role"
      cancel-text="Batal"
      variant="danger"
      @update:model-value="showDeleteModal = $event"
      @confirm="deleteRole"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { roleApi } from '~/services/api.js'
import { buildPrismaQuery } from '~/utils/queryBuilder.js'
import { useToast } from '~/composables/useToast.js'
import AppPagination from '~/components/ui/AppPagination.vue'
import TanStackTable from '~/components/ui/TanStackTable.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import { Plus, Search, Edit3, Trash2 } from 'lucide-vue-next'

const toast = useToast()

const roles = ref([])
const totalRoles = ref(0)
const isLoading = ref(false)
const isSaving = ref(false)

const roleColumns = [
  {
    id: 'roleCode',
    header: 'Kode Role',
    accessorKey: 'roleCode'
  },
  {
    id: 'roleName',
    header: 'Nama Jabatan',
    accessorKey: 'roleName'
  },
  {
    id: 'createdAt',
    header: 'Tanggal Dibuat',
    accessorKey: 'createdAt'
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
const form = ref({ roleId: '', roleCode: '', roleName: '' })

const showDeleteModal = ref(false)
const roleToDelete = ref(null)

const loadRoles = async (page = 1) => {
  isLoading.value = true
  try {
    const contains = {}
    if (searchQuery.value.trim()) {
      contains.roleCode = searchQuery.value.trim().toUpperCase()
    }

    const query = buildPrismaQuery({
      page,
      limit: itemsPerPage,
      contains
    })

    const res = await roleApi.getAll(query)
    if (res && res.data) {
      roles.value = res.data
      const meta = res.meta || res.pagination || {}
      totalRoles.value = meta.total !== undefined ? meta.total : res.data.length
    }
  } catch (err) {
    console.warn('Load roles error:', err.message)
    toast.error('Gagal Memuat', err.message || 'Tidak dapat mengambil daftar role.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadRoles(1)
})

watch(currentPage, (newPage) => {
  loadRoles(newPage)
})

let searchTimer = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadRoles(1)
  }, 350)
})

const openCreateModal = () => {
  isEditMode.value = false
  form.value = { roleId: '', roleCode: '', roleName: '' }
  showModal.value = true
}

const openEditModal = (r) => {
  isEditMode.value = true
  form.value = { roleId: r.roleId, roleCode: r.roleCode, roleName: r.roleName }
  showModal.value = true
}

const saveRole = async () => {
  isSaving.value = true
  try {
    if (isEditMode.value) {
      await roleApi.update(form.value.roleId, { roleName: form.value.roleName })
      toast.success('Berhasil Diperbarui', `Role ${form.value.roleCode} telah diperbarui.`)
    } else {
      await roleApi.create({
        roleCode: form.value.roleCode.toUpperCase().trim(),
        roleName: form.value.roleName.trim()
      })
      toast.success('Role Dibuat', `Role baru ${form.value.roleCode} berhasil didaftarkan.`)
    }
    showModal.value = false
    loadRoles(currentPage.value)
  } catch (err) {
    toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan data.')
  } finally {
    isSaving.value = false
  }
}

import { confirmDeleteDialog } from '~/utils/dialog.js'

const confirmDelete = async (r) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Master Role?',
    text: `Apakah Anda yakin ingin menghapus role "${r.roleName}" (${r.roleCode})?`,
    confirmButtonText: 'Ya, Hapus Role'
  })

  if (isConfirmed) {
    try {
      await roleApi.delete(r.roleId)
      toast.success('Role Dihapus', `Role ${r.roleCode} telah dihapus dari backend.`)
      loadRoles(1)
    } catch (err) {
      toast.error('Gagal Menghapus', err.message || 'Tidak dapat menghapus role.')
    }
  }
}
</script>
