import { defineStore } from 'pinia'
import { reportApi } from '../services/api.js'
import { useUserStore } from './user.js'
import { useBatchStore } from './batch.js'
import { useStoreStore } from './store.js'

/**
 * Helper Universal untuk men-download blob/file di Browser
 */
export function downloadFileBlob(blobData, defaultFilename = 'Laporan_Rejuve.xlsx') {
  if (typeof window === 'undefined') return true
  try {
    let blob = blobData
    if (!(blob instanceof Blob)) {
      blob = new Blob([blobData], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      })
    }
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.setAttribute('download', defaultFilename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    return true
  } catch (err) {
    console.error('downloadFileBlob error:', err)
    throw err
  }
}

export const useReportStore = defineStore('report', {
  state: () => ({
    // 1. Data Rekapitulasi Insentif Buddy
    buddyIncentives: [],
    buddyPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    },
    selectedBuddyDetail: null,

    // 2. Data Audit Traceability Kru / Active New Recruit
    userTraceability: [],
    traceabilityPagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    },
    selectedTraceabilityDetail: null,

    // 3. UI & Filter State
    activeTab: 'buddy-incentive', // 'buddy-incentive' | 'user-traceability'
    filters: {
      batchId: '',
      departmentId: '',
      storeId: '',
      status: '',
      stageId: '',
      search: ''
    },
    isLoading: false,
    isLoadingDetail: false,
    isExporting: false,
    exportingTarget: null
  }),

  getters: {
    // Statistik Ringkasan Insentif Buddy
    buddySummaryStats: (state) => {
      const items = state.buddyIncentives || []
      const totalBuddies = items.length
      const totalMentees = items.reduce((acc, curr) => acc + (Number(curr.totalMentees) || Number(curr.menteeCount) || 0), 0)
      const passedMentees = items.reduce((acc, curr) => acc + (Number(curr.passedMentees) || Number(curr.graduatedCount) || 0), 0)
      const totalIncentiveAmount = items.reduce((acc, curr) => acc + (Number(curr.totalIncentive) || Number(curr.estimatedIncentive) || 0), 0)
      const passRate = totalMentees > 0 ? Math.round((passedMentees / totalMentees) * 100) : 0

      return {
        totalBuddies,
        totalMentees,
        passedMentees,
        totalIncentiveAmount,
        passRate
      }
    },

    // Statistik Ringkasan Audit Traceability Kru
    traceabilitySummaryStats: (state) => {
      const items = state.userTraceability || []
      const totalCrews = items.length
      const completedCrews = items.filter(c => c.status === 'COMPLETED' || c.status === 'GRADUATED' || c.progress === 100).length
      const activeCrews = items.filter(c => c.status === 'ACTIVE' || c.status === 'IN_PROGRESS' || (c.progress > 0 && c.progress < 100)).length
      const atRiskCrews = items.filter(c => c.status === 'AT_RISK' || c.status === 'REVISION_REQUIRED').length
      const avgScore = totalCrews > 0
        ? Math.round(items.reduce((acc, c) => acc + (Number(c.avgScore) || Number(c.score) || 0), 0) / totalCrews)
        : 0

      return {
        totalCrews,
        completedCrews,
        activeCrews,
        atRiskCrews,
        avgScore
      }
    }
  },

  actions: {
    /**
     * Set / Update parameter filter
     */
    setFilter(key, value) {
      this.filters[key] = value
    },

    /**
     * Reset semua filter ke default
     */
    resetFilters() {
      this.filters = {
        batchId: '',
        departmentId: '',
        storeId: '',
        status: '',
        stageId: '',
        search: ''
      }
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 1. REKAPITULASI INSENTIF BUDDY
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Fetch daftar rekapitulasi insentif buddy dari API
     */
    async fetchBuddyIncentives(customParams = {}) {
      this.isLoading = true
      try {
        const queryParams = {
          batchId: customParams.batchId ?? (this.filters.batchId || undefined),
          departmentId: customParams.departmentId ?? (this.filters.departmentId || undefined),
          storeId: customParams.storeId ?? (this.filters.storeId || undefined),
          page: customParams.page ?? this.buddyPagination.page,
          limit: customParams.limit ?? this.buddyPagination.limit,
          search: customParams.search ?? (this.filters.search || undefined)
        }

        const res = await reportApi.getBuddyIncentives(queryParams)
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.items || res.data.rows || [])
          this.buddyIncentives = list
          if (res.data.pagination || res.pagination) {
            const p = res.data.pagination || res.pagination
            this.buddyPagination = {
              page: Number(p.page || 1),
              limit: Number(p.limit || 10),
              total: Number(p.total || list.length),
              totalPages: Number(p.totalPages || Math.ceil((p.total || list.length) / (p.limit || 10)) || 1)
            }
          } else {
            this.buddyPagination.total = list.length
            this.buddyPagination.totalPages = Math.ceil(list.length / this.buddyPagination.limit) || 1
          }
          return res.data
        }

        // Fallback reaktif jika data API kosong / offline
        this.generateFallbackBuddyIncentives()
        return this.buddyIncentives
      } catch (err) {
        console.warn('fetchBuddyIncentives API error, using reactive fallback:', err.message)
        this.generateFallbackBuddyIncentives()
        return this.buddyIncentives
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch detail laporan insentif 1 buddy
     */
    async fetchBuddyIncentiveDetail(userId, customParams = {}) {
      if (!userId) return null
      this.isLoadingDetail = true
      try {
        const params = {
          batchId: customParams.batchId ?? (this.filters.batchId || undefined)
        }
        const res = await reportApi.getBuddyIncentiveDetail(userId, params)
        if (res && res.data) {
          this.selectedBuddyDetail = res.data
          return res.data
        }
        this.generateFallbackBuddyDetail(userId)
        return this.selectedBuddyDetail
      } catch (err) {
        console.warn('fetchBuddyIncentiveDetail API error, using fallback:', err.message)
        this.generateFallbackBuddyDetail(userId)
        return this.selectedBuddyDetail
      } finally {
        this.isLoadingDetail = false
      }
    },

    /**
     * Ekspor spreadsheet Excel Rekapitulasi Insentif Buddy (.xlsx)
     */
    async exportBuddyIncentives(customParams = {}) {
      this.isExporting = true
      this.exportingTarget = 'buddy-all'
      try {
        const queryParams = {
          batchId: customParams.batchId ?? (this.filters.batchId || undefined),
          departmentId: customParams.departmentId ?? (this.filters.departmentId || undefined),
          storeId: customParams.storeId ?? (this.filters.storeId || undefined),
          search: customParams.search ?? (this.filters.search || undefined)
        }

        const dateStr = new Date().toISOString().slice(0, 10)
        const filename = `Laporan_Rekapitulasi_Insentif_Buddy_${dateStr}.xlsx`

        const res = await reportApi.exportBuddyIncentives(queryParams)
        downloadFileBlob(res, filename)
        return true
      } catch (err) {
        console.error('exportBuddyIncentives error:', err)
        throw err
      } finally {
        this.isExporting = false
        this.exportingTarget = null
      }
    },

    /**
     * Ekspor spreadsheet Excel Riwayat Insentif 1 Buddy Terpilih (.xlsx)
     */
    async exportBuddyIncentiveDetail(userId, customParams = {}) {
      if (!userId) return false
      this.isExporting = true
      this.exportingTarget = `buddy-${userId}`
      try {
        const params = {
          batchId: customParams.batchId ?? (this.filters.batchId || undefined)
        }

        const dateStr = new Date().toISOString().slice(0, 10)
        const filename = `Laporan_Insentif_Buddy_${userId}_${dateStr}.xlsx`

        const res = await reportApi.exportBuddyIncentiveDetail(userId, params)
        downloadFileBlob(res, filename)
        return true
      } catch (err) {
        console.error('exportBuddyIncentiveDetail error:', err)
        throw err
      } finally {
        this.isExporting = false
        this.exportingTarget = null
      }
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 2. AUDIT TRACEABILITY PENGGUNA (ACTIVE NEW RECRUIT)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Fetch daftar audit traceability pengguna dari API
     */
    async fetchUserTraceability(customParams = {}) {
      this.isLoading = true
      try {
        const queryParams = {
          batchId: customParams.batchId ?? (this.filters.batchId || undefined),
          departmentId: customParams.departmentId ?? (this.filters.departmentId || undefined),
          storeId: customParams.storeId ?? (this.filters.storeId || undefined),
          status: customParams.status ?? (this.filters.status || undefined),
          stageId: customParams.stageId ?? (this.filters.stageId || undefined),
          page: customParams.page ?? this.traceabilityPagination.page,
          limit: customParams.limit ?? this.traceabilityPagination.limit,
          search: customParams.search ?? (this.filters.search || undefined)
        }

        const res = await reportApi.getUserTraceability(queryParams)
        if (res && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.items || res.data.rows || [])
          this.userTraceability = list
          if (res.data.pagination || res.pagination) {
            const p = res.data.pagination || res.pagination
            this.traceabilityPagination = {
              page: Number(p.page || 1),
              limit: Number(p.limit || 10),
              total: Number(p.total || list.length),
              totalPages: Number(p.totalPages || Math.ceil((p.total || list.length) / (p.limit || 10)) || 1)
            }
          } else {
            this.traceabilityPagination.total = list.length
            this.traceabilityPagination.totalPages = Math.ceil(list.length / this.traceabilityPagination.limit) || 1
          }
          return res.data
        }

        this.generateFallbackTraceability()
        return this.userTraceability
      } catch (err) {
        console.warn('fetchUserTraceability API error, using fallback:', err.message)
        this.generateFallbackTraceability()
        return this.userTraceability
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Fetch detail audit traceability 1 pengguna lengkap
     */
    async fetchUserTraceabilityDetail(userId) {
      if (!userId) return null
      this.isLoadingDetail = true
      try {
        const res = await reportApi.getUserTraceabilityDetail(userId)
        if (res && res.data) {
          this.selectedTraceabilityDetail = res.data
          return res.data
        }
        this.generateFallbackTraceabilityDetail(userId)
        return this.selectedTraceabilityDetail
      } catch (err) {
        console.warn('fetchUserTraceabilityDetail API error, using fallback:', err.message)
        this.generateFallbackTraceabilityDetail(userId)
        return this.selectedTraceabilityDetail
      } finally {
        this.isLoadingDetail = false
      }
    },

    /**
     * Ekspor spreadsheet Excel Active New Recruit Report (.xlsx)
     */
    async exportUserTraceability(customParams = {}) {
      this.isExporting = true
      this.exportingTarget = 'traceability-all'
      try {
        const queryParams = {
          batchId: customParams.batchId ?? (this.filters.batchId || undefined),
          departmentId: customParams.departmentId ?? (this.filters.departmentId || undefined),
          storeId: customParams.storeId ?? (this.filters.storeId || undefined),
          status: customParams.status ?? (this.filters.status || undefined),
          stageId: customParams.stageId ?? (this.filters.stageId || undefined),
          search: customParams.search ?? (this.filters.search || undefined)
        }

        const dateStr = new Date().toISOString().slice(0, 10)
        const filename = `Active_New_Recruit_Traceability_Report_${dateStr}.xlsx`

        const res = await reportApi.exportUserTraceability(queryParams)
        downloadFileBlob(res, filename)
        return true
      } catch (err) {
        console.error('exportUserTraceability error:', err)
        throw err
      } finally {
        this.isExporting = false
        this.exportingTarget = null
      }
    },

    /**
     * Ekspor spreadsheet Excel Kartu Audit Traceability 1 Kru Terpilih (.xlsx)
     */
    async exportUserTraceabilityDetail(userId) {
      if (!userId) return false
      this.isExporting = true
      this.exportingTarget = `traceability-${userId}`
      try {
        const dateStr = new Date().toISOString().slice(0, 10)
        const filename = `Kartu_Audit_Traceability_Kru_${userId}_${dateStr}.xlsx`

        const res = await reportApi.exportUserTraceabilityDetail(userId)
        downloadFileBlob(res, filename)
        return true
      } catch (err) {
        console.error('exportUserTraceabilityDetail error:', err)
        throw err
      } finally {
        this.isExporting = false
        this.exportingTarget = null
      }
    },

    // ──────────────────────────────────────────────────────────────────────────
    // 3. GENERATOR DATA CADANGAN (FALLBACK DEMO & OFFLINE RESILIENCE)
    // ──────────────────────────────────────────────────────────────────────────

    generateFallbackBuddyIncentives() {
      const userStore = useUserStore()
      const batchStore = useBatchStore()
      const storeStore = useStoreStore()

      const slBuddies = (userStore.allUsers || []).filter(u =>
        u.role === 'STORE_LEADER' || u.role === 'SUPERVISOR' || u.isBuddy === true
      )

      const activeBatchName = batchStore.currentBatch?.name || 'Batch 1 - Q1 2026'

      this.buddyIncentives = slBuddies.map((buddy, idx) => {
        const mentees = (userStore.allUsers || []).filter(u =>
          u.role === 'CREW' && (u.buddyId === buddy.id || u.storeLocation === buddy.storeLocation || idx === 0)
        )
        const totalMentees = Math.max(mentees.length, idx === 0 ? 3 : 2)
        const passedMentees = Math.max(1, totalMentees - (idx % 2 === 0 ? 0 : 1))
        const inProgressMentees = totalMentees - passedMentees
        const avgScore = 88 + (idx % 8)
        
        const baseRate = 250000
        const totalIncentive = (passedMentees * baseRate) + (avgScore >= 90 ? passedMentees * 100000 : 0)

        const storeInfo = (storeStore.allStores || []).find(s => s.name === buddy.storeLocation || s.id === buddy.storeId)

        return {
          userId: buddy.id,
          name: buddy.name,
          nik: buddy.nik || `NIK-${1000 + idx}`,
          avatar: buddy.avatar || buddy.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          storeName: buddy.storeLocation || storeInfo?.name || 'Grand Indonesia',
          storeCode: storeInfo?.code || `STR-${100 + idx}`,
          batchName: activeBatchName,
          totalMentees,
          passedMentees,
          inProgressMentees,
          avgScore,
          ratePerMentee: baseRate,
          totalIncentive,
          status: passedMentees === totalMentees ? 'READY_PAYOUT' : 'IN_PROGRESS',
          verifiedByDm: true
        }
      })

      this.buddyPagination.total = this.buddyIncentives.length
      this.buddyPagination.totalPages = Math.ceil(this.buddyIncentives.length / this.buddyPagination.limit) || 1
    },

    generateFallbackBuddyDetail(userId) {
      const userStore = useUserStore()
      const buddy = (userStore.allUsers || []).find(u => u.id === userId) || {
        id: userId,
        name: 'Store Leader Buddy',
        nik: 'NIK-1001',
        storeLocation: 'Grand Indonesia'
      }

      const crewMentees = (userStore.allUsers || [])
        .filter(u => u.role === 'CREW')
        .slice(0, 4)
        .map((crew, cIdx) => ({
          userId: crew.id,
          name: crew.name,
          nik: crew.nik || `CREW-${200 + cIdx}`,
          startDate: '2026-02-01',
          preBatchScore: 92 - cIdx * 3,
          preBatchStatus: cIdx < 3 ? 'KOMPETEN' : 'BUTUH_PENDAMPINGAN',
          journeyScore: 88 + cIdx * 2,
          currentStage: cIdx < 3 ? 'Stage 3 - Finished' : 'Stage 2 - On Going',
          isGraduated: cIdx < 3,
          incentiveEarned: cIdx < 3 ? 350000 : 0
        }))

      const totalEarned = crewMentees.reduce((acc, c) => acc + c.incentiveEarned, 0)

      this.selectedBuddyDetail = {
        buddyInfo: {
          id: buddy.id,
          name: buddy.name,
          nik: buddy.nik || 'NIK-1001',
          role: 'Store Leader / Buddy',
          storeName: buddy.storeLocation || 'Grand Indonesia',
          email: buddy.email || 'sl@rejuve.co.id',
          phone: buddy.phone || '081234567890'
        },
        batchName: 'Batch 1 - Q1 2026',
        totalMentees: crewMentees.length,
        graduatedCount: crewMentees.filter(c => c.isGraduated).length,
        totalIncentive: totalEarned,
        payoutStatus: 'VERIFIED_BY_DM',
        mentees: crewMentees
      }
    },

    generateFallbackTraceability(userId) {
      const userStore = useUserStore()
      const batchStore = useBatchStore()
      const storeStore = useStoreStore()

      const crews = (userStore.allUsers || []).filter(u => u.role === 'CREW')
      const activeBatchName = batchStore.currentBatch?.name || 'Batch 1 - Q1 2026'

      this.userTraceability = crews.map((crew, idx) => {
        const store = (storeStore.allStores || []).find(s => s.name === crew.storeLocation)
        const buddy = (userStore.allUsers || []).find(u => u.id === crew.buddyId || u.isBuddy) || { name: 'Budi Santoso' }

        const stages = ['Pre-Start (3 Hari)', 'Stage 1 (Basic)', 'Stage 2 (Mastery)', 'Stage 3 (Excellence)']
        const stageIndex = (idx % 4)
        const currentStage = stages[stageIndex]
        const progress = stageIndex === 3 ? 100 : Math.round(((stageIndex + 1) / 4) * 100)
        const avgScore = 84 + (idx % 12)
        const status = progress === 100 ? 'COMPLETED' : (avgScore < 80 ? 'AT_RISK' : 'ACTIVE')

        return {
          userId: crew.id,
          name: crew.name,
          nik: crew.nik || `CRW-${1000 + idx}`,
          avatar: crew.avatar || crew.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
          storeName: crew.storeLocation || store?.name || 'Grand Indonesia',
          batchName: activeBatchName,
          joinDate: '2026-02-01',
          buddyName: buddy.name,
          currentStage,
          progress,
          avgScore,
          missionsCompleted: `${(stageIndex + 1) * 3}/12`,
          status,
          dmApprovalStatus: progress === 100 ? 'APPROVED' : 'IN_PROGRESS'
        }
      })

      this.traceabilityPagination.total = this.userTraceability.length
      this.traceabilityPagination.totalPages = Math.ceil(this.userTraceability.length / this.traceabilityPagination.limit) || 1
    },

    generateFallbackTraceabilityDetail(userId) {
      const userStore = useUserStore()
      const crew = (userStore.allUsers || []).find(u => u.id === userId) || {
        id: userId,
        name: 'Andi Pratama',
        nik: 'CRW-1001',
        storeLocation: 'Grand Indonesia',
        email: 'andi.pratama@rejuve.co.id'
      }

      this.selectedTraceabilityDetail = {
        userInfo: {
          id: crew.id,
          name: crew.name,
          nik: crew.nik || 'CRW-1001',
          role: 'CREW / New Recruit',
          storeName: crew.storeLocation || 'Grand Indonesia',
          email: crew.email || 'crew@rejuve.co.id',
          phone: crew.phone || '081234567890',
          joinDate: '2026-02-01',
          batchName: 'Batch 1 - Q1 2026',
          mentorName: 'Budi Santoso (Store Leader)'
        },
        auditTimeline: [
          {
            stageNumber: 0,
            title: 'Pra-Start 3 Hari (Rapor Evaluasi Buddy)',
            score: 92,
            evaluator: 'Budi Santoso (Store Leader)',
            status: 'KOMPETEN',
            completedAt: '2026-02-03',
            notes: 'Menguasai 7 pilar kompetensi dasar Re.juve dengan baik.'
          },
          {
            stageNumber: 1,
            title: 'Stage 1: Basic Preparation & Hygiene',
            score: 88,
            missionsCount: 4,
            evaluator: 'Budi Santoso (SL) & Ahmad Dahlan (DM)',
            status: 'APPROVED',
            completedAt: '2026-02-10',
            notes: 'Lolos checklist SOP kebersihan & standard grooming.'
          },
          {
            stageNumber: 2,
            title: 'Stage 2: Product Knowledge & Cold-Pressed Mastery',
            score: 90,
            missionsCount: 4,
            evaluator: 'Budi Santoso (SL) & Ahmad Dahlan (DM)',
            status: 'APPROVED',
            completedAt: '2026-02-17',
            notes: 'Hafal takaran formula & SOP perlakuan buah segar.'
          },
          {
            stageNumber: 3,
            title: 'Stage 3: Customer Service & Store Excellence',
            score: 94,
            missionsCount: 4,
            evaluator: 'Budi Santoso (SL) & Ahmad Dahlan (DM)',
            status: 'APPROVED',
            completedAt: '2026-02-24',
            notes: 'Keramahan dan ketelitian transaksi kasir sangat memuaskan.'
          },
          {
            stageNumber: 4,
            title: 'Pasca-Finish: Feedback Pengalaman Onboarding',
            score: 10,
            surveyScore: '10/10 Rata-rata Kepuasan',
            status: 'SUBMITTED',
            completedAt: '2026-02-28',
            notes: 'Kru merasa didukung penuh oleh Buddy dan tim gerai.'
          }
        ],
        overallStatus: 'GRADUATED_WITH_HONORS',
        finalScore: 91,
        totalStars: 45
      }
    }
  }
})
