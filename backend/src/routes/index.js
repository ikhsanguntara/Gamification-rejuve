'use strict';

/**
 * @file index.js
 * @description Central API Router — Mengagregasi seluruh domain modul dari src/modules/.
 *
 * Semua rute diawali dengan prefix /api
 */

const router = require('express').Router();

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/masters', require('../modules/masters/master.routes'));
router.use('/batches', require('../modules/batches/batch.routes'));
router.use('/api-logs', require('../modules/api-logs/api-log.routes'));
router.use('/sync', require('../modules/sync/sync.routes'));
router.use('/params', require('../modules/params/param.routes'));
router.use('/templates', require('../modules/templates/template.routes'));
router.use('/administration', require('../modules/admin/admin.routes'));
router.use('/admin', require('../modules/admin/admin.routes'));
router.use('/evaluations', require('../modules/evaluations/evaluation.routes'));
router.use('/dashboard', require('../modules/dashboard/dashboard.routes'));
router.use('/gamification', require('../modules/gamification/gamification.routes'));
router.use('/notifications', require('../modules/notifications/notification.routes'));
router.use('/feedback', require('../modules/feedback/feedback.routes'));

module.exports = router;
