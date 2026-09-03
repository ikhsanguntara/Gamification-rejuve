'use strict';

/**
 * @file master.controller.js
 * @description Handles CRUD untuk Master Data: Departments, Users, dan Roles.
 */

const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/responseWrapper');
const { parsePrismaQuery } = require('../../utils/queryParser');
const { pushToLynx } = require('../../utils/lynxSync');

// =============================================================================
// DEPARTMENTS
// =============================================================================

const getDepartments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    // Searchable: departmentCode, departmentName, regionCode
    const where = parsePrismaQuery(queryClone, ['departmentCode', 'departmentName', 'regionCode']);

    const [data, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: { departmentCode: 'asc' }
      }),
      prisma.department.count({ where })
    ]);

    return sendPaginated(res, {
      message: 'Daftar departemen berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await prisma.department.findUnique({
      where: { departmentId: id }
    });

    if (!data) {
      return sendError(res, { statusCode: 404, message: 'Departemen tidak ditemukan.' });
    }

    return sendSuccess(res, {
      message: 'Detail departemen berhasil diambil.',
      data
    });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { departmentCode, departmentName, regionCode, isActive, userSlId, userDmId } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    const department = await prisma.department.create({
      data: {
        departmentCode,
        departmentName,
        regionCode,
        isActive: isActive !== undefined ? isActive : true,
        userSlId: userSlId || null,
        userDmId: userDmId || null,
        createdBy: creatorId
      }
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Departemen berhasil dibuat.',
      data: department
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Kode departemen "${req.body.departmentCode}" sudah digunakan.` });
    }
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentCode, departmentName, regionCode, isActive, userSlId, userDmId } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const department = await prisma.department.update({
      where: { departmentId: id },
      data: {
        departmentCode,
        departmentName,
        regionCode,
        isActive,
        userSlId,
        userDmId,
        updatedBy: updaterId
      }
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Departemen berhasil diperbarui.',
      data: department
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Kode departemen "${req.body.departmentCode}" sudah digunakan.` });
    }
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { departmentId: id } });

    return sendSuccess(res, { statusCode: 200, message: 'Departemen berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// USERS CRUD
// =============================================================================

const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    // Filter khusus hasBatch: true / false
    let hasBatchFilter = undefined;
    if (queryClone.hasBatch !== undefined) {
      const val = String(queryClone.hasBatch).toLowerCase();
      if (val === 'true') {
        hasBatchFilter = { not: null };
      } else if (val === 'false') {
        hasBatchFilter = null;
      }
      delete queryClone.hasBatch;
    }

    // Searchable: name, email
    const where = parsePrismaQuery(queryClone, ['name', 'email']);

    if (hasBatchFilter !== undefined) {
      where.batchId = hasBatchFilter;
    }

    // Alias convenience: ?role=CREW atau ?roleCode=CREW dipetakan otomatis ke { role: { roleCode: ... } }
    if (where.role && typeof where.role === 'string') {
      where.role = { roleCode: where.role };
    }
    if (where.roleCode) {
      where.role = where.role || {};
      where.role.roleCode = where.roleCode;
      delete where.roleCode;
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          userId: true,
          name: true,
          email: true,
          roleId: true,
          role: true,
          isActive: true,
          stars: true,
          points: true,
          level: true,
          isBuddy: true,
          userBuddyId: true,
          departmentId: true,
          department: true,
          batchId: true,
          batch: {
            select: {
              batchId: true,
              code: true,
              name: true,
              status: true,
              currentWeek: true
            }
          },
          activeBatchId: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const formattedData = data.map(user => ({
      ...user,
      hasBatch: Boolean(user.batchId)
    }));

    return sendPaginated(res, {
      message: 'Daftar user berhasil diambil.',
      data: formattedData,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { userId: id },
      select: {
        userId: true,
        name: true,
        email: true,
        roleId: true,
        role: true,
        isActive: true,
        stars: true,
        points: true,
        level: true,
        isBuddy: true,
        userBuddyId: true,
        departmentId: true,
        department: true,
        batchId: true,
        batch: {
          select: {
            batchId: true,
            code: true,
            name: true,
            status: true,
            currentWeek: true
          }
        },
        activeBatchId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return sendError(res, { statusCode: 404, message: 'User tidak ditemukan.' });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Detail user berhasil diambil.',
      data: {
        ...user,
        hasBatch: Boolean(user.batchId)
      }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, roleId, departmentId, isBuddy, userBuddyId, batchId, isActive, activeBatchId } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId,
        departmentId: departmentId || null,
        isBuddy: isBuddy || false,
        userBuddyId: userBuddyId || null,
        batchId: batchId || null,
        activeBatchId: activeBatchId || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: creatorId
      },
      include: { role: true, department: true }
    });

    // Sinkronkan mutasi user ke Lynx
    await pushToLynx('/gamification/webhook/users', [user], 'POST');

    const userResponse = {
      ...user,
      hasBatch: Boolean(user.batchId)
    };
    delete userResponse.password;

    return sendSuccess(res, {
      statusCode: 201,
      message: 'User berhasil dibuat.',
      data: userResponse
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Email "${req.body.email}" sudah digunakan.` });
    }
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, password, roleId, departmentId, isBuddy, userBuddyId, batchId, isActive, activeBatchId } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const data = {
      updatedBy: updaterId
    };
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (roleId !== undefined) data.roleId = roleId;
    if (departmentId !== undefined) data.departmentId = departmentId;
    if (isBuddy !== undefined) data.isBuddy = isBuddy;
    if (userBuddyId !== undefined) data.userBuddyId = userBuddyId;
    if (batchId !== undefined) data.batchId = batchId;
    if (activeBatchId !== undefined) data.activeBatchId = activeBatchId;
    if (isActive !== undefined) data.isActive = isActive;

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { userId: id },
      data,
      include: { role: true, department: true }
    });

    // Sinkronkan mutasi user ke Lynx (Upsert via POST)
    await pushToLynx('/gamification/webhook/users', [user], 'POST');

    const userResponse = {
      ...user,
      hasBatch: Boolean(user.batchId)
    };
    delete userResponse.password;

    return sendSuccess(res, {
      statusCode: 200,
      message: 'User berhasil diperbarui.',
      data: userResponse
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Email "${req.body.email}" sudah digunakan.` });
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Sinkronkan delete user ke Lynx Webhook
    await pushToLynx('/gamification/webhook/users/delete', { userId: id }, 'POST');

    await prisma.user.delete({ where: { userId: id } });

    return sendSuccess(res, { statusCode: 200, message: 'User berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

// =============================================================================
// ROLES CRUD
// =============================================================================

const getRoles = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const queryClone = { ...req.query };
    delete queryClone.page;
    delete queryClone.limit;

    // Searchable: roleCode, roleName
    const where = parsePrismaQuery(queryClone, ['roleCode', 'roleName']);

    const [data, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: { select: { users: true } }
        },
        orderBy: { roleCode: 'asc' }
      }),
      prisma.role.count({ where })
    ]);

    return sendPaginated(res, {
      message: 'Daftar role berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { roleId: id },
      include: {
        _count: { select: { users: true } }
      }
    });

    if (!role) {
      return sendError(res, { statusCode: 404, message: 'Role tidak ditemukan.' });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Detail role berhasil diambil.',
      data: role
    });
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  try {
    const { roleCode, roleName } = req.body;
    const creatorId = req.user?.id || req.user?.userId || null;

    if (!roleCode || !roleName) {
      return sendError(res, { statusCode: 400, message: 'Field "roleCode" dan "roleName" wajib diisi.' });
    }

    const role = await prisma.role.create({
      data: {
        roleCode: roleCode.toUpperCase(),
        roleName,
        createdBy: creatorId
      }
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Role berhasil dibuat.',
      data: role
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Kode role "${req.body.roleCode}" sudah digunakan.` });
    }
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleCode, roleName } = req.body;
    const updaterId = req.user?.id || req.user?.userId || null;

    const data = { updatedBy: updaterId };
    if (roleCode !== undefined) data.roleCode = roleCode.toUpperCase();
    if (roleName !== undefined) data.roleName = roleName;

    const role = await prisma.role.update({
      where: { roleId: id },
      data
    });

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Role berhasil diperbarui.',
      data: role
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return sendError(res, { statusCode: 409, message: `Kode role "${req.body.roleCode}" sudah digunakan.` });
    }
    next(error);
  }
};

const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.role.delete({ where: { roleId: id } });

    return sendSuccess(res, { statusCode: 200, message: 'Role berhasil dihapus.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
