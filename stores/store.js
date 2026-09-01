import { defineStore } from 'pinia'
import { mockStores } from '~/mocks/stores.js'
import { useUserStore } from './user.js'
import { useBatchStore } from './batch.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

/**
 * Store Store: Manage Master Stores/Outlets, Location, Store Leader & District Manager Assignments
 */

export const useStoreStore = defineStore('store', {
  state: () => ({
    stores: getStoredData('rejuve_stores_v1', mockStores),
    selectedStoreId: 'store-001'
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
        return this.stores[index]
      }
      return null
    },

    deleteStore(id) {
      const index = this.stores.findIndex(s => s.id === id)
      if (index !== -1) {
        const removed = this.stores.splice(index, 1)[0]
        setStoredData('rejuve_stores_v1', this.stores)
        return removed
      }
      return null
    }
  }
})
