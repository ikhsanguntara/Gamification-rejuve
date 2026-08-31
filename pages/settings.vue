<template>
  <div class="space-y-6 w-full max-w-4xl mx-auto">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Pengaturan Sistem & Simulasi Multi-Pejabat
      </h2>
      <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
        Beralih antar akun Supervisor, Head of Operations, Crew, dan Superadmin untuk memverifikasi pemisahan data per batch.
      </p>
    </div>

    <!-- 1. Multi-Persona Testing Switcher Card -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 space-y-6 shadow-sm">
      <div>
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Simulasi Akun Pengguna (Isolasi Data Per Batch)
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Pilih salah satu profil di bawah untuk menguji hak akses evaluasi dan antrean approval yang terpisah:
        </p>
      </div>

      <!-- Supervisor Comparison Grid -->
      <div class="space-y-3">
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>👔 Akun Supervisor Penilai:</span>
        </span>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- SPV 1 -->
          <button
            type="button"
            @click="switchUser('spv-001')"
            class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3"
            :class="[
              userStore.currentUserId === 'spv-001'
                ? 'border-[#831843] bg-[#831843]/10 ring-2 ring-[#831843]'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
            ]"
          >
            <img :src="mockUsers.SUPERVISOR_1.avatar" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ mockUsers.SUPERVISOR_1.name }}
                </h4>
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  SPV 1
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Penugasan: <strong>Batch 1 & 2</strong></p>
              <p class="text-[10px] text-slate-400 mt-1">Hanya dapat menilai misi di Grand Indonesia & Senayan City.</p>
            </div>
          </button>

          <!-- SPV 2 -->
          <button
            type="button"
            @click="switchUser('spv-002')"
            class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3"
            :class="[
              userStore.currentUserId === 'spv-002'
                ? 'border-[#831843] bg-[#831843]/10 ring-2 ring-[#831843]'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
            ]"
          >
            <img :src="mockUsers.SUPERVISOR_2.avatar" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ mockUsers.SUPERVISOR_2.name }}
                </h4>
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  SPV 2
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Penugasan: <strong>Batch 3 (PIM)</strong></p>
              <p class="text-[10px] text-slate-400 mt-1">Hanya dapat menilai misi di Pondok Indah Mall.</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Head of Operations Comparison Grid -->
      <div class="space-y-3 pt-2">
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <span>👑 Akun Head of Operations (Approver):</span>
        </span>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Head 1 -->
          <button
            type="button"
            @click="switchUser('head-001')"
            class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3"
            :class="[
              userStore.currentUserId === 'head-001'
                ? 'border-[#831843] bg-[#831843]/10 ring-2 ring-[#831843]'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
            ]"
          >
            <img :src="mockUsers.HEAD_1.avatar" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ mockUsers.HEAD_1.name }}
                </h4>
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                  Head 1
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Wewenang: <strong>Batch 1 & 2</strong></p>
              <p class="text-[10px] text-slate-400 mt-1">Antrean approval hanya memuat evaluasi dari Batch 1 & 2.</p>
            </div>
          </button>

          <!-- Head 2 -->
          <button
            type="button"
            @click="switchUser('head-002')"
            class="p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3"
            :class="[
              userStore.currentUserId === 'head-002'
                ? 'border-[#831843] bg-[#831843]/10 ring-2 ring-[#831843]'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
            ]"
          >
            <img :src="mockUsers.HEAD_2.avatar" class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mt-0.5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ mockUsers.HEAD_2.name }}
                </h4>
                <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                  Head 2
                </span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">Wewenang: <strong>Batch 3 (PIM)</strong></p>
              <p class="text-[10px] text-slate-400 mt-1">Antrean approval hanya memuat evaluasi dari Batch 3.</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Crew & Superadmin Quick Switch -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          @click="switchUser('crew-001')"
          class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3"
          :class="userStore.currentUserId === 'crew-001' ? 'border-[#831843] bg-[#831843]/10 ring-2 ring-[#831843]' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'"
        >
          <img :src="mockUsers.CREW_1.avatar" class="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300" />
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">👤 Andi Pratama (Crew Batch 1)</h4>
            <p class="text-[10px] text-slate-400">POV Kru: Hanya melihat Batch 1.</p>
          </div>
        </button>

        <button
          type="button"
          @click="switchUser('admin-001')"
          class="p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3"
          :class="userStore.currentUserId === 'admin-001' ? 'border-slate-700 ring-2 ring-slate-700 bg-slate-100 dark:bg-slate-800' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'"
        >
          <img :src="mockUsers.SUPERADMIN.avatar" class="w-8 h-8 rounded-full object-cover ring-1 ring-slate-300" />
          <div class="min-w-0 flex-1">
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">⚙️ Siti Rahmawati (Superadmin)</h4>
            <p class="text-[10px] text-slate-400">Akses master ke seluruh batch & modul admin.</p>
          </div>
        </button>
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
import { useUserStore, mockUsers } from '~/stores/user.js'
import { useTheme } from '~/composables/useTheme.js'
import { useToast } from '~/composables/useToast.js'
import { clearAllStoredData } from '~/utils/storage.js'
import { Sun, Moon, Laptop, RotateCcw } from 'lucide-vue-next'

const userStore = useUserStore()
const { theme, setTheme } = useTheme()
const toast = useToast()

const switchUser = (userId) => {
  userStore.loginAsUser(userId)
  toast.success('Beralih Pengguna', `Aktif sebagai ${userStore.currentUser.name} (${userStore.currentUser.roleTitle})`)
}

const handleResetData = () => {
  if (confirm('Apakah Anda yakin ingin me-reset seluruh data ke data demo awal? Semua perubahan batch/user baru akan dikembalikan ke awal.')) {
    clearAllStoredData()
    toast.info('Data Direset', 'Memuat ulang data awal sistem...')
    setTimeout(() => {
      window.location.reload()
    }, 500)
  }
}
</script>
