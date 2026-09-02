'use strict';

const { sendError } = require('../utils/responseWrapper');

/**
 * Middleware untuk otorisasi berdasarkan role user.
 * Harus dipanggil SETELAH middleware `authenticate` (auth.js).
 * 
 * @param {string[]} allowedRoles Array of allowed roles, ex: ['SUPERADMIN', 'HEAD']
 */
const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return sendError(res, {
          message: 'Otorisasi gagal. Informasi user tidak ditemukan.',
          statusCode: 401,
        });
      }

      const hasRole = allowedRoles.includes(req.user.role);

      if (!hasRole) {
        return sendError(res, {
          message: `Akses ditolak. Membutuhkan salah satu dari role berikut: ${allowedRoles.join(', ')}`,
          statusCode: 403,
        });
      }

      next();
    } catch (error) {
      return sendError(res, {
        message: 'Terjadi kesalahan saat memverifikasi role.',
        statusCode: 500,
        data: process.env.NODE_ENV === 'development' ? error.message : null
      });
    }
  };
};

module.exports = {
  authorizeRole
};
