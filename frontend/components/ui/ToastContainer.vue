<template>
  <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-4 sm:p-0">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all"
        :class="getToastStyles(toast.type)"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <Star v-if="toast.type === 'star'" class="w-5 h-5 text-amber-500 fill-amber-400 animate-bounce-short" />
          <CheckCircle2 v-else-if="toast.type === 'success'" class="w-5 h-5 text-emerald-500" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-500" />
          <XCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-500" />
          <Info v-else class="w-5 h-5 text-blue-500" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
            {{ toast.title }}
          </p>
          <p v-if="toast.message" class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-normal">
            {{ toast.message }}
          </p>
        </div>

        <!-- Dismiss -->
        <button
          type="button"
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg"
          aria-label="Close notification"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '~/composables/useToast.js'
import {
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X
} from 'lucide-vue-next'

const { toasts, removeToast } = useToast()

const getToastStyles = (type) => {
  switch (type) {
    case 'star':
      return 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-100 shadow-amber-500/10'
    case 'success':
      return 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-100 shadow-emerald-500/10'
    case 'warning':
      return 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-100 shadow-amber-500/10'
    case 'error':
      return 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-100 shadow-rose-500/10'
    case 'info':
    default:
      return 'bg-white/95 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
  }
}
</script>
