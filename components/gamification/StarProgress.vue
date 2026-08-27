<template>
  <div class="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 dark:border-amber-900/40 relative overflow-hidden shadow-sm">
    <!-- Star Glow Accent -->
    <div class="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none"></div>

    <!-- Header Row -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 flex-shrink-0">
          <Star class="w-5 h-5 fill-white" />
        </div>
        <div>
          <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Gamification Status
          </span>
          <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
            <span>LEVEL {{ progress.currentLevel }}</span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
              ({{ progress.currentLevelTitle }})
            </span>
          </h3>
        </div>
      </div>

      <!-- Total Star Badge -->
      <div class="self-start sm:self-auto">
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 font-bold text-xs sm:text-sm shadow-sm">
          <Star class="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{{ progress.currentStars.toLocaleString() }}</span>
          <span class="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">Stars</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-3">
      <div class="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
        <span>Lvl {{ progress.currentLevel }} ({{ progress.levelMinStars }} ⭐)</span>
        <span>
          <span v-if="!progress.isMaxLevel">
            Lvl {{ progress.nextLevel }} ({{ progress.levelMaxStars }} ⭐)
          </span>
          <span v-else class="text-amber-500 font-bold">Max Level 🏆</span>
        </span>
      </div>

      <!-- Outer Track -->
      <div class="w-full bg-slate-200 dark:bg-slate-800 h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 shadow-inner">
        <div
          class="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 transition-all duration-700 ease-out shadow-sm"
          :style="{ width: `${progress.progressPercent}%` }"
        ></div>
      </div>

      <!-- Subtext -->
      <div class="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
        <span>{{ progress.progressPercent }}% to next milestone</span>
        <span v-if="!progress.isMaxLevel" class="font-semibold text-amber-600 dark:text-amber-400">
          {{ progress.starsToNextLevel }} Stars to Level {{ progress.nextLevel }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getStarProgress } from '~/utils/star.js'
import { Star } from 'lucide-vue-next'

const props = defineProps({
  stars: {
    type: Number,
    required: true
  }
})

const progress = computed(() => getStarProgress(props.stars))
</script>
