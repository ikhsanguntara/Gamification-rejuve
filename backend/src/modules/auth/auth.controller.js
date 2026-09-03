'use strict';

/**
 * @file auth.controller.js
 * @description Controller untuk autentikasi, profil user, dan pergantian activeBatch.
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../../config/db');
const batchService = require('../batches/batch.service');
const { sendSuccess, sendError } = require('../../utils/responseWrapper');

/**
 * Buat JWT token dari payload user.
 */
const generateToken = (user) => {
  const roleCode = user.role?.roleCode || user.roleCode || (typeof user.role === 'string' ? user.role : 'CREW');
  return jwt.sign(
    {
      id: user.userId,
      userId: user.userId,
      email: user.email,
      role: roleCode,
      roleId: user.roleId,
      departmentId: user.departmentId,
      activeBatchId: user.activeBatchId || null
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const USER_INCLUDE = {
  role: {
    select: {
      roleId: true,
      roleCode: true,
      roleName: true
    }
  },
  department: {
    select: {
      departmentId: true,
      departmentCode: true,
      departmentName: true
    }
  },
  activeBatch: {
    select: {
      batchId: true,
      code: true,
      name: true,
      status: true,
      currentWeek: true,
      startDate: true,
      endDate: true
    }
  },
  userBuddy: {
    select: {
      userId: true,
      name: true,
      email: true
    }
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, {
        message: 'Email dan password wajib diisi.',
        statusCode: 400,
      });
    }

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: USER_INCLUDE
    });

    if (!user) {
      return sendError(res, {
        message: 'Email atau password salah.',
        statusCode: 401,
      });
    }

    if (!user.isActive) {
      return sendError(res, {
        message: 'Akun Anda sudah dinonaktifkan.',
        statusCode: 403,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, {
        message: 'Email atau password salah.',
        statusCode: 401,
      });
    }

    // Auto-resolve activeBatchId if null & fetch availableBatches
    let availableBatches = await batchService.getUserAvailableBatches(user);
    let activeBatchId = user.activeBatchId;
    let activeBatch = user.activeBatch;

    if (!activeBatchId && availableBatches.length > 0) {
      const defaultBatch = availableBatches.find(b => b.status === 'OPEN') || availableBatches[0];
      if (defaultBatch) {
        activeBatchId = defaultBatch.batchId;
        activeBatch = defaultBatch;
        await prisma.user.update({
          where: { userId: user.userId },
          data: { activeBatchId: defaultBatch.batchId }
        });
        user.activeBatchId = defaultBatch.batchId;
      }
    }

    const token = generateToken(user);

    return sendSuccess(res, {
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          userId:       user.userId,
          name:         user.name,
          email:        user.email,
          roleId:       user.roleId,
          role:         user.role?.roleCode,
          roleDetails:  user.role,
          isActive:     user.isActive,
          stars:        user.stars,
          points:       user.points,
          level:        user.level,
          departmentId: user.departmentId,
          department:   user.department,
          activeBatchId: activeBatchId || null,
          activeBatch:  activeBatch || null,
          availableBatches: availableBatches || [],
          isBuddy:      user.isBuddy,
          userBuddyId:  user.userBuddyId,
          userBuddy:    user.userBuddy,
          batchId:      user.batchId,
          hasBatch:     Boolean(user.batchId),
          createdAt:    user.createdAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return sendError(res, {
        message: 'Data pengguna tidak ditemukan pada token.',
        statusCode: 401,
      });
    }

    const user = await prisma.user.findUnique({
      where: { userId },
      include: USER_INCLUDE
    });

    if (!user) {
      return sendError(res, {
        message: 'Pengguna tidak ditemukan.',
        statusCode: 404,
      });
    }

    // Auto-resolve activeBatchId if null & fetch availableBatches
    let availableBatches = await batchService.getUserAvailableBatches(user);
    let activeBatchId = user.activeBatchId;
    let activeBatch = user.activeBatch;

    if (!activeBatchId && availableBatches.length > 0) {
      const defaultBatch = availableBatches.find(b => b.status === 'OPEN') || availableBatches[0];
      if (defaultBatch) {
        activeBatchId = defaultBatch.batchId;
        activeBatch = defaultBatch;
        await prisma.user.update({
          where: { userId: user.userId },
          data: { activeBatchId: defaultBatch.batchId }
        });
      }
    }

    return sendSuccess(res, {
      message: 'Data profil berhasil diambil.',
      data: {
        userId:       user.userId,
        name:         user.name,
        email:        user.email,
        roleId:       user.roleId,
        role:         user.role?.roleCode,
        roleDetails:  user.role,
        isActive:     user.isActive,
        stars:        user.stars,
        points:       user.points,
        level:        user.level,
        departmentId: user.departmentId,
        department:   user.department,
        activeBatchId: activeBatchId || null,
        activeBatch:  activeBatch || null,
        availableBatches: availableBatches || [],
        isBuddy:      user.isBuddy,
        userBuddyId:  user.userBuddyId,
        userBuddy:    user.userBuddy,
        batchId:      user.batchId,
        hasBatch:     Boolean(user.batchId),
        createdAt:    user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/auth/active-batch
 * Mengganti active batch untuk user saat ini (SL / DM / Superadmin)
 */
const setActiveBatch = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { batchId } = req.body;

    if (!batchId) {
      return sendError(res, {
        message: 'Field "batchId" wajib diisi.',
        statusCode: 400
      });
    }

    const batch = await prisma.batch.findUnique({
      where: { batchId }
    });

    if (!batch) {
      return sendError(res, {
        message: `Batch dengan ID "${batchId}" tidak ditemukan.`,
        statusCode: 404
      });
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: { activeBatchId: batchId },
      include: USER_INCLUDE
    });

    const availableBatches = await batchService.getUserAvailableBatches(updatedUser);

    return sendSuccess(res, {
      message: `Active batch berhasil diatur ke "${batch.name}".`,
      data: {
        userId: updatedUser.userId,
        activeBatchId: updatedUser.activeBatchId,
        activeBatch: updatedUser.activeBatch,
        availableBatches: availableBatches || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return sendError(res, {
        message: 'Password lama dan password baru wajib diisi.',
        statusCode: 400,
      });
    }

    if (newPassword.length < 6) {
      return sendError(res, {
        message: 'Password baru minimal harus 6 karakter.',
        statusCode: 400,
      });
    }

    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) {
      return sendError(res, { message: 'Pengguna tidak ditemukan.', statusCode: 404 });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return sendError(res, { message: 'Password lama tidak sesuai.', statusCode: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { userId },
      data: { password: hashedNewPassword }
    });

    return sendSuccess(res, {
      message: 'Password berhasil diubah. Silakan login kembali dengan password baru.',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  setActiveBatch,
  changePassword
};
