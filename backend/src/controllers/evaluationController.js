'use strict';

/**
 * @file evaluationController.js
 * @description Controller untuk alur evaluasi terpadu (Thin Controller delegating to evaluationService).
 */

const evaluationService = require('../services/evaluationService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');
const { uploadFileToStorage } = require('../utils/minioStorage');

/**
 * GET /api/evaluations/user-missions
 */
const getUserMissions = async (req, res, next) => {
  try {
    const { userMissions, total, page, limit } = await evaluationService.getUserMissions(req.query);
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
 * POST /api/evaluations/user-missions/:id/buddy-score
 * Penilaian oleh Buddy -> Langsung COMPLETED
 */
const evaluateBuddy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluatorId = req.user?.id || req.user?.userId;
    let { score, notes, evidenceUrl } = req.body;

    // Jika ada upload file evidence (multipart/form-data)
    if (req.file) {
      evidenceUrl = await uploadFileToStorage(req.file, 'evidence');
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
 * Penilaian oleh Store Leader -> Status SCORED_BY_TL
 */
const evaluateJourneyBySL = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slId = req.user?.id || req.user?.userId;
    let { score, notes, evidenceUrl } = req.body;

    // Jika ada upload file evidence (multipart/form-data)
    if (req.file) {
      evidenceUrl = await uploadFileToStorage(req.file, 'evidence');
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
 * Review oleh District Manager (APPROVE / REVISE / REJECT)
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
 * Pengisian teks masukan oleh Crew di akhir journey -> Status COMPLETED
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

module.exports = {
  getUserMissions,
  getUserMissionById,
  evaluateBuddy,
  evaluateJourneyBySL,
  reviewJourneyByDM,
  submitCrewFeedback
};
