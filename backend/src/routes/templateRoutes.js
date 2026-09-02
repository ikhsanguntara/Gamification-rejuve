'use strict';

/**
 * @file templateRoutes.js
 * @description Routes untuk Unified Template Missions.
 */

const express = require('express');
const router = express.Router();
const tplMissionController = require('../controllers/tplMissionController');
const { authenticate } = require('../middlewares/auth');
const { authorizeRole } = require('../middlewares/role');

// Pasang authenticate untuk seluruh rute template
router.use(authenticate);

// ─── Read ─────────────────────────────────────────────────────────────────────
router.get('/', tplMissionController.getTemplates);
router.get('/:id', tplMissionController.getTemplateById);

// ─── Write (SUPERADMIN, HEAD) ─────────────────────────────────────────────────
router.post('/', authorizeRole(['SUPERADMIN', 'HEAD']), tplMissionController.createTemplate);
router.put('/:id', authorizeRole(['SUPERADMIN', 'HEAD']), tplMissionController.updateTemplate);
router.delete('/:id', authorizeRole(['SUPERADMIN']), tplMissionController.deleteTemplate);

module.exports = router;
