<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sinkronisasi Lynx ERP
          </h2>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Lynx API Connected</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        @click="syncAll"
        :disabled="isSyncing"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#831843] hover:bg-[#6b133a] text-white text-xs font-semibold shadow-md shadow-[#831843]/20 transition-all cursor-pointer disabled:opacity-50"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isSyncing }" />
        <span>{{ isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Seluruh Data Lynx' }}</span>
      </button>
    </div>

    <!-- Sync Action Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Card 1: Departments Sync -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div class="w-12 h-12 rounded-2xl bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] flex items-center justify-center mb-3">
            <Store class="w-6 h-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Sinkronisasi Master Gerai & Departemen
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Menarik seluruh data cabang operasional, kode departemen, dan lokasi gerai Re.juve dari database Lynx ERP.
          </p>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-[11px] text-slate-400">
            Endpoint: <strong class="font-mono text-slate-600 dark:text-slate-300">/sync/departments/pull-all</strong>
          </span>
          <button
            type="button"
            @click="syncDepartments"
            :disabled="isSyncingDept"
            class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {{ isSyncingDept ? 'Memproses...' : 'Tarik Data Gerai' }}
          </button>
        </div>
      </div>

      <!-- Card 2: Users Sync -->
      <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Users class="w-6 h-6" />
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">
            Sinkronisasi Master Pengguna & Karyawan
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Menarik data akun karyawan baru, penempatan gerai, dan pembaruan jabatan (Store Leader, Crew, DM) dari Lynx.
          </p>
        </div>

        <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span class="text-[11px] text-slate-400">
            Endpoint: <strong class="font-mono text-slate-600 dark:text-slate-300">/sync/users/pull-all</strong>
          </span>
          <button
            type="button"
            @click="syncUsers"
            :disabled="isSyncingUser"
            class="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {{ isSyncingUser ? 'Memproses...' : 'Tarik Data Pengguna' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Live Activity Log -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
          <span>Log Riwayat Sinkronisasi Lynx</span>
        </h3>
        <button
          type="button"
          @click="clearLogs"
          class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          Bersihkan Log
        </button>
      </div>

      <div class="bg-slate-950 rounded-2xl p-4 font-mono text-xs text-slate-300 space-y-2 max-h-72 overflow-y-auto">
        <div v-if="logs.length === 0" class="text-slate-600">
          // Belum ada aktivitas sinkronisasi. Klik tombol di atas untuk memulai.
        </div>
        <div
          v-for="(log, idx) in logs"
          :key="idx"
          class="flex items-start gap-2.5"
        >
          <span class="text-slate-500 flex-shrink-0">[{{ log.time }}]</span>
          <span
            :class="[
              log.type === 'success' ? 'text-emerald-400' : (log.type === 'error' ? 'text-rose-400' : 'text-amber-400')
            ]"
          >
            {{ log.message }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { syncApi } from '~/services/api.js'
import { useToast } from '~/composables/useToast.js'
import { Store, Users, RefreshCw, Terminal } from 'lucide-vue-next'

const toast = useToast()

const isSyncing = ref(false)
const isSyncingDept = ref(false)
const isSyncingUser = ref(false)

const logs = ref([
  {
    time: new Date().toLocaleTimeString(),
    type: 'info',
    message: 'System ready. Terhubung ke backend service Lynx ERP.'
  }
])

const addLog = (message, type = 'info') => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    type,
    message
  })
}

const clearLogs = () => {
  logs.value = []
}

const syncDepartments = async () => {
  isSyncingDept.value = true
  addLog('Mengirim request POST /sync/departments/pull-all...', 'info')
  try {
    const res = await syncApi.pullDepartments()
    addLog(`Berhasil! ${res?.message || 'Data departemen telah disinkronkan.'}`, 'success')
    toast.success('Sinkronisasi Berhasil', 'Data gerai Re.juve telah diperbarui dari Lynx.')
  } catch (err) {
    addLog(`Gagal: ${err.message}`, 'error')
    toast.error('Sinkronisasi Gagal', err.message || 'Tidak dapat terhubung ke Lynx.')
  } finally {
    isSyncingDept.value = false
  }
}

const syncUsers = async () => {
  isSyncingUser.value = true
  addLog('Mengirim request POST /sync/users/pull-all...', 'info')
  try {
    const res = await syncApi.pullUsers()
    addLog(`Berhasil! ${res?.message || 'Data pengguna telah disinkronkan.'}`, 'success')
    toast.success('Sinkronisasi Berhasil', 'Data pengguna telah diperbarui dari Lynx.')
  } catch (err) {
    addLog(`Gagal: ${err.message}`, 'error')
    toast.error('Sinkronisasi Gagal', err.message || 'Tidak dapat terhubung ke Lynx.')
  } finally {
    isSyncingUser.value = false
  }
}

const syncAll = async () => {
  isSyncing.value = true
  addLog('Memulai sinkronisasi massal seluruh data Lynx...', 'info')
  try {
    await syncDepartments()
    await syncUsers()
    addLog('Sinkronisasi seluruh data Lynx selesai 100%.', 'success')
    toast.success('Sinkronisasi Selesai', 'Seluruh data gerai dan pengguna telah sinkron.')
  } catch (err) {
    addLog(`Kendala sinkronisasi massal: ${err.message}`, 'error')
  } finally {
    isSyncing.value = false
  }
}
</script>
