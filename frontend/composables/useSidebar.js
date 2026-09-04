export const useSidebar = () => {
  const isMobileOpen = useState('mobile_sidebar_open', () => false)

  const toggleMobile = () => {
    isMobileOpen.value = !isMobileOpen.value
  }

  const closeMobile = () => {
    isMobileOpen.value = false
  }

  const openMobile = () => {
    isMobileOpen.value = true
  }

  return {
    isMobileOpen,
    toggleMobile,
    closeMobile,
    openMobile
  }
}
