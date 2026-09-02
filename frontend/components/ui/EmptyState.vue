<template>
  <div class="flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
    <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
      <component :is="iconComponent" class="w-7 h-7" />
    </div>
    <h3 class="text-base font-semibold text-slate-900 dark:text-white">
      {{ title }}
    </h3>
    <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">
      {{ description }}
    </p>
    <slot name="action" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  FolderOpen,
  ClipboardList,
  CheckCircle2,
  Search,
  RotateCcw,
  Target,
  Trophy
} from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    default: 'No items found'
  },
  description: {
    type: String,
    default: 'There are no records available for this section at the moment.'
  },
  icon: {
    type: String,
    default: 'FolderOpen'
  }
})

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'ClipboardList': return ClipboardList
    case 'CheckCircle2': return CheckCircle2
    case 'Search': return Search
    case 'RotateCcw': return RotateCcw
    case 'Target': return Target
    case 'Trophy': return Trophy
    default: return FolderOpen
  }
})
</script>
