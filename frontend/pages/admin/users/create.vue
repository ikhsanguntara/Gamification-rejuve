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
            Daftarkan akun profil baru. Penugasan ke gerai/batch dilakukan pada saat pembuatan atau pengelolaan Batch.
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
              <option value="CREW">Crew (Store Specialist)</option>
              <option value="STORE_LEADER">Store Leader (SL)</option>
              <option value="DISTRICT_MANAGER">District Manager (DM)</option>
              <option value="SUPERADMIN">System Superadmin</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jabatan (Position)</label>
            <input
              v-model="form.position"
              type="text"
              placeholder="Contoh: Store Specialist / Barista"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Perusahaan</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="rian.hidayat@rejuve.co.id"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
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
        </div>

        <!-- Store Assignment for CREW -->
        <div v-if="form.role === 'CREW'" class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40 space-y-3">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-amber-800 dark:text-amber-300">
              🏪 Penugasan Gerai (Store Outlet) *
            </label>
            <span class="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              Khusus Role Crew
            </span>
          </div>

          <select
            v-model="form.storeId"
            @change="handleStoreChange"
            class="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 shadow-xs"
          >
            <option :value="null">Belum Ditugaskan (Standby / Cadangan)</option>
            <option
              v-for="st in storeStore.allStores"
              :key="st.id"
              :value="st.id"
            >
              {{ st.name }} ({{ st.code }}) — {{ st.region }}
            </option>
          </select>

          <!-- Preview Selected Store Info -->
          <div v-if="selectedStore" class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-800/60 text-xs space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 dark:text-white">{{ selectedStore.name }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-bold">
                {{ selectedStore.batch ? selectedStore.batch.name : 'Standby Batch' }}
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              📍 {{ selectedStore.address || selectedStore.mallName }}
            </p>
            <div class="flex items-center gap-3 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
              <span>👔 SL: <strong>{{ selectedStore.storeLeader ? selectedStore.storeLeader.name : '-' }}</strong></span>
              <span>🛡️ DM: <strong>{{ selectedStore.districtManager ? selectedStore.districtManager.name : '-' }}</strong></span>
            </div>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-[#831843]/10 dark:bg-[#831843]/20 border border-[#831843]/20 text-xs text-slate-800 dark:text-slate-200">
          ℹ️ User dengan role Crew yang dipilihkan gerainya akan otomatis terhubung ke Store Leader & District Manager cabang tersebut.
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useToast } from '~/composables/useToast.js'
import { ArrowLeft, UserPlus } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const storeStore = useStoreStore()
const toast = useToast()

const form = ref({
  name: '',
  role: 'CREW',
  position: 'Store Specialist',
  email: '',
  storeId: 'store-001',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
})

const selectedStore = computed(() => {
  if (!form.value.storeId) return null
  return storeStore.storeById(form.value.storeId)
})

const handleStoreChange = () => {
  if (selectedStore.value) {
    form.value.storeLocation = selectedStore.value.name
    if (selectedStore.value.batchId) {
      form.value.batchId = selectedStore.value.batchId
    }
  }
}

const handleSubmit = () => {
  if (selectedStore.value) {
    form.value.storeLocation = selectedStore.value.name
    form.value.batchId = selectedStore.value.batchId || null
  }
  const newUser = userStore.createUser(form.value)
  toast.success('User Berhasil Dibuat', `${newUser.name} telah didaftarkan ke dalam sistem.`)
  router.push('/admin/users')
}
</script>
