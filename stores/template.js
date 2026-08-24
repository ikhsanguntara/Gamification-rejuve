import { defineStore } from 'pinia'
import { mockMissionTemplates, mockTemplatePackages } from '~/mocks/templates.js'
import { useMissionStore } from './mission.js'
import { useBatchStore } from './batch.js'
import { useGamificationStore } from './gamification.js'

/**
 * Template Store: Manage Master Mission Presets and 1-Click Batch Generator
 */

export const useTemplateStore = defineStore('template', {
  state: () => ({
    packages: JSON.parse(JSON.stringify(mockTemplatePackages)),
    templates: JSON.parse(JSON.stringify(mockMissionTemplates))
  }),

  getters: {
    allPackages: (state) => state.packages,
    allTemplates: (state) => state.templates,
    templatesByWeek: (state) => (weekNumber) => state.templates.filter(t => t.week === Number(weekNumber)),
    templateById: (state) => (id) => state.templates.find(t => t.id === id),
    packageById: (state) => (id) => state.packages.find(p => p.id === id)
  },

  actions: {
    /**
     * Apply an entire 3-week package (12 missions) to a target batch in 1 click!
     */
    applyPackageToBatch(batchId, packageId = 'pkg-rejuve-standard') {
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

      this.templates.forEach((tmpl, idx) => {
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
          supervisorId: 'spv-001',
          createdAt: new Date().toISOString()
        }

        missionStore.missions.push(newMission)
        createdMissions.push(newMission)
      })

      // Update batch totalMissions count
      if (batch) {
        batch.totalMissions = missionStore.missionsByBatch(batchId).length
      }

      return createdMissions
    },

    /**
     * Create a new custom template
     */
    createTemplate(payload) {
      const id = `tmpl-${Date.now()}`
      const newTmpl = {
        id,
        week: Number(payload.week) || 1,
        codePrefix: payload.codePrefix || `W${payload.week || 1}-CUSTOM`,
        title: payload.title,
        category: payload.category || 'Quality Control',
        description: payload.description || '',
        requirements: payload.requirements || ['Pemeriksaan standar operasional prosedur'],
        maxStars: 5
      }

      this.templates.push(newTmpl)
      return newTmpl
    },

    /**
     * Update an existing template
     */
    updateTemplate(id, payload) {
      const tmpl = this.templates.find(t => t.id === id)
      if (!tmpl) return null
      Object.assign(tmpl, payload)
      return tmpl
    },

    /**
     * Delete a template
     */
    deleteTemplate(id) {
      const idx = this.templates.findIndex(t => t.id === id)
      if (idx !== -1) {
        return this.templates.splice(idx, 1)[0]
      }
      return null
    }
  }
})
