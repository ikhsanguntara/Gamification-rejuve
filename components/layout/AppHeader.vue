<template>
  <header class="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6 w-full">
    <!-- Left: Brand Logo & Batch / Gerai Quick Selector -->
    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <!-- Mobile Brand Logo -->
      <NuxtLink to="/dashboard" class="lg:hidden flex items-center gap-2 flex-shrink-0">
        <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-sm ring-2 ring-[#831843]/30">
          <img src="/images/logo.png" alt="Re.juve" class="w-full h-full object-cover" />
        </div>
        <span class="font-bold text-sm text-slate-900 dark:text-white hidden xs:inline">Re.juve</span>
      </NuxtLink>

      <!-- Batch / Gerai Selector -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- For CREW or Single Batch Supervisor: Simple Pill -->
        <div
          v-if="userStore.isCrew || batchStore.accessibleBatches.length <= 1"
          class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
        >
          <Layers class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6] flex-shrink-0" />
          <span class="truncate max-w-[140px] xs:max-w-[180px]">
            {{ batchStore.currentBatch?.name || 'Batch 1' }}
          </span>
        </div>

        <!-- For Multi-Batch Users: Interactive Reka UI Dropdown -->
        <DropdownMenuRoot v-else>
          <DropdownMenuTrigger
            class="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-[#831843] transition-all cursor-pointer truncate max-w-[160px] xs:max-w-[200px] sm:max-w-[260px]"
            aria-label="Pilih Batch Gerai"
          >
            <Layers class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6] flex-shrink-0" />
            <span class="truncate">{{ batchStore.currentBatch?.name || 'Pilih Batch' }}</span>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuContent
              class="w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-1.5 z-50 focus:outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
              :side-offset="6"
            >
              <DropdownMenuLabel class="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pilih Gerai Aktif:
              </DropdownMenuLabel>
              <DropdownMenuItem
                v-for="b in batchStore.accessibleBatches"
                :key="b.id"
                @select="handleBatchChange(b.id)"
                class="flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-[#831843]/10 hover:text-[#831843] dark:hover:text-[#f472b6] cursor-pointer focus:outline-hidden transition-colors"
                :class="{ 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]': b.id === batchStore.selectedBatchId }"
              >
                <span>{{ b.name }}</span>
                <span class="text-[10px] opacity-75 font-mono">{{ b.code }}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>

        <!-- Week Indicator Pill -->
        <span class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium text-slate-600 dark:text-slate-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Week {{ batchStore.selectedWeek }}/3</span>
        </span>
      </div>
    </div>

    <!-- Right Controls: Persona Badge, Theme Toggle, Notifications, Profile Menu -->
    <div class="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
      <!-- Active Role Badge (Desktop) -->
      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
        <span class="w-2 h-2 rounded-full" :class="roleDotClass"></span>
        <div class="text-left">
          <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight">
            {{ userStore.currentUser?.name || 'Store Leader' }}
          </span>
          <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 block leading-none">
            {{ userStore.currentUser?.roleTitle || 'Store Leader (SL)' }}
          </span>
        </div>
      </div>

      <!-- Theme Switcher Button -->
      <button
        type="button"
        @click="toggleTheme"
        class="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        aria-label="Toggle theme"
      >
        <Sun v-if="isDark" class="w-4 h-4 text-amber-400" />
        <Moon v-else class="w-4 h-4 text-slate-600" />
      </button>

      <!-- Notification Popover using Reka UI Popover -->
      <PopoverRoot>
        <PopoverTrigger
          class="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-hidden"
          aria-label="Notifications"
        >
          <Bell class="w-4 h-4" />
          <span
            v-if="userStore.unreadNotificationCount > 0"
            class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"
          ></span>
        </PopoverTrigger>

        <PopoverPortal>
          <PopoverContent
            class="w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 focus:outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            :side-offset="8"
            align="end"
          >
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span class="text-xs font-bold text-slate-900 dark:text-white">Notifikasi</span>
              <button
                type="button"
                @click="userStore.markNotificationsAsRead"
                class="text-[11px] text-[#831843] dark:text-[#f472b6] font-semibold hover:underline cursor-pointer"
              >
                Tandai dibaca
              </button>
            </div>

            <div class="py-2 space-y-2 max-h-64 overflow-y-auto">
              <div
                v-for="notif in userStore.notifications"
                :key="notif.id"
                class="p-2.5 rounded-xl transition-colors text-xs space-y-0.5"
                :class="notif.isRead ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-500' : 'bg-[#831843]/5 dark:bg-[#831843]/10 text-slate-900 dark:text-white font-medium'"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold text-[11px]">{{ notif.title }}</span>
                  <span class="text-[10px] text-slate-400">{{ notif.time }}</span>
                </div>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{{ notif.message }}</p>
              </div>
            </div>
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>

      <!-- User Profile & Fast Persona Switcher Dropdown -->
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          class="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#831843]/30 transition-all cursor-pointer focus:outline-hidden"
          aria-label="User Account Menu"
        >
          <img
            :src="userStore.currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'"
            :alt="userStore.currentUser?.name || 'User'"
            class="w-8 h-8 rounded-full object-cover ring-2 ring-[#831843]/30"
          />
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent
            class="w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 focus:outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 divide-y divide-slate-100 dark:divide-slate-800"
            :side-offset="6"
            align="end"
          >
            <!-- User Info Header -->
            <div class="px-4 py-2">
              <p class="text-xs font-bold text-slate-900 dark:text-white truncate">
                {{ userStore.currentUser?.name }}
              </p>
              <p class="text-[11px] text-slate-400 truncate">
                {{ userStore.currentUser?.email }}
              </p>
              <span class="inline-block text-[10px] font-bold px-2 py-0.5 mt-1 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                {{ userStore.currentUser?.roleTitle }}
              </span>
            </div>

            <!-- Fast Persona Testing Switcher -->
            <div class="px-3 py-2 space-y-1.5 bg-slate-50/50 dark:bg-slate-800/30">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Ganti Akun Pengujian:
              </span>

              <div class="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  @click="switchAccount('sl-001')"
                  class="p-1.5 rounded-lg text-left text-[11px] border transition-all cursor-pointer"
                  :class="userStore.currentUserId === 'sl-001' || userStore.currentUserId === 'spv-001' ? 'border-[#831843] bg-[#831843]/10 text-[#831843] font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'"
                >
                  <span>👔 SL 1: Budi</span>
                  <span class="block text-[9px] text-slate-400">Batch 1 & 2</span>
                </button>

                <button
                  type="button"
                  @click="switchAccount('sl-002')"
                  class="p-1.5 rounded-lg text-left text-[11px] border transition-all cursor-pointer"
                  :class="userStore.currentUserId === 'sl-002' || userStore.currentUserId === 'spv-002' ? 'border-[#831843] bg-[#831843]/10 text-[#831843] font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'"
                >
                  <span>👔 SL 2: Dewi</span>
                  <span class="block text-[9px] text-slate-400">Batch 3 (PIM)</span>
                </button>

                <button
                  type="button"
                  @click="switchAccount('dm-001')"
                  class="p-1.5 rounded-lg text-left text-[11px] border transition-all cursor-pointer"
                  :class="userStore.currentUserId === 'dm-001' || userStore.currentUserId === 'head-001' ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'"
                >
                  <span>👑 DM 1: Ahmad</span>
                  <span class="block text-[9px] text-slate-400">Pusat (B1 & B2)</span>
                </button>

                <button
                  type="button"
                  @click="switchAccount('dm-002')"
                  class="p-1.5 rounded-lg text-left text-[11px] border transition-all cursor-pointer"
                  :class="userStore.currentUserId === 'dm-002' || userStore.currentUserId === 'head-002' ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'"
                >
                  <span>👑 DM 2: Citra</span>
                  <span class="block text-[9px] text-slate-400">Selatan (B3 PIM)</span>
                </button>

                <button
                  type="button"
                  @click="switchAccount('crew-001')"
                  class="p-1.5 rounded-lg text-left text-[11px] border transition-all cursor-pointer"
                  :class="userStore.currentUserId === 'crew-001' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'"
                >
                  <span>👤 Crew: Andi</span>
                  <span class="block text-[9px] text-slate-400">Batch 1 (GI)</span>
                </button>

                <button
                  type="button"
                  @click="switchAccount('admin-001')"
                  class="p-1.5 rounded-lg text-left text-[11px] border transition-all cursor-pointer"
                  :class="userStore.currentUserId === 'admin-001' ? 'border-slate-700 dark:border-slate-300 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'"
                >
                  <span>⚙️ Superadmin</span>
                  <span class="block text-[9px] text-slate-400">Siti Rahma</span>
                </button>
              </div>
            </div>

            <!-- Profile & Settings Navigation Links -->
            <div class="py-1">
              <DropdownMenuItem as-child>
                <NuxtLink
                  to="/profile"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-hidden"
                >
                  <User class="w-3.5 h-3.5" />
                  <span>Profil & Statistik Saya</span>
                </NuxtLink>
              </DropdownMenuItem>

              <DropdownMenuItem as-child>
                <NuxtLink
                  to="/settings"
                  class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-hidden"
                >
                  <Settings class="w-3.5 h-3.5" />
                  <span>Pengaturan & Simulasi</span>
                </NuxtLink>
              </DropdownMenuItem>
            </div>

            <!-- Logout Action -->
            <div class="pt-1">
              <DropdownMenuItem as-child>
                <button
                  type="button"
                  @click="handleLogout"
                  class="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer focus:outline-hidden"
                >
                  <LogOut class="w-3.5 h-3.5" />
                  <span>Keluar (Sign Out)</span>
                </button>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  PopoverRoot,
  PopoverTrigger,
  PopoverPortal,
  PopoverContent
} from 'reka-ui'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useTheme } from '~/composables/useTheme.js'
import { useToast } from '~/composables/useToast.js'
import {
  Layers,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  LogOut
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const { isDark, toggleTheme } = useTheme()
const toast = useToast()

const roleDotClass = computed(() => {
  switch (userStore.currentRole) {
    case 'CREW':
      return 'bg-emerald-500 ring-2 ring-emerald-500/20'
    case 'SUPERVISOR':
      return 'bg-amber-500 ring-2 ring-amber-500/20'
    case 'HEAD':
      return 'bg-[#831843] ring-2 ring-[#831843]/20'
    case 'SUPERADMIN':
      return 'bg-slate-700 dark:bg-slate-300 ring-2 ring-slate-400/20'
    default:
      return 'bg-slate-400'
  }
})

const handleBatchChange = (batchId) => {
  batchStore.selectBatch(batchId)
  toast.info('Cabang Berubah', `Melihat data untuk ${batchStore.currentBatch?.name || 'Batch'}`)
}

const switchAccount = (userId) => {
  userStore.loginAsUser(userId)
  toast.success('Beralih Akun', `Aktif sebagai ${userStore.currentUser.name} (${userStore.currentUser.roleTitle})`)
}

const handleLogout = () => {
  userStore.logout()
  toast.info('Keluar', 'Anda telah keluar dari sesi.')
  router.push('/login')
}
</script>
