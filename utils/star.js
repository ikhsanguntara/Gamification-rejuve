/**
 * Utility Functions: Star Gamification & Level Progression
 */

export const STAR_LEVEL_THRESHOLDS = [
  { level: 1, minStars: 0, title: 'Novice Crew' },
  { level: 2, minStars: 100, title: 'Apprentice Specialist' },
  { level: 3, minStars: 250, title: 'Field Operator' },
  { level: 4, minStars: 500, title: 'Senior Operator' },
  { level: 5, minStars: 800, title: 'Rising Star' },
  { level: 6, minStars: 1200, title: 'Master Specialist' },
  { level: 7, minStars: 1500, title: 'Elite Inspector' },
  { level: 8, minStars: 2000, title: 'Operations Veteran' },
  { level: 9, minStars: 2500, title: 'Grandmaster' },
  { level: 10, minStars: 3500, title: 'Star Legend' }
]

/**
 * Calculate stars from a 0-100 numerical score
 * @param {number} score 
 * @returns {number} 1 to 5 stars
 */
export function calculateStars(score) {
  const numScore = Number(score) || 0
  if (numScore >= 90) return 5
  if (numScore >= 80) return 4
  if (numScore >= 70) return 3
  if (numScore >= 60) return 2
  return 1
}

/**
 * Get current star level from total stars
 * @param {number} totalStars 
 * @returns {number} Level (1-10)
 */
export function calculateStarLevel(totalStars) {
  const stars = Math.max(0, Number(totalStars) || 0)
  for (let i = STAR_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (stars >= STAR_LEVEL_THRESHOLDS[i].minStars) {
      return STAR_LEVEL_THRESHOLDS[i].level
    }
  }
  return 1
}

/**
 * Get details about next star level
 * @param {number} totalStars 
 * @returns {object} Next level threshold info
 */
export function getNextStarLevel(totalStars) {
  const currentLevel = calculateStarLevel(totalStars)
  if (currentLevel >= 10) {
    return {
      level: 10,
      minStars: 3500,
      title: 'Star Legend',
      isMaxLevel: true
    }
  }
  const next = STAR_LEVEL_THRESHOLDS.find(item => item.level === currentLevel + 1)
  return {
    ...next,
    isMaxLevel: false
  }
}

/**
 * Get comprehensive progress breakdown to the next level
 * @param {number} totalStars 
 * @returns {object} Progress stats
 */
export function getStarProgress(totalStars) {
  const stars = Math.max(0, Number(totalStars) || 0)
  const currentLevel = calculateStarLevel(stars)
  const currentLevelMeta = STAR_LEVEL_THRESHOLDS.find(item => item.level === currentLevel)
  const nextLevelMeta = getNextStarLevel(stars)

  if (nextLevelMeta.isMaxLevel && stars >= 3500) {
    return {
      currentLevel: 10,
      currentLevelTitle: currentLevelMeta.title,
      nextLevel: 10,
      nextLevelTitle: 'Max Level',
      currentStars: stars,
      levelMinStars: 3500,
      levelMaxStars: 3500,
      starsToNextLevel: 0,
      progressPercent: 100,
      isMaxLevel: true
    }
  }

  const levelMinStars = currentLevelMeta ? currentLevelMeta.minStars : 0
  const levelMaxStars = nextLevelMeta.minStars
  const starsInCurrentLevel = stars - levelMinStars
  const range = levelMaxStars - levelMinStars
  const progressPercent = Math.min(100, Math.max(0, Math.round((starsInCurrentLevel / range) * 100)))
  const starsToNextLevel = Math.max(0, levelMaxStars - stars)

  return {
    currentLevel,
    currentLevelTitle: currentLevelMeta ? currentLevelMeta.title : 'Novice Crew',
    nextLevel: nextLevelMeta.level,
    nextLevelTitle: nextLevelMeta.title,
    currentStars: stars,
    levelMinStars,
    levelMaxStars,
    starsToNextLevel,
    progressPercent,
    isMaxLevel: false
  }
}
