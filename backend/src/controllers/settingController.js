'use strict';
const prisma = require('../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');
const { parsePrismaQuery } = require('../utils/queryParser');

// =============================================================================
// SETTINGS
// =============================================================================

const getSettings = async (req, res) => {
  try {
    const filterOptions = parsePrismaQuery(req.query);
    const data = await prisma.setting.findMany({
      where: filterOptions,
      orderBy: { createdAt: 'desc' }
    });
    return sendSuccess(res, { statusCode: 200, message: 'Settings retrieved', data });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to retrieve settings', data: error.message });
  }
};

const createSetting = async (req, res) => {
  try {
    const { settingName, settingValue, objectCode, companyId } = req.body;
    const setting = await prisma.setting.create({
      data: {
        settingName,
        settingValue,
        objectCode: objectCode || 'SETTING',
        companyId: companyId || null,
        createdBy: req.user.id
      }
    });
    return sendSuccess(res, { statusCode: 201, message: 'Setting created', data: setting });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to create setting', data: error.message });
  }
};

// =============================================================================
// USER POLICIES
// =============================================================================

const getUserPolicies = async (req, res) => {
  try {
    const filterOptions = parsePrismaQuery(req.query);
    const data = await prisma.userPolicy.findMany({
      where: filterOptions,
      orderBy: { displayOrder: 'asc' }
    });
    return sendSuccess(res, { statusCode: 200, message: 'User policies retrieved', data });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to retrieve user policies', data: error.message });
  }
};

const createUserPolicy = async (req, res) => {
  try {
    const { userpolicyCode, userpolicyValue, informationRemark, isRules, displayOrder, objectCode } = req.body;
    const policy = await prisma.userPolicy.create({
      data: {
        userpolicyCode,
        userpolicyValue,
        informationRemark,
        isRules: isRules || 'N',
        displayOrder,
        objectCode: objectCode || 'USERPOLICY',
        createdBy: req.user.id
      }
    });
    return sendSuccess(res, { statusCode: 201, message: 'User policy created', data: policy });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to create user policy', data: error.message });
  }
};

module.exports = {
  getSettings,
  createSetting,
  getUserPolicies,
  createUserPolicy
};
