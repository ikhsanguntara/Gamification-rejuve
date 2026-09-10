'use strict';

/**
 * @file dashboard.controller.js
 * @description Controller untuk agregasi metrik Dashboard multi-role (Crew, Store Leader, District Manager, Superadmin/Head).
 */

const prisma = require('../../config/db');
const batchService = require('../batches/batch.service');
const { STAR_LEVEL_THRESHOLDS } = require('../gamification/gamification.service');
const { sendSuccess, sendError } = require('../../utils/responseWrapper');

/**
 * GET /api/dashboard/summary
 * Mengembalikan metrik dashboard sesuai role pengguna aktif.
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || req.user?.userId;
    const userRole = req.user?.role || 'CREW';

    const currentUser = await prisma.user.findUnique({
      where: { userId: currentUserId },
      include: {
        role: true,
        department: true,
        activeBatch: {
          include: {
            details: {
              include: { tplMission: true }
            }
          }
        },
        batch: {
          include: {
            details: {
              include: { tplMission: true }
            }
          }
        }
      }
    });

    if (!currentUser) {
      return sendError(res, {
        message: 'Pengguna tidak ditemukan.',
        statusCode: 404
      });
    }

    // Tentukan batch aktif
    let targetBatchId = req.query.batchId || currentUser.activeBatchId || currentUser.batchId;
    let targetBatch = null;

    if (targetBatchId) {
      targetBatch = await prisma.batch.findUnique({
        where: { batchId: targetBatchId },
        include: {
          details: {
            include: { tplMission: true }
          }
        }
      });
    }

    if (!targetBatch) {
      const availBatches = await batchService.getUserAvailableBatches(currentUser);
      targetBatch = availBatches.find(b => b.status === 'OPEN') || availBatches[0] || null;
      if (targetBatch) {
        targetBatchId = targetBatch.batchId;
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. Role CREW Dashboard Summary
    // ──────────────────────────────────────────────────────────────────────────
    if (userRole === 'CREW') {
      const myUserMissions = targetBatchId
        ? await prisma.userMission.findMany({
            where: {
              userId: currentUserId,
              mission: { batchId: targetBatchId }
            },
            include: { mission: true }
          })
        : [];

      const totalMissions = myUserMissions.length;
      const completedMissions = myUserMissions.filter(m => m.status === 'COMPLETED').length;
      const progressPercent = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

      const scoredMissions = myUserMissions.filter(m => m.finalScore !== null || m.tlScore !== null);
      const totalScoreSum = scoredMissions.reduce((acc, m) => acc + (m.finalScore ?? m.tlScore ?? 0), 0);
      const averageScore = scoredMissions.length > 0 ? parseFloat((totalScoreSum / scoredMissions.length).toFixed(1)) : 0;

      // Hitung rank di gerai (toko)
      let rankInStore = 1;
      let storeTotalCrews = 1;
      if (currentUser.departmentId) {
        const storeCrews = await prisma.user.findMany({
          where: {
            role: { roleCode: 'CREW' },
            departmentId: currentUser.departmentId,
            isActive: true
          },
          select: { userId: true, stars: true, points: true },
          orderBy: [{ stars: 'desc' }, { points: 'desc' }]
        });
        storeTotalCrews = storeCrews.length;
        const sIndex = storeCrews.findIndex(c => c.userId === currentUserId);
        rankInStore = sIndex !== -1 ? sIndex + 1 : 1;
      }

      // Hitung rank di batch
      let rankInBatch = 1;
      let batchTotalCrews = 1;
      let topThree = [];
      if (targetBatchId) {
        const batchCrews = await prisma.user.findMany({
          where: {
            role: { roleCode: 'CREW' },
            isActive: true,
            OR: [
              { batchId: targetBatchId },
              { activeBatchId: targetBatchId }
            ]
          },
          select: {
            userId: true,
            name: true,
            stars: true,
            points: true,
            level: true,
            department: {
              select: { departmentName: true, departmentCode: true }
            }
          },
          orderBy: [{ stars: 'desc' }, { points: 'desc' }, { name: 'asc' }]
        });

        batchTotalCrews = batchCrews.length;
        const bIndex = batchCrews.findIndex(c => c.userId === currentUserId);
        rankInBatch = bIndex !== -1 ? bIndex + 1 : 1;

        topThree = batchCrews.slice(0, 3).map((c, idx) => ({
          rank: idx + 1,
          userId: c.userId,
          name: c.name,
          stars: c.stars,
          points: c.points,
          level: c.level,
          departmentName: c.department?.departmentName || 'Gerai Re.juve'
        }));
      }

      // Breakdown Phase Status
      const buddyMissions = myUserMissions.filter(m => m.mission?.type === 'BUDDY');
      const journeyMissions = myUserMissions.filter(m => m.mission?.type === 'JOURNEY');
      const feedbackMissions = myUserMissions.filter(m => m.mission?.type === 'FEEDBACK');

      const buddyDetail = targetBatch?.details?.find(d => d.tplMission?.type === 'BUDDY');
      const journeyDetail = targetBatch?.details?.find(d => d.tplMission?.type === 'JOURNEY');
      const feedbackDetail = targetBatch?.details?.find(d => d.tplMission?.type === 'FEEDBACK');

      const phases = {
        buddy: {
          isLock: buddyDetail?.isLock ?? false,
          status: buddyMissions.length > 0 && buddyMissions.every(m => m.status === 'COMPLETED') ? 'COMPLETED' : 'ACTIVE',
          totalCount: buddyMissions.length,
          completedCount: buddyMissions.filter(m => m.status === 'COMPLETED').length
        },
        journey: {
          isLock: journeyDetail?.isLock ?? true,
          status: journeyDetail?.isLock ? 'LOCKED' : (journeyMissions.every(m => m.status === 'COMPLETED') ? 'COMPLETED' : 'ACTIVE'),
          currentWeek: targetBatch?.currentWeek || 1,
          totalCount: journeyMissions.length,
          completedCount: journeyMissions.filter(m => m.status === 'COMPLETED').length
        },
        feedback: {
          isLock: feedbackDetail?.isLock ?? true,
          status: feedbackMissions.some(m => m.status === 'COMPLETED') ? 'COMPLETED' : (feedbackDetail?.isLock ? 'LOCKED' : 'ACTIVE'),
          isSubmitted: feedbackMissions.some(m => m.status === 'COMPLETED')
        }
      };

      const levelInfo = STAR_LEVEL_THRESHOLDS.find(t => t.level === currentUser.level) || { title: 'Novice Crew' };

      return sendSuccess(res, {
        message: 'Ringkasan dashboard Crew berhasil diambil.',
        data: {
          role: 'CREW',
          user: {
            userId: currentUser.userId,
            name: currentUser.name,
            email: currentUser.email,
            stars: currentUser.stars,
            points: currentUser.points,
            level: currentUser.level,
            levelTitle: levelInfo.title,
            departmentName: currentUser.department?.departmentName || 'Gerai Re.juve',
            hasClaimedEarlyBird: currentUser.hasClaimedEarlyBird
          },
          batch: targetBatch ? {
            batchId: targetBatch.batchId,
            name: targetBatch.name,
            code: targetBatch.code,
            currentWeek: targetBatch.currentWeek,
            status: targetBatch.status
          } : null,
          metrics: {
            myStars: currentUser.stars,
            myPoints: currentUser.points,
            myLevel: currentUser.level,
            rankInStore,
            storeTotalCrews,
            rankInBatch,
            batchTotalCrews,
            totalMissions,
            completedMissions,
            progressPercent,
            averageScore
          },
          phases,
          topThree
        }
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 2. Role STORE_LEADER / BUDDY Dashboard Summary
    // ──────────────────────────────────────────────────────────────────────────
    if (userRole === 'STORE_LEADER' || currentUser.isBuddy) {
      const slDept = currentUser.department;

      // Mentee yang dibimbing oleh SL/Buddy ini
      const mentees = await prisma.user.findMany({
        where: {
          role: { roleCode: 'CREW' },
          OR: [
            { userBuddyId: currentUserId },
            { missions: { some: { tlId: currentUserId } } }
          ]
        },
        select: { userId: true, name: true, email: true, stars: true }
      });

      // Kru toko
      const storeCrews = slDept
        ? await prisma.user.findMany({
            where: {
              role: { roleCode: 'CREW' },
              departmentId: slDept.departmentId,
              isActive: true
            },
            select: {
              userId: true,
              name: true,
              email: true,
              stars: true,
              points: true,
              level: true
            },
            orderBy: [{ stars: 'desc' }, { points: 'desc' }]
          })
        : mentees;

      const menteeIds = mentees.map(m => m.userId);
      const storeCrewIds = storeCrews.map(c => c.userId);

      // Hitung pending evaluasi Buddy (misi bertipe BUDDY yang status ACTIVE untuk mentee SL)
      const pendingBuddyEvaluations = await prisma.userMission.count({
        where: {
          userId: { in: menteeIds.length > 0 ? menteeIds : ['00000000-0000-0000-0000-000000000000'] },
          mission: {
            type: 'BUDDY',
            ...(targetBatchId ? { batchId: targetBatchId } : {})
          },
          status: 'ACTIVE'
        }
      });

      // Hitung pending evaluasi Journey (misi JOURNEY yang status ACTIVE untuk kru toko)
      const pendingJourneyEvaluations = await prisma.userMission.count({
        where: {
          userId: { in: storeCrewIds.length > 0 ? storeCrewIds : ['00000000-0000-0000-0000-000000000000'] },
          mission: {
            type: 'JOURNEY',
            ...(targetBatchId ? { batchId: targetBatchId } : {})
          },
          status: 'ACTIVE'
        }
      });

      // Evaluasi selesai
      const completedEvaluations = await prisma.userMission.count({
        where: {
          tlId: currentUserId,
          status: { in: ['COMPLETED', 'APPROVED_BY_DM', 'SCORED_BY_TL'] }
        }
      });

      const totalStoreStars = storeCrews.reduce((acc, c) => acc + (c.stars || 0), 0);

      // Rata-rata nilai toko
      const storeEvaluations = await prisma.userMission.findMany({
        where: {
          userId: { in: storeCrewIds.length > 0 ? storeCrewIds : ['00000000-0000-0000-0000-000000000000'] },
          tlScore: { not: null }
        },
        select: { tlScore: true, finalScore: true }
      });

      const avgStoreScore = storeEvaluations.length > 0
        ? parseFloat((storeEvaluations.reduce((acc, e) => acc + (e.finalScore ?? e.tlScore ?? 0), 0) / storeEvaluations.length).toFixed(1))
        : 0;

      const topThreeStore = storeCrews.slice(0, 3).map((c, idx) => ({
        rank: idx + 1,
        userId: c.userId,
        name: c.name,
        stars: c.stars,
        points: c.points,
        level: c.level
      }));

      return sendSuccess(res, {
        message: 'Ringkasan dashboard Store Leader berhasil diambil.',
        data: {
          role: 'STORE_LEADER',
          store: slDept ? {
            departmentId: slDept.departmentId,
            departmentName: slDept.departmentName,
            departmentCode: slDept.departmentCode
          } : null,
          batch: targetBatch ? {
            batchId: targetBatch.batchId,
            name: targetBatch.name,
            code: targetBatch.code,
            currentWeek: targetBatch.currentWeek,
            status: targetBatch.status
          } : null,
          metrics: {
            totalMentees: mentees.length,
            totalStoreCrews: storeCrews.length,
            pendingBuddyEvaluations,
            pendingJourneyEvaluations,
            completedEvaluations,
            averageStoreScore: avgStoreScore,
            totalStoreStars
          },
          topThree: topThreeStore
        }
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 3. Role DISTRICT_MANAGER Dashboard Summary
    // ──────────────────────────────────────────────────────────────────────────
    if (userRole === 'DISTRICT_MANAGER') {
      const dmDepts = await prisma.department.findMany({
        where: { userDmId: currentUserId },
        select: { departmentId: true, departmentName: true, departmentCode: true }
      });
      const dmDeptIds = dmDepts.map(d => d.departmentId);

      const districtCrews = await prisma.user.findMany({
        where: {
          role: { roleCode: 'CREW' },
          departmentId: { in: dmDeptIds.length > 0 ? dmDeptIds : ['00000000-0000-0000-0000-000000000000'] },
          isActive: true
        },
        select: { userId: true, departmentId: true, stars: true }
      });
      const districtCrewIds = districtCrews.map(c => c.userId);

      const pendingApprovals = await prisma.userMission.count({
        where: {
          userId: { in: districtCrewIds.length > 0 ? districtCrewIds : ['00000000-0000-0000-0000-000000000000'] },
          status: 'SCORED_BY_TL'
        }
      });

      const approvedEvaluations = await prisma.userMission.count({
        where: {
          userId: { in: districtCrewIds.length > 0 ? districtCrewIds : ['00000000-0000-0000-0000-000000000000'] },
          status: { in: ['APPROVED_BY_DM', 'COMPLETED'] }
        }
      });

      const revisedEvaluations = await prisma.userMission.count({
        where: {
          userId: { in: districtCrewIds.length > 0 ? districtCrewIds : ['00000000-0000-0000-0000-000000000000'] },
          status: 'REVISED_BY_DM'
        }
      });

      const scoredMissions = await prisma.userMission.findMany({
        where: {
          userId: { in: districtCrewIds.length > 0 ? districtCrewIds : ['00000000-0000-0000-0000-000000000000'] },
          finalScore: { not: null }
        },
        select: { finalScore: true }
      });

      const districtAverageScore = scoredMissions.length > 0
        ? parseFloat((scoredMissions.reduce((acc, m) => acc + (m.finalScore || 0), 0) / scoredMissions.length).toFixed(1))
        : 0;

      return sendSuccess(res, {
        message: 'Ringkasan dashboard District Manager berhasil diambil.',
        data: {
          role: 'DISTRICT_MANAGER',
          district: {
            totalStores: dmDepts.length,
            stores: dmDepts
          },
          batch: targetBatch ? {
            batchId: targetBatch.batchId,
            name: targetBatch.name,
            code: targetBatch.code,
            currentWeek: targetBatch.currentWeek,
            status: targetBatch.status
          } : null,
          metrics: {
            totalStores: dmDepts.length,
            totalCrews: districtCrews.length,
            pendingApprovals,
            approvedEvaluations,
            revisedEvaluations,
            districtAverageScore
          }
        }
      });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 4. Role SUPERADMIN / HEAD Dashboard Summary
    // ──────────────────────────────────────────────────────────────────────────
    const [
      activeBatchesCount,
      totalCrewsCount,
      totalEvaluatorsCount,
      pendingApprovalsCount,
      allScoredMissions
    ] = await Promise.all([
      prisma.batch.count({ where: { status: 'OPEN' } }),
      prisma.user.count({ where: { role: { roleCode: 'CREW' }, isActive: true } }),
      prisma.user.count({ where: { role: { roleCode: { in: ['STORE_LEADER', 'DISTRICT_MANAGER'] } }, isActive: true } }),
      prisma.userMission.count({ where: { status: { in: ['SCORED_BY_TL', 'ACTIVE'] } } }),
      prisma.userMission.findMany({
        where: { finalScore: { not: null } },
        select: { finalScore: true }
      })
    ]);

    const overallAverageScore = allScoredMissions.length > 0
      ? parseFloat((allScoredMissions.reduce((acc, m) => acc + (m.finalScore || 0), 0) / allScoredMissions.length).toFixed(1))
      : 0;

    return sendSuccess(res, {
      message: 'Ringkasan dashboard Administrator berhasil diambil.',
      data: {
        role: userRole,
        metrics: {
          activeBatchesCount,
          totalCrewsCount,
          totalEvaluatorsCount,
          pendingApprovalsCount,
          overallAverageScore
        },
        batch: targetBatch ? {
          batchId: targetBatch.batchId,
          name: targetBatch.name,
          code: targetBatch.code,
          currentWeek: targetBatch.currentWeek,
          status: targetBatch.status
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
