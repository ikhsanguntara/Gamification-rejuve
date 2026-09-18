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
    isLoadingNotifications: false,
    pendingWelcomeReward: getStoredData('rejuve_welcome_reward', null)
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
          gender: state.apiUser.gender || 'M',
          phone: state.apiUser.phone || state.apiUser.phoneWA || '',
          role: roleCode,
          roleTitle: title,
          email: state.apiUser.email,
          avatar: state.apiUser.avatarUrl || state.apiUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(state.apiUser.name || 'User')}`,
          avatarUrl: state.apiUser.avatarUrl || state.apiUser.avatar || '',
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
        gender: 'M',
        phone: '',
        role: '',
        roleTitle: '',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User',
        avatarUrl: '',
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
        const me = await this.fetchMe(true)
        if (me) {
          this.isAuthenticated = true
          this.isLiveApi = true
        } else {
          this.token = null
          this.apiUser = null
          this.isAuthenticated = false
          setAuthToken('')
        }
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
              avatar: apiU.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(apiU.name || 'User')}`,
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

          // First Login Welcome / Early Bird Reward Handling
          if (res.data.earlyBirdReward && res.data.earlyBirdReward.claimed) {
            this.pendingWelcomeReward = res.data.earlyBirdReward
            setStoredData('rejuve_welcome_reward', res.data.earlyBirdReward)
          } else if (mappedRole === 'CREW' && apiU.hasClaimedEarlyBird) {
            const seenKey = `rejuve_welcome_seen_${apiU.userId}`
            const alreadySeen = typeof localStorage !== 'undefined' ? localStorage.getItem(seenKey) : null
            if (!alreadySeen) {
              this.pendingWelcomeReward = {
                claimed: true,
                starsEarned: 5.0,
                pointsEarned: 100,
                tierLabel: 'Tepat Waktu (H0)',
                message: 'Selamat datang di Re.juve! Bonus Poin & Bintang First Login telah berhasil dicairkan.'
              }
              setStoredData('rejuve_welcome_reward', this.pendingWelcomeReward)
            }
          }

          setStoredData('rejuve_users_v3', this.userDirectory)
          return { success: true, user: this.currentUser, data: res.data }
        }
      } catch (err) {
        console.warn('API login failed:', err.message)
        return { success: false, error: err.message }
      }
    },

    async fetchMe(force = false) {
      if (!force && this.apiUser) {
        return this.apiUser
      }
      try {
        const res = await authApi.me()
        if (res && res.data) {
          this.apiUser = res.data
          this.isLiveApi = true
          this.isAuthenticated = true
          if (res.data.activeBatchId) {
            const batchStore = useBatchStore()
            if (!batchStore.selectedBatchId) {
              batchStore.selectedBatchId = res.data.activeBatchId
            }
          }

          const mappedRole = extractRoleCode(res.data.role) || extractRoleCode(res.data.roleDetails) || 'CREW'
          if (mappedRole === 'CREW' && res.data.hasClaimedEarlyBird) {
            const seenKey = `rejuve_welcome_seen_${res.data.userId}`
            const alreadySeen = typeof localStorage !== 'undefined' ? localStorage.getItem(seenKey) : null
            if (!alreadySeen && !this.pendingWelcomeReward) {
              this.pendingWelcomeReward = {
                claimed: true,
                starsEarned: 5.0,
                pointsEarned: 100,
                tierLabel: 'Tepat Waktu (H0)',
                message: 'Selamat datang di Re.juve! Bonus Poin & Bintang First Login telah berhasil dicairkan.'
              }
              setStoredData('rejuve_welcome_reward', this.pendingWelcomeReward)
            }
          }

          return res.data
        }
        return null
      } catch (err) {
        console.warn('fetchMe failed:', err.message)
        if (err.statusCode === 401) {
          this.token = null
          this.apiUser = null
          this.isAuthenticated = false
          setAuthToken('')
        }
        return null
      }
    },

    dismissWelcomeReward(userId) {
      this.pendingWelcomeReward = null
      setStoredData('rejuve_welcome_reward', null)
      const targetId = userId || this.currentUser?.id || this.currentUserId
      if (typeof localStorage !== 'undefined' && targetId) {
        localStorage.setItem(`rejuve_welcome_seen_${targetId}`, 'true')
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
              gender: apiU.gender || 'M',
              phone: apiU.phone || apiU.phoneWA || '',
              role: roleCode,
              roleTitle: resolveRoleTitle(apiU),
              email: apiU.email,
              avatar: apiU.avatarUrl || apiU.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(apiU.name || 'User')}`,
              avatarUrl: apiU.avatarUrl || apiU.avatar || '',
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

        const r = typeof user.role === 'string' ? user.role : user.role?.roleCode
        if (r === 'CREW') {
          const seenKey = `rejuve_welcome_seen_${user.id}`
          const alreadySeen = typeof localStorage !== 'undefined' ? localStorage.getItem(seenKey) : null
          if (!alreadySeen && !this.pendingWelcomeReward) {
            this.pendingWelcomeReward = {
              claimed: true,
              starsEarned: 5,
              pointsEarned: 100,
              tierLabel: 'Tepat Waktu (H0)',
              message: 'Selamat datang di Re.juve! Bonus Poin & Bintang First Login telah berhasil dicairkan.'
            }
            setStoredData('rejuve_welcome_reward', this.pendingWelcomeReward)
          }
        }

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
        const r = typeof u.role === 'string' ? u.role : u.role?.roleCode
        return r === role
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

      const avatar = payload.avatarUrl || payload.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(payload.name || 'User')}`

      const newUser = {
        id,
        name: payload.name,
        gender: payload.gender || 'M',
        phone: payload.phone || '',
        role,
        roleTitle,
        email: payload.email || `${payload.name.toLowerCase().replace(/\s+/g, '.')}@rejuve.co.id`,
        avatar,
        avatarUrl: payload.avatarUrl || avatar,
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

    async updateProfile(payload) {
      const isFd = typeof FormData !== 'undefined' && payload instanceof FormData
      const targetId = (!isFd && payload?.id) || this.currentUser?.id || this.currentUserId
      let updatedData = null

      if (this.isLiveApi || this.token) {
        try {
          let apiPayload
          if (isFd) {
            apiPayload = payload
          } else {
            // Selalu gunakan FormData (multipart/form-data) sesuai spesifikasi Swagger PUT /auth/profile
            if (typeof FormData !== 'undefined') {
              const fd = new FormData()
              if (payload?.name !== undefined && payload?.name !== null) fd.append('name', payload.name)
              if (payload?.gender !== undefined && payload?.gender !== null) fd.append('gender', payload.gender)
              if (payload?.phone !== undefined && payload?.phone !== null) fd.append('phone', payload.phone)

              // Cek file binary avatar vs avatarUrl string
              const fileObj = payload?.file || payload?.avatarFile || ((typeof File !== 'undefined' && payload?.avatar instanceof File) ? payload.avatar : null)
              if (fileObj) {
                fd.append('avatar', fileObj)
              } else if (payload?.avatarUrl && typeof payload.avatarUrl === 'string') {
                fd.append('avatarUrl', payload.avatarUrl)
              } else if (payload?.avatar && typeof payload.avatar === 'string') {
                fd.append('avatarUrl', payload.avatar)
              }
              apiPayload = fd
            } else {
              apiPayload = { ...payload }
            }
          }

          const res = await authApi.updateProfile(apiPayload)
          if (res && (res.data || res.user)) {
            const data = res.data || res.user || res
            updatedData = data
            if (this.apiUser) {
              if (data.name !== undefined) this.apiUser.name = data.name
              if (data.email !== undefined) this.apiUser.email = data.email
              if (data.gender !== undefined) this.apiUser.gender = data.gender
              if (data.phone !== undefined || data.phoneWA !== undefined) {
                this.apiUser.phone = data.phone || data.phoneWA
                this.apiUser.phoneWA = data.phone || data.phoneWA
              }
              if (data.avatarUrl || data.avatar) {
                this.apiUser.avatarUrl = data.avatarUrl || data.avatar
                this.apiUser.avatar = this.apiUser.avatarUrl
              }
            }
          }
        } catch (err) {
          console.warn('API updateProfile (PUT /auth/profile multipart) failed:', err.message)
          throw err
        }
      }

      // Update local directory
      const localName = isFd ? payload.get('name') : payload?.name
      const localGender = isFd ? payload.get('gender') : payload?.gender
      const localPhone = isFd ? payload.get('phone') : payload?.phone
      const localAvatarUrl = isFd ? (payload.get('avatarUrl') || updatedData?.avatarUrl || updatedData?.avatar) : (payload?.avatarUrl || payload?.avatar)

      const localUpdated = this.updateUser(targetId, {
        ...(localName !== undefined && localName !== null ? { name: localName } : {}),
        ...(localGender !== undefined && localGender !== null ? { gender: localGender } : {}),
        ...(localPhone !== undefined && localPhone !== null ? { phone: localPhone } : {}),
        ...(localAvatarUrl || updatedData?.avatarUrl || updatedData?.avatar ? {
          avatar: localAvatarUrl || updatedData?.avatarUrl || updatedData?.avatar,
          avatarUrl: localAvatarUrl || updatedData?.avatarUrl || updatedData?.avatar
        } : {})
      })

      return updatedData || localUpdated
    },

    async changePassword({ oldPassword, newPassword }) {
      if (!oldPassword || !newPassword) {
        throw new Error('Password lama dan password baru wajib diisi.')
      }
      if (newPassword.length < 6) {
        throw new Error('Password baru minimal 6 karakter.')
      }
      if (this.isLiveApi || this.token) {
        const res = await authApi.changePassword({ oldPassword, newPassword })
        return res
      }
      return { success: true, message: 'Password berhasil diubah.' }
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
