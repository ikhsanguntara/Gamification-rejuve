<template>
  <div class="space-y-6">
    <!-- Top Header & Workstation Context -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Workstation Penilaian Kru
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
          <span
            class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
            :class="userStore.isDistrictManager ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
          >
            POV: {{ userStore.isDistrictManager ? 'District Manager (DM)' : 'Store Leader (SL)' }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Pilih <strong>Crew</strong> terlebih dahulu, lalu nilai <strong>seluruh misi 1 week</strong> satu per satu untuk kru tersebut.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Week {{ batchStore.selectedWeek }} Aktif</span>
        </span>
      </div>
    </div>

    <!-- 3-Week Progression Selector -->
    <WeekSelector />

    <!-- 2-Column Main Workspace: Crew Selector Sidebar (4 Cols, Sticky Frozen) & Weekly Missions Evaluation for Selected Crew (8 Cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- Left Column: Crew Roster Selector (4 Cols, Sticky Frozen Container) -->
      <div class="lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
        <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col max-h-[calc(100vh-6rem)]">
          <div class="flex items-center justify-between gap-2 px-1 mb-2.5 flex-shrink-0">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
              <span>Daftar Crew Gerai ({{ filteredCrewList.length }})</span>
            </h3>
            <span class="text-[10px] font-semibold text-slate-400">Pilih kru</span>
          </div>

          <!-- Search Bar -->
          <div class="relative flex-shrink-0 mb-2">
            <input
              v-model="crewSearchQuery"
              type="text"
              placeholder="Cari nama atau jabatan kru..."
              class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <!-- Filter Tabs: Semua / Belum Selesai / Sudah Diajukan -->
          <div class="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto text-xs flex-shrink-0 mb-3">
            <button
              v-for="tab in crewFilterTabs"
              :key="tab.key"
              type="button"
              @click="activeCrewFilter = tab.key"
              class="px-2.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer text-xs"
              :class="[
                activeCrewFilter === tab.key
                  ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Scrollable Crew Cards List inside Frozen Sidebar -->
          <div class="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0">
            <div
              v-for="crew in filteredCrewList"
              :key="crew.id"
              @click="selectedCrewId = crew.id"
              class="p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-2.5 relative overflow-hidden"
              :class="[
                selectedCrewId === crew.id
                  ? 'ring-2 ring-[#831843] bg-[#831843]/5 dark:bg-[#831843]/15 border-[#831843]/60 shadow-md'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
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
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                      Lv.{{ crew.level || 1 }}
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                    <span>{{ crew.position || 'Crew Specialist' }}</span>
                    <span>•</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-300">🏪 {{ crew.storeLocation || 'Standby' }}</span>
                  </p>
                </div>
              </div>

              <!-- Crew Week Progress Badge -->
              <div class="text-right flex-shrink-0">
                <span
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  :class="getCrewWeekBadgeClass(crew.id)"
                >
                  {{ getCrewWeekProgressLabel(crew.id) }}
                </span>
                <div class="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1 font-semibold">
                  <Star class="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{{ getCrewWeekAvgScore(crew.id) }}%</span>
                </div>
              </div>
            </div>

            <div
              v-if="filteredCrewList.length === 0"
              class="py-12 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800"
            >
              Tidak ada crew yang sesuai dengan filter.
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: 1 Week All Missions for Selected Crew (8 Cols) -->
      <div class="lg:col-span-8 space-y-4">
        <template v-if="selectedCrew">
          <!-- Active Crew Profile & Week Summary Banner (Sticky Frozen Top) -->
          <div class="sticky top-20 z-20 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 p-4 sm:p-5 shadow-sm transition-all">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3.5">
                <img
                  :src="selectedCrew.avatar"
                  :alt="selectedCrew.name"
                  class="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#831843]/30 shadow-sm"
                />
                <div>
                  <div class="flex items-center gap-2 mb-0.5">
                    <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {{ selectedCrew.name }}
                    </h3>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {{ selectedCrew.code || 'CRW-01' }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {{ selectedCrew.position || 'Store Specialist' }} • Cabang {{ batchStore.currentBatch?.name }}
                  </p>
                </div>
              </div>

              <!-- Quick Week KPI Stats Box for this Crew -->
              <div class="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase">Rata-Rata</span>
                  <p class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {{ currentCrewWeekAvgScore }}%
                  </p>
                </div>
                <div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase">Bintang Week</span>
                  <p class="text-sm font-bold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
                    <Star class="w-3.5 h-3.5 fill-amber-400" />
                    {{ currentCrewWeekTotalStars }}
                  </p>
                </div>
                <div class="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase">Misi Dinilai</span>
                  <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {{ currentCrewEvaluatedMissionsCount }} / {{ currentWeekMissions.length }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- All 4 Missions in 1 Week (Evaluated 1 by 1) -->
          <div class="space-y-4">
            <div class="flex items-center justify-between px-1">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Target class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
                <span>Misi Operasional Week {{ batchStore.selectedWeek }} ({{ currentWeekMissions.length }} Misi)</span>
              </h3>
              <span class="text-xs text-slate-400">Nilai satu per satu per misi di bawah ini</span>
            </div>

            <!-- Single Mission Evaluation Card (1 per 1) -->
            <!-- Single Mission Evaluation Card (Compact, Neat & Sleek) -->
            <div
              v-for="(mission, mIdx) in currentWeekMissions"
              :key="mission.id"
              class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-xs space-y-3 transition-all"
              :class="[
                getMissionCardBorderClass(mission.id)
              ]"
            >
              <!-- Mission Title Header & Badge -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div class="space-y-0.5 min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {{ mission.code }}
                    </span>
                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                      {{ mission.category }}
                    </span>
                    <MissionStatus :status="mission.status" />
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white pt-0.5">
                    {{ mIdx + 1 }}. {{ mission.title }}
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {{ mission.description }}
                  </p>
                </div>

                <!-- Individual Score Display for this Mission -->
                <div class="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex-shrink-0">
                  <StarReward
                    :stars="calculateMissionStars(missionScores[mission.id])"
                    size="sm"
                    :show-label="false"
                  />
                  <div class="text-right border-l border-slate-200 dark:border-slate-700 pl-2">
                    <span class="text-xs font-bold text-slate-900 dark:text-white">
                      {{ missionScores[mission.id] || 0 }}
                    </span>
                    <span class="text-[10px] text-slate-400">/100</span>
                  </div>
                </div>
              </div>

              <!-- Checklist SOP Standar (Compact Horizontal Pills) -->
              <div class="p-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-[11px]">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-400">
                  <div
                    v-for="(req, rIdx) in mission.requirements"
                    :key="rIdx"
                    class="flex items-center gap-1.5 truncate"
                  >
                    <CheckSquare class="w-3 h-3 text-[#831843] dark:text-[#f472b6] flex-shrink-0" />
                    <span class="truncate">{{ req }}</span>
                  </div>
                </div>
              </div>

              <!-- JIKA MISI SUDAH SELESAI (COMPLETED / APPROVED): Tampilkan Ringkasan Read-Only (Tanpa Slider & Tombol Update) -->
              <template v-if="getMissionStatus(mission.id) === 'COMPLETED' || getMissionStatus(mission.id) === 'APPROVED'">
                <!-- Catatan Evaluator & Foto Bukti (Read-Only) -->
                <div class="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-2.5 text-xs">
                  <!-- Catatan Evaluator -->
                  <div class="flex items-start gap-2">
                    <MessageSquare class="w-4 h-4 text-[#831843] dark:text-[#f472b6] mt-0.5 flex-shrink-0" />
                    <div class="space-y-0.5">
                      <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                        Catatan Evaluator:
                      </span>
                      <p class="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                        "{{ getMissionComment(mission.id) }}"
                      </p>
                    </div>
                  </div>

                  <!-- Foto Bukti Lapangan -->
                  <div v-if="(missionEvidences[mission.id] || []).length > 0" class="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
                    <span class="text-[11px] font-bold text-slate-500 flex items-center gap-1 flex-shrink-0">
                      <Camera class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                      <span>Foto Bukti ({{ (missionEvidences[mission.id] || []).length }}):</span>
                    </span>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <div
                        v-for="(ev, evIdx) in missionEvidences[mission.id]"
                        :key="evIdx"
                        @click="previewImage = ev"
                        class="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800 flex-shrink-0 cursor-pointer shadow-2xs hover:ring-2 hover:ring-[#831843] transition-all"
                        title="Klik untuk melihat foto lebih besar"
                      >
                        <img :src="ev.url" :alt="ev.caption || 'Bukti'" class="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye class="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- JIKA MISI BELUM SELESAI: Tampilkan Form Input Slider, Catatan, Upload Foto, dan Tombol Kirim -->
              <template v-else>
                <!-- Input Nilai (Slider & Box Inline) -->
                <div class="p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div class="flex items-center justify-between gap-3">
                    <label class="text-xs font-bold text-slate-800 dark:text-slate-200 flex-shrink-0">
                      Nilai {{ selectedCrew.name }}:
                    </label>
                    
                    <!-- Range Slider in Center -->
                    <input
                      v-model.number="missionScores[mission.id]"
                      type="range"
                      min="0"
                      max="100"
                      class="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#831843]"
                    />

                    <!-- Number Input Box -->
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <input
                        v-model.number="missionScores[mission.id]"
                        type="number"
                        min="0"
                        max="100"
                        class="w-14 text-center text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 py-1 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#831843]"
                      />
                      <span class="text-[11px] text-slate-400 font-semibold">/100</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
                    <span>0 (Gagal)</span>
                    <span>50 (⭐1)</span>
                    <span>80 (⭐4)</span>
                    <span>90 (⭐5)</span>
                    <span>100</span>
                  </div>
                </div>

                <!-- Catatan Evaluator & Upload Foto (Compact 2-Column Grid) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                  <!-- Catatan Evaluator -->
                  <div class="space-y-1">
                    <label class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block">
                      Catatan Evaluator (Opsional):
                    </label>
                    <textarea
                      v-model="missionComments[mission.id]"
                      rows="2"
                      placeholder="Tuliskan catatan kepatuhan SOP atau temuan lapangan..."
                      class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#831843] resize-none"
                    ></textarea>
                  </div>

                  <!-- Upload Foto Bukti SOP -->
                  <div class="space-y-1">
                    <div class="flex items-center justify-between">
                      <label class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Camera class="w-3 h-3 text-[#831843] dark:text-[#f472b6]" />
                        <span>Foto Bukti (Opsional):</span>
                      </label>
                      <span v-if="(missionEvidences[mission.id] || []).length > 0" class="text-[10px] text-slate-400 font-medium">
                        {{ (missionEvidences[mission.id] || []).length }} Foto
                      </span>
                    </div>

                    <div class="flex items-center gap-1.5 flex-wrap">
                      <!-- Tombol Upload File -->
                      <label class="h-8 px-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 hover:border-[#831843] bg-slate-50 dark:bg-slate-800 hover:bg-[#831843]/5 flex items-center gap-1.5 cursor-pointer transition-all text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          class="hidden"
                          @change="handleFileUpload($event, mission.id)"
                        />
                        <Plus class="w-3 h-3 text-[#831843] dark:text-[#f472b6]" />
                        <span class="text-[11px]">+ Foto</span>
                      </label>

                      <!-- Preview Thumbnail Foto yang Diupload (Klik untuk memperbesar) -->
                      <div
                        v-for="(ev, evIdx) in (missionEvidences[mission.id] || [])"
                        :key="evIdx"
                        @click="previewImage = ev"
                        class="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group bg-slate-100 dark:bg-slate-800 flex-shrink-0 cursor-pointer shadow-2xs hover:ring-2 hover:ring-[#831843] transition-all"
                        title="Klik untuk melihat foto lebih besar"
                      >
                        <img :src="ev.url" :alt="ev.caption || 'Bukti'" class="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        
                        <!-- Hover Zoom Icon -->
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye class="w-3 h-3 text-white" />
                        </div>

                        <!-- Tombol Hapus Foto -->
                        <button
                          type="button"
                          @click.stop="removeEvidence(mission.id, evIdx)"
                          class="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-bl flex items-center justify-center cursor-pointer shadow-xs z-10"
                          title="Hapus foto ini"
                        >
                          <X class="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Bar Per-Misi (Compact Footer) -->
                <div class="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <!-- Status Indikator Misi -->
                  <div class="flex items-center gap-1.5">
                    <span
                      v-if="getMissionStatus(mission.id) === 'PENDING_REVIEW'"
                      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold"
                    >
                      <Clock class="w-3 h-3 text-amber-600 animate-pulse" />
                      <span>⏳ Menunggu Review DM</span>
                    </span>

                    <span v-else class="text-[11px] text-slate-400 font-medium">
                      ⚡ Siap dinilai & diajukan
                    </span>
                  </div>

                  <!-- Tombol Aksi Mandiri Per-Misi -->
                  <button
                    type="button"
                    @click="submitSingleMission(mission.id)"
                    class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    :class="[
                      getMissionStatus(mission.id) === 'PENDING_REVIEW'
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-[#831843] hover:bg-[#6b133a]'
                    ]"
                  >
                    <Send class="w-3 h-3" />
                    <span v-if="getMissionStatus(mission.id) === 'PENDING_REVIEW'">Perbarui Nilai di DM</span>
                    <span v-else>Kirim Misi Ini ke DM</span>
                  </button>
                </div>
              </template>
            </div>
          </div>

          <!-- Bottom Floating Action Bar for Selected Crew (Sticky Frozen Bottom) -->
          <div class="p-3 sm:p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg flex items-center justify-between gap-3 sticky bottom-4 z-20">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Ringkasan Week {{ batchStore.selectedWeek }}:
              </span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">
                Avg {{ currentCrewWeekAvgScore }}% • {{ currentCrewWeekTotalStars }} ⭐ ({{ currentCrewEvaluatedMissionsCount }}/{{ currentWeekMissions.length }} Misi Selesai)
              </span>
            </div>

            <div>
              <button
                type="button"
                @click="goToNextCrew"
                class="px-4 py-2 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#831843]/20 active:scale-95"
              >
                <span>Kru Berikutnya</span>
                <ChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </template>

        <EmptyState
          v-else
          title="Pilih Crew untuk memulai penilaian"
          description="Pilih salah satu anggota Crew di daftar sebelah kiri untuk menampilkan seluruh misi 1 week dan memberikan nilai satu per satu."
          icon="Users"
        />
      </div>
    </div>

    <!-- Image Preview Lightbox Modal -->
    <BaseModal
      :model-value="!!previewImage"
      :title="previewImage?.caption || 'Lihat Foto Bukti Misi'"
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
            :src="previewImage.url"
            :alt="previewImage.caption"
            class="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md"
          />
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-800 dark:text-slate-200">
            📄 {{ previewImage.caption || 'Foto Bukti Kepatuhan SOP' }}
          </span>
          <span class="text-slate-400 text-[11px]">
            Format: Gambar
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
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { useUserStore } from '~/stores/user.js'
import { useApprovalStore } from '~/stores/approval.js'
import { calculateStars } from '~/utils/star.js'
import { useToast } from '~/composables/useToast.js'
import WeekSelector from '~/components/batch/WeekSelector.vue'
import MissionStatus from '~/components/mission/MissionStatus.vue'
import StarReward from '~/components/gamification/StarReward.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import {
  Users,
  Search,
  Star,
  Target,
  CheckSquare,
  Send,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  Plus,
  X,
  Eye,
  Image as ImageIcon
} from 'lucide-vue-next'

const route = useRoute()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const evalStore = useEvaluationStore()
const approvalStore = useApprovalStore()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()
const toast = useToast()

const previewImage = ref(null)

const crewSearchQuery = ref('')
const activeCrewFilter = ref('ALL')
const crewFilterTabs = [
  { key: 'ALL', label: 'Semua Kru' },
  { key: 'NEEDS_SCORING', label: 'Belum Dinilai' },
  { key: 'COMPLETED', label: 'Selesai' }
]

const batchCrews = computed(() => {
  return gamificationStore.crewsByBatch(batchStore.currentBatch?.id || 'batch-alpha')
})

const selectedCrewId = ref(null)

const filteredCrewList = computed(() => {
  let list = batchCrews.value

  if (activeCrewFilter.value === 'NEEDS_SCORING') {
    list = list.filter(c => getCrewWeekEvaluatedCount(c.id) < currentWeekMissions.value.length)
  } else if (activeCrewFilter.value === 'COMPLETED') {
    list = list.filter(c => getCrewWeekEvaluatedCount(c.id) >= currentWeekMissions.value.length)
  }

  if (crewSearchQuery.value.trim()) {
    const q = crewSearchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.position && c.position.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q))
    )
  }

  return list
})

const selectedCrew = computed(() => {
  return batchCrews.value.find(c => c.id === selectedCrewId.value) || null
})

const currentWeekMissions = computed(() => {
  return missionStore.missionsByWeek(batchStore.currentBatch?.id || 'batch-alpha', batchStore.selectedWeek)
})

// Mission scores map for selected crew: { [missionId]: score }
const missionScores = reactive({})
const missionComments = reactive({})
const missionEvidences = reactive({})

// Initialize or reload scores & evidence when selected crew or week changes
const loadCrewScores = () => {
  if (!selectedCrew.value) return

  currentWeekMissions.value.forEach(m => {
    // 1. Score
    const crewEval = missionStore.crewEvaluationForMission(m.id, selectedCrew.value.id)
    if (crewEval && crewEval.score > 0) {
      missionScores[m.id] = crewEval.score
    } else if (m.crewScores) {
      const found = m.crewScores.find(cs => cs.crewId === selectedCrew.value.id)
      missionScores[m.id] = found ? found.score : 90
    } else {
      if (missionScores[m.id] === undefined) {
        missionScores[m.id] = 90
      }
    }

    // 2. Comments
    const existingApproval = approvalStore.approvals.find(a => a.missionId === m.id && (a.crewId === selectedCrew.value.id || !a.crewId))
    const existingEval = evalStore.evaluations.find(e => e.missionId === m.id && (e.crewId === selectedCrew.value.id || (e.crewScores && e.crewScores.some(cs => cs.crewId === selectedCrew.value.id))))

    if (existingApproval && existingApproval.comment) {
      missionComments[m.id] = existingApproval.comment
    } else if (existingEval && existingEval.comment) {
      missionComments[m.id] = existingEval.comment
    } else if (crewEval && crewEval.comment) {
      missionComments[m.id] = crewEval.comment
    } else if (m.comment) {
      missionComments[m.id] = m.comment
    } else if (missionComments[m.id] === undefined) {
      missionComments[m.id] = ''
    }

    // 3. Evidence
    if (existingApproval && existingApproval.evidenceList && existingApproval.evidenceList.length > 0) {
      missionEvidences[m.id] = [...existingApproval.evidenceList]
    } else if (existingEval && existingEval.evidence && existingEval.evidence.length > 0) {
      missionEvidences[m.id] = [...existingEval.evidence]
    } else if (!missionEvidences[m.id]) {
      missionEvidences[m.id] = []
    }
  })
}

function handleFileUpload(event, missionId) {
  const files = event.target.files
  if (!files || files.length === 0) return

  if (!missionEvidences[missionId]) {
    missionEvidences[missionId] = []
  }

  Array.from(files).forEach((file, idx) => {
    if (!file.type.startsWith('image/')) {
      toast.warning('Format Tidak Didukung', 'Hanya file gambar (JPG, PNG, WebP) yang dapat diupload.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      missionEvidences[missionId].push({
        id: `ev-${Date.now()}-${idx}`,
        url: e.target.result,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        uploadedAt: new Date().toISOString()
      })
      toast.success('Foto Berhasil Dilampirkan', `${file.name} telah ditambahkan ke bukti misi.`)
    }
    reader.readAsDataURL(file)
  })

  event.target.value = ''
}

function removeEvidence(missionId, index) {
  if (missionEvidences[missionId]) {
    missionEvidences[missionId].splice(index, 1)
    toast.info('Foto Dihapus', 'Lampiran foto bukti telah dihapus.')
  }
}

watch([selectedCrewId, () => batchStore.selectedWeek, () => batchStore.selectedBatchId], () => {
  loadCrewScores()
}, { immediate: true })

onMounted(() => {
  if (batchCrews.value.length > 0) {
    selectedCrewId.value = batchCrews.value[0].id
  }
})

watch(filteredCrewList, (list) => {
  if (list.length > 0 && !list.find(c => c.id === selectedCrewId.value)) {
    selectedCrewId.value = list[0].id
  }
})

// KPI helpers for single crew
const currentCrewWeekAvgScore = computed(() => {
  if (currentWeekMissions.value.length === 0) return 0
  const scores = currentWeekMissions.value.map(m => Number(missionScores[m.id]) || 0)
  const sum = scores.reduce((acc, curr) => acc + curr, 0)
  return Math.round(sum / scores.length)
})

const currentCrewWeekTotalStars = computed(() => {
  return currentWeekMissions.value.reduce((acc, m) => {
    return acc + calculateMissionStars(missionScores[m.id])
  }, 0)
})

const currentCrewEvaluatedMissionsCount = computed(() => {
  return currentWeekMissions.value.filter(m => (Number(missionScores[m.id]) || 0) > 0).length
})

function calculateMissionStars(score) {
  return calculateStars(Number(score) || 0)
}

function getCrewWeekEvaluatedCount(crewId) {
  return currentWeekMissions.value.filter(m => {
    const ce = missionStore.crewEvaluationForMission(m.id, crewId)
    return ce && ce.score > 0
  }).length
}

function getCrewWeekAvgScore(crewId) {
  if (currentWeekMissions.value.length === 0) return 0
  const evals = currentWeekMissions.value.map(m => {
    const ce = missionStore.crewEvaluationForMission(m.id, crewId)
    return ce ? ce.score : (crewId === selectedCrewId.value ? (missionScores[m.id] || 90) : 90)
  })
  const sum = evals.reduce((a, b) => a + b, 0)
  return Math.round(sum / evals.length)
}

function getCrewWeekProgressLabel(crewId) {
  const count = getCrewWeekEvaluatedCount(crewId)
  const total = currentWeekMissions.value.length
  if (count === 0) return 'Belum Dinilai'
  if (count < total) return `${count}/${total} Dinilai`
  return 'Lengkap'
}

function getCrewWeekBadgeClass(crewId) {
  const count = getCrewWeekEvaluatedCount(crewId)
  const total = currentWeekMissions.value.length
  if (count === 0) return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  if (count < total) return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
}

function getMissionCardBorderClass(missionId) {
  const score = missionScores[missionId]
  if (score >= 90) return 'hover:border-emerald-400 dark:hover:border-emerald-700'
  if (score >= 80) return 'hover:border-amber-400 dark:hover:border-amber-700'
  return 'hover:border-slate-300 dark:hover:border-slate-700'
}

function getMissionStatus(missionId) {
  const mission = missionStore.missionById(missionId)
  if (!mission) return 'UNGRADED'
  if (selectedCrew.value) {
    const ce = missionStore.crewEvaluationForMission(missionId, selectedCrew.value.id)
    if (ce && ce.status) return ce.status
  }
  return mission.status || 'UNGRADED'
}

function getMissionComment(missionId) {
  if (missionComments[missionId] && missionComments[missionId].trim()) {
    return missionComments[missionId]
  }

  if (selectedCrew.value) {
    const existingApproval = approvalStore.approvals.find(a => a.missionId === missionId && (a.crewId === selectedCrew.value.id || !a.crewId))
    if (existingApproval?.comment && existingApproval.comment.trim()) {
      return existingApproval.comment
    }

    const existingEval = evalStore.evaluations.find(e => e.missionId === missionId && (e.crewId === selectedCrew.value.id || (e.crewScores && e.crewScores.some(cs => cs.crewId === selectedCrew.value.id))))
    if (existingEval?.comment && existingEval.comment.trim()) {
      return existingEval.comment
    }

    const crewEval = missionStore.crewEvaluationForMission(missionId, selectedCrew.value.id)
    if (crewEval?.comment && crewEval.comment.trim()) {
      return crewEval.comment
    }
  }

  const mission = missionStore.missionById(missionId)
  if (mission?.comment && mission.comment.trim()) {
    return mission.comment
  }

  const status = getMissionStatus(missionId)
  if (status === 'COMPLETED' || status === 'APPROVED') {
    return 'Pemeriksaan kepatuhan SOP operasional telah memenuhi standar kualitas Re.juve.'
  }

  return 'Catatan evaluasi belum diisi.'
}

function submitSingleMission(missionId) {
  if (!selectedCrew.value) return
  const targetMission = currentWeekMissions.value.find(m => m.id === missionId)
  const score = Number(missionScores[missionId]) || 90

  evalStore.submitForReview({
    missionId,
    supervisorId: userStore.currentUserId,
    supervisorName: userStore.currentUser?.name || 'Store Leader',
    crewScores: [{ crewId: selectedCrew.value.id, score }],
    comment: missionComments[missionId] || `Evaluasi misi ${targetMission?.code || ''} untuk ${selectedCrew.value.name}`,
    evidence: missionEvidences[missionId] || []
  })

  toast.success('Misi Berhasil Dikirim ke DM', `Misi "${targetMission?.title || missionId}" untuk ${selectedCrew.value.name} telah diajukan ke DM untuk persetujuan! 🚀`)
}

function goToNextCrew() {
  const currentIndex = filteredCrewList.value.findIndex(c => c.id === selectedCrewId.value)
  if (currentIndex !== -1 && currentIndex + 1 < filteredCrewList.value.length) {
    selectedCrewId.value = filteredCrewList.value[currentIndex + 1].id
  } else if (filteredCrewList.value.length > 0) {
    selectedCrewId.value = filteredCrewList.value[0].id
  }
}
</script>
