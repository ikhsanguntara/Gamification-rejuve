import { defineStore } from 'pinia'
import { useMissionStore } from './mission.js'
import { useEvaluationStore } from './evaluation.js'
import { useGamificationStore } from './gamification.js'
import { useBatchStore } from './batch.js'
import { useUserStore } from './user.js'
import { calculateStars, calculateAverageDmSl } from '../utils/star.js'
import { getStoredData, setStoredData } from '../utils/storage.js'
import { evaluationApi } from '../services/api.js'
import { buildPrismaQuery } from '../utils/queryBuilder.js'
import { cachedApiCall, invalidateApiCache } from '../utils/apiCache.js'

/**
 * Approval Store: District Manager Review Workspace (Approve with Option to Adjust Score)
 */

export const useApprovalStore = defineStore('approval', {
  state: () => ({
    approvals: getStoredData('rejuve_approvals_v4', []),
    serverPagination: {
      total: 0,
      page: 1,
      limit: 9,
      totalPages: 1
    },
    activities: []
  }),

  getters: {
    userApprovals: (state) => {
      const all = state.approvals || []
      const userStore = useUserStore()
      if (userStore.isSuperadmin) return all
      if (userStore.isHead || userStore.isDistrictManager) {
        const batchStore = useBatchStore()
        const myBatchIds = (batchStore.accessibleBatches || []).map(b => b.id)
        const filtered = all.filter(a => myBatchIds.includes(a.batchId))
        return filtered.length > 0 ? filtered : all
      }
      return all
    },
    allApprovals: (state) => state.userApprovals || [],
    allActivities: (state) => state.activities || [],
    pendingApprovals: (state) => (state.userApprovals || []).filter(a => a.status === 'PENDING_REVIEW'),
    approvedItems: (state) => (state.userApprovals || []).filter(a => a.status === 'APPROVED'),
    revisionRequiredItems: (state) => (state.userApprovals || []).filter(a => a.status === 'REVISION_REQUIRED'),
    approvalById: (state) => (id) => (state.approvals || []).find(a => a.id === id)
  },

  actions: {
    async fetchApprovalsFromApi(params = {}, forceRefresh = false) {
      try {
        const inList = {}
        const exact = {
          'mission.type': 'JOURNEY'
        }

        if (params.status && params.status !== 'ALL') {
          exact.status = params.status
        } else {
          inList.status = ['SCORED_BY_TL', 'REVISED_BY_DM', 'APPROVED_BY_DM']
        }

        const query = buildPrismaQuery({
          page: params.page || 1,
          limit: params.limit || 50,
          exact,
          inList
        })

        const cacheKey = `approvals:${JSON.stringify(query)}`
        const res = await cachedApiCall(cacheKey, () => evaluationApi.getUserMissions(query), 15000, forceRefresh)
        if (res && res.data && Array.isArray(res.data)) {
          // Filter ketat: Hanya misi JOURNEY yang statusnya siap di-review DM atau sudah disetujui
          const eligibleMissions = res.data.filter(m => {
            const isJourney = !m.mission?.type || m.mission.type === 'JOURNEY'
            const isPendingDm = ['SCORED_BY_TL', 'REVISED_BY_DM', 'PENDING_REVIEW'].includes(m.status)
            const isApprovedDm = ['APPROVED_BY_DM', 'APPROVED'].includes(m.status)
            return isJourney && (isPendingDm || isApprovedDm)
          })

          this.approvals = eligibleMissions.map(m => {
            const isApproved = m.status === 'APPROVED_BY_DM' || m.status === 'APPROVED'
            const status = isApproved ? 'APPROVED' : 'PENDING_REVIEW'
            const slScore = m.tlScore !== null && m.tlScore !== undefined ? Number(m.tlScore) : 0
            const dmScore = m.dmScore !== null && m.dmScore !== undefined ? Number(m.dmScore) : slScore
            const avgCalc = calculateAverageDmSl(slScore, dmScore)
            const finalScore = m.finalScore !== null && m.finalScore !== undefined
              ? Number(m.finalScore)
              : (isApproved ? avgCalc.avgScore : slScore)
            const stars = isApproved ? avgCalc.stars : calculateStars(slScore)

            return {
              id: m.userMissionId,
              userMissionId: m.userMissionId,
              evaluationId: `eval-${m.userMissionId}`,
              batchId: m.mission?.batchId || '',
              batchName: m.mission?.batch?.name || 'Batch Operasional',
              missionId: m.missionId,
              missionTitle: m.mission?.missionTitle || 'Evaluasi Standar Operasional',
              missionCategory: m.mission?.category || 'TECHNICAL',
              week: m.mission?.weekOrDayNumber || 1,
              crewId: m.userId,
              crewName: m.user?.name || 'Kru Gerai',
              crewAvatar: m.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.user?.name || 'crew')}`,
              crewRole: m.user?.position || 'Crew Specialist',
              storeLocation: m.user?.department?.departmentName || m.user?.storeLocation || 'Gerai Re.juve',
              supervisorId: m.tlId || '',
              supervisorName: m.tl?.name || 'Store Leader',
              slScore,
              dmScore,
              score: finalScore,
              averageScore: finalScore,
              calculatedStars: stars,
              status,
              submittedAt: m.tlScoredAt || m.createdAt,
              reviewedAt: m.dmReviewedAt,
              comment: m.tlNotes || 'Standar operasional telah diverifikasi.',
              evidence: m.evidenceUrl ? [{ url: m.evidenceUrl, caption: 'Bukti Foto Operasional' }] : []
            }
          })

          const meta = res.meta || res.pagination || {}
          this.serverPagination = {
            total: meta.total !== undefined ? meta.total : eligibleMissions.length,
            page: meta.page || params.page || 1,
            limit: meta.limit || params.limit || 50,
            totalPages: meta.totalPages || 1
          }

          return this.approvals
        }
      } catch (err) {
        console.warn('fetchApprovalsFromApi failed:', err.message)
      }
    },

    approveMission(approvalId, overridePayload = {}) {
      const item = this.approvals.find(a => a.id === approvalId)
      if (!item) return { success: false, error: 'Approval item not found' }

      const now = new Date().toISOString()

      // Calculate Final Score: Nilai Gabungan Rata-rata (SL + DM) / 2
      const slScore = Number(item.slScore ?? item.originalScore ?? item.score ?? item.averageScore ?? 90)
      let dmScore = slScore

      if (overridePayload.dmScore !== undefined && overridePayload.dmScore !== null) {
        dmScore = Math.min(100, Math.max(0, Number(overridePayload.dmScore)))
      } else if (overridePayload.score !== undefined && overridePayload.score !== null) {
        dmScore = Math.min(100, Math.max(0, Number(overridePayload.score)))
      }

      // Rumus Resmi Average DM + SL:
      const avgCalc = calculateAverageDmSl(slScore, dmScore)
      const finalScore = avgCalc.avgScore
      const finalStars = avgCalc.stars

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

      // Sync ke backend REST API jika ada userMissionId
      if (item.userMissionId) {
        evaluationApi.submitDmReview(item.userMissionId, {
          action: 'APPROVE',
          score: finalScore,
          notes: item.dmNote || 'Disetujui oleh District Manager',
          dmScore: finalScore,
          dmNotes: item.dmNote || 'Disetujui oleh District Manager'
        }).catch(e => console.warn('API sync submitDmReview notice:', e.message))
      }

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
      const adjustInfo = item.isAdjustedByDm ? ` (Rata-rata SL: ${slScore} + DM: ${dmScore} = ${finalScore})` : ` (Skor: ${finalScore})`
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

      setStoredData('rejuve_approvals_v4', this.approvals)
      invalidateApiCache('approvals')
      invalidateApiCache('leaderboard')
      invalidateApiCache('batches')
      invalidateApiCache('missions')
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

      setStoredData('rejuve_approvals_v4', this.approvals)
      invalidateApiCache('approvals')
      invalidateApiCache('missions')
      return {
        success: approvedCount > 0,
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

      // Sync ke backend REST API
      if (item.userMissionId) {
        evaluationApi.submitDmReview(item.userMissionId, {
          action: 'REVISE',
          notes: revisionNote.trim(),
          dmNotes: revisionNote.trim()
        }).catch(e => console.warn('API sync revise notice:', e.message))
      }

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
          requestedBy: 'District Manager',
          requestedAt: now,
          note: revisionNote.trim(),
          status: 'PENDING_SUPERVISOR_ACTION'
        })
      }

      // 3. Prepend to Live Activity Feed
      this.activities.unshift({
        id: `act-${Date.now()}`,
        actor: 'District Manager',
        action: 'requested revision on',
        target: item.missionTitle,
        details: revisionNote.trim(),
        time: 'Just now',
        type: 'revision',
        badge: 'Revision Required'
      })

      setStoredData('rejuve_approvals_v4', this.approvals)
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
      const targetBatch = batchStore.batchById(mission?.batchId || '')

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
            batchId: mission?.batchId || (targetBatch ? targetBatch.id : ''),
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

      setStoredData('rejuve_approvals_v4', this.approvals)
    }
  }
})
