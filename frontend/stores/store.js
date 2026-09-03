import { defineStore } from 'pinia'
import { mockStores } from '../mocks/stores.js'
import { useUserStore } from './user.js'
import { useBatchStore } from './batch.js'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { departmentApi } from '../services/api.js'

/**
 * Store Store: Manage Master Stores/Outlets, Location, Store Leader & District Manager Assignments
 */

export const useStoreStore = defineStore('store', {
  state: () => ({
    stores: getStoredData('rejuve_stores_v1', mockStores),
    selectedStoreId: 'store-001',
    isLiveApi: false
  }),

  getters: {
    allStores: (state) => {
      const userStore = useUserStore()
      const batchStore = useBatchStore()
      return state.stores.map(s => {
        const storeLeader = userStore.userById(s.storeLeaderId) || null
        const districtManager = userStore.userById(s.districtManagerId) || null
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
      const s = state.stores.find(item => item.id === id)
      if (!s) return null
      const storeLeader = userStore.userById(s.storeLeaderId) || null
      const districtManager = userStore.userById(s.districtManagerId) || null
      const batch = s.batchId ? batchStore.batchById(s.batchId) || null : null
      return {
        ...s,
        storeLeader,
        districtManager,
        batch
      }
    },

    storesByRegion: (state) => (region) => {
      if (!region || region === 'ALL') return state.stores
      return state.stores.filter(s => s.region === region)
    },

    activeStores: (state) => state.stores.filter(s => s.status === 'ACTIVE'),
    totalStoreCount: (state) => state.stores.length,
    activeStoreCount: (state) => state.stores.filter(s => s.status === 'ACTIVE').length
  },

  actions: {
    selectStore(id) {
      this.selectedStoreId = id
    },

    async fetchStoresFromApi() {
      try {
        const res = await departmentApi.getAll({ limit: 100 })
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.isLiveApi = true
          this.stores = res.data.map(d => ({
            id: d.departmentId,
            name: d.departmentName,
            code: d.departmentCode,
            region: d.regionCode || 'JABODETABEK',
            mallName: d.departmentName,
            address: d.departmentName,
            phone: '021-29465000',
            storeLeaderId: d.userSlId,
            districtManagerId: d.userDmId,
            batchId: null,
            totalCrews: 4,
            status: d.isActive ? 'ACTIVE' : 'INACTIVE',
            openingHours: '10:00 - 22:00',
            createdAt: d.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
          }))
          if (this.stores.length > 0 && (!this.selectedStoreId || !this.stores.find(s => s.id === this.selectedStoreId))) {
            this.selectedStoreId = this.stores[0].id
          }
          setStoredData('rejuve_stores_v1', this.stores)
          return this.stores
        }
      } catch (err) {
        console.warn('fetchStoresFromApi failed:', err.message)
      }
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
      setStoredData('rejuve_stores_v1', this.stores)

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
