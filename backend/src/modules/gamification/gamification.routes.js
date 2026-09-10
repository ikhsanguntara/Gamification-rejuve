'use strict';

/**
 * @file gamification.routes.js
 * @description Rute untuk fitur Gamification.
 */

const router = require('express').Router();
const gamificationController = require('./gamification.controller');
const { authenticate } = require('../../middlewares/auth');

router.use(authenticate);

// GET /api/gamification/leaderboard
router.get('/leaderboard', gamificationController.getLeaderboard);

module.exports = router;
