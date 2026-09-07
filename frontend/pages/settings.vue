<template>
  <div class="space-y-6 w-full">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Pengaturan Sistem
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
        Kelola informasi profil akun aktif, konfigurasi endpoint REST API server, dan preferensi antarmuka.
      </p>
    </div>

    <!-- 1. Active User Profile Card -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-4">
          <div class="relative">
            <img
              v-if="userStore.currentUser?.avatar"
              :src="userStore.currentUser.avatar"
              :alt="userStore.currentUser.name || 'User Avatar'"
              class="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#831843]/20 shadow-sm"
            />
            <div
              v-else
              class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#831843] to-[#be185d] flex items-center justify-center text-white text-xl font-bold shadow-sm"
            >
              {{ (userStore.currentUser?.name || userStore.currentUser?.username || 'U').charAt(0).toUpperCase() }}
            </div>
            <span
              v-if="userStore.isAuthenticated"
              class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
              title="Online / Terautentikasi"
            ></span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {{ userStore.currentUser?.name || userStore.currentUser?.username || 'Pengguna Re.juve' }}
              </h3>
              <span
                class="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full"
                :class="roleBadgeClasses"
              >
                {{ userStore.currentUser?.roleTitle || userStore.currentRole || 'GUEST' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
              {{ userStore.currentUser?.email || 'Tidak ada email terdaftar' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span
            class="text-xs px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5"
            :class="userStore.isAuthenticated ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'"
          >
            <span class="w-2 h-2 rounded-full" :class="userStore.isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"></span>
            <span>{{ userStore.isAuthenticated ? 'Sesi Terautentikasi' : 'Belum Terautentikasi' }}</span>
          </span>
        </div>
      </div>

      <!-- Account Metadata Details Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Divisi / Departemen</p>
          <p class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            {{ userStore.currentUser?.department || 'Store Operations' }}
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Lokasi Gerai / Penugasan</p>
          <p class="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
            {{ userStore.currentUser?.storeLocation || 'Semua Wilayah' }}
          </p>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ID Pengguna</p>
          <p class="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">
            {{ userStore.currentUser?.id || userStore.currentUserId || '-' }}
          </p>
        </div>
      </div>
    </div>

    <!-- REST API Server Endpoint Configuration Card -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Konfigurasi Endpoint REST API Server</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Atur URL target backend API tanpa perlu build ulang. Default dibaca dari file <code class="text-[#831843] dark:text-[#f472b6] font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code> (<code class="font-mono">NUXT_PUBLIC_API_BASE</code>).
          </p>
        </div>
        <span class="text-[10px] px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold font-mono">
          {{ appEnv.toUpperCase() }}
        </span>
      </div>

      <div class="space-y-3 pt-1">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            URL Basis REST API Aktif:
          </label>
          <div class="flex gap-2">
            <input
              v-model="customApiUrl"
              type="url"
              placeholder="http://103.168.147.133:3005/api"
              class="flex-1 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
            <button
              type="button"
              @click="saveApiUrl"
              class="px-4 py-2.5 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-sm transition-all cursor-pointer"
            >
              Simpan
            </button>
            <button
              type="button"
              @click="resetApiUrl"
              class="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Kembalikan ke default file .env"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- Preset URL Buttons -->
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <span class="text-[11px] text-slate-400 font-medium">Preset Cepat:</span>
          <button
            type="button"
            @click="applyPreset('http://103.168.147.133:3005/api')"
            class="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-[#831843] cursor-pointer"
          >
            🖥️ VPS Dev (103.168.147.133:3005)
          </button>
          <button
            type="button"
            @click="applyPreset('http://localhost:3000/api')"
            class="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-[#831843] cursor-pointer"
          >
            💻 Localhost:3000
          </button>
          <button
            type="button"
            @click="applyPreset('https://api.gamification.rejuve.co.id/api')"
            class="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-[#831843] cursor-pointer"
          >
            🚀 Production Live
          </button>
        </div>
      </div>
    </div>

    <!-- 2. Data Persistence & Reset -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-3 shadow-sm">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Manajemen Penyimpanan Data (LocalStorage)
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Semua Batch, User baru, Misi, dan Evaluasi tersimpan permanen di browser Anda.
          </p>
        </div>

        <button
          type="button"
          @click="handleResetData"
          class="px-4 py-2 text-xs font-semibold rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw class="w-3.5 h-3.5" />
          <span>Reset ke Data Default</span>
        </button>
      </div>
    </div>

    <!-- 3. Theme Preferences -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 space-y-4 shadow-sm">
      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
        Tema Tampilan Aplikasi
      </h3>

      <div class="flex items-center gap-3 pt-1">
        <button
          type="button"
          @click="setTheme('light')"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer"
          :class="theme === 'light' ? 'border-[#831843] bg-[#831843]/10 text-[#831843]' : 'border-slate-200 dark:border-slate-800'"
        >
          <Sun class="w-4 h-4" />
          <span>Light Mode</span>
        </button>

        <button
          type="button"
          @click="setTheme('dark')"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer"
          :class="theme === 'dark' ? 'border-[#831843] bg-[#831843]/10 text-[#831843]' : 'border-slate-200 dark:border-slate-800'"
        >
          <Moon class="w-4 h-4" />
          <span>Dark Mode</span>
        </button>

        <button
          type="button"
          @click="setTheme('system')"
          class="px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer"
          :class="theme === 'system' ? 'border-[#831843] bg-[#831843]/10 text-[#831843]' : 'border-slate-200 dark:border-slate-800'"
        >
          <Laptop class="w-4 h-4" />
          <span>Sinkronisasi Sistem</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useTheme } from '~/composables/useTheme.js'
import { useToast } from '~/composables/useToast.js'
import { clearAllStoredData } from '~/utils/storage.js'
import { getApiBaseUrl } from '~/composables/useApi.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'
import { Sun, Moon, Laptop, RotateCcw } from 'lucide-vue-next'

const userStore = useUserStore()
const { theme, setTheme } = useTheme()
const toast = useToast()

const customApiUrl = ref('http://103.168.147.133:3005/api')
const appEnv = ref('development')

const roleBadgeClasses = computed(() => {
  const r = userStore.currentRole
  if (r === 'SUPERADMIN') return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
  if (r === 'DISTRICT_MANAGER' || r === 'HEAD') return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
  if (r === 'STORE_LEADER' || r === 'SUPERVISOR') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
})

onMounted(() => {
  customApiUrl.value = getApiBaseUrl()
  try {
    const config = useRuntimeConfig?.()
    if (config?.public?.appEnv) appEnv.value = config.public.appEnv
  } catch (e) {}
})

const saveApiUrl = () => {
  if (!customApiUrl.value || !customApiUrl.value.trim()) {
    toast.error('Gagal', 'URL API tidak boleh kosong.')
    return
  }
  const clean = customApiUrl.value.trim().replace(/\/$/, '')
  if (typeof window !== 'undefined') {
    localStorage.setItem('rejuve_api_base', clean)
  }
  toast.success('URL API Diperbarui', `Target server API: ${clean}`)
}

const resetApiUrl = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rejuve_api_base')
  }
  customApiUrl.value = getApiBaseUrl()
  toast.info('URL API Direset', `Kembali ke konfigurasi default .env: ${customApiUrl.value}`)
}

const applyPreset = (presetUrl) => {
  customApiUrl.value = presetUrl
  saveApiUrl()
}

const handleResetData = async () => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Reset Cache Penyimpanan Lokal?',
    text: 'Apakah Anda yakin ingin membersihkan seluruh cache lokal aplikasi di browser ini? Data sesi akan di-refresh.',
    confirmButtonText: 'Ya, Bersihkan Cache'
  })

  if (isConfirmed) {
    clearAllStoredData()
    toast.info('Cache Dibersihkan', 'Memuat ulang aplikasi...')
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }
}
</script>
