import { defineStore } from 'pinia'
import { mockApprovals } from '~/mocks/approvals.js'
import { useMissionStore } from './mission.js'
import { useEvaluationStore } from './evaluation.js'
import { useGamificationStore } from './gamification.js'
import { useBatchStore } from './batch.js'
import { useUserStore } from './user.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

/**
 * Approval Store: Head Review Workspace (Approve & Request Revision for Store-Wide Multi-Crew Missions)
 */

export const useApprovalStore = defineStore('approval', {
  state: () => ({
    approvals: getStoredData('rejuve_approvals_v3', mockApprovals),
    activities: [
      {
        id: 'act-1',
        actor: 'Ahmad Dahlan (Head)',
        action: 'approved store evaluation for',
        target: 'Cold Storage Chiller Temp & Sensor Audit (2-4°C)',
        details: 'Audit suhu chiller display dan walk-in cold room stabil sempurna.',
        time: 'Just now',
        type: 'award',
        badge: '+Stars Awarded to 6 Crew Members'
      },
      {
        id: 'act-2',
        actor: 'Budi Santoso (Supervisor)',
        action: 'submitted store evaluation for',
        target: 'Cold-Pressed Extraction Ratio & Pure Recipe Quality Audit',
        details: 'Avg Score: 92/100 • 5 Stars Calculated for 6 Crew',
        time: '4 hours ago',
        type: 'submit',
        badge: 'Pending Review'
      },
      {
        id: 'act-3',
        actor: 'Ahmad Dahlan (Head)',
        action: 'requested revision on',
        target: 'Store Front Cleanroom Sanitation & Glass Polish Standards',
        details: 'Mohon lengkapi bukti foto swab test ATP di area prep counter juice.',
        time: '1 day ago',
        type: 'revision',
        badge: 'Revision Required'
      }
    ]
  }),

  getters: {
    userApprovals: (state) => {
      const userStore = useUserStore()
      if (userStore.isSuperadmin) return state.approvals
      if (userStore.isHead) {
        const batchStore = useBatchStore()
        const myBatchIds = batchStore.accessibleBatches.map(b => b.id)
        return state.approvals.filter(a => myBatchIds.includes(a.batchId))
      }
      return state.approvals
    },
    allApprovals: (state) => state.userApprovals,
    allActivities: (state) => state.activities,
    pendingApprovals: (state) => state.userApprovals.filter(a => a.status === 'PENDING_REVIEW'),
    approvedItems: (state) => state.userApprovals.filter(a => a.status === 'APPROVED'),
    revisionRequiredItems: (state) => state.userApprovals.filter(a => a.status === 'REVISION_REQUIRED'),
    approvalById: (state) => (id) => state.approvals.find(a => a.id === id)
  },

  actions: {
    approveMission(approvalId) {
      const item = this.approvals.find(a => a.id === approvalId)
      if (!item) return { success: false, error: 'Approval item not found' }

      const now = new Date().toISOString()
      item.status = 'APPROVED'
      item.reviewedAt = now

      const awardedStars = item.calculatedStars || 5

      // 1. Update Mission
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(item.missionId, {
        status: 'COMPLETED',
        awardedStars,
        crewScores: item.crewScores
      })

      // 2. Update Evaluation
      const evalStore = useEvaluationStore()
      const evalItem = evalStore.evaluations.find(e => e.id === item.evaluationId || e.missionId === item.missionId)
      if (evalItem) {
        evalItem.status = 'APPROVED'
        evalItem.reviewedAt = now
      }

      // 3. Award Stars to ALL Crew in this Mission
      const gamificationStore = useGamificationStore()
      let totalStarsAwardedAll = 0
      const awardedCrewDetails = []

      if (item.crewScores && item.crewScores.length > 0) {
        item.crewScores.forEach(cs => {
          const crewStars = cs.calculatedStars || awardedStars
          const result = gamificationStore.awardStarsToCrew(cs.crewId, crewStars, {
            score: cs.score,
            missionId: item.missionId
          })
          totalStarsAwardedAll += crewStars
          if (result) awardedCrewDetails.push(result)
        })
      }

      // 4. Update Batch Metrics
      const batchStore = useBatchStore()
      batchStore.updateBatchMetrics({
        completedIncrement: 1,
        starsIncrement: totalStarsAwardedAll
      })

      // 5. Prepend to Live Activity Feed
      this.activities.unshift({
        id: `act-${Date.now()}`,
        actor: 'Ahmad Dahlan (Head)',
        action: 'approved store evaluation for',
        target: item.missionTitle,
        details: `Avg Score: ${item.averageScore || item.score}/100 • Awarded Stars to ${item.crewScores?.length || 1} Crew Members`,
        time: 'Just now',
        type: 'award',
        badge: `+${totalStarsAwardedAll} Total Stars Awarded`
      })

      setStoredData('rejuve_approvals_v3', this.approvals)
      return {
        success: true,
        awardedStars,
        totalStarsAwardedAll,
        crewCount: item.crewScores?.length || 0,
        awardedCrewDetails
      }
    },

    requestRevision(approvalId, revisionNote) {
      if (!revisionNote || !revisionNote.trim()) {
        return { success: false, error: 'Revision note is required' }
      }

      const item = this.approvals.find(a => a.id === approvalId)
      if (!item) return { success: false, error: 'Approval item not found' }

      const now = new Date().toISOString()
      item.status = 'REVISION_REQUIRED'
      item.revisionNote = revisionNote.trim()
      item.reviewedAt = now

      // 1. Update Mission
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(item.missionId, {
        status: 'REVISION_REQUIRED',
        crewScores: item.crewScores
      })

      // 2. Update Evaluation and append to revisionHistory
      const evalStore = useEvaluationStore()
      const evalItem = evalStore.evaluations.find(e => e.id === item.evaluationId || e.missionId === item.missionId)
      if (evalItem) {
        evalItem.status = 'REVISION_REQUIRED'
        if (!evalItem.revisionHistory) evalItem.revisionHistory = []
        evalItem.revisionHistory.push({
          id: `rev-${Date.now()}`,
          revisionNumber: evalItem.revisionHistory.length + 1,
          requestedBy: 'Ahmad Dahlan (Head)',
          requestedAt: now,
          note: revisionNote.trim(),
          status: 'PENDING_SUPERVISOR_ACTION'
        })
      }

      // 3. Prepend to Live Activity Feed
      this.activities.unshift({
        id: `act-${Date.now()}`,
        actor: 'Ahmad Dahlan (Head)',
        action: 'requested revision on',
        target: item.missionTitle,
        details: revisionNote.trim(),
        time: 'Just now',
        type: 'revision',
        badge: 'Revision Required'
      })

      setStoredData('rejuve_approvals_v3', this.approvals)
      return {
        success: true,
        missionTitle: item.missionTitle
      }
    },

    syncEvaluationToQueue(evalItem) {
      let item = this.approvals.find(a => a.evaluationId === evalItem.id || a.missionId === evalItem.missionId)
      const missionStore = useMissionStore()
      const mission = missionStore.missionById(evalItem.missionId)
      const gamificationStore = useGamificationStore()

      const populatedCrewScores = (evalItem.crewScores || []).map(cs => {
        const crew = gamificationStore.crewById(cs.crewId)
        return {
          crewId: cs.crewId,
          crewName: crew ? crew.name : 'Crew Member',
          score: cs.score,
          calculatedStars: cs.calculatedStars
        }
      })

      if (item) {
        item.averageScore = evalItem.averageScore
        item.calculatedStars = evalItem.calculatedStars
        item.crewScores = populatedCrewScores
        item.comment = evalItem.comment
        item.evidenceList = evalItem.evidence || []
        item.evidenceCount = (evalItem.evidence || []).length
        item.status = 'PENDING_REVIEW'
        item.submittedAt = evalItem.submittedAt || new Date().toISOString()
      } else {
        item = {
          id: `appr-${Date.now()}`,
          evaluationId: evalItem.id,
          missionId: evalItem.missionId,
          missionCode: mission ? mission.code : 'MSN-00',
          missionTitle: mission ? mission.title : 'Store Mission',
          week: mission ? mission.week : 2,
          batchId: mission ? mission.batchId : 'batch-alpha',
          supervisorId: evalItem.supervisorId,
          supervisorName: evalItem.supervisorName,
          averageScore: evalItem.averageScore,
          calculatedStars: evalItem.calculatedStars,
          crewScores: populatedCrewScores,
          status: 'PENDING_REVIEW',
          comment: evalItem.comment,
          evidenceCount: (evalItem.evidence || []).length,
          evidenceList: evalItem.evidence || [],
          submittedAt: evalItem.submittedAt || new Date().toISOString(),
          reviewedAt: null,
          revisionNote: null
        }
        this.approvals.unshift(item)
      }

      setStoredData('rejuve_approvals_v3', this.approvals)
    }
  }
})
