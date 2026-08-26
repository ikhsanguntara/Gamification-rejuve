<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-6">
    <!-- Top Form Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-bold text-slate-400">
            {{ mission.code }}
          </span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
            Week {{ mission.week }}
          </span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#963189]/10 text-[#963189] dark:text-[#db92d7]">
            {{ mission.category }}
          </span>
          <MissionStatus :status="mission.status" />
        </div>
        <h3 class="text-lg font-black text-slate-900 dark:text-white">
          {{ mission.title }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {{ mission.description }}
        </p>
      </div>

      <!-- Batch Location Badge -->
      <div class="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
        <div class="text-right">
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Batch</p>
          <p class="text-xs font-extrabold text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Requirements Checklist Box -->
    <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
      <span class="font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider text-[10px]">
        SOP Quality Checklist Requirements:
      </span>
      <ul class="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
        <li v-for="(req, idx) in mission.requirements" :key="idx" class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-[#499ec7]"></span>
          <span>{{ req }}</span>
        </li>
      </ul>
    </div>

    <!-- Revision Banner if status is REVISION_REQUIRED -->
    <div
      v-if="mission.status === 'REVISION_REQUIRED' && revisionNote"
      class="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-1"
    >
      <div class="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
        <RotateCcw class="w-4 h-4" />
        <span>Head Review Revision Required</span>
      </div>
      <p class="text-xs text-rose-800 dark:text-rose-200 italic leading-relaxed">
        "{{ revisionNote }}"
      </p>
    </div>

    <!-- Week Locked Warning Banner -->
    <div
      v-if="isLocked"
      class="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3"
    >
      <Lock class="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
      <div>
        <p class="font-bold text-slate-800 dark:text-slate-200">🔒 Week Locked</p>
        <p class="mt-0.5">This week's evaluation is read-only. Scores cannot be modified for locked weeks.</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmitClick" class="space-y-6">
      <!-- 1. Multi-Crew Individual Scoring Roster -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>All Store Crew Scoring Roster ({{ batchCrews.length }} Members)</span>
            </label>
            <p class="text-[11px] text-slate-400">
              Set individual objective scores for each crew member. Stars (1–5 ⭐) calculate automatically.
            </p>
          </div>

          <!-- Quick Bulk Score Helpers -->
          <div v-if="!isLocked" class="flex items-center gap-1.5">
            <span class="text-[10px] font-bold text-slate-400 uppercase">Set All:</span>
            <button
              type="button"
              @click="applyBulkScore(95)"
              class="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              95 (5⭐)
            </button>
            <button
              type="button"
              @click="applyBulkScore(90)"
              class="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              90 (5⭐)
            </button>
            <button
              type="button"
              @click="applyBulkScore(85)"
              class="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              85 (4⭐)
            </button>
          </div>
        </div>

        <!-- Crew Sliders List -->
        <div class="space-y-3">
          <div
            v-for="crew in batchCrews"
            :key="crew.id"
            class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
          >
            <div class="flex items-center justify-between gap-3">
              <!-- Crew Profile Info -->
              <div class="flex items-center gap-3 min-w-0">
                <img
                  :src="crew.avatar"
                  :alt="crew.name"
                  class="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                />
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {{ crew.name }}
                    </h4>
                    <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      Lvl {{ crew.level }}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-400 truncate">
                    {{ crew.code }} • {{ crew.position }}
                  </p>
                </div>
              </div>

              <!-- Calculated Stars for this Crew -->
              <div class="flex items-center gap-3 flex-shrink-0">
                <StarReward :score="crewScoresMap[crew.id] || 0" size="sm" />
                <div class="w-14">
                  <input
                    v-model.number="crewScoresMap[crew.id]"
                    type="number"
                    min="0"
                    max="100"
                    :disabled="isLocked"
                    class="w-full text-center text-xs font-extrabold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-1 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7] disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <!-- Score Range Slider -->
            <div class="flex items-center gap-3 pt-1">
              <input
                v-model.number="crewScoresMap[crew.id]"
                type="range"
                min="0"
                max="100"
                step="1"
                :disabled="isLocked"
                class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#499ec7] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Aggregate Summary Bar -->
        <div class="p-3.5 rounded-xl bg-gradient-to-r from-[#499ec7]/10 to-[#963189]/10 border border-[#499ec7]/20 flex items-center justify-between text-xs">
          <span class="font-bold text-slate-700 dark:text-slate-300">
            Batch Average Score:
          </span>
          <div class="flex items-center gap-2">
            <span class="font-extrabold text-[#24779f] dark:text-[#84cded] text-sm">
              {{ averageBatchScore }} / 100
            </span>
            <span class="text-slate-400">•</span>
            <span class="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Star class="w-3.5 h-3.5 fill-amber-400" />
              Avg {{ averageCalculatedStars }} Stars
            </span>
          </div>
        </div>
      </div>

      <!-- 2. Evidence Photos Section -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Inspection Photos & Evidence ({{ formData.evidence.length }})
            </label>
            <p class="text-[11px] text-slate-400">
              Attach store audit photos, sanitizer logs, or thermometer readouts
            </p>
          </div>

          <button
            v-if="!isLocked"
            type="button"
            @click="showAddEvidenceModal = true"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add Evidence</span>
          </button>
        </div>

        <!-- Evidence Gallery Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="(img, idx) in formData.evidence"
            :key="idx"
            class="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800"
          >
            <img
              :src="img.url"
              :alt="img.caption"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-slate-950/70 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="text-[10px] text-white font-medium truncate">{{ img.caption }}</span>
              <button
                v-if="!isLocked"
                type="button"
                @click="removeEvidence(idx)"
                class="self-end p-1 rounded-md bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                title="Remove photo"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <!-- Add Evidence placeholder button if empty -->
          <div
            v-if="formData.evidence.length === 0"
            @click="!isLocked && (showAddEvidenceModal = true)"
            class="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-[#499ec7] cursor-pointer transition-colors"
          >
            <Image class="w-6 h-6 mb-1 text-slate-400" />
            <span class="text-xs font-semibold">No evidence attached yet</span>
            <span class="text-[10px] mt-0.5">Click to select inspection proof photos</span>
          </div>
        </div>
      </div>

      <!-- 3. Comments Textarea -->
      <div class="space-y-1.5">
        <label class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Supervisor Observations & Findings
        </label>
        <textarea
          v-model="formData.comment"
          rows="3"
          :disabled="isLocked"
          placeholder="Write thorough evaluation observations, procedural compliance, and constructive feedback for the store crew..."
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#499ec7] disabled:opacity-50"
        ></textarea>
      </div>

      <!-- Action Buttons -->
      <div v-if="!isLocked" class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="handleSaveDraft"
          class="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Save Draft
        </button>

        <button
          type="submit"
          class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#499ec7] to-[#24779f] hover:from-[#24779f] hover:to-[#1d5e7f] text-white shadow-md shadow-[#499ec7]/20 transition-all active:scale-95"
        >
          <Send class="w-3.5 h-3.5" />
          <span>{{ mission.status === 'REVISION_REQUIRED' ? 'Resubmit All Crew for Head Review' : 'Submit All Crew for Head Review' }}</span>
        </button>
      </div>
    </form>

    <!-- Confirmation Modal for Submit -->
    <ConfirmationModal
      :modelValue="showConfirmModal"
      title="Submit Store Mission Evaluation for Head Review?"
      :subtitle="`${mission.title} • Assessed ${batchCrews.length} Crew Members`"
      confirm-text="Submit for Review"
      variant="star"
      @update:modelValue="showConfirmModal = $event"
      @confirm="executeSubmit"
      @cancel="showConfirmModal = false"
    >
      <div class="space-y-3">
        <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
          <span class="text-xs font-bold text-amber-900 dark:text-amber-200">Average Batch Score:</span>
          <span class="font-extrabold text-amber-600 dark:text-amber-400 text-sm">{{ averageBatchScore }}/100 (Avg {{ averageCalculatedStars }} ⭐)</span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Once submitted, this mission and individual scores for all {{ batchCrews.length }} crew members will enter the Head Review queue. Stars will be officially credited to crew accounts upon Head approval.
        </p>
      </div>
    </ConfirmationModal>

    <!-- Add Evidence Mock Picker Modal -->
    <BaseModal
      :modelValue="showAddEvidenceModal"
      title="Select Mock Evidence Photo"
      subtitle="Choose field inspection images to attach as proof"
      max-width="md"
      @update:modelValue="showAddEvidenceModal = $event"
      @close="showAddEvidenceModal = false"
    >
      <div class="grid grid-cols-2 gap-3 py-2">
        <div
          v-for="mockImg in availableMockEvidence"
          :key="mockImg.url"
          @click="addEvidenceItem(mockImg)"
          class="cursor-pointer group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video relative hover:ring-2 hover:ring-[#499ec7] transition-all"
        >
          <img :src="mockImg.url" :alt="mockImg.caption" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-slate-950/60 flex items-end p-2 opacity-90 group-hover:opacity-100">
            <span class="text-[10px] text-white font-medium truncate">{{ mockImg.caption }}</span>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { useToast } from '~/composables/useToast.js'
import { calculateStars } from '~/utils/star.js'
import MissionStatus from './MissionStatus.vue'
import StarReward from '~/components/gamification/StarReward.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import {
  Lock,
  Plus,
  Trash2,
  Image,
  Send,
  RotateCcw,
  Star
} from 'lucide-vue-next'

const props = defineProps({
  mission: {
    type: Object,
    required: true
  },
  initialEvaluation: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['saved', 'submitted'])

const userStore = useUserStore()
const batchStore = useBatchStore()
const evalStore = useEvaluationStore()
const gamificationStore = useGamificationStore()
const toast = useToast()

const showConfirmModal = ref(false)
const showAddEvidenceModal = ref(false)

const isLocked = computed(() => {
  return props.mission.week !== batchStore.activeWeekNumber
})

const batchCrews = computed(() => {
  return gamificationStore.crewsByBatch(props.mission.batchId || batchStore.selectedBatchId)
})

const revisionNote = computed(() => {
  if (!props.initialEvaluation?.revisionHistory?.length) return null
  return props.initialEvaluation.revisionHistory[props.initialEvaluation.revisionHistory.length - 1].note
})

const crewScoresMap = reactive({})

const formData = reactive({
  comment: props.initialEvaluation?.comment || '',
  evidence: props.initialEvaluation?.evidence ? [...props.initialEvaluation.evidence] : [
    {
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      caption: 'Cold chain temperature sensor log verification'
    }
  ]
})

// Initialize or update crew scores when mission changes
watch(
  () => [props.mission?.id, props.initialEvaluation, batchCrews.value],
  () => {
    const scores = {}
    
    // Check initialEvaluation crewScores first
    if (props.initialEvaluation?.crewScores && props.initialEvaluation.crewScores.length > 0) {
      props.initialEvaluation.crewScores.forEach(cs => {
        scores[cs.crewId] = cs.score
      })
    } else if (props.mission?.crewEvaluations && props.mission.crewEvaluations.length > 0) {
      props.mission.crewEvaluations.forEach(ce => {
        scores[ce.crewId] = ce.score
      })
    }

    // Default fallback for any remaining crew in the batch
    batchCrews.value.forEach(c => {
      if (scores[c.id] === undefined) {
        scores[c.id] = props.mission?.averageScore > 0 ? props.mission.averageScore : 88
      }
      crewScoresMap[c.id] = scores[c.id]
    })

    formData.comment = props.initialEvaluation?.comment || props.mission?.description || ''
    formData.evidence = props.initialEvaluation?.evidence
      ? [...props.initialEvaluation.evidence]
      : [
          {
            url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
            caption: 'Inspection proof photo'
          }
        ]
  },
  { immediate: true, deep: true }
)

const averageBatchScore = computed(() => {
  const values = Object.values(crewScoresMap)
  if (values.length === 0) return 0
  const sum = values.reduce((a, b) => a + (Number(b) || 0), 0)
  return Math.round(sum / values.length)
})

const averageCalculatedStars = computed(() => {
  return calculateStars(averageBatchScore.value)
})

const applyBulkScore = (targetScore) => {
  batchCrews.value.forEach(c => {
    crewScoresMap[c.id] = targetScore
  })
  toast.info('Bulk Score Applied', `All ${batchCrews.value.length} crew set to score ${targetScore}`)
}

const availableMockEvidence = [
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    caption: 'Refractometer Brix level log & yield measurement'
  },
  {
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    caption: 'Cold-pressed quality certificate signed by team'
  },
  {
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    caption: 'Store front glass and counter sanitation check'
  },
  {
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
    caption: 'Chiller inventory reconciliation scanning'
  }
]

const addEvidenceItem = (mockImg) => {
  formData.evidence.push({ ...mockImg })
  showAddEvidenceModal.value = false
  toast.success('Evidence Added', mockImg.caption)
}

const removeEvidence = (index) => {
  formData.evidence.splice(index, 1)
}

const buildCrewScoresPayload = () => {
  return batchCrews.value.map(c => ({
    crewId: c.id,
    score: Number(crewScoresMap[c.id]) || 0
  }))
}

const handleSaveDraft = () => {
  evalStore.saveDraft({
    missionId: props.mission.id,
    supervisorId: userStore.currentUser.id,
    supervisorName: userStore.currentUser.name,
    crewScores: buildCrewScoresPayload(),
    comment: formData.comment,
    evidence: formData.evidence
  })
  toast.success('Draft Saved', `Saved multi-crew evaluation draft for ${props.mission.title}`)
  emit('saved')
}

const handleSubmitClick = () => {
  showConfirmModal.value = true
}

const executeSubmit = () => {
  showConfirmModal.value = false
  const crewScores = buildCrewScoresPayload()

  if (props.mission.status === 'REVISION_REQUIRED' && props.initialEvaluation?.id) {
    evalStore.resubmitEvaluation(props.initialEvaluation.id, {
      crewScores,
      comment: formData.comment,
      evidence: formData.evidence
    })
    toast.success('Store Evaluation Resubmitted', `Resubmitted evaluation for all ${batchCrews.value.length} crew to Head review`)
  } else {
    evalStore.submitForReview({
      missionId: props.mission.id,
      supervisorId: userStore.currentUser.id,
      supervisorName: userStore.currentUser.name,
      crewScores,
      comment: formData.comment,
      evidence: formData.evidence
    })
    toast.success('Submitted for Review', `Store evaluation for all ${batchCrews.value.length} crew submitted to Head queue`)
  }

  emit('submitted')
}
</script>
