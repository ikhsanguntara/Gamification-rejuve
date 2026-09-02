<template>
  <Transition name="card-appear">
    <div v-if="mission" class="mission-card-overlay" @click.self="$emit('close')">
      <div class="mission-card">
        <!-- Decorative top border vine -->
        <div class="card-vine-top">
          <svg viewBox="0 0 320 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-4">
            <path d="M0 9 Q40 2 80 9 Q120 16 160 9 Q200 2 240 9 Q280 16 320 9" stroke="#8B6914" stroke-width="2" fill="none" opacity="0.6"/>
            <circle cx="80" cy="9" r="3" fill="#5C3D1E" opacity="0.5"/>
            <circle cx="160" cy="9" r="3" fill="#5C3D1E" opacity="0.5"/>
            <circle cx="240" cy="9" r="3" fill="#5C3D1E" opacity="0.5"/>
          </svg>
        </div>

        <!-- Week badge -->
        <div class="card-week-badge" :class="weekBadgeClass">
          <component :is="weekIcon" class="w-3.5 h-3.5" />
          <span>WEEK {{ mission.week }}</span>
        </div>

        <!-- Close button -->
        <button class="card-close" @click="$emit('close')" type="button">
          <X class="w-4 h-4" />
        </button>

        <!-- Status indicator bar -->
        <div class="status-bar" :class="statusBarClass">
          <span class="status-dot"></span>
          <span class="status-text">{{ statusLabel }}</span>
        </div>

        <!-- Mission number & title -->
        <div class="card-header">
          <span class="mission-num">Misi {{ missionIndex.toString().padStart(2, '0') }}</span>
          <h3 class="mission-title">{{ mission.title }}</h3>
        </div>

        <!-- Description -->
        <p class="mission-desc">{{ mission.description }}</p>

        <!-- Requirements preview -->
        <div v-if="mission.requirements && mission.requirements.length" class="requirements">
          <div class="req-title">
            <ClipboardList class="w-3 h-3" />
            <span>Indikator SOP:</span>
          </div>
          <ul class="req-list">
            <li v-for="(req, i) in mission.requirements.slice(0, 2)" :key="i" class="req-item">
              <CheckCircle2 class="w-3 h-3 flex-shrink-0" :class="isCompleted ? 'text-emerald-600' : 'text-amber-700'" />
              <span>{{ req }}</span>
            </li>
            <li v-if="mission.requirements.length > 2" class="req-more">
              + {{ mission.requirements.length - 2 }} indikator lainnya
            </li>
          </ul>
        </div>

        <!-- Star reward section -->
        <div class="star-section">
          <div class="star-row">
            <div class="star-display">
              <span
                v-for="i in 5"
                :key="i"
                class="star-item"
                :class="{ 'star-earned': i <= earnedStars, 'star-max': i <= 5 }"
              >★</span>
            </div>
            <span class="star-label">{{ starLabel }}</span>
          </div>
          <div v-if="mission.averageScore" class="score-badge">
            Skor: {{ mission.averageScore }}
          </div>
        </div>

        <!-- Deadline -->
        <div v-if="mission.deadline" class="deadline-row">
          <CalendarDays class="w-3 h-3 text-amber-700" />
          <span>Deadline: {{ formatDeadline(mission.deadline) }}</span>
        </div>

        <!-- Action buttons -->
        <div class="card-actions">
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          >
            Tutup
          </button>

          <NuxtLink
            v-if="!isLocked"
            :to="`/missions/${mission.id}`"
            class="btn-action"
            :class="actionBtnClass"
            @click="$emit('close')"
          >
            <component :is="actionIcon" class="w-3.5 h-3.5" />
            <span>{{ actionLabel }}</span>
          </NuxtLink>

          <div v-else class="btn-locked">
            <Lock class="w-3.5 h-3.5" />
            <span>Terkunci</span>
          </div>
        </div>

        <!-- Decorative bottom border -->
        <div class="card-vine-bottom">
          <svg viewBox="0 0 320 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-4">
            <path d="M0 9 Q40 16 80 9 Q120 2 160 9 Q200 16 240 9 Q280 2 320 9" stroke="#8B6914" stroke-width="2" fill="none" opacity="0.6"/>
          </svg>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import {
  X, Lock, CheckCircle2, ClipboardList, CalendarDays,
  Tent, Waves, Mountain, ChevronRight, RotateCcw, Clock
} from 'lucide-vue-next'

const props = defineProps({
  mission: { type: Object, default: null },
  missionIndex: { type: Number, default: 1 }
})

const emit = defineEmits(['close'])

const isCompleted = computed(() => {
  const s = props.mission?.status
  return s === 'COMPLETED' || s === 'APPROVED'
})

const isPending = computed(() => props.mission?.status === 'PENDING_REVIEW')
const isRevision = computed(() => props.mission?.status === 'REVISION_REQUIRED')
const isLocked = computed(() => props.mission?.status === 'LOCKED' || props.mission?.weekLocked)

const earnedStars = computed(() => {
  if (isCompleted.value) return props.mission?.awardedStars || 5
  if (props.mission?.awardedStars) return props.mission.awardedStars
  return 0
})

const starLabel = computed(() => {
  if (isCompleted.value) return `${earnedStars.value}/5 Bintang Diraih`
  if (isLocked.value) return 'Hingga 5 Bintang'
  return 'Hingga 5 Bintang'
})

const statusLabel = computed(() => {
  if (isCompleted.value) return 'Selesai & Disetujui'
  if (isPending.value) return 'Menunggu Review'
  if (isRevision.value) return 'Perlu Diperbaiki'
  if (isLocked.value) return 'Belum Terbuka'
  const s = props.mission?.status
  if (s === 'IN_PROGRESS') return 'Sedang Berjalan'
  return 'Tersedia'
})

const statusBarClass = computed(() => {
  if (isCompleted.value) return 'status-completed'
  if (isPending.value) return 'status-pending'
  if (isRevision.value) return 'status-revision'
  if (isLocked.value) return 'status-locked'
  return 'status-active'
})

const weekBadgeClass = computed(() => {
  const w = props.mission?.week
  if (w === 1) return 'week-badge-1'
  if (w === 2) return 'week-badge-2'
  return 'week-badge-3'
})

const weekIcon = computed(() => {
  const w = props.mission?.week
  if (w === 1) return Tent
  if (w === 2) return Waves
  return Mountain
})

const actionLabel = computed(() => {
  if (isCompleted.value) return 'Lihat Detail'
  if (isPending.value) return 'Lihat Status'
  if (isRevision.value) return 'Perbaiki Misi'
  return 'Mulai Misi'
})

const actionBtnClass = computed(() => {
  if (isCompleted.value) return 'btn-completed'
  if (isRevision.value) return 'btn-revision'
  return 'btn-start'
})

const actionIcon = computed(() => {
  if (isRevision.value) return RotateCcw
  if (isPending.value) return Clock
  return ChevronRight
})

const formatDeadline = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}
</script>

<style scoped>
.mission-card-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(10, 6, 3, 0.65);
  backdrop-filter: blur(4px);
}

.mission-card {
  position: relative;
  width: 100%;
  max-width: 380px;
  background: linear-gradient(145deg, #FDF3DC 0%, #F5E6C8 50%, #EDD9A3 100%);
  border-radius: 20px;
  padding: 12px 20px 16px;
  border: 2px solid #C19A6B;
  box-shadow:
    0 0 0 4px rgba(139, 105, 20, 0.15),
    0 20px 60px rgba(0,0,0,0.4),
    inset 0 1px 0 rgba(255,255,255,0.6);
  overflow: hidden;
}

/* Parchment texture overlay */
.mission-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='none'/%3E%3Ccircle cx='1' cy='1' r='0.5' fill='%23C19A6B' opacity='0.15'/%3E%3C/svg%3E");
  border-radius: 20px;
  pointer-events: none;
}

.card-vine-top { margin: -4px -8px 8px; }
.card-vine-bottom { margin: 8px -8px -4px; }

.card-week-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.week-badge-1 { background: #D1FAE5; color: #065F46; border: 1px solid #6EE7B7; }
.week-badge-2 { background: #DBEAFE; color: #1E40AF; border: 1px solid #93C5FD; }
.week-badge-3 { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }

.card-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(139, 94, 60, 0.15);
  border: 1px solid rgba(139, 94, 60, 0.3);
  color: #5C3D1E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.card-close:hover {
  background: rgba(139, 94, 60, 0.3);
  transform: scale(1.1);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.status-completed { background: #D1FAE5; color: #065F46; }
.status-completed .status-dot { background: #10B981; }
.status-pending { background: #DBEAFE; color: #1E40AF; }
.status-pending .status-dot { background: #3B82F6; animation: blink 1s ease-in-out infinite; }
.status-revision { background: #FEF3C7; color: #92400E; }
.status-revision .status-dot { background: #F59E0B; animation: blink 0.8s ease-in-out infinite; }
.status-locked { background: rgba(107,114,128,0.15); color: #6B7280; }
.status-locked .status-dot { background: #9CA3AF; }
.status-active { background: #FEF9C3; color: #713F12; }
.status-active .status-dot { background: #EAB308; animation: blink 1.2s ease-in-out infinite; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.card-header { margin-bottom: 8px; }
.mission-num {
  font-size: 9px;
  font-weight: 900;
  color: #8B6914;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  display: block;
  margin-bottom: 3px;
}
.mission-title {
  font-size: 16px;
  font-weight: 800;
  color: #2C1A08;
  line-height: 1.3;
  margin: 0;
}

.mission-desc {
  font-size: 11px;
  color: #5C3D1E;
  line-height: 1.6;
  margin-bottom: 10px;
  opacity: 0.85;
}

.requirements {
  background: rgba(139, 94, 60, 0.08);
  border: 1px solid rgba(139, 94, 60, 0.2);
  border-radius: 10px;
  padding: 8px 10px;
  margin-bottom: 10px;
}
.req-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 800;
  color: #8B4513;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 5px;
}
.req-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.req-item {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 10px;
  color: #4A2912;
  line-height: 1.4;
}
.req-more {
  font-size: 9px;
  color: #8B6914;
  font-style: italic;
  padding-left: 18px;
  margin-top: 2px;
}

.star-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 10px;
  margin-bottom: 8px;
}
.star-row { display: flex; align-items: center; gap: 8px; }
.star-display { display: flex; gap: 2px; }
.star-item {
  font-size: 16px;
  color: #D1B06B;
  transition: all 0.2s;
  line-height: 1;
}
.star-earned {
  color: #F59E0B;
  text-shadow: 0 0 8px rgba(245,158,11,0.7);
  animation: starPop 0.3s ease-out backwards;
}
.star-label { font-size: 9px; font-weight: 700; color: #8B6914; }
.score-badge {
  font-size: 9px;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, #D97706, #F59E0B);
  padding: 2px 8px;
  border-radius: 8px;
}

.deadline-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: #8B5E3C;
  margin-bottom: 12px;
  opacity: 0.8;
}

.card-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.btn-close {
  flex: 0 0 auto;
  padding: 8px 14px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(139, 94, 60, 0.12);
  color: #5C3D1E;
  border: 1px solid rgba(139, 94, 60, 0.25);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-close:hover { background: rgba(139, 94, 60, 0.22); }

.btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.2s;
  letter-spacing: 0.03em;
}
.btn-start { background: linear-gradient(135deg, #D97706, #F59E0B); color: #1C1917; box-shadow: 0 4px 12px rgba(217,119,6,0.4); }
.btn-start:hover { background: linear-gradient(135deg, #B45309, #D97706); transform: translateY(-1px); }
.btn-completed { background: linear-gradient(135deg, #059669, #10B981); color: white; box-shadow: 0 4px 12px rgba(5,150,105,0.35); }
.btn-completed:hover { transform: translateY(-1px); }
.btn-revision { background: linear-gradient(135deg, #EF4444, #F87171); color: white; }
.btn-revision:hover { transform: translateY(-1px); }

.btn-locked {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(107,114,128,0.15);
  color: #9CA3AF;
  border: 1px dashed #D1D5DB;
  cursor: not-allowed;
}

@keyframes starPop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.3); }
  100% { transform: scale(1); opacity: 1; }
}

/* Card appear transition */
.card-appear-enter-active { transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.card-appear-leave-active { transition: all 0.2s ease-in; }
.card-appear-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
}
.card-appear-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
