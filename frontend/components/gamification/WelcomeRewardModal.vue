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
        class="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
        @click.self="handleDismiss"
      >
        <!-- Modal Card Outer Container -->
        <div
          class="relative w-full max-w-[540px] rounded-[32px] border border-amber-500/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto animate-in zoom-in-95 duration-200 bg-[#090d16] text-white select-none"
        >
          <!-- Background Artwork: Adventure Sunset & Tropical Foliage Overlay -->
          <div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <!-- Background Landscape Image -->
            <img
              src="/images/adventure_bg_main.jpg"
              alt="Adventure Background"
              class="w-full h-full object-cover object-center opacity-30 scale-110"
            />
            <!-- Atmospheric Dark Vignette Gradient -->
            <div class="absolute inset-0 bg-gradient-to-b from-[#090d16]/90 via-[#0c1220]/95 to-[#060911]"></div>
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-black/80"></div>
            
            <!-- Glow Highlights -->
            <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-amber-400/25 to-pink-500/20 rounded-full blur-3xl"></div>
            <div class="absolute bottom-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </div>

          <!-- Decorative Slogan Art on Left: Wooden Signpost "SAME PEOPLE BRIGHTER JOURNEY 🍃" -->
          <div class="absolute top-12 sm:top-14 left-3 sm:left-5 z-10 hidden sm:flex flex-col items-center pointer-events-none opacity-90">
            <!-- Wooden Arrow Sign -->
            <div class="relative bg-gradient-to-b from-[#5c3a21] via-[#432818] to-[#2e1c10] border border-[#8b5a2b]/60 rounded-xl px-2.5 py-2 shadow-lg text-center transform -rotate-3">
              <span class="block text-[8px] font-black uppercase tracking-widest text-amber-200/90 leading-tight">SAME</span>
              <span class="block text-[8px] font-black uppercase tracking-widest text-amber-200/90 leading-tight">PEOPLE</span>
              <span class="block text-[8px] font-black uppercase tracking-widest text-amber-300 leading-tight">BRIGHTER</span>
              <span class="block text-[8px] font-black uppercase tracking-widest text-amber-300 leading-tight">JOURNEY</span>
              <span class="block text-[10px] mt-0.5">🍃</span>
            </div>
            <!-- Signpost Pole -->
            <div class="w-1.5 h-16 bg-[#3d2414] border-x border-[#5c3a21]/50 rounded-b"></div>
          </div>

          <!-- Decorative Slogan Art on Right: Calligraphy "Good People Grow Further" -->
          <div class="absolute top-10 sm:top-12 right-6 sm:right-10 z-10 hidden sm:block pointer-events-none text-right">
            <div class="font-serif italic text-amber-200/90 text-sm sm:text-base leading-tight font-medium tracking-wide drop-shadow-md">
              <span>Good</span><br />
              <span class="text-amber-300 font-semibold pl-2">People</span><br />
              <span class="pl-4">Grow</span><br />
              <span class="text-amber-400 font-bold pl-5">Further</span>
            </div>
          </div>

          <!-- Close button (X) at Top Right -->
          <button
            type="button"
            @click="handleDismiss"
            class="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-slate-400 hover:text-white bg-black/40 hover:bg-black/70 border border-white/10 transition-all z-30 cursor-pointer shadow-md"
            aria-label="Tutup"
          >
            <X class="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>

          <!-- Main Content Container -->
          <div class="relative z-20 px-5 sm:px-8 pt-7 pb-6 sm:pt-9 sm:pb-7 flex flex-col items-center text-center">
            
            <!-- 🌟 Centerpiece Icon: Neon Gradient Rounded Box with Star & Sparkles -->
            <div class="relative mb-4 sm:mb-5">
              <!-- Outer Glow Layer -->
              <div class="absolute -inset-1.5 rounded-[26px] bg-gradient-to-r from-[#e11d48] via-[#f59e0b] to-[#ec4899] opacity-75 blur-md animate-pulse"></div>

              <!-- Neon Frame Box -->
              <div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-gradient-to-tr from-[#9d174d] via-[#be185d] to-[#f59e0b] p-[2.5px] shadow-2xl flex items-center justify-center">
                <div class="w-full h-full rounded-[21.5px] bg-[#0d121f] flex items-center justify-center relative overflow-hidden">
                  <!-- Radial interior glow -->
                  <div class="absolute inset-0 bg-radial from-amber-500/25 to-transparent"></div>
                  
                  <!-- 3D Gold Star Icon -->
                  <div class="relative">
                    <Star class="w-10 h-10 sm:w-12 sm:h-12 fill-amber-400 text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] animate-bounce-gentle" />
                    <!-- Sparkle accents -->
                    <Sparkles class="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 absolute -top-1.5 -right-2 animate-pulse" />
                  </div>
                </div>
              </div>

              <!-- Pill Badge: FIRST LOGIN BONUS -->
              <div class="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[10px] sm:text-[11px] tracking-wider uppercase shadow-lg shadow-amber-500/30 flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles class="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>FIRST LOGIN BONUS</span>
              </div>
            </div>

            <!-- Welcome Heading -->
            <div class="mt-2 space-y-1">
              <h2 class="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>Selamat Datang,</span>
                <span class="text-[#f472b6] drop-shadow-[0_0_10px_rgba(244,114,182,0.4)]">
                  {{ crewFirstName }}!
                </span>
                <span class="text-amber-300 text-lg">🪄</span>
              </h2>
              <p class="font-serif italic text-amber-100/90 text-sm sm:text-base font-normal tracking-wide">
                Perjalanan kamu dimulai dari sini.
              </p>
            </div>

            <!-- Descriptive Text -->
            <p class="text-xs sm:text-[13px] text-slate-300/95 mt-2.5 max-w-md leading-relaxed">
              Sebagai bonus login pertama, kamu langsung mendapatkan Bintang & Poin pertamamu! ✨
            </p>

            <!-- 🎁 Two Rewards Grid Cards (Bonus Bintang & Bonus Poin) -->
            <div class="grid grid-cols-2 gap-3 sm:gap-4 w-full my-4 sm:my-5">
              
              <!-- Card 1: Bonus Bintang -->
              <div class="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#241a12]/90 to-[#17100b]/95 border border-amber-500/40 shadow-lg flex flex-col items-center text-center relative overflow-hidden group hover:border-amber-400/60 transition-colors">
                <div class="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1">
                  <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>BONUS BINTANG</span>
                </div>
                <div class="text-2xl sm:text-3xl font-black text-amber-300 flex items-center gap-1.5 my-0.5 drop-shadow-[0_0_8px_rgba(252,211,77,0.5)]">
                  <span>+{{ rewardData.starsEarned || 5 }}</span>
                  <Star class="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 text-amber-400 inline-block" />
                </div>
                <p class="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  Untuk bantu kamu naik level.
                </p>
              </div>

              <!-- Card 2: Bonus Poin -->
              <div class="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#26101c]/90 to-[#190913]/95 border border-pink-500/40 shadow-lg flex flex-col items-center text-center relative overflow-hidden group hover:border-pink-400/60 transition-colors">
                <div class="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-pink-400 mb-1">
                  <Award class="w-3.5 h-3.5 text-pink-400" />
                  <span>BONUS POIN</span>
                </div>
                <div class="text-2xl sm:text-3xl font-black text-[#f472b6] flex items-center gap-1 my-0.5 drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]">
                  <span>+{{ rewardData.pointsEarned || 100 }} Pts</span>
                </div>
                <p class="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                  Untuk posisi kamu di leaderboard.
                </p>
              </div>

            </div>

            <!-- 🧭 Bottom Callout Banner: Siap Mulai Perjalanan? -->
            <div class="w-full rounded-2xl p-3.5 sm:p-4 bg-[#0f172a]/85 border border-slate-700/60 shadow-md flex items-start gap-3 text-left mb-4 sm:mb-5">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500/20 to-amber-400/30 border border-amber-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Compass class="w-5 h-5 text-amber-400" />
              </div>
              <div class="min-w-0 flex-1">
                <h4 class="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Siap mulai perjalanan?</span>
                  <span>🚀</span>
                </h4>
                <p class="text-[10.5px] sm:text-[11.5px] text-slate-300/80 mt-0.5 leading-snug">
                  Selesaikan misi setiap minggu, kumpulkan Bintang & Poin, dan terus tingkatkan progress kamu hingga mencapai level berikutnya!
                </p>
              </div>
            </div>

            <!-- 🔘 Action CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full">
              <!-- Primary Button: Mulai Misi -->
              <button
                type="button"
                @click="handleStartMission"
                class="w-full flex-1 py-3 sm:py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-[#e11d48] to-[#9d174d] hover:brightness-110 active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
              >
                <span>Mulai Misi 🚀</span>
                <ArrowRight class="w-4 h-4 stroke-[2.5]" />
              </button>

              <!-- Secondary Button: Lihat Dashboard -->
              <button
                type="button"
                @click="handleViewDashboard"
                class="w-full sm:w-auto py-3 sm:py-3.5 px-5 rounded-2xl bg-[#0b1120] hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                <span>Lihat Dashboard</span>
              </button>
            </div>

            <!-- 🍃 Re.juve Brand Footer -->
            <div class="mt-4 pt-3 text-center border-t border-white/5 w-full flex flex-col items-center justify-center">
              <span class="text-xs font-black tracking-wide text-slate-300">
                Re·juve®
              </span>
              <span class="text-[8.5px] font-bold tracking-[0.25em] text-slate-500 uppercase mt-0.5">
                GOOD FOR A HAPPIER YOU
              </span>
            </div>

          </div>

          <!-- Bottom Foliage Decorative Silhouettes -->
          <div class="absolute -bottom-6 -left-6 w-24 h-24 bg-emerald-900/30 rounded-full blur-xl pointer-events-none"></div>
          <div class="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-900/30 rounded-full blur-xl pointer-events-none"></div>
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

const crewFirstName = computed(() => {
  const full = userStore.currentUser?.name || 'Intan'
  const first = full.trim().split(' ')[0]
  return first || 'Intan'
})

const rewardData = computed(() => {
  return userStore.pendingWelcomeReward || {
    starsEarned: 5,
    pointsEarned: 100,
    tierLabel: 'Tepat Waktu (H0)',
    message: 'Selamat datang di Re.juve!'
  }
})

// Trigger celebration confetti when modal opens
watch(
  isOpen,
  (newVal) => {
    if (newVal) {
      triggerApprovalStars({ x: 0.5, y: 0.35 })
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (isOpen.value) {
    setTimeout(() => {
      triggerApprovalStars({ x: 0.5, y: 0.35 })
    }, 200)
  }
})

function handleDismiss() {
  userStore.dismissWelcomeReward(userStore.currentUser?.id)
}

function handleStartMission() {
  handleDismiss()
  router.push('/journey')
}

function handleViewDashboard() {
  handleDismiss()
  router.push('/dashboard')
}
</script>
