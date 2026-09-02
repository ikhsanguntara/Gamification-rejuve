'use strict';

/**
 * @file tplMissionController.js
 * @description Controller untuk Unified Template Missions (Thin Controller delegating to templateService).
 */

const templateService = require('../services/templateService');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');

const getTemplates = async (req, res, next) => {
  try {
    const { templates, total, page, limit } = await templateService.getTemplates(req.query);
    return sendPaginated(res, {
      message: 'Daftar template misi berhasil diambil.',
      data: templates,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await templateService.getTemplateById(id);

    if (!data) {
      return sendError(res, {
        statusCode: 404,
        message: `Template misi dengan id "${id}" tidak ditemukan.`
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Detail template misi berhasil ditemukan.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createTemplate = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId || null;
    const data = await templateService.createTemplate(req.body, userId);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Template misi berhasil dibuat.',
      data
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, {
        statusCode: 409,
        message: `Kode template "${req.body.code}" sudah digunakan.`
      });
    }
    next(error);
  }
};

const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || null;
    const data = await templateService.updateTemplate(id, req.body, userId);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Template misi berhasil diperbarui.',
      data
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, {
        statusCode: 409,
        message: `Kode template "${req.body.code}" sudah digunakan.`
      });
    }
    next(error);
  }
};

const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || null;
    const deleted = await templateService.deleteTemplate(id, userId);

    if (!deleted) {
      return sendError(res, {
        statusCode: 404,
        message: `Template misi dengan id "${id}" tidak ditemukan.`
      });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Template misi berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
