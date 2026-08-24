import { defineStore } from 'pinia'
import { mockCrews } from '~/mocks/crews.js'
import { useGamificationStore } from './gamification.js'
import { useBatchStore } from './batch.js'

/**
 * User Store: Role Authentication, Master User Directory & Batch Assignment
 */

export const mockUsers = {
  CREW: {
    id: 'crew-001',
    name: 'Andi Pratama',
    role: 'CREW',
    roleTitle: 'Store Specialist',
    email: 'andi.pratama@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Store Lead Specialist',
    storeLocation: 'Re.juve Grand Indonesia',
    batchId: 'batch-alpha',
    stars: 1850,
    level: 8
  },
  SUPERVISOR: {
    id: 'spv-001',
    name: 'Budi Santoso',
    role: 'SUPERVISOR',
    roleTitle: 'Area Store Supervisor',
    email: 'budi.santoso@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    department: 'Store Operations',
    position: 'Area Supervisor Jabodetabek',
    storeLocation: 'All Jabodetabek Stores',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  HEAD: {
    id: 'head-001',
    name: 'Ahmad Dahlan',
    role: 'HEAD',
    roleTitle: 'Head of Quality & Operations',
    email: 'ahmad.dahlan@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    department: 'Executive Operations',
    position: 'Division Head of Quality & Ops',
    storeLocation: 'HQ & Central Production Facility',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  SUPERADMIN: {
    id: 'admin-001',
    name: 'Siti Rahmawati',
    role: 'SUPERADMIN',
    roleTitle: 'System Superadmin',
    email: 'admin@rejuve.co.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    department: 'Information Technology & Master Ops',
    position: 'Master Operations Controller',
    storeLocation: 'National Master Console',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  }
}

// Initial full user directory
const initialDirectory = [
  { ...mockUsers.SUPERADMIN },
  { ...mockUsers.HEAD },
  { ...mockUsers.SUPERVISOR },
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
    currentRole: 'SUPERVISOR',
    users: { ...mockUsers },
    userDirectory: JSON.parse(JSON.stringify(initialDirectory)),
    notifications: [
      {
        id: 'notif-1',
        title: 'Store Mission Submitted',
        message: 'Supervisor Budi Santoso submitted "Cold Storage Chiller Audit" for Grand Indonesia.',
        time: '10m ago',
        isRead: false,
        type: 'info'
      },
      {
        id: 'notif-2',
        title: 'Revision Requested',
        message: 'Head Ahmad Dahlan requested revision on "Cleanroom Sanitation".',
        time: '1h ago',
        isRead: false,
        type: 'warning'
      }
    ]
  }),

  getters: {
    currentUser: (state) => state.users[state.currentRole] || state.users.SUPERVISOR,
    isCrew: (state) => state.currentRole === 'CREW',
    isSupervisor: (state) => state.currentRole === 'SUPERVISOR',
    isHead: (state) => state.currentRole === 'HEAD',
    isSuperadmin: (state) => state.currentRole === 'SUPERADMIN',
    allUsers: (state) => state.userDirectory,
    usersByBatch: (state) => (batchId) => state.userDirectory.filter(u => u.batchId === batchId),
    unreadNotificationsCount: (state) => state.notifications.filter(n => !n.isRead).length
  },

  actions: {
    initAuth() {
      if (typeof window !== 'undefined') {
        const savedAuth = localStorage.getItem('auth-status')
        const savedRole = localStorage.getItem('auth-user-role')
        if (savedAuth === 'true' && savedRole && this.users[savedRole]) {
          this.isAuthenticated = true
          this.currentRole = savedRole
        } else if (savedAuth === 'false') {
          this.isAuthenticated = false
        }
      }
    },

    login(role = 'SUPERVISOR') {
      const upperRole = String(role).toUpperCase()
      if (this.users[upperRole]) {
        this.currentRole = upperRole
        this.isAuthenticated = true
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth-status', 'true')
          localStorage.setItem('auth-user-role', upperRole)
        }
        // Auto-lock active batch for Crew to their assigned store branch
        if (upperRole === 'CREW') {
          const batchStore = useBatchStore()
          batchStore.selectBatch(this.currentUser.batchId || 'batch-alpha')
        }
        return true
      }
      return false
    },

    logout() {
      this.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-status', 'false')
        localStorage.removeItem('auth-user-role')
      }
    },

    switchRole(role) {
      this.login(role)
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

      // If user is Crew, sync with gamificationStore
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

      // If crew, sync with gamificationStore
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

      // Sync with gamificationStore
      const gamificationStore = useGamificationStore()
      gamificationStore.reassignCrewBatch(userId, newBatchId, storeLocationName)

      return true
    }
  }
})
