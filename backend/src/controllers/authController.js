'use strict';

/**
 * @file authController.js
 * @description Handles authentication: login dan get current user.
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseWrapper');

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Buat JWT token dari payload user.
 * @param {{ userId: string, email: string, role: string }} user
 * @returns {string}
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── Field yang dikembalikan ke client (exclude password) ─────────────────────
const USER_PUBLIC_FIELDS = {
  userId:     true,
  name:       true,
  email:      true,
  role:       true,
  isActive:   true,
  departmentBuddyId: true,
  departmentBuddy: { select: { departmentId: true, departmentCode: true, departmentName: true } },
  departmentId: true,
  department: { select: { departmentId: true, departmentCode: true, departmentName: true } },
  stars:      true,
  level:      true,
  batchId:    true,
  createdAt:  true,
};

// =============================================================================
// POST /api/auth/login
// =============================================================================

/**
 * Login user dan kembalikan JWT token.
 * Body: { email, password }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return sendError(res, {
        message: 'Email dan password wajib diisi.',
        statusCode: 400,
      });
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        departmentBuddy: { select: { departmentId: true, departmentCode: true, departmentName: true } },
        department: { select: { departmentId: true, departmentCode: true, departmentName: true } },
      }
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

    // Bandingkan password dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError(res, {
        message: 'Email atau password salah.',
        statusCode: 401,
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return sendSuccess(res, {
      message: 'Login berhasil.',
      data: {
        token,
        user: {
          userId:     user.userId,
          name:       user.name,
          email:      user.email,
          role:       user.role,
          isActive:   user.isActive,
          departmentBuddyId: user.departmentBuddyId,
          departmentBuddy: user.departmentBuddy,
          departmentId: user.departmentId,
          department: user.department,
          stars:      user.stars,
          level:      user.level,
          batchId:    user.batchId,
        },
      },
    });

  } catch (error) {
    next(error);
  }
};

// =============================================================================
// GET /api/auth/me
// =============================================================================

/**
 * Kembalikan data user yang sedang login (berdasarkan JWT di req.user).
 * Wajib pakai middleware `authenticate` sebelum route ini.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { userId: req.user.userId },
      select: USER_PUBLIC_FIELDS,
    });

    if (!user) {
      return sendError(res, {
        message: 'User tidak ditemukan.',
        statusCode: 404,
      });
    }

    return sendSuccess(res, {
      message: 'Data user berhasil diambil.',
      data: user,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
};
