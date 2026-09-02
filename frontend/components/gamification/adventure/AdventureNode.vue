<template>
  <div
    class="adventure-node-wrapper"
    :class="[`state-${nodeState}`, { 'is-active': nodeState === 'current' }]"
    @click="handleClick"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    :title="mission.title"
  >
    <!-- Pulse rings for current node -->
    <div v-if="nodeState === 'current'" class="pulse-ring ring-1"></div>
    <div v-if="nodeState === 'current'" class="pulse-ring ring-2"></div>

    <!-- Node body -->
    <div class="node-body" :class="nodeBodyClass">
      <!-- Icon -->
      <component :is="nodeIcon" class="node-icon" />

      <!-- Lock overlay -->
      <div v-if="nodeState === 'locked'" class="node-lock">
        <LockIcon class="lock-icon" />
      </div>
    </div>

    <!-- Mission number badge -->
    <div class="node-number" :class="nodeNumberClass">
      {{ missionIndex }}
    </div>

    <!-- Stars earned (completed) -->
    <div v-if="nodeState === 'completed'" class="node-stars">
      <span v-for="i in (mission.awardedStars || 5)" :key="i" class="star">★</span>
    </div>

    <!-- Revision warning -->
    <div v-if="nodeState === 'revision'" class="revision-badge">
      !
    </div>

    <!-- Pending review badge -->
    <div v-if="nodeState === 'pending'" class="pending-badge">
      <ClockIcon class="w-2.5 h-2.5" />
    </div>

    <!-- Hover tooltip label -->
    <Transition name="tooltip">
      <div v-if="hovered && nodeState !== 'locked'" class="node-tooltip">
        <span class="tooltip-num">M{{ missionIndex }}</span>
        <span class="tooltip-title">{{ mission.title }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Tent, Waves, Trees, Mountain, Flag,
  Lock as LockIcon, Clock as ClockIcon,
  Anchor, Flame, Star, MapPin, Compass
} from 'lucide-vue-next'

const props = defineProps({
  mission: { type: Object, required: true },
  missionIndex: { type: Number, required: true },
  weekNumber: { type: Number, default: 1 }
})

const emit = defineEmits(['select'])

const hovered = ref(false)

const nodeState = computed(() => {
  const s = props.mission.status
  if (s === 'COMPLETED' || s === 'APPROVED') return 'completed'
  if (s === 'PENDING_REVIEW') return 'pending'
  if (s === 'REVISION_REQUIRED') return 'revision'
  if (s === 'IN_PROGRESS') return 'current'
  if (s === 'LOCKED') return 'locked'
  if (s === 'NOT_STARTED') {
    // Check if week is locked
    return props.mission.weekLocked ? 'locked' : 'available'
  }
  return 'available'
})

// Cycle through different node icons per position for variety
const NODE_ICONS = [Tent, Anchor, Trees, Waves, Mountain, Compass, Flag, MapPin, Flame, Star, Tent, Mountain]

const nodeIcon = computed(() => {
  return NODE_ICONS[(props.missionIndex - 1) % NODE_ICONS.length]
})

const nodeBodyClass = computed(() => ({
  'node-completed': nodeState.value === 'completed',
  'node-current': nodeState.value === 'current',
  'node-available': nodeState.value === 'available',
  'node-locked': nodeState.value === 'locked',
  'node-revision': nodeState.value === 'revision',
  'node-pending': nodeState.value === 'pending',
  'node-hovered': hovered.value && nodeState.value !== 'locked',
}))

const nodeNumberClass = computed(() => ({
  'num-completed': nodeState.value === 'completed',
  'num-current': nodeState.value === 'current',
  'num-locked': nodeState.value === 'locked',
  'num-revision': nodeState.value === 'revision',
  'num-pending': nodeState.value === 'pending',
}))

const handleClick = () => {
  if (nodeState.value === 'locked') return
  emit('select', props.mission)
}
</script>

<style scoped>
.adventure-node-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  z-index: 10;
}
.adventure-node-wrapper:hover:not(.state-locked) {
  transform: scale(1.12);
  z-index: 20;
}
.state-locked {
  cursor: not-allowed;
  opacity: 0.65;
}

/* Pulse rings for current node */
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2px solid #F59E0B;
  animation: pulseRing 2s ease-out infinite;
}
.ring-1 { width: 52px; height: 52px; animation-delay: 0s; }
.ring-2 { width: 68px; height: 68px; animation-delay: 0.5s; }

@keyframes pulseRing {
  0% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.8); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.4); }
}

/* Node body */
.node-body {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
  transition: all 0.25s ease;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.node-completed {
  background: linear-gradient(135deg, #059669, #10B981);
  border-color: #34D399;
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5), 0 4px 12px rgba(0,0,0,0.2);
}
.node-current {
  background: linear-gradient(135deg, #D97706, #F59E0B);
  border-color: #FCD34D;
  box-shadow: 0 0 24px rgba(245, 158, 11, 0.7), 0 4px 12px rgba(0,0,0,0.2);
  animation: currentGlow 2s ease-in-out infinite;
}
.node-available {
  background: linear-gradient(135deg, #F5E6C8, #FDF3DC);
  border-color: #D4AC5A;
}
.node-locked {
  background: linear-gradient(135deg, #374151, #4B5563);
  border-color: #6B7280;
  filter: grayscale(0.5);
}
.node-revision {
  background: linear-gradient(135deg, #92400E, #D97706);
  border-color: #FBBF24;
  box-shadow: 0 0 16px rgba(217, 119, 6, 0.5);
}
.node-pending {
  background: linear-gradient(135deg, #1E40AF, #3B82F6);
  border-color: #93C5FD;
  box-shadow: 0 0 14px rgba(59, 130, 246, 0.4);
}

.node-hovered {
  box-shadow: 0 0 28px rgba(255, 215, 0, 0.6), 0 6px 16px rgba(0,0,0,0.3) !important;
  transform: translateY(-2px);
}

@keyframes currentGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.6), 0 4px 12px rgba(0,0,0,0.2); }
  50% { box-shadow: 0 0 36px rgba(245, 158, 11, 0.9), 0 4px 12px rgba(0,0,0,0.2); }
}

.node-icon {
  width: 20px;
  height: 20px;
  color: white;
  opacity: 0.95;
}
.state-locked .node-icon {
  opacity: 0.4;
}

.node-lock {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lock-icon {
  width: 16px;
  height: 16px;
  color: rgba(255,255,255,0.7);
}

.node-number {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 8px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid white;
  line-height: 1;
}
.num-completed { background: #059669; color: white; }
.num-current { background: #F59E0B; color: #1C1917; }
.num-locked { background: #6B7280; color: white; }
.num-revision { background: #D97706; color: white; }
.num-pending { background: #3B82F6; color: white; }
.node-number:not(.num-completed):not(.num-current):not(.num-locked):not(.num-revision):not(.num-pending) {
  background: #8B5E3C;
  color: #FDF3DC;
}

/* Stars below completed node */
.node-stars {
  margin-top: 4px;
  display: flex;
  gap: 1px;
}
.star {
  font-size: 8px;
  color: #F59E0B;
  text-shadow: 0 0 4px rgba(245,158,11,0.8);
  line-height: 1;
}

/* Revision badge */
.revision-badge {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 16px;
  height: 16px;
  background: #EF4444;
  border-radius: 50%;
  border: 2px solid white;
  color: white;
  font-size: 9px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: revisionPulse 1.5s ease-in-out infinite;
}
@keyframes revisionPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.25); }
}

/* Pending badge */
.pending-badge {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 16px;
  height: 16px;
  background: #3B82F6;
  border-radius: 50%;
  border: 2px solid white;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Tooltip */
.node-tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 10, 5, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(212, 172, 90, 0.5);
  border-radius: 10px;
  padding: 6px 10px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.node-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(15,10,5,0.92);
}
.tooltip-num {
  font-size: 8px;
  font-weight: 900;
  color: #F59E0B;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.tooltip-title {
  font-size: 10px;
  color: #FDF3DC;
  font-weight: 600;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Tooltip transition */
.tooltip-enter-active, .tooltip-leave-active { transition: opacity 0.15s, transform 0.15s; }
.tooltip-enter-from, .tooltip-leave-to { opacity: 0; transform: translateX(-50%) translateY(4px); }
</style>
