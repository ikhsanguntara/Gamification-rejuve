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
            Penilaian Misi Buddy (Pre-Batch)
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
          <span
            class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
          >
            ⚡ Penilaian Langsung (Tanpa Approval DM)
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Program pendampingan <strong>3 Hari Pra-Batch ($H-3$ s/d $H-1$)</strong> oleh Store Leader. Nilai dan Rapor New Hire langsung tersimpan tanpa melalui antrean approval.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-sm flex items-center gap-1.5">
          <Calendar class="w-3.5 h-3.5 text-purple-600" />
          <span>Fase Pre-Batch (3 Hari)</span>
        </span>
      </div>
    </div>

    <!-- Interactive 3-Day Stepper Timeline -->
    <div class="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Pre-Batch Mentoring Progression
          </h4>
          <p class="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            3-Day Store Leader Buddy Guidance Sequence
          </p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
          Hari {{ buddyStore.selectedDay }} Dipilih
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          v-for="bday in currentBuddyPackageDays"
          :key="bday.dayNumber"
          type="button"
          @click="buddyStore.selectDay(bday.dayNumber)"
          class="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between"
          :class="[
            buddyStore.selectedDay === bday.dayNumber
              ? 'ring-2 ring-purple-600 bg-purple-50/60 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 shadow-sm'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
          ]"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-900 dark:text-white">
              HARI {{ bday.dayNumber }} (H-{{ bday.offsetDays }})
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
              {{ bday.missions.length }} Butir SOP
            </span>
          </div>
          <p class="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
            {{ bday.title }}
          </p>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-2 block">
            Fokus: <strong>{{ bday.focus }}</strong>
          </span>
        </button>
      </div>
    </div>

    <!-- 2-Column Workspace: Left Frozen Crew Sidebar & Right Missions Evaluation Area -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      <!-- Left Column: Crew Roster (Sticky Frozen Container) -->
      <div class="lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
        <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
          <div class="flex items-center justify-between gap-2 px-1 mb-2.5 flex-shrink-0">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users class="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Daftar Kru Gerai ({{ currentBatchCrews.length }})</span>
            </h3>
            <span class="text-[10px] font-semibold text-slate-400">Pilih kru</span>
          </div>

          <!-- Search Bar -->
          <div class="relative flex-shrink-0 mb-3">
            <input
              v-model="crewSearchQuery"
              type="text"
              placeholder="Cari nama kru..."
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
                      CRW
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    🏪 {{ crew.storeLocation || 'Standby' }}
                  </p>
                </div>
              </div>

              <!-- Crew Buddy Status Tag -->
              <div class="text-right flex-shrink-0">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  :class="getCrewBuddyBadgeClass(crew.id)"
                >
                  {{ getCrewBuddyStatusText(crew.id) }}
                </span>
                <div class="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1 font-semibold">
                  <span>{{ getCrewBuddyAvgScore(crew.id) }}%</span>
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

      <!-- Right Column: Buddy Evaluation Panel for Selected Crew (Sticky Frozen Top Header + Smooth Scroll Form) -->
      <div class="lg:col-span-8 space-y-4">
        <template v-if="selectedCrew">
          <!-- Active Crew Profile & Buddy Summary Banner (Sticky Frozen Top) -->
          <div class="sticky top-20 z-20 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3.5">
                <img
                  :src="selectedCrew.avatar"
                  :alt="selectedCrew.name"
                  class="w-12 h-12 rounded-2xl object-cover ring-2 ring-purple-600/30 shadow-sm"
                />
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {{ selectedCrew.name }}
                    </h3>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                      {{ selectedCrew.code || 'CRW-BUDDY' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ selectedCrew.position || 'Kru Baru' }} • Gerai {{ selectedCrew.storeLocation || batchStore.currentBatch?.name }}
                  </p>
                </div>
              </div>

              <!-- KPI Stats Box for Buddy Progress -->
              <div class="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase">Rata-Rata</span>
                  <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {{ currentSelectedCrewAvgScore }}%
                  </p>
                </div>
                <div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase">Hari Dinilai</span>
                  <p class="text-sm font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                    {{ completedDaysCount }} / 3
                  </p>
                </div>
                <div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase">Kelayakan</span>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                    :class="currentSelectedCrewStatus === 'RECOMMENDED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
                  >
                    {{ currentSelectedCrewStatus === 'RECOMMENDED' ? 'Siap Batch' : 'Dalam Bimbingan' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mode Switcher Tabs: Observasi Harian vs Rapor New Hire -->
          <div class="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit text-xs font-semibold">
            <button
              type="button"
              @click="evalSubMode = 'OBSERVATION'"
              class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
              :class="[
                evalSubMode === 'OBSERVATION'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <CheckSquare class="w-4 h-4" />
              <span>1. Observasi Harian (Hari {{ buddyStore.selectedDay }})</span>
            </button>

            <button
              type="button"
              @click="evalSubMode = 'RAPOR'"
              class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
              :class="[
                evalSubMode === 'RAPOR'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              <Award class="w-4 h-4" />
              <span>2. Rapor New Hire (7 Kompetensi)</span>
            </button>
          </div>

          <!-- KONTEN 1: Observasi Harian (3 Hari Stepper) -->
          <div v-if="evalSubMode === 'OBSERVATION'" class="space-y-4">
            <div class="flex items-center justify-between px-1">
              <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckSquare class="w-4 h-4 text-purple-600" />
                <span>{{ activeDayData.title }}</span>
              </h3>
              <span class="text-[11px] text-slate-400">Observasi pendampingan langsung oleh Store Leader</span>
            </div>

            <!-- Single Day Mentoring Card -->
            <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs space-y-4">
              <!-- Checklist Butir SOP Observasi -->
              <div class="space-y-3">
                <div class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Daftar Butir Observasi & Praktik Kru:</span>
                  <span class="text-[11px] text-purple-600 font-semibold">Centang butir yang telah dipahami</span>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="m in activeDayData.missions"
                    :key="m.id"
                    class="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 space-y-1.5"
                  >
                    <div class="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        :id="`check-${m.id}`"
                        v-model="dayForm.checklistResults[m.id]"
                        class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 mt-0.5 cursor-pointer accent-purple-600"
                      />
                      <label :for="`check-${m.id}`" class="text-xs font-bold text-slate-900 dark:text-white cursor-pointer select-none">
                        {{ m.title }}
                      </label>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 pl-6.5">
                      {{ m.description }}
                    </p>
                    <ul class="text-[10px] text-slate-600 dark:text-slate-400 pl-6.5 list-disc list-inside space-y-0.5">
                      <li v-for="(chk, cIdx) in m.checklist" :key="cIdx">{{ chk }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Input Nilai Kesiapan Hari Ini -->
              <div class="p-3.5 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs font-bold text-slate-800 dark:text-slate-200 flex-shrink-0">
                    Nilai Kesiapan Kru Hari {{ buddyStore.selectedDay }}:
                  </label>
                  
                  <input
                    v-model.number="dayForm.score"
                    type="range"
                    min="0"
                    max="100"
                    class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />

                  <div class="flex items-center gap-1 flex-shrink-0">
                    <input
                      v-model.number="dayForm.score"
                      type="number"
                      min="0"
                      max="100"
                      class="w-14 text-center text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-1 text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-600"
                    />
                    <span class="text-[11px] text-slate-400 font-semibold">/100</span>
                  </div>
                </div>

                <div class="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                  <span>0 (Belum Paham)</span>
                  <span>50 (Cukup)</span>
                  <span>80 (Kompeten)</span>
                  <span>90 (Sangat Siap)</span>
                  <span>100</span>
                </div>
              </div>

              <!-- Catatan Evaluator & Upload Bukti Mentoring -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <!-- Catatan Mentoring -->
                <div class="space-y-1">
                  <label class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                    Catatan Observasi Store Leader:
                  </label>
                  <textarea
                    v-model="dayForm.note"
                    rows="2"
                    placeholder="Tuliskan catatan kemajuan kru atau poin yang perlu ditingkatkan..."
                    class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-purple-600 resize-none"
                  ></textarea>
                </div>

                <!-- Upload Foto Bukti -->
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <label class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Camera class="w-3 h-3 text-purple-600" />
                      <span>Foto Bukti Pendampingan:</span>
                    </label>
                    <span v-if="dayForm.evidences.length > 0" class="text-[10px] text-slate-400 font-medium">
                      {{ dayForm.evidences.length }} Foto
                    </span>
                  </div>

                  <div class="flex items-center gap-2 flex-wrap">
                    <label class="h-8 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-purple-600 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50/50 flex items-center gap-1.5 cursor-pointer transition-all text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        class="hidden"
                        @change="handleFileUpload"
                      />
                      <Plus class="w-3 h-3 text-purple-600" />
                      <span class="text-[11px]">+ Foto Mentoring</span>
                    </label>

                    <div
                      v-for="(ev, evIdx) in dayForm.evidences"
                      :key="evIdx"
                      class="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0"
                    >
                      <img :src="ev.url" :alt="ev.caption || 'Foto'" class="w-full h-full object-cover" />
                      <button
                        type="button"
                        @click="dayForm.evidences.splice(evIdx, 1)"
                        class="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-bl flex items-center justify-center cursor-pointer"
                      >
                        <X class="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tombol Simpan Hari Ini -->
              <div class="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span class="text-[11px] text-slate-400">
                  Data penilaian tersimpan langsung di sistem gerai (tanpa antrean approval).
                </span>
                <button
                  type="button"
                  @click="saveCurrentDayEvaluation"
                  class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check class="w-3.5 h-3.5" />
                  <span>Simpan Evaluasi Hari {{ buddyStore.selectedDay }}</span>
                </button>
              </div>
            </div>

            <!-- Box Rekomendasi Kelulusan Akhir (Khusus Hari 3) -->
            <div v-if="buddyStore.selectedDay === 3" class="rounded-3xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-5 space-y-3">
              <div class="flex items-center gap-2">
                <Award class="w-4 h-4 text-emerald-600" />
                <h4 class="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Keputusan Kelayakan & Rekomendasi Store Leader
                </h4>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  @click="finalStatus = 'RECOMMENDED'"
                  class="p-3 rounded-2xl border text-left cursor-pointer transition-all text-xs font-bold flex items-center gap-2"
                  :class="finalStatus === 'RECOMMENDED' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'"
                >
                  <span>✅</span>
                  <span>Siap 100% Mengikuti Batch</span>
                </button>

                <button
                  type="button"
                  @click="finalStatus = 'NEEDS_ATTENTION'"
                  class="p-3 rounded-2xl border text-left cursor-pointer transition-all text-xs font-bold flex items-center gap-2"
                  :class="finalStatus === 'NEEDS_ATTENTION' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'"
                >
                  <span>⚠️</span>
                  <span>Perlu Bimbingan Tambahan</span>
                </button>
              </div>

              <textarea
                v-model="finalRecommendationNote"
                rows="2"
                placeholder="Tuliskan catatan rekomendasi resmi Store Leader untuk kru ini sebelum Week 1 batch dimulai..."
                class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 p-2.5 text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-600 resize-none"
              ></textarea>

              <button
                type="button"
                @click="saveFinalRecommendation"
                class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check class="w-4 h-4" />
                <span>Simpan Rekomendasi Kelayakan Kru</span>
              </button>
            </div>
          </div>

          <!-- KONTEN 2: Rapor New Hire Re.juve (7 Pilar Kompetensi) -->
          <div v-else class="space-y-4">
            <div class="flex items-center justify-between px-1">
              <div>
                <h3 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Award class="w-4 h-4 text-blue-600" />
                  <span>RAPOR NEW HIRE RE.JUVE — 7 KOMPETENSI</span>
                </h3>
                <p class="text-[11px] text-slate-400 mt-0.5">
                  Formulir penilaian kelayakan standar operasional untuk kru baru: <strong>{{ selectedCrew.name }}</strong>
                </p>
              </div>
              <span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                Format Standar Re.juve
              </span>
            </div>

            <!-- Warning note about 3-day starred items -->
            <div class="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>Catatan Evaluator:</strong> Poin bertanda bintang (*) tetap wajib diberikan pembekalan. Namun, mengingat periode pendampingan hanya 3 hari, kru dapat dimaklumi apabila belum mendapatkan kesempatan praktik secara langsung.
            </div>

            <!-- 7 Competency Evaluation Blocks -->
            <div class="space-y-3">
              <div
                v-for="comp in feedbackStore.raporCompetencies"
                :key="comp.id"
                class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs space-y-3"
              >
                <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span>{{ comp.name }}</span>
                </h4>

                <div class="space-y-2">
                  <div
                    v-for="ind in comp.indicators"
                    :key="ind.id"
                    class="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div class="space-y-0.5 min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {{ ind.text }}
                        </span>
                        <span
                          v-if="ind.isMandatoryIntro"
                          class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                        >
                          * Wajib Pembekalan
                        </span>
                      </div>
                    </div>

                    <!-- 3-Choice Radio Badges -->
                    <div class="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                      <button
                        type="button"
                        @click="raporRatings[ind.id] = 'BELUM_MENGUASAI'"
                        class="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer"
                        :class="[
                          raporRatings[ind.id] === 'BELUM_MENGUASAI'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                        ]"
                      >
                        Belum Menguasai
                      </button>

                      <button
                        type="button"
                        @click="raporRatings[ind.id] = 'BUTUH_PENDAMPINGAN'"
                        class="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer"
                        :class="[
                          raporRatings[ind.id] === 'BUTUH_PENDAMPINGAN'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                        ]"
                      >
                        Butuh Pendampingan
                      </button>

                      <button
                        type="button"
                        @click="raporRatings[ind.id] = 'KOMPETEN'"
                        class="px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer"
                        :class="[
                          raporRatings[ind.id] === 'KOMPETEN'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        ]"
                      >
                        ✓ Kompeten
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes & Submission for Rapor -->
            <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Evaluasi Akhir Store Captain:
                </label>
                <textarea
                  v-model="raporNotes"
                  rows="3"
                  placeholder="Catatan menyeluruh mengenai kesiapan kru, kekuatan, dan hal yang masih perlu pendampingan saat bertugas..."
                  class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 resize-none"
                ></textarea>
              </div>

              <div class="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Status Akhir:</span>
                  <select
                    v-model="raporStatus"
                    class="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-1.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="LULUS_KOMPETEN">✅ LULUS KOMPETEN (Siap Bertugas)</option>
                    <option value="PERLU_PENDAMPINGAN">⚠️ PERLU PENDAMPINGAN LANJUTAN</option>
                  </select>
                </div>

                <button
                  type="button"
                  @click="saveCurrentCrewRapor"
                  class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check class="w-4 h-4" />
                  <span>Simpan Rapor New Hire</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Floating Action Bar for Selected Crew (Sticky Frozen Bottom) -->
          <div class="p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg flex items-center justify-between gap-3 sticky bottom-4 z-20">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Progres Kru {{ selectedCrew.name }}:
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                Rata-rata: {{ currentSelectedCrewAvgScore }}% • {{ completedDaysCount }}/3 Hari Dinilai
              </span>
            </div>

            <button
              type="button"
              @click="goToNextCrew"
              class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-600/20 active:scale-95"
            >
              <span>Kru Berikutnya</span>
              <ChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useBuddyStore } from '~/stores/buddy.js'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useToast } from '~/composables/useToast.js'
import {
  Handshake,
  Users,
  Search,
  Calendar,
  CheckSquare,
  Camera,
  Plus,
  X,
  Check,
  Award,
  ChevronRight
} from 'lucide-vue-next'

const batchStore = useBatchStore()
const userStore = useUserStore()
const buddyStore = useBuddyStore()
const feedbackStore = useFeedbackStore()
const toast = useToast()

const evalSubMode = ref('OBSERVATION') // 'OBSERVATION' | 'RAPOR'
const crewSearchQuery = ref('')
const selectedCrewId = ref('')

const currentBuddyPackage = computed(() => {
  return buddyStore.defaultPackage || buddyStore.allPackages[0]
})

const currentBuddyPackageDays = computed(() => {
  return currentBuddyPackage.value?.days || []
})

const activeDayData = computed(() => {
  return currentBuddyPackageDays.value.find(d => d.dayNumber === buddyStore.selectedDay) || currentBuddyPackageDays.value[0]
})

// Get crews assigned to current active batch
const currentBatchCrews = computed(() => {
  const allCrews = userStore.allUsers.filter(u => u.role === 'CREW')
  const batchId = batchStore.selectedBatchId
  return allCrews.filter(c => c.batchId === batchId)
})

const filteredCrewList = computed(() => {
  if (!crewSearchQuery.value.trim()) return currentBatchCrews.value
  const q = crewSearchQuery.value.toLowerCase()
  return currentBatchCrews.value.filter(c => 
    c.name.toLowerCase().includes(q) || (c.storeLocation || '').toLowerCase().includes(q)
  )
})

const selectedCrew = computed(() => {
  return userStore.userById(selectedCrewId.value) || filteredCrewList.value[0] || null
})

// Active Day Evaluation Form State
const dayForm = ref({
  score: 90,
  note: '',
  checklistResults: {},
  evidences: []
})

const finalStatus = ref('RECOMMENDED')
const finalRecommendationNote = ref('')

// Rapor New Hire State
const raporRatings = ref({})
const raporNotes = ref('')
const raporStatus = ref('LULUS_KOMPETEN')

const populateDayForm = () => {
  if (!selectedCrew.value || !activeDayData.value) return
  const batchId = batchStore.selectedBatchId
  const dayNum = buddyStore.selectedDay
  
  const saved = buddyStore.crewDayEvaluation(batchId, selectedCrew.value.id, dayNum)
  const fullEval = buddyStore.evaluationForCrew(batchId, selectedCrew.value.id)

  if (saved) {
    dayForm.value.score = saved.score ?? 90
    dayForm.value.note = saved.note || ''
    dayForm.value.checklistResults = { ...(saved.checklistResults || {}) }
    dayForm.value.evidences = [...(saved.evidences || [])]
  } else {
    // Default checklist results to checked
    const defaultChecks = {}
    activeDayData.value.missions.forEach(m => {
      defaultChecks[m.id] = true
    })
    dayForm.value = {
      score: 90,
      note: '',
      checklistResults: defaultChecks,
      evidences: []
    }
  }

  if (fullEval) {
    finalStatus.value = fullEval.status || 'RECOMMENDED'
    finalRecommendationNote.value = fullEval.recommendationNote || ''
  } else {
    finalStatus.value = 'RECOMMENDED'
    finalRecommendationNote.value = ''
  }

  // Populate Rapor New Hire
  const savedRapor = feedbackStore.raporByCrewId(selectedCrew.value.id)
  if (savedRapor) {
    raporRatings.value = { ...(savedRapor.indicatorsRating || {}) }
    raporNotes.value = savedRapor.notes || ''
    raporStatus.value = savedRapor.status || 'LULUS_KOMPETEN'
  } else {
    const defaultRapor = {}
    feedbackStore.raporCompetencies.forEach(comp => {
      comp.indicators.forEach(ind => {
        defaultRapor[ind.id] = 'KOMPETEN'
      })
    })
    raporRatings.value = defaultRapor
    raporNotes.value = ''
    raporStatus.value = 'LULUS_KOMPETEN'
  }
}

watch([selectedCrew, () => buddyStore.selectedDay, () => batchStore.selectedBatchId], () => {
  populateDayForm()
}, { immediate: true })

onMounted(() => {
  if (currentBatchCrews.value.length > 0 && !selectedCrewId.value) {
    selectedCrewId.value = currentBatchCrews.value[0].id
  }
})

// Progress helpers
const currentSelectedCrewAvgScore = computed(() => {
  if (!selectedCrew.value) return 0
  return buddyStore.crewAvgScore(batchStore.selectedBatchId, selectedCrew.value.id)
})

const currentSelectedCrewStatus = computed(() => {
  if (!selectedCrew.value) return 'NOT_STARTED'
  return buddyStore.crewOverallStatus(batchStore.selectedBatchId, selectedCrew.value.id)
})

const completedDaysCount = computed(() => {
  if (!selectedCrew.value) return 0
  const record = buddyStore.evaluationForCrew(batchStore.selectedBatchId, selectedCrew.value.id)
  return record?.dayEvaluations ? Object.keys(record.dayEvaluations).length : 0
})

const getCrewBuddyStatusText = (crewId) => {
  const status = buddyStore.crewOverallStatus(batchStore.selectedBatchId, crewId)
  if (status === 'RECOMMENDED') return 'Siap Batch'
  if (status === 'IN_PROGRESS') return 'Sedang Bimbingan'
  return 'Belum Mulai'
}

const getCrewBuddyBadgeClass = (crewId) => {
  const status = buddyStore.crewOverallStatus(batchStore.selectedBatchId, crewId)
  if (status === 'RECOMMENDED') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  if (status === 'IN_PROGRESS') return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

const getCrewBuddyAvgScore = (crewId) => {
  return buddyStore.crewAvgScore(batchStore.selectedBatchId, crewId)
}

const handleFileUpload = (e) => {
  const files = e.target.files
  if (!files || files.length === 0) return
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const reader = new FileReader()
    reader.onload = (event) => {
      dayForm.value.evidences.push({
        url: event.target.result,
        caption: `Foto Observasi Hari ${buddyStore.selectedDay} - ${file.name}`
      })
    }
    reader.readAsDataURL(file)
  }
}

const saveCurrentDayEvaluation = () => {
  if (!selectedCrew.value) return
  buddyStore.saveDayEvaluation({
    batchId: batchStore.selectedBatchId,
    crewId: selectedCrew.value.id,
    dayNumber: buddyStore.selectedDay,
    score: dayForm.value.score,
    note: dayForm.value.note,
    checklistResults: dayForm.value.checklistResults,
    evidences: dayForm.value.evidences,
    evaluatorId: userStore.currentUserId,
    evaluatorName: userStore.currentUser?.name,
    storeId: selectedCrew.value.storeId,
    storeName: selectedCrew.value.storeLocation
  })

  toast.success(
    `Evaluasi Hari ${buddyStore.selectedDay} Tersimpan`,
    `Penilaian kesiapan ${selectedCrew.value.name} tersimpan langsung (tanpa antrean approval).`
  )
}

const saveFinalRecommendation = () => {
  if (!selectedCrew.value) return
  buddyStore.updateCrewRecommendation(batchStore.selectedBatchId, selectedCrew.value.id, {
    status: finalStatus.value,
    recommendationNote: finalRecommendationNote.value
  })

  toast.success(
    'Rekomendasi Tersimpan',
    `Status kelayakan kru ${selectedCrew.value.name} telah diperbarui.`
  )
}

const saveCurrentCrewRapor = () => {
  if (!selectedCrew.value) return
  feedbackStore.saveNewHireReport({
    crewId: selectedCrew.value.id,
    crewName: selectedCrew.value.name,
    storeLocation: selectedCrew.value.storeLocation,
    storeCaptain: userStore.currentUser?.name || 'Store Leader',
    evaluationDate: new Date().toISOString().split('T')[0],
    indicatorsRating: raporRatings.value,
    notes: raporNotes.value,
    status: raporStatus.value
  })

  toast.success(
    'Rapor New Hire Tersimpan',
    `Rapor 7 Kompetensi untuk ${selectedCrew.value.name} berhasil disimpan di sistem gerai.`
  )
}

const goToNextCrew = () => {
  const list = filteredCrewList.value
  if (list.length === 0) return
  const currentIdx = list.findIndex(c => c.id === selectedCrewId.value)
  if (currentIdx > -1 && currentIdx < list.length - 1) {
    selectedCrewId.value = list[currentIdx + 1].id
  } else {
    selectedCrewId.value = list[0].id
  }
}
</script>
