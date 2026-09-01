<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#831843] dark:text-[#f472b6] font-semibold">Master Templates</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Master Template SOP Misi
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Katalog paket SOP operasional dengan struktur mingguan dinamis siap diterapkan ke gerai.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <!-- Action Buttons when in BATCH tab -->
        <template v-if="activeCatalogCategory === 'BATCH'">
          <button
            type="button"
            @click="openCreatePackageModal"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
          >
            <Plus class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
            <span>Buat Paket Master Baru</span>
          </button>

          <button
            type="button"
            @click="openApplyPackageModal"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            <Sparkles class="w-4 h-4" />
            <span>Terapkan ke Gerai</span>
          </button>
        </template>

        <!-- Action Buttons when in BUDDY tab -->
        <template v-else-if="activeCatalogCategory === 'BUDDY'">
          <button
            type="button"
            @click="openCreateBuddyPackageModal"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all shadow-xs cursor-pointer"
          >
            <Plus class="w-4 h-4 text-purple-600" />
            <span>Buat Paket Buddy Baru</span>
          </button>

          <button
            type="button"
            @click="openAddBuddyMissionModal()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Butir SOP Buddy</span>
          </button>
        </template>

        <!-- Action Buttons when in FEEDBACK tab -->
        <template v-else>
          <button
            type="button"
            @click="openAddSurveyQuestionModal"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Pertanyaan Survei</span>
          </button>
        </template>
      </div>
    </div>

    <!-- Template Type Switcher Tabs (Batch Kurikulum vs Buddy Pre-Batch vs Feedback & Rapor) -->
    <div class="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit text-xs font-semibold flex-wrap">
      <button
        type="button"
        @click="activeCatalogCategory = 'BATCH'"
        class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        :class="[
          activeCatalogCategory === 'BATCH'
            ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Layers class="w-4 h-4" />
        <span>1. Paket Misi Batch ({{ templateStore.allPackages.length }})</span>
      </button>

      <button
        type="button"
        @click="activeCatalogCategory = 'BUDDY'"
        class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        :class="[
          activeCatalogCategory === 'BUDDY'
            ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Handshake class="w-4 h-4" />
        <span>2. Paket Misi Buddy ({{ buddyStore.allPackages.length }})</span>
      </button>

      <button
        type="button"
        @click="activeCatalogCategory = 'FEEDBACK'"
        class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2"
        :class="[
          activeCatalogCategory === 'FEEDBACK'
            ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-sm font-bold'
            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <MessageSquareText class="w-4 h-4" />
        <span>3. Feedback & Rapor New Hire</span>
      </button>
    </div>

    <!-- 2-Column Workspace for BATCH TEMPLATES -->
    <div v-if="activeCatalogCategory === 'BATCH'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- KOLOM KIRI: DAFTAR PAKET MASTER (4/12) -->
      <div class="lg:col-span-4 space-y-3">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Daftar Paket Template ({{ templateStore.allPackages.length }})
        </h3>

        <div class="space-y-2">
          <div
            v-for="pkg in templateStore.allPackages"
            :key="pkg.id"
            @click="selectPackageTab(pkg.id)"
            class="p-4 rounded-2xl border transition-all cursor-pointer relative"
            :class="[
              templateStore.selectedPackageId === pkg.id
                ? 'border-[#831843] bg-white dark:bg-slate-900 ring-2 ring-[#831843]/40 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
            ]"
          >
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                {{ pkg.code }}
              </span>
              <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <span>{{ (pkg.weeks || []).length || pkg.totalWeeks || 3 }} Minggu</span>
                <span>•</span>
                <span>{{ pkg.templates.length }} Misi</span>
              </div>
            </div>

            <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              {{ pkg.name }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {{ pkg.description }}
            </p>

            <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">🎯 {{ pkg.targetType }}</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click.stop="duplicatePackage(pkg.id)"
                  title="Duplikat Paket"
                  class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <Copy class="w-3 h-3" />
                </button>
                <button
                  v-if="templateStore.allPackages.length > 1"
                  type="button"
                  @click.stop="confirmDeletePackage(pkg)"
                  title="Hapus Paket"
                  class="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN: DETAIL PAKET & TABS MINGGUAN (8/12) -->
      <div class="lg:col-span-8">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          
          <!-- Package Header Summary -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-[#831843] text-white">
                  {{ activePackage?.code }}
                </span>
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ activePackage?.name }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ activePackage?.description }}
              </p>
            </div>

            <button
              type="button"
              @click="openAddMissionModal"
              class="px-3.5 py-2 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Butir SOP</span>
            </button>
          </div>

          <!-- Week Tabs via Reka UI dengan Dukungan Lebih dari 3 Week & Judul Week -->
          <TabsRoot :model-value="String(activeWeekTab)" @update:model-value="activeWeekTab = Number($event)" class="w-full space-y-4">
            
            <!-- Week Selector Navigation & Add Week Button -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2 flex-wrap">
                <TabsList class="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
                  <TabsTrigger
                    v-for="w in activePackageWeeks"
                    :key="w.weekNumber"
                    :value="String(w.weekNumber)"
                    class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                    :class="[
                      activeWeekTab === w.weekNumber
                        ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    ]"
                  >
                    Minggu {{ w.weekNumber }}
                  </TabsTrigger>
                </TabsList>

                <!-- Tombol Tambah Week Dinamis -->
                <button
                  type="button"
                  @click="handleAddNewWeek"
                  class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-[#831843] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-[#831843] transition-all cursor-pointer"
                  title="Tambah Minggu Baru ke Paket Ini"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Tambah Week</span>
                </button>
              </div>

              <!-- Action buttons for currently active week -->
              <div class="flex items-center gap-2">
                <button
                  v-if="activePackageWeeks.length > 1"
                  type="button"
                  @click="handleRemoveCurrentWeek"
                  class="text-[11px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                >
                  Hapus Minggu Ini
                </button>
              </div>
            </div>

            <!-- Dynamic Week Title Editor Card -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap flex items-center gap-1">
                  <Bookmark class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                  <span>Judul Minggu {{ activeWeekTab }}:</span>
                </span>
                <input
                  v-model="currentWeekTitle"
                  type="text"
                  placeholder="Contoh: Minggu 1: Suhu & Sanitasi Dasar"
                  class="flex-1 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-900 dark:text-white font-semibold focus:ring-1 focus:ring-[#831843]"
                />
              </div>
              <button
                type="button"
                @click="saveCurrentWeekTitle"
                class="px-3 py-1.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer active:scale-95 flex-shrink-0"
              >
                Simpan Judul
              </button>
            </div>

            <!-- Content per Week -->
            <TabsContent
              v-for="w in activePackageWeeks"
              :key="w.weekNumber"
              :value="String(w.weekNumber)"
              class="space-y-3 pt-2"
            >
              <div
                v-for="item in activePackage?.templates.filter(t => t.week === w.weekNumber)"
                :key="item.id"
                class="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5 transition-all"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {{ item.codePrefix }}
                      </span>
                      <span class="text-xs font-bold text-slate-900 dark:text-white">
                        {{ item.title }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      {{ item.description }}
                    </p>
                  </div>

                  <button
                    type="button"
                    @click="removeMission(item.id)"
                    class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Hapus butir SOP ini"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Checklist & Poin SOP:
                  </span>
                  <ul class="text-[11px] text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                    <li v-for="(req, rIdx) in item.requirements" :key="rIdx">
                      {{ req }}
                    </li>
                  </ul>
                </div>
              </div>

              <div
                v-if="!activePackage?.templates.some(t => t.week === w.weekNumber)"
                class="py-12 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl"
              >
                Belum ada butir misi SOP di Minggu {{ w.weekNumber }}. Klik "Tambah Butir SOP" di atas.
              </div>
            </TabsContent>

          </TabsRoot>

        </div>
      </div>

    </div>

    <!-- 2-Column Workspace for BUDDY TEMPLATES (Pre-Batch 3 Hari) -->
    <div v-else-if="activeCatalogCategory === 'BUDDY'" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Sisi Kiri: Daftar Paket Template Buddy -->
      <div class="lg:col-span-4 space-y-3">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Daftar Template Buddy ({{ buddyStore.allPackages.length }})
          </h3>
          <button
            type="button"
            @click="openCreateBuddyPackageModal"
            class="text-[11px] text-purple-600 font-bold hover:underline cursor-pointer"
          >
            + Paket Baru
          </button>
        </div>

        <div class="space-y-2">
          <div
            v-for="bpkg in buddyStore.allPackages"
            :key="bpkg.id"
            @click="selectedBuddyPkgId = bpkg.id"
            class="p-4 rounded-2xl border transition-all cursor-pointer relative"
            :class="[
              selectedBuddyPkgId === bpkg.id
                ? 'border-purple-600 bg-white dark:bg-slate-900 ring-2 ring-purple-600/40 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
            ]"
          >
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                {{ bpkg.code }}
              </span>
              <span class="text-[10px] text-slate-400 font-semibold">
                {{ bpkg.totalDays }} Hari Pra-Batch
              </span>
            </div>

            <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              {{ bpkg.name }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {{ bpkg.description }}
            </p>

            <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">🤝 Pendampingan SL</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click.stop="duplicateBuddyPkg(bpkg.id)"
                  title="Duplikat Paket Buddy"
                  class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <Copy class="w-3 h-3" />
                </button>
                <button
                  v-if="buddyStore.allPackages.length > 1"
                  type="button"
                  @click.stop="confirmDeleteBuddyPkg(bpkg)"
                  title="Hapus Paket Buddy"
                  class="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sisi Kanan: Detail Modul & Butir Misi SOP Buddy -->
      <div class="lg:col-span-8">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                  {{ activeBuddyPkg?.code }}
                </span>
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ activeBuddyPkg?.name }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ activeBuddyPkg?.description }}
              </p>
            </div>
            
            <button
              type="button"
              @click="openAddBuddyMissionModal()"
              class="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Butir SOP</span>
            </button>
          </div>

          <!-- 3-Day Modules List with Interactive CRUD on each Day -->
          <div class="space-y-4">
            <div
              v-for="bday in activeBuddyPkg?.days"
              :key="bday.dayNumber"
              class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-purple-700 dark:text-purple-300">
                    HARI {{ bday.dayNumber }} (H-{{ bday.offsetDays }})
                  </span>
                  <span class="text-xs font-bold text-slate-900 dark:text-white">
                    — {{ bday.title }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Fokus: {{ bday.focus }}
                  </span>
                  <button
                    type="button"
                    @click="openAddBuddyMissionModal(bday.dayNumber)"
                    class="text-[11px] text-purple-600 hover:underline font-bold cursor-pointer"
                  >
                    + Butir SOP
                  </button>
                </div>
              </div>

              <!-- Missions in Day -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div
                  v-for="bm in bday.missions"
                  :key="bm.id"
                  class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2 relative group"
                >
                  <div class="flex items-start justify-between gap-2">
                    <h5 class="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {{ bm.title }}
                    </h5>
                    <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        type="button"
                        @click="openEditBuddyMissionModal(bday.dayNumber, bm)"
                        class="p-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                        title="Edit Butir"
                      >
                        <Settings class="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        @click="removeBuddyMission(bday.dayNumber, bm.id)"
                        class="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Hapus Butir"
                      >
                        <Trash2 class="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {{ bm.description }}
                  </p>

                  <div class="pt-1 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
                    <span class="text-[9px] font-bold text-slate-400 uppercase">Checklist SOP:</span>
                    <ul class="text-[10px] text-slate-600 dark:text-slate-400 list-disc list-inside space-y-0.5">
                      <li v-for="(chk, chkIdx) in bm.checklist" :key="chkIdx">
                        {{ chk }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div
                v-if="bday.missions.length === 0"
                class="py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-700 rounded-xl"
              >
                Belum ada butir SOP di Hari {{ bday.dayNumber }}. Klik "+ Butir SOP" untuk menambahkan.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2-Column Workspace for FEEDBACK & RAPOR TEMPLATES -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Sisi Kiri: Selector Sub-Kategori Feedback & Rapor -->
      <div class="lg:col-span-4 space-y-3">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Kategori Dokumen Evaluasi
        </h3>

        <div class="space-y-2">
          <!-- Card 1: Rapor New Hire 7 Kompetensi -->
          <div
            @click="activeFeedbackSubTab = 'RAPOR'"
            class="p-4 rounded-2xl border transition-all cursor-pointer relative"
            :class="[
              activeFeedbackSubTab === 'RAPOR'
                ? 'border-blue-600 bg-white dark:bg-slate-900 ring-2 ring-blue-600/40 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
            ]"
          >
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                RAPOR-07-SOP
              </span>
              <span class="text-[10px] text-slate-400 font-semibold">
                7 Pilar Kompetensi
              </span>
            </div>

            <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              Rapor New Hire Re.juve (Store Leader)
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Evaluasi 7 kompetensi inti: Product Knowledge, Service, Sales, Kasir, Store Ops, Food Safety & Attitude.
            </p>
          </div>

          <!-- Card 2: Survei Pengalaman Onboarding 1 Bulan -->
          <div
            @click="activeFeedbackSubTab = 'SURVEY'"
            class="p-4 rounded-2xl border transition-all cursor-pointer relative"
            :class="[
              activeFeedbackSubTab === 'SURVEY'
                ? 'border-blue-600 bg-white dark:bg-slate-900 ring-2 ring-blue-600/40 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
            ]"
          >
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                SURVEY-16-MS
              </span>
              <span class="text-[10px] text-slate-400 font-semibold">
                17 Butir Pertanyaan
              </span>
            </div>

            <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              Survei Onboarding & Buddy (Kru Baru)
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              Survei kepuasan 360° pengalaman onboarding 1 bulan (16 rating skala 0–10 + 1 masukan esai).
            </p>
          </div>
        </div>
      </div>

      <!-- Sisi Kanan: Detail & Pengaturan Template Feedback / Rapor -->
      <div class="lg:col-span-8">
        
        <!-- SUB-TAB 1: RAPOR NEW HIRE 7 KOMPETENSI -->
        <div v-if="activeFeedbackSubTab === 'RAPOR'" class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                  RAPOR NEW HIRE RE.JUVE
                </span>
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  Format Standar Penilaian Store Leader
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ feedbackStore.raporTemplate.specialNotice }}
              </p>
            </div>
          </div>

          <!-- 7 Competencies List -->
          <div class="space-y-4">
            <div
              v-for="(comp, cIdx) in feedbackStore.raporCompetencies"
              :key="comp.id"
              class="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-blue-700 dark:text-blue-300">
                    {{ cIdx + 1 }}. {{ comp.name }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-semibold">
                    ({{ comp.indicators.length }} Indikator)
                  </span>
                </div>
                <button
                  type="button"
                  @click="openAddRaporIndicatorModal(comp.id)"
                  class="text-[11px] text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  + Tambah Indikator
                </button>
              </div>

              <!-- Indicators Table -->
              <div class="space-y-1.5">
                <div
                  v-for="ind in comp.indicators"
                  :key="ind.id"
                  class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-xs flex items-center justify-between gap-3 group"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-slate-400 font-bold">•</span>
                    <span class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {{ ind.text }}
                    </span>
                    <span
                      v-if="ind.isMandatoryIntro"
                      class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex-shrink-0"
                    >
                      * Wajib Pembekalan
                    </span>
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="text-[10px] text-slate-400 font-medium hidden sm:inline">
                      [Belum Menguasai / Butuh Pendampingan / Kompeten]
                    </span>
                    <button
                      type="button"
                      @click="deleteRaporIndicator(comp.id, ind.id)"
                      class="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Hapus Indikator"
                    >
                      <Trash2 class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SUB-TAB 2: SURVEI PENGALAMAN ONBOARDING & BUDDY (MICROSOFT FORMS FORMAT) -->
        <div v-else class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                  SURVEI ONBOARDING 1 BULAN
                </span>
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  Kuesioner Evaluasi Kru Baru
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                16 Butir Skala Likert (0–10: Sangat Tidak Setuju s/d Sangat Setuju) + 1 Pertanyaan Refleksi Esai.
              </p>
            </div>

            <button
              type="button"
              @click="openAddSurveyQuestionModal"
              class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Pertanyaan</span>
            </button>
          </div>

          <!-- Questions List -->
          <div class="space-y-2.5">
            <div
              v-for="q in feedbackStore.surveyQuestions"
              :key="q.id"
              class="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70 flex items-start justify-between gap-3 group"
            >
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-bold text-blue-600 dark:text-blue-400">
                    No. {{ q.number }}
                  </span>
                  <span class="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {{ q.category }}
                  </span>
                  <span class="text-[10px] font-semibold text-slate-400">
                    {{ q.type === 'SCALE_0_10' ? 'Rating Skala 0–10' : 'Input Esai Deskriptif' }}
                  </span>
                </div>

                <p class="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {{ q.text }}
                </p>
              </div>

              <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 flex-shrink-0">
                <button
                  type="button"
                  @click="openEditSurveyQuestionModal(q)"
                  class="p-1.5 text-slate-400 hover:text-blue-600 cursor-pointer"
                  title="Edit Pertanyaan"
                >
                  <Settings class="w-3.5 h-3.5" />
                </button>
                <button
                  v-if="feedbackStore.surveyQuestions.length > 1"
                  type="button"
                  @click="deleteSurveyQuestion(q.id)"
                  class="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Hapus Pertanyaan"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL 1: BUAT MASTER PAKET BARU -->
    <BaseModal
      :modelValue="showCreatePackageModal"
      title="Buat Master Paket Baru"
      subtitle="Definisikan nama, jumlah minggu, dan format gerai untuk paket template ini"
      max-width="sm"
      @update:modelValue="showCreatePackageModal = $event"
      @close="showCreatePackageModal = false"
    >
      <form @submit.prevent="executeCreatePackage" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Paket *</label>
          <input
            v-model="newPkgForm.name"
            type="text"
            required
            placeholder="Contoh: Standar Gerai Bandara & Kiosk"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Format Gerai</label>
            <input
              v-model="newPkgForm.targetType"
              type="text"
              placeholder="Kiosk / Mall / Standalone"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Minggu (Week)</label>
            <input
              v-model.number="newPkgForm.totalWeeks"
              type="number"
              min="1"
              max="12"
              required
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
          <input
            v-model="newPkgForm.category"
            type="text"
            placeholder="Standar Operasional / Onboarding"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Paket</label>
          <textarea
            v-model="newPkgForm.description"
            rows="2"
            placeholder="Penjelasan ringkas fokus kurikulum paket..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showCreatePackageModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan Paket
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 2: TAMBAH BUTIR SOP MISI BARU -->
    <BaseModal
      :modelValue="showAddMissionModal"
      title="Tambah Butir SOP Misi"
      :subtitle="`Tambahkan misi standar baru ke paket ${activePackage?.name}`"
      max-width="md"
      @update:modelValue="showAddMissionModal = $event"
      @close="showAddMissionModal = false"
    >
      <form @submit.prevent="executeAddMission" class="space-y-3 py-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Minggu (Week) *
            </label>
            <select
              v-model="newMissionForm.week"
              required
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
            >
              <option
                v-for="w in activePackageWeeks"
                :key="w.weekNumber"
                :value="w.weekNumber"
              >
                Week {{ w.weekNumber }} — {{ w.title }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Misi</label>
            <input
              v-model="newMissionForm.category"
              type="text"
              required
              placeholder="Contoh: Suhu Dingin, Kebersihan, Pelayanan"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Misi SOP *</label>
          <input
            v-model="newMissionForm.title"
            type="text"
            required
            placeholder="Contoh: Cek Kalibrasi Sensorik Rasa Jus"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi & Tujuan Misi</label>
          <textarea
            v-model="newMissionForm.description"
            rows="2"
            placeholder="Instruksi singkat bagi kru dalam menjalankan SOP ini..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Daftar Checklist / Poin SOP (1 baris per poin)
          </label>
          <textarea
            v-model="newMissionForm.requirementsText"
            rows="3"
            placeholder="Cek temperatur chiller di 2-4°C&#10;Catat di logbook fisik dan submit foto"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showAddMissionModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan Misi
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 3: TERAPKAN PAKET KE GERAI / BATCH -->
    <BaseModal
      :modelValue="showApplyModal"
      title="Terapkan Paket Template ke Gerai / Batch"
      :subtitle="`Menerapkan seluruh butir misi dari ${activePackage?.name} ke Batch gerai aktif`"
      max-width="sm"
      @update:modelValue="showApplyModal = $event"
      @close="showApplyModal = false"
    >
      <form @submit.prevent="executeApplyPackage" class="space-y-4 py-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Pilih Target Batch Gerai *
          </label>
          <select
            v-model="targetBatchId"
            required
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
              {{ b.name }} — {{ b.storeLocation }}
            </option>
          </select>
        </div>

        <p class="text-[11px] text-slate-500">
          Seluruh {{ activePackage?.templates.length }} butir misi SOP dan {{ activePackageWeeks.length }} tema mingguan akan otomatis diterapkan untuk batch yang dipilih.
        </p>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showApplyModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Terapkan Sekarang
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 4: BUAT PAKET BUDDY BARU (CRUD) -->
    <BaseModal
      :modelValue="showCreateBuddyPackageModal"
      title="Buat Paket Template Buddy Baru"
      subtitle="Definisikan kurikulum orientasi & pendampingan Store Leader pra-batch"
      max-width="sm"
      @update:modelValue="showCreateBuddyPackageModal = $event"
      @close="showCreateBuddyPackageModal = false"
    >
      <form @submit.prevent="executeCreateBuddyPackage" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Paket Buddy *</label>
          <input
            v-model="newBuddyPkgForm.name"
            type="text"
            required
            placeholder="Contoh: Paket Buddy Gerai Bandara (3 Hari)"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Paket</label>
            <input
              v-model="newBuddyPkgForm.code"
              type="text"
              placeholder="BUDDY-03"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Hari Pra-Batch</label>
            <select
              v-model.number="newBuddyPkgForm.totalDays"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 cursor-pointer font-bold"
            >
              <option :value="2">2 Hari (H-2 s/d H-1)</option>
              <option :value="3">3 Hari (H-3 s/d H-1)</option>
              <option :value="4">4 Hari (H-4 s/d H-1)</option>
              <option :value="5">5 Hari (H-5 s/d H-1)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Paket</label>
          <textarea
            v-model="newBuddyPkgForm.description"
            rows="2"
            placeholder="Penjelasan ringkas fokus pendampingan Store Leader..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 resize-none"
          ></textarea>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showCreateBuddyPackageModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            Simpan Paket Buddy
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 5: TAMBAH / EDIT BUTIR SOP BUDDY (CRUD) -->
    <BaseModal
      :modelValue="showAddBuddyMissionModal"
      :title="isEditingBuddyMission ? 'Edit Butir SOP Buddy' : 'Tambah Butir SOP Buddy'"
      :subtitle="`Paket ${activeBuddyPkg?.name} — Hari ${newBuddyMissionForm.dayNumber}`"
      max-width="md"
      @update:modelValue="showAddBuddyMissionModal = $event"
      @close="showAddBuddyMissionModal = false"
    >
      <form @submit.prevent="executeSaveBuddyMission" class="space-y-3 py-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Pilih Hari Pendampingan *
            </label>
            <select
              v-model="newBuddyMissionForm.dayNumber"
              required
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 cursor-pointer font-bold"
            >
              <option
                v-for="bday in activeBuddyPkg?.days"
                :key="bday.dayNumber"
                :value="bday.dayNumber"
              >
                Hari {{ bday.dayNumber }} (H-{{ bday.offsetDays }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Butir SOP *</label>
            <input
              v-model="newBuddyMissionForm.title"
              type="text"
              required
              placeholder="Contoh: Edukasi Filosofi #CleanLabel"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi / Instruksi Observasi</label>
          <textarea
            v-model="newBuddyMissionForm.description"
            rows="2"
            placeholder="Panduan bagi Store Leader dalam menilai kesiapan kru..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 resize-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Daftar Checklist Observasi (1 baris per poin)
          </label>
          <textarea
            v-model="newBuddyMissionForm.requirementsText"
            rows="3"
            placeholder="Memahami standar seragam dan hairnet&#10;Mampu menjelaskan konsep #CleanLabel tanpa air gula"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 resize-none"
          ></textarea>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showAddBuddyMissionModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
          >
            {{ isEditingBuddyMission ? 'Simpan Perubahan' : 'Tambah Butir SOP' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 6: TAMBAH / EDIT PERTANYAAN SURVEI (FEEDBACK) -->
    <BaseModal
      :modelValue="showAddSurveyQuestionModal"
      :title="isEditingSurveyQuestion ? 'Edit Pertanyaan Survei' : 'Tambah Pertanyaan Survei Baru'"
      subtitle="Kuesioner evaluasi pengalaman onboarding & pendampingan kru baru"
      max-width="md"
      @update:modelValue="showAddSurveyQuestionModal = $event"
      @close="showAddSurveyQuestionModal = false"
    >
      <form @submit.prevent="executeSaveSurveyQuestion" class="space-y-3 py-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Pertanyaan *</label>
            <input
              v-model="surveyQuestionForm.category"
              type="text"
              required
              placeholder="Contoh: Peran Buddy, Teamwork, Budaya"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Input Jawaban</label>
            <select
              v-model="surveyQuestionForm.type"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 cursor-pointer font-bold"
            >
              <option value="SCALE_0_10">Rating Skala 0 s/d 10</option>
              <option value="ESSAY">Input Esai Deskriptif</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Teks Pertanyaan Kuesioner *</label>
          <textarea
            v-model="surveyQuestionForm.text"
            rows="3"
            required
            placeholder="Tuliskan butir pernyataan kuesioner..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 resize-none"
          ></textarea>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showAddSurveyQuestionModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            {{ isEditingSurveyQuestion ? 'Simpan Perubahan' : 'Tambah Pertanyaan' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 7: TAMBAH INDIKATOR RAPOR NEW HIRE -->
    <BaseModal
      :modelValue="showAddRaporIndModal"
      title="Tambah Indikator Rapor New Hire"
      subtitle="Tambahkan butir kompetensi standar operasional Re.juve"
      max-width="sm"
      @update:modelValue="showAddRaporIndModal = $event"
      @close="showAddRaporIndModal = false"
    >
      <form @submit.prevent="executeSaveRaporIndicator" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Butir Indikator Penilaian *</label>
          <textarea
            v-model="raporIndForm.text"
            rows="2"
            required
            placeholder="Contoh: Menjelaskan batas toleransi suhu chiller 2-4°C"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 resize-none"
          ></textarea>
        </div>

        <div class="flex items-center gap-2 pt-1">
          <input
            id="chkMandatory"
            v-model="raporIndForm.isMandatoryIntro"
            type="checkbox"
            class="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label for="chkMandatory" class="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            Poin Bertanda Bintang (*) Wajib Pembekalan
          </label>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showAddRaporIndModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
          >
            Simpan Indikator
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent
} from 'reka-ui'
import { useBatchStore } from '~/stores/batch.js'
import { useTemplateStore } from '~/stores/template.js'
import { useBuddyStore } from '~/stores/buddy.js'
import { useFeedbackStore } from '~/stores/feedback.js'
import { useToast } from '~/composables/useToast.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  Sparkles,
  Check,
  Plus,
  Copy,
  Trash2,
  Bookmark,
  Layers,
  Handshake,
  Settings,
  MessageSquareText
} from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const templateStore = useTemplateStore()
const buddyStore = useBuddyStore()
const feedbackStore = useFeedbackStore()
const toast = useToast()

const activeCatalogCategory = ref('BATCH') // 'BATCH' | 'BUDDY' | 'FEEDBACK'
const activeFeedbackSubTab = ref('RAPOR') // 'RAPOR' | 'SURVEY'

const selectedBuddyPkgId = ref(buddyStore.defaultPackage?.id || 'pkg-buddy-standard')

const activeBuddyPkg = computed(() => {
  return buddyStore.packageById(selectedBuddyPkgId.value) || buddyStore.defaultPackage
})

const activeWeekTab = ref(1)
const currentWeekTitle = ref('')
const showApplyModal = ref(false)
const showCreatePackageModal = ref(false)
const showAddMissionModal = ref(false)

// Buddy Template Modals
const showCreateBuddyPackageModal = ref(false)
const showAddBuddyMissionModal = ref(false)
const isEditingBuddyMission = ref(false)
const editingBuddyMissionId = ref('')

// Feedback & Rapor Modals
const showAddSurveyQuestionModal = ref(false)
const isEditingSurveyQuestion = ref(false)
const editingSurveyQuestionId = ref('')
const surveyQuestionForm = ref({
  category: 'Peran Buddy',
  type: 'SCALE_0_10',
  text: ''
})

const showAddRaporIndModal = ref(false)
const selectedCompIdForNewInd = ref('')
const raporIndForm = ref({
  text: '',
  isMandatoryIntro: false
})

const targetBatchId = ref(batchStore.selectedBatchId || 'batch-alpha')

const activePackage = computed(() => templateStore.currentPackage)

const activePackageWeeks = computed(() => {
  return templateStore.packageWeeks(activePackage.value?.id)
})

// Sync week title when activeWeekTab or activePackage changes
const syncWeekTitle = () => {
  const currentWeekObj = activePackageWeeks.value.find(w => w.weekNumber === Number(activeWeekTab.value))
  currentWeekTitle.value = currentWeekObj ? currentWeekObj.title : `Minggu ${activeWeekTab.value}: Tema SOP`
}

watch([activeWeekTab, activePackage], () => {
  syncWeekTitle()
}, { immediate: true })

const selectPackageTab = (pkgId) => {
  templateStore.selectPackage(pkgId)
  activeWeekTab.value = 1
  syncWeekTitle()
}

const saveCurrentWeekTitle = () => {
  if (!currentWeekTitle.value.trim() || !activePackage.value) return
  templateStore.updateWeekTitle(activePackage.value.id, activeWeekTab.value, currentWeekTitle.value.trim())
  toast.success('Judul Week Disimpan', `Judul Week ${activeWeekTab.value} berhasil diperbarui.`)
}

const handleAddNewWeek = () => {
  if (!activePackage.value) return
  const created = templateStore.addWeekToPackage(activePackage.value.id)
  if (created) {
    activeWeekTab.value = created.weekNumber
    syncWeekTitle()
    toast.success('Week Ditambahkan', `Week ${created.weekNumber} siap ditambahkan butir SOP.`)
  }
}

const handleRemoveCurrentWeek = () => {
  if (!activePackage.value) return
  if (confirm(`Hapus Week ${activeWeekTab.value} beserta seluruh misi di dalamnya?`)) {
    const success = templateStore.removeWeekFromPackage(activePackage.value.id, activeWeekTab.value)
    if (success) {
      activeWeekTab.value = 1
      syncWeekTitle()
      toast.info('Week Dihapus', 'Minggu beserta seluruh butir SOP di dalamnya telah dihapus.')
    }
  }
}

// Package Creation Form
const newPkgForm = ref({
  name: '',
  category: 'Standar Operasional',
  targetType: 'Gerai Flagship',
  totalWeeks: 3,
  description: ''
})

// Mission Template Creation Form
const newMissionForm = ref({
  week: 1,
  title: '',
  category: 'Quality Control',
  description: '',
  requirementsText: ''
})

// Buddy Template Forms
const newBuddyPkgForm = ref({
  name: '',
  code: '',
  totalDays: 3,
  description: ''
})

const newBuddyMissionForm = ref({
  dayNumber: 1,
  title: '',
  description: '',
  requirementsText: ''
})

const openCreatePackageModal = () => {
  newPkgForm.value = {
    name: '',
    category: 'Standar Operasional',
    targetType: 'Gerai Flagship',
    totalWeeks: 3,
    description: ''
  }
  showCreatePackageModal.value = true
}

const executeCreatePackage = () => {
  const created = templateStore.createPackage({
    ...newPkgForm.value,
    code: `PKG-0${templateStore.allPackages.length + 1}`
  })
  showCreatePackageModal.value = false
  activeWeekTab.value = 1
  syncWeekTitle()
  toast.success('Paket Dibuat', `Paket "${created.name}" dengan ${created.totalWeeks} minggu siap digunakan.`)
}

const duplicatePackage = (pkgId) => {
  const dup = templateStore.duplicatePackage(pkgId)
  if (dup) {
    toast.success('Paket Diduplikasi', `Salinan "${dup.name}" berhasil dibuat.`)
  }
}

const confirmDeletePackage = (pkg) => {
  if (confirm(`Hapus paket master "${pkg.name}"?`)) {
    templateStore.deletePackage(pkg.id)
    toast.info('Paket Dihapus', `Paket "${pkg.name}" telah dihapus.`)
  }
}

const openAddMissionModal = () => {
  newMissionForm.value = {
    week: activeWeekTab.value,
    title: '',
    category: 'Standar Operasional',
    description: '',
    requirementsText: ''
  }
  showAddMissionModal.value = true
}

const executeAddMission = () => {
  const reqs = newMissionForm.value.requirementsText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  templateStore.addMissionToPackage(activePackage.value.id, {
    ...newMissionForm.value,
    codePrefix: `M-0${(activePackage.value?.templates.length || 0) + 1}`,
    requirements: reqs.length > 0 ? reqs : ['Pemeriksaan kepatuhan standar SOP Re.juve']
  })

  showAddMissionModal.value = false
  toast.success('Butir SOP Ditambahkan', `Misi "${newMissionForm.value.title}" ditambahkan ke Week ${newMissionForm.value.week}.`)
}

const removeMission = (tmplId) => {
  if (confirm('Hapus butir SOP ini?')) {
    templateStore.removeMissionFromPackage(activePackage.value.id, tmplId)
    toast.info('Butir SOP Dihapus', 'Misi telah dihapus dari paket.')
  }
}

const openApplyPackageModal = () => {
  showApplyModal.value = true
}

const executeApplyPackage = () => {
  const created = templateStore.applyPackageToBatch(targetBatchId.value, activePackage.value.id)
  showApplyModal.value = false
  const targetBatch = batchStore.batchById(targetBatchId.value)
  toast.success(
    'Paket SOP Diterapkan!',
    `${created.length} Misi dari "${activePackage.value?.name}" aktif untuk ${targetBatch?.name || 'Batch'}.`
  )
  router.push('/admin/missions')
}

// ==========================================
// BUDDY TEMPLATE CRUD HANDLERS
// ==========================================
const openCreateBuddyPackageModal = () => {
  newBuddyPkgForm.value = {
    name: '',
    code: `BUDDY-${String(buddyStore.allPackages.length + 1).padStart(2, '0')}`,
    totalDays: 3,
    description: ''
  }
  showCreateBuddyPackageModal.value = true
}

const executeCreateBuddyPackage = () => {
  const created = buddyStore.createBuddyPackage(newBuddyPkgForm.value)
  showCreateBuddyPackageModal.value = false
  selectedBuddyPkgId.value = created.id
  toast.success('Paket Buddy Dibuat', `Paket "${created.name}" (${created.totalDays} Hari Pra-Batch) siap digunakan.`)
}

const duplicateBuddyPkg = (pkgId) => {
  const dup = buddyStore.duplicateBuddyPackage(pkgId)
  if (dup) {
    selectedBuddyPkgId.value = dup.id
    toast.success('Paket Buddy Diduplikasi', `Salinan "${dup.name}" berhasil dibuat.`)
  }
}

const confirmDeleteBuddyPkg = (bpkg) => {
  if (confirm(`Hapus paket template Buddy "${bpkg.name}"?`)) {
    buddyStore.deleteBuddyPackage(bpkg.id)
    selectedBuddyPkgId.value = buddyStore.defaultPackage?.id || ''
    toast.info('Paket Buddy Dihapus', `Paket "${bpkg.name}" telah dihapus.`)
  }
}

const openAddBuddyMissionModal = (dayNum = 1) => {
  isEditingBuddyMission.value = false
  editingBuddyMissionId.value = ''
  newBuddyMissionForm.value = {
    dayNumber: dayNum,
    title: '',
    description: '',
    requirementsText: ''
  }
  showAddBuddyMissionModal.value = true
}

const openEditBuddyMissionModal = (dayNum, mission) => {
  isEditingBuddyMission.value = true
  editingBuddyMissionId.value = mission.id
  newBuddyMissionForm.value = {
    dayNumber: dayNum,
    title: mission.title,
    description: mission.description,
    requirementsText: (mission.checklist || []).join('\n')
  }
  showAddBuddyMissionModal.value = true
}

const executeSaveBuddyMission = () => {
  if (!activeBuddyPkg.value) return
  const checkList = newBuddyMissionForm.value.requirementsText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  if (isEditingBuddyMission.value) {
    buddyStore.updateMissionInBuddyDay(
      activeBuddyPkg.value.id,
      newBuddyMissionForm.value.dayNumber,
      editingBuddyMissionId.value,
      {
        title: newBuddyMissionForm.value.title,
        description: newBuddyMissionForm.value.description,
        checklist: checkList.length > 0 ? checkList : ['Pemeriksaan kesiapan dasar kru']
      }
    )
    toast.success('Butir SOP Buddy Diperbarui', `Perubahan butir SOP "${newBuddyMissionForm.value.title}" tersimpan.`)
  } else {
    buddyStore.addMissionToBuddyDay(
      activeBuddyPkg.value.id,
      newBuddyMissionForm.value.dayNumber,
      {
        title: newBuddyMissionForm.value.title,
        description: newBuddyMissionForm.value.description,
        checklist: checkList.length > 0 ? checkList : ['Pemeriksaan kesiapan dasar kru']
      }
    )
    toast.success('Butir SOP Buddy Ditambahkan', `Butir "${newBuddyMissionForm.value.title}" ditambahkan ke Hari ${newBuddyMissionForm.value.dayNumber}.`)
  }

  showAddBuddyMissionModal.value = false
}

const removeBuddyMission = (dayNum, missionId) => {
  if (!activeBuddyPkg.value) return
  if (confirm('Hapus butir SOP Buddy ini?')) {
    buddyStore.removeMissionFromBuddyDay(activeBuddyPkg.value.id, dayNum, missionId)
    toast.info('Butir SOP Buddy Dihapus', 'Butir telah dihapus dari paket.')
  }
}

// ==========================================
// FEEDBACK & RAPOR TEMPLATE HANDLERS
// ==========================================
const openAddSurveyQuestionModal = () => {
  isEditingSurveyQuestion.value = false
  editingSurveyQuestionId.value = ''
  surveyQuestionForm.value = {
    category: 'Peran Buddy',
    type: 'SCALE_0_10',
    text: ''
  }
  showAddSurveyQuestionModal.value = true
}

const openEditSurveyQuestionModal = (q) => {
  isEditingSurveyQuestion.value = true
  editingSurveyQuestionId.value = q.id
  surveyQuestionForm.value = {
    category: q.category,
    type: q.type,
    text: q.text
  }
  showAddSurveyQuestionModal.value = true
}

const executeSaveSurveyQuestion = () => {
  if (isEditingSurveyQuestion.value) {
    feedbackStore.updateSurveyQuestion(editingSurveyQuestionId.value, surveyQuestionForm.value)
    toast.success('Pertanyaan Diperbarui', 'Perubahan butir survei berhasil disimpan.')
  } else {
    feedbackStore.addSurveyQuestion(surveyQuestionForm.value)
    toast.success('Pertanyaan Ditambahkan', 'Butir pertanyaan baru berhasil ditambahkan ke survei.')
  }
  showAddSurveyQuestionModal.value = false
}

const deleteSurveyQuestion = (id) => {
  if (confirm('Hapus butir pertanyaan survei ini?')) {
    feedbackStore.deleteSurveyQuestion(id)
    toast.info('Pertanyaan Dihapus', 'Butir pertanyaan telah dihapus dari survei.')
  }
}

const openAddRaporIndicatorModal = (compId) => {
  selectedCompIdForNewInd.value = compId
  raporIndForm.value = {
    text: '',
    isMandatoryIntro: false
  }
  showAddRaporIndModal.value = true
}

const executeSaveRaporIndicator = () => {
  if (!selectedCompIdForNewInd.value || !raporIndForm.value.text.trim()) return
  feedbackStore.addRaporIndicator(selectedCompIdForNewInd.value, raporIndForm.value)
  showAddRaporIndModal.value = false
  toast.success('Indikator Ditambahkan', 'Indikator kompetensi berhasil ditambahkan ke Rapor New Hire.')
}

const deleteRaporIndicator = (compId, indId) => {
  if (confirm('Hapus indikator kompetensi ini?')) {
    feedbackStore.deleteRaporIndicator(compId, indId)
    toast.info('Indikator Dihapus', 'Indikator telah dihapus dari Rapor.')
  }
}
</script>
