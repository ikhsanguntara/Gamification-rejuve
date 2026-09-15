import { ref, onMounted, watch } from 'vue'

const theme = ref('dark') // 'light' | 'dark' | 'system' (Default: dark)
const isDark = ref(true)

export function useTheme() {
  const applyTheme = () => {
    if (typeof window === 'undefined') return

    let shouldBeDark = true
    if (theme.value === 'dark') {
      shouldBeDark = true
    } else if (theme.value === 'light') {
      shouldBeDark = false
    } else if (theme.value === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      shouldBeDark = true // Default dark
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
    } else {
      theme.value = 'dark'
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
