'use strict';
const prisma = require('../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');
const { parsePrismaQuery } = require('../utils/queryParser');

// =============================================================================
// UNIFIED TEMPLATE MISSIONS
// =============================================================================

const getTemplates = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;
    
    // Default to include details so FE can see the package contents
    const includeDetails = req.query.includeDetails !== 'false';
    delete req.query.includeDetails;

    const filterOptions = parsePrismaQuery(req.query);

    const [data, total] = await Promise.all([
      prisma.tplMission.findMany({
        where: filterOptions,
        skip,
        take: limit,
        include: { details: includeDetails },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tplMission.count({ where: filterOptions })
    ]);

    return sendPaginated(res, { message: 'Templates retrieved', data, total, page, limit });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to retrieve templates', data: error.message });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await prisma.tplMission.findUnique({
      where: { tplMissionId: id },
      include: { details: true }
    });

    if (!data) return sendError(res, { statusCode: 404, message: 'Template not found' });
    return sendSuccess(res, { statusCode: 200, message: 'Template found', data });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to retrieve template', data: error.message });
  }
};

const createTemplate = async (req, res) => {
  try {
    const { code, name, type, durationCode, durationValue, description, details } = req.body;

    // Pakai transaction agar master & detail diinsert atomic
    const data = await prisma.$transaction(async (tx) => {
      const template = await tx.tplMission.create({
        data: {
          code, name, type, durationCode, durationValue, description,
          createdBy: req.user.id
        }
      });

      if (details && Array.isArray(details) && details.length > 0) {
        const detailData = details.map(d => ({
          tplMissionId: template.tplMissionId,
          missionTitle: d.missionTitle,
          description: d.description || null,
          category: d.category || 'TECHNICAL'
        }));
        await tx.tplMissionDetail.createMany({ data: detailData });
      }

      return await tx.tplMission.findUnique({
        where: { tplMissionId: template.tplMissionId },
        include: { details: true }
      });
    });

    return sendSuccess(res, { statusCode: 201, message: 'Template created', data });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: 'Template code exists' });
    return sendError(res, { statusCode: 500, message: 'Failed to create template', data: error.message });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, type, durationCode, durationValue, description, details } = req.body;

    const data = await prisma.$transaction(async (tx) => {
      const template = await tx.tplMission.update({
        where: { tplMissionId: id },
        data: {
          code, name, type, durationCode, durationValue, description,
          updatedBy: req.user.id
        }
      });

      // Update details: hapus yg lama, insert ulang
      if (details && Array.isArray(details)) {
        await tx.tplMissionDetail.deleteMany({ where: { tplMissionId: id } });
        if (details.length > 0) {
          const detailData = details.map(d => ({
            tplMissionId: id,
            missionTitle: d.missionTitle,
            description: d.description || null,
            category: d.category || 'TECHNICAL'
          }));
          await tx.tplMissionDetail.createMany({ data: detailData });
        }
      }

      return await tx.tplMission.findUnique({
        where: { tplMissionId: id },
        include: { details: true }
      });
    });

    return sendSuccess(res, { statusCode: 200, message: 'Template updated', data });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to update template', data: error.message });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tplMission.delete({ where: { tplMissionId: id } });
    // details cascade deleted otomatis oleh db

    return sendSuccess(res, { statusCode: 200, message: 'Template deleted' });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to delete template', data: error.message });
  }
};

module.exports = {
  getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate
};
