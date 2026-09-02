<template>
  <div class="space-y-6">
    <!-- Top Header & Workstation Context -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <div class="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
            <Handshake class="w-4 h-4" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Rapor New Hire Re.juve (Pre-Batch 3 Hari)
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
            ⚡ Rapor Resmi 7 Kompetensi
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Formulir evaluasi pendampingan <strong>selama 3 hari pra-batch</strong> oleh Store Captain / Store Leader mencakup <strong>7 pilar kompetensi & 22 indikator penilaian</strong>.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-sm flex items-center gap-1.5">
          <Award class="w-3.5 h-3.5 text-purple-600" />
          <span>Format Rapor New Hire</span>
        </span>
      </div>
    </div>

    <!-- 2-Column Workspace: Left Frozen Crew Sidebar & Right Rapor Evaluation Area -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Column: Crew Roster (Sticky Frozen Container) -->
      <div class="lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
        <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
          <div class="flex items-center justify-between gap-2 px-1 mb-2.5 flex-shrink-0">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users class="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Daftar Kru New Hire ({{ currentBatchCrews.length }})</span>
            </h3>
            <span class="text-[10px] font-semibold text-slate-400">Pilih kru</span>
          </div>

          <!-- Search Bar -->
          <div class="relative flex-shrink-0 mb-3">
            <input
              v-model="crewSearchQuery"
              type="text"
              placeholder="Cari nama kru baru..."
              class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-600"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <!-- Scrollable Crew List inside Frozen Sidebar -->
          <div class="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
            <div
              v-for="crew in filteredCrewList"
              :key="crew.id"
              @click="selectedCrewId = crew.id"
              class="p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 relative overflow-hidden"
              :class="[
                selectedCrewId === crew.id
                  ? 'ring-2 ring-purple-600 bg-purple-50/50 dark:bg-purple-950/30 border-purple-400 shadow-md'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
              ]"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <img
                  :src="crew.avatar"
                  :alt="crew.name"
                  class="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                />
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5">
                    <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {{ crew.name }}
                    </h4>
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold">
                      NEW HIRE
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    🏪 {{ crew.storeLocation || 'Standby Gerai' }}
                  </p>
                </div>
              </div>

              <!-- Crew Rapor Summary Tag -->
              <div class="text-right flex-shrink-0">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="getCrewRaporBadgeClass(crew.id)"
                >
                  {{ getCrewRaporStatusText(crew.id) }}
                </span>
                <div class="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1 font-semibold">
                  <span>{{ getCrewCompetencyScore(crew.id) }}%</span>
                </div>
              </div>
            </div>

            <div
              v-if="filteredCrewList.length === 0"
              class="py-10 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              Tidak ada kru yang sesuai.
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Rapor New Hire Evaluation Sheet -->
      <div class="lg:col-span-8 space-y-4">
        <template v-if="selectedCrew">
          
          <!-- Sheet Header: Form Metadata Banner (RAPOR NEW HIRE RE.JUVE) -->
          <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <img
                  :src="selectedCrew.avatar"
                  :alt="selectedCrew.name"
                  class="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-600/30 shadow-sm"
                />
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{{ selectedCrew.name }}</span>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      {{ selectedCrew.code || 'CRW-NEW' }}
                    </span>
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    Posisi: {{ selectedCrew.position || 'Store Specialist New Hire' }}
                  </p>
                </div>
              </div>

              <!-- Progress & Score Badge -->
              <div class="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/60">
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Skor Kompetensi</span>
                  <p class="text-base font-bold text-slate-900 dark:text-white">
                    {{ currentSummary.scorePercent }}%
                  </p>
                </div>
                <div class="h-6 w-px bg-purple-200 dark:bg-purple-800"></div>
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Dinilai</span>
                  <p class="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    {{ currentSummary.rated }} / {{ totalIndicatorCount }}
                  </p>
                </div>
                <div class="h-6 w-px bg-purple-200 dark:bg-purple-800"></div>
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Status</span>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                    :class="raporForm.status === 'RECOMMENDED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
                  >
                    {{ raporForm.status === 'RECOMMENDED' ? 'Siap Batch' : 'Dalam Bimbingan' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Form Information Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span class="text-[10px] font-bold uppercase text-slate-400">Store Training:</span>
                <p class="font-bold text-slate-900 dark:text-white">
                  {{ selectedCrew.storeLocation || batchStore.currentBatch?.name || 'Re.juve Grand Indonesia' }}
                </p>
              </div>

              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span class="text-[10px] font-bold uppercase text-slate-400">Store Captain / Buddy:</span>
                <p class="font-bold text-slate-900 dark:text-white">
                  {{ userStore.currentUser?.name || 'Budi Santoso' }} (Store Leader)
                </p>
              </div>

              <div class="sm:col-span-2 p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span class="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Periode Pendampingan:</span>
                  <p class="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    3 Hari Pra-Batch (H-3 s/d H-1 sebelum kompetisi batch)
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model="raporForm.trainingPeriod"
                    type="text"
                    placeholder="Contoh: 1 - 3 September 2026"
                    class="text-xs rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 px-3 py-1.5 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            <!-- Official Disclaimer Note from PDF Form -->
            <div class="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2">
              <span class="text-base flex-shrink-0">📌</span>
              <div>
                <strong>Catatan Evaluasi 3 Hari:</strong> Poin bertanda bintang (<strong>*</strong>) tetap wajib diberikan pembekalan. Namun, mengingat periode pendampingan hanya 3 hari, kru dapat dimaklumi apabila belum mendapatkan kesempatan praktik secara langsung.
              </div>
            </div>
          </div>

          <!-- TABEL / BLOK EVALUASI 7 PILAR KOMPETENSI RE.JUVE -->
          <div class="space-y-4">
            <div
              v-for="comp in activeBuddyTemplateCompetencies"
              :key="comp.id"
              class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs space-y-3"
            >
              <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {{ comp.name }}
                  </h4>
                </div>
                <span class="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
                  {{ comp.indicators?.length || 0 }} Indikator Penilaian
                </span>
              </div>

              <!-- List of Indicators in this Competency -->
              <div class="space-y-2">
                <div
                  v-for="ind in (comp.indicators || [])"
                  :key="ind.id"
                  class="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div class="space-y-1 min-w-0 max-w-xl">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-xs font-bold text-slate-900 dark:text-white">
                        {{ ind.name }}
                      </span>
                      <span
                        v-if="ind.isStar"
                        class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                      >
                        * Pembekalan Wajib
                      </span>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">
                      {{ ind.description }}
                    </p>
                  </div>

                  <!-- 3-Choice Radio Buttons (Belum Menguasai / Butuh Pendampingan / Kompeten) -->
                  <div class="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                    <button
                      type="button"
                      @click="setRating(ind.id, 'BELUM_MENGUASAI')"
                      class="px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1"
                      :class="[
                        raporForm.indicatorRatings[ind.id] === 'BELUM_MENGUASAI'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                      ]"
                    >
                      <span>Belum Menguasai</span>
                    </button>

                    <button
                      type="button"
                      @click="setRating(ind.id, 'BUTUH_PENDAMPINGAN')"
                      class="px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1"
                      :class="[
                        raporForm.indicatorRatings[ind.id] === 'BUTUH_PENDAMPINGAN'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      ]"
                    >
                      <span>Butuh Pendampingan</span>
                    </button>

                    <button
                      type="button"
                      @click="setRating(ind.id, 'KOMPETEN')"
                      class="px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1"
                      :class="[
                        raporForm.indicatorRatings[ind.id] === 'KOMPETEN'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      ]"
                    >
                      <span>✓ Kompeten</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Catatan Store Captain & Tanda Tangan Verifikasi -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Catatan Store Captain (Notes):
              </label>
              <textarea
                v-model="raporForm.recommendationNote"
                rows="3"
                placeholder="Tuliskan catatan komprehensif hasil pendampingan 3 hari untuk kru ini..."
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-600 resize-none"
              ></textarea>
            </div>

            <!-- Keputusan Kelayakan Batch & Tanda Tangan -->
            <div class="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
              <div class="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h4 class="text-xs font-bold text-purple-900 dark:text-purple-300">
                    Keputusan Kelayakan Masuk Batch Resmi:
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Kru yang berstatus Siap Batch akan langsung dapat berpartisipasi di Week 1 siklus batch.
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    @click="raporForm.status = 'RECOMMENDED'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                    :class="raporForm.status === 'RECOMMENDED' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                  >
                    ✅ Siap Masuk Batch (Kompeten)
                  </button>

                  <button
                    type="button"
                    @click="raporForm.status = 'NEED_RETRAINING'"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                    :class="raporForm.status === 'NEED_RETRAINING' ? 'bg-amber-600 text-white border-amber-600 shadow-xs' : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'"
                  >
                    ⚠️ Butuh Pendampingan Lanjutan
                  </button>
                </div>
              </div>

              <!-- Tanda Tangan Digital Confirmation -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-100 dark:border-purple-900/40">
                <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="raporForm.captainSigned"
                    class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                  />
                  <div class="text-xs">
                    <span class="font-bold text-slate-900 dark:text-white block">Tanda Tangan Captain (Evaluator)</span>
                    <span class="text-[10px] text-slate-400">Verifikasi Store Leader telah mendampingi 3 hari</span>
                  </div>
                </label>

                <label class="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="raporForm.crewSigned"
                    class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
                  />
                  <div class="text-xs">
                    <span class="font-bold text-slate-900 dark:text-white block">Tanda Tangan Kru (New Hire)</span>
                    <span class="text-[10px] text-slate-400">Kru telah menerima evaluasi dan pembekalan</span>
                  </div>
                </label>
              </div>
            </div>

            <!-- Save Rapor Button -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                @click="saveCurrentRapor"
                class="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Check class="w-4 h-4" />
                <span>Simpan Rapor New Hire</span>
              </button>
            </div>
          </div>
        </template>
        <div
          v-else
          class="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-xs"
        >
          Silakan pilih kru dari daftar di sebelah kiri untuk mengisi Rapor New Hire.
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import {
  Handshake,
  Users,
  Award,
  Search,
  Check
} from 'lucide-vue-next'
import { useBuddyStore } from '~/stores/buddy.js'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'

definePageMeta({
  middleware: 'auth'
})

const buddyStore = useBuddyStore()
const batchStore = useBatchStore()
const userStore = useUserStore()
const toast = useToast()

const crewSearchQuery = ref('')
const selectedCrewId = ref('')

// Get crews in current active batch
const currentBatchCrews = computed(() => {
  if (!batchStore.currentBatch) return []
  return userStore.allUsers.filter(u => u.role === 'CREW')
})

const filteredCrewList = computed(() => {
  if (!crewSearchQuery.value) return currentBatchCrews.value
  const q = crewSearchQuery.value.toLowerCase()
  return currentBatchCrews.value.filter(c => c.name.toLowerCase().includes(q))
})

const selectedCrew = computed(() => {
  return currentBatchCrews.value.find(c => c.id === selectedCrewId.value) || currentBatchCrews.value[0] || null
})

// Competencies template from store
const activeBuddyTemplateCompetencies = computed(() => {
  const defaultPkg = buddyStore.defaultPackage
  return defaultPkg?.competencies || []
})

const totalIndicatorCount = computed(() => {
  return activeBuddyTemplateCompetencies.value.reduce((acc, c) => acc + (c.indicators?.length || 0), 0)
})

// Reactive Form State for Selected Crew
const raporForm = ref({
  trainingPeriod: '1 - 3 September 2026',
  recommendationNote: '',
  status: 'IN_PROGRESS',
  captainSigned: true,
  crewSigned: true,
  indicatorRatings: {}
})

// Load evaluation data for selected crew
const loadSelectedCrewRapor = () => {
  if (!selectedCrew.value || !batchStore.currentBatch) return

  const batchId = batchStore.currentBatch.id
  const crewId = selectedCrew.value.id
  const existing = buddyStore.evaluationForCrew(batchId, crewId)

  if (existing) {
    raporForm.value = {
      trainingPeriod: existing.trainingPeriod || '1 - 3 September 2026',
      recommendationNote: existing.recommendationNote || '',
      status: existing.status || 'IN_PROGRESS',
      captainSigned: existing.captainSigned !== undefined ? existing.captainSigned : true,
      crewSigned: existing.crewSigned !== undefined ? existing.crewSigned : true,
      indicatorRatings: { ...(existing.indicatorRatings || {}) }
    }
  } else {
    // Default pre-fill
    raporForm.value = {
      trainingPeriod: '1 - 3 September 2026',
      recommendationNote: '',
      status: 'IN_PROGRESS',
      captainSigned: true,
      crewSigned: false,
      indicatorRatings: {}
    }
  }
}

watch(selectedCrew, () => {
  loadSelectedCrewRapor()
}, { immediate: true })

onMounted(() => {
  if (currentBatchCrews.value.length > 0 && !selectedCrewId.value) {
    selectedCrewId.value = currentBatchCrews.value[0].id
  }
  loadSelectedCrewRapor()
})

// Set rating for an indicator
const setRating = (indicatorId, rating) => {
  raporForm.value.indicatorRatings[indicatorId] = rating
}

// Current summary score & completion
const currentSummary = computed(() => {
  if (!selectedCrew.value || !batchStore.currentBatch) {
    return { scorePercent: 0, rated: 0 }
  }
  const ratings = Object.values(raporForm.value.indicatorRatings || {})
  const total = totalIndicatorCount.value || 22
  const rated = ratings.length

  let weightedPoints = 0
  ratings.forEach(r => {
    if (r === 'KOMPETEN') weightedPoints += 100
    else if (r === 'BUTUH_PENDAMPINGAN') weightedPoints += 60
    else if (r === 'BELUM_MENGUASAI') weightedPoints += 20
  })

  const scorePercent = total > 0 ? Math.round(weightedPoints / total) : 0
  return { scorePercent, rated }
})

// Save Rapor to store
const saveCurrentRapor = () => {
  if (!selectedCrew.value || !batchStore.currentBatch) return

  buddyStore.saveBuddyEvaluation({
    batchId: batchStore.currentBatch.id,
    crewId: selectedCrew.value.id,
    crewName: selectedCrew.value.name,
    storeTraining: selectedCrew.value.storeLocation || batchStore.currentBatch.name,
    storeCaptain: `${userStore.currentUser?.name || 'Budi Santoso'} (Store Leader)`,
    evaluatorId: userStore.currentUser?.id || 'sl-001',
    trainingPeriod: raporForm.value.trainingPeriod,
    indicatorRatings: raporForm.value.indicatorRatings,
    recommendationNote: raporForm.value.recommendationNote,
    status: raporForm.value.status,
    captainSigned: raporForm.value.captainSigned,
    crewSigned: raporForm.value.crewSigned
  })

  toast.success(`Rapor New Hire untuk ${selectedCrew.value.name} berhasil disimpan!`)
}

// Helpers for sidebar badge
const getCrewRaporBadgeClass = (crewId) => {
  if (!batchStore.currentBatch) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  const summary = buddyStore.crewCompetencySummary(batchStore.currentBatch.id, crewId)
  const status = buddyStore.crewOverallStatus(batchStore.currentBatch.id, crewId)

  if (status === 'RECOMMENDED') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  if (status === 'NEED_RETRAINING') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  if (summary.rated > 0) return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

const getCrewRaporStatusText = (crewId) => {
  if (!batchStore.currentBatch) return 'Belum Dinilai'
  const status = buddyStore.crewOverallStatus(batchStore.currentBatch.id, crewId)
  const summary = buddyStore.crewCompetencySummary(batchStore.currentBatch.id, crewId)

  if (status === 'RECOMMENDED') return 'Siap Batch'
  if (status === 'NEED_RETRAINING') return 'Butuh Review'
  if (summary.rated > 0) return 'Sedang Dinilai'
  return 'Belum Dinilai'
}

const getCrewCompetencyScore = (crewId) => {
  if (!batchStore.currentBatch) return 0
  const summary = buddyStore.crewCompetencySummary(batchStore.currentBatch.id, crewId)
  return summary.scorePercent
}
</script>
