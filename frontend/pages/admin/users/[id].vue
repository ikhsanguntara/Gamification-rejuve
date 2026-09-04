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
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">User tidak ditemukan.</p>
      <NuxtLink to="/admin/users" class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- Edit Form Card -->
    <div v-else class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 mb-2">
        <img
          :src="user.avatar"
          :alt="user.name"
          class="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#831843]/20"
        />
        <div>
          <h2 class="text-xl font-bold text-slate-900 dark:text-white">
            Edit User: {{ user.name }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Perbarui data profil, peran, jabatan, dan akun user.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap *</label>
          <input
            v-model="form.name"
            type="text"
            required
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
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <!-- Checkbox isBuddy khusus Role Store Leader (SL) -->
        <div
          v-if="form.role === 'STORE_LEADER'"
          class="p-4 rounded-2xl bg-pink-500/5 dark:bg-pink-500/10 border border-pink-300/40 dark:border-pink-700/40 transition-all duration-200"
        >
          <label class="flex items-start gap-3 cursor-pointer select-none">
            <input
              v-model="form.isBuddy"
              type="checkbox"
              class="mt-0.5 w-4 h-4 rounded text-[#831843] border-slate-300 dark:border-slate-700 focus:ring-[#831843] focus:ring-offset-0 cursor-pointer"
            />
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  isBuddy (Ditugaskan sebagai Mentor / Buddy New Hire)
                </span>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  :class="form.isBuddy ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
                >
                  {{ form.isBuddy ? 'true' : 'false' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                Centang opsi ini jika Store Leader ini bertindak sebagai Buddy untuk mendampingi dan menilai program 3 hari kru baru (Pre-Batch).
              </p>
            </div>
          </label>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Perusahaan</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL</label>
            <input
              v-model="form.avatar"
              type="url"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <!-- Store Assignment for CREW -->
        <div v-if="form.role === 'CREW'" class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40 space-y-4">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-amber-800 dark:text-amber-300">
              🏪 Penugasan Gerai & Mentor Buddy *
            </label>
            <span class="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              Khusus Role Crew
            </span>
          </div>

          <!-- Outlet Gerai Selector -->
          <div class="space-y-1.5">
            <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Cabang Gerai (Store Outlet)
            </label>
            <SearchableSelect
              v-model="form.storeId"
              :options="storeOptions"
              placeholder="Pilih atau cari gerai penugasan..."
              search-placeholder="Ketik nama gerai, kode (e.g. 9BIC), atau wilayah..."
              variant="amber"
              @change="handleStoreChange"
            >
              <template #icon>
                <Store class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              </template>
            </SearchableSelect>
          </div>

          <!-- Mentor Buddy (SL dengan isBuddy = true) Selector -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Mentor Buddy (Store Leader dengan isBuddy aktif)
              </label>
              <span class="text-[10px] text-slate-500 dark:text-slate-400">
                {{ buddyOptions.length - 1 }} SL Buddy Tersedia
              </span>
            </div>
            <SearchableSelect
              v-model="form.userBuddyId"
              :options="buddyOptions"
              placeholder="Pilih atau cari Store Leader Buddy..."
              search-placeholder="Cari nama Store Leader Buddy atau email..."
              variant="amber"
            >
              <template #icon>
                <UserCheck class="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
              </template>
            </SearchableSelect>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Store Leader yang ditugaskan sebagai Buddy akan mendampingi dan mengisi Rapor 7 Kompetensi Kru selama masa orientasi (Pre-Batch).
            </p>
          </div>

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
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useToast } from '~/composables/useToast.js'
import SearchableSelect from '~/components/ui/SearchableSelect.vue'
import { ArrowLeft, Store, UserCheck } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const storeStore = useStoreStore()
const toast = useToast()

const user = computed(() => {
  return userStore.allUsers.find(u => u.id === route.params.id)
})

const form = ref({
  name: '',
  role: 'CREW',
  position: '',
  email: '',
  storeId: null,
  userBuddyId: null,
  avatar: '',
  isBuddy: false
})

// Reset isBuddy jika admin berganti role selain Store Leader (SL), reset userBuddyId jika bukan CREW
watch(
  () => form.value.role,
  (newRole) => {
    if (newRole !== 'STORE_LEADER') {
      form.value.isBuddy = false
    }
    if (newRole !== 'CREW') {
      form.value.userBuddyId = null
    }
  }
)

const storeOptions = computed(() => {
  const list = [
    {
      value: null,
      label: 'Belum Ditugaskan (Standby / Cadangan)',
      code: '',
      sublabel: ''
    }
  ]
  storeStore.allStores.forEach(st => {
    list.push({
      value: st.id,
      label: st.name,
      code: st.code || '',
      sublabel: st.region || st.address || ''
    })
  })
  return list
})

// Daftar Store Leader yang memiliki isBuddy === true
const buddyOptions = computed(() => {
  const list = [
    {
      value: null,
      label: 'Belum Ditugaskan Mentor Buddy (Standby)',
      code: '',
      sublabel: ''
    }
  ]
  const buddies = userStore.allUsers.filter(u =>
    (u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR') && Boolean(u.isBuddy)
  )
  buddies.forEach(b => {
    list.push({
      value: b.id,
      label: b.name,
      code: 'SL BUDDY',
      sublabel: b.storeLocation || b.department || b.email || ''
    })
  })
  return list
})

onMounted(async () => {
  try {
    const promises = []
    if (storeStore.allStores.length === 0) {
      promises.push(storeStore.fetchStoresFromApi({ page: 1, limit: 100 }))
    }
    if (userStore.allUsers.length === 0) {
      promises.push(userStore.fetchUsersFromApi({ page: 1, limit: 100 }))
    }
    if (promises.length > 0) {
      await Promise.all(promises)
    }
  } catch (e) {
    console.warn('Gagal memuat stores/users:', e.message)
  }
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

watch(
  user,
  (u) => {
    if (u) {
      form.value = {
        name: u.name || '',
        role: u.role || 'CREW',
        position: u.position || '',
        email: u.email || '',
        storeId: u.storeId || (u.batchId === 'batch-alpha' ? 'store-001' : u.batchId === 'batch-beta' ? 'store-002' : u.batchId === 'batch-gamma' ? 'store-003' : null),
        storeLocation: u.storeLocation || '',
        batchId: u.batchId || null,
        userBuddyId: u.userBuddyId || null,
        avatar: u.avatar || '',
        isBuddy: Boolean(u.isBuddy)
      }
    }
  },
  { immediate: true }
)

import { userApi } from '~/services/api.js'

const isUpdating = ref(false)

const handleUpdate = async () => {
  if (!user.value) return
  isUpdating.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      isActive: true,
      isBuddy: form.value.role === 'STORE_LEADER' ? Boolean(form.value.isBuddy) : false,
      userBuddyId: (form.value.role === 'CREW' && form.value.userBuddyId) ? form.value.userBuddyId : null
    }
    if (form.value.storeId && String(form.value.storeId).length > 20) {
      payload.departmentId = form.value.storeId
    }

    const res = await userApi.update(user.value.id, payload)
    if (res && (res.success || res.data)) {
      toast.success('User Diperbarui', `Data ${form.value.name} telah berhasil disimpan ke database.`)
      await userStore.fetchUsersFromApi({ page: 1, limit: 10 })
      router.push('/admin/users')
    } else {
      throw new Error(res?.message || 'Gagal memperbarui data user.')
    }
  } catch (err) {
    console.error('Update user error:', err)
    toast.error('Gagal Memperbarui User', err.message || 'Terjadi kesalahan saat memproses data.')
  } finally {
    isUpdating.value = false
  }
}
</script>
