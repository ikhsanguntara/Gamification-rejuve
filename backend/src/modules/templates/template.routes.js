'use strict';

const express = require('express');
const router = express.Router();
const templateController = require('./template.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorizeRole } = require('../../middlewares/role');

router.use(authenticate);

// ─── Read ─────────────────────────────────────────────────────────────────────
router.get('/', templateController.getTemplates);
router.get('/:id', templateController.getTemplateById);

// ─── Write (SUPERADMIN, HEAD) ─────────────────────────────────────────────────
router.post('/', authorizeRole(['SUPERADMIN', 'HEAD']), templateController.createTemplate);
router.put('/:id', authorizeRole(['SUPERADMIN', 'HEAD']), templateController.updateTemplate);
router.delete('/:id', authorizeRole(['SUPERADMIN']), templateController.deleteTemplate);

module.exports = router;
