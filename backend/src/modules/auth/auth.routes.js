'use strict';

const express = require('express');
const router  = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth');

// Public
router.post('/login', authController.login);

// Protected
router.get('/me', authenticate, authController.getMe);
router.patch('/active-batch', authenticate, authController.setActiveBatch);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
