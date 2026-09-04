<template>
  <div class="p-8 text-center text-xs text-slate-400">
    Mengalihkan ke Konsol Administrator...
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace('/admin/users')
})
</script>
