<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Buat Batch Baru</span>
    </div>

    <!-- Main Card -->
    <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center font-bold">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Buat Siklus Batch Baru
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Konfigurasi tanggal mulai, pilih template pendampingan Buddy 3 hari pra-batch, tentukan kurikulum SOP mingguan, dan tugaskan kru baru.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6 pt-6">
        
        <!-- 1. Informasi Dasar Siklus Batch -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Informasi Dasar Siklus Batch
          </h3>

          <!-- Nama Batch -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Siklus Batch *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              :placeholder="`Contoh: Batch ${nextBatchNumber || 1} — Program Pelatihan Multi-Gerai`"
              class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <!-- Deskripsi / Catatan Batch -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi / Catatan Batch
            </label>
            <input
              v-model="form.description"
              type="text"
              placeholder="Contoh: Siklus gamifikasi dan pelatihan standar operasional multi-gerai"
              class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <!-- 2. Pilihan Paket Master Template SOP Misi (Siklus 2, 3, 4, 5 Minggu) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Pilihan Paket Template Journey  *
              </h3>
          
            </div>
            <NuxtLink to="/admin/templates" class="text-[11px] text-[#831843] dark:text-[#f472b6] font-semibold hover:underline">
              Kelola Master Template →
            </NuxtLink>
          </div>

          <div class="p-4 rounded-2xl bg-[#831843]/5 border border-[#831843]/15 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Pilih Paket Master Template SOP *
              </label>
              <select
                v-model="form.templatePackageId"
                @change="onTemplatePackageChange"
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer shadow-2xs"
              >
                <option value="">-- Pilih Paket Master Template SOP --</option>
                <option v-for="pkg in templateStore.allPackages" :key="pkg.id" :value="pkg.id">
                  {{ pkg.name }} ({{ getPackageDurationLabel(pkg) }} • {{ (pkg.templates || pkg.details || []).length }} Misi • {{ pkg.targetType || 'Semua Gerai' }})
                </option>
                <option value="NONE">-- Tanpa Template (Misi Kosong) --</option>
              </select>
            </div>

            <!-- Tema & Judul Siklus Dinamis (Terkunci dari Template) -->
            <div class="pt-2 border-t border-[#831843]/15 space-y-2">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-700 dark:text-slate-300">
                  📌 Struktur {{ form.weeks.length }} {{ selectedTemplateUnitLabel }} (Otomatis dari Template):
                </span>
                <span v-if="form.weeks.length > 0" class="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✨ {{ form.weeks.length }} {{ selectedTemplateUnitLabel }} Dikonfigurasi
                </span>
                <span v-else class="text-slate-400 font-medium">
                  Belum ada template dipilih
                </span>
              </div>

              <!-- Placeholder Banner Saat Template Belum Dipilih -->
              <div v-if="form.weeks.length === 0" class="p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-center py-6 text-xs text-slate-400">
                Pilih paket template SOP di atas untuk memuat struktur jadwal misi.
              </div>

              <div
                v-else
                class="grid gap-2.5"
                :class="[
                  form.weeks.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
                  form.weeks.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                ]"
              >
                <div
                  v-for="w in form.weeks"
                  :key="w.weekNumber"
                  class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1"
                >
                  <div class="flex items-center justify-between">
                    <label class="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      Judul {{ selectedTemplateUnitLabel }} {{ w.weekNumber }}
                    </label>
                    <span class="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                      🔒 Template
                    </span>
                  </div>
                  <input
                    :value="w.title"
                    type="text"
                    readonly
                    disabled
                    class="w-full text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Pilihan Paket Template Misi Buddy (3 Hari Pre-Batch Khusus Store Leader) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Pilihan Paket Template Buddy
              </h3>
    
            </div>
            <span v-if="form.buddyPackageId && form.buddyPackageId !== 'NONE'" class="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
              🤝 Periode Buddy: {{ buddyDateRangeText }}
            </span>
          </div>

          <div class="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Pilih Kurikulum Template Misi Buddy
              </label>
              <select
                v-model="form.buddyPackageId"
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 cursor-pointer shadow-2xs"
              >
                <option value="">-- Pilih Paket Template Buddy (Opsional) --</option>
                <option v-for="bpkg in (templateStore.buddyTemplates.length > 0 ? templateStore.buddyTemplates : buddyStore.allPackages)" :key="bpkg.id" :value="bpkg.id">
                  {{ bpkg.name }} ({{ (bpkg.templates || bpkg.details || bpkg.competencies)?.length || 0 }} Misi • {{ bpkg.code }})
                </option>
                <option value="NONE">-- Lewati / Tanpa Program Buddy --</option>
              </select>
            </div>

            <!-- Pratinjau Rapor New Hire / Misi Buddy -->
            <div v-if="selectedBuddyPackage" class="pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
              <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                📋 Pratinjau Misi Buddy ({{ (selectedBuddyPackage.templates || selectedBuddyPackage.details || selectedBuddyPackage.competencies)?.length || 0 }} Misi/Kompetensi • {{ selectedBuddyPackage.durationValue || 3 }} Hari Pra-Batch):
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div
                  v-for="comp in (selectedBuddyPackage.templates || selectedBuddyPackage.details || selectedBuddyPackage.competencies || [])"
                  :key="comp.id"
                  class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 text-xs space-y-0.5"
                >
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0"></span>
                    <span class="font-bold text-purple-700 dark:text-purple-300 truncate text-[11px]">{{ comp.missionTitle || comp.title || comp.name }}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-semibold block">{{ (comp.sopChecklist || comp.requirements || comp.indicators)?.length || 0 }} Indikator / SOP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Pilihan Paket Template Feedback Onboarding (End-of-Journey) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                4. Pilihan Paket Template Feedback
              </h3>
           
            </div>
            <span v-if="selectedFeedbackPackage" class="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
              📋 Periode Feedback: Akhir Siklus ({{ selectedFeedbackPackage.durationValue || 1 }} {{ selectedFeedbackPackage.durationCode === 'MONTH' ? 'Bulan' : 'Hari' }})
            </span>
          </div>

          <div class="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Pilih Kurikulum Template Feedback Onboarding
              </label>
              <select
                v-model="form.feedbackPackageId"
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
              >
                <option value="">-- Pilih Paket Template Feedback (Opsional) --</option>
                <option v-for="fpkg in templateStore.feedbackTemplates" :key="fpkg.id" :value="fpkg.id">
                  {{ fpkg.name }} ({{ getFeedbackQuestionsCount(fpkg) }} Butir • {{ fpkg.code }})
                </option>
                <option value="NONE">-- Lewati / Tanpa Template Feedback --</option>
              </select>
            </div>

            <!-- Pratinjau Kuesioner Feedback -->
            <div v-if="selectedFeedbackPackage" class="pt-2 border-t border-blue-200/60 dark:border-blue-800/40">
              <div class="flex items-center justify-between mb-2">
                <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  📋 Pratinjau Kuesioner ({{ getFeedbackQuestionsCount(selectedFeedbackPackage) }} Butir Pertanyaan Evaluasi):
                </div>
                <span class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold font-mono">
                  tplFeedbackId: {{ selectedFeedbackPackage.id }}
                </span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div
                  v-for="(item, idx) in feedbackPreviewList"
                  :key="item.id || idx"
                  class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/60 text-xs space-y-0.5"
                >
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0"></span>
                    <span class="font-bold text-blue-700 dark:text-blue-300 truncate text-[11px]">{{ item.title }}</span>
                  </div>
                  <span class="text-[10px] text-slate-400 font-semibold block">
                    {{ item.inputType === 'TEXT' ? 'Esai Kualitatif' : 'Skala 0–10' }} • {{ item.topic || 'Umum' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Periode & Tanggal Pelaksanaan Siklus Batch -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                5. Periode & Tanggal Pelaksanaan Siklus Batch
              </h3>
              <p class="text-[11px] text-slate-400">
                Tentukan tanggal mulai pembukaan siklus. Jadwal fase Buddy, perjalanan Misi SOP, dan Feedback dihitung otomatis.
              </p>
            </div>
            <span
              v-if="timelineSimulation"
              class="text-xs font-bold text-[#831843] dark:text-[#f472b6] bg-[#831843]/10 px-3 py-1 rounded-full flex items-center gap-1.5"
            >
              <Clock class="w-3.5 h-3.5" />
              <span>Total Siklus: {{ timelineSimulation.totalDurationDays }} Hari</span>
            </span>
          </div>

          <div class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40 space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                    <span>Tanggal Mulai Siklus Batch *</span>
                  </span>
                  <span class="text-[10px] text-[#831843] dark:text-[#f472b6] font-bold">Input Tanggal Mulai</span>
                </label>
                <input
                  v-model="form.startDate"
                  type="date"
                  required
                  class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
                />
                <p class="text-[11px] text-slate-400 mt-1">Titik awal pembukaan siklus onboarding gerai.</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                    <span>Tanggal Selesai Siklus</span>
                  </span>
                  <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                    <template v-if="templateDurationDays > 0">⚡ Auto (+{{ templateDurationDays }} Hari / {{ form.weeks.length }} {{ selectedTemplateUnitLabel }})</template>
                    <template v-else>⚡ Menunggu Template</template>
                  </span>
                </label>
                <input
                  :value="form.endDate"
                  type="date"
                  readonly
                  class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-700 dark:text-slate-300 cursor-not-allowed"
                />
                <p class="text-[11px] text-slate-400 mt-1">
                  <template v-if="templateDurationDays > 0">
                    Otomatis {{ form.weeks.length }} {{ selectedTemplateUnitLabel.toLowerCase() }} ({{ templateDurationDays }} hari) dari tanggal mulai.
                  </template>
                  <template v-else>
                    Pilih paket template SOP untuk menghitung tanggal selesai secara otomatis.
                  </template>
                </p>
              </div>
            </div>

            <!-- 📊 Visual Timeline Simulation Widget -->
            <div v-if="timelineSimulation" class="pt-3 border-t border-amber-300/40 dark:border-amber-700/40 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles class="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulasi Rangkaian Fase & Timeline Batch:</span>
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {{ timelineSimulation.batchStartFormatted }} s/d {{ timelineSimulation.batchEndFormatted }}
                </span>
              </div>

              <!-- 3 Phase Cards Pipeline -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <!-- Fase 1: Buddy Phase -->
                <div
                  class="p-3 rounded-xl border transition-all text-xs space-y-2 relative"
                  :class="timelineSimulation.buddy ? 'bg-purple-500/10 border-purple-300 dark:border-purple-800/60 text-purple-950 dark:text-purple-100' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-400'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-1">
                      <span>🤝 1. Fase Buddy</span>
                    </span>
                    <span
                      class="text-[9px] font-bold px-1.5 py-0.2 rounded"
                      :class="timelineSimulation.buddy ? 'bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
                    >
                      {{ timelineSimulation.buddy ? `${timelineSimulation.buddy.totalDays} Hari Pra-Batch` : 'Dilewati' }}
                    </span>
                  </div>

                  <template v-if="timelineSimulation.buddy">
                    <div class="space-y-1 text-[11px]">
                      <div class="font-semibold text-slate-800 dark:text-slate-200">
                        {{ timelineSimulation.buddy.startDateFormatted }} – {{ timelineSimulation.buddy.endDateFormatted }}
                      </div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400">
                        Evaluator: <strong class="text-purple-600 dark:text-purple-400">{{ timelineSimulation.buddy.evaluator }}</strong>
                      </div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400">
                        Konten: {{ timelineSimulation.buddy.missionCount }} Kompetensi / Misi
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <p class="text-[11px] text-slate-400 italic">Tanpa program pendampingan Buddy pra-batch.</p>
                  </template>
                </div>

                <!-- Fase 2: Journey SOP Phase -->
                <div class="p-3 rounded-xl bg-[#831843]/10 border border-[#831843]/25 text-slate-900 dark:text-white text-xs space-y-2 relative">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-[11px] text-[#831843] dark:text-[#f472b6] flex items-center gap-1">
                      <span>🎯 2. Misi Reguler ({{ timelineSimulation.journey.unitLabel }})</span>
                    </span>
                    <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#831843]/20 text-[#831843] dark:text-[#f472b6]">
                      {{ timelineSimulation.journey.totalPeriods }} {{ timelineSimulation.journey.unitLabel }} ({{ timelineSimulation.journey.totalDays }} Hari)
                    </span>
                  </div>

                  <div class="space-y-1 text-[11px]">
                    <div class="font-semibold text-slate-800 dark:text-slate-200">
                      {{ timelineSimulation.journey.startDateFormatted }} – {{ timelineSimulation.journey.endDateFormatted }}
                    </div>
                    <div class="text-[10px] text-slate-500 dark:text-slate-400">
                      Evaluator: <strong class="text-[#831843] dark:text-[#f472b6]">{{ timelineSimulation.journey.evaluator }}</strong>
                    </div>
                    <!-- Weekly / Daily breakdown pills -->
                    <div class="pt-1.5 flex flex-wrap gap-1">
                      <span
                        v-for="w in timelineSimulation.journey.weeks"
                        :key="w.weekNumber"
                        class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                        :title="`${w.title}: ${w.startDateFormatted} s/d ${w.endDateFormatted}`"
                      >
                        {{ w.unitPrefix }}: {{ w.startDateFormatted.slice(0, 6) }}–{{ w.endDateFormatted.slice(0, 6) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Fase 3: Feedback Phase -->
                <div
                  class="p-3 rounded-xl border transition-all text-xs space-y-2 relative"
                  :class="timelineSimulation.feedback ? 'bg-blue-500/10 border-blue-300 dark:border-blue-800/60 text-blue-950 dark:text-blue-100' : 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-400'"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1">
                      <span>📋 3. Feedback Kru</span>
                    </span>
                    <span
                      class="text-[9px] font-bold px-1.5 py-0.2 rounded"
                      :class="timelineSimulation.feedback ? 'bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'"
                    >
                      {{ timelineSimulation.feedback ? 'Akhir Siklus' : 'Dilewati' }}
                    </span>
                  </div>

                  <template v-if="timelineSimulation.feedback">
                    <div class="space-y-1 text-[11px]">
                      <div class="font-semibold text-slate-800 dark:text-slate-200">
                        {{ timelineSimulation.feedback.startDateFormatted }} – {{ timelineSimulation.feedback.endDateFormatted }}
                      </div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400">
                        Responden: <strong class="text-blue-600 dark:text-blue-400">{{ timelineSimulation.feedback.evaluator }}</strong>
                      </div>
                      <div class="text-[10px] text-slate-500 dark:text-slate-400">
                        Survei: {{ timelineSimulation.feedback.questionCount }} Butir Evaluasi
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <p class="text-[11px] text-slate-400 italic">Tanpa kuesioner evaluasi feedback onboarding.</p>
                  </template>
                </div>
              </div>

              <!-- Quick note -->
              <p class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info class="w-3 h-3 text-[#831843] dark:text-[#f472b6] flex-shrink-0" />
                <span>Seluruh misi dan jadwal di atas otomatis di-generate secara atomik ke database saat batch diterbitkan.</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 6. Pilih Anggota Crew (Disaring: Belum Pernah Ikut Batch & per-Gerai) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  6. Anggota Kru yang Ditugaskan ({{ form.assignment.crewIds.length }} Terpilih)
                </h3>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  ✨ {{ unassignedCrews.length }} Kru Tersedia
                </span>
              </div>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Filter per-Store Button Dropdown -->
              <select
                v-model="crewStoreFilter"
                class="text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Semua Gerai ({{ unassignedCrews.length }})</option>
                <option v-for="st in storeStore.allStores" :key="st.id" :value="st.id">
                  {{ st.name }}
                </option>
              </select>

              <button
                type="button"
                @click="selectAllCrew"
                class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold hover:underline cursor-pointer"
              >
                Pilih Semua
              </button>
              <span class="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                @click="form.assignment.crewIds = []"
                class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <!-- Tags Container -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
            <div v-if="displayedCrews.length === 0" class="p-6 text-center text-xs text-slate-400">
              Tidak ada kru yang belum memiliki batch untuk filter gerai yang dipilih.
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="crew in displayedCrews"
                :key="crew.id"
                type="button"
                @click="toggleCrewSelection(crew.id)"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border"
                :class="[
                  form.assignment.crewIds.includes(crew.id)
                    ? 'bg-[#831843] text-white border-[#831843] shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ]"
              >
                <img
                  :src="crew.avatar"
                  :alt="crew.name"
                  class="w-5 h-5 rounded-full object-cover"
                />
                <span class="font-bold">{{ crew.name }}</span>
                <span class="text-[10px] opacity-85 px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                  🏪 {{ crew.storeLocation || 'Standby' }}
                </span>
                <span v-if="!crew.batchId" class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  Baru
                </span>
                <span v-if="form.assignment.crewIds.includes(crew.id)" class="text-[10px] ml-0.5">✓</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/admin/batches"
            class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
          >
            Batal
          </NuxtLink>
          <button
            type="button"
            @click="handleSubmit(true)"
            :disabled="isSubmitting"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <FileText class="w-4 h-4" />
            <span>{{ isSubmitting && submitMode === 'draft' ? 'Menyimpan Draft...' : 'Simpan sebagai Draft' }}</span>
          </button>
          <button
            type="button"
            @click="handleSubmit(false)"
            :disabled="isSubmitting"
            class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Check class="w-4 h-4" />
            <span>{{ isSubmitting && submitMode === 'publish' ? 'Membuat Batch...' : 'Buat & Generate Misi' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useTemplateStore } from '~/stores/template.js'
import { useBuddyStore } from '~/stores/buddy.js'
import { useToast } from '~/composables/useToast.js'
import {
  Layers,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  FileText
} from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const userStore = useUserStore()
const storeStore = useStoreStore()
const templateStore = useTemplateStore()
const buddyStore = useBuddyStore()
const toast = useToast()

const crewStoreFilter = ref('ALL')

const nextBatchNumber = computed(() => {
  const batches = batchStore.allBatches || []
  const codes = batches
    .map(b => b.code)
    .filter(c => Boolean(c) && /^BTH-\d+$/i.test(c))
    .map(c => parseInt(c.replace(/BTH-/i, ''), 10))
  const maxNum = codes.length > 0 ? Math.max(...codes) : 0
  return Math.max(maxNum + 1, batches.length + 1)
})

const computedBatchCode = computed(() => {
  return `BTH-${String(nextBatchNumber.value).padStart(2, '0')}`
})

// Auto-calculate default start date (Today)
const today = new Date()
const defaultStartDate = today.toISOString().split('T')[0]

const allCrews = computed(() => {
  return (userStore.allUsers || []).filter(u => u.role === 'CREW')
})

const unassignedCrews = computed(() => {
  return (allCrews.value || []).filter(c => !c.batchId)
})

const displayedCrews = computed(() => {
  let list = unassignedCrews.value || []
  if (crewStoreFilter.value !== 'ALL') {
    list = list.filter(c => c.storeId === crewStoreFilter.value)
  }
  return list
})

const form = ref({
  name: '',
  code: '',
  storeLocation: 'Multi-Store (Seluruh Cabang Re.juve)',
  startDate: defaultStartDate,
  endDate: '',
  description: '',
  buddyPackageId: '',
  templatePackageId: '',
  feedbackPackageId: '',
  weeks: [],
  assignment: {
    crewIds: []
  },
  approvalConfig: {
    minEvidenceCount: 1,
    maxRevisions: 3,
    requireEvidence: true
  }
})

const generateNextCode = () => {
  form.value.code = computedBatchCode.value
}

const selectedBuddyPackage = computed(() => {
  if (!form.value.buddyPackageId || form.value.buddyPackageId === 'NONE') return null
  return (
    templateStore.buddyTemplates.find(b => b.id === form.value.buddyPackageId) ||
    buddyStore.packageById(form.value.buddyPackageId) ||
    null
  )
})

const getFeedbackQuestionsCount = (fpkg) => {
  if (!fpkg) return 0
  if (fpkg.details && fpkg.details.length > 0) return fpkg.details.length
  if (fpkg.templates && fpkg.templates.length > 0) return fpkg.templates.length
  return 0
}

const selectedFeedbackPackage = computed(() => {
  if (!form.value.feedbackPackageId || form.value.feedbackPackageId === 'NONE') return null
  return templateStore.feedbackTemplates.find(f => f.id === form.value.feedbackPackageId) || null
})

const feedbackPreviewList = computed(() => {
  if (!selectedFeedbackPackage.value) return []
  const details = selectedFeedbackPackage.value.details || selectedFeedbackPackage.value.templates || []
  return details.slice(0, 8).map((d, idx) => ({
    id: d.id || idx,
    title: d.missionTitle || d.title || `Pertanyaan #${idx + 1}`,
    inputType: d.inputType || 'SCALE',
    topic: d.scaleConfig?.categoryName || d.scaleConfig?.topic || d.description || 'Umum'
  }))
})

// Pre-batch Buddy date calculation: (startDate - totalDays) to (startDate - 1 day)
const buddyDateRangeText = computed(() => {
  if (!form.value.startDate || !selectedBuddyPackage.value) return '-'
  const totalDays = selectedBuddyPackage.value.totalDays || 3
  const parts = form.value.startDate.split('-').map(Number)
  const dStart = new Date(parts[0], parts[1] - 1, parts[2])
  
  const bStart = new Date(dStart.getTime() - (totalDays * 24 * 60 * 60 * 1000))
  const bEnd = new Date(dStart.getTime() - (1 * 24 * 60 * 60 * 1000))

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const startStr = `${String(bStart.getDate()).padStart(2, '0')} ${months[bStart.getMonth()]}`
  const endStr = `${String(bEnd.getDate()).padStart(2, '0')} ${months[bEnd.getMonth()]}`
  return `${startStr} s/d ${endStr} (${totalDays} Hari Pra-Batch)`
})

const getPackageDurationLabel = (pkg) => {
  if (!pkg) return ''
  const durCode = (pkg.durationCode || 'WEEK').toUpperCase()
  const unit = durCode === 'DAY' ? 'Hari' : (durCode === 'MONTH' ? 'Bulan' : 'Minggu')
  const count = (pkg.weeks || []).length || pkg.totalWeeks || (pkg.details ? pkg.details.reduce((max, d) => Math.max(max, Number(d.durationNumber || 1)), 1) : 1)
  return `${count} ${unit}`
}

const getUnitDays = (durationCode, durationValue = 1) => {
  const val = Number(durationValue) || 1
  switch (durationCode?.toUpperCase()) {
    case 'DAY': return val
    case 'WEEK': return val * 7
    case 'MONTH': return val * 30
    case 'YEAR': return val * 365
    default: return val * 7
  }
}

const selectedTemplatePackage = computed(() => {
  if (!form.value.templatePackageId || form.value.templatePackageId === 'NONE') return null
  return templateStore.packageById(form.value.templatePackageId) || null
})

const selectedTemplateUnitLabel = computed(() => {
  if (!selectedTemplatePackage.value) return 'Minggu'
  const code = (selectedTemplatePackage.value.durationCode || 'WEEK').toUpperCase()
  if (code === 'DAY') return 'Hari'
  if (code === 'MONTH') return 'Bulan'
  if (code === 'YEAR') return 'Tahun'
  return 'Minggu'
})

const templateTotalWeeks = computed(() => {
  if (!selectedTemplatePackage.value) return form.value.weeks.length || 0
  const pkgWeeks = templateStore.packageWeeks(selectedTemplatePackage.value.id)
  return pkgWeeks.length || selectedTemplatePackage.value.totalWeeks || 0
})

const templateDurationDays = computed(() => {
  if (!selectedTemplatePackage.value) return (form.value.weeks.length || 0) * 7
  const unitDays = getUnitDays(selectedTemplatePackage.value.durationCode, selectedTemplatePackage.value.durationValue || 1)
  const totalPeriods = form.value.weeks.length || selectedTemplatePackage.value.totalWeeks || 1
  return totalPeriods * unitDays
})

// Calculate End Date dynamically from startDate + durationDays - 1
const calculateEndDate = (startDateStr, durationDays) => {
  if (!startDateStr || !durationDays || durationDays <= 0) return ''
  const parts = startDateStr.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() + (durationDays - 1))
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Handler when template package selection changes: dynamically sync weeks, titles, and end date
const onTemplatePackageChange = () => {
  if (selectedTemplatePackage.value) {
    const pkgWeeks = templateStore.packageWeeks(selectedTemplatePackage.value.id)
    form.value.weeks = pkgWeeks.map(w => ({
      weekNumber: w.weekNumber,
      title: w.title,
      status: w.weekNumber === 1 ? 'ACTIVE' : 'LOCKED',
      isLocked: w.weekNumber > 1,
      missionCount: (selectedTemplatePackage.value.templates || selectedTemplatePackage.value.details)?.filter(t => (t.week || t.durationNumber) === w.weekNumber).length || 4,
      completionRate: 0
    }))
    form.value.endDate = calculateEndDate(form.value.startDate, templateDurationDays.value)
  } else {
    form.value.weeks = []
    form.value.endDate = ''
  }
}

// Watch startDate to recompute endDate
watch(
  () => form.value.startDate,
  (newStart) => {
    form.value.endDate = calculateEndDate(newStart, templateDurationDays.value)
  }
)

const formatShortDate = (date) => {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
}

const addDaysToDate = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const timelineSimulation = computed(() => {
  if (!form.value.startDate) return null
  const parts = form.value.startDate.split('-').map(Number)
  if (parts.length < 3) return null
  
  // Tanggal Mulai Siklus Batch adalah titik awal perjalanan Misi SOP (Step 1)
  const jStart = new Date(parts[0], parts[1] - 1, parts[2])

  // 1. Fase Buddy (Pra-Batch): Dihitung mundur sebelum tanggal mulai batch (H-N s/d H-1)
  let buddy = null
  if (selectedBuddyPackage.value) {
    const durationDays = Number(selectedBuddyPackage.value.totalDays || selectedBuddyPackage.value.durationValue || 3)
    const bStart = addDaysToDate(jStart, -durationDays)
    const bEnd = addDaysToDate(jStart, -1)
    const missionCount = (selectedBuddyPackage.value.templates || selectedBuddyPackage.value.details || selectedBuddyPackage.value.competencies || []).length || 3

    buddy = {
      name: selectedBuddyPackage.value.name,
      totalDays: durationDays,
      startDate: bStart,
      endDate: bEnd,
      startDateFormatted: formatShortDate(bStart),
      endDateFormatted: formatShortDate(bEnd),
      missionCount,
      evaluator: 'Store Leader / Buddy Mentor'
    }
  }

  // 2. Fase Journey Misi SOP: Dimulai tepat pada form.startDate (Step 1 s/d Step N)
  const totalPeriods = form.value.weeks.length || selectedTemplatePackage.value?.totalWeeks || 3
  const unitDays = getUnitDays(selectedTemplatePackage.value?.durationCode || 'WEEK', selectedTemplatePackage.value?.durationValue || 1)
  const totalJourneyDays = totalPeriods * unitDays
  const jEnd = addDaysToDate(jStart, totalJourneyDays - 1)

  const weeksList = []
  const unitCode = (selectedTemplatePackage.value?.durationCode || 'WEEK').toUpperCase()
  const unitPrefix = unitCode === 'DAY' ? 'H' : (unitCode === 'MONTH' ? 'B' : 'W')
  const unitName = unitCode === 'DAY' ? 'Hari' : (unitCode === 'MONTH' ? 'Bulan' : 'Minggu')

  for (let i = 0; i < totalPeriods; i++) {
    const wStart = addDaysToDate(jStart, i * unitDays)
    const wEnd = addDaysToDate(wStart, unitDays - 1)
    const existingWeek = form.value.weeks.find(w => w.weekNumber === i + 1)
    weeksList.push({
      weekNumber: i + 1,
      unitPrefix: `${unitPrefix}${i + 1}`,
      title: existingWeek?.title || `${unitName} ${i + 1}`,
      startDateFormatted: formatShortDate(wStart),
      endDateFormatted: formatShortDate(wEnd)
    })
  }

  const journey = {
    name: selectedTemplatePackage.value?.name || `Paket Standar (${totalPeriods} ${unitName})`,
    totalWeeks: totalPeriods,
    totalPeriods,
    unitLabel: unitName,
    totalDays: totalJourneyDays,
    startDate: jStart,
    endDate: jEnd,
    startDateFormatted: formatShortDate(jStart),
    endDateFormatted: formatShortDate(jEnd),
    weeks: weeksList,
    evaluator: 'Store Leader & Review DM'
  }

  // 3. Fase Feedback Onboarding: Dijalankan di akhir perjalanan siklus (pasca-misi)
  let feedback = null
  if (selectedFeedbackPackage.value) {
    const fStart = new Date(jEnd)
    const fEnd = addDaysToDate(jEnd, 1)
    feedback = {
      name: selectedFeedbackPackage.value.name,
      startDateFormatted: formatShortDate(fStart),
      endDateFormatted: formatShortDate(fEnd),
      questionCount: getFeedbackQuestionsCount(selectedFeedbackPackage.value) || 17,
      evaluator: 'Kru Gerai (Self-Survey)'
    }
  }

  const batchStart = buddy ? buddy.startDate : journey.startDate
  const batchEnd = journey.endDate
  const totalDurationDays = Math.round((batchEnd - batchStart) / (1000 * 60 * 60 * 24)) + 1

  return {
    buddy,
    journey,
    feedback,
    batchStartFormatted: formatShortDate(batchStart),
    batchEndFormatted: formatShortDate(batchEnd),
    totalDurationDays
  }
})

const isLoadingData = ref(false)

onMounted(async () => {
  // Initialize weeks and end date (kosong jika belum ada template terpilih)
  onTemplatePackageChange()

  isLoadingData.value = true
  try {
    // Selalu hit live API backend untuk User (Kru yang belum memiliki batch), Store, Batch, dan Master Templates saat halaman dibuka
    await Promise.all([
      userStore.fetchUsersFromApi({ role: 'CREW', hasBatch: false, limit: 100 }),
      storeStore.fetchStoresFromApi({ page: 1, limit: 100 }),
      batchStore.fetchBatchesFromApi({ limit: 100, page: 1 }),
      templateStore.fetchAllTemplateTypes()
    ])
  } catch (err) {
    console.error('Error fetching live users/stores for batch create:', err)
  } finally {
    isLoadingData.value = false
  }

  // Preselect fresh unassigned crews
  if (unassignedCrews.value.length > 0 && form.value.assignment.crewIds.length === 0) {
    form.value.assignment.crewIds = unassignedCrews.value.slice(0, 6).map(c => c.id)
  }
})

const toggleCrewSelection = (crewId) => {
  const idx = form.value.assignment.crewIds.indexOf(crewId)
  if (idx > -1) {
    form.value.assignment.crewIds.splice(idx, 1)
  } else {
    form.value.assignment.crewIds.push(crewId)
  }
}

const selectAllCrew = () => {
  form.value.assignment.crewIds = displayedCrews.value.map(c => c.id)
}

import { batchApi, templateApi } from '~/services/api.js'

const isSubmitting = ref(false)
const submitMode = ref('')

const handleSubmit = async (isDraft = false) => {
  if (!form.value.name || !form.value.name.trim()) {
    toast.warning('Nama Batch Wajib Diisi', 'Silakan masukkan nama siklus batch.')
    return
  }

  if (!isDraft && !form.value.templatePackageId) {
    toast.warning('Template Belum Dipilih', 'Silakan pilih paket master template SOP terlebih dahulu sebelum membuat & generate batch.')
    return
  }

  isSubmitting.value = true
  submitMode.value = isDraft ? 'draft' : 'publish'
  try {
    // Dapatkan template journey dari backend
    let journeyTplId = form.value.templatePackageId
    if (journeyTplId && (journeyTplId === 'NONE' || String(journeyTplId).startsWith('pkg-'))) {
      const tmpls = await templateApi.getAll({ limit: 10, type: 'JOURNEY' })
      if (tmpls && tmpls.data && tmpls.data.length > 0) {
        journeyTplId = tmpls.data[0].tplMissionId
      }
    }

    // Dapatkan template feedback (type FEEDBACK)
    let feedbackTplId = null
    if (form.value.feedbackPackageId && form.value.feedbackPackageId !== 'NONE') {
      const foundFeedback = templateStore.feedbackTemplates.find(f => f.id === form.value.feedbackPackageId)
      feedbackTplId = foundFeedback ? foundFeedback.id : form.value.feedbackPackageId
    }

    // Dapatkan template buddy (type BUDDY)
    let buddyTplId = null
    if (form.value.buddyPackageId && form.value.buddyPackageId !== 'NONE') {
      const foundBuddy = templateStore.buddyTemplates.find(b => b.id === form.value.buddyPackageId)
      if (foundBuddy) {
        buddyTplId = foundBuddy.id
      } else if (!String(form.value.buddyPackageId).startsWith('pkg-')) {
        buddyTplId = form.value.buddyPackageId
      }
    }

    const payload = {
      name: form.value.name.trim(),
      startDate: form.value.startDate || new Date().toISOString().split('T')[0],
      endDate: form.value.endDate || undefined,
      status: isDraft ? 'DRAFT' : 'OPEN',
      isDraft: Boolean(isDraft),
      currentWeek: 1,
      tplJourneyId: journeyTplId || undefined,
      tplBuddyId: buddyTplId || undefined,
      tplFeedbackId: feedbackTplId || undefined,
      crewIds: (form.value.assignment?.crewIds || []).filter(id => String(id).length > 20)
    }

    if (form.value.code && form.value.code.trim()) {
      payload.code = form.value.code.trim()
    }

    const res = await batchStore.createBatchToApi(payload)
    if (res && (res.success || res.data)) {
      if (isDraft) {
        toast.success(
          'Draft Batch Disimpan',
          `Batch "${form.value.name}" berhasil disimpan sebagai draft. Anda dapat mengeditnya kapan saja sebelum di-generate.`
        )
      } else {
        toast.success(
          'Batch Berhasil Dibuat!',
          `Batch "${form.value.name}" telah disimpan ke backend dan misi aktif di-generate.`
        )
      }
      router.push('/admin/batches')
    } else {
      throw new Error(res?.message || 'Gagal membuat batch di backend server.')
    }
  } catch (err) {
    console.error('Create batch error:', err)
    toast.error('Gagal Membuat Batch', err.message || 'Terjadi kesalahan saat memproses data.')
  } finally {
    isSubmitting.value = false
    submitMode.value = ''
  }
}
</script>
