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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Lock, MapPin, Trophy, ChevronRight } from 'lucide-vue-next'
import { Tent, Waves, Mountain } from 'lucide-vue-next'
import AdventureBackground from './AdventureBackground.vue'
import AdventureNode from './AdventureNode.vue'
import AdventureCharacter from './AdventureCharacter.vue'
import AdventureMissionCard from './AdventureMissionCard.vue'

const props = defineProps({
  missions: { type: Array, default: () => [] },
  weeks: { type: Array, default: () => [] },
  totalWeeks: { type: Number, default: 3 },
  activeWeek: { type: Number, default: 1 }
})

const SVG_W = 1100
const SVG_H = 480

const mapWrapper = ref(null)
const selectedMission = ref(null)
const selectedMissionIndex = ref(1)
const showScrollHint = ref(false)

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

// Node positions: winding snake path from left-bottom to right-top
const nodePositions = computed(() => {
  const total = props.missions.length
  if (total === 0) return []

  const positions = []
  const totalWeeks = props.totalWeeks

  props.missions.forEach((m, idx) => {
    const weekIdx = m.week - 1
    const weeksTotal = totalWeeks

    // X: progress through the week zone
    const missionsInWeek = props.missions.filter(ms => ms.week === m.week)
    const posInWeek = missionsInWeek.findIndex(ms => ms.id === m.id)
    const totalInWeek = missionsInWeek.length

    const zoneStart = weekIdx / weeksTotal
    const zoneEnd = (weekIdx + 1) / weeksTotal
    const zoneWidth = zoneEnd - zoneStart
    const xFraction = posInWeek / Math.max(totalInWeek - 1, 1)
    const x = zoneStart + xFraction * zoneWidth * 0.85 + zoneWidth * 0.07

    // Y: zigzag pattern — alternating high/low within each week
    const baseY = 0.75 - (weekIdx / (weeksTotal - 1)) * 0.45 // Rises from 75% to 30% bottom
    const zigzag = (posInWeek % 2 === 0) ? 0.07 : -0.07
    const y = Math.max(0.12, Math.min(0.80, baseY + zigzag + (idx % 3 === 0 ? 0.05 : -0.03)))

    positions.push({
      x: `${(x * 100).toFixed(1)}%`,
      y: `${(y * 100).toFixed(1)}%`
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

    // Determine if this is the first non-completed mission (current position)
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

// SVG trail path: winding bezier from node to node
const trailPath = computed(() => {
  const positions = nodePositions.value
  if (positions.length < 2) return ''

  // Convert % to SVG coords
  const toSVG = (pos) => {
    const xPct = parseFloat(pos.x) / 100
    const yPct = parseFloat(pos.y) / 100
    return { x: xPct * SVG_W, y: yPct * SVG_H }
  }

  const pts = positions.map(toSVG)

  // Add start and finish points
  const startPt = { x: 50, y: SVG_H - 30 }
  const allPts = [startPt, ...pts, { x: SVG_W - 50, y: 30 }]

  let d = `M ${allPts[0].x} ${allPts[0].y}`
  for (let i = 0; i < allPts.length - 1; i++) {
    const curr = allPts[i]
    const next = allPts[i + 1]
    const mx = (curr.x + next.x) / 2
    const my = (curr.y + next.y) / 2 + (i % 2 === 0 ? -20 : 20)
    d += ` Q ${mx} ${my} ${next.x} ${next.y}`
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

  const startPt = { x: 50, y: SVG_H - 30 }
  const pts = [startPt, ...positions.map(toSVG)]

  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const curr = pts[i]
    const next = pts[i + 1]
    const mx = (curr.x + next.x) / 2
    const my = (curr.y + next.y) / 2 + (i % 2 === 0 ? -20 : 20)
    d += ` Q ${mx} ${my} ${next.x} ${next.y}`
  }
  return d
})

const startPosition = computed(() => ({ x: '2%', y: '82%' }))
const finishPosition = computed(() => ({ x: '92%', y: '8%' }))

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
  border-radius: 24px;
  overflow: hidden;
  box-shadow:
    0 0 0 2px rgba(139, 94, 60, 0.3),
    0 20px 60px rgba(0, 0, 0, 0.3);
}

.map-scroll-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 94, 60, 0.4) transparent;
  -webkit-overflow-scrolling: touch;
}
.map-scroll-wrapper::-webkit-scrollbar { height: 4px; }
.map-scroll-wrapper::-webkit-scrollbar-thumb { background: rgba(139,94,60,0.4); border-radius: 4px; }

.map-canvas {
  position: relative;
  height: 480px;
  border-radius: 24px;
  overflow: hidden;
}

/* Week zone labels floating at top */
.week-zones-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 5;
  pointer-events: none;
}
.week-zone-label {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.zone-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(255,255,255,0.4);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.zone-week {
  font-size: 8px;
  opacity: 0.8;
}
.zone-name { font-size: 9px; }

.zone-completed { background: rgba(6,78,59,0.85); color: #A7F3D0; }
.zone-active { background: rgba(120,53,15,0.85); color: #FDE68A; animation: zoneGlow 2s ease-in-out infinite; }
.zone-locked { background: rgba(30,30,30,0.7); color: rgba(255,255,255,0.4); }

@keyframes zoneGlow {
  0%, 100% { box-shadow: 0 0 8px rgba(251,191,36,0.4); }
  50% { box-shadow: 0 0 16px rgba(251,191,36,0.8); }
}

.zone-lock-badge {
  width: 14px;
  height: 14px;
  background: rgba(0,0,0,0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.6);
}

/* SVG trail overlay */
.trail-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  pointer-events: none;
}

/* Mission nodes */
.nodes-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
}
.node-position {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.character-position {
  position: absolute;
  bottom: calc(100% + 2px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
}

/* Start / Finish markers */
.start-marker {
  position: absolute;
  transform: translateX(-50%);
  z-index: 10;
}
.start-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(20,20,20,0.8);
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 12px;
  color: #FDE68A;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.finish-marker {
  position: absolute;
  transform: translateX(-50%);
  z-index: 10;
}
.finish-flag {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  background: rgba(20,20,20,0.85);
  border: 2px solid rgba(245,158,11,0.5);
  border-radius: 14px;
  color: #FCD34D;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.12em;
  backdrop-filter: blur(6px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  transition: all 0.3s;
}
.finish-reached {
  border-color: #F59E0B;
  box-shadow: 0 0 20px rgba(245,158,11,0.6), 0 4px 16px rgba(0,0,0,0.3);
  animation: finishGlow 2s ease-in-out infinite;
}
@keyframes finishGlow {
  0%, 100% { box-shadow: 0 0 16px rgba(245,158,11,0.5); }
  50% { box-shadow: 0 0 32px rgba(245,158,11,0.9); }
}

/* Scroll hint */
.scroll-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 10px;
  color: rgba(139,94,60,0.7);
  font-weight: 600;
}

@media (min-width: 1024px) {
  .scroll-hint { display: none; }
}
</style>
