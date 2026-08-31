<template>
  <div class="min-h-screen bg-[#faf7fa] dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
    <!-- Ambient Background Glows inspired by Re.juve Beet & Berry Palette -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#831843]/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-[#9d174d]/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6b133a]/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10 px-4">
      <!-- Re.juve App Brand Logo -->
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

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 relative z-10">
      <div class="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl space-y-6">
        <!-- Quick Select Persona (6 Accounts) -->
        <div>
          <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-3 text-center sm:text-left">
            Pilih Akun Persona untuk Masuk (Simulasi Data Terpisah)
          </label>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <!-- SPV 1 -->
            <button
              type="button"
              @click="selectAccount('spv-001')"
              class="p-3 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group cursor-pointer"
              :class="[
                selectedUserId === 'spv-001'
                  ? 'border-[#831843] ring-2 ring-[#831843] bg-[#831843]/10 dark:bg-[#831843]/20 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.SUPERVISOR_1.avatar"
                :alt="mockUsers.SUPERVISOR_1.name"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-1.5"
              />
              <span class="text-xs font-bold text-slate-900 dark:text-white block truncate w-full">
                {{ mockUsers.SUPERVISOR_1.name }}
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.2 mt-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                👔 SPV (Batch 1 & 2)
              </span>
            </button>

            <!-- SPV 2 -->
            <button
              type="button"
              @click="selectAccount('spv-002')"
              class="p-3 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group cursor-pointer"
              :class="[
                selectedUserId === 'spv-002'
                  ? 'border-[#831843] ring-2 ring-[#831843] bg-[#831843]/10 dark:bg-[#831843]/20 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.SUPERVISOR_2.avatar"
                :alt="mockUsers.SUPERVISOR_2.name"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-1.5"
              />
              <span class="text-xs font-bold text-slate-900 dark:text-white block truncate w-full">
                {{ mockUsers.SUPERVISOR_2.name }}
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.2 mt-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                👔 SPV (Batch 3 PIM)
              </span>
            </button>

            <!-- Head 1 -->
            <button
              type="button"
              @click="selectAccount('head-001')"
              class="p-3 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group cursor-pointer"
              :class="[
                selectedUserId === 'head-001'
                  ? 'border-[#831843] ring-2 ring-[#831843] bg-[#831843]/10 dark:bg-[#831843]/20 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.HEAD_1.avatar"
                :alt="mockUsers.HEAD_1.name"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-1.5"
              />
              <span class="text-xs font-bold text-slate-900 dark:text-white block truncate w-full">
                {{ mockUsers.HEAD_1.name }}
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.2 mt-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                👑 Head (Batch 1 & 2)
              </span>
            </button>

            <!-- Head 2 -->
            <button
              type="button"
              @click="selectAccount('head-002')"
              class="p-3 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group cursor-pointer"
              :class="[
                selectedUserId === 'head-002'
                  ? 'border-[#831843] ring-2 ring-[#831843] bg-[#831843]/10 dark:bg-[#831843]/20 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.HEAD_2.avatar"
                :alt="mockUsers.HEAD_2.name"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-1.5"
              />
              <span class="text-xs font-bold text-slate-900 dark:text-white block truncate w-full">
                {{ mockUsers.HEAD_2.name }}
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.2 mt-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                👑 Head (Batch 3 PIM)
              </span>
            </button>

            <!-- Crew 1 -->
            <button
              type="button"
              @click="selectAccount('crew-001')"
              class="p-3 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group cursor-pointer"
              :class="[
                selectedUserId === 'crew-001'
                  ? 'border-[#831843] ring-2 ring-[#831843] bg-[#831843]/10 dark:bg-[#831843]/20 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.CREW_1.avatar"
                :alt="mockUsers.CREW_1.name"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-1.5"
              />
              <span class="text-xs font-bold text-slate-900 dark:text-white block truncate w-full">
                {{ mockUsers.CREW_1.name }}
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.2 mt-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                👤 Kru (Batch 1)
              </span>
            </button>

            <!-- Superadmin -->
            <button
              type="button"
              @click="selectAccount('admin-001')"
              class="p-3 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group cursor-pointer"
              :class="[
                selectedUserId === 'admin-001'
                  ? 'border-slate-700 dark:border-slate-300 ring-2 ring-slate-700 dark:ring-slate-300 bg-slate-100 dark:bg-slate-800 shadow-md scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.SUPERADMIN.avatar"
                :alt="mockUsers.SUPERADMIN.name"
                class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-1.5"
              />
              <span class="text-xs font-bold text-slate-900 dark:text-white block truncate w-full">
                {{ mockUsers.SUPERADMIN.name.split(' ')[0] }}
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.2 mt-0.5 rounded bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                ⚙️ Superadmin
              </span>
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Email Kerja
            </label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                required
                readonly
                class="w-full text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
              <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <!-- Hak Akses Box -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 block">
              Ringkasan Hak Akses & Penugasan:
            </span>
            <p v-if="selectedUserId === 'spv-001'" class="text-xs leading-relaxed">
              👔 <strong>Budi Santoso (Supervisor)</strong>: Bertanggung jawab mengevaluasi <strong>Batch 1 (Grand Indonesia)</strong> dan <strong>Batch 2 (Senayan City)</strong>. Tidak dapat menilai Batch 3.
            </p>
            <p v-else-if="selectedUserId === 'spv-002'" class="text-xs leading-relaxed">
              👔 <strong>Dewi Lestari (Supervisor)</strong>: Bertanggung jawab mengevaluasi <strong>Batch 3 (Pondok Indah Mall)</strong>. Data evaluasi terpisah dari Batch 1 & 2.
            </p>
            <p v-else-if="selectedUserId === 'head-001'" class="text-xs leading-relaxed">
              👑 <strong>Ahmad Dahlan (Head of Ops)</strong>: Menerima antrean review persetujuan untuk <strong>Batch 1 & 2</strong>.
            </p>
            <p v-else-if="selectedUserId === 'head-002'" class="text-xs leading-relaxed">
              👑 <strong>Citra Dewi (Head of Ops)</strong>: Menerima antrean review persetujuan khusus untuk <strong>Batch 3 (PIM)</strong>.
            </p>
            <p v-else-if="selectedUserId === 'crew-001'" class="text-xs leading-relaxed">
              👤 <strong>Andi Pratama (Store Crew)</strong>: Anggota tim <strong>Batch 1</strong>.
            </p>
            <p v-else class="text-xs leading-relaxed">
              ⚙️ <strong>Siti Rahmawati (Superadmin)</strong>: Akses penuh ke seluruh batch dan pengaturan master console.
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold bg-gradient-to-r from-[#6b133a] via-[#831843] to-[#9d174d] hover:from-[#4a0e28] hover:to-[#6b133a] text-white shadow-lg shadow-[#831843]/30 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            <LogIn v-else class="w-4 h-4" />
            <span>Masuk ke Konsol Re.juve</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, mockUsers } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'
import { Mail, LogIn } from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

const selectedUserId = ref('spv-001')
const email = ref(mockUsers.SUPERVISOR_1.email)
const isLoading = ref(false)

const selectAccount = (userId) => {
  selectedUserId.value = userId
  const found = userStore.userDirectory.find(u => u.id === userId)
  if (found) {
    email.value = found.email
  }
}

const handleLogin = () => {
  isLoading.value = true
  setTimeout(() => {
    userStore.loginAsUser(selectedUserId.value)
    isLoading.value = false
    toast.success('Selamat Datang di Re.juve Operations', `Masuk sebagai ${userStore.currentUser.name} (${userStore.currentUser.roleTitle})`)
    if (userStore.isSuperadmin) {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }, 400)
}
</script>
