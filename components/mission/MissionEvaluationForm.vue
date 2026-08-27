<template>
  <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm space-y-6">
    <!-- Top Form Header -->
    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div class="space-y-1 min-w-0 flex-1">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          <span class="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {{ mission.code }}
          </span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            Week {{ mission.week }}
          </span>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-lg bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ mission.category }}
          </span>
          <MissionStatus :status="mission.status" />
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
          {{ mission.title }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {{ mission.description }}
        </p>
      </div>

      <!-- Batch Target Info Pill -->
      <div class="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
        <Layers class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
        <div>
          <p class="text-xs font-medium uppercase tracking-wider text-slate-400">Target Batch</p>
          <p class="text-xs font-semibold text-slate-900 dark:text-white">
            {{ batchStore.currentBatch.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Requirements Checklist Box -->
    <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
      <span class="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider text-xs flex items-center gap-1.5">
        <CheckSquare class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
        <span>Checklist Standar SOP:</span>
      </span>
      <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400 text-xs">
        <li v-for="(req, idx) in mission.requirements" :key="idx" class="flex items-start gap-2 bg-white dark:bg-slate-900/80 p-2 rounded-xl border border-slate-200/40 dark:border-slate-800">
          <span class="w-1.5 h-1.5 rounded-full bg-[#831843] mt-1.5 flex-shrink-0"></span>
          <span>{{ req }}</span>
        </li>
      </ul>
    </div>

    <!-- Revision Banner if status is REVISION_REQUIRED -->
    <div
      v-if="mission.status === 'REVISION_REQUIRED' && revisionNote"
      class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-1"
    >
      <div class="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-semibold text-xs">
        <RotateCcw class="w-4 h-4" />
        <span>Catatan Revisi dari Head:</span>
      </div>
      <p class="text-xs text-rose-800 dark:text-rose-200 italic leading-relaxed">
        "{{ revisionNote }}"
      </p>
    </div>

    <!-- Week Locked Warning Banner -->
    <div
      v-if="isLocked"
      class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3"
    >
      <Lock class="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
      <div>
        <p class="font-semibold text-slate-800 dark:text-slate-200">🔒 Minggu Terkunci (Read-Only)</p>
        <p class="mt-0.5">Penilaian untuk minggu ini sudah berstatus arsip dan tidak dapat diubah.</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmitClick" class="space-y-6">
      <!-- 1. Multi-Crew Individual Scoring Roster (2-COLUMN GRID with Search & Large-Data Handler) -->
      <div class="space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Penilaian Individu Anggota Crew</span>
              <span class="text-xs font-semibold text-[#831843] dark:text-[#f472b6]">
                ({{ filteredBatchCrews.length }} / {{ batchCrews.length }} Crew)
              </span>
            </label>
            <p class="text-xs text-slate-400 mt-0.5">
              Geser slider atau masukkan angka nilai (0–100). Bintang (⭐ 1–5) dihitung otomatis secara realtime.
            </p>
          </div>

          <!-- Quick Bulk Score Helpers -->
          <div v-if="!isLocked" class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex-wrap">
            <span class="text-xs font-semibold text-slate-400 px-1.5 uppercase">Set Semua:</span>
            <button
              type="button"
              @click="applyBulkScore(95)"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 hover:bg-[#831843] hover:text-white dark:hover:bg-[#831843] text-slate-700 dark:text-slate-300 shadow-sm transition-all cursor-pointer"
            >
              95 (⭐⭐⭐⭐⭐)
            </button>
            <button
              type="button"
              @click="applyBulkScore(90)"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 hover:bg-[#831843] hover:text-white dark:hover:bg-[#831843] text-slate-700 dark:text-slate-300 shadow-sm transition-all cursor-pointer"
            >
              90 (⭐⭐⭐⭐⭐)
            </button>
            <button
              type="button"
              @click="applyBulkScore(85)"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 hover:bg-[#831843] hover:text-white dark:hover:bg-[#831843] text-slate-700 dark:text-slate-300 shadow-sm transition-all cursor-pointer"
            >
              85 (⭐⭐⭐⭐)
            </button>
          </div>
        </div>

        <!-- Crew Filter & Search Bar for Large Data handling -->
        <div class="flex items-center gap-2.5 flex-wrap bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <div class="relative flex-1 min-w-[200px]">
            <input
              v-model="crewSearchQuery"
              type="text"
              placeholder="Cari nama crew atau ID..."
              class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-1.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <select
            v-model="crewRoleFilter"
            class="text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option value="ALL">Semua Posisi</option>
            <option value="Store Leader">Store Leader</option>
            <option value="Senior Barista">Senior Barista</option>
            <option value="Barista">Barista</option>
            <option value="Kasir">Kasir</option>
            <option value="Crew Barista">Crew Barista</option>
          </select>
        </div>

        <!-- 2-Column Responsive Crew Scoring Cards Grid with Scrollable Roster -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
          <div
            v-for="crew in filteredBatchCrews"
            :key="crew.id"
            class="p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between space-y-3 bg-white dark:bg-slate-900 shadow-sm"
            :class="[
              (crewScoresMap[crew.id] || 0) >= 90
                ? 'border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                : (crewScoresMap[crew.id] || 0) >= 80
                ? 'border-amber-300/80 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/10'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30'
            ]"
          >
            <!-- Top Row: Full Crew Identity (Avatar + Full Name + Level + Role) & Score Input -->
            <div class="flex items-center justify-between gap-3">
              <!-- Left: Avatar + Full Name + Role -->
              <div class="flex items-center gap-3 min-w-0">
                <img
                  :src="crew.avatar"
                  :alt="crew.name"
                  class="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0 shadow-sm"
                />
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h4 class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {{ crew.name }}
                    </h4>
                    <span class="text-xs font-semibold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex-shrink-0">
                      Lvl {{ crew.level }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {{ crew.code }} • {{ crew.position }}
                  </p>
                </div>
              </div>

              <!-- Right: Score Number Input -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <div class="relative">
                  <input
                    v-model.number="crewScoresMap[crew.id]"
                    type="number"
                    min="0"
                    max="100"
                    :disabled="isLocked"
                    class="w-16 text-center text-sm font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 py-1.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] focus:border-[#831843] disabled:opacity-50 shadow-inner"
                  />
                </div>
                <span class="text-xs font-medium text-slate-400">/ 100</span>
              </div>
            </div>

            <!-- Middle Row: Interactive Stars Visualizer Bar -->
            <div class="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50">
              <span class="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Hasil Bintang:
              </span>
              <StarReward :score="crewScoresMap[crew.id] || 0" size="sm" :show-label="true" />
            </div>

            <!-- Bottom Row: High-Contrast Dynamic Range Slider & Guide -->
            <div class="space-y-1.5 pt-0.5">
              <div class="relative flex items-center">
                <input
                  v-model.number="crewScoresMap[crew.id]"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  :disabled="isLocked"
                  :style="getSliderTrackStyle(crewScoresMap[crew.id])"
                  class="w-full h-3 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-inner border border-slate-300 dark:border-slate-700 transition-all custom-range-slider"
                  :class="[
                    (crewScoresMap[crew.id] || 0) >= 90
                      ? 'text-emerald-500'
                      : (crewScoresMap[crew.id] || 0) >= 80
                      ? 'text-amber-500'
                      : 'text-[#831843]'
                  ]"
                />
              </div>

              <!-- Score Indicator Markers -->
              <div class="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
                <span>0</span>
                <span>50 (1⭐)</span>
                <span class="text-amber-600 dark:text-amber-400">80 (4⭐)</span>
                <span class="text-emerald-600 dark:text-emerald-400">90 (5⭐)</span>
                <span>100</span>
              </div>
            </div>
          </div>

          <!-- Empty search state -->
          <div
            v-if="filteredBatchCrews.length === 0"
            class="col-span-full py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            Tidak ada crew yang cocok dengan pencarian "{{ crewSearchQuery }}".
          </div>
        </div>

        <!-- Aggregate Summary Bar -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-[#831843]/10 via-[#9d174d]/10 to-amber-500/10 border border-[#831843]/20 flex items-center justify-between text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#831843] animate-ping"></span>
            <span class="font-semibold text-slate-800 dark:text-slate-200">
              Rata-Rata Nilai Batch:
            </span>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="font-bold text-[#831843] dark:text-[#f472b6] text-sm">
              {{ averageBatchScore }} / 100
            </span>
            <span class="text-slate-400">•</span>
            <span class="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Star class="w-4 h-4 fill-amber-400" />
              <span>Rata-Rata {{ averageCalculatedStars }} Bintang</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 2. Side-by-Side: Evidence Photos (Left) & Supervisor Notes (Right) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
        <!-- Left: Evidence Photos -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                Foto Bukti & Inspeksi ({{ formData.evidence.length }})
              </label>
              <p class="text-xs text-slate-400">
                Lampiran foto chiller, logbook, atau kebersihan bar
              </p>
            </div>

            <button
              v-if="!isLocked"
              type="button"
              @click="showAddEvidenceModal = true"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>+ Tambah Foto</span>
            </button>
          </div>

          <!-- Evidence Gallery Grid -->
          <div class="grid grid-cols-2 gap-2.5">
            <div
              v-for="(img, idx) in formData.evidence"
              :key="idx"
              class="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 shadow-sm"
            >
              <img
                :src="img.url"
                :alt="img.caption"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-slate-950/75 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-xs text-white font-medium line-clamp-2">{{ img.caption }}</span>
                <button
                  v-if="!isLocked"
                  type="button"
                  @click="removeEvidence(idx)"
                  class="self-end p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                  title="Hapus foto"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Empty placeholder -->
            <div
              v-if="formData.evidence.length === 0"
              @click="!isLocked && (showAddEvidenceModal = true)"
              class="col-span-full border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-[#831843] cursor-pointer transition-colors"
            >
              <Image class="w-6 h-6 mb-1 text-slate-400" />
              <span class="text-xs font-semibold">Belum ada foto bukti</span>
              <span class="text-xs mt-0.5 text-slate-400">Klik untuk melampirkan foto inspeksi</span>
            </div>
          </div>
        </div>

        <!-- Right: Supervisor Notes -->
        <div class="space-y-3">
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Catatan & Temuan Supervisor
            </label>
            <p class="text-xs text-slate-400">
              Evaluasi kepatuhan SOP, temuan lapangan, dan catatan mutu
            </p>
          </div>

          <textarea
            v-model="formData.comment"
            rows="4"
            :disabled="isLocked"
            placeholder="Tuliskan catatan hasil audit misi, kepatuhan prosedur, dan masukan untuk tim crew..."
            class="w-full text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border-none p-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843] disabled:opacity-50 resize-none leading-relaxed"
          ></textarea>
        </div>
      </div>

      <!-- Action Buttons Bar -->
      <div v-if="!isLocked" class="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="handleSaveDraft"
          class="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Simpan Draft
        </button>

        <button
          type="submit"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white shadow-lg shadow-[#831843]/25 transition-all active:scale-95 cursor-pointer"
        >
          <Send class="w-3.5 h-3.5" />
          <span>{{ mission.status === 'REVISION_REQUIRED' ? 'Kirim Ulang Evaluasi ke Head' : 'Kirim Evaluasi Seluruh Crew ke Head' }}</span>
        </button>
      </div>
    </form>

    <!-- Confirmation Modal for Submit -->
    <ConfirmationModal
      :modelValue="showConfirmModal"
      title="Kirim Evaluasi Misi ke Head of Operations?"
      :subtitle="`${mission.title} • Dinilai untuk ${batchCrews.length} Anggota Crew`"
      confirm-text="Kirim untuk Review"
      variant="star"
      @update:modelValue="showConfirmModal = $event"
      @confirm="executeSubmit"
      @cancel="showConfirmModal = false"
    />

    <!-- Add Evidence Modal -->
    <BaseModal
      :modelValue="showAddEvidenceModal"
      title="Lampirkan Foto Bukti Inspeksi"
      @update:modelValue="showAddEvidenceModal = $event"
    >
      <div class="space-y-4">
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Pilih salah satu contoh foto inspeksi operasional atau masukkan URL foto:
        </p>

        <!-- Preset Evidence Photos -->
        <div class="grid grid-cols-2 gap-2.5">
          <div
            v-for="preset in presetEvidenceList"
            :key="preset.url"
            @click="selectPresetEvidence(preset)"
            class="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#831843] bg-slate-50 dark:bg-slate-800 cursor-pointer space-y-1.5 transition-all group"
          >
            <div class="aspect-video rounded-xl overflow-hidden bg-slate-200">
              <img :src="preset.url" :alt="preset.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {{ preset.caption }}
            </p>
          </div>
        </div>

        <!-- Custom URL Input -->
        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Keterangan Foto</label>
            <input
              v-model="newEvidenceCaption"
              type="text"
              placeholder="Contoh: Foto termometer chiller 3°C"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-2.5 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Gambar</label>
            <input
              v-model="newEvidenceUrl"
              type="url"
              placeholder="https://..."
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-2.5 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3">
          <button
            type="button"
            @click="showAddEvidenceModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="button"
            @click="addCustomEvidence"
            :disabled="!newEvidenceUrl || !newEvidenceCaption"
            class="px-4 py-2 text-xs font-bold rounded-xl bg-[#831843] text-white hover:bg-[#6b133a] disabled:opacity-50"
          >
            Tambahkan
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useBatchStore } from '~/stores/batch.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useToast } from '~/composables/useToast.js'
import { calculateStars } from '~/utils/star.js'
import { isWeekLocked } from '~/utils/status.js'
import MissionStatus from '~/components/mission/MissionStatus.vue'
import StarReward from '~/components/gamification/StarReward.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  Layers,
  CheckSquare,
  RotateCcw,
  Lock,
  Star,
  Plus,
  Trash2,
  Image,
  Send,
  Search
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

const batchStore = useBatchStore()
const gamificationStore = useGamificationStore()
const evalStore = useEvaluationStore()
const toast = useToast()

const showConfirmModal = ref(false)
const showAddEvidenceModal = ref(false)
const newEvidenceUrl = ref('')
const newEvidenceCaption = ref('')

const crewSearchQuery = ref('')
const crewRoleFilter = ref('ALL')

const isLocked = computed(() => {
  return isWeekLocked(props.mission?.week, batchStore.currentBatch?.currentWeek || 2)
})

const batchCrews = computed(() => {
  return gamificationStore.crewsByBatch(props.mission.batchId || batchStore.currentBatch.id)
})

const filteredBatchCrews = computed(() => {
  let list = batchCrews.value
  if (crewRoleFilter.value !== 'ALL') {
    list = list.filter(c => c.position === crewRoleFilter.value)
  }
  if (crewSearchQuery.value.trim()) {
    const q = crewSearchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.position.toLowerCase().includes(q)
    )
  }
  return list
})

const revisionNote = computed(() => {
  if (props.initialEvaluation && props.initialEvaluation.revisionHistory && props.initialEvaluation.revisionHistory.length > 0) {
    return props.initialEvaluation.revisionHistory[props.initialEvaluation.revisionHistory.length - 1].note
  }
  return null
})

// Local form data
const formData = reactive({
  comment: '',
  evidence: []
})

// Map of crew scores { crewId: score }
const crewScoresMap = reactive({})

// High-contrast slider track style generator
const getSliderTrackStyle = (score) => {
  const val = Math.min(100, Math.max(0, Number(score) || 0))
  let color = '#831843'
  if (val >= 90) color = '#10b981'
  else if (val >= 80) color = '#f59e0b'
  return {
    background: `linear-gradient(to right, ${color} 0%, ${color} ${val}%, #cbd5e1 ${val}%, #cbd5e1 100%)`
  }
}

// Initialize or reset form based on mission / evaluation
const initForm = () => {
  if (props.initialEvaluation) {
    formData.comment = props.initialEvaluation.comment || ''
    formData.evidence = props.initialEvaluation.evidence ? [...props.initialEvaluation.evidence] : []

    if (props.initialEvaluation.crewScores) {
      props.initialEvaluation.crewScores.forEach(cs => {
        crewScoresMap[cs.crewId] = cs.score
      })
    }
  } else if (props.mission.crewEvaluations && props.mission.crewEvaluations.length > 0) {
    formData.comment = ''
    formData.evidence = []
    props.mission.crewEvaluations.forEach(ce => {
      crewScoresMap[ce.crewId] = ce.score || 90
    })
  } else {
    formData.comment = ''
    formData.evidence = []
    batchCrews.value.forEach(c => {
      crewScoresMap[c.id] = 90
    })
  }

  batchCrews.value.forEach(c => {
    if (crewScoresMap[c.id] === undefined) {
      crewScoresMap[c.id] = 90
    }
  })
}

watch(() => props.mission.id, () => {
  initForm()
}, { immediate: true })

watch(() => props.initialEvaluation, () => {
  initForm()
}, { deep: true })

// Aggregate Average Score
const averageBatchScore = computed(() => {
  const scores = Object.values(crewScoresMap)
  if (scores.length === 0) return 0
  const sum = scores.reduce((acc, curr) => acc + (Number(curr) || 0), 0)
  return Math.round(sum / scores.length)
})

const averageCalculatedStars = computed(() => {
  return calculateStars(averageBatchScore.value)
})

const applyBulkScore = (score) => {
  batchCrews.value.forEach(c => {
    crewScoresMap[c.id] = score
  })
  toast.info('Nilai Massal Diterapkan', `Semua crew diatur ke nilai ${score}`)
}

// Preset evidence photos
const presetEvidenceList = [
  {
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    caption: 'Pengecekan sampel rasa botol jus segar'
  },
  {
    url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    caption: 'Logbook pemeriksaan suhu & sanitasi'
  },
  {
    url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    caption: 'Observasi kebersihan meja bar'
  },
  {
    url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    caption: 'Pengecekan susunan botol FIFO di chiller'
  }
]

const selectPresetEvidence = (preset) => {
  formData.evidence.push({
    id: `ev-${Date.now()}`,
    url: preset.url,
    caption: preset.caption
  })
  showAddEvidenceModal.value = false
  toast.success('Foto Ditambahkan', preset.caption)
}

const addCustomEvidence = () => {
  if (!newEvidenceUrl.value || !newEvidenceCaption.value) return
  formData.evidence.push({
    id: `ev-${Date.now()}`,
    url: newEvidenceUrl.value,
    caption: newEvidenceCaption.value
  })
  newEvidenceUrl.value = ''
  newEvidenceCaption.value = ''
  showAddEvidenceModal.value = false
  toast.success('Foto Bukti Ditambahkan', 'Foto berhasil dilampirkan.')
}

const removeEvidence = (index) => {
  formData.evidence.splice(index, 1)
  toast.info('Foto Dihapus', 'Lampiran bukti telah dihapus.')
}

const buildPayload = (status) => {
  const crewScores = batchCrews.value.map(c => ({
    crewId: c.id,
    crewName: c.name,
    score: Number(crewScoresMap[c.id]) || 0,
    calculatedStars: calculateStars(Number(crewScoresMap[c.id]) || 0)
  }))

  return {
    missionId: props.mission.id,
    missionTitle: props.mission.title,
    week: props.mission.week,
    batchId: props.mission.batchId || batchStore.currentBatch.id,
    status: status,
    averageScore: averageBatchScore.value,
    calculatedStars: averageCalculatedStars.value,
    comment: formData.comment,
    evidence: formData.evidence,
    crewScores: crewScores
  }
}

const handleSaveDraft = () => {
  const payload = buildPayload('DRAFT')
  evalStore.saveDraft(payload)
  emit('saved', payload)
}

const handleSubmitClick = () => {
  showConfirmModal.value = true
}

const executeSubmit = () => {
  showConfirmModal.value = false
  const payload = buildPayload('PENDING_REVIEW')
  evalStore.submitEvaluation(payload)
  emit('submitted', payload)
}
</script>

<style scoped>
.custom-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: #ffffff;
  border: 3.5px solid currentColor;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  margin-top: 0;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.custom-range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
}

.custom-range-slider::-moz-range-thumb {
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: #ffffff;
  border: 3.5px solid currentColor;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.1s ease;
}
</style>
