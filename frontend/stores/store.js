import { defineStore } from 'pinia'
import { useUserStore } from './user.js'
import { useBatchStore } from './batch.js'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { departmentApi } from '../services/api.js'
import { buildPrismaQuery } from '../utils/queryBuilder.js'
import { cachedApiCall, invalidateApiCache } from '../utils/apiCache.js'

/**
 * Store Store: Manage Master Stores/Outlets, Location, Store Leader & District Manager Assignments
 */

export const useStoreStore = defineStore('store', {
  state: () => ({
    stores: getStoredData('rejuve_stores_v1', []),
    selectedStoreId: '',
    isLiveApi: false,
    isLoading: false,
    serverPagination: {
      total: 0,
      page: 1,
      limit: 9,
      totalPages: 1
    }
  }),

  getters: {
    allStores: (state) => {
      const userStore = useUserStore()
      const batchStore = useBatchStore()
      return (state.stores || []).map(s => {
        const slFromUser = s.storeLeaderId ? userStore.userById(s.storeLeaderId) : null
        const dmFromUser = s.districtManagerId ? userStore.userById(s.districtManagerId) : null
        const storeLeader = s.storeLeader || slFromUser || null
        const districtManager = s.districtManager || dmFromUser || null
        const batch = s.batchId ? batchStore.batchById(s.batchId) || null : null
        return {
          ...s,
          storeLeader,
          districtManager,
          batch
        }
      })
    },

    storeById: (state) => (id) => {
      const userStore = useUserStore()
      const batchStore = useBatchStore()
      const s = (state.stores || []).find(item => item.id === id)
      if (!s) return null
      const slFromUser = s.storeLeaderId ? userStore.userById(s.storeLeaderId) : null
      const dmFromUser = s.districtManagerId ? userStore.userById(s.districtManagerId) : null
      const storeLeader = s.storeLeader || slFromUser || null
      const districtManager = s.districtManager || dmFromUser || null
      const batch = s.batchId ? batchStore.batchById(s.batchId) || null : null
      return {
        ...s,
        storeLeader,
        districtManager,
        batch
      }
    },

    storesByRegion: (state) => (region) => {
      const list = state.stores || []
      if (!region || region === 'ALL') return list
      return list.filter(s => s.region === region)
    },

    activeStores: (state) => (state.stores || []).filter(s => s.status === 'ACTIVE'),
    totalStoreCount: (state) => state.serverPagination?.total || (state.stores || []).length,
    activeStoreCount: (state) => (state.stores || []).filter(s => s.status === 'ACTIVE').length
  },

  actions: {
    selectStore(id) {
      this.selectedStoreId = id
    },

    async fetchStoresFromApi(params = {}, forceRefresh = false) {
      this.isLoading = true
      try {
        const contains = {}
        const exact = {}

        if (params.search && params.search.trim()) {
          contains.departmentName = params.search.trim()
        }
        if (params.region && params.region !== 'ALL') {
          exact.regionCode = params.region
        }
        if (params.status && params.status !== 'ALL') {
          exact.isActive = params.status === 'ACTIVE'
        }

        const query = buildPrismaQuery({
          page: params.page || 1,
          limit: params.limit || 9,
          contains,
          exact
        })

        const cacheKey = `stores:${JSON.stringify(query)}`
        const res = await cachedApiCall(cacheKey, () => departmentApi.getAll(query), 30000, forceRefresh)
        if (res && res.data && Array.isArray(res.data)) {
          this.isLiveApi = true
          this.stores = res.data.map(d => {
            const rawSl = d.userSl || d.storeLeader || null
            const rawDm = d.userDm || d.districtManager || null

            const storeLeader = rawSl ? {
              id: rawSl.userId || rawSl.id || d.userSlId,
              userId: rawSl.userId || rawSl.id || d.userSlId,
              name: rawSl.name || 'Store Leader',
              email: rawSl.email || '',
              position: rawSl.position || rawSl.roleDetails?.roleName || rawSl.role || 'Store Leader',
              avatar: rawSl.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rawSl.name || 'SL')}`
            } : null

            const districtManager = rawDm ? {
              id: rawDm.userId || rawDm.id || d.userDmId,
              userId: rawDm.userId || rawDm.id || d.userDmId,
              name: rawDm.name || 'District Manager',
              email: rawDm.email || '',
              position: rawDm.position || rawDm.roleDetails?.roleName || rawDm.role || 'District Manager',
              avatar: rawDm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rawDm.name || 'DM')}`
            } : null

            return {
              id: d.departmentId || d.id,
              name: d.departmentName || d.name,
              code: d.departmentCode || d.code,
              region: d.regionCode || d.region || 'JABODETABEK',
              mallName: d.departmentName || d.mallName || d.name,
              address: d.departmentName || d.address || '',
              phone: d.phone || '021-29465000',
              storeLeaderId: d.userSlId || d.storeLeaderId || storeLeader?.id || null,
              districtManagerId: d.userDmId || d.districtManagerId || districtManager?.id || null,
              storeLeader,
              districtManager,
              batchId: d.batchId || null,
              totalCrews: d.totalCrews || 4,
              status: d.isActive !== undefined ? (d.isActive ? 'ACTIVE' : 'INACTIVE') : (d.status || 'ACTIVE'),
              openingHours: d.openingHours || '10:00 - 22:00',
              createdAt: d.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
            }
          })

          const meta = res.meta || res.pagination || {}
          this.serverPagination = {
            total: meta.total !== undefined ? meta.total : res.data.length,
            page: meta.page || params.page || 1,
            limit: meta.limit || params.limit || 9,
            totalPages: meta.totalPages || 1
          }

          if (this.stores.length > 0 && (!this.selectedStoreId || !this.stores.find(s => s.id === this.selectedStoreId))) {
            this.selectedStoreId = this.stores[0].id
          }
          return this.stores
        }
      } catch (err) {
        console.warn('fetchStoresFromApi failed:', err.message)
      } finally {
        this.isLoading = false
      }
    },

    async fetchStoreByIdFromApi(id, forceRefresh = false) {
      if (!id) return null
      try {
        const cacheKey = `store:${id}`
        const res = await cachedApiCall(cacheKey, () => departmentApi.getById(id), 30000, forceRefresh)
        const d = res?.data?.data || res?.data
        if (d && (d.departmentId || d.id)) {
          const rawSl = d.userSl || d.storeLeader || null
          const rawDm = d.userDm || d.districtManager || null

          const storeLeader = rawSl ? {
            id: rawSl.userId || rawSl.id || d.userSlId,
            userId: rawSl.userId || rawSl.id || d.userSlId,
            name: rawSl.name || 'Store Leader',
            email: rawSl.email || '',
            position: rawSl.position || rawSl.roleDetails?.roleName || rawSl.role || 'Store Leader',
            avatar: rawSl.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rawSl.name || 'SL')}`
          } : null

          const districtManager = rawDm ? {
            id: rawDm.userId || rawDm.id || d.userDmId,
            userId: rawDm.userId || rawDm.id || d.userDmId,
            name: rawDm.name || 'District Manager',
            email: rawDm.email || '',
            position: rawDm.position || rawDm.roleDetails?.roleName || rawDm.role || 'District Manager',
            avatar: rawDm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rawDm.name || 'DM')}`
          } : null

          const storeItem = {
            id: d.departmentId || d.id,
            name: d.departmentName || d.name,
            code: d.departmentCode || d.code,
            region: d.regionCode || d.region || 'JABODETABEK',
            mallName: d.departmentName || d.mallName || d.name || '',
            address: d.departmentName || d.address || '',
            phone: d.phone || '021-29465000',
            storeLeaderId: d.userSlId || d.storeLeaderId || storeLeader?.id || null,
            districtManagerId: d.userDmId || d.districtManagerId || districtManager?.id || null,
            storeLeader,
            districtManager,
            batchId: d.batchId || null,
            totalCrews: d.totalCrews || 4,
            status: d.isActive !== undefined ? (d.isActive ? 'ACTIVE' : 'INACTIVE') : (d.status || 'ACTIVE'),
            openingHours: d.openingHours || '10:00 - 22:00',
            createdAt: d.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
          }
          const idx = this.stores.findIndex(s => s.id === storeItem.id)
          if (idx !== -1) {
            this.stores[idx] = { ...this.stores[idx], ...storeItem }
          } else {
            this.stores.push(storeItem)
          }
          return storeItem
        }
      } catch (err) {
        console.warn('fetchStoreByIdFromApi failed:', err.message)
      }
      return null
    },

    createStore(payload) {
      const id = payload.id || `store-${Date.now()}`
      const existingCodes = this.stores.map(s => s.code)
      let code = payload.code
      if (!code) {
        const nextNum = this.stores.length + 1
        code = `STR-OUT-${String(nextNum).padStart(2, '0')}`
      }

      const newStore = {
        id,
        name: payload.name.trim(),
        code: code.trim(),
        region: payload.region || 'Jakarta Pusat',
        mallName: payload.mallName || payload.name,
        address: payload.address || '',
        phone: payload.phone || '',
        storeLeaderId: payload.storeLeaderId || null,
        districtManagerId: payload.districtManagerId || null,
        batchId: payload.batchId || null,
        totalCrews: Number(payload.totalCrews) || 0,
        status: payload.status || 'ACTIVE',
        openingHours: payload.openingHours || '10:00 - 22:00',
        createdAt: new Date().toISOString().split('T')[0]
      }

      this.stores.unshift(newStore)
      this.selectedStoreId = newStore.id
      setStoredData('rejuve_stores_v1', this.stores)
      invalidateApiCache('stores')

      // Sync ke backend API jika online
      departmentApi.create({
        departmentCode: newStore.code,
        departmentName: newStore.name,
        regionCode: newStore.region,
        isActive: newStore.status === 'ACTIVE',
        userSlId: newStore.storeLeaderId,
        userDmId: newStore.districtManagerId
      }).catch(e => console.warn('API sync department create failed:', e.message))

      return newStore
    },

    updateStore(id, payload) {
      const index = this.stores.findIndex(s => s.id === id)
      if (index !== -1) {
        this.stores[index] = {
          ...this.stores[index],
          ...payload,
          name: payload.name !== undefined ? payload.name.trim() : this.stores[index].name,
          code: payload.code !== undefined ? payload.code.trim() : this.stores[index].code,
          storeLeaderId: payload.storeLeaderId !== undefined ? payload.storeLeaderId : this.stores[index].storeLeaderId,
          districtManagerId: payload.districtManagerId !== undefined ? payload.districtManagerId : this.stores[index].districtManagerId,
          batchId: payload.batchId !== undefined ? payload.batchId : this.stores[index].batchId,
          updatedAt: new Date().toISOString()
        }
        setStoredData('rejuve_stores_v1', this.stores)

        // Sync ke backend API jika online
        departmentApi.update(id, {
          departmentName: this.stores[index].name,
          regionCode: this.stores[index].region,
          isActive: this.stores[index].status === 'ACTIVE'
        }).catch(e => console.warn('API sync department update failed:', e.message))

        return this.stores[index]
      }
      return null
    },

    deleteStore(id) {
      const index = this.stores.findIndex(s => s.id === id)
      if (index !== -1) {
        const removed = this.stores.splice(index, 1)[0]
        setStoredData('rejuve_stores_v1', this.stores)

        // Sync ke backend API jika online
        departmentApi.delete(id).catch(e => console.warn('API sync department delete failed:', e.message))

        return removed
      }
      return null
    }
  }
})
