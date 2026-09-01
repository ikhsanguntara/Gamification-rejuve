<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
          <span>Administrator</span>
          <span>/</span>
          <span class="text-[#831843] dark:text-[#f472b6] font-semibold">Master Templates</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Master Template SOP Misi
        </h2>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Katalog paket SOP operasional dengan struktur mingguan dinamis siap diterapkan ke gerai.
        </p>
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          @click="openCreatePackageModal"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
        >
          <Plus class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
          <span>Buat Paket Master Baru</span>
        </button>

        <button
          type="button"
          @click="openApplyPackageModal"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold transition-all shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
        >
          <Sparkles class="w-4 h-4" />
          <span>Terapkan ke Gerai</span>
        </button>
      </div>
    </div>

    <!-- 2-Column Workspace -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- KOLOM KIRI: DAFTAR PAKET MASTER (4/12) -->
      <div class="lg:col-span-4 space-y-3">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Daftar Paket Template ({{ templateStore.allPackages.length }})
        </h3>

        <div class="space-y-2">
          <div
            v-for="pkg in templateStore.allPackages"
            :key="pkg.id"
            @click="selectPackageTab(pkg.id)"
            class="p-4 rounded-2xl border transition-all cursor-pointer relative"
            :class="[
              templateStore.selectedPackageId === pkg.id
                ? 'border-[#831843] bg-white dark:bg-slate-900 ring-2 ring-[#831843]/40 shadow-xs'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-slate-300'
            ]"
          >
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                {{ pkg.code }}
              </span>
              <div class="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                <span>{{ (pkg.weeks || []).length || pkg.totalWeeks || 3 }} Minggu</span>
                <span>•</span>
                <span>{{ pkg.templates.length }} Misi</span>
              </div>
            </div>

            <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
              {{ pkg.name }}
            </h4>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
              {{ pkg.description }}
            </p>

            <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span class="text-slate-400 font-medium">🎯 {{ pkg.targetType }}</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  @click.stop="duplicatePackage(pkg.id)"
                  title="Duplikat Paket"
                  class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                >
                  <Copy class="w-3 h-3" />
                </button>
                <button
                  v-if="templateStore.allPackages.length > 1"
                  type="button"
                  @click.stop="confirmDeletePackage(pkg)"
                  title="Hapus Paket"
                  class="p-1 text-rose-400 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- KOLOM KANAN: DETAIL PAKET & TABS MINGGUAN (8/12) -->
      <div class="lg:col-span-8">
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-5">
          
          <!-- Package Header Summary -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-[#831843] text-white">
                  {{ activePackage?.code }}
                </span>
                <span class="text-xs font-bold text-slate-900 dark:text-white">
                  {{ activePackage?.name }}
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ activePackage?.description }}
              </p>
            </div>

            <button
              type="button"
              @click="openAddMissionModal"
              class="px-3.5 py-2 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus class="w-3.5 h-3.5" />
              <span>Tambah Butir SOP</span>
            </button>
          </div>

          <!-- Week Tabs via Reka UI dengan Dukungan Lebih dari 3 Week & Judul Week -->
          <TabsRoot :model-value="String(activeWeekTab)" @update:model-value="activeWeekTab = Number($event)" class="w-full space-y-4">
            
            <!-- Week Selector Navigation & Add Week Button -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-2 flex-wrap">
                <TabsList class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit max-w-full overflow-x-auto">
                  <TabsTrigger
                    v-for="w in activePackageWeeks"
                    :key="w.weekNumber"
                    :value="String(w.weekNumber)"
                    class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 cursor-pointer data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#831843] dark:data-[state=active]:text-[#f472b6] data-[state=active]:shadow-2xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-hidden"
                  >
                    Week {{ w.weekNumber }} ({{ templateStore.templatesByWeek(w.weekNumber).length }})
                  </TabsTrigger>
                </TabsList>

                <!-- Tombol Tambah Week Baru (Bisa lebih dari 3 week) -->
                <button
                  type="button"
                  @click="handleAddNewWeek"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-[#831843]/40 hover:border-[#831843] bg-[#831843]/5 hover:bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] text-xs font-bold transition-all cursor-pointer active:scale-95"
                  title="Tambah Minggu Baru (Week 4, Week 5, dst)"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Tambah Week</span>
                </button>
              </div>

              <div class="flex items-center gap-2 text-xs text-slate-400">
                <span>{{ activePackageWeeks.length }} Minggu</span>
                <span>•</span>
                <span>Total <strong>{{ activePackage?.templates.length || 0 }} Misi</strong></span>
              </div>
            </div>

            <!-- Banner Judul Tema Week yang Aktif (Bisa Diedit) -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex items-center gap-2.5 flex-1 min-w-0">
                <div class="w-8 h-8 rounded-xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center font-bold flex-shrink-0">
                  <Bookmark class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Judul Tema Week {{ activeWeekTab }}
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="currentWeekTitle"
                      @blur="saveCurrentWeekTitle"
                      @keyup.enter="saveCurrentWeekTitle"
                      type="text"
                      placeholder="Contoh: Minggu 1: Suhu & Sanitasi Dasar"
                      class="w-full text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
                    />
                    <button
                      type="button"
                      @click="saveCurrentWeekTitle"
                      class="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 cursor-pointer flex-shrink-0"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              </div>

              <!-- Tombol Hapus Week Ini jika lebih dari 1 week -->
              <button
                v-if="activePackageWeeks.length > 1"
                type="button"
                @click="handleRemoveCurrentWeek"
                class="text-xs text-rose-500 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1 self-end sm:self-center cursor-pointer"
                title="Hapus minggu ini beserta misinya"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>Hapus Week {{ activeWeekTab }}</span>
              </button>
            </div>

            <!-- Tabs Content List Misi per-Week -->
            <TabsContent
              v-for="w in activePackageWeeks"
              :key="w.weekNumber"
              :value="String(w.weekNumber)"
              class="focus:outline-hidden space-y-3"
            >
              <!-- Empty State jika belum ada misi di week ini -->
              <div
                v-if="templateStore.templatesByWeek(w.weekNumber).length === 0"
                class="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2"
              >
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Belum ada butir SOP misi yang ditambahkan untuk <strong>Week {{ w.weekNumber }} ({{ w.title }})</strong>.
                </p>
                <button
                  type="button"
                  @click="openAddMissionModal"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus class="w-3.5 h-3.5" />
                  <span>Tambah Misi Pertama di Week Ini</span>
                </button>
              </div>

              <!-- List Kartu Butir Misi SOP -->
              <div v-else class="space-y-3">
                <div
                  v-for="tmpl in templateStore.templatesByWeek(w.weekNumber)"
                  :key="tmpl.id"
                  class="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-2 relative group hover:border-[#831843]/30 transition-all"
                >
                  <div class="flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {{ tmpl.codePrefix }}
                      </span>
                      <h4 class="text-xs font-bold text-slate-900 dark:text-white">
                        {{ tmpl.title }}
                      </h4>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="text-[10px] font-medium px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-700">
                        {{ tmpl.category }}
                      </span>
                      <button
                        type="button"
                        @click="removeMission(tmpl.id)"
                        class="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-600 transition-opacity cursor-pointer"
                        title="Hapus Misi"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {{ tmpl.description }}
                  </p>

                  <!-- SOP Points / Checklist -->
                  <div class="pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1">
                    <div
                      v-for="(req, idx) in tmpl.requirements"
                      :key="idx"
                      class="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5"
                    >
                      <Check class="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{{ req }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </TabsRoot>

        </div>
      </div>

    </div>

    <!-- MODAL 1: BUAT MASTER PAKET BARU -->
    <BaseModal
      :modelValue="showCreatePackageModal"
      title="Buat Master Paket Baru"
      subtitle="Definisikan nama, jumlah minggu, dan format gerai untuk paket template ini"
      max-width="sm"
      @update:modelValue="showCreatePackageModal = $event"
      @close="showCreatePackageModal = false"
    >
      <form @submit.prevent="executeCreatePackage" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Paket *</label>
          <input
            v-model="newPkgForm.name"
            type="text"
            required
            placeholder="Contoh: Standar Gerai Bandara & Kiosk"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Format Gerai</label>
            <input
              v-model="newPkgForm.targetType"
              type="text"
              placeholder="Kiosk / Mall / Standalone"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Jumlah Minggu (Week)</label>
            <input
              v-model.number="newPkgForm.totalWeeks"
              type="number"
              min="1"
              max="12"
              required
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
          <input
            v-model="newPkgForm.category"
            type="text"
            placeholder="Standar Operasional / Onboarding"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Paket</label>
          <textarea
            v-model="newPkgForm.description"
            rows="2"
            placeholder="Penjelasan ringkas fokus kurikulum paket..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
          ></textarea>
        </div>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showCreatePackageModal = false"
            class="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#831843] hover:bg-[#6b133a] text-white shadow-md shadow-[#831843]/20 active:scale-95 cursor-pointer"
          >
            Simpan Paket
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- MODAL 2: TAMBAH BUTIR SOP MISI BARU -->
    <BaseModal
      :modelValue="showAddMissionModal"
      title="Tambah Butir SOP Misi"
      :subtitle="`Tambahkan misi standar baru ke paket ${activePackage?.name}`"
      max-width="md"
      @update:modelValue="showAddMissionModal = $event"
      @close="showAddMissionModal = false"
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
            @click="showAddMissionModal = false"
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

    <!-- MODAL 3: TERAPKAN PAKET KE GERAI / BATCH -->
    <BaseModal
      :modelValue="showApplyModal"
      title="Terapkan Paket Template ke Gerai / Batch"
      :subtitle="`Menerapkan seluruh butir misi dari ${activePackage?.name} ke Batch gerai aktif`"
      max-width="sm"
      @update:modelValue="showApplyModal = $event"
      @close="showApplyModal = false"
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
          Seluruh {{ activePackage?.templates.length }} butir misi SOP dan {{ activePackageWeeks.length }} tema mingguan akan otomatis diterapkan untuk batch yang dipilih.
        </p>

        <div class="pt-3 flex items-center justify-end gap-3">
          <button
            type="button"
            @click="showApplyModal = false"
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent
} from 'reka-ui'
import { useBatchStore } from '~/stores/batch.js'
import { useTemplateStore } from '~/stores/template.js'
import { useToast } from '~/composables/useToast.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  Sparkles,
  Check,
  Plus,
  Copy,
  Trash2,
  Bookmark
} from 'lucide-vue-next'

const router = useRouter()
const batchStore = useBatchStore()
const templateStore = useTemplateStore()
const toast = useToast()

const activeWeekTab = ref(1)
const currentWeekTitle = ref('')
const showApplyModal = ref(false)
const showCreatePackageModal = ref(false)
const showAddMissionModal = ref(false)

const targetBatchId = ref(batchStore.selectedBatchId || 'batch-alpha')

const activePackage = computed(() => templateStore.currentPackage)

const activePackageWeeks = computed(() => {
  return templateStore.packageWeeks(activePackage.value?.id)
})

// Sync week title when activeWeekTab or activePackage changes
const syncWeekTitle = () => {
  const currentWeekObj = activePackageWeeks.value.find(w => w.weekNumber === Number(activeWeekTab.value))
  currentWeekTitle.value = currentWeekObj ? currentWeekObj.title : `Minggu ${activeWeekTab.value}: Tema SOP`
}

watch([activeWeekTab, activePackage], () => {
  syncWeekTitle()
}, { immediate: true })

const selectPackageTab = (pkgId) => {
  templateStore.selectPackage(pkgId)
  activeWeekTab.value = 1
  syncWeekTitle()
}

const saveCurrentWeekTitle = () => {
  if (!currentWeekTitle.value.trim() || !activePackage.value) return
  templateStore.updateWeekTitle(activePackage.value.id, activeWeekTab.value, currentWeekTitle.value.trim())
  toast.success('Judul Week Disimpan', `Judul Week ${activeWeekTab.value} berhasil diperbarui.`)
}

const handleAddNewWeek = () => {
  if (!activePackage.value) return
  const created = templateStore.addWeekToPackage(activePackage.value.id)
  if (created) {
    activeWeekTab.value = created.weekNumber
    syncWeekTitle()
    toast.success('Week Ditambahkan', `Week ${created.weekNumber} siap ditambahkan butir SOP.`)
  }
}

const handleRemoveCurrentWeek = () => {
  if (!activePackage.value) return
  if (confirm(`Hapus Week ${activeWeekTab.value} beserta seluruh misi di dalamnya?`)) {
    const success = templateStore.removeWeekFromPackage(activePackage.value.id, activeWeekTab.value)
    if (success) {
      activeWeekTab.value = 1
      syncWeekTitle()
      toast.info('Week Dihapus', 'Minggu beserta seluruh butir SOP di dalamnya telah dihapus.')
    }
  }
}

// Package Creation Form
const newPkgForm = ref({
  name: '',
  category: 'Standar Operasional',
  targetType: 'Gerai Flagship',
  totalWeeks: 3,
  description: ''
})

// Mission Template Creation Form
const newMissionForm = ref({
  week: 1,
  title: '',
  category: 'Quality Control',
  description: '',
  requirementsText: ''
})

const openCreatePackageModal = () => {
  newPkgForm.value = {
    name: '',
    category: 'Standar Operasional',
    targetType: 'Gerai Flagship',
    totalWeeks: 3,
    description: ''
  }
  showCreatePackageModal.value = true
}

const executeCreatePackage = () => {
  const created = templateStore.createPackage({
    ...newPkgForm.value,
    code: `PKG-0${templateStore.allPackages.length + 1}`
  })
  showCreatePackageModal.value = false
  activeWeekTab.value = 1
  syncWeekTitle()
  toast.success('Paket Dibuat', `Paket "${created.name}" dengan ${created.totalWeeks} minggu siap digunakan.`)
}

const duplicatePackage = (pkgId) => {
  const dup = templateStore.duplicatePackage(pkgId)
  if (dup) {
    toast.success('Paket Diduplikasi', `Salinan "${dup.name}" berhasil dibuat.`)
  }
}

const confirmDeletePackage = (pkg) => {
  if (confirm(`Hapus paket master "${pkg.name}"?`)) {
    templateStore.deletePackage(pkg.id)
    toast.info('Paket Dihapus', `Paket "${pkg.name}" telah dihapus.`)
  }
}

const openAddMissionModal = () => {
  newMissionForm.value = {
    week: activeWeekTab.value,
    title: '',
    category: 'Standar Operasional',
    description: '',
    requirementsText: ''
  }
  showAddMissionModal.value = true
}

const executeAddMission = () => {
  const reqs = newMissionForm.value.requirementsText
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean)

  templateStore.addMissionToPackage(activePackage.value.id, {
    ...newMissionForm.value,
    codePrefix: `M-0${(activePackage.value?.templates.length || 0) + 1}`,
    requirements: reqs.length > 0 ? reqs : ['Pemeriksaan kepatuhan standar SOP Re.juve']
  })

  showAddMissionModal.value = false
  toast.success('Butir SOP Ditambahkan', `Misi "${newMissionForm.value.title}" ditambahkan ke Week ${newMissionForm.value.week}.`)
}

const removeMission = (tmplId) => {
  if (confirm('Hapus butir SOP ini?')) {
    templateStore.removeMissionFromPackage(activePackage.value.id, tmplId)
    toast.info('Butir SOP Dihapus', 'Misi telah dihapus dari paket.')
  }
}

const openApplyPackageModal = () => {
  showApplyModal.value = true
}

const executeApplyPackage = () => {
  const created = templateStore.applyPackageToBatch(targetBatchId.value, activePackage.value.id)
  showApplyModal.value = false
  const targetBatch = batchStore.batchById(targetBatchId.value)
  toast.success(
    'Paket SOP Diterapkan!',
    `${created.length} Misi dari "${activePackage.value?.name}" aktif untuk ${targetBatch?.name || 'Batch'}.`
  )
  router.push('/admin/missions')
}
</script>
