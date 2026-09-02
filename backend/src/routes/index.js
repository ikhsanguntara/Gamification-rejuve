'use strict';

/**
 * @file index.js
 * @description Router utama yang menggabungkan seluruh sub-router.
 *
 * Semua route diawali dengan prefix /api
 * Daftarkan route baru di sini setiap menambah resource.
 */

const router = require('express').Router();

// ─── Sub-Routers ──────────────────────────────────────────────────────────────
const authRoutes = require('./authRoutes');
const masterRoutes = require('./masterRoutes');
const batchRoutes = require('./batchRoutes');
const apiLogRoutes = require('./apiLogRoutes');
const syncRoutes = require('./syncRoutes');
const paramRoutes = require('./paramRoutes');
const templateRoutes = require('./templateRoutes');
const settingRoutes = require('./settingRoutes');
const evaluationRoutes = require('./evaluationRoutes');

router.use('/auth', authRoutes);
router.use('/masters', masterRoutes);
router.use('/batches', batchRoutes);
router.use('/api-logs', apiLogRoutes);
router.use('/sync', syncRoutes);
router.use('/params', paramRoutes);
router.use('/templates', templateRoutes);
router.use('/administration', settingRoutes);
router.use('/admin', settingRoutes);
router.use('/evaluations', evaluationRoutes);

module.exports = router;
