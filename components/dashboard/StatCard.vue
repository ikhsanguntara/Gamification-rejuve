<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 card-hover relative overflow-hidden group">
    <!-- Subtle Gradient background glow on hover -->
    <div
      class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-xl"
      :class="glowBgClass"
    ></div>

    <div class="flex items-center justify-between mb-4">
      <span class="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {{ title }}
      </span>
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
        :class="iconContainerClass"
      >
        <component :is="icon" class="w-5 h-5" :class="iconColorClass" />
      </div>
    </div>

    <div class="flex items-baseline gap-2">
      <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {{ value }}
      </span>
      <span v-if="unit" class="text-sm font-medium text-slate-500 dark:text-slate-400">
        {{ unit }}
      </span>
    </div>

    <div class="flex items-center gap-2 mt-2 text-xs">
      <span
        v-if="trendValue"
        class="font-semibold flex items-center gap-0.5"
        :class="trendClass"
      >
        <TrendingUp v-if="trend === 'up'" class="w-3.5 h-3.5" />
        <TrendingDown v-else-if="trend === 'down'" class="w-3.5 h-3.5" />
        {{ trendValue }}
      </span>
      <span class="text-slate-500 dark:text-slate-400 truncate">
        {{ subtext }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  TrendingUp,
  TrendingDown
} from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  subtext: {
    type: String,
    default: ''
  },
  icon: {
    type: [Object, Function],
    required: true
  },
  variant: {
    type: String,
    default: 'slate' // 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'slate'
  },
  trend: {
    type: String,
    default: 'neutral' // 'up' | 'down' | 'neutral'
  },
  trendValue: {
    type: String,
    default: ''
  }
})

const iconContainerClass = computed(() => {
  switch (props.variant) {
    case 'amber': return 'bg-amber-100 dark:bg-amber-950/60'
    case 'emerald': return 'bg-emerald-100 dark:bg-emerald-950/60'
    case 'blue': return 'bg-blue-100 dark:bg-blue-950/60'
    case 'purple': return 'bg-purple-100 dark:bg-purple-950/60'
    case 'rose': return 'bg-rose-100 dark:bg-rose-950/60'
    default: return 'bg-slate-100 dark:bg-slate-800'
  }
})

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'amber': return 'text-amber-600 dark:text-amber-400'
    case 'emerald': return 'text-emerald-600 dark:text-emerald-400'
    case 'blue': return 'text-blue-600 dark:text-blue-400'
    case 'purple': return 'text-purple-600 dark:text-purple-400'
    case 'rose': return 'text-rose-600 dark:text-rose-400'
    default: return 'text-slate-600 dark:text-slate-400'
  }
})

const glowBgClass = computed(() => {
  switch (props.variant) {
    case 'amber': return 'bg-amber-500'
    case 'emerald': return 'bg-emerald-500'
    case 'blue': return 'bg-blue-500'
    case 'purple': return 'bg-purple-500'
    default: return 'bg-slate-400'
  }
})

const trendClass = computed(() => {
  if (props.trend === 'up') return 'text-emerald-600 dark:text-emerald-400'
  if (props.trend === 'down') return 'text-rose-600 dark:text-rose-400'
  return 'text-slate-500 dark:text-slate-400'
})
</script>
