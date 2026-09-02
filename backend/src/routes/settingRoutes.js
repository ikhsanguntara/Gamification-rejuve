'use strict';

/**
 * @file settingRoutes.js
 * @description Routes untuk Administration: Settings dan User Policies (SUPERADMIN only).
 */

const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate } = require('../middlewares/auth');
const { authorizeRole } = require('../middlewares/role');

router.use(authenticate);
router.use(authorizeRole(['SUPERADMIN']));

// ─── Settings ────────────────────────────────────────────────────────────────
router.get('/settings', settingController.getSettings);
router.get('/settings/:id', settingController.getSettingById);
router.post('/settings', settingController.createSetting);
router.put('/settings/:id', settingController.updateSetting);
router.delete('/settings/:id', settingController.deleteSetting);

// ─── User Policies ───────────────────────────────────────────────────────────
router.get('/user-policies', settingController.getUserPolicies);
router.get('/user-policies/:id', settingController.getUserPolicyById);
router.post('/user-policies', settingController.createUserPolicy);
router.put('/user-policies/:id', settingController.updateUserPolicy);
router.delete('/user-policies/:id', settingController.deleteUserPolicy);

module.exports = router;
