import { reactive, computed } from 'vue'

const state = reactive({
  activeRequests: 0,
  message: 'Memproses permintaan...',
  submessage: 'Harap tunggu, sistem sedang memproses data ke server.'
})

export function useLoading() {
  const isLoading = computed(() => state.activeRequests > 0)
  const message = computed(() => state.message)
  const submessage = computed(() => state.submessage)

  const startLoading = (msg = 'Memproses permintaan...', sub = 'Harap tunggu, sistem sedang memproses data ke server.') => {
    state.activeRequests++
    state.message = msg
    state.submessage = sub
  }

  const stopLoading = () => {
    state.activeRequests = Math.max(0, state.activeRequests - 1)
  }

  const resetLoading = () => {
    state.activeRequests = 0
  }

  const withLoading = async (fn, msg, sub) => {
    startLoading(msg, sub)
    try {
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return {
    isLoading,
    message,
    submessage,
    startLoading,
    stopLoading,
    resetLoading,
    withLoading
  }
}
