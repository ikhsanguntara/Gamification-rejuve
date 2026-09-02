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
            required
            class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            2. Store Penempatan *
          </label>
          <input
            v-model="surveyForm.storeLocation"
            type="text"
            required
            class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            3. Nama Buddy / Store Leader *
          </label>
          <input
            v-model="surveyForm.buddyName"
            type="text"
            required
            class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
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
              {{ q.text }} <span class="text-rose-500">*</span>
            </h4>
            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
              Fokus: {{ q.category }}
            </span>
          </div>
        </div>

        <!-- Rating Scale 0 to 10 for SCALE_0_10 Questions -->
        <div v-if="q.type === 'SCALE_0_10'" class="pt-2 space-y-2">
          <div class="grid grid-cols-11 gap-1 sm:gap-2">
            <button
              v-for="val in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
              :key="val"
              type="button"
              @click="surveyForm.ratings[q.id] = val"
              class="h-9 sm:h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center"
              :class="[
                surveyForm.ratings[q.id] === val
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/30 scale-105'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300'
              ]"
            >
              {{ val }}
            </button>
          </div>

          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1 pt-1">
            <span>Sangat Tidak Setuju (0)</span>
            <span>Netral (5)</span>
            <span>Sangat Setuju (10)</span>
          </div>
        </div>

        <!-- Open Essay for ESSAY Questions -->
        <div v-else class="pt-2">
          <textarea
            v-model="surveyForm.essayAnswer"
            rows="4"
            required
            placeholder="Tuliskan pengalaman Anda secara detail di sini..."
            class="w-full text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 resize-none leading-relaxed"
          ></textarea>
        </div>
      </div>

      <!-- Action Submit Button -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-0.5">
          <span class="text-xs font-bold text-slate-900 dark:text-white">
            Konfirmasi Pengiriman Feedback
          </span>
          <p class="text-[11px] text-slate-400">
            Pastikan seluruh pertanyaan telah terisi dengan jujur untuk evaluasi pengembangan program.
          </p>
        </div>

        <button
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useToast } from '~/composables/useToast.js'
import { Send } from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const feedbackStore = useFeedbackStore()
const toast = useToast()

const surveyForm = ref({
  crewName: userStore.currentUser?.name || 'Kru Rejuve',
  storeLocation: userStore.currentUser?.storeLocation || 'Gerai Grand Indonesia',
  buddyName: 'Budi Santoso (Store Leader)',
  ratings: {},
  essayAnswer: ''
})

onMounted(() => {
  const currentCrewId = userStore.currentUserId
  const existing = feedbackStore.feedbackByCrewId(currentCrewId)
  
  if (existing) {
    surveyForm.value = {
      crewName: existing.crewName,
      storeLocation: existing.storeLocation,
      buddyName: existing.buddyName,
      ratings: { ...existing.ratings },
      essayAnswer: existing.essayAnswer
    }
  } else {
    // Default all ratings to 10
    const defaultRatings = {}
    feedbackStore.surveyQuestions.forEach(q => {
      if (q.type === 'SCALE_0_10') {
        defaultRatings[q.id] = 10
      }
    })
    surveyForm.value.ratings = defaultRatings
  }
})

const submitFeedback = () => {
  const currentCrewId = userStore.currentUserId || 'crew-001'

  feedbackStore.submitCrewFeedback({
    crewId: currentCrewId,
    crewName: surveyForm.value.crewName,
    storeLocation: surveyForm.value.storeLocation,
    buddyName: surveyForm.value.buddyName,
    ratings: surveyForm.value.ratings,
    essayAnswer: surveyForm.value.essayAnswer
  })

  toast.success(
    'Feedback Berhasil Terkirim!',
    'Terima kasih atas masukan berharga Anda untuk evaluasi program Onboarding & Buddy.'
  )

  router.push('/dashboard')
}
</script>
