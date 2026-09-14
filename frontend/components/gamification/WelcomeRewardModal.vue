<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        @click.self="handleDismiss"
      >
        <!-- Modal Card Container -->
        <div class="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-amber-300/40 dark:border-amber-500/30 shadow-2xl p-6 sm:p-8 text-center overflow-hidden my-auto animate-in zoom-in-95 duration-200">
          
          <!-- Background Ambient Glow & Star Radiance -->
          <div class="absolute -top-24 -left-24 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-24 -right-24 w-60 h-60 bg-[#831843]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-[#831843]/5 pointer-events-none"></div>

          <!-- Close button -->
          <button
            @click="handleDismiss"
            class="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20 cursor-pointer"
            aria-label="Tutup"
          >
            <X class="w-5 h-5" />
          </button>

          <div class="relative z-10 flex flex-col items-center">
            <!-- Animated Crown & Floating Star Centerpiece -->
            <div class="relative mb-5">
              <!-- Outer Pulse Ring -->
              <div class="absolute inset-0 rounded-3xl bg-amber-400/30 animate-ping duration-1000"></div>
              
              <!-- Core Badge Box -->
              <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-[#831843] via-[#9d174d] to-amber-500 p-1 shadow-xl shadow-amber-500/25 flex items-center justify-center">
                <div class="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-amber-400 relative overflow-hidden">
                  <Star class="w-10 h-10 sm:w-12 sm:h-12 fill-amber-400 animate-bounce-gentle" />
                  <Sparkles class="w-5 h-5 text-amber-300 absolute top-2 right-2 animate-pulse" />
                </div>
              </div>

              <!-- Mini Floating Pill Badge -->
              <div class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-md flex items-center gap-1 whitespace-nowrap">
                <Sparkles class="w-3 h-3 fill-slate-950" />
                <span>FIRST LOGIN BONUS</span>
              </div>
            </div>

            <!-- Congratulatory Title -->
            <h3 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
              🎉 Selamat Datang di Gamifikasi Re.juve!
            </h3>
            
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md leading-relaxed">
              Halo <strong class="text-[#831843] dark:text-[#f472b6] font-bold">{{ (userStore.currentUser?.name || 'Crew Specialist').split(' ')[0] }}</strong>! Hadiah sambutan <strong class="text-amber-500 font-bold">Early Bird First Login</strong> telah berhasil diklaim dan langsung cair ke akun Anda.
            </p>

            <!-- Reward Summary Cards -->
            <div class="grid grid-cols-2 gap-3 w-full my-5">
              <!-- Stars Earned -->
              <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex flex-col items-center text-center shadow-xs">
                <span class="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Star class="w-3 h-3 fill-amber-500 text-amber-500" />
                  Bintang Sambutan
                </span>
                <span class="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                  +{{ rewardData.starsEarned || 5.0 }} ⭐
                </span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Saldo Bintang Bertambah
                </span>
              </div>

              <!-- Points Earned -->
              <div class="p-3.5 rounded-2xl bg-[#831843]/5 dark:bg-[#831843]/20 border border-[#831843]/20 dark:border-[#831843]/40 flex flex-col items-center text-center shadow-xs">
                <span class="text-[10px] font-bold text-[#831843] dark:text-[#f472b6] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award class="w-3 h-3 text-[#831843] dark:text-[#f472b6]" />
                  Poin Gamifikasi
                </span>
                <span class="text-xl sm:text-2xl font-black text-[#831843] dark:text-[#f472b6]">
                  +{{ rewardData.pointsEarned || 100 }} Pts
                </span>
                <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ rewardData.tierLabel || 'Tepat Waktu (H0)' }}
                </span>
              </div>
            </div>

            <!-- Motivational Tips Box -->
            <div class="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-left text-xs text-slate-600 dark:text-slate-300 mb-6 flex items-start gap-2.5">
              <Compass class="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p class="leading-relaxed">
                Jelajahi peta petualangan <strong>Star Odyssey</strong>, tuntaskan modul SOP operasional bersama Buddy, dan kumpulkan bintang untuk naik level ke <strong>Star Legend</strong>! 🌟
              </p>
            </div>

            <!-- Action CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                type="button"
                @click="handleStartJourney"
                class="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#9d174d] to-[#831843] hover:from-amber-600 hover:to-[#6b133a] text-white font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Mulai Petualangan Misi 🚀</span>
                <ArrowRight class="w-4 h-4" />
              </button>

              <button
                type="button"
                @click="handleDismiss"
                class="w-full sm:w-auto py-3 px-4 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                Buka Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useConfetti } from '~/composables/useConfetti.js'
import {
  Star,
  Sparkles,
  Award,
  Compass,
  ArrowRight,
  X
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const { triggerApprovalStars } = useConfetti()

const isOpen = computed(() => {
  return Boolean(userStore.pendingWelcomeReward && userStore.isCrew)
})

const rewardData = computed(() => {
  return userStore.pendingWelcomeReward || {
    starsEarned: 5.0,
    pointsEarned: 100,
    tierLabel: 'Tepat Waktu (H0)',
    message: 'Selamat datang di Re.juve!'
  }
})

// Trigger celebration confetti when modal opens
watch(isOpen, (newVal) => {
  if (newVal) {
    triggerApprovalStars({ x: 0.5, y: 0.4 })
  }
}, { immediate: true })

onMounted(() => {
  if (isOpen.value) {
    setTimeout(() => {
      triggerApprovalStars({ x: 0.5, y: 0.4 })
    }, 200)
  }
})

function handleDismiss() {
  userStore.dismissWelcomeReward(userStore.currentUser?.id)
}

function handleStartJourney() {
  handleDismiss()
  router.push('/journey')
}
</script>
