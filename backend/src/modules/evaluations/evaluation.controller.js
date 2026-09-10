'use strict';

/**
 * @file evaluation.controller.js
 * @description Controller untuk alur evaluasi terpadu & workstation kru.
 */

const evaluationService = require('./evaluation.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/responseWrapper');
const { uploadFileToStorage } = require('../../utils/minioStorage');

/**
 * GET /api/evaluations/user-missions
 */
const getUserMissions = async (req, res, next) => {
  try {
    const { userMissions, total, page, limit } = await evaluationService.getUserMissions(req.query, req.user);
    return sendPaginated(res, {
      message: 'Daftar penugasan misi berhasil diambil.',
      data: userMissions,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/user-missions/:id
 */
const getUserMissionById = async (req, res, next) => {
  try {
    const userMission = await evaluationService.getUserMissionById(req.params.id);
    if (!userMission) {
      return sendError(res, { statusCode: 404, message: 'User mission tidak ditemukan' });
    }
    return sendSuccess(res, { data: userMission });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/crews
 * Mengambil daftar Crew gerai untuk workstation penilaian sidebar (SL / DM / Buddy).
 */
const getWorkstationCrews = async (req, res, next) => {
  try {
    const result = await evaluationService.getWorkstationCrews(req.user, req.query);
    return sendSuccess(res, {
      message: 'Daftar kru gerai untuk workstation berhasil diambil.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/crews/:userId/missions
 * Mengambil seluruh kartu misi kru tertentu saat card diklik di sidebar.
 */
const getCrewMissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await evaluationService.getCrewMissions(userId, req.user, req.query);
    return sendSuccess(res, {
      message: 'Daftar misi kru berhasil diambil.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/evaluations/user-missions/:id/buddy-score
 */
const evaluateBuddy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluatorId = req.user?.id || req.user?.userId;
    let { score, notes, evidenceUrl } = req.body;

    if (req.file) {
      evidenceUrl = await uploadFileToStorage(req.file, 'evidence', req);
    }

    const result = await evaluationService.evaluateBuddyMission(id, evaluatorId, {
      score,
      notes,
      evidenceUrl
    });

    return sendSuccess(res, {
      message: 'Misi Buddy berhasil dinilai dan selesai (COMPLETED).',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/evaluations/user-missions/:id/sl-score
 */
const evaluateJourneyBySL = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slId = req.user?.id || req.user?.userId;
    let { score, notes, evidenceUrl } = req.body;

    if (req.file) {
      evidenceUrl = await uploadFileToStorage(req.file, 'evidence', req);
    }

    const data = await evaluationService.evaluateJourneyBySL(id, slId, {
      score,
      notes,
      evidenceUrl
    });

    return sendSuccess(res, {
      message: 'Penilaian Store Leader berhasil disimpan. Menunggu approval District Manager.',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/evaluations/user-missions/:id/dm-review
 */
const reviewJourneyByDM = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dmId = req.user?.id || req.user?.userId;
    const { action, score, notes } = req.body;

    const result = await evaluationService.reviewJourneyByDM(id, dmId, {
      action,
      score,
      notes
    });

    let message = 'Review DM berhasil disimpan.';
    if (action?.toUpperCase() === 'APPROVE') {
      message = 'Misi Journey berhasil disetujui (APPROVED) dan bintang telah diberikan.';
    } else if (action?.toUpperCase() === 'REVISE') {
      message = 'Permintaan revisi telah dikirimkan ke Store Leader.';
    } else if (action?.toUpperCase() === 'REJECT') {
      message = 'Misi Journey telah ditolak.';
    }

    return sendSuccess(res, {
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/evaluations/user-missions/:id/crew-feedback
 */
const submitCrewFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const crewId = req.user?.id || req.user?.userId;
    const { submissionNotes } = req.body;

    const data = await evaluationService.submitCrewFeedback(id, crewId, {
      submissionNotes
    });

    return sendSuccess(res, {
      message: 'Feedback berhasil dikirim. Terima kasih atas masukan Anda!',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/buddy-report/:userId?batchId=...
 * Mengambil data rapor Buddy dalam format JSON.
 */
const getBuddyReport = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { batchId } = req.query;
    const data = await evaluationService.getBuddyReport(userId, batchId, req);

    return sendSuccess(res, {
      message: 'Rapor Buddy berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/buddy-report/:userId/html?batchId=...
 * Mengambil tampilan HTML rapor Buddy resmi Re.juve yang siap dicetak.
 */
const getBuddyReportHtml = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { batchId } = req.query;
    const reportData = await evaluationService.getBuddyReport(userId, batchId, req);
    const html = evaluationService.generateBuddyReportHtml(reportData);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/evaluations/buddy-history
 * Mengambil riwayat pendampingan Buddy per batch.
 */
const getBuddyHistory = async (req, res, next) => {
  try {
    const result = await evaluationService.getBuddyHistory(req.user, req.query);

    return sendSuccess(res, {
      message: 'Riwayat pendampingan Buddy berhasil diambil.',
      data: result.items,
      meta: {
        ...result.pagination,
        summary: result.summary
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserMissions,
  getUserMissionById,
  getWorkstationCrews,
  getCrewMissions,
  evaluateBuddy,
  evaluateJourneyBySL,
  reviewJourneyByDM,
  submitCrewFeedback,
  getBuddyReport,
  getBuddyReportHtml,
  getBuddyHistory
};
