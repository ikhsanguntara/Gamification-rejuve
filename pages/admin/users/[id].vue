<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/users" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar User</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Edit Profil User</span>
    </div>

    <!-- Error State if not found -->
    <div v-if="!user" class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-bold text-slate-700 dark:text-slate-300">User tidak ditemukan.</p>
      <NuxtLink to="/admin/users" class="text-xs text-indigo-600 font-bold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- Edit Form Card -->
    <div v-else class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 mb-2">
        <img
          :src="user.avatar"
          :alt="user.name"
          class="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
        />
        <div>
          <h2 class="text-xl font-black text-slate-900 dark:text-white">
            Edit User: {{ user.name }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Perbarui data profil, peran, dan cabang penempatan gerai.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role Akun *</label>
            <select
              v-model="form.role"
              required
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CREW">Crew Member (Store Specialist)</option>
              <option value="SUPERVISOR">Area Store Supervisor</option>
              <option value="HEAD">Head of Operations & Quality</option>
              <option value="SUPERADMIN">System Superadmin</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cabang Penempatan Gerai *</label>
            <select
              v-model="form.batchId"
              required
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                {{ b.name.split('—')[1] || b.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan (Position)</label>
            <input
              v-model="form.position"
              type="text"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Perusahaan</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
          <input
            v-model="form.avatar"
            type="url"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="pt-4 flex items-center justify-end gap-3">
          <NuxtLink
            to="/admin/users"
            class="px-5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const toast = useToast()

const user = computed(() => {
  return userStore.allUsers.find(u => u.id === route.params.id)
})

const form = ref({
  name: '',
  role: 'CREW',
  batchId: 'batch-alpha',
  position: '',
  email: '',
  avatar: ''
})

onMounted(() => {
  if (user.value) {
    form.value = { ...user.value }
  }
})

const handleUpdate = () => {
  if (!user.value) return
  userStore.updateUser(user.value.id, form.value)
  toast.success('User Diperbarui', `Data ${form.value.name} telah berhasil disimpan.`)
  router.push('/admin/users')
}
</script>
