'use strict';

const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responseWrapper');

/**
 * Middleware untuk memvalidasi JWT dari header Authorization.
 * Format header: `Authorization: Bearer <token>`
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        message: 'Akses ditolak. Token tidak ditemukan atau format salah.',
        statusCode: 401,
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return sendError(res, {
        message: 'Akses ditolak. Token kosong.',
        statusCode: 401,
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set data user ke request object agar bisa dipakai di controller/middleware selanjutnya
    req.user = decoded;
    
    next();
  } catch (error) {
    let message = 'Token tidak valid.';
    if (error.name === 'TokenExpiredError') {
      message = 'Token sudah kedaluwarsa.';
    }

    return sendError(res, {
      message,
      statusCode: 401,
      data: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Middleware untuk memvalidasi Role.
 * Pastikan middleware ini dipanggil *setelah* `authenticate`.
 * @param  {...string} allowedRoles - Daftar role yang diizinkan (misal: 'SUPERADMIN', 'HEAD')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, {
        message: 'Akses ditolak. Informasi role tidak ditemukan pada token.',
        statusCode: 403,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, {
        message: `Akses ditolak. Role Anda (${req.user.role}) tidak memiliki izin mengakses resource ini.`,
        statusCode: 403,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
