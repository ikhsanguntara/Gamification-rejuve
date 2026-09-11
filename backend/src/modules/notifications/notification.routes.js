'use strict';

const router = require('express').Router();
const notificationController = require('./notification.controller');
const { authenticate } = require('../../middlewares/auth');

router.use(authenticate);

router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
