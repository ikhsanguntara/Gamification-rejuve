<template>
  <div class="p-8 text-center text-slate-500">
    <p>Mengarahkan ke direktori gerai...</p>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: [
    () => navigateTo('/admin/stores', { replace: true })
  ]
})
</script>
