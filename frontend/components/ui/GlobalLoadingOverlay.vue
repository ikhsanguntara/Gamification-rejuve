<template>
  <Transition name="loading-fade">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-[999999] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 select-none pointer-events-auto"
      aria-modal="true"
      role="dialog"
      aria-busy="true"
    >
      <!-- Ambient Glow Behind Box -->
      <div class="absolute w-72 h-72 bg-[#831843]/30 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Loading Card -->
      <div class="relative bg-slate-900/95 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center max-w-xs sm:max-w-sm w-full overflow-hidden">
        <!-- Top Shimmer Bar -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse"></div>

        <!-- Animated Spinner & Brand Icon -->
        <div class="relative w-16 h-16 mb-4 flex items-center justify-center">
          <!-- Spinning Gradient Ring -->
          <div class="absolute inset-0 rounded-full border-3 border-transparent border-t-[#831843] border-r-amber-500 border-b-[#9d174d] animate-spin"></div>
          <!-- Outer Pulsing Glow Ring -->
          <div class="absolute inset-[-4px] rounded-full border border-amber-400/30 animate-ping opacity-30"></div>
          <!-- Center Icon -->
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#831843] to-amber-600 flex items-center justify-center shadow-lg">
            <Loader2 class="w-5 h-5 text-white animate-spin" />
          </div>
        </div>

        <!-- Dynamic Message -->
        <h3 class="text-sm sm:text-base font-bold text-white tracking-tight leading-snug mb-1">
          {{ message || 'Memproses Permintaan...' }}
        </h3>

        <!-- Subtitle / Warning -->
        <p class="text-[11px] text-slate-300 leading-relaxed max-w-xs mb-3">
          {{ submessage || 'Harap tunggu, sistem sedang memproses data ke server.' }}
        </p>

        <!-- Mini Indeterminate Progress Bar -->
        <div class="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
          <div class="loading-indeterminate-bar"></div>
        </div>

        <span class="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-2.5">
          Re.juve System Processing
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useLoading } from '~/composables/useLoading.js'
import { Loader2 } from 'lucide-vue-next'

const { isLoading, message, submessage } = useLoading()
</script>

<style scoped>
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.loading-indeterminate-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, #831843, #f59e0b, #831843);
  border-radius: 9999px;
  animation: indeterminate 1.5s infinite linear;
  width: 45%;
}

@keyframes indeterminate {
  0% { left: -45%; }
  100% { left: 100%; }
}
</style>
