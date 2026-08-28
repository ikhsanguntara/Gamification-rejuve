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

      <NuxtLink
        to="/admin/users/create"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#831843] hover:bg-[#701a40] text-white text-xs font-semibold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah User Baru</span>
      </NuxtLink>
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
          <option value="CREW">Crew Member (Store Specialist)</option>
          <option value="SUPERVISOR">Area Supervisor</option>
          <option value="HEAD">Head of Operations</option>
          <option value="SUPERADMIN">Superadmin</option>
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

    <!-- Users Table -->
    <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold uppercase border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th class="py-3.5 px-4">User</th>
              <th class="py-3.5 px-4">Role & Jabatan</th>
              <th class="py-3.5 px-4">Batch Assignment</th>
              <th class="py-3.5 px-4 text-center">⭐ Stars</th>
              <th class="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr
              v-for="u in filteredUsers"
              :key="u.id"
              class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- User Info -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="u.avatar"
                    :alt="u.name"
                    class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <h4 class="font-semibold text-slate-900 dark:text-white">{{ u.name }}</h4>
                    <p class="text-xs text-slate-400">{{ u.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="py-3 px-4">
                <span
                  class="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-0.5"
                  :class="[
                    u.role === 'CREW' ? 'bg-[#831843]/15 text-[#831843] dark:text-[#f472b6]' :
                    u.role === 'SUPERVISOR' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    u.role === 'HEAD' ? 'bg-[#6b133a]/15 text-[#831843] dark:text-[#fbcfe8]' :
                    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                  ]"
                >
                  {{ u.role }}
                </span>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ u.position }}</p>
              </td>

              <!-- Assigned Batch & Quick Move Dropdown -->
              <td class="py-3 px-4">
                <div v-if="u.role === 'CREW'" class="flex items-center gap-2">
                  <select
                    :value="u.batchId"
                    @change="handleReassignBatch(u.id, $event.target.value)"
                    class="text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#831843] cursor-pointer"
                  >
                    <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                      {{ b.name.split('—')[1] || b.name }}
                    </option>
                  </select>
                </div>
                <div v-else class="text-slate-400 text-xs italic">
                  {{ u.storeLocation || 'All Operations' }}
                </div>
              </td>

              <!-- Stars -->
              <td class="py-3 px-4 text-center">
                <span v-if="u.role === 'CREW'" class="font-semibold text-amber-500">
                  ⭐ {{ (u.stars || 0).toLocaleString() }}
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>

              <!-- Actions -->
              <td class="py-3 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <NuxtLink
                    :to="`/admin/users/${u.id}`"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-[#831843] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors inline-block"
                    title="Edit User"
                  >
                    <Edit3 class="w-4 h-4" />
                  </NuxtLink>
                  <button
                    type="button"
                    @click="confirmDeleteUser(u)"
                    class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Hapus User"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useToast } from '~/composables/useToast.js'
import { Plus, Edit3, Trash2, Search } from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const toast = useToast()

const searchQuery = ref('')
const userRoleFilter = ref('ALL')
const userBatchFilter = ref('ALL')

const filteredUsers = computed(() => {
  return userStore.allUsers.filter(u => {
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase().trim()
      const matchName = u.name.toLowerCase().includes(q)
      const matchEmail = u.email.toLowerCase().includes(q)
      if (!matchName && !matchEmail) return false
    }
    if (userRoleFilter.value !== 'ALL' && u.role !== userRoleFilter.value) return false
    if (userBatchFilter.value !== 'ALL' && u.batchId !== userBatchFilter.value) return false
    return true
  })
})

const confirmDeleteUser = (user) => {
  if (confirm(`Apakah Anda yakin ingin menghapus user ${user.name}?`)) {
    userStore.deleteUser(user.id)
    toast.info('User Dihapus', `${user.name} telah dihapus dari direktori.`)
  }
}

const handleReassignBatch = (userId, newBatchId) => {
  const b = batchStore.batchById(newBatchId)
  userStore.assignUserToBatch(userId, newBatchId, b?.name || '')
  toast.success('Penugasan Gerai Berhasil', `Crew dipindahkan ke ${b?.name.split('—')[1] || b?.name}.`)
}
</script>
