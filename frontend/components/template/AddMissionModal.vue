<template>
  <BaseModal
    :modelValue="modelValue"
    title="Tambah Butir SOP Misi"
    :subtitle="`Tambahkan misi standar baru ke paket ${activePackage?.name}`"
    max-width="md"
    @update:modelValue="$emit('update:modelValue', $event)"
    @close="$emit('update:modelValue', false)"
  >
    <form @submit.prevent="executeAddMission" class="space-y-3 py-2">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Pilih Minggu (Week) *
          </label>
          <select
            v-model="newMissionForm.week"
            required
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer"
          >
            <option
              v-for="w in activePackageWeeks"
              :key="w.weekNumber"
              :value="w.weekNumber"
            >
              Week {{ w.weekNumber }} — {{ w.title }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori Misi</label>
          <input
            v-model="newMissionForm.category"
            type="text"
            required
            placeholder="Contoh: Suhu Dingin, Kebersihan, Pelayanan"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Misi SOP *</label>
        <input
          v-model="newMissionForm.title"
          type="text"
          required
          placeholder="Contoh: Cek Kalibrasi Sensorik Rasa Jus"
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi & Tujuan Misi</label>
        <textarea
          v-model="newMissionForm.description"
          rows="2"
          placeholder="Instruksi singkat bagi kru dalam menjalankan SOP ini..."
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
        ></textarea>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Daftar Checklist / Poin SOP (1 baris per poin)
        </label>
        <textarea
          v-model="newMissionForm.requirementsText"
          rows="3"
          placeholder="Cek temperatur chiller di 2-4°C&#10;Catat di logbook fisik dan submit foto"
          class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
        ></textarea>
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
          class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
        >
          Simpan Misi
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseModal from '~/components/ui/BaseModal.vue'
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
  },
  activeWeek: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue', 'added'])

const templateStore = useTemplateStore()
const toast = useToast()

const activePackageWeeks = computed(() => props.activePackage?.weeks || [])

const newMissionForm = ref({
  week: 1,
  title: '',
  category: 'Quality Control',
  description: '',
  requirementsText: ''
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    newMissionForm.value = {
      week: props.activeWeek || 1,
      title: '',
      category: 'Quality Control',
      description: '',
      requirementsText: ''
    }
  }
})

const executeAddMission = () => {
  if (!props.activePackage || !newMissionForm.value.title.trim()) return

  const reqs = newMissionForm.value.requirementsText
    ? newMissionForm.value.requirementsText.split('\n').map(r => r.trim()).filter(Boolean)
    : ['Checklist kepatuhan standar operasional']

  const payload = {
    week: Number(newMissionForm.value.week),
    title: newMissionForm.value.title.trim(),
    category: newMissionForm.value.category.trim(),
    description: newMissionForm.value.description.trim(),
    requirements: reqs
  }

  const added = templateStore.addTemplateToPackage(props.activePackage.id, payload)
  emit('update:modelValue', false)
  emit('added', added)
  toast.success('Misi Ditambahkan', `Misi "${payload.title}" berhasil ditambahkan ke Week ${payload.week}.`)
}
</script>
