'use strict';

/**
 * @file batch.service.js
 * @description Service layer untuk Batch Management dan Transactional Batch Mission Generator (dengan search support).
 */

const prisma = require('../../config/db');
const { parsePrismaQuery } = require('../../utils/queryParser');

/**
 * Helper untuk format date ke Date object tanpa jam (UTC / midnight).
 */
const toDateOnly = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

/**
 * Helper menambah hari ke suatu tanggal.
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

/**
 * Menghitung durasi hari dari durationCode dan durationValue.
 */
const getUnitDays = (durationCode, durationValue = 1) => {
  const val = Number(durationValue) || 1;
  switch (durationCode?.toUpperCase()) {
    case 'DAY':
      return val;
    case 'WEEK':
      return val * 7;
    case 'MONTH':
      return val * 30;
    case 'YEAR':
      return val * 365;
    default:
      return val * 7;
  }
};

/**
 * Hitung jadwal timeline sekuensial untuk Buddy -> Journey -> Feedback.
 */
const calculateTimeline = (batchStartDate, tplBuddy, tplJourney, tplFeedback) => {
  const start = toDateOnly(batchStartDate);
  let currentCursor = new Date(start);

  let buddySchedule = null;
  if (tplBuddy) {
    const buddyUnitDays = getUnitDays(tplBuddy.durationCode, tplBuddy.durationValue);
    const maxNumber = tplBuddy.details.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1);
    const totalDays = buddyUnitDays * maxNumber;
    const buddyEnd = addDays(currentCursor, totalDays - 1);

    buddySchedule = {
      template: tplBuddy,
      startDate: new Date(currentCursor),
      endDate: buddyEnd,
      unitDays: buddyUnitDays
    };

    // Journey dimulai 1 hari setelah Buddy selesai
    currentCursor = addDays(buddyEnd, 1);
  }

  // Journey Schedule (Mandatory)
  const journeyUnitDays = getUnitDays(tplJourney.durationCode, tplJourney.durationValue);
  const maxJourneyWeek = tplJourney.details.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1);
  const totalJourneyDays = journeyUnitDays * maxJourneyWeek;
  const journeyStart = new Date(currentCursor);
  const journeyEnd = addDays(journeyStart, totalJourneyDays - 1);

  const journeySchedule = {
    template: tplJourney,
    startDate: journeyStart,
    endDate: journeyEnd,
    unitDays: journeyUnitDays,
    maxWeeks: maxJourneyWeek
  };

  currentCursor = addDays(journeyEnd, 1);

  let feedbackSchedule = null;
  if (tplFeedback) {
    const feedbackUnitDays = getUnitDays(tplFeedback.durationCode, tplFeedback.durationValue);
    const maxFeedbackNumber = tplFeedback.details.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1);
    const totalFeedbackDays = feedbackUnitDays * maxFeedbackNumber;
    const feedbackEnd = addDays(currentCursor, totalFeedbackDays - 1);

    feedbackSchedule = {
      template: tplFeedback,
      startDate: new Date(currentCursor),
      endDate: feedbackEnd,
      unitDays: feedbackUnitDays
    };
  }

  // Sesuai konfirmasi spesifikasi: masa batch berakhir saat seluruh Journey selesai
  const batchEndDate = new Date(journeyEnd);

  return {
    batchEndDate,
    buddySchedule,
    journeySchedule,
    feedbackSchedule
  };
};

/**
 * Generator misi atomik di dalam prisma transaction ($transaction).
 */
const executeBatchGeneration = async (tx, {
  batchId,
  batchStartDate,
  buddySchedule,
  journeySchedule,
  feedbackSchedule,
  creatorId
}) => {
  const createdMissions = [];

  // 1. Generate Batch Detail & Missions untuk BUDDY
  if (buddySchedule) {
    const buddyBatchDetail = await tx.batchDetail.create({
      data: {
        batchId,
        tplMissionId: buddySchedule.template.tplMissionId,
        status: 'OPEN',
        startDate: buddySchedule.startDate,
        endDate: buddySchedule.endDate,
        isLock: false, // Buddy aktif di awal batch
        createdBy: creatorId
      }
    });

    for (const detail of buddySchedule.template.details) {
      const detailStep = (detail.durationNumber || 1) - 1;
      const mStart = addDays(buddySchedule.startDate, detailStep * buddySchedule.unitDays);
      const mEnd = addDays(mStart, buddySchedule.unitDays - 1);

      const mission = await tx.mission.create({
        data: {
          batchId,
          batchDetailId: buddyBatchDetail.batchDetailId,
          weekOrDayNumber: detail.durationNumber || 1,
          missionTitle: detail.missionTitle,
          description: detail.description,
          category: detail.category,
          type: 'BUDDY',
          inputType: detail.inputType || 'SCALE',
          scaleConfig: detail.scaleConfig || null,
          sopChecklist: detail.sopChecklist || null,
          startDate: mStart,
          endDate: mEnd
        }
      });
      createdMissions.push({ ...mission, templateType: 'BUDDY' });
    }
  }

  // 2. Generate Batch Detail & Missions untuk JOURNEY
  const journeyBatchDetail = await tx.batchDetail.create({
    data: {
      batchId,
      tplMissionId: journeySchedule.template.tplMissionId,
      status: 'OPEN',
      startDate: journeySchedule.startDate,
      endDate: journeySchedule.endDate,
      isLock: false,
      createdBy: creatorId
    }
  });

  for (const detail of journeySchedule.template.details) {
    const weekIndex = (detail.durationNumber || 1) - 1;
    const mStart = addDays(journeySchedule.startDate, weekIndex * journeySchedule.unitDays);
    const mEnd = addDays(mStart, journeySchedule.unitDays - 1);

    const mission = await tx.mission.create({
      data: {
        batchId,
        batchDetailId: journeyBatchDetail.batchDetailId,
        weekOrDayNumber: detail.durationNumber || 1,
        missionTitle: detail.missionTitle,
        description: detail.description,
        category: detail.category,
        type: 'JOURNEY',
        inputType: detail.inputType || 'SCALE',
        scaleConfig: detail.scaleConfig || null,
        sopChecklist: detail.sopChecklist || null,
        startDate: mStart,
        endDate: mEnd
      }
    });
    createdMissions.push({ ...mission, templateType: 'JOURNEY' });
  }

  // 3. Generate Batch Detail & Missions untuk FEEDBACK
  if (feedbackSchedule) {
    const feedbackBatchDetail = await tx.batchDetail.create({
      data: {
        batchId,
        tplMissionId: feedbackSchedule.template.tplMissionId,
        status: 'OPEN',
        startDate: feedbackSchedule.startDate,
        endDate: feedbackSchedule.endDate,
        isLock: true, // Terkunci sampai akhir journey
        createdBy: creatorId
      }
    });

    for (const detail of feedbackSchedule.template.details) {
      const stepIndex = (detail.durationNumber || 1) - 1;
      const mStart = addDays(feedbackSchedule.startDate, stepIndex * feedbackSchedule.unitDays);
      const mEnd = addDays(mStart, feedbackSchedule.unitDays - 1);

      const mission = await tx.mission.create({
        data: {
          batchId,
          batchDetailId: feedbackBatchDetail.batchDetailId,
          weekOrDayNumber: detail.durationNumber || 1,
          missionTitle: detail.missionTitle,
          description: detail.description,
          category: detail.category,
          type: 'FEEDBACK',
          inputType: detail.inputType || 'TEXT',
          scaleConfig: detail.scaleConfig || null,
          sopChecklist: detail.sopChecklist || null,
          startDate: mStart,
          endDate: mEnd
        }
      });
      createdMissions.push({ ...mission, templateType: 'FEEDBACK' });
    }
  }

  // 4. Ambil seluruh Crew yang di-assign ke batch ini beserta Buddy dan Store Leader (SL) / DM
  const crewUsers = await tx.user.findMany({
    where: { batchId },
    include: {
      department: true
    }
  });

  // 5. Bulk Create User Missions (t_user_missions)
  const userMissionsToInsert = [];

  for (const crew of crewUsers) {
    const buddyEvaluatorId = crew.userBuddyId || null;
    const storeLeaderId = crew.department?.userSlId || null;
    const districtManagerId = crew.department?.userDmId || null;

    for (const mission of createdMissions) {
      let initialStatus = 'LOCKED';
      let tlId = null;
      let dmId = null;

      if (mission.templateType === 'BUDDY') {
        tlId = buddyEvaluatorId;
        initialStatus = 'ACTIVE';
      } else if (mission.templateType === 'JOURNEY') {
        tlId = storeLeaderId;
        dmId = districtManagerId;
        if (!buddySchedule && mission.weekOrDayNumber === 1) {
          initialStatus = 'ACTIVE';
        } else {
          initialStatus = 'LOCKED';
        }
      } else if (mission.templateType === 'FEEDBACK') {
        initialStatus = 'LOCKED';
      }

      userMissionsToInsert.push({
        userId: crew.userId,
        missionId: mission.missionId,
        status: initialStatus,
        tlId,
        dmId
      });
    }
  }

  if (userMissionsToInsert.length > 0) {
    await tx.userMission.createMany({
      data: userMissionsToInsert
    });
  }

  return {
    missionsCount: createdMissions.length,
    userMissionsCount: userMissionsToInsert.length,
    crewsCount: crewUsers.length
  };
};

/**
 * Buat Batch baru.
 */
const createBatch = async (payload, creatorId = null) => {
  const {
    code,
    name,
    startDate,
    status = 'DRAFT',
    currentWeek = 1,
    tplJourneyId,
    tplBuddyId = null,
    tplFeedbackId = null,
    crewIds = []
  } = payload;

  if (!code || !name || !startDate || !tplJourneyId) {
    throw new Error('Field "code", "name", "startDate", dan "tplJourneyId" wajib diisi.');
  }

  const [tplJourney, tplBuddy, tplFeedback] = await Promise.all([
    prisma.tplMission.findUnique({
      where: { tplMissionId: tplJourneyId },
      include: { details: true }
    }),
    tplBuddyId ? prisma.tplMission.findUnique({
      where: { tplMissionId: tplBuddyId },
      include: { details: true }
    }) : null,
    tplFeedbackId ? prisma.tplMission.findUnique({
      where: { tplMissionId: tplFeedbackId },
      include: { details: true }
    }) : null
  ]);

  if (!tplJourney) {
    throw new Error(`Template Journey dengan id "${tplJourneyId}" tidak ditemukan.`);
  }

  const timeline = calculateTimeline(startDate, tplBuddy, tplJourney, tplFeedback);

  const result = await prisma.$transaction(async (tx) => {
    const batch = await tx.batch.create({
      data: {
        code,
        name,
        status,
        startDate: toDateOnly(startDate),
        endDate: timeline.batchEndDate,
        currentWeek: Number(currentWeek) || 1,
        createdBy: creatorId
      }
    });

    if (Array.isArray(crewIds) && crewIds.length > 0) {
      await tx.user.updateMany({
        where: { userId: { in: crewIds } },
        data: { batchId: batch.batchId }
      });
    }

    if (status === 'OPEN') {
      const genResult = await executeBatchGeneration(tx, {
        batchId: batch.batchId,
        batchStartDate: startDate,
        buddySchedule: timeline.buddySchedule,
        journeySchedule: timeline.journeySchedule,
        feedbackSchedule: timeline.feedbackSchedule,
        creatorId
      });
      batch.generation = genResult;
    } else {
      const draftDetails = [
        {
          batchId: batch.batchId,
          tplMissionId: tplJourney.tplMissionId,
          status: 'DRAFT',
          startDate: timeline.journeySchedule.startDate,
          endDate: timeline.journeySchedule.endDate,
          isLock: true,
          createdBy: creatorId
        }
      ];

      if (timeline.buddySchedule) {
        draftDetails.push({
          batchId: batch.batchId,
          tplMissionId: tplBuddy.tplMissionId,
          status: 'DRAFT',
          startDate: timeline.buddySchedule.startDate,
          endDate: timeline.buddySchedule.endDate,
          isLock: true,
          createdBy: creatorId
        });
      }

      if (timeline.feedbackSchedule) {
        draftDetails.push({
          batchId: batch.batchId,
          tplMissionId: tplFeedback.tplMissionId,
          status: 'DRAFT',
          startDate: timeline.feedbackSchedule.startDate,
          endDate: timeline.feedbackSchedule.endDate,
          isLock: true,
          createdBy: creatorId
        });
      }

      await tx.batchDetail.createMany({ data: draftDetails });
    }

    return await tx.batch.findUnique({
      where: { batchId: batch.batchId },
      include: {
        details: {
          include: { tplMission: true }
        },
        users: {
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
        _count: {
          select: { missions: true, users: true }
        }
      }
    });
  });

  return result;
};

/**
 * Trigger manual generator untuk Batch yang masih DRAFT.
 */
const generateBatch = async (batchId, creatorId = null) => {
  const batch = await prisma.batch.findUnique({
    where: { batchId },
    include: {
      details: {
        include: {
          tplMission: {
            include: { details: true }
          }
        }
      },
      missions: true
    }
  });

  if (!batch) {
    throw new Error(`Batch dengan id "${batchId}" tidak ditemukan.`);
  }

  if (batch.missions.length > 0) {
    throw new Error(`Batch "${batch.name}" sudah pernah di-generate sebelumnya.`);
  }

  const tplJourney = batch.details.find((d) => d.tplMission.type === 'JOURNEY')?.tplMission;
  const tplBuddy = batch.details.find((d) => d.tplMission.type === 'BUDDY')?.tplMission;
  const tplFeedback = batch.details.find((d) => d.tplMission.type === 'FEEDBACK')?.tplMission;

  if (!tplJourney) {
    throw new Error('Batch tidak memiliki Template Journey yang terasosiasi.');
  }

  const timeline = calculateTimeline(batch.startDate, tplBuddy, tplJourney, tplFeedback);

  const result = await prisma.$transaction(async (tx) => {
    await tx.batchDetail.deleteMany({ where: { batchId } });

    await tx.batch.update({
      where: { batchId },
      data: {
        status: 'OPEN',
        endDate: timeline.batchEndDate,
        updatedBy: creatorId
      }
    });

    const genResult = await executeBatchGeneration(tx, {
      batchId,
      batchStartDate: batch.startDate,
      buddySchedule: timeline.buddySchedule,
      journeySchedule: timeline.journeySchedule,
      feedbackSchedule: timeline.feedbackSchedule,
      creatorId
    });

    return {
      batchId,
      ...genResult
    };
  });

  return result;
};

/**
 * Helper untuk membatasi query Batch berdasarkan wewenang Role.
 * - SUPERADMIN / HEAD: Melihat semua batch.
 * - STORE_LEADER: Hanya batch yang memiliki user dari departemen yang dipimpinnya, atau activeBatchId dia.
 * - DISTRICT_MANAGER: Hanya batch yang memiliki user dari departemen-departemen di bawah distriknya, atau activeBatchId dia.
 * - CREW: Hanya batch tempat dia terdaftar (batchId).
 */
const getScopedBatchWhere = async (currentUser, baseWhere = {}) => {
  const where = { ...baseWhere };
  if (!currentUser) return where;

  const roleCode = (currentUser.role?.roleCode || currentUser.role || '').toUpperCase();

  // Superadmin & Head dapat melihat seluruh batch
  if (roleCode === 'SUPERADMIN' || roleCode === 'HEAD') {
    return where;
  }

  const userId = currentUser.userId || currentUser.id;

  if (roleCode === 'STORE_LEADER') {
    const depts = await prisma.department.findMany({
      where: {
        OR: [
          { userSlId: userId },
          ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
        ]
      },
      select: { departmentId: true }
    });
    const deptIds = depts.map(d => d.departmentId);

    const scopingConditions = [];
    if (deptIds.length > 0) {
      scopingConditions.push({
        users: { some: { departmentId: { in: deptIds } } }
      });
    }
    if (currentUser.activeBatchId) {
      scopingConditions.push({ batchId: currentUser.activeBatchId });
    }

    if (scopingConditions.length > 0) {
      if (where.OR) {
        where.AND = [
          ...(where.AND || []),
          { OR: scopingConditions }
        ];
      } else {
        where.OR = scopingConditions;
      }
    } else {
      where.batchId = '00000000-0000-0000-0000-000000000000';
    }
  } else if (roleCode === 'DISTRICT_MANAGER') {
    const depts = await prisma.department.findMany({
      where: {
        OR: [
          { userDmId: userId },
          ...(currentUser.departmentId ? [{ departmentId: currentUser.departmentId }] : [])
        ]
      },
      select: { departmentId: true }
    });
    const deptIds = depts.map(d => d.departmentId);

    const scopingConditions = [];
    if (deptIds.length > 0) {
      scopingConditions.push({
        users: { some: { departmentId: { in: deptIds } } }
      });
    }
    if (currentUser.activeBatchId) {
      scopingConditions.push({ batchId: currentUser.activeBatchId });
    }

    if (scopingConditions.length > 0) {
      if (where.OR) {
        where.AND = [
          ...(where.AND || []),
          { OR: scopingConditions }
        ];
      } else {
        where.OR = scopingConditions;
      }
    } else {
      where.batchId = '00000000-0000-0000-0000-000000000000';
    }
  } else if (roleCode === 'CREW') {
    if (currentUser.batchId) {
      where.batchId = currentUser.batchId;
    } else {
      where.batchId = '00000000-0000-0000-0000-000000000000';
    }
  }

  return where;
};

/**
 * Ambil daftar ringkas batch yang dapat dipilih oleh pengguna (untuk dropdown FE / session).
 */
const getUserAvailableBatches = async (currentUser) => {
  if (!currentUser) return [];

  const scopedWhere = await getScopedBatchWhere(currentUser, {});

  // Untuk non-superadmin, sembunyikan batch bertatus DRAFT (belum di-generate)
  const roleCode = (currentUser.role?.roleCode || currentUser.role || '').toUpperCase();
  if (roleCode !== 'SUPERADMIN' && roleCode !== 'HEAD') {
    scopedWhere.status = { not: 'DRAFT' };
  }

  const batches = await prisma.batch.findMany({
    where: scopedWhere,
    select: {
      batchId: true,
      code: true,
      name: true,
      status: true,
      currentWeek: true,
      startDate: true,
      endDate: true
    },
    orderBy: [
      { status: 'asc' }, // OPEN first, then COMPLETED
      { startDate: 'desc' }
    ]
  });

  return batches;
};

/**
 * Ambil daftar batch dengan dynamic query parser & pagination serta role-scoping.
 */
const getBatches = async (query = {}, currentUser = null) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const queryClone = { ...query };
  delete queryClone.page;
  delete queryClone.limit;

  // Searchable: name, code
  const baseWhere = parsePrismaQuery(queryClone, ['name', 'code']);
  const where = await getScopedBatchWhere(currentUser, baseWhere);

  const [total, batches] = await Promise.all([
    prisma.batch.count({ where }),
    prisma.batch.findMany({
      where,
      skip,
      take: limit,
      include: {
        details: {
          include: { tplMission: true }
        },
        _count: {
          select: { users: true, missions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { batches, total, page, limit };
};

/**
 * Ambil batch detail berdasarkan ID.
 */
const getBatchById = async (batchId) => {
  const batch = await prisma.batch.findUnique({
    where: { batchId },
    include: {
      details: {
        include: { tplMission: true }
      },
      missions: {
        orderBy: [
          { type: 'asc' },
          { weekOrDayNumber: 'asc' }
        ]
      },
      users: {
        select: {
          userId: true,
          name: true,
          email: true,
          stars: true,
          points: true,
          level: true,
          department: true,
          userBuddy: {
            select: { userId: true, name: true }
          }
        }
      },
      _count: {
        select: { users: true, missions: true }
      }
    }
  });

  return batch;
};

/**
 * Update data batch atau lock status.
 */
const updateBatch = async (batchId, payload, updaterId = null) => {
  const { name, code, currentWeek, status, isLock, crewIds } = payload;

  const existing = await prisma.batch.findUnique({
    where: { batchId },
    include: { missions: true }
  });

  if (!existing) {
    return null;
  }

  if (existing.status === 'DRAFT' && status === 'OPEN' && existing.missions.length === 0) {
    await generateBatch(batchId, updaterId);
  }

  const dataToUpdate = { updatedBy: updaterId };
  if (name !== undefined) dataToUpdate.name = name;
  if (code !== undefined) dataToUpdate.code = code;
  if (currentWeek !== undefined) dataToUpdate.currentWeek = Number(currentWeek);
  if (status !== undefined) dataToUpdate.status = status;

  await prisma.batch.update({
    where: { batchId },
    data: dataToUpdate
  });

  if (isLock !== undefined) {
    await prisma.batchDetail.updateMany({
      where: { batchId },
      data: { isLock: Boolean(isLock) }
    });
  }

  if (Array.isArray(crewIds)) {
    await prisma.user.updateMany({
      where: { batchId },
      data: { batchId: null }
    });
    if (crewIds.length > 0) {
      await prisma.user.updateMany({
        where: { userId: { in: crewIds } },
        data: { batchId }
      });
    }
  }

  const updated = await getBatchById(batchId);
  return updated;
};

/**
 * Hapus batch.
 */
const deleteBatch = async (batchId, updaterId = null) => {
  const existing = await prisma.batch.findUnique({
    where: { batchId }
  });

  if (!existing) return null;

  await prisma.batch.delete({
    where: { batchId }
  });

  return true;
};

module.exports = {
  createBatch,
  generateBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getUserAvailableBatches,
  getScopedBatchWhere
};
