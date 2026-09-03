<template>
  <BaseModal
    :modelValue="modelValue"
    title="Terapkan Paket Template ke Gerai / Batch"
    :subtitle="`Menerapkan seluruh butir misi dari ${activePackage?.name} ke Batch gerai aktif`"
    max-width="sm"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="executeApplyPackage" class="space-y-4 py-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Pilih Target Batch Gerai *
        </label>
        <select
          v-model="targetBatchId"
          required
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
        >
          <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
            {{ b.name }} — {{ b.storeLocation }}
          </option>
        </select>
      </div>

      <p class="text-[11px] text-slate-500">
        Seluruh {{ activePackage?.templates?.length || 0 }} butir misi SOP dan {{ activePackageWeeks.length }} tema mingguan akan otomatis diterapkan untuk batch yang dipilih.
      </p>

      <div class="pt-3 flex items-center justify-end gap-3">
        <button
          type="button"
          @click="$emit('update:modelValue', false)"
          class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
        >
          Terapkan Sekarang
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { useBatchStore } from '~/stores/batch.js'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  activePackage: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'applied'])

const batchStore = useBatchStore()
const templateStore = useTemplateStore()
const toast = useToast()

const targetBatchId = ref('bth-001')
const activePackageWeeks = computed(() => props.activePackage?.weeks || [])

const executeApplyPackage = () => {
  if (!props.activePackage) return
  const createdMissions = templateStore.applyPackageToBatch(targetBatchId.value, props.activePackage.id)
  emit('update:modelValue', false)
  emit('applied', { targetBatchId: targetBatchId.value, missionsCount: createdMissions.length })
  toast.success('Paket SOP Berhasil Diterapkan', `${createdMissions.length} butir misi telah di-generate untuk batch tujuan.`)
}
</script>
