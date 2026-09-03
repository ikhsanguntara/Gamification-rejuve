<template>
  <div class="inline-flex items-center gap-1.5" :class="containerClass">
    <!-- Visual 5 Stars Container with Fraction Fill Support -->
    <div class="flex items-center gap-1">
      <div
        v-for="starIndex in maxStars"
        :key="starIndex"
        class="relative inline-flex items-center justify-center transition-all duration-300"
      >
        <!-- Background empty star -->
        <Star
          :class="[starSizeClass, 'text-slate-300 dark:text-slate-700 fill-slate-100 dark:fill-slate-800/80']"
        />
        <!-- Foreground filled / fraction star -->
        <div
          class="absolute top-0 left-0 h-full overflow-hidden transition-all duration-300"
          :style="{ width: getStarFillPercent(starIndex) + '%' }"
        >
          <Star
            :class="[starSizeClass, 'text-amber-400 fill-amber-400']"
          />
        </div>
      </div>
    </div>

    <!-- Label: e.g. "4.1 / 5 stars" or "4.1 Stars" -->
    <span
      v-if="showLabel"
      class="font-bold text-slate-700 dark:text-slate-300 ml-1"
      :class="labelSizeClass"
    >
      {{ formattedStars }} / {{ maxStars }} stars
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { calculateStars } from '~/utils/star.js'

const props = defineProps({
  stars: {
    type: Number,
    default: null
  },
  score: {
    type: Number,
    default: null
  },
  maxStars: {
    type: Number,
    default: 5 // Standar Re.juve Baru: Max 5 Bintang per Kartu Misi
  },
  size: {
    type: String,
    default: 'md' // 'xs', 'sm', 'md', 'lg', 'xl'
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

const activeStars = computed(() => {
  if (props.stars !== null && props.stars !== undefined) {
    return Math.min(props.maxStars, Math.max(0, Number(props.stars) || 0))
  }
  if (props.score !== null && props.score !== undefined) {
    return calculateStars(props.score)
  }
  return 0
})

const formattedStars = computed(() => {
  return (Math.round(activeStars.value * 10) / 10).toFixed(1).replace(/\.0$/, '')
})

function getStarFillPercent(starIndex) {
  const current = activeStars.value
  if (current >= starIndex) return 100
  if (current <= starIndex - 1) return 0
  const fraction = current - (starIndex - 1)
  return Math.round(fraction * 100)
}

const starSizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'w-3 h-3'
    case 'sm': return 'w-3.5 h-3.5'
    case 'md': return 'w-4 h-4'
    case 'lg': return 'w-5 h-5'
    case 'xl': return 'w-7 h-7'
    default: return 'w-4 h-4'
  }
})

const labelSizeClass = computed(() => {
  switch (props.size) {
    case 'xs': return 'text-[10px] font-semibold'
    case 'sm': return 'text-xs font-semibold'
    case 'md': return 'text-xs font-bold'
    case 'lg': return 'text-sm font-bold'
    case 'xl': return 'text-base font-black'
    default: return 'text-xs font-bold'
  }
})

const containerClass = computed(() => {
  return props.size === 'xl' ? 'py-1' : ''
})
</script>
