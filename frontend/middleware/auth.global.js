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

  // Proteksi akses rute /buddy: hanya boleh diakses oleh Superadmin atau Store Leader dengan isBuddy === true
  if (to.path === '/buddy') {
    const role = userStore.currentRole
    const isBuddy = Boolean(userStore.currentUser?.isBuddy)
    const isAllowed = role === 'SUPERADMIN' || ((role === 'STORE_LEADER' || role === 'SUPERVISOR' || role === 'SL') && isBuddy)
    if (!isAllowed) {
      return navigateTo('/dashboard')
    }
  }

  // Proteksi akses rute /evaluations: District Manager tidak melakukan evaluasi langsung, dialihkan ke /approvals
  if (userStore.isDistrictManager && to.path === '/evaluations') {
    return navigateTo('/approvals')
  }
})
