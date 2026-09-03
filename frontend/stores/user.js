import { defineStore } from 'pinia'
import { mockCrews } from '../mocks/crews.js'
import { useGamificationStore } from './gamification.js'
import { useBatchStore } from './batch.js'

/**
 * User Store: Master Directory, Multi-Store Leader/District Manager Personas & Batch Permissions
 */

export const mockUsers = {
  CREW_1: {
    id: 'crew-001',
    name: 'Andi Pratama',
    role: 'CREW',
    roleTitle: 'Kru Operasional (Batch 1 - 3 Minggu)',
    email: 'andi.pratama@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Store Specialist',
    storeLocation: 'Grand Indonesia, Jakarta Pusat',
    batchId: 'batch-alpha',
    stars: 1850,
    level: 8
  },
  CREW_2: {
    id: 'crew-008',
    name: 'Hadi Saputra',
    role: 'CREW',
    roleTitle: 'Kru Operasional (Batch 2 - 4 Minggu)',
    email: 'hadi.saputra@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Senior Barista',
    storeLocation: 'Senayan City, Jakarta Pusat',
    batchId: 'batch-beta',
    stars: 1610,
    level: 6
  },
  CREW_3: {
    id: 'crew-013',
    name: 'Muhammad Ridwan',
    role: 'CREW',
    roleTitle: 'Kru Operasional (Batch 3 - 5 Minggu)',
    email: 'muhammad.ridwan@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Barista Specialist',
    storeLocation: 'Pondok Indah Mall, Jakarta Selatan',
    batchId: 'batch-gamma',
    stars: 1510,
    level: 6
  },
  STORE_LEADER_1: {
    id: 'sl-001',
    name: 'Budi Santoso',
    role: 'STORE_LEADER',
    roleTitle: 'Store Leader (Batch 1 & 2)',
    email: 'budi.santoso@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Store Leader Pusat',
    storeLocation: 'Grand Indonesia & Senayan City',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  STORE_LEADER_2: {
    id: 'sl-002',
    name: 'Dewi Lestari',
    role: 'STORE_LEADER',
    roleTitle: 'Store Leader (Batch 3)',
    email: 'dewi.lestari@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Store Leader Selatan',
    storeLocation: 'Pondok Indah Mall',
    batchId: 'batch-gamma',
    stars: 0,
    level: 0
  },
  // Backward compatibility alias for supervisor
  SUPERVISOR_1: {
    id: 'sl-001',
    name: 'Budi Santoso',
    role: 'STORE_LEADER',
    roleTitle: 'Store Leader (Batch 1 & 2)',
    email: 'budi.santoso@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Store Leader Pusat',
    storeLocation: 'Grand Indonesia & Senayan City',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  SUPERVISOR_2: {
    id: 'sl-002',
    name: 'Dewi Lestari',
    role: 'STORE_LEADER',
    roleTitle: 'Store Leader (Batch 3)',
    email: 'dewi.lestari@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Store Leader Selatan',
    storeLocation: 'Pondok Indah Mall',
    batchId: 'batch-gamma',
    stars: 0,
    level: 0
  },
  DISTRICT_MANAGER_1: {
    id: 'dm-001',
    name: 'Ahmad Dahlan',
    role: 'DISTRICT_MANAGER',
    roleTitle: 'District Manager (Pusat)',
    email: 'ahmad.dahlan@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    department: 'District Operations',
    position: 'District Manager Wilayah Pusat',
    storeLocation: 'Grand Indonesia & Senayan City',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  DISTRICT_MANAGER_2: {
    id: 'dm-002',
    name: 'Citra Dewi',
    role: 'DISTRICT_MANAGER',
    roleTitle: 'District Manager (Selatan)',
    email: 'citra.dewi@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    department: 'District Operations',
    position: 'District Manager Wilayah Selatan',
    storeLocation: 'Pondok Indah Mall',
    batchId: 'batch-gamma',
    stars: 0,
    level: 0
  },
  // Backward compatibility alias for head
  HEAD_1: {
    id: 'dm-001',
    name: 'Ahmad Dahlan',
    role: 'DISTRICT_MANAGER',
    roleTitle: 'District Manager (Pusat)',
    email: 'ahmad.dahlan@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    department: 'District Operations',
    position: 'District Manager Wilayah Pusat',
    storeLocation: 'Grand Indonesia & Senayan City',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  HEAD_2: {
    id: 'dm-002',
    name: 'Citra Dewi',
    role: 'DISTRICT_MANAGER',
    roleTitle: 'District Manager (Selatan)',
    email: 'citra.dewi@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    department: 'District Operations',
    position: 'District Manager Wilayah Selatan',
    storeLocation: 'Pondok Indah Mall',
    batchId: 'batch-gamma',
    stars: 0,
    level: 0
  },
  SUPERADMIN: {
    id: 'admin-001',
    name: 'Siti Rahmawati',
    role: 'SUPERADMIN',
    roleTitle: 'System Superadmin',
    email: 'admin@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80',
    department: 'IT & Master Ops',
    position: 'Master Controller',
    storeLocation: 'Semua Cabang',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  }
}

// Initial full user directory
const initialDirectory = [
  { ...mockUsers.SUPERADMIN },
  { ...mockUsers.DISTRICT_MANAGER_1 },
  { ...mockUsers.DISTRICT_MANAGER_2 },
  { ...mockUsers.STORE_LEADER_1 },
  { ...mockUsers.STORE_LEADER_2 },
  ...mockCrews.map(c => {
    let storeId = c.storeId || 'store-001'
    if (!c.storeId) {
      if (c.batchId === 'batch-beta') storeId = 'store-002'
      else if (c.batchId === 'batch-gamma') storeId = 'store-003'
    }
    return {
      id: c.id,
      name: c.name,
      role: 'CREW',
      roleTitle: 'Store Specialist',
      email: `${c.name.toLowerCase().replace(/[^a-z]/g, '.')}@rejuve.co.id`,
      avatar: c.avatar,
      department: c.department,
      position: c.position,
      storeId,
      storeLocation: c.storeLocation,
      batchId: c.batchId || null,
      stars: c.stars || 0,
      level: c.level || 1
    }
  })
]

import { getStoredData, setStoredData } from '../utils/storage.js'
import { authApi, userApi } from '../services/api.js'
import { getAuthToken, setAuthToken } from '../composables/useApi.js'
import { buildPrismaQuery } from '../utils/queryBuilder.js'

function extractRoleCode(raw) {
  if (!raw) return ''
  if (typeof raw === 'string') return raw.toUpperCase()
  if (typeof raw === 'object') {
    return (raw.roleCode || raw.code || raw.name || raw.role || '').toUpperCase()
  }
  return ''
}

function resolveRoleTitle(apiUser) {
  if (!apiUser) return 'Specialist'
  if (apiUser.roleDetails && typeof apiUser.roleDetails === 'object' && apiUser.roleDetails.roleName) {
    return apiUser.roleDetails.roleName
  }
  if (apiUser.role && typeof apiUser.role === 'object' && apiUser.role.roleName) {
    return apiUser.role.roleName
  }
  const rawRole = extractRoleCode(apiUser.role) || extractRoleCode(apiUser.roleDetails)
  const map = {
    SUPERADMIN: 'Super Administrator',
    STORE_LEADER: 'Store Leader',
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
    currentUserId: 'spv-001',
    userDirectory: getStoredData('rejuve_users_v3', initialDirectory),
    serverPagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1
    },
    notifications: [
      {
        id: 'notif-1',
        title: 'New Star Awarded',
        message: 'Andi Pratama earned 5 stars for Chiller Calibration',
        time: '5m ago',
        isRead: false,
        type: 'star'
      },
      {
        id: 'notif-2',
        title: 'Pending Review Alert',
        message: 'Week 2 Station Sanitizing awaits Head verification',
        time: '1h ago',
        isRead: false,
        type: 'warning'
      }
    ]
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
          batchId: state.apiUser.batchId || 'batch-alpha',
          stars: state.apiUser.stars || 0,
          level: state.apiUser.level || 1,
          isBuddy: Boolean(state.apiUser.isBuddy)
        }
      }
      const found = state.userDirectory.find(u => u.id === state.currentUserId)
      if (found) return found
      if (state.currentUserId === 'spv-001') return state.userDirectory.find(u => u.id === 'sl-001') || state.userDirectory[3] || state.userDirectory[0]
      if (state.currentUserId === 'spv-002') return state.userDirectory.find(u => u.id === 'sl-002') || state.userDirectory[4] || state.userDirectory[0]
      if (state.currentUserId === 'head-001') return state.userDirectory.find(u => u.id === 'dm-001') || state.userDirectory[1] || state.userDirectory[0]
      if (state.currentUserId === 'head-002') return state.userDirectory.find(u => u.id === 'dm-002') || state.userDirectory[2] || state.userDirectory[0]
      return state.userDirectory[3] || state.userDirectory[0] || {
        id: 'sl-001',
        name: 'Budi Santoso',
        role: 'STORE_LEADER',
        roleTitle: 'Store Leader',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        email: 'budi.santoso@rejuve.co.id',
        department: 'Store Operations',
        position: 'Store Leader Pusat',
        storeLocation: 'Grand Indonesia & Senayan City',
        batchId: 'batch-alpha',
        stars: 0,
        level: 0
      }
    },
    currentRole: (state) => {
      if (state.apiUser) {
        return extractRoleCode(state.apiUser.role) || extractRoleCode(state.apiUser.roleDetails) || 'CREW'
      }
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return extractRoleCode(u?.role) || 'STORE_LEADER'
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
    userById: (state) => (id) => state.userDirectory.find(u => u.id === id),

    storeLeaders: (state) => state.userDirectory.filter(u => u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR'),
    districtManagers: (state) => state.userDirectory.filter(u => u.role === 'DISTRICT_MANAGER' || u.role === 'HEAD'),
    crews: (state) => state.userDirectory.filter(u => u.role === 'CREW'),

    // Backward compatibility getters
    supervisors: (state) => state.userDirectory.filter(u => u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR'),
    heads: (state) => state.userDirectory.filter(u => u.role === 'DISTRICT_MANAGER' || u.role === 'HEAD'),

    assignedBatchId: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.batchId || 'batch-alpha'
    },

    unreadNotificationCount: (state) => state.notifications.filter(n => !n.isRead).length
  },

  actions: {
    async initAuth() {
      if (!this.userDirectory || this.userDirectory.length === 0) {
        this.userDirectory = initialDirectory
      }
      if (!this.userDirectory.find(u => u.id === this.currentUserId)) {
        this.currentUserId = this.currentUser.id
      }
      this.isAuthenticated = true

      // Cek sesi token API yang tersimpan
      const savedToken = getAuthToken()
      if (savedToken) {
        this.token = savedToken
        await this.fetchMe()
      }
      return true
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
              batchId: apiU.batchId || 'batch-alpha',
              stars: apiU.stars || 0,
              level: apiU.level || 1
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
              isBuddy: Boolean(apiU.isBuddy)
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
      let targetId = userId
      if (userId === 'spv-001') targetId = 'sl-001'
      else if (userId === 'spv-002') targetId = 'sl-002'
      else if (userId === 'head-001') targetId = 'dm-001'
      else if (userId === 'head-002') targetId = 'dm-002'

      const user = this.userDirectory.find(u => u.id === targetId) || this.userDirectory.find(u => u.id === userId)
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
      switch (role) {
        case 'CREW':
          this.loginAsUser('crew-001')
          break
        case 'STORE_LEADER':
        case 'SUPERVISOR':
          this.loginAsUser('sl-001')
          break
        case 'DISTRICT_MANAGER':
        case 'HEAD':
          this.loginAsUser('dm-001')
          break
        case 'SUPERADMIN':
          this.loginAsUser('admin-001')
          break
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
      const id = `user-${Date.now()}`
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
        level: 1
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
