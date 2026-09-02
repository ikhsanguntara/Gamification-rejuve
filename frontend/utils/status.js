/**
 * Utility Functions: Week Locking & Status Checks
 */

/**
 * Check if a week is locked for editing
 * @param {number} weekNumber 
 * @param {number} currentWeek 
 * @returns {boolean}
 */
export function isWeekLocked(weekNumber, currentWeek) {
  const targetWeek = Number(weekNumber)
  const activeWeek = Number(currentWeek)
  return targetWeek !== activeWeek
}

/**
 * Get state descriptor for a week
 * @param {number} weekNumber 
 * @param {number} currentWeek 
 * @returns {'COMPLETED'|'ACTIVE'|'LOCKED'}
 */
export function getWeekStatus(weekNumber, currentWeek) {
  const targetWeek = Number(weekNumber)
  const activeWeek = Number(currentWeek)
  if (targetWeek < activeWeek) return 'COMPLETED'
  if (targetWeek === activeWeek) return 'ACTIVE'
  return 'LOCKED'
}

/**
 * Check if current supervisor can modify evaluation for the specified week
 * @param {number} weekNumber 
 * @param {number} currentWeek 
 * @returns {boolean}
 */
export function canSupervisorEditWeek(weekNumber, currentWeek) {
  return Number(weekNumber) === Number(currentWeek)
}
