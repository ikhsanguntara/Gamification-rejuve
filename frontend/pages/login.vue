<template>
  <div class="min-h-screen bg-[#faf7fa] dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
    <!-- Ambient Background Glows inspired by Re.juve Palette -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#831843]/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-[#9d174d]/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6b133a]/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
      <!-- Re.juve Brand Logo -->
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full shadow-2xl ring-4 ring-[#831843]/40 mb-4 overflow-hidden animate-bounce-short">
        <img
          src="/images/logo.png"
          alt="Re.juve True Cold-Pressed"
          class="w-full h-full object-cover"
        />
      </div>

      <div class="flex items-center justify-center gap-2 mb-1">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Re.juve
        </h1>
        <span class="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] border border-[#831843]/30">
          TRUE COLD-PRESSED
        </span>
      </div>

      <p class="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
        Mission Management & Store Performance Gamification
      </p>
      <p class="text-xs font-semibold text-[#9d174d] dark:text-[#f472b6] mt-0.5">
        #CleanLabel • 100% Fresh, Pure & Natural Operations
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 relative z-10">
      <div class="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl space-y-6">
        
        <!-- Status Koneksi REST API -->
        <div class="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold text-slate-800 dark:text-slate-200">REST API:</span>
            <span class="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Live ngrok Server</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
            JWT Bearer
          </span>
        </div>

        <!-- Judul Form -->
        <div class="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Masuk ke Akun Anda
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gunakan email dan password terdaftar di sistem Re.juve.
          </p>
        </div>

        <!-- Form Login REST API Asli -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email Input -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Email Kerja
            </label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                required
                placeholder="nama@rejuve.co.id"
                class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] transition-all"
              />
              <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <!-- Password Input with Show/Hide Toggle -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
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
                class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-10 pr-10 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] transition-all"
              />
              <Key class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
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
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#6b133a] via-[#831843] to-[#9d174d] hover:from-[#4a0e28] hover:to-[#6b133a] text-white shadow-lg shadow-[#831843]/30 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer mt-2"
          >
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            <LogIn v-else class="w-4 h-4" />
            <span>{{ isLoading ? 'Memverifikasi...' : 'Masuk ke Portal Operasional' }}</span>
          </button>
        </form>

        <!-- Quick Fill Akun Live Database Backend (Memudahkan Pengujian Akun Asli) -->
        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Pintasan Akun Database API:
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              v-for="acc in apiAccounts"
              :key="acc.email"
              type="button"
              @click="quickFill(acc)"
              class="px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-center"
              :class="[
                email === acc.email
                  ? 'border-[#831843] bg-[#831843]/10 dark:bg-[#831843]/20 ring-1 ring-[#831843]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
              ]"
            >
              <span class="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                {{ acc.label }}
              </span>
              <span class="text-[9px] font-medium text-slate-400 truncate">
                {{ acc.role }}
              </span>
            </button>
          </div>
          <p class="text-[10px] text-slate-400 text-center pt-1">
            Password default semua akun: <strong class="text-slate-600 dark:text-slate-300 font-mono">password123</strong>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
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

const email = ref('sl@example.com')
const password = ref('password123')
const showPassword = ref(false)
const isLoading = ref(false)

// Akun-akun resmi di database backend (seeder PostgreSQL)
const apiAccounts = [
  { label: 'Super Admin', role: 'SUPERADMIN', email: 'superadmin@example.com' },
  { label: 'Store Leader', role: 'STORE_LEADER', email: 'sl@example.com' },
  { label: 'District Mgr', role: 'DISTRICT_MANAGER', email: 'dm@example.com' },
  { label: 'Crew Barista', role: 'CREW', email: 'crew@example.com' },
  { label: 'Buddy Mentor', role: 'BUDDY (CREW)', email: 'buddy@example.com' }
]

const quickFill = (acc) => {
  email.value = acc.email
  password.value = 'password123'
}

const handleLogin = async () => {
  isLoading.value = true
  try {
    const res = await userStore.loginWithApi({
      email: email.value.trim(),
      password: password.value
    })

    if (res && res.success) {
      toast.success(
        'Login Berhasil!',
        `Selamat datang ${userStore.currentUser.name} (${userStore.currentUser.role}) • Sesi JWT Aktif 🎉`
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
