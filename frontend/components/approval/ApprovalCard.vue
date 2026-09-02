<template>
  <div
    class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-xs hover:shadow-md flex flex-col justify-between transition-all relative overflow-hidden group"
    :class="[
      selected ? 'ring-2 ring-[#831843] bg-[#831843]/5 dark:bg-[#831843]/10' : '',
      item.status === 'APPROVED'
        ? 'border-emerald-300/80 dark:border-emerald-800/60 bg-emerald-50/10 dark:bg-emerald-950/10'
        : 'hover:border-[#831843]/40'
    ]"
  >
    <!-- Checkbox Selection for Bulk Approve (DM Mode) -->
    <div
      v-if="selectable && item.status === 'PENDING_REVIEW'"
      class="absolute top-4 right-4 z-10"
    >
      <input
        type="checkbox"
        :checked="selected"
        @change="$emit('toggle-select', item.id)"
        class="w-4 h-4 rounded text-[#831843] focus:ring-[#831843] cursor-pointer"
      />
    </div>

    <div class="space-y-3.5">
      <!-- 1. Crew Identity Header (POV 1 User) -->
      <div class="flex items-start justify-between gap-3 pr-6">
        <div class="flex items-center gap-3">
          <!-- Crew Avatar -->
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#831843]/20 to-[#6b133a]/30 border border-[#831843]/30 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
            <img
              v-if="item.crewAvatar"
              :src="item.crewAvatar"
              :alt="item.crewName"
              class="w-full h-full object-cover"
            />
            <span v-else class="text-xs font-bold text-[#831843] dark:text-[#f472b6]">
              {{ getInitials(item.crewName) }}
            </span>
          </div>

          <!-- Crew Info -->
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {{ item.crewName || 'Crew Member' }}
            </h4>
            <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span class="text-[11px] font-semibold text-[#831843] dark:text-[#f472b6]">
                {{ item.crewRole || 'Barista' }}
              </span>
              <span class="text-slate-300 dark:text-slate-700">•</span>
              <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                🏪 {{ item.storeLocation || item.storeName || 'Re.juve Store' }}
              </span>
              <span class="text-slate-300 dark:text-slate-700">•</span>
              <span class="text-[11px] text-slate-500 dark:text-slate-400">
                Week {{ item.week }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Score & Stars Banner -->
      <div class="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-br from-amber-50/60 via-slate-50 to-transparent dark:from-amber-950/20 dark:via-slate-800/40 border border-amber-200/60 dark:border-amber-800/40">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
            <Star class="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Skor Evaluasi
            </span>
            <span class="text-sm font-black text-slate-900 dark:text-white">
              {{ item.score || item.averageScore }}/100
            </span>
          </div>
        </div>

        <div class="text-right">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reward</span>
          <StarReward :stars="item.calculatedStars || 5" size="sm" />
        </div>
      </div>

      <!-- 3. Mission Information -->
      <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 space-y-1">
        <div class="flex items-center justify-between gap-1 text-[11px]">
          <span class="font-bold text-[#831843] dark:text-[#f472b6]">
            {{ item.missionCode }}
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium">
            {{ item.missionCategory || 'SOP Operasional' }}
          </span>
        </div>
        <p class="text-xs font-bold text-slate-900 dark:text-white leading-snug">
          {{ item.missionTitle }}
        </p>
        <p class="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
          <UserCheck class="w-3 h-3 text-slate-400" />
          <span>Dinilai oleh: <strong class="text-slate-700 dark:text-slate-300 font-semibold">{{ item.supervisorName || 'Store Leader' }}</strong></span>
        </p>
      </div>

      <!-- 4. Catatan Store Leader -->
      <div class="space-y-1">
        <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <MessageSquare class="w-3 h-3 text-[#831843] dark:text-[#f472b6]" />
          <span>Catatan Evaluator:</span>
        </span>
        <p class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800/60">
          "{{ item.comment || 'Pemeriksaan operasional telah memenuhi standar SOP.' }}"
        </p>
      </div>

      <!-- 5. Foto Bukti & Inspeksi (Lightbox Preview) -->
      <div v-if="item.evidenceList && item.evidenceList.length > 0" class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Camera class="w-3 h-3 text-[#831843] dark:text-[#f472b6]" />
            <span>Foto Bukti ({{ item.evidenceList.length }}):</span>
          </span>
          <span class="text-[10px] text-slate-400 font-medium">Klik untuk perbesar</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="(ev, idx) in item.evidenceList"
            :key="idx"
            @click="previewImage = ev"
            class="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video bg-slate-100 dark:bg-slate-800 cursor-pointer shadow-2xs hover:ring-2 hover:ring-[#831843] transition-all"
            title="Klik untuk memperbesar foto bukti"
          >
            <img :src="ev.url" :alt="ev.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            <div class="absolute inset-0 bg-slate-950/60 flex items-end justify-between p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="text-[10px] text-white truncate">{{ ev.caption || 'Foto Bukti' }}</span>
              <Eye class="w-3 h-3 text-white flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Actions for District Manager -->
    <div class="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
      <!-- Pending State Action Button -->
      <div v-if="item.status === 'PENDING_REVIEW'">
        <button
          type="button"
          @click="$emit('approve', item)"
          class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-[#831843] to-[#6b133a] hover:from-[#6b133a] hover:to-[#4a0e28] text-white shadow-md shadow-[#831843]/20 transition-all active:scale-95 cursor-pointer"
        >
          <Star class="w-3.5 h-3.5 fill-white" />
          <span>
            Setujui & Cairkan {{ item.calculatedStars || 5 }} ⭐ ke {{ item.crewName }}
          </span>
        </button>
      </div>

      <!-- Approved State Badge -->
      <div
        v-else
        class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60"
      >
        <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span class="truncate">
          Disetujui • +{{ item.calculatedStars || 5 }} ⭐ Masuk ke {{ item.crewName }}
        </span>
      </div>
    </div>

    <!-- Image Preview Lightbox Modal -->
    <BaseModal
      :model-value="!!previewImage"
      :title="previewImage?.caption || 'Foto Bukti Lapangan SOP'"
      max-width="2xl"
      @update:model-value="previewImage = null"
      @close="previewImage = null"
    >
      <template #icon>
        <div class="w-9 h-9 rounded-xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center">
          <Camera class="w-5 h-5" />
        </div>
      </template>

      <div v-if="previewImage" class="space-y-3 py-2">
        <div class="rounded-2xl overflow-hidden bg-slate-950/5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2">
          <img
            :src="previewImage.url"
            :alt="previewImage.caption"
            class="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md"
          />
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span class="font-semibold text-slate-800 dark:text-slate-200">
            📄 {{ previewImage.caption || 'Foto Bukti Pemeriksaan Gerai' }}
          </span>
          <span class="text-slate-400 text-[11px]">
            Kru: {{ item.crewName }} ({{ item.missionCode }})
          </span>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="previewImage = null"
          class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-xs transition-all cursor-pointer"
        >
          Tutup
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StarReward from '~/components/gamification/StarReward.vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  Star,
  CheckCircle2,
  Eye,
  Camera,
  MessageSquare,
  UserCheck
} from 'lucide-vue-next'

defineProps({
  item: {
    type: Object,
    required: true
  },
  selectable: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['approve', 'toggle-select'])

const previewImage = ref(null)

function getInitials(name) {
  if (!name) return 'CR'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}
</script>
