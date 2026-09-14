<template>
  <div>
    <!-- Mobile Backdrop Overlay (< lg) -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileOpen"
        @click="closeMobile"
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        aria-hidden="true"
      />
    </Transition>

    <!-- Sidebar Element (Sticky on lg+, Off-canvas Drawer on < lg) -->
    <aside
      class="flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0 overflow-hidden transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 lg:z-20 fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full z-50 shadow-2xl lg:shadow-none"
      :class="[
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Brand Logo & App Name -->
      <div class="h-16 flex items-center justify-between px-5 gap-3 border-b border-slate-100 dark:border-slate-800/80 flex-shrink-0">
        <div class="flex items-center gap-3 min-w-0">
          <div class="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md ring-2 ring-[#831843]/30">
            <img
              src="/images/logo.png"
              alt="Re.juve Logo"
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <h1 class="font-bold text-base text-slate-900 dark:text-white leading-tight">
                Re.juve
              </h1>
              <span class="text-xs font-semibold px-1.5 py-0.2 rounded bg-[#831843]/10 text-[#831843] dark:text-[#f472b6]">
                SOP
              </span>
            </div>
          </div>
        </div>

        <!-- Mobile Close Button (Hidden on lg+) -->
        <button
          type="button"
          @click="closeMobile"
          class="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Tutup Menu Sidebar"
          title="Tutup Menu"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

    <!-- Navigation Links -->
    <nav class="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto min-h-0">
      <!-- ⚙️ Collapsible Administrator Dropdown Menu Group (for Superadmin) -->
      <div v-if="userStore.isSuperadmin" class="space-y-1 pb-2 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          @click="isAdminOpen = !isAdminOpen"
          class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          :class="[
            isAdminActive
              ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] dark:bg-[#831843]/20'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          ]"
        >
          <div class="flex items-center gap-3">
            <Settings class="w-4 h-4 text-[#831843] dark:text-[#f472b6]" />
            <span class="font-semibold text-xs">Administrator</span>
          </div>
          <ChevronUp v-if="isAdminOpen" class="w-4 h-4 text-slate-400 transition-transform" />
          <ChevronDown v-else class="w-4 h-4 text-slate-400 transition-transform" />
        </button>

        <!-- Submenu with Dot Bullets -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div v-show="isAdminOpen" class="pl-4 pr-1 py-1 space-y-1">
            <!-- User Submenu -->
            <NuxtLink
              to="/admin/users"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/users')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/users') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>User</span>
            </NuxtLink>

            <!-- Store Submenu -->
            <NuxtLink
              to="/admin/stores"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/stores')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/stores') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Store</span>
            </NuxtLink>

            <!-- Batch Submenu -->
            <NuxtLink
              to="/admin/batches"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/batches')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/batches') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Batch</span>
            </NuxtLink>

            <!-- Mission Submenu -->
            <NuxtLink
              to="/admin/missions"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/missions')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/missions') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Mission</span>
            </NuxtLink>

            <!-- Template Misi Submenu -->
            <NuxtLink
              to="/admin/templates"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/templates')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/templates') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Template Misi</span>
            </NuxtLink>

            <!-- Role Submenu -->
            <NuxtLink
              to="/admin/roles"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/roles')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/roles') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Role</span>
            </NuxtLink>

            <!-- Bisnis Parameter Submenu -->
            <NuxtLink
              to="/admin/params"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/params')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/params') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Bisnis Parameter</span>
            </NuxtLink>

            <!-- Pengaturan Sistem Submenu -->
            <NuxtLink
              to="/admin/settings"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/settings')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/settings') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Pengaturan Sistem</span>
            </NuxtLink>

            <!-- Kebijakan Pengguna Submenu -->
            <NuxtLink
              to="/admin/user-policies"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/user-policies')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/user-policies') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Kebijakan Pengguna</span>
            </NuxtLink>

            <!-- Lynx Sync Submenu -->
            <NuxtLink
              to="/admin/lynx-sync"
              class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group"
              :class="[
                $route.path.startsWith('/admin/lynx-sync')
                  ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              ]"
            >
              <span
                class="w-1.5 h-1.5 rounded-full transition-colors"
                :class="$route.path.startsWith('/admin/lynx-sync') ? 'bg-[#831843] dark:bg-[#f472b6]' : 'bg-slate-400 dark:bg-slate-600'"
              ></span>
              <span>Sinkronisasi Lynx</span>
            </NuxtLink>
          </div>
        </Transition>
      </div>

      <!-- Standard Navigation Links -->
      <NuxtLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group"
        :class="[
          $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard' && !item.path.startsWith('/admin'))
            ? 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] dark:bg-[#831843]/20 font-semibold shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
        ]"
      >
        <component
          :is="item.icon"
          class="w-5 h-5 flex-shrink-0 transition-colors"
          :class="[
            $route.path === item.path || ($route.path.startsWith(item.path) && item.path !== '/dashboard' && !item.path.startsWith('/admin'))
              ? 'text-[#831843] dark:text-[#f472b6]'
              : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
          ]"
        />
        <span>{{ item.label }}</span>
        <span
          v-if="item.badge"
          class="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="item.badgeStyle || 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'"
        >
          {{ item.badge }}
        </span>
      </NuxtLink>
    </nav>

    <!-- Active Batch & Week Mini Widget -->
    <div class="p-3.5 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
          {{ batchStore.currentBatch?.name || 'Memuat Batch...' }}
        </span>
        <span class="text-xs font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          {{ batchStore.currentBatchUnitCode || 'Week' }} {{ batchStore.selectedWeek || 1 }} Active
        </span>
      </div>
      <div class="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
        <div
          class="bg-[#831843] dark:bg-[#f472b6] h-full rounded-full transition-all duration-500"
          :style="{ width: `${batchStore.currentBatch?.weeks?.[batchStore.selectedWeek - 1]?.completionRate || 0}%` }"
        ></div>
      </div>
      <div class="flex items-center justify-between text-xs text-slate-400 mt-1.5">
        <span>Cycle Progress</span>
        <span class="font-semibold">{{ batchStore.currentBatch?.weeks?.[batchStore.selectedWeek - 1]?.completionRate || 0 }}%</span>
      </div>
    </div>

    <!-- Bottom User Section -->
    <div class="p-3.5 px-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-3 flex-shrink-0 bg-white dark:bg-slate-900">
      <img
        :src="userStore.currentUser.avatar"
        :alt="userStore.currentUser.name"
        class="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-900 dark:text-white truncate">
          {{ userStore.currentUser.name }}
        </p>
        <p class="text-xs text-slate-400 dark:text-slate-500 truncate">
          {{ userStore.currentUser.position }}
        </p>
      </div>
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/settings"
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Settings & Simulation Controls"
        >
          <Settings class="w-4 h-4" />
        </NuxtLink>
        <button
          type="button"
          @click="handleLogout"
          class="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          title="Sign Out"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '~/stores/user.js'
import { useBatchStore } from '~/stores/batch.js'
import { useApprovalStore } from '~/stores/approval.js'
import { useMissionStore } from '~/stores/mission.js'
import { useToast } from '~/composables/useToast.js'
import { useSidebar } from '~/composables/useSidebar.js'
import {
  LayoutDashboard,
  Layers,
  Target,
  ClipboardCheck,
  ShieldCheck,
  Medal,
  Trophy,
  User,
  Settings,
  Sparkles,
  LogOut,
  ChevronDown,
  ChevronUp,
  Compass,
  Handshake,
  MessageSquareText,
  X
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const batchStore = useBatchStore()
const approvalStore = useApprovalStore()
const missionStore = useMissionStore()
const toast = useToast()
const { isMobileOpen, closeMobile } = useSidebar()

// Tutup drawer mobile secara otomatis setiap kali rute/halaman berpindah
watch(
  () => route.fullPath,
  () => {
    closeMobile()
  }
)

// Kunci scroll background body saat drawer mobile terbuka
watch(
  isMobileOpen,
  (open) => {
    if (typeof document !== 'undefined') {
      if (open && window.innerWidth < 1024) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }
)

// Tangani tombol keyboard Escape untuk menutup drawer
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && isMobileOpen.value) {
    closeMobile()
  }
}

onMounted(() => {
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', handleKeyDown)
  }
})

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.removeEventListener('keydown', handleKeyDown)
    document.body.style.overflow = ''
  }
})
const isAdminOpen = ref(true)

const isAdminActive = computed(() => {
  return route.path.startsWith('/admin')
})

watch(() => route.path, (newPath) => {
  if (newPath.startsWith('/admin')) {
    isAdminOpen.value = true
  }
}, { immediate: true })

const handleLogout = () => {
  userStore.logout()
  toast.info('Logged Out', 'You have been signed out.')
  router.push('/login')
}

const navItems = computed(() => {
  const role = userStore.currentRole
  const isBuddy = Boolean(userStore.currentUser?.isBuddy)

  if (role === 'SUPERADMIN') {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Batch Misi', path: '/batches', icon: Layers },
      {
        label: 'Penilaian Buddy',
        path: '/buddy',
        icon: Handshake
      },
      {
        label: 'Penilaian Kru',
        path: '/evaluations',
        icon: ClipboardCheck,
        badge: missionStore.revisionCount > 0 ? `${missionStore.revisionCount} Rev` : null,
        badgeStyle: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      },
      {
        label: 'Approvals (DM)',
        path: '/approvals',
        icon: ShieldCheck,
        badge: approvalStore.pendingApprovals.length > 0 ? `${approvalStore.pendingApprovals.length}` : null,
        badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      },
      { label: 'Feedback Onboarding', path: '/feedback', icon: MessageSquareText },
      { label: 'Leaderboard', path: '/leaderboard', icon: Medal },
      { label: 'Achievements', path: '/achievements', icon: Trophy }
    ]
  }

  if (role === 'CREW') {
    return [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Journey Map', path: '/journey', icon: Compass },
      { label: 'Feedback Onboarding', path: '/feedback', icon: MessageSquareText },
      { label: 'Leaderboard', path: '/leaderboard', icon: Medal },
      { label: 'Achievements', path: '/achievements', icon: Trophy },
      { label: 'Profil Saya', path: '/profile', icon: User }
    ]
  }

  if (role === 'STORE_LEADER' || role === 'SUPERVISOR' || role === 'SL') {
    const items = [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Batch Misi', path: '/batches', icon: Layers }
    ]

    // Menu Penilaian Buddy HANYA bisa dilihat role SL jika isBuddy bernilai true
    if (isBuddy) {
      items.push({
        label: 'Penilaian Buddy',
        path: '/buddy',
        icon: Handshake
      })
    }

    items.push(
      {
        label: 'Penilaian Kru',
        path: '/evaluations',
        icon: ClipboardCheck,
        badge: missionStore.revisionCount > 0 ? `${missionStore.revisionCount} Rev` : null,
        badgeStyle: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
      },
      { label: 'Leaderboard', path: '/leaderboard', icon: Medal },
      { label: 'Achievements', path: '/achievements', icon: Trophy }
    )

    return items
  }

  // DISTRICT_MANAGER / HEAD Role (Approvals DM, TANPA Penilaian Kru & TANPA Penilaian Buddy)
  return [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Batch Misi', path: '/batches', icon: Layers },
    {
      label: 'Approvals (DM)',
      path: '/approvals',
      icon: ShieldCheck,
      badge: approvalStore.pendingApprovals.length > 0 ? `${approvalStore.pendingApprovals.length}` : null,
      badgeStyle: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    },
    { label: 'Leaderboard', path: '/leaderboard', icon: Medal },
    { label: 'Achievements', path: '/achievements', icon: Trophy }
  ]
})
</script>
