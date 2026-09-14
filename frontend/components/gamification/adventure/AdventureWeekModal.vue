<template>
  <Transition name="modal-fade">
    <div v-if="modelValue && week" class="week-modal-overlay" @click.self="close">
      <div class="week-modal-container">

        <!-- Decorative Top Ornament -->
        <div class="modal-vine-top">
          <svg viewBox="0 0 400 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-4">
            <path d="M0 9 Q50 2 100 9 Q150 16 200 9 Q250 2 300 9 Q350 16 400 9" stroke="#8B6914" stroke-width="2" fill="none" opacity="0.6"/>
            <circle cx="100" cy="9" r="3" fill="#5C3D1E" opacity="0.5"/>
            <circle cx="200" cy="9" r="3" fill="#5C3D1E" opacity="0.5"/>
            <circle cx="300" cy="9" r="3" fill="#5C3D1E" opacity="0.5"/>
          </svg>
        </div>

        <!-- Close Button -->
        <button class="modal-close-btn" @click="close" type="button" title="Tutup">
          <X class="w-4 h-4" />
        </button>

        <!-- ── Modal Header ── -->
        <div class="modal-header">
          <!-- Chapter Badge & Status -->
          <div class="flex items-center justify-between gap-2 flex-wrap mb-1.5">
            <div class="week-chapter-badge" :class="weekThemeClass">
              <component :is="weekIcon" class="w-3.5 h-3.5" />
              <span>WEEK {{ week.weekNumber }} • {{ weekThemeName }}</span>
            </div>

            <span class="week-status-badge" :class="statusBadgeClass">
              {{ statusBadgeText }}
            </span>
          </div>

          <!-- Week Title & Chapter Headline -->
          <h2 class="week-modal-title">
            {{ weekHeadline }}
          </h2>
          <p class="week-modal-desc">
            {{ weekDescription }}
          </p>

          <!-- Quick Stats Row & Progress Bar -->
          <div class="week-stats-card">
            <div class="grid grid-cols-3 gap-2 text-center pb-2 border-b border-[#C19A6B]/30">
              <div>
                <span class="stat-sublabel">Total Misi</span>
                <span class="stat-mainval">{{ completedMissionsCount }} / {{ missions.length }} Selesai</span>
              </div>
              <div>
                <span class="stat-sublabel">Bintang Diraih</span>
                <span class="stat-mainval text-amber-700">★ {{ totalStarsEarned }} / {{ maxPossibleStars }}</span>
              </div>
              <div>
                <span class="stat-sublabel">Progres Week</span>
                <span class="stat-mainval text-emerald-700">{{ weekPercent }}%</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="mt-2">
              <div class="w-full h-2 rounded-full bg-[#8B6914]/20 overflow-hidden">
                <div
                  class="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                  :style="{ width: `${weekPercent}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Modal Body: Missions List / Locked Banner ── -->
        <div class="modal-body-scroll">
          <!-- Locked Banner -->
          <div v-if="week.isLocked" class="locked-state-box">
            <div class="w-12 h-12 rounded-2xl bg-slate-800/10 flex items-center justify-center text-slate-600 mb-2">
              <Lock class="w-6 h-6" />
            </div>
            <h4 class="font-black text-slate-800 text-sm">Pos Ekspedisi Ini Masih Terkunci</h4>
            <p class="text-xs text-slate-600 text-center max-w-sm mt-1">
              Selesaikan seluruh misi operasional pada <strong>Week {{ week.weekNumber - 1 }}</strong> terlebih dahulu untuk membuka rangkaian pos ini.
            </p>
          </div>

          <!-- Missions List -->
          <div v-else class="missions-list-container space-y-3">
            <div class="flex items-center justify-between px-1">
              <span class="text-xs font-black uppercase tracking-wider text-[#5C3D1E] flex items-center gap-1.5">
                <span>📋</span>
                <span>Daftar Misi Operasional Week {{ week.weekNumber }}</span>
              </span>
              <span class="text-[11px] font-bold text-[#8B6914]">
                {{ missions.length }} Pos Misi
              </span>
            </div>

            <div v-if="missions.length === 0" class="p-6 rounded-2xl bg-black/5 border border-dashed border-[#8B6914]/30 text-center space-y-2">
              <div class="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center text-lg">
                📋
              </div>
              <h5 class="text-xs font-bold text-slate-800">Belum Ada Misi Pada Week {{ week.weekNumber }}</h5>
              <p class="text-[11px] text-slate-600 max-w-xs mx-auto">
                Misi untuk minggu ini belum ditugaskan ke dalam batch atau template yang digunakan belum memiliki butir misi di minggu ke-{{ week.weekNumber }}.
              </p>
            </div>

            <div
              v-else
              v-for="(m, idx) in missions"
              :key="m.id"
              class="mission-detail-card"
              :class="missionCardClass(m)"
            >
              <!-- Card Top Header -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-2">
                  <!-- Number Pin -->
                  <div class="mission-pin" :class="missionPinClass(m)">
                    <CheckCircle2 v-if="isMissionCompleted(m)" class="w-3.5 h-3.5" />
                    <Clock v-else-if="m.status === 'PENDING_REVIEW'" class="w-3.5 h-3.5" />
                    <AlertTriangle v-else-if="m.status === 'REVISION_REQUIRED'" class="w-3.5 h-3.5" />
                    <span v-else class="text-[10px] font-black">{{ (idx + 1).toString().padStart(2, '0') }}</span>
                  </div>

                  <div>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-[10px] font-black text-amber-800">
                        {{ m.code || `MISI-${idx + 1}` }}
                      </span>
                      <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#8B6914]/15 text-[#5C3D1E]">
                        {{ m.category || 'SOP Operasional' }}
                      </span>
                    </div>
                    <h4 class="text-xs font-black text-slate-900 leading-snug mt-0.5">
                      {{ m.title }}
                    </h4>
                  </div>
                </div>

                <!-- Status Badge -->
                <span class="mission-status-pill flex-shrink-0" :class="missionStatusPillClass(m)">
                  {{ missionStatusLabel(m) }}
                </span>
              </div>

              <!-- Mission Description -->
              <p v-if="m.description" class="text-[11px] text-slate-700 mt-2 line-clamp-2 leading-relaxed">
                {{ m.description }}
              </p>

              <!-- SOP Requirements Checklist Preview -->
              <div v-if="m.requirements && m.requirements.length" class="mt-2.5 p-2 rounded-lg bg-black/5 border border-black/10">
                <span class="text-[9px] font-bold uppercase tracking-wider text-[#8B6914] block mb-1">
                  Indikator SOP Kunci:
                </span>
                <ul class="space-y-1">
                  <li
                    v-for="(req, rIdx) in m.requirements.slice(0, 2)"
                    :key="rIdx"
                    class="text-[10px] text-slate-700 flex items-start gap-1.5 leading-tight"
                  >
                    <span class="text-amber-600 font-bold">•</span>
                    <span>{{ req }}</span>
                  </li>
                  <li v-if="m.requirements.length > 2" class="text-[9px] text-[#8B6914] font-semibold italic pl-2.5">
                    + {{ m.requirements.length - 2 }} indikator verifikasi lainnya
                  </li>
                </ul>
              </div>

              <!-- Card Footer: Stars -->
              <div class="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-[#C19A6B]/25">
                <!-- Stars count -->
                <div class="flex items-center gap-1.5">
                  <div class="flex gap-0.5 text-amber-500 text-xs">
                    <span
                      v-for="s in 5"
                      :key="s"
                      :class="s <= getMissionStars(m) ? 'text-amber-500' : 'text-slate-300'"
                    >★</span>
                  </div>
                  <span class="text-[10px] font-bold text-[#8B6914]">
                    {{ isMissionCompleted(m) ? `${getMissionStars(m)} Bintang` : 'Maks 5 Bintang' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Modal Footer: Navigation Between Weeks ── -->
        <div class="modal-footer">
          <!-- Previous Week Button -->
          <button
            v-if="prevWeek"
            type="button"
            class="nav-week-btn"
            @click="switchWeek(prevWeek.weekNumber)"
          >
            <ChevronLeft class="w-3.5 h-3.5" />
            <span>Week {{ prevWeek.weekNumber }}</span>
          </button>
          <div v-else class="w-20"></div>

          <!-- Close Button -->
          <button
            type="button"
            class="btn-modal-close"
            @click="close"
          >
            Tutup
          </button>

          <!-- Next Week Button -->
          <button
            v-if="nextWeek"
            type="button"
            class="nav-week-btn"
            @click="switchWeek(nextWeek.weekNumber)"
          >
            <span>Week {{ nextWeek.weekNumber }}</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </button>
          <div v-else class="w-20"></div>
        </div>

        <!-- Decorative Bottom Ornament -->
        <div class="modal-vine-bottom">
          <svg viewBox="0 0 400 18" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-4">
            <path d="M0 9 Q50 16 100 9 Q150 2 200 9 Q250 16 300 9 Q350 2 400 9" stroke="#8B6914" stroke-width="2" fill="none" opacity="0.6"/>
          </svg>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { calculateStars } from '~/utils/star.js'
import {
  X, Lock, CheckCircle2, ChevronRight, ChevronLeft,
  Tent, Waves, Mountain, Compass, Flag, AlertTriangle,
  Clock, RotateCcw, ArrowRight, Eye, Play
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  week: { type: Object, default: null },
  missions: { type: Array, default: () => [] },
  allWeeks: { type: Array, default: () => [] },
  batchName: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'selectWeek'])

const router = useRouter()

const close = () => {
  emit('update:modelValue', false)
}

const switchWeek = (weekNum) => {
  emit('selectWeek', weekNum)
}

const WEEK_THEMES = ['BASE CAMP', 'RIVER CROSSING', 'RAINFOREST CANOPY', 'THE SUMMIT', 'THE PEAK']
const WEEK_ICONS = [Tent, Waves, Mountain, Compass, Flag]

const WEEK_HEADLINES = [
  'Chapter 1: Cold Chain & Sanitation Basecamp',
  'Chapter 2: Juice Crafting & Raw Material River',
  'Chapter 3: Service Excellence & Cashier Canopy',
  'Chapter 4: Peak Performance & Store Leadership',
  'Chapter 5: Final Expedition Mastery'
]

const WEEK_DESCRIPTIONS = [
  'Fondasi integritas suhu 2-4°C, sanitasi mesin hidrolik, dan keamanan mutu awal sebelum melangkah lebih jauh.',
  'Penguasaan teknik press cold-pressed, penanganan buah & sayur higienis, serta akurasi resep standar Re.juve.',
  'Standar pelayanan bintang 5, POS cashier, hospitality, dan interaksi hangat bersama para pelanggan setia.',
  'Konsistensi operasional gerai, manajemen stock, kecepatan layanan, dan kesiapan evaluasi kepemimpinan.',
  'Pengujian akhir seluruh pilar SOP operasional untuk meraih predikat Star Legend Re.juve.'
]

const weekThemeName = computed(() => {
  if (!props.week) return ''
  const idx = props.week.weekNumber - 1
  return WEEK_THEMES[Math.min(idx, WEEK_THEMES.length - 1)] || `WEEK ${props.week.weekNumber}`
})

const weekHeadline = computed(() => {
  if (!props.week) return ''
  const idx = props.week.weekNumber - 1
  return props.week.title || WEEK_HEADLINES[Math.min(idx, WEEK_HEADLINES.length - 1)]
})

const weekDescription = computed(() => {
  if (!props.week) return ''
  const idx = props.week.weekNumber - 1
  return WEEK_DESCRIPTIONS[Math.min(idx, WEEK_DESCRIPTIONS.length - 1)]
})

const weekIcon = computed(() => {
  if (!props.week) return Tent
  const idx = props.week.weekNumber - 1
  return WEEK_ICONS[Math.min(idx, WEEK_ICONS.length - 1)] || Tent
})

const weekThemeClass = computed(() => {
  if (!props.week) return ''
  const w = props.week.weekNumber
  if (w === 1) return 'theme-w1'
  if (w === 2) return 'theme-w2'
  if (w === 3) return 'theme-w3'
  return 'theme-w4'
})

const completedMissionsCount = computed(() => {
  return props.missions.filter(m => isMissionCompleted(m)).length
})

const maxPossibleStars = computed(() => {
  return props.missions.length * 5
})

const totalStarsEarned = computed(() => {
  const sum = props.missions.reduce((acc, m) => {
    if (isMissionCompleted(m)) {
      return acc + getMissionStars(m)
    }
    return acc
  }, 0)
  return Math.round(sum * 10) / 10
})

const weekPercent = computed(() => {
  if (props.missions.length === 0) return 0
  return Math.round((completedMissionsCount.value / props.missions.length) * 100)
})

const statusBadgeText = computed(() => {
  if (props.week?.status === 'COMPLETED' || weekPercent.value === 100) return '✓ Selesai & Lulus'
  if (props.week?.isLocked) return 'Terkunci'
  return 'Sedang Berjalan'
})

const statusBadgeClass = computed(() => {
  if (props.week?.status === 'COMPLETED' || weekPercent.value === 100) return 'badge-done'
  if (props.week?.isLocked) return 'badge-lock'
  return 'badge-run'
})

const prevWeek = computed(() => {
  if (!props.week || !props.allWeeks) return null
  return props.allWeeks.find(w => w.weekNumber === props.week.weekNumber - 1)
})

const nextWeek = computed(() => {
  if (!props.week || !props.allWeeks) return null
  return props.allWeeks.find(w => w.weekNumber === props.week.weekNumber + 1)
})

// ── Mission Helpers ──────────────────────────────────────────────────────────

const isMissionCompleted = (m) => m.status === 'COMPLETED' || m.status === 'APPROVED'

const getMissionStars = (m) => {
  if (isMissionCompleted(m)) {
    const raw = Number(m.awardedStars || m.calculatedStars || (m.averageScore ? calculateStars(m.averageScore) : 5))
    return Math.round(raw * 10) / 10
  }
  const raw = Number(m.awardedStars || m.calculatedStars || 0)
  return Math.round(raw * 10) / 10
}

const missionCardClass = (m) => ({
  'card-done': isMissionCompleted(m),
  'card-in-progress': m.status === 'IN_PROGRESS',
  'card-pending': m.status === 'PENDING_REVIEW',
  'card-revision': m.status === 'REVISION_REQUIRED',
  'card-locked': m.status === 'LOCKED' || props.week?.isLocked
})

const missionPinClass = (m) => ({
  'pin-done': isMissionCompleted(m),
  'pin-in-progress': m.status === 'IN_PROGRESS',
  'pin-pending': m.status === 'PENDING_REVIEW',
  'pin-revision': m.status === 'REVISION_REQUIRED',
  'pin-locked': m.status === 'LOCKED' || props.week?.isLocked
})

const missionStatusLabel = (m) => {
  if (isMissionCompleted(m)) return 'Selesai ✓'
  if (m.status === 'PENDING_REVIEW') return 'Menunggu DM'
  if (m.status === 'REVISION_REQUIRED') return 'Perlu Revisi'
  if (m.status === 'IN_PROGRESS') return 'Aktif Berjalan'
  if (m.status === 'LOCKED' || props.week?.isLocked) return 'Terkunci'
  return 'Tersedia'
}

const missionStatusPillClass = (m) => ({
  'status-done': isMissionCompleted(m),
  'status-pending': m.status === 'PENDING_REVIEW',
  'status-revision': m.status === 'REVISION_REQUIRED',
  'status-in-progress': m.status === 'IN_PROGRESS',
  'status-locked': m.status === 'LOCKED' || props.week?.isLocked
})

const missionBtnLabel = (m) => {
  if (isMissionCompleted(m)) return 'Lihat Detail'
  if (m.status === 'REVISION_REQUIRED') return 'Perbaiki Misi'
  if (m.status === 'PENDING_REVIEW') return 'Lihat Status'
  return 'Mulai Kerjakan'
}

const missionBtnIcon = (m) => {
  if (isMissionCompleted(m)) return Eye
  if (m.status === 'REVISION_REQUIRED') return RotateCcw
  if (m.status === 'PENDING_REVIEW') return Clock
  return Play
}

const missionBtnClass = (m) => ({
  'btn-done': isMissionCompleted(m),
  'btn-revision': m.status === 'REVISION_REQUIRED',
  'btn-start': !isMissionCompleted(m) && m.status !== 'REVISION_REQUIRED'
})

const goToMission = (m) => {
  close()
  router.push(`/missions/${m.id}`)
}
</script>

<style scoped>
.week-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(10, 6, 3, 0.75);
  backdrop-filter: blur(6px);
}

.week-modal-container {
  position: relative;
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #FDF3DC 0%, #F6E7C9 50%, #EEDAA7 100%);
  border-radius: 24px;
  border: 2.5px solid #C19A6B;
  box-shadow:
    0 0 0 5px rgba(139, 105, 20, 0.18),
    0 25px 70px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.7);
  overflow: hidden;
}

/* Parchment texture overlay */
.week-modal-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='none'/%3E%3Ccircle cx='1' cy='1' r='0.5' fill='%23C19A6B' opacity='0.15'/%3E%3C/svg%3E");
  border-radius: 24px;
  pointer-events: none;
}

.modal-vine-top { margin: 6px 12px 0; }
.modal-vine-bottom { margin: 0 12px 6px; }

.modal-close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(139, 94, 60, 0.18);
  border: 1.5px solid rgba(139, 94, 60, 0.35);
  color: #5C3D1E;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 10;
}
.modal-close-btn:hover {
  background: rgba(139, 94, 60, 0.35);
  transform: scale(1.1);
}

/* ── Header ── */
.modal-header {
  padding: 10px 22px 14px;
  border-bottom: 1.5px solid rgba(193, 154, 107, 0.4);
  position: relative;
  z-index: 2;
}

.week-chapter-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.theme-w1 { background: #D1FAE5; color: #065F46; border: 1.5px solid #6EE7B7; }
.theme-w2 { background: #DBEAFE; color: #1E40AF; border: 1.5px solid #93C5FD; }
.theme-w3 { background: #FEF3C7; color: #92400E; border: 1.5px solid #FCD34D; }
.theme-w4 { background: #FCE7F3; color: #9D174D; border: 1.5px solid #F472B6; }

.week-status-badge {
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.badge-done { background: #059669; color: white; }
.badge-run { background: #D97706; color: white; }
.badge-lock { background: #6B7280; color: white; }

.week-modal-title {
  font-size: 18px;
  font-weight: 900;
  color: #2C1A08;
  margin: 4px 0 2px;
  line-height: 1.25;
}

.week-modal-desc {
  font-size: 11.5px;
  color: #5C3D1E;
  line-height: 1.45;
  margin-bottom: 10px;
}

.week-stats-card {
  background: rgba(139, 94, 60, 0.09);
  border: 1.5px solid rgba(139, 94, 60, 0.22);
  border-radius: 14px;
  padding: 8px 12px;
}

.stat-sublabel {
  display: block;
  font-size: 8.5px;
  font-weight: 800;
  text-transform: uppercase;
  color: #8B6914;
  letter-spacing: 0.06em;
}

.stat-mainval {
  font-size: 12px;
  font-weight: 900;
  color: #2C1A08;
}

/* ── Body Scroll ── */
.modal-body-scroll {
  padding: 14px 22px;
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 2;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 94, 60, 0.4) transparent;
}
.modal-body-scroll::-webkit-scrollbar { width: 5px; }
.modal-body-scroll::-webkit-scrollbar-thumb {
  background: rgba(139, 94, 60, 0.4);
  border-radius: 3px;
}

.locked-state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  background: rgba(107, 114, 128, 0.08);
  border: 1.5px dashed rgba(107, 114, 128, 0.3);
  border-radius: 16px;
}

/* ── Mission Detail Card ── */
.mission-detail-card {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid #E2D0B6;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.2s ease;
}
.mission-detail-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.08);
  border-color: #C19A6B;
}

.card-done { border-color: #A7F3D0; background: rgba(240, 253, 244, 0.9); }
.card-in-progress { border-color: #FDE68A; background: rgba(254, 252, 232, 0.9); box-shadow: 0 0 0 1px #FBBF24; }
.card-pending { border-color: #BFDBFE; background: rgba(239, 246, 255, 0.9); }
.card-revision { border-color: #FECACA; background: rgba(254, 242, 242, 0.9); }

.mission-pin {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid;
}
.pin-done { background: #059669; border-color: #34D399; color: white; }
.pin-in-progress { background: #D97706; border-color: #FCD34D; color: white; }
.pin-pending { background: #3B82F6; border-color: #93C5FD; color: white; }
.pin-revision { background: #EF4444; border-color: #FCA5A5; color: white; }
.pin-locked { background: #E5E7EB; border-color: #D1D5DB; color: #6B7280; }

.mission-status-pill {
  font-size: 8.5px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.status-done { background: #D1FAE5; color: #065F46; }
.status-pending { background: #DBEAFE; color: #1E40AF; }
.status-revision { background: #FEE2E2; color: #991B1B; }
.status-in-progress { background: #FEF3C7; color: #92400E; }
.status-locked { background: #F3F4F6; color: #6B7280; }

.mission-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: 9px;
  font-size: 10.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-start {
  background: linear-gradient(135deg, #D97706, #F59E0B);
  color: #1C1917;
  box-shadow: 0 2px 8px rgba(217,119,6,0.3);
}
.btn-start:hover {
  background: linear-gradient(135deg, #B45309, #D97706);
  transform: translateY(-1px);
}
.btn-done {
  background: linear-gradient(135deg, #059669, #10B981);
  color: white;
  box-shadow: 0 2px 8px rgba(5,150,105,0.25);
}
.btn-done:hover {
  transform: translateY(-1px);
}
.btn-revision {
  background: #EF4444;
  color: white;
}

/* ── Footer ── */
.modal-footer {
  padding: 10px 22px 12px;
  border-top: 1.5px solid rgba(193, 154, 107, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  position: relative;
  z-index: 2;
}

.nav-week-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(139, 94, 60, 0.12);
  border: 1px solid rgba(139, 94, 60, 0.25);
  color: #5C3D1E;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-week-btn:hover {
  background: rgba(139, 94, 60, 0.22);
}

.btn-modal-close {
  padding: 6px 18px;
  border-radius: 10px;
  background: rgba(139, 94, 60, 0.18);
  border: 1px solid rgba(139, 94, 60, 0.35);
  color: #5C3D1E;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-modal-close:hover {
  background: rgba(139, 94, 60, 0.3);
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95); }
</style>
