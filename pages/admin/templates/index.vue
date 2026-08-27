<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-amber-600 dark:text-amber-400 font-semibold">Mission Templates</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Master Template Misi & Paket Gerai
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Katalog template SOP siap pakai untuk menghasilkan 12 misi operasional per cabang gerai dalam 1 kali klik.
        </p>
      </div>

      <button
        type="button"
        @click="openApplyPackageModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9d174d] to-[#831843] hover:from-[#831843] hover:to-[#6b133a] text-white text-xs font-semibold transition-all shadow-md shadow-[#831843]/25 active:scale-95 cursor-pointer self-start sm:self-auto"
      >
        <Sparkles class="w-4 h-4" />
        <span>⚡ Terapkan Paket 12 Misi ke Gerai</span>
      </button>
    </div>

    <!-- Master Package Highlight Card -->
    <div class="p-6 rounded-3xl bg-gradient-to-br from-[#4a0e28] via-[#831843] to-[#9d174d] text-white relative overflow-hidden shadow-xl border border-white/10">
      <div class="absolute -right-10 -top-10 w-60 h-60 bg-[#831843]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-3 border border-white/15">
            <Sparkles class="w-3.5 h-3.5 fill-amber-300" />
            <span>Master Re.juve SOP Package</span>
          </span>
          <h3 class="text-xl sm:text-2xl font-bold tracking-tight">
            Paket Standar Operasional Gerai (12 Misi / 3 Minggu)
          </h3>
          <p class="text-xs sm:text-sm text-slate-200 mt-1.5 max-w-xl leading-relaxed">
            Mencakup seluruh standar operasional Re.juve: Cold Chain 2-4°C, sanitasi mesin hidrolik, uji Brix kemanisan, rasio ekstraksi 100% #CleanLabel, rekonsiliasi stok, layanan barista, dan sertifikasi HACCP.
          </p>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            @click="openApplyPackageModal"
            class="px-5 py-3 rounded-2xl bg-white text-slate-900 font-semibold text-xs shadow-lg hover:bg-slate-100 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Download class="w-4 h-4 text-[#831843]" />
            <span>Terapkan ke Cabang Gerai</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Template Tabs by Week -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit">
          <button
            v-for="w in [1, 2, 3]"
            :key="w"
            type="button"
            @click="activeWeekTab = w"
            class="px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            :class="[
              activeWeekTab === w
                ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
          >
            Week {{ w }} Templates ({{ templateStore.templatesByWeek(w).length }})
          </button>
        </div>

        <span class="text-xs text-slate-400">
          Total <strong>{{ templateStore.allTemplates.length }} Template</strong> Tersedia
        </span>
      </div>

      <!-- Templates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="tmpl in currentWeekTemplates"
          :key="tmpl.id"
          class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                {{ tmpl.codePrefix }} • Week {{ tmpl.week }}
              </span>
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {{ tmpl.category }}
              </span>
            </div>

            <h4 class="text-sm font-semibold text-slate-900 dark:text-white">
              {{ tmpl.title }}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {{ tmpl.description }}
            </p>

            <!-- Requirements Preview -->
            <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Standard SOP Checklist ({{ tmpl.requirements.length }} Poin):
              </span>
              <ul class="space-y-1">
                <li
                  v-for="(req, idx) in tmpl.requirements"
                  :key="idx"
                  class="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <Check class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{{ req }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Apply Package Modal -->
    <BaseModal
      :modelValue="showApplyModal"
      title="Terapkan Paket 12 Misi ke Cabang Gerai"
      subtitle="Sistem akan otomatis membuat seluruh 12 misi untuk Week 1, 2, dan 3"
      max-width="md"
      @update:modelValue="showApplyModal = $event"
      @close="showApplyModal = false"
    >
      <form @submit.prevent="executeApplyPackage" class="space-y-4 py-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Pilih Cabang Gerai Tujuan *
          </label>
          <select
            v-model="targetBatchId"
            required
            class="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          >
            <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
              {{ b.name.split('—')[1] || b.name }} ({{ b.code }})
            </option>
          </select>
        </div>

        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs space-y-1.5">
          <p class="font-semibold text-slate-900 dark:text-white">Yang akan dibuat otomatis:</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            • 4 Misi Week 1 (Setup, Cold Chain 2-4°C, Sanitasi Swab Test, K3)<br />
            • 4 Misi Week 2 (Ekstraksi 100% Murni, Sanitasi Bar, Stok, Barista)<br />
            • 4 Misi Week 3 (HACCP Certification, Servis Chiller, Sign-off)
          </p>
          <p class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold pt-1">
            ✓ Otomatis menugaskan seluruh Crew yang terdaftar di cabang tersebut.
          </p>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showApplyModal = false"
            class="px-5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#831843] hover:bg-[#701a40] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Terapkan 12 Misi Sekarang
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import { Sparkles, Download, Check } from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const templateStore = useTemplateStore()
const toast = useToast()

const activeWeekTab = ref(1)
const showApplyModal = ref(false)
const targetBatchId = ref(batchStore.selectedBatchId || 'batch-alpha')

const currentWeekTemplates = computed(() => {
  return templateStore.templatesByWeek(activeWeekTab.value)
})

const openApplyPackageModal = () => {
  showApplyModal.value = true
}

const executeApplyPackage = () => {
  const created = templateStore.applyPackageToBatch(targetBatchId.value)
  showApplyModal.value = false
  const targetBatch = batchStore.batchById(targetBatchId.value)
  toast.success('Paket 12 Misi Berhasil Diterapkan!', `12 Misi Operasional Re.juve aktif untuk ${targetBatch?.name.split('—')[1] || targetBatch?.name}.`)
  router.push('/admin/missions')
}
</script>
