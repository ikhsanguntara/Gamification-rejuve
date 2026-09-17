<template>
  <BaseModal
    :modelValue="modelValue"
    title="Verifikasi Evaluasi Misi"
    :subtitle="item ? `${item.missionCode || item.code || 'MSN'} • ${item.missionTitle || item.title || item.missionCategory || 'Misi Operasional'}` : ''"
    max-width="lg"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('cancel')"
  >
    <template #icon>
      <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-500 flex items-center justify-center">
        <Star class="w-5 h-5 fill-amber-400" />
      </div>
    </template>

    <div v-if="item" class="space-y-4 py-1">
      <!-- 1. Ringkasan Kru & Lokasi (Clean & Minimalist) -->
      <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#831843] to-[#500e28] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
            <img
              v-if="item.crewAvatar"
              :src="item.crewAvatar"
              :alt="item.crewName"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ (item.crewName || 'C').charAt(0) }}</span>
          </div>
          <div class="min-w-0">
            <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate">
              {{ item.crewName || 'Crew Member' }}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
              <span class="font-medium text-[#831843] dark:text-[#f472b6]">{{ item.crewRole || 'Crew' }}</span>
              <span>•</span>
              <span>Week {{ item.week || 1 }}</span>
              <span>•</span>
              <span>🏪 {{ item.storeLocation || item.storeName || 'Re.juve Gerai' }}</span>
            </p>
          </div>
        </div>
        <span class="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] dark:bg-[#831843]/20 flex-shrink-0">
          {{ item.missionCode || 'MSN' }}
        </span>
      </div>

      <!-- 2. Dual Skor: Store Leader vs District Manager -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Kolom Store Leader -->
        <div class="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                Skor Store Leader
              </span>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Diajukan
              </span>
            </div>

            <div class="flex items-baseline gap-2 my-1">
              <span class="text-3xl font-black text-slate-800 dark:text-white">
                {{ slScore }}
              </span>
              <span class="text-xs text-slate-400 font-semibold">/ 100</span>
              <span class="text-xs text-amber-500 font-bold ml-auto flex items-center gap-0.5">
                <Star class="w-3.5 h-3.5 fill-amber-400" />
                {{ calculateStars(slScore) }}
              </span>
            </div>
          </div>

          <div class="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60">
            <span class="text-[10px] font-semibold text-slate-400 block mb-0.5">Catatan SL:</span>
            <p class="text-xs text-slate-600 dark:text-slate-300 italic leading-snug line-clamp-2">
              "{{ item.comment || item.tlNotes || 'Standar SOP operasional telah diperiksa dan terpenuhi.' }}"
            </p>
          </div>
        </div>

        <!-- Kolom District Manager (Interaktif & Modern) -->
        <div class="p-3.5 rounded-2xl bg-gradient-to-br from-[#831843]/5 to-transparent dark:from-[#831843]/15 border border-[#831843]/20 dark:border-[#831843]/40 flex flex-col justify-between space-y-2.5">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] font-bold uppercase tracking-wider text-[#831843] dark:text-[#f472b6] flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-[#831843] dark:bg-[#f472b6]"></span>
                Nilai DM (Anda)
              </span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all"
                :class="getScoreTier(dmScore).bgSoftClass"
              >
                {{ getScoreTier(dmScore).label }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-2">
              <div class="flex items-baseline gap-1.5">
                <input
                  :value="dmScore"
                  @input="onDmScoreInput($event)"
                  type="number"
                  min="0"
                  max="100"
                  class="w-16 sm:w-20 text-3xl font-black bg-transparent border-b-2 outline-none p-0 text-center focus:border-[#831843] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  :class="getScoreTier(dmScore).textClass"
                  :style="{ borderColor: getScoreTier(dmScore).color }"
                />
                <span class="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <span class="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                <Star class="w-3.5 h-3.5 fill-amber-400" />
                {{ calculateStars(dmScore) }}
              </span>
            </div>
          </div>

          <!-- Slider Nilai DM -->
          <div class="space-y-1.5 pt-0.5">
            <input
              v-model.number="dmScore"
              type="range"
              min="0"
              max="100"
              step="1"
              :style="getSliderTrackStyle(dmScore)"
              class="w-full h-2 rounded-full appearance-none cursor-pointer custom-score-slider shadow-xs"
            />
            <!-- Quick Preset Pills -->
            <div class="flex items-center justify-between gap-1 pt-0.5">
              <button
                type="button"
                @click="dmScore = slScore"
                class="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Samakan dengan nilai SL"
              >
                = SL ({{ slScore }})
              </button>
              <button
                v-for="p in [80, 90, 100]"
                :key="p"
                type="button"
                @click="dmScore = p"
                :class="dmScore === p ? 'bg-[#831843] text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'"
                class="text-[10px] px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer"
              >
                {{ p }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Foto Bukti Operasional (SL) -->
      <div v-if="evidenceList.length > 0" class="space-y-2 p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Camera class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
            <span>Foto Bukti Lapangan / SOP ({{ evidenceList.length }})</span>
          </span>
          <span class="text-[10px] text-slate-400 font-medium">Klik foto untuk perbesar</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div
            v-for="(ev, idx) in evidenceList"
            :key="idx"
            @click="previewImage = ev"
            class="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-2xs hover:ring-2 hover:ring-[#831843] transition-all"
            title="Klik untuk memperbesar foto bukti"
          >
            <img
              :src="getEvidenceUrl(ev)"
              :alt="getEvidenceCaption(ev)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div class="absolute inset-0 bg-slate-950/60 flex items-end justify-between p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="text-[10px] text-white truncate">{{ getEvidenceCaption(ev) }}</span>
              <Eye class="w-3 h-3 text-white flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Nilai Gabungan (SL + DM) & Pencairan Bintang -->
      <div class="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#500e28] text-white shadow-md flex items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <span>Rata-rata: (SL {{ slScore }} + DM {{ dmScore }}) / 2 = {{ finalScore }} Poin</span>
          </div>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black tracking-tight text-white">{{ finalScore }}</span>
            <span class="text-xs text-slate-300">/ 100 Poin</span>
            <span class="text-[10px] text-slate-400 font-normal ml-1">({{ finalScore }}/100 × 5 = {{ finalStars }}⭐)</span>
          </div>
        </div>

        <div class="text-right">
          <span class="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">Pencairan Reward</span>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 mt-0.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
            <span class="text-sm font-black text-amber-300">+{{ finalStars }} Bintang</span>
          </div>
        </div>
      </div>

      <!-- 5. Catatan DM (Opsional) -->
      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>Catatan / Arahan DM (Opsional):</span>
          <span v-if="isAdjusted" class="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Nilai disesuaikan ({{ slScore }} → {{ dmScore }})
          </span>
        </label>
        <textarea
          v-model="dmNote"
          rows="2"
          placeholder="Tuliskan arahan atau feedback untuk kru & Store Leader..."
          class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#831843] resize-none"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        Batal
      </button>
      <button
        type="button"
        @click="$emit('confirm', { dmScore, score: finalScore, dmNote })"
        class="inline-flex items-center gap-2 px-5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white shadow-md shadow-[#831843]/20 transition-all active:scale-95 cursor-pointer"
      >
        <Star class="w-3.5 h-3.5 fill-white" />
        <span>Setujui & Beri +{{ finalStars }} ⭐</span>
      </button>
    </template>
  </BaseModal>

  <!-- Image Preview Lightbox Modal -->
  <BaseModal
    :model-value="!!previewImage"
    :title="getEvidenceCaption(previewImage)"
    max-width="2xl"
    @update:model-value="previewImage = null"
    @close="previewImage = null"
  >
    <template #icon>
      <div class="w-9 h-9 rounded-xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center">
        <Camera class="w-5 h-5" />
      </div>
    </template>

    <div v-if="previewImage" class="space-y-3 py-2">
      <div class="rounded-2xl overflow-hidden bg-slate-950/5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2">
        <img
          :src="getEvidenceUrl(previewImage)"
          :alt="getEvidenceCaption(previewImage)"
          class="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md"
        />
      </div>
      <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
        <span class="font-semibold text-slate-800 dark:text-slate-200">
          📄 {{ getEvidenceCaption(previewImage) }}
        </span>
        <span v-if="item" class="text-slate-400 text-[11px]">
          Kru: {{ item.crewName }} ({{ item.missionCode }})
        </span>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="previewImage = null"
        class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-xs transition-all cursor-pointer"
      >
        Tutup
      </button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { calculateStars, calculateAverageDmSl } from '~/utils/star.js'
import { Star, Camera, Eye } from 'lucide-vue-next'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
})

defineEmits(['update:modelValue', 'confirm', 'cancel'])

const previewImage = ref(null)
const slScore = computed(() => Number(props.item?.slScore ?? props.item?.originalScore ?? props.item?.score ?? props.item?.averageScore ?? 0))
const dmScore = ref(0)
const dmNote = ref('')

const evidenceList = computed(() => {
  if (!props.item) return []
  if (Array.isArray(props.item.evidenceList) && props.item.evidenceList.length > 0) {
    return props.item.evidenceList
  }
  if (Array.isArray(props.item.evidence) && props.item.evidence.length > 0) {
    return props.item.evidence
  }
  if (Array.isArray(props.item.photos) && props.item.photos.length > 0) {
    return props.item.photos
  }
  if (Array.isArray(props.item.evidences) && props.item.evidences.length > 0) {
    return props.item.evidences
  }
  if (props.item.evidenceUrl) {
    return [{ url: props.item.evidenceUrl, caption: props.item.evidenceCaption || 'Foto Bukti Lapangan' }]
  }
  if (props.item.photoUrl) {
    return [{ url: props.item.photoUrl, caption: 'Foto Bukti Lapangan' }]
  }
  return []
})

function getEvidenceUrl(ev) {
  if (!ev) return ''
  if (typeof ev === 'string') return ev
  return ev.url || ''
}

function getEvidenceCaption(ev) {
  if (!ev) return 'Foto Bukti'
  if (typeof ev === 'string') return 'Foto Bukti Lapangan SOP'
  return ev.caption || 'Foto Bukti Lapangan SOP'
}

watch(() => props.item, (newItem) => {
  if (newItem) {
    const base = Number(newItem.slScore ?? newItem.originalScore ?? newItem.score ?? newItem.averageScore ?? 0)
    dmScore.value = Number(newItem.dmScore ?? base)
    dmNote.value = newItem.dmNote || ''
  }
}, { immediate: true, deep: true })

function onDmScoreInput(event) {
  const raw = event.target.value
  if (raw === '' || raw === null || raw === undefined) {
    dmScore.value = 0
    return
  }
  const parsed = Number(raw)
  if (isNaN(parsed)) {
    dmScore.value = 0
  } else {
    dmScore.value = Math.min(100, Math.max(0, Math.round(parsed)))
  }
}

watch(dmScore, (newVal) => {
  if (newVal === '' || newVal === null || newVal === undefined) return
  const parsed = Number(newVal)
  if (!isNaN(parsed)) {
    if (parsed > 100) dmScore.value = 100
    else if (parsed < 0) dmScore.value = 0
  }
})

// Rumus Resmi: Avg(SL + DM) Score -> (Avg/100)*5 dibulatkan 1 angka di belakang koma
const averageCalc = computed(() => calculateAverageDmSl(slScore.value, dmScore.value))
const finalScore = computed(() => averageCalc.value.avgScore)
const finalStars = computed(() => averageCalc.value.stars)
const isAdjusted = computed(() => Number(dmScore.value) !== Number(slScore.value))

function getScoreTier(score) {
  const val = Math.min(100, Math.max(0, Number(score) || 0))
  if (val >= 85) {
    return {
      label: 'Sangat Baik',
      color: '#10b981',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-400 dark:border-emerald-600',
      bgSoftClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
    }
  } else if (val >= 70) {
    return {
      label: 'Baik',
      color: '#0284c7',
      textClass: 'text-sky-600 dark:text-sky-400',
      borderClass: 'border-sky-400 dark:border-sky-600',
      bgSoftClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    }
  } else if (val >= 50) {
    return {
      label: 'Cukup',
      color: '#f59e0b',
      textClass: 'text-amber-600 dark:text-amber-400',
      borderClass: 'border-amber-400 dark:border-amber-600',
      bgSoftClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    }
  } else {
    return {
      label: 'Kurang',
      color: '#ef4444',
      textClass: 'text-rose-600 dark:text-rose-400',
      borderClass: 'border-rose-400 dark:border-rose-600',
      bgSoftClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    }
  }
}

function getSliderTrackStyle(score) {
  const val = Math.min(100, Math.max(0, Number(score) || 0))
  const tier = getScoreTier(val)
  return {
    background: `linear-gradient(to right, ${tier.color} 0%, ${tier.color} ${val}%, rgba(148, 163, 184, 0.28) ${val}%, rgba(148, 163, 184, 0.28) 100%)`,
    accentColor: tier.color,
    color: tier.color
  }
}
</script>

<style scoped>
.custom-score-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid currentColor;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.custom-score-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
}

.custom-score-slider::-moz-range-thumb {
  height: 18px;
  width: 18px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid currentColor;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.1s ease;
}
</style>
