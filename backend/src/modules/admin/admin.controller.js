'use strict';

/**
 * @file admin.controller.js
 * @description Handles CRUD untuk Administration: Settings dan User Policies (dengan search support).
 */

const prisma = require('../../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/responseWrapper');
const { parsePrismaQuery } = require('../../utils/queryParser');

// =============================================================================
// SETTINGS CRUD
// =============================================================================

const getSettings = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    // Searchable: settingName, settingValue, objectCode
    const where = parsePrismaQuery(queryClone, ['settingName', 'settingValue', 'objectCode']);

    const [data, total] = await Promise.all([
      prisma.setting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.setting.count({ where })
    ]);

    return sendPaginated(res, {
      message: 'Daftar settings berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getSettingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await prisma.setting.findUnique({
      where: { settingId: id }
    });

    if (!data) return sendError(res, { statusCode: 404, message: 'Setting tidak ditemukan' });
    return sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

const createSetting = async (req, res, next) => {
  try {
    const { settingName, settingValue, objectCode } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    if (!settingName || settingValue === undefined) {
      return sendError(res, { statusCode: 400, message: 'Field "settingName" dan "settingValue" wajib diisi.' });
    }

    const result = await prisma.setting.create({
      data: {
        settingName,
        settingValue: String(settingValue),
        objectCode: objectCode || 'SETTING',
        createdBy: creatorId
      }
    });

    return sendSuccess(res, { statusCode: 201, message: 'Setting berhasil dibuat', data: result });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: `Setting "${req.body.settingName}" sudah ada.` });
    next(error);
  }
};

const updateSetting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { settingName, settingValue, objectCode } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const data = { updatedBy: updaterId };
    if (settingName !== undefined) data.settingName = settingName;
    if (settingValue !== undefined) data.settingValue = String(settingValue);
    if (objectCode !== undefined) data.objectCode = objectCode;

    const result = await prisma.setting.update({
      where: { settingId: id },
      data
    });

    return sendSuccess(res, { message: 'Setting berhasil diperbarui', data: result });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: `Setting "${req.body.settingName}" sudah ada.` });
    next(error);
  }
};

const deleteSetting = async (req, res, next) => {
  try {
    await prisma.setting.delete({ where: { settingId: req.params.id } });
    return sendSuccess(res, { message: 'Setting berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// USER POLICIES CRUD
// =============================================================================

const getUserPolicies = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    // Searchable: userpolicyCode, userpolicyValue, informationRemark
    const where = parsePrismaQuery(queryClone, ['userpolicyCode', 'userpolicyValue', 'informationRemark']);

    const [data, total] = await Promise.all([
      prisma.userPolicy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      prisma.userPolicy.count({ where })
    ]);

    return sendPaginated(res, {
      message: 'Daftar user policy berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getUserPolicyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await prisma.userPolicy.findUnique({
      where: { userpolicyId: id }
    });

    if (!data) return sendError(res, { statusCode: 404, message: 'User policy tidak ditemukan' });
    return sendSuccess(res, { data });
  } catch (error) {
    next(error);
  }
};

const parseBoolean = (val, defaultValue = false) => {
  if (val === undefined || val === null) return defaultValue;
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === 'y' || s === '1';
  }
  return Boolean(val);
};

const createUserPolicy = async (req, res, next) => {
  try {
    const { userpolicyCode, userpolicyValue, informationRemark, isRules, displayOrder, objectCode } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    if (!userpolicyCode || userpolicyValue === undefined) {
      return sendError(res, { statusCode: 400, message: 'Field "userpolicyCode" dan "userpolicyValue" wajib diisi.' });
    }

    const result = await prisma.userPolicy.create({
      data: {
        userpolicyCode,
        userpolicyValue,
        informationRemark: informationRemark || null,
        isRules: parseBoolean(isRules, false),
        displayOrder: parseInt(displayOrder, 10) || 0,
        objectCode: objectCode || 'USERPOLICY',
        createdBy: creatorId
      }
    });

    return sendSuccess(res, { statusCode: 201, message: 'User policy berhasil dibuat', data: result });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: `Policy "${req.body.userpolicyCode}" sudah ada.` });
    next(error);
  }
};

const updateUserPolicy = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userpolicyCode, userpolicyValue, informationRemark, isRules, displayOrder, objectCode } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const data = { updatedBy: updaterId };
    if (userpolicyCode !== undefined) data.userpolicyCode = userpolicyCode;
    if (userpolicyValue !== undefined) data.userpolicyValue = userpolicyValue;
    if (informationRemark !== undefined) data.informationRemark = informationRemark;
    if (isRules !== undefined) data.isRules = parseBoolean(isRules, false);
    if (displayOrder !== undefined) data.displayOrder = parseInt(displayOrder, 10) || 0;
    if (objectCode !== undefined) data.objectCode = objectCode;

    const result = await prisma.userPolicy.update({
      where: { userpolicyId: id },
      data
    });

    return sendSuccess(res, { message: 'User policy berhasil diperbarui', data: result });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: `Policy "${req.body.userpolicyCode}" sudah ada.` });
    next(error);
  }
};

const deleteUserPolicy = async (req, res, next) => {
  try {
    await prisma.userPolicy.delete({ where: { userpolicyId: req.params.id } });
    return sendSuccess(res, { message: 'User policy berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  getSettingById,
  createSetting,
  updateSetting,
  deleteSetting,
  getUserPolicies,
  getUserPolicyById,
  createUserPolicy,
  updateUserPolicy,
  deleteUserPolicy
};
