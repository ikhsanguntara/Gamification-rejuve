<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-16">
    <!-- Header Banner -->
    <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white shadow-xl space-y-3 relative overflow-hidden">
      <div class="flex items-center gap-2">
        <span class="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
          Survei Kolaborasi & Onboarding
        </span>
        <span class="text-xs text-white/80 font-medium">
          Masa Onboarding 1 Bulan
        </span>
      </div>

      <h1 class="text-xl sm:text-2xl font-black tracking-tight leading-tight">
        Feedback Pengalaman Onboarding Rejuve – Collaboration
      </h1>

      <p class="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-2xl">
        Halo <strong>Rejuve People</strong>! Terima kasih telah meluangkan waktu untuk mengisi survei ini. Survei ini bertujuan untuk mengetahui pengalaman onboarding Anda di gerai serta memastikan pemahaman Anda terhadap peran sebagai tim store.
      </p>
    </div>

    <!-- Banner Status Jika Sudah Pernah Mengisi -->
    <div
      v-if="hasSubmitted"
      class="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start sm:items-center gap-3 text-emerald-900 dark:text-emerald-200 shadow-sm"
    >
      <div class="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
        <CheckCircle2 class="w-5 h-5" />
      </div>
      <div class="space-y-0.5">
        <h3 class="text-sm font-bold">Survei Feedback Onboarding Telah Terkirim</h3>
        <p class="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
          Terima kasih atas partisipasi Anda. Jawaban survei telah tersimpan dengan skor rata-rata kepuasan <strong>{{ submittedData?.avgScore || '10' }}/10</strong>. Kuesioner ini hanya dapat diisi 1 kali dan tidak dapat diubah kembali.
        </p>
      </div>
    </div>

    <!-- Info Banner Kru & Gerai -->
    <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
        Informasi Responden & Pendamping
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            1. Nama Kru *
          </label>
          <input
            v-model="surveyForm.crewName"
            type="text"
            :disabled="hasSubmitted"
            :required="!hasSubmitted"
            class="w-full text-xs font-bold rounded-xl border-none px-3.5 py-2.5 text-slate-900 dark:text-white transition-colors"
            :class="[
              hasSubmitted
                ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed'
                : 'bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600'
            ]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            2. Store Penempatan *
          </label>
          <input
            v-model="surveyForm.storeLocation"
            type="text"
            :disabled="hasSubmitted"
            :required="!hasSubmitted"
            class="w-full text-xs font-bold rounded-xl border-none px-3.5 py-2.5 text-slate-900 dark:text-white transition-colors"
            :class="[
              hasSubmitted
                ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed'
                : 'bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600'
            ]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            3. Nama Buddy / Store Leader *
          </label>
          <input
            v-model="surveyForm.buddyName"
            type="text"
            :disabled="hasSubmitted"
            :required="!hasSubmitted"
            class="w-full text-xs font-bold rounded-xl border-none px-3.5 py-2.5 text-slate-900 dark:text-white transition-colors"
            :class="[
              hasSubmitted
                ? 'bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed'
                : 'bg-slate-100 dark:bg-slate-800 focus:ring-2 focus:ring-blue-600'
            ]"
          />
        </div>
      </div>
    </div>

    <!-- List of Survey Questions -->
    <form @submit.prevent="submitFeedback" class="space-y-4">
      
      <div
        v-for="q in feedbackStore.surveyQuestions"
        :key="q.id"
        class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 transition-all"
      >
        <div class="flex items-start gap-2.5">
          <span class="text-xs font-black px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex-shrink-0 mt-0.5">
            {{ q.number }}.
          </span>
          <div class="space-y-1">
            <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
              {{ q.text }} <span v-if="!hasSubmitted" class="text-rose-500">*</span>
            </h4>
            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Fokus: {{ q.category }}
            </span>
          </div>
        </div>

        <!-- Rating Scale 0 to 10 for SCALE_0_10 Questions -->
        <div v-if="q.type === 'SCALE_0_10'" class="pt-2 space-y-2">
          <div class="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 px-0.5 sm:grid sm:grid-cols-11 sm:gap-2 sm:overflow-visible no-scrollbar">
            <button
              v-for="val in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
              :key="val"
              type="button"
              :disabled="hasSubmitted"
              @click="!hasSubmitted && (surveyForm.ratings[q.id] = val)"
              class="min-w-[40px] h-10 sm:min-w-0 sm:h-10 flex-shrink-0 sm:flex-shrink rounded-xl text-xs font-bold border transition-all flex items-center justify-center shadow-2xs"
              :class="[
                surveyForm.ratings[q.id] === val
                  ? (hasSubmitted
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/30 scale-105 cursor-pointer')
                  : (hasSubmitted
                      ? 'bg-slate-100/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 cursor-pointer')
              ]"
            >
              {{ val }}
            </button>
          </div>

          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1 pt-1">
            <span>Sangat Tidak Setuju (0)</span>
            <span class="hidden sm:inline">Netral (5)</span>
            <span>Sangat Setuju (10)</span>
          </div>
        </div>

        <!-- Open Essay for ESSAY Questions -->
        <div v-else class="pt-2">
          <textarea
            v-model="surveyForm.essayAnswers[q.id]"
            rows="4"
            :required="!hasSubmitted"
            :disabled="hasSubmitted"
            :readonly="hasSubmitted"
            :placeholder="`Tuliskan masukan untuk ${q.text}...`"
            class="w-full text-xs rounded-2xl border p-3 text-slate-900 dark:text-white placeholder-slate-400 resize-none leading-relaxed transition-colors"
            :class="[
              hasSubmitted
                ? 'bg-slate-100/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-not-allowed'
                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-600'
            ]"
          ></textarea>
        </div>
      </div>

      <!-- Action Submit / Completed Box -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div v-if="hasSubmitted" class="space-y-0.5">
          <div class="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 class="w-4 h-4" />
            <span>Survei Telah Selesai</span>
          </div>
          <p class="text-[11px] text-slate-400">
            Feedback telah tercatat permanen dalam sistem evaluasi Re.juve Onboarding.
          </p>
        </div>

        <div v-else class="space-y-0.5">
          <span class="text-xs font-bold text-slate-900 dark:text-white">
            Konfirmasi Pengiriman Feedback
          </span>
          <p class="text-[11px] text-slate-400">
            Pastikan seluruh pertanyaan telah terisi dengan jujur untuk evaluasi pengembangan program.
          </p>
        </div>

        <NuxtLink
          v-if="hasSubmitted"
          :to="userStore.isCrew ? '/journey' : '/dashboard'"
          class="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{{ userStore.isCrew ? 'Kembali ke Petualangan Misi' : 'Kembali ke Dashboard' }}</span>
        </NuxtLink>

        <button
          v-else
          type="submit"
          class="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send class="w-4 h-4" />
          <span>Kirimkan Feedback Onboarding</span>
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useToast } from '~/composables/useToast.js'
import { useConfetti } from '~/composables/useConfetti.js'
import { Send, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const feedbackStore = useFeedbackStore()
const toast = useToast()
const confetti = useConfetti()

const currentCrewId = computed(() => userStore.currentUserId || userStore.currentUser?.id || userStore.currentUser?.userId || '')

const submittedData = computed(() => {
  return feedbackStore.feedbackByCrewId(currentCrewId.value)
})

const hasSubmitted = computed(() => !!submittedData.value)

const surveyForm = ref({
  crewName: userStore.currentUser?.name || 'Kru',
  storeLocation: userStore.currentUser?.storeLocation || userStore.currentUser?.department || 'Gerai Re.juve',
  buddyName: userStore.currentUser?.buddyName || 'Store Leader / Mentor',
  ratings: {},
  essayAnswers: {},
  essayAnswer: ''
})

onMounted(async () => {
  await Promise.allSettled([
    feedbackStore.fetchQuestionsFromApi(),
    feedbackStore.fetchMyFeedbackFromApi()
  ])

  const existing = submittedData.value
  
  if (existing) {
    const existingEssayAnswers = { ...(existing.essayAnswers || {}) }
    if (existing.essayAnswer && Object.keys(existingEssayAnswers).length === 0) {
      feedbackStore.surveyQuestions.forEach(q => {
        if (q.type === 'ESSAY') {
          existingEssayAnswers[q.id] = existing.essayAnswer
        }
      })
    }

    surveyForm.value = {
      crewName: existing.crewName || userStore.currentUser?.name || 'Kru',
      storeLocation: existing.storeLocation || userStore.currentUser?.storeLocation || userStore.currentUser?.department || 'Gerai Re.juve',
      buddyName: existing.buddyName || 'Store Leader / Mentor',
      ratings: { ...(existing.ratings || {}) },
      essayAnswers: existingEssayAnswers,
      essayAnswer: existing.essayAnswer || ''
    }
  } else {
    // Default all ratings to 10 and default essays
    const defaultRatings = {}
    const defaultEssayAnswers = {}

    feedbackStore.surveyQuestions.forEach(q => {
      if (q.type === 'SCALE_0_10') {
        defaultRatings[q.id] = 10
      } else {
        const textLower = (q.text || '').toLowerCase()
        if (textLower.includes('nama kru') || textLower === 'nama') {
          defaultEssayAnswers[q.id] = userStore.currentUser?.name || ''
        } else if (textLower.includes('store') || textLower.includes('penempatan') || textLower.includes('gerai')) {
          defaultEssayAnswers[q.id] = userStore.currentUser?.storeLocation || userStore.currentUser?.department || 'Gerai Re.juve'
        } else if (textLower.includes('buddy') || textLower.includes('mentor') || textLower.includes('leader')) {
          defaultEssayAnswers[q.id] = userStore.currentUser?.buddyName || 'Store Leader / Mentor'
        } else {
          defaultEssayAnswers[q.id] = ''
        }
      }
    })

    surveyForm.value.ratings = defaultRatings
    surveyForm.value.essayAnswers = defaultEssayAnswers
  }
})

const submitFeedback = async () => {
  if (hasSubmitted.value) {
    toast.info('Sudah Mengisi Feedback', 'Anda sudah pernah mengisi survei onboarding ini.')
    return
  }

  const combinedEssayAnswer = Object.values(surveyForm.value.essayAnswers).filter(Boolean).join(' | ') || surveyForm.value.essayAnswer

  try {
    await feedbackStore.submitSurveyToApi({
      crewId: currentCrewId.value,
      crewName: surveyForm.value.crewName,
      storeLocation: surveyForm.value.storeLocation,
      buddyName: surveyForm.value.buddyName,
      ratings: surveyForm.value.ratings,
      essayAnswers: surveyForm.value.essayAnswers,
      essayAnswer: combinedEssayAnswer
    })

    // Efek semarak bintang gamifikasi
    confetti.triggerApprovalStars({ x: 0.5, y: 0.35 })

    toast.success(
      'Feedback Berhasil Terkirim!',
      'Terima kasih atas masukan berharga Anda untuk evaluasi program Onboarding & Buddy.'
    )

    router.push('/dashboard')
  } catch (err) {
    toast.error('Gagal Mengirim Feedback', err.message || 'Terjadi kesalahan saat menyimpan feedback.')
  }
}
</script>
