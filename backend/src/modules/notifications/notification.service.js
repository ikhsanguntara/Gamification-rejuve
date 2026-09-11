'use strict';

const prisma = require('../../config/db');
const { emitToUser } = require('../../utils/socketEmitter');

/**
 * Buat notifikasi baru dan pancarkan event realtime via WebSocket jika terhubung
 */
const createNotification = async ({ userId, title, message, type = 'INFO', linkUrl = null }) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        linkUrl,
        isRead: false
      }
    });

    // Pancarkan ke room user via Socket.io
    emitToUser(userId, 'notification:new', {
      id: notification.notificationId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      linkUrl: notification.linkUrl,
      isRead: false,
      createdAt: notification.createdAt
    });

    return notification;
  } catch (error) {
    console.error('[Notification Service] Gagal membuat notifikasi:', error.message);
    return null;
  }
};

/**
 * Ambil daftar notifikasi milik user
 */
const getNotifications = async (userId, query = {}) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const where = { userId };
  if (query.isRead !== undefined) {
    where.isRead = query.isRead === 'true' || query.isRead === true;
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.notification.count({ where })
  ]);

  return {
    data: notifications.map(n => ({
      id: n.notificationId,
      notificationId: n.notificationId,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.isRead,
      linkUrl: n.linkUrl,
      createdAt: n.createdAt,
      time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/**
 * Hitung jumlah notifikasi yang belum dibaca (unread count badge)
 */
const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false
    }
  });
  return count;
};

/**
 * Tandai satu notifikasi sebagai dibaca
 */
const markAsRead = async (notificationId, userId) => {
  const existing = await prisma.notification.findFirst({
    where: { notificationId, userId }
  });

  if (!existing) {
    return null;
  }

  const updated = await prisma.notification.update({
    where: { notificationId },
    data: { isRead: true }
  });

  return updated;
};

/**
 * Tandai seluruh notifikasi user sebagai dibaca
 */
const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: { isRead: true }
  });

  return result.count;
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
