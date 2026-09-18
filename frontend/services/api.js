import { apiFetch, setAuthToken } from '../composables/useApi.js'

// ─── 1. Auth Service ────────────────────────────────────────────────────────
export const authApi = {
  login: async (credentials) => {
    const res = await apiFetch('/auth/login', { method: 'POST', body: credentials })
    if (res?.data?.token) {
      setAuthToken(res.data.token)
    }
    return res
  },
  me: () => apiFetch('/auth/me', { method: 'GET' }),
  changePassword: (data) => apiFetch('/auth/change-password', { method: 'POST', body: data }),
  setActiveBatch: async (batchId) => {
    const res = await apiFetch('/auth/active-batch', { method: 'PATCH', body: { batchId } })
    if (res?.data?.token) {
      setAuthToken(res.data.token)
    }
    return res
  },
  updateProfile: (data) => apiFetch('/auth/profile', { method: 'PUT', body: data })
}

// ─── 2. Master Departments (Stores) Service ─────────────────────────────────
export const departmentApi = {
  getAll: (params) => apiFetch('/masters/departments', { method: 'GET', params }),
  getById: (id) => apiFetch(`/masters/departments/${id}`, { method: 'GET' }),
  create: (data) => apiFetch('/masters/departments', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/masters/departments/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/masters/departments/${id}`, { method: 'DELETE' })
}

// ─── 3. Master Users Service ────────────────────────────────────────────────
export const userApi = {
  getAll: (params) => apiFetch('/masters/users', { method: 'GET', params }),
  getById: (id) => apiFetch(`/masters/users/${id}`, { method: 'GET' }),
  create: (data) => apiFetch('/masters/users', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/masters/users/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/masters/users/${id}`, { method: 'DELETE' }),
  downloadTemplate: () => apiFetch('/masters/users/template', { method: 'GET', responseType: 'blob' }),
  bulkPreview: (formData) => apiFetch('/masters/users/bulk-preview', { method: 'POST', body: formData }),
  bulkCommit: (data) => apiFetch('/masters/users/bulk-commit', { method: 'POST', body: data })
}

// ─── 4. Master Roles Service ────────────────────────────────────────────────
export const roleApi = {
  getAll: (params) => apiFetch('/masters/roles', { method: 'GET', params }),
  getById: (id) => apiFetch(`/masters/roles/${id}`, { method: 'GET' }),
  create: (data) => apiFetch('/masters/roles', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/masters/roles/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/masters/roles/${id}`, { method: 'DELETE' })
}

// ─── 5. Bisnis Parameter Service ────────────────────────────────────────────
export const paramApi = {
  getGroups: (params) => apiFetch('/params/groups', { method: 'GET', params }),
  getGroupById: (id) => apiFetch(`/params/groups/${id}`, { method: 'GET' }),
  createGroup: (data) => apiFetch('/params/groups', { method: 'POST', body: data }),
  updateGroup: (id, data) => apiFetch(`/params/groups/${id}`, { method: 'PUT', body: data }),
  deleteGroup: (id) => apiFetch(`/params/groups/${id}`, { method: 'DELETE' }),

  getParams: (params) => apiFetch('/params', { method: 'GET', params }),
  getByGroupCode: (groupCode) => apiFetch(`/params/group-code/${groupCode}`, { method: 'GET' }),
  getParamById: (id) => apiFetch(`/params/${id}`, { method: 'GET' }),
  createParam: (data) => apiFetch('/params', { method: 'POST', body: data }),
  updateParam: (id, data) => apiFetch(`/params/${id}`, { method: 'PUT', body: data }),
  deleteParam: (id) => apiFetch(`/params/${id}`, { method: 'DELETE' })
}

// ─── 6. Administration (Settings & User Policies) ───────────────────────────
export const adminApi = {
  getSettings: (params) => apiFetch('/admin/settings', { method: 'GET', params }),
  getSettingById: (id) => apiFetch(`/admin/settings/${id}`, { method: 'GET' }),
  createSetting: (data) => apiFetch('/admin/settings', { method: 'POST', body: data }),
  updateSetting: (id, data) => apiFetch(`/admin/settings/${id}`, { method: 'PUT', body: data }),
  deleteSetting: (id) => apiFetch(`/admin/settings/${id}`, { method: 'DELETE' }),

  getUserPolicies: (params) => apiFetch('/admin/user-policies', { method: 'GET', params }),
  getUserPolicyById: (id) => apiFetch(`/admin/user-policies/${id}`, { method: 'GET' }),
  createUserPolicy: (data) => apiFetch('/admin/user-policies', { method: 'POST', body: data }),
  updateUserPolicy: (id, data) => apiFetch(`/admin/user-policies/${id}`, { method: 'PUT', body: data }),
  deleteUserPolicy: (id) => apiFetch(`/admin/user-policies/${id}`, { method: 'DELETE' })
}

// ─── 7. Unified Master Templates Service ────────────────────────────────────
export const templateApi = {
  getAll: (params) => apiFetch('/templates', { method: 'GET', params }),
  getById: (id) => apiFetch(`/templates/${id}`, { method: 'GET' }),
  create: (data) => apiFetch('/templates', { method: 'POST', body: data }),
  update: (id, data) => apiFetch(`/templates/${id}`, { method: 'PUT', body: data }),
  delete: (id) => apiFetch(`/templates/${id}`, { method: 'DELETE' })
}

// ─── 8. Batches & Generator Service ─────────────────────────────────────────
export const batchApi = {
  getAll: (params) => apiFetch('/batches', { method: 'GET', params }),
  getById: (id) => apiFetch(`/batches/${id}`, { method: 'GET' }),
  create: (data) => apiFetch('/batches', { method: 'POST', body: data }),
  generate: (id) => apiFetch(`/batches/${id}/generate`, { method: 'POST' }),
  update: (id, data) => apiFetch(`/batches/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiFetch(`/batches/${id}`, { method: 'DELETE' })
}

// ─── 9. Evaluations & Approvals Service ─────────────────────────────────────
export const evaluationApi = {
  // Workstation Endpoints (Sidebar Kru & Detail Misi Kru)
  getCrews: (params) => apiFetch('/evaluations/crews', { method: 'GET', params }),
  getCrewMissions: (userId, params) => apiFetch(`/evaluations/crews/${userId}/missions`, { method: 'GET', params }),

  getUserMissions: (params) => apiFetch('/evaluations/user-missions', { method: 'GET', params }),
  getUserMissionById: (id) => apiFetch(`/evaluations/user-missions/${id}`, { method: 'GET' }),
  
  // Penilaian Buddy (Pra-Start 3 Hari -> COMPLETED)
  submitBuddyScore: (id, data) => apiFetch(`/evaluations/user-missions/${id}/buddy-score`, {
    method: 'POST',
    body: data
  }),

  // Penilaian Store Leader (Misi Journey -> SCORED_BY_TL)
  submitSlScore: (id, data) => apiFetch(`/evaluations/user-missions/${id}/sl-score`, {
    method: 'POST',
    body: data
  }),

  // Review District Manager (APPROVE / REVISE / REJECT)
  submitDmReview: (id, data) => apiFetch(`/evaluations/user-missions/${id}/dm-review`, {
    method: 'POST',
    body: data
  }),

  // Feedback Crew (Pasca-Finish -> COMPLETED)
  submitCrewFeedback: (id, data) => apiFetch(`/evaluations/user-missions/${id}/crew-feedback`, {
    method: 'POST',
    body: data
  }),

  // Rapor Resmi Evaluasi Buddy
  getBuddyReport: (userId) => apiFetch(`/evaluations/buddy-report/${userId}`, { method: 'GET' }),
  getBuddyReportHtml: (userId) => apiFetch(`/evaluations/buddy-report/${userId}/html`, { method: 'GET' })
}

// ─── 10. Lynx Sync Service ──────────────────────────────────────────────────
export const syncApi = {
  pullDepartments: () => apiFetch('/sync/departments/pull-all', { method: 'POST' }),
  pullUsers: () => apiFetch('/sync/users/pull-all', { method: 'POST' })
}

// ─── 11. Dashboard & Analytics Service ──────────────────────────────────────
export const dashboardApi = {
  getSummary: (params) => apiFetch('/dashboard/summary', { method: 'GET', params })
}

// ─── 12. Gamification & Leaderboard Service ─────────────────────────────────
export const gamificationApi = {
  getLeaderboard: (params) => apiFetch('/gamification/leaderboard', { method: 'GET', params })
}

// ─── 13. Feedback Kru Onboarding Service ────────────────────────────────────
export const feedbackApi = {
  getQuestions: () => apiFetch('/feedback/questions', { method: 'GET' }),
  getMyFeedback: () => apiFetch('/feedback/my-feedback', { method: 'GET' }),
  submitSurvey: (data) => apiFetch('/feedback/surveys', { method: 'POST', body: data }),
  getSurveys: (params) => apiFetch('/feedback/surveys', { method: 'GET', params }),
  getSurveyById: (id) => apiFetch(`/feedback/surveys/${id}`, { method: 'GET' })
}

// ─── 14. Notifications Service ──────────────────────────────────────────────
export const notificationApi = {
  getAll: (params) => apiFetch('/notifications', { method: 'GET', params }),
  getUnreadCount: () => apiFetch('/notifications/unread-count', { method: 'GET' }),
  markAsRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllAsRead: () => apiFetch('/notifications/mark-all-read', { method: 'PATCH' })
}

// ─── 15. Reports & Traceability Service ────────────────────────────────────
export const reportApi = {
  // 1. Rekapitulasi Insentif Buddy
  getBuddyIncentives: (params) => apiFetch('/reports/buddy-incentive', { method: 'GET', params }),
  getBuddyIncentiveDetail: (userId, params) => apiFetch(`/reports/buddy-incentive/${userId}`, { method: 'GET', params }),
  exportBuddyIncentives: (params) => apiFetch('/reports/buddy-incentive/export', { method: 'GET', params, responseType: 'blob' }),
  exportBuddyIncentiveDetail: (userId, params) => apiFetch(`/reports/buddy-incentive/${userId}/export`, { method: 'GET', params, responseType: 'blob' }),

  // 2. Audit Traceability Kru / Active New Recruit
  getUserTraceability: (params) => apiFetch('/reports/user-traceability', { method: 'GET', params }),
  getUserTraceabilityDetail: (userId, params) => apiFetch(`/reports/user-traceability/${userId}`, { method: 'GET', params }),
  exportUserTraceability: (params) => apiFetch('/reports/user-traceability/export', { method: 'GET', params, responseType: 'blob' }),
  exportUserTraceabilityDetail: (userId, params) => apiFetch(`/reports/user-traceability/${userId}/export`, { method: 'GET', params, responseType: 'blob' })
}

