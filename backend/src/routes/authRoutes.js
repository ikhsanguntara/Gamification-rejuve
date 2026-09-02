'use strict';

/**
 * @file authRoutes.js
 * @description Routes untuk autentikasi.
 *
 * Public  : POST /api/auth/login  — tidak perlu token
 * Private : GET  /api/auth/me     — wajib login
 */

const router = require('express').Router();
const { login, getMe } = require('../controllers/authController');
const { authenticate }  = require('../middlewares/auth');

// POST /api/auth/login — public, tidak perlu token
router.post('/login', login);

// GET /api/auth/me — private, wajib authenticate
router.get('/me', authenticate, getMe);

module.exports = router;
