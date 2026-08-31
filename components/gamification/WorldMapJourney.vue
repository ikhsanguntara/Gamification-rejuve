<template>
  <div class="space-y-4 select-none">
    <!-- Top Adventure Banner & Current Location Indicator -->
    <div class="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#4a0e28] via-[#6b133a] to-[#831843] text-white relative overflow-hidden shadow-lg border border-white/10">
      <!-- Glow ambient -->
      <div class="absolute -right-10 -top-10 w-48 h-48 bg-[#be185d]/25 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <!-- User Info -->
        <div class="flex items-center gap-3">
          <div class="relative flex-shrink-0">
            <img
              :src="userStore.currentUser.avatar"
              :alt="userStore.currentUser.name"
              class="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl object-cover ring-2 ring-amber-400 shadow-md"
            />
            <span class="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[9px] sm:text-[10px] font-bold shadow">
              LVL {{ myProgress.currentLevel }}
            </span>
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center gap-1 shadow-sm">
                <span>📍 POS AKTIF: MISI #6</span>
              </span>
              <span class="text-xs text-amber-200 font-medium truncate">
                {{ batchStore.currentBatch.name }}
              </span>
            </div>
            <h3 class="text-sm sm:text-xl font-bold tracking-tight mt-0.5 truncate">
              Ekspedisi: {{ userStore.currentUser.name }}
            </h3>
            <p class="text-[11px] text-slate-200 mt-0.5 line-clamp-1">
              Selesaikan 12 misi operasional Re.juve untuk meraih bintang mutu!
            </p>
          </div>
        </div>

        <!-- Star Vault & Stage Status -->
        <div class="grid grid-cols-3 gap-1.5 sm:gap-2 bg-black/30 backdrop-blur-md p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/15 w-full md:w-auto">
          <div class="text-center px-1 sm:px-2.5">
            <span class="text-[9px] sm:text-[10px] text-slate-300 font-semibold uppercase block">Bintang</span>
            <span class="text-xs sm:text-sm font-bold text-amber-300 flex items-center justify-center gap-1">
              ⭐ {{ myTotalStars.toLocaleString() }}
            </span>
          </div>
          <div class="text-center px-1 sm:px-2.5 border-x border-white/20">
            <span class="text-[9px] sm:text-[10px] text-slate-300 font-semibold uppercase block">Peringkat</span>
            <span class="text-xs sm:text-sm font-bold text-emerald-400">#{{ myRank }}</span>
          </div>
          <div class="text-center px-1 sm:px-2.5">
            <span class="text-[9px] sm:text-[10px] text-slate-300 font-semibold uppercase block">Misi</span>
            <span class="text-xs sm:text-sm font-bold text-amber-400">{{ completedMissionsCount }}/12</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🎛️ VIEW SWITCHER TOGGLE -->
    <div class="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-full sm:w-auto">
        <button
          type="button"
          @click="activeViewMode = 'timeline'"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          :class="[
            activeViewMode === 'timeline'
              ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Compass class="w-3.5 h-3.5" />
          <span>Jalur Misi (Timeline)</span>
        </button>

        <button
          type="button"
          @click="activeViewMode = 'map'"
          class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
          :class="[
            activeViewMode === 'map'
              ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <MapPin class="w-3.5 h-3.5" />
          <span>Peta 2D (World Map)</span>
        </button>
      </div>

      <span class="hidden md:inline-block text-xs font-medium text-slate-400 pr-2">
        💡 Klik kartu misi atau pulau untuk melihat checklist SOP & Bintang.
      </span>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 1: CLEAN MOBILE-FIRST VERTICAL ADVENTURE ROADMAP (Default on Mobile) -->
    <!-- ========================================================================= -->
    <div v-if="activeViewMode === 'timeline'" class="space-y-4">
      <div
        v-for="island in islandZones"
        :key="island.week"
        class="rounded-2xl border transition-all overflow-hidden shadow-sm"
        :class="[
          island.isCompleted
            ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/60'
            : island.isActive
            ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-400/30'
            : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-90'
        ]"
      >
        <!-- Island Zone Header (Compact & Sleek) -->
        <div
          class="p-3 sm:p-4 flex items-center justify-between gap-2.5 border-b"
          :class="[
            island.isCompleted ? 'border-emerald-100 dark:border-emerald-900/40 bg-emerald-100/50 dark:bg-emerald-950/40' :
            island.isActive ? 'border-amber-100 dark:border-amber-900/40 bg-amber-500/10' :
            'border-slate-200/60 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40'
          ]"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-xl sm:text-2xl flex-shrink-0">{{ island.icon }}</span>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded"
                  :class="[
                    island.isCompleted ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200' :
                    island.isActive ? 'bg-amber-400 text-amber-950' :
                    'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  ]"
                >
                  WEEK {{ island.week }}
                </span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {{ island.title }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {{ island.description }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
              :class="[
                island.isCompleted ? 'bg-emerald-600 text-white' :
                island.isActive ? 'bg-amber-400 text-amber-950' :
                'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
              ]"
            >
              {{ island.statusLabel }}
            </span>
          </div>
        </div>

        <!-- 4 Mission Cards for this Island -->
        <div class="p-2.5 sm:p-4 space-y-2">
          <div
            v-for="(m, idx) in island.missions"
            :key="m.id"
            @click="selectMissionNode(m)"
            class="p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer relative group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            :class="[
              m.isActive
                ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400 shadow-sm'
                : m.isCompleted
                ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            ]"
          >
            <!-- Left Info & Number -->
            <div class="flex items-start sm:items-center gap-2.5 min-w-0">
              <!-- Waypoint Badge -->
              <div
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm"
                :class="[
                  m.isActive
                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 animate-pulse'
                    : m.isCompleted
                    ? 'bg-emerald-500 text-white'
                    : m.status === 'PENDING_REVIEW'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : m.status === 'REVISION_REQUIRED'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                ]"
              >
                <span v-if="m.isCompleted">✓</span>
                <span v-else>{{ (island.week - 1) * 4 + idx + 1 }}</span>
              </div>

              <!-- Content -->
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-[9px] font-bold text-slate-400">{{ m.code }}</span>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {{ m.category }}
                  </span>
                  <!-- Active Pos Marker -->
                  <span
                    v-if="m.isActive"
                    class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#831843] text-white flex items-center gap-1 shadow-sm"
                  >
                    <span>📍 POS ANDA</span>
                  </span>
                </div>

                <h4 class="text-xs font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                  {{ m.title }}
                </h4>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {{ m.description }}
                </p>
              </div>
            </div>

            <!-- Right: Stars & Status Action -->
            <div class="flex items-center justify-between sm:justify-end gap-2 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 flex-shrink-0">
              <!-- Star Reward Pill -->
              <span
                class="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                :class="[
                  m.isCompleted ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300' :
                  m.isActive ? 'bg-amber-400 text-amber-950 font-bold' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                ]"
              >
                <span>⭐</span>
                <span>{{ m.isCompleted ? '5 Bintang' : 'Hingga 5 ⭐' }}</span>
              </span>

              <!-- Status Badge / Open Button -->
              <div class="flex items-center gap-1.5">
                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                  :class="[
                    m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    m.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    m.status === 'REVISION_REQUIRED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  ]"
                >
                  {{ m.statusLabel }}
                </span>

                <button
                  type="button"
                  class="p-1 rounded-md bg-slate-100 hover:bg-[#831843] hover:text-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: 2D WORLD MAP CANVAS (Scaled-Down & Compact Islands) -->
    <!-- ========================================================================= -->
    <div v-else class="relative w-full rounded-3xl overflow-hidden shadow-xl border-4 border-[#831843]/30 dark:border-slate-800 bg-[#38bdf8] dark:bg-[#0369a1] overflow-x-auto">
      <div class="relative min-w-[700px] h-[580px]">
        <!-- Ocean Surface -->
        <div class="absolute inset-0 bg-gradient-to-b from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] dark:from-[#0369a1] dark:via-[#075985] dark:to-[#0c4a6e]"></div>

        <!-- Wave Ripple -->
        <svg class="absolute inset-0 w-full h-full pointer-events-none opacity-25" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves" width="80" height="40" patternUnits="userSpaceOnUse">
              <path d="M 0 20 Q 20 10 40 20 T 80 20" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves)" class="animate-wave-drift" />
        </svg>

        <!-- Ambient Clouds -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden z-10">
          <div class="absolute top-[5%] -left-32 animate-cloud-slow opacity-80 text-5xl">☁️</div>
          <div class="absolute top-[35%] -left-48 animate-cloud-medium opacity-70 text-6xl">☁️</div>
          <div class="absolute top-[68%] -left-36 animate-cloud-fast opacity-75 text-4xl">☁️</div>
        </div>

        <!-- 🛤️ MAIN ADVENTURE TRAIL SVG -->
        <svg class="absolute inset-0 w-full h-full z-15 pointer-events-none" viewBox="0 0 1000 700" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mapTrailGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#10b981" />
              <stop offset="50%" stop-color="#fbbf24" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
            <filter id="trailShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.25" />
            </filter>
          </defs>

          <path
            :d="trailSvgPath"
            fill="none"
            stroke="#ffffff"
            stroke-width="10"
            stroke-linecap="round"
            stroke-dasharray="6 12"
            class="opacity-60"
            filter="url(#trailShadow)"
          />

          <path
            :d="trailSvgPath"
            fill="none"
            stroke="url(#mapTrailGrad)"
            stroke-width="5"
            stroke-linecap="round"
            stroke-dasharray="12 16"
            class="animate-trail-flow"
          />
        </svg>

        <!-- 🏝️ ISLAND 1: COLD CHAIN LAGOON (COMPACT & SLEEK) -->
        <div
          @click="openIslandModal(1)"
          class="absolute left-[6%] top-[74%] -translate-y-1/2 z-20 cursor-pointer group transition-transform duration-300 hover:scale-110"
        >
          <div class="relative w-32 h-24 flex flex-col items-center justify-center">
            <div class="absolute -bottom-1.5 w-28 h-8 bg-[#0369a1]/60 dark:bg-black/40 rounded-full blur-sm"></div>
            <div class="relative w-26 h-16 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-gradient-to-b from-[#86efac] via-[#22c55e] to-[#15803d] border-2 border-[#fef08a] shadow-lg overflow-hidden flex items-center justify-center">
              <div class="flex items-center gap-0.5 text-base z-10">
                <span>🌴</span>
                <span class="text-xl animate-bounce-gentle">🧊</span>
                <span>🌴</span>
              </div>
            </div>
            <div class="absolute -top-2.5 flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-emerald-600 text-white border border-emerald-300 shadow-sm text-[8px] font-bold">
              <span>PULAU 1</span>
            </div>
            <div class="mt-0.5 px-1.5 py-0.2 rounded-md bg-white/95 text-slate-900 shadow-sm text-center">
              <h4 class="text-[9px] font-bold">Suhu & Sanitasi</h4>
            </div>
          </div>
        </div>

        <!-- 🏝️ ISLAND 2: PULAU RASA & LAYANAN (COMPACT & SLEEK) -->
        <div
          @click="openIslandModal(2)"
          class="absolute left-[44%] top-[40%] -translate-y-1/2 z-20 cursor-pointer group transition-transform duration-300 hover:scale-110"
        >
          <div class="relative w-34 h-26 flex flex-col items-center justify-center">
            <div class="absolute inset-0 rounded-full bg-amber-400/20 animate-pulse pointer-events-none scale-105"></div>
            <div class="absolute -bottom-1.5 w-30 h-9 bg-[#831843]/70 dark:bg-black/50 rounded-full blur-md"></div>
            <div class="relative w-28 h-18 rounded-[55%_45%_50%_50%/45%_55%_45%_55%] bg-gradient-to-b from-[#fde047] via-[#f59e0b] to-[#c2410c] border-2 border-amber-200 shadow-xl overflow-hidden flex items-center justify-center ring-2 ring-[#831843]">
              <div class="flex items-center gap-0.5 text-base z-10">
                <span>🍊</span>
                <span class="text-xl animate-bounce-gentle">🥤</span>
                <span>🍍</span>
              </div>
            </div>
            <div class="absolute -top-2.5 flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-amber-400 text-amber-950 font-bold shadow-sm border border-white text-[8px]">
              <span>⚡ PULAU 2</span>
            </div>
            <div class="mt-0.5 px-1.5 py-0.2 rounded-md bg-amber-400 text-amber-950 font-bold shadow-sm text-center">
              <h4 class="text-[9px]">Rasa & Layanan</h4>
            </div>
          </div>
        </div>

        <!-- 🏝️ ISLAND 3: PUNCAK HACCP (COMPACT & SLEEK) -->
        <div
          @click="openIslandModal(3)"
          class="absolute right-[8%] top-[45%] -translate-y-1/2 z-20 cursor-pointer group transition-transform duration-300 hover:scale-110"
        >
          <div class="relative w-34 h-26 flex flex-col items-center justify-center">
            <div class="absolute -bottom-1.5 w-30 h-9 bg-[#831843]/60 dark:bg-black/50 rounded-full blur-md"></div>
            <div class="relative w-28 h-18 rounded-[50%_50%_45%_55%/55%_45%_55%_45%] bg-gradient-to-b from-[#fce7f3] via-[#db2777] to-[#831843] border-2 border-emerald-200 shadow-xl overflow-hidden flex items-center justify-center ring-2 ring-slate-400/40">
              <div class="flex items-center gap-0.5 text-base z-10 opacity-75">
                <span>🍏</span>
                <span class="text-xl">🏆</span>
                <span>🥬</span>
              </div>
              <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                <Lock class="w-5 h-5 text-white/90 drop-shadow-sm" />
              </div>
            </div>
            <div class="absolute -top-2.5 flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-slate-800 text-slate-200 font-bold shadow-sm border border-slate-600 text-[8px]">
              <Lock class="w-2.5 h-2.5 text-slate-300" />
              <span>PULAU 3</span>
            </div>
            <div class="mt-0.5 px-1.5 py-0.2 rounded-md bg-slate-800/90 text-slate-200 font-bold shadow-sm text-center">
              <h4 class="text-[9px]">Audit & Stok</h4>
            </div>
          </div>
        </div>

        <!-- 📍 12 MISSION WAYPOINT DOTS -->
        <div
          v-for="(node, idx) in missionNodes"
          :key="node.id"
          @click="selectMissionNode(node)"
          class="absolute z-30 cursor-pointer group transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-125"
          :style="{ left: node.coords.x, top: node.coords.y }"
        >
          <!-- Floating Star Badge -->
          <div
            class="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.2 rounded-full shadow-md border whitespace-nowrap text-[9px] font-bold"
            :class="[
              node.status === 'COMPLETED' ? 'bg-amber-400 text-amber-950 border-white' :
              node.isActive ? 'bg-amber-400 text-amber-950 border-white ring-2 ring-amber-400' :
              'bg-slate-800/90 text-slate-300 border-slate-600'
            ]"
          >
            <span>⭐</span>
            <span>{{ node.starsLabel }}</span>
          </div>

          <!-- Active Character Mascot Pin -->
          <div
            v-if="node.isActive"
            class="absolute -top-12 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center animate-bob-character pointer-events-none"
          >
            <img
              :src="userStore.currentUser.avatar"
              :alt="userStore.currentUser.name"
              class="w-7 h-7 rounded-full object-cover ring-2 ring-white shadow-xl border border-amber-400"
            />
          </div>

          <!-- Waypoint Circle -->
          <div
            class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 transition-all"
            :class="[
              selectedNode?.id === node.id ? 'bg-[#831843] text-white ring-3 ring-[#831843]/50 scale-110' :
              node.status === 'COMPLETED' ? 'bg-emerald-500 text-white border-white' :
              node.isActive ? 'bg-amber-400 text-amber-950 border-white ring-3 ring-amber-300 animate-pulse' :
              'bg-slate-700/90 text-slate-300 border-slate-400/60'
            ]"
          >
            <span>{{ idx + 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 🎯 MISSION INTEL MODAL -->
    <BaseModal
      :modelValue="!!selectedNode"
      :title="selectedNode?.title || 'Detail Pos Misi'"
      :subtitle="`${selectedNode?.code || ''} • Week ${selectedNode?.week || 1} (${selectedNode?.category || ''})`"
      max-width="md"
      @update:modelValue="selectedNode = null"
      @close="selectedNode = null"
    >
      <div v-if="selectedNode" class="space-y-3.5 py-1">
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {{ selectedNode.description }}
        </p>

        <!-- Star Reward Highlight Card -->
        <div class="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-300/60 dark:border-amber-700/60 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shadow-sm">
              ⭐
            </div>
            <div>
              <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Reward Bintang Mutu:
              </span>
              <strong class="text-xs text-slate-900 dark:text-white">
                {{ selectedNode.status === 'COMPLETED' ? `⭐ 5 Stars Diperoleh` : `Hingga 5 ⭐ Bintang per Crew` }}
              </strong>
            </div>
          </div>

          <span
            class="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
            :class="[
              selectedNode.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
              selectedNode.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
              selectedNode.status === 'REVISION_REQUIRED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
              'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            ]"
          >
            {{ selectedNode.statusLabel }}
          </span>
        </div>

        <!-- SOP Checklist -->
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Checklist Standar SOP Gerai:
          </span>
          <ul class="space-y-1">
            <li
              v-for="(req, idx) in (selectedNode.requirements || ['Pemeriksaan standar operasional prosedur mutu gerai Re.juve.'])"
              :key="idx"
              class="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>{{ req }}</span>
            </li>
          </ul>
        </div>

        <div class="pt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="selectedNode = null"
            class="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Tutup
          </button>
          <NuxtLink
            :to="`/missions/${selectedNode.id}`"
            class="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 flex items-center gap-1 cursor-pointer"
          >
            <span>Detail Misi</span>
            <ChevronRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </BaseModal>

    <!-- 🏝️ ISLAND INTEL MODAL -->
    <BaseModal
      :modelValue="!!activeIslandModal"
      :title="islandMeta?.title || 'Detail Tahap Pulau'"
      :subtitle="`${islandMeta?.subtitle || ''} • ${batchStore.currentBatch.name}`"
      max-width="lg"
      @update:modelValue="activeIslandModal = null"
      @close="activeIslandModal = null"
    >
      <div v-if="islandMeta" class="space-y-3.5 py-1">
        <div
          class="p-3.5 rounded-2xl border flex items-center justify-between gap-3"
          :class="[
            islandMeta.week === 1 ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' :
            islandMeta.week === 2 ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' :
            'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
          ]"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">{{ islandMeta.icon }}</span>
            <div>
              <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {{ islandMeta.title }}
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {{ islandMeta.description }}
              </p>
            </div>
          </div>
          <span
            class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0"
            :class="[
              islandMeta.week === 1 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' :
              islandMeta.week === 2 ? 'bg-amber-400 text-amber-950 font-bold' :
              'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            ]"
          >
            {{ islandMeta.statusLabel }}
          </span>
        </div>

        <div class="space-y-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Daftar 4 Misi di Pulau Ini:
          </span>

          <div
            v-for="(m, idx) in islandMissions"
            :key="m.id"
            class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2.5 shadow-sm"
          >
            <div class="flex items-center gap-2 min-w-0">
              <div
                class="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] flex-shrink-0"
                :class="[
                  m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                ]"
              >
                {{ idx + 1 }}
              </div>
              <div class="min-w-0">
                <span class="text-[9px] font-bold text-slate-400">{{ m.code }}</span>
                <h5 class="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {{ m.title }}
                </h5>
              </div>
            </div>

            <NuxtLink
              :to="`/missions/${m.id}`"
              class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#831843] hover:text-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-0.5 flex-shrink-0"
            >
              <span>Buka</span>
              <ChevronRight class="w-3 h-3" />
            </NuxtLink>
          </div>
        </div>

        <div class="pt-1 flex items-center justify-end">
          <button
            type="button"
            @click="activeIslandModal = null"
            class="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            Tutup
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
  Compass,
  MapPin,
  Lock,
  CheckCircle2,
  ChevronRight
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()

// Default to 'timeline' on mobile/tablets, clean & organized
const activeViewMode = ref('timeline')

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

// Group missions by 3 island zones for the vertical timeline
const islandZones = computed(() => {
  return [
    {
      week: 1,
      icon: '🏝️',
      title: 'Pulau 1: Suhu Dingin & Sanitasi',
      description: 'Pemeriksaan suhu chiller (2–4°C), sanitasi mesin press buah, dan kebersihan bar.',
      isCompleted: true,
      isActive: false,
      statusLabel: 'SELESAI ✓',
      missions: activeBatchMissions.value.filter(m => m.week === 1).map((m, idx) => ({
        ...m,
        isCompleted: true,
        isActive: false,
        statusLabel: 'Selesai ✓'
      }))
    },
    {
      week: 2,
      icon: '🍊',
      title: 'Pulau 2: Kualitas Rasa & Layanan',
      description: 'Uji kemanisan alami buah (#CleanLabel), kecepatan layanan barista (< 45 detik), dan rotasi FIFO.',
      isCompleted: false,
      isActive: true,
      statusLabel: 'SEDANG AKTIF',
      missions: activeBatchMissions.value.filter(m => m.week === 2).map((m, idx) => ({
        ...m,
        isCompleted: m.status === 'COMPLETED' || m.status === 'APPROVED',
        isActive: idx === 1, // Pos 6 is active
        statusLabel: m.status === 'PENDING_REVIEW' ? 'Review Head' : m.status === 'REVISION_REQUIRED' ? 'Perlu Revisi' : 'Sedang Aktif'
      }))
    },
    {
      week: 3,
      icon: '🏔️',
      title: 'Pulau 3: Audit Akhir & Rekap Stok',
      description: 'Pembersihan total chiller mingguan, rekap stok fisik botol, dan checklist closing gerai.',
      isCompleted: false,
      isActive: false,
      statusLabel: 'TERKUNCI',
      missions: activeBatchMissions.value.filter(m => m.week === 3).map((m, idx) => ({
        ...m,
        isCompleted: false,
        isActive: false,
        statusLabel: 'Terkunci (Week 3)'
      }))
    }
  ]
})

// Coordinates along the SVG trail
const nodeCoordinates = [
  { x: '10%', y: '88%' },
  { x: '16%', y: '72%' },
  { x: '24%', y: '80%' },
  { x: '28%', y: '64%' },
  { x: '36%', y: '56%' },
  { x: '44%', y: '48%' },
  { x: '54%', y: '55%' },
  { x: '60%', y: '42%' },
  { x: '68%', y: '36%' },
  { x: '75%', y: '26%' },
  { x: '82%', y: '32%' },
  { x: '88%', y: '20%' }
]

const trailSvgPath = 'M 100 616 Q 160 504 240 560 T 280 448 Q 360 392 440 336 T 540 385 Q 600 294 680 252 T 750 182 Q 820 224 880 140'

const missionNodes = computed(() => {
  return activeBatchMissions.value.map((m, idx) => {
    const coords = nodeCoordinates[idx] || { x: `${(idx + 1) * 8}%`, y: '50%' }
    const isCompleted = m.status === 'COMPLETED' || m.status === 'APPROVED'
    const isActive = idx === 5

    let starsLabel = '5 ⭐'
    if (isCompleted) starsLabel = '⭐ 5'
    else if (isActive) starsLabel = '⭐ Aktif'

    let statusLabel = 'Tersedia'
    if (isCompleted) statusLabel = 'Selesai ✓'
    else if (m.status === 'PENDING_REVIEW') statusLabel = 'Diajukan ke Head'
    else if (m.status === 'REVISION_REQUIRED') statusLabel = 'Perlu Revisi'
    else if (m.week === 3) statusLabel = 'Terkunci (Week 3)'

    return {
      ...m,
      coords,
      isCompleted,
      isActive,
      starsLabel,
      statusLabel
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
      title: 'Pulau 1: Suhu Dingin & Sanitasi',
      subtitle: 'Minggu 1 • Selesai',
      description: 'Pemeriksaan suhu chiller 2–4°C, sanitasi mesin press jus, dan pemilihan buah segar.',
      statusLabel: 'SELESAI ✓'
    }
  }
  if (activeIslandModal.value === 2) {
    return {
      week: 2,
      icon: '🍊',
      title: 'Pulau 2: Kualitas Rasa & Layanan',
      subtitle: 'Minggu 2 • Sedang Berjalan',
      description: 'Pengecekan rasa alami jus, kecepatan layanan barista (< 45 detik), dan rotasi stok FIFO.',
      statusLabel: 'SEDANG DINILAI'
    }
  }
  if (activeIslandModal.value === 3) {
    return {
      week: 3,
      icon: '🏔️',
      title: 'Pulau 3: Audit Akhir & Rekap Stok',
      subtitle: 'Minggu 3 • Segera Dibuka',
      description: 'Pembersihan total chiller mingguan, rekap stok fisik botol, dan checklist closing gerai.',
      statusLabel: 'TERKUNCI'
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
    transform: translateY(-6px) scale(1.02);
  }
}

.animate-bob-character {
  animation: bob-character 2.2s ease-in-out infinite;
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.animate-bounce-gentle {
  animation: bounce-gentle 2s ease-in-out infinite;
}
</style>
