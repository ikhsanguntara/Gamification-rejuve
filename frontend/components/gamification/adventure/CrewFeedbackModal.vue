<template>
  <BaseModal
    :model-value="modelValue"
    title="Feedback Pengalaman Onboarding Rejuve (1 Bulan)"
    subtitle="Survei pengalaman kolaborasi & pemahaman peran Anda sebagai tim store Re.juve"
    max-width="3xl"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
  >
    <template #icon>
      <div class="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold shadow-sm">
        <MessageSquareText class="w-5 h-5" />
      </div>
    </template>

    <div class="space-y-4 py-1">
      <!-- 1. Header Hero Banner Feedback -->
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 text-white shadow-md relative overflow-hidden space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
            Masa Onboarding 1 Bulan
          </span>
          <span v-if="hasSubmitted" class="text-xs font-bold text-amber-300">
            ★ Skor Kepuasan: {{ submittedData?.avgScore || '9.5' }}/10
          </span>
        </div>
        <h3 class="text-base sm:text-lg font-black tracking-tight">
          Halo Rejuve People, {{ crew?.name || 'Kru' }}! 🥤
        </h3>
        <p class="text-xs text-blue-100/90 leading-relaxed">
          Terima kasih telah meluangkan waktu. Masukan Anda sangat berharga untuk memastikan pengalaman kolaborasi dan bimbingan onboarding berjalan maksimal.
        </p>
      </div>

      <!-- 2. Form Informasi Responden -->
      <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase block">1. Nama Kru</span>
          <p class="font-bold text-slate-900 dark:text-white mt-0.5">
            {{ form.crewName }}
          </p>
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase block">2. Store Penempatan</span>
          <p class="font-bold text-slate-900 dark:text-white mt-0.5">
            {{ form.storeLocation }}
          </p>
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase block">3. Buddy / Store Leader</span>
          <p class="font-bold text-slate-900 dark:text-white mt-0.5">
            {{ form.buddyName }}
          </p>
        </div>
      </div>

      <!-- 3. Daftar Pertanyaan Survei (Rating 0-10 & Esai) -->
      <form @submit.prevent="handleSubmit" class="space-y-3 max-h-[48vh] overflow-y-auto pr-1">
        <div
          v-for="q in feedbackStore.surveyQuestions"
          :key="q.id"
          class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5"
        >
          <div class="flex items-start gap-2">
            <span class="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex-shrink-0 mt-0.5">
              {{ q.number }}.
            </span>
            <div class="space-y-0.5">
              <h4 class="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                {{ q.text }} <span class="text-rose-500">*</span>
              </h4>
              <span class="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">
                Fokus: {{ q.category }}
              </span>
            </div>
          </div>

          <!-- Skala 0 - 10 Rating -->
          <div v-if="q.type === 'SCALE_0_10'" class="pt-1">
            <div class="grid grid-cols-11 gap-1">
              <button
                v-for="val in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                :key="val"
                type="button"
                @click="form.ratings[q.id] = val"
                class="h-8 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center"
                :class="[
                  form.ratings[q.id] === val
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-105 ring-2 ring-blue-600/30'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                ]"
              >
                {{ val }}
              </button>
            </div>
            <div class="flex items-center justify-between text-[10px] font-semibold text-slate-400 px-0.5 pt-1">
              <span>Sangat Tidak Setuju (0)</span>
              <span>Netral (5)</span>
              <span>Sangat Setuju (10)</span>
            </div>
          </div>

          <!-- Esai / Masukan Terbuka -->
          <div v-else class="pt-1">
            <textarea
              v-model="form.essayAnswer"
              rows="3"
              required
              placeholder="Ceritakan pengalaman, kendala, atau hal berkesan selama 1 bulan onboarding..."
              class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-600 resize-none leading-relaxed"
            ></textarea>
          </div>
        </div>

        <!-- Submit Footer inside Form -->
        <div class="pt-2 flex items-center justify-between gap-3">
          <p class="text-[11px] text-slate-400">
            * Seluruh jawaban disimpan aman untuk evaluasi pengembangan program.
          </p>
          <button
            type="submit"
            class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send class="w-3.5 h-3.5" />
            <span>{{ hasSubmitted ? 'Perbarui Feedback' : 'Kirimkan Feedback Onboarding' }}</span>
          </button>
        </div>
      </form>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('close')"
        class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        Tutup
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useToast } from '~/composables/useToast.js'
import { MessageSquareText, Send } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  crew: { type: Object, default: null },
  batchName: { type: String, default: 'Batch 1 - Grand Indonesia' }
})

const emit = defineEmits(['update:modelValue', 'close'])

const feedbackStore = useFeedbackStore()
const toast = useToast()

const submittedData = computed(() => {
  if (!props.crew?.id) return null
  return feedbackStore.feedbackByCrewId(props.crew.id)
})

const hasSubmitted = computed(() => !!submittedData.value)

const form = ref({
  crewName: '',
  storeLocation: '',
  buddyName: '',
  ratings: {},
  essayAnswer: ''
})

const initForm = () => {
  const c = props.crew
  const existing = submittedData.value

  if (existing) {
    form.value = {
      crewName: existing.crewName || c?.name || 'Andi Pratama',
      storeLocation: existing.storeLocation || c?.storeLocation || 'Grand Indonesia',
      buddyName: existing.buddyName || 'Budi Santoso',
      ratings: { ...(existing.ratings || {}) },
      essayAnswer: existing.essayAnswer || ''
    }
  } else {
    // Default ratings 10 untuk 16 butir
    const defaultRatings = {}
    feedbackStore.surveyQuestions.forEach(q => {
      if (q.type === 'SCALE_0_10') {
        defaultRatings[q.id] = 10
      }
    })

    form.value = {
      crewName: c?.name || 'Andi Pratama',
      storeLocation: c?.storeLocation || 'Grand Indonesia',
      buddyName: 'Budi Santoso (Store Leader)',
      ratings: defaultRatings,
      essayAnswer: 'Program onboarding sangat jelas dan Store Leader mendampingi dengan penuh kesabaran.'
    }
  }
}

watch(() => [props.modelValue, props.crew], () => {
  if (props.modelValue) {
    initForm()
  }
}, { immediate: true })

const handleSubmit = () => {
  feedbackStore.submitCrewFeedback({
    crewId: props.crew?.id || 'crew-001',
    crewName: form.value.crewName,
    storeLocation: form.value.storeLocation,
    buddyName: form.value.buddyName,
    ratings: form.value.ratings,
    essayAnswer: form.value.essayAnswer
  })

  toast.success('Feedback Berhasil Dikirim', 'Terima kasih atas partisipasi Anda dalam survei onboarding Re.juve! 🌟')
  emit('close')
}
</script>
