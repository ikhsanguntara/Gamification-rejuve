<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/users" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar User</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Tambah User Baru</span>
    </div>

    <!-- Header Card -->
    <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843]">
          <UserPlus class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Tambah User / Crew Baru
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Daftarkan akun profil baru dan tentukan cabang penempatan gerai Re.juve.
          </p>
        </div>
      </div>

      <!-- Create Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="Contoh: Rian Hidayat"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Akun *</label>
            <select
              v-model="form.role"
              required
              class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            >
              <option value="CREW">Crew Member (Store Specialist)</option>
              <option value="SUPERVISOR">Area Store Supervisor</option>
              <option value="HEAD">Head of Operations & Quality</option>
              <option value="SUPERADMIN">System Superadmin</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cabang Penempatan Gerai *</label>
            <select
              v-model="form.batchId"
              required
              class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            >
              <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                {{ b.name.split('—')[1] || b.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan (Position)</label>
            <input
              v-model="form.position"
              type="text"
              placeholder="Store Specialist"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Perusahaan</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="rian.hidayat@rejuve.co.id"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
          <input
            v-model="form.avatar"
            type="url"
            placeholder="https://images.unsplash.com/..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div v-if="form.role === 'CREW'" class="p-3.5 rounded-2xl bg-[#831843]/10 dark:bg-[#831843]/20 border border-[#831843]/20 text-xs text-slate-800 dark:text-slate-200">
          ℹ️ User Crew baru akan otomatis terdaftar di <strong>Roster Cabang Gerai</strong> dan terhubung ke papan peringkat <strong>Leaderboard</strong>.
        </div>

        <div class="pt-4 flex items-center justify-end gap-3">
          <NuxtLink
            to="/admin/users"
            class="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan User Baru
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft, UserPlus } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const toast = useToast()

const form = ref({
  name: '',
  role: 'CREW',
  batchId: batchStore.selectedBatchId || 'batch-alpha',
  position: 'Store Specialist',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
})

const handleSubmit = () => {
  const newUser = userStore.createUser(form.value)
  toast.success('User Berhasil Dibuat', `${newUser.name} telah didaftarkan dan ditempatkan di gerai.`)
  router.push('/admin/users')
}
</script>
