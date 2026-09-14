<template>
  <div class="adventure-journey-root select-none">

    <!-- ============================================================
         HERO HEADER: User progress banner
    ============================================================ -->
    <div class="journey-hero">
      <!-- Left: User info -->
      <div class="hero-user">
        <div class="hero-avatar-wrap">
          <img
            :src="userStore.currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Crew'"
            :alt="userStore.currentUser?.name || 'Crew Avatar'"
            class="hero-avatar"
          />
          <span class="hero-level-badge">LVL {{ myProgress.currentLevel }}</span>
        </div>

        <div class="hero-info">
          <div class="hero-badge-row">
            <span class="hero-badge-expedition">
              <MapPin class="w-3 h-3" />
              <span>MISI AKTIF</span>
            </span>
            <span class="hero-batch-name">{{ currentBatch?.name || 'Re.juve Expedition' }}</span>
          </div>
          <h3 class="hero-name">{{ userStore.currentUser?.name || 'Crew Specialist' }}</h3>
          <p class="hero-subtitle">
            Selesaikan {{ totalMissions }} misi untuk meraih predikat <strong>Star Legend</strong>!
          </p>
        </div>
      </div>

      <!-- Right: Stats grid -->
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-label">Bintang</span>
          <span class="stat-value stat-gold">
            <span class="star-icon">★</span>
            {{ myTotalStars.toLocaleString() }}
          </span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">Peringkat</span>
          <span class="stat-value stat-emerald">#{{ myRank }}</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-label">Selesai</span>
          <span class="stat-value stat-amber">{{ completedCount }}/{{ totalMissions }}</span>
        </div>
      </div>

      <!-- Odyssey progress bar -->
      <div class="hero-progress-section">
        <div class="hero-progress-label">
          <span>Progres Ekspedisi</span>
          <span class="hero-progress-pct">{{ odysseyPercent }}% Selesai</span>
        </div>
        <div class="hero-progress-track">
          <div
            class="hero-progress-fill"
            :style="{ width: odysseyPercent + '%' }"
          ></div>
          <!-- Week milestone markers -->
          <div
            v-for="week in currentBatchWeeks"
            :key="week.weekNumber"
            class="progress-milestone"
            :style="{ left: `${(week.weekNumber / totalWeeks) * 100}%` }"
            :class="{
              'milestone-done': week.status === 'COMPLETED',
              'milestone-active': week.status === 'ACTIVE'
            }"
          >
            <span class="milestone-label">W{{ week.weekNumber }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================
         WEEK TABS — quick navigation
    ============================================================ -->
    <div class="week-tabs">
      <button
        v-for="week in currentBatchWeeks"
        :key="week.weekNumber"
        type="button"
        class="week-tab"
        :class="{
          'tab-completed': week.status === 'COMPLETED',
          'tab-active': week.status === 'ACTIVE',
          'tab-locked': week.isLocked,
          'tab-selected': selectedWeekFilter === week.weekNumber
        }"
        @click="selectWeekFilter(week.weekNumber)"
      >
        <component :is="weekTabIcon(week.weekNumber)" class="w-3.5 h-3.5" />
        <span class="tab-num">WEEK {{ week.weekNumber }}</span>
        <span class="tab-name">{{ weekThemeName(week.weekNumber) }}</span>
        <Lock v-if="week.isLocked" class="w-2.5 h-2.5 opacity-60 ml-auto" />
        <CheckCircle2 v-else-if="week.status === 'COMPLETED'" class="w-2.5 h-2.5 text-emerald-400 ml-auto" />
      </button>
    </div>

    <!-- ============================================================
         MAIN ADVENTURE MAP
    ============================================================ -->
    <AdventureMap
      :missions="missionNodes"
      :weeks="currentBatchWeeks"
      :total-weeks="totalWeeks"
      :active-week="activeWeek"
    />

    <!-- ============================================================
         ADVENTURE LEADERBOARD SECTION
    ============================================================ -->
    <AdventureLeaderboard
      :batch-id="currentBatch?.id || currentBatch?.batchId"
      :batch-name="currentBatch?.name"
    />

    <!-- Journey complete banner -->
    <div v-if="journeyComplete" class="journey-complete-banner">
      <div class="complete-stars">
        <span v-for="i in 5" :key="i" class="complete-star">★</span>
      </div>
      <Trophy class="w-8 h-8 text-amber-400" />
      <div class="complete-text">
        <h3>Ekspedisi Selesai!</h3>
        <p>Selamat! Kamu telah menyelesaikan seluruh {{ totalMissions }} misi.</p>
        <p class="complete-stars-count">Total: ★ {{ myTotalStars.toLocaleString() }} Bintang</p>
      </div>
    </div>

    <!-- Adventure Week Modal (Triggered by button / tab) -->
    <AdventureWeekModal
      v-model="isWeekModalOpen"
      :week="selectedModalWeek"
      :missions="selectedModalWeekMissions"
      :all-weeks="currentBatchWeeks"
      :batch-name="currentBatch?.name"
      @select-week="openWeekModal"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { getStarProgress } from '~/utils/star.js'
import AdventureMap from '~/components/gamification/adventure/AdventureMap.vue'
import AdventureWeekModal from '~/components/gamification/adventure/AdventureWeekModal.vue'
import AdventureLeaderboard from '~/components/gamification/adventure/AdventureLeaderboard.vue'
import {
  MapPin, Lock, CheckCircle2, ChevronRight, Clock,
  AlertTriangle, Trophy, Tent, Waves, Mountain, Compass
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()

const selectedWeekFilter = ref(null)
const collapsedWeeks = ref({})
const isWeekModalOpen = ref(false)
const modalWeekNumber = ref(1)

const openWeekModal = (weekNum) => {
  modalWeekNumber.value = weekNum
  isWeekModalOpen.value = true
}

const selectedModalWeek = computed(() => {
  return currentBatchWeeks.value.find(w => w.weekNumber === modalWeekNumber.value) || currentBatchWeeks.value[0] || null
})

const selectedModalWeekMissions = computed(() => {
  if (!selectedModalWeek.value) return []
  return activeBatchMissions.value.filter(m => m.week === selectedModalWeek.value.weekNumber)
})

// ── Stores data ──────────────────────────────────────────────────────────────

const currentBatch = computed(() => batchStore.currentBatch || batchStore.batches[0])
const currentBatchWeeks = computed(() => batchStore.currentBatchWeeks)
const totalWeeks = computed(() => currentBatch.value?.totalWeeks || 3)
const activeWeek = computed(() => batchStore.activeWeekNumber)

const myCrewData = computed(() => {
  if (userStore.isCrew) {
    return (userStore.currentUser?.id ? gamificationStore.crewById(userStore.currentUser.id) : null) || userStore.currentUser
  }
  return gamificationStore.allCrews[0]
})

const myTotalStars = computed(() => myCrewData.value?.stars || userStore.currentUser?.stars || 0)
const myProgress = computed(() => getStarProgress(myTotalStars.value))

const storeCrews = computed(() => gamificationStore.crewsByBatch(batchStore.selectedBatchId))
const myRank = computed(() => {
  const sorted = [...storeCrews.value].sort((a, b) => b.stars - a.stars)
  const idx = sorted.findIndex(c => (c.crewId || c.id) === userStore.currentUser?.id)
  return idx !== -1 ? idx + 1 : 1
})

const activeBatchMissions = computed(() => {
  const batchId = userStore.isCrew ? userStore.currentUser?.batchId : batchStore.selectedBatchId
  const list = missionStore.missionsByBatch(batchId) || []
  if (userStore.isCrew && userStore.currentUser?.id) {
    const currentCrewId = userStore.currentUser.id
    return list.filter(m => {
      const isAssigned = (m.assignedCrewIds && m.assignedCrewIds.includes(currentCrewId)) ||
        (m.crewEvaluations && m.crewEvaluations.some(ce => ce.crewId === currentCrewId))
      return isAssigned
    })
  }
  return list
})

const totalMissions = computed(() => activeBatchMissions.value.length || 12)

const completedCount = computed(() =>
  activeBatchMissions.value.filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length
)

const odysseyPercent = computed(() =>
  totalMissions.value > 0 ? Math.round((completedCount.value / totalMissions.value) * 100) : 0
)

const journeyComplete = computed(() =>
  totalMissions.value > 0 && completedCount.value >= totalMissions.value
)

// ── Mission nodes for map ────────────────────────────────────────────────────

const missionNodes = computed(() => activeBatchMissions.value)

// ── Filtered weeks ───────────────────────────────────────────────────────────

const filteredWeeks = computed(() => {
  if (selectedWeekFilter.value === null) {
    return currentBatchWeeks.value
  }
  return currentBatchWeeks.value.filter(w => w.weekNumber === selectedWeekFilter.value)
})

const selectWeekFilter = (weekNum) => {
  if (selectedWeekFilter.value === weekNum) {
    selectedWeekFilter.value = null
  } else {
    selectedWeekFilter.value = weekNum
    // Pastikan week yang dipilih tidak collapsed
    collapsedWeeks.value[weekNum] = false
  }
}

const isCollapsed = (weekNum) => {
  if (collapsedWeeks.value[weekNum] !== undefined) {
    return collapsedWeeks.value[weekNum]
  }
  // Default: week yang locked ter-collapse jika melihat semua week
  const week = currentBatchWeeks.value.find(w => w.weekNumber === weekNum)
  return week ? week.isLocked : false
}

const toggleWeekCollapse = (weekNum) => {
  collapsedWeeks.value[weekNum] = !isCollapsed(weekNum)
}

// ── Week helpers ─────────────────────────────────────────────────────────────

const WEEK_THEMES = ['BASE CAMP', 'RIVER CROSSING', 'RAINFOREST CANOPY', 'CRYSTAL FALLS', 'THE SUMMIT']
const WEEK_ICONS = [Tent, Waves, Mountain, Compass, Mountain]

const weekThemeName = (weekNum) => WEEK_THEMES[Math.min(weekNum - 1, WEEK_THEMES.length - 1)]
const weekTabIcon = (weekNum) => WEEK_ICONS[Math.min(weekNum - 1, WEEK_ICONS.length - 1)]

const weekStatusLabel = (week) => {
  if (week.status === 'COMPLETED') return 'Selesai ✓'
  if (week.status === 'ACTIVE') return 'Aktif'
  return 'Terkunci'
}

const weekStatusBadgeClass = (week) => {
  if (week.status === 'COMPLETED') return 'badge-completed'
  if (week.status === 'ACTIVE') return 'badge-active'
  return 'badge-locked'
}

// ── Mission list helpers ──────────────────────────────────────────────────────

const weekMissions = (weekNum) => activeBatchMissions.value.filter(m => m.week === weekNum)

const globalMissionIndex = (mission) => {
  return activeBatchMissions.value.findIndex(m => m.id === mission.id) + 1
}

const isMissionDone = (m) => m.status === 'COMPLETED' || m.status === 'APPROVED'

const isCurrentMission = (mission) => {
  const idx = activeBatchMissions.value.findIndex(m => m.id === mission.id)
  const prevAll = activeBatchMissions.value.slice(0, idx).every(m => isMissionDone(m))
  const isNotDone = !isMissionDone(mission) && mission.status !== 'LOCKED'
  return prevAll && isNotDone
}

const missionItemClass = (m) => ({
  'item-completed': isMissionDone(m),
  'item-current': isCurrentMission(m),
  'item-pending': m.status === 'PENDING_REVIEW',
  'item-revision': m.status === 'REVISION_REQUIRED',
  'item-locked': m.status === 'LOCKED',
})

const missionIconClass = (m) => ({
  'icon-completed': isMissionDone(m),
  'icon-current': isCurrentMission(m),
  'icon-pending': m.status === 'PENDING_REVIEW',
  'icon-revision': m.status === 'REVISION_REQUIRED',
  'icon-locked': m.status === 'LOCKED',
})

const onMissionListClick = (mission) => {
  if (mission.status === 'LOCKED') return
  router.push(`/missions/${mission.id}`)
}
</script>

<style scoped>
/* ── Root ── */
.adventure-journey-root {
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-family: inherit;
}

/* ── Hero Header ── */
.journey-hero {
  background: linear-gradient(135deg, #2C1A08 0%, #5C3D1E 40%, #8B5E3C 70%, #A0791A 100%);
  border-radius: 20px;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px 20px;
  align-items: center;
  box-shadow: 0 8px 32px rgba(44, 26, 8, 0.4), 0 0 20px rgba(245, 158, 11, 0.15);
  border: 1.5px solid rgba(252, 211, 77, 0.25);
  position: relative;
  overflow: hidden;
}

.journey-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: -120%;
  width: 70%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
  transform: skewX(-20deg);
  animation: heroShimmer 7s infinite ease-in-out;
  pointer-events: none;
}

@keyframes heroShimmer {
  0% { left: -120%; }
  35%, 100% { left: 160%; }
}
@media (max-width: 640px) {
  .journey-hero {
    grid-template-columns: 1fr;
    padding: 14px 16px;
  }
}

.hero-user { display: flex; align-items: center; gap: 12px; }
.hero-avatar-wrap { position: relative; flex-shrink: 0; }
.hero-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #FCD34D;
  box-shadow: 0 0 12px rgba(252, 211, 77, 0.4);
}
.hero-level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: #D97706;
  color: white;
  font-size: 8px;
  font-weight: 900;
  padding: 1px 4px;
  border-radius: 6px;
  border: 1px solid #FCD34D;
}

.hero-info { min-width: 0; }
.hero-badge-row { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.hero-badge-expedition {
  display: flex;
  align-items: center;
  gap: 3px;
  background: rgba(245, 158, 11, 0.25);
  border: 1px solid rgba(245, 158, 11, 0.5);
  color: #FDE68A;
  font-size: 8px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 6px;
  letter-spacing: 0.08em;
}
.hero-batch-name { font-size: 10px; color: rgba(255,255,255,0.7); font-weight: 600; }
.hero-name { font-size: 16px; font-weight: 800; color: white; margin: 0 0 1px; line-height: 1.2; }
.hero-subtitle { font-size: 11px; color: rgba(255,255,255,0.8); margin: 0; }
.hero-subtitle strong { color: #FCD34D; }

/* Hero Stats */
.hero-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(0,0,0,0.25);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 8px 14px;
}
.stat-item { display: flex; flex-direction: column; align-items: center; }
.stat-label { font-size: 8px; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.6); letter-spacing: 0.08em; }
.stat-value { font-size: 14px; font-weight: 900; line-height: 1.2; display: flex; align-items: center; gap: 2px; }
.stat-gold { color: #FCD34D; }
.stat-emerald { color: #6EE7B7; }
.stat-amber { color: #FDBA74; }
.star-icon { font-size: 11px; }
.stat-divider { width: 1px; height: 24px; background: rgba(255,255,255,0.15); }

/* Progress Section */
.hero-progress-section { grid-column: 1 / -1; }
.hero-progress-label { display: flex; justify-content: space-between; font-size: 10px; color: rgba(255,255,255,0.8); font-weight: 600; margin-bottom: 4px; }
.hero-progress-pct { color: #FCD34D; font-weight: 800; }
.hero-progress-track {
  height: 6px;
  background: rgba(0,0,0,0.3);
  border-radius: 6px;
  overflow: visible;
  position: relative;
  border: 1px solid rgba(255,255,255,0.1);
}
.hero-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #F59E0B, #FCD34D);
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(245, 158, 11, 0.6);
  transition: width 0.8s ease;
}
.progress-milestone {
  position: absolute;
  top: -3px;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(44, 26, 8, 0.9);
  border: 2px solid rgba(255,255,255,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.milestone-done { background: #10B981; border-color: #A7F3D0; }
.milestone-active { background: #F59E0B; border-color: #FDE68A; }
.milestone-label { display: none; }

/* ── Week Tabs ── */
.week-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 8px;
}
.week-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1.5px solid;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tab-completed {
  background: linear-gradient(135deg, #064E3B, #065F46);
  color: #A7F3D0;
  border-color: #10B981;
}
.tab-active {
  background: linear-gradient(135deg, #78350F, #92400E);
  color: #FDE68A;
  border-color: #F59E0B;
  box-shadow: 0 0 16px rgba(245,158,11,0.3);
}
.tab-locked {
  background: rgba(30,30,30,0.08);
  color: rgba(100,100,100,0.7);
  border-color: rgba(150,150,150,0.2);
  cursor: default;
}
.tab-selected {
  outline: 2px solid #F59E0B;
  outline-offset: 2px;
}
.tab-num { font-size: 8px; opacity: 0.75; }
.tab-name { font-size: 10px; }

/* ── Compact Week Details & Cards ── */
.week-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compact-week-card {
  border-radius: 16px;
  border: 1.5px solid;
  overflow: hidden;
  transition: all 0.25s ease;
  background: white;
}
.dark .compact-week-card {
  background: #0f172a;
}

.card-completed {
  border-color: #10B981;
}
.card-active {
  border-color: #F59E0B;
  box-shadow: 0 4px 20px rgba(245,158,11,0.12);
}
.card-locked {
  border-color: rgba(200,200,200,0.4);
  opacity: 0.75;
}
.dark .card-locked {
  border-color: rgba(75,85,99,0.4);
}

.compact-week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(248, 250, 252, 0.8);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.dark .compact-week-header {
  background: rgba(30, 41, 59, 0.6);
  border-bottom-color: rgba(255,255,255,0.05);
}

.compact-week-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C19A6B, #8B6914);
  color: white;
  flex-shrink: 0;
}
.card-completed .compact-week-icon { background: linear-gradient(135deg, #059669, #10B981); }
.card-active .compact-week-icon { background: linear-gradient(135deg, #D97706, #F59E0B); }
.card-locked .compact-week-icon { background: linear-gradient(135deg, #6B7280, #9CA3AF); }

.compact-status-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  white-space: nowrap;
}
.badge-completed { background: #D1FAE5; color: #065F46; }
.badge-active { background: #FEF3C7; color: #92400E; }
.badge-locked { background: #F3F4F6; color: #9CA3AF; }

/* ── 2-Column Compact Grid for Missions ── */
.compact-missions-grid {
  padding: 10px 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 768px) {
  .compact-missions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.compact-mission-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8fafc;
}
.dark .compact-mission-item {
  border-color: #1e293b;
  background: #0b1120;
}
.compact-mission-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.item-completed { border-color: #A7F3D0; background: #F0FDF4; }
.dark .item-completed { border-color: #065F46; background: rgba(6,78,59,0.2); }

.item-current { border-color: #FCD34D; background: #FFFBEB; box-shadow: 0 0 0 1.5px rgba(251,191,36,0.3); }
.dark .item-current { border-color: #B45309; background: rgba(120,53,15,0.25); }

.item-pending { border-color: #BFDBFE; background: #EFF6FF; }
.dark .item-pending { border-color: #1E40AF; background: rgba(30,64,175,0.2); }

.item-revision { border-color: #FDE68A; background: #FFFBEB; }
.dark .item-revision { border-color: #B45309; background: rgba(180,83,9,0.2); }

.item-locked { border-color: #E5E7EB; opacity: 0.6; cursor: default; }
.dark .item-locked { border-color: #374151; }

.compact-mission-icon {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid;
}
.icon-completed { background: #059669; border-color: #34D399; color: white; }
.icon-current { background: #F59E0B; border-color: #FCD34D; color: #1C1917; }
.icon-pending { background: #3B82F6; border-color: #93C5FD; color: white; }
.icon-revision { background: #EF4444; border-color: #FCA5A5; color: white; }
.icon-locked { background: #E2E8F0; border-color: #CBD5E1; color: #94A3B8; }

/* ── Journey Complete Banner ── */
.journey-complete-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  background: linear-gradient(135deg, #78350F, #B45309, #D97706);
  border-radius: 18px;
  text-align: center;
  color: white;
  border: 2px solid rgba(253,211,77,0.4);
  box-shadow: 0 0 30px rgba(217,119,6,0.3);
}
.complete-stars { display: flex; gap: 4px; }
.complete-star { font-size: 20px; color: #FCD34D; text-shadow: 0 0 10px rgba(252,211,77,0.8); }
.complete-text h3 { font-size: 18px; font-weight: 900; margin: 0 0 2px; }
.complete-text p { font-size: 11px; color: rgba(255,255,255,0.8); margin: 0; }
.complete-stars-count { font-size: 13px; color: #FCD34D; font-weight: 800; margin-top: 3px !important; }
</style>
