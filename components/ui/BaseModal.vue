<template>
  <DialogRoot :open="modelValue" @update:open="handleOpenUpdate">
    <DialogPortal v-if="modelValue">
      <DialogOverlay class="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 pointer-events-none">
        <DialogContent
          class="relative w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all focus:outline-hidden pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]"
          :class="maxWidthClass"
          :trap-focus="true"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
            <div class="flex items-center gap-3">
              <slot name="icon" />
              <div>
                <DialogTitle class="text-base font-semibold text-slate-900 dark:text-white">
                  {{ title }}
                </DialogTitle>
                <DialogDescription v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ subtitle }}
                </DialogDescription>
              </div>
            </div>
            <DialogClose
              v-if="showClose"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X class="w-5 h-5" />
            </DialogClose>
          </div>

          <!-- Modal Body -->
          <div class="px-6 py-5 max-h-[75vh] overflow-y-auto">
            <slot />
          </div>

          <!-- Modal Footer -->
          <div
            v-if="$slots.footer"
            class="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800/80"
          >
            <slot name="footer" />
          </div>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>

<script setup>
import { computed } from 'vue'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose
} from 'reka-ui'
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: 'md' // 'sm', 'md', 'lg', 'xl', '2xl', '3xl'
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm': return 'max-w-sm'
    case 'md': return 'max-w-md'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    case '2xl': return 'max-w-2xl'
    case '3xl': return 'max-w-3xl'
    default: return 'max-w-md'
  }
})

const handleOpenUpdate = (open) => {
  emit('update:modelValue', open)
  if (!open) {
    emit('close')
  }
}
</script>
