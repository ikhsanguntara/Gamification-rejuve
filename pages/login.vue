<template>
  <div class="min-h-screen bg-[#faf7fa] dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
    <!-- Ambient Background Glows inspired by Re.juve Fresh Juice Palette -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-[#499ec7]/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-[#963189]/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
      <!-- Re.juve App Brand Logo -->
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#499ec7] via-[#24779f] to-[#963189] text-white shadow-xl shadow-[#499ec7]/25 mb-4 animate-bounce-short">
        <Sparkles class="w-8 h-8 text-white" />
      </div>

      <div class="flex items-center justify-center gap-2 mb-1">
        <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Re.juve
        </h1>
        <span class="text-xs font-black uppercase px-2 py-0.5 rounded-full bg-[#499ec7]/10 text-[#499ec7] dark:bg-[#499ec7]/20 border border-[#499ec7]/30">
          TRUE COLD-PRESSED
        </span>
      </div>

      <p class="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
        Mission Management & Store Performance Gamification
      </p>
      <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
        #CleanLabel • 100% Fresh, Pure & Natural Operations
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 relative z-10">
      <div class="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl space-y-6">
        <!-- Quick Select Persona -->
        <div>
          <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-3">
            Select Role Persona to Login
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <!-- Crew Persona -->
            <button
              type="button"
              @click="selectRole('CREW')"
              class="p-3.5 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group"
              :class="[
                selectedRole === 'CREW'
                  ? 'border-[#499ec7] ring-2 ring-[#499ec7] bg-[#499ec7]/5 dark:bg-[#499ec7]/10 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-[#499ec7]/60 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.CREW.avatar"
                :alt="mockUsers.CREW.name"
                class="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-2 group-hover:scale-105 transition-transform"
              />
              <span class="text-xs font-extrabold text-slate-900 dark:text-white block">
                {{ mockUsers.CREW.name }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 mt-1 rounded-md bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
                Store Specialist
              </span>
            </button>

            <!-- Supervisor Persona -->
            <button
              type="button"
              @click="selectRole('SUPERVISOR')"
              class="p-3.5 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group"
              :class="[
                selectedRole === 'SUPERVISOR'
                  ? 'border-amber-500 ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-500/60 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.SUPERVISOR.avatar"
                :alt="mockUsers.SUPERVISOR.name"
                class="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-2 group-hover:scale-105 transition-transform"
              />
              <span class="text-xs font-extrabold text-slate-900 dark:text-white block">
                {{ mockUsers.SUPERVISOR.name }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 mt-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Area Supervisor
              </span>
            </button>

            <!-- Head Persona -->
            <button
              type="button"
              @click="selectRole('HEAD')"
              class="p-3.5 rounded-2xl border text-left transition-all relative flex flex-col items-center text-center group"
              :class="[
                selectedRole === 'HEAD'
                  ? 'border-[#963189] ring-2 ring-[#963189] bg-[#963189]/5 dark:bg-[#963189]/10 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:border-[#963189]/60 bg-slate-50/50 dark:bg-slate-950/40'
              ]"
            >
              <img
                :src="mockUsers.HEAD.avatar"
                :alt="mockUsers.HEAD.name"
                class="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-2 group-hover:scale-105 transition-transform"
              />
              <span class="text-xs font-extrabold text-slate-900 dark:text-white block">
                {{ mockUsers.HEAD.name }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 mt-1 rounded-md bg-[#963189]/10 text-[#963189] dark:text-[#db92d7]">
                Head of Quality
              </span>
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-4 pt-2">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Work Email Address
            </label>
            <div class="relative">
              <input
                v-model="email"
                type="email"
                required
                readonly
                class="w-full text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
              />
              <Mail class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Security Pin / Password
            </label>
            <div class="relative">
              <input
                v-model="password"
                type="password"
                required
                class="w-full text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
              />
              <Lock class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <!-- Role Permissions Preview Box -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <span class="font-bold text-slate-800 dark:text-slate-200 block">
              Re.juve Store Privileges:
            </span>
            <p v-if="selectedRole === 'CREW'" class="text-[11px] leading-relaxed">
              👤 <strong>Store Crew</strong>: Monitor daily store sanitation, cold chain temperatures (2-4°C), check awarded ⭐ stars, and follow Re.juve store rankings.
            </p>
            <p v-else-if="selectedRole === 'SUPERVISOR'" class="text-[11px] leading-relaxed">
              📋 <strong>Area Supervisor</strong>: Conduct weekly store operational audits, evaluate all 20 Crew, attach photo proof (Chillers, HACCP log, bar cleanliness), and submit to Head.
            </p>
            <p v-else class="text-[11px] leading-relaxed">
              🛡️ <strong>Head of Operations</strong>: Review all store branch evaluations, make final <strong>APPROVE</strong> decisions to award stars, or request <strong>REVISE</strong> with notes.
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-extrabold bg-gradient-to-r from-[#499ec7] to-[#24779f] hover:from-[#24779f] hover:to-[#1d5e7f] text-white shadow-lg shadow-[#499ec7]/25 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span v-if="isLoading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
            <LogIn v-else class="w-4 h-4" />
            <span>Sign In to Re.juve Operations</span>
          </button>
        </form>
      </div>

      <!-- Footer Help -->
      <div class="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <span>Re.juve True Cold-Pressed</span>
        <span>•</span>
        <span>Operational Excellence System</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore, mockUsers } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'
import {
  Sparkles,
  Mail,
  Lock,
  LogIn
} from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const router = useRouter()
const userStore = useUserStore()
const toast = useToast()

const selectedRole = ref(userStore.currentRole || 'SUPERVISOR')
const email = ref(mockUsers[selectedRole.value].email)
const password = ref('••••••••••••')
const isLoading = ref(false)

const currentPersonaTitle = computed(() => {
  return mockUsers[selectedRole.value]?.roleTitle || 'User'
})

const selectRole = (role) => {
  selectedRole.value = role
  email.value = mockUsers[role].email
}

const handleLogin = () => {
  isLoading.value = true
  setTimeout(() => {
    userStore.login(selectedRole.value)
    isLoading.value = false
    toast.success('Welcome to Re.juve Operations', `Signed in as ${userStore.currentUser.name} (${userStore.currentUser.roleTitle})`)
    router.push('/dashboard')
  }, 400)
}
</script>
