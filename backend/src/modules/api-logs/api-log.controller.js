'use strict';

/**
 * @file api-log.controller.js
 * @description Controller untuk pemantauan API Log (SUPERADMIN).
 */

const prisma = require('../../config/db');
const { sendPaginated } = require('../../utils/responseWrapper');
const { parsePrismaQuery } = require('../../utils/queryParser');

/**
 * Mendapatkan daftar API Log dengan paginasi dan filter.
 * @route GET /api/api-logs
 */
const getApiLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    const where = parsePrismaQuery(queryClone, ['method', 'url']);

    const [total, data] = await Promise.all([
      prisma.apiLog.count({ where }),
      prisma.apiLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' }
      })
    ]);

    return sendPaginated(res, {
      message: 'Daftar API Log berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApiLogs
};
