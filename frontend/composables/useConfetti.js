import confetti from 'canvas-confetti'

export function useConfetti() {
  /**
   * Efek Partikel Bintang Emas & Kemeriahan saat Approve Misi / Evaluasi Gamifikasi
   */
  const triggerApprovalStars = (origin = { x: 0.5, y: 0.4 }) => {
    if (typeof window === 'undefined') return

    try {
      // 1. Letupan Bintang Emas Utama di Tengah
      confetti({
        particleCount: 70,
        spread: 85,
        origin,
        ticks: 220,
        gravity: 0.75,
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef08a', '#10b981', '#831843', '#ec4899'],
        shapes: ['star'],
        scalar: 1.4
      })

      // 2. Meriam Bintang Kiri & Kanan
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 65,
          origin: { x: 0.1, y: 0.65 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#831843', '#10b981'],
          shapes: ['star', 'circle'],
          scalar: 1.2
        })
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 65,
          origin: { x: 0.9, y: 0.65 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#831843', '#10b981'],
          shapes: ['star', 'circle'],
          scalar: 1.2
        })
      }, 140)

      // 3. Taburan Hujan Bintang Emas Berkilau (Sparkles)
      setTimeout(() => {
        confetti({
          particleCount: 35,
          spread: 120,
          origin: { x: 0.5, y: 0.2 },
          colors: ['#fbbf24', '#fef08a', '#34d399', '#f472b6'],
          shapes: ['star'],
          gravity: 0.6,
          ticks: 200,
          scalar: 1.1
        })
      }, 300)
    } catch (err) {
      console.warn('Confetti star animation failed:', err)
    }
  }

  const triggerStarBurst = (origin = { x: 0.5, y: 0.5 }) => {
    triggerApprovalStars(origin)
  }

  const triggerLevelUp = () => {
    if (typeof window === 'undefined') return

    const duration = 2 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#fbbf24', '#f59e0b', '#22c55e', '#ec4899'],
        shapes: ['star']
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#fbbf24', '#f59e0b', '#22c55e', '#ec4899'],
        shapes: ['star']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const triggerExplosion = (origin = { x: 0.5, y: 0.6 }) => {
    if (typeof window === 'undefined') return

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin,
        colors: ['#831843', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
      })
    } catch (err) {
      console.warn('Confetti animation failed:', err)
    }
  }

  return {
    triggerApprovalStars,
    triggerStarBurst,
    triggerLevelUp,
    triggerExplosion
  }
}

