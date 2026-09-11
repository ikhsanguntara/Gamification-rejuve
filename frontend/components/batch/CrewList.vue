<template>
  <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Daftar Kru Terdaftar ({{ batchCrews.length }} Anggota)
          </h3>
          <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ (batchStore.currentBatch?.name || '').split('—')[1] || batchStore.currentBatch?.name || 'Batch' }}
          </span>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
          Performa riil, peringkat bintang, dan status evaluasi tiap anggota kru
        </p>
      </div>

      <!-- Search Input -->
      <div class="relative w-full sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama atau kode kru..."
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
        />
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>
    </div>

    <!-- Crew Roster Grid / Table -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="crew in filteredCrews"
        :key="crew.id"
        class="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col justify-between hover:border-[#831843]/50 hover:shadow-md transition-all group"
      >
        <!-- Top Info -->
        <div class="flex items-start gap-3">
          <img
            :src="crew.avatar"
            :alt="crew.name"
            class="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0 group-hover:scale-105 transition-transform"
          />
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-400">
                {{ crew.code }}
              </span>
              <span class="text-xs font-semibold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                Lvl {{ crew.level }}
              </span>
            </div>
            <h4 class="text-xs font-semibold text-slate-900 dark:text-white truncate mt-0.5">
              {{ crew.name }}
            </h4>
            <p class="text-xs text-slate-400 dark:text-slate-500 truncate">
              {{ crew.position }}
            </p>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
              📍 {{ crew.storeLocation }}
            </p>
          </div>
        </div>

        <!-- Metrics Row -->
        <div class="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
          <div class="text-xs text-slate-500 dark:text-slate-400">
            <span>{{ crew.completedMissions }} Misi Selesai</span>
          </div>

          <div class="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 text-xs">
            <Star class="w-3.5 h-3.5 fill-amber-400" />
            <span>{{ crew.stars.toLocaleString() }}</span>
          </div>
        </div>

        <!-- Quick Supervisor Action -->
        <div v-if="userStore.isSupervisor" class="mt-3 pt-2">
          <button
            type="button"
            @click="goToEvaluation(crew.id)"
            class="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-[#831843] hover:bg-[#701a40] text-white shadow-sm transition-all cursor-pointer"
          >
            <ClipboardCheck class="w-3.5 h-3.5" />
            <span>Nilai {{ crew.name.split(' ')[0] }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty Filter State -->
    <div
      v-if="filteredCrews.length === 0"
      class="py-12 text-center text-slate-400 text-xs"
    >
      Tidak ada kru yang sesuai dengan pencarian "{{ searchQuery }}" di batch ini.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { Search, Star, ClipboardCheck } from 'lucide-vue-next'

const router = useRouter()
const props = defineProps({
  batchId: {
    type: String,
    default: null
  }
})

const userStore = useUserStore()
const batchStore = useBatchStore()
const gamificationStore = useGamificationStore()
const searchQuery = ref('')

const targetBatchId = computed(() => props.batchId || batchStore.selectedBatchId)

const batchCrews = computed(() => {
  const fromGami = gamificationStore.crewsByBatch(targetBatchId.value) || []
  if (fromGami.length > 0) return fromGami

  // Cek userStore users yang di-assign ke batch ini
  const usersList = userStore.allUsers || userStore.userDirectory || []
  const usersFromStore = usersList.filter(u => u.batchId === targetBatchId.value || u.assignedBatchId === targetBatchId.value)
  if (usersFromStore.length > 0) {
    return usersFromStore.map((u, idx) => ({
      id: u.id,
      code: u.code || `CRW-0${idx + 1}`,
      name: u.name,
      avatar: u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      level: u.level || 1,
      position: u.role || 'Crew Specialist',
      storeLocation: u.storeLocation || 'Cabang Re.juve',
      completedMissions: u.completedMissions || 0,
      stars: u.stars || 0
    }))
  }

  // Fallback ke array users langsung pada objek batch
  const b = (batchStore.batches || []).find(b => b.id === targetBatchId.value || b.code === targetBatchId.value) || batchStore.currentBatch
  if (b?.users && Array.isArray(b.users) && b.users.length > 0) {
    return b.users.map((u, idx) => ({
      id: u.userId || u.id || `crew-${idx}`,
      code: u.code || `CRW-0${idx + 1}`,
      name: u.name || 'Crew Specialist',
      avatar: u.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      level: u.level || 1,
      position: u.department?.name || u.position || 'Crew Specialist',
      storeLocation: b.name || 'Cabang Re.juve',
      completedMissions: u.completedMissions || 0,
      stars: u.stars || 0
    }))
  }

  return []
})

const filteredCrews = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return batchCrews.value
  return batchCrews.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q) ||
    c.position.toLowerCase().includes(q)
  )
})

const goToEvaluation = (crewId) => {
  router.push({ path: '/evaluations', query: { crewId } })
}
</script>
