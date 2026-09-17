'use strict';

/**
 * @file report.routes.js
 * @description Rute API untuk Laporan Insentif Buddy & Audit Traceability Pengguna.
 */

const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { authenticate } = require('../../middlewares/auth');

// Pasang authenticate untuk seluruh rute laporan
router.use(authenticate);

// ─── Laporan Insentif Pembimbingan Buddy ─────────────────────────────────────
router.get('/buddy-incentive', reportController.getBuddyIncentive);
router.get('/buddy-incentive/export', reportController.exportBuddyIncentive);
router.get('/buddy-incentive/:userId/export', reportController.exportSingleBuddyIncentive);
router.get('/buddy-incentive/:userId', reportController.getBuddyIncentiveDetail);

// ─── Laporan Audit Traceability Pengguna ───────────────────────────────────────
router.get('/user-traceability', reportController.getUserTraceabilityList);
router.get('/user-traceability/export', reportController.exportUserTraceability);
router.get('/user-traceability/:userId/export', reportController.exportSingleUserTraceability);
router.get('/user-traceability/:userId', reportController.getUserTraceabilityDetail);

module.exports = router;
