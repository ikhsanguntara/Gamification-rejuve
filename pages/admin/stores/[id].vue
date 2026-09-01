<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/stores" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Gerai</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Edit Gerai</span>
    </div>

    <!-- Main Card -->
    <div v-if="store" class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center font-bold">
            <Store class="w-5 h-5" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                Edit Gerai: {{ store.name }}
              </h2>
              <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {{ store.code }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Perbarui rincian outlet, wilayah, penugasan Store Leader, dan District Manager.
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="showDeleteModal = true"
          class="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>Hapus Gerai</span>
        </button>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-6 pt-6">
        <!-- 1. Informasi Outlet & Lokasi -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Informasi Outlet & Lokasi
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Nama Gerai -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Gerai / Outlet *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <!-- Kode Gerai -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kode Gerai *
              </label>
              <input
                v-model="form.code"
                type="text"
                required
                class="w-full text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Wilayah / Region -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Wilayah / Region *
              </label>
              <select
                v-model="form.region"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              >
                <option value="Jakarta Pusat">Jakarta Pusat</option>
                <option value="Jakarta Selatan">Jakarta Selatan</option>
                <option value="Jakarta Barat">Jakarta Barat</option>
                <option value="Jakarta Timur">Jakarta Timur</option>
                <option value="Jakarta Utara">Jakarta Utara</option>
                <option value="Tangerang">Tangerang</option>
                <option value="Surabaya">Surabaya</option>
                <option value="Bali">Bali</option>
                <option value="Bandung">Bandung</option>
              </select>
            </div>

            <!-- Nama Mall / Gedung -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Mall / Kompleks
              </label>
              <input
                v-model="form.mallName"
                type="text"
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <!-- Jam Operasional -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jam Operasional
              </label>
              <input
                v-model="form.openingHours"
                type="text"
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Alamat Lengkap -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Lengkap Outlet *
              </label>
              <input
                v-model="form.address"
                type="text"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <!-- Nomor Telepon -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Telepon
              </label>
              <input
                v-model="form.phone"
                type="text"
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>
        </div>

        <!-- 2. Penugasan Manajerial (Dropdowns) -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              2. Penugasan Store Leader & District Manager
            </h3>
            <span class="text-[11px] text-slate-400">
              Data diambil realtime dari direktori User
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Dropdown Store Leader -->
            <div class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40 space-y-2">
              <label class="block text-xs font-bold text-amber-800 dark:text-amber-300">
                👔 Store Leader (Penilai Gerai) *
              </label>
              <select
                v-model="form.storeLeaderId"
                required
                class="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 shadow-xs"
              >
                <option :value="null" disabled>Pilih Store Leader...</option>
                <option
                  v-for="sl in userStore.storeLeaders"
                  :key="sl.id"
                  :value="sl.id"
                >
                  {{ sl.name }} — {{ sl.position }} ({{ sl.email }})
                </option>
              </select>

              <!-- Preview Selected Store Leader -->
              <div v-if="selectedStoreLeader" class="flex items-center gap-2.5 pt-1.5 text-xs">
                <img
                  :src="selectedStoreLeader.avatar"
                  :alt="selectedStoreLeader.name"
                  class="w-8 h-8 rounded-full object-cover ring-1 ring-amber-400"
                />
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 dark:text-white truncate">
                    {{ selectedStoreLeader.name }}
                  </p>
                  <p class="text-[10px] text-slate-400 truncate">
                    {{ selectedStoreLeader.position }} • {{ selectedStoreLeader.storeLocation }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Dropdown District Manager -->
            <div class="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-300/40 dark:border-indigo-700/40 space-y-2">
              <label class="block text-xs font-bold text-indigo-800 dark:text-indigo-300">
                🛡️ District Manager (Approver Area) *
              </label>
              <select
                v-model="form.districtManagerId"
                required
                class="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 shadow-xs"
              >
                <option :value="null" disabled>Pilih District Manager...</option>
                <option
                  v-for="dm in userStore.districtManagers"
                  :key="dm.id"
                  :value="dm.id"
                >
                  {{ dm.name }} — {{ dm.position }} ({{ dm.email }})
                </option>
              </select>

              <!-- Preview Selected District Manager -->
              <div v-if="selectedDistrictManager" class="flex items-center gap-2.5 pt-1.5 text-xs">
                <img
                  :src="selectedDistrictManager.avatar"
                  :alt="selectedDistrictManager.name"
                  class="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-400"
                />
                <div class="min-w-0">
                  <p class="font-bold text-slate-900 dark:text-white truncate">
                    {{ selectedDistrictManager.name }}
                  </p>
                  <p class="text-[10px] text-slate-400 truncate">
                    {{ selectedDistrictManager.position }} • {{ selectedDistrictManager.storeLocation }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Hubungan Batch & Status -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            3. Hubungan Batch Misi & Status
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Hubungkan ke Batch Misi -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hubungkan ke Siklus Batch
              </label>
              <select
                v-model="form.batchId"
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              >
                <option :value="null">Belum Ditugaskan ke Batch (Standby)</option>
                <option
                  v-for="b in batchStore.allBatches"
                  :key="b.id"
                  :value="b.id"
                >
                  {{ b.name }} ({{ b.code }}) — {{ b.storeLocation }}
                </option>
              </select>
            </div>

            <!-- Status Outlet -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status Operasional Gerai
              </label>
              <select
                v-model="form.status"
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              >
                <option value="ACTIVE">Aktif (Beroperasi)</option>
                <option value="INACTIVE">Non-Aktif (Tutup Sementara)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/admin/stores"
            class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>Simpan Perubahan Gerai</span>
          </button>
        </div>
      </form>
    </div>

    <div v-else class="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm text-slate-500">Gerai tidak ditemukan.</p>
      <NuxtLink to="/admin/stores" class="mt-3 inline-block text-xs font-bold text-[#831843] hover:underline">
        Kembali ke Direktori Gerai
      </NuxtLink>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :model-value="showDeleteModal"
      title="Hapus Master Gerai?"
      :message="`Apakah Anda yakin ingin menghapus outlet '${store?.name}'? Data gerai dan alokasi penanggung jawab akan dihapus.`"
      confirm-text="Ya, Hapus Gerai"
      cancel-text="Batal"
      variant="danger"
      @update:model-value="showDeleteModal = $event"
      @confirm="handleDeleteStore"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStoreStore } from '~/stores/store.js'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useToast } from '~/composables/useToast.js'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import {
  Store,
  ArrowLeft,
  Check,
  Trash2
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const storeStore = useStoreStore()
const userStore = useUserStore()
const batchStore = useBatchStore()
const toast = useToast()

const storeId = route.params.id
const store = computed(() => storeStore.storeById(storeId))
const showDeleteModal = ref(false)

const form = reactive({
  name: '',
  code: '',
  region: 'Jakarta Pusat',
  mallName: '',
  address: '',
  phone: '',
  openingHours: '10:00 - 22:00',
  storeLeaderId: null,
  districtManagerId: null,
  batchId: null,
  status: 'ACTIVE'
})

onMounted(() => {
  if (store.value) {
    form.name = store.value.name
    form.code = store.value.code
    form.region = store.value.region
    form.mallName = store.value.mallName || ''
    form.address = store.value.address || ''
    form.phone = store.value.phone || ''
    form.openingHours = store.value.openingHours || '10:00 - 22:00'
    form.storeLeaderId = store.value.storeLeaderId
    form.districtManagerId = store.value.districtManagerId
    form.batchId = store.value.batchId || null
    form.status = store.value.status || 'ACTIVE'
  }
})

const selectedStoreLeader = computed(() => {
  return userStore.userById(form.storeLeaderId)
})

const selectedDistrictManager = computed(() => {
  return userStore.userById(form.districtManagerId)
})

const handleUpdate = () => {
  const updated = storeStore.updateStore(storeId, form)
  if (updated) {
    toast.success('Gerai Diperbarui', `Informasi outlet ${updated.name} telah berhasil disimpan.`)
    router.push('/admin/stores')
  }
}

const handleDeleteStore = () => {
  storeStore.deleteStore(storeId)
  toast.success('Gerai Dihapus', `Outlet ${store.value?.name} telah dihapus.`)
  showDeleteModal.value = false
  router.push('/admin/stores')
}
</script>
