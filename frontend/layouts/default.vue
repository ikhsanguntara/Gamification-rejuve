<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
    <!-- Desktop Sidebar (Hidden for Crew Role) -->
    <AppSidebar v-if="!userStore.isCrew" />

    <!-- Main Content Area (Full Width for Crew) -->
    <div class="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0" :class="{ 'w-full max-w-full': userStore.isCrew }">
      <!-- App Header -->
      <AppHeader />

      <!-- Page Slot (100% Full Width) -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 w-full" :class="{ 'p-3 sm:p-5 lg:p-6': userStore.isCrew }">
        <slot />
      </main>
    </div>

    <!-- Mobile Bottom Navigation Bar (Active for all roles) -->
    <MobileNavigation />

    <!-- 🌟 First Login Festive Welcome Reward Modal (For Crew) -->
    <WelcomeRewardModal />
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user.js'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import MobileNavigation from '~/components/layout/MobileNavigation.vue'
import WelcomeRewardModal from '~/components/gamification/WelcomeRewardModal.vue'

const userStore = useUserStore()
</script>
