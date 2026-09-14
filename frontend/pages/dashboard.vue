<template>
  <div class="space-y-6">
    <!-- Top Greeting & Context Hero -->
    <div class="rounded-3xl bg-gradient-to-r from-[#4a0e28] via-[#6b133a] to-[#831843] text-white p-5 sm:p-8 relative overflow-hidden shadow-xl border border-white/10">
      <!-- Glow decoration -->
      <div class="absolute -right-10 -top-10 w-60 h-60 bg-[#be185d]/25 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute right-1/4 -bottom-10 w-48 h-48 bg-[#9d174d]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-2.5 sm:mb-3 border border-white/15">
            <Star class="w-3.5 h-3.5 fill-amber-300" />
            <span class="truncate max-w-[160px] sm:max-w-none">{{ currentBatchDisplayName }}</span>
            <span>•</span>
            <span>{{ batchStore.currentBatchUnitCode || 'Week' }} {{ batchStore.selectedWeek || 1 }}/{{ batchStore.currentBatchWeeks.length || 3 }}</span>
          </div>

          <h2 class="text-xl sm:text-3xl font-bold tracking-tight">
            {{ greetingText }}, {{ (userStore.currentUser?.name || 'User').split(' ')[0] }}! 🥤
          </h2>
          <p class="text-slate-200 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            <span v-if="userStore.isCrew">
              Re.juve Specialist • Saat ini berada di <strong class="text-amber-300 font-semibold">Level {{ myProgress.currentLevel }} ({{ myProgress.currentLevelTitle }})</strong> dengan <strong class="font-semibold">{{ myStars.toLocaleString() }} ⭐ Stars</strong>. Terus selesaikan seluruh misi di {{ currentBatchDisplayName }}!
            </span>
            <span v-else-if="userStore.isSupervisor">
              Area Supervisor • {{ batchStore.currentBatchUnitCode || 'Week' }} {{ batchStore.selectedWeek || 1 }} aktif dinilai. Terdapat <strong class="text-amber-300 font-semibold">{{ pendingReviewCount }} misi diajukan</strong> dan <strong class="text-rose-300 font-semibold">{{ revisionCount }} revisi</strong>.
            </span>
            <span v-else-if="userStore.isHead">
              Head of Operations & Quality • <strong class="text-amber-300 font-semibold">{{ pendingReviewCount }} evaluasi Batch</strong> menunggu keputusan (Approve / Revise).
            </span>
            <span v-else>
              System Superadmin • Master Control Console aktif untuk seluruh Batch Re.juve.
            </span>
          </p>
        </div>

        <!-- Quick Context CTA -->
        <div class="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <NuxtLink
            v-if="userStore.isSupervisor"
            to="/evaluations"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#831843]/30 transition-all active:scale-95 border border-white/20"
          >
            <ClipboardCheck class="w-4 h-4" />
            <span>Penilaian Misi Gerai</span>
          </NuxtLink>

          <NuxtLink
            v-else-if="userStore.isHead"
            to="/approvals"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#9d174d]/30 transition-all active:scale-95 border border-white/20"
          >
            <ShieldCheck class="w-4 h-4" />
            <span>Tinjau Persetujuan ({{ pendingReviewCount }})</span>
          </NuxtLink>

          <NuxtLink
            v-else-if="userStore.isSuperadmin"
            to="/admin/users"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#9d174d]/30 transition-all active:scale-95 border border-white/20"
          >
            <Settings class="w-4 h-4" />
            <span>Konsol Administrator</span>
          </NuxtLink>

          <NuxtLink
            v-else
            to="/missions"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-[#831843]/30 transition-all active:scale-95 border border-white/20"
          >
            <Target class="w-4 h-4" />
            <span>Misi Saya</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- 5 Core Dashboard Metric Cards (Personalized for Crew vs Operational for Supervisor/Head) -->
    <div v-if="userStore.isCrew" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      <!-- 1. My Total Stars -->
      <StatCard
        title="⭐ Bintang Saya"
        :value="myStars.toLocaleString()"
        unit="Stars"
        :subtext="`Level ${myProgress.currentLevel} ${myProgress.currentLevelTitle}`"
        :icon="Star"
        variant="amber"
      />

      <!-- 2. My Completed Missions -->
      <StatCard
        title="Misi Selesai Saya"
        :value="`${myCompletedCount} / ${myTotalMissions}`"
        :subtext="`${myCycleProgress}% progres siklus`"
        :icon="CheckCircle2"
        variant="emerald"
        trend="up"
        trendValue="Aktif"
      />

      <!-- 3. My Average Quality Score -->
      <StatCard
        title="Rata-rata Skor Saya"
        :value="`${myAverageScore}%`"
        subtext="Skor evaluasi mutu personal"
        :icon="Award"
        variant="brand"
        trend="up"
        trendValue="Optimal"
      />

      <!-- 4. My Rank in Store -->
      <StatCard
        title="Peringkat di Gerai"
        :value="`#${myRank}`"
        :subtext="`dari ${storeCrewCount} Store Crew`"
        :icon="Trophy"
        variant="brand"
      />

      <!-- 5. Assigned Store Branch -->
      <StatCard
        title="Cabang Penempatan"
        :value="storeDisplayName"
        :subtext="`${batchStore.currentBatchUnitCode || 'Week'} ${batchStore.selectedWeek || 1}/${batchStore.currentBatchWeeks.length || 3} Aktif`"
        :icon="MapPin"
        variant="slate"
        class="col-span-2 sm:col-span-1"
      />
    </div>

    <!-- Dynamic KPI Metric Cards for Operations (Store Leader, District Manager, Head, Superadmin) -->
    <div
      v-if="!userStore.isCrew"
      class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
      :class="[
        dynamicStageCards.length <= 2 ? 'lg:grid-cols-4' :
        dynamicStageCards.length === 3 ? 'lg:grid-cols-6' :
        dynamicStageCards.length === 4 ? 'lg:grid-cols-4 xl:grid-cols-7' :
        'lg:grid-cols-4 xl:grid-cols-8'
      ]"
    >
      <!-- 1. Number of Active Recruits -->
      <StatCard
        :title="userStore.isDistrictManager ? 'Active Recruits (Area)' : (userStore.isSuperadmin ? 'Total Active Recruits' : 'Active Recruits')"
        :value="activeRecruitsCount"
        unit="Kru"
        :subtext="userStore.isDistrictManager ? 'Seluruh gerai binaan' : (userStore.isSuperadmin ? 'Seluruh cabang' : 'Kru baru aktif')"
        :icon="Users"
        variant="brand"
      />

      <!-- 2. Number of Buddy Recruits -->
      <StatCard
        title="Buddy Recruits"
        :value="buddyRecruitsCount"
        unit="Kru"
        :subtext="userStore.isDistrictManager ? 'Tahap Pra-Batch Area' : 'Pra-Batch (3 Hari)'"
        :icon="Handshake"
        variant="purple"
      />

      <!-- Dynamic Cards for each Week / Day / Unit in Batch -->
      <StatCard
        v-for="card in dynamicStageCards"
        :key="card.key"
        :title="card.title"
        :value="card.value"
        :unit="card.unit"
        :subtext="userStore.isDistrictManager ? `Area: ${card.subtext}` : card.subtext"
        :icon="card.icon"
        :variant="card.variant"
      />

      <!-- Last. Jumlah Pending Review / Approval -->
      <StatCard
        :title="userStore.isDistrictManager ? 'Pending Approval' : (userStore.isHead ? 'Menunggu Approval' : 'Pending Review')"
        :value="pendingReviewCount"
        unit="Misi"
        :subtext="userStore.isDistrictManager ? 'Persetujuan DM' : (userStore.isHead ? 'Persetujuan Head' : 'Menunggu evaluasi')"
        :icon="userStore.isDistrictManager ? ShieldCheck : Hourglass"
        :variant="userStore.isDistrictManager ? 'amber' : 'rose'"
      />
    </div>

    <!-- 📋 List of Active New Recruits Workspace (Role-Adapted for Store Leader & District Manager) -->
    <div
      v-if="!userStore.isCrew"
      class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-5 sm:p-6 space-y-4"
    >
      <!-- Header & Action Summary -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center font-bold">
              <Users class="w-4 h-4" />
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {{ userStore.isDistrictManager ? 'List of Active New Recruits (Wilayah Gerai DM)' : (userStore.isSuperadmin ? 'List of Active New Recruits (Seluruh Cabang)' : 'List of Active New Recruits (Kru Baru Aktif)') }}
            </h3>
            <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
              {{ filteredRecruits.length }} Kru
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span v-if="userStore.isDistrictManager">
              Pantau progres seluruh kru baru di gerai binaan Anda dan tinjau persetujuan (approval) evaluasi Store Leader.
            </span>
            <span v-else-if="userStore.isSuperadmin">
              Master audit kru baru aktif di seluruh batch dan cabang operasional Re.juve.
            </span>
            <span v-else>
              Pantau progres kru baru di gerai dan langsung <strong>isi penilaian misi</strong> atau evaluasi Buddy.
            </span>
          </p>
        </div>

        <NuxtLink
          v-if="userStore.isDistrictManager || userStore.isHead"
          to="/approvals"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white text-xs font-bold shadow-md shadow-[#9d174d]/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <ShieldCheck class="w-4 h-4" />
          <span>Buka Menu Approvals ({{ pendingReviewCount }}) →</span>
        </NuxtLink>

        <NuxtLink
          v-else-if="userStore.isSupervisor"
          to="/evaluations"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white text-xs font-bold shadow-md shadow-[#831843]/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <ClipboardCheck class="w-4 h-4" />
          <span>Buka Workstation Penilaian Full →</span>
        </NuxtLink>

        <NuxtLink
          v-else-if="userStore.isSuperadmin"
          to="/admin/users"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white text-xs font-bold shadow-md shadow-[#9d174d]/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Settings class="w-4 h-4" />
          <span>Konsol Master Pengguna →</span>
        </NuxtLink>
      </div>

      <!-- Filter / Search Controls -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <input
            v-model="recruitSearchQuery"
            type="text"
            :placeholder="userStore.isDistrictManager ? 'Cari nama kru, nomor WA, gerai, batch, atau Store Leader...' : 'Cari nama kru, nomor WA, gerai, atau batch...'"
            class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
          />
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <!-- Stage Filter Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs">
          <button
            v-for="filter in stageFilters"
            :key="filter.key"
            type="button"
            @click="selectedStageFilter = filter.key"
            class="px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer text-xs"
            :class="[
              selectedStageFilter === filter.key
                ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <!-- Data Table -->
      <div class="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800 text-[10px]">
            <tr>
              <th class="py-3 px-3.5">Batch</th>
              <th class="py-3 px-3.5">Name</th>
              <th class="py-3 px-2.5 text-center">Gender</th>
              <th class="py-3 px-3.5">Phone / WA</th>
              <th class="py-3 px-3.5">{{ userStore.isDistrictManager ? 'Store Leader (SL)' : 'Buddy SL' }}</th>
              <th class="py-3 px-3.5">{{ userStore.isDistrictManager ? 'Gerai Cabang' : 'Buddy Store Code' }}</th>
              <th class="py-3 px-3.5">New Recruit Status</th>
              <th class="py-3 px-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="crew in filteredRecruits"
              :key="crew.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
            >
              <!-- Batch -->
              <td class="py-3 px-3.5 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  {{ crew.batchName }}
                </span>
              </td>

              <!-- Name -->
              <td class="py-3 px-3.5 whitespace-nowrap">
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
                    <p class="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                      {{ crew.email || 'crew@rejuve.co.id' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Gender -->
              <td class="py-3 px-2.5 text-center whitespace-nowrap">
                <span
                  class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                  :class="crew.gender === 'P' ? 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'"
                  :title="crew.gender === 'P' ? 'Perempuan' : 'Laki-laki'"
                >
                  {{ crew.gender }}
                </span>
              </td>

              <!-- Phone / WA -->
              <td class="py-3 px-3.5 whitespace-nowrap">
                <a
                  :href="crew.waLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 transition-colors"
                  title="Hubungi via WhatsApp"
                >
                  <MessageCircle class="w-3 h-3 text-emerald-600" />
                  <span class="font-mono text-[11px]">{{ crew.phone }}</span>
                </a>
              </td>

              <!-- Buddy / Store Leader -->
              <td class="py-3 px-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 font-medium">
                {{ crew.buddyName }}
              </td>

              <!-- Buddy Store Code / Gerai -->
              <td class="py-3 px-3.5 whitespace-nowrap">
                <span class="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                  <MapPin class="w-3 h-3 text-slate-400" />
                  {{ crew.storeCode }}
                </span>
              </td>

              <!-- New recruit Status -->
              <td class="py-3 px-3.5 whitespace-nowrap">
                <span
                  class="text-[10px] font-bold px-2.5 py-0.8 rounded-full inline-block"
                  :class="crew.stageClass"
                >
                  {{ crew.stageLabel }}
                </span>
              </td>

              <!-- Action Button (DM POV vs SL POV) -->
              <td class="py-3 px-3.5 text-center whitespace-nowrap">
                <!-- DM: Tinjau Persetujuan (Approvals) -->
                <NuxtLink
                  v-if="userStore.isDistrictManager || userStore.isHead"
                  to="/approvals"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all"
                >
                  <ShieldCheck class="w-3.5 h-3.5" />
                  <span>Tinjau Approval</span>
                </NuxtLink>

                <!-- SL: Isi Penilaian (Evaluations) -->
                <NuxtLink
                  v-else
                  to="/evaluations"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white font-bold text-[11px] shadow-xs active:scale-95 transition-all"
                >
                  <ClipboardCheck class="w-3.5 h-3.5" />
                  <span>Isi Penilaian</span>
                </NuxtLink>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredRecruits.length === 0">
              <td colspan="8" class="text-center py-8 text-slate-400">
                Tidak ada kru baru yang sesuai dengan pencarian atau filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 🗺️ Interactive Journey Odyssey Banner Widget (Strictly for Crew) -->
    <div
      v-if="userStore.isCrew"
      class="rounded-3xl bg-gradient-to-r from-[#4a0e28] via-[#6b133a] to-[#831843] text-white p-5 sm:p-6 border border-white/10 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <div class="flex items-center gap-4 relative z-10">
        <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-md animate-bounce-gentle">
          <Compass class="w-6 h-6" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm sm:text-base font-semibold tracking-tight">
              Peta Ekspedisi Gamifikasi {{ batchStore.currentBatchWeeks.length || 3 }} {{ batchStore.currentBatchUnitLabel || 'Minggu' }} (Star Odyssey)
            </h3>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
              INTERAKTIF
            </span>
          </div>
          <p class="text-xs text-slate-200 mt-0.5 max-w-xl">
            Jelajahi alur pipa fluida pos misi {{ batchStore.currentBatchUnitCode || 'Week' }} 1 sampai {{ batchStore.currentBatchUnitCode || 'Week' }} {{ batchStore.currentBatchWeeks.length || 3 }}. Pantau posisi pin Anda dan kumpulkan seluruh bintang!
          </p>
        </div>
      </div>

      <NuxtLink
        to="/journey"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-all active:scale-95 shadow-md flex-shrink-0 cursor-pointer"
      >
        <span>Buka Peta Ekspedisi</span>
        <ChevronRight class="w-4 h-4 text-[#831843]" />
      </NuxtLink>
    </div>

    <!-- Interactive Weekly Progression Stepper -->
    <WeekSelector />

    <!-- Top 3 Leaderboard Preview Widget -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Top Star Performers — {{ currentBatchDisplayName }}
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Peringkat Crew Batch
            </p>
          </div>
          <NuxtLink
            to="/leaderboard"
            class="text-xs font-bold text-[#831843] dark:text-[#f472b6] hover:underline flex items-center gap-1"
          >
            <span>Lihat Leaderboard</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <!-- Top 3 Mini Podium List -->
        <div v-if="branchTopThree.length > 0" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            v-for="(crew, index) in branchTopThree"
            :key="crew.crewId || crew.id"
            class="p-3.5 sm:p-4 rounded-2xl border flex flex-col items-center text-center relative overflow-hidden transition-all"
            :class="[
              (crew.crewId || crew.id) === userStore.currentUser?.id
                ? 'border-[#831843] dark:border-[#f472b6] bg-[#831843]/10 ring-2 ring-[#831843]/30'
                : index === 0
                ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20'
            ]"
          >
            <div class="relative mb-2">
              <img
                :src="crew.avatar"
                :alt="crew.name"
                class="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              />
              <span
                class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                :class="index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : 'bg-amber-700'"
              >
                {{ index + 1 }}
              </span>
            </div>
            <h4 class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
              {{ crew.name }}
            </h4>
            <p class="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
              {{ crew.position || 'Store Crew' }}
            </p>
            <span class="text-xs font-black text-amber-500 mt-1 flex items-center gap-0.5">
              <Star class="w-3 h-3 fill-amber-400" />
              {{ crew.stars?.toLocaleString() || 0 }}
            </span>
          </div>
        </div>

        <div v-else class="text-center py-6 text-xs text-slate-400">
          Belum ada data peringkat untuk batch ini.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useApprovalStore } from '~/stores/approval.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { dashboardApi } from '~/services/api.js'
import { getStarProgress } from '~/utils/star.js'
import StatCard from '~/components/dashboard/StatCard.vue'
import WeekSelector from '~/components/batch/WeekSelector.vue'
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
  MessageCircle
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

const currentBatchDisplayName = computed(() => {
  return dashboardSummary.value?.batch?.name || batchStore.currentBatch?.name || 'Memuat Batch...'
})

const stageFilters = computed(() => {
  const base = [
    { key: 'ALL', label: 'Semua Kru' },
    { key: 'BUDDY', label: 'Buddy Pre-Batch' }
  ]
  const weeks = batchStore.currentBatchWeeks || []
  const unitCode = batchStore.currentBatchUnitCode || 'Week'
  const unitInitial = unitCode.charAt(0).toUpperCase()

  weeks.forEach(w => {
    const cleanTitle = w.title?.includes(':') ? w.title.split(':')[0].trim() : `${unitCode} ${w.weekNumber}`
    base.push({
      key: `STAGE_${w.weekNumber}`,
      label: `${cleanTitle} (${unitInitial}${w.weekNumber})`
    })
  })

  base.push({
    key: 'PENDING',
    label: (userStore.isDistrictManager || userStore.isHead) ? 'Menunggu Approval DM' : 'Butuh Penilaian'
  })
  return base
})

const storeDisplayName = computed(() => {
  return dashboardSummary.value?.store?.departmentName || (batchStore.currentBatch?.name || '').split('—')[1]?.trim() || batchStore.currentBatch?.name || 'Re.juve'
})

const revisionCount = computed(() => {
  return dashboardSummary.value?.metrics?.revisionRequired ?? dashboardSummary.value?.metrics?.revisionCount ?? missionStore.revisionCount ?? 0
})

const pendingReviewCount = computed(() => {
  if (dashboardSummary.value?.metrics?.pendingJourneyEvaluations !== undefined) {
    return (dashboardSummary.value.metrics.pendingJourneyEvaluations || 0) + (dashboardSummary.value.metrics.pendingBuddyEvaluations || 0)
  }
  if (dashboardSummary.value?.metrics?.pendingApprovalsCount !== undefined) {
    return dashboardSummary.value.metrics.pendingApprovalsCount
  }
  return approvalStore.pendingApprovals.length
})

onMounted(async () => {
  try {
    const sumRes = await dashboardApi.getSummary()
    if (sumRes?.success && sumRes.data) {
      dashboardSummary.value = sumRes.data
    }
  } catch (err) {
    console.warn('Dashboard summary api fallback:', err.message)
  }

  await Promise.allSettled([
    batchStore.fetchBatchesFromApi(),
    missionStore.fetchMissionsFromApi(),
    approvalStore.fetchApprovalsFromApi(),
    userStore.fetchUsersFromApi(),
    evalStore.fetchWorkstationCrews(),
    gamificationStore.fetchLeaderboardFromApi()
  ])
})

// Store Leader Active Recruits Data & Stage Mappings (Dynamic 2, 3, 5 Days/Weeks/Months)
const activeRecruits = computed(() => {
  const crewsFromEval = evalStore.workstationCrews || []
  const allUsersList = userStore.allUsers || []
  const currentBatchName = currentBatchDisplayName.value
  const weeks = batchStore.currentBatchWeeks || []
  const totalUnits = weeks.length || 3
  const unitCode = batchStore.currentBatchUnitCode || 'Week'
  const unitLabel = batchStore.currentBatchUnitLabel || 'Minggu'
  const unitInitial = unitCode.charAt(0).toUpperCase()

  if (crewsFromEval.length > 0) {
    return crewsFromEval.map((c, idx) => {
      const userMatch = allUsersList.find(u => (u.id || u.userId) === (c.userId || c.id))
      const rawGender = c.gender || userMatch?.gender || (idx % 2 === 0 ? 'L' : 'P')
      const gender = (rawGender === 'P' || rawGender === 'FEMALE' || rawGender === 'Perempuan') ? 'P' : 'L'
      const phone = c.phone || userMatch?.phone || userMatch?.phoneNumber || `0812-3456-${String(1000 + idx).slice(1)}`
      const cleanPhone = phone.replace(/\D/g, '')
      const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : (cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone)
      const waLink = `https://wa.me/${waNumber}`
      
      const unitNum = c.currentWeek || (idx % totalUnits) + 1
      const matchingWeek = weeks.find(w => w.weekNumber === unitNum)
      const cleanTitle = matchingWeek?.title?.includes(':') ? matchingWeek.title.split(':')[0].trim() : `${unitCode} ${unitNum}`
      
      let stageKey = `STAGE_${unitNum}`
      let stageLabel = `${cleanTitle} (${unitInitial}${unitNum})`
      let stageClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'

      if (c.isBuddy || c.buddyCompleted === false || (idx === 0 && !c.currentWeek)) {
        stageKey = 'BUDDY'
        stageLabel = 'Buddy Pre-Batch'
        stageClass = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
      } else if (unitNum === 2) {
        stageClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
      } else if (unitNum >= 3) {
        stageClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
      }

      const pendingCount = c.pendingEvaluationsCount || (c.evaluatedCount < c.totalMissionsCount ? (c.totalMissionsCount - c.evaluatedCount) : 0)

      return {
        id: c.userId || c.id || `crew-${idx}`,
        userId: c.userId || c.id,
        name: c.name || c.userName || 'Kru Re.juve',
        email: c.email || userMatch?.email || 'crew@rejuve.co.id',
        avatar: c.avatar || userMatch?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || 'Crew')}`,
        gender,
        phone,
        waLink,
        batchName: c.batchName || currentBatchName,
        buddyName: c.buddyName || userMatch?.buddyName || c.supervisor?.name || (userStore.isSupervisor ? userStore.currentUser?.name : (userStore.storeLeaders[0]?.name || 'Store Leader')),
        storeCode: c.storeCode || userMatch?.department?.departmentCode || userMatch?.department?.departmentName || storeDisplayName.value,
        stageKey,
        stageLabel,
        stageClass,
        hasPending: pendingCount > 0,
        pendingCount
      }
    })
  }

  // Fallback from userStore or gamificationStore
  const crewUsers = allUsersList.filter(u => {
    const role = (u.role || u.roleCode || '').toUpperCase()
    return role === 'CREW' || role === 'CREW (BUDDY)' || role === 'SPECIALIST' || !['STORE_LEADER', 'SUPERVISOR', 'DISTRICT_MANAGER', 'HEAD', 'SUPERADMIN', 'OPS_DM'].includes(role)
  })

  const targetList = crewUsers.length > 0 ? crewUsers : gamificationStore.allCrews

  return targetList.map((c, idx) => {
    const rawGender = c.gender || (idx % 2 === 0 ? 'L' : 'P')
    const gender = (rawGender === 'P' || rawGender === 'FEMALE' || rawGender === 'Perempuan') ? 'P' : 'L'
    const phone = c.phone || c.phoneNumber || `0812-3456-${String(1000 + idx).slice(1)}`
    const cleanPhone = phone.replace(/\D/g, '')
    const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : (cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone)
    const waLink = `https://wa.me/${waNumber}`

    const unitNum = (idx % totalUnits) + 1
    const matchingWeek = weeks.find(w => w.weekNumber === unitNum)
    const cleanTitle = matchingWeek?.title?.includes(':') ? matchingWeek.title.split(':')[0].trim() : `${unitCode} ${unitNum}`

    let stageKey = `STAGE_${unitNum}`
    let stageLabel = `${cleanTitle} (${unitInitial}${unitNum})`
    let stageClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'

    if (c.isBuddy || idx === 0) {
      stageKey = 'BUDDY'
      stageLabel = 'Buddy Pre-Batch'
      stageClass = 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
    } else if (unitNum === 2) {
      stageClass = 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
    } else if (unitNum >= 3) {
      stageClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    }

    return {
      id: c.id || c.userId || `crew-${idx}`,
      userId: c.id || c.userId,
      name: c.name || 'Kru Re.juve',
      email: c.email || 'crew@rejuve.co.id',
      avatar: c.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.name || 'Crew')}`,
      gender,
      phone,
      waLink,
      batchName: c.batchName || currentBatchName,
      buddyName: c.buddyName || c.supervisor?.name || (userStore.isSupervisor ? userStore.currentUser?.name : (userStore.storeLeaders[0]?.name || 'Store Leader')),
      storeCode: c.storeCode || c.department?.departmentCode || c.department?.departmentName || storeDisplayName.value,
      stageKey,
      stageLabel,
      stageClass,
      hasPending: idx % 2 === 0,
      pendingCount: idx % 2 === 0 ? 2 : 0
    }
  })
})

const filteredRecruits = computed(() => {
  let list = activeRecruits.value || []

  if (recruitSearchQuery.value.trim()) {
    const q = recruitSearchQuery.value.toLowerCase().trim()
    list = list.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.batchName?.toLowerCase().includes(q) ||
      c.storeCode?.toLowerCase().includes(q) ||
      c.buddyName?.toLowerCase().includes(q)
    )
  }

  if (selectedStageFilter.value !== 'ALL') {
    if (selectedStageFilter.value === 'PENDING') {
      list = list.filter(c => c.hasPending)
    } else {
      list = list.filter(c => c.stageKey === selectedStageFilter.value)
    }
  }

  return list
})

const activeRecruitsCount = computed(() => activeRecruits.value.length)
const buddyRecruitsCount = computed(() => activeRecruits.value.filter(c => c.stageKey === 'BUDDY').length)

// Dynamic Stage Cards based on current batch configuration (2, 3, 5 Days/Weeks/Months)
const dynamicStageCards = computed(() => {
  const weeks = batchStore.currentBatchWeeks || []
  const unitCode = batchStore.currentBatchUnitCode || 'Week'
  const unitLabel = batchStore.currentBatchUnitLabel || 'Minggu'
  const unitInitial = unitCode.charAt(0).toUpperCase()
  const variants = ['amber', 'blue', 'emerald', 'teal', 'indigo', 'purple', 'slate']
  const icons = [Tent, Waves, Mountain, Target, Award, Star, CheckCircle2]

  return weeks.map((w, idx) => {
    const stageKey = `STAGE_${w.weekNumber}`
    const count = activeRecruits.value.filter(c => c.stageKey === stageKey).length
    const cleanTitle = w.title?.includes(':') ? w.title.split(':')[0].trim() : `${unitCode} ${w.weekNumber}`
    const title = `${cleanTitle} (${unitInitial}${w.weekNumber})`
    const subtext = `Tahap ${w.title?.includes(':') ? w.title.split(':')[1].trim() : `${unitLabel} ${w.weekNumber}`}`

    return {
      key: stageKey,
      title,
      value: count,
      unit: 'Kru',
      subtext,
      icon: icons[idx % icons.length] || Star,
      variant: variants[idx % variants.length] || 'brand'
    }
  })
})

// Personal Crew stats
const myCrewData = computed(() => {
  if (userStore.isCrew) {
    const found = gamificationStore.crewById(userStore.currentUser?.id)
    return found || userStore.currentUser
  }
  return gamificationStore.allCrews[0]
})

const myStars = computed(() => {
  if (dashboardSummary.value?.metrics?.myStars !== undefined) {
    return dashboardSummary.value.metrics.myStars
  }
  if (dashboardSummary.value?.metrics?.myPoints !== undefined) {
    return dashboardSummary.value.metrics.myPoints
  }
  return myCrewData.value?.stars || userStore.currentUser?.stars || 0
})

const myProgress = computed(() => {
  return getStarProgress(myStars.value)
})

const storeCrews = computed(() => {
  return gamificationStore.crewsByBatch(batchStore.selectedBatchId)
})

const storeCrewCount = computed(() => {
  return dashboardSummary.value?.metrics?.totalStoreCrews ??
    dashboardSummary.value?.metrics?.managedStoresCount ??
    dashboardSummary.value?.metrics?.totalCrewsCount ??
    storeCrews.value.length ??
    0
})

const branchTopThree = computed(() => {
  if (dashboardSummary.value?.topThree && Array.isArray(dashboardSummary.value.topThree) && dashboardSummary.value.topThree.length > 0) {
    return dashboardSummary.value.topThree.map(item => ({
      crewId: item.crewId || item.id,
      id: item.crewId || item.id,
      name: item.name || 'Crew Member',
      position: item.position || 'Store Crew',
      stars: item.stars || 0,
      avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name || 'Crew')}`
    }))
  }
  const sorted = [...storeCrews.value].sort((a, b) => (b.stars || 0) - (a.stars || 0))
  return sorted.slice(0, 3)
})

const myRank = computed(() => {
  if (dashboardSummary.value?.metrics?.rank !== undefined) {
    return dashboardSummary.value.metrics.rank
  }
  const sorted = [...storeCrews.value].sort((a, b) => (b.stars || 0) - (a.stars || 0))
  const idx = sorted.findIndex(c => (c.crewId || c.id) === userStore.currentUser?.id)
  return idx !== -1 ? idx + 1 : 1
})

const myMissions = computed(() => {
  const batchId = userStore.isCrew ? userStore.currentUser?.batchId : batchStore.selectedBatchId
  const list = missionStore.missionsByBatch(batchId) || []
  if (userStore.isCrew && userStore.currentUser?.id) {
    const currentCrewId = userStore.currentUser.id
    return list.filter(m => {
      const isAssigned = (m.assignedCrewIds && m.assignedCrewIds.includes(currentCrewId)) ||
        (m.crewEvaluations && m.crewEvaluations.some(ce => ce.crewId === currentCrewId))
      return isAssigned
    })
  }
  return list
})

const myTotalMissions = computed(() => {
  return dashboardSummary.value?.metrics?.totalMissions ?? (myMissions.value || []).length ?? 14
})

const myCompletedCount = computed(() => {
  if (dashboardSummary.value?.metrics?.completedMissions !== undefined) {
    return dashboardSummary.value.metrics.completedMissions
  }
  const crewId = userStore.currentUser?.id
  return (myMissions.value || []).filter(m => {
    if (m.crewEvaluations && m.crewEvaluations.length > 0) {
      const e = m.crewEvaluations.find(ce => ce.crewId === crewId)
      return e && (e.status === 'COMPLETED' || m.status === 'COMPLETED')
    }
    return m.status === 'COMPLETED'
  }).length
})

const myCycleProgress = computed(() => {
  if (dashboardSummary.value?.metrics?.cycleProgress !== undefined) {
    return dashboardSummary.value.metrics.cycleProgress
  }
  const total = myTotalMissions.value || 1
  return Math.round((myCompletedCount.value / total) * 100) || 0
})

const myAverageScore = computed(() => {
  if (dashboardSummary.value?.metrics?.averageScore !== undefined) {
    return Number(dashboardSummary.value.metrics.averageScore).toFixed(1)
  }
  const crewId = userStore.currentUser?.id
  let totalScore = 0
  let evaluatedCount = 0

  myMissions.value.forEach(m => {
    if (m.crewEvaluations && m.crewEvaluations.length > 0) {
      const e = m.crewEvaluations.find(ce => ce.crewId === crewId)
      if (e && e.score > 0) {
        totalScore += e.score
        evaluatedCount++
      }
    } else if (m.averageScore > 0) {
      totalScore += m.averageScore
      evaluatedCount++
    }
  })

  return evaluatedCount > 0 ? (totalScore / evaluatedCount).toFixed(1) : '0.0'
})

// Operational stats for Supervisor / Store Leader / Head / Admin
const operationalCompletedMissions = computed(() => {
  return dashboardSummary.value?.metrics?.completedMissions ?? batchStore.currentBatch?.completedMissions ?? 0
})

const operationalTotalMissions = computed(() => {
  return dashboardSummary.value?.metrics?.totalMissions ?? batchStore.currentBatch?.totalMissions ?? 0
})

const operationalMissionProgress = computed(() => {
  const total = operationalTotalMissions.value || 1
  return Math.round((operationalCompletedMissions.value / total) * 100) || 0
})

const operationalAverageScore = computed(() => {
  const avg = dashboardSummary.value?.metrics?.averageScore ??
    dashboardSummary.value?.metrics?.overallAverageScore ??
    batchStore.currentBatch?.averageScore ??
    0
  return typeof avg === 'number' ? avg.toFixed(1) : avg
})

const operationalTotalStars = computed(() => {
  return dashboardSummary.value?.metrics?.totalStars ?? batchStore.currentBatch?.totalStars ?? 0
})

const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Selamat Pagi'
  if (hour < 17) return 'Selamat Siang'
  return 'Selamat Malam'
})
</script>
