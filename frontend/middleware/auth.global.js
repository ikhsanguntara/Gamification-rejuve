import { defineNuxtRouteMiddleware, navigateTo } from '#app'
import { useUserStore } from '~/stores/user.js'

export default defineNuxtRouteMiddleware(async (to) => {
  const userStore = useUserStore()
  await userStore.initAuth()

  // Allow navigation to login page
  if (to.path === '/login') {
    if (userStore.isAuthenticated) {
      if (userStore.isCrew) return navigateTo('/journey')
      return navigateTo('/dashboard')
    }
    return
  }

  // If not authenticated, redirect to login page
  if (!userStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // If user is Crew and navigates to dashboard, redirect directly to journey
  if (userStore.isCrew && to.path === '/dashboard') {
    return navigateTo('/journey')
  }
})
