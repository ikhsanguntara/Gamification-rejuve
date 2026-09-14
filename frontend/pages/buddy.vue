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
            Penilaian Buddy New Hire
          </h2>
          <span v-if="batchStore.currentBatch?.name" class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
            ⚡ Pre-Batch 3 Hari
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Formulir evaluasi pendampingan <strong>3 hari pra-batch</strong> oleh Store Leader / Buddy untuk memvalidasi kesiapan kru baru di gerai.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shadow-sm flex items-center gap-1.5">
          <Award class="w-3.5 h-3.5 text-purple-600" />
          <span>Evaluasi SOP Lapangan</span>
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

              <!-- Crew Summary Tag -->
              <div class="text-right flex-shrink-0">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block"
                  :class="getCrewStatusBadgeClass(crew)"
                >
                  {{ getCrewStatusText(crew) }}
                </span>
                <div class="text-[11px] text-slate-400 mt-0.5 flex items-center justify-end gap-1 font-semibold">
                  <span v-if="crew.totalMissionsCount > 0">{{ crew.evaluatedCount || 0 }}/{{ crew.totalMissionsCount }} Misi</span>
                  <span v-else class="text-[10px] text-slate-400">0 Misi</span>
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
          
          <!-- Sheet Header: Form Metadata Banner -->
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

              <!-- Real API Progress & Score Badge -->
              <div class="flex items-center gap-3 bg-purple-50 dark:bg-purple-950/40 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/60">
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Skor Kompetensi</span>
                  <p class="text-base font-bold text-slate-900 dark:text-white">
                    {{ selectedCrewStats.scorePercent }}%
                  </p>
                </div>
                <div class="h-6 w-px bg-purple-200 dark:bg-purple-800"></div>
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Dinilai</span>
                  <p class="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    {{ selectedCrewStats.evaluated }} / {{ selectedCrewStats.total }}
                  </p>
                </div>
                <div class="h-6 w-px bg-purple-200 dark:bg-purple-800"></div>
                <div class="text-center px-2">
                  <span class="text-[10px] font-semibold text-purple-600 dark:text-purple-400 uppercase">Status</span>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block"
                    :class="selectedCrewStats.statusBadgeClass"
                  >
                    {{ selectedCrewStats.statusText }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Form Information Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span class="text-[10px] font-bold uppercase text-slate-400">Store Training / Gerai:</span>
                <p class="font-bold text-slate-900 dark:text-white">
                  {{ selectedCrew.storeLocation || batchStore.currentBatch?.name || 'Gerai Re.juve' }}
                </p>
              </div>

              <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span class="text-[10px] font-bold uppercase text-slate-400">Store Leader / Evaluator:</span>
                <p class="font-bold text-slate-900 dark:text-white">
                  {{ userStore.currentUser?.name || 'Store Leader' }} (Store Leader)
                </p>
              </div>

              <div class="sm:col-span-2 p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span class="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Periode Pendampingan:</span>
                  <p class="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    3 Hari Pra-Batch (H-3 s/d H-1 sebelum kompetisi batch)
                  </p>
                </div>
                <div class="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  ⚡ Auto-Unlock Journey Week 1 saat seluruh misi dinilai
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State for Missions -->
          <div v-if="buddyStore.isLoadingMissions" class="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <Loader2 class="w-6 h-6 animate-spin mx-auto text-purple-600 mb-2" />
            <p class="text-xs font-semibold">Memuat penugasan misi Buddy...</p>
          </div>

          <!-- DAFTAR PENUGASAN MISI BUDDY DARI REAL API -->
          <div v-else-if="buddyStore.selectedCrewMissions && buddyStore.selectedCrewMissions.length > 0" class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <h3 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Award class="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Daftar Misi Buddy ({{ buddyStore.selectedCrewMissions.length }} Misi Terdaftar di Server)</span>
              </h3>
              <span class="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                {{ selectedCrewStats.evaluated }} dari {{ selectedCrewStats.total }} Selesai
              </span>
            </div>

            <div class="grid grid-cols-1 gap-3">
              <div
                v-for="(bm, bIdx) in buddyStore.selectedCrewMissions"
                :key="bm.userMissionId || bIdx"
                class="rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 p-4 sm:p-5 shadow-xs space-y-3.5"
                :class="bm.status === 'COMPLETED' && !editingMissionIds[bm.userMissionId]
                  ? 'border-slate-200/60 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/50'
                  : 'border-slate-200 dark:border-slate-700/80 hover:border-purple-300 dark:hover:border-purple-800/60'"
              >
                <!-- Header Misi: Kategori, Judul, Status Badge & Action -->
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50">
                        {{ bm.mission?.category || 'BUDDY MISI' }}
                      </span>
                      <span v-if="bm.mission?.durationNumber" class="text-[10px] text-slate-400 font-medium">
                        Hari ke-{{ bm.mission?.durationNumber }}
                      </span>
                    </div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">
                      {{ bIdx + 1 }}. {{ bm.mission?.missionTitle || 'Misi Buddy' }}
                    </h4>
                    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {{ bm.mission?.description || 'Pendampingan dan pembekalan operasional pra-batch.' }}
                    </p>
                  </div>

                  <!-- Status Badge & Tombol Ubah -->
                  <div class="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                    <template v-if="bm.status === 'COMPLETED'">
                      <span
                        class="px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-2xs"
                        :class="getBuddyScoreBadge(bm.tlScore || bm.finalScore || 3).badgeClass"
                      >
                        <CheckCircle2 class="w-3.5 h-3.5" />
                        <span>{{ getBuddyScoreBadge(bm.tlScore || bm.finalScore || 3).fullLabel }}</span>
                      </span>

                      <button
                        type="button"
                        @click="toggleEditMission(bm.userMissionId)"
                        class="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                        title="Ubah Penilaian"
                      >
                        <Edit3 class="w-3.5 h-3.5" />
                      </button>
                    </template>
                    <span
                      v-else
                      class="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100/80 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>Perlu Dinilai</span>
                    </span>
                  </div>
                </div>

                <!-- Input Form Penilaian (Muncul jika belum dinilai ATAU sedang mode edit) -->
                <div v-if="bm.status !== 'COMPLETED' || editingMissionIds[bm.userMissionId]" class="space-y-3 pt-1">
                  <!-- Label Seksi -->
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span>Tingkat Penguasaan SOP / Misi:</span>
                      <span class="text-[10px] font-normal text-slate-400">(Pilih salah satu skala)</span>
                    </label>
                    <span
                      v-if="buddyMissionScores[bm.userMissionId]"
                      class="text-[11px] font-semibold"
                      :class="getBuddyScoreBadge(buddyMissionScores[bm.userMissionId]).textClass"
                    >
                      Nilai Terpilih: {{ buddyMissionScores[bm.userMissionId] }} ({{ getBuddyScoreBadge(buddyMissionScores[bm.userMissionId]).label }})
                    </span>
                    <span
                      v-else
                      class="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic"
                    >
                      Belum dinilai
                    </span>
                  </div>

                  <!-- 3 Skala Penilaian: Belum Menguasai (1), Butuh Pendampingan (2), Kompeten (3) -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <!-- Option 1: Belum Menguasai -->
                    <button
                      type="button"
                      @click="buddyMissionScores[bm.userMissionId] = 1"
                      class="relative flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer group"
                      :class="buddyMissionScores[bm.userMissionId] === 1
                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-400 dark:border-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-rose-300 hover:bg-rose-50/30 dark:hover:bg-slate-800'"
                    >
                      <div class="flex items-center gap-2.5">
                        <span
                          class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-colors"
                          :class="buddyMissionScores[bm.userMissionId] === 1
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover:bg-rose-100 group-hover:text-rose-700'"
                        >
                          1
                        </span>
                        <div>
                          <span
                            class="text-xs font-bold block"
                            :class="buddyMissionScores[bm.userMissionId] === 1 ? 'text-rose-700 dark:text-rose-300' : 'text-slate-700 dark:text-slate-300'"
                          >
                            Belum Menguasai
                          </span>
                          <span class="text-[10px] text-slate-400 block">Perlu pendampingan</span>
                        </div>
                      </div>
                      <div
                        v-if="buddyMissionScores[bm.userMissionId] === 1"
                        class="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center flex-shrink-0"
                      >
                        <Check class="w-2.5 h-2.5" />
                      </div>
                    </button>

                    <!-- Option 2: Butuh Pendampingan -->
                    <button
                      type="button"
                      @click="buddyMissionScores[bm.userMissionId] = 2"
                      class="relative flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer group"
                      :class="buddyMissionScores[bm.userMissionId] === 2
                        ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-800 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-amber-300 hover:bg-amber-50/30 dark:hover:bg-slate-800'"
                    >
                      <div class="flex items-center gap-2.5">
                        <span
                          class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-colors"
                          :class="buddyMissionScores[bm.userMissionId] === 2
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-700'"
                        >
                          2
                        </span>
                        <div>
                          <span
                            class="text-xs font-bold block"
                            :class="buddyMissionScores[bm.userMissionId] === 2 ? 'text-amber-800 dark:text-amber-300' : 'text-slate-700 dark:text-slate-300'"
                          >
                            Butuh Pendampingan
                          </span>
                          <span class="text-[10px] text-slate-400 block">Masih perlu supervisi</span>
                        </div>
                      </div>
                      <div
                        v-if="buddyMissionScores[bm.userMissionId] === 2"
                        class="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0"
                      >
                        <Check class="w-2.5 h-2.5" />
                      </div>
                    </button>

                    <!-- Option 3: Kompeten -->
                    <button
                      type="button"
                      @click="buddyMissionScores[bm.userMissionId] = 3"
                      class="relative flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer group"
                      :class="buddyMissionScores[bm.userMissionId] === 3
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-slate-800'"
                    >
                      <div class="flex items-center gap-2.5">
                        <span
                          class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-colors"
                          :class="buddyMissionScores[bm.userMissionId] === 3
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700'"
                        >
                          3
                        </span>
                        <div>
                          <span
                            class="text-xs font-bold block"
                            :class="buddyMissionScores[bm.userMissionId] === 3 ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'"
                          >
                            Kompeten
                          </span>
                          <span class="text-[10px] text-slate-400 block">Mandiri & sesuai SOP</span>
                        </div>
                      </div>
                      <div
                        v-if="buddyMissionScores[bm.userMissionId] === 3"
                        class="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0"
                      >
                        <Check class="w-2.5 h-2.5" />
                      </div>
                    </button>
                  </div>

                  <!-- Catatan Pendampingan -->
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <MessageSquare class="w-3.5 h-3.5" />
                    </div>
                    <input
                      v-model="buddyMissionNotes[bm.userMissionId]"
                      type="text"
                      placeholder="Tambahkan catatan pendampingan evaluasi ini..."
                      class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-colors shadow-2xs"
                    />
                  </div>

                  <!-- Action Button Row -->
                  <div class="flex items-center justify-between gap-2.5 pt-1">
                    <!-- Lampiran Bukti yang Sudah Ada -->
                    <div>
                      <div
                        v-if="bm.evidenceUrl"
                        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300"
                      >
                        <Paperclip class="w-3 h-3 text-purple-600 dark:text-purple-400" />
                        <span>Bukti tersimpan</span>
                        <button
                          type="button"
                          @click="openPreviewModal(bm.evidenceUrl, `Bukti: ${bm.mission?.missionTitle}`)"
                          class="font-bold text-purple-600 hover:underline cursor-pointer ml-1"
                        >
                          Lihat
                        </button>
                      </div>
                    </div>

                    <!-- Tombol Aksi Batal & Simpan -->
                    <div class="flex items-center gap-2">
                      <button
                        v-if="editingMissionIds[bm.userMissionId]"
                        type="button"
                        @click="toggleEditMission(bm.userMissionId)"
                        class="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Batal
                      </button>

                      <button
                        type="button"
                        :disabled="submittingMissionId === bm.userMissionId || !buddyMissionScores[bm.userMissionId]"
                        @click="submitBuddyMission(bm.userMissionId)"
                        class="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                      >
                        <Loader2 v-if="submittingMissionId === bm.userMissionId" class="w-3.5 h-3.5 animate-spin" />
                        <Check v-else class="w-3.5 h-3.5" />
                        <span>{{ submittingMissionId === bm.userMissionId ? 'Menyimpan...' : 'Simpan Nilai' }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Tampilan Catatan & Bukti ketika Selesai (Read-only view) -->
                <div v-else class="space-y-2">
                  <div class="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800 text-xs">
                    <MessageSquare class="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div class="flex-1">
                      <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">Catatan Pendampingan:</span>
                      <p class="text-slate-700 dark:text-slate-300 italic mt-0.5">
                        "{{ bm.tlNotes || 'Pendampingan pra-batch telah selesai dilakukan dan memenuhi standar operasional.' }}"
                      </p>
                    </div>
                  </div>

                  <!-- Tampilan Foto / Bukti SOP yang Di-upload -->
                  <div
                    v-if="bm.evidenceUrl"
                    class="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs"
                  >
                    <div class="flex items-center gap-2.5">
                      <div
                        @click="openPreviewModal(bm.evidenceUrl, `Bukti Misi: ${bm.mission?.missionTitle}`)"
                        class="relative w-10 h-10 rounded-lg overflow-hidden border border-purple-200 dark:border-purple-800 flex-shrink-0 cursor-pointer group bg-white dark:bg-slate-800 shadow-2xs hover:ring-2 hover:ring-purple-600 transition-all"
                        title="Klik untuk memperbesar bukti"
                      >
                        <img
                          :src="bm.evidenceUrl"
                          alt="Foto Bukti"
                          class="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          @error="$event.target.style.display='none'"
                        />
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye class="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <span class="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                          Lampiran Bukti SOP
                        </span>
                        <span class="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          Foto bukti lapangan telah diunggah
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="openPreviewModal(bm.evidenceUrl, `Bukti Misi: ${bm.mission?.missionTitle}`)"
                      class="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Eye class="w-3 h-3" />
                      <span>Lihat Bukti</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State when Crew has No Missions -->
          <div
            v-else
            class="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-xs space-y-2"
          >
            <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Award class="w-6 h-6" />
            </div>
            <p class="font-bold text-slate-700 dark:text-slate-300">Belum Ada Misi Buddy untuk Kru Ini</p>
            <p class="text-slate-500">Kru ini belum memiliki penugasan misi Buddy pada batch aktif.</p>
          </div>

        </template>
        <div
          v-else
          class="p-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-xs"
        >
          Silakan pilih kru dari daftar di sebelah kiri untuk mengisi Penilaian Buddy.
        </div>
      </div>

    <!-- Lightbox Modal untuk Preview Foto Bukti SOP -->
    <BaseModal
      :model-value="!!previewModalImage"
      :title="previewModalImage?.caption || 'Lihat Foto Bukti SOP'"
      max-width="2xl"
      @update:model-value="previewModalImage = null"
      @close="previewModalImage = null"
    >
      <template #icon>
        <div class="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center">
          <Camera class="w-5 h-5" />
        </div>
      </template>

      <div v-if="previewModalImage" class="space-y-3 py-2">
        <div class="rounded-2xl overflow-hidden bg-slate-950/5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2">
          <img
            :src="previewModalImage.url"
            :alt="previewModalImage.caption"
            class="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md"
          />
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-800 dark:text-slate-200">
            📄 {{ previewModalImage.caption }}
          </span>
          <span class="text-slate-400 text-[11px]">
            Lampiran Bukti Evaluasi SOP
          </span>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="previewModalImage = null"
          class="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all cursor-pointer"
        >
          Tutup
        </button>
      </template>
    </BaseModal>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
  Handshake,
  Users,
  Award,
  Search,
  Check,
  CheckCircle2,
  MessageSquare,
  Edit3,
  Loader2,
  Camera,
  Paperclip,
  Eye
} from 'lucide-vue-next'
import { useBuddyStore } from '~/stores/buddy.js'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'
import { useConfetti } from '~/composables/useConfetti.js'

const buddyStore = useBuddyStore()
const batchStore = useBatchStore()
const userStore = useUserStore()
const toast = useToast()
const confetti = useConfetti()

const crewSearchQuery = ref('')
const selectedCrewId = ref('')
const buddyMissionScores = reactive({})
const buddyMissionNotes = reactive({})
const previewModalImage = ref(null)
const editingMissionIds = reactive({})
const submittingMissionId = ref(null)

const toggleEditMission = (userMissionId) => {
  const isCurrentlyEditing = !!editingMissionIds[userMissionId]
  if (isCurrentlyEditing) {
    // Jika membatalkan edit, kembalikan nilai sesuai data asli misi
    const m = (buddyStore.selectedCrewMissions || []).find(x => x.userMissionId === userMissionId)
    if (m && m.status === 'COMPLETED') {
      const score = m.tlScore !== null && m.tlScore !== undefined ? m.tlScore : m.finalScore
      buddyMissionScores[userMissionId] = [1, 2, 3].includes(Number(score))
        ? Number(score)
        : (Number(score) >= 90 ? 3 : Number(score) >= 60 ? 2 : 1)
      buddyMissionNotes[userMissionId] = m.tlNotes || ''
    } else {
      delete buddyMissionScores[userMissionId]
      buddyMissionNotes[userMissionId] = ''
    }
  }
  editingMissionIds[userMissionId] = !isCurrentlyEditing
}

const openPreviewModal = (evidenceUrl, caption = 'Bukti Misi Buddy') => {
  if (!evidenceUrl) return
  previewModalImage.value = {
    url: evidenceUrl,
    caption
  }
}

// Get crews from real API (buddyStore.workstationCrews)
const currentBatchCrews = computed(() => {
  const activeBatchId = batchStore.selectedBatchId || batchStore.currentBatch?.batchId || batchStore.currentBatch?.id
  const activeBatchCode = batchStore.currentBatch?.code

  if (buddyStore.workstationCrews && buddyStore.workstationCrews.length > 0) {
    const matchingCrews = buddyStore.workstationCrews.filter(c => {
      const matchBatchId = c.batchId && (c.batchId === activeBatchId || c.batchId === activeBatchCode)
      const hasMissionsInBatch = Number(c.totalMissionsCount) > 0
      return matchBatchId || hasMissionsInBatch
    })

    const targetList = matchingCrews.length > 0 ? matchingCrews : buddyStore.workstationCrews

    return targetList.map(c => ({
      id: c.userId || c.id,
      userId: c.userId || c.id,
      name: c.name,
      avatar: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`,
      code: c.departmentCode || 'CRW-NEW',
      position: c.position || 'Store Specialist New Hire',
      storeLocation: c.storeLocation || 'Standby Gerai',
      totalMissionsCount: Number(c.totalMissionsCount) || 0,
      evaluatedCount: Number(c.evaluatedCount) || 0,
      status: c.status || 'NEEDS_SCORING',
      avgScore: Number(c.avgScore) || 0
    }))
  }
  if (!batchStore.currentBatch) return []
  return (userStore.allUsers || [])
    .filter(u => u.role === 'CREW' && (u.batchId === activeBatchId || !u.batchId))
    .map(u => ({
      id: u.userId || u.id,
      userId: u.userId || u.id,
      name: u.name,
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`,
      code: u.departmentCode || 'CRW-NEW',
      position: u.position || 'Store Specialist New Hire',
      storeLocation: u.storeLocation || 'Standby Gerai',
      totalMissionsCount: 0,
      evaluatedCount: 0,
      status: 'NEEDS_SCORING',
      avgScore: 0
    }))
})

const filteredCrewList = computed(() => {
  const list = currentBatchCrews.value || []
  if (!crewSearchQuery.value) return list
  const q = crewSearchQuery.value.toLowerCase()
  return list.filter(c => c.name.toLowerCase().includes(q))
})

const selectedCrew = computed(() => {
  const list = currentBatchCrews.value || []
  return list.find(c => c.id === selectedCrewId.value) || list[0] || null
})

// Real-time computed stats for selected crew
const selectedCrewStats = computed(() => {
  const missions = buddyStore.selectedCrewMissions || []
  const total = missions.length
  const evaluated = (missions || []).filter(m => m.status === 'COMPLETED').length
  
  const scoredMissions = (missions || []).filter(m => m.status === 'COMPLETED' && (m.tlScore !== null || m.finalScore !== null))
  let avgScore = 0
  let scorePercent = 0
  if (scoredMissions.length > 0) {
    const totalScore = scoredMissions.reduce((acc, m) => {
      const val = m.tlScore !== null && m.tlScore !== undefined ? m.tlScore : m.finalScore
      return acc + (Number(val) || 0)
    }, 0)
    avgScore = parseFloat((totalScore / scoredMissions.length).toFixed(1))
    scorePercent = Math.min(100, Math.round((avgScore / 3) * 100))
  }

  let statusText = 'Belum Dinilai'
  let statusBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'

  if (total === 0) {
    statusText = 'Belum Ada Misi'
    statusBadgeClass = 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
  } else if (evaluated >= total) {
    statusText = 'Siap Batch'
    statusBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  } else if (evaluated > 0) {
    statusText = 'Dalam Bimbingan'
    statusBadgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  }

  return {
    total,
    evaluated,
    avgScore,
    scorePercent,
    statusText,
    statusBadgeClass
  }
})

const getBuddyScoreBadge = (score) => {
  const num = Number(score)
  if (num === 3 || num >= 90) {
    return {
      score: 3,
      label: 'Kompeten',
      fullLabel: 'Kompeten (Skor 3)',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80',
      textClass: 'text-emerald-700 dark:text-emerald-400',
      dotClass: 'bg-emerald-500'
    }
  }
  if (num === 2 || num >= 60) {
    return {
      score: 2,
      label: 'Butuh Pendampingan',
      fullLabel: 'Butuh Pendampingan (Skor 2)',
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80',
      textClass: 'text-amber-700 dark:text-amber-400',
      dotClass: 'bg-amber-500'
    }
  }
  return {
    score: 1,
    label: 'Belum Menguasai',
    fullLabel: 'Belum Menguasai (Skor 1)',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80',
    textClass: 'text-rose-700 dark:text-rose-400',
    dotClass: 'bg-rose-500'
  }
}

const loadBuddyScores = () => {
  // Bersihkan nilai sebelumnya saat berpindah kru
  Object.keys(buddyMissionScores).forEach(key => delete buddyMissionScores[key])
  Object.keys(buddyMissionNotes).forEach(key => delete buddyMissionNotes[key])

  (buddyStore.selectedCrewMissions || []).forEach(m => {
    if (m.status === 'COMPLETED') {
      if (m.tlScore !== null && m.tlScore !== undefined) {
        buddyMissionScores[m.userMissionId] = [1, 2, 3].includes(Number(m.tlScore))
          ? Number(m.tlScore)
          : (Number(m.tlScore) >= 90 ? 3 : Number(m.tlScore) >= 60 ? 2 : 1)
      } else if (m.finalScore !== null && m.finalScore !== undefined) {
        buddyMissionScores[m.userMissionId] = [1, 2, 3].includes(Number(m.finalScore))
          ? Number(m.finalScore)
          : (Number(m.finalScore) >= 90 ? 3 : Number(m.finalScore) >= 60 ? 2 : 1)
      }

      if (m.tlNotes) {
        buddyMissionNotes[m.userMissionId] = m.tlNotes
      }
    }
  })
}

const loadBuddyData = async () => {
  const batchId = batchStore.selectedBatchId || batchStore.currentBatch?.batchId || batchStore.currentBatch?.id
  await buddyStore.fetchBuddyCrews({ batchId })

  if (currentBatchCrews.value.length > 0) {
    if (!selectedCrewId.value || !currentBatchCrews.value.find(c => c.id === selectedCrewId.value)) {
      selectedCrewId.value = currentBatchCrews.value[0].id
    }
  } else {
    selectedCrewId.value = null
  }

  if (selectedCrewId.value) {
    await buddyStore.fetchBuddyMissions(selectedCrewId.value, { batchId })
    loadBuddyScores()
  }
}

watch(selectedCrewId, async (newId) => {
  if (newId) {
    const batchId = batchStore.selectedBatchId || batchStore.currentBatch?.batchId || batchStore.currentBatch?.id
    await buddyStore.fetchBuddyMissions(newId, { batchId })
    loadBuddyScores()
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 120, behavior: 'smooth' })
    }
  }
})

watch([() => batchStore.selectedBatchId, () => batchStore.currentBatch?.id], async () => {
  await loadBuddyData()
})

onMounted(async () => {
  try {
    await Promise.allSettled([
      userStore.fetchUsersFromApi({ limit: 100 }),
      batchStore.fetchBatchesFromApi({ limit: 10 })
    ])
    await loadBuddyData()
  } catch (err) {
    console.error('Failed to fetch users/batches in buddy page:', err)
  }
})

const submitBuddyMission = async (userMissionId) => {
  if (!selectedCrew.value) return
  const rawScore = buddyMissionScores[userMissionId]
  if (!rawScore || ![1, 2, 3].includes(Number(rawScore))) {
    toast.warning('Pilih Nilai Terlebih Dahulu', 'Silakan tentukan penilaian (Belum Menguasai, Butuh Pendampingan, atau Kompeten) terlebih dahulu.')
    return
  }
  const score = Number(rawScore)
  const label = score === 3 ? 'Kompeten' : score === 2 ? 'Butuh Pendampingan' : 'Belum Menguasai'
  const notes = buddyMissionNotes[userMissionId] || `Penilaian pendampingan Buddy (${label}) untuk ${selectedCrew.value.name}`

  submittingMissionId.value = userMissionId
  try {
    const payload = {
      score,
      notes
    }

    await buddyStore.submitBuddyScore(userMissionId, payload)
    
    editingMissionIds[userMissionId] = false

    // Efek semarak bintang gamifikasi
    confetti.triggerApprovalStars({ x: 0.5, y: 0.35 })

    toast.success('Misi Buddy Selesai!', `Penilaian berhasil disimpan sebagai "${label}" (Skor: ${score}). 🚀`)
  } catch (err) {
    toast.error('Gagal Menyimpan Nilai Buddy', err.message || 'Terjadi kesalahan saat memproses data.')
  } finally {
    submittingMissionId.value = null
  }
}

// Helpers for sidebar badge
const getCrewStatusBadgeClass = (crew) => {
  if (!crew) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  if (crew.totalMissionsCount > 0 && crew.evaluatedCount >= crew.totalMissionsCount) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  }
  if (crew.evaluatedCount > 0) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
  }
  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
}

const getCrewStatusText = (crew) => {
  if (!crew) return 'Belum Dinilai'
  if (crew.totalMissionsCount === 0) return '0 Misi'
  if (crew.evaluatedCount >= crew.totalMissionsCount) return 'Selesai'
  if (crew.evaluatedCount > 0) return 'Proses'
  return 'Belum Dinilai'
}
</script>

