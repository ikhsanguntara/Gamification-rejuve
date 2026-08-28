import { defineStore } from 'pinia'
import { mockEvaluations } from '~/mocks/evaluations.js'
import { calculateStars } from '~/utils/star.js'
import { useMissionStore } from './mission.js'
import { useApprovalStore } from './approval.js'

/**
 * Evaluation Store: Manages Supervisor Evaluations, Drafts, Multi-Crew Scores, Evidence & Comments
 */

export const useEvaluationStore = defineStore('evaluation', {
  state: () => ({
    evaluations: JSON.parse(JSON.stringify(mockEvaluations))
  }),

  getters: {
    allEvaluations: (state) => state.evaluations,
    evaluationByMissionId: (state) => (missionId) => state.evaluations.find(e => e.missionId === missionId),
    evaluationById: (state) => (id) => state.evaluations.find(e => e.id === id)
  },

  actions: {
    saveDraft(payload) {
      const { missionId, supervisorId, supervisorName, crewScores = [], comment, evidence } = payload
      
      const totalScore = crewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
      const avgScore = crewScores.length > 0 ? Math.round(totalScore / crewScores.length) : 0
      const stars = calculateStars(avgScore)

      const formattedCrewScores = crewScores.map(cs => ({
        crewId: cs.crewId,
        score: Number(cs.score) || 0,
        calculatedStars: calculateStars(cs.score)
      }))

      let evalItem = this.evaluations.find(e => e.missionId === missionId)
      if (evalItem) {
        evalItem.averageScore = avgScore
        evalItem.calculatedStars = stars
        evalItem.crewScores = formattedCrewScores
        evalItem.comment = comment || ''
        evalItem.evidence = evidence || []
        evalItem.status = 'DRAFT'
        evalItem.evaluatedAt = new Date().toISOString()
      } else {
        evalItem = {
          id: `eval-${Date.now()}`,
          missionId,
          supervisorId: supervisorId || 'spv-001',
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

      // Update mission status in mission store
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(missionId, {
        status: 'DRAFT',
        averageScore: avgScore,
        calculatedStars: stars,
        crewScores: formattedCrewScores
      })

      return evalItem
    },

    submitForReview(payload) {
      const { missionId, supervisorId, supervisorName, crewScores = [], comment, evidence } = payload
      const now = new Date().toISOString()

      const totalScore = crewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
      const avgScore = crewScores.length > 0 ? Math.round(totalScore / crewScores.length) : 0
      const stars = calculateStars(avgScore)

      const formattedCrewScores = crewScores.map(cs => ({
        crewId: cs.crewId,
        score: Number(cs.score) || 0,
        calculatedStars: calculateStars(cs.score)
      }))

      let evalItem = this.evaluations.find(e => e.missionId === missionId)
      if (evalItem) {
        evalItem.averageScore = avgScore
        evalItem.calculatedStars = stars
        evalItem.crewScores = formattedCrewScores
        evalItem.comment = comment || ''
        evalItem.evidence = evidence || []
        evalItem.status = 'PENDING_REVIEW'
        evalItem.submittedAt = now
      } else {
        evalItem = {
          id: `eval-${Date.now()}`,
          missionId,
          supervisorId: supervisorId || 'spv-001',
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

      // Sync with mission store
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(missionId, {
        status: 'PENDING_REVIEW',
        averageScore: avgScore,
        calculatedStars: stars,
        crewScores: formattedCrewScores
      })

      // Sync with approval store queue
      const approvalStore = useApprovalStore()
      approvalStore.syncEvaluationToQueue(evalItem)

      return evalItem
    },

    submitEvaluation(payload) {
      return this.submitForReview(payload)
    },

    resubmitEvaluation(evaluationId, { crewScores = [], comment, evidence } = {}) {
      const evalItem = this.evaluations.find(e => e.id === evaluationId)
      if (!evalItem) return null

      const totalScore = crewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
      const avgScore = crewScores.length > 0 ? Math.round(totalScore / crewScores.length) : (evalItem.averageScore || 0)
      const stars = calculateStars(avgScore)
      const now = new Date().toISOString()

      const formattedCrewScores = crewScores.length > 0
        ? crewScores.map(cs => ({
            crewId: cs.crewId,
            score: Number(cs.score) || 0,
            calculatedStars: calculateStars(cs.score)
          }))
        : evalItem.crewScores

      evalItem.averageScore = avgScore
      evalItem.calculatedStars = stars
      evalItem.crewScores = formattedCrewScores
      evalItem.comment = comment
      evalItem.evidence = evidence
      evalItem.status = 'PENDING_REVIEW'
      evalItem.submittedAt = now

      // Mark any pending revision as resolved
      if (evalItem.revisionHistory && evalItem.revisionHistory.length > 0) {
        evalItem.revisionHistory[evalItem.revisionHistory.length - 1].status = 'RESOLVED'
        evalItem.revisionHistory[evalItem.revisionHistory.length - 1].resolvedAt = now
      }

      // Sync with mission store
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(evalItem.missionId, {
        status: 'PENDING_REVIEW',
        averageScore: avgScore,
        calculatedStars: stars,
        crewScores: formattedCrewScores
      })

      // Sync with approval store
      const approvalStore = useApprovalStore()
      approvalStore.syncEvaluationToQueue(evalItem)

      return evalItem
    }
  }
})
