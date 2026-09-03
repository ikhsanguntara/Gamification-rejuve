import { useUserStore } from '~/stores/user.js'
import { useStoreStore } from '~/stores/store.js'
import { useBatchStore } from '~/stores/batch.js'
import { useMissionStore } from '~/stores/mission.js'
import { useApprovalStore } from '~/stores/approval.js'
import { useEvaluationStore } from '~/stores/evaluation.js'
import { useTemplateStore } from '~/stores/template.js'

export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()
  const storeStore = useStoreStore()
  const batchStore = useBatchStore()
  const missionStore = useMissionStore()
  const approvalStore = useApprovalStore()
  const evaluationStore = useEvaluationStore()
  const templateStore = useTemplateStore()

  // Inisialisasi autentikasi & sesi
  await userStore.initAuth()

  // Jika terhubung ke token API, ambil seluruh data riil dari backend PostgreSQL
  if (userStore.token) {
    try {
      await Promise.allSettled([
        userStore.fetchMe(),
        userStore.fetchUsersFromApi(),
        storeStore.fetchStoresFromApi(),
        batchStore.fetchBatchesFromApi(),
        missionStore.fetchMissionsFromApi(),
        approvalStore.fetchApprovalsFromApi(),
        evaluationStore.fetchEvaluationsFromApi(),
        templateStore.fetchTemplatesFromApi()
      ])
    } catch (e) {
      console.warn('Initial API sync notice:', e.message)
    }
  }
})
