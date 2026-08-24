<template>
  <BaseModal
    :modelValue="modelValue"
    :title="title"
    :subtitle="subtitle"
    max-width="md"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('cancel')"
  >
    <template #icon>
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center"
        :class="iconBgClass"
      >
        <component :is="resolvedIcon" class="w-5 h-5" :class="iconColorClass" />
      </div>
    </template>

    <div class="py-2 text-sm text-slate-600 dark:text-slate-300">
      <slot>
        <p>{{ message }}</p>
      </slot>
    </div>

    <template #footer>
      <button
        type="button"
        @click="handleCancel"
        class="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {{ cancelText }}
      </button>
      <button
        type="button"
        @click="handleConfirm"
        :disabled="loading"
        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition-all"
        :class="confirmButtonClass"
      >
        <span v-if="loading" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
        <span>{{ confirmText }}</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  RotateCcw,
  Star
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  subtitle: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'primary' // 'primary', 'danger', 'warning', 'success', 'star'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const resolvedIcon = computed(() => {
  switch (props.variant) {
    case 'danger': return AlertTriangle
    case 'warning': return RotateCcw
    case 'success': return CheckCircle2
    case 'star': return Star
    default: return Info
  }
})

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'bg-rose-100 dark:bg-rose-950/60'
    case 'warning': return 'bg-amber-100 dark:bg-amber-950/60'
    case 'success': return 'bg-emerald-100 dark:bg-emerald-950/60'
    case 'star': return 'bg-amber-100 dark:bg-amber-950/60'
    default: return 'bg-blue-100 dark:bg-blue-950/60'
  }
})

const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'text-rose-600 dark:text-rose-400'
    case 'warning': return 'text-amber-600 dark:text-amber-400'
    case 'success': return 'text-emerald-600 dark:text-emerald-400'
    case 'star': return 'text-amber-500 fill-amber-400'
    default: return 'text-blue-600 dark:text-blue-400'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
    case 'warning': return 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
    case 'success': return 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
    case 'star': return 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20'
    default: return 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white'
  }
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>
