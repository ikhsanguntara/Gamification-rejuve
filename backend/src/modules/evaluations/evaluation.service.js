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
const batchService = require('../batches/batch.service');
const gamificationService = require('../gamification/gamification.service');
const { parsePrismaQuery } = require('../../utils/queryParser');
const { emitToUser, emitToRole } = require('../../utils/socketEmitter');
const { normalizeStorageUrl } = require('../../utils/minioStorage');
const notificationService = require('../notifications/notification.service');

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

  // Pindahkan filter yang merupakan properti model Mission ke where.mission
  const missionFields = ['type', 'batchId', 'weekOrDayNumber', 'category', 'batchDetailId'];
  for (const field of missionFields) {
    if (where[field] !== undefined) {
      where.mission = where.mission || {};
      where.mission[field] = where[field];
      delete where[field];
    }
  }

  // Alias filter week / day -> weekOrDayNumber
  if (queryClone.week !== undefined) {
    where.mission = where.mission || {};
    where.mission.weekOrDayNumber = parseInt(queryClone.week, 10);
    delete where.week;
  }
  if (queryClone.day !== undefined) {
    where.mission = where.mission || {};
    where.mission.weekOrDayNumber = parseInt(queryClone.day, 10);
    delete where.day;
  }

  // Pindahkan filter yang merupakan properti model User ke where.user
  const userFields = ['departmentId', 'userBuddyId'];
  for (const field of userFields) {
    if (where[field] !== undefined) {
      where.user = where.user || {};
      where.user[field] = where[field];
      delete where[field];
    }
  }

  // Jika batchId tidak ditentukan secara eksplisit di query, gunakan activeBatchId user jika ada
  let userActiveBatchId = currentUser?.activeBatchId;
  if (!query.batchId && !where.mission?.batchId && currentUser?.userId) {
    const freshUser = await prisma.user.findUnique({
      where: { userId: currentUser.userId },
      select: { activeBatchId: true }
    });
    userActiveBatchId = freshUser?.activeBatchId || userActiveBatchId;
  }

  if (!query.batchId && !where.mission?.batchId && userActiveBatchId) {
    where.mission = where.mission || {};
    where.mission.batchId = userActiveBatchId;
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
  let batchId = query.batchId;
  if (!batchId && currentUser?.userId) {
    const freshUser = await prisma.user.findUnique({
      where: { userId: currentUser.userId },
      select: { activeBatchId: true }
    });
    batchId = freshUser?.activeBatchId || currentUser?.activeBatchId;
  } else if (!batchId) {
    batchId = currentUser?.activeBatchId;
  }

  if (!batchId && currentUser) {
    const batches = await batchService.getUserAvailableBatches(currentUser);
    const openBatch = batches.find(b => b.status === 'OPEN') || batches[0];
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

  // 2. Filter Kru Berdasarkan Role & Tipe Evaluasi
  const userRole = currentUser?.role?.roleCode || currentUser?.role || 'SUPERADMIN';
  const andConditions = [
    { role: { roleCode: 'CREW' } },
    { isActive: true },
    // Kru WAJIB memiliki misi bertipe missionType pada batchId ini
    {
      missions: {
        some: {
          mission: {
            batchId,
            type: missionType
          }
        }
      }
    }
  ];

  // Penilaian Buddy (murni relasi 1-on-1 Buddy-Mentee via userBuddyId / tlId)
  if (missionType === 'BUDDY') {
    if (userRole !== 'SUPERADMIN' && userRole !== 'HEAD') {
      andConditions.push({
        OR: [
          { userBuddyId: currentUser.userId },
          {
            missions: {
              some: {
                tlId: currentUser.userId,
                mission: {
                  batchId,
                  type: 'BUDDY'
                }
              }
            }
          }
        ]
      });
    } else {
      if (query.buddyId) {
        andConditions.push({ userBuddyId: query.buddyId });
      }
      if (query.departmentId) {
        andConditions.push({ departmentId: query.departmentId });
      }
    }
  } else {
    // Penilaian Kru (JOURNEY / lainnya): Filter berdasarkan Toko/Departemen Store Leader atau District Manager
    if (userRole === 'STORE_LEADER') {
      const depts = await prisma.department.findMany({
        where: {
          OR: [
            { userSlId: currentUser.userId },
            ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
          ]
        },
        select: { departmentId: true }
      });
      const deptIds = depts.map(d => d.departmentId);

      const slConditions = [
        {
          missions: {
            some: {
              tlId: currentUser.userId,
              mission: { batchId, type: missionType }
            }
          }
        }
      ];

      if (deptIds.length > 0) {
        slConditions.push({ departmentId: { in: deptIds } });
      }

      andConditions.push({ OR: slConditions });
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

      const dmConditions = [
        {
          missions: {
            some: {
              dmId: currentUser.userId,
              mission: { batchId, type: missionType }
            }
          }
        }
      ];

      if (deptIds.length > 0) {
        dmConditions.push({ departmentId: { in: deptIds } });
      }

      andConditions.push({ OR: dmConditions });
    } else if (query.departmentId) {
      andConditions.push({ departmentId: query.departmentId });
    }
  }

  // Jika query search ada (name atau email)
  const search = query.search || query.q;
  if (search && typeof search === 'string' && search.trim()) {
    const s = search.trim();
    andConditions.push({
      OR: [
        { name: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } }
      ]
    });
  }

  const whereCrew = {
    AND: andConditions
  };

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
      batchId: crew.batchId || null,
      hasBatch: Boolean(crew.batchId),
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
const getCrewMissions = async (targetUserId, currentUser, query = {}, req = null) => {
  // 1. Resolve Active Batch
  let batchId = query.batchId;
  if (!batchId && currentUser?.userId) {
    const freshUser = await prisma.user.findUnique({
      where: { userId: currentUser.userId },
      select: { activeBatchId: true }
    });
    batchId = freshUser?.activeBatchId || currentUser?.activeBatchId;
  } else if (!batchId) {
    batchId = currentUser?.activeBatchId;
  }

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

  const formattedMissions = missions.map(m => ({
    ...m,
    evidenceUrl: normalizeStorageUrl(m.evidenceUrl, req)
  }));

  return {
    user,
    batchId,
    week: query.week ? parseInt(query.week, 10) : null,
    totalMissions: missions.length,
    missions: formattedMissions
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

  // Validasi batas waktu: Buddy hanya boleh menilai selama periode Buddy belum berakhir
  if (userMission.mission.endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bEnd = new Date(userMission.mission.endDate);
    bEnd.setHours(23, 59, 59, 999);
    if (today > bEnd) {
      const bEndStr = userMission.mission.endDate.toISOString().split('T')[0];
      throw new Error(`Periode penilaian Buddy telah berakhir pada ${bEndStr}. Penilaian susulan tidak diizinkan.`);
    }
  }

  // Otorisasi: Pastikan evaluator adalah Buddy dari user ini, atau bertindak sebagai tlId, atau ber-role SUPERADMIN / HEAD
  const evaluatorUser = await prisma.user.findUnique({
    where: { userId: evaluatorId },
    include: { role: true }
  });
  const evalRole = evaluatorUser?.role?.roleCode || '';
  const isSuper = evalRole === 'SUPERADMIN' || evalRole === 'HEAD';

  if (!isSuper) {
    const isAssignedBuddy = userMission.user?.userBuddyId === evaluatorId;
    const isAssignedTl = userMission.tlId === evaluatorId;
    if (!isAssignedBuddy && !isAssignedTl) {
      throw new Error('Anda tidak memiliki wewenang untuk menilai misi ini karena bukan mentor/buddy yang ditugaskan.');
    }
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

  notificationService.createNotification({
    userId: userMission.userId,
    title: 'Evaluasi Buddy Selesai',
    message: `Buddy telah menyelesaikan evaluasi misi "${userMission.mission?.missionTitle || 'Onboarding'}". Skor: ${numScore}`,
    type: 'BUDDY_EVALUATED'
  }).catch(() => {});

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

  // // WAKTU EVALUASI UNTUK SL:
  // // SL hanya boleh menilai jika minggu tersebut sudah mulai dan belum berakhir! isLock TIDAK berlaku untuk SL.
  // if (userMission.mission.startDate) {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const mStart = new Date(userMission.mission.startDate);
  //   mStart.setHours(0, 0, 0, 0);
  //   if (today < mStart) {
  //     const mStartStr = userMission.mission.startDate.toISOString().split('T')[0];
  //     throw new Error(`Masa penilaian untuk misi minggu ke-${userMission.mission.weekOrDayNumber} belum dimulai (periode mulai: ${mStartStr}).`);
  //   }
  // }

  // if (userMission.mission.endDate) {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   const mEnd = new Date(userMission.mission.endDate);
  //   mEnd.setHours(23, 59, 59, 999);
  //   if (today > mEnd) {
  //     const mEndStr = userMission.mission.endDate.toISOString().split('T')[0];
  //     throw new Error(`Masa penilaian untuk misi minggu ke-${userMission.mission.weekOrDayNumber} telah ditutup pada ${mEndStr}. Store Leader tidak dapat melakukan penilaian susulan.`);
  //   }
  // }

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
    notificationService.createNotification({
      userId: userMission.dmId,
      title: 'Misi Menunggu Review DM',
      message: `Store Leader telah menilai misi "${userMission.mission?.missionTitle}" kru ${userMission.user?.name || ''}. Menunggu persetujuan Anda.`,
      type: 'MISSION_SCORED'
    }).catch(() => {});
  } else {
    emitToRole('DISTRICT_MANAGER', 'evaluation:scored', dmPayload);
  }

  notificationService.createNotification({
    userId: userMission.userId,
    title: 'Misi Telah Dinilai Store Leader',
    message: `Misi "${userMission.mission?.missionTitle}" telah dinilai oleh Store Leader. Skor: ${numScore}`,
    type: 'MISSION_SCORED'
  }).catch(() => {});

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
      mission: {
        include: {
          batchDetail: true
        }
      },
      user: true
    }
  });

  if (!userMission) {
    throw new Error(`User mission dengan id "${userMissionId}" tidak ditemukan.`);
  }

  if (userMission.mission.type !== 'JOURNEY') {
    throw new Error('Hanya misi bertipe JOURNEY yang memerlukan approval DM.');
  }

  // WAKTU REVIEW & KEBIJAKAN isLock UNTUK DM:
  // isLock HANYA berlaku bagi District Manager (DM).
  // Jika periode template Journey telah berakhir dan template dikunci (isLock === true), DM ditolak.
  // Jika isLock === false (dispensasi aktif), DM tetap diizinkan mereview pasca-deadline.
  const batchDetail = userMission.mission?.batchDetail;
  if (batchDetail && batchDetail.endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const periodEnd = new Date(batchDetail.endDate);
    periodEnd.setHours(23, 59, 59, 999);

    if (today > periodEnd && batchDetail.isLock) {
      const endStr = batchDetail.endDate.toISOString().split('T')[0];
      throw new Error(`Periode Journey telah berakhir pada ${endStr} dan template terkunci (isLock: true). District Manager tidak dapat melakukan review evaluasi.`);
    }
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
      notificationService.createNotification({
        userId: userMission.tlId,
        title: 'Misi Perlu Direvisi',
        message: `District Manager meminta revisi untuk evaluasi misi "${userMission.mission?.missionTitle}" kru ${userMission.user?.name || ''}.`,
        type: 'DM_REVISE'
      }).catch(() => {});
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
    if (userMission.tlId) {
      emitToUser(userMission.tlId, 'evaluation:approved', approvePayload);
      notificationService.createNotification({
        userId: userMission.tlId,
        title: 'Evaluasi Misi Disetujui DM',
        message: `Evaluasi misi "${userMission.mission?.missionTitle}" kru ${userMission.user?.name || ''} telah disetujui DM.`,
        type: 'DM_APPROVED'
      }).catch(() => {});
    }
    emitToUser(userMission.userId, 'evaluation:approved', approvePayload);
    notificationService.createNotification({
      userId: userMission.userId,
      title: 'Misi Disetujui District Manager! 🌟',
      message: `Selamat! Misi "${userMission.mission?.missionTitle}" telah disetujui. Anda memperoleh ${starsEarned || 0} bintang!`,
      type: 'DM_APPROVED'
    }).catch(() => {});

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

const formatCategoryTitle = (cat) => {
  const map = {
    TECHNICAL: 'Keahlian Teknis & Operasional',
    SOFT_SKILL: 'Pelayanan Pelanggan & Sikap Kerja',
    LEADERSHIP: 'Kepemimpinan & Tanggung Jawab',
    PROJECT: 'Pelaksanaan Proyek & Tugas Toko'
  };
  return map[cat] || cat.replace(/_/g, ' ');
};

/**
 * GET /api/evaluations/buddy-report/:userId?batchId=...
 * Menghasilkan data agregasi rapor evaluasi Buddy untuk kru tertentu.
 */
const getBuddyReport = async (userId, batchId = null, req = null) => {
  const user = await prisma.user.findUnique({
    where: { userId },
    include: {
      department: true,
      userBuddy: true,
      batch: true,
      activeBatch: true
    }
  });

  if (!user) {
    throw new Error(`Kru dengan id "${userId}" tidak ditemukan.`);
  }

  const targetBatchId = batchId || user.activeBatchId || user.batchId;
  if (!targetBatchId) {
    throw new Error('Batch id tidak ditemukan untuk kru ini.');
  }

  const batch = await prisma.batch.findUnique({
    where: { batchId: targetBatchId },
    include: {
      details: {
        include: { tplMission: true }
      }
    }
  });

  if (!batch) {
    throw new Error(`Batch dengan id "${targetBatchId}" tidak ditemukan.`);
  }

  // Ambil semua misi BUDDY pada batch ini
  const missions = await prisma.mission.findMany({
    where: {
      batchId: targetBatchId,
      type: 'BUDDY'
    },
    orderBy: [
      { weekOrDayNumber: 'asc' },
      { missionTitle: 'asc' }
    ]
  });

  // Ambil userMissions milik mentee
  const userMissions = await prisma.userMission.findMany({
    where: {
      userId,
      mission: {
        batchId: targetBatchId,
        type: 'BUDDY'
      }
    },
    include: {
      tl: {
        select: { userId: true, name: true, email: true }
      }
    }
  });

  const umMap = new Map();
  userMissions.forEach(um => umMap.set(um.missionId, um));

  // Ambil evaluator/buddy
  const primaryEvaluator = userMissions.find(um => um.tl)?.tl || user.userBuddy || null;

  // Kelompokkan indikator pertanyaan berdasarkan category
  const categoriesMap = new Map();
  let totalScoreSum = 0;
  let evaluatedCount = 0;

  missions.forEach(mission => {
    const um = umMap.get(mission.missionId);
    const score = um ? (um.finalScore ?? um.tlScore ?? null) : null;
    const isEvaluated = score !== null && um?.status === 'COMPLETED';

    if (isEvaluated) {
      totalScoreSum += score;
      evaluatedCount++;
    }

    let scoreLabel = '-';
    if (score !== null) {
      if (score <= 1.4) scoreLabel = 'Belum Menguasai';
      else if (score <= 2.4) scoreLabel = 'Butuh Pendampingan';
      else scoreLabel = 'Kompeten';
    }

    const catName = mission.category || 'GENERAL';
    if (!categoriesMap.has(catName)) {
      categoriesMap.set(catName, {
        category: catName,
        categoryTitle: formatCategoryTitle(catName),
        indicators: []
      });
    }

    categoriesMap.get(catName).indicators.push({
      missionId: mission.missionId,
      dayNumber: mission.weekOrDayNumber,
      missionTitle: mission.missionTitle,
      description: mission.description,
      score,
      scoreLabel,
      notes: um?.tlNotes || null,
      evidenceUrl: normalizeStorageUrl(um?.evidenceUrl, req),
      scoredAt: um?.tlScoredAt || null,
      status: um?.status || 'LOCKED'
    });
  });

  const categories = Array.from(categoriesMap.values()).map(cat => {
    const scoredIndicators = cat.indicators.filter(i => i.score !== null);
    const catSum = scoredIndicators.reduce((acc, i) => acc + i.score, 0);
    const catAvg = scoredIndicators.length > 0 ? parseFloat((catSum / scoredIndicators.length).toFixed(2)) : 0;
    return {
      ...cat,
      totalIndicators: cat.indicators.length,
      evaluatedIndicators: scoredIndicators.length,
      averageScore: catAvg
    };
  });

  const totalIndicators = missions.length;
  const averageScore = evaluatedCount > 0 ? parseFloat((totalScoreSum / evaluatedCount).toFixed(2)) : 0;
  const completionPercent = totalIndicators > 0 ? Math.round((evaluatedCount / totalIndicators) * 100) : 0;

  let recommendationStatus = 'IN_PROGRESS';
  let recommendationText = 'Proses pendampingan masih berlangsung.';
  if (evaluatedCount === totalIndicators && totalIndicators > 0) {
    if (averageScore >= 2.5) {
      recommendationStatus = 'PASSED';
      recommendationText = 'LULUS (Kompeten & Siap Mandiri)';
    } else if (averageScore >= 2.0) {
      recommendationStatus = 'PASSED_WITH_NOTE';
      recommendationText = 'LULUS BERSYARAT (Perlu Pemantauan Khusus)';
    } else {
      recommendationStatus = 'EXTEND_TRAINING';
      recommendationText = 'PERLU PENDAMPINGAN LANJUTAN (Belum Memenuhi Syarat)';
    }
  }

  return {
    mentee: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      departmentName: user.department?.departmentName || 'Gerai Re.juve',
      departmentCode: user.department?.departmentCode || '-'
    },
    buddy: primaryEvaluator ? {
      userId: primaryEvaluator.userId,
      name: primaryEvaluator.name,
      email: primaryEvaluator.email
    } : null,
    batch: {
      batchId: batch.batchId,
      name: batch.name,
      code: batch.code,
      startDate: batch.startDate,
      endDate: batch.endDate,
      status: batch.status
    },
    summary: {
      totalIndicators,
      evaluatedCount,
      completionPercent,
      averageScore,
      scaleMax: 3,
      recommendationStatus,
      recommendationText
    },
    categories
  };
};

/**
 * Menghasilkan markup HTML mandiri untuk Rapor Buddy yang siap cetak (print-ready).
 */
const generateBuddyReportHtml = (report) => {
  const { mentee, buddy, batch, summary, categories } = report;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const statusBadgeColor = summary.recommendationStatus === 'PASSED'
    ? '#059669'
    : (summary.recommendationStatus === 'PASSED_WITH_NOTE' ? '#d97706' : '#dc2626');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rapor New Hire Re.juve - ${mentee.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 24px;
      line-height: 1.5;
    }
    .report-container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      padding: 36px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }
    .no-print-bar {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #831843;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #6b133a;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #831843;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .logo-area h1 {
      color: #831843;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .logo-area p {
      color: #64748b;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #fdf2f8;
      border: 1px solid #fbcfe8;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .meta-item strong {
      color: #831843;
      display: inline-block;
      width: 130px;
    }
    .summary-card {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
      text-align: center;
    }
    .stat-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
    }
    .stat-box .num {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .stat-box .lbl {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .category-title {
      background: #831843;
      color: #ffffff;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 8px 8px 0 0;
      margin-top: 24px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      margin-bottom: 16px;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: center;
    }
    .col-no { width: 35px; text-align: center; }
    .col-score { width: 90px; text-align: center; font-weight: bold; }
    .scale-pill {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
    }
    .scale-3 { background: #d1fae5; color: #065f46; }
    .scale-2 { background: #fef3c7; color: #92400e; }
    .scale-1 { background: #fee2e2; color: #991b1b; }
    .scale-none { background: #f1f5f9; color: #64748b; }
    .signature-section {
      margin-top: 36px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      text-align: center;
      page-break-inside: avoid;
    }
    .sign-box {
      border-top: 1px solid #94a3b8;
      padding-top: 8px;
      font-size: 12px;
      margin-top: 60px;
    }
    .sign-role { font-size: 11px; color: #64748b; font-weight: 600; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .report-container { box-shadow: none; border: none; padding: 0; }
      .no-print-bar { display: none !important; }
      @page { size: A4 portrait; margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="no-print-bar">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
    </div>

    <div class="header">
      <div class="logo-area">
        <h1>RE.JUVE — RAPOR NEW HIRE</h1>
        <p>Program Pendampingan & Evaluasi Buddy</p>
      </div>
      <div style="text-align: right; font-size: 12px; color: #64748b;">
        <div>Batch: <strong>${batch.name}</strong></div>
        <div>Periode: ${formatDate(batch.startDate)} - ${formatDate(batch.endDate)}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-item"><strong>Nama Mentee:</strong> ${mentee.name}</div>
        <div class="meta-item"><strong>Email / ID:</strong> ${mentee.email}</div>
        <div class="meta-item"><strong>Gerai / Toko:</strong> ${mentee.departmentName} (${mentee.departmentCode})</div>
      </div>
      <div>
        <div class="meta-item"><strong>Mentor (Buddy):</strong> ${buddy?.name || '-'}</div>
        <div class="meta-item"><strong>Email Mentor:</strong> ${buddy?.email || '-'}</div>
        <div class="meta-item"><strong>Status Batch:</strong> ${batch.status}</div>
      </div>
    </div>

    <div class="summary-card">
      <div class="stat-box">
        <div class="num">${summary.totalIndicators}</div>
        <div class="lbl">Total Indikator</div>
      </div>
      <div class="stat-box">
        <div class="num">${summary.evaluatedCount} / ${summary.totalIndicators}</div>
        <div class="lbl">Selesai Dinilai</div>
      </div>
      <div class="stat-box">
        <div class="num" style="color: #831843;">${summary.averageScore} / 3.0</div>
        <div class="lbl">Rata-rata Nilai</div>
      </div>
      <div class="stat-box">
        <div class="num" style="color: ${statusBadgeColor}; font-size: 15px; margin-top: 4px;">
          ${summary.recommendationStatus === 'PASSED' ? 'LULUS' : summary.recommendationStatus === 'IN_PROGRESS' ? 'PROGRES' : 'EVALUASI'}
        </div>
        <div class="lbl">${summary.recommendationText}</div>
      </div>
    </div>

    ${categories.map((cat, cIdx) => `
      <div class="category-title">${cIdx + 1}. ${cat.categoryTitle} (Rata-rata: ${cat.averageScore})</div>
      <table>
        <thead>
          <tr>
            <th class="col-no">No</th>
            <th>Indikator Kompetensi & Penjelasan</th>
            <th class="col-score">Nilai (1-3)</th>
            <th>Catatan Pembimbing</th>
          </tr>
        </thead>
        <tbody>
          ${cat.indicators.map((ind, iIdx) => {
            const scoreClass = ind.score === 3 ? 'scale-3' : (ind.score === 2 ? 'scale-2' : (ind.score === 1 ? 'scale-1' : 'scale-none'));
            return `
              <tr>
                <td class="col-no">${iIdx + 1}</td>
                <td>
                  <strong>${ind.missionTitle}</strong>
                  ${ind.description ? `<div style="color: #64748b; font-size: 11px; margin-top: 2px;">${ind.description}</div>` : ''}
                </td>
                <td class="col-score">
                  <span class="scale-pill ${scoreClass}">${ind.score !== null ? ind.score : '-'}</span>
                  <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${ind.scoreLabel}</div>
                </td>
                <td style="font-size: 11px; color: #334155;">${ind.notes || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `).join('')}

    <div class="signature-section">
      <div>
        <div class="sign-role">Kru yang Dinilai (Mentee)</div>
        <div class="sign-box">${mentee.name}</div>
      </div>
      <div>
        <div class="sign-role">Pembimbing (Buddy / Mentor)</div>
        <div class="sign-box">${buddy?.name || 'Buddy Mentor'}</div>
      </div>
      <div>
        <div class="sign-role">Mengetahui (Store Leader)</div>
        <div class="sign-box">Store Leader / Supervisor</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * GET /api/evaluations/buddy-history
 * Mengambil rekapitulasi riwayat pendampingan Buddy per batch untuk setiap mentee.
 */
const getBuddyHistory = async (currentUser, query = {}) => {
  const currentUserId = currentUser.id || currentUser.userId;
  const userRole = currentUser.role?.roleCode || currentUser.role || 'SUPERADMIN';
  const isSuper = userRole === 'SUPERADMIN' || userRole === 'HEAD';

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const whereMentee = {
    role: { roleCode: 'CREW' },
    isActive: true
  };

  if (!isSuper) {
    whereMentee.OR = [
      { userBuddyId: currentUserId },
      { missions: { some: { tlId: currentUserId, mission: { type: 'BUDDY' } } } }
    ];
  } else if (query.buddyId) {
    whereMentee.OR = [
      { userBuddyId: query.buddyId },
      { missions: { some: { tlId: query.buddyId, mission: { type: 'BUDDY' } } } }
    ];
  }

  if (query.batchId) {
    whereMentee.AND = [
      {
        OR: [
          { batchId: query.batchId },
          { activeBatchId: query.batchId },
          { missions: { some: { mission: { batchId: query.batchId, type: 'BUDDY' } } } }
        ]
      }
    ];
  }

  if (query.search || query.q) {
    const s = (query.search || query.q).trim();
    whereMentee.name = { contains: s, mode: 'insensitive' };
  }

  const [total, mentees] = await Promise.all([
    prisma.user.count({ where: whereMentee }),
    prisma.user.findMany({
      where: whereMentee,
      skip,
      take: limit,
      include: {
        department: true,
        userBuddy: true,
        batch: true,
        activeBatch: true
      },
      orderBy: { name: 'asc' }
    })
  ]);

  const menteeIds = mentees.map(m => m.userId);

  const userMissions = await prisma.userMission.findMany({
    where: {
      userId: { in: menteeIds },
      mission: { type: 'BUDDY' }
    },
    include: {
      mission: true,
      tl: { select: { userId: true, name: true, email: true } }
    }
  });

  const missionsByMentee = {};
  userMissions.forEach(um => {
    if (!missionsByMentee[um.userId]) missionsByMentee[um.userId] = [];
    missionsByMentee[um.userId].push(um);
  });

  const historyList = mentees.map(mentee => {
    const mBatch = mentee.batch || mentee.activeBatch;
    const mList = missionsByMentee[mentee.userId] || [];
    const totalIndicators = mList.length;
    const evaluatedMissions = mList.filter(m => m.status === 'COMPLETED');
    const evaluatedCount = evaluatedMissions.length;
    const completionRate = totalIndicators > 0 ? Math.round((evaluatedCount / totalIndicators) * 100) : 0;

    const scoredMissions = mList.filter(m => m.finalScore !== null || m.tlScore !== null);
    const avgScore = scoredMissions.length > 0
      ? parseFloat((scoredMissions.reduce((acc, m) => acc + (m.finalScore ?? m.tlScore ?? 0), 0) / scoredMissions.length).toFixed(1))
      : 0;

    const isCompleted = totalIndicators > 0 && evaluatedCount === totalIndicators;

    const latestScoredAt = scoredMissions.reduce((latest, m) => {
      const d = m.tlScoredAt ? new Date(m.tlScoredAt) : null;
      return d && (!latest || d > latest) ? d : latest;
    }, null);

    return {
      mentee: {
        userId: mentee.userId,
        name: mentee.name,
        email: mentee.email,
        departmentName: mentee.department?.departmentName || 'Gerai Re.juve',
        departmentCode: mentee.department?.departmentCode || '-',
        stars: mentee.stars,
        points: mentee.points
      },
      buddy: mentee.userBuddy ? {
        userId: mentee.userBuddy.userId,
        name: mentee.userBuddy.name,
        email: mentee.userBuddy.email
      } : null,
      batch: mBatch ? {
        batchId: mBatch.batchId,
        name: mBatch.name,
        code: mBatch.code,
        status: mBatch.status
      } : null,
      progress: {
        totalIndicators,
        evaluatedCount,
        completionRate,
        avgScore,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        lastScoredAt: latestScoredAt
      },
      reportUrl: mBatch ? `/api/evaluations/buddy-report/${mentee.userId}?batchId=${mBatch.batchId}` : null
    };
  });

  const completedCount = historyList.filter(h => h.progress.status === 'COMPLETED').length;
  const inProgressCount = historyList.filter(h => h.progress.status === 'IN_PROGRESS').length;

  return {
    items: historyList,
    summary: {
      totalMentees: total,
      completedMentees: completedCount,
      inProgressMentees: inProgressCount
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    }
  };
};

/**
/**
 * Helper untuk menentukan struktur folder MinIO & prefix nama file:
 * evidences/batches/{batchCode}/{crewName}/{type}[/week-{n}]
 * Prefix file: mission_{shortMissionId}
 * 
 * @param {string} userMissionId
 * @returns {Promise<{folder: string, filePrefix: string, missionId: string, batchCode: string, crewName: string, programType: string}>}
 */
const resolveEvidenceFolder = async (userMissionId) => {
  try {
    const um = await prisma.userMission.findUnique({
      where: { userMissionId },
      include: {
        user: { select: { userId: true, name: true } },
        mission: {
          select: {
            missionId: true,
            type: true,
            weekOrDayNumber: true,
            batch: { select: { batchId: true, code: true } }
          }
        }
      }
    });

    if (!um) {
      return {
        folder: 'evidences',
        filePrefix: 'evidence',
        missionId: '',
        batchCode: 'general',
        crewName: 'crew',
        programType: 'general',
        toString() { return this.folder; }
      };
    }

    const batchCode = (um.mission?.batch?.code || um.mission?.batch?.batchId || 'general')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const rawName = (um.user?.name || 'crew')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const crewName = rawName || 'crew';
    const programType = (um.mission?.type || 'journey').toLowerCase();

    let folder = `evidences/batches/${batchCode}/${crewName}/${programType}`;
    if (programType === 'journey') {
      const weekNum = um.mission?.weekOrDayNumber || 1;
      folder += `/week-${weekNum}`;
    }

    const missionId = um.mission?.missionId || um.missionId || '';
    const shortMissionId = missionId ? missionId.replace(/-/g, '').slice(0, 8) : 'general';
    const filePrefix = `mission_${shortMissionId}`;

    return {
      folder,
      filePrefix,
      missionId,
      batchCode,
      crewName,
      programType,
      toString() { return this.folder; }
    };
  } catch (err) {
    console.warn('[Evidence Folder Resolver Error]', err.message);
    return {
      folder: 'evidences',
      filePrefix: 'evidence',
      missionId: '',
      batchCode: 'general',
      crewName: 'crew',
      programType: 'general',
      toString() { return this.folder; }
    };
  }
};

module.exports = {
  getUserMissions,
  getUserMissionById,
  getWorkstationCrews,
  getCrewMissions,
  evaluateBuddyMission,
  evaluateJourneyBySL,
  reviewJourneyByDM,
  submitCrewFeedback,
  getBuddyReport,
  generateBuddyReportHtml,
  getBuddyHistory,
  resolveEvidenceFolder
};
