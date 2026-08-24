/**
 * Utility Functions: Date & Time Formatting
 */

/**
 * Format a date string into readable human format
 * @param {string|Date} dateStr 
 * @param {boolean} includeTime 
 * @returns {string} e.g. "24 Aug 2026" or "24 Aug 2026, 11:00"
 */
export function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return String(dateStr)

    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }

    if (includeTime) {
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.hour12 = false
    }

    return new Intl.DateTimeFormat('en-GB', options).format(date)
  } catch (e) {
    return String(dateStr)
  }
}
