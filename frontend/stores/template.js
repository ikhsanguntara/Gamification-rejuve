import { defineStore } from 'pinia'
import { mockTemplatePackages } from '../mocks/templates.js'
import { useMissionStore } from './mission.js'
import { useBatchStore } from './batch.js'
import { useGamificationStore } from './gamification.js'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { templateApi } from '../services/api.js'
import { buildPrismaQuery } from '../utils/queryBuilder.js'

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
    journeyTemplates: [],
    buddyTemplates: [],
    feedbackTemplates: [],
    selectedPackageId: 'pkg-sop-standard',
    selectedBuddyId: '',
    selectedFeedbackId: '',
    isLoading: false
  }),

  getters: {
    allPackages: (state) => (state.journeyTemplates.length > 0 ? state.journeyTemplates : state.packages),
    allJourneyTemplates: (state) => (state.journeyTemplates.length > 0 ? state.journeyTemplates : state.packages),
    allBuddyTemplates: (state) => state.buddyTemplates,
    allFeedbackTemplates: (state) => state.feedbackTemplates,
    currentPackage: (state) => {
      const list = state.journeyTemplates.length > 0 ? state.journeyTemplates : state.packages
      return list.find(p => p.id === state.selectedPackageId) || list[0]
    },
    activeBuddyPackage: (state) => {
      return state.buddyTemplates.find(b => b.id === state.selectedBuddyId) || state.buddyTemplates[0] || null
    },
    activeFeedbackPackage: (state) => {
      return state.feedbackTemplates.find(f => f.id === state.selectedFeedbackId) || state.feedbackTemplates[0] || null
    },
    packageById: (state) => (id) => {
      return (
        state.journeyTemplates.find(p => p.id === id) ||
        state.packages.find(p => p.id === id) ||
        state.buddyTemplates.find(b => b.id === id) ||
        state.feedbackTemplates.find(f => f.id === id)
      )
    },
    allTemplates: (state) => {
      const list = state.journeyTemplates.length > 0 ? state.journeyTemplates : state.packages
      const pkg = list.find(p => p.id === state.selectedPackageId) || list[0]
      return pkg ? pkg.templates : []
    },
    templatesByWeek: (state) => (weekNumber) => {
      const list = state.journeyTemplates.length > 0 ? state.journeyTemplates : state.packages
      const pkg = list.find(p => p.id === state.selectedPackageId) || list[0]
      if (!pkg || !pkg.templates) return []
      return pkg.templates.filter(t => t.week === Number(weekNumber))
    },
    packageWeeks: (state) => (pkgId) => {
      const list = state.journeyTemplates.length > 0 ? state.journeyTemplates : state.packages
      const pkg = list.find(p => p.id === pkgId) || list.find(p => p.id === state.selectedPackageId) || list[0]
      if (!pkg) return []
      if (!pkg.weeks || pkg.weeks.length === 0) {
        normalizePackage(pkg)
      }
      return pkg.weeks
    }
  },

  actions: {
    /**
     * Fetch master templates by type from live backend API
     * Supports types: 'JOURNEY' | 'BUDDY' | 'FEEDBACK'
     */
    async fetchTemplatesByType(type = 'JOURNEY', params = {}) {
      try {
        const queryParams = {
          type,
          includeDetails: true,
          page: params.page || 1,
          limit: params.limit || 10
        }
        if (params.search && params.search.trim()) {
          queryParams['name[contains]'] = params.search.trim()
        }

        const res = await templateApi.getAll(queryParams)
        if (res && res.data && Array.isArray(res.data)) {
          const mapped = res.data.map(t => {
            const templates = (t.details || []).map((d, idx) => ({
              id: d.tplMissionDetailId || `tmpl-${idx}`,
              tplMissionDetailId: d.tplMissionDetailId,
              week: d.durationNumber || 1,
              durationNumber: d.durationNumber || 1,
              title: d.missionTitle,
              missionTitle: d.missionTitle,
              category: d.category || 'TECHNICAL',
              inputType: d.inputType || 'SCALE',
              scaleConfig: d.scaleConfig || null,
              description: d.description || '',
              requirements: ['Verifikasi checklist standar', 'Dokumentasi foto']
            }))

            return normalizePackage({
              id: t.tplMissionId,
              tplMissionId: t.tplMissionId,
              code: t.code,
              name: t.name,
              type: t.type,
              durationCode: t.durationCode || (t.type === 'JOURNEY' ? 'WEEK' : 'DAY'),
              durationValue: t.durationValue || (t.type === 'JOURNEY' ? 3 : 1),
              totalWeeks: t.type === 'JOURNEY' ? (t.durationValue || 3) : 1,
              description: t.description || '',
              targetType: 'Semua Gerai',
              category: t.type === 'JOURNEY' ? 'Standar Operasional' : (t.type === 'BUDDY' ? 'Orientasi Buddy' : 'Feedback & Evaluasi'),
              details: t.details || [],
              templates
            })
          })

          if (type === 'JOURNEY') {
            this.journeyTemplates = mapped
            this.packages = mapped
            if (mapped.length > 0 && (!this.selectedPackageId || !mapped.find(p => p.id === this.selectedPackageId))) {
              this.selectedPackageId = mapped[0].id
            }
          } else if (type === 'BUDDY') {
            this.buddyTemplates = mapped
            if (mapped.length > 0 && (!this.selectedBuddyId || !mapped.find(b => b.id === this.selectedBuddyId))) {
              this.selectedBuddyId = mapped[0].id
            }
          } else if (type === 'FEEDBACK') {
            this.feedbackTemplates = mapped
            if (mapped.length > 0 && (!this.selectedFeedbackId || !mapped.find(f => f.id === this.selectedFeedbackId))) {
              this.selectedFeedbackId = mapped[0].id
            }
          }

          return mapped
        }
        return []
      } catch (err) {
        console.warn(`fetchTemplatesByType(${type}) failed:`, err.message)
        return []
      }
    },

    /**
     * Fetch all 3 template types in parallel on page load
     */
    async fetchAllTemplateTypes() {
      this.isLoading = true
      try {
        await Promise.allSettled([
          this.fetchTemplatesByType('JOURNEY', { limit: 10 }),
          this.fetchTemplatesByType('BUDDY', { limit: 10 }),
          this.fetchTemplatesByType('FEEDBACK', { limit: 10 })
        ])
      } finally {
        this.isLoading = false
      }
    },

    async fetchTemplatesFromApi(params = {}) {
      return this.fetchTemplatesByType(params.type || 'JOURNEY', params)
    },

    /**
     * Fetch a single template by ID from live backend API
     * Updates details, templates, and weeks dynamically across all 3 types (JOURNEY, BUDDY, FEEDBACK)
     */
    async fetchTemplateById(id, type = null) {
      if (!id) return null
      this.isLoading = true
      try {
        const res = await templateApi.getById(id)
        const data = res?.data?.data || res?.data
        if (data && (data.tplMissionId || data.id)) {
          const actualId = data.tplMissionId || data.id
          const actualType = type || data.type || 'JOURNEY'
          const templates = (data.details || []).map((d, idx) => ({
            id: d.tplMissionDetailId || `tmpl-${idx}`,
            tplMissionDetailId: d.tplMissionDetailId,
            week: Number(d.durationNumber) || 1,
            durationNumber: Number(d.durationNumber) || 1,
            codePrefix: `M-W${d.durationNumber || 1}-0${idx + 1}`,
            title: d.missionTitle,
            missionTitle: d.missionTitle,
            category: d.category || (actualType === 'FEEDBACK' ? 'SOFT_SKILL' : 'TECHNICAL'),
            inputType: d.inputType || 'SCALE',
            scaleConfig: d.scaleConfig || null,
            description: d.description || '',
            requirements: ['Verifikasi checklist standar operasional', 'Pemeriksaan kepatuhan & sanitasi']
          }))

          const durationVal = Number(data.durationValue || (actualType === 'JOURNEY' ? 3 : 1))
          const weeks = Array.from({ length: durationVal }, (_, i) => ({
            weekNumber: i + 1,
            title: actualType === 'JOURNEY' ? `Minggu ${i + 1}: Tema SOP Operasional` : `Hari ${i + 1}: Agenda Orientasi`
          }))

          const mapped = normalizePackage({
            id: actualId,
            tplMissionId: actualId,
            code: data.code,
            name: data.name,
            type: data.type || actualType,
            durationCode: data.durationCode || (actualType === 'JOURNEY' ? 'WEEK' : 'DAY'),
            durationValue: durationVal,
            totalWeeks: durationVal,
            description: data.description || '',
            targetType: 'Semua Gerai',
            category: actualType === 'JOURNEY' ? 'Standar Operasional' : (actualType === 'BUDDY' ? 'Orientasi Buddy' : 'Feedback & Evaluasi'),
            details: data.details || [],
            weeks,
            templates
          })

          if (mapped.type === 'JOURNEY') {
            const idx = this.journeyTemplates.findIndex(p => p.id === actualId)
            if (idx !== -1) {
              this.journeyTemplates[idx] = mapped
            } else {
              this.journeyTemplates.push(mapped)
            }
            const pkgIdx = this.packages.findIndex(p => p.id === actualId)
            if (pkgIdx !== -1) {
              this.packages[pkgIdx] = mapped
            } else {
              this.packages.push(mapped)
            }
            this.selectedPackageId = actualId
          } else if (mapped.type === 'BUDDY') {
            const idx = this.buddyTemplates.findIndex(b => b.id === actualId)
            if (idx !== -1) {
              this.buddyTemplates[idx] = mapped
            } else {
              this.buddyTemplates.push(mapped)
            }
            this.selectedBuddyId = actualId
          } else if (mapped.type === 'FEEDBACK') {
            const idx = this.feedbackTemplates.findIndex(f => f.id === actualId)
            if (idx !== -1) {
              this.feedbackTemplates[idx] = mapped
            } else {
              this.feedbackTemplates.push(mapped)
            }
            this.selectedFeedbackId = actualId
          }

          return mapped
        }
      } catch (err) {
        console.warn(`fetchTemplateById(${id}) failed:`, err.message)
      } finally {
        this.isLoading = false
      }
      return this.packageById(id) || null
    },

    selectPackage(pkgId) {
      this.selectedPackageId = pkgId
      this.fetchTemplateById(pkgId, 'JOURNEY').catch(() => {})
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
     * Create a new Master Template Package (JOURNEY, BUDDY, or FEEDBACK)
     */
    createPackage(payload) {
      const type = payload.type || 'JOURNEY'
      const durationCode = payload.durationCode || (type === 'JOURNEY' ? 'WEEK' : 'DAY')
      const durationValue = Number(payload.durationValue || payload.totalWeeks || (type === 'JOURNEY' ? 3 : 1))

      const id = `pkg-${Date.now()}`
      const weeks = Array.from({ length: durationValue }, (_, i) => ({
        weekNumber: i + 1,
        title: type === 'JOURNEY' ? `Minggu ${i + 1}: Tema SOP Operasional` : `Hari ${i + 1}: Agenda Orientasi`
      }))

      const newPkg = normalizePackage({
        id,
        tplMissionId: id,
        name: payload.name,
        code: payload.code || `PKG-${String(this.packages.length + 1).padStart(2, '0')}`,
        type,
        durationCode,
        durationValue,
        category: payload.category || 'Operasional',
        targetType: payload.targetType || 'Semua Gerai',
        description: payload.description || '',
        totalMissions: 0,
        totalWeeks: durationValue,
        weeks,
        templates: [],
        details: []
      })

      if (type === 'JOURNEY') {
        this.packages.push(newPkg)
        this.journeyTemplates.push(newPkg)
        this.selectedPackageId = id
      } else if (type === 'BUDDY') {
        this.buddyTemplates.push(newPkg)
        this.selectedBuddyId = id
      } else if (type === 'FEEDBACK') {
        this.feedbackTemplates.push(newPkg)
        this.selectedFeedbackId = id
      }

      setStoredData('rejuve_templates_v4', this.packages)

      // Background API sync if available
      templateApi.create({
        code: newPkg.code,
        name: newPkg.name,
        type,
        durationCode,
        durationValue,
        description: newPkg.description || '',
        details: []
      }).then(res => {
        if (res?.data?.tplMissionId) {
          newPkg.tplMissionId = res.data.tplMissionId
          this.fetchTemplatesByType(type, { limit: 10 }).catch(() => {})
        }
      }).catch(err => {
        console.warn('templateApi.create background sync warning:', err.message)
      })

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
     * Delete a Master Package (JOURNEY, BUDDY, or FEEDBACK)
     */
    deletePackage(id, type = 'JOURNEY') {
      const list = type === 'JOURNEY' ? this.journeyTemplates : (type === 'BUDDY' ? this.buddyTemplates : this.feedbackTemplates)
      const listIdx = list.findIndex(p => p.id === id)
      if (listIdx !== -1) {
        list.splice(listIdx, 1)
      }

      const idx = this.packages.findIndex(p => p.id === id)
      let removed = null
      if (idx !== -1) {
        removed = this.packages.splice(idx, 1)[0]
        if (this.selectedPackageId === id) {
          this.selectedPackageId = this.packages[0]?.id || ''
        }
        setStoredData('rejuve_templates_v4', this.packages)
      }

      // Background API sync if available
      templateApi.delete(id).then(() => {
        this.fetchTemplatesByType(type, { limit: 10 }).catch(() => {})
      }).catch(err => {
        console.warn('Background templateApi.delete failed:', err.message)
      })

      return removed
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
