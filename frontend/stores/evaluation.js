import { defineStore } from 'pinia'
import { mockEvaluations } from '~/mocks/evaluations.js'
import { calculateStars } from '~/utils/star.js'
import { useMissionStore } from './mission.js'
import { useApprovalStore } from './approval.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

/**
 * Evaluation Store: Manages Supervisor Evaluations, Drafts, Multi-Crew Scores, Evidence & Comments
 */

export const useEvaluationStore = defineStore('evaluation', {
  state: () => ({
    evaluations: getStoredData('rejuve_evaluations_v3', mockEvaluations)
  }),

  getters: {
    allEvaluations: (state) => state.evaluations,
    evaluationByMissionId: (state) => (missionId) => state.evaluations.find(e => e.missionId === missionId),
    evaluationById: (state) => (id) => state.evaluations.find(e => e.id === id)
  },

  actions: {
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
