<template>
  <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/40 relative overflow-hidden shadow-sm">
    <!-- Star Glow Accent -->
    <div class="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Header Row: Akumulasi Bintang & Poin Kru -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 flex-shrink-0">
          <Star class="w-6 h-6 fill-white" />
        </div>
        <div>
          <span class="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Status Gamifikasi Kru
          </span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{{ Number(stars || 0).toLocaleString() }} Bintang Terkumpul</span>
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Setara dengan <strong class="text-slate-800 dark:text-slate-200 font-bold">{{ totalPoints.toLocaleString() }} Poin</strong> (1 Bintang = 20 Poin)
          </p>
        </div>
      </div>

      <!-- Quick Metrics Pills -->
      <div class="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        <div class="px-3.5 py-2 rounded-2xl bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5">
          <Star class="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{{ Number(stars || 0).toLocaleString() }} ⭐ Bintang</span>
        </div>
        <div class="px-3.5 py-2 rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 text-amber-300 font-bold text-xs sm:text-sm shadow-xs flex items-center gap-1.5">
          <Sparkles class="w-4 h-4 text-amber-400" />
          <span>{{ totalPoints.toLocaleString() }} Points</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { starsToPoints } from '~/utils/star.js'
import { Star, Sparkles } from 'lucide-vue-next'

const props = defineProps({
  stars: {
    type: Number,
    required: true,
    default: 0
  }
})

const totalPoints = computed(() => starsToPoints(props.stars))
</script>

