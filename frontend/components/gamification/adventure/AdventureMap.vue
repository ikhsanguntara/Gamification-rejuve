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

        <!-- Mission nodes layer -->
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

          <!-- Mission nodes -->
          <div
            v-for="(node, idx) in missionNodes"
            :key="node.id"
            class="node-position"
            :style="{
              left: node.position.x,
              top: node.position.y,
            }"
          >
            <!-- Character at current node -->
            <div
              v-if="node.isCurrentNode"
              class="character-position"
            >
              <AdventureCharacter />
            </div>

            <!-- Mission node -->
            <AdventureNode
              :mission="node"
              :mission-index="idx + 1"
              :week-number="node.week"
              @select="onNodeSelect"
            />
          </div>

          <!-- Start marker -->
          <div class="start-marker" :style="{ left: startPosition.x, top: startPosition.y }">
            <div class="start-pill">
              <MapPin class="w-3 h-3" />
              <span>START</span>
            </div>
          </div>

          <!-- Finish marker -->
          <div class="finish-marker" :style="{ left: finishPosition.x, top: finishPosition.y }">
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

    <!-- Mission Card Popup -->
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
import { Tent, Waves, Mountain } from 'lucide-vue-next'
import { useBuddyStore } from '~/stores/buddy.js'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import AdventureBackground from './AdventureBackground.vue'
import AdventureNode from './AdventureNode.vue'
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

// Crew Buddy Evaluation Info
const currentCrewId = computed(() => userStore.currentUser?.id || 'crew-001')
const currentBatchId = computed(() => batchStore.currentBatch?.id || 'batch-alpha')

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
  { shortName: 'SUMMIT', icon: Mountain, color: 'red' },
  { shortName: 'PEAK', icon: Mountain, color: 'purple' },
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

// ── Waypoints berdasarkan titik merah PERSIS di jalan & tangga kayu gambar ──
// Titik Buddy diawali dari x: 2.0%, y: 82.5% -> Misi 1 di x: 6.5% -> dst -> Tangga Kayu Kanan -> Jembatan Canopy FINISH (x: 82.0%, y: 50.0%) -> FEEDBACK (x: 88.5%, y: 50.0%)
const TRAIL_WAYPOINTS_3W = [
  // BUDDY (Titik Pra-Start 3 Hari)
  { x: 2.0,  y: 82.5 },
  // Week 1 — BASE CAMP
  { x: 6.5,  y: 82.0 },
  { x: 12.0, y: 82.5 },
  { x: 18.5, y: 83.5 },
  { x: 25.0, y: 84.0 },
  { x: 31.0, y: 84.5 },
  // Week 2 — RIVER
  { x: 37.5, y: 84.0 },
  { x: 44.0, y: 83.0 },
  { x: 51.5, y: 81.5 }, // jembatan kayu sungai
  { x: 57.5, y: 80.0 },
  { x: 64.0, y: 77.5 },
  // Week 3 — CANOPY
  { x: 70.0, y: 74.5 },
  { x: 76.0, y: 76.5 },
  { x: 81.5, y: 75.0 }, // pangkal sebelum tangga
  { x: 84.5, y: 71.5 }, // anak tangga bawah (panah 1)
  { x: 86.5, y: 64.5 }, // anak tangga tengah / bordes kayu (panah 2)
  { x: 84.0, y: 58.0 }, // anak tangga atas menuju platform pohon (panah 3)
  // FINISH — jembatan gantung canopy pohon (panah 4)
  { x: 82.0, y: 50.0 },
]

// Waypoints untuk 4 minggu (16 misi)
const TRAIL_WAYPOINTS_4W = [
  { x: 2.0,  y: 82.5 },
  { x: 6.0,  y: 82.0 },
  { x: 10.5, y: 82.0 },
  { x: 15.5, y: 83.0 },
  { x: 20.5, y: 83.5 },
  { x: 26.0, y: 84.0 },
  { x: 31.0, y: 84.5 },
  { x: 36.5, y: 84.0 },
  { x: 42.0, y: 83.5 },
  { x: 47.5, y: 82.5 },
  { x: 53.0, y: 81.0 }, // jembatan kayu sungai
  { x: 58.5, y: 79.5 },
  { x: 64.0, y: 77.5 },
  { x: 69.5, y: 74.5 },
  { x: 75.5, y: 76.5 },
  { x: 81.0, y: 75.0 }, // pangkal sebelum tangga
  { x: 84.5, y: 71.5 }, // anak tangga bawah
  { x: 86.5, y: 64.5 }, // anak tangga tengah
  { x: 84.0, y: 58.0 }, // anak tangga atas
  { x: 82.0, y: 50.0 }, // FINISH jembatan gantung canopy
]

// Waypoints untuk 5 minggu (20 misi)
const TRAIL_WAYPOINTS_5W = [
  { x: 2.0,  y: 82.5 },
  { x: 5.5,  y: 82.0 },
  { x: 9.5,  y: 82.0 },
  { x: 13.5, y: 82.5 },
  { x: 18.0, y: 83.0 },
  { x: 22.5, y: 83.5 },
  { x: 27.0, y: 84.0 },
  { x: 31.5, y: 84.5 },
  { x: 36.0, y: 84.0 },
  { x: 40.0, y: 83.5 },
  { x: 44.5, y: 83.0 },
  { x: 49.0, y: 82.0 },
  { x: 53.0, y: 81.0 }, // jembatan sungai
  { x: 57.5, y: 80.0 },
  { x: 62.0, y: 78.5 },
  { x: 66.5, y: 76.5 },
  { x: 71.0, y: 74.5 },
  { x: 75.5, y: 76.5 },
  { x: 80.5, y: 75.0 }, // pangkal sebelum tangga
  { x: 84.5, y: 71.5 }, // anak tangga bawah kayu (panah 1)
  { x: 86.5, y: 64.5 }, // anak tangga tengah/bordes kayu (panah 2)
  { x: 84.0, y: 58.0 }, // anak tangga atas kayu (panah 3)
  { x: 82.0, y: 50.0 }, // FINISH jembatan gantung canopy (panah 4)
]

// Pilih waypoints sesuai totalWeeks, lalu distribusikan ke jumlah misi dinamis
const nodePositions = computed(() => {
  const total = props.missions.length
  if (total === 0) return []

  let baseWaypoints
  if (props.totalWeeks <= 3) baseWaypoints = TRAIL_WAYPOINTS_3W
  else if (props.totalWeeks === 4) baseWaypoints = TRAIL_WAYPOINTS_4W
  else baseWaypoints = TRAIL_WAYPOINTS_5W

  // Distribusikan posisi misi dari waypoint index 1 s/d terakhir-1
  const trackPoints = baseWaypoints.slice(1, baseWaypoints.length - 1)
  const positions = []

  props.missions.forEach((_, idx) => {
    if (trackPoints.length === 0) {
      positions.push({ x: '50%', y: '50%' })
      return
    }
    const t = total === 1 ? 0.5 : idx / (total - 1)
    const segF = t * (trackPoints.length - 1)
    const segIdx = Math.min(Math.floor(segF), trackPoints.length - 2)
    const segT = segF - segIdx
    const a = trackPoints[segIdx]
    const b = trackPoints[Math.min(segIdx + 1, trackPoints.length - 1)]
    const x = a.x + (b.x - a.x) * segT
    const y = a.y + (b.y - a.y) * segT
    positions.push({
      x: `${x.toFixed(1)}%`,
      y: `${y.toFixed(1)}%`
    })
  })

  return positions
})

// Mission nodes with computed state
const missionNodes = computed(() => {
  return props.missions.map((m, idx) => {
    const pos = nodePositions.value[idx] || { x: '50%', y: '50%' }
    const isCompleted = m.status === 'COMPLETED' || m.status === 'APPROVED'
    const isActive = m.status === 'IN_PROGRESS'
    const week = props.weeks.find(w => w.weekNumber === m.week)
    const weekLocked = week ? week.isLocked : false

    const prevMissions = props.missions.slice(0, idx)
    const allPrevCompleted = prevMissions.every(pm => pm.status === 'COMPLETED' || pm.status === 'APPROVED')
    const isCurrentNode = allPrevCompleted && !isCompleted && !weekLocked

    return {
      ...m,
      position: pos,
      isCompleted,
      isActive: isCurrentNode,
      isCurrentNode,
      weekLocked
    }
  })
})

// SVG trail path: kurva halus diawali dari titik Buddy -> Misi -> Finish -> Feedback
const trailPath = computed(() => {
  const positions = nodePositions.value
  if (positions.length < 1) return ''

  const toSVG = (pos) => {
    const xPct = parseFloat(pos.x) / 100
    const yPct = parseFloat(pos.y) / 100
    return { x: xPct * SVG_W, y: yPct * SVG_H }
  }

  const buddyPt = { x: SVG_W * 0.02, y: SVG_H * 0.825 }
  const finishPt = { x: SVG_W * 0.82, y: SVG_H * 0.50 }
  const feedbackPt = { x: SVG_W * 0.885, y: SVG_H * 0.50 }
  const allPts = [buddyPt, ...positions.map(toSVG), finishPt, feedbackPt]

  let d = `M ${allPts[0].x} ${allPts[0].y}`
  for (let i = 0; i < allPts.length - 1; i++) {
    const curr = allPts[i]
    const next = allPts[i + 1]
    const cpX = (curr.x + next.x) / 2
    const cpY = (curr.y + next.y) / 2
    d += ` Q ${cpX} ${cpY} ${next.x} ${next.y}`
  }
  return d
})

// Trail progress for completed missions
const completedTrailPath = computed(() => {
  const completedCount = props.missions.filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length
  if (completedCount === 0) return ''

  const positions = nodePositions.value.slice(0, completedCount)
  if (positions.length < 1) return ''

  const toSVG = (pos) => ({
    x: parseFloat(pos.x) / 100 * SVG_W,
    y: parseFloat(pos.y) / 100 * SVG_H
  })

  const buddyPt = { x: SVG_W * 0.02, y: SVG_H * 0.825 }
  const pts = [buddyPt, ...positions.map(toSVG)]

  // If entire journey complete, extend trail to FINISH and FEEDBACK
  if (journeyComplete.value) {
    pts.push({ x: SVG_W * 0.82, y: SVG_H * 0.50 })
    if (hasSubmittedFeedback.value) {
      pts.push({ x: SVG_W * 0.885, y: SVG_H * 0.50 })
    }
  }

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i]
    const next = pts[i + 1]
    const mx = (curr.x + next.x) / 2
    const my = (curr.y + next.y) / 2
    d += ` Q ${mx} ${my} ${next.x} ${next.y}`
  }
  return d
})

const buddyPosition = computed(() => ({ x: '2.0%', y: '82.5%' }))
const startPosition = computed(() => ({ x: '4.8%', y: '74.5%' }))
const finishPosition = computed(() => ({ x: '82.0%', y: '43.5%' }))
const feedbackPosition = computed(() => ({ x: '88.5%', y: '50.0%' }))

const journeyComplete = computed(() => {
  return props.missions.length > 0 &&
    props.missions.every(m => m.status === 'COMPLETED' || m.status === 'APPROVED')
})

// Node interaction
const onNodeSelect = (mission) => {
  const idx = props.missions.findIndex(m => m.id === mission.id)
  selectedMission.value = mission
  selectedMissionIndex.value = idx + 1
}

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

.zone-lock-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #9CA3AF;
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
  z-index: 4;
}

.node-position {
  position: absolute;
  transform: translate(-50%, -50%);
}

.character-position {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  pointer-events: none;
}

/* ── Buddy Pre-Start Node ────────────────────────────────── */
.buddy-node-wrap {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 15;
  transition: transform 0.2s ease;
}
.buddy-node-wrap:hover {
  transform: translate(-50%, -50%) scale(1.12);
  z-index: 25;
}
.buddy-node-body {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7e22ce, #9333ea, #a855f7);
  border: 3px solid #f3e8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: all 0.25s ease;
}
.buddy-node-wrap:hover .buddy-node-body {
  box-shadow: 0 0 28px rgba(192, 132, 252, 0.9), 0 6px 16px rgba(0, 0, 0, 0.4);
}
.buddy-pulse-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #c084fc;
  animation: pulseEffect 2s ease-out infinite;
  pointer-events: none;
}
.buddy-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #6b21a8;
  border: 1.5px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}
.buddy-label-pill {
  margin-top: 4px;
  background: rgba(46, 16, 101, 0.9);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(192, 132, 252, 0.6);
  border-radius: 8px;
  padding: 1px 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 800;
  color: #f3e8ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}
.buddy-title {
  color: #d8b4fe;
}
.buddy-score {
  color: #fef08a;
}

/* ── Feedback Post-Finish Node ───────────────────────────── */
.feedback-node-wrap {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  z-index: 15;
  transition: transform 0.2s ease;
}
.feedback-node-wrap:hover {
  transform: translate(-50%, -50%) scale(1.12);
  z-index: 25;
}
.feedback-node-body {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #4f46e5, #6366f1);
  border: 3px solid #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: all 0.25s ease;
}
.feedback-node-wrap:hover .feedback-node-body {
  box-shadow: 0 0 28px rgba(96, 165, 250, 0.9), 0 6px 16px rgba(0, 0, 0, 0.4);
}
.feedback-pulse-ring {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid #60a5fa;
  animation: pulseEffect 2s ease-out infinite;
  pointer-events: none;
}
.feedback-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #1d4ed8;
  border: 1.5px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}
.feedback-badge.badge-done {
  background: #059669;
  color: white;
}
.feedback-label-pill {
  margin-top: 4px;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(96, 165, 250, 0.6);
  border-radius: 8px;
  padding: 1px 6px;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 800;
  color: #eff6ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}
.feedback-title {
  color: #93c5fd;
}
.feedback-score {
  color: #fef08a;
}

@keyframes pulseEffect {
  0% { opacity: 0.8; transform: scale(0.9); }
  100% { opacity: 0; transform: scale(1.35); }
}

/* ── Start / Finish Markers ──────────────────────────────── */
.start-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.start-pill {
  display: flex;
  align-items: center;
  gap: 3px;
  background: #059669;
  color: white;
  font-size: 9px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 8px;
  border: 1.5px solid #34D399;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.5);
  letter-spacing: 0.05em;
}

.finish-marker {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: none;
}

.finish-flag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #B45309;
  color: #FDF3DC;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 10px;
  border: 2px solid #FCD34D;
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  letter-spacing: 0.06em;
}

.finish-reached {
  background: #D97706;
  animation: finishCelebrate 1.5s ease-in-out infinite;
}

@keyframes finishCelebrate {
  0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(245, 158, 11, 0.5); }
  50% { transform: scale(1.1); box-shadow: 0 0 24px rgba(245, 158, 11, 0.9); }
}

/* ── Mobile Scroll Hint ──────────────────────────────────── */
.scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(15, 10, 5, 0.85);
  color: #D4AC5A;
  font-size: 11px;
  font-weight: 600;
  border-top: 1px solid rgba(212, 172, 90, 0.2);
}
</style>
