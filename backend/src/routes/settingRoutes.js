'use strict';
const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

router.get('/settings', settingController.getSettings);
router.post('/settings', settingController.createSetting);

router.get('/user-policies', settingController.getUserPolicies);
router.post('/user-policies', settingController.createUserPolicy);

module.exports = router;
