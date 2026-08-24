<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Gamification</span>
          <span>/</span>
          <span class="text-[#499ec7] dark:text-[#84cded] font-bold">World Map Journey</span>
        </div>
        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Peta Petualangan Bintang (World Map Journey)
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Jelajahi kepulauan gamifikasi Re.juve! Pantau posisi pos karakter Anda, buka pulau aktif, dan selesaikan seluruh misi.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <NuxtLink
          to="/missions"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
        >
          <Target class="w-4 h-4 text-[#499ec7]" />
          <span>Katalog Misi</span>
        </NuxtLink>

        <NuxtLink
          to="/leaderboard"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#499ec7] hover:bg-[#24779f] text-white text-xs font-bold transition-all shadow-md shadow-[#499ec7]/20 active:scale-95 cursor-pointer"
        >
          <Trophy class="w-4 h-4 text-amber-300" />
          <span>Leaderboard Gerai</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Main World Map Journey Component -->
    <WorldMapJourney />
  </div>
</template>

<script setup>
import WorldMapJourney from '~/components/gamification/WorldMapJourney.vue'
import { Target, Trophy } from 'lucide-vue-next'
</script>
