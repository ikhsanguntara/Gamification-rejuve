'use strict';

const express = require('express');
const router = express.Router();
const apiLogController = require('../controllers/apiLogController');
const { authenticate } = require('../middlewares/auth');
const { authorizeRole } = require('../middlewares/role');

// Hanya SUPERADMIN yang diizinkan untuk melihat log API
router.use(authenticate);
router.use(authorizeRole(['SUPERADMIN']));

// Endpoint GET
router.get('/', apiLogController.getApiLogs);

module.exports = router;
