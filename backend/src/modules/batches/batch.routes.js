'use strict';

const router = require('express').Router();
const batchController = require('./batch.controller');
const { authenticate }  = require('../../middlewares/auth');
const { authorizeRole } = require('../../middlewares/role');

router.use(authenticate);

// ─── Read ─────────────────────────────────────────────────────────────────────
router.get('/', batchController.getBatches);
router.get('/:id', batchController.getBatchById);

// ─── Write (HEAD dan SUPERADMIN) ──────────────────────────────────────────────
router.post('/', authorizeRole(['SUPERADMIN', 'HEAD']), batchController.createBatch);
router.post('/:id/generate', authorizeRole(['SUPERADMIN', 'HEAD']), batchController.generateBatchMissions);
router.patch('/:id', authorizeRole(['SUPERADMIN', 'HEAD']), batchController.updateBatch);
router.delete('/:id', authorizeRole(['SUPERADMIN']), batchController.deleteBatch);

module.exports = router;
