/**
 * Utility for robust LocalStorage data persistence across client reloads and role transitions
 */

export function getStoredData(key, fallback) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const item = localStorage.getItem(key)
      if (item) {
        return JSON.parse(item)
      }
    } catch (e) {
      console.warn(`Error reading localStorage for ${key}`, e)
    }
  }
  return JSON.parse(JSON.stringify(fallback))
}

export function setStoredData(key, data) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.warn(`Error writing localStorage for ${key}`, e)
    }
  }
}

export function clearAllStoredData() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const keys = [
      'rejuve_batches_v3',
      'rejuve_batches_v4',
      'rejuve_users_v3',
      'rejuve_missions_v3',
      'rejuve_missions_v4',
      'rejuve_templates_v3',
      'rejuve_templates_v4',
      'rejuve_crews_v3',
      'rejuve_evaluations_v3',
      'rejuve_approvals_v3',
      'rejuve_stores_v1'
    ]
    keys.forEach(k => localStorage.removeItem(k))
  }
}
