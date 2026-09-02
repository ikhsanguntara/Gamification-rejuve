'use strict';
const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseWrapper');

const { parsePrismaQuery } = require('../utils/queryParser');

// =============================================================================
// Param Group CRUD
// =============================================================================

const getParamGroups = async (req, res, next) => {
  try {
    const where = parsePrismaQuery(req.query);
    const groups = await prisma.paramGroup.findMany({
      where,
      include: { params: true },
      orderBy: { code: 'asc' }
    });
    return sendSuccess(res, { data: groups });
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
    const { code, name, isActive } = req.body;
    const result = await prisma.paramGroup.create({
      data: { code, name, isActive }
    });
    return sendSuccess(res, { statusCode: 201, message: 'ParamGroup dibuat', data: result });
  } catch (error) {
    next(error);
  }
};

const updateParamGroup = async (req, res, next) => {
  try {
    const { code, name, isActive } = req.body;
    const result = await prisma.paramGroup.update({
      where: { paramgroupId: req.params.id },
      data: { code, name, isActive }
    });
    return sendSuccess(res, { message: 'ParamGroup diupdate', data: result });
  } catch (error) {
    next(error);
  }
};

const deleteParamGroup = async (req, res, next) => {
  try {
    await prisma.paramGroup.delete({
      where: { paramgroupId: req.params.id }
    });
    return sendSuccess(res, { message: 'ParamGroup dihapus' });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// Param CRUD
// =============================================================================

const getParams = async (req, res, next) => {
  try {
    const where = parsePrismaQuery(req.query);
    const params = await prisma.param.findMany({
      where,
      include: { paramgroup: { select: { name: true, code: true } } },
      orderBy: { code: 'asc' }
    });
    return sendSuccess(res, { data: params });
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

const createParam = async (req, res, next) => {
  try {
    const { paramgroupId, code, value, isActive } = req.body;
    const result = await prisma.param.create({
      data: { paramgroupId, code, value, isActive }
    });
    return sendSuccess(res, { statusCode: 201, message: 'Param dibuat', data: result });
  } catch (error) {
    next(error);
  }
};

const updateParam = async (req, res, next) => {
  try {
    const { paramgroupId, code, value, isActive } = req.body;
    const result = await prisma.param.update({
      where: { paramId: req.params.id },
      data: { paramgroupId, code, value, isActive }
    });
    return sendSuccess(res, { message: 'Param diupdate', data: result });
  } catch (error) {
    next(error);
  }
};

const deleteParam = async (req, res, next) => {
  try {
    await prisma.param.delete({
      where: { paramId: req.params.id }
    });
    return sendSuccess(res, { message: 'Param dihapus' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParamGroups, getParamGroupById, createParamGroup, updateParamGroup, deleteParamGroup,
  getParams, getParamById, createParam, updateParam, deleteParam
};
