'use strict';

const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');
const { parsePrismaQuery } = require('../utils/queryParser');
const { pushToLynx } = require('../utils/lynxSync');

// =============================================================================
// DEPARTMENTS
// =============================================================================

const getDepartments = async (req, res, next) => {
  try {
    const filterOptions = parsePrismaQuery(req.query);
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.department.findMany({
        where: filterOptions, skip, take: limit
      }),
      prisma.department.count({ where: filterOptions })
    ]);

    return sendPaginated(res, { message: 'Departments retrieved', data, total, page, limit });
  } catch (error) { next(error); }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const data = await prisma.department.findUnique({
      where: { departmentId: req.params.id }
    });
    if (!data) return sendError(res, { statusCode: 404, message: 'Department not found' });
    return sendSuccess(res, { data });
  } catch (error) { next(error); }
};

const createDepartment = async (req, res) => {
  try {
    const { departmentCode, departmentName, regionCode, isActive, userSlId, userDmId } = req.body;
    
    const department = await prisma.department.create({
      data: {
        departmentCode,
        departmentName,
        regionCode,
        isActive: isActive !== undefined ? isActive : true,
        userSlId: userSlId || null,
        userDmId: userDmId || null,
        createdBy: req.user.id
      }
    });

    await pushToLynx('/departments', [department]);

    return sendSuccess(res, { statusCode: 201, message: 'Department created', data: department });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: 'Department code exists' });
    return sendError(res, { statusCode: 500, message: 'Failed to create department', data: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { departmentCode, departmentName, regionCode, isActive, userSlId, userDmId } = req.body;
    
    const department = await prisma.department.update({
      where: { departmentId: id },
      data: {
        departmentCode,
        departmentName,
        regionCode,
        isActive,
        userSlId,
        userDmId,
        updatedBy: req.user.id
      }
    });

    await pushToLynx('/departments', [department]);

    return sendSuccess(res, { statusCode: 200, message: 'Department updated', data: department });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to update department', data: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const dept = await prisma.department.findUnique({ where: { departmentId: id }});
    await prisma.department.delete({ where: { departmentId: id } });

    if (dept) {
      await pushToLynx('/departments/delete', { departmentId: id });
    }

    return sendSuccess(res, { statusCode: 200, message: 'Department deleted' });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to delete department', data: error.message });
  }
};

// =============================================================================
// USERS CRUD
// =============================================================================

const getUsers = async (req, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const filterOptions = parsePrismaQuery(req.query);

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where: filterOptions,
        skip,
        take: limit,
        select: {
          userId: true, name: true, email: true, roleId: true, isActive: true, 
          stars: true, level: true, isBuddy: true, userBuddyId: true, departmentId: true,
          batchId: true, createdAt: true, updatedAt: true, role: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where: filterOptions })
    ]);

    return sendPaginated(res, { message: 'Users retrieved', data, total, page, limit });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to retrieve users', data: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { userId: id },
      select: {
        userId: true, name: true, email: true, roleId: true, isActive: true, 
        stars: true, level: true, isBuddy: true, userBuddyId: true, departmentId: true,
        batchId: true, createdAt: true, updatedAt: true, role: true
      }
    });

    if (!user) return sendError(res, { statusCode: 404, message: 'User not found' });
    return sendSuccess(res, { statusCode: 200, message: 'User found', data: user });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to retrieve user', data: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, roleId, departmentId, isBuddy, userBuddyId, batchId, isActive } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name, email, password: hashedPassword, roleId,
        departmentId: departmentId || null,
        isBuddy: isBuddy || false,
        userBuddyId: userBuddyId || null,
        batchId: batchId || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user.id
      }
    });

    await pushToLynx('/users', [user]);

    const userResponse = { ...user };
    delete userResponse.password;
    return sendSuccess(res, { statusCode: 201, message: 'User created', data: userResponse });
  } catch (error) {
    if (error.code === 'P2002') return sendError(res, { statusCode: 409, message: 'Email exists' });
    return sendError(res, { statusCode: 500, message: 'Failed to create user', data: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, roleId, departmentId, isBuddy, userBuddyId, batchId, isActive } = req.body;

    const data = {
      name, email, roleId, departmentId, isBuddy, userBuddyId, batchId, isActive,
      updatedBy: req.user.id
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { userId: id },
      data
    });

    await pushToLynx('/users', [user]);

    const userResponse = { ...user };
    delete userResponse.password;
    return sendSuccess(res, { statusCode: 200, message: 'User updated', data: userResponse });
  } catch (error) {
    return sendError(res, { statusCode: 500, message: 'Failed to update user', data: error.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const data = await prisma.user.delete({ where: { userId: req.params.id } });
    
    pushToLynx('/users/delete', { userId: data.userId });

    return sendSuccess(res, { message: 'User deleted' });
  } catch (error) { next(error); }
};

module.exports = {
  getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment,
  getUsers, getUserById, createUser, updateUser, deleteUser
};
