import { ref, onMounted, watch } from 'vue'

const theme = ref('system') // 'light' | 'dark' | 'system'
const isDark = ref(false)

export function useTheme() {
  const applyTheme = () => {
    if (typeof window === 'undefined') return

    let shouldBeDark = false
    if (theme.value === 'dark') {
      shouldBeDark = true
    } else if (theme.value === 'light') {
      shouldBeDark = false
    } else {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    isDark.value = shouldBeDark
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const setTheme = (newTheme) => {
    theme.value = newTheme
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-theme', newTheme)
    }
    applyTheme()
  }

  const toggleTheme = () => {
    if (theme.value === 'dark') {
      setTheme('light')
    } else if (theme.value === 'light') {
      setTheme('dark')
    } else {
      setTheme(isDark.value ? 'light' : 'dark')
    }
  }

  onMounted(() => {
    const saved = localStorage.getItem('app-theme')
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      theme.value = saved
    }
    applyTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (theme.value === 'system') {
        applyTheme()
      }
    })
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme
  }
}
