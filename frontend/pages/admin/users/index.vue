<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#831843] dark:text-[#f472b6] font-semibold">User Management</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Manajemen User & Penugasan Gerai
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Kelola direktori seluruh user (Crew, Supervisor, Head, Superadmin) dan atur penugasan cabang gerai Crew secara realtime.
        </p>
      </div>

      <div class="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
        <button
          type="button"
          @click="showBulkUploadModal = true"
          class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Import Bulk Excel</span>
        </button>

        <NuxtLink
          to="/admin/users/create"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#831843] hover:bg-[#701a40] text-white text-xs font-semibold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>Tambah User Baru</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
      <div class="relative w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama atau email user..."
          class="w-full text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
        />
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div class="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
        <!-- Role Filter -->
        <select
          v-model="userRoleFilter"
          class="text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#831843] cursor-pointer"
        >
          <option value="ALL">Semua Role</option>
          <option v-for="r in roleOptions" :key="r.roleCode" :value="r.roleCode">
            {{ r.roleName }}
          </option>
        </select>

        <!-- Batch Filter -->
        <select
          v-model="userBatchFilter"
          class="text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#831843] cursor-pointer"
        >
          <option value="ALL">Semua Batch</option>
          <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
            {{ b.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Users TanStack Table -->
    <TanStackTable
      :data="userStore.allUsers"
      :columns="userColumns"
      :loading="isLoading"
      empty-text="Tidak ada pengguna ditemukan"
    >
      <!-- Custom Cell: User Profile -->
      <template #user="{ row }">
        <div class="flex items-center gap-3">
          <img
            :src="row.avatar"
            :alt="row.name"
            class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <div>
            <h4 class="font-semibold text-slate-900 dark:text-white">{{ row.name }}</h4>
            <p class="text-xs text-slate-400">{{ row.email }}</p>
          </div>
        </div>
      </template>

      <!-- Custom Cell: Role & Jabatan -->
      <template #role="{ row }">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-0.5"
            :class="[
              row.role === 'CREW' ? 'bg-[#831843]/15 text-[#831843] dark:text-[#f472b6]' :
              row.role === 'STORE_LEADER' || row.role === 'SUPERVISOR' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
              row.role === 'DISTRICT_MANAGER' || row.role === 'HEAD' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
              'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
            ]"
          >
            {{ row.role === 'STORE_LEADER' ? 'Store Leader' : row.role === 'DISTRICT_MANAGER' ? 'District Manager' : row.role }}
          </span>
          <span
            v-if="row.isBuddy"
            class="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
            title="Bertindak sebagai Buddy / Mentor New Hire"
          >
            Buddy
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ row.position }}</p>
      </template>

      <!-- Custom Cell: Store & Batch -->
      <template #store="{ row }">
        <div v-if="row.role === 'CREW'" class="space-y-0.5">
          <div class="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
            <Store class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6] flex-shrink-0" />
            <span class="truncate max-w-[150px]">{{ getStoreName(row.storeId) || row.storeLocation || 'Belum Ditugaskan' }}</span>
          </div>
          <span v-if="row.batchId" class="text-[11px] text-slate-500 dark:text-slate-400 block">
            {{ getBatchName(row.batchId) }}
          </span>
          <span v-if="row.userBuddyId" class="text-[10px] text-pink-600 dark:text-pink-400 font-medium block">
            🤝 Buddy: {{ getBuddyName(row.userBuddyId) || 'SL Buddy' }}
          </span>
        </div>
        <div v-else class="text-slate-500 dark:text-slate-400 text-xs">
          {{ row.storeLocation || 'Semua Cabang' }}
        </div>
      </template>

      <!-- Custom Cell: Stars -->
      <template #stars="{ row }">
        <span v-if="row.role === 'CREW'" class="font-semibold text-amber-500">
          ⭐ {{ (row.stars || 0).toLocaleString() }}
        </span>
        <span v-else class="text-slate-400">—</span>
      </template>

      <!-- Custom Cell: Actions -->
      <template #actions="{ row }">
        <div class="flex items-center justify-end gap-2">
          <NuxtLink
            :to="`/admin/users/${row.id}`"
            class="p-1.5 rounded-lg text-slate-400 hover:text-[#831843] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-block"
            title="Edit User"
          >
            <Edit3 class="w-4 h-4" />
          </NuxtLink>
          <button
            type="button"
            @click="confirmDeleteUser(row)"
            :disabled="deletingUserId === (row.id || row.userId)"
            class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
            title="Hapus User"
          >
            <span v-if="deletingUserId === (row.id || row.userId)" class="w-4 h-4 border-2 border-rose-500/40 border-t-rose-600 rounded-full animate-spin inline-block"></span>
            <Trash2 v-else class="w-4 h-4" />
          </button>
        </div>
      </template>
    </TanStackTable>

    <!-- App Pagination for Table List (10 Items / Page) -->
    <div v-if="userStore.serverPagination.total > 0" class="p-4 border-t border-slate-100 dark:border-slate-800">
      <AppPagination
        v-model:current-page="currentPage"
        :total-items="userStore.serverPagination.total"
        :items-per-page="itemsPerPage"
        item-label="pengguna"
      />
    </div>

    <!-- Bulk User Excel Import Modal -->
    <BulkUserUploadModal
      v-model="showBulkUploadModal"
      @imported="onBulkImported"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useStoreStore } from '~/stores/store.js'
import { useToast } from '~/composables/useToast.js'
import { userApi, roleApi } from '~/services/api.js'
import AppPagination from '~/components/ui/AppPagination.vue'
import TanStackTable from '~/components/ui/TanStackTable.vue'
import BulkUserUploadModal from '~/components/user/BulkUserUploadModal.vue'
import { Plus, Edit3, Trash2, Search, Store, FileSpreadsheet } from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const storeStore = useStoreStore()
const toast = useToast()

const showBulkUploadModal = ref(false)
const searchQuery = ref('')
const userRoleFilter = ref('ALL')
const userBatchFilter = ref('ALL')

const onBulkImported = async () => {
  currentPage.value = 1
  await loadUsers(1)
}

const availableRoles = ref([])

const defaultRoles = [
  { roleCode: 'CREW', roleName: 'Crew (Store Specialist)' },
  { roleCode: 'STORE_LEADER', roleName: 'Store Leader (SL)' },
  { roleCode: 'DISTRICT_MANAGER', roleName: 'District Manager (DM)' },
  { roleCode: 'SUPERADMIN', roleName: 'System Superadmin' }
]

const roleOptions = computed(() => {
  if (availableRoles.value && availableRoles.value.length > 0) {
    return availableRoles.value.map(r => ({
      roleId: r.roleId || r.id,
      roleCode: r.roleCode,
      roleName: r.roleName ? `${r.roleName} (${r.roleCode})` : r.roleCode
    }))
  }
  return defaultRoles
})

const currentPage = ref(1)
const itemsPerPage = 10
const isLoading = ref(false)

// TanStack Column Definitions
const userColumns = [
  {
    id: 'user',
    header: 'User',
    accessorKey: 'name'
  },
  {
    id: 'role',
    header: 'Role & Jabatan',
    accessorKey: 'role'
  },
  {
    id: 'store',
    header: 'Gerai & Batch',
    accessorKey: 'storeLocation'
  },
  {
    id: 'stars',
    header: '⭐ Stars',
    accessorKey: 'stars',
    meta: { align: 'center' }
  },
  {
    id: 'actions',
    header: 'Aksi',
    enableSorting: false,
    meta: { align: 'right' }
  }
]

const loadUsers = async (page = 1) => {
  isLoading.value = true
  try {
    await userStore.fetchUsersFromApi({
      page,
      limit: itemsPerPage,
      search: searchQuery.value,
      role: userRoleFilter.value,
      batchId: userBatchFilter.value
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  loadUsers(1)
  try {
    const [rolesRes] = await Promise.allSettled([
      roleApi.getAll({ limit: 50 }),
      batchStore.fetchBatchesFromApi({ limit: 50 }),
      storeStore.fetchStoresFromApi({ limit: 50 })
    ])
    if (rolesRes.status === 'fulfilled' && rolesRes.value?.data) {
      availableRoles.value = rolesRes.value.data
    }
  } catch (err) {
    console.warn('Gagal memuat metadata master:', err.message)
  }
})

// Pindah halaman via pagination -> HIT API Backend!
watch(currentPage, (newPage) => {
  loadUsers(newPage)
})

// Filter search debounced 350ms -> Reset ke Page 1 & HIT API!
let searchTimer = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadUsers(1)
  }, 350)
})

// Filter role -> Reset ke Page 1 & HIT API!
watch(userRoleFilter, () => {
  currentPage.value = 1
  loadUsers(1)
})

// Filter batch -> Reset ke Page 1 & HIT API!
watch(userBatchFilter, () => {
  currentPage.value = 1
  loadUsers(1)
})

const getStoreName = (storeId) => {
  if (!storeId) return null
  const s = storeStore.storeById(storeId)
  return s ? s.name : null
}

const getBatchName = (batchId) => {
  if (!batchId) return 'Belum Ditugaskan'
  const b = batchStore.batchById(batchId)
  return b ? b.name : 'Belum Ditugaskan'
}

const getBuddyName = (buddyId) => {
  if (!buddyId) return null
  const u = userStore.allUsers.find(user => user.id === buddyId)
  return u ? u.name : null
}

import { confirmDeleteDialog } from '~/utils/dialog.js'

const deletingUserId = ref(null)

const confirmDeleteUser = async (user) => {
  const targetId = user.id || user.userId
  if (!targetId) {
    toast.error('Error', 'ID pengguna tidak valid.')
    return
  }

  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Pengguna?',
    text: `Apakah Anda yakin ingin menghapus user "${user.name}"? Tindakan ini akan menghapus akun secara permanen dari server database.`,
    confirmButtonText: 'Ya, Hapus User'
  })

  if (isConfirmed) {
    deletingUserId.value = targetId
    try {
      const res = await userApi.delete(targetId)
      if (res && (res.success || res.statusCode === 200 || res.data !== undefined)) {
        toast.success('User Berhasil Dihapus', `Data pengguna ${user.name} telah dihapus dari backend REST API.`)
      }
      userStore.deleteUser(targetId)
      await loadUsers(currentPage.value)
    } catch (err) {
      console.error('Delete user error:', err)
      const errorMsg = err.data?.message || err.message || 'Tidak dapat menghapus data dari server.'
      toast.error('Gagal Menghapus User', errorMsg)
    } finally {
      deletingUserId.value = null
    }
  }
}
</script>
