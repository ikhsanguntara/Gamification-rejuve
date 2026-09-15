'use strict';

/**
 * @file batch.service.js
 * @description Service layer untuk Batch Management dan Transactional Batch Mission Generator (dengan search support).
 */

const prisma = require('../../config/db');
const { parsePrismaQuery } = require('../../utils/queryParser');
const { normalizeStorageUrl } = require('../../utils/minioStorage');

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
    case 'DAYS':
      return val;
    case 'WEEK':
    case 'WEEKS':
      return val * 7;
    case 'MONTH':
    case 'MONTHS':
      return val * 30;
    case 'YEAR':
    case 'YEARS':
      return val * 365;
    default:
      return val * 7;
  }
};

/**
 * Hitung jadwal timeline sekuensial untuk Buddy -> Journey -> Feedback.
 */
const calculateTimeline = (batchStartDate, tplBuddy, tplJourney, tplFeedback) => {
  // batchStartDate dari input FE adalah tanggal mulai JOURNEY (misal 11 Sep 2026)
  const journeyStart = toDateOnly(batchStartDate);

  // 1. Journey Schedule (Mandatory)
  // Durasi unit hari dihitung dinamis dari durationCode & durationValue template Journey (DAY/DAYS -> 1 hari, WEEK -> 7 hari, dst.)
  const journeyUnitDays = getUnitDays(tplJourney.durationCode, tplJourney.durationValue || 1);
  const maxJourneyPeriod = Math.max(
    tplJourney.details?.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1) || 1,
    Number(tplJourney.durationValue) || 1
  );
  const totalJourneyDays = journeyUnitDays * maxJourneyPeriod;
  const journeyEnd = addDays(journeyStart, totalJourneyDays - 1);

  const journeySchedule = {
    template: tplJourney,
    startDate: journeyStart,
    endDate: journeyEnd,
    unitDays: journeyUnitDays,
    maxWeeks: maxJourneyPeriod
  };

  // 2. Buddy Schedule (Opsi A: Pra-Journey / Orientasi H-N sebelum Journey Dimulai)
  let buddySchedule = null;
  if (tplBuddy) {
    const buddyDurationVal = Number(tplBuddy.durationValue) || 1;
    let totalBuddyDays = 3;
    const isBuddyDay = tplBuddy.durationCode?.toUpperCase() === 'DAY' || tplBuddy.durationCode?.toUpperCase() === 'DAYS';
    if (isBuddyDay) {
      const maxNumber = tplBuddy.details?.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1) || 1;
      totalBuddyDays = Math.max(buddyDurationVal, maxNumber);
    } else {
      totalBuddyDays = getUnitDays(tplBuddy.durationCode, buddyDurationVal);
    }

    // Buddy berakhir 1 hari sebelum Journey mulai (H-1)
    const buddyEnd = addDays(journeyStart, -1);
    const buddyStart = addDays(buddyEnd, -(totalBuddyDays - 1));

    buddySchedule = {
      template: tplBuddy,
      startDate: buddyStart,
      endDate: buddyEnd,
      unitDays: totalBuddyDays,
      totalDays: totalBuddyDays
    };
  }

  // 3. Feedback Schedule (Pasca-Journey / Evaluasi Setelah Journey Selesai)
  let feedbackSchedule = null;
  if (tplFeedback) {
    const feedbackUnitDays = getUnitDays(tplFeedback.durationCode, tplFeedback.durationValue);
    const maxFeedbackNumber = tplFeedback.details?.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1) || 1;
    const totalFeedbackDays = feedbackUnitDays * maxFeedbackNumber;

    // Feedback dimulai 1 hari setelah Journey selesai
    const feedbackStart = addDays(journeyEnd, 1);
    const feedbackEnd = addDays(feedbackStart, totalFeedbackDays - 1);

    feedbackSchedule = {
      template: tplFeedback,
      startDate: feedbackStart,
      endDate: feedbackEnd,
      unitDays: feedbackUnitDays,
      totalDays: totalFeedbackDays
    };
  }

  // Sesuai konfirmasi spesifikasi: masa batch pada tabel t_batches murni periode Journey
  const batchStartDateResolved = new Date(journeyStart);
  const batchEndDate = new Date(journeyEnd);

  return {
    batchStartDate: batchStartDateResolved,
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
          startDate: buddySchedule.startDate,
          endDate: buddySchedule.endDate
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
      isLock: false, // Default false: memberi dispensasi DM jika batch lewat deadline
      createdBy: creatorId
    }
  });

  const journeyUnitDays = journeySchedule.unitDays || 7;
  for (const detail of journeySchedule.template.details) {
    const periodIndex = (detail.durationNumber || 1) - 1;
    const mStart = addDays(journeySchedule.startDate, periodIndex * journeyUnitDays);
    const mEnd = addDays(mStart, journeyUnitDays - 1);

    const missionScaleConfig = detail.scaleConfig && typeof detail.scaleConfig === 'object' && !Array.isArray(detail.scaleConfig)
      ? { ...detail.scaleConfig }
      : (detail.inputType === 'SCALE' ? { min: 0, max: 100, step: 10, starPerStep: 1 } : {});
    if (detail.periodTitle) {
      missionScaleConfig.periodTitle = detail.periodTitle;
    }

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
        scaleConfig: Object.keys(missionScaleConfig).length > 0 ? missionScaleConfig : null,
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
        initialStatus = mission.weekOrDayNumber === 1 ? 'ACTIVE' : 'LOCKED';
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
 * Auto-generate kode Batch berikutnya (Format Opsi 1: BTH-01, BTH-02, dst.).
 * Resilient terhadap loncatan nomor, custom prefix, maupun concurrency.
 */
const generateNextBatchCode = async (prismaClient = prisma) => {
  const batches = await prismaClient.batch.findMany({
    select: { code: true }
  });

  const existingCodes = new Set(batches.map(b => (b.code || '').trim().toUpperCase()));

  const numericSuffixes = batches
    .map(b => b.code)
    .filter(c => Boolean(c) && /^BTH-\d+$/i.test(c.trim()))
    .map(c => parseInt(c.trim().replace(/^BTH-/i, ''), 10))
    .filter(n => !isNaN(n));

  let candidateNum = numericSuffixes.length > 0 ? Math.max(...numericSuffixes) + 1 : 1;

  let candidateCode = `BTH-${String(candidateNum).padStart(2, '0')}`;
  while (existingCodes.has(candidateCode.toUpperCase())) {
    candidateNum++;
    candidateCode = `BTH-${String(candidateNum).padStart(2, '0')}`;
  }

  return candidateCode;
};

/**
 * Buat Batch baru.
 * Field "code" bersifat opsional. Jika tidak diisi / kosong, backend otomatis men-generate kode (BTH-01, BTH-02, dst).
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

  if (!name || !startDate || !tplJourneyId) {
    throw new Error('Field "name", "startDate", dan "tplJourneyId" wajib diisi.');
  }

  let finalCode = (typeof code === 'string' && code.trim()) ? code.trim() : null;
  if (!finalCode) {
    finalCode = await generateNextBatchCode();
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
    // Validasi atau regenerate kode secara atomik bila bentrok
    const existingCode = await tx.batch.findUnique({
      where: { code: finalCode }
    });

    if (existingCode) {
      if (code && typeof code === 'string' && code.trim()) {
        const err = new Error(`Batch dengan code "${finalCode}" sudah ada.`);
        err.code = 'P2002';
        throw err;
      } else {
        finalCode = await generateNextBatchCode(tx);
      }
    }

    const batch = await tx.batch.create({
      data: {
        code: finalCode,
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

    const scopingConditions = [
      // 1. Batch di mana SL ini bertindak sebagai evaluator (tlId) di t_user_missions
      { missions: { some: { userMissions: { some: { tlId: userId } } } } },
      // 2. Batch di mana SL ini terdaftar langsung
      { users: { some: { userId } } }
    ];

    if (deptIds.length > 0) {
      scopingConditions.push({
        users: { some: { departmentId: { in: deptIds } } }
      });
    }

    if (currentUser.isBuddy) {
      scopingConditions.push({
        users: { some: { userBuddyId: userId } }
      });
    }

    if (currentUser.activeBatchId) {
      scopingConditions.push({ batchId: currentUser.activeBatchId });
    }

    if (where.OR) {
      where.AND = [
        ...(where.AND || []),
        { OR: scopingConditions }
      ];
    } else {
      where.OR = scopingConditions;
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

    const scopingConditions = [
      // 1. Batch di mana DM ini bertindak sebagai reviewer (dmId) di t_user_missions
      { missions: { some: { userMissions: { some: { dmId: userId } } } } },
      // 2. Batch di mana DM ini terdaftar langsung
      { users: { some: { userId } } }
    ];

    if (deptIds.length > 0) {
      scopingConditions.push({
        users: { some: { departmentId: { in: deptIds } } }
      });
    }

    if (currentUser.activeBatchId) {
      scopingConditions.push({ batchId: currentUser.activeBatchId });
    }

    if (where.OR) {
      where.AND = [
        ...(where.AND || []),
        { OR: scopingConditions }
      ];
    } else {
      where.OR = scopingConditions;
    }
  } else if (roleCode === 'BUDDY' || currentUser.isBuddy) {
    const scopingConditions = [
      // 1. Batch di mana Buddy ini bertindak sebagai evaluator (tlId) di t_user_missions
      { missions: { some: { userMissions: { some: { tlId: userId } } } } },
      // 2. Batch di mana Buddy membimbing mentees
      { users: { some: { userBuddyId: userId } } },
      // 3. Batch di mana Buddy terdaftar langsung
      { users: { some: { userId } } }
    ];

    if (currentUser.activeBatchId) {
      scopingConditions.push({ batchId: currentUser.activeBatchId });
    }

    if (where.OR) {
      where.AND = [
        ...(where.AND || []),
        { OR: scopingConditions }
      ];
    } else {
      where.OR = scopingConditions;
    }
  } else if (roleCode === 'CREW') {
    const scopingConditions = [
      { users: { some: { userId } } },
      { missions: { some: { userMissions: { some: { userId } } } } }
    ];

    if (currentUser.batchId) {
      scopingConditions.push({ batchId: currentUser.batchId });
    }
    if (currentUser.activeBatchId) {
      scopingConditions.push({ batchId: currentUser.activeBatchId });
    }

    if (where.OR) {
      where.AND = [
        ...(where.AND || []),
        { OR: scopingConditions }
      ];
    } else {
      where.OR = scopingConditions;
    }
  }

  return where;
};

/**
 * Lengkapi array batch dengan kalkulasi properti totalWeeks secara dinamis,
 * interval tanggal minggu, status mingguan (UPCOMING, ACTIVE, CLOSED), dan scoped completionRate.
 */
const enrichBatchesWithTotalWeeks = async (batches, currentUser = null) => {
  if (!batches || batches.length === 0) return batches;
  const batchIds = batches.map(b => b.batchId);

  // Ambil max weekOrDayNumber dari misi JOURNEY batch-batch ini
  const journeyWeeks = await prisma.mission.groupBy({
    by: ['batchId'],
    where: {
      batchId: { in: batchIds },
      type: 'JOURNEY'
    },
    _max: {
      weekOrDayNumber: true
    }
  });

  const maxWeeksMap = {};
  for (const j of journeyWeeks) {
    if (j._max?.weekOrDayNumber) {
      maxWeeksMap[j.batchId] = j._max.weekOrDayNumber;
    }
  }

  // Ambil semua misi Journey dan user missions untuk menghitung completionRate per minggu
  const allJourneyMissions = await prisma.mission.findMany({
    where: {
      batchId: { in: batchIds },
      type: 'JOURNEY'
    },
    select: {
      missionId: true,
      batchId: true,
      weekOrDayNumber: true,
      scaleConfig: true
    }
  });

  const allMissionIds = allJourneyMissions.map(m => m.missionId);
  const allUserMissions = allMissionIds.length > 0
    ? await prisma.userMission.findMany({
        where: { missionId: { in: allMissionIds } },
        select: {
          status: true,
          missionId: true,
          userId: true,
          tlId: true,
          tlScore: true,
          dmScore: true,
          finalScore: true,
          stars: true,
          user: { select: { departmentId: true } }
        }
      })
    : [];

  const missionStatusMap = {};
  for (const um of allUserMissions) {
    missionStatusMap[um.missionId] = missionStatusMap[um.missionId] || [];
    missionStatusMap[um.missionId].push({
      status: um.status,
      userId: um.userId,
      tlId: um.tlId,
      departmentId: um.user?.departmentId
    });
  }

  const isStoreLeader = currentUser && (
    (currentUser.role?.roleCode || currentUser.role || '').toUpperCase() === 'STORE_LEADER'
  );
  const slUserId = currentUser?.userId || currentUser?.id;
  const slDeptId = currentUser?.departmentId || currentUser?.user?.departmentId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const b of batches) {
    let maxW = maxWeeksMap[b.batchId];
    const journeyDetail = b.details?.find(d => d.tplMission?.type === 'JOURNEY');
    const journeyDurCode = journeyDetail?.tplMission?.durationCode || 'WEEK';
    const journeyDurVal = journeyDetail?.tplMission?.durationValue || 1;
    const journeyUnitDays = getUnitDays(journeyDurCode, journeyDurVal);
    
    if (!maxW && journeyDetail) {
      if (journeyDetail.tplMission?.details?.length) {
        maxW = journeyDetail.tplMission.details.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1);
      } else if (journeyDetail.startDate && journeyDetail.endDate) {
        const jDiff = Math.round((new Date(journeyDetail.endDate) - new Date(journeyDetail.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        maxW = Math.max(1, Math.round(jDiff / journeyUnitDays));
      }
    }
    
    if (!maxW && b.startDate && b.endDate) {
      const diffDays = Math.round((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0) maxW = Math.max(1, Math.round(diffDays / journeyUnitDays));
    }
    
    b.totalWeeks = maxW || 5;
    if (journeyDetail?.startDate) {
      b.journeyStartDate = journeyDetail.startDate;
      b.journeyEndDate = journeyDetail.endDate;
    } else if (b.startDate) {
      b.journeyStartDate = b.startDate;
      b.journeyEndDate = b.endDate;
    }

    const baseDate = b.journeyStartDate || b.startDate;

    // Hitung completion dan status per minggu untuk batch ini
    const batchMissions = allJourneyMissions.filter(m => m.batchId === b.batchId);
    b.weeks = Array.from({ length: b.totalWeeks }, (_, i) => {
      const wNum = i + 1;
      const weekMissions = batchMissions.filter(m => (m.weekOrDayNumber || 1) === wNum);
      
      const wStart = addDays(baseDate, (wNum - 1) * journeyUnitDays);
      const wEnd = addDays(wStart, journeyUnitDays - 1);

      const wStartTime = new Date(wStart).setHours(0, 0, 0, 0);
      const wEndTime = new Date(wEnd).setHours(23, 59, 59, 999);

      let weekStatus = 'UPCOMING';
      if (today >= wStartTime && today <= wEndTime) {
        weekStatus = 'ACTIVE';
      } else if (today > wEndTime) {
        weekStatus = 'CLOSED';
      }

      let totalUm = 0;
      let completedUm = 0;
      let myStoreTotalUm = 0;
      let myStoreCompletedUm = 0;

      for (const wm of weekMissions) {
        const list = missionStatusMap[wm.missionId] || [];
        totalUm += list.length;
        completedUm += list.filter(item => 
          item.status === 'COMPLETED' || item.status === 'APPROVED_BY_DM' || item.status === 'SCORED_BY_TL'
        ).length;

        if (isStoreLeader) {
          const myStoreList = list.filter(item => 
            (slDeptId && item.departmentId === slDeptId) || item.tlId === slUserId
          );
          myStoreTotalUm += myStoreList.length;
          myStoreCompletedUm += myStoreList.filter(item => 
            item.status === 'COMPLETED' || item.status === 'APPROVED_BY_DM' || item.status === 'SCORED_BY_TL'
          ).length;
        }
      }

      const globalCompletionRate = totalUm > 0 ? Math.round((completedUm / totalUm) * 100) : 0;
      const myStoreCompletionRate = myStoreTotalUm > 0 ? Math.round((myStoreCompletedUm / myStoreTotalUm) * 100) : 0;
      const effectiveCompletionRate = isStoreLeader ? myStoreCompletionRate : globalCompletionRate;

      const isDayUnit = journeyDurCode.toUpperCase().startsWith('DAY');
      const periodUnitLabel = isDayUnit ? 'Hari' : (journeyDurCode.toUpperCase().startsWith('MONTH') ? 'Bulan' : 'Minggu');
      const customTitle = weekMissions.find(wm => wm.scaleConfig && wm.scaleConfig.periodTitle)?.scaleConfig?.periodTitle;
      return {
        weekNumber: wNum,
        title: customTitle || `${periodUnitLabel} ${wNum}: Tema SOP Operasional`,
        startDate: wStart,
        endDate: wEnd,
        status: weekStatus,
        isCurrent: weekStatus === 'ACTIVE',
        missionCount: weekMissions.length,
        completionRate: effectiveCompletionRate,
        globalCompletionRate,
        myStoreCompletionRate: isStoreLeader ? myStoreCompletionRate : null,
        totalEvaluations: isStoreLeader ? myStoreTotalUm : totalUm,
        completedEvaluations: isStoreLeader ? myStoreCompletedUm : completedUm
      };
    });

    // ─── Kalkulasi Summary Metrics untuk Kartu Batch (Rata-rata Skor, Misi Selesai, Total Bintang) ─
    const bJourneyMissionIds = allJourneyMissions.filter(m => m.batchId === b.batchId).map(m => m.missionId);
    const bUms = allUserMissions.filter(um => bJourneyMissionIds.includes(um.missionId));
    const scopedBUms = isStoreLeader
      ? bUms.filter(um => (slDeptId && um.user?.departmentId === slDeptId) || um.tlId === slUserId)
      : bUms;

    const completedBUms = scopedBUms.filter(um => 
      ['COMPLETED', 'APPROVED_BY_DM', 'SCORED_BY_TL'].includes(um.status)
    );
    const scoredBUms = completedBUms.filter(um => 
      um.finalScore !== null || um.tlScore !== null || um.dmScore !== null
    );
    const bScoreSum = scoredBUms.reduce((acc, um) => {
      const s = um.finalScore !== null ? um.finalScore : (um.tlScore !== null ? um.tlScore : um.dmScore);
      return acc + Number(s || 0);
    }, 0);
    const bAvgScore = scoredBUms.length > 0 ? Math.round(bScoreSum / scoredBUms.length) : 0;
    const bStarsSum = scopedBUms.reduce((acc, um) => acc + Number(um.stars || 0), 0);

    b.completedMissions = completedBUms.length;
    b.totalMissions = scopedBUms.length > 0 ? scopedBUms.length : (b._count?.missions || 0);
    b.averageScore = bAvgScore;
    b.totalStars = parseFloat(bStarsSum.toFixed(1));
    b.totalCrew = b.users?.length ?? b._count?.users ?? 0;
  }

  return batches;
};

/**
 * Lengkapi single batch dengan kalkulasi totalWeeks, tanggal Journey, dan weeks completionRate.
 */
const enrichSingleBatchWithTotalWeeks = async (batch, currentUser = null) => {
  if (!batch) return batch;
  const journeyMissions = batch.missions?.filter(m => m.type === 'JOURNEY') || [];
  const maxW = journeyMissions.reduce((max, m) => Math.max(max, m.weekOrDayNumber || 1), 0);
  const journeyDetail = batch.details?.find(d => d.tplMission?.type === 'JOURNEY');
  const journeyDurCode = journeyDetail?.tplMission?.durationCode || 'WEEK';
  const journeyDurVal = journeyDetail?.tplMission?.durationValue || 1;
  const journeyUnitDays = getUnitDays(journeyDurCode, journeyDurVal);
  
  if (maxW > 0) {
    batch.totalWeeks = maxW;
  } else if (journeyDetail?.tplMission?.details?.length) {
    batch.totalWeeks = journeyDetail.tplMission.details.reduce((max, d) => Math.max(max, d.durationNumber || 1), 1);
  } else if (journeyDetail?.startDate && journeyDetail?.endDate) {
    const jDiff = Math.round((new Date(journeyDetail.endDate) - new Date(journeyDetail.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    batch.totalWeeks = Math.max(1, Math.round(jDiff / journeyUnitDays));
  } else if (batch.startDate && batch.endDate) {
    const diffDays = Math.round((new Date(batch.endDate) - new Date(batch.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    batch.totalWeeks = Math.max(1, Math.round(diffDays / journeyUnitDays));
  } else {
    batch.totalWeeks = 5;
  }

  if (journeyDetail?.startDate) {
    batch.journeyStartDate = journeyDetail.startDate;
    batch.journeyEndDate = journeyDetail.endDate;
  } else if (batch.startDate) {
    batch.journeyStartDate = batch.startDate;
    batch.journeyEndDate = batch.endDate;
  }

  const baseDate = batch.journeyStartDate || batch.startDate;

  const journeyMissionIds = journeyMissions.map(m => m.missionId);
  let userMissions = [];
  if (journeyMissionIds.length > 0) {
    userMissions = await prisma.userMission.findMany({
      where: { missionId: { in: journeyMissionIds } },
      select: {
        status: true,
        missionId: true,
        userId: true,
        tlId: true,
        tlScore: true,
        dmScore: true,
        finalScore: true,
        stars: true,
        user: { select: { departmentId: true } }
      }
    });
  }

  const missionStatusMap = {};
  for (const um of userMissions) {
    missionStatusMap[um.missionId] = missionStatusMap[um.missionId] || [];
    missionStatusMap[um.missionId].push({
      status: um.status,
      userId: um.userId,
      tlId: um.tlId,
      departmentId: um.user?.departmentId
    });
  }

  const isStoreLeader = currentUser && (
    (currentUser.role?.roleCode || currentUser.role || '').toUpperCase() === 'STORE_LEADER'
  );
  const slUserId = currentUser?.userId || currentUser?.id;
  const slDeptId = currentUser?.departmentId || currentUser?.user?.departmentId;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  batch.weeks = Array.from({ length: batch.totalWeeks }, (_, i) => {
    const wNum = i + 1;
    const weekMissions = journeyMissions.filter(m => (m.weekOrDayNumber || 1) === wNum);
    
    const wStart = addDays(baseDate, (wNum - 1) * journeyUnitDays);
    const wEnd = addDays(wStart, journeyUnitDays - 1);

    const wStartTime = new Date(wStart).setHours(0, 0, 0, 0);
    const wEndTime = new Date(wEnd).setHours(23, 59, 59, 999);

    let weekStatus = 'UPCOMING';
    if (today >= wStartTime && today <= wEndTime) {
      weekStatus = 'ACTIVE';
    } else if (today > wEndTime) {
      weekStatus = 'CLOSED';
    }

    let totalUm = 0;
    let completedUm = 0;
    let myStoreTotalUm = 0;
    let myStoreCompletedUm = 0;

    for (const wm of weekMissions) {
      const list = missionStatusMap[wm.missionId] || [];
      totalUm += list.length;
      completedUm += list.filter(item => 
        item.status === 'COMPLETED' || item.status === 'APPROVED_BY_DM' || item.status === 'SCORED_BY_TL'
      ).length;

      if (isStoreLeader) {
        const myStoreList = list.filter(item => 
          (slDeptId && item.departmentId === slDeptId) || item.tlId === slUserId
        );
        myStoreTotalUm += myStoreList.length;
        myStoreCompletedUm += myStoreList.filter(item => 
          item.status === 'COMPLETED' || item.status === 'APPROVED_BY_DM' || item.status === 'SCORED_BY_TL'
        ).length;
      }
    }

    const globalCompletionRate = totalUm > 0 ? Math.round((completedUm / totalUm) * 100) : 0;
    const myStoreCompletionRate = myStoreTotalUm > 0 ? Math.round((myStoreCompletedUm / myStoreTotalUm) * 100) : 0;
    const effectiveCompletionRate = isStoreLeader ? myStoreCompletionRate : globalCompletionRate;

    const isDayUnit = journeyDurCode.toUpperCase().startsWith('DAY');
    const periodUnitLabel = isDayUnit ? 'Hari' : (journeyDurCode.toUpperCase().startsWith('MONTH') ? 'Bulan' : 'Minggu');
    const customTitle = weekMissions.find(wm => wm.scaleConfig && wm.scaleConfig.periodTitle)?.scaleConfig?.periodTitle;
    return {
      weekNumber: wNum,
      title: customTitle || `${periodUnitLabel} ${wNum}: Tema SOP Operasional`,
      startDate: wStart,
      endDate: wEnd,
      status: weekStatus,
      isCurrent: weekStatus === 'ACTIVE',
      missionCount: weekMissions.length,
      completionRate: effectiveCompletionRate,
      globalCompletionRate,
      myStoreCompletionRate: isStoreLeader ? myStoreCompletionRate : null,
      totalEvaluations: isStoreLeader ? myStoreTotalUm : totalUm,
      completedEvaluations: isStoreLeader ? myStoreCompletedUm : completedUm
    };
  });

  // ─── Kalkulasi Summary Metrics untuk Header Batch (Rata-rata Skor, Misi Selesai, Total Bintang) ─
  const scopedBatchUms = isStoreLeader
    ? userMissions.filter(um => (slDeptId && um.user?.departmentId === slDeptId) || um.tlId === slUserId)
    : userMissions;

  const completedBatchUms = scopedBatchUms.filter(um => 
    ['COMPLETED', 'APPROVED_BY_DM', 'SCORED_BY_TL'].includes(um.status)
  );

  const scoredBatchUms = completedBatchUms.filter(um => 
    um.finalScore !== null || um.tlScore !== null || um.dmScore !== null
  );

  const scoreSum = scoredBatchUms.reduce((acc, um) => {
    const s = um.finalScore !== null ? um.finalScore : (um.tlScore !== null ? um.tlScore : um.dmScore);
    return acc + Number(s || 0);
  }, 0);

  const avgScore = scoredBatchUms.length > 0 ? Math.round(scoreSum / scoredBatchUms.length) : 0;
  const starsSum = scopedBatchUms.reduce((acc, um) => acc + Number(um.stars || 0), 0);

  batch.totalCrew = batch.users?.length ?? batch._count?.users ?? 0;
  batch.totalMissions = scopedBatchUms.length > 0 ? scopedBatchUms.length : (batch.missions?.length ?? batch._count?.missions ?? 0);
  batch.completedMissions = completedBatchUms.length;
  batch.averageScore = avgScore;
  batch.totalStars = parseFloat(starsSum.toFixed(1));

  return batch;
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

  await enrichBatchesWithTotalWeeks(batches, currentUser);
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

  await enrichBatchesWithTotalWeeks(batches, currentUser);

  return { batches, total, page, limit };
};

/**
 * Ambil batch detail berdasarkan ID.
 */
const getBatchById = async (batchId, currentUser = null, req = null) => {
  const batch = await prisma.batch.findUnique({
    where: { batchId },
    include: {
      details: {
        include: { tplMission: true }
      },
      missions: {
        orderBy: [
          { type: 'asc' },
          { weekOrDayNumber: 'asc' },
          { createdAt: 'asc' }
        ],
        include: {
          batchDetail: {
            select: {
              tplMissionId: true,
              tplMission: {
                select: {
                  tplMissionId: true,
                  code: true,
                  name: true,
                  type: true,
                  durationCode: true,
                  durationValue: true
                }
              }
            }
          },
          userMissions: {
            select: {
              userMissionId: true,
              userId: true,
              status: true,
              tlId: true,
              tlScore: true,
              tlNotes: true,
              tlScoredAt: true,
              dmId: true,
              dmScore: true,
              dmNotes: true,
              dmReviewedAt: true,
              finalScore: true,
              stars: true,
              evidenceUrl: true,
              user: {
                select: {
                  userId: true,
                  name: true,
                  email: true,
                  stars: true,
                  points: true,
                  level: true,
                  department: {
                    select: {
                      departmentId: true,
                      departmentCode: true,
                      departmentName: true
                    }
                  }
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
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

  if (!batch) return null;

  // Sematkan tplMission langsung di tiap objek mission dan sediakan score efektif & normalisasi evidenceUrl
  if (Array.isArray(batch.missions)) {
    for (const m of batch.missions) {
      if (m.batchDetail?.tplMission) {
        m.tplMission = m.batchDetail.tplMission;
      }
      if (Array.isArray(m.userMissions)) {
        for (const um of m.userMissions) {
          if (um.evidenceUrl) {
            um.evidenceUrl = normalizeStorageUrl(um.evidenceUrl, req);
          }
          um.score = um.finalScore !== null && um.finalScore !== undefined
            ? um.finalScore
            : (um.tlScore !== null && um.tlScore !== undefined ? um.tlScore : (um.dmScore ?? 0));
        }
      }
    }
  }

  // Kelompokkan missions & users ke dalam masing-masing batch.details secara in-memory (O(N), 0 query tambahan DB)
  if (Array.isArray(batch.details)) {
    const missionsByDetailId = new Map();
    const missionsByType = new Map();

    if (Array.isArray(batch.missions)) {
      for (const m of batch.missions) {
        if (m.batchDetailId) {
          if (!missionsByDetailId.has(m.batchDetailId)) {
            missionsByDetailId.set(m.batchDetailId, []);
          }
          missionsByDetailId.get(m.batchDetailId).push(m);
        }
        if (m.type) {
          if (!missionsByType.has(m.type)) {
            missionsByType.set(m.type, []);
          }
          missionsByType.get(m.type).push(m);
        }
      }
    }

    const batchUsers = Array.isArray(batch.users) ? batch.users : [];

    for (const d of batch.details) {
      let detailMissions = missionsByDetailId.get(d.batchDetailId);
      if (!detailMissions && d.tplMission?.type) {
        detailMissions = missionsByType.get(d.tplMission.type);
      }
      detailMissions = detailMissions || [];

      d.missions = detailMissions;
      d.users = batchUsers;
      if (d.tplMission) {
        d.tplMission.missions = detailMissions;
        d.tplMission.users = batchUsers;
      }
    }
  }

  return await enrichSingleBatchWithTotalWeeks(batch, currentUser);
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

/**
 * Toggle atau ubah status isLock pada Batch Detail tertentu.
 * Jika di-unlock (isLock: false) dan unlockMissions: true, otomatis ubah userMissions terkait dari LOCKED ke ACTIVE.
 * @param {string} batchId
 * @param {string} batchDetailId
 * @param {object} payload - { isLock, unlockMissions = true }
 * @param {string} updaterId
 */
const toggleBatchDetailLock = async (batchId, batchDetailId, payload = {}, updaterId = null) => {
  const detail = await prisma.batchDetail.findFirst({
    where: { batchId, batchDetailId },
    include: {
      tplMission: true,
      batch: true
    }
  });

  if (!detail) {
    throw new Error(`Batch detail dengan id "${batchDetailId}" tidak ditemukan pada batch ini.`);
  }

  const newLock = payload.isLock !== undefined ? Boolean(payload.isLock) : !detail.isLock;
  const unlockMissions = payload.unlockMissions !== undefined ? Boolean(payload.unlockMissions) : true;

  const updatedDetail = await prisma.batchDetail.update({
    where: { batchDetailId },
    data: {
      isLock: newLock,
      updatedBy: updaterId
    },
    include: {
      tplMission: true
    }
  });

  let unlockedMissionsCount = 0;
  if (!newLock && unlockMissions) {
    const res = await prisma.userMission.updateMany({
      where: {
        mission: {
          batchId,
          batchDetailId
        },
        status: 'LOCKED'
      },
      data: {
        status: 'ACTIVE'
      }
    });
    unlockedMissionsCount = res.count;
  }

  return {
    batchDetail: updatedDetail,
    isLock: newLock,
    unlockedMissionsCount,
    message: newLock
      ? `Fase ${detail.tplMission?.name || 'Batch Detail'} berhasil dikunci (LOCKED).`
      : `Fase ${detail.tplMission?.name || 'Batch Detail'} berhasil dibuka (UNLOCKED). ${unlockedMissionsCount} misi kru diaktifkan!`
  };
};

module.exports = {
  createBatch,
  generateBatch,
  generateNextBatchCode,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getUserAvailableBatches,
  getScopedBatchWhere,
  toggleBatchDetailLock,
  calculateTimeline,
  getUnitDays,
  enrichSingleBatchWithTotalWeeks,
  enrichBatchesWithTotalWeeks
};
