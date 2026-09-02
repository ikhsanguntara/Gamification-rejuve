<template>
  <div class="w-full space-y-6">
    <!-- Breadcrumb & Back -->
    <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <NuxtLink to="/admin/batches" class="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Kembali ke Daftar Batch</span>
      </NuxtLink>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200">Edit Batch: {{ batch?.name }}</span>
    </div>

    <!-- Error State -->
    <div v-if="!batch" class="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
      <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">Batch tidak ditemukan.</p>
      <NuxtLink to="/admin/batches" class="text-xs text-[#831843] font-semibold mt-2 inline-block">Kembali ke Daftar</NuxtLink>
    </div>

    <!-- Main Clean Card Form -->
    <div v-else class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div class="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div class="w-10 h-10 rounded-2xl bg-[#831843]/10 flex items-center justify-center text-[#831843]">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">
            Pengaturan & Penugasan: {{ batch.name }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Perbarui data siklus batch, template pendampingan Buddy, kurikulum SOP mingguan, dan sesuaikan anggota kru.
          </p>
        </div>
      </div>

      <form @submit.prevent="handleUpdate" class="space-y-6 pt-6">
        
        <!-- 1. Informasi Siklus Batch & Periode Pelaksanaan -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            1. Informasi Siklus Batch & Periode Pelaksanaan
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Nama Batch -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nama Siklus Batch *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <!-- Kode Batch -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kode Batch</label>
              <input
                v-model="form.code"
                type="text"
                readonly
                class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Deskripsi / Cakupan Lokasi -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cakupan / Catatan Batch *
              </label>
              <input
                v-model="form.storeLocation"
                type="text"
                required
                placeholder="Contoh: Multi-Store (Seluruh Cabang Re.juve)"
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>

            <!-- Min. Skor Bintang 5 -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Min. Skor Bintang 5</label>
              <input
                v-model.number="form.approvalConfig.minScoreFor5Stars"
                type="number"
                min="50"
                max="100"
                required
                class="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
              />
            </div>
          </div>

          <!-- Tanggal Mulai & Tanggal Selesai (Auto-Calculate Sesuai Durasi Minggu) -->
          <div class="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-300/40 dark:border-amber-700/40">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                    <span>Tanggal Mulai Siklus *</span>
                  </span>
                  <span class="text-[10px] text-slate-400 font-medium">Pilih Tanggal Mulai</span>
                </label>
                <input
                  v-model="form.startDate"
                  type="date"
                  required
                  class="w-full text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
                />
                <p class="text-[11px] text-slate-400 mt-1">Awal pembukaan misi Week 1.</p>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <Calendar class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                    <span>Tanggal Selesai Siklus</span>
                  </span>
                  <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                    ⚡ Auto (+{{ templateDurationDays }} Hari / {{ templateTotalWeeks }} Minggu)
                  </span>
                </label>
                <input
                  :value="form.endDate"
                  type="date"
                  readonly
                  class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
                />
                <p class="text-[11px] text-slate-400 mt-1">
                  Dihitung otomatis {{ templateTotalWeeks }} minggu ({{ templateDurationDays }} hari) dari tanggal mulai.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Pilihan Paket Template Misi Buddy (3 Hari Pre-Batch Khusus Store Leader) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                2. Pilihan Paket Template Misi Buddy (Pre-Batch 3 Hari)
              </h3>
              <p class="text-[11px] text-slate-400">
                Program orientasi & pendampingan oleh <strong>Store Leader (SL)</strong> sebelum kru memulai batch resmi.
              </p>
            </div>
            <span v-if="form.buddyPackageId !== 'NONE'" class="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full">
              🤝 Periode Buddy: {{ buddyDateRangeText }}
            </span>
          </div>

          <div class="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Pilih Kurikulum Template Misi Buddy
              </label>
              <select
                v-model="form.buddyPackageId"
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 cursor-pointer shadow-2xs"
              >
                <option v-for="bpkg in buddyStore.allPackages" :key="bpkg.id" :value="bpkg.id">
                  {{ bpkg.name }} ({{ bpkg.totalDays }} Hari Pra-Batch • {{ bpkg.code }})
                </option>
                <option value="NONE">-- Lewati / Tanpa Program Buddy --</option>
              </select>
            </div>

            <!-- Pratinjau 3 Hari Misi Buddy -->
            <div v-if="selectedBuddyPackage" class="pt-2 border-t border-purple-200/60 dark:border-purple-800/40">
              <div class="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                📋 Pratinjau Modul Pendampingan ({{ selectedBuddyPackage.days.length }} Hari):
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div
                  v-for="bday in selectedBuddyPackage.days"
                  :key="bday.dayNumber"
                  class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/60 text-xs space-y-1"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-purple-700 dark:text-purple-300">Hari {{ bday.dayNumber }} (H-{{ bday.offsetDays }})</span>
                    <span class="text-[10px] text-slate-400 font-semibold">{{ bday.missions.length }} Butir SOP</span>
                  </div>
                  <p class="text-[11px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {{ bday.title }}
                  </p>
                  <span class="inline-block text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Fokus: {{ bday.focus }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Paket Template SOP Misi -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Pilihan Paket Template Misi Reguler SOP
              </h3>
              <p class="text-[11px] text-slate-400">
                Pilih kurikulum kompetisi mingguan yang akan dijalani kru di seluruh gerai.
              </p>
            </div>
            <NuxtLink to="/admin/templates" class="text-[11px] text-[#831843] dark:text-[#f472b6] font-semibold hover:underline">
              Kelola Master Template →
            </NuxtLink>
          </div>

          <div class="p-4 rounded-2xl bg-[#831843]/5 border border-[#831843]/15 space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Pilih Paket Master Template SOP
              </label>
              <select
                v-model="form.templatePackageId"
                @change="onTemplatePackageChange"
                class="w-full text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843] cursor-pointer shadow-2xs"
              >
                <option v-for="pkg in templateStore.allPackages" :key="pkg.id" :value="pkg.id">
                  {{ pkg.name }} ({{ (pkg.weeks || []).length || pkg.totalWeeks || 3 }} Minggu • {{ pkg.templates.length }} Misi • {{ pkg.targetType }})
                </option>
                <option value="NONE">-- Tidak Mengubah Template / Kustom --</option>
              </select>
            </div>

            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Status Misi Batch: <strong>{{ batchMissions.length }} Misi</strong> terdaftar.</span>
              <button
                v-if="form.templatePackageId !== 'NONE'"
                type="button"
                @click="applyTemplateNow"
                class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#831843] hover:bg-[#6b133a] text-white shadow-xs transition-all cursor-pointer"
              >
                Terapkan Template ke Batch Ini
              </button>
            </div>

            <!-- Tema & Judul Siklus Mingguan Dinamis (Terkunci dari Template) -->
            <div class="pt-2 border-t border-[#831843]/15 space-y-2">
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-bold text-slate-700 dark:text-slate-300">
                  📌 Struktur {{ form.weeks.length }} Mingguan (Otomatis dari Template):
                </span>
                <span class="text-emerald-600 dark:text-emerald-400 font-bold">
                  ✨ {{ form.weeks.length }} Minggu Dikonfigurasi
                </span>
              </div>

              <div
                class="grid gap-2.5"
                :class="[
                  form.weeks.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' :
                  form.weeks.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                ]"
              >
                <div
                  v-for="w in form.weeks"
                  :key="w.weekNumber"
                  class="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1"
                >
                  <div class="flex items-center justify-between">
                    <label class="block text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      Judul Minggu {{ w.weekNumber }}
                    </label>
                    <span class="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                      🔒 Template
                    </span>
                  </div>
                  <input
                    :value="w.title"
                    type="text"
                    readonly
                    disabled
                    class="w-full text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 cursor-not-allowed select-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Penanggung Jawab Evaluasi & Approval (Desentralisasi per-Store Kru) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
              4. Desentralisasi Penanggung Jawab Evaluasi & Approval
            </h3>
            <span class="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
              ⚡ Otomatis per-Store Penugasan Kru
            </span>
          </div>

          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <p class="text-xs text-slate-600 dark:text-slate-300">
              ℹ️ Seluruh penilaian misi dan persetujuan (approval) untuk kru di dalam batch ini <strong>tidak dikunci ke 1 orang manajer</strong>, melainkan <strong>otomatis mengikuti Store Leader (SL) dan District Manager (DM) dari Store tempat masing-masing kru bertugas</strong>.
            </p>

            <!-- Breakdown Gerai yang Terlibat Berdasarkan Kru Terpilih -->
            <div v-if="participatingStores.length > 0" class="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700">
              <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Gerai & Penanggung Jawab Terlibat ({{ participatingStores.length }} Outlet):
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <div
                  v-for="st in participatingStores"
                  :key="st.id"
                  class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-900 dark:text-white truncate">{{ st.name }}</span>
                    <span class="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                      {{ st.crewCount }} Kru
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-0.5">
                    <span>👔 SL: <strong>{{ st.storeLeader?.name || 'Belum Ditugaskan' }}</strong></span>
                    <span>🛡️ DM: <strong>{{ st.districtManager?.name || 'Belum Ditugaskan' }}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Pilih Anggota Crew (Disaring: Kru Batch Ini / Belum Pernah Ikut & per-Gerai) -->
        <div class="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  5. Anggota Kru yang Ditugaskan ({{ form.assignment.crewIds.length }} Terpilih)
                </h3>
              </div>
              <p class="text-[11px] text-slate-400">Pilih kru yang tergabung di dalam program Buddy dan siklus batch ini.</p>
            </div>
            
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Filter Mode Tabs -->
              <div class="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                <button
                  type="button"
                  @click="crewFilterMode = 'AVAILABLE'"
                  class="px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px]"
                  :class="crewFilterMode === 'AVAILABLE' ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
                >
                  Batch Ini & Kru Standby ({{ availableCrews.length }})
                </button>
                <button
                  type="button"
                  @click="crewFilterMode = 'ALL'"
                  class="px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px]"
                  :class="crewFilterMode === 'ALL' ? 'bg-white dark:bg-slate-900 text-[#831843] dark:text-[#f472b6] shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
                >
                  Semua Kru ({{ allCrews.length }})
                </button>
              </div>

              <!-- Filter per-Store Button Dropdown -->
              <select
                v-model="crewStoreFilter"
                class="text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <option value="ALL">Semua Gerai</option>
                <option v-for="st in storeStore.allStores" :key="st.id" :value="st.id">
                  {{ st.name }}
                </option>
              </select>

              <button
                type="button"
                @click="selectAllCrew"
                class="text-xs text-[#831843] dark:text-[#f472b6] font-semibold hover:underline cursor-pointer"
              >
                Pilih Semua
              </button>
              <span class="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                @click="form.assignment.crewIds = []"
                class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Kosongkan
              </button>
            </div>
          </div>

          <!-- Tags Container -->
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
            <div v-if="displayedCrews.length === 0" class="p-6 text-center text-xs text-slate-400">
              Tidak ada kru yang cocok dengan filter yang dipilih.
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <button
                v-for="crew in displayedCrews"
                :key="crew.id"
                type="button"
                @click="toggleCrewSelection(crew.id)"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border"
                :class="[
                  form.assignment.crewIds.includes(crew.id)
                    ? 'bg-[#831843] text-white border-[#831843] shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                ]"
              >
                <img
                  :src="crew.avatar"
                  :alt="crew.name"
                  class="w-5 h-5 rounded-full object-cover"
                />
                <span class="font-bold">{{ crew.name }}</span>
                <span class="text-[10px] opacity-85 px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                  🏪 {{ crew.storeLocation || 'Standby' }}
                </span>
                <span v-if="!crew.batchId" class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  Baru
                </span>
                <span v-if="form.assignment.crewIds.includes(crew.id)" class="text-[10px] ml-0.5">✓</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <NuxtLink
            to="/admin/batches"
            class="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </NuxtLink>
          <button
            type="submit"
            class="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Check class="w-4 h-4" />
            <span>Simpan Perubahan Batch</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBatchStore } from '~/stores/batch.js'
import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useMissionStore } from '~/stores/mission.js'
import { useTemplateStore } from '~/stores/template.js'
import { useBuddyStore } from '~/stores/buddy.js'
import { useToast } from '~/composables/useToast.js'
import {
  Layers,
  ArrowLeft,
  Calendar,
  Check
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const batchStore = useBatchStore()
const userStore = useUserStore()
const storeStore = useStoreStore()
const missionStore = useMissionStore()
const templateStore = useTemplateStore()
const buddyStore = useBuddyStore()
const toast = useToast()

const crewFilterMode = ref('AVAILABLE')
const crewStoreFilter = ref('ALL')

const batch = computed(() => {
  return batchStore.batchById(route.params.id)
})

const batchMissions = computed(() => {
  return missionStore.missionsByBatch(route.params.id)
})

const allCrews = computed(() => {
  return userStore.allUsers.filter(u => u.role === 'CREW')
})

const availableCrews = computed(() => {
  return allCrews.value.filter(c => !c.batchId || c.batchId === route.params.id)
})

const displayedCrews = computed(() => {
  let list = crewFilterMode.value === 'AVAILABLE' ? availableCrews.value : allCrews.value
  if (crewStoreFilter.value !== 'ALL') {
    list = list.filter(c => c.storeId === crewStoreFilter.value)
  }
  return list
})

const form = ref({
  name: '',
  code: '',
  storeLocation: '',
  startDate: '',
  endDate: '',
  description: '',
  buddyPackageId: 'pkg-buddy-standard',
  templatePackageId: 'pkg-sop-standard',
  weeks: [],
  assignment: {
    crewIds: []
  },
  approvalConfig: {
    minScoreFor5Stars: 90,
    minEvidenceCount: 1,
    maxRevisions: 3,
    requireEvidence: true
  }
})

const selectedBuddyPackage = computed(() => {
  if (form.value.buddyPackageId === 'NONE') return null
  return buddyStore.packageById(form.value.buddyPackageId) || buddyStore.defaultPackage
})

// Pre-batch Buddy date calculation
const buddyDateRangeText = computed(() => {
  if (!form.value.startDate || !selectedBuddyPackage.value) return '-'
  const totalDays = selectedBuddyPackage.value.totalDays || 3
  const parts = form.value.startDate.split('-').map(Number)
  const dStart = new Date(parts[0], parts[1] - 1, parts[2])
  
  const bStart = new Date(dStart.getTime() - (totalDays * 24 * 60 * 60 * 1000))
  const bEnd = new Date(dStart.getTime() - (1 * 24 * 60 * 60 * 1000))

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const startStr = `${String(bStart.getDate()).padStart(2, '0')} ${months[bStart.getMonth()]}`
  const endStr = `${String(bEnd.getDate()).padStart(2, '0')} ${months[bEnd.getMonth()]}`
  return `${startStr} s/d ${endStr} (${totalDays} Hari Pra-Batch)`
})

const selectedTemplatePackage = computed(() => {
  if (form.value.templatePackageId === 'NONE') return null
  return templateStore.packageById(form.value.templatePackageId) || templateStore.allPackages[0]
})

const templateTotalWeeks = computed(() => {
  if (form.value.weeks.length > 0) return form.value.weeks.length
  if (!selectedTemplatePackage.value) return 3
  const pkgWeeks = templateStore.packageWeeks(selectedTemplatePackage.value.id)
  return pkgWeeks.length || selectedTemplatePackage.value.totalWeeks || 3
})

const templateDurationDays = computed(() => {
  return templateTotalWeeks.value * 7
})

// Calculate End Date dynamically
const calculateEndDate = (startDateStr, totalWeeks) => {
  if (!startDateStr) return ''
  const daysToAdd = totalWeeks * 7
  const parts = startDateStr.split('-').map(Number)
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  d.setDate(d.getDate() + daysToAdd)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const onTemplatePackageChange = () => {
  if (selectedTemplatePackage.value) {
    const pkgWeeks = templateStore.packageWeeks(selectedTemplatePackage.value.id)
    form.value.weeks = pkgWeeks.map(w => ({
      weekNumber: w.weekNumber,
      title: w.title,
      status: w.weekNumber === 1 ? 'ACTIVE' : 'LOCKED',
      isLocked: w.weekNumber > 1,
      missionCount: selectedTemplatePackage.value.templates?.filter(t => t.week === w.weekNumber).length || 4,
      completionRate: 0
    }))
  }
  form.value.endDate = calculateEndDate(form.value.startDate, templateTotalWeeks.value)
}

// Calculate Participating Stores from selected Crew IDs
const participatingStores = computed(() => {
  const selectedCrews = allCrews.value.filter(c => form.value.assignment.crewIds.includes(c.id))
  const storeMap = {}
  
  selectedCrews.forEach(c => {
    const sId = c.storeId || 'standby'
    if (!storeMap[sId]) {
      const storeObj = storeStore.storeById(sId)
      storeMap[sId] = {
        id: sId,
        name: storeObj ? storeObj.name : (c.storeLocation || 'Gerai Standby'),
        storeLeader: storeObj ? storeObj.storeLeader : null,
        districtManager: storeObj ? storeObj.districtManager : null,
        crewCount: 0
      }
    }
    storeMap[sId].crewCount++
  })

  return Object.values(storeMap)
})

const populateForm = (b) => {
  if (!b) return

  form.value.name = b.name || ''
  form.value.code = b.code || ''
  form.value.storeLocation = b.storeLocation || 'Multi-Store (Seluruh Cabang Re.juve)'
  form.value.startDate = b.startDate || '2026-08-10'
  form.value.endDate = b.endDate || '2026-08-30'
  form.value.description = b.description || ''
  form.value.buddyPackageId = b.buddyPackageId || 'pkg-buddy-standard'
  form.value.templatePackageId = b.templatePackageId || 'pkg-sop-standard'

  if (b.weeks && b.weeks.length > 0) {
    form.value.weeks = b.weeks.map(w => ({
      weekNumber: w.weekNumber,
      title: w.title,
      status: w.status || 'LOCKED',
      isLocked: w.isLocked ?? true,
      missionCount: w.missionCount || 4,
      completionRate: w.completionRate || 0
    }))
  } else {
    onTemplatePackageChange()
  }

  if (b.assignment) {
    form.value.assignment = {
      crewIds: [...(b.assignment.crewIds || [])]
    }
  } else {
    const currentBatchCrews = allCrews.value.filter(c => c.batchId === b.id).map(c => c.id)
    form.value.assignment.crewIds = currentBatchCrews
  }

  if (b.approvalConfig) {
    form.value.approvalConfig = { ...b.approvalConfig }
  }
}

watch(batch, (newB) => {
  if (newB) populateForm(newB)
}, { immediate: true })

// Automatically calculate End Date whenever Start Date changes
watch(
  () => form.value.startDate,
  (newStart) => {
    form.value.endDate = calculateEndDate(newStart, templateTotalWeeks.value)
  }
)

const toggleCrewSelection = (crewId) => {
  const idx = form.value.assignment.crewIds.indexOf(crewId)
  if (idx > -1) {
    form.value.assignment.crewIds.splice(idx, 1)
  } else {
    form.value.assignment.crewIds.push(crewId)
  }
}

const selectAllCrew = () => {
  form.value.assignment.crewIds = allCrews.value.map(c => c.id)
}

const applyTemplateNow = () => {
  if (!form.value.templatePackageId || form.value.templatePackageId === 'NONE') return
  const created = templateStore.applyPackageToBatch(route.params.id, form.value.templatePackageId)
  if (created && created.length > 0) {
    toast.success('Template Diterapkan', `Berhasil menambahkan ${created.length} butir misi baru ke batch ini.`)
  } else {
    toast.info('Template Sudah Sesuai', 'Seluruh misi dari paket template ini sudah terdaftar pada batch.')
  }
}

const handleUpdate = () => {
  batchStore.updateBatch(route.params.id, form.value)

  // Apply template if selected
  if (form.value.templatePackageId && form.value.templatePackageId !== 'NONE') {
    templateStore.applyPackageToBatch(route.params.id, form.value.templatePackageId)
  }

  // Reassign selected crew members to this batch
  form.value.assignment.crewIds.forEach(cId => {
    const crewUser = userStore.userById(cId)
    userStore.assignUserToBatch(cId, batch.value.id, crewUser?.storeLocation || batch.value.name)
  })

  toast.success('Batch Berhasil Diperbarui', `Perubahan data batch ${batch.value.name} tersimpan.`)
  router.push('/admin/batches')
}
</script>
