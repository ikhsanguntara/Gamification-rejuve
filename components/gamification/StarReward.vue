<template>
  <div class="inline-flex items-center gap-1.5" :class="containerClass">
    <div class="flex items-center gap-1">
      <div
        v-for="starIndex in maxStars"
        :key="starIndex"
        class="transition-all duration-300 transform"
        :class="[
          starIndex <= activeStars
            ? 'text-amber-400 scale-100'
            : 'text-slate-200 dark:text-slate-700 scale-95'
        ]"
      >
        <Star
          class="transition-all"
          :class="[
            starSizeClass,
            starIndex <= activeStars ? 'fill-amber-400 animate-star-pop' : 'fill-transparent'
          ]"
        />
      </div>
    </div>

    <span
      v-if="showLabel"
      class="font-bold text-slate-700 dark:text-slate-300 ml-1"
      :class="labelSizeClass"
    >
      {{ activeStars }} {{ activeStars === 1 ? 'Star' : 'Stars' }}
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
    default: 5
  },
  size: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg', 'xl'
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

const activeStars = computed(() => {
  if (props.stars !== null && props.stars !== undefined) {
    return Math.min(props.maxStars, Math.max(0, props.stars))
  }
  if (props.score !== null && props.score !== undefined) {
    return calculateStars(props.score)
  }
  return 1
})

const starSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-3.5 h-3.5'
    case 'md': return 'w-4 h-4'
    case 'lg': return 'w-5 h-5'
    case 'xl': return 'w-7 h-7'
    default: return 'w-4 h-4'
  }
})

const labelSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'text-xs font-semibold'
    case 'md': return 'text-sm font-semibold'
    case 'lg': return 'text-base font-bold'
    case 'xl': return 'text-lg font-bold'
    default: return 'text-sm font-semibold'
  }
})

const containerClass = computed(() => {
  return props.size === 'xl' ? 'py-1' : ''
})
</script>
