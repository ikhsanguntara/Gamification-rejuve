'use strict';

const router = require('express').Router();
const adminController = require('./admin.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorizeRole } = require('../../middlewares/role');

router.use(authenticate);

// Settings (SUPERADMIN only)
router.get('/settings', authorizeRole(['SUPERADMIN']), adminController.getSettings);
router.get('/settings/:id', authorizeRole(['SUPERADMIN']), adminController.getSettingById);
router.post('/settings', authorizeRole(['SUPERADMIN']), adminController.createSetting);
router.put('/settings/:id', authorizeRole(['SUPERADMIN']), adminController.updateSetting);
router.delete('/settings/:id', authorizeRole(['SUPERADMIN']), adminController.deleteSetting);

// User Policies (SUPERADMIN mutations, read can be authenticated)
router.get('/user-policies', adminController.getUserPolicies);
router.get('/user-policies/:id', adminController.getUserPolicyById);
router.post('/user-policies', authorizeRole(['SUPERADMIN']), adminController.createUserPolicy);
router.put('/user-policies/:id', authorizeRole(['SUPERADMIN']), adminController.updateUserPolicy);
router.delete('/user-policies/:id', authorizeRole(['SUPERADMIN']), adminController.deleteUserPolicy);

module.exports = router;
