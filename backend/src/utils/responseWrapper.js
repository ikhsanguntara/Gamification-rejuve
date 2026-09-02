'use strict';

/**
 * @file responseWrapper.js
 * @description Utility untuk membakukan format JSON response seluruh API.
 *
 * Standard Envelope Format:
 * {
 *   success    : boolean  – true jika request berhasil, false jika gagal
 *   statusCode : number   – HTTP status code
 *   message    : string   – pesan deskriptif untuk developer / user
 *   data       : any      – payload utama (null jika tidak ada data)
 *   meta       : object   – metadata tambahan (pagination, dll.) atau null
 * }
 */

/**
 * Kirim response sukses.
 * @param {import('express').Response} res - Express response object
 * @param {object} options
 * @param {string}  options.message    - Pesan sukses
 * @param {*}       [options.data]     - Payload data (default: null)
 * @param {object}  [options.meta]     - Metadata tambahan, misal pagination (default: null)
 * @param {number}  [options.statusCode] - HTTP status code (default: 200)
 */
const sendSuccess = (res, { message, data = null, meta = null, statusCode = 200 }) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    meta,
  });
};

/**
 * Kirim response error.
 * @param {import('express').Response} res - Express response object
 * @param {object} options
 * @param {string}  options.message      - Pesan error
 * @param {number}  [options.statusCode] - HTTP status code (default: 500)
 * @param {*}       [options.data]       - Detail error opsional (default: null)
 */
const sendError = (res, { message, statusCode = 500, data = null }) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    data,
    meta: null,
  });
};

/**
 * Helper khusus untuk response paginasi.
 * @param {import('express').Response} res
 * @param {object} options
 * @param {string} options.message
 * @param {Array}  options.data       - Array of items
 * @param {number} options.total      - Total jumlah record
 * @param {number} options.page       - Halaman saat ini
 * @param {number} options.limit      - Jumlah item per halaman
 * @param {number} [options.statusCode]
 */
const sendPaginated = (res, { message, data, total, page, limit, statusCode = 200 }) => {
  const totalPages = Math.ceil(total / limit);

  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
};
