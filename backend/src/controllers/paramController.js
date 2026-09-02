'use strict';

/**
 * @file paramController.js
 * @description Handles CRUD untuk Bisnis Parameter: Param Group dan Param.
 */

const prisma = require('../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');
const { parsePrismaQuery } = require('../utils/queryParser');

// =============================================================================
// Param Group CRUD
// =============================================================================

const getParamGroups = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    const where = parsePrismaQuery(queryClone);

    const [data, total] = await Promise.all([
      prisma.paramGroup.findMany({
        where,
        skip,
        take: limit,
        include: { params: true },
        orderBy: { code: 'asc' }
      }),
      prisma.paramGroup.count({ where })
    ]);

    return sendPaginated(res, {
      message: 'Daftar ParamGroup berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getParamGroupById = async (req, res, next) => {
  try {
    const group = await prisma.paramGroup.findUnique({
      where: { paramgroupId: req.params.id },
      include: { params: true }
    });

    if (!group) return sendError(res, { statusCode: 404, message: 'ParamGroup tidak ditemukan' });
    return sendSuccess(res, { data: group });
  } catch (error) {
    next(error);
  }
};

const createParamGroup = async (req, res, next) => {
  try {
    const { code, name, value, isActive } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    if (!code) {
      return sendError(res, { statusCode: 400, message: 'Field "code" wajib diisi untuk membuat Param Group.' });
    }

    const groupName = name || value || code;

    const result = await prisma.paramGroup.create({
      data: {
        code,
        name: groupName,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: creatorId
      }
    });

    return sendSuccess(res, { statusCode: 201, message: 'ParamGroup berhasil dibuat', data: result });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: `Kode group "${req.body.code}" sudah digunakan.` });
    next(error);
  }
};

const updateParamGroup = async (req, res, next) => {
  try {
    const { code, name, isActive } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const result = await prisma.paramGroup.update({
      where: { paramgroupId: req.params.id },
      data: {
        code,
        name,
        isActive,
        updatedBy: updaterId
      }
    });

    return sendSuccess(res, { message: 'ParamGroup berhasil diperbarui', data: result });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: `Kode group "${req.body.code}" sudah digunakan.` });
    next(error);
  }
};

const deleteParamGroup = async (req, res, next) => {
  try {
    await prisma.paramGroup.delete({
      where: { paramgroupId: req.params.id }
    });
    return sendSuccess(res, { message: 'ParamGroup berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// Param CRUD
// =============================================================================

const getParams = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    const where = parsePrismaQuery(queryClone);

    const [data, total] = await Promise.all([
      prisma.param.findMany({
        where,
        skip,
        take: limit,
        include: { paramgroup: { select: { name: true, code: true } } },
        orderBy: { code: 'asc' }
      }),
      prisma.param.count({ where })
    ]);

    return sendPaginated(res, {
      message: 'Daftar Param berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getParamById = async (req, res, next) => {
  try {
    const param = await prisma.param.findUnique({
      where: { paramId: req.params.id },
      include: { paramgroup: { select: { name: true, code: true } } }
    });

    if (!param) return sendError(res, { statusCode: 404, message: 'Param tidak ditemukan' });
    return sendSuccess(res, { data: param });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/params/group-code/:groupCode
 * Endpoint khusus untuk FE: mengambil param berdasarkan groupCode dan memformatnya jadi dictionary options
 * Output: { paramGroup, options: { [code]: value }, list: [...] }
 */
const getParamsByGroupCode = async (req, res, next) => {
  try {
    const { groupCode } = req.params;
    const group = await prisma.paramGroup.findUnique({
      where: { code: groupCode },
      include: {
        params: {
          where: { isActive: true },
          orderBy: { code: 'asc' }
        }
      }
    });

    if (!group) {
      return sendError(res, {
        statusCode: 404,
        message: `ParamGroup dengan code "${groupCode}" tidak ditemukan.`
      });
    }

    const options = {};
    for (const p of group.params) {
      options[p.code] = p.value;
    }

    return sendSuccess(res, {
      message: `Parameter untuk group "${groupCode}" berhasil diambil.`,
      data: {
        paramGroup: {
          paramgroupId: group.paramgroupId,
          code: group.code,
          name: group.name
        },
        options,
        list: group.params
      }
    });
  } catch (error) {
    next(error);
  }
};

const createParam = async (req, res, next) => {
  try {
    const { paramgroupId, paramgroupCode, groupCode, code, value, isActive } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    if (!code || value === undefined) {
      return sendError(res, { statusCode: 400, message: 'Field "code" dan "value" wajib diisi untuk membuat Param.' });
    }

    let targetGroupId = paramgroupId;

    // Jika paramgroupId tidak diisi, coba lookup berdasarkan paramgroupCode / groupCode
    const targetGroupCode = paramgroupCode || groupCode;
    if (!targetGroupId && targetGroupCode) {
      const group = await prisma.paramGroup.findUnique({
        where: { code: targetGroupCode }
      });
      if (group) {
        targetGroupId = group.paramgroupId;
      } else {
        return sendError(res, {
          statusCode: 404,
          message: `Param Group dengan code "${targetGroupCode}" tidak ditemukan.`
        });
      }
    }

    if (!targetGroupId) {
      return sendError(res, {
        statusCode: 400,
        message: 'Field "paramgroupId" atau "paramgroupCode" wajib diisi untuk membuat Param. Jika Anda bermaksud membuat Header/Group Parameter baru (contoh: "REGION_STORE"), silakan gunakan endpoint POST /api/params/groups.'
      });
    }

    const result = await prisma.param.create({
      data: {
        paramgroupId: targetGroupId,
        code,
        value,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: creatorId
      }
    });

    return sendSuccess(res, { statusCode: 201, message: 'Param berhasil dibuat', data: result });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: `Kode param "${req.body.code}" sudah digunakan.` });
    next(error);
  }
};

const updateParam = async (req, res, next) => {
  try {
    const { paramgroupId, code, value, isActive } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const result = await prisma.param.update({
      where: { paramId: req.params.id },
      data: {
        paramgroupId,
        code,
        value,
        isActive,
        updatedBy: updaterId
      }
    });

    return sendSuccess(res, { message: 'Param berhasil diperbarui', data: result });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: `Kode param "${req.body.code}" sudah digunakan.` });
    next(error);
  }
};

const deleteParam = async (req, res, next) => {
  try {
    await prisma.param.delete({
      where: { paramId: req.params.id }
    });
    return sendSuccess(res, { message: 'Param berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParamGroups,
  getParamGroupById,
  createParamGroup,
  updateParamGroup,
  deleteParamGroup,
  getParams,
  getParamById,
  getParamsByGroupCode,
  createParam,
  updateParam,
  deleteParam
};
