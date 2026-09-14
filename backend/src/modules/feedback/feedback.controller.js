'use strict';

const feedbackService = require('./feedback.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/responseWrapper');

const getQuestions = async (req, res, next) => {
  try {
    const questions = await feedbackService.getQuestions(req.query);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Daftar butir pertanyaan survei onboarding berhasil diambil.',
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

const submitSurvey = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || req.user?.userId;
    const { batchId, crewName, storeLocation, buddyName, ratings, essayAnswer } = req.body;
    const crewId = req.body.crewId || currentUserId;

    if (!crewId) {
      return sendError(res, { statusCode: 400, message: 'ID Kru (crewId) wajib dicantumkan.' });
    }
    if (!ratings || typeof ratings !== 'object') {
      return sendError(res, { statusCode: 400, message: 'Objek jawaban ratings wajib diisi.' });
    }

    const saved = await feedbackService.submitSurvey({
      crewId,
      batchId,
      crewName: crewName || req.user?.name || 'Kru Re.juve',
      storeLocation: storeLocation || 'Gerai Re.juve',
      buddyName: buddyName || 'Store Leader',
      ratings,
      essayAnswer
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Feedback onboarding kru berhasil disimpan.',
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

const getSurveys = async (req, res, next) => {
  try {
    const { data, total, page, limit } = await feedbackService.getSurveys(req.query);
    return sendPaginated(res, {
      message: 'Daftar hasil survei feedback kru berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getSurveyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const feedback = await feedbackService.getSurveyById(id);
    if (!feedback) {
      return sendError(res, { statusCode: 404, message: 'Data feedback tidak ditemukan.' });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Detail feedback berhasil diambil.',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

const getMyFeedback = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || req.user?.userId;
    if (!currentUserId) {
      return sendError(res, { statusCode: 401, message: 'User tidak terautentikasi.' });
    }

    const feedback = await feedbackService.getMyFeedback(currentUserId);
    return sendSuccess(res, {
      statusCode: 200,
      message: feedback ? 'Data feedback ditemukan.' : 'Belum ada feedback yang disubmit.',
      data: feedback || null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  submitSurvey,
  getSurveys,
  getSurveyById,
  getMyFeedback
};
