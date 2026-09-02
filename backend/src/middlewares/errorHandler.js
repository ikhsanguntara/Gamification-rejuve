'use strict';

const { sendError } = require('../utils/responseWrapper');

/**
 * Global error handler middleware untuk Express.
 * Menangkap error yang dilempar dari controller (lewat next(err) atau dari dalam route).
 */
const errorHandler = (err, req, res, next) => {
  // Log error di console
  console.error(`[Error] ${req.method} ${req.originalUrl}`);
  console.error(err.stack);

  // Default nilai
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Terjadi kesalahan internal pada server.';

  // Tangani tipe error spesifik Prisma
  if (err.code && err.code.startsWith('P')) {
    // Error Prisma seringkali adalah bad request atau constraint violation
    statusCode = 400; 
    
    // Prisma Unique Constraint Violation
    if (err.code === 'P2002') {
      const fields = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'unknown field';
      message = `Data sudah ada. Constraint unique dilanggar pada field: ${fields}`;
    } 
    // Prisma Foreign Key Constraint Violation
    else if (err.code === 'P2003') {
      const field = err.meta?.field_name || err.meta?.constraint?.index || 'unknown relation';
      message = `Gagal menyimpan data. Terdapat ID relasi yang tidak valid atau tidak ditemukan (Referensi: ${field}).`;
    }
    // Prisma Record Not Found
    else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Data yang dicari untuk diperbarui/dihapus tidak ditemukan.';
    }
    // Prisma error lainnya
    else {
      message = 'Terjadi kesalahan pada struktur query database.';
    }
  }

  // Tangani SyntaxError (biasanya karena JSON malformed di body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Format JSON tidak valid pada body request.';
  }

  // Kirim response error menggunakan responseWrapper
  return sendError(res, {
    message,
    statusCode,
    // Hanya tampilkan detail error stack/object di development
    data: process.env.NODE_ENV === 'development' ? err : null
  });
};

module.exports = {
  errorHandler
};
