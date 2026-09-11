import { defineStore } from 'pinia'
import { useGamificationStore } from './gamification.js'
import { useBatchStore } from './batch.js'

/**
 * User Store: Master Directory, Multi-Store Leader/District Manager Personas & Batch Permissions
 */

export const mockUsers = {}

// Initial full user directory
const initialDirectory = []

import { getStoredData, setStoredData } from '../utils/storage.js'
import { authApi, userApi, notificationApi } from '../services/api.js'
import { getAuthToken, setAuthToken } from '../composables/useApi.js'
import { buildPrismaQuery } from '../utils/queryBuilder.js'
import { cachedApiCall, invalidateApiCache } from '../utils/apiCache.js'

function extractRoleCode(raw) {
  if (!raw) return ''
  if (typeof raw === 'string') return raw.toUpperCase()
  return (raw.roleCode || raw.code || raw.name || '').toUpperCase()
}

function resolveRoleTitle(u) {
  if (!u) return 'Specialist'
  if (u.roleDetails?.roleName) return u.roleDetails.roleName
  const rawRole = extractRoleCode(u.role)
  const map = {
    SUPERADMIN: 'Super Administrator',
    STORE_LEADER: 'Store Leader',
    SUPERVISOR: 'Store Leader',
    DISTRICT_MANAGER: 'District Manager',
    CREW: 'Crew Specialist',
    BUDDY: 'Buddy Mentor'
  }
  return map[rawRole] || rawRole || 'Specialist'
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getAuthToken(),
    isAuthenticated: Boolean(getAuthToken()),
    apiUser: null,
    isLiveApi: false,
    currentUserId: '',
    userDirectory: getStoredData('rejuve_users_v3', []),
    serverPagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    },
    notifications: [],
    unreadCount: 0,
    isLoadingNotifications: false
  }),

  getters: {
    currentUser: (state) => {
      if (state.apiUser) {
        const roleCode = typeof state.apiUser.role === 'string'
          ? state.apiUser.role
          : (state.apiUser.roleDetails?.roleCode || state.apiUser.role?.roleCode || 'CREW')
        const title = resolveRoleTitle(state.apiUser)
        return {
          id: state.apiUser.userId,
          name: state.apiUser.name,
          role: roleCode,
          roleTitle: title,
          email: state.apiUser.email,
          avatar: state.apiUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
          department: state.apiUser.department?.departmentName || 'Store Operations',
          position: title,
          storeLocation: state.apiUser.department?.departmentName || 'Re.juve Store',
          activeBatchId: state.apiUser.activeBatchId || null,
          batchId: state.apiUser.activeBatchId || state.apiUser.batchId || null,
          stars: state.apiUser.stars || 0,
          level: state.apiUser.level || 1,
          isBuddy: Boolean(state.apiUser.isBuddy)
        }
      }
      const found = state.userDirectory.find(u => u.id === state.currentUserId)
      if (found) return found
      return {
        id: '',
        name: '',
        role: '',
        roleTitle: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        email: '',
        department: '',
        position: '',
        storeLocation: '',
        batchId: null,
        stars: 0,
        level: 1,
        isBuddy: false
      }
    },
    currentRole: (state) => {
      if (state.apiUser) {
        return extractRoleCode(state.apiUser.role) || extractRoleCode(state.apiUser.roleDetails) || 'CREW'
      }
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return extractRoleCode(u?.role) || ''
    },
    isCrew: (state) => {
      const r = state.currentRole
      return r === 'CREW'
    },
    isStoreLeader: (state) => {
      const r = state.currentRole
      return r === 'STORE_LEADER' || r === 'SUPERVISOR'
    },
    isDistrictManager: (state) => {
      const r = state.currentRole
      return r === 'DISTRICT_MANAGER' || r === 'HEAD' || r === 'OPS_DM'
    },
    isSupervisor: (state) => {
      const r = state.currentRole
      return r === 'STORE_LEADER' || r === 'SUPERVISOR'
    },
    isHead: (state) => {
      const r = state.currentRole
      return r === 'DISTRICT_MANAGER' || r === 'HEAD' || r === 'OPS_DM'
    },
    isSuperadmin: (state) => {
      const r = state.currentRole
      return r === 'SUPERADMIN'
    },

    allUsers: (state) => state.userDirectory || [],
    userById: (state) => (id) => {
      const found = (state.userDirectory || []).find(u => u.id === id)
      return found || null
    },

    storeLeaders: (state) => (state.userDirectory || []).filter(u => u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR'),
    buddyStoreLeaders: (state) => (state.userDirectory || []).filter(u => (u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR') && Boolean(u.isBuddy)),
    districtManagers: (state) => (state.userDirectory || []).filter(u => u.role === 'DISTRICT_MANAGER' || u.role === 'HEAD'),
    crews: (state) => (state.userDirectory || []).filter(u => u.role === 'CREW'),

    // Backward compatibility getters
    supervisors: (state) => (state.userDirectory || []).filter(u => u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR'),
    heads: (state) => (state.userDirectory || []).filter(u => u.role === 'DISTRICT_MANAGER' || u.role === 'HEAD'),

    assignedBatchId: (state) => {
      const u = (state.userDirectory || []).find(u => u.id === state.currentUserId)
      return u?.batchId || null
    },

    unreadNotificationCount: (state) => (state.notifications || []).filter(n => !n.isRead).length
  },

  actions: {
    async initAuth() {
      const savedToken = getAuthToken()
      if (savedToken) {
        this.token = savedToken
        this.isAuthenticated = true
        await this.fetchMe()
      } else {
        if (this.currentUserId && this.userDirectory && this.userDirectory.find(u => u.id === this.currentUserId)) {
          this.isAuthenticated = true
        } else {
          this.token = null
          this.apiUser = null
          this.isAuthenticated = false
        }
      }
      return this.isAuthenticated
    },

    async loginWithApi(credentials) {
      try {
        const res = await authApi.login(credentials)
        if (res && res.data && res.data.token) {
          setAuthToken(res.data.token)
          this.token = res.data.token
          this.apiUser = res.data.user
          this.isLiveApi = true
          this.isAuthenticated = true

          const apiU = res.data.user
          const mappedRole = extractRoleCode(apiU.role) || extractRoleCode(apiU.roleDetails) || 'CREW'
          let localRole = mappedRole
          if (mappedRole === 'STORE_LEADER' || mappedRole === 'SUPERVISOR') localRole = 'STORE_LEADER'
          else if (mappedRole === 'DISTRICT_MANAGER' || mappedRole === 'HEAD' || mappedRole === 'OPS_DM') localRole = 'DISTRICT_MANAGER'
          else if (mappedRole === 'SUPERADMIN') localRole = 'SUPERADMIN'
          else localRole = 'CREW'

          const existing = this.userDirectory.find(u => u.id === apiU.userId || u.email === apiU.email)
          if (existing) {
            existing.id = apiU.userId
            existing.name = apiU.name
            existing.role = localRole
            existing.email = apiU.email
            existing.isBuddy = Boolean(apiU.isBuddy)
            this.currentUserId = existing.id
          } else {
            const newUser = {
              id: apiU.userId,
              name: apiU.name,
              role: localRole,
              roleTitle: apiU.roleDetails?.roleName || localRole,
              email: apiU.email,
              avatar: apiU.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
              department: apiU.department?.departmentName || 'Store Operations',
              position: apiU.roleDetails?.roleName || 'Specialist',
              storeLocation: apiU.department?.departmentName || 'Re.juve Store',
              batchId: apiU.batchId || null,
              stars: apiU.stars || 0,
              level: apiU.level || 1,
              isBuddy: Boolean(apiU.isBuddy)
            }
            this.userDirectory.push(newUser)
            this.currentUserId = newUser.id
          }

          setStoredData('rejuve_users_v3', this.userDirectory)
          return { success: true, user: this.currentUser, data: res.data }
        }
      } catch (err) {
        console.warn('API login failed:', err.message)
        return { success: false, error: err.message }
      }
    },

    async fetchMe() {
      try {
        const res = await authApi.me()
        if (res && res.data) {
          this.apiUser = res.data
          this.isLiveApi = true
          if (res.data.activeBatchId) {
            const batchStore = useBatchStore()
            if (!batchStore.selectedBatchId) {
              batchStore.selectedBatchId = res.data.activeBatchId
            }
          }
          return res.data
        }
      } catch (err) {
        console.warn('fetchMe failed:', err.message)
      }
    },

    async fetchUsersFromApi(params = {}, forceRefresh = false) {
      try {
        const contains = {}
        const exact = {}

        if (params.search && params.search.trim()) {
          contains.name = params.search.trim()
        }
        if (params.role && params.role !== 'ALL') {
          exact.role = params.role
        }
        if (params.batchId && params.batchId !== 'ALL') {
          exact.batchId = params.batchId
        }
        if (params.hasBatch !== undefined) {
          exact.hasBatch = params.hasBatch
        }

        const query = buildPrismaQuery({
          page: params.page || 1,
          limit: params.limit || 10,
          contains,
          exact
        })

        const cacheKey = `users:${JSON.stringify(query)}`
        const res = await cachedApiCall(cacheKey, () => userApi.getAll(query), 30000, forceRefresh)
        if (res && res.data && Array.isArray(res.data)) {
          this.isLiveApi = true
          this.userDirectory = res.data.map(apiU => {
            const roleCode = extractRoleCode(apiU.role) || extractRoleCode(apiU.roleDetails) || 'CREW'
            return {
              id: apiU.userId,
              name: apiU.name,
              role: roleCode,
              roleTitle: resolveRoleTitle(apiU),
              email: apiU.email,
              avatar: apiU.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
              department: apiU.department?.departmentName || 'Store Operations',
              position: apiU.position || resolveRoleTitle(apiU),
              storeId: apiU.departmentId || null,
              storeLocation: apiU.department?.departmentName || 'Re.juve Store',
              batchId: apiU.batchId || null,
              stars: apiU.stars || 0,
              level: apiU.level || 1,
              isBuddy: Boolean(apiU.isBuddy),
              userBuddyId: apiU.userBuddyId || null,
              userBuddy: apiU.userBuddy || null
            }
          })

          const meta = res.meta || res.pagination || {}
          this.serverPagination = {
            total: meta.total !== undefined ? meta.total : res.data.length,
            page: meta.page || params.page || 1,
            limit: meta.limit || params.limit || 10,
            totalPages: meta.totalPages || 1
          }

          return this.userDirectory
        }
      } catch (e) {
        console.warn('fetchUsersFromApi error:', e.message)
      }
    },

    loginAsUser(userId) {
      const user = this.userDirectory.find(u => u.id === userId)
      if (user) {
        this.currentUserId = user.id
        this.isAuthenticated = true

        const batchStore = useBatchStore()
        if (user.batchId) {
          batchStore.selectBatch(user.batchId)
        } else {
          const acc = batchStore.accessibleBatches
          if (acc.length > 0) {
            batchStore.selectBatch(acc[0].id)
          }
        }
      }
    },

    // Backward compatibility login alias
    loginAsRole(role) {
      const user = this.userDirectory.find(u => {
        if (role === 'CREW') return u.role === 'CREW'
        if (role === 'STORE_LEADER' || role === 'SUPERVISOR') return u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR'
        if (role === 'DISTRICT_MANAGER' || role === 'HEAD') return u.role === 'DISTRICT_MANAGER' || u.role === 'HEAD'
        if (role === 'SUPERADMIN') return u.role === 'SUPERADMIN'
        return u.role === role
      })
      if (user) {
        this.loginAsUser(user.id)
      }
    },

    logout() {
      setAuthToken(null)
      this.token = null
      this.apiUser = null
      this.isAuthenticated = false
      this.currentUserId = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('rejuve_token')
        localStorage.removeItem('token')
      }
    },

    markNotificationsAsRead() {
      this.notifications.forEach(n => { n.isRead = true })
    },

    // ==================== SUPERADMIN USER ACTIONS ====================

    createUser(payload) {
      const id = payload.id || `usr-${Date.now()}`
      const role = payload.role || 'CREW'
      const roleTitle = payload.roleTitle || resolveRoleTitle({ role })

      let storeLocation = payload.storeLocation || 'Re.juve Jakarta Selatan'
      let storeId = payload.storeId || null
      let batchId = payload.batchId || null

      if (batchId && batchId !== 'UNASSIGNED') {
        const batchStore = useBatchStore()
        const b = batchStore.batchById(batchId)
        if (b) {
          storeLocation = b.name
          storeId = b.id
        }
      }

      const newUser = {
        id,
        name: payload.name,
        role,
        roleTitle,
        email: payload.email || `${payload.name.toLowerCase().replace(/\s+/g, '.')}@rejuve.co.id`,
        avatar: payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        department: payload.department || (payload.role === 'CREW' ? 'Store Operations' : 'Management'),
        position: payload.position || roleTitle,
        storeId,
        storeLocation,
        batchId,
        stars: payload.stars || 0,
        level: payload.level || 1,
        isBuddy: Boolean(payload.isBuddy),
        userBuddyId: payload.userBuddyId || null
      }

      this.userDirectory.push(newUser)
      setStoredData('rejuve_users_v3', this.userDirectory)
      invalidateApiCache('users')

      if (newUser.role === 'CREW') {
        const gamificationStore = useGamificationStore()
        gamificationStore.addCrew({
          id: newUser.id,
          name: newUser.name,
          avatar: newUser.avatar,
          position: newUser.position,
          department: newUser.department,
          storeLocation: newUser.storeLocation,
          batchId: newUser.batchId,
          stars: 0
        })
      }

      return newUser
    },

    updateUser(id, payload) {
      const user = this.userDirectory.find(u => u.id === id)
      if (!user) return null
      Object.assign(user, payload)

      if (user.role === 'CREW') {
        const gamificationStore = useGamificationStore()
        gamificationStore.updateCrew(id, payload)
      }
      setStoredData('rejuve_users_v3', this.userDirectory)
      invalidateApiCache('users')
      return user
    },

    deleteUser(id) {
      const idx = this.userDirectory.findIndex(u => u.id === id)
      if (idx !== -1) {
        const removed = this.userDirectory.splice(idx, 1)[0]
        if (removed.role === 'CREW') {
          const gamificationStore = useGamificationStore()
          gamificationStore.removeCrew(id)
        }
        setStoredData('rejuve_users_v3', this.userDirectory)
        invalidateApiCache('users')
        return true
      }
      return false
    },

    assignUserToBatch(userId, newBatchId, storeLocationName = '') {
      const user = this.userDirectory.find(u => u.id === userId)
      if (!user) return false

      user.batchId = newBatchId
      if (storeLocationName) user.storeLocation = storeLocationName

      const gamificationStore = useGamificationStore()
      gamificationStore.reassignCrewBatch(userId, newBatchId, storeLocationName)

      setStoredData('rejuve_users_v3', this.userDirectory)
      return true
    },

    async downloadTemplate() {
      try {
        const res = await userApi.downloadTemplate()
        if (typeof window !== 'undefined') {
          let blob = res
          if (!(blob instanceof Blob)) {
            blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
          }
          const downloadUrl = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = `Template_Import_User_Rejuve_${new Date().toISOString().slice(0, 10)}.xlsx`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(downloadUrl)
        }
        return true
      } catch (err) {
        console.error('Failed to download user template:', err)
        throw err
      }
    },

    async previewBulkUsers(file) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await userApi.bulkPreview(formData)
      return res?.data || res
    },

    async commitBulkUsers(payload) {
      const res = await userApi.bulkCommit(payload)
      invalidateApiCache('users')
      invalidateApiCache('/masters/users')
      await this.fetchUsersFromApi({ limit: 100, page: 1 }).catch(() => {})
      return res?.data || res
    },

    // ─── Notification Actions ───────────────────────────────────────────────
    async fetchNotifications(params = {}) {
      this.isLoadingNotifications = true
      try {
        const res = await notificationApi.getAll(params)
        if (res?.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.data || [])
          this.notifications = list
          this.unreadCount = list.filter(n => !n.isRead).length
        }
        return this.notifications
      } catch (err) {
        console.warn('Failed to fetch notifications from API:', err.message)
        return this.notifications
      } finally {
        this.isLoadingNotifications = false
      }
    },

    async fetchUnreadCount() {
      try {
        const res = await notificationApi.getUnreadCount()
        if (res?.data && typeof res.data.unreadCount === 'number') {
          this.unreadCount = res.data.unreadCount
        }
        return this.unreadCount
      } catch (err) {
        console.warn('Failed to fetch unread count:', err.message)
        return this.unreadNotificationCount
      }
    },

    async markNotificationAsRead(notificationId) {
      const target = this.notifications.find(n => (n.id === notificationId || n.notificationId === notificationId))
      if (target) {
        target.isRead = true
      }
      if (this.unreadCount > 0) {
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
      try {
        await notificationApi.markAsRead(notificationId)
      } catch (err) {
        console.warn('Failed to mark notification as read via API:', err.message)
      }
    },

    async markNotificationsAsRead() {
      return this.markAllNotificationsAsRead()
    },

    async markAllNotificationsAsRead() {
      this.notifications.forEach(n => { n.isRead = true })
      this.unreadCount = 0
      try {
        await notificationApi.markAllAsRead()
      } catch (err) {
        console.warn('Failed to mark all notifications as read via API:', err.message)
      }
    },

    addNotification(notif) {
      if (!notif) return
      const item = {
        id: notif.id || notif.notificationId || `notif-${Date.now()}`,
        notificationId: notif.id || notif.notificationId || `notif-${Date.now()}`,
        title: notif.title || 'Notifikasi Baru',
        message: notif.message || '',
        type: notif.type || 'INFO',
        isRead: false,
        linkUrl: notif.linkUrl || null,
        createdAt: notif.createdAt || new Date().toISOString(),
        time: notif.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      this.notifications.unshift(item)
      this.unreadCount += 1
    }
  }
})
