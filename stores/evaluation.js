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

      setStoredData('rejuve_evaluations_v3', this.evaluations)
      return evalItem
    },

    submitEvaluation(payload) {
      const { missionId, supervisorId, supervisorName, crewScores = [], comment, evidence } = payload
      
      const totalScore = crewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
      const avgScore = crewScores.length > 0 ? Math.round(totalScore / crewScores.length) : 0
      const stars = calculateStars(avgScore)

      const formattedCrewScores = crewScores.map(cs => ({
        crewId: cs.crewId,
        score: Number(cs.score) || 0,
        calculatedStars: calculateStars(cs.score)
      }))

      const now = new Date().toISOString()

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

      // 1. Update Mission Store
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(missionId, {
        status: 'PENDING_REVIEW',
        averageScore: avgScore,
        calculatedStars: stars,
        crewScores: formattedCrewScores
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
      const totalScore = crewScores.reduce((acc, cs) => acc + (Number(cs.score) || 0), 0)
      const avgScore = crewScores.length > 0 ? Math.round(totalScore / crewScores.length) : 0
      const stars = calculateStars(avgScore)

      const formattedCrewScores = crewScores.map(cs => ({
        crewId: cs.crewId,
        score: Number(cs.score) || 0,
        calculatedStars: calculateStars(cs.score)
      }))

      const now = new Date().toISOString()
      evalItem.averageScore = avgScore
      evalItem.calculatedStars = stars
      evalItem.crewScores = formattedCrewScores
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
