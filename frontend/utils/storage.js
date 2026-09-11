/**
 * Utility for Clean Storage without stale mock persistence
 * Mencegah data mock/cache lokal lama menimpa data realtime dari Backend API
 */

export function getStoredData(key, fallback) {
  // Selalu gunakan clean fallback untuk store state agar murni diisi response live API
  return JSON.parse(JSON.stringify(fallback))
}

export function setStoredData(key, data) {
  // No-op untuk store entity agar tidak menyimpan cache kadaluarsa di localStorage
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
      'rejuve_approvals_v4',
      'rejuve_stores_v1',
      'rejuve_buddy_packages_v1',
      'rejuve_buddy_packages_v4',
      'rejuve_buddy_evaluations_v1',
      'rejuve_buddy_evaluations_v4',
      'rejuve_feedback_survey_tmpl_v1',
      'rejuve_newhire_rapor_tmpl_v1',
      'rejuve_crew_feedbacks_v1',
      'rejuve_newhire_reports_v1'
    ]
    keys.forEach(k => {
      try {
        localStorage.removeItem(k)
      } catch (e) {
        // Ignore restricted storage contexts
      }
    })
  }
}

// Auto-purge all leftover mock/cache keys on client load
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    clearAllStoredData()
  } catch (e) {
    // Ignore storage errors in restricted contexts
  }
}

