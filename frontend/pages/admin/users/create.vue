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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Jenis Kelamin (Gender) *
            </label>
            <div class="grid grid-cols-2 gap-2">
              <label
                class="flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none"
                :class="form.gender === 'M'
                  ? 'border-[#831843] bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] ring-1 ring-[#831843]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'"
              >
                <input type="radio" v-model="form.gender" value="M" class="sr-only" />
                <span>👨 Laki-laki (M)</span>
              </label>
              <label
                class="flex items-center justify-center gap-2 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none"
                :class="form.gender === 'F'
                  ? 'border-[#831843] bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] ring-1 ring-[#831843]'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'"
              >
                <input type="radio" v-model="form.gender" value="F" class="sr-only" />
                <span>👩 Perempuan (F)</span>
              </label>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Akun *</label>
            <select
              v-model="form.role"
              required
              class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
            >
              <option v-for="r in roleOptions" :key="r.roleCode" :value="r.roleCode">
                {{ r.roleName }}
              </option>
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
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Perusahaan *</label>
            <input
              v-model="form.email"
              type="email"
              required
              placeholder="rian.hidayat@rejuve.co.id"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor Telepon / WhatsApp (Phone)
            </label>
            <div class="relative">
              <Phone class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                v-model="form.phone"
                type="tel"
                placeholder="Contoh: 081234567890"
                class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>
        </div>

        <!-- Avatar Upload / URL Section -->
        <div class="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <label class="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Camera class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
              <span>Foto Profil / Avatar Pengguna</span>
            </label>

            <!-- Mode Switcher Tabs: Upload Foto vs Link URL -->
            <div class="inline-flex rounded-xl p-0.5 bg-slate-200/80 dark:bg-slate-700">
              <button
                type="button"
                @click="avatarMode = 'upload'"
                class="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                :class="avatarMode === 'upload' ? 'bg-white dark:bg-slate-800 text-[#831843] dark:text-[#f472b6] shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
              >
                <Upload class="w-3 h-3" />
                <span>Upload Foto Sendiri</span>
              </button>
              <button
                type="button"
                @click="avatarMode = 'url'"
                class="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                :class="avatarMode === 'url' ? 'bg-white dark:bg-slate-800 text-[#831843] dark:text-[#f472b6] shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
              >
                <Link2 class="w-3 h-3" />
                <span>Pakai Link URL</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
            <!-- Visual Preview Box -->
            <div class="relative flex-shrink-0">
              <img
                :src="avatarPreview"
                :alt="form.name || 'Avatar Preview'"
                class="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#831843]/30 shadow-sm bg-white dark:bg-slate-900"
              />
              <div v-if="avatarFileName" class="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="File berhasil dipilih">
                <Check class="w-3 h-3" />
              </div>
            </div>

            <div class="flex-1 w-full space-y-2">
              <!-- Mode 1: Upload File Gambar Sendiri -->
              <div v-if="avatarMode === 'upload'" class="space-y-1.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    ref="fileInputRef"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    @change="handleFileUpload"
                    class="hidden"
                  />
                  <button
                    type="button"
                    @click="triggerFileInput"
                    class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                  >
                    <UploadCloud class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                    <span>{{ avatarFileName ? 'Ganti File Foto' : 'Pilih File Foto (PNG / JPG / WEBP)' }}</span>
                  </button>

                  <button
                    v-if="avatarFileName"
                    type="button"
                    @click="resetUploadedFile"
                    class="px-2.5 py-2 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                    title="Batal upload file"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
                <p class="text-[11px] text-slate-400">
                  <span v-if="avatarFileName" class="text-emerald-600 dark:text-emerald-400 font-semibold">📁 {{ avatarFileName }}</span>
                  <span v-else>Mendukung format PNG, JPG, atau WEBP maks 5MB. File akan diunggah dan diolah di server backend.</span>
                </p>
              </div>

              <!-- Mode 2: Input String URL Avatar -->
              <div v-else class="space-y-1.5">
                <div class="flex items-center gap-2">
                  <input
                    v-model="form.avatarUrl"
                    type="url"
                    placeholder="https://images.unsplash.com/... atau URL Dicebear"
                    class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
                  />
                  <button
                    type="button"
                    @click="pickRandomAvatarUrl"
                    class="px-3 py-2 text-xs font-bold text-[#831843] dark:text-[#f472b6] bg-[#831843]/10 hover:bg-[#831843]/20 rounded-xl flex items-center gap-1 flex-shrink-0 cursor-pointer transition-all shadow-2xs"
                    title="Pilih avatar ilustrasi acak"
                  >
                    <span>🎲 Acak</span>
                  </button>
                </div>
                <p class="text-[11px] text-slate-400">
                  Ketikkan tautan URL gambar langsung dari internet atau gunakan tombol acak.
                </p>
              </div>
            </div>
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
            :disabled="isSubmitting"
            class="px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan User Baru' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useToast } from '~/composables/useToast.js'
import { userApi, roleApi } from '~/services/api.js'
import { getRandomAvatar, pickRandomAvatar } from '~/utils/avatar.js'
import SearchableSelect from '~/components/ui/SearchableSelect.vue'
import {
  ArrowLeft,
  UserPlus,
  Store,
  UserCheck,
  Phone,
  Camera,
  Upload,
  Link2,
  UploadCloud,
  Check,
  X
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const storeStore = useStoreStore()
const toast = useToast()

const isSubmitting = ref(false)
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
  const buddies = (userStore.allUsers || []).filter(u =>
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

// Avatar Mode & File Upload
const avatarMode = ref('upload') // 'upload' | 'url'
const fileInputRef = ref(null)
const avatarFileName = ref('')

const form = ref({
  name: '',
  gender: 'M',
  phone: '',
  role: 'CREW',
  position: '',
  email: '',
  storeId: '',
  userBuddyId: null,
  isBuddy: false,
  avatarUrl: '',
  avatar: ''
})

const avatarPreview = computed(() => {
  return form.value.avatarUrl || form.value.avatar || getRandomAvatar(form.value.name || 'Crew')
})

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    toast.error('File Terlalu Besar', 'Ukuran foto maksimal adalah 5MB.')
    return
  }

  avatarFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    form.value.avatarUrl = base64
    form.value.avatar = base64
  }
  reader.readAsDataURL(file)
}

const resetUploadedFile = () => {
  avatarFileName.value = ''
  form.value.avatarUrl = ''
  form.value.avatar = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const pickRandomAvatarUrl = () => {
  const seed = Math.random().toString(36).substring(2, 9)
  const randomUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
  form.value.avatarUrl = randomUrl
  form.value.avatar = randomUrl
  avatarFileName.value = ''
}

onMounted(async () => {
  try {
    const [rolesRes] = await Promise.all([
      roleApi.getAll({ limit: 50 }),
      storeStore.fetchStoresFromApi({ page: 1, limit: 100 }),
      userStore.fetchUsersFromApi({ page: 1, limit: 100 })
    ])
    if (rolesRes && rolesRes.data) {
      availableRoles.value = rolesRes.data
    }
  } catch (err) {
    console.warn('Gagal memuat roles/stores/users:', err.message)
  }
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

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // Cari roleId dari database live yang sesuai dengan role code yang dipilih
    let matchedRole = availableRoles.value.find(
      r => r.roleCode?.toUpperCase() === form.value.role?.toUpperCase()
    )
    if (!matchedRole && availableRoles.value.length > 0) {
      matchedRole = availableRoles.value[0]
    }

    const finalAvatar = form.value.avatarUrl || form.value.avatar || getRandomAvatar(form.value.name)

    const payload = {
      name: form.value.name.trim(),
      gender: form.value.gender || 'M',
      phone: form.value.phone ? form.value.phone.trim() : '',
      email: form.value.email.trim(),
      avatarUrl: finalAvatar,
      avatar: finalAvatar,
      password: 'password123',
      roleId: matchedRole ? matchedRole.roleId : null,
      departmentId: (form.value.storeId && String(form.value.storeId).length > 20) ? form.value.storeId : null,
      isBuddy: form.value.role === 'STORE_LEADER' ? Boolean(form.value.isBuddy) : false,
      userBuddyId: (form.value.role === 'CREW' && form.value.userBuddyId) ? form.value.userBuddyId : null,
      isActive: true
    }

    const res = await userApi.create(payload)
    if (res && (res.success || res.data)) {
      toast.success('User Berhasil Dibuat', `${form.value.name} telah didaftarkan ke dalam sistem live.`)
      await userStore.fetchUsersFromApi({ page: 1, limit: 10 })
      router.push('/admin/users')
    } else {
      throw new Error(res?.message || 'Gagal menyimpan user ke backend server.')
    }
  } catch (err) {
    console.error('Create user error:', err)
    toast.error('Gagal Membuat User', err.message || 'Terjadi kesalahan saat memproses data.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
