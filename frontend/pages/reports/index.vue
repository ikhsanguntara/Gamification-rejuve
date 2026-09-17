<template>
  <div class="space-y-6 pb-16">
    <!-- Top Header & Context Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5 mb-1.5 flex-wrap">
          <div class="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
            <FileSpreadsheet class="w-5 h-5" />
          </div>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Laporan & Traceability
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            📊 Excel Ready (.xlsx)
          </span>
          <span v-if="batchStore.currentBatch?.name" class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ batchStore.currentBatch?.name }}
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
          Rekapitulasi perolehan insentif pembimbingan Store Leader / Buddy dan audit jejak kepatuhan onboarding kru gerai Re.juve.
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          @click="handleExportActiveTab"
          :disabled="reportStore.isExporting"
          class="text-xs font-bold px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
          :title="activeTab === 'buddy-incentive' ? 'Download Excel Rekapitulasi Insentif Buddy' : 'Download Excel Active New Recruit Report'"
        >
          <Loader2 v-if="reportStore.isExporting && (reportStore.exportingTarget === 'buddy-all' || reportStore.exportingTarget === 'traceability-all')" class="w-4 h-4 animate-spin" />
          <Download v-else class="w-4 h-4" />
          <span>Ekspor Spreadsheet (.xlsx)</span>
        </button>

        <button
          type="button"
          @click="refreshCurrentTab"
          :disabled="reportStore.isLoading"
          class="text-xs font-bold px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          title="Muat Ulang Data"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': reportStore.isLoading }" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Navigation Tabs Switcher -->
    <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 w-full sm:w-fit">
      <button
        type="button"
        @click="switchTab('buddy-incentive')"
        class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        :class="[
          activeTab === 'buddy-incentive'
            ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <Handshake class="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>1. Rekapitulasi Insentif Buddy</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
          {{ reportStore.buddyIncentives.length }}
        </span>
      </button>

      <button
        type="button"
        @click="switchTab('user-traceability')"
        class="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        :class="[
          activeTab === 'user-traceability'
            ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        ]"
      >
        <Compass class="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>2. Audit Traceability Kru (New Recruit)</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
          {{ reportStore.userTraceability.length }}
        </span>
      </button>
    </div>

    <!-- KPI Summary Stat Cards: Tab 1 (Buddy Incentive) -->
    <div v-if="activeTab === 'buddy-incentive'" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Total SL / Buddy</span>
          <div class="w-7 h-7 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users class="w-3.5 h-3.5" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-900 dark:text-white">
          {{ reportStore.buddySummaryStats.totalBuddies }} <span class="text-xs font-normal text-slate-400">Orang</span>
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Mentee Dibimbing</span>
          <div class="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <GraduationCap class="w-3.5 h-3.5" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-900 dark:text-white">
          {{ reportStore.buddySummaryStats.totalMentees }} <span class="text-xs font-normal text-slate-400">Kru Baru</span>
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Rasio Kelulusan Kru</span>
          <div class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 class="w-3.5 h-3.5" />
          </div>
        </div>
        <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          {{ reportStore.buddySummaryStats.passRate }}%
          <span class="text-xs font-normal text-slate-400">({{ reportStore.buddySummaryStats.passedMentees }} Lulus)</span>
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-800 text-white shadow-md shadow-purple-900/10">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-purple-200">Estimasi Total Insentif</span>
          <div class="w-7 h-7 rounded-xl bg-white/20 text-white flex items-center justify-center">
            <Coins class="w-3.5 h-3.5" />
          </div>
        </div>
        <p class="text-lg sm:text-xl font-black tracking-tight">
          {{ formatRupiah(reportStore.buddySummaryStats.totalIncentiveAmount) }}
        </p>
      </div>
    </div>

    <!-- KPI Summary Stat Cards: Tab 2 (User Traceability) -->
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Kru Onboarding</span>
          <div class="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users class="w-3.5 h-3.5" />
          </div>
        </div>
        <p class="text-xl font-bold text-slate-900 dark:text-white">
          {{ reportStore.traceabilitySummaryStats.totalCrews }} <span class="text-xs font-normal text-slate-400">Kru</span>
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Kru Lulus & Selesai</span>
          <div class="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 class="w-3.5 h-3.5" />
          </div>
        </div>
        <p class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
          {{ reportStore.traceabilitySummaryStats.completedCrews }} <span class="text-xs font-normal text-slate-400">Kru</span>
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Kru Sedang Berjalan</span>
          <div class="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Compass class="w-3.5 h-3.5" />
          </div>
        </div>
        <p class="text-xl font-bold text-amber-600 dark:text-amber-400">
          {{ reportStore.traceabilitySummaryStats.activeCrews }} <span class="text-xs font-normal text-slate-400">Kru</span>
        </p>
      </div>

      <div class="p-4 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-md shadow-blue-900/10">
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-semibold text-blue-200">Rata-rata Skor Evaluasi</span>
          <div class="w-7 h-7 rounded-xl bg-white/20 text-white flex items-center justify-center">
            <Award class="w-3.5 h-3.5" />
          </div>
        </div>
        <p class="text-xl font-black">
          {{ reportStore.traceabilitySummaryStats.avgScore }} / 100
        </p>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Search Input -->
        <div class="relative">
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Pencarian
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              @input="onSearchInput"
              type="text"
              :placeholder="activeTab === 'buddy-incentive' ? 'Cari nama Buddy / NIK / Gerai...' : 'Cari nama Kru / NIK / Gerai...'"
              class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-8 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <!-- Filter Batch -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Batch
          </label>
          <select
            v-model="selectedBatchId"
            @change="onFilterChange"
            class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          >
            <option value="">Semua Batch</option>
            <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
              {{ b.name }}
            </option>
          </select>
        </div>

        <!-- Filter Gerai / Departemen -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Gerai / Store
          </label>
          <select
            v-model="selectedStoreId"
            @change="onFilterChange"
            class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          >
            <option value="">Semua Gerai</option>
            <option v-for="s in storeStore.allStores" :key="s.id" :value="s.id">
              {{ s.name }} ({{ s.code }})
            </option>
          </select>
        </div>

        <!-- Filter Status (Tab 2) / Status Payout (Tab 1) -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Status
          </label>
          <select
            v-model="selectedStatus"
            @change="onFilterChange"
            class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          >
            <option value="">Semua Status</option>
            <template v-if="activeTab === 'buddy-incentive'">
              <option value="READY_PAYOUT">Siap Cair (Lulus 100%)</option>
              <option value="IN_PROGRESS">Sedang Berjalan</option>
            </template>
            <template v-else>
              <option value="COMPLETED">Lulus / Selesai</option>
              <option value="ACTIVE">Aktif (On Going)</option>
              <option value="AT_RISK">Perlu Pendampingan</option>
            </template>
          </select>
        </div>
      </div>
    </div>

    <!-- Tab 1: TABEL REKAPITULASI INSENTIF BUDDY -->
    <div v-if="activeTab === 'buddy-incentive'" class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            Rekapitulasi Insentif Pembimbingan Buddy
          </h3>
          <p class="text-xs text-slate-400">
            Perhitungan insentif Store Leader berdasarkan jumlah mentee dan kelulusan evaluasi.
          </p>
        </div>
        <span class="text-xs font-semibold text-slate-400">
          Total: {{ reportStore.buddyIncentives.length }} Buddy
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="reportStore.isLoading" class="p-12 text-center">
        <Loader2 class="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
        <p class="text-xs font-semibold text-slate-500">Memuat data insentif buddy...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredBuddyList.length === 0" class="p-12 text-center space-y-2">
        <Handshake class="w-10 h-10 text-slate-300 mx-auto" />
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada data insentif</h4>
        <p class="text-xs text-slate-400">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-4">No</th>
              <th class="py-3.5 px-4">Store Leader / Buddy</th>
              <th class="py-3.5 px-4">Gerai & Batch</th>
              <th class="py-3.5 px-4 text-center">Mentee (Lulus / Total)</th>
              <th class="py-3.5 px-4 text-center">Rata-rata Skor</th>
              <th class="py-3.5 px-4 text-right">Estimasi Insentif</th>
              <th class="py-3.5 px-4 text-center">Status</th>
              <th class="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            <tr
              v-for="(buddy, index) in filteredBuddyList"
              :key="buddy.userId || index"
              class="hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-colors"
            >
              <td class="py-3 px-4 font-semibold text-slate-400">
                {{ index + 1 }}
              </td>

              <!-- Buddy Info -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="buddy.avatar"
                    :alt="buddy.name"
                    class="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white">
                      {{ buddy.name }}
                    </p>
                    <p class="text-[11px] text-slate-400">
                      {{ buddy.nik }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Gerai & Batch -->
              <td class="py-3 px-4">
                <p class="font-semibold text-slate-800 dark:text-slate-200">
                  {{ buddy.storeName }}
                </p>
                <p class="text-[11px] text-slate-400">
                  {{ buddy.batchName }}
                </p>
              </td>

              <!-- Mentee Ratio -->
              <td class="py-3 px-4 text-center">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                  <span class="text-emerald-600 dark:text-emerald-400">{{ buddy.passedMentees }} Lulus</span>
                  <span class="text-slate-400">/</span>
                  <span class="text-slate-700 dark:text-slate-300">{{ buddy.totalMentees }} Total</span>
                </div>
              </td>

              <!-- Rata-rata Skor -->
              <td class="py-3 px-4 text-center">
                <span class="font-bold text-slate-800 dark:text-slate-200">
                  {{ buddy.avgScore }}
                </span>
                <span class="text-[10px] text-slate-400 block">/ 100</span>
              </td>

              <!-- Nilai Insentif -->
              <td class="py-3 px-4 text-right">
                <span class="font-extrabold text-purple-700 dark:text-purple-300 text-sm">
                  {{ formatRupiah(buddy.totalIncentive) }}
                </span>
                <span class="text-[10px] text-slate-400 block">
                  @{{ formatRupiah(buddy.ratePerMentee || 250000) }}/kru
                </span>
              </td>

              <!-- Status Verifikasi -->
              <td class="py-3 px-4 text-center">
                <span
                  class="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  :class="[
                    buddy.status === 'READY_PAYOUT'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  ]"
                >
                  {{ buddy.status === 'READY_PAYOUT' ? 'Siap Cair' : 'Proses Onboarding' }}
                </span>
              </td>

              <!-- Aksi -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="openBuddyDetail(buddy.userId)"
                    class="p-1.5 rounded-lg text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-colors cursor-pointer"
                    title="Lihat Detail Mentee & Rincian Insentif"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    @click="exportSingleBuddy(buddy.userId)"
                    :disabled="reportStore.isExporting && reportStore.exportingTarget === `buddy-${buddy.userId}`"
                    class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer disabled:opacity-50"
                    title="Download Excel Laporan Insentif Buddy Ini (.xlsx)"
                  >
                    <Loader2 v-if="reportStore.isExporting && reportStore.exportingTarget === `buddy-${buddy.userId}`" class="w-4 h-4 animate-spin" />
                    <FileSpreadsheet v-else class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: TABEL AUDIT TRACEABILITY KRU (ACTIVE NEW RECRUIT) -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">
            Audit Traceability Kru (Active New Recruit Report)
          </h3>
          <p class="text-xs text-slate-400">
            Jejak evaluasi tahapan onboarding, progress misi SOP, serta persetujuan Store Leader & DM.
          </p>
        </div>
        <span class="text-xs font-semibold text-slate-400">
          Total: {{ reportStore.userTraceability.length }} Kru
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="reportStore.isLoading" class="p-12 text-center">
        <Loader2 class="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p class="text-xs font-semibold text-slate-500">Memuat data audit traceability kru...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredTraceabilityList.length === 0" class="p-12 text-center space-y-2">
        <Compass class="w-10 h-10 text-slate-300 mx-auto" />
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada data kru</h4>
        <p class="text-xs text-slate-400">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
      </div>

      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-4">No</th>
              <th class="py-3.5 px-4">Kru Baru (New Recruit)</th>
              <th class="py-3.5 px-4">Gerai & Mulai</th>
              <th class="py-3.5 px-4">Mentor / Buddy</th>
              <th class="py-3.5 px-4">Tahapan & Progress</th>
              <th class="py-3.5 px-4 text-center">Rata-rata Skor</th>
              <th class="py-3.5 px-4 text-center">Status Onboarding</th>
              <th class="py-3.5 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            <tr
              v-for="(crew, index) in filteredTraceabilityList"
              :key="crew.userId || index"
              class="hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors"
            >
              <td class="py-3 px-4 font-semibold text-slate-400">
                {{ index + 1 }}
              </td>

              <!-- Kru Info -->
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <img
                    :src="crew.avatar"
                    :alt="crew.name"
                    class="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white">
                      {{ crew.name }}
                    </p>
                    <p class="text-[11px] text-slate-400">
                      {{ crew.nik }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Gerai & Join Date -->
              <td class="py-3 px-4">
                <p class="font-semibold text-slate-800 dark:text-slate-200">
                  {{ crew.storeName }}
                </p>
                <p class="text-[11px] text-slate-400">
                  {{ crew.joinDate || '2026-02-01' }} ({{ crew.batchName }})
                </p>
              </td>

              <!-- Buddy Mentor -->
              <td class="py-3 px-4">
                <p class="font-semibold text-purple-700 dark:text-purple-300">
                  {{ crew.buddyName }}
                </p>
                <p class="text-[10px] text-slate-400">
                  Store Leader
                </p>
              </td>

              <!-- Current Stage & Progress Bar -->
              <td class="py-3 px-4 min-w-[160px]">
                <div class="flex items-center justify-between text-[11px] font-semibold mb-1">
                  <span class="text-slate-700 dark:text-slate-300">{{ crew.currentStage }}</span>
                  <span class="text-blue-600 dark:text-blue-400">{{ crew.progress }}%</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="[
                      crew.progress === 100
                        ? 'bg-emerald-500'
                        : (crew.progress >= 50 ? 'bg-blue-600' : 'bg-amber-500')
                    ]"
                    :style="{ width: `${crew.progress}%` }"
                  ></div>
                </div>
                <span class="text-[10px] text-slate-400 mt-1 block">
                  Misi Selesai: {{ crew.missionsCompleted }}
                </span>
              </td>

              <!-- Rata-rata Skor -->
              <td class="py-3 px-4 text-center">
                <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {{ crew.avgScore }}
                </span>
                <span class="text-[10px] text-slate-400 block">/ 100</span>
              </td>

              <!-- Status Onboarding -->
              <td class="py-3 px-4 text-center">
                <span
                  class="text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                  :class="[
                    crew.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : (crew.status === 'AT_RISK'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300')
                  ]"
                >
                  <CheckCircle2 v-if="crew.status === 'COMPLETED'" class="w-3 h-3" />
                  <AlertCircle v-else-if="crew.status === 'AT_RISK'" class="w-3 h-3" />
                  <Clock v-else class="w-3 h-3" />
                  <span>{{ crew.status === 'COMPLETED' ? 'Lulus SOP' : (crew.status === 'AT_RISK' ? 'Butuh Review' : 'Aktif') }}</span>
                </span>
              </td>

              <!-- Aksi -->
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    @click="openTraceabilityDetail(crew.userId)"
                    class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                    title="Lihat Kartu Audit Traceability Lengkap"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    @click="exportSingleTraceability(crew.userId)"
                    :disabled="reportStore.isExporting && reportStore.exportingTarget === `traceability-${crew.userId}`"
                    class="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer disabled:opacity-50"
                    title="Download Excel Kartu Audit Kru Ini (.xlsx)"
                  >
                    <Loader2 v-if="reportStore.isExporting && reportStore.exportingTarget === `traceability-${crew.userId}`" class="w-4 h-4 animate-spin" />
                    <FileSpreadsheet v-else class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL 1: DETAIL INSENTIF BUDDY & ROSTER MENTEE -->
    <div
      v-if="isBuddyDetailModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
      @click.self="isBuddyDetailModalOpen = false"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <Handshake class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Rincian Insentif Pembimbingan Store Leader
              </h3>
              <p class="text-xs text-slate-400">
                Laporan detail mentee yang dibimbing oleh {{ reportStore.selectedBuddyDetail?.buddyInfo?.name }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="isBuddyDetailModalOpen = false"
            class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Profile & Total Insentif Summary Banner -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/60 text-xs">
          <div>
            <span class="text-slate-400 block">Nama Store Leader:</span>
            <strong class="text-slate-900 dark:text-white text-sm">
              {{ reportStore.selectedBuddyDetail?.buddyInfo?.name }}
            </strong>
            <span class="text-slate-500 block">{{ reportStore.selectedBuddyDetail?.buddyInfo?.storeName }}</span>
          </div>

          <div>
            <span class="text-slate-400 block">Batch & Periode:</span>
            <strong class="text-slate-800 dark:text-slate-200">
              {{ reportStore.selectedBuddyDetail?.batchName }}
            </strong>
            <span class="text-emerald-600 dark:text-emerald-400 block font-semibold">
              {{ reportStore.selectedBuddyDetail?.graduatedCount }} dari {{ reportStore.selectedBuddyDetail?.totalMentees }} Kru Lulus
            </span>
          </div>

          <div class="sm:text-right">
            <span class="text-slate-400 block">Total Hak Insentif:</span>
            <strong class="text-purple-700 dark:text-purple-300 text-base font-black">
              {{ formatRupiah(reportStore.selectedBuddyDetail?.totalIncentive) }}
            </strong>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold inline-block mt-0.5">
              Telah Diverifikasi DM
            </span>
          </div>
        </div>

        <!-- Roster Mentee Table -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">
            Daftar Kru Mentee ({{ reportStore.selectedBuddyDetail?.mentees?.length || 0 }})
          </h4>

          <div class="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                  <th class="py-2.5 px-3">Nama Mentee</th>
                  <th class="py-2.5 px-3 text-center">Evaluasi 3 Hari</th>
                  <th class="py-2.5 px-3 text-center">Skor Journey</th>
                  <th class="py-2.5 px-3 text-center">Status Kelulusan</th>
                  <th class="py-2.5 px-3 text-right">Nilai Insentif</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                <tr v-for="mentee in reportStore.selectedBuddyDetail?.mentees" :key="mentee.userId">
                  <td class="py-2.5 px-3">
                    <p class="font-bold text-slate-900 dark:text-white">{{ mentee.name }}</p>
                    <p class="text-[10px] text-slate-400">{{ mentee.nik }} • Mulai: {{ mentee.startDate }}</p>
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      :class="mentee.preBatchStatus === 'KOMPETEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                    >
                      {{ mentee.preBatchScore }} ({{ mentee.preBatchStatus }})
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                    {{ mentee.journeyScore }}
                  </td>
                  <td class="py-2.5 px-3 text-center">
                    <span
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      :class="mentee.isGraduated ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'"
                    >
                      {{ mentee.isGraduated ? 'Lulus SOP' : 'On Going' }}
                    </span>
                  </td>
                  <td class="py-2.5 px-3 text-right font-bold text-purple-700 dark:text-purple-300">
                    {{ formatRupiah(mentee.incentiveEarned) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            @click="exportSingleBuddy(reportStore.selectedBuddyDetail?.buddyInfo?.id)"
            :disabled="reportStore.isExporting"
            class="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Ekspor Excel (.xlsx) Buddy Ini</span>
          </button>

          <button
            type="button"
            @click="isBuddyDetailModalOpen = false"
            class="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: DETAIL AUDIT TRACEABILITY LENGKAP KRU -->
    <div
      v-if="isTraceabilityDetailModalOpen"
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
      @click.self="isTraceabilityDetailModalOpen = false"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8 max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <Compass class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">
                Kartu Audit Traceability Kru Onboarding
              </h3>
              <p class="text-xs text-slate-400">
                Riwayat lengkap tahapan evaluasi {{ reportStore.selectedTraceabilityDetail?.userInfo?.name }}
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="isTraceabilityDetailModalOpen = false"
            class="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- User Information Strip -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/60 text-xs flex-shrink-0">
          <div>
            <span class="text-slate-400 block">Nama Kru:</span>
            <strong class="text-slate-900 dark:text-white text-sm">
              {{ reportStore.selectedTraceabilityDetail?.userInfo?.name }}
            </strong>
            <span class="text-slate-500 block">{{ reportStore.selectedTraceabilityDetail?.userInfo?.storeName }}</span>
          </div>

          <div>
            <span class="text-slate-400 block">Mentor / Buddy:</span>
            <strong class="text-purple-700 dark:text-purple-300">
              {{ reportStore.selectedTraceabilityDetail?.userInfo?.mentorName }}
            </strong>
            <span class="text-slate-400 block">Mulai: {{ reportStore.selectedTraceabilityDetail?.userInfo?.joinDate }}</span>
          </div>

          <div class="sm:text-right">
            <span class="text-slate-400 block">Skor Akhir & Bintang:</span>
            <strong class="text-blue-700 dark:text-blue-300 text-base font-black">
              {{ reportStore.selectedTraceabilityDetail?.finalScore }} / 100
            </strong>
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold inline-block mt-0.5">
              ⭐ {{ reportStore.selectedTraceabilityDetail?.totalStars }} Bintang
            </span>
          </div>
        </div>

        <!-- Audit Timeline Steps (Scrollable) -->
        <div class="space-y-3 overflow-y-auto flex-1 pr-1 min-h-0">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 sticky top-0 bg-white dark:bg-slate-900 py-1">
            Jejak Riwayat Tahapan (Audit Timeline)
          </h4>

          <div class="space-y-3">
            <div
              v-for="step in reportStore.selectedTraceabilityDetail?.auditTimeline"
              :key="step.stageNumber"
              class="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs space-y-2"
            >
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {{ step.stageNumber }}
                  </span>
                  <h5 class="font-bold text-slate-900 dark:text-white text-xs">
                    {{ step.title }}
                  </h5>
                </div>

                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-800 dark:text-slate-200">
                    Skor: {{ step.score }}
                  </span>
                  <span
                    class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    :class="[
                      step.status === 'KOMPETEN' || step.status === 'APPROVED' || step.status === 'SUBMITTED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    ]"
                  >
                    {{ step.status }}
                  </span>
                </div>
              </div>

              <div class="text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5 pl-8">
                <p><strong>Penilai:</strong> {{ step.evaluator || 'Store Leader' }} • <strong>Selesai:</strong> {{ step.completedAt }}</p>
                <p class="italic text-slate-600 dark:text-slate-300">"{{ step.notes }}"</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button
            type="button"
            @click="exportSingleTraceability(reportStore.selectedTraceabilityDetail?.userInfo?.id)"
            :disabled="reportStore.isExporting"
            class="text-xs font-bold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Ekspor Excel (.xlsx) Kartu Audit Ini</span>
          </button>

          <button
            type="button"
            @click="isTraceabilityDetailModalOpen = false"
            class="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReportStore } from '~/stores/report.js'
import { useBatchStore } from '~/stores/batch.js'
import { useStoreStore } from '~/stores/store.js'
import { useUserStore } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'
import {
  FileSpreadsheet,
  Handshake,
  Compass,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Coins,
  Search,
  Download,
  RefreshCw,
  Eye,
  X,
  Loader2
} from 'lucide-vue-next'

const reportStore = useReportStore()
const batchStore = useBatchStore()
const storeStore = useStoreStore()
const userStore = useUserStore()
const toast = useToast()

const activeTab = ref('buddy-incentive')
const searchQuery = ref('')
const selectedBatchId = ref('')
const selectedStoreId = ref('')
const selectedStatus = ref('')

const isBuddyDetailModalOpen = ref(false)
const isTraceabilityDetailModalOpen = ref(false)

onMounted(async () => {
  if (batchStore.allBatches.length === 0) {
    await batchStore.fetchBatchesFromApi().catch(() => {})
  }
  if (storeStore.allStores.length === 0) {
    await storeStore.fetchStoresFromApi().catch(() => {})
  }
  await loadData()
})

const loadData = async () => {
  if (activeTab.value === 'buddy-incentive') {
    await reportStore.fetchBuddyIncentives()
  } else {
    await reportStore.fetchUserTraceability()
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  reportStore.activeTab = tab
  searchQuery.value = ''
  selectedStatus.value = ''
  reportStore.setFilter('search', '')
  reportStore.setFilter('status', '')
  loadData()
}

const onSearchInput = () => {
  reportStore.setFilter('search', searchQuery.value)
}

const onFilterChange = () => {
  reportStore.setFilter('batchId', selectedBatchId.value)
  reportStore.setFilter('storeId', selectedStoreId.value)
  reportStore.setFilter('status', selectedStatus.value)
  loadData()
}

const refreshCurrentTab = async () => {
  await loadData()
  toast.success('Data Diperbarui', 'Data laporan berhasil dimuat ulang.')
}

const filteredBuddyList = computed(() => {
  let list = reportStore.buddyIncentives || []
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(b =>
      (b.name && b.name.toLowerCase().includes(q)) ||
      (b.nik && b.nik.toLowerCase().includes(q)) ||
      (b.storeName && b.storeName.toLowerCase().includes(q))
    )
  }
  if (selectedStatus.value) {
    list = list.filter(b => b.status === selectedStatus.value)
  }
  return list
})

const filteredTraceabilityList = computed(() => {
  let list = reportStore.userTraceability || []
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.nik && c.nik.toLowerCase().includes(q)) ||
      (c.storeName && c.storeName.toLowerCase().includes(q)) ||
      (c.buddyName && c.buddyName.toLowerCase().includes(q))
    )
  }
  if (selectedStatus.value) {
    list = list.filter(c => c.status === selectedStatus.value)
  }
  return list
})

const formatRupiah = (val) => {
  if (!val && val !== 0) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val)
}

const openBuddyDetail = async (userId) => {
  await reportStore.fetchBuddyIncentiveDetail(userId)
  isBuddyDetailModalOpen.value = true
}

const openTraceabilityDetail = async (userId) => {
  await reportStore.fetchUserTraceabilityDetail(userId)
  isTraceabilityDetailModalOpen.value = true
}

const handleExportActiveTab = async () => {
  try {
    if (activeTab.value === 'buddy-incentive') {
      await reportStore.exportBuddyIncentives()
      toast.success('Ekspor Berhasil', 'Spreadsheet rekapitulasi insentif buddy (.xlsx) telah diunduh.')
    } else {
      await reportStore.exportUserTraceability()
      toast.success('Ekspor Berhasil', 'Spreadsheet Active New Recruit Report (.xlsx) telah diunduh.')
    }
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kesalahan saat mengekspor laporan: ' + err.message)
  }
}

const exportSingleBuddy = async (userId) => {
  try {
    await reportStore.exportBuddyIncentiveDetail(userId)
    toast.success('Ekspor Berhasil', 'Spreadsheet laporan insentif buddy (.xlsx) telah diunduh.')
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kendala saat mengunduh laporan: ' + err.message)
  }
}

const exportSingleTraceability = async (userId) => {
  try {
    await reportStore.exportUserTraceabilityDetail(userId)
    toast.success('Ekspor Berhasil', 'Spreadsheet kartu audit kru (.xlsx) telah diunduh.')
  } catch (err) {
    toast.error('Gagal Ekspor', 'Terjadi kendala saat mengunduh kartu audit: ' + err.message)
  }
}
</script>
