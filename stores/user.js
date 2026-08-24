import { defineStore } from 'pinia'

/**
 * User Store: Role Authentication & Active Profile
 */

export const mockUsers = {
  CREW: {
    id: 'crew-001',
    name: 'Andi Pratama',
    role: 'CREW',
    roleTitle: 'Crew Member',
    email: 'andi.pratama@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    department: 'Operations',
    position: 'Field Operation Specialist',
    batchId: 'batch-alpha',
    stars: 1850,
    level: 8
  },
  SUPERVISOR: {
    id: 'spv-001',
    name: 'Budi Santoso',
    role: 'SUPERVISOR',
    roleTitle: 'Operations Supervisor',
    email: 'budi.santoso@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    department: 'Quality & Safety',
    position: 'Field Supervisor Lead',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  },
  HEAD: {
    id: 'head-001',
    name: 'Ahmad Dahlan',
    role: 'HEAD',
    roleTitle: 'Head of Operations & Quality',
    email: 'ahmad.dahlan@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    department: 'Executive Operations',
    position: 'Division Head',
    batchId: 'batch-alpha',
    stars: 0,
    level: 0
  }
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isAuthenticated: true,
    currentRole: 'SUPERVISOR',
    users: { ...mockUsers },
    notifications: [
      {
        id: 'notif-1',
        title: 'Mission Pending Approval',
        message: 'Andi Pratama submitted "Production Line Quality Control" for review.',
        time: '10m ago',
        isRead: false,
        type: 'info'
      },
      {
        id: 'notif-2',
        title: 'Revision Requested',
        message: 'Head Ahmad Dahlan requested revision on "Emergency Power Backup".',
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
    }
  }
})
