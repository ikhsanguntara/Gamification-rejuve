import { reactive } from 'vue'

const state = reactive({
  toasts: []
})

let toastCounter = 0

export function useToast() {
  const showToast = ({ title, message, type = 'success', duration = 4000, icon = null }) => {
    const id = ++toastCounter
    const toast = {
      id,
      title,
      message,
      type, // 'success' | 'warning' | 'error' | 'info' | 'star'
      icon,
      duration
    }

    state.toasts.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id) => {
    const index = state.toasts.findIndex(t => t.id === id)
    if (index !== -1) {
      state.toasts.splice(index, 1)
    }
  }

  const success = (title, message = '') => showToast({ title, message, type: 'success' })
  const warning = (title, message = '') => showToast({ title, message, type: 'warning' })
  const error = (title, message = '') => showToast({ title, message, type: 'error' })
  const info = (title, message = '') => showToast({ title, message, type: 'info' })
  const star = (title, message = '') => showToast({ title, message, type: 'star' })

  return {
    toasts: state.toasts,
    showToast,
    removeToast,
    success,
    warning,
    error,
    info,
    star
  }
}
