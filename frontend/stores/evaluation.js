import { defineStore } from 'pinia'
import { calculateStars } from '../utils/star.js'
import { useMissionStore } from './mission.js'
import { useApprovalStore } from './approval.js'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { evaluationApi } from '../services/api.js'

/**
 * Evaluation Store: Manages Supervisor Evaluations, Drafts, Multi-Crew Scores, Evidence & Comments
 */

export const useEvaluationStore = defineStore('evaluation', {
  state: () => ({
    evaluations: getStoredData('rejuve_evaluations_v3', []),
    workstationBatch: null,
    workstationCrews: [],
    selectedCrewMissions: [],
    selectedCrewUser: null,
    isLoadingCrews: false,
    isLoadingMissions: false,
    isSubmitting: false
  }),

  getters: {
    allEvaluations: (state) => state.evaluations,
    evaluationByMissionId: (state) => (missionId) => state.evaluations.find(e => e.missionId === missionId),
    evaluationById: (state) => (id) => state.evaluations.find(e => e.id === id)
  },

  actions: {
    async fetchWorkstationCrews(params = {}) {
      this.isLoadingCrews = true
      try {
        const res = await evaluationApi.getCrews(params)
        if (res && res.data) {
          this.workstationBatch = res.data.batch || null
          this.workstationCrews = Array.isArray(res.data.crews) ? res.data.crews : []
          return res.data
        }
      } catch (err) {
        console.warn('fetchWorkstationCrews failed:', err.message)
      } finally {
        this.isLoadingCrews = false
      }
      return { batch: this.workstationBatch, crews: this.workstationCrews }
    },

    async fetchCrewMissions(userId, params = {}) {
      if (!userId) return null
      this.isLoadingMissions = true
      try {
        const res = await evaluationApi.getCrewMissions(userId, params)
        if (res && res.data) {
          this.selectedCrewUser = res.data.user || null
          this.selectedCrewMissions = Array.isArray(res.data.missions) ? res.data.missions : []
          return res.data
        }
      } catch (err) {
        console.warn('fetchCrewMissions failed:', err.message)
      } finally {
        this.isLoadingMissions = false
      }
      return { user: this.selectedCrewUser, missions: this.selectedCrewMissions }
    },

    async submitSlScoreToApi(userMissionId, payload) {
      this.isSubmitting = true
      try {
        const res = await evaluationApi.submitSlScore(userMissionId, payload)
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
        console.error('submitSlScoreToApi failed:', err)
        throw err
      } finally {
        this.isSubmitting = false
      }
    },

    async submitDmReviewToApi(userMissionId, payload) {
      this.isSubmitting = true
      try {
        const res = await evaluationApi.submitDmReview(userMissionId, payload)
        if (res && res.data) {
          const updated = res.data
          const idx = this.selectedCrewMissions.findIndex(m => m.userMissionId === userMissionId)
          if (idx !== -1) {
            this.selectedCrewMissions[idx] = { ...this.selectedCrewMissions[idx], ...updated }
          }
          return res
        }
      } catch (err) {
        console.error('submitDmReviewToApi failed:', err)
        throw err
      } finally {
        this.isSubmitting = false
      }
    },
    async fetchEvaluationsFromApi() {
      try {
        const res = await evaluationApi.getUserMissions()
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.evaluations = res.data.map(m => {
            const isApproved = m.status === 'APPROVED_BY_DM' || m.status === 'COMPLETED'
            const isPending = m.status === 'SCORED_BY_TL' || m.status === 'PENDING_REVIEW'
            const status = isApproved ? 'APPROVED' : (isPending ? 'PENDING_REVIEW' : 'DRAFT')
            const score = Number(m.tlScore) || Number(m.finalScore) || 85
            return {
              id: `eval-${m.userMissionId}`,
              userMissionId: m.userMissionId,
              missionId: m.missionId,
              missionTitle: m.mission?.missionTitle || 'Evaluasi Standar Operasional',
              supervisorId: m.tlId || 'sl-001',
              supervisorName: m.tl?.name || 'Store Leader',
              averageScore: score,
              calculatedStars: calculateStars(score),
              crewScores: [{
                crewId: m.userId,
                name: m.user?.name || 'Kru Gerai',
                score: score,
                calculatedStars: calculateStars(score)
              }],
              status,
              comment: m.tlNotes || '',
              evidence: m.evidenceUrl ? [{ url: m.evidenceUrl, caption: 'Bukti Foto' }] : [],
              evaluatedAt: m.tlScoredAt || m.createdAt,
              submittedAt: m.tlScoredAt || m.createdAt
            }
          })
          setStoredData('rejuve_evaluations_v3', this.evaluations)
          return this.evaluations
        }
      } catch (err) {
        console.warn('fetchEvaluationsFromApi failed:', err.message)
      }
    },

    saveDraft(payload) {
      const { missionId, supervisorId, supervisorName, crewScores = [], comment, evidence } = payload
      
      const formattedCrewScores = crewScores.map(cs => ({
        crewId: cs.crewId,
        score: Number(cs.score) || 0,
        calculatedStars: calculateStars(cs.score)
      }))

      let evalItem = this.evaluations.find(e => e.missionId === missionId)
      if (evalItem) {
        const mergedCrewScores = [...(evalItem.crewScores || [])]
        formattedCrewScores.forEach(newCs => {
          const idx = mergedCrewScores.findIndex(cs => cs.crewId === newCs.crewId)
          if (idx >= 0) {
            mergedCrewScores[idx] = newCs
          } else {
            mergedCrewScores.push(newCs)
          }
        })
        const totalScore = mergedCrewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
        const avgScore = mergedCrewScores.length > 0 ? Math.round(totalScore / mergedCrewScores.length) : 0
        const stars = calculateStars(avgScore)

        evalItem.averageScore = avgScore
        evalItem.calculatedStars = stars
        evalItem.crewScores = mergedCrewScores
        evalItem.comment = comment || evalItem.comment || ''
        evalItem.evidence = evidence || evalItem.evidence || []
        evalItem.status = 'DRAFT'
        evalItem.evaluatedAt = new Date().toISOString()
      } else {
        const totalScore = formattedCrewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
        const avgScore = formattedCrewScores.length > 0 ? Math.round(totalScore / formattedCrewScores.length) : 0
        const stars = calculateStars(avgScore)

        evalItem = {
          id: `eval-${Date.now()}`,
          missionId,
          supervisorId: supervisorId || 'sl-001',
          supervisorName: supervisorName || 'Budi Santoso',
          averageScore: avgScore,
          calculatedStars: stars,
          crewScores: formattedCrewScores,
          status: 'DRAFT',
          comment: comment || '',
          evidence: evidence || [],
          evaluatedAt: new Date().toISOString(),
          submittedAt: null,
          revisionHistory: []
        }
        this.evaluations.push(evalItem)
      }

      setStoredData('rejuve_evaluations_v3', this.evaluations)
      return evalItem
    },

    submitForReview(payload) {
      const existing = this.evaluations.find(e => e.missionId === payload.missionId)
      if (existing && existing.status === 'REVISION_REQUIRED') {
        return this.resubmitEvaluation(existing.id, payload)
      }
      return this.submitEvaluation(payload)
    },

    submitEvaluation(payload) {
      const { missionId, supervisorId, supervisorName, crewScores = [], comment, evidence } = payload
      
      const formattedCrewScores = crewScores.map(cs => ({
        crewId: cs.crewId,
        score: Number(cs.score) || 0,
        calculatedStars: calculateStars(cs.score)
      }))

      const now = new Date().toISOString()

      let evalItem = this.evaluations.find(e => e.missionId === missionId)
      if (evalItem) {
        const mergedCrewScores = [...(evalItem.crewScores || [])]
        formattedCrewScores.forEach(newCs => {
          const idx = mergedCrewScores.findIndex(cs => cs.crewId === newCs.crewId)
          if (idx >= 0) {
            mergedCrewScores[idx] = newCs
          } else {
            mergedCrewScores.push(newCs)
          }
        })
        const totalScore = mergedCrewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
        const avgScore = mergedCrewScores.length > 0 ? Math.round(totalScore / mergedCrewScores.length) : 0
        const stars = calculateStars(avgScore)

        evalItem.averageScore = avgScore
        evalItem.calculatedStars = stars
        evalItem.crewScores = mergedCrewScores
        evalItem.comment = comment || evalItem.comment || ''
        evalItem.evidence = evidence || evalItem.evidence || []
        evalItem.status = 'PENDING_REVIEW'
        evalItem.submittedAt = now
      } else {
        const totalScore = formattedCrewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
        const avgScore = formattedCrewScores.length > 0 ? Math.round(totalScore / formattedCrewScores.length) : 0
        const stars = calculateStars(avgScore)

        evalItem = {
          id: `eval-${Date.now()}`,
          missionId,
          supervisorId: supervisorId || 'sl-001',
          supervisorName: supervisorName || 'Budi Santoso',
          averageScore: avgScore,
          calculatedStars: stars,
          crewScores: formattedCrewScores,
          status: 'PENDING_REVIEW',
          comment: comment || '',
          evidence: evidence || [],
          evaluatedAt: now,
          submittedAt: now,
          revisionHistory: []
        }
        this.evaluations.push(evalItem)
      }

      // 1. Update Mission Store
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(missionId, {
        status: 'PENDING_REVIEW',
        averageScore: evalItem.averageScore,
        calculatedStars: evalItem.calculatedStars,
        crewScores: evalItem.crewScores
      })

      // 2. Add / Update in Approval Queue
      const approvalStore = useApprovalStore()
      approvalStore.syncEvaluationToQueue(evalItem)

      // Sync ke backend REST API jika ada userMissionId
      const targetUserMissionId = evalItem.userMissionId || payload.userMissionId
      if (targetUserMissionId) {
        evaluationApi.submitSlScore(targetUserMissionId, {
          score: evalItem.averageScore,
          notes: evalItem.comment || 'Penilaian oleh Store Leader',
          evidenceUrl: evalItem.evidence?.[0]?.url || null,
          tlScore: evalItem.averageScore,
          tlNotes: evalItem.comment || 'Penilaian oleh Store Leader'
        }).catch(e => console.warn('API sync submitSlScore notice:', e.message))
      }

      setStoredData('rejuve_evaluations_v3', this.evaluations)
      return evalItem
    },

    resubmitEvaluation(evalId, payload) {
      let evalItem = this.evaluations.find(e => e.id === evalId || e.missionId === evalId)
      if (!evalItem) {
        return this.submitEvaluation(payload)
      }

      const { crewScores = [], comment, evidence } = payload
      const formattedCrewScores = crewScores.map(cs => ({
        crewId: cs.crewId,
        score: Number(cs.score) || 0,
        calculatedStars: calculateStars(cs.score)
      }))

      const mergedCrewScores = [...(evalItem.crewScores || [])]
      formattedCrewScores.forEach(newCs => {
        const idx = mergedCrewScores.findIndex(cs => cs.crewId === newCs.crewId)
        if (idx >= 0) {
          mergedCrewScores[idx] = newCs
        } else {
          mergedCrewScores.push(newCs)
        }
      })
      const totalScore = mergedCrewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
      const avgScore = mergedCrewScores.length > 0 ? Math.round(totalScore / mergedCrewScores.length) : 0
      const stars = calculateStars(avgScore)

      const now = new Date().toISOString()
      evalItem.averageScore = avgScore
      evalItem.calculatedStars = stars
      evalItem.crewScores = mergedCrewScores
      evalItem.comment = comment || evalItem.comment
      evalItem.evidence = evidence || evalItem.evidence
      evalItem.status = 'PENDING_REVIEW'
      evalItem.submittedAt = now

      // Mark the latest revision request as resolved by supervisor
      if (evalItem.revisionHistory && evalItem.revisionHistory.length > 0) {
        const lastRev = evalItem.revisionHistory[evalItem.revisionHistory.length - 1]
        lastRev.status = 'RESOLVED'
        lastRev.resolvedAt = now
      }

      // 1. Update Mission Store
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(evalItem.missionId, {
        status: 'PENDING_REVIEW',
        averageScore: avgScore,
        calculatedStars: stars,
        crewScores: formattedCrewScores
      })

      // 2. Sync to Approval Queue
      const approvalStore = useApprovalStore()
      approvalStore.syncEvaluationToQueue(evalItem)

      setStoredData('rejuve_evaluations_v3', this.evaluations)
      return evalItem
    }
  }
})
