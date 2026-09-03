import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useApprovalStore } from '~/stores/approval.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useTemplateStore } from '~/stores/template.js'

export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()

  // Inisialisasi autentikasi & token sesi
  await userStore.initAuth()

  // Saat app dimuat / di-refresh, HANYA ambil data profil user login (/auth/me).
  // Data spesifik tiap menu (Stores, Users, Batches, Templates, Approvals, dll.)
  // hanya akan di-GET secara on-demand ketika user membuka menu tersebut (onMounted).
  if (userStore.token) {
    try {
      await userStore.fetchMe()
    } catch (e) {
      console.warn('Initial auth check notice:', e.message)
    }
  }
})
