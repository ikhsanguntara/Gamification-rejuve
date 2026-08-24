<template>
  <div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
    <!-- Desktop Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
      <!-- App Header -->
      <AppHeader />

      <!-- Page Slot -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <slot />
      </main>
    </div>

    <!-- Mobile Bottom Navigation Bar -->
    <MobileNavigation />

    <!-- Global Toast Container -->
    <ToastContainer />
  </div>
</template>

<script setup>
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import MobileNavigation from '~/components/layout/MobileNavigation.vue'
import ToastContainer from '~/components/ui/ToastContainer.vue'
</script>
