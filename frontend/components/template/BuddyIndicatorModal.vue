<template>
  <BaseModal
    :modelValue="modelValue"
    :title="isEditing ? 'Edit Indikator Penilaian' : 'Tambah Indikator Penilaian'"
    :subtitle="`Paket ${activePackage?.name}`"
    max-width="md"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="executeSaveBuddyIndicator" class="space-y-3 py-2">
      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Pilih Kategori Kompetensi *
        </label>
        <select
          v-model="form.competencyId"
          required
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 cursor-pointer font-bold"
        >
          <option
            v-for="comp in activePackage?.competencies"
            :key="comp.id"
            :value="comp.id"
          >
            {{ comp.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Indikator Penilaian *</label>
        <input
          v-model="form.name"
          type="text"
          required
          placeholder="Contoh: Menjelaskan produk & ingredients*"
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi / Panduan Evaluator</label>
        <textarea
          v-model="form.description"
          rows="2"
          placeholder="Kriteria yang dinilai oleh Store Captain saat observasi 3 hari..."
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 resize-none"
        ></textarea>
      </div>

      <div class="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
        <label class="flex items-center gap-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            v-model="form.isStar"
            class="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 accent-purple-600"
          />
          <span class="font-bold text-slate-800 dark:text-slate-200">
            Tandai Bintang (*) — Wajib Pembekalan (Dimaklumi bila belum praktik langsung)
          </span>
        </label>
      </div>

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
          class="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 active:scale-95 cursor-pointer"
        >
          {{ isEditing ? 'Simpan Perubahan' : 'Tambah Indikator' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
import { useBuddyStore } from '~/stores/buddy.js'
import { useToast } from '~/composables/useToast.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  activePackage: {
    type: Object,
    default: null
  },
  initialCompetencyId: {
    type: String,
    default: 'comp-pk'
  },
  editingIndicator: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'saved'])

const buddyStore = useBuddyStore()
const toast = useToast()

const isEditing = computed(() => Boolean(props.editingIndicator))

const form = ref({
  competencyId: 'comp-pk',
  name: '',
  isStar: false,
  description: ''
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    if (props.editingIndicator) {
      form.value = {
        competencyId: props.initialCompetencyId || props.editingIndicator.competencyId || 'comp-pk',
        name: props.editingIndicator.name || '',
        isStar: Boolean(props.editingIndicator.isStar),
        description: props.editingIndicator.description || ''
      }
    } else {
      form.value = {
        competencyId: props.initialCompetencyId || props.activePackage?.competencies?.[0]?.id || 'comp-pk',
        name: '',
        isStar: false,
        description: ''
      }
    }
  }
})

const executeSaveBuddyIndicator = () => {
  if (!props.activePackage || !form.value.name.trim()) return

  if (isEditing.value) {
    buddyStore.updateIndicator(
      props.activePackage.id,
      form.value.competencyId,
      props.editingIndicator.id,
      {
        name: form.value.name.trim(),
        isStar: form.value.isStar,
        description: form.value.description.trim()
      }
    )
    toast.success('Indikator Diperbarui', `Indikator "${form.value.name}" berhasil diupdate.`)
  } else {
    buddyStore.addIndicator(
      props.activePackage.id,
      form.value.competencyId,
      {
        name: form.value.name.trim(),
        isStar: form.value.isStar,
        description: form.value.description.trim()
      }
    )
    toast.success('Indikator Ditambahkan', `Indikator baru berhasil ditambahkan ke kompetensi.`)
  }

  emit('update:modelValue', false)
  emit('saved', { ...form.value })
}
</script>
