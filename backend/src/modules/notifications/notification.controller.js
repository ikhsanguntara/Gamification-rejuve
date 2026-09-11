'use strict';

const notificationService = require('./notification.service');
const { sendSuccess, sendError, sendPaginated } = require('../../utils/responseWrapper');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return sendError(res, { statusCode: 401, message: 'User tidak terautentikasi.' });
    }

    const { data, total, page, limit } = await notificationService.getNotifications(userId, req.query);
    return sendPaginated(res, {
      message: 'Daftar notifikasi berhasil diambil.',
      data,
      total,
      page,
      limit
    });
  } catch (error) {
    next(error);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return sendError(res, { statusCode: 401, message: 'User tidak terautentikasi.' });
    }

    const unreadCount = await notificationService.getUnreadCount(userId);
    return sendSuccess(res, {
      statusCode: 200,
      message: 'Jumlah notifikasi belum dibaca berhasil diambil.',
      data: { unreadCount }
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { id } = req.params;

    const updated = await notificationService.markAsRead(id, userId);
    if (!updated) {
      return sendError(res, { statusCode: 404, message: 'Notifikasi tidak ditemukan atau bukan milik Anda.' });
    }

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Notifikasi berhasil ditandai sebagai dibaca.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const updatedCount = await notificationService.markAllAsRead(userId);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Seluruh notifikasi berhasil ditandai sebagai dibaca.',
      data: { updatedCount }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
