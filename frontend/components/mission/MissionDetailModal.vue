<template>
  <BaseModal
    :model-value="modelValue"
    :title="mission?.title || 'Detail Evaluasi Misi'"
    :subtitle="missionSubtitle"
    max-width="2xl"
    @update:model-value="emit('update:modelValue', $event)"
    @close="emit('update:modelValue', false)"
  >
    <template #icon>
      <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#831843]/20 to-amber-500/20 text-[#831843] dark:text-[#f472b6] flex items-center justify-center flex-shrink-0 shadow-sm border border-[#831843]/10">
        <Target class="w-5 h-5" />
      </div>
    </template>

    <div v-if="mission" class="space-y-5 py-1">
      <!-- 1. Header Overview Stats Card -->
      <div class="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                {{ mission.category || 'TECHNICAL' }}
              </span>
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {{ mission.code || 'MSN' }} • {{ batchStore.currentBatchUnitCode || 'Week' }} {{ mission.week || 1 }}
              </span>
            </div>
            <p v-if="mission.description" class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              {{ mission.description }}
            </p>
          </div>

          <div class="flex-shrink-0">
            <MissionStatus :status="mission.status || 'IN_PROGRESS'" />
          </div>
        </div>

        <!-- Metric Grid -->
        <div class="grid grid-cols-3 gap-2 text-center pt-3">
          <div>
            <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">Kru Terdaftar</span>
            <span class="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
              {{ completedCrewCount }} / {{ crewRoster.length }} Selesai
            </span>
          </div>
          <div>
            <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">Rata-rata Nilai</span>
            <span class="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
              {{ averageMissionScore > 0 ? `${averageMissionScore}%` : '—' }}
            </span>
          </div>
          <div>
            <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase block">Bintang Gerai</span>
            <span class="text-sm sm:text-base font-black text-amber-500 mt-0.5 flex items-center justify-center gap-1">
              <Star class="w-3.5 h-3.5 fill-amber-400" />
              {{ calculateStars(averageMissionScore) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 2. SOP Checklist Section (If Available) -->
      <div v-if="sopChecklist.length > 0" class="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-800/40 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
            <CheckCircle2 class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Indikator SOP Kunci</span>
          </span>
          <span class="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            {{ sopChecklist.length }} Poin Standar
          </span>
        </div>
        <ul class="space-y-1.5 pt-1">
          <li
            v-for="(item, idx) in sopChecklist"
            :key="idx"
            class="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 leading-relaxed"
          >
            <span class="w-4 h-4 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
              {{ idx + 1 }}
            </span>
            <span>{{ typeof item === 'string' ? item : (item.item || item.text || item.title || JSON.stringify(item)) }}</span>
          </li>
        </ul>
      </div>

      <!-- 3. Full Crew Evaluation Roster -->
      <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Users class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
            <span>Daftar Nilai & Evaluasi Kru ({{ crewRoster.length }} Anggota)</span>
          </span>
          <span class="text-xs text-slate-400 font-medium">
            Batch: {{ currentBatchName }}
          </span>
        </div>

        <div v-if="crewRoster.length === 0" class="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          Belum ada kru yang ditugaskan pada batch ini.
        </div>

        <div v-else class="space-y-2.5">
          <div
            v-for="crew in crewRoster"
            :key="crew.id"
            class="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
          >
            <!-- Crew Info Left -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#831843] to-[#500e28] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden border border-white/10">
                <img
                  v-if="crew.avatar"
                  :src="crew.avatar"
                  :alt="crew.name"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ (crew.name || 'C').charAt(0) }}</span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h5 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {{ crew.name }}
                  </h5>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {{ crew.code || 'CRW' }}
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  <span>{{ crew.role || 'Crew' }}</span>
                  <span v-if="crew.outlet"> • 📍 {{ crew.outlet }}</span>
                </p>
              </div>
            </div>

            <!-- Score & Status Right -->
            <div class="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/50">
              <!-- Score Badge -->
              <div class="text-right">
                <div class="flex items-center gap-1.5 justify-end">
                  <span
                    class="text-xs sm:text-sm font-black"
                    :class="crew.score > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'"
                  >
                    {{ crew.score > 0 ? `${crew.score} / 100` : 'Belum Dinilai' }}
                  </span>
                </div>
                <div class="flex items-center justify-end gap-1 text-[10px] font-semibold text-amber-500 mt-0.5">
                  <Star class="w-3 h-3 fill-amber-400" />
                  <span>{{ crew.score > 0 ? `${calculateStars(crew.score)} Bintang` : '0 Bintang' }}</span>
                </div>
              </div>

              <!-- Status Pill -->
              <span
                class="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                :class="getCrewStatusClass(crew.status)"
              >
                {{ getCrewStatusLabel(crew.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <template #footer>
      <button
        type="button"
        class="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        @click="emit('update:modelValue', false)"
      >
        Tutup
      </button>
      <NuxtLink
        v-if="userStore.isStoreLeader || userStore.isSuperadmin"
        to="/evaluations"
        class="px-4 py-2 rounded-xl text-xs font-semibold bg-[#831843] hover:bg-[#9d174d] text-white transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        @click="emit('update:modelValue', false)"
      >
        <span>Buka Form Evaluasi Gerai</span>
        <ArrowRight class="w-3.5 h-3.5" />
      </NuxtLink>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import MissionStatus from './MissionStatus.vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { calculateStars } from '~/utils/star.js'
import {
  Target,
  Users,
  Star,
  CheckCircle2,
  ArrowRight
} from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  mission: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const userStore = useUserStore()
const batchStore = useBatchStore()
const gamificationStore = useGamificationStore()

const currentBatch = computed(() => {
  const bId = props.mission?.batchId || batchStore.selectedBatchId
  return batchStore.batchById(bId) || batchStore.currentBatch
})

const currentBatchName = computed(() => {
  return currentBatch.value?.name || 'Batch Gerai'
})

const missionSubtitle = computed(() => {
  if (!props.mission) return ''
  return `${props.mission.code || 'MSN'} • ${batchStore.currentBatchUnitCode || 'Week'} ${props.mission.week || 1} • ${currentBatchName.value}`
})

const sopChecklist = computed(() => {
  if (!props.mission) return []
  if (Array.isArray(props.mission.requirements) && props.mission.requirements.length > 0) {
    return props.mission.requirements
  }
  if (Array.isArray(props.mission.sopChecklist) && props.mission.sopChecklist.length > 0) {
    return props.mission.sopChecklist
  }
  return []
})

// Build the roster of all crews assigned to this batch & mission with their evaluation scores
const crewRoster = computed(() => {
  if (!props.mission) return []

  const targetBatchId = props.mission.batchId || batchStore.selectedBatchId
  const b = (batchStore.batches || []).find(batch => batch.id === targetBatchId || batch.code === targetBatchId) || currentBatch.value

  let rawCrewList = []

  // 1. If specific assigned crew IDs are present, resolve them
  if (props.mission.assignedCrewIds && props.mission.assignedCrewIds.length > 0) {
    rawCrewList = props.mission.assignedCrewIds.map(id => {
      const found = gamificationStore.crewById(id)
      if (found) return found
      const user = (userStore.allUsers || userStore.userDirectory || []).find(u => u.id === id || u.userId === id)
      return user ? {
        id: user.id || user.userId,
        name: user.name,
        code: user.code || 'CRW',
        role: user.roleDetails?.roleName || user.role || user.position || 'Crew',
        avatar: user.avatar,
        outlet: user.department?.departmentName || user.storeLocation || b?.name || ''
      } : null
    }).filter(Boolean)
  }

  // 2. Fallback to batch-level crew lists
  if (rawCrewList.length === 0) {
    const fromGami = gamificationStore.crewsByBatch(targetBatchId) || []
    if (fromGami.length > 0) {
      rawCrewList = fromGami
    } else {
      const usersList = userStore.allUsers || userStore.userDirectory || []
      const usersFromStore = usersList.filter(u => u.batchId === targetBatchId || u.assignedBatchId === targetBatchId)
      if (usersFromStore.length > 0) {
        rawCrewList = usersFromStore.map((u, idx) => ({
          id: u.id || u.userId,
          code: u.code || `CRW-0${idx + 1}`,
          name: u.name,
          avatar: u.avatar,
          role: u.roleDetails?.roleName || u.role || u.position || 'Crew Specialist',
          outlet: u.storeLocation || u.department?.departmentName || b?.name || ''
        }))
      } else if (b?.users && Array.isArray(b.users) && b.users.length > 0) {
        rawCrewList = b.users.map((u, idx) => ({
          id: u.userId || u.id || `crew-${idx}`,
          code: u.code || `CRW-0${idx + 1}`,
          name: u.name || 'Crew Specialist',
          avatar: u.avatar,
          role: u.department?.name || u.role || u.position || 'Crew Specialist',
          outlet: b.name || ''
        }))
      }
    }
  }

  // 3. Fallback to any evaluations attached to the mission
  if (Array.isArray(props.mission.crewEvaluations)) {
    props.mission.crewEvaluations.forEach(e => {
      const cId = e.crewId || e.userId
      if (cId && !rawCrewList.some(c => (c.id === cId || c.userId === cId))) {
        rawCrewList.push({
          id: cId,
          name: e.crewName || 'Crew Specialist',
          code: 'CRW',
          role: 'Store Crew',
          avatar: '',
          outlet: b?.name || ''
        })
      }
    })
  }

  // Deduplicate crew list
  const uniqueCrews = []
  const seenIds = new Set()
  for (const c of rawCrewList) {
    const cId = c.id || c.userId || c.crewId
    if (cId && !seenIds.has(cId)) {
      seenIds.add(cId)
      uniqueCrews.push(c)
    }
  }

  // Map each crew to their specific evaluation on this mission
  return uniqueCrews.map((crew, idx) => {
    const cId = crew.id || crew.userId || crew.crewId
    const evalData = props.mission.crewEvaluations?.find(e => e.crewId === cId || e.userId === cId)

    const score = Number(evalData?.score ?? (evalData?.calculatedStars ? evalData.calculatedStars * 20 : 0))
    let status = evalData?.status || 'NOT_STARTED'
    if (evalData?.status === 'APPROVED_BY_DM' || evalData?.status === 'COMPLETED') {
      status = 'COMPLETED'
    } else if (evalData?.status === 'SCORED_BY_TL' || evalData?.status === 'PENDING_REVIEW') {
      status = 'PENDING_REVIEW'
    } else if (evalData?.status === 'REVISED_BY_DM' || evalData?.status === 'REVISION_REQUIRED') {
      status = 'REVISION_REQUIRED'
    } else if (score > 0) {
      status = 'COMPLETED'
    }

    return {
      id: cId,
      name: crew.name || crew.crewName || 'Crew Specialist',
      code: crew.code || `CRW-${String(idx + 1).padStart(2, '0')}`,
      role: crew.role || crew.position || 'Store Crew',
      avatar: crew.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(crew.name || 'Crew')}`,
      outlet: crew.outlet || crew.department || currentBatch.value?.storeLocation || currentBatchName.value,
      score,
      status
    }
  })
})

const completedCrewCount = computed(() => {
  return crewRoster.value.filter(c => c.status === 'COMPLETED' || c.status === 'APPROVED').length
})

const averageMissionScore = computed(() => {
  const scored = crewRoster.value.map(c => c.score).filter(s => s > 0)
  if (scored.length === 0) return 0
  return Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
})

function getCrewStatusLabel(status) {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
      return 'Selesai ✓'
    case 'PENDING_REVIEW':
    case 'SCORED_BY_TL':
      return 'Menunggu DM'
    case 'REVISION_REQUIRED':
    case 'REVISED_BY_DM':
      return 'Revisi'
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'Sedang Berjalan'
    default:
      return 'Belum Dimulai'
  }
}

function getCrewStatusClass(status) {
  switch (status) {
    case 'COMPLETED':
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    case 'PENDING_REVIEW':
    case 'SCORED_BY_TL':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    case 'REVISION_REQUIRED':
    case 'REVISED_BY_DM':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
    case 'IN_PROGRESS':
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
}
</script>
