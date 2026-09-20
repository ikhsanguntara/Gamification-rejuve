/**
 * Utility Functions: Star Gamification & Points
 * Sistem Gamifikasi: Murni Bintang & Poin (Tanpa Level)
 * - 1 Kartu Misi = Skala Nilai 0 - 100 Poin
 * - 1 Kartu Misi = Maksimal 5 Bintang
 * - 1 Bintang = 20 Poin
 */

/**
 * Hitung bintang dari nilai skala 0 - 100 Point
 * Aturan:
 * - 1 Kartu Mission = Skala 0 - 100 Point
 * - 1 Kartu Mission maksimal 5 Bintang
 * - 1 Bintang = 20 Points
 * - Rumus: (score / 100) * 5
 * - Pembulatan standar 1 angka di belakang koma (contoh: 78 -> 3.9, 81.5 -> 4.1)
 *
 * @param {number} score Nilai 0 - 100
 * @returns {number} 0.0 sampai 5.0 bintang
 */
export function calculateStars(score) {
  const numScore = Number(score) || 0
  if (numScore <= 0) return 0
  const clampedScore = Math.min(100, Math.max(0, numScore))
  const rawStars = (clampedScore / 100) * 5
  return Math.round(rawStars * 10) / 10
}

/**
 * Konversi Bintang ke Points
 * 1 Bintang = 20 Points
 * @param {number} stars
 * @returns {number} Points
 */
export function starsToPoints(stars) {
  const numStars = Number(stars) || 0
  return Math.round(numStars * 20)
}

/**
 * Hitung rata-rata nilai Store Leader (SL) dan District Manager (DM)
 * Skenario 1 (Reguler): SL = 78, DM = 85 -> Avg = 81.5, Bintang = 4.1
 * Skenario 2 (SL Tidak Menilai / Auto-Forward Job): isSlNotScored = true -> Nilai Murni DM = dmScore (100% DM)
 *
 * @param {number} slScore
 * @param {number} dmScore
 * @param {boolean} isSlNotScored
 * @returns {{ avgScore: number, stars: number, isPureDm: boolean }}
 */
export function calculateAverageDmSl(slScore, dmScore, isSlNotScored = false) {
  if (isSlNotScored) {
    const s2 = Number(dmScore) || 0
    const finalScore = Math.min(100, Math.max(0, Math.round(s2 * 10) / 10))
    const stars = calculateStars(finalScore)
    return {
      avgScore: finalScore,
      stars,
      isPureDm: true
    }
  }
  const s1 = Number(slScore) || 0
  const s2 = Number(dmScore) || 0
  const avgScore = Math.round(((s1 + s2) / 2) * 10) / 10
  const stars = calculateStars(avgScore)
  return {
    avgScore,
    stars,
    isPureDm: false
  }
}
