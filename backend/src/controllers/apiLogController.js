'use strict';

const prisma = require('../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');
const { parsePrismaQuery } = require('../utils/queryParser');

/**
 * Mendapatkan daftar API Log dengan paginasi dan fitur filter lanjut.
 * @route GET /api/v1/api-logs
 */
const getApiLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    // Mendukung fitur filter menggunakan queryParser bawaan
    const where = parsePrismaQuery(req.query);

    // Ambil data log dan total berbarengan
    const [total, data] = await Promise.all([
      prisma.apiLog.count({ where }),
      prisma.apiLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' } // Urutkan dari yang terbaru secara default
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
