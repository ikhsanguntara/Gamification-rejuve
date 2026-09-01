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
            :src="userStore.currentUser.avatar"
            :alt="userStore.currentUser.name"
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
            <span class="hero-batch-name">{{ currentBatch.name }}</span>
          </div>
          <h3 class="hero-name">{{ userStore.currentUser.name }}</h3>
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
            v-for="(week, idx) in currentBatchWeeks"
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
        }"
        @click="selectedWeekHighlight = week.weekNumber"
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
         WEEK DETAIL CARDS — mission list below map
    ============================================================ -->
    <div class="week-details">
      <div
        v-for="week in currentBatchWeeks"
        :key="week.weekNumber"
        class="week-detail-card"
        :class="{
          'week-card-completed': week.status === 'COMPLETED',
          'week-card-active': week.status === 'ACTIVE',
          'week-card-locked': week.isLocked,
        }"
      >
        <!-- Week header -->
        <div class="week-card-header">
          <div class="week-card-icon-wrap">
            <component :is="weekTabIcon(week.weekNumber)" class="w-5 h-5" />
          </div>
          <div class="week-card-title-group">
            <span class="week-card-num">WEEK {{ week.weekNumber }}</span>
            <h4 class="week-card-name">{{ weekThemeName(week.weekNumber) }}</h4>
            <p class="week-card-subtitle">{{ week.title }}</p>
          </div>
          <div class="week-card-status-badge" :class="weekStatusBadgeClass(week)">
            {{ weekStatusLabel(week) }}
          </div>
        </div>

        <!-- Progress bar -->
        <div class="week-mission-progress">
          <div class="week-progress-track">
            <div
              class="week-progress-fill"
              :style="{ width: (week.completionRate || 0) + '%' }"
              :class="{
                'fill-completed': week.status === 'COMPLETED',
                'fill-active': week.status === 'ACTIVE',
                'fill-locked': week.isLocked,
              }"
            ></div>
          </div>
          <span class="week-progress-label">
            {{ week.completedMissions || 0 }}/{{ week.totalMissions || 4 }} Misi
          </span>
        </div>

        <!-- Locked overlay -->
        <div v-if="week.isLocked" class="week-locked-message">
          <Lock class="w-4 h-4" />
          <span>Selesaikan Week {{ week.weekNumber - 1 }} terlebih dahulu untuk membuka tahap ini.</span>
        </div>

        <!-- Mission list -->
        <div v-else class="week-missions-list">
          <div
            v-for="(m, idx) in weekMissions(week.weekNumber)"
            :key="m.id"
            class="mission-list-item"
            :class="missionItemClass(m)"
            @click="onMissionListClick(m, idx)"
          >
            <!-- Mission status icon -->
            <div class="mission-item-icon" :class="missionIconClass(m)">
              <CheckCircle2 v-if="isMissionDone(m)" class="w-4 h-4" />
              <Clock v-else-if="m.status === 'PENDING_REVIEW'" class="w-4 h-4" />
              <AlertTriangle v-else-if="m.status === 'REVISION_REQUIRED'" class="w-4 h-4" />
              <span v-else class="mission-num-text">{{ globalMissionIndex(m) }}</span>
            </div>

            <!-- Mission info -->
            <div class="mission-item-body">
              <div class="mission-item-top">
                <span class="mission-item-code">{{ m.code }}</span>
                <span class="mission-item-cat">{{ m.category }}</span>
                <span v-if="isCurrentMission(m)" class="mission-item-here">
                  <MapPin class="w-2.5 h-2.5" /> POS ANDA
                </span>
              </div>
              <h5 class="mission-item-title">{{ m.title }}</h5>
            </div>

            <!-- Stars & action -->
            <div class="mission-item-right">
              <div class="mission-stars">
                <span v-for="i in 5" :key="i" class="mstar" :class="{ 'mstar-on': i <= (m.awardedStars || 0) }">★</span>
              </div>
              <ChevronRight class="w-4 h-4 opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </div>

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

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { getStarProgress } from '~/utils/star.js'
import AdventureMap from '~/components/gamification/adventure/AdventureMap.vue'
import {
  MapPin, Lock, CheckCircle2, ChevronRight, Clock,
  AlertTriangle, Trophy, Tent, Waves, Mountain, Compass
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()

const selectedWeekHighlight = ref(null)

// ── Stores data ──────────────────────────────────────────────────────────────

const currentBatch = computed(() => batchStore.currentBatch || batchStore.batches[0])
const currentBatchWeeks = computed(() => batchStore.currentBatchWeeks)
const totalWeeks = computed(() => currentBatch.value?.totalWeeks || 3)
const activeWeek = computed(() => batchStore.activeWeekNumber)

const myCrewData = computed(() => {
  if (userStore.isCrew) {
    return gamificationStore.crewById(userStore.currentUser.id) || userStore.currentUser
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
  return missionStore.missionsByBatch(batchId)
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

const onMissionListClick = (mission, localIdx) => {
  const globalIdx = globalMissionIndex(mission)
  if (mission.status === 'LOCKED') return
  // Navigate to mission detail
  navigateTo(`/missions/${mission.id}`)
}

const navigateTo = (path) => {
  window.location.href = path
}
</script>

<style scoped>
/* ── Root ── */
.adventure-journey-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: inherit;
}

/* ── Hero Header ── */
.journey-hero {
  background: linear-gradient(135deg, #2C1A08 0%, #5C3D1E 40%, #8B5E3C 70%, #A0791A 100%);
  border-radius: 20px;
  padding: 20px 24px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow:
    0 0 0 1px rgba(212,172,90,0.2),
    0 12px 40px rgba(0,0,0,0.3);
  position: relative;
  overflow: hidden;
}
.journey-hero::before {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.hero-user {
  display: flex;
  align-items: center;
  gap: 14px;
}
.hero-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}
.hero-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  object-fit: cover;
  border: 2px solid rgba(245,158,11,0.7);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.hero-level-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  padding: 1px 6px;
  background: #F59E0B;
  color: #1C1917;
  font-size: 8px;
  font-weight: 900;
  border-radius: 8px;
  border: 1.5px solid white;
}
.hero-info { min-width: 0; }
.hero-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 3px;
}
.hero-badge-expedition {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  background: rgba(245,158,11,0.25);
  border: 1px solid rgba(245,158,11,0.4);
  border-radius: 10px;
  font-size: 8px;
  font-weight: 900;
  color: #FCD34D;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hero-batch-name {
  font-size: 10px;
  color: rgba(253,211,77,0.7);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hero-name {
  font-size: 18px;
  font-weight: 800;
  color: white;
  margin: 0;
  line-height: 1.2;
}
.hero-subtitle {
  font-size: 11px;
  color: rgba(255,255,255,0.6);
  margin: 2px 0 0;
}
.hero-subtitle strong { color: #FCD34D; }

/* Stats */
.hero-stats {
  display: flex;
  align-items: center;
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 10px 6px;
  backdrop-filter: blur(8px);
  gap: 4px;
  width: 100%;
}
@media (min-width: 768px) {
  .hero-stats { width: auto; flex-shrink: 0; }
  .adventure-journey-root .journey-hero { flex-direction: row; flex-wrap: wrap; }
  .hero-user { flex: 1; min-width: 0; }
}
.stat-item { text-align: center; padding: 0 12px; flex: 1; }
.stat-label {
  display: block;
  font-size: 8px;
  color: rgba(255,255,255,0.55);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 2px;
}
.stat-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 15px;
  font-weight: 900;
}
.stat-gold { color: #FCD34D; }
.stat-emerald { color: #6EE7B7; }
.stat-amber { color: #FCA5A5; }
.star-icon { font-size: 14px; }
.stat-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.15); flex-shrink: 0; }

/* Progress bar */
.hero-progress-section { width: 100%; }
.hero-progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(255,255,255,0.7);
  font-weight: 600;
  margin-bottom: 6px;
}
.hero-progress-pct { color: #FCD34D; font-weight: 800; }
.hero-progress-track {
  position: relative;
  width: 100%;
  height: 10px;
  background: rgba(0,0,0,0.4);
  border-radius: 10px;
  overflow: visible;
  border: 1px solid rgba(255,255,255,0.1);
}
.hero-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #34D399, #6EE7B7);
  border-radius: 10px;
  transition: width 0.8s ease;
  position: relative;
}
.hero-progress-fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(50%, -50%);
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  border: 3px solid #10B981;
  box-shadow: 0 0 8px rgba(16,185,129,0.5);
}
.progress-milestone {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.milestone-label {
  position: absolute;
  top: -18px;
  font-size: 7px;
  color: rgba(255,255,255,0.5);
  font-weight: 800;
  white-space: nowrap;
}
.progress-milestone::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  border: 1.5px solid rgba(255,255,255,0.4);
}
.milestone-done::before { background: #10B981; border-color: #34D399; }
.milestone-active::before { background: #F59E0B; border-color: #FCD34D; box-shadow: 0 0 8px rgba(245,158,11,0.6); }

/* ── Week Tabs ── */
.week-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.week-tabs::-webkit-scrollbar { display: none; }
.week-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 14px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  border: 2px solid transparent;
  transition: all 0.2s;
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
  animation: tabGlow 2s ease-in-out infinite;
}
.tab-locked {
  background: rgba(30,30,30,0.08);
  color: rgba(100,100,100,0.7);
  border-color: rgba(150,150,150,0.2);
  cursor: default;
}
.tab-num { font-size: 8px; opacity: 0.75; }
.tab-name { font-size: 10px; }

@keyframes tabGlow {
  0%, 100% { box-shadow: 0 0 12px rgba(245,158,11,0.3); }
  50% { box-shadow: 0 0 24px rgba(245,158,11,0.6); }
}

/* ── Week Detail Cards ── */
.week-details { display: flex; flex-direction: column; gap: 12px; }

.week-detail-card {
  border-radius: 18px;
  border: 2px solid;
  overflow: hidden;
  transition: all 0.3s;
}
.week-card-completed {
  border-color: #10B981;
  background: linear-gradient(135deg, rgba(6,78,59,0.04), rgba(209,250,229,0.5));
}
.week-card-active {
  border-color: #F59E0B;
  background: linear-gradient(135deg, rgba(255,251,235,0.9), rgba(255,243,220,1));
  box-shadow: 0 0 0 1px rgba(245,158,11,0.15), 0 8px 30px rgba(245,158,11,0.1);
}
.week-card-locked {
  border-color: rgba(200,200,200,0.4);
  background: rgba(245,245,245,0.5);
  opacity: 0.75;
}

.week-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.week-card-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #C19A6B, #8B6914);
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.week-card-completed .week-card-icon-wrap { background: linear-gradient(135deg, #059669, #10B981); }
.week-card-active .week-card-icon-wrap { background: linear-gradient(135deg, #D97706, #F59E0B); }
.week-card-locked .week-card-icon-wrap { background: linear-gradient(135deg, #6B7280, #9CA3AF); }

.week-card-title-group { flex: 1; min-width: 0; }
.week-card-num {
  display: block;
  font-size: 8px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #8B6914;
  margin-bottom: 2px;
}
.week-card-completed .week-card-num { color: #059669; }
.week-card-active .week-card-num { color: #D97706; }
.week-card-name { font-size: 15px; font-weight: 800; color: #2C1A08; margin: 0 0 1px; line-height: 1.2; }
.week-card-subtitle { font-size: 10px; color: #8B6914; opacity: 0.8; margin: 0; }

.week-card-status-badge {
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  flex-shrink: 0;
}
.badge-completed { background: #D1FAE5; color: #065F46; }
.badge-active { background: #FEF3C7; color: #92400E; }
.badge-locked { background: #F3F4F6; color: #9CA3AF; }

/* Week progress */
.week-mission-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
}
.week-progress-track {
  flex: 1;
  height: 6px;
  background: rgba(0,0,0,0.08);
  border-radius: 6px;
  overflow: hidden;
}
.week-progress-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s ease;
}
.fill-completed { background: linear-gradient(90deg, #059669, #34D399); }
.fill-active { background: linear-gradient(90deg, #D97706, #F59E0B); }
.fill-locked { background: #D1D5DB; }
.week-progress-label { font-size: 10px; font-weight: 700; color: #6B7280; white-space: nowrap; }

/* Locked message */
.week-locked-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 11px;
  color: #9CA3AF;
  font-style: italic;
}

/* Mission list */
.week-missions-list { padding: 4px 12px 12px; display: flex; flex-direction: column; gap: 6px; }

.mission-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1.5px solid;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}
.mission-list-item:hover { transform: translateX(4px); }

.item-completed { border-color: #A7F3D0; background: #F0FDF4; }
.item-current { border-color: #FCD34D; background: #FFFBEB; box-shadow: 0 0 0 2px rgba(251,191,36,0.2); }
.item-pending { border-color: #BFDBFE; background: #EFF6FF; }
.item-revision { border-color: #FDE68A; background: #FFFBEB; }
.item-locked { border-color: #E5E7EB; background: #F9FAFB; opacity: 0.6; cursor: default; }

.mission-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  flex-shrink: 0;
  border: 2px solid;
}
.icon-completed { background: #059669; border-color: #34D399; color: white; }
.icon-current { background: #F59E0B; border-color: #FCD34D; color: #1C1917; animation: iconPulse 2s ease-in-out infinite; }
.icon-pending { background: #3B82F6; border-color: #93C5FD; color: white; }
.icon-revision { background: #EF4444; border-color: #FCA5A5; color: white; }
.icon-locked { background: #F3F4F6; border-color: #E5E7EB; color: #9CA3AF; }
.mission-num-text { color: #8B5E3C; }

@keyframes iconPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(245,158,11,0); }
}

.mission-item-body { flex: 1; min-width: 0; }
.mission-item-top { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; margin-bottom: 2px; }
.mission-item-code { font-size: 8px; font-weight: 800; color: #8B6914; letter-spacing: 0.1em; }
.mission-item-cat {
  font-size: 8px;
  font-weight: 700;
  padding: 1px 6px;
  background: rgba(139,94,60,0.1);
  border-radius: 5px;
  color: #5C3D1E;
}
.mission-item-here {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 7px;
  font-weight: 900;
  color: white;
  background: #D97706;
  padding: 1px 6px;
  border-radius: 8px;
  letter-spacing: 0.05em;
}
.mission-item-title { font-size: 12px; font-weight: 700; color: #2C1A08; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.mission-item-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.mission-stars { display: flex; gap: 1px; }
.mstar { font-size: 11px; color: #D1B06B; line-height: 1; }
.mstar-on { color: #F59E0B; text-shadow: 0 0 6px rgba(245,158,11,0.7); }

/* ── Journey Complete Banner ── */
.journey-complete-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 24px;
  background: linear-gradient(135deg, #78350F, #B45309, #D97706);
  border-radius: 20px;
  text-align: center;
  color: white;
  border: 2px solid rgba(253,211,77,0.4);
  box-shadow: 0 0 40px rgba(217,119,6,0.3);
}
.complete-stars { display: flex; gap: 4px; }
.complete-star { font-size: 24px; color: #FCD34D; text-shadow: 0 0 12px rgba(252,211,77,0.8); animation: starFloat 1.5s ease-in-out infinite; }
.complete-star:nth-child(2) { animation-delay: 0.2s; }
.complete-star:nth-child(3) { animation-delay: 0.4s; }
.complete-star:nth-child(4) { animation-delay: 0.6s; }
.complete-star:nth-child(5) { animation-delay: 0.8s; }
@keyframes starFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
.complete-text h3 { font-size: 20px; font-weight: 900; margin: 0 0 4px; }
.complete-text p { font-size: 12px; color: rgba(255,255,255,0.8); margin: 0; }
.complete-stars-count { font-size: 14px; color: #FCD34D; font-weight: 800; margin-top: 4px !important; }
</style>
