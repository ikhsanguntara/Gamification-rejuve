import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useUserStore } from '~/stores/user.js'

export default defineNuxtRouteMiddleware((to) => {
  // Only execute on client or when store is ready
  const userStore = useUserStore()
  userStore.initAuth()

  // Allow navigation to login page
  if (to.path === '/login') {
    return
  }

  // If not authenticated, redirect to login page
  if (!userStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
