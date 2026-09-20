<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all"
    :class="statusMeta.badgeClass"
  >
    <span
      v-if="showDot"
      class="w-1.5 h-1.5 rounded-full"
      :class="statusMeta.dotClass"
    ></span>
    <component
      :is="statusIcon"
      v-if="showIcon"
      class="w-3.5 h-3.5"
    />
    <span>{{ statusMeta.label }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'
import { getMissionStatusMeta } from '~/utils/mission.js'
import {
  Circle,
  Clock,
  FileText,
  ClipboardCheck,
  Hourglass,
  RotateCcw,
  CheckCircle2,
  CheckCheck,
  Lock
} from 'lucide-vue-next'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  showDot: {
    type: Boolean,
    default: false
  }
})

const statusMeta = computed(() => getMissionStatusMeta(props.status))

const statusIcon = computed(() => {
  switch (statusMeta.value.key) {
    case 'NOT_STARTED':
    case 'UNGRADED': return Circle
    case 'IN_PROGRESS':
    case 'ACTIVE':
    case 'OPEN': return Clock
    case 'DRAFT': return FileText
    case 'EVALUATED': return ClipboardCheck
    case 'PENDING_REVIEW':
    case 'SCORED_BY_TL': return Hourglass
    case 'REVISION_REQUIRED':
    case 'REVISED_BY_DM': return RotateCcw
    case 'APPROVED':
    case 'APPROVED_BY_DM': return CheckCircle2
    case 'COMPLETED': return CheckCheck
    case 'LOCKED': return Lock
    default: return Circle
  }
})
</script>
