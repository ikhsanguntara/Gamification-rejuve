'use strict';

/**
 * @file dashboard.routes.js
 * @description Rute untuk endpoint Dashboard.
 */

const router = require('express').Router();
const dashboardController = require('./dashboard.controller');
const { authenticate } = require('../../middlewares/auth');

router.use(authenticate);

// GET /api/dashboard/summary
router.get('/summary', dashboardController.getDashboardSummary);

module.exports = router;
