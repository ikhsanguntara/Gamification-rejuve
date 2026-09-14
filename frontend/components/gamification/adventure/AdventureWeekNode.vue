<template>
  <div
    class="adventure-week-node-wrapper"
    :class="[`state-${weekState}`, { 'is-active': weekState === 'active' }]"
    @click="handleClick"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    :title="`${weekTitle} - Klik untuk melihat detail ${missionsCount} misi`"
  >
    <!-- Pulse rings for active week -->
    <div v-if="weekState === 'active'" class="pulse-ring ring-1"></div>
    <div v-if="weekState === 'active'" class="pulse-ring ring-2"></div>

    <!-- Main Node Body / Outpost Shield -->
    <div class="week-node-body" :class="nodeBodyClass">
      <!-- Icon -->
      <component :is="weekIcon" class="week-node-icon" />

      <!-- Lock overlay -->
      <div v-if="weekState === 'locked'" class="week-node-lock">
        <Lock class="w-4 h-4 text-slate-300" />
      </div>

      <!-- Completed Checkmark Badge -->
      <div v-if="weekState === 'completed'" class="week-check-badge">
        <Check class="w-3 h-3 text-white" stroke-width="3" />
      </div>
    </div>

    <!-- Week Number Badge -->
    <div class="week-number-badge" :class="numberBadgeClass">
      W{{ week.weekNumber }}
    </div>

    <!-- Outpost Label Pill -->
    <div class="week-label-pill" :class="pillClass">
      <div class="pill-top-row">
        <span class="pill-week-tag">WEEK {{ week.weekNumber }}</span>
        <span class="pill-status-dot" :class="dotClass"></span>
      </div>
      <span class="pill-name">{{ weekThemeName }}</span>
      <div class="pill-stats-row">
        <span class="pill-missions">{{ completedMissionsCount }}/{{ missionsCount }} Misi</span>
        <span v-if="weekState !== 'locked'" class="pill-stars">
          ★ {{ totalStarsEarned }}
        </span>
      </div>
    </div>

    <!-- Hover Tooltip -->
    <Transition name="tooltip">
      <div v-if="hovered" class="week-hover-tooltip">
        <span class="tooltip-week">WEEK {{ week.weekNumber }} • {{ weekThemeName }}</span>
        <span class="tooltip-title">{{ week.title || 'Misi Operasional SOP' }}</span>
        <span class="tooltip-hint">Klik untuk buka {{ missionsCount }} detail misi ➔</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { calculateStars } from '~/utils/star.js'
import { useConfetti } from '~/composables/useConfetti.js'
import {
  Tent, Waves, Mountain, Compass, Lock, Check,
  Flag, Trees, Sparkles
} from 'lucide-vue-next'

const props = defineProps({
  week: { type: Object, required: true },
  missions: { type: Array, default: () => [] },
  isActiveWeek: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

const hovered = ref(false)

const WEEK_THEMES = ['BASE CAMP', 'RIVER CROSSING', 'RAINFOREST CANOPY', 'THE SUMMIT', 'THE PEAK']
const WEEK_ICONS = [Tent, Waves, Mountain, Compass, Flag]

const weekThemeName = computed(() => {
  const idx = props.week.weekNumber - 1
  return WEEK_THEMES[Math.min(idx, WEEK_THEMES.length - 1)] || `WEEK ${props.week.weekNumber}`
})

const weekIcon = computed(() => {
  const idx = props.week.weekNumber - 1
  return WEEK_ICONS[Math.min(idx, WEEK_ICONS.length - 1)] || Tent
})

const weekTitle = computed(() => props.week.title || `Week ${props.week.weekNumber}`)

const missionsCount = computed(() => {
  if (Array.isArray(props.missions)) {
    return props.missions.length
  }
  return Number(props.week?.totalMissions || 0)
})

const completedMissionsCount = computed(() => {
  if (props.missions && props.missions.length > 0) {
    return props.missions.filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length
  }
  return Number(props.week?.completedMissions || 0)
})

const totalStarsEarned = computed(() => {
  if (props.missions && props.missions.length > 0) {
    const sum = props.missions.reduce((acc, m) => {
      if (m.status === 'COMPLETED' || m.status === 'APPROVED') {
        const raw = Number(m.awardedStars || m.calculatedStars || (m.averageScore ? calculateStars(m.averageScore) : 5))
        return acc + raw
      }
      return acc
    }, 0)
    return Math.round(sum * 10) / 10
  }
  return 0
})

const weekState = computed(() => {
  if (props.week.status === 'COMPLETED' || (missionsCount.value > 0 && completedMissionsCount.value >= missionsCount.value)) {
    return 'completed'
  }
  if (props.isActiveWeek || props.week.status === 'ACTIVE') {
    return 'active'
  }
  if (props.week.isLocked) {
    return 'locked'
  }
  return 'available'
})

const nodeBodyClass = computed(() => ({
  'body-completed': weekState.value === 'completed',
  'body-active': weekState.value === 'active',
  'body-locked': weekState.value === 'locked',
  'body-available': weekState.value === 'available',
  'body-hovered': hovered.value && weekState.value !== 'locked',
}))

const numberBadgeClass = computed(() => ({
  'num-completed': weekState.value === 'completed',
  'num-active': weekState.value === 'active',
  'num-locked': weekState.value === 'locked',
  'num-available': weekState.value === 'available',
}))

const pillClass = computed(() => ({
  'pill-completed': weekState.value === 'completed',
  'pill-active': weekState.value === 'active',
  'pill-locked': weekState.value === 'locked',
  'pill-available': weekState.value === 'available',
}))

const dotClass = computed(() => ({
  'dot-completed': weekState.value === 'completed',
  'dot-active': weekState.value === 'active',
  'dot-locked': weekState.value === 'locked',
  'dot-available': weekState.value === 'available',
}))

const confetti = useConfetti()

const handleClick = (e) => {
  if (weekState.value !== 'locked') {
    if (typeof window !== 'undefined' && e) {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      confetti.triggerStarBurst({ x, y })
    } else {
      confetti.triggerStarBurst()
    }
  }
  emit('select', props.week)
}
</script>

<style scoped>
.adventure-week-node-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 10;
}

.adventure-week-node-wrapper:hover:not(.state-locked) {
  transform: scale(1.08) translateY(-4px);
  z-index: 25;
}

.state-locked {
  cursor: pointer;
  opacity: 0.8;
}

/* ── Pulse rings for active week (Beacon Radar) ── */
.pulse-ring {
  position: absolute;
  top: 26px;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 2.5px solid #F59E0B;
  box-shadow: 0 0 12px 2px rgba(245, 158, 11, 0.6);
  pointer-events: none;
  animation: weekPulse 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
}
.ring-1 { width: 68px; height: 68px; animation-delay: 0s; }
.ring-2 { width: 92px; height: 92px; animation-delay: 0.75s; }

@keyframes weekPulse {
  0% { opacity: 0.95; transform: translate(-50%, -50%) scale(0.85); }
  100% { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
}

/* ── Node Body (Big Outpost Shield) ── */
.week-node-body {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid;
  transition: all 0.25s ease;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
  transform: rotate(0deg);
}

.body-completed {
  background: linear-gradient(135deg, #065F46 0%, #059669 60%, #10B981 100%);
  border-color: #34D399;
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.55), 0 8px 20px rgba(0,0,0,0.3);
}

.body-active {
  background: linear-gradient(135deg, #78350F 0%, #D97706 50%, #F59E0B 100%);
  border-color: #FDE68A;
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.8), 0 8px 20px rgba(0,0,0,0.3);
  animation: activeGlow 2.4s ease-in-out infinite;
}

.body-available {
  background: linear-gradient(135deg, #374151, #4B5563);
  border-color: #9CA3AF;
}

.body-locked {
  background: linear-gradient(135deg, #1F2937, #374151);
  border-color: #4B5563;
  filter: grayscale(0.6);
}

.body-hovered {
  box-shadow: 0 0 32px rgba(251, 191, 36, 0.7), 0 10px 24px rgba(0,0,0,0.4) !important;
}

@keyframes activeGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.6), 0 8px 20px rgba(0,0,0,0.3); }
  50% { box-shadow: 0 0 36px rgba(245, 158, 11, 0.95), 0 8px 20px rgba(0,0,0,0.3); }
}

.week-node-icon {
  width: 26px;
  height: 26px;
  color: white;
  opacity: 0.95;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.body-locked .week-node-icon {
  opacity: 0.35;
}

.week-node-lock {
  position: absolute;
  inset: 0;
  background: rgba(17, 24, 39, 0.6);
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.week-check-badge {
  position: absolute;
  top: -6px;
  left: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10B981;
  border: 2px solid #ECFDF5;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

/* ── Week Number Badge ── */
.week-number-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  padding: 1px 6px;
  height: 18px;
  border-radius: 9px;
  font-size: 9px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid white;
  line-height: 1;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
}

.num-completed { background: #059669; color: white; border-color: #A7F3D0; }
.num-active { background: #D97706; color: #FFFBEB; border-color: #FDE68A; }
.num-locked { background: #4B5563; color: #D1D5DB; border-color: #6B7280; }
.num-available { background: #8B5E3C; color: #FDF3DC; border-color: #D4AC5A; }

/* ── Outpost Label Pill (Under Node) ── */
.week-label-pill {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 10px;
  border-radius: 12px;
  background: rgba(20, 14, 8, 0.92);
  backdrop-filter: blur(8px);
  border: 1.5px solid;
  box-shadow: 0 4px 14px rgba(0,0,0,0.4);
  white-space: nowrap;
  min-width: 108px;
  transition: all 0.2s ease;
}

.pill-completed {
  border-color: rgba(52, 211, 153, 0.6);
  background: rgba(6, 78, 59, 0.92);
}
.pill-active {
  border-color: rgba(252, 211, 77, 0.85);
  background: rgba(120, 53, 15, 0.94);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);
}
.pill-locked {
  border-color: rgba(107, 114, 128, 0.35);
  background: rgba(31, 41, 55, 0.88);
}
.pill-available {
  border-color: rgba(212, 172, 90, 0.4);
  background: rgba(44, 26, 8, 0.9);
}

.pill-top-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 1px;
}

.pill-week-tag {
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #FCD34D;
}
.pill-completed .pill-week-tag { color: #A7F3D0; }
.pill-locked .pill-week-tag { color: #9CA3AF; }

.pill-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.dot-completed { background: #34D399; }
.dot-active { background: #FBBF24; animation: blink 1s infinite ease-in-out; }
.dot-locked { background: #6B7280; }
.dot-available { background: #D4AC5A; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.pill-name {
  font-size: 10px;
  font-weight: 800;
  color: #FFFFFF;
  letter-spacing: 0.04em;
  line-height: 1.2;
}

.pill-stats-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 8.5px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 1px;
}

.pill-stars {
  color: #FCD34D;
  font-weight: 800;
}

/* ── Hover Tooltip ── */
.week-hover-tooltip {
  position: absolute;
  bottom: calc(100% + 14px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 10, 5, 0.96);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(251, 191, 36, 0.6);
  border-radius: 12px;
  padding: 8px 12px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}

.week-hover-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: rgba(15, 10, 5, 0.96);
}

.tooltip-week {
  font-size: 8.5px;
  font-weight: 900;
  color: #F59E0B;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.tooltip-title {
  font-size: 11px;
  color: #FDF3DC;
  font-weight: 700;
  max-width: 220px;
  text-align: center;
  white-space: normal;
}

.tooltip-hint {
  font-size: 9px;
  color: #FDE68A;
  font-weight: 800;
  margin-top: 2px;
}

/* Tooltip transition */
.tooltip-enter-active, .tooltip-leave-active { transition: opacity 0.15s, transform 0.15s; }
.tooltip-enter-from, .tooltip-leave-to { opacity: 0; transform: translateX(-50%) translateY(4px); }
</style>
