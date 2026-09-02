'use strict';
const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseWrapper');

// POST /sync/departments
const syncDepartments = async (req, res) => {
  try {
    const departments = req.body;
    
    if (!Array.isArray(departments)) {
      return sendError(res, { statusCode: 400, message: 'Payload must be an array' });
    }

    const results = [];
    
    await prisma.$transaction(async (tx) => {
      for (const dept of departments) {
        const result = await tx.department.upsert({
          where: { departmentId: dept.departmentId },
          update: {
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
            isBuddy: dept.isBuddy !== undefined ? dept.isBuddy : false,
            userSlId: dept.userSlId || null,
            userDmId: dept.userDmId || null,
          },
          create: {
            departmentId: dept.departmentId,
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
            isBuddy: dept.isBuddy !== undefined ? dept.isBuddy : false,
            userSlId: dept.userSlId || null,
            userDmId: dept.userDmId || null,
          }
        });
        results.push(result.departmentId);
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `${results.length} departments synced successfully`,
      data: results
    });

  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to sync departments',
      data: error.message
    });
  }
};

// POST /sync/users
const syncUsers = async (req, res) => {
  try {
    const users = req.body;
    
    if (!Array.isArray(users)) {
      return sendError(res, { statusCode: 400, message: 'Payload must be an array' });
    }

    const results = [];
    
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        const result = await tx.user.upsert({
          where: { userId: user.userId },
          update: {
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role,
            isActive: user.isActive !== undefined ? user.isActive : true,
            departmentBuddyId: user.departmentBuddyId || null,
            departmentId: user.departmentId || null,
            batchId: user.batchId || null,
          },
          create: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            password: user.password, 
            role: user.role,
            isActive: user.isActive !== undefined ? user.isActive : true,
            departmentBuddyId: user.departmentBuddyId || null,
            departmentId: user.departmentId || null,
            batchId: user.batchId || null,
          }
        });
        results.push(result.userId);
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: `${results.length} users synced successfully`,
      data: results
    });

  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: 'Failed to sync users',
      data: error.message
    });
  }
};

const axios = require('axios');

// POST /sync/departments/pull-all
const pullAllDepartments = async (req, res) => {
  try {
    const lynxBaseUrl = process.env.LYNX_API_URL;
    const lynxToken = process.env.LYNX_API_TOKEN;

    if (!lynxBaseUrl) return sendError(res, { statusCode: 500, message: 'LYNX_API_URL is not set' });

    const response = await axios.get(`${lynxBaseUrl}/gamification/departments`, {
      headers: { 'Authorization': `Bearer ${lynxToken}` }
    });

    const departments = response.data;
    if (!Array.isArray(departments)) return sendError(res, { statusCode: 500, message: 'Invalid data format from Lynx' });

    const results = [];
    await prisma.$transaction(async (tx) => {
      for (const dept of departments) {
        // Map Lynx array back to Prisma format, fallbacks for safety
        const result = await tx.department.upsert({
          where: { departmentId: dept.departmentId },
          update: {
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
            isBuddy: dept.isBuddy !== undefined ? dept.isBuddy : false,
            userSlId: dept.userSlId || null,
            userDmId: dept.userDmId || null,
          },
          create: {
            departmentId: dept.departmentId,
            departmentCode: dept.departmentCode,
            departmentName: dept.departmentName,
            isActive: dept.isActive !== undefined ? dept.isActive : true,
            isBuddy: dept.isBuddy !== undefined ? dept.isBuddy : false,
            userSlId: dept.userSlId || null,
            userDmId: dept.userDmId || null,
          }
        });
        results.push(result.departmentId);
      }
    });

    return sendSuccess(res, { statusCode: 200, message: `Successfully pulled and upserted ${results.length} departments`, data: results });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to pull departments from Lynx', data: error.message });
  }
};

// POST /sync/users/pull-all
const pullAllUsers = async (req, res) => {
  try {
    const lynxBaseUrl = process.env.LYNX_API_URL;
    const lynxToken = process.env.LYNX_API_TOKEN;

    if (!lynxBaseUrl) return sendError(res, { statusCode: 500, message: 'LYNX_API_URL is not set' });

    const response = await axios.get(`${lynxBaseUrl}/gamification/users`, {
      headers: { 'Authorization': `Bearer ${lynxToken}` }
    });

    const users = response.data;
    if (!Array.isArray(users)) return sendError(res, { statusCode: 500, message: 'Invalid data format from Lynx' });

    const results = [];
    await prisma.$transaction(async (tx) => {
      for (const user of users) {
        // Mapping role jika berbeda antara Lynx dan Gamification
        let mappedRole = user.role;
        if (mappedRole === 'CREW_STORE') mappedRole = 'CREW'; 
        // pastikan role ada di enum (SUPERADMIN, HEAD, SUPERVISOR, CREW)
        if (!['SUPERADMIN', 'HEAD', 'SUPERVISOR', 'CREW'].includes(mappedRole)) mappedRole = 'CREW';

        const result = await tx.user.upsert({
          where: { userId: user.userId },
          update: {
            name: user.name,
            email: user.email,
            password: user.password || 'no-pass',
            role: mappedRole,
            isActive: user.isActive !== undefined ? user.isActive : true,
            departmentBuddyId: user.departmentBuddyId || null,
            departmentId: user.departmentId || null,
            batchId: user.batchId || null,
          },
          create: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            password: user.password || 'no-pass', 
            role: mappedRole,
            isActive: user.isActive !== undefined ? user.isActive : true,
            departmentBuddyId: user.departmentBuddyId || null,
            departmentId: user.departmentId || null,
            batchId: user.batchId || null,
          }
        });
        results.push(result.userId);
      }
    });

    return sendSuccess(res, { statusCode: 200, message: `Successfully pulled and upserted ${results.length} users`, data: results });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to pull users from Lynx', data: error.message });
  }
};

module.exports = {
  syncDepartments,
  syncUsers,
  pullAllDepartments,
  pullAllUsers
};
