'use strict';

/**
 * @file batchController.js
 * @description Controller untuk Batch Management & Mission Generator (Thin Controller delegating to batchService).
 */

const batchService = require('../services/batchService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');

/**
 * GET /api/batches
 */
const getBatches = async (req, res, next) => {
  try {
    const { batches, total, page, limit } = await batchService.getBatches(req.query);
    return sendPaginated(res, {
      message: 'Daftar batch berhasil diambil.',
      data: batches,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/batches/:id
 */
const getBatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await batchService.getBatchById(id);

    if (!batch) {
      return sendError(res, {
        message: `Batch dengan id "${id}" tidak ditemukan.`,
        statusCode: 404
      });
    }

    return sendSuccess(res, {
      message: 'Detail batch berhasil diambil.',
      data: batch
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/batches
 */
const createBatch = async (req, res, next) => {
  try {
    const creatorId = req.user?.id || req.user?.userId || null;
    const batch = await batchService.createBatch(req.body, creatorId);

    return sendSuccess(res, {
      statusCode: 201,
      message: batch.status === 'OPEN'
        ? 'Batch berhasil dibuat dan misi telah di-generate secara atomik.'
        : 'Batch berhasil disimpan sebagai DRAFT.',
      data: batch
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, {
        statusCode: 409,
        message: `Kode batch "${req.body.code}" sudah digunakan.`
      });
    }
    next(error);
  }
};

/**
 * POST /api/batches/:id/generate
 */
const generateBatchMissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const creatorId = req.user?.id || req.user?.userId || null;
    const result = await batchService.generateBatch(id, creatorId);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Misi untuk batch ini berhasil di-generate secara atomik.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/batches/:id
 */
const updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updaterId = req.user?.id || req.user?.userId || null;
    const batch = await batchService.updateBatch(id, req.body, updaterId);

    if (!batch) {
      return sendError(res, {
        message: `Batch dengan id "${id}" tidak ditemukan.`,
        statusCode: 404
      });
    }

    return sendSuccess(res, {
      message: 'Data batch berhasil diperbarui.',
      data: batch
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/batches/:id
 */
const deleteBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updaterId = req.user?.id || req.user?.userId || null;
    const deleted = await batchService.deleteBatch(id, updaterId);

    if (!deleted) {
      return sendError(res, {
        message: `Batch dengan id "${id}" tidak ditemukan.`,
        statusCode: 404
      });
    }

    return sendSuccess(res, {
      message: 'Batch berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  generateBatchMissions,
  updateBatch,
  deleteBatch
};
