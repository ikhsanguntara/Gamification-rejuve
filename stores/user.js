import { defineStore } from 'pinia'
import { mockCrews } from '~/mocks/crews.js'
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
    roleTitle: 'Store Specialist (Batch 1)',
    email: 'andi.pratama@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Store Specialist',
    storeLocation: 'Grand Indonesia, Jakarta Pusat',
    batchId: 'batch-alpha',
    stars: 1850,
    level: 8
  },
  CREW_3: {
    id: 'crew-012',
    name: 'Lina Marlina',
    role: 'CREW',
    roleTitle: 'Store Specialist (Batch 3)',
    email: 'lina.marlina@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Store Specialist',
    storeLocation: 'Pondok Indah Mall, Jakarta Selatan',
    batchId: 'batch-gamma',
    stars: 1590,
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

import { getStoredData, setStoredData } from '~/utils/storage.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: true,
    currentUserId: 'sl-001',
    userDirectory: getStoredData('rejuve_users_v3', initialDirectory),
    notifications: [
      {
        id: 'notif-1',
        title: 'Evaluasi Disubmit',
        message: 'Store Leader Budi Santoso mengirim evaluasi untuk kru.',
        time: '10m ago',
        isRead: false,
        type: 'info'
      },
      {
        id: 'notif-2',
        title: 'Persetujuan / Revisi',
        message: 'District Manager Ahmad Dahlan meninjau evaluasi siklus.',
        time: '1h ago',
        isRead: false,
        type: 'warning'
      }
    ]
  }),

  getters: {
    currentUser: (state) => {
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
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u ? u.role : 'STORE_LEADER'
    },
    isCrew: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'CREW'
    },
    isStoreLeader: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'STORE_LEADER' || u?.role === 'SUPERVISOR'
    },
    isDistrictManager: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'DISTRICT_MANAGER' || u?.role === 'HEAD'
    },
    isSupervisor: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'STORE_LEADER' || u?.role === 'SUPERVISOR'
    },
    isHead: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'DISTRICT_MANAGER' || u?.role === 'HEAD'
    },
    isSuperadmin: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'SUPERADMIN'
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
    initAuth() {
      if (!this.userDirectory || this.userDirectory.length === 0) {
        this.userDirectory = initialDirectory
      }
      if (!this.userDirectory.find(u => u.id === this.currentUserId)) {
        this.currentUserId = this.currentUser.id
      }
      this.isAuthenticated = true
      return true
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
      this.currentUserId = 'sl-001'
      this.isAuthenticated = true
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
