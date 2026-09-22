<script setup>
definePageMeta({
  middleware: [
    function () {
      return navigateTo('/reports/buddy-incentive')
    }
  ]
})
</script>

<template>
  <div class="p-12 text-center text-slate-500">
    <div class="w-8 h-8 border-2 border-[#831843] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-sm font-semibold">Mengalihkan ke Rekapitulasi Insentif Buddy...</p>
  </div>
</template>
