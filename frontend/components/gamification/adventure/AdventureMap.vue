<template>
  <div class="adventure-map-container">
    <!-- Map canvas (scrollable on mobile) -->
    <div class="map-scroll-wrapper" ref="mapWrapper">
      <div class="map-canvas" :style="{ minWidth: canvasMinWidth }">

        <!-- Layered background landscape -->
        <AdventureBackground />

        <!-- Week zone labels (floating over background) -->
        <div class="week-zones-layer">
          <div
            v-for="zone in weekZones"
            :key="zone.week"
            class="week-zone-label"
            :style="{ left: zone.labelX, top: '8px' }"
          >
            <div class="zone-pill" :class="zone.pillClass">
              <component :is="zone.icon" class="w-3 h-3" />
              <span class="zone-week">W{{ zone.week }}</span>
              <span class="zone-name">{{ zone.shortName }}</span>
            </div>
            <div v-if="zone.isLocked" class="zone-lock-badge">
              <Lock class="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        <!-- SVG Layer: Trail path + week dividers -->
        <svg class="trail-svg" :viewBox="`0 0 ${SVG_W} ${SVG_H}`" preserveAspectRatio="none">
          <!-- Week zone separators (soft vertical dividers) -->
          <g v-for="zone in weekZones.slice(0, -1)" :key="`div-${zone.week}`">
            <line
              :x1="zone.dividerX" y1="10"
              :x2="zone.dividerX" :y2="SVG_H - 10"
              stroke="rgba(139,94,60,0.2)" stroke-width="1.5" stroke-dasharray="6,4"
            />
          </g>

          <!-- Main trail path (background glow) -->
          <path
            :d="trailPath"
            fill="none"
            stroke="rgba(80,50,20,0.4)"
            stroke-width="12"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Trail path (main texture) -->
          <path
            :d="trailPath"
            fill="none"
            stroke="#C19A6B"
            stroke-width="7"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="none"
          />
          <!-- Trail dots/steps for the path texture -->
          <path
            :d="trailPath"
            fill="none"
            stroke="#FDF3DC"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-dasharray="6 10"
            opacity="0.7"
          />
          <!-- Completed portion of trail (glowing green) -->
          <path
            v-if="completedTrailPath"
            :d="completedTrailPath"
            fill="none"
            stroke="#10B981"
            stroke-width="7"
            stroke-linecap="round"
            opacity="0.85"
          />
          <path
            v-if="completedTrailPath"
            :d="completedTrailPath"
            fill="none"
            stroke="#34D399"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-dasharray="6 10"
            opacity="0.9"
          />
        </svg>

        <!-- Waypoint nodes layer (POV PER-WEEK) -->
        <div class="nodes-layer">

          <!-- 🤝 TITIK PRA-START: RAPOR NEW HIRE BUDDY (3 HARI PRA-BATCH) -->
          <div
            class="node-position buddy-node-wrap"
            :style="{ left: buddyPosition.x, top: buddyPosition.y }"
            @click="isBuddyModalOpen = true"
            title="Rapor New Hire (3 Hari Pra-Batch) • Klik untuk melihat evaluasi Store Captain"
          >
            <div class="buddy-node-body">
              <div class="buddy-pulse-ring"></div>
              <Handshake class="w-5 h-5 text-white" />
              <div class="buddy-badge">
                <span>🤝</span>
              </div>
            </div>

            <!-- Score Pill -->
            <div class="buddy-label-pill">
              <span class="buddy-title">BUDDY</span>
              <span class="buddy-score">{{ crewBuddySummary.scorePercent }}%</span>
            </div>
          </div>

          <!-- Start marker -->
          <div class="start-marker" :style="{ left: startPosition.x, top: startPosition.y }">
            <div class="start-pill">
              <MapPin class="w-3 h-3" />
              <span>START</span>
            </div>
          </div>

          <!-- 📍 WEEK MILESTONE NODES (POV PER-WEEK OUTPOSTS) -->
          <div
            v-for="wNode in weekMilestoneNodes"
            :key="wNode.weekNumber"
            class="node-position week-outpost-position"
            :style="{
              left: wNode.position.x,
              top: wNode.position.y,
            }"
          >
            <!-- Character stands on the currently active week outpost -->
            <div
              v-if="wNode.isActiveWeek && !journeyComplete"
              class="character-position"
            >
              <AdventureCharacter />
            </div>

            <!-- Week Node Component -->
            <AdventureWeekNode
              :week="wNode"
              :missions="wNode.missions"
              :is-active-week="wNode.isActiveWeek"
              @select="onWeekSelect"
            />
          </div>

          <!-- Finish marker -->
          <div class="finish-marker" :style="{ left: finishPosition.x, top: finishPosition.y }">
            <!-- Character stands at finish if whole journey is complete -->
            <div
              v-if="journeyComplete"
              class="character-position finish-char-pos"
            >
              <AdventureCharacter />
            </div>

            <div class="finish-flag" :class="{ 'finish-reached': journeyComplete }">
              <Trophy class="w-4 h-4" />
              <span>FINISH</span>
            </div>
          </div>

          <!-- 💬 TITIK PASCA-FINISH: FEEDBACK ONBOARDING KRU (1 BULAN) -->
          <div
            class="node-position feedback-node-wrap"
            :style="{ left: feedbackPosition.x, top: feedbackPosition.y }"
            @click="isFeedbackModalOpen = true"
            title="Survei Feedback Onboarding (1 Bulan) • Klik untuk mengisi kuesioner evaluasi"
          >
            <div class="feedback-node-body">
              <div v-if="!hasSubmittedFeedback" class="feedback-pulse-ring"></div>
              <MessageSquareText class="w-5 h-5 text-white" />
              <div class="feedback-badge" :class="{ 'badge-done': hasSubmittedFeedback }">
                <span>{{ hasSubmittedFeedback ? '✓' : '💬' }}</span>
              </div>
            </div>

            <!-- Feedback Label Pill -->
            <div class="feedback-label-pill">
              <span class="feedback-title">FEEDBACK</span>
              <span class="feedback-score">{{ hasSubmittedFeedback ? (crewFeedbackData?.avgScore + '/10') : 'ISI' }}</span>
            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- Scroll indicator for mobile -->
    <div v-if="showScrollHint" class="scroll-hint">
      <ChevronRight class="w-4 h-4 animate-bounce" />
      <span>Geser untuk melihat peta lengkap</span>
    </div>

    <!-- Week Missions Detail Modal (Opens on Week Node click) -->
    <AdventureWeekModal
      v-model="isWeekModalOpen"
      :week="selectedWeek"
      :missions="selectedWeekMissions"
      :all-weeks="props.weeks"
      :batch-name="batchStore.currentBatch?.name"
      @select-week="onSwitchWeek"
    />

    <!-- Single Mission Card Popup (if triggered) -->
    <AdventureMissionCard
      :mission="selectedMission"
      :mission-index="selectedMissionIndex"
      @close="selectedMission = null"
    />

    <!-- Buddy Rapor New Hire Modal -->
    <BuddyRaporModal
      :model-value="isBuddyModalOpen"
      :crew="userStore.currentUser"
      :evaluation="crewBuddyEval"
      :competencies="buddyTemplateCompetencies"
      :summary="crewBuddySummary"
      @close="isBuddyModalOpen = false"
    />

    <!-- Crew Feedback Onboarding Modal -->
    <CrewFeedbackModal
      :model-value="isFeedbackModalOpen"
      :crew="userStore.currentUser"
      :batch-name="batchStore.currentBatch?.name"
      @close="isFeedbackModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Lock, MapPin, Trophy, ChevronRight, Handshake, MessageSquareText } from 'lucide-vue-next'
import { Tent, Waves, Mountain, Compass, Flag } from 'lucide-vue-next'
import { useBuddyStore } from '~/stores/buddy.js'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import AdventureBackground from './AdventureBackground.vue'
import AdventureWeekNode from './AdventureWeekNode.vue'
import AdventureWeekModal from './AdventureWeekModal.vue'
import AdventureCharacter from './AdventureCharacter.vue'
import AdventureMissionCard from './AdventureMissionCard.vue'
import BuddyRaporModal from './BuddyRaporModal.vue'
import CrewFeedbackModal from './CrewFeedbackModal.vue'

const props = defineProps({
  missions: { type: Array, default: () => [] },
  weeks: { type: Array, default: () => [] },
  totalWeeks: { type: Number, default: 3 },
  activeWeek: { type: Number, default: 1 }
})

const SVG_W = 1100
const SVG_H = 480

const buddyStore = useBuddyStore()
const feedbackStore = useFeedbackStore()
const userStore = useUserStore()
const batchStore = useBatchStore()

const mapWrapper = ref(null)
const selectedMission = ref(null)
const selectedMissionIndex = ref(1)
const showScrollHint = ref(false)

const isBuddyModalOpen = ref(false)
const isFeedbackModalOpen = ref(false)
const isWeekModalOpen = ref(false)
const selectedWeekNumber = ref(1)

// Crew Buddy Evaluation Info
const currentCrewId = computed(() => userStore.currentUser?.id || '')
const currentBatchId = computed(() => batchStore.currentBatch?.id || '')

const crewBuddyEval = computed(() => {
  return buddyStore.evaluationForCrew(currentBatchId.value, currentCrewId.value)
})

const crewBuddySummary = computed(() => {
  return buddyStore.crewCompetencySummary(currentBatchId.value, currentCrewId.value)
})

const buddyTemplateCompetencies = computed(() => {
  return buddyStore.defaultPackage?.competencies || []
})

// Crew Feedback Status
const crewFeedbackData = computed(() => {
  return feedbackStore.feedbackByCrewId(currentCrewId.value)
})

const hasSubmittedFeedback = computed(() => {
  return !!crewFeedbackData.value
})

// Canvas sizing
const canvasMinWidth = computed(() => {
  const w = props.totalWeeks
  if (w <= 3) return '900px'
  if (w === 4) return '1150px'
  return `${900 + (w - 3) * 250}px`
})

// Week zone metadata
const WEEK_THEMES = [
  { shortName: 'BASE CAMP', icon: Tent, color: 'emerald' },
  { shortName: 'RIVER', icon: Waves, color: 'blue' },
  { shortName: 'CANOPY', icon: Mountain, color: 'amber' },
  { shortName: 'SUMMIT', icon: Compass, color: 'red' },
  { shortName: 'PEAK', icon: Flag, color: 'purple' },
]

const weekZones = computed(() => {
  const total = props.totalWeeks
  const svgTotalW = SVG_W
  const zoneWidth = svgTotalW / total

  return props.weeks.map((week, idx) => {
    const weekNum = idx + 1
    const theme = WEEK_THEMES[Math.min(idx, WEEK_THEMES.length - 1)]
    const isCompleted = week.status === 'COMPLETED'
    const isActive = week.status === 'ACTIVE'
    const isLocked = week.isLocked

    const centerX = (idx + 0.5) * (100 / total)
    const dividerX = (idx + 1) * zoneWidth

    let pillClass = 'zone-locked'
    if (isCompleted) pillClass = 'zone-completed'
    else if (isActive) pillClass = 'zone-active'

    return {
      week: weekNum,
      shortName: theme.shortName,
      icon: theme.icon,
      isCompleted,
      isActive,
      isLocked,
      pillClass,
      labelX: `${centerX}%`,
      dividerX,
    }
  })
})

// ── Outpost Coordinates for Week Nodes (POV PER-WEEK) ────────────────────────
// Diposisikan tepat di area pangkalan per chapter:
// W1: Area Tenda Base Camp (kiri bawah)
// W2: Area Jembatan & Sungai (tengah)
// W3: Area Platform & Kanopi Pohon (kanan atas)
const WEEK_NODE_POSITIONS_3W = [
  { x: '18.0%', y: '73.0%' }, // Week 1 (Base Camp)
  { x: '50.0%', y: '71.5%' }, // Week 2 (River Crossing)
  { x: '82.0%', y: '50.0%' }, // Week 3 (Canopy Platform)
]

const WEEK_NODE_POSITIONS_4W = [
  { x: '16.0%', y: '73.0%' }, // Week 1
  { x: '38.0%', y: '74.0%' }, // Week 2
  { x: '62.0%', y: '68.5%' }, // Week 3
  { x: '82.0%', y: '50.0%' }, // Week 4
]

const WEEK_NODE_POSITIONS_5W = [
  { x: '14.0%', y: '73.0%' }, // Week 1
  { x: '31.0%', y: '74.5%' }, // Week 2
  { x: '49.0%', y: '72.0%' }, // Week 3
  { x: '67.0%', y: '66.0%' }, // Week 4
  { x: '82.0%', y: '50.0%' }, // Week 5
]

const weekPositions = computed(() => {
  if (props.totalWeeks <= 3) return WEEK_NODE_POSITIONS_3W
  if (props.totalWeeks === 4) return WEEK_NODE_POSITIONS_4W
  return WEEK_NODE_POSITIONS_5W
})

// Computed Week Nodes for display
const weekMilestoneNodes = computed(() => {
  return props.weeks.map((w, idx) => {
    const pos = weekPositions.value[idx] || { x: `${(idx + 1) * 25}%`, y: '70%' }
    const weekMissions = props.missions.filter(m => m.week === w.weekNumber)
    const isActiveWeek = w.weekNumber === props.activeWeek || w.status === 'ACTIVE'

    return {
      ...w,
      position: pos,
      missions: weekMissions,
      isActiveWeek
    }
  })
})

// Selected Week for Modal
const selectedWeek = computed(() => {
  return props.weeks.find(w => w.weekNumber === selectedWeekNumber.value) || props.weeks[0] || null
})

const selectedWeekMissions = computed(() => {
  if (!selectedWeek.value) return []
  return props.missions.filter(m => m.week === selectedWeek.value.weekNumber)
})

const onWeekSelect = (week) => {
  selectedWeekNumber.value = week.weekNumber
  isWeekModalOpen.value = true
}

const onSwitchWeek = (weekNum) => {
  selectedWeekNumber.value = weekNum
}

// ── Scenic Waypoints along the winding adventure road ────────────────────────
const TRAIL_WAYPOINTS_3W = [
  { x: 3.5,  y: 82.5 }, // Buddy (Pra-Start)
  { x: 10.0, y: 82.5 },
  { x: 18.0, y: 83.0 }, // W1
  { x: 26.0, y: 84.0 },
  { x: 35.0, y: 84.5 },
  { x: 43.0, y: 83.5 },
  { x: 50.0, y: 81.5 }, // W2 (Jembatan Sungai)
  { x: 58.0, y: 79.5 },
  { x: 67.0, y: 76.5 },
  { x: 75.0, y: 76.5 },
  { x: 82.0, y: 74.0 }, // Tangga kayu
  { x: 85.5, y: 65.5 }, // Bordes tangga
  { x: 82.0, y: 56.0 }, // W3 (Canopy platform)
  { x: 85.0, y: 44.0 }, // Finish flag
  { x: 92.0, y: 50.0 }, // Feedback (Pasca-Finish)
]

// SVG trail path
const trailPath = computed(() => {
  const pts = TRAIL_WAYPOINTS_3W.map(pt => ({
    x: (pt.x / 100) * SVG_W,
    y: (pt.y / 100) * SVG_H
  }))

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i]
    const next = pts[i + 1]
    const cpX = (curr.x + next.x) / 2
    const cpY = (curr.y + next.y) / 2
    d += ` Q ${cpX} ${cpY} ${next.x} ${next.y}`
  }
  return d
})

// Completed trail path
const completedTrailPath = computed(() => {
  const completedWeeks = props.weeks.filter(w => w.status === 'COMPLETED').length
  if (completedWeeks === 0 && !props.activeWeek) return ''

  // Tentukan seberapa jauh trail hijau menyala
  let targetIndex = 2 // minimal sampai week 1 jika aktif
  if (completedWeeks === 1) targetIndex = 6 // W2
  else if (completedWeeks === 2) targetIndex = 12 // W3
  else if (completedWeeks >= 3 || journeyComplete.value) targetIndex = TRAIL_WAYPOINTS_3W.length - 1

  const pts = TRAIL_WAYPOINTS_3W.slice(0, targetIndex + 1).map(pt => ({
    x: (pt.x / 100) * SVG_W,
    y: (pt.y / 100) * SVG_H
  }))

  if (pts.length < 2) return ''

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i]
    const next = pts[i + 1]
    const cpX = (curr.x + next.x) / 2
    const cpY = (curr.y + next.y) / 2
    d += ` Q ${cpX} ${cpY} ${next.x} ${next.y}`
  }
  return d
})

const buddyPosition = computed(() => ({ x: '3.5%', y: '82.5%' }))
const startPosition = computed(() => ({ x: '6.5%', y: '74.5%' }))
const finishPosition = computed(() => ({ x: '85.0%', y: '36.0%' }))
const feedbackPosition = computed(() => ({ x: '92.0%', y: '50.0%' }))

const journeyComplete = computed(() => {
  return props.weeks.length > 0 && props.weeks.every(w => w.status === 'COMPLETED')
})

// Scroll hint detection
const checkScrollHint = () => {
  if (!mapWrapper.value) return
  showScrollHint.value = mapWrapper.value.scrollWidth > mapWrapper.value.clientWidth
}

onMounted(() => {
  checkScrollHint()
  window.addEventListener('resize', checkScrollHint)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkScrollHint)
})
</script>

<style scoped>
.adventure-map-container {
  position: relative;
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.map-scroll-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 94, 60, 0.5) transparent;
  -webkit-overflow-scrolling: touch;
}

.map-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}
.map-scroll-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
.map-scroll-wrapper::-webkit-scrollbar-thumb {
  background: rgba(139, 94, 60, 0.5);
  border-radius: 3px;
}

.map-canvas {
  position: relative;
  width: 100%;
  height: 480px;
}

/* ── Week Zone Labels ────────────────────────────────────── */
.week-zones-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  z-index: 5;
  pointer-events: none;
}

.week-zone-label {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
}

.zone-pill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  letter-spacing: 0.04em;
}

.zone-completed {
  background: rgba(6, 78, 59, 0.85);
  color: #6EE7B7;
  border: 1px solid rgba(110, 231, 183, 0.4);
}
.zone-active {
  background: rgba(120, 53, 15, 0.9);
  color: #FCD34D;
  border: 1.5px solid rgba(252, 211, 77, 0.7);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
}
.zone-locked {
  background: rgba(17, 24, 39, 0.75);
  color: #9CA3AF;
  border: 1px solid rgba(156, 163, 175, 0.2);
}

.zone-week {
  font-size: 9px;
  opacity: 0.8;
}
.zone-name {
  font-size: 10px;
  font-weight: 800;
}

.zone-lock-badge {
  color: #9CA3AF;
  background: rgba(0,0,0,0.4);
  border-radius: 50%;
  padding: 2px;
}

/* ── SVG Trail ───────────────────────────────────────────── */
.trail-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

/* ── Nodes Layer ─────────────────────────────────────────── */
.nodes-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
}

.node-position {
  position: absolute;
  transform: translate(-50%, -50%);
}

.week-outpost-position {
  z-index: 15;
}

/* Character standing on active week outpost */
.character-position {
  position: absolute;
  bottom: calc(100% - 10px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  pointer-events: none;
}

.finish-char-pos {
  bottom: calc(100% + 4px);
}

/* ── Buddy Node (Pra-Start) ──────────────────────────────── */
.buddy-node-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 20;
  transition: transform 0.2s ease;
}
.buddy-node-wrap:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.buddy-node-body {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border: 2.5px solid #93c5fd;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.6), 0 4px 10px rgba(0,0,0,0.3);
  position: relative;
}

.buddy-pulse-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #60a5fa;
  animation: buddyPulse 2s ease-out infinite;
}

@keyframes buddyPulse {
  0% { opacity: 0.9; transform: scale(0.9); }
  100% { opacity: 0; transform: scale(1.4); }
}

.buddy-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 11px;
  background: #1e40af;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #93c5fd;
}

.buddy-label-pill {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(147, 197, 253, 0.5);
  border-radius: 10px;
  padding: 2px 7px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.buddy-title {
  font-size: 8px;
  font-weight: 900;
  color: #93c5fd;
  letter-spacing: 0.08em;
}
.buddy-score {
  font-size: 9px;
  font-weight: 800;
  color: #60a5fa;
}

/* ── Start Marker ────────────────────────────────────────── */
.start-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
.start-pill {
  display: flex;
  align-items: center;
  gap: 3px;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  font-size: 9px;
  font-weight: 900;
  padding: 2px 7px;
  border-radius: 8px;
  border: 1px solid #A7F3D0;
  letter-spacing: 0.08em;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
}

/* ── Finish Marker ───────────────────────────────────────── */
.finish-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 15;
}
.finish-flag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(44, 26, 8, 0.85);
  color: #FCD34D;
  font-size: 9.5px;
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 10px;
  border: 1.5px solid #FCD34D;
  letter-spacing: 0.08em;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
}
.finish-reached {
  background: linear-gradient(135deg, #D97706, #F59E0B);
  color: #1C1917;
  border-color: #FEF3C7;
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.7);
}

/* ── Feedback Node (Pasca-Finish) ────────────────────────── */
.feedback-node-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 20;
  transition: transform 0.2s ease;
}
.feedback-node-wrap:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.feedback-node-body {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #701a75 0%, #c026d3 100%);
  border: 2.5px solid #f0abfc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 16px rgba(192, 38, 211, 0.6), 0 4px 10px rgba(0,0,0,0.3);
  position: relative;
}

.feedback-pulse-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #e879f9;
  animation: feedbackPulse 2s ease-out infinite;
}

@keyframes feedbackPulse {
  0% { opacity: 0.9; transform: scale(0.9); }
  100% { opacity: 0; transform: scale(1.4); }
}

.feedback-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  font-size: 10px;
  background: #86198f;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #f0abfc;
  color: white;
}
.feedback-badge.badge-done {
  background: #10b981;
  border-color: #a7f3d0;
  font-weight: 900;
  font-size: 9px;
}

.feedback-label-pill {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(240, 171, 252, 0.5);
  border-radius: 10px;
  padding: 2px 7px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.feedback-title {
  font-size: 8px;
  font-weight: 900;
  color: #f0abfc;
  letter-spacing: 0.08em;
}
.feedback-score {
  font-size: 9px;
  font-weight: 800;
  color: #e879f9;
}

/* ── Scroll Hint for Mobile ──────────────────────────────── */
.scroll-hint {
  display: none;
}
@media (max-width: 768px) {
  .scroll-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px;
    font-size: 11px;
    font-weight: 700;
    color: #F59E0B;
    background: rgba(44, 26, 8, 0.8);
    border-top: 1px solid rgba(245, 158, 11, 0.3);
  }
}
</style>
