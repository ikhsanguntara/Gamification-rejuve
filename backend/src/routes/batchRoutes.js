'use strict';

/**
 * @file batchRoutes.js
 * @description Routes untuk resource Batch.
 *
 * Seluruh route membutuhkan autentikasi (JWT).
 * Beberapa route dibatasi berdasarkan role:
 *   - GET    /           → semua role yang sudah login
 *   - GET    /:id        → semua role yang sudah login
 *   - POST   /           → SUPERADMIN, HEAD
 *   - PATCH  /:id        → SUPERADMIN, HEAD
 *   - DELETE /:id        → SUPERADMIN only
 */

const router = require('express').Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} = require('../controllers/batchController');
const { authenticate }  = require('../middlewares/auth');
const { authorizeRole } = require('../middlewares/role');

// Terapkan authenticate ke SEMUA route batch
router.use(authenticate);

// ─── Read ─────────────────────────────────────────────────────────────────────
router.get('/',    getBatches);
router.get('/:id', getBatchById);

// ─── Write (HEAD dan SUPERADMIN) ──────────────────────────────────────────────
router.post('/',
  authorizeRole(['SUPERADMIN', 'HEAD']),
  createBatch
);

router.patch('/:id',
  authorizeRole(['SUPERADMIN', 'HEAD']),
  updateBatch
);

// ─── Delete (SUPERADMIN only) ─────────────────────────────────────────────────
router.delete('/:id',
  authorizeRole(['SUPERADMIN']),
  deleteBatch
);

module.exports = router;
