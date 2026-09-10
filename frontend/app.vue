<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Mount Global Toast Container di Root App -->
    <ToastContainer />
    <!-- Mount Global API Loading Screen Overlay di Root App -->
    <GlobalLoadingOverlay />
  </div>
</template>

<script setup>
import ToastContainer from '~/components/ui/ToastContainer.vue'
import GlobalLoadingOverlay from '~/components/ui/GlobalLoadingOverlay.vue'
</script>
