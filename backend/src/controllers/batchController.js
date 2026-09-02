'use strict';

/**
 * @file batchController.js
 * @description Handles CRUD untuk resource Batch.
 */

const prisma = require('../config/db');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseWrapper');
const { parsePrismaQuery } = require('../utils/queryParser');

// =============================================================================
// GET /api/batches
// =============================================================================

/**
 * Ambil daftar semua batch dengan dukungan pagination dan filter.
 * Query params opsional:
 *   - page    : halaman (default 1)
 *   - limit   : jumlah per halaman (default 10)
 *   - status  : filter berdasarkan BatchStatus (DRAFT | ACTIVE | COMPLETED | ARCHIVED)
 *   - search  : filter berdasarkan nama atau kode batch
 */
const getBatches = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 10);
    const skip   = (page - 1) * limit;
    const status = req.query.status  || undefined;
    const search = req.query.search  || undefined;

    // Bangun klausa where secara dinamis menggunakan queryParser
    const where = parsePrismaQuery(req.query);
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Jalankan query count dan data secara paralel untuk efisiensi
    const [total, batches] = await Promise.all([
      prisma.batch.count({ where }),
      prisma.batch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          // Hitung jumlah member dan misi tanpa menarik seluruh data
          _count: {
            select: { members: true, missions: true },
          },
        },
      }),
    ]);

    return sendPaginated(res, {
      message: 'Daftar batch berhasil diambil.',
      data: batches,
      total,
      page,
      limit,
    });

  } catch (error) {
    next(error);
  }
};

// =============================================================================
// GET /api/batches/:id
// =============================================================================

/**
 * Ambil detail satu batch berdasarkan ID, beserta semua misi-nya.
 */
const getBatchById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const batch = await prisma.batch.findUnique({
      where: { batchId: id },
      include: {
        missions: {
          orderBy: [{ week: 'asc' }, { code: 'asc' }],
        },
        _count: {
          select: { members: true },
        },
      },
    });

    if (!batch) {
      return sendError(res, {
        message: `Batch dengan id "${id}" tidak ditemukan.`,
        statusCode: 404,
      });
    }

    return sendSuccess(res, {
      message: 'Detail batch berhasil diambil.',
      data: batch,
    });

  } catch (error) {
    next(error);
  }
};

// =============================================================================
// POST /api/batches
// =============================================================================

/**
 * Buat batch baru.
 * Body: { name, code, startDate, endDate, status? }
 * Hanya SUPERADMIN dan HEAD yang boleh membuat batch (diatur di routes).
 */
const createBatch = async (req, res, next) => {
  try {
    const { name, code, startDate, endDate, status } = req.body;

    // Validasi input wajib
    if (!name || !code || !startDate || !endDate) {
      return sendError(res, {
        message: 'Field name, code, startDate, dan endDate wajib diisi.',
        statusCode: 400,
      });
    }

    // Validasi tanggal
    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return sendError(res, {
        message: 'Format tanggal startDate atau endDate tidak valid.',
        statusCode: 400,
      });
    }
    if (end <= start) {
      return sendError(res, {
        message: 'endDate harus lebih besar dari startDate.',
        statusCode: 400,
      });
    }

    const batch = await prisma.batch.create({
      data: {
        name,
        code: code.toUpperCase(), // normalisasi ke uppercase
        startDate: start,
        endDate:   end,
        status:    status || 'DRAFT',
        createdBy: req.user?.userId || null,
      },
    });

    return sendSuccess(res, {
      message: 'Batch berhasil dibuat.',
      data:       batch,
      statusCode: 201,
    });

  } catch (error) {
    next(error);
  }
};

// =============================================================================
// PATCH /api/batches/:id
// =============================================================================

/**
 * Update data batch berdasarkan ID.
 * Body fields opsional: { name, code, startDate, endDate, status, currentWeek }
 */
const updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, startDate, endDate, status, currentWeek } = req.body;

    // Pastikan batch ada
    const existing = await prisma.batch.findUnique({ where: { batchId: id } });
    if (!existing) {
      return sendError(res, {
        message: `Batch dengan id "${id}" tidak ditemukan.`,
        statusCode: 404,
      });
    }

    // Bangun objek update secara dinamis (hanya field yang dikirim)
    const updateData = { updatedBy: req.user?.userId || null };
    if (name !== undefined)        updateData.name        = name;
    if (code !== undefined)        updateData.code        = code.toUpperCase();
    if (status !== undefined)      updateData.status      = status;
    if (currentWeek !== undefined) updateData.currentWeek = parseInt(currentWeek);
    if (startDate !== undefined)   updateData.startDate   = new Date(startDate);
    if (endDate !== undefined)     updateData.endDate     = new Date(endDate);

    const batch = await prisma.batch.update({
      where: { batchId: id },
      data:  updateData,
    });

    return sendSuccess(res, {
      message: 'Batch berhasil diperbarui.',
      data:    batch,
    });

  } catch (error) {
    next(error);
  }
};

// =============================================================================
// DELETE /api/batches/:id
// =============================================================================

/**
 * Hapus batch berdasarkan ID.
 * Hanya SUPERADMIN yang boleh menghapus batch (diatur di routes).
 */
const deleteBatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.batch.findUnique({ where: { batchId: id } });
    if (!existing) {
      return sendError(res, {
        message: `Batch dengan id "${id}" tidak ditemukan.`,
        statusCode: 404,
      });
    }

    await prisma.batch.delete({ where: { batchId: id } });

    return sendSuccess(res, {
      message: 'Batch berhasil dihapus.',
      data:    null,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
};
