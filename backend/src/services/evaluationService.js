'use strict';

/**
 * @file evaluationService.js
 * @description Service layer untuk Alur Evaluasi Terpadu (Fase 4):
 *   - Buddy Evaluation (dinilai oleh Buddy) -> COMPLETED
 *   - Journey Evaluation (dinilai oleh Store Leader) -> SCORED_BY_TL
 *   - District Manager Review (Approve / Revise / Reject) -> APPROVED_BY_DM
 *   - Feedback Submission (diisi oleh Crew di akhir journey) -> COMPLETED
 */

const prisma = require('../config/db');
const gamificationService = require('./gamificationService');
const { parsePrismaQuery } = require('../utils/queryParser');

/**
 * Ambil daftar user missions dengan dynamic query filter.
 */
const getUserMissions = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const queryClone = { ...query };
  delete queryClone.page;
  delete queryClone.limit;

  const where = parsePrismaQuery(queryClone);

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
        include: {
          batch: true,
          batchDetail: true
        }
      },
      user: {
        select: {
          userId: true,
          name: true,
          email: true,
          stars: true,
          level: true,
          department: true,
          userBuddy: {
            select: { userId: true, name: true }
          }
        }
      },
      tl: {
        select: { userId: true, name: true, email: true }
      },
      dm: {
        select: { userId: true, name: true, email: true }
      }
    }
  });

  return data;
};

/**
 * Penilaian Misi BUDDY oleh Buddy.
 * Misi Buddy dinilai 1x dan langsung final (COMPLETED).
 */
const evaluateBuddyMission = async (userMissionId, evaluatorId, { score, notes, evidenceUrl }) => {
  const userMission = await prisma.userMission.findUnique({
    where: { userMissionId },
    include: { mission: true, user: true }
  });

  if (!userMission) {
    throw new Error(`User mission dengan id "${userMissionId}" tidak ditemukan.`);
  }

  if (userMission.mission.type !== 'BUDDY') {
    throw new Error('Misi ini bukan bertipe BUDDY.');
  }

  if (userMission.status === 'LOCKED') {
    throw new Error('Misi ini masih terkunci (LOCKED).');
  }

  // Verifikasi evaluator: harus buddy yang ditugaskan (atau superadmin jika diizinkan)
  if (userMission.tlId && userMission.tlId !== evaluatorId) {
    throw new Error('Akses ditolak. Anda bukan Buddy yang ditugaskan untuk Crew ini.');
  }

  const numScore = Math.max(0, Math.min(100, Number(score) || 0));

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.userMission.update({
      where: { userMissionId },
      data: {
        tlScore: numScore,
        finalScore: numScore,
        tlNotes: notes || null,
        evidenceUrl: evidenceUrl || userMission.evidenceUrl || null,
        tlScoredAt: new Date(),
        status: 'COMPLETED'
      },
      include: { mission: true, user: true }
    });

    // Berikan reward bintang ke crew
    const starReward = await gamificationService.awardStars(
      userMission.userId,
      numScore,
      userMission.mission.scaleConfig,
      tx
    );

    // Buka kunci Journey Week 1 untuk crew ini jika seluruh misi Buddy-nya telah selesai
    const remainingBuddy = await tx.userMission.count({
      where: {
        userId: userMission.userId,
        mission: {
          batchId: userMission.mission.batchId,
          type: 'BUDDY'
        },
        status: { not: 'COMPLETED' },
        userMissionId: { not: userMissionId }
      }
    });

    if (remainingBuddy === 0) {
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

    return {
      userMission: updated,
      gamification: starReward
    };
  });

  return result;
};

/**
 * Penilaian Misi JOURNEY oleh Store Leader (SL).
 * Hanya SL yang memotret evidence dan memasukkan nilai (1-100).
 * Status menjadi SCORED_BY_TL untuk menunggu approval DM.
 */
const evaluateJourneyBySL = async (userMissionId, slId, { score, notes, evidenceUrl }) => {
  const userMission = await prisma.userMission.findUnique({
    where: { userMissionId },
    include: {
      mission: {
        include: { batchDetail: true }
      },
      user: {
        include: { department: true }
      }
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

  // Verifikasi penilai: harus Store Leader dari department crew (tlId)
  if (userMission.tlId && userMission.tlId !== slId) {
    throw new Error('Akses ditolak. Anda bukan Store Leader (SL) yang ditugaskan untuk Crew ini.');
  }

  const numScore = Math.max(0, Math.min(100, Number(score) || 0));

  const updated = await prisma.userMission.update({
    where: { userMissionId },
    data: {
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

  return updated;
};

/**
 * Review Misi JOURNEY oleh District Manager (DM).
 * Opsi tindakan:
 *   - 'APPROVE' : input dmScore (1-100), finalScore = round((tlScore + dmScore)/2), status = 'APPROVED_BY_DM', award stars!
 *   - 'REVISE'  : input dmNotes (alasan revisi), status = 'REVISED_BY_DM' (SL dapat menilai ulang)
 *   - 'REJECT'  : input dmNotes, status = 'REJECTED'
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

  // Verifikasi penilai: harus DM yang ditugaskan (dmId)
  if (userMission.dmId && userMission.dmId !== dmId) {
    throw new Error('Akses ditolak. Anda bukan District Manager (DM) yang ditugaskan untuk Crew ini.');
  }

  const normalizedAction = action?.toUpperCase();

  if (normalizedAction === 'REVISE') {
    if (!notes) {
      throw new Error('Catatan revisi (notes) wajib diisi saat meminta revisi.');
    }
    const updated = await prisma.userMission.update({
      where: { userMissionId },
      data: {
        dmNotes: notes,
        dmReviewedAt: new Date(),
        status: 'REVISED_BY_DM'
      }
    });

    return updated;
  }

  if (normalizedAction === 'REJECT') {
    const updated = await prisma.userMission.update({
      where: { userMissionId },
      data: {
        dmNotes: notes || null,
        dmReviewedAt: new Date(),
        status: 'REJECTED'
      }
    });

    return updated;
  }

  if (normalizedAction === 'APPROVE') {
    if (score === undefined || score === null) {
      throw new Error('Nilai DM (score) wajib diisi saat menyetujui misi.');
    }
    const dmScoreNum = Math.max(0, Math.min(100, Number(score)));
    const tlScoreNum = userMission.tlScore || dmScoreNum;
    const finalScore = Math.round((tlScoreNum + dmScoreNum) / 2);

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.userMission.update({
        where: { userMissionId },
        data: {
          dmScore: dmScoreNum,
          finalScore,
          dmNotes: notes || null,
          dmReviewedAt: new Date(),
          status: 'APPROVED_BY_DM'
        },
        include: { mission: true, user: true }
      });

      // Award stars & update level
      const starReward = await gamificationService.awardStars(
        userMission.userId,
        finalScore,
        userMission.mission.scaleConfig,
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
        // Aktifkan Feedback mission untuk crew ini!
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
        gamification: starReward
      };
    });

    return result;
  }

  throw new Error(`Aksi tidak valid: "${action}". Pilihan yang valid: APPROVE, REVISE, REJECT.`);
};

/**
 * Pengisian Misi FEEDBACK oleh Crew di akhir journey.
 * Crew HANYA mengisi teks saran/masukan (submissionNotes) tanpa nilai angka.
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
    throw new Error('Akses ditolak. Anda hanya dapat mengisi feedback milik Anda sendiri.');
  }

  if (!submissionNotes || submissionNotes.trim().length === 0) {
    throw new Error('Teks feedback (submissionNotes) wajib diisi.');
  }

  const updated = await prisma.userMission.update({
    where: { userMissionId },
    data: {
      submissionNotes: submissionNotes.trim(),
      submittedAt: new Date(),
      status: 'COMPLETED'
    },
    include: { mission: true }
  });

  return updated;
};

module.exports = {
  getUserMissions,
  getUserMissionById,
  evaluateBuddyMission,
  evaluateJourneyBySL,
  reviewJourneyByDM,
  submitCrewFeedback
};
