'use strict';
const express = require('express');
const router = express.Router();
const tplMissionController = require('../controllers/tplMissionController');

router.get('/', tplMissionController.getTemplates);
router.get('/:id', tplMissionController.getTemplateById);
router.post('/', tplMissionController.createTemplate);
router.put('/:id', tplMissionController.updateTemplate);
router.delete('/:id', tplMissionController.deleteTemplate);

module.exports = router;
