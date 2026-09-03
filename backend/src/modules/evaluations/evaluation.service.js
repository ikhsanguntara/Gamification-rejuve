'use strict';

/**
 * @file evaluation.service.js
 * @description Service layer untuk Alur Evaluasi Terpadu & Workstation Kru:
 *   - Workstation Crews list (sidebar dengan status Belum Dinilai / Selesai)
 *   - Crew Missions detail per batch & week saat card kru diklik
 *   - Buddy Evaluation (dinilai oleh Buddy) -> COMPLETED (tanpa bintang profil)
 *   - Journey Evaluation (dinilai oleh Store Leader) -> SCORED_BY_TL
 *   - District Manager Review (Approve / Revise / Reject) -> APPROVED_BY_DM + Kalkulasi Bintang & Poin Desimal (Journey Only)
 *   - Feedback Submission (diisi oleh Crew) -> COMPLETED
 */

const prisma = require('../../config/db');
const gamificationService = require('../gamification/gamification.service');
const { parsePrismaQuery } = require('../../utils/queryParser');
const { emitToUser, emitToRole } = require('../../utils/socketEmitter');

/**
 * Ambil daftar user missions dengan dynamic query filter.
 */
const getUserMissions = async (query = {}, currentUser = null) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const queryClone = { ...query };
  delete queryClone.page;
  delete queryClone.limit;

  const where = parsePrismaQuery(queryClone, ['submissionNotes', 'tlNotes', 'dmNotes']);

  // Jika batchId tidak ditentukan secara eksplisit di query, gunakan activeBatchId user jika ada
  if (!query.batchId && !where.mission?.batchId && currentUser?.activeBatchId) {
    where.mission = where.mission || {};
    where.mission.batchId = currentUser.activeBatchId;
  }

  const [total, userMissions] = await Promise.all([
    prisma.userMission.count({ where }),
    prisma.userMission.findMany({
      where,
      skip,
      take: limit,
      include: {
        mission: true,
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
            stars: true,
            points: true,
            level: true,
            department: true
          }
        },
        tl: {
          select: { userId: true, name: true, email: true }
        },
        dm: {
          select: { userId: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { userMissions, total, page, limit };
};

/**
 * Ambil detail user mission berdasarkan ID.
 */
const getUserMissionById = async (userMissionId) => {
  const data = await prisma.userMission.findUnique({
    where: { userMissionId },
    include: {
      mission: {
        include: { batch: true, batchDetail: true }
      },
      user: {
        select: {
          userId: true,
          name: true,
          email: true,
          stars: true,
          points: true,
          level: true,
          isBuddy: true,
          department: true,
          userBuddy: {
            select: { userId: true, name: true, email: true }
          }
        }
      },
      tl: { select: { userId: true, name: true, email: true } },
      dm: { select: { userId: true, name: true, email: true } }
    }
  });

  return data;
};

/**
 * GET /api/evaluations/crews
 * Mengambil daftar Crew untuk sidebar workstation evaluasi (SL / DM / Buddy).
 * Menyertakan summary progress: totalMissionsCount, evaluatedCount, status (NEEDS_SCORING / COMPLETED), dan avgScore.
 */
const getWorkstationCrews = async (currentUser, query = {}) => {
  // 1. Resolve Active Batch
  let batchId = query.batchId || currentUser?.activeBatchId;
  if (!batchId) {
    const openBatch = await prisma.batch.findFirst({
      where: { status: 'OPEN' },
      orderBy: { startDate: 'desc' }
    });
    batchId = openBatch ? openBatch.batchId : null;
  }

  if (!batchId) {
    return {
      batch: null,
      crews: []
    };
  }

  const batch = await prisma.batch.findUnique({
    where: { batchId },
    select: {
      batchId: true,
      code: true,
      name: true,
      status: true,
      currentWeek: true,
      startDate: true,
      endDate: true
    }
  });

  const weekNumber = query.week ? parseInt(query.week, 10) : (batch?.currentWeek || 1);
  const missionType = query.type ? query.type.toUpperCase() : 'JOURNEY';

  // 2. Filter Departemen berdasarkan Role Pengguna
  const userRole = currentUser?.role?.roleCode || currentUser?.role || 'SUPERADMIN';
  const whereCrew = {
    role: { roleCode: 'CREW' },
    isActive: true
  };

  if (userRole === 'STORE_LEADER' && currentUser.departmentId) {
    whereCrew.departmentId = currentUser.departmentId;
  } else if (userRole === 'DISTRICT_MANAGER') {
    const depts = await prisma.department.findMany({
      where: {
        OR: [
          { userDmId: currentUser.userId },
          ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
        ]
      },
      select: { departmentId: true }
    });
    const deptIds = depts.map(d => d.departmentId);
    if (deptIds.length > 0) {
      whereCrew.departmentId = { in: deptIds };
    }
  } else if (query.departmentId) {
    whereCrew.departmentId = query.departmentId;
  }

  // Jika query search ada
  const search = query.search || query.q;
  if (search && typeof search === 'string' && search.trim()) {
    const s = search.trim();
    whereCrew.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { email: { contains: s, mode: 'insensitive' } }
    ];
  }

  // 3. Ambil seluruh Crew yang relevan
  const crews = await prisma.user.findMany({
    where: whereCrew,
    select: {
      userId: true,
      name: true,
      email: true,
      stars: true,
      points: true,
      level: true,
      isBuddy: true,
      departmentId: true,
      department: {
        select: {
          departmentId: true,
          departmentCode: true,
          departmentName: true
        }
      },
      batchId: true
    },
    orderBy: { name: 'asc' }
  });

  if (crews.length === 0) {
    return {
      batch,
      week: weekNumber,
      type: missionType,
      crews: []
    };
  }

  const crewIds = crews.map(c => c.userId);

  // 4. Ambil User Missions untuk seluruh Crew ini pada batch dan week terpilih
  const missionFilter = {
    userId: { in: crewIds },
    mission: {
      batchId,
      type: missionType,
      ...(missionType === 'JOURNEY' ? { weekOrDayNumber: weekNumber } : {})
    }
  };

  const userMissions = await prisma.userMission.findMany({
    where: missionFilter,
    select: {
      userMissionId: true,
      userId: true,
      status: true,
      tlScore: true,
      dmScore: true,
      finalScore: true,
      stars: true,
      mission: {
        select: {
          missionId: true,
          missionTitle: true,
          weekOrDayNumber: true,
          type: true
        }
      }
    }
  });

  // Group missions by userId
  const missionsByCrew = {};
  for (const m of userMissions) {
    if (!missionsByCrew[m.userId]) missionsByCrew[m.userId] = [];
    missionsByCrew[m.userId].push(m);
  }

  // 5. Susun array Crew dengan metrics kartu evaluasi
  const crewRoster = crews.map(crew => {
    const crewMissions = missionsByCrew[crew.userId] || [];
    const totalMissionsCount = crewMissions.length;

    // Hitung berapa misi yang sudah dinilai
    const evaluatedMissions = crewMissions.filter(m => m.status !== 'LOCKED' && m.status !== 'ACTIVE');
    const evaluatedCount = evaluatedMissions.length;

    // Tentukan status badge kartu
    let status = 'NEEDS_SCORING';
    if (totalMissionsCount > 0 && evaluatedCount >= totalMissionsCount) {
      status = 'COMPLETED';
    }

    // Hitung rata-rata skor pekan ini
    const scoredMissions = crewMissions.filter(m => m.finalScore !== null || m.tlScore !== null);
    let avgScore = 0;
    if (scoredMissions.length > 0) {
      const totalScore = scoredMissions.reduce((acc, m) => {
        const val = m.finalScore !== null ? m.finalScore : m.tlScore;
        return acc + (Number(val) || 0);
      }, 0);
      avgScore = parseFloat((totalScore / scoredMissions.length).toFixed(1));
    }

    // Total stars perolehan pekan ini
    const starsEarned = crewMissions.reduce((acc, m) => acc + (Number(m.stars) || 0), 0);

    return {
      userId: crew.userId,
      name: crew.name,
      email: crew.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(crew.name)}`,
      position: 'Crew Specialist',
      level: crew.level,
      stars: crew.stars,
      points: crew.points,
      storeLocation: crew.department?.departmentName || 'Standby Gerai',
      departmentCode: crew.department?.departmentCode,
      departmentId: crew.departmentId,
      totalMissionsCount,
      evaluatedCount,
      status,
      avgScore,
      starsEarned: parseFloat(starsEarned.toFixed(1))
    };
  });

  return {
    batch,
    week: weekNumber,
    type: missionType,
    crews: crewRoster
  };
};

/**
 * GET /api/evaluations/crews/:userId/missions
 * Mengambil seluruh kartu misi kru tertentu saat card di sidebar diklik.
 */
const getCrewMissions = async (targetUserId, currentUser, query = {}) => {
  // 1. Resolve Active Batch
  let batchId = query.batchId || currentUser?.activeBatchId;
  if (!batchId) {
    const targetUser = await prisma.user.findUnique({
      where: { userId: targetUserId },
      select: { batchId: true, activeBatchId: true }
    });
    batchId = targetUser?.batchId || targetUser?.activeBatchId;
  }

  if (!batchId) {
    const openBatch = await prisma.batch.findFirst({
      where: { status: 'OPEN' },
      orderBy: { startDate: 'desc' }
    });
    batchId = openBatch ? openBatch.batchId : null;
  }

  const where = {
    userId: targetUserId,
    mission: {
      batchId
    }
  };

  if (query.week) {
    where.mission.weekOrDayNumber = parseInt(query.week, 10);
  }

  if (query.type) {
    where.mission.type = query.type.toUpperCase();
  }

  const [user, missions] = await Promise.all([
    prisma.user.findUnique({
      where: { userId: targetUserId },
      select: {
        userId: true,
        name: true,
        email: true,
        stars: true,
        points: true,
        level: true,
        department: true
      }
    }),
    prisma.userMission.findMany({
      where,
      include: {
        mission: true,
        tl: { select: { userId: true, name: true, email: true } },
        dm: { select: { userId: true, name: true, email: true } }
      },
      orderBy: [
        { mission: { weekOrDayNumber: 'asc' } },
        { mission: { createdAt: 'asc' } }
      ]
    })
  ]);

  if (!user) {
    throw new Error(`User dengan ID "${targetUserId}" tidak ditemukan.`);
  }

  return {
    user,
    batchId,
    week: query.week ? parseInt(query.week, 10) : null,
    totalMissions: missions.length,
    missions
  };
};

/**
 * Penilaian Misi BUDDY oleh Buddy / Store Captain.
 * Langsung berstatus COMPLETED. Murni rapor kelulusan (tanpa penambahan bintang profil).
 */
const evaluateBuddyMission = async (userMissionId, evaluatorId, { score, notes, evidenceUrl }) => {
  const userMission = await prisma.userMission.findUnique({
    where: { userMissionId },
    include: {
      mission: true,
      user: {
        include: { userBuddy: true, department: true }
      }
    }
  });

  if (!userMission) {
    throw new Error(`User mission dengan id "${userMissionId}" tidak ditemukan.`);
  }

  if (userMission.mission.type !== 'BUDDY') {
    throw new Error('Misi ini bukan bertipe BUDDY.');
  }

  if (userMission.status === 'LOCKED') {
    throw new Error('Misi Buddy ini masih berstatus LOCKED.');
  }

  const numScore = Math.max(0, Math.min(100, Number(score) || 0));

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.userMission.update({
      where: { userMissionId },
      data: {
        tlId: evaluatorId,
        tlScore: numScore,
        finalScore: numScore,
        tlNotes: notes || null,
        evidenceUrl: evidenceUrl || userMission.evidenceUrl || null,
        tlScoredAt: new Date(),
        status: 'COMPLETED'
      },
      include: { mission: true, user: true }
    });

    // Cek apakah semua misi Buddy untuk crew ini sudah selesai
    const remainingBuddy = await tx.userMission.count({
      where: {
        userId: userMission.userId,
        mission: {
          batchId: userMission.mission.batchId,
          type: 'BUDDY'
        },
        status: { not: 'COMPLETED' }
      }
    });

    if (remainingBuddy === 0) {
      // Buka kunci Journey Week 1 untuk crew ini!
      await tx.userMission.updateMany({
        where: {
          userId: userMission.userId,
          mission: {
            batchId: userMission.mission.batchId,
            type: 'JOURNEY',
            weekOrDayNumber: 1
          },
          status: 'LOCKED'
        },
        data: { status: 'ACTIVE' }
      });
    }

    return updated;
  });

  emitToUser(userMission.userId, 'evaluation:buddy_completed', {
    userMissionId,
    missionTitle: userMission.mission?.missionTitle,
    score: numScore,
    notes
  });

  return {
    ...result,
    userMission: result
  };
};

/**
 * Penilaian Misi JOURNEY oleh Store Leader (SL).
 * Nilai disimpan sebagai tlScore, status menjadi SCORED_BY_TL untuk menunggu approval DM.
 */
const evaluateJourneyBySL = async (userMissionId, slId, { score, notes, evidenceUrl }) => {
  const userMission = await prisma.userMission.findUnique({
    where: { userMissionId },
    include: {
      mission: true,
      user: { include: { department: true } }
    }
  });

  if (!userMission) {
    throw new Error(`User mission dengan id "${userMissionId}" tidak ditemukan.`);
  }

  if (userMission.mission.type !== 'JOURNEY') {
    throw new Error('Misi ini bukan bertipe JOURNEY.');
  }

  if (userMission.status === 'LOCKED') {
    throw new Error('Misi ini masih berstatus LOCKED.');
  }

  const numScore = parseFloat(Math.max(0, Math.min(100, Number(score) || 0)).toFixed(1));

  const updated = await prisma.userMission.update({
    where: { userMissionId },
    data: {
      tlId: slId,
      tlScore: numScore,
      tlNotes: notes || null,
      evidenceUrl: evidenceUrl || userMission.evidenceUrl || null,
      tlScoredAt: new Date(),
      status: 'SCORED_BY_TL'
    },
    include: {
      mission: true,
      user: true
    }
  });

  const dmPayload = {
    userMissionId,
    crewId: userMission.userId,
    crewName: userMission.user?.name,
    slId,
    tlScore: numScore,
    missionTitle: userMission.mission?.missionTitle,
    evidenceUrl: updated.evidenceUrl,
    departmentId: userMission.user?.departmentId
  };

  if (userMission.dmId) {
    emitToUser(userMission.dmId, 'evaluation:scored', dmPayload);
  } else {
    emitToRole('DISTRICT_MANAGER', 'evaluation:scored', dmPayload);
  }

  return {
    ...updated,
    userMission: updated
  };
};

/**
 * Review Misi JOURNEY oleh District Manager (DM).
 * Sesuai spesifikasi Point Conversion Re.juve:
 * - 1 Kartu Mission = Skala 0 - 100 Point (Max 5 Bintang).
 * - Avg Point = (tlScore + dmScore) / 2.
 * - Rumus Bintang = (Avg Point / 100) * 5, dibulatkan 1 angka di belakang koma (misal 81.5 -> 4.1 Bintang).
 * - Bintang & Poin profil hanya diberikan untuk misi bertipe JOURNEY.
 */
const reviewJourneyByDM = async (userMissionId, dmId, { action, score, notes }) => {
  const userMission = await prisma.userMission.findUnique({
    where: { userMissionId },
    include: {
      mission: true,
      user: true
    }
  });

  if (!userMission) {
    throw new Error(`User mission dengan id "${userMissionId}" tidak ditemukan.`);
  }

  if (userMission.mission.type !== 'JOURNEY') {
    throw new Error('Hanya misi bertipe JOURNEY yang memerlukan approval DM.');
  }

  if (userMission.status !== 'SCORED_BY_TL' && userMission.status !== 'REVISED_BY_DM') {
    throw new Error(`Misi tidak dapat di-review pada status saat ini: ${userMission.status}.`);
  }

  const normalizedAction = action?.toUpperCase();

  if (normalizedAction === 'REVISE') {
    if (!notes) {
      throw new Error('Catatan revisi (notes) wajib diisi saat meminta revisi.');
    }
    const updated = await prisma.userMission.update({
      where: { userMissionId },
      data: {
        dmId,
        dmNotes: notes,
        dmReviewedAt: new Date(),
        status: 'REVISED_BY_DM'
      }
    });

    const revisePayload = {
      userMissionId,
      crewId: userMission.userId,
      crewName: userMission.user?.name,
      missionTitle: userMission.mission?.missionTitle,
      dmNotes: notes,
      status: 'REVISED_BY_DM'
    };
    if (userMission.tlId) {
      emitToUser(userMission.tlId, 'evaluation:revised', revisePayload);
    } else {
      emitToRole('STORE_LEADER', 'evaluation:revised', revisePayload);
    }

    return {
      ...updated,
      userMission: updated
    };
  }

  if (normalizedAction === 'REJECT') {
    const updated = await prisma.userMission.update({
      where: { userMissionId },
      data: {
        dmId,
        dmNotes: notes || null,
        dmReviewedAt: new Date(),
        status: 'REJECTED'
      }
    });

    return {
      ...updated,
      userMission: updated
    };
  }

  if (normalizedAction === 'APPROVE') {
    if (score === undefined || score === null) {
      throw new Error('Nilai DM (score) wajib diisi saat menyetujui misi.');
    }

    const dmScoreNum = parseFloat(Math.max(0, Math.min(100, Number(score))).toFixed(1));
    const tlScoreNum = userMission.tlScore !== null && userMission.tlScore !== undefined ? userMission.tlScore : dmScoreNum;

    // Average DM + SL Score
    const finalScore = parseFloat(((tlScoreNum + dmScoreNum) / 2).toFixed(1));
    const starsEarned = parseFloat(((finalScore / 100) * 5).toFixed(1));

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.userMission.update({
        where: { userMissionId },
        data: {
          dmId,
          dmScore: dmScoreNum,
          finalScore,
          stars: starsEarned,
          dmNotes: notes || null,
          dmReviewedAt: new Date(),
          status: 'APPROVED_BY_DM'
        },
        include: { mission: true, user: true }
      });

      // Award stars & points ke user profile
      const gamificationReward = await gamificationService.awardStars(
        userMission.userId,
        finalScore,
        tx
      );

      // Buka kunci Journey Week berikutnya untuk crew ini jika ada
      const currentWeekNumber = userMission.mission.weekOrDayNumber;
      await tx.userMission.updateMany({
        where: {
          userId: userMission.userId,
          mission: {
            batchId: userMission.mission.batchId,
            type: 'JOURNEY',
            weekOrDayNumber: currentWeekNumber + 1
          },
          status: 'LOCKED'
        },
        data: { status: 'ACTIVE' }
      });

      // Cek apakah seluruh Journey missions untuk crew ini sudah selesai/approved
      const remainingJourney = await tx.userMission.count({
        where: {
          userId: userMission.userId,
          mission: {
            batchId: userMission.mission.batchId,
            type: 'JOURNEY'
          },
          status: { notIn: ['APPROVED_BY_DM', 'COMPLETED'] },
          userMissionId: { not: userMissionId }
        }
      });

      if (remainingJourney === 0) {
        // Aktifkan Feedback mission untuk crew ini
        await tx.userMission.updateMany({
          where: {
            userId: userMission.userId,
            mission: {
              batchId: userMission.mission.batchId,
              type: 'FEEDBACK'
            },
            status: 'LOCKED'
          },
          data: { status: 'ACTIVE' }
        });
      }

      return {
        userMission: updated,
        gamification: gamificationReward
      };
    });

    // Emit event approved
    const approvePayload = {
      userMissionId,
      crewId: userMission.userId,
      crewName: userMission.user?.name,
      finalScore,
      stars: starsEarned,
      status: 'APPROVED_BY_DM',
      missionTitle: userMission.mission?.missionTitle
    };
    if (userMission.tlId) emitToUser(userMission.tlId, 'evaluation:approved', approvePayload);
    emitToUser(userMission.userId, 'evaluation:approved', approvePayload);

    // Emit perolehan bintang & poin real-time ke Crew
    if (result.gamification) {
      emitToUser(userMission.userId, 'crew:stars_earned', {
        userMissionId,
        missionTitle: userMission.mission?.missionTitle,
        starsEarned: result.gamification.starsEarned,
        pointsEarned: result.gamification.pointsEarned,
        totalStars: result.gamification.totalStars,
        totalPoints: result.gamification.totalPoints,
        level: result.gamification.level
      });
    }

    return {
      ...result.userMission,
      userMission: result.userMission,
      gamification: result.gamification
    };
  }

  throw new Error(`Aksi "${action}" tidak valid. Gunakan APPROVE, REVISE, atau REJECT.`);
};

/**
 * Submit feedback oleh Crew.
 */
const submitCrewFeedback = async (userMissionId, crewId, { submissionNotes }) => {
  const userMission = await prisma.userMission.findUnique({
    where: { userMissionId },
    include: { mission: true }
  });

  if (!userMission) {
    throw new Error(`User mission dengan id "${userMissionId}" tidak ditemukan.`);
  }

  if (userMission.mission.type !== 'FEEDBACK') {
    throw new Error('Misi ini bukan bertipe FEEDBACK.');
  }

  if (userMission.userId !== crewId) {
    throw new Error('Akses ditolak. Anda hanya dapat mengisi feedback untuk akun Anda sendiri.');
  }

  const updated = await prisma.userMission.update({
    where: { userMissionId },
    data: {
      submissionNotes: submissionNotes || null,
      submittedAt: new Date(),
      status: 'COMPLETED'
    },
    include: { mission: true }
  });

  return {
    ...updated,
    userMission: updated
  };
};

module.exports = {
  getUserMissions,
  getUserMissionById,
  getWorkstationCrews,
  getCrewMissions,
  evaluateBuddyMission,
  evaluateJourneyBySL,
  reviewJourneyByDM,
  submitCrewFeedback
};
