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
import { authApi, userApi } from '../services/api.js'
import { getAuthToken, setAuthToken } from '../composables/useApi.js'
import { buildPrismaQuery } from '../utils/queryBuilder.js'

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
    notifications: []
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

    allUsers: (state) => state.userDirectory,
    userById: (state) => (id) => {
      const found = state.userDirectory.find(u => u.id === id)
      return found || null
    },

    storeLeaders: (state) => state.userDirectory.filter(u => u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR'),
    buddyStoreLeaders: (state) => state.userDirectory.filter(u => (u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR') && Boolean(u.isBuddy)),
    districtManagers: (state) => state.userDirectory.filter(u => u.role === 'DISTRICT_MANAGER' || u.role === 'HEAD'),
    crews: (state) => state.userDirectory.filter(u => u.role === 'CREW'),

    // Backward compatibility getters
    supervisors: (state) => state.userDirectory.filter(u => u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR'),
    heads: (state) => state.userDirectory.filter(u => u.role === 'DISTRICT_MANAGER' || u.role === 'HEAD'),

    assignedBatchId: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.batchId || null
    },

    unreadNotificationCount: (state) => state.notifications.filter(n => !n.isRead).length
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

    async fetchUsersFromApi(params = {}) {
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

        const res = await userApi.getAll(query)
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
            page: meta.page || page,
            limit: meta.limit || limit,
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

    // ==================== USER MANAGEMENT ACTIONS ====================

    createUser(payload) {
      const id = payload.id || `user-${Date.now()}`
      let roleTitle = 'Store Specialist'
      if (payload.role === 'STORE_LEADER' || payload.role === 'SUPERVISOR') roleTitle = 'Store Leader'
      else if (payload.role === 'DISTRICT_MANAGER' || payload.role === 'HEAD') roleTitle = 'District Manager'
      else if (payload.role === 'SUPERADMIN') roleTitle = 'System Superadmin'

      let storeLocation = payload.storeLocation || 'Belum Ditugaskan'
      let batchId = payload.batchId || null
      let storeId = payload.storeId || null

      const newUser = {
        id,
        name: payload.name,
        role: payload.role,
        roleTitle: payload.roleTitle || roleTitle,
        email: payload.email || `${payload.name.toLowerCase().replace(/[^a-z]/g, '.')}@rejuve.co.id`,
        avatar: payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        department: payload.department || (payload.role === 'CREW' ? 'Store Operations' : 'Management'),
        position: payload.position || roleTitle,
        storeId,
        storeLocation,
        batchId,
        stars: 0,
        level: 1,
        isBuddy: Boolean(payload.isBuddy),
        userBuddyId: payload.userBuddyId || null
      }

      this.userDirectory.push(newUser)
      setStoredData('rejuve_users_v3', this.userDirectory)

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
    }
  }
})
