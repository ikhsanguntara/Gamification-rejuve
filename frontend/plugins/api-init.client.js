import { useUserStore } from '~/stores/user.js'

export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()

  // Inisialisasi autentikasi & profil user saat aplikasi pertama kali dimuat di browser
  await userStore.initAuth()
})

