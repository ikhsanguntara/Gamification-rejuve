import { defineStore } from 'pinia'
import { mockCrews } from '~/mocks/crews.js'
import { useGamificationStore } from './gamification.js'
import { useBatchStore } from './batch.js'

/**
 * User Store: Master Directory, Multi-Supervisor/Head Personas & Batch Permissions
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
    position: 'Store Lead Specialist',
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
    position: 'Store Leader',
    storeLocation: 'Pondok Indah Mall, Jakarta Selatan',
    batchId: 'batch-gamma',
    stars: 1590,
    level: 6
  },
  SUPERVISOR_1: {
    id: 'spv-001',
    name: 'Budi Santoso',
    role: 'SUPERVISOR',
    roleTitle: 'Area Supervisor (Batch 1 & 2)',
    email: 'budi.santoso@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Area Supervisor Pusat',
    storeLocation: 'Grand Indonesia & Senayan City',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  SUPERVISOR_2: {
    id: 'spv-002',
    name: 'Dewi Lestari',
    role: 'SUPERVISOR',
    roleTitle: 'Area Supervisor (Batch 3)',
    email: 'dewi.lestari@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Area Supervisor Selatan',
    storeLocation: 'Pondok Indah Mall',
    batchId: 'batch-gamma',
    stars: 0,
    level: 0
  },
  HEAD_1: {
    id: 'head-001',
    name: 'Ahmad Dahlan',
    role: 'HEAD',
    roleTitle: 'Head of Quality Ops (Batch 1 & 2)',
    email: 'ahmad.dahlan@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    department: 'Executive Operations',
    position: 'Division Head Ops Pusat',
    storeLocation: 'Grand Indonesia & Senayan City',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  HEAD_2: {
    id: 'head-002',
    name: 'Citra Dewi',
    role: 'HEAD',
    roleTitle: 'Head of Regional Ops (Batch 3)',
    email: 'citra.dewi@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
    department: 'Executive Operations',
    position: 'Division Head Ops Selatan',
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
  { ...mockUsers.HEAD_1 },
  { ...mockUsers.HEAD_2 },
  { ...mockUsers.SUPERVISOR_1 },
  { ...mockUsers.SUPERVISOR_2 },
  ...mockCrews.map(c => ({
    id: c.id,
    name: c.name,
    role: 'CREW',
    roleTitle: 'Store Specialist',
    email: `${c.name.toLowerCase().replace(/[^a-z]/g, '.')}@rejuve.co.id`,
    avatar: c.avatar,
    department: c.department,
    position: c.position,
    storeLocation: c.storeLocation,
    batchId: c.batchId,
    stars: c.stars,
    level: c.level
  }))
]

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: true,
    currentUserId: 'spv-001',
    userDirectory: JSON.parse(JSON.stringify(initialDirectory)),
    notifications: [
      {
        id: 'notif-1',
        title: 'Evaluasi Disubmit',
        message: 'Supervisor Budi Santoso mengirim evaluasi "Cek Suhu Chiller".',
        time: '10m ago',
        isRead: false,
        type: 'info'
      },
      {
        id: 'notif-2',
        title: 'Revisi Diminta',
        message: 'Head Ahmad Dahlan meminta revisi pada M-06 Layanan Barista.',
        time: '1h ago',
        isRead: false,
        type: 'warning'
      }
    ]
  }),

  getters: {
    currentUser: (state) => {
      return state.userDirectory.find(u => u.id === state.currentUserId) || state.userDirectory[3]
    },
    currentRole: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u ? u.role : 'SUPERVISOR'
    },
    isCrew: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'CREW'
    },
    isSupervisor: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'SUPERVISOR'
    },
    isHead: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'HEAD'
    },
    isSuperadmin: (state) => {
      const u = state.userDirectory.find(u => u.id === state.currentUserId)
      return u?.role === 'SUPERADMIN'
    },
    allUsers: (state) => state.userDirectory,
    allSupervisors: (state) => state.userDirectory.filter(u => u.role === 'SUPERVISOR'),
    allHeads: (state) => state.userDirectory.filter(u => u.role === 'HEAD'),
    allCrews: (state) => state.userDirectory.filter(u => u.role === 'CREW'),
    usersByBatch: (state) => (batchId) => state.userDirectory.filter(u => u.batchId === batchId),
    unreadNotificationsCount: (state) => state.notifications.filter(n => !n.isRead).length
  },

  actions: {
    initAuth() {
      if (typeof window !== 'undefined') {
        const savedAuth = localStorage.getItem('auth-status')
        const savedUserId = localStorage.getItem('auth-user-id')
        if (savedAuth === 'true' && savedUserId) {
          const found = this.userDirectory.find(u => u.id === savedUserId)
          if (found) {
            this.isAuthenticated = true
            this.currentUserId = savedUserId
          }
        }
      }
    },

    loginAsUser(userId) {
      const user = this.userDirectory.find(u => u.id === userId)
      if (user) {
        this.currentUserId = userId
        this.isAuthenticated = true
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-status', 'true')
          localStorage.setItem('auth-user-id', userId)
        }

        // Auto-select accessible batch
        const batchStore = useBatchStore()
        const accessible = batchStore.accessibleBatches
        if (accessible.length > 0) {
          batchStore.selectBatch(accessible[0].id)
        }
        return true
      }
      return false
    },

    switchRole(role) {
      const upper = String(role).toUpperCase()
      const user = this.userDirectory.find(u => u.role === upper)
      if (user) {
        this.loginAsUser(user.id)
      }
    },

    logout() {
      this.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-status', 'false')
        localStorage.removeItem('auth-user-id')
      }
    },

    markNotificationsAsRead() {
      this.notifications.forEach(n => { n.isRead = true })
    },

    // ==================== SUPERADMIN ACTIONS ====================

    createUser(payload) {
      const id = `user-${Date.now()}`
      const newUser = {
        id,
        name: payload.name,
        email: payload.email || `${payload.name.toLowerCase().replace(/[^a-z]/g, '.')}@rejuve.co.id`,
        role: payload.role || 'CREW',
        roleTitle: payload.roleTitle || (payload.role === 'CREW' ? 'Store Specialist' : payload.role === 'SUPERVISOR' ? 'Area Supervisor' : 'Division Head'),
        avatar: payload.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        department: payload.department || 'Store Operations',
        position: payload.position || 'Store Specialist',
        storeLocation: payload.storeLocation || 'Re.juve Store',
        batchId: payload.batchId || 'batch-alpha',
        stars: Number(payload.stars) || 0,
        level: Number(payload.level) || 1
      }

      this.userDirectory.push(newUser)

      if (newUser.role === 'CREW') {
        const gamificationStore = useGamificationStore()
        gamificationStore.addCrew({
          id: newUser.id,
          name: newUser.name,
          code: `CRW-${newUser.id.slice(-4)}`,
          avatar: newUser.avatar,
          position: newUser.position,
          department: newUser.department,
          storeLocation: newUser.storeLocation,
          batchId: newUser.batchId,
          stars: newUser.stars,
          level: newUser.level,
          completedMissions: 0,
          averageScore: 0,
          status: 'ACTIVE'
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

      return true
    }
  }
})
