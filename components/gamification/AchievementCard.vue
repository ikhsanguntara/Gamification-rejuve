<template>
  <div
    class="rounded-2xl border p-5 flex flex-col justify-between transition-all card-hover relative overflow-hidden"
    :class="[
      achievement.isUnlocked
        ? 'bg-gradient-to-br from-amber-500/10 via-white to-transparent dark:from-amber-950/20 dark:via-slate-900 dark:to-transparent border-amber-300 dark:border-amber-700/60 shadow-sm'
        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 opacity-90'
    ]"
  >
    <!-- Top Row: Icon, Category & Unlocked Badge -->
    <div>
      <div class="flex items-center justify-between gap-2 mb-3">
        <!-- Icon Container -->
        <div
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform"
          :class="[
            achievement.isUnlocked
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/20 scale-105'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          ]"
        >
          <component :is="resolvedIcon" class="w-5 h-5" />
        </div>

        <!-- Unlocked / Locked Status Pill -->
        <div class="flex items-center gap-2">
          <span
            v-if="achievement.starRewardBonus"
            class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-0.5"
          >
            ⭐ +{{ achievement.starRewardBonus }}
          </span>

          <span
            class="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            :class="[
              achievement.isUnlocked
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            ]"
          >
            <Check v-if="achievement.isUnlocked" class="w-3 h-3" />
            <Lock v-else class="w-3 h-3" />
            <span>{{ achievement.isUnlocked ? 'Unlocked' : 'Locked' }}</span>
          </span>
        </div>
      </div>

      <!-- Title & Description -->
      <h4 class="text-sm font-semibold text-slate-900 dark:text-white">
        {{ achievement.title }}
      </h4>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
        {{ achievement.description }}
      </p>
    </div>

    <!-- Bottom Progress / Unlocked Info -->
    <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
      <!-- If Unlocked -->
      <div v-if="achievement.isUnlocked" class="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
        <span>Completed ✓</span>
        <span class="text-xs text-slate-400">Unlocked {{ achievement.unlockedAt }}</span>
      </div>

      <!-- If Locked: Progress Bar -->
      <div v-else class="space-y-1.5">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Progress</span>
          <span class="font-semibold text-slate-700 dark:text-slate-300">
            {{ achievement.currentValue }} / {{ achievement.targetValue }}
          </span>
        </div>
        <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            class="h-full bg-amber-500 rounded-full transition-all duration-500"
            :style="{ width: `${Math.min(100, Math.round((achievement.currentValue / achievement.targetValue) * 100))}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Target,
  Award,
  CalendarCheck,
  Crown,
  Star,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  Check,
  Lock
} from 'lucide-vue-next'

const props = defineProps({
  achievement: {
    type: Object,
    required: true
  }
})

const resolvedIcon = computed(() => {
  switch (props.achievement.icon) {
    case 'Target': return Target
    case 'Award': return Award
    case 'CalendarCheck': return CalendarCheck
    case 'Crown': return Crown
    case 'Star': return Star
    case 'TrendingUp': return TrendingUp
    case 'Sparkles': return Sparkles
    case 'ShieldCheck': return ShieldCheck
    case 'CheckCircle2': return CheckCircle2
    case 'Trophy': return Trophy
    default: return Trophy
  }
})
</script>
