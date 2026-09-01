import { defineStore } from 'pinia'
import { mockBuddyPackages } from '~/mocks/buddyTemplates.js'
import { mockBuddyEvaluations } from '~/mocks/buddyEvaluations.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

export const useBuddyStore = defineStore('buddy', {
  state: () => ({
    packages: getStoredData('rejuve_buddy_packages_v1', mockBuddyPackages),
    evaluations: getStoredData('rejuve_buddy_evaluations_v1', mockBuddyEvaluations),
    selectedDay: 1
  }),

  getters: {
    allPackages: (state) => state.packages,
    packageById: (state) => (id) => state.packages.find(p => p.id === id),
    defaultPackage: (state) => state.packages[0] || null,

    evaluationsByBatch: (state) => (batchId) => {
      return state.evaluations.filter(e => e.batchId === batchId)
    },

    evaluationForCrew: (state) => (batchId, crewId) => {
      return state.evaluations.find(e => e.batchId === batchId && e.crewId === crewId)
    },

    crewDayEvaluation: (state) => (batchId, crewId, dayNumber) => {
      const record = state.evaluations.find(e => e.batchId === batchId && e.crewId === crewId)
      return record?.dayEvaluations?.[dayNumber] || null
    },

    crewOverallStatus: (state) => (batchId, crewId) => {
      const record = state.evaluations.find(e => e.batchId === batchId && e.crewId === crewId)
      return record?.status || 'NOT_STARTED'
    },

    crewAvgScore: (state) => (batchId, crewId) => {
      const record = state.evaluations.find(e => e.batchId === batchId && e.crewId === crewId)
      if (!record || !record.dayEvaluations) return 0
      const days = Object.values(record.dayEvaluations).filter(d => d.score !== undefined)
      if (days.length === 0) return 0
      const total = days.reduce((acc, curr) => acc + Number(curr.score || 0), 0)
      return Math.round(total / days.length)
    }
  },

  actions: {
    selectDay(dayNumber) {
      this.selectedDay = Number(dayNumber) || 1
    },

    /**
     * Save or update Store Leader's day evaluation for a specific crew
     */
    saveDayEvaluation({
      batchId,
      crewId,
      dayNumber,
      score = 0,
      note = '',
      checklistResults = {},
      evidences = [],
      evaluatorId = '',
      evaluatorName = '',
      storeId = '',
      storeName = ''
    }) {
      let record = this.evaluations.find(e => e.batchId === batchId && e.crewId === crewId)

      if (!record) {
        record = {
          id: `beval-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          batchId,
          crewId,
          evaluatorId,
          evaluatorName,
          storeId,
          storeName,
          status: 'IN_PROGRESS',
          recommendationNote: '',
          dayEvaluations: {}
        }
        this.evaluations.push(record)
      }

      if (!record.dayEvaluations) {
        record.dayEvaluations = {}
      }

      record.dayEvaluations[dayNumber] = {
        score: Number(score),
        status: 'COMPLETED',
        note,
        checklistResults,
        evidences,
        updatedAt: new Date().toISOString()
      }

      if (evaluatorId) record.evaluatorId = evaluatorId
      if (evaluatorName) record.evaluatorName = evaluatorName
      if (storeId) record.storeId = storeId
      if (storeName) record.storeName = storeName

      // Check if all 3 days are completed
      const completedDays = Object.keys(record.dayEvaluations).length
      if (completedDays >= 3 && record.status === 'IN_PROGRESS') {
        record.status = 'RECOMMENDED'
      }

      setStoredData('rejuve_buddy_evaluations_v1', this.evaluations)
      return record
    },

    /**
     * Update overall crew recommendation note & status
     */
    updateCrewRecommendation(batchId, crewId, { status, recommendationNote }) {
      let record = this.evaluations.find(e => e.batchId === batchId && e.crewId === crewId)
      if (!record) {
        record = {
          id: `beval-${Date.now()}`,
          batchId,
          crewId,
          status: status || 'RECOMMENDED',
          recommendationNote: recommendationNote || '',
          dayEvaluations: {}
        }
        this.evaluations.push(record)
      } else {
        if (status) record.status = status
        if (recommendationNote !== undefined) record.recommendationNote = recommendationNote
      }

      setStoredData('rejuve_buddy_evaluations_v1', this.evaluations)
      return record
    },

    /**
     * Create new Buddy Template Package
     */
    /**
     * Create new Buddy Template Package
     */
    createBuddyPackage(payload) {
      const id = `pkg-buddy-${Date.now()}`
      const totalDays = Number(payload.totalDays) || 3
      
      const defaultDays = Array.from({ length: totalDays }, (_, i) => ({
        dayNumber: i + 1,
        offsetDays: totalDays - i,
        title: `Hari ${i + 1} (H-${totalDays - i}): Modul Pendampingan`,
        focus: 'Standar Operasional & Kesiapan',
        missions: []
      }))

      const newPkg = {
        id,
        name: payload.name,
        code: payload.code || `BUDDY-${String(this.packages.length + 1).padStart(2, '0')}`,
        totalDays,
        description: payload.description || '',
        days: payload.days && payload.days.length > 0 ? payload.days : defaultDays
      }

      this.packages.push(newPkg)
      setStoredData('rejuve_buddy_packages_v1', this.packages)
      return newPkg
    },

    /**
     * Duplicate Buddy Template Package
     */
    duplicateBuddyPackage(id) {
      const original = this.packageById(id)
      if (!original) return null

      const newId = `pkg-buddy-${Date.now()}`
      const duplicated = {
        ...JSON.parse(JSON.stringify(original)),
        id: newId,
        name: `${original.name} (Salinan)`,
        code: `${original.code}-CPY`
      }

      this.packages.push(duplicated)
      setStoredData('rejuve_buddy_packages_v1', this.packages)
      return duplicated
    },

    /**
     * Add new mission item to a specific day in Buddy Package
     */
    addMissionToBuddyDay(pkgId, dayNumber, missionPayload) {
      const pkg = this.packageById(pkgId)
      if (!pkg) return null

      const dayObj = pkg.days.find(d => d.dayNumber === Number(dayNumber))
      if (!dayObj) return null

      const newMission = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
        title: missionPayload.title,
        description: missionPayload.description || '',
        checklist: missionPayload.checklist || []
      }

      dayObj.missions.push(newMission)
      setStoredData('rejuve_buddy_packages_v1', this.packages)
      return newMission
    },

    /**
     * Update mission item in Buddy Day
     */
    updateMissionInBuddyDay(pkgId, dayNumber, missionId, missionPayload) {
      const pkg = this.packageById(pkgId)
      if (!pkg) return null

      const dayObj = pkg.days.find(d => d.dayNumber === Number(dayNumber))
      if (!dayObj) return null

      const mIdx = dayObj.missions.findIndex(m => m.id === missionId)
      if (mIdx === -1) return null

      Object.assign(dayObj.missions[mIdx], missionPayload)
      setStoredData('rejuve_buddy_packages_v1', this.packages)
      return dayObj.missions[mIdx]
    },

    /**
     * Remove mission item from Buddy Day
     */
    removeMissionFromBuddyDay(pkgId, dayNumber, missionId) {
      const pkg = this.packageById(pkgId)
      if (!pkg) return false

      const dayObj = pkg.days.find(d => d.dayNumber === Number(dayNumber))
      if (!dayObj) return false

      const mIdx = dayObj.missions.findIndex(m => m.id === missionId)
      if (mIdx !== -1) {
        dayObj.missions.splice(mIdx, 1)
        setStoredData('rejuve_buddy_packages_v1', this.packages)
        return true
      }
      return false
    },

    /**
     * Update existing Buddy Template Package
     */
    updateBuddyPackage(id, payload) {
      const pkg = this.packages.find(p => p.id === id)
      if (!pkg) return null
      Object.assign(pkg, payload)
      setStoredData('rejuve_buddy_packages_v1', this.packages)
      return pkg
    },

    /**
     * Delete Buddy Template Package
     */
    deleteBuddyPackage(id) {
      const idx = this.packages.findIndex(p => p.id === id)
      if (idx !== -1) {
        const removed = this.packages.splice(idx, 1)[0]
        setStoredData('rejuve_buddy_packages_v1', this.packages)
        return removed
      }
      return null
    }
  }
})
