<template>
  <BaseModal
    :modelValue="modelValue"
    title="Request Evaluation Revision"
    :subtitle="item ? `Returning evaluation for ${item.crewName} (${item.missionTitle})` : ''"
    max-width="md"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('cancel')"
  >
    <template #icon>
      <div class="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
        <RotateCcw class="w-5 h-5" />
      </div>
    </template>

    <div class="space-y-4 py-2">
      <div class="space-y-1.5">
        <label class="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Revision Note (Required) <span class="text-rose-500">*</span>
        </label>
        <textarea
          v-model="revisionNote"
          rows="4"
          placeholder="Example: Please attach the missing electrical safety log certificate and clarify measurement discrepancy on Line 3..."
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500"
        ></textarea>
        <p v-if="error" class="text-xs font-medium text-rose-600 dark:text-rose-400">
          {{ error }}
        </p>
      </div>

      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 space-y-1">
        <p class="font-semibold text-slate-700 dark:text-slate-300">What happens next?</p>
        <p class="leading-relaxed">
          The evaluation status will change to <strong class="text-rose-600 dark:text-rose-400 font-semibold">REVISION_REQUIRED</strong>. The supervisor will be notified to adjust score, comment, or evidence and resubmit for review.
        </p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="handleCancel"
        class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        @click="handleConfirm"
        class="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all active:scale-95"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>Request Revision</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const revisionNote = ref('')
const error = ref('')

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    revisionNote.value = ''
    error.value = ''
  }
})

const handleConfirm = () => {
  if (!revisionNote.value.trim()) {
    error.value = 'Please provide a clear revision note explaining what needs adjustment.'
    return
  }
  emit('confirm', revisionNote.value.trim())
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>
