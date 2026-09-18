<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Profile Hero Card -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm transition-all">
      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <!-- Avatar Profile with Badge -->
        <div class="relative flex-shrink-0">
          <img
            :src="userStore.currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userStore.currentUser.name || 'User')}`"
            :alt="userStore.currentUser.name"
            class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-[#831843]/20 dark:ring-[#831843]/40 shadow-lg bg-slate-100 dark:bg-slate-800"
          />
          <div
            class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center text-white"
            title="Akun Aktif"
          >
            <Check class="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        <!-- User Information & Metadata -->
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
            <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {{ userStore.currentUser.name }}
            </h2>
            <span
              class="text-xs font-bold px-2.5 py-1 rounded-lg"
              :class="getRoleBadgeClass(userStore.currentRole)"
            >
              {{ userStore.currentUser.roleTitle }}
            </span>
            <span
              v-if="userStore.currentUser.gender"
              class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {{ userStore.currentUser.gender === 'F' ? '👩 Perempuan' : '👨 Laki-laki' }}
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span class="flex items-center gap-1">
              <Briefcase class="w-3.5 h-3.5 text-slate-400" />
              {{ userStore.currentUser.position || 'Specialist' }}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1">
              <Building2 class="w-3.5 h-3.5 text-slate-400" />
              {{ userStore.currentUser.department || userStore.currentUser.storeLocation || 'Store Operations' }}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1">
              <Mail class="w-3.5 h-3.5 text-slate-400" />
              {{ userStore.currentUser.email }}
            </span>
            <template v-if="userStore.currentUser.phone">
              <span>•</span>
              <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Phone class="w-3.5 h-3.5" />
                {{ userStore.currentUser.phone }}
              </span>
            </template>
          </div>

          <!-- Quick Metrics Bar: Khusus CREW (Gamifikasi) vs Non-CREW (SL, DM, Superadmin) -->
          <!-- 1. Quick Metrics untuk CREW (Gamifikasi Aktif) -->
          <div
            v-if="userStore.isCrew"
            class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800"
          >
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch Penugasan</span>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {{ (batchStore.currentBatch?.name || '').split('—')[1] || batchStore.currentBatch?.name || 'Re.juve Store' }}
              </p>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Bintang</span>
              <p class="text-xs font-bold text-amber-500 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <Star class="w-3.5 h-3.5 fill-amber-400" />
                {{ (crewProfile?.stars || userStore.currentUser.stars || 0).toLocaleString() }}
              </p>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 col-span-2 sm:col-span-1">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lencana Terbuka</span>
              <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {{ gamificationStore.unlockedAchievements.length }} Terbuka
              </p>
            </div>
          </div>

          <!-- 2. Quick Metrics untuk Non-CREW (SL / DM / Superadmin - Manajerial) -->
          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800"
          >
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departemen / Gerai</span>
              <p class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {{ userStore.currentUser.department || userStore.currentUser.storeLocation || 'Store Operations' }}
              </p>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peran & Wewenang</span>
              <p class="text-xs font-bold text-[#831843] dark:text-[#f472b6] mt-0.5 truncate">
                {{ userStore.isDistrictManager ? 'Approval & Nilai DM' : (userStore.isStoreLeader ? 'Evaluasi Kru & SL' : 'Administrator') }}
              </p>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Akun</span>
              <p class="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <ShieldCheck class="w-3.5 h-3.5" />
                Aktif & Terverifikasi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gamification Status Progression & Achievements Showcase (KHUSUS CREW) -->
    <template v-if="userStore.isCrew">
      <!-- Star Level Progression Card -->
      <StarProgress :stars="crewProfile?.stars || userStore.currentUser.stars || 0" />

      <!-- Unlocked Achievements Showcase -->
      <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Award class="w-4 h-4 text-amber-500" />
            <span>Lencana & Penghargaan Diraih ({{ gamificationStore.unlockedAchievements.length }})</span>
          </h3>
          <NuxtLink to="/achievements" class="text-xs font-bold text-[#831843] dark:text-[#f472b6] hover:underline flex items-center gap-1">
            <span>Lihat Semua Lencana</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AchievementCard
            v-for="ach in gamificationStore.unlockedAchievements.slice(0, 6)"
            :key="ach.id"
            :achievement="ach"
          />
        </div>
      </div>
    </template>

    <!-- Pengaturan Akun & Keamanan (Tersedia untuk Semua Role: SL, DM, Crew, Admin) -->
    <div class="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
      <!-- Tab Navigation Header -->
      <div class="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-800/40 px-4 sm:px-6 pt-3 flex items-center gap-2 sm:gap-4 overflow-x-auto">
        <button
          type="button"
          @click="activeTab = 'profile'"
          class="pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap"
          :class="activeTab === 'profile'
            ? 'border-[#831843] text-[#831843] dark:text-[#f472b6] dark:border-[#f472b6]'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          <User class="w-4 h-4" />
          <span>Edit Data Diri & Avatar</span>
        </button>

        <button
          type="button"
          @click="activeTab = 'security'"
          class="pb-3 px-3 text-xs sm:text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap"
          :class="activeTab === 'security'
            ? 'border-[#831843] text-[#831843] dark:text-[#f472b6] dark:border-[#f472b6]'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
        >
          <KeyRound class="w-4 h-4" />
          <span>Keamanan & Ubah Password</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="p-5 sm:p-8">
        <!-- ==================== TAB 1: EDIT DATA DIRI & AVATAR ==================== -->
        <div v-show="activeTab === 'profile'" class="space-y-6">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
              <span>Informasi Data Diri</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Perbarui nama, nomor telepon / WhatsApp, jenis kelamin, serta foto avatar profil Anda.
            </p>
          </div>

          <!-- Alert Notification for Profile Update -->
          <div
            v-if="profileMessage.text"
            class="p-4 rounded-2xl text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200"
            :class="profileMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'"
          >
            <div class="flex items-center gap-2">
              <CheckCircle2 v-if="profileMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
              <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
              <span class="font-medium">{{ profileMessage.text }}</span>
            </div>
            <button
              type="button"
              @click="profileMessage.text = ''"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="handleSaveProfile" class="space-y-6">
            <!-- 1. Avatar Uploader & Selector -->
            <div class="space-y-3 p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <label class="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Camera class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                  <span>Foto Profil / Avatar Akun</span>
                </label>

                <!-- Mode Switcher Tabs: Upload Foto vs Link URL -->
                <div class="inline-flex rounded-xl p-0.5 bg-slate-200/80 dark:bg-slate-700">
                  <button
                    type="button"
                    @click="avatarMode = 'upload'"
                    class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    :class="avatarMode === 'upload' ? 'bg-white dark:bg-slate-800 text-[#831843] dark:text-[#f472b6] shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
                  >
                    <Upload class="w-3 h-3" />
                    <span>Upload Foto Sendiri</span>
                  </button>
                  <button
                    type="button"
                    @click="avatarMode = 'url'"
                    class="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                    :class="avatarMode === 'url' ? 'bg-white dark:bg-slate-800 text-[#831843] dark:text-[#f472b6] shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
                  >
                    <Link2 class="w-3 h-3" />
                    <span>Pakai Link URL</span>
                  </button>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                <!-- Visual Preview Box -->
                <div class="relative flex-shrink-0">
                  <img
                    :src="avatarPreview"
                    :alt="profileForm.name || 'Avatar Preview'"
                    class="w-20 h-20 rounded-2xl object-cover ring-2 ring-[#831843]/30 shadow-sm bg-white dark:bg-slate-900"
                  />
                  <div v-if="avatarFileName" class="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs" title="Foto berhasil dipilih">
                    <Check class="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div class="flex-1 w-full space-y-2">
                  <!-- Mode 1: Upload File Gambar Sendiri -->
                  <div v-if="avatarMode === 'upload'" class="space-y-1.5">
                    <div class="flex items-center gap-2 flex-wrap">
                      <input
                        type="file"
                        ref="fileInputRef"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        @change="handleFileUpload"
                        class="hidden"
                      />
                      <button
                        type="button"
                        @click="triggerFileInput"
                        class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all active:scale-95"
                      >
                        <UploadCloud class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6]" />
                        <span>{{ avatarFileName ? 'Ganti File Foto' : 'Pilih File Foto (PNG / JPG / WEBP)' }}</span>
                      </button>

                      <button
                        v-if="avatarFileName"
                        type="button"
                        @click="resetUploadedFile"
                        class="px-2.5 py-2 text-xs font-medium text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all cursor-pointer"
                        title="Batal upload file"
                      >
                        <X class="w-3.5 h-3.5" />
                        <span>Reset</span>
                      </button>
                    </div>
                    <p class="text-[11px] text-slate-400">
                      <span v-if="avatarFileName" class="text-emerald-600 dark:text-emerald-400 font-semibold">📁 {{ avatarFileName }}</span>
                      <span v-else>Mendukung format PNG, JPG, atau WEBP maks 5MB. Foto profil baru akan langsung diterapkan.</span>
                    </p>
                  </div>

                  <!-- Mode 2: Pakai Link URL Avatar -->
                  <div v-else class="space-y-1.5">
                    <div class="flex items-center gap-2">
                      <div class="relative flex-1">
                        <Link2 class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          v-model="profileForm.avatarUrl"
                          type="url"
                          placeholder="https://images.unsplash.com/... atau https://api.dicebear.com/..."
                          class="w-full text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-8.5 pr-3.5 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
                        />
                      </div>
                      <button
                        type="button"
                        @click="generateRandomAvatar"
                        class="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center gap-1 cursor-pointer transition-all flex-shrink-0"
                        title="Generate avatar acak"
                      >
                        <Shuffle class="w-3.5 h-3.5" />
                        <span>🎲 Acak</span>
                      </button>
                    </div>
                    <p class="text-[11px] text-slate-400">
                      Masukkan URL gambar langsung atau klik tombol Acak untuk avatar kartun.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Form Inputs: Name, Email, Phone, Gender -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap *
                </label>
                <div class="relative">
                  <User class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="profileForm.name"
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#831843]"
                  />
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Alamat Email (Akun Utama)
                  </label>
                  <span class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Lock class="w-3 h-3" />
                    Terkunci
                  </span>
                </div>
                <div class="relative">
                  <Mail class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    :value="userStore.currentUser.email"
                    type="email"
                    disabled
                    readonly
                    class="w-full text-xs rounded-xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 pl-9 pr-3.5 py-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed select-none font-mono"
                  />
                </div>
                <p class="text-[11px] text-slate-400 mt-1">
                  Email akun terikat dengan sistem dan tidak dapat diubah.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nomor Telepon / WhatsApp
                </label>
                <div class="relative">
                  <Phone class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    v-model="profileForm.phone"
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenis Kelamin (Gender)
                </label>
                <div class="grid grid-cols-2 gap-2">
                  <label
                    class="flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none"
                    :class="profileForm.gender === 'M'
                      ? 'border-[#831843] bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] ring-1 ring-[#831843]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'"
                  >
                    <input type="radio" v-model="profileForm.gender" value="M" class="sr-only" />
                    <span>👨 Laki-laki</span>
                  </label>
                  <label
                    class="flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all select-none"
                    :class="profileForm.gender === 'F'
                      ? 'border-[#831843] bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] ring-1 ring-[#831843]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'"
                  >
                    <input type="radio" v-model="profileForm.gender" value="F" class="sr-only" />
                    <span>👩 Perempuan</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                :disabled="isSavingProfile"
                class="px-5 py-2.5 rounded-xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
              >
                <Save v-if="!isSavingProfile" class="w-4 h-4" />
                <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{{ isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil' }}</span>
              </button>
            </div>
          </form>
        </div>

        <!-- ==================== TAB 2: KEAMANAN & UBAH PASSWORD ==================== -->
        <div v-show="activeTab === 'security'" class="space-y-6">
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
              <span>Ganti Kata Sandi (Password)</span>
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ubah password lama Anda untuk meningkatkan keamanan akses akun Re.juve.
            </p>
          </div>

          <!-- Alert Notification for Password Change -->
          <div
            v-if="passwordMessage.text"
            class="p-4 rounded-2xl text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200"
            :class="passwordMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'"
          >
            <div class="flex items-center gap-2">
              <CheckCircle2 v-if="passwordMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
              <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
              <span class="font-medium">{{ passwordMessage.text }}</span>
            </div>
            <button
              type="button"
              @click="passwordMessage.text = ''"
              class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-xl">
            <!-- Password Lama -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password Saat Ini (Password Lama) *
              </label>
              <div class="relative">
                <Lock class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="passwordForm.oldPassword"
                  :type="showOldPassword ? 'text' : 'password'"
                  required
                  placeholder="Masukkan password lama Anda"
                  class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-10 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
                />
                <button
                  type="button"
                  @click="showOldPassword = !showOldPassword"
                  class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  title="Lihat / Sembunyikan Password"
                >
                  <EyeOff v-if="showOldPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- Password Baru -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password Baru *
              </label>
              <div class="relative">
                <Lock class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="passwordForm.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  required
                  minlength="6"
                  placeholder="Minimal 6 karakter"
                  class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-10 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  title="Lihat / Sembunyikan Password"
                >
                  <EyeOff v-if="showNewPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p class="text-[11px] text-slate-400 mt-1">
                Gunakan kombinasi minimal 6 karakter dengan huruf dan angka.
              </p>
            </div>

            <!-- Konfirmasi Password Baru -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Konfirmasi Password Baru *
              </label>
              <div class="relative">
                <Lock class="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  v-model="passwordForm.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  placeholder="Ulangi password baru"
                  class="w-full text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none pl-9 pr-10 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-[#831843]"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  title="Lihat / Sembunyikan Password"
                >
                  <EyeOff v-if="showConfirmPassword" class="w-4 h-4" />
                  <Eye v-else class="w-4 h-4" />
                </button>
              </div>
              <p
                v-if="passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword"
                class="text-[11px] text-rose-500 font-semibold mt-1 flex items-center gap-1"
              >
                <AlertCircle class="w-3 h-3" />
                <span>Konfirmasi password tidak cocok dengan password baru.</span>
              </p>
            </div>

            <!-- Submit Button -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                :disabled="isChangingPassword || (passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword)"
                class="px-5 py-2.5 rounded-xl bg-[#831843] hover:bg-[#9d174d] text-white text-xs font-bold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck v-if="!isChangingPassword" class="w-4 h-4" />
                <div v-else class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{{ isChangingPassword ? 'Mengubah Password...' : 'Perbarui Password' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useGamificationStore } from '~/stores/gamification.js'
import StarProgress from '~/components/gamification/StarProgress.vue'
import AchievementCard from '~/components/gamification/AchievementCard.vue'
import {
  Star,
  Award,
  ArrowRight,
  User,
  UserCheck,
  Mail,
  Phone,
  Briefcase,
  Building2,
  ShieldCheck,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  Upload,
  UploadCloud,
  Link2,
  Shuffle,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Save
} from 'lucide-vue-next'

const userStore = useUserStore()
const batchStore = useBatchStore()
const gamificationStore = useGamificationStore()

const crewProfile = computed(() => {
  return gamificationStore.crewById(userStore.currentUser?.id) || userStore.currentUser
})

// Active tab state
const activeTab = ref('profile') // 'profile' | 'security'

// ─── 1. Edit Profile Form State ──────────────────────────────────────────────
const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  gender: 'M',
  avatarUrl: ''
})

const avatarMode = ref('upload') // 'upload' | 'url'
const avatarFileName = ref('')
const selectedAvatarFile = ref(null)
const fileInputRef = ref(null)
const uploadedDataUrl = ref('')
const isSavingProfile = ref(false)
const profileMessage = reactive({ text: '', type: 'success' })

// Live Avatar Preview Computed
const avatarPreview = computed(() => {
  if (avatarMode.value === 'upload' && uploadedDataUrl.value) {
    return uploadedDataUrl.value
  }
  if (profileForm.avatarUrl && profileForm.avatarUrl.trim()) {
    return profileForm.avatarUrl.trim()
  }
  return userStore.currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileForm.name || userStore.currentUser?.name || 'User')}`
})

function populateProfileForm() {
  const cur = userStore.currentUser || {}
  profileForm.name = cur.name || ''
  profileForm.email = cur.email || ''
  profileForm.phone = cur.phone || ''
  profileForm.gender = cur.gender || 'M'
  profileForm.avatarUrl = cur.avatarUrl || ''

  if (cur.avatarUrl && (cur.avatarUrl.startsWith('data:image/') || cur.avatarUrl.startsWith('blob:'))) {
    avatarMode.value = 'upload'
    uploadedDataUrl.value = cur.avatarUrl
    avatarFileName.value = 'Foto Tersimpan'
  } else if (cur.avatarUrl && (cur.avatarUrl.startsWith('http://') || cur.avatarUrl.startsWith('https://'))) {
    avatarMode.value = 'url'
  } else {
    avatarMode.value = 'upload'
  }
}

onMounted(() => {
  populateProfileForm()
})

watch(
  () => userStore.currentUser,
  () => {
    if (!profileForm.name) {
      populateProfileForm()
    }
  },
  { deep: true }
)

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    profileMessage.text = 'Ukuran file terlalu besar! Maksimal 5MB.'
    profileMessage.type = 'error'
    return
  }

  selectedAvatarFile.value = file
  avatarFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedDataUrl.value = e.target.result
    profileForm.avatarUrl = e.target.result
    profileMessage.text = ''
  }
  reader.readAsDataURL(file)
}

function resetUploadedFile() {
  selectedAvatarFile.value = null
  avatarFileName.value = ''
  uploadedDataUrl.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
  profileForm.avatarUrl = ''
}

function generateRandomAvatar() {
  const seed = `${profileForm.name || 'User'}-${Date.now()}`
  profileForm.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

async function handleSaveProfile() {
  if (!profileForm.name || !profileForm.name.trim()) {
    profileMessage.text = 'Nama lengkap wajib diisi.'
    profileMessage.type = 'error'
    return
  }

  isSavingProfile.value = true
  profileMessage.text = ''

  try {
    let payload

    if (avatarMode.value === 'upload' && selectedAvatarFile.value) {
      const formData = new FormData()
      formData.append('name', profileForm.name.trim())
      formData.append('phone', profileForm.phone ? profileForm.phone.trim() : '')
      formData.append('gender', profileForm.gender)
      formData.append('avatar', selectedAvatarFile.value)
      payload = formData
    } else {
      const finalAvatar = avatarMode.value === 'upload'
        ? (uploadedDataUrl.value || profileForm.avatarUrl)
        : profileForm.avatarUrl

      payload = {
        name: profileForm.name.trim(),
        phone: profileForm.phone ? profileForm.phone.trim() : '',
        gender: profileForm.gender,
        avatarUrl: finalAvatar,
        avatar: finalAvatar
      }
    }

    await userStore.updateProfile(payload)

    selectedAvatarFile.value = null
    profileMessage.text = 'Profil Anda berhasil diperbarui!'
    profileMessage.type = 'success'
  } catch (err) {
    profileMessage.text = `Gagal menyimpan profil: ${err.message || 'Terjadi kesalahan sistem.'}`
    profileMessage.type = 'error'
  } finally {
    isSavingProfile.value = false
  }
}

// ─── 2. Change Password Form State ───────────────────────────────────────────
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isChangingPassword = ref(false)
const passwordMessage = reactive({ text: '', type: 'success' })

async function handleChangePassword() {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    passwordMessage.text = 'Password lama dan password baru wajib diisi.'
    passwordMessage.type = 'error'
    return
  }

  if (passwordForm.newPassword.length < 6) {
    passwordMessage.text = 'Password baru minimal harus 6 karakter.'
    passwordMessage.type = 'error'
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordMessage.text = 'Konfirmasi password tidak sesuai dengan password baru.'
    passwordMessage.type = 'error'
    return
  }

  isChangingPassword.value = true
  passwordMessage.text = ''

  try {
    const res = await userStore.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    })

    passwordMessage.text = res?.message || 'Password berhasil diperbarui! Silakan gunakan password baru ini pada login berikutnya.'
    passwordMessage.type = 'success'

    // Reset password form
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    passwordMessage.text = `Gagal mengubah password: ${err.message || 'Password lama tidak sesuai.'}`
    passwordMessage.type = 'error'
  } finally {
    isChangingPassword.value = false
  }
}

// Role badge styling helper
function getRoleBadgeClass(role) {
  const r = (role || '').toUpperCase()
  if (r === 'SUPERADMIN') return 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
  if (r === 'DISTRICT_MANAGER' || r === 'HEAD') return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
  if (r === 'STORE_LEADER' || r === 'SUPERVISOR') return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
  return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
}
</script>

