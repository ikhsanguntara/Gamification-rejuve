<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Kebijakan & Aturan Pengguna (User Policies)
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
            {{ totalPolicies }} Kebijakan
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola syarat kepatuhan, privasi, dan regulasi internal onboarding karyawan Re.juve.
        </p>
      </div>

      <button
        type="button"
        @click="openCreateModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>Tambah Kebijakan Baru</span>
      </button>
    </div>

    <!-- Search Toolbar -->
    <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="relative w-full sm:w-80">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode atau isi kebijakan..."
          class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
        />
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>
    </div>

    <!-- Table Card -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50/80 dark:bg-slate-800/60 text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th class="py-3.5 px-6">Urutan</th>
              <th class="py-3.5 px-6">Kode Kebijakan</th>
              <th class="py-3.5 px-6">Isi Kebijakan</th>
              <th class="py-3.5 px-6">Catatan Informasi</th>
              <th class="py-3.5 px-6 text-center">Aturan Wajib</th>
              <th class="py-3.5 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
            <tr
              v-for="p in policies"
              :key="p.userpolicyId"
              class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="py-3.5 px-6 font-bold text-slate-400">
                #{{ p.displayOrder || 1 }}
              </td>
              <td class="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#831843] dark:text-[#f472b6]">
                  {{ p.userpolicyCode }}
                </span>
              </td>
              <td class="py-3.5 px-6 font-medium text-slate-800 dark:text-slate-200 max-w-xs truncate">
                {{ p.userpolicyValue }}
              </td>
              <td class="py-3.5 px-6 text-slate-500">
                {{ p.informationRemark || '-' }}
              </td>
              <td class="py-3.5 px-6 text-center">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  :class="p.isRules ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'"
                >
                  {{ p.isRules ? 'WAJIB' : 'OPSIONAL' }}
                </span>
              </td>
              <td class="py-3.5 px-6 text-right">
                <div class="inline-flex items-center gap-2">
                  <button
                    type="button"
                    @click="openEditModal(p)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-[#831843] hover:bg-[#831843]/10 transition-colors cursor-pointer"
                    title="Edit Kebijakan"
                  >
                    <Edit3 class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    @click="confirmDelete(p)"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Hapus Kebijakan"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="policies.length === 0 && !isLoading">
              <td colspan="6" class="py-12 text-center text-slate-400">
                Belum ada kebijakan pengguna yang didaftarkan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- App Pagination -->
      <div v-if="totalPolicies > 0" class="p-4 border-t border-slate-100 dark:border-slate-800">
        <AppPagination
          v-model:current-page="currentPage"
          :total-items="totalPolicies"
          :items-per-page="itemsPerPage"
          item-label="kebijakan"
        />
      </div>
    </div>

    <!-- Modal Form Tambah/Edit Policy -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">
          {{ isEditMode ? 'Perbarui Kebijakan Pengguna' : 'Tambah Kebijakan Baru' }}
        </h3>

        <form @submit.prevent="savePolicy" class="space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Kebijakan</label>
              <input
                v-model="form.userpolicyCode"
                type="text"
                required
                :disabled="isEditMode"
                placeholder="e.g. PRIVACY_POLICY_2026"
                class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 uppercase font-mono text-slate-900 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Urutan Tampil</label>
              <input
                v-model.number="form.displayOrder"
                type="number"
                min="1"
                required
                class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Isi Kebijakan</label>
            <textarea
              v-model="form.userpolicyValue"
              rows="3"
              required
              placeholder="e.g. Seluruh kru wajib mematuhi standar kebersihan dan kerahasiaan SOP."
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white"
            ></textarea>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan Informasi</label>
            <input
              v-model="form.informationRemark"
              type="text"
              placeholder="e.g. Wajib disetujui saat onboarding"
              class="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white"
            />
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input
              id="isRulesCheck"
              v-model="form.isRules"
              type="checkbox"
              class="w-4 h-4 rounded text-[#831843] focus:ring-[#831843]"
            />
            <label for="isRulesCheck" class="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Merupakan Aturan Wajib (Rules)
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSaving"
              class="px-5 py-2.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white font-semibold shadow-md shadow-[#831843]/20 cursor-pointer disabled:opacity-50"
            >
              {{ isSaving ? 'Menyimpan...' : 'Simpan Kebijakan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <ConfirmationModal
      :model-value="showDeleteModal"
      title="Hapus Kebijakan Pengguna?"
      :message="`Apakah Anda yakin ingin menghapus '${policyToDelete?.userpolicyCode}'?`"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      variant="danger"
      @update:model-value="showDeleteModal = $event"
      @confirm="deletePolicy"
    />
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { adminApi } from '~/services/api.js'
import { buildPrismaQuery } from '~/utils/queryBuilder.js'
import { useToast } from '~/composables/useToast.js'
import AppPagination from '~/components/ui/AppPagination.vue'
import ConfirmationModal from '~/components/ui/ConfirmationModal.vue'
import { Plus, Search, Edit3, Trash2 } from 'lucide-vue-next'

const toast = useToast()

const policies = ref([])
const totalPolicies = ref(0)
const isLoading = ref(false)
const isSaving = ref(false)

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const showModal = ref(false)
const isEditMode = ref(false)
const form = ref({
  userpolicyId: '',
  userpolicyCode: '',
  userpolicyValue: '',
  informationRemark: '',
  isRules: true,
  displayOrder: 1,
  objectCode: 'USERPOLICY'
})

const showDeleteModal = ref(false)
const policyToDelete = ref(null)

const loadPolicies = async (page = 1) => {
  isLoading.value = true
  try {
    const contains = {}
    if (searchQuery.value.trim()) {
      contains.userpolicyCode = searchQuery.value.trim().toUpperCase()
    }

    const query = buildPrismaQuery({
      page,
      limit: itemsPerPage,
      contains
    })

    const res = await adminApi.getUserPolicies(query)
    if (res && res.data) {
      policies.value = res.data
      const meta = res.meta || res.pagination || {}
      totalPolicies.value = meta.total !== undefined ? meta.total : res.data.length
    }
  } catch (err) {
    console.warn('loadPolicies error:', err.message)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadPolicies(1)
})

watch(currentPage, (newPage) => {
  loadPolicies(newPage)
})

let searchTimer = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    loadPolicies(1)
  }, 350)
})

const openCreateModal = () => {
  isEditMode.value = false
  form.value = {
    userpolicyId: '',
    userpolicyCode: '',
    userpolicyValue: '',
    informationRemark: '',
    isRules: true,
    displayOrder: policies.value.length + 1,
    objectCode: 'USERPOLICY'
  }
  showModal.value = true
}

const openEditModal = (p) => {
  isEditMode.value = true
  form.value = {
    userpolicyId: p.userpolicyId,
    userpolicyCode: p.userpolicyCode,
    userpolicyValue: p.userpolicyValue,
    informationRemark: p.informationRemark || '',
    isRules: Boolean(p.isRules),
    displayOrder: p.displayOrder || 1,
    objectCode: p.objectCode || 'USERPOLICY'
  }
  showModal.value = true
}

const savePolicy = async () => {
  isSaving.value = true
  try {
    if (isEditMode.value) {
      await adminApi.updateUserPolicy(form.value.userpolicyId, {
        userpolicyValue: form.value.userpolicyValue,
        informationRemark: form.value.informationRemark,
        displayOrder: form.value.displayOrder,
        isRules: form.value.isRules
      })
      toast.success('Kebijakan Diperbarui', `Kebijakan ${form.value.userpolicyCode} telah diperbarui.`)
    } else {
      await adminApi.createUserPolicy({
        userpolicyCode: form.value.userpolicyCode.toUpperCase().trim(),
        userpolicyValue: form.value.userpolicyValue.trim(),
        informationRemark: form.value.informationRemark?.trim() || null,
        isRules: form.value.isRules,
        displayOrder: form.value.displayOrder || 1,
        objectCode: 'USERPOLICY'
      })
      toast.success('Kebijakan Dibuat', `Kebijakan baru ${form.value.userpolicyCode} berhasil disimpan.`)
    }
    showModal.value = false
    loadPolicies(currentPage.value)
  } catch (err) {
    toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan data.')
  } finally {
    isSaving.value = false
  }
}

import { confirmDeleteDialog } from '~/utils/dialog.js'

const confirmDelete = async (p) => {
  const isConfirmed = await confirmDeleteDialog({
    title: 'Hapus Kebijakan Pengguna?',
    text: `Apakah Anda yakin ingin menghapus kebijakan "${p.userpolicyCode}"?`,
    confirmButtonText: 'Ya, Hapus Kebijakan'
  })

  if (isConfirmed) {
    try {
      await adminApi.deleteUserPolicy(p.userpolicyId)
      toast.success('Kebijakan Dihapus', `Kebijakan ${p.userpolicyCode} telah dihapus.`)
      loadPolicies(1)
    } catch (err) {
      toast.error('Gagal Menghapus', err.message || 'Tidak dapat menghapus data.')
    }
  }
}
</script>
