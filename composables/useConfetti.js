import confetti from 'canvas-confetti'

export function useConfetti() {
  const triggerStarBurst = (origin = { x: 0.5, y: 0.5 }) => {
    if (typeof window === 'undefined') return

    // Gold/amber star colors
    const colors = ['#f59e0b', '#fbbf24', '#fcd34d', '#fef08a', '#10b981']

    confetti({
      particleCount: 50,
      spread: 60,
      origin,
      colors,
      shapes: ['star'],
      scalar: 1.2
    })

    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      })
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      })
    }, 150)
  }

  const triggerLevelUp = () => {
    if (typeof window === 'undefined') return

    const duration = 2 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#f59e0b', '#22c55e']
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#f59e0b', '#22c55e']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  return {
    triggerStarBurst,
    triggerLevelUp
  }
}
