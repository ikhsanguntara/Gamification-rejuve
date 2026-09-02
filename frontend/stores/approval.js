import { defineStore } from 'pinia'
import { mockApprovals } from '~/mocks/approvals.js'
import { useMissionStore } from './mission.js'
import { useEvaluationStore } from './evaluation.js'
import { useGamificationStore } from './gamification.js'
import { useBatchStore } from './batch.js'
import { useUserStore } from './user.js'
import { calculateStars } from '~/utils/star.js'
import { getStoredData, setStoredData } from '~/utils/storage.js'

/**
 * Approval Store: District Manager Review Workspace (Approve with Option to Adjust Score)
 */

export const useApprovalStore = defineStore('approval', {
  state: () => ({
    approvals: getStoredData('rejuve_approvals_v3', mockApprovals),
    activities: [
      {
        id: 'act-1',
        actor: 'District Manager',
        action: 'approved store evaluation for',
        target: 'Andi Pratama - Cek Suhu Chiller (2-4°C)',
        details: 'Audit suhu chiller stabil sempurna.',
        time: 'Just now',
        type: 'award',
        badge: '+5 Stars Awarded'
      }
    ]
  }),

  getters: {
    userApprovals: (state) => {
      const userStore = useUserStore()
      if (userStore.isSuperadmin) return state.approvals
      if (userStore.isHead || userStore.isDistrictManager) {
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
    approveMission(approvalId, overridePayload = {}) {
      const item = this.approvals.find(a => a.id === approvalId)
      if (!item) return { success: false, error: 'Approval item not found' }

      const now = new Date().toISOString()

      // Calculate Final Score: (Nilai SL + Nilai DM) / 2
      const slScore = Number(item.slScore ?? item.originalScore ?? item.score ?? item.averageScore ?? 90)
      let dmScore = slScore

      if (overridePayload.dmScore !== undefined && overridePayload.dmScore !== null) {
        dmScore = Math.min(100, Math.max(0, Number(overridePayload.dmScore)))
      } else if (overridePayload.score !== undefined && overridePayload.score !== null) {
        dmScore = Math.min(100, Math.max(0, Number(overridePayload.score)))
      }

      // Rumus: (SL + DM) / 2
      const finalScore = Math.round((slScore + dmScore) / 2)
      const finalStars = calculateStars(finalScore)

      item.slScore = slScore
      item.dmScore = dmScore
      item.originalScore = slScore
      item.score = finalScore
      item.averageScore = finalScore
      item.calculatedStars = finalStars
      item.isAdjustedByDm = dmScore !== slScore

      if (overridePayload.dmNote !== undefined) {
        item.dmNote = overridePayload.dmNote
      }

      item.status = 'APPROVED'
      item.reviewedAt = now

      const awardedStars = finalStars

      // 1. Update Mission
      const missionStore = useMissionStore()
      missionStore.updateMissionStatus(item.missionId, {
        status: 'COMPLETED',
        awardedStars,
        crewScores: item.crewId ? [{ crewId: item.crewId, score: finalScore }] : item.crewScores
      })

      // 2. Update Evaluation
      const evalStore = useEvaluationStore()
      const evalItem = evalStore.evaluations.find(e => e.id === item.evaluationId || e.missionId === item.missionId)
      if (evalItem) {
        evalItem.status = 'APPROVED'
        evalItem.reviewedAt = now
        evalItem.averageScore = finalScore
        evalItem.calculatedStars = finalStars
        if (item.dmNote) evalItem.dmNote = item.dmNote
      }

      // 3. Award Stars to specific Crew Member
      const gamificationStore = useGamificationStore()
      let totalStarsAwardedAll = 0
      const awardedCrewDetails = []

      if (item.crewId) {
        const result = gamificationStore.awardStarsToCrew(item.crewId, awardedStars, {
          score: finalScore,
          missionId: item.missionId,
          missionTitle: item.missionTitle
        })
        totalStarsAwardedAll = awardedStars
        if (result) awardedCrewDetails.push(result)
      } else if (item.crewScores && item.crewScores.length > 0) {
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
      const adjustInfo = item.isAdjustedByDm ? ` (Rata-rata SL: ${slScore} + DM: ${dmScore} / 2 = ${finalScore})` : ` (Skor: ${finalScore})`
      this.activities.unshift({
        id: `act-${Date.now()}`,
        actor: 'District Manager',
        action: 'approved evaluation for',
        target: `${item.crewName || 'Crew'} - ${item.missionTitle}`,
        details: `Skor Akhir: ${finalScore}/100${adjustInfo} • +${totalStarsAwardedAll} ⭐ Bintang dicairkan`,
        time: 'Baru saja',
        type: 'award',
        badge: `+${totalStarsAwardedAll} Bintang`
      })

      setStoredData('rejuve_approvals_v3', this.approvals)
      return {
        success: true,
        awardedStars,
        totalStarsAwardedAll,
        crewName: item.crewName || 'Crew',
        isAdjustedByDm: item.isAdjustedByDm,
        slScore,
        dmScore,
        finalScore,
        score: finalScore,
        crewCount: item.crewId ? 1 : (item.crewScores?.length || 0),
        awardedCrewDetails
      }
    },

    bulkApprove(approvalIds = []) {
      if (!approvalIds || approvalIds.length === 0) return { success: false, approvedCount: 0 }
      
      let approvedCount = 0
      let totalStarsAwarded = 0

      approvalIds.forEach(id => {
        const item = this.approvals.find(a => a.id === id && a.status === 'PENDING_REVIEW')
        if (item) {
          const res = this.approveMission(item.id)
          if (res.success) {
            approvedCount++
            totalStarsAwarded += res.totalStarsAwardedAll || 0
          }
        }
      })

      setStoredData('rejuve_approvals_v3', this.approvals)
      return {
        success: true,
        approvedCount,
        totalStarsAwarded
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
      const missionStore = useMissionStore()
      const mission = missionStore.missionById(evalItem.missionId)
      const gamificationStore = useGamificationStore()
      const batchStore = useBatchStore()
      const targetBatch = batchStore.batchById(mission ? mission.batchId : 'batch-alpha')

      const crewScores = evalItem.crewScores && evalItem.crewScores.length > 0 
        ? evalItem.crewScores 
        : [{ crewId: evalItem.crewId, score: evalItem.averageScore || 90, calculatedStars: evalItem.calculatedStars || 5 }]

      crewScores.forEach(cs => {
        const crew = gamificationStore.crewById(cs.crewId)
        let item = this.approvals.find(a => 
          (a.missionId === evalItem.missionId && a.crewId === cs.crewId) ||
          (a.evaluationId === evalItem.id && a.crewId === cs.crewId)
        )

        if (item) {
          item.score = cs.score
          item.averageScore = cs.score
          item.calculatedStars = cs.calculatedStars || 5
          item.comment = evalItem.comment
          item.evidenceList = evalItem.evidence || []
          item.evidenceCount = (evalItem.evidence || []).length
          item.status = 'PENDING_REVIEW'
          item.supervisorName = evalItem.supervisorName || 'Store Leader'
          item.submittedAt = evalItem.submittedAt || new Date().toISOString()
        } else {
          item = {
            id: `appr-${evalItem.missionId}-${cs.crewId}`,
            evaluationId: evalItem.id,
            missionId: evalItem.missionId,
            missionCode: mission ? mission.code : 'MSN-00',
            missionTitle: mission ? mission.title : 'Misi Operasional',
            missionCategory: mission ? mission.category : 'SOP Gerai',
            week: mission ? mission.week : 1,
            batchId: mission ? mission.batchId : 'batch-alpha',
            batchName: targetBatch ? targetBatch.name : 'Batch Gerai',
            supervisorId: evalItem.supervisorId,
            supervisorName: evalItem.supervisorName || 'Store Leader',
            crewId: cs.crewId,
            crewName: crew ? crew.name : (cs.crewName || 'Crew Member'),
            crewAvatar: crew ? crew.avatar : '',
            crewRole: crew ? crew.position : 'Barista',
            score: cs.score,
            averageScore: cs.score,
            calculatedStars: cs.calculatedStars || 5,
            crewScores: [cs],
            status: 'PENDING_REVIEW',
            comment: evalItem.comment,
            evidenceCount: (evalItem.evidence || []).length,
            evidenceList: evalItem.evidence || [],
            submittedAt: evalItem.submittedAt || new Date().toISOString(),
            reviewedAt: null
          }
          this.approvals.unshift(item)
        }
      })

      setStoredData('rejuve_approvals_v3', this.approvals)
    }
  }
})
