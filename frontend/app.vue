<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Mount Global Toast Container di Root App -->
    <ToastContainer />
  </div>
</template>

<script setup>
import ToastContainer from '~/components/ui/ToastContainer.vue'
</script>
