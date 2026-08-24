<template>
  <div class="space-y-6 select-none">
    <!-- Top Adventure Banner & Current Location Indicator -->
    <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1a4257] via-[#24779f] to-[#491b41] text-white relative overflow-hidden shadow-xl border border-white/10">
      <!-- Glow ambient -->
      <div class="absolute -right-10 -top-10 w-60 h-60 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="relative flex-shrink-0">
            <img
              :src="userStore.currentUser.avatar"
              :alt="userStore.currentUser.name"
              class="w-14 h-14 rounded-2xl object-cover ring-4 ring-amber-400 shadow-xl"
            />
            <span class="absolute -bottom-1.5 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] font-black shadow">
              LVL {{ myProgress.currentLevel }}
            </span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                <span>📍 POS AKTIF: MISI #6</span>
              </span>
              <span class="text-xs text-amber-200 font-bold">
                {{ batchStore.currentBatch.name }}
              </span>
            </div>
            <h3 class="text-lg sm:text-2xl font-black tracking-tight mt-0.5">
              Ekspedisi Bintang: {{ userStore.currentUser.name }}
            </h3>
            <p class="text-xs text-slate-200 mt-0.5">
              Titik-titik misi berurutan menuju setiap pulau. Klik titik misi atau pulau untuk melihat rincian ⭐ Bintang & SOP!
            </p>
          </div>
        </div>

        <!-- Star Vault & Stage Status -->
        <div class="flex items-center gap-3 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/15 self-start md:self-auto">
          <div class="text-center px-2">
            <span class="text-[10px] text-slate-300 font-bold uppercase block">Pundi Bintang</span>
            <span class="text-base font-black text-amber-300 flex items-center justify-center gap-1">
              ⭐ {{ myTotalStars.toLocaleString() }}
            </span>
          </div>
          <div class="w-px h-8 bg-white/20"></div>
          <div class="text-center px-2">
            <span class="text-[10px] text-slate-300 font-bold uppercase block">Peringkat</span>
            <span class="text-base font-black text-emerald-400">#{{ myRank }}</span>
          </div>
          <div class="w-px h-8 bg-white/20"></div>
          <div class="text-center px-2">
            <span class="text-[10px] text-slate-300 font-bold uppercase block">Progres Misi</span>
            <span class="text-base font-black text-amber-400">{{ completedMissionsCount }}/12</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🗺️ WORLD MAP CANVAS (SVG + CSS Adventure Landscape with Mission Dots) -->
    <div class="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-[#24779f]/30 dark:border-slate-800 bg-[#38bdf8] dark:bg-[#0369a1] min-h-[640px] sm:min-h-[720px]">
      <!-- Animated Ocean Waves Surface -->
      <div class="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] dark:from-[#0369a1] dark:via-[#075985] dark:to-[#0c4a6e]"></div>

      <!-- Animated Wave Ripple Overlays -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-30" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="waves" width="80" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0 20 Q 20 10 40 20 T 80 20" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#waves)" class="animate-wave-drift" />
      </svg>

      <!-- ☁️ Drifting Ambient Clouds -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <!-- Cloud 1 -->
        <div class="absolute top-[6%] -left-32 animate-cloud-slow opacity-85">
          <div class="flex items-center text-white/90 drop-shadow-md">
            <span class="text-5xl sm:text-7xl">☁️</span>
          </div>
        </div>
        <!-- Cloud 2 -->
        <div class="absolute top-[38%] -left-48 animate-cloud-medium opacity-75">
          <div class="flex items-center text-white/80 drop-shadow-md">
            <span class="text-6xl sm:text-8xl">☁️</span>
          </div>
        </div>
        <!-- Cloud 3 -->
        <div class="absolute top-[70%] -left-36 animate-cloud-fast opacity-80">
          <div class="flex items-center text-white/85 drop-shadow-md">
            <span class="text-4xl sm:text-6xl">☁️</span>
          </div>
        </div>
        <!-- Birds -->
        <div class="absolute top-[16%] left-[45%] animate-pulse text-white/70 text-xs sm:text-sm">
          🕊️ 🕊️
        </div>
      </div>

      <!-- 🛤️ MAIN ADVENTURE TRAIL (Continuous Curving SVG Path) -->
      <svg class="absolute inset-0 w-full h-full z-15 pointer-events-none" viewBox="0 0 1000 700" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mapTrailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="50%" stop-color="#fbbf24" />
            <stop offset="100%" stop-color="#a855f7" />
          </linearGradient>
          <filter id="trailShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.3" />
          </filter>
        </defs>

        <!-- Underlay Dashed Path -->
        <path
          :d="trailSvgPath"
          fill="none"
          stroke="#ffffff"
          stroke-width="12"
          stroke-linecap="round"
          stroke-dasharray="6 14"
          class="opacity-60"
          filter="url(#trailShadow)"
        />

        <!-- Flowing Gradient Energy Line -->
        <path
          :d="trailSvgPath"
          fill="none"
          stroke="url(#mapTrailGrad)"
          stroke-width="6"
          stroke-linecap="round"
          stroke-dasharray="14 18"
          class="animate-trail-flow"
        />
      </svg>

      <!-- ========================================================================= -->
      <!-- 🏝️ ISLAND 1 LANDMARK: COLD CHAIN LAGOON (Week 1 - Selesai) -->
      <!-- ========================================================================= -->
      <div
        @click="openIslandModal(1)"
        class="absolute left-[4%] sm:left-[6%] top-[78%] sm:top-[74%] -translate-y-1/2 z-20 cursor-pointer group transition-transform duration-300 hover:scale-105"
      >
        <div class="relative w-40 sm:w-52 h-32 sm:h-40 flex flex-col items-center justify-center">
          <div class="absolute -bottom-2 w-36 sm:w-48 h-12 bg-[#0369a1]/60 dark:bg-black/40 rounded-full blur-md"></div>
          <div class="relative w-32 sm:w-44 h-22 sm:h-28 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-gradient-to-b from-[#86efac] via-[#22c55e] to-[#15803d] border-4 border-[#fef08a] shadow-xl overflow-hidden flex items-center justify-center">
            <div class="flex items-center gap-1 text-2xl sm:text-3xl z-10">
              <span>🌴</span>
              <span class="text-3xl sm:text-4xl animate-bounce-gentle">🧊</span>
              <span>🌴</span>
            </div>
          </div>
          <div class="absolute -top-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white border-2 border-emerald-300 shadow-md">
            <span class="text-xs">🏆</span>
            <span class="text-[9px] font-black uppercase">PULAU 1 SELESAI</span>
          </div>
          <div class="mt-1 px-2.5 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-white border border-emerald-500/40 shadow-sm text-center">
            <h4 class="text-[11px] font-black">Cold Chain Lagoon</h4>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 🏝️ ISLAND 2 LANDMARK: PURE EXTRACTION RIDGE (Week 2 - Aktif) -->
      <!-- ========================================================================= -->
      <div
        @click="openIslandModal(2)"
        class="absolute left-[42%] sm:left-[45%] top-[40%] sm:top-[38%] -translate-y-1/2 z-20 cursor-pointer group transition-transform duration-300 hover:scale-105"
      >
        <div class="relative w-44 sm:w-56 h-36 sm:h-44 flex flex-col items-center justify-center">
          <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse pointer-events-none scale-110"></div>
          <div class="absolute -bottom-2 w-40 sm:w-52 h-14 bg-[#0369a1]/70 dark:bg-black/50 rounded-full blur-lg"></div>
          <div class="relative w-36 sm:w-48 h-24 sm:h-30 rounded-[55%_45%_50%_50%/45%_55%_45%_55%] bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#c2410c] border-4 border-amber-200 shadow-2xl overflow-hidden flex items-center justify-center ring-4 ring-[#499ec7]">
            <div class="flex items-center gap-1 text-2xl sm:text-3xl z-10">
              <span>🍊</span>
              <span class="text-3xl sm:text-4xl animate-bounce-gentle">🥤</span>
              <span>🍍</span>
            </div>
          </div>
          <div class="absolute -top-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black shadow-md border border-white">
            <span class="animate-pulse text-xs">⚡</span>
            <span class="text-[9px] font-black uppercase">PULAU 2 AKTIF</span>
          </div>
          <div class="mt-1 px-2.5 py-0.5 rounded-lg bg-amber-400 text-amber-950 font-black shadow-sm text-center">
            <h4 class="text-[11px] font-black">Pure Extraction Ridge</h4>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 🏝️ ISLAND 3 LANDMARK: HACCP SUMMIT FORTRESS (Week 3 - Terkunci) -->
      <!-- ========================================================================= -->
      <div
        @click="openIslandModal(3)"
        class="absolute right-[4%] sm:right-[6%] top-[14%] sm:top-[12%] -translate-y-1/2 z-20 cursor-pointer group transition-transform duration-300 hover:scale-105"
      >
        <div class="relative w-44 sm:w-54 h-36 sm:h-44 flex flex-col items-center justify-center">
          <div class="absolute inset-0 bg-white/40 dark:bg-slate-900/40 rounded-full blur-xl pointer-events-none"></div>
          <div class="absolute -bottom-2 w-40 sm:w-48 h-12 bg-[#0369a1]/50 dark:bg-black/30 rounded-full blur-md"></div>
          <div class="relative w-36 sm:w-46 h-24 sm:h-28 rounded-[50%_50%_60%_40%/60%_60%_40%_40%] bg-gradient-to-b from-[#e0e7ff] via-[#818cf8] to-[#4338ca] border-4 border-slate-300 shadow-xl overflow-hidden flex items-center justify-center opacity-90">
            <div class="flex items-center gap-1 text-2xl sm:text-3xl z-10">
              <span>🏔️</span>
              <span class="text-3xl sm:text-4xl">🏆</span>
              <span>🌲</span>
            </div>
          </div>
          <div class="absolute -top-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 border border-slate-700 shadow-md">
            <Lock class="w-3 h-3 text-amber-400" />
            <span class="text-[9px] font-black uppercase">PULAU 3 TERKUNCI</span>
          </div>
          <div class="mt-1 px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border border-slate-300 shadow-sm text-center">
            <h4 class="text-[11px] font-black">HACCP Summit Fortress</h4>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- 📍 12 INTERACTIVE MISSION WAYPOINT DOTS WITH STARS ALONG THE PATH -->
      <!-- ========================================================================= -->
      <div
        v-for="(node, idx) in missionNodes"
        :key="node.id"
        @click="selectMissionNode(node)"
        class="absolute z-30 cursor-pointer group transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125"
        :style="{ left: node.coords.x, top: node.coords.y }"
      >
        <!-- ⭐ Floating Star Badge Above Dot -->
        <div
          class="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-full shadow-lg border whitespace-nowrap text-[10px] font-black transition-transform group-hover:-translate-y-1"
          :class="[
            node.status === 'COMPLETED'
              ? 'bg-amber-400 text-amber-950 border-white ring-2 ring-amber-300/60 shadow-amber-400/30'
              : node.isActive
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-white ring-2 ring-amber-400 animate-bounce-gentle'
              : node.status === 'PENDING_REVIEW'
              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-slate-800/90 text-slate-300 border-slate-600'
          ]"
        >
          <span v-if="node.status === 'COMPLETED' || node.isActive">⭐</span>
          <span v-else-if="node.status === 'PENDING_REVIEW'">⭐</span>
          <span v-else>🔒</span>
          <span>{{ node.starsLabel }}</span>
        </div>

        <!-- 👨 Current User Avatar Mascot on the Active Mission Dot -->
        <div
          v-if="node.isActive"
          class="absolute -top-16 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center animate-bob-character pointer-events-none"
        >
          <div class="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#499ec7] to-[#24779f] text-white text-[8px] font-black shadow-lg border border-white flex items-center gap-1 mb-0.5 whitespace-nowrap">
            <span class="animate-pulse">📍</span>
            <span>POS ANDA</span>
          </div>
          <img
            :src="userStore.currentUser.avatar"
            :alt="userStore.currentUser.name"
            class="w-9 h-9 rounded-full object-cover ring-3 ring-white shadow-2xl border-2 border-amber-400"
          />
        </div>

        <!-- Main Waypoint Dot Circle -->
        <div
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-black text-xs shadow-xl border-2 transition-all"
          :class="[
            selectedNode?.id === node.id
              ? 'bg-[#499ec7] text-white ring-4 ring-[#499ec7]/50 scale-110'
              : node.status === 'COMPLETED'
              ? 'bg-emerald-500 text-white border-white ring-2 ring-emerald-300 shadow-emerald-500/40'
              : node.isActive
              ? 'bg-amber-400 text-amber-950 border-white ring-4 ring-amber-300 animate-pulse shadow-amber-400/50'
              : node.status === 'PENDING_REVIEW'
              ? 'bg-amber-300 text-amber-950 border-white ring-2 ring-amber-200'
              : node.status === 'REVISION_REQUIRED'
              ? 'bg-rose-500 text-white border-white ring-2 ring-rose-300'
              : 'bg-slate-700/90 text-slate-300 border-slate-400/60 opacity-80'
          ]"
        >
          <!-- Active radar ripple -->
          <span
            v-if="node.isActive"
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 pointer-events-none"
          ></span>

          <span>{{ idx + 1 }}</span>
        </div>

        <!-- Tooltip Label on Hover -->
        <div class="absolute top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none z-50">
          <div class="px-2.5 py-1 rounded-xl bg-slate-900/95 text-white text-[10px] font-bold shadow-2xl border border-slate-700 whitespace-nowrap text-center backdrop-blur-md">
            <p class="font-extrabold text-amber-300">{{ node.code }} • Pos {{ idx + 1 }}</p>
            <p class="text-slate-200 max-w-[150px] truncate">{{ node.title }}</p>
            <p class="text-[9px] text-emerald-400 font-bold mt-0.5">
              {{ node.status === 'COMPLETED' ? `Skor: ${node.score}/100` : node.statusLabel }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 🎯 MISSION INTEL MODAL (Saat Titik Misi Diklik) -->
    <BaseModal
      :modelValue="!!selectedNode"
      :title="selectedNode?.title || 'Detail Pos Misi'"
      :subtitle="`${selectedNode?.code || ''} • Week ${selectedNode?.week || 1} (${selectedNode?.category || ''})`"
      max-width="md"
      @update:modelValue="selectedNode = null"
      @close="selectedNode = null"
    >
      <div v-if="selectedNode" class="space-y-4 py-2">
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {{ selectedNode.description }}
        </p>

        <!-- Star Reward Highlight Card -->
        <div class="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/60 dark:border-amber-700/60 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-lg shadow-sm">
              ⭐
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Reward Bintang Mutu:
              </span>
              <strong class="text-xs text-slate-900 dark:text-white">
                {{ selectedNode.status === 'COMPLETED' ? `⭐ 5 Stars Diperoleh` : `Hingga 5 ⭐ Bintang per Crew` }}
              </strong>
            </div>
          </div>

          <span
            class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase"
            :class="[
              selectedNode.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
              selectedNode.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' :
              selectedNode.status === 'REVISION_REQUIRED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            ]"
          >
            {{ selectedNode.statusLabel }}
          </span>
        </div>

        <!-- SOP Checklist -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Checklist Standar SOP Gerai:
          </span>
          <ul class="space-y-1.5">
            <li
              v-for="(req, idx) in (selectedNode.requirements || ['Pemeriksaan standar operasional prosedur mutu gerai Re.juve.'])"
              :key="idx"
              class="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{{ req }}</span>
            </li>
          </ul>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="selectedNode = null"
            class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Tutup
          </button>
          <NuxtLink
            :to="`/missions/${selectedNode.id}`"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#499ec7] hover:bg-[#24779f] text-white shadow-md shadow-[#499ec7]/20 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Buka Detail Misi</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </BaseModal>

    <!-- 🏝️ ISLAND INTEL MODAL (Saat Pulau Diklik) -->
    <BaseModal
      :modelValue="!!activeIslandModal"
      :title="islandMeta?.title || 'Detail Tahap Pulau'"
      :subtitle="`${islandMeta?.subtitle || ''} • ${batchStore.currentBatch.name}`"
      max-width="lg"
      @update:modelValue="activeIslandModal = null"
      @close="activeIslandModal = null"
    >
      <div v-if="islandMeta" class="space-y-4 py-2">
        <div
          class="p-4 rounded-2xl border flex items-center justify-between gap-4"
          :class="[
            islandMeta.week === 1 ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' :
            islandMeta.week === 2 ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' :
            'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
          ]"
        >
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ islandMeta.icon }}</span>
            <div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                {{ islandMeta.title }}
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ islandMeta.description }}
              </p>
            </div>
          </div>
          <span
            class="text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex-shrink-0"
            :class="[
              islandMeta.week === 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' :
              islandMeta.week === 2 ? 'bg-amber-400 text-amber-950 font-black' :
              'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            ]"
          >
            {{ islandMeta.statusLabel }}
          </span>
        </div>

        <div class="space-y-2.5">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Daftar 4 Titik Misi di Pulau Ini:
          </span>

          <div
            v-for="(m, idx) in islandMissions"
            :key="m.id"
            class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-[#499ec7] transition-all shadow-sm"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0"
                :class="[
                  m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  m.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                  m.status === 'REVISION_REQUIRED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                ]"
              >
                {{ idx + 1 }}
              </div>

              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] font-bold text-slate-400">{{ m.code }}</span>
                  <span class="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#963189]/10 text-[#963189] dark:text-[#db92d7]">
                    {{ m.category }}
                  </span>
                </div>
                <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                  {{ m.title }}
                </h5>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-shrink-0">
              <span v-if="userStore.isCrew && getCrewMissionScore(m) > 0" class="text-xs font-bold text-amber-500">
                ⭐ {{ getCrewMissionScore(m) }}/100
              </span>

              <NuxtLink
                :to="`/missions/${m.id}`"
                class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#499ec7] hover:text-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1"
              >
                <span>Buka</span>
                <ChevronRight class="w-3 h-3" />
              </NuxtLink>
            </div>
          </div>
        </div>

        <div class="pt-3 flex items-center justify-end">
          <button
            type="button"
            @click="activeIslandModal = null"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Tutup Peta
          </button>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { getStarProgress } from '~/utils/star.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  Lock,
  CheckCircle2,
  ChevronRight
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()

const selectedNode = ref(null)
const activeIslandModal = ref(null)

const myCrewData = computed(() => {
  if (userStore.isCrew) {
    return gamificationStore.crewById(userStore.currentUser.id) || userStore.currentUser
  }
  return gamificationStore.allCrews[0]
})

const myTotalStars = computed(() => {
  return myCrewData.value?.stars || userStore.currentUser.stars || 0
})

const myProgress = computed(() => {
  return getStarProgress(myTotalStars.value)
})

const storeCrews = computed(() => {
  return gamificationStore.crewsByBatch(batchStore.selectedBatchId)
})

const myRank = computed(() => {
  const sorted = [...storeCrews.value].sort((a, b) => b.stars - a.stars)
  const idx = sorted.findIndex(c => (c.crewId || c.id) === userStore.currentUser.id)
  return idx !== -1 ? idx + 1 : 1
})

const activeBatchMissions = computed(() => {
  const batchId = userStore.isCrew ? userStore.currentUser.batchId : batchStore.selectedBatchId
  return missionStore.missionsByBatch(batchId)
})

// Coordinates along the SVG trail leading to each island
const nodeCoordinates = [
  // Chapter 1: Week 1 (Heading toward Island 1 - Cold Chain Lagoon)
  { x: '10%', y: '88%' },
  { x: '16%', y: '72%' },
  { x: '24%', y: '80%' },
  { x: '28%', y: '64%' },

  // Chapter 2: Week 2 (Heading toward Island 2 - Pure Extraction Ridge)
  { x: '36%', y: '56%' },
  { x: '44%', y: '48%' }, // Active pos #6
  { x: '54%', y: '55%' },
  { x: '60%', y: '42%' },

  // Chapter 3: Week 3 (Heading toward Island 3 - HACCP Summit Fortress)
  { x: '68%', y: '36%' },
  { x: '75%', y: '26%' },
  { x: '82%', y: '32%' },
  { x: '88%', y: '20%' }
]

// SVG path string connecting all 12 nodes seamlessly across the map
const trailSvgPath = 'M 100 616 Q 160 504 240 560 T 280 448 Q 360 392 440 336 T 540 385 Q 600 294 680 252 T 750 182 Q 820 224 880 140'

const missionNodes = computed(() => {
  return activeBatchMissions.value.map((m, idx) => {
    const coords = nodeCoordinates[idx] || { x: `${(idx + 1) * 8}%`, y: '50%' }
    const isCompleted = m.status === 'COMPLETED' || m.status === 'APPROVED'
    const isActive = idx === 5 // Pos 6 is the active stepping spot

    let starsLabel = '5 ⭐'
    if (isCompleted) {
      starsLabel = '⭐ 5'
    } else if (isActive) {
      starsLabel = '⭐ Aktif'
    } else if (m.status === 'PENDING_REVIEW') {
      starsLabel = '⭐ Review'
    } else if (m.week === 3) {
      starsLabel = '5 ⭐'
    }

    let statusLabel = 'Tersedia'
    if (isCompleted) statusLabel = 'Selesai ✓'
    else if (m.status === 'PENDING_REVIEW') statusLabel = 'Diajukan ke Head'
    else if (m.status === 'REVISION_REQUIRED') statusLabel = 'Perlu Revisi'
    else if (m.week === 3) statusLabel = 'Terkunci (Week 3)'

    const score = getCrewMissionScore(m)

    return {
      ...m,
      coords,
      isCompleted,
      isActive,
      starsLabel,
      statusLabel,
      score
    }
  })
})

const completedMissionsCount = computed(() => {
  return activeBatchMissions.value.filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length
})

const islandMissions = computed(() => {
  if (!activeIslandModal.value) return []
  return activeBatchMissions.value.filter(m => m.week === activeIslandModal.value)
})

const islandMeta = computed(() => {
  if (activeIslandModal.value === 1) {
    return {
      week: 1,
      icon: '🏝️',
      title: 'Pulau 1: Cold Chain Lagoon & Basecamp',
      subtitle: 'Chapter 1 • Minggu 1 Selesai',
      description: 'Audit suhu chiller 2-4°C, sanitasi mesin hidrolik, uji kemanisan brix buah segar, dan standar keselamatan gerai.',
      statusLabel: '✓ VERIFIED & COMPLETED'
    }
  }
  if (activeIslandModal.value === 2) {
    return {
      week: 2,
      icon: '🍊',
      title: 'Pulau 2: Pure Extraction & #CleanLabel Ridge',
      subtitle: 'Chapter 2 • Minggu 2 Aktif Dinilai',
      description: 'Audit rasio ekstraksi jus 100% murni, sanitasi bar berkala, rekonsiliasi stok harian, dan kecepatan barista < 45 detik.',
      statusLabel: '⚡ SIKLUS AKTIF DINILAI'
    }
  }
  if (activeIslandModal.value === 3) {
    return {
      week: 3,
      icon: '🏔️',
      title: 'Pulau 3: HACCP Summit Fortress & Legend Trophy',
      subtitle: 'Chapter 3 • Segera Dibuka Minggu Depan',
      description: 'Puncak evaluasi sertifikasi higienitas total HACCP, perawatan preventif chiller, dan penandatanganan sertifikat mutu gerai.',
      statusLabel: '🔒 TERKUNCI (MINGGU 3)'
    }
  }
  return null
})

const selectMissionNode = (node) => {
  selectedNode.value = node
}

const openIslandModal = (weekNumber) => {
  activeIslandModal.value = weekNumber
}

const getCrewMissionScore = (mission) => {
  if (mission.crewEvaluations) {
    const e = mission.crewEvaluations.find(ce => ce.crewId === userStore.currentUser.id)
    if (e && e.score > 0) return e.score
  }
  return mission.averageScore || 0
}
</script>

<style scoped>
@keyframes wave-drift {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-20px, 10px); }
  100% { transform: translate(0, 0); }
}

.animate-wave-drift {
  animation: wave-drift 10s ease-in-out infinite;
}

@keyframes cloud-slow {
  0% { transform: translateX(0); }
  100% { transform: translateX(1200px); }
}

@keyframes cloud-medium {
  0% { transform: translateX(0); }
  100% { transform: translateX(1100px); }
}

@keyframes cloud-fast {
  0% { transform: translateX(0); }
  100% { transform: translateX(1300px); }
}

.animate-cloud-slow {
  animation: cloud-slow 35s linear infinite;
}

.animate-cloud-medium {
  animation: cloud-medium 25s linear infinite;
}

.animate-cloud-fast {
  animation: cloud-fast 18s linear infinite;
}

@keyframes trail-flow {
  to {
    stroke-dashoffset: -64;
  }
}

.animate-trail-flow {
  animation: trail-flow 2.5s linear infinite;
}

@keyframes bob-character {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.03);
  }
}

.animate-bob-character {
  animation: bob-character 2.2s ease-in-out infinite;
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}
</style>
