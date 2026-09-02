import { defineStore } from 'pinia'
import { mockBuddyPackages } from '../mocks/buddyTemplates.js'
import { mockBuddyEvaluations } from '../mocks/buddyEvaluations.js'
import { getStoredData, setStoredData } from '../utils/storage.js'

function loadSafeBuddyPackages() {
  const data = getStoredData('rejuve_buddy_packages_v4', mockBuddyPackages)
  if (!Array.isArray(data) || data.length === 0 || !data[0] || !data[0].competencies || !Array.isArray(data[0].competencies)) {
    setStoredData('rejuve_buddy_packages_v4', mockBuddyPackages)
    return JSON.parse(JSON.stringify(mockBuddyPackages))
  }
  return data
}

function loadSafeBuddyEvaluations() {
  const data = getStoredData('rejuve_buddy_evaluations_v4', mockBuddyEvaluations)
  if (!Array.isArray(data) || (data.length > 0 && !data[0].indicatorRatings)) {
    setStoredData('rejuve_buddy_evaluations_v4', mockBuddyEvaluations)
    return JSON.parse(JSON.stringify(mockBuddyEvaluations))
  }
  return data
}

export const useBuddyStore = defineStore('buddy', {
  state: () => ({
    packages: loadSafeBuddyPackages(),
    evaluations: loadSafeBuddyEvaluations(),
    selectedCompetencyId: 'comp-pk'
  }),

  getters: {
    allPackages: (state) => state.packages || [],
    packageById: (state) => (id) => (state.packages || []).find(p => p.id === id),
    defaultPackage: (state) => {
      const pkgs = state.packages || []
      return pkgs[0] || mockBuddyPackages[0]
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
