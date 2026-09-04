'use strict';

/**
 * @file template.service.js
 * @description Service layer untuk Unified Template Missions (m_tpl_missions & m_tpl_mission_details) dengan search support.
 */

const prisma = require('../../config/db');
const { parsePrismaQuery } = require('../../utils/queryParser');

/**
 * Ambil daftar template dengan filter & pagination dinamis.
 */
const getTemplates = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;

  const queryClone = { ...query };
  const includeDetails = queryClone.includeDetails !== 'false';
  delete queryClone.includeDetails;
  delete queryClone.page;
  delete queryClone.limit;

  // Searchable: code, name, description
  const where = parsePrismaQuery(queryClone, ['code', 'name', 'description']);

  const [total, templates] = await Promise.all([
    prisma.tplMission.count({ where }),
    prisma.tplMission.findMany({
      where,
      skip,
      take: limit,
      include: {
        details: includeDetails ? {
          orderBy: [
            { durationNumber: 'asc' },
            { tplMissionDetailId: 'asc' }
          ]
        } : false
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return { templates, total, page, limit };
};

/**
 * Ambil template berdasarkan ID beserta butir misinya.
 */
const getTemplateById = async (id) => {
  const template = await prisma.tplMission.findUnique({
    where: { tplMissionId: id },
    include: {
      details: {
        orderBy: [
          { durationNumber: 'asc' },
          { tplMissionDetailId: 'asc' }
        ]
      }
    }
  });

  if (!template) {
    return null;
  }

  const durationTotal = template.details.length
    ? Math.max(...template.details.map(detail => detail.durationNumber))
    : 0;

  return {
    ...template,
    durationTotal
  };
};

/**
 * Buat template baru secara atomik bersama detailnya.
 */
const createTemplate = async (payload, userId = null) => {
  const {
    code,
    name,
    type,
    durationCode = 'WEEK',
    durationValue = 1,
    description = null,
    details = []
  } = payload;

  const defaultScaleConfig = {
    min: 0,
    max: 100,
    step: 10,
    starPerStep: 1
  };

  const createdTemplate = await prisma.$transaction(async (tx) => {
    const template = await tx.tplMission.create({
      data: {
        code,
        name,
        type,
        durationCode,
        durationValue: Number(durationValue) || 1,
        description,
        createdBy: userId
      }
    });

    if (Array.isArray(details) && details.length > 0) {
      const detailData = details.map((d) => ({
        tplMissionId: template.tplMissionId,
        missionTitle: d.missionTitle,
        description: d.description || null,
        category: d.category || 'TECHNICAL',
        durationNumber: Number(d.durationNumber) || 1,
        inputType: d.inputType || 'SCALE',
        scaleConfig: d.scaleConfig || (d.inputType === 'SCALE' ? defaultScaleConfig : null),
        sopChecklist: d.sopChecklist || null
      }));

      await tx.tplMissionDetail.createMany({ data: detailData });
    }

    return await tx.tplMission.findUnique({
      where: { tplMissionId: template.tplMissionId },
      include: {
        details: {
          orderBy: [
            { durationNumber: 'asc' },
            { tplMissionDetailId: 'asc' }
          ]
        }
      }
    });
  });

  return createdTemplate;
};

/**
 * Update template beserta detailnya secara atomik.
 */
const updateTemplate = async (id, payload, userId = null) => {
  const {
    code,
    name,
    type,
    durationCode,
    durationValue,
    description,
    details
  } = payload;

  const defaultScaleConfig = {
    min: 0,
    max: 100,
    step: 10,
    starPerStep: 1
  };

  const updatedTemplate = await prisma.$transaction(async (tx) => {
    const dataToUpdate = {
      updatedBy: userId
    };
    if (code !== undefined) dataToUpdate.code = code;
    if (name !== undefined) dataToUpdate.name = name;
    if (type !== undefined) dataToUpdate.type = type;
    if (durationCode !== undefined) dataToUpdate.durationCode = durationCode;
    if (durationValue !== undefined) dataToUpdate.durationValue = Number(durationValue);
    if (description !== undefined) dataToUpdate.description = description;

    await tx.tplMission.update({
      where: { tplMissionId: id },
      data: dataToUpdate
    });

    if (Array.isArray(details)) {
      await tx.tplMissionDetail.deleteMany({
        where: { tplMissionId: id }
      });

      if (details.length > 0) {
        const detailData = details.map((d) => ({
          tplMissionId: id,
          missionTitle: d.missionTitle,
          description: d.description || null,
          category: d.category || 'TECHNICAL',
          durationNumber: Number(d.durationNumber) || 1,
          inputType: d.inputType || 'SCALE',
          scaleConfig: d.scaleConfig || (d.inputType === 'SCALE' ? defaultScaleConfig : null),
          sopChecklist: d.sopChecklist || null
        }));

        await tx.tplMissionDetail.createMany({ data: detailData });
      }
    }

    return await tx.tplMission.findUnique({
      where: { tplMissionId: id },
      include: {
        details: {
          orderBy: [
            { durationNumber: 'asc' },
            { tplMissionDetailId: 'asc' }
          ]
        }
      }
    });
  });

  return updatedTemplate;
};

/**
 * Hapus template (detail akan otomatis terhapus via onDelete: Cascade).
 */
const deleteTemplate = async (id, userId = null) => {
  const existing = await prisma.tplMission.findUnique({
    where: { tplMissionId: id }
  });

  if (!existing) {
    return null;
  }

  await prisma.tplMission.delete({
    where: { tplMissionId: id }
  });

  return true;
};

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
