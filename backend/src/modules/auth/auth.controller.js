'use strict';

/**
 * @file auth.controller.js
 * @description Controller untuk proses Authentication (Login, Profil Me, Active Batch, Change Password).
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../../config/db');
const batchService = require('../batches/batch.service');
const gamificationService = require('../gamification/gamification.service');
const { uploadFileToStorage } = require('../../utils/minioStorage');
const { pushToLynx } = require('../../utils/lynxSync');
const { emitToUser } = require('../../utils/socketEmitter');
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

    // Early Bird Reward untuk CREW pada first login
    let earlyBirdReward = null;
    const isCrew = user.role?.roleCode === 'CREW';
    if (isCrew && !user.hasClaimedEarlyBird) {
      earlyBirdReward = await gamificationService.processEarlyBirdReward(user, activeBatch);
      if (earlyBirdReward && earlyBirdReward.claimed) {
        user.stars = earlyBirdReward.totalStars;
        user.points = earlyBirdReward.totalPoints;
        user.level = earlyBirdReward.level;
        user.hasClaimedEarlyBird = true;
        user.firstLoginAt = new Date();

        emitToUser(user.userId, 'crew:early_bird_reward', {
          userId: user.userId,
          starsEarned: earlyBirdReward.starsEarned,
          pointsEarned: earlyBirdReward.pointsEarned,
          totalStars: earlyBirdReward.totalStars,
          dayOffset: earlyBirdReward.dayOffset,
          tierLabel: earlyBirdReward.tierLabel,
          message: earlyBirdReward.message
        });

        emitToUser(user.userId, 'crew:stars_earned', {
          userId: user.userId,
          starsEarned: earlyBirdReward.starsEarned,
          totalStars: earlyBirdReward.totalStars,
          level: earlyBirdReward.level,
          reason: 'EARLY_BIRD_LOGIN'
        });
      }
    }

    const token = generateToken(user);

    return sendSuccess(res, {
      message: 'Login berhasil.',
      data: {
        token,
        earlyBirdReward: earlyBirdReward?.claimed ? earlyBirdReward : null,
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          gender: user.gender || null,
          phone: user.phone || null,
          avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
          roleId: user.roleId,
          role: user.role?.roleCode,
          roleDetails: user.role,
          isActive: user.isActive,
          stars: user.stars,
          points: user.points,
          level: user.level,
          departmentId: user.departmentId,
          department: user.department,
          activeBatchId: activeBatchId || null,
          activeBatch: activeBatch || null,
          availableBatches: availableBatches || [],
          isBuddy: user.isBuddy,
          userBuddyId: user.userBuddyId,
          userBuddy: user.userBuddy,
          batchId: user.batchId,
          hasBatch: Boolean(user.batchId),
          hasClaimedEarlyBird: user.hasClaimedEarlyBird || false,
          firstLoginAt: user.firstLoginAt || null,
          createdAt: user.createdAt
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
        userId: user.userId,
        name: user.name,
        email: user.email,
        gender: user.gender || null,
        phone: user.phone || null,
        avatarUrl: user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
        roleId: user.roleId,
        role: user.role?.roleCode,
        roleDetails: user.role,
        isActive: user.isActive,
        stars: user.stars,
        points: user.points,
        level: user.level,
        departmentId: user.departmentId,
        department: user.department,
        activeBatchId: activeBatchId || null,
        activeBatch: activeBatch || null,
        availableBatches: availableBatches || [],
        isBuddy: user.isBuddy,
        userBuddyId: user.userBuddyId,
        userBuddy: user.userBuddy,
        batchId: user.batchId,
        hasBatch: Boolean(user.batchId),
        hasClaimedEarlyBird: user.hasClaimedEarlyBird || false,
        firstLoginAt: user.firstLoginAt || null,
        createdAt: user.createdAt
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

    const token = generateToken(updatedUser);
    const availableBatches = await batchService.getUserAvailableBatches(updatedUser);

    return sendSuccess(res, {
      message: `Active batch berhasil diatur ke "${batch.name}".`,
      data: {
        token,
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

/**
 * PUT /api/auth/profile & PUT /api/auth/me
 * Endpoint update profile mandiri oleh pengguna yang sedang login.
 * Mendukung fleksibilitas avatar (upload file multipart 'avatar' ke MinIO atau string 'avatarUrl'),
 * serta pembaruan phone, gender, dan name. Field administratif diproteksi.
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return sendError(res, { statusCode: 401, message: 'Data pengguna tidak ditemukan pada token.' });
    }

    const { name, phone, gender, avatarUrl } = req.body;

    const data = {
      updatedBy: userId
    };

    if (name !== undefined) data.name = String(name).trim();
    if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;

    if (gender !== undefined) {
      if (!gender) {
        data.gender = null;
      } else {
        const g = String(gender).trim().toUpperCase();
        if (g === 'M' || g === 'L' || g === 'MALE' || g === 'LAKI-LAKI') {
          data.gender = 'M';
        } else if (g === 'F' || g === 'P' || g === 'FEMALE' || g === 'PEREMPUAN') {
          data.gender = 'F';
        } else {
          return sendError(res, { statusCode: 400, message: 'Format gender tidak valid. Gunakan M (Laki-laki) atau F (Perempuan).' });
        }
      }
    }

    // Resolusi avatar: file upload multipart atau string URL
    if (req.file) {
      data.avatarUrl = await uploadFileToStorage(req.file, 'avatars', req, `avatar-${userId}`);
    } else if (avatarUrl !== undefined) {
      data.avatarUrl = avatarUrl ? String(avatarUrl).trim() : null;
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data,
      include: USER_INCLUDE
    });

    // Sinkronkan ke Lynx jika bukan role CREW
    const roleCode = updatedUser.role?.roleCode || '';
    if (roleCode !== 'CREW') {
      await pushToLynx('/gamification/webhook/users', [updatedUser], 'POST');
    }

    // Fetch available batches
    let availableBatches = await batchService.getUserAvailableBatches(updatedUser);
    let activeBatchId = updatedUser.activeBatchId;
    let activeBatch = updatedUser.activeBatch;

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Profil berhasil diperbarui.',
      data: {
        user: {
          userId: updatedUser.userId,
          name: updatedUser.name,
          email: updatedUser.email,
          gender: updatedUser.gender || null,
          phone: updatedUser.phone || null,
          avatarUrl: updatedUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(updatedUser.name)}`,
          roleId: updatedUser.roleId,
          role: roleCode,
          roleDetails: updatedUser.role,
          isActive: updatedUser.isActive,
          stars: updatedUser.stars,
          points: updatedUser.points,
          level: updatedUser.level,
          departmentId: updatedUser.departmentId,
          department: updatedUser.department,
          activeBatchId: activeBatchId || null,
          activeBatch: activeBatch || null,
          availableBatches: availableBatches || [],
          isBuddy: updatedUser.isBuddy,
          userBuddyId: updatedUser.userBuddyId,
          userBuddy: updatedUser.userBuddy,
          batchId: updatedUser.batchId,
          hasBatch: Boolean(updatedUser.batchId),
          hasClaimedEarlyBird: updatedUser.hasClaimedEarlyBird || false,
          firstLoginAt: updatedUser.firstLoginAt || null,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  setActiveBatch,
  changePassword,
  updateProfile
};