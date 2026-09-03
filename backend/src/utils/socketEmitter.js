'use strict';

/**
 * @file socketEmitter.js
 * @description Helper modular untuk memancarkan event Socket.IO ke rooms tertentu.
 */

const { getIo } = require('../config/socket');

/**
 * Emit event ke room user tertentu.
 * @param {string} userId - UUID user penerima
 * @param {string} eventName - Nama event
 * @param {Object} payload - Data event
 */
const emitToUser = (userId, eventName, payload) => {
  const io = getIo();
  if (!io) return false;

  const room = `user:${userId}`;
  io.to(room).emit(eventName, {
    event: eventName,
    target: room,
    timestamp: new Date().toISOString(),
    data: payload
  });
  console.log(`[Socket Emit] Event "${eventName}" dikirim ke ${room}`);
  return true;
};

/**
 * Emit event ke room role tertentu (misal: 'DISTRICT_MANAGER', 'STORE_LEADER', 'CREW').
 * @param {string} roleCode - Kode role
 * @param {string} eventName - Nama event
 * @param {Object} payload - Data event
 */
const emitToRole = (roleCode, eventName, payload) => {
  const io = getIo();
  if (!io) return false;

  const room = `role:${roleCode.toUpperCase()}`;
  io.to(room).emit(eventName, {
    event: eventName,
    target: room,
    timestamp: new Date().toISOString(),
    data: payload
  });
  console.log(`[Socket Emit] Event "${eventName}" dikirim ke ${room}`);
  return true;
};

/**
 * Emit event ke room departemen / toko tertentu.
 * @param {string} departmentId - UUID departemen
 * @param {string} eventName - Nama event
 * @param {Object} payload - Data event
 */
const emitToDepartment = (departmentId, eventName, payload) => {
  const io = getIo();
  if (!io) return false;

  const room = `dept:${departmentId}`;
  io.to(room).emit(eventName, {
    event: eventName,
    target: room,
    timestamp: new Date().toISOString(),
    data: payload
  });
  console.log(`[Socket Emit] Event "${eventName}" dikirim ke ${room}`);
  return true;
};

module.exports = {
  emitToUser,
  emitToRole,
  emitToDepartment
};
