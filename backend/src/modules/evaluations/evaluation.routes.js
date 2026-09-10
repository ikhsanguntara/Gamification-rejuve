'use strict';

/**
 * @file evaluation.routes.js
 * @description Routes untuk Alur Evaluasi Terpadu & Workstation Kru.
 */

const express = require('express');
const router = express.Router();
const evaluationController = require('./evaluation.controller');
const { authenticate } = require('../../middlewares/auth');
const { authorizeRole } = require('../../middlewares/role');
const { uploadMiddleware } = require('../../utils/minioStorage');

// Pasang authenticate untuk seluruh rute evaluasi
router.use(authenticate);

// ─── Workstation Endpoints (Sidebar Kru & Detail Misi Kru) ─────────────────────
router.get('/crews', evaluationController.getWorkstationCrews);
router.get('/crews/:userId/missions', evaluationController.getCrewMissions);

// ─── Buddy Report & History Endpoints ─────────────────────────────────────────
router.get('/buddy-history', evaluationController.getBuddyHistory);
router.get('/buddy-report/:userId', evaluationController.getBuddyReport);
router.get('/buddy-report/:userId/html', evaluationController.getBuddyReportHtml);

// ─── Read User Missions ───────────────────────────────────────────────────────
router.get('/user-missions', evaluationController.getUserMissions);
router.get('/user-missions/:id', evaluationController.getUserMissionById);

// ─── Buddy Evaluation ─────────────────────────────────────────────────────────
router.post(
  '/user-missions/:id/buddy-score',
  uploadMiddleware.single('evidence'),
  evaluationController.evaluateBuddy
);

// ─── Store Leader (SL) Evaluation ─────────────────────────────────────────────
router.post(
  '/user-missions/:id/sl-score',
  authorizeRole(['STORE_LEADER', 'SUPERADMIN', 'HEAD']),
  uploadMiddleware.single('evidence'),
  evaluationController.evaluateJourneyBySL
);

// ─── District Manager (DM) Review ─────────────────────────────────────────────
router.post(
  '/user-missions/:id/dm-review',
  authorizeRole(['DISTRICT_MANAGER', 'HEAD', 'SUPERADMIN']),
  evaluationController.reviewJourneyByDM
);

// ─── Crew Feedback Submission ─────────────────────────────────────────────────
router.post(
  '/user-missions/:id/crew-feedback',
  authorizeRole(['CREW', 'SUPERADMIN']),
  evaluationController.submitCrewFeedback
);

module.exports = router;
