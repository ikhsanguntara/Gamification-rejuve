<template>
  <header class="h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6">
    <!-- Left: Brand Logo & Batch / Gerai Quick Selector -->
    <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
      <!-- Mobile Brand Logo -->
      <NuxtLink to="/dashboard" class="lg:hidden flex items-center gap-2 flex-shrink-0">
        <div class="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-sm ring-2 ring-[#831843]/30">
          <img src="/images/logo.png" alt="Re.juve" class="w-full h-full object-cover" />
        </div>
        <span class="font-bold text-sm text-slate-900 dark:text-white hidden xs:inline">Re.juve</span>
      </NuxtLink>

      <!-- Batch / Gerai Selector: Locked for Crew, Dropdown for Supervisor/Head/Admin -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <!-- For CREW: Locked Batch Badge -->
        <div
          v-if="userStore.isCrew"
          class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-xs font-semibold text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60"
        >
          <Layers class="w-3.5 h-3.5 text-[#831843] dark:text-[#f472b6] flex-shrink-0" />
          <span class="truncate max-w-[140px] xs:max-w-[180px]">
            {{ batchStore.currentBatch.name }}
          </span>
        </div>

        <!-- For SUPERVISOR/HEAD/SUPERADMIN: Interactive Dropdown -->
        <div v-else class="relative max-w-[140px] xs:max-w-[180px] sm:max-w-[240px]">
          <select
            :value="batchStore.selectedBatchId"
            @change="handleBatchChange($event.target.value)"
            class="appearance-none w-full bg-slate-100/80 dark:bg-slate-800/80 border-none text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-xl pl-2.5 sm:pl-3 pr-7 py-1.5 focus:ring-2 focus:ring-[#831843] cursor-pointer truncate"
          >
            <option
              v-for="b in batchStore.allBatches"
              :key="b.id"
              :value="b.id"
            >
              {{ b.name }}
            </option>
          </select>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

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
            {{ userStore.currentUser.name }}
          </span>
          <span class="text-xs font-medium text-slate-500 dark:text-slate-400 block leading-none">
            {{ userStore.currentUser.roleTitle }}
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

      <!-- Notification Bell with Popover -->
      <div class="relative">
        <button
          type="button"
          @click="showNotifications = !showNotifications; showUserMenu = false"
          class="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell class="w-4 h-4" />
          <span
            v-if="userStore.unreadNotificationsCount > 0"
            class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"
          ></span>
        </button>

        <!-- Notification Panel -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="showNotifications"
            class="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50"
          >
            <div class="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span class="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</span>
              <button
                type="button"
                @click="userStore.markNotificationsAsRead"
                class="text-xs text-[#499ec7] dark:text-[#84cded] hover:underline font-semibold cursor-pointer"
              >
                Mark all as read
              </button>
            </div>
            <div class="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
              <div
                v-for="n in userStore.notifications"
                :key="n.id"
                class="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div class="flex items-start gap-2.5">
                  <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" :class="n.isRead ? 'bg-slate-300 dark:bg-slate-600' : 'bg-[#499ec7]'"></div>
                  <div>
                    <p class="text-xs font-semibold text-slate-900 dark:text-white">{{ n.title }}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ n.message }}</p>
                    <span class="text-xs text-slate-400 mt-1 block">{{ n.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- User Menu Dropdown -->
      <div class="relative">
        <button
          type="button"
          @click="showUserMenu = !showUserMenu; showNotifications = false"
          class="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#499ec7]/50 transition-all"
        >
          <img
            :src="userStore.currentUser.avatar"
            :alt="userStore.currentUser.name"
            class="w-8 h-8 rounded-full object-cover ring-2 ring-[#499ec7]/30"
          />
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 -translate-y-1"
        >
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50"
          >
            <!-- User Info Header -->
            <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
              <p class="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {{ userStore.currentUser.name }}
              </p>
              <p class="text-xs text-slate-400 truncate">
                {{ userStore.currentUser.email }}
              </p>
              <span class="inline-block text-xs font-semibold px-2 py-0.5 mt-1 rounded bg-[#499ec7]/10 text-[#24779f] dark:text-[#84cded]">
                {{ userStore.currentUser.roleTitle }}
              </span>
            </div>

            <!-- Links -->
            <div class="py-1">
              <NuxtLink
                to="/profile"
                @click="showUserMenu = false"
                class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <User class="w-3.5 h-3.5" />
                <span>My Profile</span>
              </NuxtLink>

              <NuxtLink
                to="/settings"
                @click="showUserMenu = false"
                class="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Settings class="w-3.5 h-3.5" />
                <span>Settings</span>
              </NuxtLink>
            </div>

            <!-- Logout Action -->
            <div class="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                @click="handleLogout"
                class="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
              >
                <LogOut class="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useTheme } from '~/composables/useTheme.js'
import { useToast } from '~/composables/useToast.js'
import {
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  User,
  Settings,
  LogOut,
  MapPin
} from 'lucide-vue-next'

const router = useRouter()
const userStore = useUserStore()
const batchStore = useBatchStore()
const { isDark, toggleTheme } = useTheme()
const toast = useToast()

const showNotifications = ref(false)
const showUserMenu = ref(false)

const roleDotClass = computed(() => {
  if (userStore.isCrew) return 'bg-[#499ec7]'
  if (userStore.isSupervisor) return 'bg-amber-500'
  return 'bg-[#963189]'
})

const handleBatchChange = (batchId) => {
  batchStore.selectBatch(batchId)
  toast.info('Batch Diubah', `Batch aktif beralih ke ${batchStore.currentBatch.name}`)
}

const handleLogout = () => {
  showUserMenu.value = false
  userStore.logout()
  toast.info('Logged Out', 'You have been signed out successfully.')
  router.push('/login')
}
</script>
