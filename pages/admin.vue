<template>
  <div class="space-y-6">
    <!-- Header & Superadmin Context -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Superadmin Master Console
          </h2>
          <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            👑 System Maintenance
          </span>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Pusat kontrol pemeliharaan sistem: buat cabang gerai baru, kelola data user & penugasan crew ke gerai, dan kelola katalog misi operasional.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          Logged in as <strong>{{ userStore.currentUser.name }}</strong>
        </span>
      </div>
    </div>

    <!-- KPI Summary Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#499ec7]/10 flex items-center justify-center text-[#499ec7] flex-shrink-0">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cabang Gerai</span>
          <p class="text-lg font-black text-slate-900 dark:text-white">{{ batchStore.allBatches.length }} Batches</p>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <Users class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total User & Crew</span>
          <p class="text-lg font-black text-slate-900 dark:text-white">{{ userStore.allUsers.length }} Users ({{ gamificationStore.allCrews.length }} Crew)</p>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#963189]/10 flex items-center justify-center text-[#963189] dark:text-[#db92d7] flex-shrink-0">
          <Target class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Misi Gerai</span>
          <p class="text-lg font-black text-slate-900 dark:text-white">{{ missionStore.allMissions.length }} Missions</p>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
          <CheckCircle2 class="w-5 h-5" />
        </div>
        <div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Status</span>
          <p class="text-lg font-black text-emerald-600 dark:text-emerald-400">Online & Ready</p>
        </div>
      </div>
    </div>

    <!-- 3 Workstation Navigation Tabs -->
    <div class="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 w-fit max-w-full overflow-x-auto">
      <button
        type="button"
        @click="activeTab = 'BATCHES'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer"
        :class="[
          activeTab === 'BATCHES'
            ? 'bg-white dark:bg-slate-900 text-[#499ec7] dark:text-[#84cded] shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Layers class="w-4 h-4" />
        <span>1. Cabang Gerai (Batches)</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-[#499ec7]/15 text-[#24779f] dark:text-[#84cded]">
          {{ batchStore.allBatches.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'USERS'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer"
        :class="[
          activeTab === 'USERS'
            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Users class="w-4 h-4" />
        <span>2. User & Crew Assignment</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
          {{ userStore.allUsers.length }}
        </span>
      </button>

      <button
        type="button"
        @click="activeTab = 'MISSIONS'"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer"
        :class="[
          activeTab === 'MISSIONS'
            ? 'bg-white dark:bg-slate-900 text-[#963189] dark:text-[#db92d7] shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        ]"
      >
        <Target class="w-4 h-4" />
        <span>3. Misi Operasional Gerai</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-[#963189]/15 text-[#963189] dark:text-[#db92d7]">
          {{ missionStore.allMissions.length }}
        </span>
      </button>
    </div>

    <!-- ==================== TAB 1: BATCH / GERAI MANAGEMENT ==================== -->
    <div v-if="activeTab === 'BATCHES'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white">Daftar Cabang Gerai Re.juve</h3>
          <p class="text-xs text-slate-400 mt-0.5">Kelola cabang gerai dan inisialisasi siklus evaluasi 3 minggu.</p>
        </div>
        <button
          type="button"
          @click="openCreateBatchModal"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#499ec7] hover:bg-[#24779f] text-white text-xs font-bold transition-all shadow-md shadow-[#499ec7]/20 active:scale-95 cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>+ Buat Gerai / Batch Baru</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="b in batchStore.allBatches"
          :key="b.id"
          class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-sm relative group"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {{ b.code }}
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {{ b.status }}
              </span>
            </div>

            <h4 class="text-base font-black text-slate-900 dark:text-white">
              {{ b.name }}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin class="w-3.5 h-3.5 text-[#499ec7]" />
              <span>{{ b.storeLocation }}</span>
            </p>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              {{ b.description }}
            </p>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span class="text-[10px] text-slate-400 block">Total Crew:</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">
                  {{ gamificationStore.crewsByBatch(b.id).length }} Crew Members
                </span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 block">Active Cycle:</span>
                <span class="font-bold text-[#499ec7] dark:text-[#84cded]">
                  Week {{ b.currentWeek }} of {{ b.totalWeeks }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              @click="editBatch(b)"
              class="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#499ec7] dark:hover:text-[#84cded] flex items-center gap-1"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>Edit Gerai</span>
            </button>

            <button
              type="button"
              @click="confirmDeleteBatch(b)"
              class="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 2: USER & CREW BATCH ASSIGNMENT ==================== -->
    <div v-if="activeTab === 'USERS'" class="space-y-4">
      <!-- Toolbar & Filters -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white">Direktori User & Penugasan Gerai</h3>
          <p class="text-xs text-slate-400 mt-0.5">Tambah user baru dan atur penempatan Crew ke cabang gerai Re.juve.</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Role Filter -->
          <select
            v-model="userRoleFilter"
            class="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Role</option>
            <option value="CREW">Crew Member</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="HEAD">Head of Operations</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>

          <!-- Batch Filter -->
          <select
            v-model="userBatchFilter"
            class="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Semua Gerai</option>
            <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
              {{ b.name.split('—')[1] || b.name }}
            </option>
          </select>

          <button
            type="button"
            @click="openCreateUserModal"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 active:scale-95 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>+ Tambah User Baru</span>
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th class="py-3.5 px-4">User</th>
                <th class="py-3.5 px-4">Role & Jabatan</th>
                <th class="py-3.5 px-4">Cabang Gerai (Batch)</th>
                <th class="py-3.5 px-4 text-center">⭐ Stars</th>
                <th class="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr
                v-for="u in filteredUsers"
                :key="u.id"
                class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <!-- User Info -->
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <img
                      :src="u.avatar"
                      :alt="u.name"
                      class="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <h4 class="font-bold text-slate-900 dark:text-white">{{ u.name }}</h4>
                      <p class="text-[11px] text-slate-400">{{ u.email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Role -->
                <td class="py-3 px-4">
                  <span
                    class="text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-block mb-0.5"
                    :class="[
                      u.role === 'CREW' ? 'bg-[#499ec7]/15 text-[#24779f] dark:text-[#84cded]' :
                      u.role === 'SUPERVISOR' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      u.role === 'HEAD' ? 'bg-[#963189]/15 text-[#963189] dark:text-[#db92d7]' :
                      'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    ]"
                  >
                    {{ u.role }}
                  </span>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ u.position }}</p>
                </td>

                <!-- Assigned Batch & Quick Move Dropdown -->
                <td class="py-3 px-4">
                  <div v-if="u.role === 'CREW'" class="flex items-center gap-2">
                    <select
                      :value="u.batchId"
                      @change="handleReassignBatch(u.id, $event.target.value)"
                      class="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                        {{ b.name.split('—')[1] || b.name }}
                      </option>
                    </select>
                  </div>
                  <div v-else class="text-slate-400 text-xs italic">
                    {{ u.storeLocation || 'All Operations' }}
                  </div>
                </td>

                <!-- Stars -->
                <td class="py-3 px-4 text-center">
                  <span v-if="u.role === 'CREW'" class="font-extrabold text-amber-500">
                    ⭐ {{ (u.stars || 0).toLocaleString() }}
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </td>

                <!-- Actions -->
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      @click="editUser(u)"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit User"
                    >
                      <Edit3 class="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      @click="confirmDeleteUser(u)"
                      class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus User"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ==================== TAB 3: STORE MISSIONS MANAGEMENT ==================== -->
    <div v-if="activeTab === 'MISSIONS'" class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white">Manajemen Misi Operasional Gerai</h3>
          <p class="text-xs text-slate-400 mt-0.5">Buat misi standar SOP untuk batch gerai dan minggu tertentu.</p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Batch Filter -->
          <select
            v-model="missionBatchFilter"
            class="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#963189]"
          >
            <option value="ALL">Semua Cabang Gerai</option>
            <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
              {{ b.name.split('—')[1] || b.name }}
            </option>
          </select>

          <!-- Week Filter -->
          <select
            v-model="missionWeekFilter"
            class="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#963189]"
          >
            <option value="ALL">Semua Minggu</option>
            <option value="1">Week 1</option>
            <option value="2">Week 2</option>
            <option value="3">Week 3</option>
          </select>

          <button
            type="button"
            @click="openCreateMissionModal"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#963189] hover:bg-[#812474] text-white text-xs font-bold transition-all shadow-md shadow-[#963189]/20 active:scale-95 cursor-pointer"
          >
            <Plus class="w-4 h-4" />
            <span>+ Buat Misi Baru</span>
          </button>
        </div>
      </div>

      <!-- Missions Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="m in filteredMissions"
          :key="m.id"
          class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between shadow-sm"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-[#963189]/10 text-[#963189] dark:text-[#db92d7]">
                {{ m.code }} • Week {{ m.week }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {{ m.category }}
              </span>
            </div>

            <h4 class="text-sm font-black text-slate-900 dark:text-white">
              {{ m.title }}
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {{ m.description }}
            </p>

            <!-- Target Branch & Assigned Crew Count -->
            <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">
                Cabang: <strong class="text-slate-700 dark:text-slate-300">{{ getBatchName(m.batchId) }}</strong>
              </span>
              <span class="font-bold text-[#499ec7]">
                {{ (m.assignedCrewIds || []).length || gamificationStore.crewsByBatch(m.batchId).length }} Crew
              </span>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              @click="editMission(m)"
              class="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-[#963189] dark:hover:text-[#db92d7] flex items-center gap-1"
            >
              <Edit3 class="w-3.5 h-3.5" />
              <span>Edit Misi</span>
            </button>

            <button
              type="button"
              @click="confirmDeleteMission(m)"
              class="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL: CREATE / EDIT BATCH ==================== -->
    <BaseModal
      :modelValue="showBatchModal"
      :title="editingBatch ? 'Edit Cabang Gerai' : 'Tambah Cabang Gerai Baru'"
      subtitle="Konfigurasi nama gerai, kode batch, dan lokasi operasional"
      max-width="md"
      @update:modelValue="showBatchModal = $event"
      @close="showBatchModal = false"
    >
      <form @submit.prevent="saveBatch" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Cabang / Batch</label>
          <input
            v-model="batchForm.name"
            type="text"
            required
            placeholder="Contoh: Batch Delta — Re.juve Kota Kasablanka"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Batch</label>
            <input
              v-model="batchForm.code"
              type="text"
              required
              placeholder="BTH-KK-04"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Mall / Outlet</label>
            <input
              v-model="batchForm.storeLocation"
              type="text"
              required
              placeholder="Kota Kasablanka LG Floor"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Gerai</label>
          <textarea
            v-model="batchForm.description"
            rows="2"
            placeholder="Deskripsi operasional gerai..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#499ec7]"
          ></textarea>
        </div>

        <div class="p-3 rounded-xl bg-[#499ec7]/10 text-xs text-[#24779f] dark:text-[#84cded]">
          ℹ️ Sistem akan secara otomatis menginisialisasi <strong>Siklus 3 Minggu Operasional</strong> untuk gerai ini.
        </div>

        <div class="pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="showBatchModal = false"
            class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#499ec7] text-white shadow-md shadow-[#499ec7]/20"
          >
            {{ editingBatch ? 'Simpan Perubahan' : 'Buat Gerai' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- ==================== MODAL: CREATE / EDIT USER ==================== -->
    <BaseModal
      :modelValue="showUserModal"
      :title="editingUser ? 'Edit User' : 'Tambah User / Crew Baru'"
      subtitle="Isi data profil dan tentukan cabang penempatan gerai"
      max-width="md"
      @update:modelValue="showUserModal = $event"
      @close="showUserModal = false"
    >
      <form @submit.prevent="saveUser" class="space-y-3 py-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
          <input
            v-model="userForm.name"
            type="text"
            required
            placeholder="Contoh: Rian Hidayat"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role Akun</label>
            <select
              v-model="userForm.role"
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CREW">Crew Member (Store Specialist)</option>
              <option value="SUPERVISOR">Area Supervisor</option>
              <option value="HEAD">Head of Operations</option>
              <option value="SUPERADMIN">Superadmin</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cabang Penempatan</label>
            <select
              v-model="userForm.batchId"
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                {{ b.name.split('—')[1] || b.name }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jabatan (Position)</label>
            <input
              v-model="userForm.position"
              type="text"
              placeholder="Store Specialist"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              v-model="userForm.email"
              type="email"
              placeholder="rian.hidayat@rejuve.co.id"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div class="pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="showUserModal = false"
            class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
          >
            {{ editingUser ? 'Simpan User' : 'Buat User' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- ==================== MODAL: CREATE / EDIT MISSION ==================== -->
    <BaseModal
      :modelValue="showMissionModal"
      :title="editingMission ? 'Edit Misi Gerai' : 'Buat Misi Operasional Gerai'"
      subtitle="Tentukan batch cabang, minggu aktif, dan rincian SOP yang dinilai"
      max-width="lg"
      @update:modelValue="showMissionModal = $event"
      @close="showMissionModal = false"
    >
      <form @submit.prevent="saveMission" class="space-y-3 py-2">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cabang Gerai Target</label>
            <select
              v-model="missionForm.batchId"
              required
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option v-for="b in batchStore.allBatches" :key="b.id" :value="b.id">
                {{ b.name.split('—')[1] || b.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Minggu Operasional (Week)</label>
            <select
              v-model="missionForm.week"
              required
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option :value="1">Week 1</option>
              <option :value="2">Week 2 (Active Cycle)</option>
              <option :value="3">Week 3</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Misi SOP</label>
          <input
            v-model="missionForm.title"
            type="text"
            required
            placeholder="Contoh: Audit Suhu Chiller 2-4°C & Rotasi Stok Cold-Pressed"
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kode Misi</label>
            <input
              v-model="missionForm.code"
              type="text"
              placeholder="MSN-W2-05"
              class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
            <select
              v-model="missionForm.category"
              class="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border-none px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
            >
              <option value="Cold Chain">Cold Chain</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Service">Service</option>
              <option value="Compliance">Compliance</option>
              <option value="Logistics">Logistics</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Misi</label>
          <textarea
            v-model="missionForm.description"
            rows="2"
            placeholder="Instruksi operasional misi..."
            class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#963189]"
          ></textarea>
        </div>

        <div class="p-3 rounded-xl bg-[#963189]/10 text-xs text-[#963189] dark:text-[#db92d7]">
          ℹ️ Misi ini akan otomatis ditugaskan ke <strong>seluruh Crew</strong> yang terdaftar di cabang gerai terpilih.
        </div>

        <div class="pt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            @click="showMissionModal = false"
            class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-5 py-2 text-xs font-bold rounded-xl bg-[#963189] text-white shadow-md shadow-[#963189]/20"
          >
            {{ editingMission ? 'Simpan Misi' : 'Buat Misi' }}
          </button>
        </div>
      </form>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useGamificationStore } from '~/stores/gamification.js'
import { useToast } from '~/composables/useToast.js'
import BaseModal from '~/components/ui/BaseModal.vue'
import {
  Layers,
  Users,
  Target,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  MapPin
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const missionStore = useMissionStore()
const gamificationStore = useGamificationStore()
const toast = useToast()

const activeTab = ref('BATCHES') // 'BATCHES' | 'USERS' | 'MISSIONS'

// Filter states
const userRoleFilter = ref('ALL')
const userBatchFilter = ref('ALL')
const missionBatchFilter = ref('ALL')
const missionWeekFilter = ref('ALL')

// Modals
const showBatchModal = ref(false)
const showUserModal = ref(false)
const showMissionModal = ref(false)

const editingBatch = ref(null)
const editingUser = ref(null)
const editingMission = ref(null)

// Forms
const batchForm = ref({
  name: '',
  code: '',
  storeLocation: '',
  description: ''
})

const userForm = ref({
  name: '',
  role: 'CREW',
  batchId: 'batch-alpha',
  position: 'Store Specialist',
  email: ''
})

const missionForm = ref({
  title: '',
  code: '',
  category: 'Quality Control',
  batchId: 'batch-alpha',
  week: 2,
  description: ''
})

// Filtered lists
const filteredUsers = computed(() => {
  return userStore.allUsers.filter(u => {
    if (userRoleFilter.value !== 'ALL' && u.role !== userRoleFilter.value) return false
    if (userBatchFilter.value !== 'ALL' && u.batchId !== userBatchFilter.value) return false
    return true
  })
})

const filteredMissions = computed(() => {
  return missionStore.allMissions.filter(m => {
    if (missionBatchFilter.value !== 'ALL' && m.batchId !== missionBatchFilter.value) return false
    if (missionWeekFilter.value !== 'ALL' && m.week !== Number(missionWeekFilter.value)) return false
    return true
  })
})

const getBatchName = (batchId) => {
  const b = batchStore.batchById(batchId)
  return b ? (b.name.split('—')[1] || b.name) : 'Semua Gerai'
}

// Batch Actions
const openCreateBatchModal = () => {
  editingBatch.value = null
  batchForm.value = {
    name: '',
    code: `BTH-${String(batchStore.allBatches.length + 1).padStart(2, '0')}`,
    storeLocation: '',
    description: ''
  }
  showBatchModal.value = true
}

const editBatch = (batch) => {
  editingBatch.value = batch
  batchForm.value = { ...batch }
  showBatchModal.value = true
}

const saveBatch = () => {
  if (editingBatch.value) {
    batchStore.updateBatch(editingBatch.value.id, batchForm.value)
    toast.success('Gerai Diperbarui', `Data gerai ${batchForm.value.name} berhasil disimpan.`)
  } else {
    const newB = batchStore.createBatch(batchForm.value)
    toast.success('Gerai Baru Dibuat', `Cabang ${newB.name} berhasil ditambahkan dengan siklus 3 minggu.`)
  }
  showBatchModal.value = false
}

const confirmDeleteBatch = (batch) => {
  if (confirm(`Apakah Anda yakin ingin menghapus cabang ${batch.name}?`)) {
    batchStore.deleteBatch(batch.id)
    toast.info('Gerai Dihapus', `Cabang ${batch.name} telah dihapus dari sistem.`)
  }
}

// User Actions
const openCreateUserModal = () => {
  editingUser.value = null
  userForm.value = {
    name: '',
    role: 'CREW',
    batchId: batchStore.selectedBatchId || 'batch-alpha',
    position: 'Store Specialist',
    email: ''
  }
  showUserModal.value = true
}

const editUser = (user) => {
  editingUser.value = user
  userForm.value = { ...user }
  showUserModal.value = true
}

const saveUser = () => {
  if (editingUser.value) {
    userStore.updateUser(editingUser.value.id, userForm.value)
    toast.success('User Diperbarui', `Profil ${userForm.value.name} telah diperbarui.`)
  } else {
    const newU = userStore.createUser(userForm.value)
    toast.success('User Baru Terdaftar', `${newU.name} (${newU.role}) berhasil ditambahkan dan ditugaskan ke gerai.`)
  }
  showUserModal.value = false
}

const confirmDeleteUser = (user) => {
  if (confirm(`Hapus user ${user.name}?`)) {
    userStore.deleteUser(user.id)
    toast.info('User Dihapus', `${user.name} telah dihapus dari direktori.`)
  }
}

const handleReassignBatch = (userId, newBatchId) => {
  const b = batchStore.batchById(newBatchId)
  userStore.assignUserToBatch(userId, newBatchId, b?.name || '')
  toast.success('Penugasan Gerai Berhasil', `Crew dipindahkan ke ${b?.name.split('—')[1] || b?.name}.`)
}

// Mission Actions
const openCreateMissionModal = () => {
  editingMission.value = null
  missionForm.value = {
    title: '',
    code: `MSN-W2-0${missionStore.allMissions.length + 1}`,
    category: 'Quality Control',
    batchId: batchStore.selectedBatchId || 'batch-alpha',
    week: 2,
    description: ''
  }
  showMissionModal.value = true
}

const editMission = (mission) => {
  editingMission.value = mission
  missionForm.value = { ...mission }
  showMissionModal.value = true
}

const saveMission = () => {
  if (editingMission.value) {
    missionStore.updateMission(editingMission.value.id, missionForm.value)
    toast.success('Misi Diperbarui', `Misi ${missionForm.value.title} berhasil disimpan.`)
  } else {
    const newM = missionStore.createMission(missionForm.value)
    toast.success('Misi Baru Dibuat', `Misi ${newM.title} berhasil dibuat dan ditugaskan ke seluruh Crew di gerai.`)
  }
  showMissionModal.value = false
}

const confirmDeleteMission = (mission) => {
  if (confirm(`Hapus misi ${mission.title}?`)) {
    missionStore.deleteMission(mission.id)
    toast.info('Misi Dihapus', `Misi ${mission.title} telah dihapus.`)
  }
}
</script>
