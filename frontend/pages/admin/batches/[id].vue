<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Detail Batch: {{ batch?.name || 'Memuat...' }}</span>
    </div>

    <!-- Error State -->
    <div v-if="!isLoadingDetail && !batch" class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch tidak ditemukan.</p>
      <NuxtLink to="/admin/batches" class="text-xs text-[#831843] font-semibold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- Main Clean Card Detail (Read-Only) -->
    <div v-else class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
      
      <!-- Card Header -->
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
                  batch.status === 'DRAFT'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60'
                    : batch.status === 'COMPLETED'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                ]"
              >
                {{ batch.status }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                🔒 Read-Only
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-if="batch?.status === 'DRAFT'"
            type="button"
            @click="handleGenerateMissions"
            :disabled="isGenerating"
            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Zap class="w-4 h-4" />
            <span>{{ isGenerating ? 'Mengenerate...' : 'Generate Misi Batch' }}</span>
          </button>

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
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Kurikulum Template Misi Buddy (Pra-Batch)
            </h3>
          </div>
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
          <div>
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              3. Paket Master Kurikulum Template SOP (Journey)
            </h3>
          </div>
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
          
          <!-- Filter per-Store jika kru banyak -->
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useMissionStore } from '~/stores/mission.js'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import {
  Layers,
  ArrowLeft,
  Calendar,
  Zap
} from 'lucide-vue-next'
import { batchApi } from '~/services/api.js'
import { confirmDeleteDialog } from '~/utils/dialog.js'

const route = useRoute()
const batchStore = useBatchStore()
const userStore = useUserStore()
const storeStore = useStoreStore()
const missionStore = useMissionStore()
const templateStore = useTemplateStore()
const toast = useToast()

const crewStoreFilter = ref('ALL')
const isGenerating = ref(false)
const isLoadingDetail = ref(true)

const batch = computed(() => {
  return batchStore.batchById(route.params.id)
})

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

  // Fallback jika users belum terembed di batch object
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
    await Promise.allSettled([
      batchStore.fetchBatchByIdFromApi(route.params.id),
      userStore.fetchUsersFromApi({ limit: 100 }),
      storeStore.fetchStoresFromApi({ page: 1, limit: 100 }),
      templateStore.fetchAllTemplateTypes()
    ])
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

const handleGenerateMissions = async () => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Generate Misi Batch?',
    text: `Generate seluruh penugasan misi crew untuk batch "${batch.value?.name}"? Status batch akan berubah menjadi OPEN.`,
    confirmButtonText: 'Ya, Generate Misi'
  })

  if (isConfirmed) {
    isGenerating.value = true
    try {
      await batchApi.generate(route.params.id)
      toast.success('Misi Berhasil Di-generate', 'Seluruh misi batch telah aktif dan status batch menjadi OPEN.')
      await loadBatchData()
    } catch (err) {
      console.error('Generate batch missions error:', err)
      toast.error('Gagal Generate Misi', err.message || 'Terjadi kesalahan saat meng-generate misi.')
    } finally {
      isGenerating.value = false
    }
  }
}
</script>
