<template>
  <div class="h-screen w-full bg-[#faf7fa] dark:bg-slate-950 flex flex-col justify-center items-center py-4 px-4 sm:px-6 relative overflow-y-auto sm:overflow-hidden transition-colors">
    <!-- Ambient Background Glows inspired by Re.juve Palette -->
    <div class="absolute -top-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 bg-[#831843]/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-[#9d174d]/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6b133a]/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Header Brand -->
    <div class="w-full max-w-md text-center relative z-10">
      <!-- Re.juve Brand Logo -->
      <div class="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-xl ring-4 ring-[#831843]/30 mb-2 overflow-hidden animate-bounce-short">
        <img
          src="/images/logo.png"
          alt="Re.juve True Cold-Pressed"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="flex items-center justify-center gap-2 mb-0.5">
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Re.juve
        </h1>
        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] border border-[#831843]/20">
          TRUE COLD-PRESSED
        </span>
      </div>

      <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
        Mission Management & Store Performance Gamification
      </p>
      <p class="text-[11px] font-semibold text-[#9d174d] dark:text-[#f472b6] mt-0.5">
        #CleanLabel • 100% Fresh, Pure & Natural Operations
      </p>
    </div>

    <!-- Form Container Card -->
    <div class="w-full max-w-md mt-3 sm:mt-4 relative z-10">
      <div class="bg-white dark:bg-slate-900 py-5 sm:py-6 px-5 sm:px-7 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl sm:rounded-3xl space-y-3.5">
        
        <!-- Judul Form -->
        <div class="border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">
            Masuk ke Akun Anda
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gunakan email dan password terdaftar di sistem Re.juve.
          </p>
        </div>

        <!-- Form Login REST API Asli -->
        <form @submit.prevent="handleLogin" class="space-y-3 sm:space-y-3.5">
          <!-- Email Input -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Alamat Email Kerja
            </label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                required
                placeholder="nama@rejuve.co.id"
                class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] transition-all"
              />
              <Mail class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <!-- Password Input with Show/Hide Toggle -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Password
              </label>
            </div>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-9 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] transition-all"
              />
              <Key class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#6b133a] via-[#831843] to-[#9d174d] hover:from-[#4a0e28] hover:to-[#6b133a] text-white shadow-md shadow-[#831843]/20 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-1"
          >
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            <LogIn v-else class="w-4 h-4" />
            <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk ke Portal Operasional' }}</span>
          </button>
        </form>

        <!-- Pintasan Akun Dev (Otomatis HANYA Muncul di Localhost / Mac Dev) -->
        <div v-if="isLocalDev" class="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              🛠️ Dev Shortcut (Localhost):
            </span>
            <span class="text-[9px] font-mono text-slate-400">pwd: password123</span>
          </div>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="acc in devAccounts"
              :key="acc.email"
              type="button"
              @click="quickFill(acc)"
              class="px-2 py-1 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-center"
              :class="[
                email === acc.email
                  ? 'border-[#831843] bg-[#831843]/10 dark:bg-[#831843]/20 ring-1 ring-[#831843]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
              ]"
            >
              <span class="text-[10.5px] font-bold text-slate-900 dark:text-white truncate">
                {{ acc.label }}
              </span>
              <span class="text-[8.5px] font-medium text-slate-400 truncate">
                {{ acc.role }}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'
import { Mail, Key, LogIn, Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const isLocalDev = ref(false)

// Akun pintasan cepat untuk dev lokal Mac / Localhost
const devAccounts = [
  { label: 'Super Admin', role: 'SUPERADMIN', email: 'superadmin@example.com' },
  { label: 'Store Leader', role: 'STORE_LEADER', email: 'sl@example.com' },
  { label: 'District Mgr', role: 'DISTRICT_MGR', email: 'dm@example.com' }
]

const quickFill = (acc) => {
  email.value = acc.email
  password.value = 'password123'
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    isLocalDev.value = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local')
  }
})

const handleLogin = async () => {
  if (!email.value.trim() || !password.value) {
    toast.error('Gagal Masuk', 'Email dan password wajib diisi.')
    return
  }

  isLoading.value = true
  try {
    const res = await userStore.loginWithApi({
      email: email.value.trim(),
      password: password.value
    })

    if (res && res.success) {
      toast.success(
        'Login Berhasil!',
        `Selamat datang ${userStore.currentUser.name} (${userStore.currentUser.role}) 🎉`
      )

      // Navigasi sesuai role dari database API
      if (userStore.isSuperadmin) {
        router.push('/admin')
      } else if (userStore.isCrew) {
        router.push('/journey')
      } else {
        router.push('/dashboard')
      }
    } else {
      toast.error('Gagal Masuk', res?.error || 'Email atau password tidak sesuai.')
    }
  } catch (err) {
    toast.error('Koneksi Gagal', err.message || 'Tidak dapat terhubung ke server API.')
  } finally {
    isLoading.value = false
  }
}
</script>
