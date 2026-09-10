'use strict';

/**
 * @file gamification.controller.js
 * @description Controller untuk fitur Gamifikasi Re.juve (Leaderboard, Level Peringkat, & Star Progression).
 */

const gamificationService = require('./gamification.service');
const { sendSuccess } = require('../../utils/responseWrapper');

/**
 * GET /api/gamification/leaderboard
 * Mengambil klasemen kru (Top 3 Podium, tabel peringkat lengkap, dan rank saya).
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || req.user?.userId || null;
    const { batchId, search, q, page, limit } = req.query;

    // Handle departmentId baik plain maupun format Prisma dynamic filter departmentId[equals]
    let departmentId = req.query.departmentId;
    if (typeof departmentId === 'object' && departmentId !== null) {
      departmentId = departmentId.equals || departmentId.in?.[0] || null;
    }

    const result = await gamificationService.getLeaderboard({
      batchId: batchId || null,
      departmentId: departmentId || null,
      search: search || q || '',
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 10,
      currentUserId
    });

    return sendSuccess(res, {
      message: 'Leaderboard berhasil diambil.',
      data: result,
      meta: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard
};
