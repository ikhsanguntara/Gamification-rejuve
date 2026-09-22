<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">
        {{ isDraftBatch ? 'Edit Draft Batch:' : 'Detail Batch:' }} {{ batch?.name || 'Memuat...' }}
      </span>
    </div>

    <!-- Error State -->
    <div v-if="!isLoadingDetail && !batch" class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch tidak ditemukan.</p>
      <NuxtLink to="/admin/batches" class="text-xs text-[#831843] font-semibold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- ==================== MODE 1: DRAFT EDITABLE VIEW ==================== -->
    <div v-else-if="isDraftBatch" class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40 shadow-sm space-y-6">
      
      <!-- Card Header Draft -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
            <Edit3 class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                Edit Draft Batch
              </h2>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60">
                Draft (Misi Belum Digenerate)
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ✏️ Form Editable
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Semua konfigurasi nama, tanggal, paket template SOP/Buddy/Feedback, dan penugasan kru dapat diedit bebas sebelum batch di-generate.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            @click="handleSaveDraft"
            :disabled="isSaving"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save class="w-4 h-4 text-slate-500" />
            <span>{{ isSaving && saveMode === 'draft' ? 'Menyimpan...' : 'Simpan Draft' }}</span>
          </button>

          <button
            type="button"
            @click="handlePublishAndGenerate"
            :disabled="isSaving"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-bold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Zap class="w-4 h-4 text-amber-300" />
            <span>{{ isSaving && saveMode === 'publish' ? 'Memproses...' : 'Publish & Generate Misi' }}</span>
          </button>

          <NuxtLink
            to="/admin/batches"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>Batal</span>
          </NuxtLink>
        </div>
      </div>

      <form @submit.prevent="handleSaveDraft" class="space-y-6">
        <!-- 1. Informasi Dasar Siklus Batch -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Informasi Dasar Siklus Batch
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Nama Batch -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Siklus Batch *
              </label>
              <input
                v-model="editForm.name"
                type="text"
                required
                placeholder="Contoh: Batch 01 — Program Pelatihan Multi-Gerai"
                class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <!-- Kode Batch -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Batch
              </label>
              <input
                v-model="editForm.code"
                type="text"
                placeholder="Contoh: BTH-01"
                class="w-full text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <!-- Deskripsi / Cakupan Batch -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi / Catatan Batch
            </label>
            <input
              v-model="editForm.description"
              type="text"
              placeholder="Contoh: Siklus gamifikasi dan pelatihan standar operasional multi-gerai"
              class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <!-- Tanggal Mulai & Selesai Siklus -->
          <div class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                  <span>Tanggal Mulai Siklus (SOP Step 1) *</span>
                </label>
                <input
                  v-model="editForm.startDate"
                  type="date"
                  required
                  class="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] dark:[color-scheme:dark]"
                />
                <p class="text-[11px] text-slate-400 mt-1">Titik awal dibukanya misi kurikulum SOP mingguan.</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <Clock class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                  <span>Tanggal Selesai Siklus (Otomatis Dihitung)</span>
                </label>
                <input
                  :value="editForm.endDate"
                  type="date"
                  readonly
                  disabled
                  class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-700 dark:text-slate-300 cursor-not-allowed dark:[color-scheme:dark]"
                />
                <p class="text-[11px] text-slate-400 mt-1">Dihitung otomatis berdasarkan total durasi template Journey SOP.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Pilihan Paket Template Misi Buddy (Pra-Batch) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Pilihan Paket Template Buddy (Pra-Batch)
            </h3>
            <span v-if="editBuddyDateRangeText !== '-'" class="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
              🤝 Periode Buddy: {{ editBuddyDateRangeText }}
            </span>
          </div>

          <div class="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Pilih Kurikulum Template Misi Buddy
              </label>
              <select
                v-model="editForm.buddyPackageId"
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 cursor-pointer"
              >
                <option value="">-- Pilih Paket Template Buddy (Opsional) --</option>
                <option v-for="bpkg in (templateStore.buddyTemplates.length > 0 ? templateStore.buddyTemplates : buddyStore.allPackages)" :key="bpkg.id" :value="bpkg.id">
                  {{ bpkg.name }} ({{ (bpkg.templates || bpkg.details || bpkg.competencies)?.length || 0 }} Misi • {{ bpkg.code }})
                </option>
                <option value="NONE">-- Lewati / Tanpa Program Buddy --</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 3. Pilihan Paket Template Journey -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Pilihan Paket Template Journey *
            </h3>
            <NuxtLink to="/admin/templates" class="text-[11px] text-[#831843] dark:text-[#f472b6] font-semibold hover:underline">
              Kelola Master Template →
            </NuxtLink>
          </div>

          <div class="p-4 rounded-2xl bg-[#831843]/5 border border-[#831843]/15 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Pilih Paket Master Template SOP
              </label>
              <select
                v-model="editForm.templatePackageId"
                @change="onEditTemplatePackageChange"
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
              >
                <option value="">-- Pilih Paket Master Template SOP --</option>
                <option v-for="pkg in templateStore.allPackages" :key="pkg.id" :value="pkg.id">
                  {{ pkg.name }} ({{ getPackageDurationLabel(pkg) }} • {{ (pkg.templates || pkg.details || []).length }} Misi • {{ pkg.targetType || 'Semua Gerai' }})
                </option>
                <option value="NONE">-- Tanpa Template (Misi Kosong) --</option>
              </select>
            </div>

            <!-- Pratinjau Struktur Jadwal Mingguan -->
            <div v-if="editForm.weeks.length > 0" class="pt-2 border-t border-[#831843]/15 space-y-2">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-700 dark:text-slate-300">
                  📌 Struktur {{ editForm.weeks.length }} Periode SOP:
                </span>
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✨ {{ editForm.weeks.length }} Periode Dikonfigurasi
                </span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div
                  v-for="w in editForm.weeks"
                  :key="w.weekNumber"
                  class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1"
                >
                  <label class="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    Periode {{ w.weekNumber }}
                  </label>
                  <input
                    :value="w.title"
                    type="text"
                    readonly
                    disabled
                    class="w-full text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Pilihan Paket Template Feedback -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Pilihan Paket Template Feedback Onboarding
            </h3>
          </div>

          <div class="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Pilih Kurikulum Template Feedback Onboarding
              </label>
              <select
                v-model="editForm.feedbackPackageId"
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                <option value="">-- Pilih Paket Template Feedback (Opsional) --</option>
                <option v-for="fpkg in templateStore.feedbackTemplates" :key="fpkg.id" :value="fpkg.id">
                  {{ fpkg.name }} ({{ getFeedbackQuestionsCount(fpkg) }} Butir • {{ fpkg.code }})
                </option>
                <option value="NONE">-- Lewati / Tanpa Template Feedback --</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 5. Penugasan Anggota Kru -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                5. Anggota Kru yang Ditugaskan ({{ editForm.assignment.crewIds.length }} Terpilih)
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                ✨ {{ availableCrewsForEdit.length }} Kru Tersedia
              </span>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap">
              <select
                v-model="crewStoreFilter"
                class="text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Semua Gerai ({{ availableCrewsForEdit.length }})</option>
                <option v-for="st in storeStore.allStores" :key="st.id" :value="st.id">
                  {{ st.name }}
                </option>
              </select>

              <button
                type="button"
                @click="selectAllEditCrew"
                class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold hover:underline cursor-pointer"
              >
                Pilih Semua
              </button>
              <span class="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                @click="editForm.assignment.crewIds = []"
                class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
            <div v-if="displayedEditCrews.length === 0" class="p-6 text-center text-xs text-slate-400">
              Tidak ada anggota kru yang cocok dengan filter yang dipilih.
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="crew in displayedEditCrews"
                :key="crew.id"
                type="button"
                @click="toggleEditCrewSelection(crew.id)"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border"
                :class="[
                  editForm.assignment.crewIds.includes(crew.id)
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
                <span v-if="editForm.assignment.crewIds.includes(crew.id)" class="text-[10px] ml-0.5 font-bold">✓</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions Footer for Draft -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/admin/batches"
            class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center"
          >
            Batal
          </NuxtLink>
          <button
            type="button"
            @click="handleSaveDraft"
            :disabled="isSaving"
            class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Save class="w-4 h-4" />
            <span>{{ isSaving && saveMode === 'draft' ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Draft' }}</span>
          </button>
          <button
            type="button"
            @click="handlePublishAndGenerate"
            :disabled="isSaving"
            class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Zap class="w-4 h-4 text-amber-300" />
            <span>{{ isSaving && saveMode === 'publish' ? 'Memproses Generate...' : 'Publish & Generate Misi' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- ==================== MODE 2: READ-ONLY VIEW (GENERATED BATCH) ==================== -->
    <div v-else class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
      
      <!-- Card Header Read-Only -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843] dark:text-[#f472b6]">
            <Layers class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                {{ batch?.name || 'Memuat Batch...' }}
              </h2>
              <span
                v-if="batch"
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="[
                  batch.status === 'COMPLETED'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                ]"
              >
                {{ batch.status }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                🔒 Read-Only (Misi Aktif)
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Batch telah di-generate dan misi kru sedang berjalan aktif di sistem.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <NuxtLink
            to="/admin/batches"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft class="w-3.5 h-3.5" />
            <span>Kembali ke Daftar</span>
          </NuxtLink>
        </div>
      </div>

      <!-- 1. Informasi Siklus Batch & Periode Pelaksanaan (Read-Only) -->
      <div class="space-y-4">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
          1. Informasi Siklus Batch & Periode Pelaksanaan
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <!-- Nama Batch -->
          <div class="sm:col-span-2">
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Siklus Batch
            </label>
            <input
              :value="batch?.name || '-'"
              type="text"
              readonly
              disabled
              class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-800 dark:text-slate-200 cursor-default select-text"
            />
          </div>

          <!-- Kode Batch -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Batch</label>
            <input
              :value="batch?.code || '-'"
              type="text"
              readonly
              disabled
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-700 dark:text-slate-300 cursor-default select-all"
            />
          </div>

          <!-- Minggu Berjalan -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Minggu Berjalan (Current Week)</label>
            <input
              :value="`Minggu ke-${batch?.currentWeek || 1}`"
              type="text"
              readonly
              disabled
              class="w-full text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-[#831843] dark:text-[#f472b6] cursor-default"
            />
          </div>
        </div>

        <!-- Cakupan / Catatan Batch -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Cakupan / Catatan Batch
          </label>
          <input
            :value="batch?.storeLocation || batch?.name || '-'"
            type="text"
            readonly
            disabled
            class="w-full text-xs font-medium rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-800 dark:text-slate-200 cursor-default select-text"
          />
        </div>

        <!-- Tanggal Mulai & Selesai Siklus -->
        <div class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                <span>Tanggal Mulai Siklus</span>
              </label>
              <input
                :value="batch?.startDate || '-'"
                type="text"
                readonly
                disabled
                class="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white cursor-default"
              />
              <p class="text-[11px] text-slate-400 mt-1">Awal pembukaan misi resmi siklus batch.</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                <span>Tanggal Selesai Siklus</span>
              </label>
              <input
                :value="batch?.endDate || '-'"
                type="text"
                readonly
                disabled
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-700 dark:text-slate-300 cursor-default"
              />
              <p class="text-[11px] text-slate-400 mt-1">
                Batas akhir pelaksanaan misi siklus batch.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Paket Kurikulum Template Misi Buddy (Pra-Batch) -->
      <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            2. Kurikulum Template Misi Buddy (Pra-Batch)
          </h3>
          <span v-if="linkedBuddyTemplate" class="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
            🤝 Durasi: {{ linkedBuddyTemplate.durationValue || 3 }} Hari
          </span>
        </div>

        <div class="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">
                {{ linkedBuddyTemplate?.name || 'Tanpa Program Buddy / Belum Diatur' }}
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">
                Kode Template: <span class="font-mono font-bold">{{ linkedBuddyTemplate?.code || '-' }}</span> • 
                Tipe: <span class="font-semibold">{{ linkedBuddyTemplate?.type || 'BUDDY' }}</span>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
              🔒 Terhubung ke Batch
            </span>
          </div>

          <!-- Pratinjau Misi Buddy jika ada -->
          <div v-if="buddyMissionsPreview.length > 0" class="pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
            <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
              📋 Pratinjau Misi Buddy Terdaftar ({{ buddyMissionsPreview.length }} Misi):
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div
                v-for="comp in buddyMissionsPreview"
                :key="comp.missionId || comp.id"
                class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 text-xs space-y-0.5"
              >
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-600 flex-shrink-0"></span>
                  <span class="font-bold text-purple-700 dark:text-purple-300 truncate text-[11px]">{{ comp.missionTitle || comp.name }}</span>
                </div>
                <span class="text-[10px] text-slate-400 font-semibold block">{{ comp.category || 'TECHNICAL' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Paket Master Template SOP (Journey) -->
      <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            3. Paket Master Kurikulum Template SOP (Journey)
          </h3>
          <NuxtLink to="/admin/templates" class="text-[11px] text-[#831843] dark:text-[#f472b6] font-semibold hover:underline">
            Katalog Master Template →
          </NuxtLink>
        </div>

        <div class="p-4 rounded-2xl bg-[#831843]/5 border border-[#831843]/15 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="text-xs font-bold text-slate-800 dark:text-slate-200">
                {{ linkedJourneyTemplate?.name || 'Kurikulum SOP Reguler' }}
              </div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">
                Kode: <span class="font-mono font-bold">{{ linkedJourneyTemplate?.code || '-' }}</span> • 
                Total Misi SOP: <span class="font-semibold">{{ journeyMissionsPreview.length }} Butir Misi</span>
              </div>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#831843]/20 text-[#831843] dark:text-[#f472b6]">
              🔒 Terhubung ke Batch
            </span>
          </div>

          <!-- Tema & Judul Siklus Mingguan Dinamis -->
          <div v-if="batch?.weeks?.length > 0" class="pt-2 border-t border-[#831843]/15 space-y-2">
            <div class="flex items-center justify-between text-[11px]">
              <span class="font-bold text-slate-700 dark:text-slate-300">
                📌 Struktur {{ batch.weeks.length }} Mingguan Pelaksanaan:
              </span>
            </div>

            <div
              class="grid gap-2.5"
              :class="[
                batch.weeks.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
                batch.weeks.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              ]"
            >
              <div
                v-for="w in batch.weeks"
                :key="w.weekNumber"
                class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1"
              >
                <div class="flex items-center justify-between">
                  <label class="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                    Minggu {{ w.weekNumber }}
                  </label>
                  <span
                    class="text-[9px] font-bold px-1.5 py-0.2 rounded"
                    :class="w.weekNumber === (batch.currentWeek || 1) ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'"
                  >
                    {{ w.weekNumber === (batch.currentWeek || 1) ? 'Aktif' : 'Siklus' }}
                  </span>
                </div>
                <div class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                  {{ w.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. Gerai & Penanggung Jawab Terlibat -->
      <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            4. Desentralisasi Penanggung Jawab Evaluasi & Approval
          </h3>
          <span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
            ⚡ Mengikuti Store Kru Masing-Masing
          </span>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-3">
          <p class="text-xs text-slate-600 dark:text-slate-300">
            ℹ️ Penilaian misi dan persetujuan (approval) untuk kru di batch ini otomatis ditangani oleh <strong>Store Leader (SL)</strong> dan <strong>District Manager (DM)</strong> dari outlet masing-masing.
          </p>

          <div v-if="participatingStores.length > 0" class="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
            <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Gerai Terlibat ({{ participatingStores.length }} Outlet):
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div
                v-for="st in participatingStores"
                :key="st.id"
                class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-slate-900 dark:text-white truncate">{{ st.name }}</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                    {{ st.crewCount }} Kru
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
                  <span>👔 SL / Buddy: <strong>{{ st.storeLeader?.name || 'Belum Ditugaskan' }}</strong></span>
                  <span>🛡️ DM: <strong>{{ st.districtManager?.name || 'Belum Ditugaskan' }}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. Anggota Kru yang Ditugaskan (Read-Only) -->
      <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              5. Anggota Kru yang Terdaftar di Batch ({{ assignedCrews.length }} Kru)
            </h3>
            <p class="text-[11px] text-slate-400">Daftar seluruh kru yang tergabung dan menjalani misi di batch ini.</p>
          </div>
          
          <div v-if="participatingStores.length > 1" class="flex items-center gap-2">
            <select
              v-model="crewStoreFilter"
              class="text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="ALL">Semua Gerai</option>
              <option v-for="st in participatingStores" :key="st.id" :value="st.id">
                {{ st.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
          <div v-if="assignedCrews.length === 0" class="p-6 text-center text-xs text-slate-400">
            Belum ada anggota kru yang terdaftar pada batch ini.
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <div
              v-for="crew in displayedAssignedCrews"
              :key="crew.id"
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
            >
              <img
                :src="crew.avatar"
                :alt="crew.name"
                class="w-5 h-5 rounded-full object-cover"
              />
              <span class="font-bold">{{ crew.name }}</span>
              <span class="text-[10px] opacity-85 px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                🏪 {{ crew.storeLocation || crew.department || 'Standby' }}
              </span>
              <span v-if="crew.userBuddy" class="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                🤝 {{ crew.userBuddy.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 6. Misi-Misi Terdaftar pada Batch (Live API) -->
      <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                6. Misi yang Terdaftar pada Siklus Batch ({{ batchMissions.length }} Misi)
              </h3>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Live API
              </span>
            </div>
            <p class="text-[11px] text-slate-400">
              Daftar butir misi yang digenerate untuk kru di batch ini, mencakup misi Buddy pra-batch dan kurikulum SOP.
            </p>
          </div>
        </div>

        <div v-if="batchMissions.length === 0" class="p-6 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-400">
          Belum ada misi yang terdaftar atau di-generate pada batch ini.
        </div>

        <div v-else class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead class="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4">Minggu/Hari</th>
                <th class="py-3 px-4">Judul Misi</th>
                <th class="py-3 px-4">Tipe</th>
                <th class="py-3 px-4">Kategori</th>
                <th class="py-3 px-4">Periode</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              <tr v-for="m in batchMissions" :key="m.missionId || m.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                <td class="py-2.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                  {{ m.type === 'BUDDY' ? `Hari Pra-Batch` : `Minggu ${m.weekOrDayNumber || m.week || 1}` }}
                </td>
                <td class="py-2.5 px-4">
                  <div class="font-bold text-slate-900 dark:text-white">{{ m.missionTitle || m.title }}</div>
                  <div v-if="m.description" class="text-[11px] text-slate-400 line-clamp-1">{{ m.description }}</div>
                </td>
                <td class="py-2.5 px-4 whitespace-nowrap">
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="[
                      m.type === 'BUDDY' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                      m.type === 'FEEDBACK' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]'
                    ]"
                  >
                    {{ m.type || 'JOURNEY' }}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                  {{ m.category || 'TECHNICAL' }}
                </td>
                <td class="py-2.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                  {{ m.startDate ? m.startDate.split('T')[0] : '-' }} s/d {{ m.endDate ? m.endDate.split('T')[0] : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer Action: Back to List -->
      <div class="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-3">
        <div class="text-xs text-slate-400 flex items-center gap-1.5">
          <span>ℹ️ Data batch bersifat permanen dan terikat dengan histori penilaian operasional kru.</span>
        </div>

        <NuxtLink
          to="/admin/batches"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Kembali ke Daftar Batch</span>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useMissionStore } from '~/stores/mission.js'
import { useTemplateStore } from '~/stores/template.js'
import { useBuddyStore } from '~/stores/buddy.js'
import { useToast } from '~/composables/useToast.js'
import {
  Layers,
  ArrowLeft,
  Calendar,
  Zap,
  Edit3,
  Save,
  Clock
} from 'lucide-vue-next'
import { templateApi } from '~/services/api.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'

const route = useRoute()
const router = useRouter()
const batchStore = useBatchStore()
const userStore = useUserStore()
const storeStore = useStoreStore()
const missionStore = useMissionStore()
const templateStore = useTemplateStore()
const buddyStore = useBuddyStore()
const toast = useToast()

const crewStoreFilter = ref('ALL')
const isLoadingDetail = ref(true)
const isSaving = ref(false)
const saveMode = ref('')

const batch = computed(() => {
  return batchStore.batchById(route.params.id)
})

const isDraftBatch = computed(() => {
  if (!batch.value) return false
  return Boolean(batch.value.isDraft || batch.value.status === 'DRAFT')
})

// Editable Form State for Draft Batch
const editForm = ref({
  name: '',
  code: '',
  description: '',
  startDate: '',
  endDate: '',
  templatePackageId: '',
  buddyPackageId: '',
  feedbackPackageId: '',
  weeks: [],
  assignment: {
    crewIds: []
  }
})

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

const getPackageDurationLabel = (pkg) => {
  if (!pkg) return ''
  const durCode = (pkg.durationCode || 'WEEK').toUpperCase()
  const unit = durCode === 'DAY' ? 'Hari' : (durCode === 'MONTH' ? 'Bulan' : 'Minggu')
  const count = (pkg.weeks || []).length || pkg.totalWeeks || (pkg.details ? pkg.details.reduce((max, d) => Math.max(max, Number(d.durationNumber || 1)), 1) : 1)
  return `${count} ${unit}`
}

const getFeedbackQuestionsCount = (fpkg) => {
  if (!fpkg) return 0
  if (fpkg.details && fpkg.details.length > 0) return fpkg.details.length
  if (fpkg.templates && fpkg.templates.length > 0) return fpkg.templates.length
  return 0
}

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

const selectedEditTemplatePackage = computed(() => {
  if (!editForm.value.templatePackageId || editForm.value.templatePackageId === 'NONE') return null
  return templateStore.packageById(editForm.value.templatePackageId) || null
})

const onEditTemplatePackageChange = () => {
  if (selectedEditTemplatePackage.value) {
    const pkgWeeks = templateStore.packageWeeks(selectedEditTemplatePackage.value.id)
    editForm.value.weeks = pkgWeeks.map(w => ({
      weekNumber: w.weekNumber,
      title: w.title,
      status: w.weekNumber === 1 ? 'ACTIVE' : 'LOCKED',
      isLocked: w.weekNumber > 1,
      missionCount: (selectedEditTemplatePackage.value.templates || selectedEditTemplatePackage.value.details)?.filter(t => (t.week || t.durationNumber) === w.weekNumber).length || 4,
      completionRate: 0
    }))
    const unitDays = getUnitDays(selectedEditTemplatePackage.value.durationCode, selectedEditTemplatePackage.value.durationValue || 1)
    const totalDays = (editForm.value.weeks.length || 1) * unitDays
    editForm.value.endDate = calculateEndDate(editForm.value.startDate, totalDays)
  } else {
    editForm.value.weeks = []
    editForm.value.endDate = ''
  }
}

watch(
  () => editForm.value.startDate,
  (newStart) => {
    if (selectedEditTemplatePackage.value) {
      const unitDays = getUnitDays(selectedEditTemplatePackage.value.durationCode, selectedEditTemplatePackage.value.durationValue || 1)
      const totalDays = (editForm.value.weeks.length || 1) * unitDays
      editForm.value.endDate = calculateEndDate(newStart, totalDays)
    }
  }
)

const editBuddyDateRangeText = computed(() => {
  if (!editForm.value.startDate || !editForm.value.buddyPackageId || editForm.value.buddyPackageId === 'NONE') return '-'
  const buddyPkg = templateStore.buddyTemplates.find(b => b.id === editForm.value.buddyPackageId) || buddyStore.packageById(editForm.value.buddyPackageId)
  if (!buddyPkg) return '-'
  const totalDays = buddyPkg.totalDays || buddyPkg.durationValue || 3
  const parts = editForm.value.startDate.split('-').map(Number)
  const dStart = new Date(parts[0], parts[1] - 1, parts[2])
  
  const bStart = new Date(dStart.getTime() - (totalDays * 24 * 60 * 60 * 1000))
  const bEnd = new Date(dStart.getTime() - (1 * 24 * 60 * 60 * 1000))

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const startStr = `${String(bStart.getDate()).padStart(2, '0')} ${months[bStart.getMonth()]}`
  const endStr = `${String(bEnd.getDate()).padStart(2, '0')} ${months[bEnd.getMonth()]}`
  return `${startStr} s/d ${endStr} (${totalDays} Hari Pra-Batch)`
})

// Kru yang tersedia untuk diedit (Kru yang sudah ada di batch ini + Kru yang belum terassign batch manapun)
const availableCrewsForEdit = computed(() => {
  const currentBatchCrewIds = batch.value?.assignment?.crewIds || (batch.value?.users ? batch.value.users.map(u => u.userId || u.id) : [])
  const allCrews = (userStore.allUsers || []).filter(u => u.role === 'CREW')
  return allCrews.filter(c => !c.batchId || c.batchId === route.params.id || currentBatchCrewIds.includes(c.id))
})

const displayedEditCrews = computed(() => {
  let list = availableCrewsForEdit.value || []
  if (crewStoreFilter.value !== 'ALL') {
    list = list.filter(c => c.storeId === crewStoreFilter.value)
  }
  return list
})

const toggleEditCrewSelection = (crewId) => {
  const idx = editForm.value.assignment.crewIds.indexOf(crewId)
  if (idx > -1) {
    editForm.value.assignment.crewIds.splice(idx, 1)
  } else {
    editForm.value.assignment.crewIds.push(crewId)
  }
}

const selectAllEditCrew = () => {
  editForm.value.assignment.crewIds = displayedEditCrews.value.map(c => c.id)
}

// Inisialisasi edit form saat batch berhasil dimuat
const syncBatchToEditForm = (b) => {
  if (!b) return
  editForm.value.name = b.name || ''
  editForm.value.code = b.code || ''
  editForm.value.description = b.description || ''
  editForm.value.startDate = b.startDate || new Date().toISOString().split('T')[0]
  editForm.value.endDate = b.endDate || ''
  editForm.value.templatePackageId = b.templatePackageId || b.journeyTemplate?.id || ''
  editForm.value.buddyPackageId = b.buddyPackageId || b.buddyTemplate?.id || ''
  editForm.value.feedbackPackageId = b.feedbackPackageId || b.feedbackTemplate?.id || ''
  editForm.value.weeks = Array.isArray(b.weeks) ? [...b.weeks] : []
  
  const rawCrewIds = b.assignment?.crewIds || (Array.isArray(b.users) ? b.users.map(u => u.userId || u.id) : [])
  editForm.value.assignment.crewIds = [...rawCrewIds]
}

// Read-only helpers
const batchMissions = computed(() => {
  if (batch.value?.missions && batch.value.missions.length > 0) {
    return batch.value.missions
  }
  return missionStore.missionsByBatch(route.params.id) || []
})

const buddyMissionsPreview = computed(() => {
  return (batchMissions.value || []).filter(m => m.type === 'BUDDY')
})

const journeyMissionsPreview = computed(() => {
  return (batchMissions.value || []).filter(m => m.type === 'JOURNEY' || !m.type)
})

const linkedBuddyTemplate = computed(() => {
  if (batch.value?.buddyTemplate) return batch.value.buddyTemplate
  const det = batch.value?.details?.find(d => d.tplMission?.type === 'BUDDY')
  return det?.tplMission || null
})

const linkedJourneyTemplate = computed(() => {
  if (batch.value?.journeyTemplate) return batch.value.journeyTemplate
  const det = batch.value?.details?.find(d => d.tplMission?.type === 'JOURNEY')
  return det?.tplMission || null
})

const assignedCrews = computed(() => {
  if (batch.value?.users && batch.value.users.length > 0) {
    return batch.value.users.map(u => ({
      id: u.userId || u.id,
      name: u.name,
      avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name || 'Crew')}`,
      department: u.department?.departmentName || 'Store Operations',
      storeId: u.departmentId || u.department?.departmentId || null,
      storeLocation: u.department?.departmentName || 'Re.juve Store',
      userBuddy: u.userBuddy || null
    }))
  }

  const crewIds = batch.value?.assignment?.crewIds || []
  return (userStore.userDirectory || []).filter(u => crewIds.includes(u.id))
})

const displayedAssignedCrews = computed(() => {
  const list = assignedCrews.value || []
  if (crewStoreFilter.value === 'ALL') return list
  return list.filter(c => c.storeId === crewStoreFilter.value)
})

const participatingStores = computed(() => {
  const storeMap = {}
  assignedCrews.value.forEach(c => {
    const sId = c.storeId || 'standby'
    if (!storeMap[sId]) {
      const storeObj = storeStore.storeById(sId)
      storeMap[sId] = {
        id: sId,
        name: storeObj ? storeObj.name : (c.storeLocation || c.department || 'Gerai Standby'),
        storeLeader: storeObj ? storeObj.storeLeader : (c.userBuddy ? { name: c.userBuddy.name } : null),
        districtManager: storeObj ? storeObj.districtManager : null,
        crewCount: 0
      }
    }
    storeMap[sId].crewCount++
  })
  return Object.values(storeMap)
})

const loadBatchData = async () => {
  isLoadingDetail.value = true
  try {
    const [batchRes] = await Promise.allSettled([
      batchStore.fetchBatchByIdFromApi(route.params.id),
      userStore.fetchUsersFromApi({ limit: 100 }),
      storeStore.fetchStoresFromApi({ page: 1, limit: 100 }),
      templateStore.fetchAllTemplateTypes()
    ])
    if (batchRes.status === 'fulfilled' && batchRes.value) {
      syncBatchToEditForm(batchRes.value)
    } else if (batch.value) {
      syncBatchToEditForm(batch.value)
    }
  } catch (err) {
    console.warn('Error loading batch data:', err)
  } finally {
    isLoadingDetail.value = false
  }
}

onMounted(() => {
  loadBatchData()
})

watch(() => route.params.id, () => {
  loadBatchData()
})

const buildUpdatePayload = async (isDraft = true) => {
  let journeyTplId = editForm.value.templatePackageId
  if (journeyTplId && (journeyTplId === 'NONE' || String(journeyTplId).startsWith('pkg-'))) {
    const tmpls = await templateApi.getAll({ limit: 10, type: 'JOURNEY' })
    if (tmpls && tmpls.data && tmpls.data.length > 0) {
      journeyTplId = tmpls.data[0].tplMissionId
    }
  }

  let feedbackTplId = null
  if (editForm.value.feedbackPackageId && editForm.value.feedbackPackageId !== 'NONE') {
    const foundFeedback = templateStore.feedbackTemplates.find(f => f.id === editForm.value.feedbackPackageId)
    feedbackTplId = foundFeedback ? foundFeedback.id : editForm.value.feedbackPackageId
  }

  let buddyTplId = null
  if (editForm.value.buddyPackageId && editForm.value.buddyPackageId !== 'NONE') {
    const foundBuddy = templateStore.buddyTemplates.find(b => b.id === editForm.value.buddyPackageId)
    if (foundBuddy) {
      buddyTplId = foundBuddy.id
    } else if (!String(editForm.value.buddyPackageId).startsWith('pkg-')) {
      buddyTplId = editForm.value.buddyPackageId
    }
  }

  const payload = {
    name: editForm.value.name.trim(),
    startDate: editForm.value.startDate || new Date().toISOString().split('T')[0],
    endDate: editForm.value.endDate || undefined,
    status: isDraft ? 'DRAFT' : 'OPEN',
    isDraft: Boolean(isDraft),
    currentWeek: 1,
    tplJourneyId: journeyTplId || undefined,
    tplBuddyId: buddyTplId || undefined,
    tplFeedbackId: feedbackTplId || undefined,
    crewIds: (editForm.value.assignment?.crewIds || []).filter(id => String(id).length > 20)
  }

  if (editForm.value.code && editForm.value.code.trim()) {
    payload.code = editForm.value.code.trim()
  }

  return payload
}

const handleSaveDraft = async () => {
  if (!editForm.value.name || !editForm.value.name.trim()) {
    toast.warning('Nama Batch Wajib Diisi', 'Silakan masukkan nama siklus batch.')
    return
  }

  isSaving.value = true
  saveMode.value = 'draft'
  try {
    const payload = await buildUpdatePayload(true)
    const res = await batchStore.updateBatchToApi(route.params.id, payload)
    if (res && (res.success || res.data)) {
      toast.success('Draft Batch Diperbarui', 'Perubahan draft batch berhasil disimpan ke backend.')
      await loadBatchData()
    } else {
      throw new Error(res?.message || 'Gagal menyimpan perubahan draft.')
    }
  } catch (err) {
    console.error('Save draft error:', err)
    toast.error('Gagal Menyimpan Draft', err.message || 'Terjadi kesalahan saat menyimpan perubahan.')
  } finally {
    isSaving.value = false
    saveMode.value = ''
  }
}

const handlePublishAndGenerate = async () => {
  if (!editForm.value.name || !editForm.value.name.trim()) {
    toast.warning('Nama Batch Wajib Diisi', 'Silakan masukkan nama siklus batch.')
    return
  }

  if (!editForm.value.templatePackageId) {
    toast.warning('Template Belum Dipilih', 'Silakan pilih paket master template SOP terlebih dahulu sebelum melakukan generate batch.')
    return
  }

  const isConfirmed = await confirmDeleteDialog({
    title: 'Publish & Generate Misi Batch?',
    text: `Generate seluruh penugasan misi untuk batch "${editForm.value.name}"? Status batch akan berubah menjadi OPEN dan aktif.`,
    confirmButtonText: 'Ya, Publish & Generate'
  })

  if (isConfirmed) {
    isSaving.value = true
    saveMode.value = 'publish'
    try {
      const payload = await buildUpdatePayload(false)
      const res = await batchStore.updateBatchToApi(route.params.id, payload)
      if (res && (res.success || res.data)) {
        toast.success('Batch Aktif & Misi Berhasil Di-generate', `Batch ${editForm.value.name} telah aktif dan seluruh misi ter-generate.`)
        await loadBatchData()
      } else {
        throw new Error(res?.message || 'Gagal meng-generate misi batch.')
      }
    } catch (err) {
      console.error('Publish batch error:', err)
      toast.error('Gagal Generate Batch', err.message || 'Terjadi kesalahan saat memproses data.')
    } finally {
      isSaving.value = false
      saveMode.value = ''
    }
  }
}
</script>
