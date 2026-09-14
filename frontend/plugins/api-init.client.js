import { useUserStore } from '~/stores/user.js'

export default defineNuxtPlugin(async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rejuve_api_base')
  }
  const userStore = useUserStore()

  // Inisialisasi autentikasi & profil user saat aplikasi pertama kali dimuat di browser
  await userStore.initAuth()
})

