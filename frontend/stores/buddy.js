import { defineStore } from 'pinia'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { evaluationApi } from '../services/api.js'

export const useBuddyStore = defineStore('buddy', {
  state: () => ({
    packages: getStoredData('rejuve_buddy_packages_v4', []),
    evaluations: getStoredData('rejuve_buddy_evaluations_v4', []),
    selectedCompetencyId: 'comp-pk',
    workstationBatch: null,
    workstationCrews: [],
    selectedCrewMissions: [],
    selectedCrewUser: null,
    isLoadingCrews: false,
    isLoadingMissions: false,
    isSubmitting: false
  }),

  getters: {
    allPackages: (state) => state.packages || [],
    packageById: (state) => (id) => (state.packages || []).find(p => p.id === id),
    defaultPackage: (state) => {
      const pkgs = state.packages || []
      return pkgs[0] || null
    },

    evaluationsByBatch: (state) => (batchId) => {
      return (state.evaluations || []).filter(e => e.batchId === batchId)
    },

    evaluationForCrew: (state) => (batchId, crewId) => {
      return (state.evaluations || []).find(e => e.batchId === batchId && e.crewId === crewId)
    },

    crewOverallStatus: (state) => (batchId, crewId) => {
      const record = (state.evaluations || []).find(e => e.batchId === batchId && e.crewId === crewId)
      return record?.status || 'NOT_STARTED'
    },

    /**
     * Menghitung ringkasan perolehan skor rapor new hire (Persentase Kompeten)
     */
    crewCompetencySummary: (state) => (batchId, crewId) => {
      const record = (state.evaluations || []).find(e => e.batchId === batchId && e.crewId === crewId)
      if (!record || !record.indicatorRatings) {
        return {
          total: 22,
          rated: 0,
          kompeten: 0,
          butuhPendampingan: 0,
          belumMenguasai: 0,
          scorePercent: 0,
          isCompleted: false
        }
      }

      const ratings = Object.values(record.indicatorRatings || {})
      const total = ratings.length || 22
      const kompeten = ratings.filter(r => r === 'KOMPETEN').length
      const butuhPendampingan = ratings.filter(r => r === 'BUTUH_PENDAMPINGAN').length
      const belumMenguasai = ratings.filter(r => r === 'BELUM_MENGUASAI').length
      const rated = kompeten + butuhPendampingan + belumMenguasai

      // Bobot: Kompeten = 100%, Butuh Pendampingan = 60%, Belum = 20%
      let weightedPoints = 0
      ratings.forEach(r => {
        if (r === 'KOMPETEN') weightedPoints += 100
        else if (r === 'BUTUH_PENDAMPINGAN') weightedPoints += 60
        else if (r === 'BELUM_MENGUASAI') weightedPoints += 20
      })

      const scorePercent = total > 0 ? Math.round(weightedPoints / total) : 0
      const isCompleted = rated >= 20

      return {
        total,
        rated,
        kompeten,
        butuhPendampingan,
        belumMenguasai,
        scorePercent,
        isCompleted
      }
    }
  },

  actions: {
    async fetchBuddyReport(userId) {
      if (!userId) return null
      try {
        const res = await evaluationApi.getBuddyReport(userId)
        if (res && res.data) {
          return res.data
        }
        return res
      } catch (err) {
        console.warn('fetchBuddyReport warning:', err.message)
        return null
      }
    },

    async fetchBuddyReportHtml(userId) {
      if (!userId) return ''
      try {
        const res = await evaluationApi.getBuddyReportHtml(userId)
        return res?.data || res || ''
      } catch (err) {
        console.warn('fetchBuddyReportHtml warning:', err.message)
        return ''
      }
    },

    async fetchBuddyCrews(params = {}) {
      this.isLoadingCrews = true
      try {
        const res = await evaluationApi.getCrews({ ...params, type: 'BUDDY' })
        if (res && res.data) {
          this.workstationBatch = res.data.batch || null
          this.workstationCrews = Array.isArray(res.data.crews) ? res.data.crews : []
          return res.data
        }
      } catch (err) {
        console.warn('fetchBuddyCrews failed:', err.message)
      } finally {
        this.isLoadingCrews = false
      }
      return { batch: this.workstationBatch, crews: this.workstationCrews }
    },

    async fetchBuddyMissions(userId, params = {}) {
      if (!userId) return null
      this.isLoadingMissions = true
      try {
        const res = await evaluationApi.getCrewMissions(userId, { ...params, type: 'BUDDY' })
        if (res && res.data) {
          this.selectedCrewUser = res.data.user || null
          this.selectedCrewMissions = Array.isArray(res.data.missions) ? res.data.missions : []
          return res.data
        }
      } catch (err) {
        console.warn('fetchBuddyMissions failed:', err.message)
      } finally {
        this.isLoadingMissions = false
      }
      return { user: this.selectedCrewUser, missions: this.selectedCrewMissions }
    },

    async submitBuddyScore(userMissionId, payload) {
      this.isSubmitting = true
      try {
        const res = await evaluationApi.submitBuddyScore(userMissionId, payload)
        if (res && res.data) {
          const updated = res.data
          const idx = this.selectedCrewMissions.findIndex(m => m.userMissionId === userMissionId)
          if (idx !== -1) {
            this.selectedCrewMissions[idx] = { ...this.selectedCrewMissions[idx], ...updated }
          }
          const crew = this.workstationCrews.find(c => c.userId === updated.userId)
          if (crew) {
            crew.evaluatedCount = Math.min(crew.totalMissionsCount, (crew.evaluatedCount || 0) + 1)
            if (crew.evaluatedCount >= crew.totalMissionsCount) {
              crew.status = 'COMPLETED'
            }
          }
          return res
        }
      } catch (err) {
        console.error('submitBuddyScore failed:', err)
        throw err
      } finally {
        this.isSubmitting = false
      }
    },

    selectCompetency(compId) {
      this.selectedCompetencyId = compId || 'comp-pk'
    },

    /**
     * Menyimpan atau mengupdate evaluasi Rapor New Hire 3 Hari
     */
    saveBuddyEvaluation({
      batchId,
      crewId,
      crewName = '',
      storeTraining = '',
      storeCaptain = '',
      evaluatorId = '',
      trainingPeriod = '1 - 3 September 2026',
      indicatorRatings = {},
      recommendationNote = '',
      status = 'IN_PROGRESS',
      captainSigned = false,
      crewSigned = false
    }) {
      let record = this.evaluations.find(e => e.batchId === batchId && e.crewId === crewId)

      if (!record) {
        record = {
          id: `beval-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          batchId,
          crewId,
          crewName,
          storeTraining,
          storeCaptain,
          evaluatorId,
          trainingPeriod,
          status,
          recommendationNote,
          captainSigned,
          crewSigned,
          indicatorRatings: {},
          updatedAt: new Date().toISOString()
        }
        this.evaluations.push(record)
      }

      record.crewName = crewName || record.crewName
      record.storeTraining = storeTraining || record.storeTraining
      record.storeCaptain = storeCaptain || record.storeCaptain
      record.evaluatorId = evaluatorId || record.evaluatorId
      record.trainingPeriod = trainingPeriod || record.trainingPeriod
      record.indicatorRatings = { ...record.indicatorRatings, ...indicatorRatings }
      record.recommendationNote = recommendationNote !== undefined ? recommendationNote : record.recommendationNote
      record.status = status || record.status
      record.captainSigned = captainSigned !== undefined ? captainSigned : record.captainSigned
      record.crewSigned = crewSigned !== undefined ? crewSigned : record.crewSigned
      record.updatedAt = new Date().toISOString()

      setStoredData('rejuve_buddy_evaluations_v4', this.evaluations)
      return record
    },

    /**
     * Update rekomendasi Store Leader terhadap kesiapan New Hire masuk Batch
     */
    updateCrewRecommendation(batchId, crewId, { status, recommendationNote, captainSigned, crewSigned }) {
      let record = this.evaluations.find(e => e.batchId === batchId && e.crewId === crewId)
      if (!record) {
        record = {
          id: `beval-${Date.now()}`,
          batchId,
          crewId,
          status: status || 'RECOMMENDED',
          recommendationNote: recommendationNote || '',
          captainSigned: captainSigned || false,
          crewSigned: crewSigned || false,
          indicatorRatings: {},
          updatedAt: new Date().toISOString()
        }
        this.evaluations.push(record)
      } else {
        if (status) record.status = status
        if (recommendationNote !== undefined) record.recommendationNote = recommendationNote
        if (captainSigned !== undefined) record.captainSigned = captainSigned
        if (crewSigned !== undefined) record.crewSigned = crewSigned
        record.updatedAt = new Date().toISOString()
      }

      setStoredData('rejuve_buddy_evaluations_v4', this.evaluations)
      return record
    },

    /**
     * Create new Buddy Template Package
     */
    createBuddyPackage(payload) {
      const id = `pkg-buddy-${Date.now()}`
      const basePkg = this.defaultPackage
      const defaultComps = basePkg?.competencies ? JSON.parse(JSON.stringify(basePkg.competencies)) : []

      const newPkg = {
        id,
        name: payload.name,
        code: payload.code || `BUDDY-${String(this.packages.length + 1).padStart(2, '0')}`,
        durationDays: 3,
        description: payload.description || '',
        competencies: payload.competencies && payload.competencies.length > 0 ? payload.competencies : defaultComps
      }

      this.packages.push(newPkg)
      setStoredData('rejuve_buddy_packages_v4', this.packages)
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
      setStoredData('rejuve_buddy_packages_v4', this.packages)
      return duplicated
    },

    /**
     * Tambah Butir Indikator ke Kompetensi tertentu dalam Paket Buddy
     */
    addIndicatorToCompetency(pkgId, compId, indicatorPayload) {
      const pkg = this.packageById(pkgId)
      if (!pkg || !pkg.competencies) return null

      const comp = pkg.competencies.find(c => c.id === compId)
      if (!comp) return null

      if (!Array.isArray(comp.indicators)) {
        comp.indicators = []
      }

      const newIndicator = {
        id: `ind-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
        name: indicatorPayload.name,
        isStar: !!indicatorPayload.isStar,
        note: indicatorPayload.note || (indicatorPayload.isStar ? 'Wajib pembekalan, dimaklumi bila belum praktik langsung' : ''),
        description: indicatorPayload.description || ''
      }

      comp.indicators.push(newIndicator)
      setStoredData('rejuve_buddy_packages_v4', this.packages)
      return newIndicator
    },

    /**
     * Update Butir Indikator dalam Kompetensi
     */
    updateIndicator(pkgId, compId, indicatorId, indicatorPayload) {
      const pkg = this.packageById(pkgId)
      if (!pkg || !pkg.competencies) return null

      const comp = pkg.competencies.find(c => c.id === compId)
      if (!comp || !Array.isArray(comp.indicators)) return null

      const ind = comp.indicators.find(i => i.id === indicatorId)
      if (!ind) return null

      Object.assign(ind, indicatorPayload)
      setStoredData('rejuve_buddy_packages_v4', this.packages)
      return ind
    },

    /**
     * Hapus Butir Indikator dari Kompetensi
     */
    removeIndicator(pkgId, compId, indicatorId) {
      const pkg = this.packageById(pkgId)
      if (!pkg || !pkg.competencies) return false

      const comp = pkg.competencies.find(c => c.id === compId)
      if (!comp || !Array.isArray(comp.indicators)) return false

      const idx = comp.indicators.findIndex(i => i.id === indicatorId)
      if (idx !== -1) {
        comp.indicators.splice(idx, 1)
        setStoredData('rejuve_buddy_packages_v4', this.packages)
        return true
      }
      return false
    },

    /**
     * Update Paket Buddy
     */
    updateBuddyPackage(id, payload) {
      const pkg = this.packages.find(p => p.id === id)
      if (!pkg) return null
      Object.assign(pkg, payload)
      setStoredData('rejuve_buddy_packages_v4', this.packages)
      return pkg
    },

    /**
     * Hapus Paket Buddy
     */
    deleteBuddyPackage(id) {
      const idx = this.packages.findIndex(p => p.id === id)
      if (idx !== -1) {
        const removed = this.packages.splice(idx, 1)[0]
        setStoredData('rejuve_buddy_packages_v4', this.packages)
        return removed
      }
      return null
    }
  }
})
