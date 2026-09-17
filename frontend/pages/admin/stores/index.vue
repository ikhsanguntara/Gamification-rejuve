<template>
  <div class="w-full space-y-6">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Master Gerai (Stores)
          </h2>
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ storeStore.totalStoreCount }} Outlet
          </span>
        </div>
      </div>

      <NuxtLink
        to="/admin/stores/create"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-semibold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer self-start sm:self-auto"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Gerai Baru</span>
      </NuxtLink>
    </div>



    <!-- Filters & Search Toolbar -->
    <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="relative w-full md:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama gerai, kode, mall, atau penanggung jawab..."
          class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
        />
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
        <!-- Region Filter -->
        <select
          v-model="selectedRegion"
          class="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#831843]"
        >
          <option value="ALL">Semua Wilayah</option>
          <option value="Jakarta Pusat">Jakarta Pusat</option>
          <option value="Jakarta Selatan">Jakarta Selatan</option>
          <option value="Jakarta Barat">Jakarta Barat</option>
          <option value="Jakarta Timur">Jakarta Timur</option>
          <option value="Jakarta Utara">Jakarta Utara</option>
          <option value="Tangerang">Tangerang</option>
          <option value="Surabaya">Surabaya</option>
          <option value="Bali">Bali</option>
        </select>

        <!-- Status Filter -->
        <select
          v-model="selectedStatus"
          class="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#831843]"
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Non-Aktif</option>
        </select>
      </div>
    </div>

    <!-- Stores Grid List -->
    <div v-if="storeStore.allStores.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="store in storeStore.allStores"
        :key="store.id"
        class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
      >
        <div>
          <!-- Header Store Card -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center flex-shrink-0 font-bold text-sm">
                <Store class="w-5 h-5" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                  {{ store.name }}
                </h3>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {{ store.code }}
                  </span>
                  <span class="text-[10px] font-medium text-slate-400">
                    {{ store.region }}
                  </span>
                </div>
              </div>
            </div>

            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full"
              :class="store.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'"
            >
              {{ store.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif' }}
            </span>
          </div>

          <!-- Location Info -->
          <div class="space-y-1.5 py-3 border-y border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            <div class="flex items-start gap-2">
              <MapPin class="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span class="line-clamp-2">{{ store.address || store.mallName }}</span>
            </div>
            <div v-if="store.phone" class="flex items-center gap-2">
              <Phone class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{{ store.phone }}</span>
            </div>
            <div v-if="store.openingHours" class="flex items-center gap-2">
              <Clock class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{{ store.openingHours }}</span>
            </div>
          </div>

          <!-- Staff Assignment Section: Store Leader & District Manager -->
          <div class="py-3.5 space-y-2.5">
            <!-- Store Leader -->
            <div class="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2.5 min-w-0">
                <img
                  v-if="store.storeLeader?.avatar"
                  :src="store.storeLeader.avatar"
                  :alt="store.storeLeader.name"
                  class="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                />
                <div v-else class="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                  SL
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider block">
                    Store Leader
                  </span>
                  <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {{ store.storeLeader ? store.storeLeader.name : 'Belum Ditugaskan' }}
                  </p>
                </div>
              </div>
              <span v-if="store.storeLeader" class="text-[10px] text-slate-400 truncate max-w-[90px]">
                {{ store.storeLeader.position || store.storeLeader.role || 'Store Leader' }}
              </span>
            </div>

            <!-- District Manager -->
            <div class="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div class="flex items-center gap-2.5 min-w-0">
                <img
                  v-if="store.districtManager?.avatar"
                  :src="store.districtManager.avatar"
                  :alt="store.districtManager.name"
                  class="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                />
                <div v-else class="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                  DM
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider block">
                    District Manager
                  </span>
                  <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {{ store.districtManager ? store.districtManager.name : 'Belum Ditugaskan' }}
                  </p>
                </div>
              </div>
              <span v-if="store.districtManager" class="text-[10px] text-slate-400 truncate max-w-[90px]">
                {{ store.districtManager.position || store.districtManager.role || 'District Manager' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
              {{ store.batch ? store.batch.name : 'Standby Outlet' }}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            <NuxtLink
              :to="`/admin/stores/${store.id}`"
              class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Gerai"
            >
              <Edit3 class="w-4 h-4" />
            </NuxtLink>

          </div>
        </div>
      </div>
    </div>

    <!-- App Pagination for Grid Cards (9 Items / Page) -->
    <AppPagination
      v-if="storeStore.serverPagination.total > 0"
      v-model:current-page="currentPage"
      :total-items="storeStore.serverPagination.total"
      :items-per-page="itemsPerPage"
      item-label="outlet"
    />

    <!-- Empty State -->
    <EmptyState
      v-else-if="!storeStore.isLoading"
      title="Tidak Ada Gerai Ditemukan"
      description="Tidak ada gerai yang cocok dengan filter atau kata kunci pencarian Anda."
      icon="Store"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :model-value="showDeleteModal"
      title="Hapus Master Gerai?"
      :message="`Apakah Anda yakin ingin menghapus outlet '${storeToDelete?.name}'? Data gerai dan alokasi penanggung jawab akan dihapus.`"
      confirm-text="Ya, Hapus Gerai"
      cancel-text="Batal"
      variant="danger"
      @update:model-value="showDeleteModal = $event"
      @confirm="handleDeleteStore"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStoreStore } from '~/stores/store.js'
import { useUserStore } from '~/stores/user.js'
import { useToast } from '~/composables/useToast.js'
import { departmentApi } from '~/services/api.js'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import AppPagination from '~/components/ui/AppPagination.vue'
import {
  Store,
  Plus,
  Search,
  MapPin,
  Phone,
  Clock,
  Edit3,
  Trash2
} from 'lucide-vue-next'

const storeStore = useStoreStore()
const userStore = useUserStore()
const toast = useToast()

const searchQuery = ref('')
const selectedRegion = ref('ALL')
const selectedStatus = ref('ALL')

const currentPage = ref(1)
const itemsPerPage = 9

const showDeleteModal = ref(false)
const storeToDelete = ref(null)

// Server-side load function: langsung menembak API backend dengan parameter page, limit, dan filters
const loadStores = async (page = 1) => {
  await storeStore.fetchStoresFromApi({
    page,
    limit: itemsPerPage,
    search: searchQuery.value,
    region: selectedRegion.value,
    status: selectedStatus.value
  })
}

onMounted(() => {
  loadStores(1)
})

// Ketika user klik pindah halaman (Page 2, Page 3, dst) -> HIT API Backend!
watch(currentPage, (newPage) => {
  loadStores(newPage)
})

// Ketika user mencari nama gerai (Debounce 350ms) -> Reset ke Page 1 & HIT API Backend!
let searchTimer = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadStores(1)
  }, 350)
})

// Ketika filter region / status diubah -> Reset ke Page 1 & HIT API Backend!
watch([selectedRegion, selectedStatus], () => {
  currentPage.value = 1
  loadStores(1)
})

import { confirmDeleteDialog } from '~/utils/dialog.js'

const confirmDelete = async (store) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Master Gerai?',
    text: `Apakah Anda yakin ingin menghapus outlet "${store.name}" (${store.code})? Data gerai akan dihapus dari server backend.`,
    confirmButtonText: 'Ya, Hapus Gerai'
  })

  if (isConfirmed) {
    try {
      await departmentApi.delete(store.id)
      toast.success('Gerai Dihapus', `Outlet ${store.name} telah berhasil dihapus dari backend.`)
      await loadStores(currentPage.value)
    } catch (err) {
      console.error('Delete store error:', err)
      toast.error('Gagal Menghapus Gerai', err.message || 'Tidak dapat menghapus data dari server.')
    }
  }
}
</script>
