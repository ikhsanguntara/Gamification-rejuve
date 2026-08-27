/**
 * Utility Functions: Mission Status & Completion Helper
 */

export const MISSION_STATUSES = {
  NOT_STARTED: {
    key: 'NOT_STARTED',
    label: 'Not Started',
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-400',
    icon: 'Circle'
  },
  IN_PROGRESS: {
    key: 'IN_PROGRESS',
    label: 'In Progress',
    color: 'rose',
    badgeClass: 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] border border-[#831843]/20',
    dotClass: 'bg-[#831843]',
    icon: 'Clock'
  },
  DRAFT: {
    key: 'DRAFT',
    label: 'Draft Saved',
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-500',
    icon: 'FileText'
  },
  EVALUATED: {
    key: 'EVALUATED',
    label: 'Evaluated',
    color: 'rose',
    badgeClass: 'bg-[#831843]/10 text-[#831843] dark:text-[#f472b6] border border-[#831843]/20',
    dotClass: 'bg-[#831843]',
    icon: 'ClipboardCheck'
  },
  PENDING_REVIEW: {
    key: 'PENDING_REVIEW',
    label: 'Pending Review',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    dotClass: 'bg-amber-500',
    icon: 'Hourglass'
  },
  REVISION_REQUIRED: {
    key: 'REVISION_REQUIRED',
    label: 'Revision Required',
    color: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    dotClass: 'bg-rose-500',
    icon: 'RotateCcw'
  },
  APPROVED: {
    key: 'APPROVED',
    label: 'Approved',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    dotClass: 'bg-emerald-500',
    icon: 'CheckCircle2'
  },
  COMPLETED: {
    key: 'COMPLETED',
    label: 'Completed',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    dotClass: 'bg-emerald-500',
    icon: 'CheckCheck'
  },
  LOCKED: {
    key: 'LOCKED',
    label: 'Locked',
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-400',
    icon: 'Lock'
  }
}

/**
 * Get metadata for mission status
 * @param {string} status 
 * @returns {object} Status metadata
 */
export function getMissionStatusMeta(status) {
  if (!status) return MISSION_STATUSES.NOT_STARTED
  const key = String(status).toUpperCase()
  return MISSION_STATUSES[key] || {
    key,
    label: key.replace(/_/g, ' '),
    color: 'slate',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-400',
    icon: 'Circle'
  }
}

/**
 * Calculate completion percentage and metrics for a list of missions
 * @param {Array} missions 
 * @returns {object}
 */
export function calculateBatchCompletion(missions = []) {
  if (!Array.isArray(missions) || missions.length === 0) {
    return {
      total: 0,
      completed: 0,
      pending: 0,
      revision: 0,
      inProgress: 0,
      percentage: 0
    }
  }

  const total = missions.length
  const completed = missions.filter(m => m.status === 'COMPLETED' || m.status === 'APPROVED').length
  const pending = missions.filter(m => m.status === 'PENDING_REVIEW').length
  const revision = missions.filter(m => m.status === 'REVISION_REQUIRED').length
  const inProgress = missions.filter(m => m.status === 'IN_PROGRESS' || m.status === 'EVALUATED' || m.status === 'DRAFT').length
  const percentage = Math.round((completed / total) * 100)

  return {
    total,
    completed,
    pending,
    revision,
    inProgress,
    percentage
  }
}
