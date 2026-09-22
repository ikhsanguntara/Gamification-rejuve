'use strict';

/**
 * @file socket.js
 * @description Inisialisasi server Socket.IO dengan middleware autentikasi JWT dan room management.
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (httpServer) => {
  const corsOrigin = process.env.CORS_ORIGIN === '*' ? true : (process.env.CORS_ORIGIN || true);
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Middleware autentikasi Socket.IO via JWT
  io.use((socket, next) => {
    try {
      const authHeader = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!authHeader) {
        return next(new Error('Authentication error: Token required'));
      }

      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error(`Authentication error: ${err.message}`));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const userId = user.userId || user.id;
    const roleCode = user.roleCode || user.role;

    console.log(`[Socket Connected] User: ${user.name || userId} (${roleCode}) | Socket ID: ${socket.id}`);

    // Otomatis join room personal & role
    if (userId) {
      socket.join(`user:${userId}`);
    }
    if (roleCode) {
      socket.join(`role:${roleCode}`);
    }
    if (user.departmentId) {
      socket.join(`dept:${user.departmentId}`);
    }

    // Ping / pong test event
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected] User: ${user.name || userId} | Reason: ${reason}`);
    });
  });

  return io;
};

const getIo = () => {
  return io;
};

const emitToRole = (roleCode, event, data) => {
  if (io) {
    io.to(`role:${roleCode}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIo,
  getIO: getIo,
  emitToRole,
  emitToUser
};

