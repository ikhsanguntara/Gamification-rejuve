<template>
  <div class="min-h-[50vh] flex items-center justify-center">
    <div class="flex items-center gap-3 text-slate-400">
      <span class="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
      <span class="text-sm font-medium">Redirecting to Dashboard...</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '~/stores/user.js'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  userStore.initAuth()
  if (userStore.isAuthenticated) {
    router.replace('/dashboard')
  } else {
    router.replace('/login')
  }
})
</script>
