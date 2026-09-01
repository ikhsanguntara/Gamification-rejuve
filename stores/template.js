import { defineStore } from 'pinia'
import { mockTemplatePackages } from '~/mocks/templates.js'
import { useMissionStore } from './mission.js'
import { useBatchStore } from './batch.js'
import { useGamificationStore } from './gamification.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

/**
 * Normalizes a package to ensure `weeks` array and `totalWeeks` exist
 */
function normalizePackage(pkg) {
  if (!pkg.weeks || !Array.isArray(pkg.weeks) || pkg.weeks.length === 0) {
    const totalWeeks = Number(pkg.totalWeeks) || 3
    pkg.weeks = Array.from({ length: totalWeeks }, (_, i) => ({
      weekNumber: i + 1,
      title: `Minggu ${i + 1}: Tema SOP Operasional`
    }))
  }
  pkg.totalWeeks = pkg.weeks.length
  return pkg
}

const rawPackages = getStoredData('rejuve_templates_v4', mockTemplatePackages)
const initialPackages = rawPackages.map(normalizePackage)

/**
 * Template Store: Manage Master Mission Packages, SOP Presets, and Dynamic Batch Provisioning
 */
export const useTemplateStore = defineStore('template', {
  state: () => ({
    packages: initialPackages,
    selectedPackageId: 'pkg-sop-standard'
  }),

  getters: {
    allPackages: (state) => state.packages,
    currentPackage: (state) => state.packages.find(p => p.id === state.selectedPackageId) || state.packages[0],
    packageById: (state) => (id) => state.packages.find(p => p.id === id),
    allTemplates: (state) => {
      const pkg = state.packages.find(p => p.id === state.selectedPackageId) || state.packages[0]
      return pkg ? pkg.templates : []
    },
    templatesByWeek: (state) => (weekNumber) => {
      const pkg = state.packages.find(p => p.id === state.selectedPackageId) || state.packages[0]
      if (!pkg || !pkg.templates) return []
      return pkg.templates.filter(t => t.week === Number(weekNumber))
    },
    packageWeeks: (state) => (pkgId) => {
      const pkg = state.packages.find(p => p.id === pkgId) || state.packages.find(p => p.id === state.selectedPackageId) || state.packages[0]
      if (!pkg) return []
      if (!pkg.weeks || pkg.weeks.length === 0) {
        normalizePackage(pkg)
      }
      return pkg.weeks
    }
  },

  actions: {
    selectPackage(pkgId) {
      if (this.packages.find(p => p.id === pkgId)) {
        this.selectedPackageId = pkgId
      }
    },

    /**
     * Apply a specific Master Template Package to a target batch!
     */
    applyPackageToBatch(batchId, packageId = 'pkg-sop-standard') {
      const pkg = this.packageById(packageId) || this.packages[0]
      if (!pkg) return []

      const batchStore = useBatchStore()
      const missionStore = useMissionStore()
      const gamificationStore = useGamificationStore()

      const batch = batchStore.batchById(batchId)
      const batchCrews = gamificationStore.crewsByBatch(batchId)
      const assignedCrewIds = batchCrews.map(c => c.id)
      const batchCode = batch ? (batch.code || 'BTH') : 'BTH'

      const createdMissions = []

      pkg.templates.forEach((tmpl, idx) => {
        const missionId = `msn-${batchId}-w${tmpl.week}-${idx + 1}`
        const missionCode = `MSN-${batchCode}-W${tmpl.week}-0${(idx % 4) + 1}`

        // Check if mission already exists
        const existing = missionStore.missions.find(m => m.batchId === batchId && m.code === missionCode)
        if (existing) return

        const newMission = {
          id: missionId,
          batchId,
          week: tmpl.week,
          code: missionCode,
          title: tmpl.title,
          category: tmpl.category,
          description: tmpl.description,
          requirements: [...tmpl.requirements],
          deadline: `2026-09-${String(tmpl.week * 7).padStart(2, '0')}`,
          maxStars: tmpl.maxStars || 5,
          assignedCrewIds,
          crewEvaluations: assignedCrewIds.map(cId => ({
            crewId: cId,
            score: 0,
            calculatedStars: 0,
            awardedStars: 0,
            status: tmpl.week === 1 ? 'NOT_STARTED' : 'LOCKED'
          })),
          status: tmpl.week === 1 ? 'NOT_STARTED' : 'LOCKED',
          averageScore: 0,
          calculatedStars: 0,
          awardedStars: 0,
          supervisorId: batch?.assignment?.supervisorId || 'spv-001',
          createdAt: new Date().toISOString()
        }

        missionStore.missions.push(newMission)
        createdMissions.push(newMission)
      })

      // Update batch totalMissions count
      if (batch) {
        batch.totalMissions = missionStore.missionsByBatch(batchId).length
        if (pkg.weeks && pkg.weeks.length > 0) {
          batch.weeks = pkg.weeks.map(w => ({
            weekNumber: w.weekNumber,
            title: w.title,
            status: w.weekNumber === 1 ? 'ACTIVE' : 'LOCKED',
            isLocked: w.weekNumber > 1,
            missionCount: pkg.templates.filter(t => t.week === w.weekNumber).length,
            completionRate: 0
          }))
        }
      }

      return createdMissions
    },

    /**
     * Create a new Master Template Package
     */
    createPackage(payload) {
      const id = `pkg-${Date.now()}`
      const totalWeeks = Number(payload.totalWeeks) || 3
      const weeks = Array.from({ length: totalWeeks }, (_, i) => ({
        weekNumber: i + 1,
        title: `Minggu ${i + 1}: Tema SOP Operasional`
      }))

      const newPkg = {
        id,
        name: payload.name,
        code: payload.code || `PKG-${String(this.packages.length + 1).padStart(2, '0')}`,
        category: payload.category || 'Operasional',
        targetType: payload.targetType || 'Semua Gerai',
        description: payload.description || '',
        totalMissions: 0,
        totalWeeks,
        weeks,
        templates: []
      }

      this.packages.push(newPkg)
      this.selectedPackageId = id
      setStoredData('rejuve_templates_v4', this.packages)
      return newPkg
    },

    /**
     * Add a new Week to a Package (e.g. Week 4, Week 5, etc.)
     */
    addWeekToPackage(pkgId, title = '') {
      const pkg = this.packageById(pkgId)
      if (!pkg) return null

      if (!pkg.weeks) pkg.weeks = []
      const nextWeekNum = pkg.weeks.length + 1
      const newWeek = {
        weekNumber: nextWeekNum,
        title: title || `Minggu ${nextWeekNum}: Tema SOP Lanjutan`
      }

      pkg.weeks.push(newWeek)
      pkg.totalWeeks = pkg.weeks.length
      setStoredData('rejuve_templates_v4', this.packages)
      return newWeek
    },

    /**
     * Update the title/theme of a specific Week in a Package
     */
    updateWeekTitle(pkgId, weekNumber, title) {
      const pkg = this.packageById(pkgId)
      if (!pkg || !pkg.weeks) return false

      const target = pkg.weeks.find(w => w.weekNumber === Number(weekNumber))
      if (target) {
        target.title = title
        setStoredData('rejuve_templates_v4', this.packages)
        return true
      }
      return false
    },

    /**
     * Remove a Week from a Package (only if totalWeeks > 1)
     */
    removeWeekFromPackage(pkgId, weekNumber) {
      const pkg = this.packageById(pkgId)
      if (!pkg || !pkg.weeks || pkg.weeks.length <= 1) return false

      const targetIdx = pkg.weeks.findIndex(w => w.weekNumber === Number(weekNumber))
      if (targetIdx === -1) return false

      // Remove templates in that week
      pkg.templates = pkg.templates.filter(t => t.week !== Number(weekNumber))

      // Remove week
      pkg.weeks.splice(targetIdx, 1)

      // Re-index remaining weeks and templates
      pkg.weeks.forEach((w, idx) => {
        const oldWeekNum = w.weekNumber
        const newWeekNum = idx + 1
        w.weekNumber = newWeekNum
        
        // Update template week numbers
        pkg.templates.forEach(t => {
          if (t.week === oldWeekNum) {
            t.week = newWeekNum
          }
        })
      })

      pkg.totalWeeks = pkg.weeks.length
      pkg.totalMissions = pkg.templates.length
      setStoredData('rejuve_templates_v4', this.packages)
      return true
    },

    /**
     * Duplicate an existing Master Package
     */
    duplicatePackage(sourcePkgId) {
      const source = this.packageById(sourcePkgId)
      if (!source) return null

      const id = `pkg-${Date.now()}`
      const duplicated = {
        ...JSON.parse(JSON.stringify(source)),
        id,
        name: `${source.name} (Salinan)`,
        code: `${source.code}-COPY`,
        weeks: source.weeks ? JSON.parse(JSON.stringify(source.weeks)) : [
          { weekNumber: 1, title: 'Minggu 1: Suhu & Sanitasi Dasar' },
          { weekNumber: 2, title: 'Minggu 2: Kualitas Rasa & Layanan' },
          { weekNumber: 3, title: 'Minggu 3: Audit Akhir & Stok' }
        ],
        templates: source.templates.map((t, idx) => ({
          ...t,
          id: `tmpl-copy-${Date.now()}-${idx}`
        }))
      }

      this.packages.push(duplicated)
      this.selectedPackageId = id
      setStoredData('rejuve_templates_v4', this.packages)
      return duplicated
    },

    /**
     * Update an existing Master Package Metadata
     */
    updatePackage(id, payload) {
      const pkg = this.packages.find(p => p.id === id)
      if (!pkg) return null
      Object.assign(pkg, payload)
      setStoredData('rejuve_templates_v4', this.packages)
      return pkg
    },

    /**
     * Delete a Master Package
     */
    deletePackage(id) {
      const idx = this.packages.findIndex(p => p.id === id)
      if (idx !== -1) {
        const removed = this.packages.splice(idx, 1)[0]
        if (this.selectedPackageId === id) {
          this.selectedPackageId = this.packages[0]?.id || ''
        }
        setStoredData('rejuve_templates_v4', this.packages)
        return removed
      }
      return null
    },

    /**
     * Add a Mission Template to a specific Master Package
     */
    addMissionToPackage(pkgId, payload) {
      const pkg = this.packageById(pkgId)
      if (!pkg) return null

      const id = `tmpl-${Date.now()}`
      const newTmpl = {
        id,
        week: Number(payload.week) || 1,
        codePrefix: payload.codePrefix || `M-0${pkg.templates.length + 1}`,
        title: payload.title,
        category: payload.category || 'Quality Control',
        description: payload.description || '',
        requirements: payload.requirements || ['Pemeriksaan standar operasional prosedur'],
        maxStars: 5
      }

      pkg.templates.push(newTmpl)
      pkg.totalMissions = pkg.templates.length
      setStoredData('rejuve_templates_v4', this.packages)
      return newTmpl
    },

    /**
     * Remove a Mission Template from a Master Package
     */
    removeMissionFromPackage(pkgId, tmplId) {
      const pkg = this.packageById(pkgId)
      if (!pkg) return false

      const idx = pkg.templates.findIndex(t => t.id === tmplId)
      if (idx !== -1) {
        pkg.templates.splice(idx, 1)
        pkg.totalMissions = pkg.templates.length
        setStoredData('rejuve_templates_v4', this.packages)
        return true
      }
      return false
    }
  }
})
