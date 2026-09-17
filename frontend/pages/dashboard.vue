<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- ==================== 1. TOP HERO BANNER (RE.JUVE CAPTAIN / LEADER DASHBOARD) ==================== -->
    <div class="relative rounded-3xl overflow-hidden border border-amber-900/30 shadow-2xl bg-slate-950 text-white min-h-[220px] sm:min-h-[240px] flex flex-col justify-between p-6 sm:p-8">
      <!-- Adventure Sunset Landscape Background Image with Warm Overlay -->
      <div class="absolute inset-0 z-0">
        <img
          src="/images/adventure_bg_main.jpg"
          alt="Adventure Landscape"
          class="w-full h-full object-cover object-center opacity-40 scale-105 transform transition-transform duration-1000 ease-out"
        />
        <!-- Multi-layer Gradient for Rich Cinematic Contrast & Text Readability -->
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/85 to-amber-950/60"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
        <!-- Ambient Sun Flare Glow -->
        <div class="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <!-- Hero Header Row: Subtitle, Slogan Script, and Batch Selector -->
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-black tracking-wider uppercase text-amber-400">
              Re.juve {{ userStore.isCrew ? 'Specialist' : 'Captain' }}
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10 uppercase tracking-widest">
              {{ userStore.isCrew ? 'Crew Journey' : (userStore.isDistrictManager ? 'District Manager Dashboard' : 'Leader Dashboard') }}
            </span>
          </div>
        </div>

        <!-- Center Script Quote (Desktop) -->
        <div class="hidden lg:block text-center">
          <span class="font-serif italic text-amber-200/90 text-sm sm:text-base tracking-wide font-medium">
            "Different People, Same Purpose."
          </span>
        </div>

        <!-- Top Right Batch Indicator & Selector -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-xs font-semibold text-amber-300 border border-amber-500/30 shadow-inner">
            <Calendar class="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <select
              v-if="batchStore.accessibleBatches && batchStore.accessibleBatches.length > 1"
              v-model="batchStore.selectedBatchId"
              @change="onBatchChange"
              class="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer text-xs border-0 pr-2 max-w-[180px] sm:max-w-[240px] truncate"
            >
              <option
                v-for="b in batchStore.accessibleBatches"
                :key="b.id"
                :value="b.id"
                class="bg-slate-900 text-white"
              >
                {{ b.name || b.code || 'Batch' }}
              </option>
            </select>
            <span v-else class="truncate max-w-[150px] sm:max-w-[200px]">{{ currentBatchDisplayName }}</span>
            <span class="text-slate-500">•</span>
            <span class="text-slate-300 font-mono">{{ batchStore.currentBatchUnitCode || 'Week' }} {{ batchStore.selectedWeek || 1 }}</span>
          </div>
        </div>
      </div>

      <!-- Hero Greeting Row & Motivational Mantra -->
      <div class="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div class="max-w-2xl">
          <h2 class="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>👋 {{ greetingText }}, {{ (userStore.currentUser?.name || 'Captain').split(' ')[0] }}!</span>
          </h2>
          <p class="text-slate-300 text-xs sm:text-sm mt-1.5 leading-relaxed font-normal">
            <span v-if="userStore.isCrew">
              Selamat berpetualang! Selesaikan misi <strong class="text-amber-300 font-bold">{{ batchStore.currentBatchUnitCode || 'Week' }} {{ batchStore.selectedWeek || 1 }}</strong> dan raih bintang prestasi terbaik untuk gerai Anda.
            </span>
            <span v-else>
              Terima kasih sudah mendukung dan membimbing perjalanan New Hires di tim dan wilayah gerai kamu.
            </span>
          </p>
        </div>

        <!-- Right Vertical Slogan Badge -->
        <div class="hidden md:flex flex-col items-end text-right border-l border-white/10 pl-6 text-[11px] font-bold text-slate-300/80 uppercase tracking-widest leading-relaxed">
          <span class="text-amber-400">Guide</span>
          <span class="text-emerald-400">Support</span>
          <span class="text-sky-400">Empower</span>
          <span class="text-rose-400">Grow Together</span>
        </div>
      </div>
    </div>

    <!-- ==================== 2. PIPELINE / STAGE METRIC CARDS (6 CARDS ROW) ==================== -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      <!-- 1. ACTIVE NEW HIRES -->
      <div
        @click="selectedStageFilter = 'ALL'"
        class="rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group border"
        :class="selectedStageFilter === 'ALL'
          ? 'bg-[#153424] text-white border-emerald-500/60 ring-2 ring-emerald-500/40'
          : 'bg-[#153424]/90 hover:bg-[#153424] text-white border-emerald-800/40'"
      >
        <div class="flex items-center justify-between text-emerald-300 mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider">Active New Hires</span>
          <Users class="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
        </div>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ activeRecruitsCount }}
          </span>
          <ChevronRight class="w-4 h-4 text-emerald-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p class="text-[10px] text-emerald-200/70 mt-1 truncate">
          Currently in onboarding
        </p>
      </div>

      <!-- 2. CAPTAIN PHASE / BUDDY PRE-BATCH -->
      <div
        @click="selectedStageFilter = 'BUDDY'"
        class="rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group border"
        :class="selectedStageFilter === 'BUDDY'
          ? 'bg-[#3b271a] text-white border-amber-500/60 ring-2 ring-amber-500/40'
          : 'bg-[#3b271a]/90 hover:bg-[#3b271a] text-white border-amber-800/40'"
      >
        <div class="flex items-center justify-between text-amber-300 mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider">Captain Phase</span>
          <Handshake class="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
        </div>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ buddyRecruitsCount }}
          </span>
          <ChevronRight class="w-4 h-4 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p class="text-[10px] text-amber-200/70 mt-1 truncate">
          First 3 Days (Buddy)
        </p>
      </div>

      <!-- 3. WEEK 1 -->
      <div
        @click="selectedStageFilter = 'STAGE_1'"
        class="rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group border"
        :class="selectedStageFilter === 'STAGE_1'
          ? 'bg-[#183626] text-white border-teal-500/60 ring-2 ring-teal-500/40'
          : 'bg-[#183626]/90 hover:bg-[#183626] text-white border-teal-800/40'"
      >
        <div class="flex items-center justify-between text-teal-300 mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider">Week 1</span>
          <Tent class="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
        </div>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ getRecruitCountByStage('STAGE_1') }}
          </span>
          <ChevronRight class="w-4 h-4 text-teal-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p class="text-[10px] text-teal-200/70 mt-1 truncate">
          Mission in Progress
        </p>
      </div>

      <!-- 4. WEEK 2 -->
      <div
        @click="selectedStageFilter = 'STAGE_2'"
        class="rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group border"
        :class="selectedStageFilter === 'STAGE_2'
          ? 'bg-[#162e42] text-white border-sky-500/60 ring-2 ring-sky-500/40'
          : 'bg-[#162e42]/90 hover:bg-[#162e42] text-white border-sky-800/40'"
      >
        <div class="flex items-center justify-between text-sky-300 mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider">Week 2</span>
          <Waves class="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
        </div>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ getRecruitCountByStage('STAGE_2') }}
          </span>
          <ChevronRight class="w-4 h-4 text-sky-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p class="text-[10px] text-sky-200/70 mt-1 truncate">
          Mission in Progress
        </p>
      </div>

      <!-- 5. WEEK 3 -->
      <div
        @click="selectedStageFilter = 'STAGE_3'"
        class="rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group border"
        :class="selectedStageFilter === 'STAGE_3'
          ? 'bg-[#402117] text-white border-orange-500/60 ring-2 ring-orange-500/40'
          : 'bg-[#402117]/90 hover:bg-[#402117] text-white border-orange-800/40'"
      >
        <div class="flex items-center justify-between text-orange-300 mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider">Week 3</span>
          <Mountain class="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform" />
        </div>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ getRecruitCountByStage('STAGE_3') }}
          </span>
          <ChevronRight class="w-4 h-4 text-orange-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p class="text-[10px] text-orange-200/70 mt-1 truncate">
          Final Week
        </p>
      </div>

      <!-- 6. NEEDS REVIEW / ACTION REQUIRED -->
      <div
        @click="selectedStageFilter = 'PENDING'"
        class="rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden group border"
        :class="selectedStageFilter === 'PENDING'
          ? 'bg-[#4a1424] text-white border-rose-500/60 ring-2 ring-rose-500/40'
          : 'bg-[#4a1424]/90 hover:bg-[#4a1424] text-white border-rose-800/40'"
      >
        <div class="flex items-center justify-between text-rose-300 mb-2">
          <span class="text-[10px] font-black uppercase tracking-wider">Needs Review</span>
          <Hourglass class="w-4 h-4 opacity-80 group-hover:scale-110 transition-transform animate-pulse" />
        </div>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {{ pendingReviewCount }}
          </span>
          <ChevronRight class="w-4 h-4 text-rose-400 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
        </div>
        <p class="text-[10px] text-rose-200/70 mt-1 truncate font-semibold">
          Your Action Required
        </p>
      </div>
    </div>

    <!-- ==================== 3. MIDDLE SECTION: ACTION REQUIRED & TEAM PROGRESS ==================== -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      <!-- LEFT CARD: ACTION REQUIRED -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Bell class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Action Required
                </h3>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Beberapa hal yang perlu perhatian kamu hari ini.
                </p>
              </div>
            </div>

            <NuxtLink
              :to="userStore.isDistrictManager ? '/approvals' : '/evaluations'"
              class="text-xs font-bold text-[#831843] dark:text-[#f472b6] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>

          <!-- Action Items List -->
          <div class="space-y-3 pt-4">
            <!-- Item 1: Pending Review -->
            <NuxtLink
              :to="userStore.isDistrictManager ? '/approvals' : '/evaluations'"
              class="flex items-start gap-3.5 p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 transition-all cursor-pointer group"
            >
              <div class="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <FileText class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ pendingReviewCount }} missions waiting for review
                  </h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    Prioritas
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Mohon lakukan penilaian agar progress onboarding New Hire tetap berjalan lancar.
                </p>
              </div>
            </NuxtLink>

            <!-- Item 2: Needs Update / Inactive -->
            <div class="flex items-start gap-3.5 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Users class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ inactiveNewHiresCount }} New Hire has no mission update
                  </h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                    Perhatian
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Sudah 3 hari belum ada pembaruan aktivitas misi dari anggota tim.
                </p>
              </div>
            </div>

            <!-- Item 3: Week 3 final review -->
            <div class="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
              <div class="w-9 h-9 rounded-xl bg-slate-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Flag class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ week3AlmostCompletedCount }} Week 3 journey almost completed
                  </h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    Tahap Akhir
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Segera siapkan review rapor evaluasi akhir dan persetujuan penugasan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT CARD: TEAM PROGRESS (DONUT PROGRESS + MOTIVATIONAL QUOTE) -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Team Progress
                </h3>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Progress New Hire di area dan gerai kamu.
                </p>
              </div>
            </div>

            <NuxtLink
              to="/batches"
              class="text-xs font-bold text-[#831843] dark:text-[#f472b6] hover:underline flex items-center gap-1"
            >
              <span>View Detail</span>
              <ArrowRight class="w-3.5 h-3.5" />
            </NuxtLink>
          </div>

          <!-- Body: Donut Meter & Quote Box Side-by-side -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 items-center">
            <!-- Left: Donut Radial Meter & Status Counts -->
            <div class="flex flex-col items-center sm:items-start">
              <div class="flex items-center gap-4">
                <!-- SVG Circular Radial Donut Meter -->
                <div class="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                  <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <!-- Background Circle -->
                    <path
                      class="text-slate-100 dark:text-slate-800"
                      stroke-width="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <!-- Progress Arc -->
                    <path
                      class="text-[#10b981] transition-all duration-1000 ease-out"
                      stroke-dasharray="100, 100"
                      :stroke-dashoffset="100 - teamCompletionRate"
                      stroke-linecap="round"
                      stroke-width="3.8"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div class="absolute flex flex-col items-center justify-center text-center">
                    <span class="text-xl font-black text-slate-900 dark:text-white leading-none">
                      {{ teamCompletionRate }}%
                    </span>
                    <span class="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Rate</span>
                  </div>
                </div>

                <!-- Rate Subtext -->
                <div>
                  <p class="text-xs font-black text-slate-900 dark:text-white">
                    {{ teamCompletionRate }}%
                  </p>
                  <p class="text-[11px] text-slate-400 leading-tight">
                    3-Week Completion Rate
                  </p>
                </div>
              </div>

              <!-- Status Legend Breakdown -->
              <div class="space-y-1.5 mt-4 w-full text-xs">
                <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>On Track</span>
                  </span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ onTrackCount }} New Hires</span>
                </div>
                <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Needs Attention</span>
                  </span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ needsAttentionCount }} New Hires</span>
                </div>
                <div v-if="readyForReviewCount > 0" class="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span>Ready for Review</span>
                  </span>
                  <span class="font-bold text-slate-900 dark:text-white">{{ readyForReviewCount }} New Hires</span>
                </div>
              </div>
            </div>

            <!-- Right: Warm Inspirational Motivational Quote Box -->
            <div class="h-full flex flex-col justify-center items-center text-center p-5 rounded-2xl bg-[#faf6ee] dark:bg-slate-800/60 border border-amber-200/60 dark:border-amber-900/40">
              <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 shadow-xs">
                <Sprout class="w-4 h-4" />
              </div>
              <p class="font-serif italic text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                "Small guidance today, bigger confidence tomorrow."
              </p>
              <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest mt-2">
                Re.juve Mentorship
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 4. MAIN TABLE: NEW HIRE JOURNEY ==================== -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-5 sm:p-6 space-y-4">
      <!-- Table Header & Filters -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-2xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center font-bold shadow-xs">
            <Users class="w-4 h-4" />
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              New Hire Journey
            </h3>
            <p class="text-xs text-slate-400 dark:text-slate-500">
              Pantau progress setiap New Hire di tim kamu.
            </p>
          </div>
        </div>

        <!-- Controls: Search & Dropdown Stage Filter -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <!-- Search Bar -->
          <div class="relative w-full sm:w-64">
            <input
              v-model="recruitSearchQuery"
              type="text"
              placeholder="Cari nama, store, atau captain..."
              class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-8.5 pr-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
            />
            <Search class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <!-- Dropdown Filter -->
          <select
            v-model="selectedStageFilter"
            class="text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option value="ALL">Semua Tahap</option>
            <option value="BUDDY">Captain Phase (Buddy)</option>
            <option value="STAGE_1">Week 1</option>
            <option value="STAGE_2">Week 2</option>
            <option value="STAGE_3">Week 3</option>
            <option value="PENDING">Needs Review / Pending</option>
          </select>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800 text-[10px]">
            <tr>
              <th class="py-3 px-4">Nama New Hire</th>
              <th class="py-3 px-3.5">Store / Area</th>
              <th class="py-3 px-3.5">Captain</th>
              <th class="py-3 px-3.5">Current Stage</th>
              <th class="py-3 px-3.5">Mission Progress</th>
              <th class="py-3 px-3.5">Status</th>
              <th class="py-3 px-3.5">Last Update</th>
              <th class="py-3 px-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="crew in filteredRecruits"
              :key="crew.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Nama New Hire -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2.5">
                  <img
                    :src="crew.avatar"
                    :alt="crew.name"
                    class="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                  />
                  <div>
                    <p class="font-bold text-slate-900 dark:text-white leading-tight">
                      {{ crew.name }}
                    </p>
                    <p class="text-[10px] text-slate-400 font-mono mt-0.5">
                      {{ crew.phone }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Store / Area -->
              <td class="py-3.5 px-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                {{ crew.storeCode }}
              </td>

              <!-- Captain / Store Leader -->
              <td class="py-3.5 px-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                {{ crew.buddyName }}
              </td>

              <!-- Current Stage Pill -->
              <td class="py-3.5 px-3.5 whitespace-nowrap">
                <span
                  class="text-[11px] font-bold px-2.5 py-1 rounded-lg inline-block"
                  :class="crew.stagePillClass"
                >
                  {{ crew.stagePillLabel }}
                </span>
              </td>

              <!-- Mission Progress Bar -->
              <td class="py-3.5 px-3.5 whitespace-nowrap min-w-[140px]">
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="crew.progressColorClass"
                      :style="{ width: `${crew.progressPercent}%` }"
                    ></div>
                  </div>
                  <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                    {{ crew.completedMissions }}/{{ crew.totalMissions }}
                  </span>
                </div>
              </td>

              <!-- Status Badge -->
              <td class="py-3.5 px-3.5 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  :class="crew.statusBadgeClass"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="crew.statusDotClass"></span>
                  <span>{{ crew.statusLabel }}</span>
                </span>
              </td>

              <!-- Last Update -->
              <td class="py-3.5 px-3.5 whitespace-nowrap text-[11px] text-slate-400 font-medium">
                {{ crew.lastUpdate || '15 Sep 2026' }}
              </td>

              <!-- Action Button -->
              <td class="py-3.5 px-3.5 text-center whitespace-nowrap">
                <NuxtLink
                  v-if="userStore.isDistrictManager || userStore.isHead"
                  to="/approvals"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#831843]/10 hover:text-[#831843] dark:bg-slate-800 dark:hover:bg-[#831843]/20 dark:hover:text-[#f472b6] text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors"
                >
                  <span>Review</span>
                  <ChevronRight class="w-3 h-3" />
                </NuxtLink>
                <NuxtLink
                  v-else
                  to="/evaluations"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#831843]/10 hover:text-[#831843] dark:bg-slate-800 dark:hover:bg-[#831843]/20 dark:hover:text-[#f472b6] text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors"
                >
                  <span>Nilai</span>
                  <ChevronRight class="w-3 h-3" />
                </NuxtLink>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredRecruits.length === 0">
              <td colspan="8" class="text-center py-8 text-slate-400">
                Tidak ada data kru baru yang sesuai dengan filter atau pencarian.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== 5. BOTTOM 3 WIDGET CARDS ROW ==================== -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
      <!-- CARD 1: MISSION SUBMISSION STATS -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Target class="w-4 h-4" />
              </div>
              <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Mission Submission
              </h4>
            </div>
            <NuxtLink to="/missions" class="text-[11px] font-bold text-[#831843] dark:text-[#f472b6] hover:underline flex items-center gap-0.5">
              <span>Lihat Detail</span>
              <ArrowRight class="w-3 h-3" />
            </NuxtLink>
          </div>

          <div class="grid grid-cols-3 gap-2 pt-4 text-center">
            <!-- 1. Target Misi -->
            <div class="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {{ submissionStats.submitted }}
              </span>
              <p class="text-[10px] font-semibold text-slate-400 mt-0.5">Target Misi</p>
              <span class="text-[9px] font-bold text-sky-600 dark:text-sky-400 mt-1 inline-block">
                Batch Aktif
              </span>
            </div>

            <!-- 2. Misi Dinilai -->
            <div class="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {{ submissionStats.evaluated }}
              </span>
              <p class="text-[10px] font-semibold text-slate-400 mt-0.5">Misi Dinilai</p>
              <span class="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 inline-block">
                Selesai
              </span>
            </div>

            <!-- 3. Menunggu Nilai -->
            <div class="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-xl sm:text-2xl font-black text-amber-500">
                {{ submissionStats.pending }}
              </span>
              <p class="text-[10px] font-semibold text-slate-400 mt-0.5">Menunggu Nilai</p>
              <span class="text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-1 inline-block">
                Perlu Review
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 2: TOP CAPTAINS THIS WEEK -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Trophy class="w-4 h-4" />
              </div>
              <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Top Captains This Week
              </h4>
            </div>
            <NuxtLink to="/leaderboard" class="text-[11px] font-bold text-[#831843] dark:text-[#f472b6] hover:underline flex items-center gap-0.5">
              <span>Lihat Semua</span>
              <ArrowRight class="w-3 h-3" />
            </NuxtLink>
          </div>

          <div class="space-y-2.5 pt-3">
            <div
              v-for="(cap, idx) in topCaptainsList"
              :key="cap.name"
              class="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/40"
            >
              <div class="flex items-center gap-2.5">
                <span
                  class="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                  :class="idx === 0 ? 'bg-amber-500 text-white' : (idx === 1 ? 'bg-slate-400 text-white' : 'bg-amber-700 text-white')"
                >
                  {{ idx + 1 }}
                </span>
                <img :src="cap.avatar" :alt="cap.name" class="w-7 h-7 rounded-full object-cover" />
                <div>
                  <p class="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {{ cap.name }}
                  </p>
                  <p class="text-[10px] text-slate-400">
                    {{ cap.store }}
                  </p>
                </div>
              </div>

              <span class="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span v-if="idx === 0">👑</span>
                <span>{{ cap.score }}%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CARD 3: UPCOMING MILESTONES -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Calendar class="w-4 h-4" />
              </div>
              <h4 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Upcoming Milestones
              </h4>
            </div>
          </div>

          <div class="space-y-3 pt-3">
            <div
              v-for="(event, idx) in upcomingMilestones"
              :key="event.title"
              class="flex items-start gap-3"
            >
              <div
                class="w-10 h-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-mono border"
                :class="idx === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'"
              >
                <span class="text-xs font-bold leading-none">{{ event.day }}</span>
                <span class="text-[9px] uppercase font-bold opacity-75">{{ event.month }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <h5 class="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {{ event.title }}
                </h5>
                <p class="text-[11px] text-slate-400 mt-0.5">
                  {{ event.subtext }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 6. BOTTOM PANORAMIC ADVENTURE BANNER ==================== -->
    <div class="relative rounded-3xl overflow-hidden border border-amber-900/30 shadow-xl bg-slate-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
      <!-- Background Image -->
      <div class="absolute inset-0 z-0">
        <img
          src="/images/adventure_bg_wide.jpg"
          alt="Adventure Team"
          class="w-full h-full object-cover object-center opacity-30 scale-100"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-amber-950/70"></div>
      </div>

      <!-- Slogan & Logo on Left -->
      <div class="relative z-10 space-y-1 text-center md:text-left">
        <p class="font-serif italic text-amber-200 text-lg sm:text-xl font-medium tracking-wide">
          "Same Journey, Brighter People."
        </p>
        <p class="text-xs text-slate-400">
          Membangun standar keunggulan operasional Re.juve melalui pembinaan terarah.
        </p>
      </div>

      <!-- Quote Card on Right -->
      <div class="relative z-10 max-w-md p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center md:text-right shadow-lg">
        <p class="text-xs font-serif italic text-slate-200 leading-relaxed">
          "People grow when someone believes in them."
        </p>
        <span class="text-[10px] font-bold text-amber-300 uppercase tracking-widest mt-1 block">
          — Re.juve Captain
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useApprovalStore } from '~/stores/approval.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { dashboardApi } from '~/services/api.js'
import {
  Users,
  CheckCircle2,
  Award,
  Hourglass,
  Star,
  ClipboardCheck,
  ShieldCheck,
  Target,
  Trophy,
  MapPin,
  Settings,
  ChevronRight,
  Compass,
  Handshake,
  Tent,
  Waves,
  Mountain,
  Search,
  Bell,
  FileText,
  Flag,
  TrendingUp,
  TrendingDown,
  Sprout,
  Calendar,
  ArrowRight
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const approvalStore = useApprovalStore()
const evalStore = useEvaluationStore()
const gamificationStore = useGamificationStore()
const dashboardSummary = ref(null)

const recruitSearchQuery = ref('')
const selectedStageFilter = ref('ALL')

// ID Batch Aktif yang menjadi acuan utama (Point of View Per Batch)
const targetActiveBatchId = computed(() => {
  return batchStore.selectedBatchId ||
    dashboardSummary.value?.batch?.batchId ||
    dashboardSummary.value?.batch?.id ||
    batchStore.currentBatchId ||
    batchStore.currentBatch?.id ||
    ''
})

const currentBatchDisplayName = computed(() => {
  return dashboardSummary.value?.batch?.name || batchStore.currentBatch?.name || 'Batch 1 — Program Pembukaan'
})

const storeDisplayName = computed(() => {
  return dashboardSummary.value?.store?.departmentName ||
    dashboardSummary.value?.user?.departmentName ||
    (batchStore.currentBatch?.name || '').split('—')[1]?.trim() ||
    userStore.currentUser?.department ||
    userStore.currentUser?.storeLocation ||
    'Re.juve Store'
})

const pendingReviewCount = computed(() => {
  const activeBatchId = targetActiveBatchId.value

  // 1. Dari respons summary API jika terfilter batch
  if (dashboardSummary.value?.metrics?.pendingJourneyEvaluations !== undefined) {
    return (dashboardSummary.value.metrics.pendingJourneyEvaluations || 0) + (dashboardSummary.value.metrics.pendingBuddyEvaluations || 0)
  }

  // 2. Dari store approval yang difilter per batch aktif
  if (approvalStore.pendingApprovals?.length > 0) {
    const filteredApprovals = activeBatchId
      ? approvalStore.pendingApprovals.filter(a => a.batchId === activeBatchId || a.mission?.batchId === activeBatchId)
      : approvalStore.pendingApprovals
    return filteredApprovals.length
  }

  // 3. Dari daftar kru aktif yang siap dinilai
  const pendingInActiveRecruits = activeRecruits.value.filter(c => c.status === 'READY_FOR_REVIEW' || (c.completedMissions || 0) >= (c.totalMissions || 1)).length
  if (pendingInActiveRecruits > 0) return pendingInActiveRecruits

  return (evalStore.workstationCrews.filter(c => c.pendingEvaluationsCount > 0).length) || 0
})

async function loadDashboardData() {
  // 1. Muat batch dan data pengguna terlebih dahulu agar batch aktif live ter-resolve
  await Promise.allSettled([
    batchStore.fetchBatchesFromApi(),
    userStore.fetchUsersFromApi()
  ])

  const activeBatchId = targetActiveBatchId.value || batchStore.currentBatchId || batchStore.currentBatch?.id
  const batchParam = (activeBatchId && !activeBatchId.startsWith('batch-')) ? { batchId: activeBatchId } : {}

  try {
    const sumRes = await dashboardApi.getSummary(batchParam)
    if (sumRes?.success && sumRes.data) {
      dashboardSummary.value = sumRes.data
    }
  } catch (err) {
    console.warn('Dashboard summary api fallback:', err.message)
  }

  // 2. Muat data workstation kru, misi, approval, dan leaderboard
  await Promise.allSettled([
    missionStore.fetchMissionsFromApi(batchParam),
    approvalStore.fetchApprovalsFromApi(batchParam),
    evalStore.fetchWorkstationCrews({
      ...(activeBatchId ? { batchId: activeBatchId } : {}),
      week: batchStore.selectedWeek || 1,
      type: 'JOURNEY'
    }),
    gamificationStore.fetchLeaderboardFromApi(batchParam)
  ])
}

function onBatchChange() {
  loadDashboardData()
}

watch(() => batchStore.selectedBatchId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    loadDashboardData()
  }
})

onMounted(async () => {
  await loadDashboardData()
})

// Active Recruits disaring murni hanya untuk kru pada Batch Aktif (Point of View Per Batch)
const activeRecruits = computed(() => {
  const activeBatchId = targetActiveBatchId.value
  const crewsFromEval = evalStore.workstationCrews || []
  const allUsersList = userStore.allUsers || []
  const batchActiveWeek = batchStore.selectedWeek || batchStore.currentBatch?.currentWeek || 1

  // 1. Jika ada data kru dari workstation evaluasi (API /evaluations/crews yang sudah memfilter kru di bawah SL ini)
  if (crewsFromEval.length > 0) {
    // Saring jika kru memiliki batchId eksplisit yang berbeda dari batch aktif
    const matchingCrews = activeBatchId
      ? crewsFromEval.filter(c => !c.batchId || c.batchId === activeBatchId || c.batchId === batchStore.currentBatch?.code || Number(c.totalMissionsCount) > 0)
      : crewsFromEval

    const targetList = matchingCrews.length > 0 ? matchingCrews : crewsFromEval

    return targetList.map((c, idx) => {
      const userMatch = allUsersList.find(u => (u.id || u.userId) === (c.userId || c.id))
      const stageKey = (c.isBuddy || c.buddyCompleted === false) ? 'BUDDY' : `STAGE_${c.currentWeek || batchActiveWeek}`
      const completed = c.evaluatedCount !== undefined ? c.evaluatedCount : (c.completedCount || 0)
      const total = c.totalMissionsCount || 2
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0
      
      let status = 'ON_TRACK'
      if (completed >= total && total > 0) status = 'READY_FOR_REVIEW'
      else if (completed === 0 || pct < 40) status = 'NEEDS_ATTENTION'

      const rawPhone = c.phone || userMatch?.phone || userMatch?.phoneNumber || ''

      return formatRecruitItem({
        id: c.userId || c.id || `crew-${idx}`,
        name: c.name || c.userName || userMatch?.name || `Kru ${idx + 1}`,
        phone: rawPhone || '0812-3456-7890',
        avatar: c.avatar || userMatch?.avatarUrl || userMatch?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || c.userName || userMatch?.name || 'Crew')}`,
        store: c.storeCode || c.departmentName || userMatch?.department?.departmentName || storeDisplayName.value,
        captain: c.buddyName || userMatch?.buddyName || c.supervisor?.name || (userStore.isStoreLeader ? userStore.currentUser?.name : (userStore.storeLeaders[0]?.name || 'Store Leader')),
        stage: stageKey,
        completed,
        total,
        status,
        lastUpdate: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari ini'
      })
    })
  }

  // 2. Fallback: Khusus Store Leader, cari kru di gerai atau mentee SL ini
  let targetCrews = []
  if (userStore.isStoreLeader) {
    const myDeptId = userStore.currentUser?.departmentId || userStore.currentUser?.department?.departmentId
    const myUserId = userStore.currentUserId

    const slCrews = allUsersList.filter(u => {
      const role = (u.role || u.roleCode || '').toUpperCase()
      const isCrewRole = role === 'CREW' || role === 'CREW (BUDDY)' || role === 'SPECIALIST' || !['STORE_LEADER', 'SUPERVISOR', 'DISTRICT_MANAGER', 'HEAD', 'SUPERADMIN', 'OPS_DM'].includes(role)
      if (!isCrewRole) return false

      const inMyDept = myDeptId && (u.departmentId === myDeptId || u.department?.departmentId === myDeptId)
      const isMyMentee = u.userBuddyId === myUserId || u.supervisorId === myUserId

      if (inMyDept || isMyMentee) {
        if (activeBatchId) {
          return !u.batchId || u.batchId === activeBatchId || u.activeBatchId === activeBatchId || batchStore.currentBatch?.assignment?.crewIds?.includes(u.id || u.userId)
        }
        return true
      }
      return false
    })

    if (slCrews.length > 0) {
      targetCrews = slCrews
    }
  }

  // 3. Fallback Umum Batch Kru
  if (targetCrews.length === 0) {
    const batchCrews = allUsersList.filter(u => {
      const role = (u.role || u.roleCode || '').toUpperCase()
      const isCrewRole = role === 'CREW' || role === 'CREW (BUDDY)' || role === 'SPECIALIST' || !['STORE_LEADER', 'SUPERVISOR', 'DISTRICT_MANAGER', 'HEAD', 'SUPERADMIN', 'OPS_DM'].includes(role)
      if (!isCrewRole) return false

      if (activeBatchId) {
        return u.batchId === activeBatchId ||
          u.activeBatchId === activeBatchId ||
          batchStore.currentBatch?.assignment?.crewIds?.includes(u.id || u.userId)
      }
      return true
    })

    targetCrews = batchCrews.length > 0 ? batchCrews : (gamificationStore.allCrews || [])
  }

  return targetCrews.map((c, idx) => {
    const stageKey = (c.isBuddy || Boolean(c.userBuddyId)) ? 'BUDDY' : `STAGE_${c.currentWeek || batchActiveWeek}`
    const total = 2
    const completed = 0
    
    let status = 'NEEDS_ATTENTION'
    if (completed >= total) status = 'READY_FOR_REVIEW'
    else if (completed > 0) status = 'ON_TRACK'

    return formatRecruitItem({
      id: c.id || c.userId || `crew-${idx}`,
      name: c.name || 'Kru Re.juve',
      phone: c.phone || c.phoneNumber || '0812-3456-7890',
      avatar: c.avatarUrl || c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || 'Crew')}`,
      store: c.storeLocation || c.department?.departmentName || storeDisplayName.value,
      captain: c.buddyName || (userStore.isStoreLeader ? userStore.currentUser?.name : (userStore.storeLeaders[0]?.name || 'Store Leader')),
      stage: stageKey,
      completed,
      total,
      status,
      lastUpdate: 'Hari ini'
    })
  })
})

function formatRecruitItem(item) {
  const pct = Math.round((item.completed / item.total) * 100) || 0
  let stagePillClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  let stagePillLabel = 'Week 1'

  if (item.stage === 'BUDDY') {
    stagePillClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    stagePillLabel = 'Captain Phase'
  } else if (item.stage === 'STAGE_2') {
    stagePillClass = 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
    stagePillLabel = 'Week 2'
  } else if (item.stage === 'STAGE_3') {
    stagePillClass = 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
    stagePillLabel = 'Week 3'
  }

  let statusBadgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
  let statusDotClass = 'bg-emerald-500'
  let statusLabel = 'On Track'

  if (item.status === 'NEEDS_ATTENTION') {
    statusBadgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    statusDotClass = 'bg-amber-500'
    statusLabel = 'Needs Attention'
  } else if (item.status === 'READY_FOR_REVIEW') {
    statusBadgeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    statusDotClass = 'bg-purple-500'
    statusLabel = 'Ready for Review'
  }

  let progressColorClass = 'bg-emerald-500'
  if (item.status === 'NEEDS_ATTENTION') progressColorClass = 'bg-amber-500'
  else if (item.status === 'READY_FOR_REVIEW') progressColorClass = 'bg-purple-500'

  return {
    ...item,
    storeCode: item.store,
    buddyName: item.captain,
    stageKey: item.stage,
    stagePillClass,
    stagePillLabel,
    statusBadgeClass,
    statusDotClass,
    statusLabel,
    progressPercent: pct,
    progressColorClass,
    completedMissions: item.completed,
    totalMissions: item.total
  }
}

const filteredRecruits = computed(() => {
  let list = activeRecruits.value || []

  if (recruitSearchQuery.value.trim()) {
    const q = recruitSearchQuery.value.toLowerCase().trim()
    list = list.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.storeCode?.toLowerCase().includes(q) ||
      c.buddyName?.toLowerCase().includes(q)
    )
  }

  if (selectedStageFilter.value !== 'ALL') {
    if (selectedStageFilter.value === 'PENDING') {
      list = list.filter(c => c.statusLabel === 'Ready for Review' || c.statusLabel === 'Needs Attention')
    } else {
      list = list.filter(c => c.stageKey === selectedStageFilter.value)
    }
  }

  return list
})

// Menghitung jumlah aktif New Hires secara spesifik pada batch aktif
const activeRecruitsCount = computed(() => {
  return activeRecruits.value.length
})

const buddyRecruitsCount = computed(() => {
  return activeRecruits.value.filter(c => c.stageKey === 'BUDDY').length
})

function getRecruitCountByStage(stageKey) {
  return activeRecruits.value.filter(c => c.stageKey === stageKey).length
}

const onTrackCount = computed(() => activeRecruits.value.filter(c => c.statusLabel === 'On Track').length)
const needsAttentionCount = computed(() => activeRecruits.value.filter(c => c.statusLabel === 'Needs Attention').length)
const readyForReviewCount = computed(() => activeRecruits.value.filter(c => c.statusLabel === 'Ready for Review').length)

const teamCompletionRate = computed(() => {
  if (dashboardSummary.value?.metrics?.progressPercent !== undefined) {
    return dashboardSummary.value.metrics.progressPercent
  }
  if (activeRecruits.value.length === 0) return 0
  const totalCompleted = activeRecruits.value.reduce((acc, c) => acc + (c.completedMissions || 0), 0)
  const totalMissions = activeRecruits.value.reduce((acc, c) => acc + (c.totalMissions || 1), 0) || 1
  return Math.round((totalCompleted / totalMissions) * 100)
})

const inactiveNewHiresCount = computed(() => activeRecruits.value.filter(c => (c.completedMissions || 0) === 0).length)
const week3AlmostCompletedCount = computed(() => activeRecruits.value.filter(c => c.stageKey === 'STAGE_3' || c.completedMissions >= c.totalMissions - 1).length)

// Mission submission numbers mapped from active batch
const submissionStats = computed(() => {
  const totalMissions = dashboardSummary.value?.metrics?.totalMissions ??
    activeRecruits.value.reduce((sum, c) => sum + (c.totalMissions || 6), 0)
  const completedMissions = dashboardSummary.value?.metrics?.completedEvaluations ??
    dashboardSummary.value?.metrics?.approvedEvaluations ??
    activeRecruits.value.reduce((sum, c) => sum + (c.completedMissions || 0), 0)

  return {
    submitted: totalMissions,
    evaluated: completedMissions,
    pending: pendingReviewCount.value
  }
})

// Top Captains List dynamically sourced
const topCaptainsList = computed(() => {
  if (dashboardSummary.value?.topThree && Array.isArray(dashboardSummary.value.topThree) && dashboardSummary.value.topThree.length > 0) {
    return dashboardSummary.value.topThree.map((item, idx) => ({
      name: item.name || `Captain ${idx + 1}`,
      store: item.departmentName || item.store || storeDisplayName.value,
      score: item.averageScore || (item.stars ? Math.min(100, Math.round(item.stars * 20)) : 100 - (idx * 4)),
      avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name || 'Captain')}`
    }))
  }

  const leaders = userStore.storeLeaders || []
  if (leaders.length > 0) {
    return leaders.slice(0, 3).map((l, idx) => ({
      name: l.name,
      store: l.department || l.storeLocation || storeDisplayName.value,
      score: Math.max(85, 100 - (idx * 4)),
      avatar: l.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(l.name)}`
    }))
  }

  const topCrews = gamificationStore.leaderboard ? gamificationStore.leaderboard.slice(0, 3) : []
  if (topCrews.length > 0) {
    return topCrews.map((c, idx) => ({
      name: c.name,
      store: c.department || c.storeLocation || storeDisplayName.value,
      score: Math.max(85, 100 - (idx * 4)),
      avatar: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name)}`
    }))
  }

  return []
})

// Dynamic Upcoming Milestones from Batch Timeline
const upcomingMilestones = computed(() => {
  const unitCode = batchStore.currentBatchUnitCode || 'Week'
  const curWeek = batchStore.selectedWeek || 1
  
  const now = new Date()
  const milestone1Date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const milestone2Date = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  return [
    {
      day: String(milestone1Date.getDate()).padStart(2, '0'),
      month: milestone1Date.toLocaleDateString('id-ID', { month: 'short' }),
      title: `Batas akhir review ${unitCode} ${curWeek}`,
      subtext: 'Pastikan seluruh misi kru telah dinilai Store Leader.'
    },
    {
      day: String(milestone2Date.getDate()).padStart(2, '0'),
      month: milestone2Date.toLocaleDateString('id-ID', { month: 'short' }),
      title: `Batch Berikutnya Dimulai`,
      subtext: 'Siapkan Captain & alokasi mentor di wilayah gerai.'
    }
  ]
})

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 4 && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
})
</script>

