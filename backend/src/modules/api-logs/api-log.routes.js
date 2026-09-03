'use strict';

/**
 * @file api-log.routes.js
 * @description Routes untuk API Logs (SUPERADMIN only).
 */

const express = require('express');
const router = express.Router();
const apiLogController = require('./api-log.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorizeRole } = require('../../middlewares/role');

router.use(authenticate);
router.use(authorizeRole(['SUPERADMIN']));

router.get('/', apiLogController.getApiLogs);

module.exports = router;
