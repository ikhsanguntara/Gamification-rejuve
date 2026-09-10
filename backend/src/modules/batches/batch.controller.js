'use strict';

/**
 * @file batch.controller.js
 * @description Controller untuk Batch Management & Mission Generator.
 */

const batchService = require('./batch.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/responseWrapper');

const getBatches = async (req, res, next) => {
  try {
    const { batches, total, page, limit } = await batchService.getBatches(req.query, req.user);
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

const createBatch = async (req, res, next) => {
  try {
    const creatorId = req.user?.id || req.user?.userId || null;
    const batch = await batchService.createBatch(req.body, creatorId);

    return sendSuccess(res, {
      message: 'Batch berhasil dibuat.',
      statusCode: 201,
      data: batch
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, {
        message: `Batch dengan code "${req.body.code}" sudah ada.`,
        statusCode: 409
      });
    }
    next(error);
  }
};

const generateBatchMissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const creatorId = req.user?.id || req.user?.userId || null;
    const result = await batchService.generateBatch(id, creatorId);

    return sendSuccess(res, {
      message: 'Misi batch berhasil di-generate secara atomik.',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updaterId = req.user?.id || req.user?.userId || null;
    const updated = await batchService.updateBatch(id, req.body, updaterId);

    if (!updated) {
      return sendError(res, {
        message: `Batch dengan id "${id}" tidak ditemukan.`,
        statusCode: 404
      });
    }

    return sendSuccess(res, {
      message: 'Data batch berhasil diperbarui.',
      data: updated
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, {
        message: `Batch dengan code "${req.body.code}" sudah ada.`,
        statusCode: 409
      });
    }
    next(error);
  }
};

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
      message: 'Batch berhasil dihapus.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

const toggleBatchDetailLock = async (req, res, next) => {
  try {
    const { batchId, batchDetailId } = req.params;
    const updaterId = req.user?.id || req.user?.userId || null;
    const result = await batchService.toggleBatchDetailLock(batchId, batchDetailId, req.body, updaterId);

    return sendSuccess(res, {
      message: result.message,
      data: result
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
  deleteBatch,
  toggleBatchDetailLock
};
