import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useBatchStore } from '~/stores/batch.js'

export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  const storeStore = useStoreStore()
  const batchStore = useBatchStore()

  // Inisialisasi autentikasi & sesi
  await userStore.initAuth()

  // Jika terhubung ke token API, ambil data live di background
  if (userStore.token) {
    try {
      await Promise.allSettled([
        userStore.fetchMe(),
        storeStore.fetchStoresFromApi(),
        batchStore.fetchBatchesFromApi()
      ])
    } catch (e) {
      console.warn('Initial API sync notice:', e.message)
    }
  }
})
